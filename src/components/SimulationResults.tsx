import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationResult } from '../types/game'
import { AnimatedCounter } from './AnimatedCounter'

interface SimulationResultsProps {
  result: SimulationResult
  onClose: () => void
  onPlayAgain: () => void
  animationsEnabled: boolean
}

function FitBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-[10px] font-semibold text-slate-600 w-8 text-right">{value}%</span>
    </div>
  )
}

export function SimulationResults({
  result,
  onClose,
  onPlayAgain,
  animationsEnabled,
}: SimulationResultsProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          <div className="text-center mb-5">
            <div className="text-4xl mb-2">{result.isSuccess ? '🎉' : '📉'}</div>
            <h2 className="text-xl font-bold text-slate-800">
              {result.isSuccess ? 'Business Launched!' : 'Needs Work'}
            </h2>
            <p className="text-sm text-slate-500">
              Overall Fit: {result.overallFit}%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-emerald-600 font-semibold">Revenue</p>
              <p className="text-lg font-bold text-emerald-700">
                {animationsEnabled ? (
                  <AnimatedCounter value={result.revenue} prefix="$" />
                ) : (
                  `$${result.revenue.toLocaleString()}`
                )}
              </p>
            </div>
            <div className="bg-teal-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-teal-600 font-semibold">Profit</p>
              <p className="text-lg font-bold text-teal-700">
                {animationsEnabled ? (
                  <AnimatedCounter value={result.profit} prefix="$" />
                ) : (
                  `$${result.profit.toLocaleString()}`
                )}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-blue-600 font-semibold">Conversion</p>
              <p className="text-lg font-bold text-blue-700">
                {animationsEnabled ? (
                  <AnimatedCounter value={result.conversionRate} suffix="%" decimals={1} />
                ) : (
                  `${result.conversionRate}%`
                )}
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase text-amber-600 font-semibold">Satisfaction</p>
              <p className="text-lg font-bold text-amber-700">
                {animationsEnabled ? (
                  <AnimatedCounter value={result.customerSatisfaction} suffix="%" />
                ) : (
                  `${result.customerSatisfaction}%`
                )}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
            <p className="text-xs font-bold text-slate-600 mb-2">Fit Breakdown</p>
            {result.breakdown.productMarket > 0 && (
              <FitBar label="Product-Market" value={result.breakdown.productMarket} />
            )}
            {result.breakdown.problemMatch > 0 && (
              <FitBar label="Problem" value={result.breakdown.problemMatch} />
            )}
            {result.breakdown.messaging > 0 && (
              <FitBar label="Messaging" value={result.breakdown.messaging} />
            )}
            {result.breakdown.offer > 0 && (
              <FitBar label="Offer" value={result.breakdown.offer} />
            )}
            {result.breakdown.traffic > 0 && (
              <FitBar label="Traffic" value={result.breakdown.traffic} />
            )}
            {result.breakdown.funnel > 0 && (
              <FitBar label="Funnel" value={result.breakdown.funnel} />
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-5">
            <p className="text-xs font-bold text-slate-600 mb-2">Analysis</p>
            <ul className="space-y-1.5">
              {result.feedback.map((line, i) => (
                <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-1.5">
                  <span className="shrink-0">{result.isSuccess ? '✓' : '•'}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {(result.xpGained > 0 || result.xpLost > 0) && (
            <div className="flex justify-center gap-4 mb-4 text-sm">
              {result.xpGained > 0 && (
                <span className="text-emerald-600 font-semibold">+{result.xpGained} XP</span>
              )}
              {result.xpLost > 0 && (
                <span className="text-red-500 font-semibold">-{result.xpLost} XP</span>
              )}
              {result.repeatCustomers > 0 && (
                <span className="text-blue-600 font-semibold">
                  {result.repeatCustomers} repeat customers
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Build Again
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
