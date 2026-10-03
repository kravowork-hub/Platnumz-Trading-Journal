/**
 * Weltrade SyntX instrument registry.
 *
 * The commission/limits below are based on Weltrade's published SyntX
 * copy-trading conditions. Regular SyntX account conditions can differ,
 * so the app stores them as editable broker metadata rather than treating
 * them as universal execution rules.
 */
export type SyntXGroup =
  | "FX Vol" | "SFX Vol" | "PainX" | "GainX"
  | "MAX PainX" | "MAX GainX" | "FlipX"
  | "SwitchX" | "BreakX" | "TrendX"
  | "PlusX" | "FiboX" | "QuadX" | "Other";

export interface WeltradeSyntXSpec {
  symbol: string;
  group: SyntXGroup;
  eventIntervalTicks?: number;
  /** MAX PainX/MAX GainX reset odds: 1 event per N ticks after a jump. */
  jumpResetOdds?: number;
  maxVolumeLots?: number;
  copyCommissionUsdPerLot?: number;
  minCommissionUsd?: number;
  directionHint: "BUY" | "SELL" | "BOTH";
  notes: string;
}

const rows: Array<[
  string,
  SyntXGroup,
  number | undefined,
  number | undefined,
  number | undefined,
  number | undefined,
  "BUY" | "SELL" | "BOTH",
  string
]> = [
  ["FX Vol 20","FX Vol",undefined,5,2,.02,"BOTH","Fixed 20% annualized volatility."],
  ["FX Vol 40","FX Vol",undefined,1,6,.06,"BOTH","Fixed 40% annualized volatility."],
  ["FX Vol 60","FX Vol",undefined,6,2,.02,"BOTH","Fixed 60% annualized volatility."],
  ["FX Vol 80","FX Vol",undefined,1,14,.14,"BOTH","Fixed 80% annualized volatility."],
  ["FX Vol 99","FX Vol",undefined,1,11,.11,"BOTH","Fixed 99% annualized volatility."],
  ["SFX Vol 20","SFX Vol",undefined,4,1,.01,"BOTH","FX Vol behaviour with simulated spikes."],
  ["SFX Vol 40","SFX Vol",undefined,1,3,.03,"BOTH","FX Vol behaviour with simulated spikes."],
  ["SFX Vol 60","SFX Vol",undefined,1,5,.05,"BOTH","FX Vol behaviour with simulated spikes."],
  ["SFX Vol 80","SFX Vol",undefined,1,9,.09,"BOTH","FX Vol behaviour with simulated spikes."],
  ["SFX Vol 99","SFX Vol",undefined,1,4,.04,"BOTH","FX Vol behaviour with simulated spikes."],
  ["PainX 400","PainX",400,15,.25,.01,"BUY","Upward progression; periodic drop."],
  ["PainX 600","PainX",600,15,.25,.01,"BUY","Upward progression; periodic drop."],
  ["PainX 800","PainX",800,20,.20,.01,"BUY","Upward progression; periodic drop."],
  ["PainX 999","PainX",999,15,.30,.01,"BUY","Upward progression; periodic drop."],
  ["PainX 1200","PainX",1200,25,.15,.01,"BUY","Upward progression; periodic drop."],
  ["GainX 400","GainX",400,15,.25,.01,"SELL","Downward progression; periodic jump."],
  ["GainX 600","GainX",600,15,.25,.01,"SELL","Downward progression; periodic jump."],
  ["GainX 800","GainX",800,20,.20,.01,"SELL","Downward progression; periodic jump."],
  ["GainX 999","GainX",999,15,.30,.01,"SELL","Downward progression; periodic jump."],
  ["GainX 1200","GainX",1200,25,.15,.01,"SELL","Downward progression; periodic jump."],

  // Weltrade MAX SyntX variants. The 1000/2000 value is the
  // post-jump probability reset: 1 in 1000 or 1 in 2000 per tick.
  ["MAX PainX 1000","MAX PainX",undefined,undefined,undefined,undefined,"BUY","Progressive PainX behaviour; after a jump, probability resets to 1 in 1000 per tick."],
  ["MAX PainX 2000","MAX PainX",undefined,undefined,undefined,undefined,"BUY","Progressive PainX behaviour; after a jump, probability resets to 1 in 2000 per tick."],
  ["MAX GainX 1000","MAX GainX",undefined,undefined,undefined,undefined,"SELL","Progressive GainX behaviour; after a jump, probability resets to 1 in 1000 per tick."],
  ["MAX GainX 2000","MAX GainX",undefined,undefined,undefined,undefined,"SELL","Progressive GainX behaviour; after a jump, probability resets to 1 in 2000 per tick."],

  ["FlipX 1","FlipX",1,20,.50,.01,"BOTH","50/50 direction with fixed step."],
  ["FlipX 2","FlipX",2,15,.75,.01,"BOTH","50/50 direction with fixed step."],
  ["FlipX 3","FlipX",3,10,1,.01,"BOTH","50/50 direction with fixed step."],
  ["FlipX 4","FlipX",4,7,1.25,.01,"BOTH","50/50 direction with fixed step."],
  ["FlipX 5","FlipX",5,6,1.50,.02,"BOTH","50/50 direction with fixed step."],
  ["SwitchX 600","SwitchX",600,15,.30,.01,"BOTH","GainX until jump, then switches to PainX."],
  ["SwitchX 1200","SwitchX",1200,25,.20,.01,"BOTH","GainX until jump, then switches to PainX."],
  ["SwitchX 1800","SwitchX",1800,40,.10,.01,"BOTH","GainX until jump, then switches to PainX."],
  ["BreakX 600","BreakX",600,15,.30,.01,"BOTH","Switches when a jump exceeds prior jump."],
  ["BreakX 1200","BreakX",1200,25,.20,.01,"BOTH","Switches when a jump exceeds prior jump."],
  ["BreakX 1800","BreakX",1800,40,.10,.01,"BOTH","Switches when a jump exceeds prior jump."],
  ["TrendX 600","TrendX",600,15,.30,.01,"BOTH","Switches after confirmed trend reversal."],
  ["TrendX 1200","TrendX",1200,25,.20,.01,"BOTH","Switches after confirmed trend reversal."],
  ["TrendX 1800","TrendX",1800,40,.10,.01,"BOTH","Switches after confirmed trend reversal."],
  ["PlusX","PlusX",undefined,undefined,undefined,undefined,"BOTH","Linear progression."],
  ["FiboX","FiboX",undefined,undefined,undefined,undefined,"BOTH","Fibonacci progression."],
  ["QuadX","QuadX",undefined,undefined,undefined,undefined,"BOTH","Quadratic progression."],
];

export const WELTRADE_SYNTX_SPECS: Record<string, WeltradeSyntXSpec> =
  Object.fromEntries(rows.map(([symbol,group,event,max,comm,min,directionHint,notes]) => {
    const isMax = group === "MAX PainX" || group === "MAX GainX";
    const jumpResetOdds = isMax ? Number.parseInt(symbol.split(" ").pop() || "", 10) : undefined;

    return [symbol, {
      symbol,
      group,
      eventIntervalTicks: event,
      jumpResetOdds,
      maxVolumeLots: max,
      copyCommissionUsdPerLot: comm,
      minCommissionUsd: min,
      directionHint,
      notes,
    }];
  }));

export function getWeltradeSyntXSpec(symbol: string): WeltradeSyntXSpec | undefined {
  return WELTRADE_SYNTX_SPECS[symbol];
}
