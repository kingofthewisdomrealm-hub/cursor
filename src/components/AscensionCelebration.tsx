import { motion, AnimatePresence } from 'framer-motion'

interface AscensionCelebrationProps {
  show: boolean
}

export function AscensionCelebration({ show }: AscensionCelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center px-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-4"
            >
              👑
            </motion.div>
            <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">
              LEGENDARY COMMUNICATOR
            </h2>
            <p className="text-white/90 mt-2 text-lg">You have ascended!</p>
            <p className="text-yellow-200 font-bold mt-4 text-xl">+1,000 Communication Points</p>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-yellow-300"
                style={{ left: '50%', top: '50%' }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
