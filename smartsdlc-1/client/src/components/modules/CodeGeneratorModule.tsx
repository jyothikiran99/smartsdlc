import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CodeEditor from '../CodeEditor';

interface CodeGenerationResult {
  codeSnippet: {
    id: string;
    generatedCode: string;
    language: string;
  };
  suggestions: string[];
}

export default function CodeGeneratorModule() {
  const [language, setLanguage] = useState('python');
  const [framework, setFramework] = useState('');
  const [description, setDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/code/generate', {
        language,
        framework: framework || undefined,
        description,
      });
      return response.json() as Promise<CodeGenerationResult>;
    },
    onSuccess: (data) => {
      setGeneratedCode(data.codeSnippet.generatedCode);
      setSuggestions(data.suggestions || []);
      queryClient.invalidateQueries({ queryKey: ['/api/code-snippets'] });
      toast({
        title: "Code generated successfully",
        description: "Your code has been generated and is ready to use",
      });
    },
    onError: (error) => {
      toast({
        title: "Code generation failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what you want to build",
        variant: "destructive",
      });
      return;
    }
    generateCodeMutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="code-generator-module">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Natural Language to Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Programming Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="framework">Framework (Optional)</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger data-testid="select-framework">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue.js</SelectItem>
                  <SelectItem value="django">Django</SelectItem>
                  <SelectItem value="flask">Flask</SelectItem>
                  <SelectItem value="express">Express.js</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Describe what you want to build</Label>
              <Textarea
                id="description"
                className="code-editor min-h-[200px]"
                placeholder="Example: Create a REST API endpoint that validates user authentication, accepts JSON data, and returns a JWT token with user information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="textarea-description"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateCodeMutation.isPending || !description.trim()}
              className="w-full"
              data-testid="button-generate-code"
            >
              {generateCodeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Code
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
            <CardTitle>Generated Code</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedCode ? (
              <div className="space-y-4">
                <CodeEditor
                  code={generatedCode}
                  language={language}
                  showControls={true}
                />

                {suggestions.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">AI Suggestions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} data-testid={`suggestion-${index}`}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wand2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Describe your requirements to generate code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
