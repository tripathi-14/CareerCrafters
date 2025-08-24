import React, { useState } from 'react';
import { Job, ResumeData } from '../types';
import { generateApplicationContent } from '../services/geminiService';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { Clipboard, ClipboardCheck, FileText, ListChecks } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  resumeData: ResumeData;
}

const ApplicationHelperModal: React.FC<Props> = ({ isOpen, onClose, job, resumeData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentType, setContentType] = useState<'summary' | 'coverLetter' | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (type: 'summary' | 'coverLetter') => {
    setIsLoading(true);
    setGeneratedContent('');
    setContentType(type);
    try {
      const content = await generateApplicationContent(resumeData, job, type);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Failed to generate content:', error);
      setGeneratedContent('Sorry, there was an error generating the content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl p-8 space-y-6 transform transition-transform animate-scale-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Application Assistant</h2>
          <p className="text-text-secondary mt-1">
            Applying for <span className="font-semibold text-primary">{job.designation}</span> at <span className="font-semibold text-primary">{job.companyName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="secondary" onClick={() => handleGenerate('summary')} disabled={isLoading}>
            <ListChecks className="mr-2 h-4 w-4" />
            Generate Resume Summary
          </Button>
          <Button variant="secondary" onClick={() => handleGenerate('coverLetter')} disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Cover Letter
          </Button>
        </div>

        <div className="flex-grow min-h-[200px] bg-background rounded-lg p-4 border border-border overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <Spinner />
              <p className="mt-4">Generating {contentType === 'summary' ? 'your summary' : 'your cover letter'}...</p>
            </div>
          ) : generatedContent ? (
            <div className="relative">
              <button onClick={handleCopy} className="absolute top-0 right-0 p-2 text-text-secondary hover:text-primary transition-colors">
                {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
              </button>
              <p className="text-sm text-text-primary whitespace-pre-wrap pr-8">{generatedContent}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Choose an option above to generate content.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationHelperModal;
