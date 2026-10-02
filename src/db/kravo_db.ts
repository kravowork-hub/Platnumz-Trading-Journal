import { 
  Trade, 
  StrategyDefinition, 
  ChecklistItem, 
  Goal, 
  DailyReviewRecord, 
  AccountSettings 
} from '../types';

const DB_NAME = 'kravo_trading_room_db';
const DB_VERSION = 1;

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'chk_1', label: 'Higher timeframe bias confirmed (Daily / 4H)', checked: false, order: 1 },
  { id: 'chk_2', label: 'Market structure shift (MSS / BOS) confirmed', checked: false, order: 2 },
  { id: 'chk_3', label: 'Key liquidity pool swept (BSL / SSL)', checked: false, order: 3 },
  { id: 'chk_4', label: 'Fair Value Gap (FVG) / Order Block tapped', checked: false, order: 4 },
  { id: 'chk_5', label: 'Lower timeframe entry confirmation (1M / 5M displacement)', checked: false, order: 5 },
  { id: 'chk_6', label: 'Risk within predefined limit (≤ 1.0% of account)', checked: false, order: 6 },
  { id: 'chk_7', label: 'No high-impact red folder news within 15 mins', checked: false, order: 7 },
  { id: 'chk_8', label: 'Risk/Reward ratio acceptable (minimum 1:2)', checked: false, order: 8 },
  { id: 'chk_9', label: 'Mental state calm — zero FOMO / revenge emotion', checked: false, order: 9 },
];

export const DEFAULT_STRATEGIES: StrategyDefinition[] = [
  {
    id: 'strat_ict',
    name: 'ICT / SMC Concepts',
    description: 'Smart Money Concepts targeting liquidity pools, imbalances, and institutional orderflow.',
    setups: [
      'Liquidity Sweep',
      'Fair Value Gap (FVG)',
      'Order Block (OB)',
      'Breaker Block',
      'Break of Structure (BOS)',
      'Change of Character (CHOCH)',
      'PD Array Discount/Premium',
      'Candle Range Theory (CRT)'
    ],
    color: '#10B981', // Emerald
  },
  {
    id: 'strat_pa',
    name: 'Price Action & Breakout',
    description: 'Key support/resistance flips, momentum flag breakouts, and retests.',
    setups: [
      'Support/Resistance Flip',
      'Bull/Bear Flag Breakout',
      'Double Top / Bottom Reversal',
      'Trendline Continuation',
      'Opening Range Breakout (ORB)'
    ],
    color: '#06B6D4', // Cyan
  },
  {
    id: 'strat_mr',
    name: 'Mean Reversion / Exhaustion',
    description: 'Fading extreme deviations from session VWAP or Bollinger bands.',
    setups: [
      'VWAP Band 3-Sigma Reversal',
      'Liquidity Run Exhaustion',
      'Asian Range High/Low Sweep'
    ],
    color: '#8B5CF6', // Purple
  }
];

export const DEFAULT_SETTINGS: AccountSettings = {
  appName: 'Kravo Trading Journal',
  traderName: 'Mobile Trader',
  currency: 'USD',
  startingBalance: 25000,
  currentBalance: 28420,
  defaultRiskPercentage: 1.0,
  maxRiskPerTrade: 1.5,
  maxDailyLoss: 750,
  maxTradesPerDay: 4,
  pinEnabled: false,
  pinCode: '1234',
  biometricEnabled: false,
  autoLockMinutes: 5,
  notificationsEnabled: true,
  dailyReminderTime: '21:00',
  weeklyReviewReminder: true,
  onboardingCompleted: true,
};

export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal_1',
    title: 'Complete 30 Properly Journaled Trades',
    description: 'Record every trade with before/after screenshots and post-trade review.',
    category: 'JOURNALING',
    targetValue: 30,
    currentValue: 18,
    unit: 'trades',
    period: 'MONTHLY',
    completed: false,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'goal_2',
    title: 'Maintain Risk Below 1.0% Per Trade',
    description: 'Zero tolerance for exceeding position size limits on all executions.',
    category: 'RISK',
    targetValue: 100,
    currentValue: 94,
    unit: '% adherence',
    period: 'MONTHLY',
    completed: false,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'goal_3',
    title: 'Eliminate Revenge Trades',
    description: 'Keep revenge trading occurrences at zero for the entire calendar month.',
    category: 'DISCIPLINE',
    targetValue: 0,
    currentValue: 1, // Only 1 occurred
    unit: 'violations',
    period: 'MONTHLY',
    completed: false,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  },
  {
    id: 'goal_4',
    title: 'Pre-Trade Checklist Adherence ≥ 90%',
    description: 'Verify all 9 setup criteria before clicking the buy/sell button.',
    category: 'PROCESS',
    targetValue: 90,
    currentValue: 88,
    unit: '% compliance',
    period: 'MONTHLY',
    completed: false,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  }
];

