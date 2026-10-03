# Weltrade SyntX-focused adaptation

## Files
- `src/utils/weltradeSyntX.ts` — SyntX family detection and points/ticks/P&L engine.
- `src/components/WeltradeSyntXCalculator.tsx` — SyntX-first calculator UI.

## Integration
Import the calculator into the trade-entry screen:

```tsx
import WeltradeSyntXCalculator from "./WeltradeSyntXCalculator";
```

Render it when the broker/account profile is `Weltrade SyntX`.

For production monetary P&L, store the exact `tickSize` and `tickValue` from the symbol specification in MT5/Weltrade for the user's account. Do not infer these values from the instrument name.

Weltrade's current SyntX documentation describes FX Vol, SFX Vol, PainX, GainX, FlipX, SwitchX, BreakX, TrendX, PlusX, FiboX, QuadX, MAX PainX and MAX GainX families. The exact available symbols and trading conditions can change, so the app should keep specifications configurable.
