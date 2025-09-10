import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileUp, 
  Code, 
  Bug, 
  TestTube, 
  FileText, 
  History, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: 'requirements', icon: FileUp, label: 'Requirements Upload' },
  { id: 'code-generator', icon: Code, label: 'AI Code Generator' },
  { id: 'bug-fixer', icon: Bug, label: 'Bug Fixer' },
  { id: 'test-generator', icon: TestTube, label: 'Test Case Generator' },
  { id: 'code-summarizer', icon: FileText, label: 'Code Summarizer' },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo and Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">SmartSDLC</h1>
            <p className="text-xs text-muted-foreground">AI-Enhanced SDLC</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {modules.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeModule === id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onModuleChange(id)}
              data-testid={`button-module-${id}`}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        <div className="pt-6 border-t border-border">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" data-testid="button-history">
              <History className="w-4 h-4 mr-3" />
              <span>Project History</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-settings">
              <Settings className="w-4 h-4 mr-3" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
              Developer
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              dev@company.com
            </p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
