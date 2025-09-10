import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CodeEditor from '../CodeEditor';

interface BugFixResult {
  codeSnippet: {
    id: string;
    code: string;
    generatedCode: string;
    language: string;
  };
  issues: string[];
  optimizations: string[];
}

export default function BugFixerModule() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(`def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total / len(numbers)

# Example usage
scores = [85, 92, 78, 96, 87]
average = calculate_average(scores)
print(f"Average score: {average}")`);
  const [fixedCode, setFixedCode] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fixBugsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/code/fix', {
        code,
        language,
      });
      return response.json() as Promise<BugFixResult>;
    },
    onSuccess: (data) => {
      setFixedCode(data.codeSnippet.generatedCode);
      setIssues(data.issues || []);
      setOptimizations(data.optimizations || []);
      queryClient.invalidateQueries({ queryKey: ['/api/code-snippets'] });
      toast({
        title: "Code analysis completed",
        description: `Found ${data.issues?.length || 0} issues and applied ${data.optimizations?.length || 0} optimizations`,
      });
    },
    onError: (error) => {
      toast({
        title: "Bug fixing failed",
        description: error instanceof Error ? error.message : "Failed to analyze code",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "Code required",
        description: "Please paste your code for analysis",
        variant: "destructive",
      });
      return;
    }
    fixBugsMutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="bug-fixer-module">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bug Detection & Code Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="code">Paste your buggy code</Label>
              <Textarea
                id="code"
                className="code-editor min-h-[300px] font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for AI analysis and bug fixing..."
                data-testid="textarea-code"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={fixBugsMutation.isPending || !code.trim()}
              className="w-full"
              data-testid="button-analyze-bugs"
            >
              {fixBugsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze & Fix Bugs
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
            <CardTitle>Fixed & Optimized Code</CardTitle>
          </CardHeader>
          <CardContent>
            {fixedCode ? (
              <div className="space-y-4">
                <CodeEditor
                  code={fixedCode}
                  language={language}
                  title="Fixed Code"
                  showControls={true}
                />

                {issues.length > 0 && (
                  <Alert className="border-destructive/20 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription>
                      <h4 className="font-medium text-destructive mb-2">Issues Found</h4>
                      <ul className="text-sm text-destructive space-y-1">
                        {issues.map((issue, index) => (
                          <li key={index} data-testid={`issue-${index}`}>• {issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {optimizations.length > 0 && (
                  <Alert className="border-chart-2/20 bg-chart-2/10">
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    <AlertDescription>
                      <h4 className="font-medium text-chart-2 mb-2">Optimizations Applied</h4>
                      <ul className="text-sm text-chart-2 space-y-1">
                        {optimizations.map((optimization, index) => (
                          <li key={index} data-testid={`optimization-${index}`}>• {optimization}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Paste your code to detect bugs and optimize it</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
