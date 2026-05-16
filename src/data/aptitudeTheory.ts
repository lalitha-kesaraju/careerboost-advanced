export const APTITUDE_PHASE_CONTENT: Record<string, any> = {
  'arithmetic': {
    learn: {
      theory: `# Quantitative: Arithmetic Mastery
Arithmetic is the foundation of competitive aptitude. It tests your numerical agility and basic mathematical logic.

### Core Topics
1. **Percentages**: $V = P \times B$. Understanding "x is what % of y".
2. **Profit & Loss**: Managing Cost Price (CP), Selling Price (SP), and Marked Price (MP).
3. **Ratios & Proportions**: Comparing magnitudes and scaling values.
4. **Simple & Compound Interest**: Temporal value of money calculations.

### Pro Tips
*   **The 10% Rule**: Quickly find 10% of any number by shifting the decimal, then use multiples (5%, 20%) to find others.
*   **Fractional Equivalence**: Memorize $1/6 = 16.66\%$, $1/8 = 12.5\%$, etc., to solve percentage problems in seconds.
*   **Net Successive Percentage**: $x + y + \frac{xy}{100}$ is essential for profit/loss and multi-step changes.`,
      tips: [
        "Memorize squares up to 30 and cubes up to 15.",
        "Always check options before doing heavy multiplication.",
        "Ratios are just fractions; handle them with scaling factor 'x'."
      ]
    },
    apply: [
      {
        title: "Successive Profit Analysis",
        problem: "A product is marked up by 40% and a discount of 20% is given. What is the net profit percentage?",
        steps: [
          { label: "Assume Base CP", content: "Let CP = 100." },
          { label: "Marked Price", content: "MP = 100 + 40% of 100 = 140." },
          { label: "Selling Price", content: "SP = 140 - 20% of 140 = 140 - 28 = 112." },
          { label: "Net Gain", content: "Profit = 112 - 100 = 12. Thus, 12% Net Profit." }
        ]
      },
      {
        title: "Compound Interest logic",
        problem: "Find the amount if $2000 is invested at 10% p.a. for 2 years compounded annually.",
        steps: [
          { label: "Year 1 Interest", content: "10% of 2000 = 200. New Principal = 2200." },
          { label: "Year 2 Interest", content: "10% of 2200 = 220." },
          { label: "Total Amount", content: "2200 + 220 = 2420." }
        ]
      }
    ]
  },
  'numbers': {
    learn: {
      theory: `# Number Systems & Algebraic Logic
This module deals with the properties of numbers, divisibility, and foundational equations.

### Master Concepts
*   **LCM & HCF**: Used in 'meeting point' problems and 'tile fitting' scenarios.
*   **Divisibility Rules**: 3 (sum of digits), 4 (last 2 digits), 11 (alternating sum).
*   **Remainder Theorem**: Predictive arithmetic for large powers.
*   **Progressions**: Arithmetic (AP) and Geometric (GP) sequences.

### Efficiency Hacks
*   **Unit Digits**: Cycle of powers (2: 2,4,8,6; 3: 3,9,7,1).
*   **Factorials**: Understanding trailing zeros ($N/5 + N/25...$).
*   **Cyclicity**: Useful for "What is the unit digit of $7^{199}$?" queries.`,
      tips: [
        "LCM(a,b) * HCF(a,b) = a * b.",
        "Check for parity (odd/even) to eliminate 50% of options.",
        "AP Sum formula: $S_n = \frac{n}{2}(a+l)$."
      ]
    },
    apply: [
      {
        title: "Divisibility Trick",
        problem: "What is the smallest number added to 4321 to make it divisible by 9?",
        steps: [
          { label: "Sum of digits", content: "4 + 3 + 2 + 1 = 10." },
          { label: "Next multiple of 9", content: "The multiple after 10 is 18." },
          { label: "Result", content: "18 - 10 = 8. So, 8 must be added." }
        ]
      }
    ]
  }
};
