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
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}