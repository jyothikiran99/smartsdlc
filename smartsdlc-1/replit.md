# SmartSDLC - AI-Enhanced Software Development Lifecycle

## Overview

SmartSDLC is a comprehensive AI-powered platform that revolutionizes the traditional Software Development Lifecycle (SDLC) by automating key development stages using advanced Natural Language Processing. The platform enables teams to convert unstructured requirements into code, test cases, and documentation instantly, minimizing manual intervention and enhancing productivity.

The application provides six core AI-driven modules:
1. **Requirements Upload & Classification** - Upload PDF documents and automatically classify requirements into SDLC phases
2. **AI Code Generator** - Transform natural language descriptions into production-ready code
3. **Bug Fixer** - Detect and automatically fix bugs in Python and JavaScript code
4. **Test Case Generator** - Generate comprehensive test cases using standard testing frameworks
5. **Code Summarizer** - Generate human-readable documentation and code explanations
6. **Floating AI Chatbot** - Real-time conversational support throughout the application

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA configuration
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom dark/light theme implementation with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for production bundling
- **File Upload**: Multer middleware for PDF file handling
- **Session Management**: Express sessions with PostgreSQL storage

### Database & ORM
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions between frontend and backend
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL connection

### AI Integration
- **Primary AI Service**: OpenAI GPT models for code generation, bug fixing, and documentation
- **PDF Processing**: PDF.js for extracting text content from uploaded documents
- **AI Features**: 
  - Requirements classification into SDLC phases
  - Code generation from natural language
  - Bug detection and fixing
  - Test case generation
  - Code documentation and summarization
  - Conversational AI chatbot

### Code Quality & Development Tools
- **Syntax Highlighting**: React Syntax Highlighter with Prism
- **Code Editor**: Custom CodeEditor component with copy/download functionality
- **Form Validation**: React Hook Form with Zod schema validation
- **Type Safety**: Comprehensive TypeScript configuration across all layers
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

### Module Structure
- **Monorepo Structure**: Shared schema and types between client and server
- **Component Architecture**: Modular components with clear separation of concerns
- **Service Layer**: Dedicated services for OpenAI integration and PDF processing
- **Storage Abstraction**: Interface-based storage layer for future database flexibility

## External Dependencies

### AI & Language Models
- **OpenAI API**: Primary AI service for code generation, bug fixing, and natural language processing
- **PDF.js**: Client-side PDF text extraction and processing

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Components**: Comprehensive Radix UI primitive collection
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight routing
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Utilities**: clsx, tailwind-merge for className management

### Development & Build Tools
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Development**: tsx for TypeScript execution, Replit integration plugins
- **Code Quality**: Various TypeScript type definitions for enhanced development experience

### File Processing
- **Multer**: File upload middleware for Express
- **PDF Processing**: PDF.js for document text extraction and validation

### Utility Libraries
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for runtime type validation
- **UUID Generation**: Built-in crypto module for ID generation
- **Command Interface**: cmdk for command palette functionality