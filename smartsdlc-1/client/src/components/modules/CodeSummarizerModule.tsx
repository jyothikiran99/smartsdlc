import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CodeEditor from '../CodeEditor';

interface DocumentationResult {
  documentation: {
    id: string;
    overview: string;
    features: string[];
    methods: Array<{
      name: string;
      description: string;
    }>;
    example: string;
    style: string;
  };
}

export default function CodeSummarizerModule() {
  const [style, setStyle] = useState('technical');
  const [code, setCode] = useState(`class DatabaseConnector:
    def __init__(self, host, port, database, username, password):
        self.host = host
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.connection = None
        self.connection_pool = []
        self.max_pool_size = 10
    
    def connect(self):
        try:
            import psycopg2
            self.connection = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.username,
                password=self.password
            )
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
    
    def execute_query(self, query, params=None):
        if not self.connection:
            self.connect()
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            
            if query.strip().lower().startswith('select'):
                return cursor.fetchall()
            else:
                self.connection.commit()
                return cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            raise e
        finally:
            cursor.close()
    
    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None`);
  const [documentation, setDocumentation] = useState<DocumentationResult['documentation'] | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/code/summarize', {
        code,
        style,
      });
      return response.json() as Promise<DocumentationResult>;
    },
    onSuccess: (data) => {
      setDocumentation(data.documentation);
      queryClient.invalidateQueries({ queryKey: ['/api/code-snippets'] });
      toast({
        title: "Documentation generated successfully",
        description: "Your code has been analyzed and documented",
      });
    },
    onError: (error) => {
      toast({
        title: "Documentation generation failed",
        description: error instanceof Error ? error.message : "Failed to generate documentation",
        variant: "destructive",
      });
    },
  });

  const handleSummarize = () => {
    if (!code.trim()) {
      toast({
        title: "Code required",
        description: "Please paste your code for analysis and documentation",
        variant: "destructive",
      });
      return;
    }
    summarizeMutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="code-summarizer-module">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Documentation & Summarization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="style">Documentation Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger data-testid="select-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Summary</SelectItem>
                  <SelectItem value="user-guide">User Guide</SelectItem>
                  <SelectItem value="api">API Documentation</SelectItem>
                  <SelectItem value="comments">Code Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="code">Code to Analyze</Label>
              <Textarea
                id="code"
                className="code-editor min-h-[300px] font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for AI-powered documentation and summarization..."
                data-testid="textarea-code"
              />
            </div>

            <Button
              onClick={handleSummarize}
              disabled={summarizeMutation.isPending || !code.trim()}
              className="w-full"
              data-testid="button-generate-docs"
            >
              {summarizeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Documentation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            {documentation ? (
              <div className="space-y-6">
                {/* Overview */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">Code Overview</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-overview">
                    {documentation.overview}
                  </p>
                </div>

                {/* Key Features */}
                {documentation.features && documentation.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Key Features</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {documentation.features.map((feature, index) => (
                        <li key={index} className="flex items-start" data-testid={`feature-${index}`}>
                          <CheckCircle className="h-4 w-4 text-chart-2 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Methods Documentation */}
                {documentation.methods && documentation.methods.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Method Documentation</h4>
                    <div className="space-y-3">
                      {documentation.methods.map((method, index) => (
                        <div
                          key={index}
                          className="p-3 bg-secondary/10 rounded border-l-4 border-l-chart-1"
                          data-testid={`method-${index}`}
                        >
                          <h5 className="text-sm font-medium text-foreground">{method.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Example */}
                {documentation.example && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Usage Example</h4>
                    <CodeEditor
                      code={documentation.example}
                      language="python"
                      showControls={false}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Paste your code to generate comprehensive documentation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
