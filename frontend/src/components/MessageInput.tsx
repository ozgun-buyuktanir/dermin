
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SendHorizontal, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-[#c8c9d4]/30 bg-white/60 backdrop-blur-sm p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-white/80 backdrop-blur-sm border border-[#c8c9d4]/40 rounded-2xl shadow-sm focus-within:shadow-md transition-all duration-200">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="min-h-[60px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#5a5b6b] placeholder:text-[#8a8b9a] font-normal rounded-2xl pr-20 bg-transparent"
              style={{ height: "60px" }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                className="p-2 text-[#6a6b7a] hover:text-[#5a5b6b] hover:bg-[#f5f5f8]/60 rounded-lg transition-all duration-200"
                title="Attach file (coming soon)"
              >
                <Paperclip size={16} />
              </button>
              
              <Button
                type="submit"
                disabled={!message.trim()}
                className="p-2 bg-gradient-to-r from-[#8a8b9a] to-[#9a9bb5] hover:from-[#7a7b8a] hover:to-[#8a8b9a] disabled:from-[#c8c9d4] disabled:to-[#d7d8e0] disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-sm h-auto"
              >
                <SendHorizontal size={16} />
              </Button>
            </div>
          </div>
        </form>
        
        <p className="text-xs text-[#7a7b8a] mt-3 text-center font-normal">
          Dermin can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
