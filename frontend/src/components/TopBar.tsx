
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Settings, HelpCircle, RotateCcw, LogOut, User, X, Check } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  onToggleSidebar: () => void;
  onLogout?: () => void;
  userName?: string;
  onUserNameChange?: (newName: string) => void;
}

const TopBar = ({ onToggleSidebar, onLogout, userName, onUserNameChange }: TopBarProps) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const handleResetIntro = () => {
    // Get current user from auth state or context
    // For now, we'll clear all intro keys (you might want to make this more specific)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dermin_intro_completed_') || key.startsWith('dermin_user_name_')) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  const handleSaveName = () => {
    if (tempName.trim() && onUserNameChange) {
      onUserNameChange(tempName.trim());
      localStorage.setItem('dermin_user_name', tempName.trim());
    }
    setEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(userName || '');
    setEditingName(false);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-1.5 h-7 w-7 hover:bg-gray-100/80"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div>
            <h1 className="text-lg font-light text-gray-800 leading-tight">
              {userName ? `Hi, ${userName}!` : 'Dermin AI'}
            </h1>
            <p className="text-xs text-gray-500 font-light leading-tight">
              {userName ? 'Ready to analyze your skin' : 'AI-Powered Skin Analysis'}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <DropdownMenu>          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full hover:bg-gray-100/80 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md"
            >
              <Avatar className="h-7 w-7 transition-all duration-200 hover:ring-2 hover:ring-gray-300/50">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xs font-medium transition-all duration-200 hover:from-gray-700 hover:to-gray-900">
                  {getUserInitials(userName || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <div className="px-2.5 py-1.5 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-900">{userName || 'User'}</p>
              </div>
              
              <DropdownMenuItem 
                className="flex items-center gap-2.5 px-2.5 py-1.5 mt-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-700">Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150"
                onClick={handleResetIntro}
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-700">Reset Welcome</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150">
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-700">Help & Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1.5 bg-gray-100" />
              
              <DropdownMenuItem 
                className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-red-50 rounded-md transition-colors duration-150"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in-0 scale-in-95 duration-200">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-light text-gray-800 mb-6">Settings</h2>

            <div className="space-y-6">
              {/* Username Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Your Name</label>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{userName || 'Not set'}</span>
                    <button
                      onClick={() => {
                        setEditingName(true);
                        setTempName(userName || '');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Preferences Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Preferences</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Notifications</span>
                    <div className="w-10 h-6 bg-gray-300 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Auto-save results</span>
                    <div className="w-10 h-6 bg-gray-800 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm translate-x-4 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Privacy</label>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="text-sm text-gray-700">Delete all analysis history</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
