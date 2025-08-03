
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SendHorizontal, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  showImageUpload?: boolean;
}

const MessageInput = ({ onSendMessage, disabled = false, showImageUpload = true }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

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
    <div className="bg-[#0D1B2A]/30 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-[#132D46]/50 backdrop-blur-sm border border-[#778DA9]/30 rounded-xl shadow-sm focus-within:shadow-md transition-all duration-200">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              placeholder={disabled ? "AI yanıt yazıyor..." : "Analiziniz hakkında soru sorun..."}
              className="min-h-[60px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-200 placeholder:text-gray-400 font-normal rounded-xl pr-20 bg-transparent disabled:opacity-50"
              style={{ height: "60px" }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {showImageUpload && (
                <button
                  type="button"
                  disabled={disabled}
                  className="p-2 text-[#778DA9] hover:text-[#90BE6D] hover:bg-[#132D46]/60 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Dosya ekle"
                >
                  <Paperclip size={16} />
                </button>
              )}
              
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="p-2 bg-gradient-to-r from-[#778DA9] to-[#90BE6D] hover:from-[#90BE6D] hover:to-[#778DA9] disabled:from-[#778DA9]/50 disabled:to-[#90BE6D]/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-sm h-auto"
              >
                <SendHorizontal size={16} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
