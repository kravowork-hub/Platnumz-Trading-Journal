/**
 * Weltrade SyntX-first calculation engine.
 * 
 * IMPORTANT:
 * Monetary value is driven by the actual symbol specification shown in MT5.
 * Keep contract/tick values configurable rather than assuming all SyntX symbols
 * have the same value per point.
 */

export type SyntXFamily =
  | "FX Vol"
  | "SFX Vol"
  | "PainX"
  | "GainX"
  | "MAX PainX"
  | "MAX GainX"
  | "FlipX"
  | "SwitchX"
  | "BreakX"
  | "TrendX"
  | "PlusX"
  | "FiboX"
  | "QuadX"
  | "Other";

export interface SyntXSpec {
  symbol: string;
  family: SyntXFamily;
  digits: number;
  pointSize: number;
  tickSize: number;
  tickValuePerLot?: number;
  minLot: number;
  lotStep: number;
  commissionPerLot?: number;
}

export interface SyntXTradeInput {
  symbol: string;
  direction: "BUY" | "SELL";
  volume: number;
  entry: number;
  exit: number;
  stopLoss?: number;
  takeProfit?: number;
  commission?: number;
  swap?: number;
  tickValuePerLot?: number;
  pointSize?: number;
  tickSize?: number;
}

export interface SyntXTradeResult {
  family: SyntXFamily;
  priceMove: number;
  points: number;
  ticks: number;
  riskPoints: number | null;
  rewardPoints: number | null;
  grossProfit: number | null;
  commission: number;
  swap: number;
  netProfit: number | null;
  riskMoney: number | null;
  rMultiple: number | null;
}

export const SYNTX_FAMILIES: Array<{ family: SyntXFamily; description: string }> = [
  { family: "FX Vol", description: "Fixed annual-volatility synthetic indices (20–99)." },
  { family: "SFX Vol", description: "FX Vol behaviour with simulated spikes." },
  { family: "PainX", description: "Directional upward progression with periodic drops." },
  { family: "GainX", description: "Directional downward progression with periodic jumps." },
  { family: "MAX PainX", description: "PainX with accelerating tick/jump behaviour." },
  { family: "MAX GainX", description: "GainX with accelerating tick/jump behaviour." },
  { family: "FlipX", description: "50/50 direction with fixed step size." },
  { family: "SwitchX", description: "Alternates directional modes after jumps." },
  { family: "BreakX", description: "Changes mode when a jump breaches the previous jump level." },
  { family: "TrendX", description: "Switches directional mode after confirmed trend reversal." },
  { family: "PlusX", description: "Linear progression." },
  { family: "FiboX", description: "Fibonacci progression." },
  { family: "QuadX", description: "Quadratic progression." },
  { family: "Other", description: "Other Weltrade SyntX symbol." },
];

export function inferSyntXFamily(symbol: string): SyntXFamily {
  const s = symbol.toUpperCase().replace(/\s+/g, "");
  if (s.includes("MAXPAIN")) return "MAX PainX";
  if (s.includes("MAXGAIN")) return "MAX GainX";
  if (s.startsWith("SFXVOL") || s.includes("SFXVOL")) return "SFX Vol";
  if (s.startsWith("FXVOL") || s.includes("FXVOL")) return "FX Vol";
  if (s.startsWith("PAINX") || s.includes("PAINX")) return "PainX";
  if (s.startsWith("GAINX") || s.includes("GAINX")) return "GainX";
  if (s.startsWith("FLIPX") || s.includes("FLIPX")) return "FlipX";
  if (s.startsWith("SWITCHX") || s.includes("SWITCHX")) return "SwitchX";
  if (s.startsWith("BREAKX") || s.includes("BREAKX")) return "BreakX";
  if (s.startsWith("TRENDX") || s.includes("TRENDX")) return "TrendX";
  if (s.startsWith("PLUSX") || s.includes("PLUSX")) return "PlusX";
  if (s.startsWith("FIBOX") || s.includes("FIBOX")) return "FiboX";
  if (s.startsWith("QUADX") || s.includes("QUADX")) return "QuadX";
  return "Other";
}

export function calculateSyntXTrade(input: SyntXTradeInput): SyntXTradeResult {
  const pointSize = input.pointSize ?? 0.01;
  const tickSize = input.tickSize ?? pointSize;
  const move = input.direction === "BUY"
    ? input.exit - input.entry
    : input.entry - input.exit;

  const stopDistance = input.stopLoss == null
    ? null
    : input.direction === "BUY"
      ? input.entry - input.stopLoss
      : input.stopLoss - input.entry;

  const rewardDistance = input.takeProfit == null
    ? null
    : input.direction === "BUY"
      ? input.takeProfit - input.entry
      : input.entry - input.takeProfit;

  const points = move / pointSize;
  const ticks = move / tickSize;
  const riskPoints = stopDistance == null ? null : Math.max(0, stopDistance / pointSize);
  const rewardPoints = rewardDistance == null ? null : Math.max(0, rewardDistance / pointSize);

  // If MT5's tick value is supplied, this is the broker-appropriate monetary
  // calculation: ticks × tick value × lots. Without it, leave P&L unknown
  // rather than inventing a dollar value.
  const tickValue = input.tickValuePerLot;
  const grossProfit = tickValue == null ? null : ticks * tickValue * input.volume;
  const commission = input.commission ?? 0;
  const swap = input.swap ?? 0;
  const netProfit = grossProfit == null ? null : grossProfit - commission + swap;
  const riskMoney = tickValue == null || riskPoints == null
    ? null
    : (riskPoints * pointSize / tickSize) * tickValue * input.volume;
  const rMultiple = netProfit != null && riskMoney && riskMoney > 0
    ? netProfit / riskMoney
    : null;

  return {
    family: inferSyntXFamily(input.symbol),
    priceMove: move,
    points,
    ticks,
    riskPoints,
    rewardPoints,
    grossProfit,
    commission,
    swap,
    netProfit,
    riskMoney,
    rMultiple,
  };
}
