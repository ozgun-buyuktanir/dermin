// Data collection and analytics service
class DataService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.consentGiven = this.getStoredConsent()
  }

  // Check if user has given consent
  getStoredConsent() {
    return localStorage.getItem('dermin_privacy_consent') === 'true'
  }

  // Set privacy consent
  setPrivacyConsent(consent) {
    this.consentGiven = consent
    localStorage.setItem('dermin_privacy_consent', consent.toString())
    localStorage.setItem('dermin_consent_date', new Date().toISOString())
  }

  // Clear all user data
  clearAllData() {
    const keysToRemove = [
      'dermin_user_name',
      'dermin_privacy_consent',
      'dermin_consent_date',
      'dermin_analysis_history',
      'dermin_user_preferences'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Track user events (only if consent given)
  async trackEvent(eventName, eventData = {}) {
    if (!this.consentGiven) return

    try {
      const payload = {
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      }

      // Send to backend analytics endpoint
      await fetch(`${this.baseURL}/api/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }

  // Save analysis result
  async saveAnalysisResult(analysisData) {
    if (!this.consentGiven) return

    try {
      const payload = {
        ...analysisData,
        userId: this.getUserId(),
        timestamp: new Date().toISOString()
      }

      const response = await fetch(`${this.baseURL}/api/analysis/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      return await response.json()
    } catch (error) {
      console.error('Failed to save analysis:', error)
      throw error
    }
  }

  // Get user analysis history
  async getUserAnalysisHistory() {
    if (!this.consentGiven) return []

    try {
      const userId = this.getUserId()
      const response = await fetch(`${this.baseURL}/api/analysis/history/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch analysis history:', error)
      return []
    }
  }

  // Generate or get user ID
  getUserId() {
    let userId = localStorage.getItem('dermin_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('dermin_user_id', userId)
    }
    return userId
  }

  // Generate or get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('dermin_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('dermin_session_id', sessionId)
    }
    return sessionId
  }

  // Get user preferences
  getUserPreferences() {
    const prefs = localStorage.getItem('dermin_user_preferences')
    return prefs ? JSON.parse(prefs) : {}
  }

  // Save user preferences
  saveUserPreferences(preferences) {
    if (!this.consentGiven) return
    localStorage.setItem('dermin_user_preferences', JSON.stringify(preferences))
  }

  // Export user data (GDPR compliance)
  exportUserData() {
    const userData = {
      userId: this.getUserId(),
      userName: localStorage.getItem('dermin_user_name'),
      preferences: this.getUserPreferences(),
      consentDate: localStorage.getItem('dermin_consent_date'),
      analysisHistory: localStorage.getItem('dermin_analysis_history')
    }

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dermin_user_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Create singleton instance
const dataService = new DataService()

export default dataService
