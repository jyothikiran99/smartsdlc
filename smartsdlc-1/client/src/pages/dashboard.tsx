import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Save } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/sidebar';
import FloatingChatbot from '@/components/FloatingChatbot';
import RequirementsModule from '@/components/modules/RequirementsModule';
import CodeGeneratorModule from '@/components/modules/CodeGeneratorModule';
import BugFixerModule from '@/components/modules/BugFixerModule';
import TestGeneratorModule from '@/components/modules/TestGeneratorModule';
import CodeSummarizerModule from '@/components/modules/CodeSummarizerModule';

const moduleInfo = {
  'requirements': {
    title: 'PDF Requirements Upload & Classification',
    description: 'Upload PDF documents and let AI classify requirements into SDLC phases'
  },
  'code-generator': {
    title: 'AI Code Generator',
    description: 'Transform natural language descriptions into production-ready code'
  },
  'bug-fixer': {
    title: 'Intelligent Bug Fixer',
    description: 'Detect and automatically fix bugs in Python and JavaScript code'
  },
  'test-generator': {
    title: 'Automated Test Case Generator',
    description: 'Generate comprehensive test cases using standard testing frameworks'
  },
  'code-summarizer': {
    title: 'Code Documentation & Summarizer',
    description: 'Generate human-readable documentation and code explanations'
  }
};

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState('requirements');
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleSaveProject = () => {
    toast({
      title: "Project saved",
      description: "Your current project has been saved successfully",
    });
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'requirements':
        return <RequirementsModule />;
      case 'code-generator':
        return <CodeGeneratorModule />;
      case 'bug-fixer':
        return <BugFixerModule />;
      case 'test-generator':
        return <TestGeneratorModule />;
      case 'code-summarizer':
        return <CodeSummarizerModule />;
      default:
        return <RequirementsModule />;
    }
  };

  const currentModuleInfo = moduleInfo[activeModule as keyof typeof moduleInfo];

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="dashboard">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground" data-testid="text-module-title">
                {currentModuleInfo.title}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-module-description">
                {currentModuleInfo.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSaveProject} data-testid="button-save-project">
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderModule()}
        </div>
      </main>

      <FloatingChatbot />
    </div>
  );
}
