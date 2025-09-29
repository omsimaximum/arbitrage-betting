# Arbitrage Betting Calculator Documentation

This document explains how the Arbitrage Betting Calculator in this project works: inputs, logic, computations, and UI behavior.

## Overview
The calculator detects 2-way sports betting arbitrage opportunities between two bookmakers for the same market (Win/Lose, Over/Under, Odd/Even, Handicap). It evaluates cross-book combinations (one outcome from Bookmaker A and the opposite outcome from Bookmaker B) and determines if a guaranteed profit (surebet) exists.

## Supported Market Types
All current market types are treated as 2-way markets:
- Win/Lose
- Over/Under
- Odd/Even
- Handicap

(Selection of market type is presently informational; odds math is identical for all 2-way markets.)

## Inputs
User provides:
- Total Stake (combined capital you are willing to deploy)
- Bookmaker A: Option 1 odds, Option 2 odds
- Bookmaker B: Option 1 odds, Option 2 odds

All odds are decimal (European) format, e.g. `2.10`, `1.85`, etc.

## Combinations Evaluated
Only cross-book combinations (never both sides from the same bookmaker):
1. Book A Option 1 + Book B Option 2  (ID: `A1_B2`)
2. Book A Option 2 + Book B Option 1  (ID: `A2_B1`)

These represent the two mutually exclusive outcomes covered using different books.

## Arbitrage Condition
For a pair of decimal odds `(odd1, odd2)` the arbitrage (implied probability) percentage is:

```
Arbitrage % = (1 / odd1) + (1 / odd2)
```

If `Arbitrage % < 1`, a surebet (risk‑free profit) exists.

### Example
Odds: 2.10 and 2.20
```
1/2.10 = 0.476190...
1/2.20 = 0.454545...
Arb % = 0.930735... < 1  ✅ Profitable
```

## Stake Allocation Formula
To guarantee equalized payout (or using the minimum of both payouts as the guaranteed amount), allocate stakes proportionally to each inverse odd:

```
Stake1 = (TotalStake * (1 / odd1)) / Arbitrage%
Stake2 = (TotalStake * (1 / odd2)) / Arbitrage%
```

Where:
- `Arbitrage% = (1/odd1) + (1/odd2)`
- `TotalStake = Stake1 + Stake2` (up to rounding)

## Returns & Profit
For each leg:
```
Return1 = Stake1 * odd1
Return2 = Stake2 * odd2
```
Guaranteed (conservative) payout:
```
GuaranteedPayout = min(Return1, Return2)
```

Guaranteed Profit:
```
Profit = GuaranteedPayout - TotalStake
```

Return on Investment (ROI):
```
ROI (%) = (Profit / TotalStake) * 100
```

## Currency
All figures displayed in Philippine Peso (₱) using `Intl.NumberFormat("en-PH", { currency: 'PHP' })`.

## Best Combination Selection
- Filter only profitable combinations (`arbitrage % < 1`).
- Sort primarily by higher `profit`, secondarily by lower `arbitrage %` (more efficient market coverage).
- The top result becomes the highlighted "Best Surebet".

## Non-Profitable Case
If no evaluated combination is profitable:
- Show message: `No profitable arbitrage opportunity found.`
- The Best Combination panel shows a fallback message.

## Refresh Behavior
Pressing the Refresh button now resets:
- Total Stake = 0
- All odds = 0
- Updates the timestamp (for UX feedback)

(Originally it only updated time; modified per user request.)

## Validation / Edge Handling
- Odds <= 1 are ignored (not valid for arbitrage math).
- If any side of a combination is missing/invalid, that combination is skipped.
- If Total Stake is 0, profit and stake allocations show 0 (even if mathematically arbitrage exists) until user supplies stake > 0.

## Implementation Files
- `src/lib/utils.ts` – Core calculation logic (`calculateArbitrage`) and currency formatting.
- `src/components/ArbitrageCalculator.tsx` – UI logic & state handling.
- `src/components/ui/card.tsx` – Lightweight card components styled to resemble shadcn/ui pattern.

## Core Function (Simplified)
```ts
const inv1 = 1 / odd1;
const inv2 = 1 / odd2;
const arbPct = inv1 + inv2;
const profitable = arbPct < 1;
if (profitable) {
  stake1 = (totalStake * inv1) / arbPct;
  stake2 = (totalStake * inv2) / arbPct;
  ret1 = stake1 * odd1;
  ret2 = stake2 * odd2;
  guaranteedPayout = Math.min(ret1, ret2);
  profit = guaranteedPayout - totalStake;
  roi = (profit / totalStake) * 100;
}
```

## Example Walkthrough
Input:
```
Total Stake: 1000
Book A: 2.10 / 1.75
Book B: 1.80 / 2.20
```
Combination A1 + B2:
```
1/2.10 = 0.47619
1/2.20 = 0.45455
Arb % = 0.93074 < 1  (Profitable)
Stake1 = (1000 * 0.47619) / 0.93074 = 511.88
Stake2 = (1000 * 0.45455) / 0.93074 = 488.12
Return1 = 511.88 * 2.10 = 1,075.0
Return2 = 488.12 * 2.20 = 1,073.86
GuaranteedPayout = min(1,075.0, 1,073.86) = 1,073.86
Profit ≈ 1,073.86 - 1,000 = 73.86 (rounding differences vs earlier example where min rounded first)
ROI ≈ 7.39%
```
(Depending on rounding at each intermediate step the displayed profit may show ₱75.00 when using fewer decimal truncations.)

Combination A2 + B1:
```
1/1.75 + 1/1.80 = 0.57143 + 0.55556 = 1.1270 > 1 (Not profitable)
```

## Rounding Notes
- Display uses `toFixed(2)` for odds and ROI, currency formatting for amounts.
- Minor centavo differences can appear due to floating point arithmetic and when taking `min()` of two returns with different rounding paths.

## Extending the Calculator
Potential improvements:
- Add automatic periodic refresh (polling odds API).
- Allow manual per-leg stake override while showing implied coverage variance.
- Add commission (exchange) or tax adjustments.
- Support 3-way (1X2) markets with three-book or multi-leg coverage.
- Persist last inputs in localStorage.

## Disclaimer
This tool is for educational purposes only. Real-world arbitrage requires rapid execution, accurate real-time odds, consideration of limits, delays, and potential account restrictions. Always comply with local laws and bookmaker terms.

---
**Last Updated:** ${new Date().toISOString()}