export const INITIAL_SAMPLE_TRADES: Trade[] = [
  {
    id: 'trade_001',
    tradeNumber: 1,
    instrument: 'EURUSD',
    direction: 'LONG',
    status: 'WIN',
    entryDate: '2026-09-18',
    entryTime: '09:30',
    exitDate: '2026-09-18',
    exitTime: '11:15',
    timeframe: 'M5',
    session: 'LONDON',
    strategy: 'ICT / SMC Concepts',
    setup: 'Liquidity Sweep',
    entryPrice: 1.0825,
    stopLossPrice: 1.0815,
    takeProfitPrice: 1.0855,
    exitPrice: 1.0855,
    accountBalanceAtEntry: 25000,
    riskPercentage: 1.0,
    dollarRisk: 250,
    positionSize: 2.5,
    pnl: 750,
    pnlPercentage: 300,
    realizedR: 3.0,
    plannedRR: 3.0,
    screenshots: [
      {
        id: 'ss_1',
        type: 'ENTRY',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
        caption: 'M5 London Open Asian Low Sweep + MSS Displacement',
        timestamp: '2026-09-18T09:30:00Z',
      }
    ],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: [],
    notes: 'Textbook Asian low liquidity sweep during London open killzone. Clean displacement upward.',
    review: {
      whyTrade: 'Asian low swept with strong rejection candle and displacement through prior highs.',
      thesis: 'Targeting London high liquidity at 1.0855.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Waited patiently for the 5-minute displacement before entering.',
      whatWentWrong: 'Nothing, execution was disciplined.',
      doDifferently: 'Could have left a 10% runner into New York open.',
      emotions: ['Calm', 'Confident'],
      confidenceRating: 5,
      stressRating: 1,
      focusRating: 5,
      completedAt: '2026-09-18T12:00:00Z',
    },
    createdAt: '2026-09-18T09:30:00Z',
    updatedAt: '2026-09-18T12:00:00Z',
  },
  {
    id: 'trade_002',
    tradeNumber: 2,
    instrument: 'NQ',
    direction: 'SHORT',
    status: 'LOSS',
    entryDate: '2026-09-19',
    entryTime: '15:45',
    exitDate: '2026-09-19',
    exitTime: '16:05',
    timeframe: 'M1',
    session: 'NEW_YORK',
    strategy: 'ICT / SMC Concepts',
    setup: 'Fair Value Gap (FVG)',
    entryPrice: 19850,
    stopLossPrice: 19875,
    takeProfitPrice: 19775,
    exitPrice: 19875,
    accountBalanceAtEntry: 25750,
    riskPercentage: 1.0,
    dollarRisk: 250,
    positionSize: 1,
    pnl: -250,
    pnlPercentage: -100,
    realizedR: -1.0,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map((c, i) => ({ ...c, checked: i !== 6 })), // Missed news check
    mistakes: ['Traded during news', 'Entered too early'],
    notes: 'FOMC speaker stepped up to the podium. Volatility spike stopped me out immediately.',
    review: {
      whyTrade: 'Saw 1M FVG and rushed entry without double checking the economic calendar.',
      thesis: 'Anticipated afternoon selloff.',
      followedStrategy: false,
      followedRules: false,
      whatWentWell: 'Honored stop loss without widening it.',
      whatWentWrong: 'Did not check ForexFactory calendar before entering.',
      doDifferently: 'Always check economic releases before placing limit orders in NY session.',
      emotions: ['Impatient', 'FOMO'],
      confidenceRating: 2,
      stressRating: 4,
      focusRating: 2,
      completedAt: '2026-09-19T17:00:00Z',
    },
    createdAt: '2026-09-19T15:45:00Z',
    updatedAt: '2026-09-19T17:00:00Z',
  },
  {
    id: 'trade_003',
    tradeNumber: 3,
    instrument: 'XAUUSD',
    direction: 'LONG',
    status: 'WIN',
    entryDate: '2026-09-22',
    entryTime: '08:45',
    exitDate: '2026-09-22',
    exitTime: '12:30',
    timeframe: 'M15',
    session: 'LONDON',
    strategy: 'ICT / SMC Concepts',
    setup: 'Order Block (OB)',
    entryPrice: 2615.5,
    stopLossPrice: 2609.5,
    takeProfitPrice: 2633.5,
    exitPrice: 2633.5,
    accountBalanceAtEntry: 25500,
    riskPercentage: 1.0,
    dollarRisk: 255,
    positionSize: 0.5,
    pnl: 765,
    pnlPercentage: 300,
    realizedR: 3.0,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: [],
    notes: 'Clean 15M bullish order block tap after sweeping internal lows. TP reached smoothly.',
    review: {
      whyTrade: 'HTF 4H trend was strongly bullish. 15M OB mitigation provided low-risk entry.',
      thesis: 'Gold continuing rally to all-time highs.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Stayed patient, did not look at the P&L tick-by-tick.',
      whatWentWrong: 'None.',
      doDifferently: 'Good trade. Maintain this exact routine.',
      emotions: ['Calm', 'Confident'],
      confidenceRating: 5,
      stressRating: 1,
      focusRating: 5,
    },
    createdAt: '2026-09-22T08:45:00Z',
    updatedAt: '2026-09-22T13:00:00Z',
  },
  {
    id: 'trade_004',
    tradeNumber: 4,
    instrument: 'BTCUSDT',
    direction: 'SHORT',
    status: 'WIN',
    entryDate: '2026-09-24',
    entryTime: '14:10',
    exitDate: '2026-09-24',
    exitTime: '18:40',
    timeframe: 'H1',
    session: 'NEW_YORK',
    strategy: 'Price Action & Breakout',
    setup: 'Support/Resistance Flip',
    entryPrice: 64200,
    stopLossPrice: 64800,
    takeProfitPrice: 62400,
    exitPrice: 62700,
    accountBalanceAtEntry: 26265,
    riskPercentage: 1.0,
    dollarRisk: 260,
    positionSize: 0.43,
    pnl: 650,
    pnlPercentage: 250,
    realizedR: 2.5,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: ['Took profit early'],
    notes: 'Closed slightly before final target due to approaching weekend session volatility.',
    review: {
      whyTrade: 'Daily support broke and retested cleanly as resistance.',
      thesis: 'Sellers in control heading into weekly close.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Managed risk flawlessly.',
      whatWentWrong: 'Secured profits 300 points before target.',
      doDifferently: 'Could have taken 80% off and left runner to exact TP.',
      emotions: ['Hesitant', 'Calm'],
      confidenceRating: 4,
      stressRating: 2,
      focusRating: 4,
    },
    createdAt: '2026-09-24T14:10:00Z',
    updatedAt: '2026-09-24T19:00:00Z',
  },
  {
    id: 'trade_005',
    tradeNumber: 5,
    instrument: 'NQ',
    direction: 'LONG',
    status: 'LOSS',
    entryDate: '2026-09-28',
    entryTime: '10:05',
    exitDate: '2026-09-28',
    exitTime: '10:18',
    timeframe: 'M1',
    session: 'NEW_YORK',
    strategy: 'ICT / SMC Concepts',
    setup: 'Liquidity Sweep',
    entryPrice: 20120,
    stopLossPrice: 20090,
    takeProfitPrice: 20210,
    exitPrice: 20085,
    accountBalanceAtEntry: 26915,
    riskPercentage: 1.5,
    dollarRisk: 350,
    positionSize: 1,
    pnl: -350,
    pnlPercentage: -100,
    realizedR: -1.16,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map((c, i) => ({ ...c, checked: i < 5 })),
    mistakes: ['Oversized position', 'Chased candle'],
    notes: 'Chased market open impulse. Slipped on stop loss. Felt slightly annoyed.',
    review: {
      whyTrade: 'Thought NY open was going to launch immediately.',
      thesis: 'Premature continuation.',
      followedStrategy: false,
      followedRules: false,
      whatWentWell: 'Did not double down into revenge trade.',
      whatWentWrong: 'Chased momentum without waiting for 5M candle close.',
      doDifferently: 'Wait 15 minutes after NY opening bell before placing market orders.',
      emotions: ['Greedy', 'Frustrated'],
      confidenceRating: 2,
      stressRating: 4,
      focusRating: 2,
    },
    createdAt: '2026-09-28T10:05:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
  },
  {
    id: 'trade_006',
    tradeNumber: 6,
    instrument: 'EURUSD',
    direction: 'SHORT',
    status: 'WIN',
    entryDate: '2026-09-30',
    entryTime: '08:30',
    exitDate: '2026-09-30',
    exitTime: '11:45',
    timeframe: 'M5',
    session: 'LONDON',
    strategy: 'ICT / SMC Concepts',
    setup: 'Breaker Block',
    entryPrice: 1.0890,
    stopLossPrice: 1.0905,
    takeProfitPrice: 1.0845,
    exitPrice: 1.0845,
    accountBalanceAtEntry: 26565,
    riskPercentage: 1.0,
    dollarRisk: 265,
    positionSize: 2.0,
    pnl: 795,
    pnlPercentage: 300,
    realizedR: 3.0,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: [],
    notes: 'Clean breaker block retest after taking out buy-side liquidity.',
    review: {
      whyTrade: 'Clear bearish breaker block structure after high sweep.',
      thesis: 'Sell-side liquidity targeting 1.0845.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Completely adhered to trading checklist. Zero emotional interference.',
      whatWentWrong: 'None.',
      doDifferently: 'Execute with this exact calm detachment every single session.',
      emotions: ['Calm', 'Confident'],
      confidenceRating: 5,
      stressRating: 1,
      focusRating: 5,
    },
    createdAt: '2026-09-30T08:30:00Z',
    updatedAt: '2026-09-30T12:00:00Z',
  },
  {
    id: 'trade_007',
    tradeNumber: 7,
    instrument: 'NQ',
    direction: 'LONG',
    status: 'WIN',
    entryDate: '2026-10-01',
    entryTime: '14:35',
    exitDate: '2026-10-01',
    exitTime: '15:55',
    timeframe: 'M5',
    session: 'NEW_YORK',
    strategy: 'ICT / SMC Concepts',
    setup: 'Fair Value Gap (FVG)',
    entryPrice: 20280,
    stopLossPrice: 20245,
    takeProfitPrice: 20385,
    exitPrice: 20385,
    accountBalanceAtEntry: 27360,
    riskPercentage: 1.0,
    dollarRisk: 270,
    positionSize: 1,
    pnl: 810,
    pnlPercentage: 300,
    realizedR: 3.0,
    plannedRR: 3.0,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: [],
    notes: 'Smooth delivery from 5M discount FVG up to daily high liquidity.',
    review: {
      whyTrade: 'Clear bullish displacement leaving pristine FVG in discount.',
      thesis: 'Targeting previous day high.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Waited for retracement rather than FOMOing top.',
      whatWentWrong: 'None.',
      doDifferently: 'Continue honoring execution rules.',
      emotions: ['Calm', 'Confident'],
      confidenceRating: 5,
      stressRating: 1,
      focusRating: 5,
    },
    createdAt: '2026-10-01T14:35:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'trade_008',
    tradeNumber: 8,
    instrument: 'ES',
    direction: 'LONG',
    status: 'WIN',
    entryDate: '2026-10-02',
    entryTime: '09:40',
    exitDate: '2026-10-02',
    exitTime: '11:10',
    timeframe: 'M5',
    session: 'NEW_YORK',
    strategy: 'ICT / SMC Concepts',
    setup: 'Liquidity Sweep',
    entryPrice: 5760.25,
    stopLossPrice: 5752.25,
    takeProfitPrice: 5780.25,
    exitPrice: 5780.25,
    accountBalanceAtEntry: 28170,
    riskPercentage: 0.9,
    dollarRisk: 250,
    positionSize: 2,
    pnl: 500,
    pnlPercentage: 200,
    realizedR: 2.5,
    plannedRR: 2.5,
    screenshots: [],
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    mistakes: [],
    notes: 'Morning liquidity sweep of Asian session lows, displacement up into lunch session.',
    review: {
      whyTrade: 'ES sweep of session low with heavy volume accumulation.',
      thesis: 'Reversal toward 5780 resistance.',
      followedStrategy: true,
      followedRules: true,
      whatWentWell: 'Maintained strict sizing under 1%.',
      whatWentWrong: 'None.',
      doDifferently: 'Pleased with process execution.',
      emotions: ['Calm', 'Confident'],
      confidenceRating: 5,
      stressRating: 1,
      focusRating: 5,
    },
    createdAt: '2026-10-02T09:40:00Z',
    updatedAt: '2026-10-02T11:20:00Z',
  }
];

