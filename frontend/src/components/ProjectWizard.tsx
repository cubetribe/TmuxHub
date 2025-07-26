import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  FileCode, 
  Globe, 
  Check,
  Loader2,
  GitBranch,
  Folder,
  CheckCircle
} from 'lucide-react';

interface ProjectWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

interface ProjectData {
  name: string;
  location: string;
  createFolder: boolean;
  template: 'blank' | 'react-vite';
  fullPath?: string;
}

const ProjectWizard: React.FC<ProjectWizardProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    location: '',
    createFolder: true,
    template: 'blank'
  });
  const [processingStatus, setProcessingStatus] = useState('');

  const handleBrowseLocation = async () => {
    try {
      const result = await (window as any).electronAPI.selectFolder();
      if (result.success && result.path) {
        setProjectData(prev => ({ ...prev, location: result.path }));
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      alert('Error selecting folder. Please try again.');
    }
  };

  const validateStep1 = () => {
    return projectData.name.trim() !== '' && projectData.location.trim() !== '';
  };

  const validateStep2 = () => {
    return projectData.template !== '';
  };

  const canProceed = () => {
    if (currentStep === 1) return validateStep1();
    if (currentStep === 2) return validateStep2();
    return true;
  };

  const nextStep = () => {
    if (currentStep < 3 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createProject = async () => {
    setIsProcessing(true);
    setProcessingStatus('Creating project directory...');

    try {
      let fullPath = projectData.location;
      
      // Step 1: Create directory if needed
      if (projectData.createFolder) {
        const result = await (window as any).electronAPI.createProjectDirectory(
          projectData.location, 
          projectData.name
        );
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        fullPath = result.path;
        setProjectData(prev => ({ ...prev, fullPath }));
      }

      // Step 2: Apply template
      if (projectData.template === 'react-vite') {
        setProcessingStatus('Setting up React + Vite template...');
        
        const viteResult = await (window as any).electronAPI.runProjectCommand(
          'npx create-vite@latest . --template react-ts',
          fullPath
        );
        
        if (!viteResult.success) {
          console.warn('Vite setup warning:', viteResult.error);
        }
        
        setProcessingStatus('Installing dependencies...');
        const npmResult = await (window as any).electronAPI.runProjectCommand(
          'npm install',
          fullPath
        );
        
        if (!npmResult.success) {
          console.warn('NPM install warning:', npmResult.error);
        }
      }

      // Step 3: Initialize Git
      setProcessingStatus('Initializing Git repository...');
      
      const gitResult = await (window as any).electronAPI.runProjectCommand(
        'git init',
        fullPath
      );
      
      if (!gitResult.success) {
        console.warn('Git init warning:', gitResult.error);
      }

      // Step 4: Add to projects.json
      setProcessingStatus('Adding project to TmuxHub...');
      
      const projectConfig = {
        name: projectData.name,
        description: `Claude Code project created with ${projectData.template === 'blank' ? 'blank' : 'React + Vite'} template`,
        projectPath: fullPath,
        tmuxSessionName: projectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        yamlConfigPath: `${fullPath}/tmux-config.yaml`,
        tags: [
          'claude-code',
          projectData.template === 'react-vite' ? 'react' : 'development',
          ...(projectData.template === 'react-vite' ? ['typescript', 'vite'] : [])
        ]
      };

      const addResult = await (window as any).electronAPI.addProject(projectConfig);
      
      if (!addResult.success) {
        throw new Error(addResult.error);
      }

      setProcessingStatus('Project created successfully!');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating project:', error);
      alert(`Error creating project: ${error.message}`);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Project Name & Location</h3>
        <p className="text-slate-400 text-sm mb-6">
          Choose a name and location for your new Claude Code project.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            placeholder="e.g., aiEX_Transcriber"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Location *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={projectData.location}
              onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              placeholder="e.g., ~/Projects/"
              required
            />
            <button
              type="button"
              onClick={handleBrowseLocation}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200 flex items-center space-x-1"
            >
              <FolderOpen size={16} />
              <span>Browse</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="createFolder"
            checked={projectData.createFolder}
            onChange={(e) => setProjectData(prev => ({ ...prev, createFolder: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
          />
          <label htmlFor="createFolder" className="text-sm text-slate-300">
            Create a new folder for this project
          </label>
        </div>

        {projectData.createFolder && projectData.name && projectData.location && (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Folder size={14} />
              <span>Project will be created at:</span>
            </div>
            <div className="text-white font-mono text-sm mt-1">
              {projectData.location}/{projectData.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Choose Template</h3>
        <p className="text-slate-400 text-sm mb-6">
          Select a template to get started quickly, or choose blank for a clean slate.
        </p>
      </div>

      <div className="space-y-4">
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            projectData.template === 'blank' 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
          }`}
          onClick={() => setProjectData(prev => ({ ...prev, template: 'blank' }))}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              projectData.template === 'blank' ? 'bg-blue-500' : 'bg-slate-700'
            }`}>
              <FileCode size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">Blank Project</h4>
              <p className="text-slate-400 text-sm mt-1">
                Creates a completely empty directory. Perfect for starting from scratch.
              </p>
            </div>
            {projectData.template === 'blank' && (
              <CheckCircle size={20} className="text-blue-500 mt-1" />
            )}
          </div>
        </div>

        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            projectData.template === 'react-vite' 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
          }`}
          onClick={() => setProjectData(prev => ({ ...prev, template: 'react-vite' }))}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              projectData.template === 'react-vite' ? 'bg-blue-500' : 'bg-slate-700'
            }`}>
              <Globe size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">Basic Web App (React + Vite)</h4>
              <p className="text-slate-400 text-sm mt-1">
                Automatically scaffolds a ready-to-use React TypeScript app with Vite build tooling.
              </p>
            </div>
            {projectData.template === 'react-vite' && (
              <CheckCircle size={20} className="text-blue-500 mt-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Review & Create</h3>
        <p className="text-slate-400 text-sm mb-6">
          Review your project configuration and create your new Claude Code environment.
        </p>
      </div>

      {isProcessing ? (
        <div className="text-center py-8">
          <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-4" />
          <div className="text-white font-medium mb-2">Creating your project...</div>
          <div className="text-slate-400 text-sm">{processingStatus}</div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
            <h4 className="text-white font-medium mb-3">Project Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white">{projectData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-white font-mono">{projectData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Template:</span>
                <span className="text-white">
                  {projectData.template === 'blank' ? 'Blank Project' : 'React + Vite'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Git Repository:</span>
                <span className="text-green-400 flex items-center space-x-1">
                  <GitBranch size={14} />
                  <span>Will be initialized</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Check size={16} />
              <span className="font-medium">What happens next:</span>
            </div>
            <ul className="text-sm text-slate-300 space-y-1">
              {projectData.createFolder && (
                <li>• Create project directory: {projectData.name}</li>
              )}
              {projectData.template === 'react-vite' && (
                <>
                  <li>• Set up React + TypeScript + Vite structure</li>
                  <li>• Install all dependencies</li>
                </>
              )}
              <li>• Initialize Git repository</li>
              <li>• Add project to TmuxHub</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">New Project Wizard</h2>
            <div className="flex items-center space-x-2 mt-1">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : step < currentStep 
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {step < currentStep ? <Check size={16} /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-1 mx-1 ${
                      step < currentStep ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-800">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed() || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={createProject}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors duration-200 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;