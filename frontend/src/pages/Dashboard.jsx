import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import TopBar from '../components/TopBar'
import SkinAnalysisArea from '../components/SkinAnalysisArea'
import AnalysisHistory from '../components/AnalysisHistory'
import SkinSurvey from '../components/SkinSurvey'

function Dashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [analyses, setAnalyses] = useState([])
    const [activeAnalysisId, setActiveAnalysisId] = useState('')
    const [userName, setUserName] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [showSurvey, setShowSurvey] = useState(false)

    useEffect(() => {
        // Check auth state with backend
        const checkAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const user = await authService.getCurrentUser()
                    if (user) {
                        setCurrentUser(user)
                        
                        // Get user name from user profile or localStorage with user-specific key
                        const userNameKey = `dermin_user_name_${user.email}`
                        const savedUserName = localStorage.getItem(userNameKey) || user.display_name
                        
                        if (savedUserName) {
                            setUserName(savedUserName)
                        }

                        // Check if user has completed survey
                        const surveyCompleted = localStorage.getItem('dermin_survey_completed')
                        if (!surveyCompleted) {
                            setShowSurvey(true)
                        }
                    } else {
                        navigate('/login')
                    }
                } catch (error) {
                    console.error('Auth check error:', error)
                    navigate('/login')
                }
            } else {
                // User not authenticated
                navigate('/login')
            }
        }

        checkAuth()
    }, [navigate])

    const handleLogout = async () => {
        try {
            authService.logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleSurveyComplete = (surveyData) => {
        console.log('Survey completed:', surveyData)
        setShowSurvey(false)
        // Could show a success message or update user profile
    }

    const handleUserNameChange = async (newName) => {
        if (currentUser) {
            const userNameKey = `dermin_user_name_${currentUser.email}`
            
            try {
                // Update backend profile
                await authService.updateProfile({
                    display_name: newName
                })
                
                setUserName(newName)
                localStorage.setItem(userNameKey, newName)
            } catch (error) {
                console.error('Error updating profile:', error)
                // Fallback to localStorage only
                setUserName(newName)
                localStorage.setItem(userNameKey, newName)
            }
        }
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleNewAnalysis = () => {
        setActiveAnalysisId('')
        // Reset any current analysis state
    }

    const handleSelectAnalysis = (analysisId) => {
        setActiveAnalysisId(analysisId)
        // Load analysis data
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#d7d8e0] via-[#e6e7ed] to-[#d7d8e0] flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8a8b9a] border-t-transparent mx-auto"></div>
                    <p className="text-[#6a6b7a] mt-4 text-center">Loading...</p>
                </div>
            </div>
        )
    }

    if (showSurvey) {
        return <SkinSurvey onComplete={handleSurveyComplete} userName={userName} />
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col">
            <TopBar 
                onToggleSidebar={toggleSidebar} 
                onLogout={handleLogout}
                userName={userName}
                onUserNameChange={handleUserNameChange}
            />
            
            <div className="flex-1 flex overflow-hidden">
                <AnalysisHistory 
                    analyses={analyses}
                    activeAnalysisId={activeAnalysisId}
                    onNewAnalysis={handleNewAnalysis}
                    onSelectAnalysis={handleSelectAnalysis}
                    isOpen={sidebarOpen}
                />
                
                <SkinAnalysisArea userName={userName} />
            </div>
        </div>
    )
}

export default Dashboard
