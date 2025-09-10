import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TestTube, Play } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CodeEditor from '../CodeEditor';

interface TestGenerationResult {
  testCase: {
    id: string;
    testCode: string;
    framework: string;
    coverage: number;
    totalTests: number;
  };
  statistics: {
    total: number;
    positive: number;
    negative: number;
  };
}

export default function TestGeneratorModule() {
  const [framework, setFramework] = useState('unittest');
  const [inputType, setInputType] = useState('code');
  const [input, setInput] = useState(`class UserManager:
    def __init__(self):
        self.users = {}
    
    def create_user(self, username, email, password):
        if username in self.users:
            raise ValueError("Username already exists")
        
        if not email or "@" not in email:
            raise ValueError("Invalid email format")
        
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        self.users[username] = {
            "email": email,
            "password": password,
            "active": True
        }
        return True
    
    def get_user(self, username):
        return self.users.get(username)`);
  const [testCode, setTestCode] = useState('');
  const [statistics, setStatistics] = useState({ total: 0, positive: 0, negative: 0 });
  const [coverage, setCoverage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTestsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tests/generate', {
        code: input,
        framework,
        inputType,
      });
      return response.json() as Promise<TestGenerationResult>;
    },
    onSuccess: (data) => {
      setTestCode(data.testCase.testCode);
      setStatistics(data.statistics);
      setCoverage(data.testCase.coverage || 0);
      queryClient.invalidateQueries({ queryKey: ['/api/code-snippets'] });
      toast({
        title: "Test cases generated successfully",
        description: `Generated ${data.statistics.total} test cases with ${data.testCase.coverage || 0}% coverage`,
      });
    },
    onError: (error) => {
      toast({
        title: "Test generation failed",
        description: error instanceof Error ? error.message : "Failed to generate test cases",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please provide code or requirements to generate test cases",
        variant: "destructive",
      });
      return;
    }
    generateTestsMutation.mutate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="test-generator-module">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Automated Test Case Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="framework">Test Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger data-testid="select-framework">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unittest">unittest (Python)</SelectItem>
                  <SelectItem value="pytest">pytest (Python)</SelectItem>
                  <SelectItem value="jest">Jest (JavaScript)</SelectItem>
                  <SelectItem value="mocha">Mocha (JavaScript)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Input Source</Label>
              <RadioGroup value={inputType} onValueChange={setInputType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="code" id="code" />
                  <Label htmlFor="code">Code</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="requirements" id="requirements" />
                  <Label htmlFor="requirements">Requirements</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="input">
                {inputType === 'code' ? 'Code to Test' : 'Requirements Description'}
              </Label>
              <Textarea
                id="input"
                className="code-editor min-h-[250px] font-mono"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputType === 'code'
                    ? "Paste your code or describe the functionality to generate test cases..."
                    : "Describe the requirements or functionality to generate test cases..."
                }
                data-testid="textarea-input"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateTestsMutation.isPending || !input.trim()}
              className="w-full"
              data-testid="button-generate-tests"
            >
              {generateTestsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Generate Test Cases
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
            <div className="flex items-center justify-between">
              <CardTitle>Generated Test Cases</CardTitle>
              {coverage > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Coverage:</span>
                  <span className="text-xs font-medium text-chart-2" data-testid="text-coverage">
                    {coverage}%
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {testCode ? (
              <div className="space-y-4">
                <CodeEditor
                  code={testCode}
                  language={framework.includes('python') || framework === 'unittest' || framework === 'pytest' ? 'python' : 'javascript'}
                  title="Generated Tests"
                  showControls={true}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-foreground" data-testid="text-total-tests">
                      {statistics.total}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Tests</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-chart-2" data-testid="text-positive-tests">
                      {statistics.positive}
                    </div>
                    <div className="text-xs text-muted-foreground">Positive Cases</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-chart-3" data-testid="text-negative-tests">
                      {statistics.negative}
                    </div>
                    <div className="text-xs text-muted-foreground">Edge Cases</div>
                  </div>
                </div>

                <Button className="w-full" variant="secondary" data-testid="button-run-tests">
                  <Play className="mr-2 h-4 w-4" />
                  Run Tests
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Provide code or requirements to generate comprehensive test cases</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
