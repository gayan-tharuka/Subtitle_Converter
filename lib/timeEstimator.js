// Simple time estimator based on a fixed rate
// Just measure time for 100 subtitles once and update the config below

const TIME_CONFIG = {
  // Time in SECONDS for 100 subtitles
  normalMode: 1.2,    // Change this after measuring (e.g., if 100 subs take 25 seconds)
  fastMode: 15,      // Change this after measuring in fast mode
}

export function estimateTranslationTime(subtitleCount, fastMode = false) {
  const timeFor100 = fastMode ? TIME_CONFIG.fastMode : TIME_CONFIG.normalMode
  
  // Calculate time based on subtitle count
  const estimatedSeconds = (subtitleCount / 100) * timeFor100
  
  console.log(`Estimate: ${subtitleCount} subtitles will take ~${estimatedSeconds.toFixed(1)}s (${timeFor100}s per 100 subs)`)
  
  return estimatedSeconds
}

// Export config for easy access/modification
export { TIME_CONFIG }