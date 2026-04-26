import { listAuditLogs } from "../logging/audit";
import { listFinanceSummary } from "../catalog-db";

export async function getRazorpayMonitor() {
  const [summary, webhookAudit] = await Promise.all([listFinanceSummary(), listAuditLogs(50, "PAYMENT_WEBHOOK")]);
  const razorpayPayments = summary.payments.filter((payment) => payment.provider === "razorpay");
  const razorpayOrders = summary.orders.filter((order) => order.paymentProvider === "razorpay");
  const failedWebhookCount = webhookAudit.filter((entry) => entry.action === "PAYMENT_WEBHOOK_REJECTED").length;
  const duplicateWebhookCount = webhookAudit.filter((entry) => entry.action === "PAYMENT_WEBHOOK_DUPLICATE").length;
  const lastSuccess = webhookAudit.find((entry) => entry.action === "PAYMENT_WEBHOOK_RECEIVED" || entry.action === "PAYMENT_CAPTURED") ?? null;

  return {
    webhookLogs: webhookAudit,
    failedWebhookCount,
    duplicateWebhookCount,
    lastSuccess,
    timeline: {
      orders: razorpayOrders,
      payments: razorpayPayments,
      webhooks: summary.webhooks.filter((webhook) => webhook.provider === "razorpay")
    }
  };
}
