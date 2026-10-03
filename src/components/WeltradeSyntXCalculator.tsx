import React, { useMemo, useState } from "react";
import {
  calculateSyntXTrade,
  inferSyntXFamily,
  SYNTX_FAMILIES,
} from "../utils/weltradeSyntX";

const symbols = [
  "FX Vol 20", "FX Vol 30", "FX Vol 40", "FX Vol 50", "FX Vol 60",
  "FX Vol 70", "FX Vol 80", "FX Vol 90", "FX Vol 99",
  "SFX Vol 20", "SFX Vol 30", "SFX Vol 40", "SFX Vol 50", "SFX Vol 60",
  "SFX Vol 70", "SFX Vol 80", "SFX Vol 90", "SFX Vol 99",
  "PainX 400", "PainX 600", "PainX 800", "PainX 999", "PainX 1200",
  "GainX 400", "GainX 600", "GainX 800", "GainX 999", "GainX 1200",
  "MAX PainX", "MAX GainX",
  "FlipX 1", "FlipX 2", "FlipX 3", "FlipX 4", "FlipX 5",
  "SwitchX 600", "SwitchX 1200", "SwitchX 1800",
  "BreakX 600", "BreakX 1200", "BreakX 1800",
  "TrendX 600", "TrendX 1200", "TrendX 1800",
  "PlusX 1", "FiboX", "QuadX",
];

export default function WeltradeSyntXCalculator() {
  const [symbol, setSymbol] = useState("FX Vol 20");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [volume, setVolume] = useState("0.01");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [sl, setSl] = useState("");
  const [tickValue, setTickValue] = useState("");

  const result = useMemo(() => {
    if (!entry || !exit || !volume) return null;
    return calculateSyntXTrade({
      symbol,
      direction,
      volume: Number(volume),
      entry: Number(entry),
      exit: Number(exit),
      stopLoss: sl ? Number(sl) : undefined,
      tickValuePerLot: tickValue ? Number(tickValue) : undefined,
    });
  }, [symbol, direction, volume, entry, exit, sl, tickValue]);

  const family = inferSyntXFamily(symbol);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider opacity-60">Weltrade SyntX</div>
        <h2 className="text-xl font-bold">SyntX Trade Calculator</h2>
        <p className="text-sm opacity-70">
          Broker-aware points/ticks and P&L. Enter the MT5 tick value when available;
          the app will never invent a monetary value.
        </p>
      </div>

      <label className="block text-sm">
        Instrument
        <select className="w-full mt-1 p-3 rounded-xl" value={symbol} onChange={e => setSymbol(e.target.value)}>
          {symbols.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button className={`p-3 rounded-xl ${direction === "BUY" ? "font-bold" : ""}`} onClick={() => setDirection("BUY")}>BUY</button>
        <button className={`p-3 rounded-xl ${direction === "SELL" ? "font-bold" : ""}`} onClick={() => setDirection("SELL")}>SELL</button>
      </div>

      <div className="text-sm opacity-75">
        <b>{family}</b> — {SYNTX_FAMILIES.find(x => x.family === family)?.description}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Volume", volume, setVolume],
          ["Entry", entry, setEntry],
          ["Exit", exit, setExit],
          ["Stop Loss", sl, setSl],
          ["MT5 tick value / lot", tickValue, setTickValue],
        ].map(([label, value, setter]: any) => (
          <label key={label as string} className="block text-sm">
            {label}
            <input
              className="w-full mt-1 p-3 rounded-xl"
              inputMode="decimal"
              value={value}
              onChange={e => setter(e.target.value)}
            />
          </label>
        ))}
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Movement" value={result.priceMove.toFixed(4)} />
          <Metric label="Points" value={result.points.toFixed(2)} />
          <Metric label="Ticks" value={result.ticks.toFixed(2)} />
          <Metric label="Risk points" value={result.riskPoints == null ? "—" : result.riskPoints.toFixed(2)} />
          <Metric label="Gross P&L" value={result.grossProfit == null ? "Enter MT5 tick value" : `$${result.grossProfit.toFixed(2)}`} />
          <Metric label="Net P&L" value={result.netProfit == null ? "—" : `$${result.netProfit.toFixed(2)}`} />
          <Metric label="R multiple" value={result.rMultiple == null ? "—" : `${result.rMultiple.toFixed(2)}R`} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3">
      <div className="text-xs opacity-60">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
