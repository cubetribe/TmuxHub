# TmuxHub - Claude Code Project Environment Launcher

> **Intelligent Development Environment Manager for Claude Code Projects**

TmuxHub transforms the way developers create and manage development environments by providing an intuitive, AI-first project launcher specifically optimized for Claude Code workflows. With intelligent project templates, automated Git integration, and seamless tmux orchestration, TmuxHub eliminates setup friction and enables immediate productive development.

## 🎯 **Project Vision**

**Empowering developers to launch intelligent, fully-configured development environments in seconds.**

TmuxHub bridges the gap between project conception and productive development by automating the complex setup processes that traditionally slow down development teams. Our vision is a world where developers can focus entirely on building great software, while TmuxHub handles the infrastructure orchestration seamlessly in the background.

## ✨ **Core Features**

### 🧙‍♂️ **Intelligent Project Wizard**
- **3-Step Project Creation**: Name → Location → Template → Ready
- **Smart Directory Management**: Automatic folder creation with conflict detection
- **Template-Driven Setup**: Instant scaffolding of production-ready environments
- **Git-First Approach**: Every project is a version-controlled repository from day one

### 🤖 **Claude Code Integration**
- **CLI Status Monitoring**: Real-time detection of Claude Code availability
- **One-Click Authentication**: Seamless `claude auth` integration
- **Optimized Project Structure**: Projects configured for AI-assisted development
- **Intelligent Defaults**: Settings tuned specifically for Claude Code workflows

### 🚀 **Development Templates**
- **Blank Project**: Clean slate for custom development approaches
- **React + Vite**: Full-stack TypeScript web application with hot reload
- **Future Templates**: Python ML, Node.js APIs, and more coming soon

### 🎛️ **Tmux Orchestration**
- **Multi-Window Environments**: Automated tmux session management
- **Python Integration**: Bundled virtual environment for seamless execution
- **Configuration Management**: YAML-based environment definitions
- **Session Persistence**: Reliable project state management

### 🎨 **User Experience**
- **Native macOS App**: Built with Electron for seamless desktop integration
- **Dark Mode Interface**: Professional, developer-focused UI design
- **Real-Time Feedback**: Clear status indicators and progress tracking
- **Zero Configuration**: Intelligent auto-detection of system dependencies

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18.2.0** - Modern component-based UI framework
- **TypeScript 5.2.2** - Type-safe development with excellent IDE support
- **Tailwind CSS 3.3.6** - Utility-first styling for rapid UI development
- **Lucide React** - Beautiful, consistent icon system
- **Vite 5.0.8** - Lightning-fast build tooling and hot module replacement

### **Desktop Application**
- **Electron 27.1.3** - Cross-platform desktop app framework
- **Node.js** - JavaScript runtime for system integration
- **IPC Bridge** - Secure communication between frontend and backend processes

### **Backend & Orchestration**
- **Python 3.6+** - Tmux session management and automation
- **libtmux 0.46.2** - Programmatic tmux control and monitoring
- **PyYAML 6.0.2** - Configuration file parsing and validation
- **Git** - Version control integration for all projects

### **Build & Development**
- **npm** - Package management and script execution
- **electron-builder** - Application packaging and distribution
- **ESLint** - Code quality and consistency enforcement
- **PostCSS** - CSS processing and optimization

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        TmuxHub Desktop App                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │   React Frontend │    │   Electron Main  │    │   Python    │ │
│  │                 │    │     Process      │    │ Orchestrator│ │
│  │ • Project Wizard│◄──►│                  │◄──►│             │ │
│  │ • Settings UI   │    │ • IPC Handlers   │    │ • Tmux Mgmt │ │
│  │ • Status Display│    │ • File System    │    │ • Session   │ │
│  │ • Project List  │    │ • Command Exec   │    │   Control   │ │
│  └─────────────────┘    └──────────────────┘    └─────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │   projects.json │    │   YAML Configs   │    │ Git Repos   │ │
│  │                 │    │                  │    │             │ │
│  │ • Project Meta  │    │ • Tmux Layouts   │    │ • Version   │ │
│  │ • Paths & Names │    │ • Window Configs │    │   Control   │ │
│  │ • Session State │    │ • Command Sets   │    │ • History   │ │
│  └─────────────────┘    └──────────────────┘    └─────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Data Flow**

