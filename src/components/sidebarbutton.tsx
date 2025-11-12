import { LucideIcon } from "lucide-react";

interface SidebarButtonProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }
  
  const SidebarButton = ({ 
    icon: Icon, 
    label, 
    isActive, 
    onClick 
  }: SidebarButtonProps) => {
    return (
      <button
        onClick={onClick}
        className={`
          flex w-full items-center gap-3 px-1 py-2 justify-center lg:justify-start lg:px-4 lg:py-2 rounded-xl 
          transition-all duration-200
          ${isActive ? 
            "bg-backgroundLayer1 " : 
            "bg-transparent  hover:bg-backgroundLayer1"
          }
        `}
      >
        <Icon className="w-5 h-5 text-systemGreen" />
        <span className="text-sm font-medium hidden lg:flex">
          {label}
        </span>
      </button>
    );
  };

export default  SidebarButton;