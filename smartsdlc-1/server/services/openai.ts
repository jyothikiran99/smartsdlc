import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ClassificationItem {
  text: string;
  phase: string;
  confidence: number;
  userStory: string;
}

interface ClassificationResult {
  requirements: ClassificationItem[];
  statistics: {
    Requirements: number;
    Design: number;
    Development: number;
    Testing: number;
    Deployment: number;
  };
}

interface CodeGenerationResult {
  code: string;
  suggestions: string[];
}

interface BugFixResult {
  fixedCode: string;
  issues: string[];
  optimizations: string[];
}

interface TestGenerationResult {
  testCode: string;
  coverage: number;
  totalTests: number;
  positiveTests: number;
  negativeTests: number;
}

interface DocumentationResult {
  overview: string;
  features: string[];
  methods: Array<{
    name: string;
    description: string;
  }>;
  example: string;
}

class OpenAIService {
  async classifyRequirements(text: string): Promise<ClassificationResult> {
    try {
      const prompt = `
        Analyze the following requirements document and classify each requirement sentence into SDLC phases.
        For each sentence, determine the phase (Requirements, Design, Development, Testing, or Deployment) and generate a user story.
        
        Text to analyze:
        ${text}
        
        Respond with JSON in this exact format:
        {
          "requirements": [
            {
              "text": "original sentence",
              "phase": "Requirements|Design|Development|Testing|Deployment",
              "confidence": 85,
              "userStory": "As a user, I want to..."
            }
          ],
          "statistics": {
            "Requirements": 0,
            "Design": 0,
            "Development": 0,
            "Testing": 0,
            "Deployment": 0
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert SDLC analyst. Classify requirements into appropriate phases and generate user stories."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Calculate statistics
      const statistics = {
        Requirements: 0,
        Design: 0,
        Development: 0,
        Testing: 0,
        Deployment: 0,
      };

      result.requirements?.forEach((req: ClassificationItem) => {
        if (statistics.hasOwnProperty(req.phase)) {
          statistics[req.phase as keyof typeof statistics]++;
        }
      });

      return {
        requirements: result.requirements || [],
        statistics,
      };
    } catch (error) {
      throw new Error(`Requirements classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateCode(description: string, language: string = 'python', framework?: string): Promise<CodeGenerationResult> {
    try {
      const frameworkText = framework ? ` using the ${framework} framework` : '';
      const prompt = `
        Generate production-ready ${language} code${frameworkText} based on the following description:
        
        ${description}
        
        Respond with JSON in this exact format:
        {
          "code": "// Generated code here",
          "suggestions": [
            "suggestion 1",
            "suggestion 2"
          ]
        }
        
        Make the code clean, well-commented, and follow best practices.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer. Generate clean, production-ready code with proper error handling and best practices.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        code: result.code || '',
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fixBugs(code: string, language: string = 'python'): Promise<BugFixResult> {
    try {
      const prompt = `
        Analyze the following ${language} code for bugs, errors, and optimization opportunities.
        Fix all issues and provide the corrected code.
        
        Code to analyze:
        ${code}
        
        Respond with JSON in this exact format:
        {
          "fixedCode": "// Corrected code here",
          "issues": [
            "Issue 1 description",
            "Issue 2 description"
          ],
          "optimizations": [
            "Optimization 1 description",
            "Optimization 2 description"
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} developer and code reviewer. Identify bugs, security issues, and optimization opportunities.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        fixedCode: result.fixedCode || code,
        issues: result.issues || [],
        optimizations: result.optimizations || [],
      };
    } catch (error) {
      throw new Error(`Bug fixing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTestCases(code: string, framework: string = 'unittest', inputType: string = 'code'): Promise<TestGenerationResult> {
    try {
      const inputLabel = inputType === 'code' ? 'code' : 'requirements';
      const prompt = `
        Generate comprehensive test cases for the following ${inputLabel} using the ${framework} testing framework.
        
        ${inputLabel === 'code' ? 'Code to test:' : 'Requirements to test:'}
        ${code}
        
        Respond with JSON in this exact format:
        {
          "testCode": "// Complete test code here",
          "coverage": 95,
          "totalTests": 8,
          "positiveTests": 5,
          "negativeTests": 3
        }
        
        Include positive test cases, negative test cases, edge cases, and error handling tests.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an expert test engineer. Generate comprehensive test suites with good coverage including positive, negative, and edge cases.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        testCode: result.testCode || '',
        coverage: result.coverage || 0,
        totalTests: result.totalTests || 0,
        positiveTests: result.positiveTests || 0,
        negativeTests: result.negativeTests || 0,
      };
    } catch (error) {
      throw new Error(`Test generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async summarizeCode(code: string, style: string = 'technical'): Promise<DocumentationResult> {
    try {
      const prompt = `
        Analyze the following code and generate ${style} documentation.
        
        Code to analyze:
        ${code}
        
        Respond with JSON in this exact format:
        {
          "overview": "Brief overview of what this code does",
          "features": [
            "Feature 1",
            "Feature 2"
          ],
          "methods": [
            {
              "name": "method_name(params)",
              "description": "What this method does"
            }
          ],
          "example": "// Usage example code"
        }
        
        Make the documentation clear and ${style === 'user-guide' ? 'user-friendly' : 'technically detailed'}.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a technical writer specializing in ${style} documentation. Create clear, comprehensive documentation.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        overview: result.overview || '',
        features: result.features || [],
        methods: result.methods || [],
        example: result.example || '',
      };
    } catch (error) {
      throw new Error(`Code summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chatResponse(message: string): Promise<string> {
    try {
      const prompt = `
        You are an AI assistant specialized in Software Development Lifecycle (SDLC).
        Provide helpful, accurate answers about SDLC phases, best practices, testing, code review, requirements analysis, and software development methodologies.
        
        User question: ${message}
        
        Provide a clear, helpful response. If the question is about SDLC topics, give detailed explanations with examples.
        If it's about code or technical topics, provide practical advice.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert SDLC consultant and software development mentor. Provide helpful, accurate guidance on software development practices."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again.";
    } catch (error) {
      throw new Error(`Chat response failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openaiService = new OpenAIService();
