import SubtitleConverter from '@/components/SubtitleConverter'
import SubtitleSearch from '@/components/SubtitleSearch'
import DarkModeToggle from '@/components/DarkModeToggle'
import { Zap, Brain, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1 py-10 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12 md:mb-6">
          <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">

            {/* Top row: HelaSubLk left + Mode right */}
            <div className="flex items-center justify-between mb-6">
              {/* Left: HelaSubLk badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-600 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="font-medium tracking-wide">HelaSubLk</span>
              </div>

              {/* Right: Mode toggle only */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                <span className="uppercase tracking-[0.18em]">Mode</span>
                <DarkModeToggle />
                
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-500 dark:text-slate-50 mb-4">
              Subtitle Converter
            </h1>

            {/* Description paragraph */}
            <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 max-w-3xl leading-relaxed mb-6">
              Upload your English subtitle file and get a quality Sinhala version in seconds. 
            </p>

            {/* Centered "English to Sinhala Translation" pill */}
            <div className="flex justify-center mb-4">  {/* reduced from mb-6 or more */}
          <span className={`
              inline-block px-6 py-2 rounded-full text-sm font-medium shadow-lg
              /* Light mode – exact colors from your screenshot */
              bg-gray-100 text-blue-600 border border-gray-300
              /* Dark mode – keeps the original dark look */
              dark:bg-slate-800 dark:text-blue-300 dark:border-slate-700
            `}>
              English to Sinhala Translation
            </span>
            </div>
          </div>
        </header>

        {/* Subtitle Search */}
        <SubtitleSearch />

        {/* Main Converter */}
        <SubtitleConverter />

        {/* Features */}
        <section className="mt-14 md:mt-16 grid gap-4 md:gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-500" />}
            title="Lightning Fast Processing"
            description="Advanced batch processing delivers rapid subtitle conversion with minimal wait times."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-purple-500" />}
            title="AI-Powered Accuracy"
            description="Leverages state-of-the-art mBART-50 model for contextually accurate Sinhala translations."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-green-500" />}
            title="Enterprise Security"
            description="Bank-grade encryption ensures your files remain private and secure throughout processing."
          />
        </section>

        {/* Footer */}
        <footer className="mt-14 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] md:text-xs text-gray-500 dark:text-slate-500">
          <p>Powered by mBART‑50 • Crafted for the Sinhala subtitle community</p>
          <p className="text-gray-600 dark:text-slate-600">
            Designed with a quiet, minimal workspace in mind.
          </p>
        </footer>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-soft p-5 md:p-6 hover:border-gray-300 dark:hover:border-slate-500/80 transition-colors duration-200">
      <div className="mb-4 opacity-90 flex justify-center">{icon}</div>
      <h3 className="font-medium text-sm md:text-base mb-1.5 text-gray-900 dark:text-slate-100 tracking-tight text-center">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 leading-relaxed text-center">
        {description}
      </p>
    </div>
  )

}
