import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { pdfProcessor } from "./services/pdfProcessor";
import multer from "multer";
import { insertDocumentSchema, insertRequirementSchema, insertCodeSnippetSchema, insertTestCaseSchema, insertDocumentationSchema, insertChatMessageSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user";

  // Requirements Upload & Classification
  app.post("/api/requirements/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      const { filename, buffer } = req.file;
      
      // Validate PDF
      if (!pdfProcessor.validatePDF(buffer)) {
        return res.status(400).json({ error: "Invalid PDF file" });
      }
      
      if (!pdfProcessor.isFileSizeValid(buffer)) {
        return res.status(400).json({ error: "File size exceeds 10MB limit" });
      }

      // Extract text from PDF
      const { text, pages } = await pdfProcessor.extractText(buffer);
      
      // Save document
      const document = await storage.createDocument({
        userId: DEFAULT_USER_ID,
        filename: filename || 'uploaded.pdf',
        content: text,
      });

      // Classify requirements using OpenAI
      const classificationResult = await openaiService.classifyRequirements(text);
      
      // Save classified requirements
      const requirements = [];
      for (const item of classificationResult.requirements) {
        const requirement = await storage.createRequirement({
          documentId: document.id,
          userId: DEFAULT_USER_ID,
          text: item.text,
          phase: item.phase,
          confidence: item.confidence,
          userStory: item.userStory,
        });
        requirements.push(requirement);
      }

      res.json({
        document,
        requirements,
        statistics: classificationResult.statistics,
        extractedText: text.substring(0, 500) + '...' // Preview
      });
    } catch (error) {
      console.error('Requirements upload error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process PDF" 
      });
    }
  });

  // Code Generation
  app.post("/api/code/generate", async (req, res) => {
    try {
      const { language, framework, description } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }

      const codeResult = await openaiService.generateCode(description, language, framework);
      
      const codeSnippet = await storage.createCodeSnippet({
        userId: DEFAULT_USER_ID,
        title: `Generated ${language} Code`,
        description,
        language: language || 'python',
        code: description,
        generatedCode: codeResult.code,
        type: 'generated',
      });

      res.json({
        codeSnippet,
        suggestions: codeResult.suggestions,
      });
    } catch (error) {
      console.error('Code generation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate code" 
      });
    }
  });

  // Bug Fixing
  app.post("/api/code/fix", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const fixResult = await openaiService.fixBugs(code, language);
      
      const codeSnippet = await storage.createCodeSnippet({
        userId: DEFAULT_USER_ID,
        title: `Fixed ${language} Code`,
        description: 'Bug-fixed and optimized code',
        language: language || 'python',
        code,
        generatedCode: fixResult.fixedCode,
        type: 'fixed',
      });

      res.json({
        codeSnippet,
        issues: fixResult.issues,
        optimizations: fixResult.optimizations,
      });
    } catch (error) {
      console.error('Bug fixing error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fix bugs" 
      });
    }
  });

  // Test Case Generation
  app.post("/api/tests/generate", async (req, res) => {
    try {
      const { code, framework, inputType } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Code or requirements are required" });
      }

      const testResult = await openaiService.generateTestCases(code, framework, inputType);
      
      const testCase = await storage.createTestCase({
        userId: DEFAULT_USER_ID,
        framework: framework || 'unittest',
        testCode: testResult.testCode,
        coverage: testResult.coverage,
        totalTests: testResult.totalTests,
      });

      res.json({
        testCase,
        statistics: {
          total: testResult.totalTests,
          positive: testResult.positiveTests,
          negative: testResult.negativeTests,
        },
      });
    } catch (error) {
      console.error('Test generation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate tests" 
      });
    }
  });

  // Code Summarization
  app.post("/api/code/summarize", async (req, res) => {
    try {
      const { code, style } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const summaryResult = await openaiService.summarizeCode(code, style);
      
      const documentation = await storage.createDocumentation({
        userId: DEFAULT_USER_ID,
        style: style || 'technical',
        overview: summaryResult.overview,
        features: summaryResult.features,
        methods: summaryResult.methods,
        example: summaryResult.example,
      });

      res.json({
        documentation,
      });
    } catch (error) {
      console.error('Code summarization error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to summarize code" 
      });
    }
  });

  // Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await openaiService.chatResponse(message);
      
      const chatMessage = await storage.createChatMessage({
        userId: DEFAULT_USER_ID,
        message,
        response,
      });

      res.json({
        chatMessage,
        response,
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process chat message" 
      });
    }
  });

  // Get user data endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(DEFAULT_USER_ID);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/code-snippets", async (req, res) => {
    try {
      const snippets = await storage.getCodeSnippetsByUserId(DEFAULT_USER_ID);
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch code snippets" });
    }
  });

  app.get("/api/chat-history", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesByUserId(DEFAULT_USER_ID);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
