============================================================
SmartSDLC – AI-Enhanced Software Development Lifecycle
============================================================

Overview:
---------
SmartSDLC is a full-stack, AI-powered platform that reimagines the traditional Software Development Lifecycle (SDLC) by automating key phases using advanced Natural Language Processing (NLP) and Generative AI technologies. It enables teams to convert unstructured requirements into structured code, test cases, and documentation—instantly and intelligently.

SmartSDLC is not just a tool—it’s an intelligent ecosystem designed to minimize manual effort, enhance accuracy, and accelerate software delivery.

Key Features:
-------------
1. Requirement Upload & Classification:
   - Upload PDF documents containing raw requirements.
   - AI classifies each sentence into SDLC phases (Requirements, Design, Development, Testing, Deployment).
   - Outputs structured user stories grouped by phase.

2. AI Code Generator:
   - Input natural language prompts or user stories.
   - Generates production-ready code using IBM Watsonx Granite-20B.
   - Supports multiple languages and frameworks.

3. Bug Fixer:
   - Submit buggy code snippets (Python, JavaScript, etc.).
   - AI detects and corrects syntactical and logical errors.
   - Displays optimized code side-by-side for comparison.

4. Test Case Generator:
   - Provide functional code or requirements.
   - Generates test cases using frameworks like unittest or pytest.
   - Ensures consistent and complete test coverage.

5. Code Summarizer:
   - Input any source code snippet.
   - AI generates human-readable explanations and documentation.
   - Ideal for onboarding and long-term maintenance.

6. Floating AI Chatbot Assistant:
   - Real-time conversational support using LangChain.
   - Answers SDLC-related queries interactively.
   - Integrated into the frontend for intuitive access.

Technologies Used:
------------------
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js
- AI Models: IBM Watsonx Granite-20B, LangChain
- PDF Parsing: PyMuPDF
- Deployment: Rocket.new integration
- Hosting: GitHub Pages / Vercel / Custom server

Getting Started:
----------------
1. Clone the repository:
   > git clone https:https://github.com/jyothikiran99/smartsdlc.git
2. Install dependencies:
   > cd smartsdlc  
   > npm install

3. Run the development server:
   > npm start

4. Access the app at:
   > http://localhost:3000

Note:
-----
- Ensure your `apple-touch-icon.png`, `favicon.ico`, and `manifest.json` are placed in the `public` directory.
- Backend endpoints must be configured to communicate with Watsonx and LangChain services.
- For production deployment, use `npm run build` and host the `build` folder on your preferred platform.

License:
--------
This project is open-source under the MIT License. See LICENSE.txt for details.

Contact:
--------
For questions, feedback, or contributions, please reach out via GitHub Issues or email: yourname@example.com
