import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'

export async function testConnection() {
  try {
    const response = await axios.get(`${API_URL}/`, { timeout: 5000 })
    return response.data
  } catch (error) {
    console.error('API Connection Test Failed:', error.message)
    throw new Error('Cannot connect to translation service')
  }
}

// Parse SRT to count subtitles
function countSubtitlesInFile(fileContent) {
  try {
    // Remove BOM
    if (fileContent.startsWith('\ufeff')) {
      fileContent = fileContent.substring(1)
    }
    
    // Normalize line endings
    fileContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    // Split by double newlines (subtitle blocks)
    const blocks = fileContent.split('\n\n').filter(block => block.trim())
    
    // Count valid subtitle blocks
    let count = 0
    for (const block of blocks) {
      const lines = block.trim().split('\n')
      // Valid subtitle has at least 3 lines: index, timestamp, text
      if (lines.length >= 3 && lines[1].includes('-->')) {
        count++
      }
    }
    
    return count
  } catch (error) {
    console.error('Error counting subtitles:', error)
    // Fallback: estimate based on file size
    return Math.ceil((fileContent.length / 1024) * 13.6) // ~13.6 subtitles per KB
  }
}

export async function translateSubtitle(file, settings, onProgress) {
  let progressInterval = null
  
  try {
    console.log('Sending translation request to:', API_URL)
    
    // Read file to count subtitles
    const fileText = await file.text()
    const totalSubtitles = countSubtitlesInFile(fileText)
    
    console.log(`Estimated ${totalSubtitles} subtitles in file`)
    
    // Initial time estimate (will be adjusted based on actual speed)
    // Conservative initial estimate: slower is better than too fast
    let timePerSubtitle = settings.fastMode ? 0.5 : 0.7
    let estimatedTotalSeconds = totalSubtitles * timePerSubtitle
    
    console.log(`Initial estimated translation time: ${estimatedTotalSeconds.toFixed(1)}s`)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('batch_size', settings.batchSize.toString())
    formData.append('fast_mode', settings.fastMode.toString())

    let uploadComplete = false
    let translationStartTime = null
    let lastProgressUpdate = 10
    let lastUpdateTime = null
    
    // Adaptive progress simulation
    const simulateProgress = () => {
      if (!translationStartTime) return
      
      const now = Date.now()
      const elapsedSeconds = (now - translationStartTime) / 1000
      
      // Calculate raw progress based on time
      let rawProgress = Math.min(95, (elapsedSeconds / estimatedTotalSeconds) * 85)
      
      // Adaptive adjustment: if we're past the initial estimate but not done, slow down
      if (elapsedSeconds > estimatedTotalSeconds && rawProgress < 85) {
        // Recalculate based on actual speed
        const actualTimePerSubtitle = elapsedSeconds / (totalSubtitles * 0.85) // assume we're 85% done
        estimatedTotalSeconds = totalSubtitles * actualTimePerSubtitle * 1.2 // add 20% buffer
        console.log(`Adjusted estimate: ${estimatedTotalSeconds.toFixed(1)}s (${actualTimePerSubtitle.toFixed(2)}s per subtitle)`)
      }
      
      // Smooth progress: never go backwards, slow down as we approach 95%
      const targetProgress = 10 + rawProgress
      const smoothedProgress = Math.max(lastProgressUpdate, Math.min(95, targetProgress))
      
      // Slow down progress updates near the end
      const progressDiff = smoothedProgress - lastProgressUpdate
      let finalProgress = lastProgressUpdate
      
      if (progressDiff > 0) {
        // Maximum increase per update cycle
        const maxIncrease = smoothedProgress > 80 ? 0.5 : (smoothedProgress > 60 ? 1 : 2)
        finalProgress = lastProgressUpdate + Math.min(progressDiff, maxIncrease)
      }
      
      lastProgressUpdate = finalProgress
      lastUpdateTime = now
      
      // Calculate estimated current subtitle based on progress
      const progressPercent = (finalProgress - 10) / 85 // Remove upload %, normalize to 0-1
      const estimatedCurrentSubtitle = Math.min(
        totalSubtitles,
        Math.floor(progressPercent * totalSubtitles)
      )
      
      // Calculate time remaining
      const remainingProgress = 95 - finalProgress
      const remainingSeconds = (remainingProgress / 85) * estimatedTotalSeconds
      
      onProgress({
        progress: Math.round(finalProgress),
        current: estimatedCurrentSubtitle,
        total: totalSubtitles,
        estimatedTimeRemaining: Math.max(0, remainingSeconds),
        message: finalProgress < 90 
          ? `Translating subtitles... (${estimatedCurrentSubtitle}/${totalSubtitles})`
          : 'Almost done, finalizing...',
        complete: false
      })
    }

    // Start translation request
    const responsePromise = axios.post(`${API_URL}/translate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
      timeout: 600000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        
        // Upload takes 0-10% of progress
        onProgress({
          progress: Math.round(percentCompleted * 0.1),
          current: 0,
          total: totalSubtitles,
          estimatedTimeRemaining: estimatedTotalSeconds,
          message: `Uploading file... ${percentCompleted}%`,
          complete: false
        })
        
        if (percentCompleted >= 100 && !uploadComplete) {
          uploadComplete = true
          translationStartTime = Date.now()
          lastUpdateTime = Date.now()
          
          onProgress({
            progress: 10,
            current: 0,
            total: totalSubtitles,
            estimatedTimeRemaining: estimatedTotalSeconds,
            message: 'Upload complete, starting translation...',
            complete: false
          })
          
          // Start progress simulation every 300ms for smoother updates
          progressInterval = setInterval(simulateProgress, 300)
        }
      },
    })

    const response = await responsePromise

    // Clean up interval
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }

    // Calculate actual time taken
    if (translationStartTime) {
      const actualTime = (Date.now() - translationStartTime) / 1000
      const actualTimePerSubtitle = actualTime / totalSubtitles
      console.log(`Actual translation time: ${actualTime.toFixed(1)}s (${actualTimePerSubtitle.toFixed(3)}s per subtitle)`)
    }

    // Final progress
    onProgress({
      progress: 100,
      current: totalSubtitles,
      total: totalSubtitles,
      estimatedTimeRemaining: 0,
      message: 'Translation complete!',
      complete: true
    })

    console.log('Translation successful!')
    return response.data
    
  } catch (error) {
    // Clean up interval on error
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    
    console.error('Translation error:', error)
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`API endpoint not found. Please check if your HuggingFace Space is running at: ${API_URL}`)
      }
      
      try {
        const text = await error.response.data.text()
        const errorData = JSON.parse(text)
        throw new Error(errorData.detail || 'Server error occurred')
      } catch {
        throw new Error(`Server error (${error.response.status}): ${error.response.statusText}`)
      }
    } else if (error.request) {
      throw new Error(`Cannot reach translation service at ${API_URL}. Please verify:\n1. Your Space is running\n2. The URL is correct\n3. CORS is enabled`)
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
}