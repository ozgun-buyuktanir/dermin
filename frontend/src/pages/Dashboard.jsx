import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import MessageInput from '../components/MessageInput'

function Dashboard() {
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [conversations, setConversations] = useState([])
    const [activeConversationId, setActiveConversationId] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        // Auth state değişikliklerini dinle
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.emailVerified) {
                setCurrentUser(user)
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

    const handleNewChat = () => {
        const newConversationId = `conv_${Date.now()}`
        setActiveConversationId(newConversationId)
        setMessages([])
        
        // Add to conversations list
        const newConversation = {
            id: newConversationId,
            title: 'New conversation',
            timestamp: new Date().toISOString(),
            preview: 'Start a new conversation...'
        }
        setConversations(prev => [newConversation, ...prev])
    }

    const handleSelectConversation = (conversationId) => {
        setActiveConversationId(conversationId)
        // In a real app, you would load messages for this conversation
        setMessages([])
    }

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleSendMessage = (message) => {
        if (message.trim()) {
            // Create a new conversation if none is active
            let currentConvId = activeConversationId;
            if (!currentConvId) {
                currentConvId = `conv_${Date.now()}`;
                setActiveConversationId(currentConvId);
                
                const newConversation = {
                    id: currentConvId,
                    title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
                    timestamp: new Date().toISOString(),
                    preview: message.slice(0, 50) + (message.length > 50 ? '...' : '')
                };
                setConversations(prev => [newConversation, ...prev]);
            }

            const newMessage = {
                id: Date.now(),
                content: message,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString()
            }
            setMessages(prev => [...prev, newMessage])

            // Update conversation preview if conversation exists
            if (currentConvId) {
                setConversations(prev => 
                    prev.map(conv => 
                        conv.id === currentConvId 
                            ? { 
                                ...conv, 
                                preview: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                                title: conv.title === 'New conversation' ? message.slice(0, 30) + (message.length > 30 ? '...' : '') : conv.title,
                                timestamp: new Date().toISOString()
                            }
                            : conv
                    )
                )
            }

            // Simulated AI response
            setTimeout(() => {
                const aiResponse = {
                    id: Date.now() + 1,
                    content: `Thanks for your message: "${message}". This is a simulated response from Dermin AI.`,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString()
                }
                setMessages(prev => [...prev, aiResponse])
            }, 1000)
        }
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

    return (
        <div className="h-screen bg-gradient-to-br from-[#d7d8e0] via-[#e6e7ed] to-[#d7d8e0] flex flex-col">
            <TopBar onToggleSidebar={handleToggleSidebar} onLogout={handleLogout} />
            
            <div className="flex-1 flex overflow-hidden">
                <Sidebar 
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onNewChat={handleNewChat}
                    onSelectConversation={handleSelectConversation}
                />
                
                <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
                    <ChatArea messages={messages} />
                    <MessageInput onSendMessage={handleSendMessage} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
