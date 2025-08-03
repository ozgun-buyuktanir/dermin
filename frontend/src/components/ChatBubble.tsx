
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "../lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: number;
  text?: string;
  content?: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string;
}

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === "user";
  const messageContent = message.text || message.content || "";

  return (
    <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-[#778DA9] to-[#90BE6D] text-white text-sm font-medium">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[85%]", isUser && "items-end")}>
        <div className={cn("mb-1 text-sm font-medium", isUser ? "text-right" : "text-left")}>
          <span className="text-gray-300">
            {isUser ? 'Siz' : 'Dermin AI'}
          </span>
        </div>
        
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm border",
            isUser
              ? "bg-gradient-to-r from-[#778DA9] to-[#90BE6D] text-white border-[#90BE6D]/30"
              : "bg-[#132D46]/50 text-gray-100 border-[#778DA9]/20"
          )}
        >
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Uploaded content"
                className="max-w-full h-auto rounded-lg border border-[#778DA9]/20 shadow-sm"
              />
            </div>
          )}
          
          {isUser ? (
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
              {messageContent}
            </div>
          ) : (
            <div className="text-[15px] leading-relaxed font-normal prose prose-sm max-w-none prose-invert">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements with dark theme
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-100 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-100 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-medium text-gray-100 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-200 mb-2 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-gray-200 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-gray-200 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-200 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-[#90BE6D]" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-100" {...props} />,
                  code: ({node, ...props}: any) => {
                    const { children, className } = props;
                    const isInline = className?.includes('inline') || !className?.includes('language-');
                    return isInline ? (
                      <code className="bg-[#0D1B2A] text-[#90BE6D] px-1 py-0.5 rounded text-sm font-mono border border-[#778DA9]/20" {...props} />
                    ) : (
                      <code className="block bg-[#0D1B2A] text-[#90BE6D] p-2 rounded text-sm font-mono overflow-x-auto border border-[#778DA9]/20" {...props} />
                    );
                  },
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#90BE6D] pl-4 italic text-gray-300 mb-2" {...props} />,
                }}
              >
                {messageContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className={cn("text-xs text-gray-400 mt-1", isUser ? "text-right" : "text-left")}>
          {message.timestamp}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-[#132D46] to-[#0D1B2A] text-[#90BE6D] text-sm font-medium border border-[#778DA9]/20">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatBubble;
