export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('Missing or insufficient permissions')) {
    // Log only the minimal context — never log user credentials or PII
    console.error(`Firestore permission denied: ${operationType} on ${path}`);
    throw new Error(`Permission denied performing ${operationType} on ${path}.`);
  }

  throw error;
}
