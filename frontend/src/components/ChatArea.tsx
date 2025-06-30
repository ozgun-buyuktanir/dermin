
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
}

const ChatArea = ({ messages }: ChatAreaProps) => {
  return (
    <div className="flex-1 bg-transparent">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#8a8b9a] to-[#9a9bb5] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">D</span>
              </div>
              <h2 className="text-3xl font-bold text-[#5a5b6b] mb-4 tracking-tight">
                Welcome to Dermin AI
              </h2>
              <p className="text-[#7a7b8a] max-w-md leading-relaxed font-normal">
                I'm your AI assistant powered by advanced technology. I can help you with analysis, creative writing, problem-solving, and much more. How can I assist you today?
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatArea;
