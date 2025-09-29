import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

export interface ArbitrageInput {
  totalStake: number;
  marketType: string; // e.g. "Win/Lose", "1 Way"
  bookA: { option1: number | null; option2: number | null };
  bookB: { option1: number | null; option2: number | null };
}

export interface CombinationResult {
  id: string;
  selection: string; // e.g. "Book A Option 1 + Book B Option 2"
  odds: { odd1: number; odd2: number };
  arbitragePercentage: number; // sum of reciprocals
  profitable: boolean;
  stake1: number;
  stake2: number;
  profit: number; // guaranteed profit
  roi: number; // percent
  returns: { ret1: number; ret2: number };
}

export function calculateArbitrage(input: ArbitrageInput): {
  combinations: CombinationResult[];
  best: CombinationResult | null;
  hasProfitable: boolean;
} {
  const { bookA, bookB, totalStake, marketType } = input;

  // For classic 2-way arbitrage we look for cross-book opposite selections (A1+B2, A2+B1)
  // For "1 Way" mode the user is pairing a single line across two books (e.g. Over vs Under) so we only need A1 + B1.
  const combos: Array<{ id: string; fromA: keyof typeof bookA; fromB: keyof typeof bookB }> =
    marketType === "1 Way"
      ? [{ id: "A1_B1", fromA: "option1", fromB: "option1" }]
      : [
          { id: "A1_B2", fromA: "option1", fromB: "option2" },
          { id: "A2_B1", fromA: "option2", fromB: "option1" },
        ];

  const results: CombinationResult[] = [];

  for (const c of combos) {
    const odd1 = bookA[c.fromA];
    const odd2 = bookB[c.fromB];
    if (!odd1 || !odd2 || odd1 <= 1 || odd2 <= 1) continue; // invalid odds
    const inv1 = 1 / odd1;
    const inv2 = 1 / odd2;
    const arbPct = inv1 + inv2; // arbitrage percentage
    const profitable = arbPct < 1;
    let stake1 = 0;
    let stake2 = 0;
    let ret1 = 0;
    let ret2 = 0;
    let profit = 0;
    let roi = 0;
    if (profitable && totalStake > 0) {
      stake1 = (totalStake * inv1) / arbPct;
      stake2 = (totalStake * inv2) / arbPct;
      ret1 = stake1 * odd1;
      ret2 = stake2 * odd2;
      const guaranteedPayout = Math.min(ret1, ret2);
      profit = guaranteedPayout - totalStake;
      roi = (profit / totalStake) * 100;
    }
    const selectionLabel = marketType === "1 Way"
      ? `Book A Option 1 + Book B Option 1`
      : `Book A ${c.fromA.replace("option", "Option ")} + Book B ${c.fromB.replace("option", "Option ")}`;

    results.push({
      id: c.id,
      selection: selectionLabel,
      odds: { odd1, odd2 },
      arbitragePercentage: arbPct,
      profitable,
      stake1,
      stake2,
      profit,
      roi,
      returns: { ret1, ret2 },
    });
  }

  const profitableOnes = results.filter(r => r.profitable).sort((a,b)=> b.profit - a.profit || a.arbitragePercentage - b.arbitragePercentage);
  const best = profitableOnes[0] ?? null;
  return { combinations: results, best, hasProfitable: profitableOnes.length > 0 };
}
