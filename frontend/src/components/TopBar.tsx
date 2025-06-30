
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
import { Settings, HelpCircle, RotateCcw, LogOut, User } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
  onLogout?: () => void;
  userName?: string;
}

const TopBar = ({ onToggleSidebar, onLogout, userName }: TopBarProps) => {
  const navigate = useNavigate();

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
    localStorage.removeItem('dermin_intro_completed');
    localStorage.removeItem('dermin_user_name');
    window.location.reload();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 h-7 w-7 hover:bg-gray-100/80"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full hover:bg-gray-100/80 transition-colors duration-200"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xs font-medium">
                  {getUserInitials(userName || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1.5 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl">
            <div className="px-2.5 py-1.5 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900">{userName || 'User'}</p>
            </div>
            
            <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-1.5 mt-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-700">Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150">
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
  );
};

export default TopBar;
