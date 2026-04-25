export type SplitParty = "PLATFORM" | "CREATOR" | "INVESTOR" | "SPONSOR" | "AFFILIATE" | "TAX";

export type RevenueSplitRule = {
  party: SplitParty;
  accountId: string | null;
  basisPoints: number;
};

export type CalculatedRevenueSplit = RevenueSplitRule & {
  amountInPaise: number;
};

export function assertBasisPointsTotal(rules: RevenueSplitRule[]) {
  const total = rules.reduce((sum, rule) => sum + rule.basisPoints, 0);
  if (total !== 10_000) throw new Error(`Revenue split rules must total 10000 basis points, received ${total}`);
}

export function calculateSplits(amountInPaise: number, rules: RevenueSplitRule[]): CalculatedRevenueSplit[] {
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) throw new Error("Amount must be a positive integer in paise");
  assertBasisPointsTotal(rules);
  let allocated = 0;
  return rules.map((rule, index) => {
    const amount = index === rules.length - 1 ? amountInPaise - allocated : Math.floor((amountInPaise * rule.basisPoints) / 10_000);
    allocated += amount;
    return { ...rule, amountInPaise: amount };
  });
}
