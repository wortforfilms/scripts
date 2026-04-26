import { recordAudit, type AuditAction } from "./audit";

export async function logEvent(input: {
  action: AuditAction;
  actorId?: string | null;
  subjectId?: string | null;
  severity?: "INFO" | "WARN" | "ERROR";
  payload?: Record<string, unknown> | null;
}) {
  if (input.severity === "ERROR") {
    console.error(`[${input.action}]`, input.payload ?? {});
  } else if (input.severity === "WARN") {
    console.warn(`[${input.action}]`, input.payload ?? {});
  } else {
    console.info(`[${input.action}]`, input.payload ?? {});
  }
  return recordAudit(input);
}
