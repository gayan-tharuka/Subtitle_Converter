import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sinhala Subtitle Converter',
  description: 'Convert English subtitles to Sinhala with AI-powered translation',
  keywords: 'subtitle, converter, sinhala, english, translation, AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gray-50 dark:bg-slate-900">
      <body
        className={`${inter.className} text-gray-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-gray-900 dark:selection:text-slate-100`}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}