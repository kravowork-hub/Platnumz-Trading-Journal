/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trade, 
  StrategyDefinition, 
  ChecklistItem, 
  Goal, 
  DailyReviewRecord, 
  AccountSettings,
  PostTradeReview 
} from './types';
import { kravoDB, DEFAULT_SETTINGS } from './db/kravo_db';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { JournalView } from './components/JournalView';
import { AnalyticsView } from './components/AnalyticsView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { TradeModal } from './components/TradeModal';
import { TradeDetailModal } from './components/TradeDetailModal';
import { RiskCalculatorModal } from './components/RiskCalculatorModal';
import { GoalsView } from './components/GoalsView';
import { ReviewsView } from './components/ReviewsView';
import { SecurityLockModal } from './components/SecurityLockModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ImageViewerModal } from './components/ImageViewerModal';
import { AiChartLabModal } from './components/AiChartLabModal';
import { ExportReportModal } from './components/ExportReportModal';
import { AndroidCodeExportModal } from './components/AndroidCodeExportModal';
import { PwaBuilderModal } from './components/PwaBuilderModal';
import { AndroidToast, ToastMessage } from './components/AndroidToast';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { Haptics } from './utils/haptics';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [secondaryView, setSecondaryView] = useState<'NONE' | 'GOALS' | 'REVIEWS'>('NONE');

  // Core Data
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [checklistTemplate, setChecklistTemplate] = useState<ChecklistItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyReviews, setDailyReviews] = useState<DailyReviewRecord[]>([]);
  const [settings, setSettings] = useState<AccountSettings>(DEFAULT_SETTINGS);

  // Security Lock
  const [isLocked, setIsLocked] = useState(false);

  // Modals
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [riskCalcOpen, setRiskCalcOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [androidExportModalOpen, setAndroidExportModalOpen] = useState(false);
  const [pwaBuilderModalOpen, setPwaBuilderModalOpen] = useState(false);
  const [aiLabModalOpen, setAiLabModalOpen] = useState(false);

  // Image Viewer
  const [imageViewer, setImageViewer] = useState<{ isOpen: boolean; url: string | null; caption?: string }>({
    isOpen: false,
    url: null,
  });

  // Native Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
    setToast({ id: String(Date.now()), type, message });
  }, []);

  // Native Android Hardware Back Button Controller
  const hasOpenModal = imageViewer.isOpen || 
    !!selectedTradeId || 
    tradeModalOpen || 
    riskCalcOpen || 
    reportModalOpen || 
    androidExportModalOpen || 
    pwaBuilderModalOpen || 
    aiLabModalOpen;

  const closeTopModal = useCallback(() => {
    if (imageViewer.isOpen) {
      setImageViewer({ isOpen: false, url: null });
    } else if (selectedTradeId) {
      setSelectedTradeId(null);
    } else if (tradeModalOpen) {
      setTradeModalOpen(false);
      setEditingTrade(null);
    } else if (riskCalcOpen) {
      setRiskCalcOpen(false);
    } else if (reportModalOpen) {
      setReportModalOpen(false);
    } else if (pwaBuilderModalOpen) {
      setPwaBuilderModalOpen(false);
    } else if (androidExportModalOpen) {
      setAndroidExportModalOpen(false);
    } else if (aiLabModalOpen) {
      setAiLabModalOpen(false);
    }
  }, [imageViewer.isOpen, selectedTradeId, tradeModalOpen, riskCalcOpen, reportModalOpen, pwaBuilderModalOpen, androidExportModalOpen, aiLabModalOpen]);

  const canGoBackView = secondaryView !== 'NONE' || currentTab !== 'dashboard';

  const goBackView = useCallback(() => {
    if (secondaryView !== 'NONE') {
      setSecondaryView('NONE');
    } else if (currentTab !== 'dashboard') {
      setCurrentTab('dashboard');
    }
  }, [secondaryView, currentTab]);

  useAndroidBackButton({
    hasOpenModal,
    closeTopModal,
    canGoBackView,
    goBackView,
    onExitNotice: () => showToast('Press back again to exit Kravo', 'INFO'),
  });

  // Load all data from Room IndexedDB
  const loadDatabaseData = useCallback(async () => {
    try {
      const [tList, sList, cList, gList, rList, st] = await Promise.all([
        kravoDB.getTrades(),
        kravoDB.getStrategies(),
        kravoDB.getChecklistTemplate(),
        kravoDB.getGoals(),
        kravoDB.getDailyReviews(),
        kravoDB.getSettings(),
      ]);

      setTrades(tList);
      setStrategies(sList);
      setChecklistTemplate(cList);
      setGoals(gList);
      setDailyReviews(rList);
      setSettings(st);

      if (st.pinEnabled) {
        setIsLocked(true);
      }
    } catch (e) {
      console.error('Failed to load database:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Trade Operations
  const handleSaveTrade = async (trade: Trade) => {
    await kravoDB.saveTrade(trade);
    const updated = await kravoDB.getTrades();
    setTrades(updated);
    setTradeModalOpen(false);
    setEditingTrade(null);
    Haptics.success();
    showToast(editingTrade ? 'Trade updated in offline database' : 'Trade recorded to offline vault', 'SUCCESS');
  };

  const handleDeleteTrade = async (tradeId: string) => {
    await kravoDB.deleteTrade(tradeId);
    const updated = await kravoDB.getTrades();
    setTrades(updated);
    if (selectedTradeId === tradeId) setSelectedTradeId(null);
    Haptics.warning();
    showToast('Trade removed from database', 'WARNING');
  };

  const handleUpdateReview = async (tradeId: string, review: PostTradeReview) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    const updatedTrade = { ...trade, review, updatedAt: new Date().toISOString() };
    await kravoDB.saveTrade(updatedTrade);
    const updated = await kravoDB.getTrades();
    setTrades(updated);
    Haptics.success();
    showToast('Post-trade review saved', 'SUCCESS');
  };

  // Goals Operations
  const handleSaveGoal = async (goal: Goal) => {
    const nextGoals = goals.some(g => g.id === goal.id)
      ? goals.map(g => g.id === goal.id ? goal : g)
      : [...goals, goal];
    await kravoDB.saveGoals(nextGoals);
    setGoals(nextGoals);
    Haptics.success();
    showToast('Trading goal saved', 'SUCCESS');
  };

  const handleDeleteGoal = async (goalId: string) => {
    const nextGoals = goals.filter(g => g.id !== goalId);
    await kravoDB.saveGoals(nextGoals);
    setGoals(nextGoals);
    Haptics.warning();
    showToast('Goal removed', 'INFO');
  };

  // Daily Review Operations
  const handleSaveDailyReview = async (review: DailyReviewRecord) => {
    await kravoDB.saveDailyReview(review);
    const updated = await kravoDB.getDailyReviews();
    setDailyReviews(updated);
    Haptics.success();
    showToast('Daily review logged', 'SUCCESS');
  };

  // Settings Operation
  const handleUpdateSettings = async (newSettings: AccountSettings) => {
    await kravoDB.saveSettings(newSettings);
    setSettings(newSettings);
    Haptics.success();
    showToast('Vault settings updated', 'SUCCESS');
  };

  const handleOpenEditTrade = (trade: Trade) => {
    setSelectedTradeId(null);
    setEditingTrade(trade);
    setTradeModalOpen(true);
  };

  const selectedTrade = trades.find(t => t.id === selectedTradeId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 animate-pulse">
          <div className="w-full h-full bg-[#0C0F17] rounded-[14px] flex items-center justify-center font-mono font-bold text-xl text-emerald-400">
            K
          </div>
        </div>
        <span className="text-xs font-mono text-gray-400">Loading Room SQLite Cache...</span>
      </div>
    );
  }

  // Onboarding Wizard check
  if (!settings.onboardingCompleted) {
    return (
      <OnboardingWizard
        initialSettings={settings}
        strategies={strategies}
        checklist={checklistTemplate}
        onComplete={(newSettings) => {
          handleUpdateSettings(newSettings);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-[#E5E7EB] font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Security PIN Lock Screen */}
      {isLocked && (
        <SecurityLockModal
          isLocked={isLocked}
          pinCode={settings.pinCode}
          biometricEnabled={settings.biometricEnabled}
          appName={settings.appName}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Android System Status Bar */}
      <AndroidStatusBar
        appName={settings.appName}
        isLocked={isLocked}
        onOpenApkModal={() => setAndroidExportModalOpen(true)}
        onOpenPwaBuilder={() => setPwaBuilderModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-1 sm:px-2 pt-1">
        {/* Secondary Back Navigation if sub-view is open */}
        {secondaryView !== 'NONE' && (
          <div className="px-3 py-2 flex items-center justify-between border-b border-[#1C2234] mb-2 bg-[#0C0F17]/60 rounded-xl">
            <button
              onClick={() => setSecondaryView('NONE')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              ← Back to Main Navigation
            </button>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              {secondaryView === 'GOALS' ? 'Process Goals' : 'Audited Reviews'}
            </span>
          </div>
        )}

        {/* View Switcher */}
        {secondaryView === 'GOALS' ? (
          <GoalsView
            goals={goals}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        ) : secondaryView === 'REVIEWS' ? (
          <ReviewsView
            trades={trades}
            settings={settings}
            dailyReviews={dailyReviews}
            onSelectTrade={(id) => setSelectedTradeId(id)}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                trades={trades}
                settings={settings}
                onOpenQuickTrade={() => {
                  setEditingTrade(null);
                  setTradeModalOpen(true);
                }}
                onSelectTrade={(id) => setSelectedTradeId(id)}
                onOpenRiskCalc={() => setRiskCalcOpen(true)}
                onOpenGoals={() => setSecondaryView('GOALS')}
                onOpenReviews={() => setSecondaryView('REVIEWS')}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenPwaBuilder={() => setPwaBuilderModalOpen(true)}
              />
            )}

            {currentTab === 'journal' && (
              <JournalView
                trades={trades}
                settings={settings}
                strategies={strategies}
                onSelectTrade={(id) => setSelectedTradeId(id)}
                onOpenQuickTrade={() => {
                  setEditingTrade(null);
                  setTradeModalOpen(true);
                }}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView
                trades={trades}
                settings={settings}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                trades={trades}
                settings={settings}
                dailyReviews={dailyReviews}
                onSaveDailyReview={handleSaveDailyReview}
                onSelectTrade={(id) => setSelectedTradeId(id)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onOpenReportModal={() => setReportModalOpen(true)}
                onOpenAndroidExportModal={() => setAndroidExportModalOpen(true)}
                onOpenAiLabModal={() => setAiLabModalOpen(true)}
                onDataReset={loadDatabaseData}
                onOpenPwaBuilder={() => setPwaBuilderModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Material 3 Navigation Bar with Floating + Trade Action Button */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSecondaryView('NONE');
          setCurrentTab(tab);
        }}
        onOpenQuickTrade={() => {
          setEditingTrade(null);
          setTradeModalOpen(true);
        }}
      />

      {/* Trade Modal: Quick Entry & Edit */}
      {tradeModalOpen && (
        <TradeModal
          isOpen={tradeModalOpen}
          onClose={() => {
            setTradeModalOpen(false);
            setEditingTrade(null);
          }}
          onSaveTrade={handleSaveTrade}
          editingTrade={editingTrade}
          strategies={strategies}
          checklistTemplate={checklistTemplate}
          settings={settings}
          tradeCount={trades.length}
        />
      )}

      {/* Trade Inspector & Post-Trade Review */}
      {!!selectedTradeId && selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          isOpen={!!selectedTradeId}
          onClose={() => setSelectedTradeId(null)}
          onEdit={handleOpenEditTrade}
          onDelete={handleDeleteTrade}
          onUpdateReview={handleUpdateReview}
          settings={settings}
          onOpenImageViewer={(url, caption) => setImageViewer({ isOpen: true, url, caption })}
        />
      )}

      {/* Risk / Position Sizing Calculator Modal */}
      {riskCalcOpen && (
        <RiskCalculatorModal
          isOpen={riskCalcOpen}
          onClose={() => setRiskCalcOpen(false)}
          settings={settings}
        />
      )}

      {/* Printable Report Modal */}
      {reportModalOpen && (
        <ExportReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          trades={trades}
          settings={settings}
        />
      )}

      {/* Android Kotlin Studio Code Exporter Modal */}
      {androidExportModalOpen && (
        <AndroidCodeExportModal
          isOpen={androidExportModalOpen}
          onClose={() => setAndroidExportModalOpen(false)}
        />
      )}

      {/* PWABuilder Helper & Launcher Modal */}
      {pwaBuilderModalOpen && (
        <PwaBuilderModal
          isOpen={pwaBuilderModalOpen}
          onClose={() => setPwaBuilderModalOpen(false)}
        />
      )}

      {/* Future AI Vision Lab Modal */}
      {aiLabModalOpen && (
        <AiChartLabModal
          isOpen={aiLabModalOpen}
          onClose={() => setAiLabModalOpen(false)}
        />
      )}

      {/* Zoomable Image Attachment Viewer */}
      {imageViewer.isOpen && imageViewer.url && (
        <ImageViewerModal
          isOpen={imageViewer.isOpen}
          imageUrl={imageViewer.url}
          caption={imageViewer.caption}
          onClose={() => setImageViewer({ isOpen: false, url: null })}
        />
      )}

      {/* Native Android Toast Snackbar */}
      <AndroidToast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
