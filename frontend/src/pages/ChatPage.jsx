import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Loader } from 'lucide-react';
import ChatArea from '../components/ChatArea';
import MessageInput from '../components/MessageInput';
import authService from '../services/authService';
import dataService from '../services/dataService';

function ChatPage() {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const initializeChat = async () => {
            try {
                // Check authentication
                if (!authService.isAuthenticated()) {
                    navigate('/login');
                    return;
                }

                // Load analysis data if analysisId is provided
                if (analysisId) {
                    const analysisData = await dataService.getAnalysis(analysisId);
                    setAnalysis(analysisData);
                    
                    // Load chat history
                    const chatHistory = await dataService.getChatHistory(analysisId);
                    if (chatHistory && chatHistory.length > 0) {
                        const formattedMessages = chatHistory.flatMap((chat, chatIndex) => 
                            chat.messages.map((msg, msgIndex) => ({
                                id: chatIndex * 100 + msgIndex,
                                text: msg.content,
                                sender: msg.role === 'user' ? 'user' : 'ai',
                                timestamp: new Date(msg.timestamp).toLocaleTimeString('tr-TR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })
                            }))
                        );
                        setMessages(formattedMessages);
                    }
                } else {
                    // General chat mode - add welcome message
                    setMessages([
                        {
                            id: 0,
                            text: 'Merhaba! Ben Dermin AI asistanıyım. Cilt sağlığınız hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?',
                            sender: 'ai',
                            timestamp: new Date().toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })
                        }
                    ]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Chat initialization error:', err);
                setError('Chat yüklenirken bir hata oluştu.');
                setLoading(false);
            }
        };

        initializeChat();
    }, [analysisId, navigate]);

    const handleSendMessage = async (content) => {
        if (!content.trim()) return;

        // Add user message immediately
        const userMessage = {
            id: Date.now(),
            text: content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            let response;
            
            if (analysisId) {
                // Chat with specific analysis
                response = await dataService.chatWithAnalysis(analysisId, content);
            } else {
                // General chat
                response = await dataService.sendGeneralMessage(content);
            }

            // Add AI response
            const aiMessage = {
                id: Date.now() + 1,
                text: response.response || response.message || 'Üzgünüm, bir hata oluştu.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Message send error:', err);
            
            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Üzgünüm, mesajınızı işlerken bir hata oluştu. Lütfen tekrar deneyin.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#132D46] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 text-[#90BE6D] animate-spin mx-auto mb-4" />
                    <p className="text-gray-300">Chat yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#132D46] flex items-center justify-center">
                <div className="text-center">
                    <Bot className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-[#778DA9] text-white rounded-lg hover:bg-[#90BE6D] transition-colors"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#132D46]">
            {/* Header */}
            <div className="bg-[#132D46]/80 backdrop-blur-sm border-b border-[#778DA9]/20 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#0D1B2A]/50 rounded-lg transition-all duration-200"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#778DA9] to-[#90BE6D] rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-100">
                                {analysisId ? 'Analiz Sohbeti' : 'Dermin AI Asistanı'}
                            </h1>
                            {analysis && (
                                <p className="text-sm text-gray-400">
                                    {new Date(analysis.created_at).toLocaleDateString('tr-TR')} analizi
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Content */}
            <div className="flex flex-col h-[calc(100vh-80px)]">
                <ChatArea messages={messages} isTyping={isTyping} />
                <MessageInput 
                    onSendMessage={handleSendMessage} 
                    disabled={isTyping}
                    showImageUpload={false}
                />
            </div>
        </div>
    );
}

export default ChatPage;
