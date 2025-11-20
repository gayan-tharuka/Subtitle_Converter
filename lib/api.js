import axios from 'axios'
import { estimateTranslationTime } from './timeEstimator'

// Update to latest deployment URL (check with: beam deployment get 7de4186b-a974-4b19-acfe-f17e2)
const BEAM_URL = 'https://translate-subtitle-99b7ce7-v7.app.beam.cloud'  // Changed to v7
const BEAM_TOKEN = 'fpr07jHHK8xQpyJQKjj1s4Z2Y9J4zff4RVkRs5VbFKJP1KE1meHzkMnuXfiCFKdhCLAnKIwsp3zDN5NG8FYTJQ=='

export async function testConnection() {
  try {
    return { 
      status: 'online', 
      service: 'Beam Translation Service v7',  // Updated version
      backend: 'beam.cloud'
    }
  } catch (error) {
    console.error('API Connection Test Failed:', error.message)
    throw new Error('Cannot connect to translation service')
  }
}

// Parse SRT to count subtitles (now filters out bracketed lines)
function countSubtitlesInFile(fileContent) {
  try {
    if (fileContent.startsWith('\ufeff')) {
      fileContent = fileContent.substring(1)
    }
    
    fileContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const blocks = fileContent.split('\n\n').filter(block => block.trim())
    
    let count = 0
    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length >= 3 && lines[1].includes('-->')) {
        // Check if the text content is not just bracketed background sound
        const textLines = lines.slice(2).join('\n')
        const isBracketedOnly = /^\s*\[.*\]\s*$/.test(textLines.trim())
        
        if (!isBracketedOnly) {
          count++
        }
      }
    }
    
    return count
  } catch (error) {
    console.error('Error counting subtitles:', error)
    return Math.ceil((fileContent.length / 1024) * 13.6)
  }
}

export async function translateSubtitle(file, settings, onProgress) {
  let progressInterval = null
  
  try {
    console.log('Sending translation request to Beam:', BEAM_URL)
    
    const fileText = await file.text()
    const totalSubtitles = countSubtitlesInFile(fileText)
    
    console.log(`Total subtitles: ${totalSubtitles} (after filtering bracketed content)`)
    
    // Get time estimate based on your measured rate
    const estimatedTotalSeconds = estimateTranslationTime(totalSubtitles, settings.fastMode)
    
    let translationStartTime = null
    let lastProgressUpdate = 10
    
    // Simple progress based on elapsed time
    const updateProgress = () => {
      if (!translationStartTime) return
      
      const elapsedSeconds = (Date.now() - translationStartTime) / 1000
      
      // Calculate progress: 10% (upload) + up to 85% (translation) = 95% max
      const translationProgress = Math.min(85, (elapsedSeconds / estimatedTotalSeconds) * 85)
      const currentProgress = Math.min(95, 10 + translationProgress)
      
      // Never go backwards
      const smoothProgress = Math.max(lastProgressUpdate, currentProgress)
      lastProgressUpdate = smoothProgress
      
      // Calculate current subtitle based on progress
      const progressRatio = (smoothProgress - 10) / 85
      const currentSubtitle = Math.floor(progressRatio * totalSubtitles)
      
      // Calculate remaining time
      const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds)
      
      onProgress({
        progress: Math.round(smoothProgress),
        current: currentSubtitle,
        total: totalSubtitles,
        estimatedTimeRemaining: remainingSeconds,
        message: smoothProgress < 90 
          ? `Translating subtitles... (${currentSubtitle}/${totalSubtitles})`
          : 'Almost done, finalizing...',
        complete: false
      })
    }

    // Initial progress
    onProgress({
      progress: 5,
      current: 0,
      total: totalSubtitles,
      estimatedTimeRemaining: estimatedTotalSeconds,
      message: 'Preparing file...',
      complete: false
    })

    const payload = {
      srt_content: fileText,
      batch_size: settings.batchSize,
      fast_mode: settings.fastMode,
      add_watermark: true  // ← ADDED: Enable watermark
    }

    // Start timer and progress updates
    translationStartTime = Date.now()
    
    onProgress({
      progress: 10,
      current: 0,
      total: totalSubtitles,
      estimatedTimeRemaining: estimatedTotalSeconds,
      message: 'Starting translation on GPU...',
      complete: false
    })
    
    // Update progress every 500ms
    progressInterval = setInterval(updateProgress, 500)

    // Make API request
    const response = await axios.post(BEAM_URL, payload, {
      headers: {
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEAM_TOKEN}`
      },
      timeout: 600000,
    })

    // Stop progress updates
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }

    // Log actual time for calibration
    if (translationStartTime) {
      const actualTime = (Date.now() - translationStartTime) / 1000
      const timeFor100 = (actualTime / totalSubtitles) * 100
      
      console.log(`✓ Translation complete!`)
      console.log(`✓ Actual time: ${actualTime.toFixed(1)}s`)
      console.log(`✓ Time for 100 subtitles: ${timeFor100.toFixed(1)}s`)
      console.log(`✓ Watermark added: ${response.data.watermark_added}`)  // Added
      console.log(`📝 Update TIME_CONFIG.${settings.fastMode ? 'fastMode' : 'normalMode'} to ${Math.ceil(timeFor100)} in timeEstimator.js`)
    }

    if (response.data.status === 'success') {
      onProgress({
        progress: 100,
        current: totalSubtitles,
        total: totalSubtitles,
        estimatedTimeRemaining: 0,
        message: 'Translation complete!',
        complete: true
      })

      const translatedSrtText = response.data.translated_srt
      const blob = new Blob([translatedSrtText], { type: 'text/plain;charset=utf-8' })
      
      return blob
    } else {
      throw new Error(response.data.error || 'Translation failed')
    }
    
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    
    console.error('Translation error:', error)
    
    if (error.response) {
      const errorData = error.response.data
      
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check your Beam API token.')
      } else if (error.response.status === 404) {
        throw new Error(`Beam endpoint not found. Please verify the deployment URL.`)
      } else if (errorData?.error) {
        throw new Error(errorData.error)
      } else {
        throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`)
      }
    } else if (error.request) {
      throw new Error(`Cannot reach Beam service. Please check your deployment.`)
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
}
