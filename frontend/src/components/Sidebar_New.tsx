import React from 'react';
import { Plus, MessageSquare, MoreHorizontal } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface SidebarProps {
  conversations?: Conversation[];
  activeConversationId?: string;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations = [],
  activeConversationId = '',
  onNewChat = () => {},
  onSelectConversation = () => {},
}) => {
  return (
    <div className="w-72 bg-white/70 backdrop-blur-sm border-r border-[#c8c9d4]/30 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#c8c9d4]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#8a8b9a] to-[#9a9bb5] rounded flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="font-medium text-[#5a5b6b]">Dermin AI</span>
          </div>
          <button className="p-1 hover:bg-[#f5f5f8]/60 rounded transition-colors">
            <MoreHorizontal size={16} className="text-[#6a6b7a]" />
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-white/80 hover:bg-white hover:shadow-md border border-[#c8c9d4]/40 text-[#5a5b6b] px-3 py-2.5 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
        >
          <Plus size={16} />
          Start new chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-1 group ${
                  activeConversationId === conversation.id
                    ? 'bg-white/90 shadow-sm border border-[#c8c9d4]/40 backdrop-blur-sm'
                    : 'hover:bg-white/60 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={14}
                    className={`mt-1 flex-shrink-0 ${
                      activeConversationId === conversation.id
                        ? 'text-[#8a8b9a]'
                        : 'text-[#6a6b7a]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#5a5b6b] text-sm truncate leading-tight">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-[#7a7b8a] mt-1 line-clamp-2 leading-relaxed">
                      {conversation.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <MessageSquare size={24} className="text-[#9a9bb5] mb-3" />
              <p className="text-[#7a7b8a] text-sm text-center">
                No conversations yet.
                <br />
                Start a new chat to begin!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