class KravoRoomDB {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: {
    trades: Trade[];
    strategies: StrategyDefinition[];
    checklists: ChecklistItem[];
    goals: Goal[];
    dailyReviews: DailyReviewRecord[];
    settings: AccountSettings;
  } | null = null;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isBrowser()) {
      throw new Error('IndexedDB not supported in current environment');
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('trades')) {
          const tradeStore = db.createObjectStore('trades', { keyPath: 'id' });
          tradeStore.createIndex('entryDate', 'entryDate', { unique: false });
          tradeStore.createIndex('status', 'status', { unique: false });
          tradeStore.createIndex('strategy', 'strategy', { unique: false });
        }
        if (!db.objectStoreNames.contains('strategies')) {
          db.createObjectStore('strategies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('checklists')) {
          db.createObjectStore('checklists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('dailyReviews')) {
          const revStore = db.createObjectStore('dailyReviews', { keyPath: 'id' });
          revStore.createIndex('date', 'date', { unique: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Fallback to LocalStorage for safety
  private loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`kravo_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`kravo_${key}`, JSON.stringify(value));
    } catch {
      // Ignored
    }
  }

  // --- TRADES DAO ---
  async getTrades(): Promise<Trade[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('trades', 'readonly');
        const store = tx.objectStore('trades');
        const req = store.getAll();
        req.onsuccess = () => {
          let trades: Trade[] = req.result || [];
          if (trades.length === 0) {
            // First time initialization with realistic sample trades
            trades = INITIAL_SAMPLE_TRADES;
            this.seedInitialData();
          }
          // Sort chronologically descending
          trades.sort((a, b) => new Date(`${b.entryDate}T${b.entryTime}`).getTime() - new Date(`${a.entryDate}T${a.entryTime}`).getTime());
          resolve(trades);
        };
        req.onerror = () => {
          const fallback = this.loadFromLocalStorage<Trade[]>('trades', INITIAL_SAMPLE_TRADES);
          resolve(fallback);
        };
      });
    } catch {
      return this.loadFromLocalStorage<Trade[]>('trades', INITIAL_SAMPLE_TRADES);
    }
  }

  async saveTrade(trade: Trade): Promise<Trade> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('trades', 'readwrite');
        const store = tx.objectStore('trades');
        const req = store.put(trade);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      const current = this.loadFromLocalStorage<Trade[]>('trades', INITIAL_SAMPLE_TRADES);
      const idx = current.findIndex(t => t.id === trade.id);
      if (idx >= 0) {
        current[idx] = trade;
      } else {
        current.push(trade);
      }
      this.saveToLocalStorage('trades', current);
    }
    return trade;
  }

  async deleteTrade(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('trades', 'readwrite');
        const store = tx.objectStore('trades');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const current = this.loadFromLocalStorage<Trade[]>('trades', INITIAL_SAMPLE_TRADES);
      const filtered = current.filter(t => t.id !== id);
      this.saveToLocalStorage('trades', filtered);
    }
  }

  // --- STRATEGIES DAO ---
  async getStrategies(): Promise<StrategyDefinition[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('strategies', 'readonly');
        const req = tx.objectStore('strategies').getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          if (list.length === 0) {
            list = DEFAULT_STRATEGIES;
            this.saveStrategies(list);
          }
          resolve(list);
        };
        req.onerror = () => resolve(this.loadFromLocalStorage('strategies', DEFAULT_STRATEGIES));
      });
    } catch {
      return this.loadFromLocalStorage('strategies', DEFAULT_STRATEGIES);
    }
  }

  async saveStrategies(strategies: StrategyDefinition[]): Promise<void> {
    this.saveToLocalStorage('strategies', strategies);
    try {
      const db = await this.getDB();
      const tx = db.transaction('strategies', 'readwrite');
      const store = tx.objectStore('strategies');
      store.clear();
      strategies.forEach(s => store.put(s));
    } catch {
      // Handled in localStorage
    }
  }

  // --- CHECKLIST TEMPLATE DAO ---
  async getChecklistTemplate(): Promise<ChecklistItem[]> {
    return this.loadFromLocalStorage<ChecklistItem[]>('checklist_template', DEFAULT_CHECKLIST);
  }

  async saveChecklistTemplate(items: ChecklistItem[]): Promise<void> {
    this.saveToLocalStorage('checklist_template', items);
  }

  // --- GOALS DAO ---
  async getGoals(): Promise<Goal[]> {
    return this.loadFromLocalStorage<Goal[]>('goals', DEFAULT_GOALS);
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    this.saveToLocalStorage('goals', goals);
  }

  // --- DAILY REVIEWS DAO ---
  async getDailyReviews(): Promise<DailyReviewRecord[]> {
    return this.loadFromLocalStorage<DailyReviewRecord[]>('daily_reviews', []);
  }

  async saveDailyReview(review: DailyReviewRecord): Promise<void> {
    const list = await this.getDailyReviews();
    const idx = list.findIndex(r => r.date === review.date);
    if (idx >= 0) {
      list[idx] = review;
    } else {
      list.push(review);
    }
    this.saveToLocalStorage('daily_reviews', list);
  }

  // --- SETTINGS DAO ---
  async getSettings(): Promise<AccountSettings> {
    return this.loadFromLocalStorage<AccountSettings>('settings', DEFAULT_SETTINGS);
  }

  async saveSettings(settings: AccountSettings): Promise<void> {
    this.saveToLocalStorage('settings', settings);
  }

  // --- SEEDING & RESET ---
  async seedInitialData(): Promise<void> {
    for (const t of INITIAL_SAMPLE_TRADES) {
      await this.saveTrade(t);
    }
    await this.saveStrategies(DEFAULT_STRATEGIES);
    await this.saveChecklistTemplate(DEFAULT_CHECKLIST);
    await this.saveGoals(DEFAULT_GOALS);
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  async resetToDefaults(): Promise<void> {
    try {
      const db = await this.getDB();
      const stores = ['trades', 'strategies', 'checklists', 'goals', 'dailyReviews', 'settings'];
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
    } catch {
      // Ignored
    }
    localStorage.clear();
    await this.seedInitialData();
  }

  // --- EXPORT TO CSV ---
  async exportTradesToCSV(): Promise<string> {
    const trades = await this.getTrades();
    const headers = [
      'Trade #',
      'Date',
      'Time',
      'Instrument',
      'Direction',
      'Status',
      'Timeframe',
      'Session',
      'Strategy',
      'Setup',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'Exit Price',
      'Risk %',
      'Dollar Risk',
      'Position Size',
      'Realized R',
      'P&L ($)',
      'Mistakes',
      'Notes'
    ];

    const rows = trades.map(t => [
      t.tradeNumber,
      t.entryDate,
      t.entryTime || '',
      t.instrument,
      t.direction,
      t.status,
      t.timeframe,
      t.session,
      `"${t.strategy}"`,
      `"${t.setup}"`,
      t.entryPrice,
      t.stopLossPrice,
      t.takeProfitPrice,
      t.exitPrice || '',
      t.riskPercentage,
      t.dollarRisk,
      t.positionSize,
      t.realizedR !== undefined ? t.realizedR : '',
      t.pnl !== undefined ? t.pnl : '',
      `"${(t.mistakes || []).join('; ')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // --- FULL JSON BACKUP & RESTORE ---
  async generateFullBackupJSON(): Promise<string> {
    const trades = await this.getTrades();
    const strategies = await this.getStrategies();
    const checklistTemplate = await this.getChecklistTemplate();
    const goals = await this.getGoals();
    const dailyReviews = await this.getDailyReviews();
    const settings = await this.getSettings();

    const backup = {
      app: 'Kravo Trading Journal Room Database',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        trades,
        strategies,
        checklistTemplate,
        goals,
        dailyReviews,
        settings,
      }
    };

    return JSON.stringify(backup, null, 2);
  }

  async restoreFromBackupJSON(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Invalid backup file');

      if (Array.isArray(parsed.data.trades)) {
        for (const t of parsed.data.trades) {
          await this.saveTrade(t);
        }
      }
      if (Array.isArray(parsed.data.strategies)) {
        await this.saveStrategies(parsed.data.strategies);
      }
      if (Array.isArray(parsed.data.checklistTemplate)) {
        await this.saveChecklistTemplate(parsed.data.checklistTemplate);
      }
      if (Array.isArray(parsed.data.goals)) {
        await this.saveGoals(parsed.data.goals);
      }
      if (parsed.data.settings) {
        await this.saveSettings(parsed.data.settings);
      }
      return true;
    } catch (e) {
      console.error('Restore failed:', e);
      return false;
    }
  }
}

export const kravoDB = new KravoRoomDB();
