import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'
import { auth } from '../services/firebase'
import TopBar from '../components/TopBar'
import SkinAnalysisArea from '../components/SkinAnalysisArea'
import AnalysisHistory from '../components/AnalysisHistory'
import IntroPage from '../components/IntroPage'

function Dashboard() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState(null)
    const [analyses, setAnalyses] = useState([])
    const [activeAnalysisId, setActiveAnalysisId] = useState('')
    const [showIntro, setShowIntro] = useState(false)
    const [userName, setUserName] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        // Auth state değişikliklerini dinle
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.emailVerified) {
                setCurrentUser(user)
                
                // Check if user has seen intro - user-specific key
                const userIntroKey = `dermin_intro_completed_${user.uid}`
                const hasSeenIntro = localStorage.getItem(userIntroKey)
                
                // Get user name from Firebase profile or localStorage with user-specific key
                const userNameKey = `dermin_user_name_${user.uid}`
                const savedUserName = localStorage.getItem(userNameKey) || user.displayName
                
                if (!hasSeenIntro) {
                    setShowIntro(true)
                } else if (savedUserName) {
                    setUserName(savedUserName)
                }
            } else {
                // Kullanıcı giriş yapmamış veya email verify edilmemiş
                navigate('/login')
            }
        })

        return () => unsubscribe()
    }, [navigate])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleIntroComplete = async (name) => {
        if (currentUser) {
            const userIntroKey = `dermin_intro_completed_${currentUser.uid}`
            const userNameKey = `dermin_user_name_${currentUser.uid}`
            
            try {
                // Update Firebase profile
                await updateProfile(currentUser, {
                    displayName: name
                });
                
                setUserName(name)
                setShowIntro(false)
                localStorage.setItem(userIntroKey, 'true')
                localStorage.setItem(userNameKey, name)
            } catch (error) {
                console.error('Error updating profile:', error)
                // Fallback to localStorage only
                setUserName(name)
                setShowIntro(false)
                localStorage.setItem(userIntroKey, 'true')
                localStorage.setItem(userNameKey, name)
            }
        }
    }

    const handleUserNameChange = async (newName) => {
        if (currentUser) {
            const userNameKey = `dermin_user_name_${currentUser.uid}`
            
            try {
                // Update Firebase profile
                await updateProfile(currentUser, {
                    displayName: newName
                });
                
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

    if (showIntro) {
        return <IntroPage onComplete={handleIntroComplete} />
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
