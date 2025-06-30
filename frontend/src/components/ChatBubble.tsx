
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "../lib/utils";
import { Bot, User } from "lucide-react";

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
          <AvatarFallback className="bg-gradient-to-br from-[#8a8b9a] to-[#9a9bb5] text-white text-sm font-medium">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[85%]", isUser && "items-end")}>
        <div className={cn("mb-1 text-sm font-medium", isUser ? "text-right" : "text-left")}>
          <span className="text-[#5a5b6b]">
            {isUser ? 'You' : 'Dermin'}
          </span>
        </div>
        
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm",
            isUser
              ? "bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] text-white"
              : "bg-white/80 text-[#5a5b6b] border border-[#c8c9d4]/20"
          )}
        >
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Uploaded content"
                className="max-w-full h-auto rounded-lg border border-[#c8c9d4]/20 shadow-sm"
              />
            </div>
          )}
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
            {messageContent}
          </div>
        </div>
        
        <div className={cn("text-xs text-[#7a7b8a] mt-1", isUser ? "text-right" : "text-left")}>
          {message.timestamp}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-[#d7d8e0] to-[#e6e7ed] text-[#5a5b6b] text-sm font-medium">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatBubble;