1. **User Interaction**: React frontend captures user input and project creation requests
2. **IPC Communication**: Electron main process receives commands via secure IPC bridge
3. **File System Operations**: Directory creation, template scaffolding, and Git initialization
4. **Python Orchestration**: Tmux session management and environment configuration
5. **State Persistence**: Project metadata stored in JSON, configurations in YAML
6. **Real-Time Updates**: Status changes propagated back to frontend via IPC events

## 🚀 **Getting Started**

### **Prerequisites**

- **macOS** (Primary platform support)
- **Node.js 16+** and **npm** for development
- **Python 3.6+** for tmux orchestration
- **Git** for version control integration
- **tmux** for session management
- **Claude Code CLI** (optional, for full AI integration)

### **Installation & Development**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/cubetribe/TmuxHub.git
   cd TmuxHub
   ```

2. **Install Dependencies**
   ```bash
   # Install main application dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Set up Python environment
   cd orchestrator-engine
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

3. **Development Mode**
   ```bash
   # Terminal 1: Start frontend development server
   cd frontend
   npm run dev
   
   # Terminal 2: Start Electron app in development mode
   NODE_ENV=development npm run electron
   ```

4. **Production Build**
   ```bash
   # Build frontend for production
   cd frontend
   npm run build
   cd ..
   
   # Copy build to main app
   cp -r frontend/dist .
   
   # Run production app
   npm run electron
   ```

### **Project Structure**

```
TmuxHub/
├── README.md                 # This documentation
├── package.json             # Main app dependencies and scripts
├── electron/                # Electron main process
│   ├── main.js             #   Application entry point
│   └── preload.js          #   IPC bridge configuration
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     #   UI components
│   │   │   ├── ProjectWizard.tsx    # 3-step project creation
│   │   │   ├── Settings.tsx         # Configuration interface
│   │   │   └── ...         #   Additional components
│   │   └── ...            #   App structure
│   └── package.json       #   Frontend dependencies
├── orchestrator-engine/    # Python tmux management
│   ├── main.py            #   Tmux orchestration logic
│   ├── requirements.txt   #   Python dependencies
│   └── venv/              #   Virtual environment
├── projects.json          # Project metadata storage
└── dist/                  # Production build output
```

### **Creating Your First Project**

1. **Launch TmuxHub** and click the Settings icon
2. **Navigate to Projects** section
3. **Click "+ Add New Project"** to open the Project Wizard
4. **Step 1**: Enter project name and choose location
5. **Step 2**: Select template (Blank or React + Vite)
6. **Step 3**: Review and create - TmuxHub handles the rest!

Your project will be created with:
- ✅ Directory structure
- ✅ Git repository initialization
- ✅ Template scaffolding (if selected)
- ✅ TmuxHub project registration
- ✅ Ready for Claude Code integration

### **Configuration**

Visit the **Configuration** section in Settings to:
- **Check Claude Code Status**: Automatic CLI detection
- **Authenticate Claude**: One-click authentication setup
- **View System Status**: Python environment and Git integration
- **Customize Appearance**: Theme and display preferences

## 🤝 **Contributing**

We welcome contributions to TmuxHub! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Issue reporting
- Feature development

## 📄 **License**

MIT License - see the LICENSE file for details.

## 🔮 **Roadmap**

- **v1.1**: Enhanced template system with Python ML and Node.js APIs
- **v1.2**: Advanced tmux configuration designer
- **v1.3**: Team collaboration features
- **v1.4**: Cloud synchronization and backup
- **v2.0**: Multi-platform support (Windows, Linux)

---

**Built with ❤️ for developers who demand intelligent tooling**

*TmuxHub - Where AI meets Development Environment Excellence*