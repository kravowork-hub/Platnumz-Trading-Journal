import React, { useState } from 'react';
import { Goal } from '../types';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ShieldCheck, 
  X,
  TrendingUp,
  Percent,
  Award
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  onSaveGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onSaveGoal,
  onDeleteGoal,
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('PROCESS');
  const [targetValue, setTargetValue] = useState<number>(30);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('trades');

  const handleCreateGoal = () => {
    if (!title.trim() || targetValue <= 0) return;

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      period: 'MONTHLY',
      completed: currentValue >= targetValue,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    onSaveGoal(newGoal);
    setTitle('');
    setDescription('');
    setIsAddingGoal(false);
  };

  const handleIncrement = (goal: Goal) => {
    const updated = {
      ...goal,
      currentValue: Math.min(goal.targetValue, goal.currentValue + 1),
      completed: goal.currentValue + 1 >= goal.targetValue,
    };
    onSaveGoal(updated);
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 max-w-2xl mx-auto pt-2">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#121622] to-[#151C2C] p-4 rounded-2xl border border-blue-900/40 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            Process-Driven Milestones
          </span>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Goal
          </button>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Elite traders focus on execution consistency rather than arbitrary dollar targets. Complete your process goals to build long-term profitability.
        </p>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-2">
            <span className="text-xs font-bold text-white uppercase">Create Process Goal</span>
            <button
              onClick={() => setIsAddingGoal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete 30 properly journaled trades"
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Description / Rules</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Attach screenshots, follow checklist..."
              rows={2}
              className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Current</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="trades / %"
                className="w-full bg-[#0C0F17] border border-[#1E2538] rounded-xl p-1.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            onClick={handleCreateGoal}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition"
          >
            Save Goal
          </button>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
          const isDone = goal.currentValue >= goal.targetValue;

          return (
            <div
              key={goal.id}
              className="bg-[#121622] p-4 rounded-2xl border border-[#1E2538] space-y-3 shadow-sm relative overflow-hidden"
            >
              {isDone && (
                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 border-l border-b border-emerald-500/30">
                  <Award className="w-3 h-3 text-emerald-400" />
                  ACHIEVED
                </div>
              )}

              <div className="flex items-start justify-between pr-14">
                <div>
                  <h3 className="text-sm font-bold text-white">{goal.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{goal.description}</p>
                </div>
              </div>

              {/* Progress Bar & Numeric Ratio */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">
                    Progress: <strong className="text-white">{goal.currentValue}</strong> / {goal.targetValue} {goal.unit}
                  </span>
                  <span className={`font-bold ${isDone ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#171D2D] rounded-full overflow-hidden border border-[#20283D]">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-[#1C2336] text-xs">
                <span className="text-[10px] text-gray-500 font-mono">
                  {goal.period}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIncrement(goal)}
                    disabled={isDone}
                    className="px-2.5 py-1 bg-[#171D2D] hover:bg-[#22293E] text-emerald-400 text-[11px] font-semibold rounded-lg border border-[#232B40] disabled:opacity-40"
                  >
                    + Progress
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-gray-500 hover:text-rose-400 text-[11px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
