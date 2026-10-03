# FINAL WELTRADE SyntX integration

Use these files in the existing journal:

1. Add `src/utils/weltradeSyntX.ts`
2. Add `src/utils/weltradeSyntXRegistry.ts`
3. Add `src/components/WeltradeSyntXCalculator.tsx`

## Required TradeModal integration

In `TradeModal.tsx`, when Broker = Weltrade and Market = SyntX:
- use the SyntX symbol selector;
- calculate movement in points/ticks;
- do NOT label SyntX movement as pips;
- require/store the MT5 `tickSize` and `tickValue` for exact monetary P&L;
- calculate commission from the actual account condition when known;
- store the selected symbol specification with the trade so historical calculations remain reproducible.

## Important
Weltrade's published Copy Trading SyntX table gives symbol-specific volume/commission limits. Those values are included as broker metadata, not treated as universal SyntX account rules. Regular account conditions can differ.

Weltrade's SyntX account is MT5/USD, with leverage up to 1:10,000. The app should therefore default a Weltrade SyntX account to USD and MT5, while allowing the user to edit account settings.

## UX rules
- SyntX = primary market type.
- Forex pip terminology must never appear on SyntX screens.
- Use `points`, `ticks`, `tick value`, `gross P&L`, `commission`, `swap`, `net P&L`, `risk`, and `R`.
- PainX should default direction to BUY.
- GainX should default direction to SELL.
- FlipX should allow BUY/SELL.
- SwitchX, BreakX and TrendX should allow BUY/SELL but show their current behavioural mode as an optional journal field.
