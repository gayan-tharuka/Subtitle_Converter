'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import icons to avoid hydration issues
const Search = dynamic(() => import('lucide-react').then(mod => mod.Search), { ssr: false })
const ExternalLink = dynamic(() => import('lucide-react').then(mod => mod.ExternalLink), { ssr: false })

export default function SubtitleSearch() {
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = () => {
    if (!query.trim()) {
      alert('Please enter a movie or series name')
      return
    }

    // URL encode the query and construct the OpenSubtitles URL
    const encodedQuery = encodeURIComponent(query.trim())
    const searchUrl = `https://www.opensubtitles.org/en/search/moviename-${encodedQuery}/sublanguageid-eng`

    // Open in new tab
    window.open(searchUrl, '_blank')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="glass-effect rounded-3xl p-6 md:p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
          Find English Subtitles
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto">
          Search for English subtitles on OpenSubtitles.org to download before converting to Sinhala
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter movie or series name..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-colors shadow-sm"
        >
          {mounted && <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">Search</span>
          {mounted && <ExternalLink className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-slate-500 text-center mt-4">
        Opens in a new tab • Powered by OpenSubtitles.org
      </p>
    </div>
  )
}