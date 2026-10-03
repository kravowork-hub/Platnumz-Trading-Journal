# Kravo Trading Journal 2.0

This package is an upgraded, AI-free build of the Kravo Trading Journal.

## Included
- Advanced performance analytics: expectancy, payoff ratio, recovery factor, median R, return, risk statistics, drawdown, daily extremes, streaks, R distribution, session edge and setup edge.
- Existing trade journal, screenshots, ICT/SMC checklist, goals, reviews, calendar, risk calculator, security lock and offline storage preserved.
- Account equity is synchronized from starting balance plus realized journal P&L when trades are saved or deleted.
- Full JSON backup/restore now restores daily reviews and replaces existing data instead of merging stale records.
- Safer CSV escaping for notes, strategies and other text fields.
- Android build scripts retained and an explicit `build:android` script added.
- AI Chart Lab removed for now, including its dependency.

## Build
```bash
npm install
npm run check
npm run build:android
```

`npm run build:android` builds the web app and runs Capacitor Android sync. To produce a signed APK/AAB, open the generated `android/` project in Android Studio and use the normal release build/signing flow.
