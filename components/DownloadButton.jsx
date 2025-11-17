'use client'

import { Download } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DownloadButton({ file, filename }) {
  const handleDownload = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-2xl font-medium hover:bg-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
    >
      <Download className="w-5 h-5" />
      Download Sinhala Subtitle
    </motion.button>
  )
}