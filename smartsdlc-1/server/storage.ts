import { 
  type User, type InsertUser,
  type Document, type InsertDocument,
  type Requirement, type InsertRequirement,
  type CodeSnippet, type InsertCodeSnippet,
  type TestCase, type InsertTestCase,
  type Documentation, type InsertDocumentation,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUserId(userId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;

  // Requirement methods
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  getRequirementsByDocumentId(documentId: string): Promise<Requirement[]>;
  getRequirementsByUserId(userId: string): Promise<Requirement[]>;

  // Code snippet methods
  createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippetsByUserId(userId: string): Promise<CodeSnippet[]>;
  getCodeSnippet(id: string): Promise<CodeSnippet | undefined>;
  updateCodeSnippet(id: string, updates: Partial<CodeSnippet>): Promise<CodeSnippet | undefined>;

  // Test case methods
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  getTestCasesByUserId(userId: string): Promise<TestCase[]>;
  getTestCasesByCodeSnippetId(codeSnippetId: string): Promise<TestCase[]>;

  // Documentation methods
  createDocumentation(documentation: InsertDocumentation): Promise<Documentation>;
  getDocumentationsByUserId(userId: string): Promise<Documentation[]>;
  getDocumentationsByCodeSnippetId(codeSnippetId: string): Promise<Documentation[]>;

  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUserId(userId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private requirements: Map<string, Requirement> = new Map();
  private codeSnippets: Map<string, CodeSnippet> = new Map();
  private testCases: Map<string, TestCase> = new Map();
  private documentations: Map<string, Documentation> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();

  constructor() {
    // Create a default user for development
    const defaultUser: User = {
      id: "default-user",
      username: "developer",
      password: "password",
      email: "dev@company.com",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date(),
      userId: insertDocument.userId ?? null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createRequirement(insertRequirement: InsertRequirement): Promise<Requirement> {
    const id = randomUUID();
    const requirement: Requirement = { 
      ...insertRequirement, 
      id, 
      createdAt: new Date(),
      userId: insertRequirement.userId ?? null,
      documentId: insertRequirement.documentId ?? null,
      userStory: insertRequirement.userStory ?? null
    };
    this.requirements.set(id, requirement);
    return requirement;
  }

  async getRequirementsByDocumentId(documentId: string): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter(req => req.documentId === documentId);
  }

  async getRequirementsByUserId(userId: string): Promise<Requirement[]> {
    return Array.from(this.requirements.values()).filter(req => req.userId === userId);
  }

  async createCodeSnippet(insertSnippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const id = randomUUID();
    const snippet: CodeSnippet = { 
      ...insertSnippet, 
      id, 
      createdAt: new Date(),
      userId: insertSnippet.userId ?? null,
      description: insertSnippet.description ?? null,
      generatedCode: insertSnippet.generatedCode ?? null
    };
    this.codeSnippets.set(id, snippet);
    return snippet;
  }

  async getCodeSnippetsByUserId(userId: string): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values()).filter(snippet => snippet.userId === userId);
  }

  async getCodeSnippet(id: string): Promise<CodeSnippet | undefined> {
    return this.codeSnippets.get(id);
  }

  async updateCodeSnippet(id: string, updates: Partial<CodeSnippet>): Promise<CodeSnippet | undefined> {
    const existing = this.codeSnippets.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.codeSnippets.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const id = randomUUID();
    const testCase: TestCase = { 
      ...insertTestCase, 
      id, 
      createdAt: new Date(),
      userId: insertTestCase.userId ?? null,
      codeSnippetId: insertTestCase.codeSnippetId ?? null,
      coverage: insertTestCase.coverage ?? null,
      totalTests: insertTestCase.totalTests ?? null
    };
    this.testCases.set(id, testCase);
    return testCase;
  }

  async getTestCasesByUserId(userId: string): Promise<TestCase[]> {
    return Array.from(this.testCases.values()).filter(test => test.userId === userId);
  }

  async getTestCasesByCodeSnippetId(codeSnippetId: string): Promise<TestCase[]> {
    return Array.from(this.testCases.values()).filter(test => test.codeSnippetId === codeSnippetId);
  }

  async createDocumentation(insertDocumentation: InsertDocumentation): Promise<Documentation> {
    const id = randomUUID();
    const documentation: Documentation = { 
      ...insertDocumentation, 
      id, 
      createdAt: new Date(),
      userId: insertDocumentation.userId ?? null,
      codeSnippetId: insertDocumentation.codeSnippetId ?? null,
      overview: insertDocumentation.overview ?? null,
      features: insertDocumentation.features ?? null,
      methods: insertDocumentation.methods ?? null,
      example: insertDocumentation.example ?? null
    };
    this.documentations.set(id, documentation);
    return documentation;
  }

  async getDocumentationsByUserId(userId: string): Promise<Documentation[]> {
    return Array.from(this.documentations.values()).filter(doc => doc.userId === userId);
  }

  async getDocumentationsByCodeSnippetId(codeSnippetId: string): Promise<Documentation[]> {
    return Array.from(this.documentations.values()).filter(doc => doc.codeSnippetId === codeSnippetId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      userId: insertMessage.userId ?? null
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesByUserId(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(msg => msg.userId === userId);
  }
}

export const storage = new MemStorage();
