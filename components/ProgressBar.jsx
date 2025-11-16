'use client'

import { motion } from 'framer-motion'
import { Loader2, Clock } from 'lucide-react'

export default function ProgressBar({ progressData = {} }) {
  const { 
    progress = 0, 
    current = 0, 
    total = 0, 
    message = '',
    estimatedTimeRemaining = 0
  } = progressData

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return null
    
    if (seconds < 10) return '< 10s'
    if (seconds < 60) return `~${Math.ceil(seconds / 5) * 5}s` // Round to nearest 5s
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.ceil((seconds % 60) / 10) * 10 // Round to nearest 10s
    
    if (remainingSeconds === 60) {
      return `~${minutes + 1}m`
    }
    
    if (remainingSeconds === 0) {
      return `~${minutes}m`
    }
    
    return `~${minutes}m ${remainingSeconds}s`
  }

  const timeDisplay = progress > 10 && progress < 95 
    ? formatTimeRemaining(estimatedTimeRemaining) 
    : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Translation Progress
        </span>
        <span className="text-sm font-semibold text-blue-600">
          {progress}%
        </span>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        />
        
        {/* Animated shimmer effect */}
        {progress < 100 && (
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="max-w-[250px] truncate">{message || 'Processing...'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {timeDisplay && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{timeDisplay}</span>
            </motion.div>
          )}
          
          {total > 0 && (
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
              {current}/{total}
            </span>
          )}
        </div>
      </div>

      {/* Progress stages indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span className={progress >= 10 ? 'text-green-600 font-medium' : ''}>
          {progress < 10 ? '⏳' : '✓'} Upload
        </span>
        <span className={progress > 10 && progress < 95 ? 'text-blue-600 font-medium' : progress >= 95 ? 'text-green-600 font-medium' : ''}>
          {progress <= 10 ? '⏳' : progress < 95 ? '🔄' : '✓'} Translation
        </span>
        <span className={progress >= 100 ? 'text-green-600 font-medium' : progress >= 95 ? 'text-blue-600 font-medium' : ''}>
          {progress < 95 ? '⏳' : progress < 100 ? '🔄' : '✓'} Complete
        </span>
      </div>
    </div>
  )
}