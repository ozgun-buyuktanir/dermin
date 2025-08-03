import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Stethoscope, 
  Heart, 
  MessageCircle, 
  Bot,
  Eye,
  FileText,
  Sparkles,
  Camera,
  X,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatArea from './ChatArea';
import MessageInput from './MessageInput';

const AnalysisResult = ({ analysisData, isLoading = false, onNewAnalysis }) => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] flex items-center justify-center z-50">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#90BE6D] rounded-full mx-auto mb-4"></div>
          <p className="text-[#90BE6D] text-lg">Analiz sonuçları yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (!analysisData?.result) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] flex items-center justify-center z-50">
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl">Analiz sonucu bulunamadı</p>
        </div>
      </div>
    );
  }

  const { result } = analysisData;
  const { predictions = [], ai_explanation = {}, processing_time, model_info } = result;
  const explanation = ai_explanation.explanation || {};

  // Chat açıldığında başlangıç mesajını ekle
  React.useEffect(() => {
    if (showChat && messages.length === 0) {
      const detectedIssues = predictions.map(p => p.class_name || 'Bilinmeyen sorun').join(', ');
      const hasRecommendations = explanation.recommendations?.length > 0;
      const hasDoctorConsultation = explanation.doctor_consultation;
      
      const welcomeMessage = {
        id: 1,
        content: `Merhaba! Ben Dermin AI asistanınızım. Cilt analizinizle ilgili sorularınızı yanıtlayabilirim.

**🔍 Analizinizin Özeti:**
${predictions.length > 0 ? `- **Tespit edilen sorunlar:** ${detectedIssues}` : '- Herhangi bir sorun tespit edilmedi'}
- **AI değerlendirme:** ${ai_explanation.success ? '✅ Başarıyla tamamlandı' : '⚠️ Kısmen tamamlandı'}
${hasRecommendations ? `- **Öneriler:** ${explanation.recommendations.length} adet özel öneri hazırlandı` : ''}
${hasDoctorConsultation ? '- **⚠️ Doktor kontrolü öneriliyor**' : ''}

**💬 Soru örnekleri:**
- "Bu sorunlar ne kadar ciddi?"
- "Önerdiğiniz ürünler neler?"
- "Ne zaman doktora gitmeliyim?"
- "Günlük bakım rutinimde nelere dikkat etmeliyim?"

Size nasıl yardımcı olabilirim?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([welcomeMessage]);
    }
    
    // Chat kapatıldığında mesajları temizle
    if (!showChat) {
      setMessages([]);
    }
  }, [showChat, predictions, ai_explanation.success, explanation]);

  const handleSendMessage = async (content) => {
    const newMessage = {
      id: messages.length + 1,
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Get analysis ID from localStorage or props
      const analysisId = localStorage.getItem('current_analysis_id') || 'temp';
      
      const response = await fetch(`http://localhost:8000/api/chat/analysis/${analysisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content,
          analysis_data: {
            predictions: predictions,
            ai_explanation: explanation,
            general_condition: explanation.general_condition,
            recommendations: explanation.recommendations,
            doctor_consultation: explanation.doctor_consultation,
            lifestyle_advice: explanation.lifestyle_advice
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: messages.length + 2,
          content: data.response,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Chat response failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        content: 'Üzgünüm, şu anda AI sisteminde bir sorun var. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#132D46] to-[#0D1B2A] text-white overflow-auto">
      <div className="w-full h-full p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-100">Cilt Analizi Tamamlandı</h1>
                <div className="flex items-center gap-4 text-sm text-[#90BE6D] mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {processing_time}s
                  </span>
                  <span>{predictions.length} tespit</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                showChat 
                  ? 'bg-[#90BE6D] border-[#90BE6D] text-white' 
                  : 'bg-transparent border-[#778DA9] text-[#778DA9] hover:bg-[#778DA9]/20'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              {showChat ? 'Analizi Göster' : 'Soru Sor'}
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showChat ? (
            /* Chat Interface */
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl overflow-hidden analysis-container flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#132D46] to-[#0D1B2A] p-4 border-b border-[#778DA9]/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#90BE6D]" />
                  <h3 className="font-semibold text-gray-100">Analiz Asistanı</h3>
                  <span className="text-sm text-gray-400">• Analiziniz hakkında soru sorun</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatArea messages={messages} isTyping={isTyping} />
              </div>
              <div className="border-t border-[#778DA9]/20 flex-shrink-0 p-4">
                <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} showImageUpload={false} />
              </div>
            </motion.div>
          ) : (
            /* Analysis Results - New Layout */
            <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 analysis-container"
            >
              {/* Left Column - Image and Detected Issues */}
              <div className="lg:col-span-4 space-y-4 analysis-column custom-scrollbar">
                {/* Image */}
                {analysisData.image_url && (
                  <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                      <Camera className="h-5 w-5 text-[#90BE6D]" />
                      Analiz Edilen Görsel
                    </h3>
                    <div className="relative w-full h-48 bg-[#132D46]/30 rounded-xl border border-[#778DA9]/20 overflow-hidden">
                      <img
                        src={analysisData.image_url}
                        alt="Analyzed skin"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Detected Issues */}
                {predictions.length > 0 && (
                  <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                      <Eye className="h-5 w-5 text-[#90BE6D]" />
                      Tespit Edilen Sorunlar
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {predictions.map((prediction, index) => (
                        <div key={index} className="bg-[#132D46]/50 border border-[#778DA9]/20 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-100 text-sm">
                              {prediction.class_name || 'Bilinmeyen'}
                            </h4>
                            <Badge 
                              className={`text-xs ${
                                prediction.confidence > 0.7 
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              }`}
                            >
                              %{Math.round(prediction.confidence * 100)}
                            </Badge>
                          </div>
                          {prediction.bbox && (
                            <p className="text-xs text-gray-400">
                              Konum: X:{prediction.bbox.x}, Y:{prediction.bbox.y}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                    <FileText className="h-5 w-5 text-[#90BE6D]" />
                    Teknik Detaylar
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-gray-100">{model_info?.model_name || 'YOLO v8'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">İşlem Süresi:</span>
                      <span className="text-gray-100">{processing_time}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tespit Sayısı:</span>
                      <span className="text-gray-100">{predictions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Açıklama:</span>
                      <span className="text-[#90BE6D]">{ai_explanation.success ? 'Aktif' : 'Pasif'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - AI Expert Evaluation (Main Focus) */}
              <div className="lg:col-span-5 analysis-column custom-scrollbar">
                {explanation.full_explanation && (
                  <div className="bg-gradient-to-br from-[#0D1B2A]/70 via-[#132D46]/60 to-[#0D1B2A]/70 backdrop-blur-sm border border-[#90BE6D]/30 rounded-2xl p-6 h-full flex flex-col">
                    <h3 className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-100 mb-6 text-center flex-shrink-0">
                      <Sparkles className="h-7 w-7 text-[#90BE6D]" />
                      AI Uzman Değerlendirmesi
                    </h3>
                    <div className="prose prose-lg max-w-none prose-invert text-center flex-1 overflow-y-auto custom-scrollbar pr-2">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for markdown elements with enhanced dark theme
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-[#90BE6D] mb-4 text-center" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-100 mb-3 text-center border-b border-[#778DA9]/20 pb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-medium text-gray-100 mb-2 text-center" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-md font-medium text-[#90BE6D] mb-2" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-200 mb-4 leading-relaxed text-justify" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-200 space-y-2 text-left ml-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-200 space-y-2 text-left ml-4" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-200 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-[#90BE6D]" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-100 font-medium" {...props} />,
                          code: ({node, children, className, ...props}) => {
                            const isInline = className?.includes('inline') || !className?.includes('language-');
                            return isInline ? (
                              <code className="bg-[#0D1B2A] text-[#90BE6D] px-2 py-1 rounded-md text-sm font-mono border border-[#778DA9]/20" {...props} />
                            ) : (
                              <code className="block bg-[#0D1B2A] text-[#90BE6D] p-4 rounded-lg text-sm font-mono overflow-x-auto border border-[#778DA9]/20 mb-4" {...props} />
                            );
                          },
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#90BE6D] pl-6 italic text-gray-300 mb-4 bg-[#132D46]/30 py-2 rounded-r-lg" {...props} />,
                          table: ({node, ...props}) => <table className="w-full border-collapse border border-[#778DA9]/20 mb-4 text-center" {...props} />,
                          th: ({node, ...props}) => <th className="border border-[#778DA9]/20 px-3 py-2 bg-[#132D46]/50 text-[#90BE6D] font-semibold" {...props} />,
                          td: ({node, ...props}) => <td className="border border-[#778DA9]/20 px-3 py-2 text-gray-200" {...props} />,
                          hr: ({node, ...props}) => <hr className="border-t border-[#778DA9]/30 my-6" {...props} />,
                        }}
                      >
                        {explanation.full_explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Recommendations and Actions */}
              <div className="lg:col-span-3 space-y-4 analysis-column custom-scrollbar relative">
                {/* General Condition */}
                {explanation.general_condition && (
                  <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#90BE6D]/30 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                      <CheckCircle className="h-5 w-5 text-[#90BE6D]" />
                      Genel Durum
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{explanation.general_condition}</p>
                  </div>
                )}

                {/* Recommendations */}
                {explanation.recommendations?.length > 0 && (
                  <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                      <Heart className="h-5 w-5 text-[#90BE6D]" />
                      Öneriler
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {explanation.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-[#90BE6D] mt-1 font-bold">•</span>
                          <span className="text-gray-300 leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Consultation */}
                {explanation.doctor_consultation && (
                  <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-red-300 mb-3">
                      <Stethoscope className="h-5 w-5" />
                      Doktor Kontrolü
                    </h3>
                    <p className="text-red-200 text-sm leading-relaxed font-medium">
                      {explanation.doctor_consultation}
                    </p>
                  </div>
                )}

                {/* Lifestyle Advice */}
                {explanation.lifestyle_advice && (
                  <div className="bg-[#0D1B2A]/50 backdrop-blur-sm border border-[#778DA9]/20 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-3">
                      <Heart className="h-5 w-5 text-[#90BE6D]" />
                      Yaşam Tarzı
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{explanation.lifestyle_advice}</p>
                  </div>
                )}

                {/* New Analysis Button - Fixed at bottom right */}
                <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent pb-4">
                  <div className="flex justify-end">
                    <button
                      onClick={onNewAnalysis}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-white rounded-xl font-semibold hover:from-[#90BE6D] hover:to-[#778DA9] transition-all duration-300 shadow-lg border border-[#90BE6D]/30 backdrop-blur-sm"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Tekrar Analiz Et
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx="true" global="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(119, 141, 169, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(144, 190, 109, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(144, 190, 109, 0.9);
        }
        
        /* Hide scrollbar for Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(144, 190, 109, 0.6) rgba(119, 141, 169, 0.1);
        }
        
        /* Additional styling for the main container */
        .analysis-container {
          height: calc(100vh - 140px);
          overflow: hidden;
        }
        
        .analysis-column {
          height: 100%;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default AnalysisResult;
