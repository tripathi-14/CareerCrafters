
import React, { useState } from 'react';
import { JourneyStep, ResumeData, UserProfile, Roadmap, Milestone, InterviewFeedback, InterviewType, OnboardingStep, InterviewRound } from './types';
import RoadmapDisplay from './components/RoadmapDisplay';
import ChatInterview from './components/ChatInterview';
import AudioInterview from './components/AudioInterview';
import Dashboard from './components/Dashboard';
import AnalyzingLoader from './components/AnalyzingLoader';
import { generateRoadmap } from './services/geminiService';
import OnboardingJourney from './components/OnboardingJourney';
import BriefcaseIcon from './components/icons/BriefcaseIcon';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<JourneyStep>('onboarding');
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>({ targetDesignation: '', expectedSalaryMin: '', expectedSalaryMax: '' });
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [completedRounds, setCompletedRounds] = useState<Record<string, InterviewRound[]>>({});
    const [interviewFeedbacks, setInterviewFeedbacks] = useState<InterviewFeedback[]>([]);
    const [currentInterview, setCurrentInterview] = useState<{ milestone: Milestone, type: InterviewType, round: InterviewRound } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOnboardingComplete = async (finalResumeData: ResumeData, finalProfile: UserProfile) => {
        setResumeData(finalResumeData);
        setUserProfile(finalProfile);
        setIsLoading(true);
        
        try {
            const generatedRoadmap = await generateRoadmap(finalResumeData, finalProfile);
            setRoadmap(generatedRoadmap);
            setCompletedRounds({});
            setCurrentStep('roadmap');
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to generate the roadmap. Please try again.');
            // Go back to the onboarding flow if it fails
            setCurrentStep('onboarding');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartInterview = (milestone: Milestone, type: InterviewType, round: InterviewRound) => {
        setCurrentInterview({ milestone, type, round });
        setCurrentStep('interview');
    };

    const handleCompleteInterview = (feedback: InterviewFeedback) => {
        // Replace existing feedback for the same milestone and round, or add new.
        setInterviewFeedbacks(prev => {
            const existingIndex = prev.findIndex(f => f.milestoneTitle === feedback.milestoneTitle && f.round === feedback.round);
            if (existingIndex > -1) {
                const newFeedbacks = [...prev];
                newFeedbacks[existingIndex] = feedback;
                return newFeedbacks;
            }
            return [...prev, feedback];
        });

        // Update completed rounds (Set will handle duplicates)
        setCompletedRounds(prev => {
            const existingRounds = new Set(prev[feedback.milestoneTitle] || []);
            existingRounds.add(feedback.round);
            return {
                ...prev,
                [feedback.milestoneTitle]: Array.from(existingRounds)
            };
        });

        setCurrentInterview(null);
        setCurrentStep('roadmap');
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <AnalyzingLoader message="Building your personalized career roadmap..." />;
        }

        switch (currentStep) {
            case 'onboarding':
                 return <OnboardingJourney onComplete={handleOnboardingComplete} setError={setError} />;
            case 'roadmap':
                if (!roadmap || !userProfile || !resumeData) return null;
                return (
                    <RoadmapDisplay
                        roadmap={roadmap}
                        userProfile={userProfile}
                        resumeData={resumeData}
                        completedRounds={completedRounds}
                        interviewFeedbacks={interviewFeedbacks}
                        onStartInterview={handleStartInterview}
                        onNavigateToDashboard={() => setCurrentStep('dashboard')}
                    />
                );
            case 'interview':
                if (!currentInterview) return null;
                if (currentInterview.type === InterviewType.CHAT) {
                    return <ChatInterview 
                                milestone={currentInterview.milestone} 
                                round={currentInterview.round}
                                resumeData={resumeData!} 
                                userProfile={userProfile!} 
                                onComplete={handleCompleteInterview} 
                            />;
                }
                 if (currentInterview.type === InterviewType.AUDIO) {
                    return <AudioInterview 
                                milestone={currentInterview.milestone}
                                round={currentInterview.round}
                                resumeData={resumeData!} 
                                userProfile={userProfile!} 
                                onComplete={handleCompleteInterview} 
                            />;
                }
                return null;
            case 'dashboard':
                return (
                    <Dashboard 
                        resumeData={resumeData!} 
                        userProfile={userProfile!} 
                        roadmap={roadmap!}
                        interviewFeedbacks={interviewFeedbacks}
                        onNavigateToRoadmap={() => setCurrentStep('roadmap')}
                    />
                );
            default:
                return <p>An unexpected error occurred.</p>;
        }
    };

    return (
        <div className="min-h-screen font-sans flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
             <header className="text-center mb-8 flex items-center gap-3">
                 <BriefcaseIcon className="w-10 h-10 text-primary" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                    Career Crafters
                </h1>
            </header>
            <main className="w-full max-w-7xl mx-auto">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-4 rounded-lg mb-6 animate-fade-in" role="alert">
                        <h3 className="font-bold">An Error Occurred</h3>
                        <p>{error}</p>
                    </div>
                )}
                <div key={currentStep} className="animate-fade-in">
                  {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;