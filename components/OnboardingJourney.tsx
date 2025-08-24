import React, { useState, useRef } from 'react';
import { OnboardingStep, ResumeData, UserProfile } from '../types';
import { extractResumeDataFromText } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import ResumeEditorJourney from './ResumeEditorJourney';
import { ArrowLeft, ArrowRight, Rocket, FileText } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import UploadIcon from './icons/UploadIcon';
import InteractiveAILoader from './InteractiveAILoader';
import ProgressBar from './ui/ProgressBar';

// Set worker source for pdf.js to avoid issues with module loading
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

interface Props {
  onComplete: (resumeData: ResumeData, userProfile: UserProfile) => void;
  setError: (error: string | null) => void;
}

const stepOrder: OnboardingStep[] = ['initial_info', 'personal_info', 'skills', 'experience', 'goals'];

const stepDetails: Record<OnboardingStep, { title: string; description: string }> = {
  initial_info: { title: 'Create Your Career Plan', description: "Let's build your path to success, one step at a time." },
  personal_info: { title: 'Confirm Your Details', description: 'Please review the information extracted by the AI and make any corrections.' },
  skills: { title: 'Your Skills', description: 'List your key skills and your current expertise level for each.' },
  experience: { title: 'Verify Your Work History', description: 'Ensure your professional journey is accurately represented.' },
  goals: { title: 'Set Your Career Target', description: 'Tell us your goals to help us build the perfect roadmap for you.' },
};

const OnboardingJourney: React.FC<Props> = ({ onComplete, setError }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('initial_info');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ targetDesignation: '', expectedSalaryMin: '', expectedSalaryMax: '' });

  const parseResumeFile = async (resumeFile: File): Promise<string> => {
    if (resumeFile.type === 'application/pdf') {
        const arrayBuffer = await resumeFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        return text;
    } else if (resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await resumeFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  };

  const handleInitialSubmit = async () => {
    if (!file) {
      setError('Please upload your resume to get started.');
      return;
    }
    setIsParsing(true);
    setError(null);
    try {
      const text = await parseResumeFile(file);
      const data = await extractResumeDataFromText(text);
      setResumeData(data);
      setCurrentStep('personal_info');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      setFile(null); // Reset file on error
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Invalid file type. Please upload a PDF or DOCX.');
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  const currentIndex = stepOrder.indexOf(currentStep);
  const isLastStep = currentIndex === stepOrder.length - 1;

  const handleNext = () => {
    if (currentStep === 'initial_info') {
      handleInitialSubmit();
    } else if (!isLastStep) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
        if(resumeData){
            onComplete(resumeData, userProfile);
        } else {
            setError("Cannot complete, resume data is missing.")
        }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };
  
  const renderContent = () => {
    if (currentStep === 'initial_info') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
            className="hidden"
            accept=".pdf,.docx"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70'}`}
          >
            {file ? (
                <div className="text-center">
                    <FileText className="h-10 w-10 mx-auto text-green-500" />
                    <p className="mt-2 font-semibold text-text-primary">{file.name}</p>
                    <p className="text-xs text-text-secondary">Click or drag a new file to replace</p>
                </div>
            ) : (
                <div className="text-center">
                    <UploadIcon className="h-10 w-10 mx-auto text-slate-400" />
                    <p className="mt-2 font-semibold text-primary">Click to upload or drag and drop</p>
                    <p className="text-xs text-text-secondary mt-1">PDF or DOCX (max 10MB)</p>
                </div>
            )}
          </div>
        </div>
      );
    }

    if (resumeData) {
        return <ResumeEditorJourney 
                    step={currentStep} 
                    resumeData={resumeData}
                    userProfile={userProfile}
                    onResumeChange={setResumeData}
                    onProfileChange={setUserProfile}
                />
    }

    return null;
  };
  
  const MainTitle = stepDetails['initial_info'];
  const currentStepDetail = stepDetails[currentStep];

  return (
    <Card className="p-6 sm:p-8">
      {isParsing ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <InteractiveAILoader />
            <h3 className="text-xl font-bold text-text-primary mt-6">Analyzing your resume...</h3>
            <p className="text-text-secondary mt-1">This may take a few moments...</p>
        </div>
      ) : (
      <>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">{MainTitle.title}</h2>
            <p className="text-text-secondary mt-1 text-sm">{MainTitle.description}</p>
        </div>

        {currentStep !== 'initial_info' && (
            <div className="my-6 space-y-6">
                <ProgressBar currentStep={currentIndex} totalSteps={stepOrder.length} />
                 <div className="text-center">
                    <h3 className="text-xl font-bold text-text-primary">{currentStepDetail.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm">{currentStepDetail.description}</p>
                </div>
            </div>
        )}

        <div key={currentStep} className={`animate-fade-in ${currentStep === 'initial_info' ? 'mt-6' : ''}`}>
            {renderContent()}
        </div>

        <div className="mt-6 flex justify-between items-center border-t border-border pt-6">
            <Button onClick={handleBack} variant="secondary" disabled={currentIndex === 0 || isParsing}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
            </Button>
            <Button onClick={handleNext} disabled={isParsing || (currentStep === 'initial_info' && !file)}>
            {isLastStep ? 'Generate Roadmap' : 'Next'}
            {isLastStep ? <Rocket className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
        </div>
      </>
      )}
    </Card>
  );
};

export default OnboardingJourney;