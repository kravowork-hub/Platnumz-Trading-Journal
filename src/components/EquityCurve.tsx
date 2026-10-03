import React, { useState, useRef, useMemo } from 'react';
import { generateEquityCurveData, EquityPoint, formatCurrency, formatR } from '../utils/calculations';
import { Trade } from '../types';
import { TrendingUp, DollarSign, Target, Info } from 'lucide-react';

interface EquityCurveProps {
  trades: Trade[];
  startingBalance: number;
  currency: string;
  onSelectTrade?: (tradeId: string) => void;
  isLight?: boolean;
}

export type EquityCurveMode = 'BALANCE' | 'PNL' | 'R_MULTIPLE';

export const EquityCurve: React.FC<EquityCurveProps> = ({
  trades,
  startingBalance,
  currency,
  onSelectTrade,
  isLight = false,
}) => {
  const [mode, setMode] = useState<EquityCurveMode>('PNL');
  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const points = useMemo(() => {
    return generateEquityCurveData(trades, startingBalance);
  }, [trades, startingBalance]);

  // Extract min and max depending on mode
  const values = useMemo(() => {
    return points.map(p => {
      if (mode === 'BALANCE') return p.balance;
      if (mode === 'R_MULTIPLE') return p.cumulativeR;
      return p.cumulativePnl;
    });
  }, [points, mode]);

  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, mode === 'BALANCE' ? startingBalance : 100);
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const width = 360;
  const height = 180;
  const paddingX = 20;
  const paddingTop = 25;
  const paddingBottom = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const coordinatePoints = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((p, idx) => {
      const val = mode === 'BALANCE' ? p.balance : mode === 'R_MULTIPLE' ? p.cumulativeR : p.cumulativePnl;
      const x = paddingX + (idx / (points.length - 1 || 1)) * plotWidth;
      const y = paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;
      return { x, y, point: p, val };
    });
  }, [points, mode, minVal, range, plotWidth, plotHeight]);

  // Generate SVG Path
  const linePath = useMemo(() => {
    if (coordinatePoints.length === 0) return '';
    return coordinatePoints.reduce((acc, curr, i) => {
      return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [coordinatePoints]);

  const areaPath = useMemo(() => {
    if (coordinatePoints.length === 0) return '';
    const first = coordinatePoints[0];
    const last = coordinatePoints[coordinatePoints.length - 1];
    const baselineY = paddingTop + plotHeight;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [coordinatePoints, linePath, plotHeight]);

  // Zero-line Y coordinate for PNL / R
  const zeroY = mode !== 'BALANCE'
    ? paddingTop + plotHeight - ((0 - minVal) / range) * plotHeight
    : null;

  // Handle touch / drag scrubber
  const handleTouch = (clientX: number) => {
    if (!svgRef.current || coordinatePoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const clampedX = Math.max(paddingX, Math.min(rect.width - paddingX, relativeX));
    const ratio = (clampedX - paddingX) / (rect.width - paddingX * 2);
    const closestIdx = Math.round(ratio * (points.length - 1));
    const point = points[Math.max(0, Math.min(points.length - 1, closestIdx))];
    setHoveredPoint(point);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    handleTouch(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 1 || e.pointerType === 'touch') {
      handleTouch(e.clientX);
    }
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const activePoint = hoveredPoint || (points.length > 0 ? points[points.length - 1] : null);

  return (
    <div className={`rounded-2xl p-4 border shadow-sm transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#11141D] border-[#1E2435]'
    }`}>
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            <TrendingUp className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>Interactive Equity Curve</span>
          </div>
          <div className={`text-xl font-bold font-mono mt-0.5 flex items-baseline gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {mode === 'BALANCE' && formatCurrency(activePoint?.balance ?? startingBalance, currency)}
            {mode === 'PNL' && (
              <span className={(activePoint?.cumulativePnl ?? 0) >= 0 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-rose-600' : 'text-rose-400')}>
                {formatCurrency(activePoint?.cumulativePnl ?? 0, currency)}
              </span>
            )}
            {mode === 'R_MULTIPLE' && (
              <span className={(activePoint?.cumulativeR ?? 0) >= 0 ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : (isLight ? 'text-rose-600' : 'text-rose-400')}>
                {formatR(activePoint?.cumulativeR ?? 0)}
              </span>
            )}

            {activePoint?.tradeId && (
              <span className={`text-[11px] font-sans font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                (Trade #{activePoint.index}: {activePoint.instrument} {activePoint.direction})
              </span>
            )}
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0A0C13] border-[#1E2433]'}`}>
          <button
            onClick={() => setMode('PNL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              mode === 'PNL' 
                ? (isLight ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40')
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
            }`}
          >
            P&L
          </button>
          <button
            onClick={() => setMode('R_MULTIPLE')}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              mode === 'R_MULTIPLE'
                ? (isLight ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40')
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
            }`}
          >
            R
          </button>
          <button
            onClick={() => setMode('BALANCE')}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              mode === 'BALANCE'
                ? (isLight ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40')
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
            }`}
          >
            Balance
          </button>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative touch-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible cursor-crosshair select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={isLight ? 0.15 : 0.25} />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="equityLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor={isLight ? '#059669' : '#34D399'} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke={isLight ? '#F1F5F9' : '#1B2130'}
            strokeDasharray="2 3"
          />
          <line
            x1={paddingX}
            y1={paddingTop + plotHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + plotHeight / 2}
            stroke={isLight ? '#F1F5F9' : '#1B2130'}
            strokeDasharray="2 3"
          />
          <line
            x1={paddingX}
            y1={paddingTop + plotHeight}
            x2={width - paddingX}
            y2={paddingTop + plotHeight}
            stroke={isLight ? '#E2E8F0' : '#1B2130'}
          />

          {/* Zero baseline for PNL / R */}
          {zeroY !== null && zeroY >= paddingTop && zeroY <= paddingTop + plotHeight && (
            <line
              x1={paddingX}
              y1={zeroY}
              x2={width - paddingX}
              y2={zeroY}
              stroke={isLight ? '#CBD5E1' : '#334155'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          )}

          {/* Fill Area */}
          {areaPath && <path d={areaPath} fill="url(#equityGradient)" />}

          {/* Main Curve Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#equityLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Trade Markers on Curve */}
          {coordinatePoints.map((cp, idx) => {
            if (idx === 0) return null; // Baseline point
            const isWin = (cp.point.pnl ?? 0) > 0;
            const isLoss = (cp.point.pnl ?? 0) < 0;
            const markerColor = isWin ? '#10B981' : isLoss ? '#EF4444' : '#64748B';
            const isHovered = hoveredPoint?.tradeId === cp.point.tradeId;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  if (cp.point.tradeId && onSelectTrade) {
                    onSelectTrade(cp.point.tradeId);
                  }
                }}
              >
                <circle
                  cx={cp.x}
                  cy={cp.y}
                  r={isHovered ? 6 : 4}
                  fill={markerColor}
                  stroke="#090B10"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Scrubber / Crosshair when dragging */}
          {hoveredPoint && (
            (() => {
              const matched = coordinatePoints.find(cp => cp.point.index === hoveredPoint.index);
              if (!matched) return null;
              return (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={matched.x}
                    y1={paddingTop}
                    x2={matched.x}
                    y2={paddingTop + plotHeight}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Active highlight circle */}
                  <circle
                    cx={matched.x}
                    cy={matched.y}
                    r="8"
                    fill="#38BDF8"
                    opacity="0.3"
                  />
                  <circle
                    cx={matched.x}
                    cy={matched.y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                </g>
              );
            })()
          )}

          {/* X Axis Date Labels */}
          {coordinatePoints.length > 0 && (
            <>
              <text
                x={paddingX}
                y={height - 8}
                fill="#64748B"
                fontSize="9"
                fontFamily="monospace"
              >
                {points[0]?.date}
              </text>
              <text
                x={width - paddingX}
                y={height - 8}
                fill="#64748B"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                {points[points.length - 1]?.date}
              </text>
            </>
          )}
        </svg>

        {/* Tip info bar */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 px-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-gray-400" />
            Drag finger to inspect trades. Tap a marker to open trade.
          </span>
          <span className="font-mono text-gray-400">
            {points.length > 1 ? `${points.length - 1} trades` : '0 trades'}
          </span>
        </div>
      </div>
    </div>
  );
};
