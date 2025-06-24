# ChatV AI Assistant 🤖✨

![ChatV Demo](https://via.placeholder.com/1200x600.png?text=ChatV+Demo+GIF+Here)  
*(Replace with actual screenshot/GIF showing the interface in both light/dark modes)*

A full-featured AI chat interface supporting multiple LLM models (GPT-4, Mistral, LLaMA 3, Gemma) with local Ollama integration. Built with React and developed with AI assistance.

🔗 **Live Demo**: [Deploy on Vercel]() | 📹 [Video Walkthrough]()  
*(Add links when ready)*

## 🌟 Key Features

### Core Functionality
- 🧠 **Multi-model support**: Switch between different AI models
- 💾 **Session management**: Save, load, and delete chat sessions
- ✏️ **Message editing**: Double-click to modify sent messages
- 📥 **Import/Export**: Save chats as JSON files

### UI/UX
- 🌗 **Dark/Light mode**: Automatic system preference detection
- ⌨️ **Keyboard shortcuts**:
  - `Ctrl+N` → New chat
  - `Ctrl+K` → Clear session  
  - `Ctrl+E` → Export chat
  - `Ctrl+B` → Toggle sidebar
- ⚡ **Streaming simulation**: Typewriter-style message display

### Technical
- 🔌 **Local API integration**: Connect to Ollama at `http://localhost:11434/api/chat`
- 📱 **Responsive design**: Works on desktop/tablet (mobile WIP)
- 🛡️ **Error handling**: Graceful API failure recovery

## 🛠️ Tech Stack

**Frontend**  
| Technology | Use Case |
|------------|----------|
| React 18 | Core framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| React Icons | UI icons |

**Development**  
- ESLint + Prettier → Code quality
- Git → Version control
- VS Code → IDE

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Ollama running locally
- Git

### Installation

# Clone the repository
git clone https://github.com/pkchoudary/ChatV-AI-Assistant.git

# Navigate to project directory
cd ChatV-AI-Assistant

# Install dependencies
npm install
Running Locally
bash
# Start development server
npm run dev

# Build for production
npm run build
⚙️ Configuration
Edit src/config.js to customize:

javascript
{
  DEFAULT_MODEL: "llama3", // Change default model
  API_ENDPOINT: "http://localhost:11434/api/chat", // API base URL
  ENABLE_STREAMING: true, // Toggle streaming simulation
  DEFAULT_THEME: "system" // "light" | "dark" | "system"
}
📂 Project Structure
text
chatv-ai-assistant/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable components
│   │   ├── ChatInterface/
│   │   ├── Sidebar/
│   │   └── ... 
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Helper functions
│   ├── App.jsx        # Main component
│   └── main.jsx       # Entry point
├── .gitignore
├── package.json
└── README.md
🤝 AI Assistance Acknowledgement
This project was developed with assistance from:

ChatGPT (Code structure optimization)

Claude (UI/UX suggestions)

DeepSeek (Debugging help)

While AI tools provided suggestions, all architectural decisions and final implementations were made by the developer.

🐛 Known Issues
Mobile responsiveness needs improvement

Session list sometimes doesn't update immediately

Dark mode toggle animation could be smoother

🛠️ Troubleshooting
ESLint Warnings
To temporarily disable during development:

bash
# Create .env file
echo "DISABLE_ESLINT_PLUGIN=true" > .env
API Connection Failed
Ensure Ollama is running:

bash
ollama serve
📜 License
MIT License - See LICENSE for full text.

👨‍💻 Author
Pavan Kumar Choudary
