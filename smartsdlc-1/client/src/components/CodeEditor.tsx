import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

interface CodeEditorProps {
  code: string;
  language: string;
  showControls?: boolean;
  title?: string;
}

export default function CodeEditor({ code, language, showControls = true, title }: CodeEditorProps) {
  const { toast } = useToast();
  const { theme } = useTheme();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      sql: 'sql',
    };
    return extensions[lang.toLowerCase()] || 'txt';
  };

  return (
    <div className="relative">
      {showControls && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={copyToClipboard}
              data-testid="button-copy-code"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={downloadCode}
              data-testid="button-download-code"
            >
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      )}
      
      <div className="syntax-highlight rounded-lg overflow-x-auto">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={theme === 'dark' ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '14px',
            fontFamily: 'var(--font-mono)',
          }}
          data-testid="code-display"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
