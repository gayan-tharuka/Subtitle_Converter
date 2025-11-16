import SubtitleConverter from '@/components/SubtitleConverter'

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🎬 Subtitle Converter
          </h1>
          <p className="text-gray-600 text-lg">
            Transform English subtitles into Sinhala with AI-powered translation
          </p>
        </div>

        {/* Main Converter */}
        <SubtitleConverter />

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="⚡"
            title="Lightning Fast"
            description="Batch processing for rapid translation"
          />
          <FeatureCard
            icon="🎯"
            title="High Quality"
            description="Advanced mBART-50 translation model"
          />
          <FeatureCard
            icon="🔒"
            title="Secure"
            description="Your files are processed securely"
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by mBART-50 • Built with ❤️ for the community</p>
        </footer>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}