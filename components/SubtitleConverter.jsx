'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import DownloadButton from './DownloadButton'
import { translateSubtitle, testConnection } from '@/lib/api'
import { AlertCircle, CheckCircle2, FileText, WifiOff } from 'lucide-react'

export default function SubtitleConverter() {
  const [file, setFile] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [progressData, setProgressData] = useState({
    progress: 0,
    current: 0,
    total: 0,
    message: ''
  })
  const [translatedFile, setTranslatedFile] = useState(null)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')
  const [settings, setSettings] = useState({
    batchSize: 32,
    fastMode: false,
  })

  // Test API connection on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        await testConnection()
        setApiStatus('online')
        console.log('✅ API is online')
      } catch (err) {
        setApiStatus('offline')
        console.error('❌ API is offline:', err.message)
      }
    }
    checkAPI()
  }, [])

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setTranslatedFile(null)
    setError(null)
    setProgressData({ progress: 0, current: 0, total: 0, message: '' })
  }

  const handleTranslate = async () => {
    if (!file) return

    setIsTranslating(true)
    setError(null)
    setProgressData({ progress: 0, current: 0, total: 0, message: 'Starting...' })

    try {
      const blob = await translateSubtitle(file, settings, (data) => {
        console.log('Progress update:', data)
        setProgressData(data)
      })

      setTranslatedFile(blob)
      setProgressData({ 
        progress: 100, 
        current: 0, 
        total: 0, 
        message: 'Complete!', 
        complete: true 
      })
    } catch (err) {
      console.error('Translation error:', err)
      setError(err.message || 'Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setTranslatedFile(null)
    setError(null)
    setProgressData({ progress: 0, current: 0, total: 0, message: '' })
  }

  return (
    <div className="glass-effect rounded-3xl p-6 md:p-8">
      {/* API Status Banner */}
      {apiStatus === 'offline' && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40">
          <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-100">Translation service offline</p>
            <p className="text-xs text-amber-700 dark:text-amber-200/80 mt-1">
              Cannot connect to the API. Please check:
            </p>
            <ul className="text-xs text-amber-700 dark:text-amber-200/80 mt-2 ml-4 list-disc space-y-0.5">
              <li>Your HuggingFace Space is running</li>
              <li>API URL is correct in .env.local</li>
              <li>CORS is enabled on the backend</li>
            </ul>
            <p className="text-[11px] text-amber-600 dark:text-amber-300/80 mt-2 font-mono">
              API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
            </p>
          </div>
        </div>
      )}

      {apiStatus === 'online' && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 dark:bg-emerald-900/40 border border-green-200 dark:border-emerald-500/40 text-xs text-green-800 dark:text-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-emerald-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-emerald-400" />
          </span>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <p className="text-[11px] tracking-wide">Translation service is online</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FileUpload onFileSelect={handleFileSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="process"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* File Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/80">
              <FileText className="w-8 h-8 text-gray-600 dark:text-slate-200" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-slate-100 text-sm md:text-base">{file.name}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm md:text-base">
                Translation settings
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs md:text-sm text-gray-700 dark:text-slate-300">
                    Batch Size: {settings.batchSize}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    step="8"
                    value={settings.batchSize}
                    onChange={(e) =>
                      setSettings({ ...settings, batchSize: parseInt(e.target.value) })
                    }
                    disabled={isTranslating}
                    className="w-40 md:w-48 accent-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs md:text-sm text-gray-700 dark:text-slate-300">
                    Fast Mode (lower quality)
                  </label>
                  <button
                    onClick={() =>
                      setSettings({ ...settings, fastMode: !settings.fastMode })
                    }
                    disabled={isTranslating}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.fastMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'
                    } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.fastMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isTranslating && (
              <ProgressBar progressData={progressData} />
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-500/35 bg-red-50 dark:bg-red-950/40"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-50 text-sm">Translation failed</p>
                  <p className="text-xs text-red-700 dark:text-red-200 mt-1 whitespace-pre-wrap">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {translatedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 rounded-2xl border border-green-200 dark:border-emerald-500/40 bg-green-50 dark:bg-emerald-950/40"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-emerald-300 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-emerald-50 text-sm">Translation complete</p>
                  <p className="text-xs text-green-700 dark:text-emerald-200 mt-1">
                    Your Sinhala subtitle file is ready for download
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-4">
              {!translatedFile ? (
                <>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || apiStatus === 'offline'}
                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-2xl font-medium hover:bg-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isTranslating ? 'Translating...' : 'Start Translation'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isTranslating}
                    className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-slate-700/80 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-900/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <DownloadButton file={translatedFile} filename={`sinhala_${file.name}`} />
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-slate-700/80 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-900/80 transition-colors"
                  >
                    Convert Another
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}