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
    <div className="glass-effect rounded-3xl p-8 shadow-2xl">
      {/* API Status Banner */}
      {apiStatus === 'offline' && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <WifiOff className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Translation Service Offline</p>
            <p className="text-sm text-yellow-600 mt-1">
              Cannot connect to the API. Please check:
            </p>
            <ul className="text-sm text-yellow-600 mt-2 ml-4 list-disc">
              <li>Your HuggingFace Space is running</li>
              <li>API URL is correct in .env.local</li>
              <li>CORS is enabled on the backend</li>
            </ul>
            <p className="text-xs text-yellow-500 mt-2 font-mono">
              API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
            </p>
          </div>
        </div>
      )}

      {apiStatus === 'online' && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">Translation service is online and ready</p>
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
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Translation Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
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
                    className="w-48 accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Fast Mode (lower quality)
                  </label>
                  <button
                    onClick={() =>
                      setSettings({ ...settings, fastMode: !settings.fastMode })
                    }
                    disabled={isTranslating}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.fastMode ? 'bg-blue-600' : 'bg-gray-300'
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
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Translation Failed</p>
                  <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {translatedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Translation Complete! 🎉</p>
                  <p className="text-sm text-green-600 mt-1">
                    Your Sinhala subtitle file is ready for download
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!translatedFile ? (
                <>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || apiStatus === 'offline'}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isTranslating ? 'Translating...' : 'Start Translation'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isTranslating}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <DownloadButton file={translatedFile} filename={`sinhala_${file.name}`} />
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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