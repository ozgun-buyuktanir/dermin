
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "./ui/scroll-area";
import ChatBubble from "./ChatBubble";

interface Message {
  id: number;
  text?: string;
  content?: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string;
}

interface ChatAreaProps {
  messages: Message[];
  isTyping?: boolean;
}

const ChatArea = ({ messages, isTyping = false }: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 bg-transparent h-full">
      <ScrollArea className="h-full custom-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#778DA9] to-[#90BE6D] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">D</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-100 mb-4 tracking-tight">
                Dermin AI Asistanı
              </h2>
              <p className="text-[#90BE6D] max-w-md leading-relaxed font-normal">
                Cilt analiziniz hakkında sorularınızı yanıtlayabilirim. 
                Nasıl yardımcı olabilirim?
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#778DA9] to-[#90BE6D] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-medium">D</span>
                  </div>
                  <div className="bg-[#132D46]/50 text-gray-100 border border-[#778DA9]/20 rounded-2xl px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#90BE6D] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-[#90BE6D] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-[#90BE6D] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="text-sm text-gray-300 ml-2">Yazıyor...</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatArea;
