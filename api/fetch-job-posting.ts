import type { VercelRequest, VercelResponse } from "@vercel/node";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // cloud metadata endpoint (AWS/GCP/Azure)
  "::1",
]);

function isPrivateIp(hostname: string): boolean {
  // Best-effort literal-IP check. Doesn't resolve DNS, so a hostname that
  // resolves to a private IP at request time can still slip through — this
  // is a basic mitigation, not a substitute for an egress allowlist/proxy.
  const v4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!v4) return false;
  const [a, b] = [parseInt(v4[1]), parseInt(v4[2])];
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127
  );
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing 'url'" });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return res.status(400).json({ error: "Only http/https URLs are allowed" });
    }
    if (BLOCKED_HOSTNAMES.has(parsed.hostname) || isPrivateIp(parsed.hostname)) {
      return res.status(400).json({ error: "This URL is not allowed" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerBoostBot/1.0)" },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch job posting (HTTP ${response.status})` });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return res.status(400).json({ error: "URL did not return a readable page" });
    }

    const raw = await response.text();
    const text = stripHtmlToText(raw).slice(0, 6000);

    if (text.length < 50) {
      return res.status(422).json({ error: "Could not extract meaningful content from this page" });
    }

    res.json({ text });
  } catch (err: any) {
    console.error("[fetch-job-posting]", err);
    const message = err.name === "AbortError" ? "Request timed out" : err.message || "Failed to fetch job posting";
    res.status(500).json({ error: message });
  }
}
