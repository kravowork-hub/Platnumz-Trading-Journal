export type Direction = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'WIN' | 'LOSS' | 'BREAK_EVEN';
export type TradingSession = 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'FRANKFURT' | 'OVERLAP' | 'AFTER_HOURS';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';

export type Emotion = 
  | 'Calm' 
  | 'Confident' 
  | 'Fearful' 
  | 'FOMO' 
  | 'Greedy' 
  | 'Impatient' 
  | 'Frustrated' 
  | 'Revenge' 
  | 'Hesitant' 
  | 'Overconfident';

export type MistakeTag = 
  | 'FOMO'
  | 'Revenge trade'
  | 'Overtrading'
  | 'Moved stop'
  | 'Took profit early'
  | 'Entered too early'
  | 'Entered too late'
  | 'Oversized position'
  | 'Ignored setup'
  | 'Traded outside session'
  | 'Traded during news'
  | 'Chased candle'
  | 'No stop loss';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  order: number;
}

export interface ScreenshotAttachment {
  id: string;
  type: 'BEFORE' | 'ENTRY' | 'AFTER';
  url: string; // Base64 or local blob URL
  caption?: string;
  timestamp: string;
}

export interface PostTradeReview {
  whyTrade: string;
  thesis: string;
  followedStrategy: boolean;
  followedRules: boolean;
  whatWentWell: string;
  whatWentWrong: string;
  doDifferently: string;
  emotions: Emotion[];
  confidenceRating: number; // 1-5
  stressRating: number;     // 1-5
  focusRating: number;      // 1-5
  completedAt?: string;
}

export interface Trade {
  id: string;
  tradeNumber: number;
  instrument: string; // e.g. "EURUSD", "NQ", "ES", "BTCUSDT", "XAUUSD"
  direction: Direction;
  status: TradeStatus;
  entryDate: string; // YYYY-MM-DD
  entryTime: string; // HH:mm
  exitDate?: string; // YYYY-MM-DD
  exitTime?: string; // HH:mm
  timeframe: Timeframe;
  session: TradingSession;
  strategy: string; // e.g. "ICT", "SMC", "Trend Breakout"
  setup: string;    // e.g. "Liquidity Sweep", "FVG", "Order Block", "BOS"
  
  // Prices
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  exitPrice?: number;
  
  // Position & Risk
  accountBalanceAtEntry: number;
  riskPercentage: number;
  dollarRisk: number;
  positionSize: number; // Quantity in Lots / Contracts / Units
  
  // Outcomes & Calculations
  pnl?: number;         // Dollar P&L
  pnlPercentage?: number;
  realizedR?: number;   // e.g. +2.5R, -1.0R
  plannedRR: number;    // Planned risk-to-reward ratio (e.g. 3.0)
  
  // Attachments & Checklists
  screenshots: ScreenshotAttachment[];
  checklist: ChecklistItem[];
  mistakes: MistakeTag[];
  notes?: string;
  
  // Post-trade review
  review?: PostTradeReview;
  
  createdAt: string;
  updatedAt: string;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  setups: string[];
  color: string;
}

export interface AccountSettings {
  appName: string;
  traderName: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'JPY' | 'AUD' | 'CAD';
  startingBalance: number;
  currentBalance: number;
  defaultRiskPercentage: number; // e.g. 1.0%
  maxRiskPerTrade: number;       // e.g. 2.0%
  maxDailyLoss: number;          // e.g. $500 or percentage
  maxTradesPerDay: number;       // e.g. 5
  
  // Security
  pinEnabled: boolean;
  pinCode: string; // 4 digits
  biometricEnabled: boolean;
  autoLockMinutes: number; // 0 for immediate
  
  // Notifications
  notificationsEnabled: boolean;
  dailyReminderTime: string; // "20:00"
  weeklyReviewReminder: boolean;
  
  // Setup completion
  onboardingCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'DISCIPLINE' | 'PROCESS' | 'RISK' | 'JOURNALING';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "trades", "%", "adherence"
  period: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
  completed: boolean;
  startDate: string;
  endDate: string;
}

export interface DailyReviewRecord {
  id: string;
  date: string; // YYYY-MM-DD
  tradesCount: number;
  netPnl: number;
  netR: number;
  winRate: number;
  disciplineScore: number;
  whatWentWell: string;
  mistakesMade: string;
  whatILearned: string;
  improveTomorrow: string;
  overallRating: number; // 1-5
}

export type PeriodFilter = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME' | 'CUSTOM';
