'use client'

import { useCallback } from 'react'
import { Upload, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FileUpload({ onFileSelect }) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.srt')) {
        onFileSelect(file)
      } else {
        alert('Please upload a valid .srt file')
      }
    },
    [onFileSelect]
  )

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative"
    >
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all cursor-pointer group">
        <input
          type="file"
          accept=".srt"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Upload className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4 group-hover:text-blue-500 transition-colors" />
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Drop your subtitle file here
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          or click to browse
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
          <FileText className="w-4 h-4" />
          <span>Supports .SRT files only</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Maximum file size: 10MB
      </p>
    </motion.div>
  )
}