export type ReleaseGate = "Internal Alpha" | "Public Preview" | "Paid Marketplace";

export type ReleaseGateStatus = {
  gate: ReleaseGate;
  status: "GO" | "NO-GO";
  reasons: string[];
};

export function buildReleaseMatrix(input: {
  datasetQaPassed: boolean;
  glyphQaPassed: boolean;
  razorpayE2ePassed: boolean;
  authProviderConfigured: boolean;
}): ReleaseGateStatus[] {
  return [
    {
      gate: "Internal Alpha",
      status: input.authProviderConfigured ? "GO" : "NO-GO",
      reasons: input.authProviderConfigured ? ["Signed session auth configured"] : ["AUTH_SESSION_SECRET is required"]
    },
    {
      gate: "Public Preview",
      status: input.datasetQaPassed && input.glyphQaPassed ? "GO" : "NO-GO",
      reasons: [
        input.datasetQaPassed ? "Dataset QA passed" : "Dataset QA must pass",
        input.glyphQaPassed ? "Glyph/font QA passed" : "Glyph/font QA must pass"
      ]
    },
    {
      gate: "Paid Marketplace",
      status: input.razorpayE2ePassed && input.authProviderConfigured ? "GO" : "NO-GO",
      reasons: [
        input.razorpayE2ePassed ? "Razorpay E2E passed" : "Razorpay test-mode E2E must pass",
        input.authProviderConfigured ? "Production auth configured" : "Production auth must be configured"
      ]
    }
  ];
}
