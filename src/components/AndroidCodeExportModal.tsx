import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  Code, 
  Package, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Terminal,
  Play
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeExportModal: React.FC<AndroidCodeExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECT_APK' | 'ONLINE_BUILDER' | 'CLI_BUILD' | 'KOTLIN_ROOM'>('DIRECT_APK');
  const [activeFile, setActiveFile] = useState<'ENTITY' | 'DAO' | 'DATABASE' | 'VIEWMODEL' | 'COMPOSE' | 'GRADLE'>('ENTITY');
  const [copied, setCopied] = useState(false);
  const { install, isInstallable } = usePWAInstall();

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kravo-trading-journal.run.app';

  const files = {
    ENTITY: `// File: app/src/main/java/com/kravo/trading/data/local/TradeEntity.kt
package com.kravo.trading.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Index

@Entity(
    tableName = "trades",
    indices = [
        Index(value = ["entryDate"]),
        Index(value = ["status"]),
        Index(value = ["strategy"])
    ]
)
data class TradeEntity(
    @PrimaryKey
    val id: String,
    val tradeNumber: Int,
    val instrument: String,
    val direction: String, // "LONG" or "SHORT"
    val status: String,    // "WIN", "LOSS", "BREAK_EVEN", "OPEN"
    val entryDate: String, // "YYYY-MM-DD"
    val entryTime: String, // "HH:mm"
    val exitDate: String?,
    val exitTime: String?,
    val timeframe: String,
    val session: String,
    val strategy: String,
    val setup: String,
    val entryPrice: Double,
    val stopLossPrice: Double,
    val takeProfitPrice: Double,
    val exitPrice: Double?,
    val accountBalanceAtEntry: Double,
    val riskPercentage: Double,
    val dollarRisk: Double,
    val positionSize: Double,
    val pnl: Double?,
    val realizedR: Double?,
    val plannedRR: Double,
    val notes: String?,
    val isSyncedWithCloud: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)`,

    DAO: `// File: app/src/main/java/com/kravo/trading/data/local/TradeDao.kt
package com.kravo.trading.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TradeDao {
    @Query("SELECT * FROM trades ORDER BY entryDate DESC, entryTime DESC")
    fun getAllTrades(): Flow<List<TradeEntity>>

    @Query("SELECT * FROM trades WHERE id = :tradeId")
    suspend fun getTradeById(tradeId: String): TradeEntity?

    @Query("SELECT * FROM trades WHERE entryDate BETWEEN :startDate AND :endDate")
    fun getTradesByDateRange(startDate: String, endDate: String): Flow<List<TradeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrade(trade: TradeEntity)

    @Update
    suspend fun updateTrade(trade: TradeEntity)

    @Delete
    suspend fun deleteTrade(trade: TradeEntity)

    @Query("DELETE FROM trades")
    suspend fun clearAll()
}`,

    DATABASE: `// File: app/src/main/java/com/kravo/trading/data/local/KravoDatabase.kt
package com.kravo.trading.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [TradeEntity::class],
    version = 1,
    exportSchema = false
)
abstract class KravoDatabase : RoomDatabase() {
    abstract fun tradeDao(): TradeDao
}`,

    VIEWMODEL: `// File: app/src/main/java/com/kravo/trading/ui/viewmodel/TradeViewModel.kt
package com.kravo.trading.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kravo.trading.data.local.TradeDao
import com.kravo.trading.data.local.TradeEntity
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DashboardUiState(
    val trades: List<TradeEntity> = emptyList(),
    val totalPnl: Double = 0.0,
    val winRate: Double = 0.0,
    val profitFactor: Double = 0.0,
    val disciplineScore: Int = 100
)

class TradeViewModel(private val tradeDao: TradeDao) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            tradeDao.getAllTrades().collect { list ->
                val wins = list.count { (it.pnl ?: 0.0) > 0 }
                val losses = list.count { (it.pnl ?: 0.0) < 0 }
                val netPnl = list.sumOf { it.pnl ?: 0.0 }
                val rate = if (wins + losses > 0) (wins.toDouble() / (wins + losses)) * 100 else 0.0

                _uiState.update { current ->
                    current.copy(
                        trades = list,
                        totalPnl = netPnl,
                        winRate = rate
                    )
                }
            }
        }
    }

    fun saveTrade(trade: TradeEntity) {
        viewModelScope.launch {
            tradeDao.insertTrade(trade)
        }
    }
}`,

    COMPOSE: `// File: app/src/main/java/com/kravo/trading/ui/screens/DashboardScreen.kt
package com.kravo.trading.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.kravo.trading.ui.viewmodel.TradeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(viewModel: TradeViewModel, onAddTradeClick: () -> Unit) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("KRAVO TRADING JOURNAL", style = MaterialTheme.typography.titleMedium) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF090B10))
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddTradeClick,
                containerColor = Color(0xFF10B981)
            ) {
                Text("+", style = MaterialTheme.typography.headlineMedium, color = Color.Black)
            }
        },
        containerColor = Color(0xFF090B10)
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF121622))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("NET P&L", color = Color.Gray, style = MaterialTheme.typography.labelSmall)
                        Text(
                            text = "$ \${state.totalPnl}",
                            color = if (state.totalPnl >= 0) Color(0xFF10B981) else Color(0xFFEF4444),
                            style = MaterialTheme.typography.headlineLarge
                        )
                    }
                }
            }
        }
    }
}`,

    GRADLE: `// File: app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.kravo.trading"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kravo.trading"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    // Room Database with Coroutines
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Biometric Auth
    implementation(libs.androidx.biometric)
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combined = Object.entries(files)
      .map(([k, code]) => `// =====================\n// MODULE: ${k}\n// =====================\n\n${code}`)
      .join('\n\n\n');
    
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Kravo_Android_Studio_Kotlin_Codebase.kt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAndroidManifest = () => {
    const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.kravo.tradingjournal">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Kravo Trading Journal"
        android:theme="@style/AppTheme.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const blob = new Blob([manifestXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AndroidManifest.xml');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0F121C] rounded-3xl border border-[#20273A] shadow-2xl p-5 text-white space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2234] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Android APK & Package Hub
              </h2>
              <span className="text-[10px] text-gray-400">Installable Native Package Options for Android</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181D2A] text-gray-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Main Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#141824] p-1 rounded-2xl border border-[#1E2538] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('DIRECT_APK')}
            className={`py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'DIRECT_APK' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">1. Instant WebAPK</span>
          </button>

          <button
            onClick={() => setActiveTab('ONLINE_BUILDER')}
            className={`py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'ONLINE_BUILDER' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">2. Build .APK File</span>
          </button>

          <button
            onClick={() => setActiveTab('CLI_BUILD')}
            className={`py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'CLI_BUILD' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="truncate">3. Capacitor CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('KOTLIN_ROOM')}
            className={`py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'KOTLIN_ROOM' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="truncate">4. Kotlin Room</span>
          </button>
        </div>

        {/* Tab 1: Instant WebAPK (Zero PC Required) */}
        {activeTab === 'DIRECT_APK' && (
          <div className="p-4 bg-[#121622] rounded-2xl border border-[#1E2538] space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Android WebAPK Installation</h3>
                <span className="text-xs text-emerald-400 font-mono">No PC, No USB Debugging, No Sideloading Required</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Android Chromium (Google Chrome, Samsung Internet, Brave) features native <strong>WebAPK minting</strong>. When you install Kravo on Android, the operating system packages it into a signed native Android APK directly on your phone with full background sync, home screen launcher icon, splash screen, and offline Room DB storage.
            </p>

            <div className="bg-[#0C0F17] p-3.5 rounded-xl border border-[#1C2336] space-y-3">
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                Install on Android phone in 20 seconds:
              </span>

              {/* QR Code for instant phone access */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#141824] p-3 rounded-xl border border-[#1F263A]">
                <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(appUrl)}`}
                    alt="Scan with Android camera to install"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-emerald-400 block">Scan with your Phone Camera</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Point your Android camera or QR scanner at this code to open the app on your phone, then tap <strong>"Install"</strong> to generate the native WebAPK!
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1E2538] hover:bg-[#28324C] text-gray-200 font-mono flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'URL Copied!' : 'Copy App URL to Clipboard'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside leading-relaxed pt-1">
                <li>
                  Open this link in Chrome, Samsung Internet, or Brave on your Android phone.
                </li>
                <li>
                  Tap the green <strong>"Install App"</strong> button (or Chrome's 3-dot menu <strong>⋮</strong>).
                </li>
                <li>
                  Tap <strong>"Install"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Android compiles the signed WebAPK package and places Kravo in your Android App Drawer!
                </li>
              </ol>
            </div>

            {isInstallable && (
              <button
                onClick={install}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Trigger Android WebAPK Install Prompt Now
              </button>
            )}
          </div>
        )}

        {/* Tab 2: 1-Click Online APK Builder (PWABuilder / Google Bubblewrap) */}
        {activeTab === 'ONLINE_BUILDER' && (
          <div className="p-4 bg-[#121622] rounded-2xl border border-[#1E2538] space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Generate Signed .APK / .AAB File</h3>
                <span className="text-xs text-blue-400 font-mono">Via Official PWABuilder / Google Play Package Service</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              If you need an actual <strong>.apk file</strong> (to share with friends or sideload) or an <strong>.aab file</strong> (for the Google Play Store), you can generate a signed APK in 30 seconds using Microsoft/Google's open-source <strong>PWABuilder</strong> tool:
            </p>

            <div className="bg-[#0C0F17] p-3.5 rounded-xl border border-[#1C2336] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Web App URL:</span>
                <span className="font-mono text-emerald-400 truncate max-w-[200px]">{appUrl}</span>
              </div>
              <div className="flex items-between justify-between">
                <span className="text-gray-400">Android Package ID:</span>
                <span className="font-mono text-white">com.kravo.tradingjournal</span>
              </div>
              <div className="flex items-between justify-between">
                <span className="text-gray-400">Output Formats:</span>
                <span className="font-mono text-white">app-release.apk, bundle.aab</span>
              </div>
            </div>

            <a
              href={`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-98 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Build & Download .APK on PWABuilder
            </a>
          </div>
        )}

        {/* Tab 3: Capacitor CLI Local Build */}
        {activeTab === 'CLI_BUILD' && (
          <div className="p-4 bg-[#121622] rounded-2xl border border-[#1E2538] space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Build Local APK with Android Studio / Gradle</h3>
                <span className="text-xs text-teal-400 font-mono">Pre-Configured Capacitor Android Bridge</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              We have pre-configured <code>capacitor.config.json</code> and the <code>android/</code> directory with <code>AndroidManifest.xml</code>, <code>MainActivity.java</code>, and build scripts.
            </p>

            <div className="bg-[#0C0F17] p-3 rounded-xl border border-[#1C2336] space-y-2">
              <span className="text-[11px] font-bold text-gray-300 font-mono block">
                Run in your local terminal:
              </span>
              <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-2 bg-[#121622] rounded-lg">
{`# 1. Build the production web bundle
npm run build

# 2. Add and sync native Android project
npx cap add android
npx cap sync android

# 3. Compile the debug APK
cd android && ./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk`}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadAndroidManifest}
                className="flex-1 py-2.5 rounded-xl bg-[#171D2D] hover:bg-[#20273D] text-xs font-bold text-emerald-400 border border-[#232B40] flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download AndroidManifest.xml
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Native Kotlin Room Studio Code */}
        {activeTab === 'KOTLIN_ROOM' && (
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            {/* File sub-tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none text-xs">
              {[
                { id: 'ENTITY', label: 'TradeEntity.kt' },
                { id: 'DAO', label: 'TradeDao.kt' },
                { id: 'DATABASE', label: 'KravoDatabase.kt' },
                { id: 'VIEWMODEL', label: 'TradeViewModel.kt' },
                { id: 'COMPOSE', label: 'DashboardScreen.kt' },
                { id: 'GRADLE', label: 'build.gradle.kts' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl font-mono text-[11px] whitespace-nowrap transition ${
                    activeFile === f.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-[#121622] text-gray-400 border border-[#1E2538] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="relative flex-1 overflow-hidden bg-[#0A0D14] rounded-2xl border border-[#1C2234]">
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-[#181E2E] hover:bg-[#222B42] text-[11px] font-mono text-gray-300 flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-[11px] font-mono text-emerald-300 flex items-center gap-1 transition border border-emerald-500/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .kt</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-auto h-full scrollbar-thin">
                <code>{files[activeFile]}</code>
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
