
import React, { useState } from 'react';
import { Roadmap, Milestone, UserProfile, InterviewRound, InterviewType, InterviewFeedback, Job, ResumeData } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { Target, Calendar, Check, Wrench, BookOpen, Code, Lightbulb, Users, Clipboard, ClipboardCheck, Lock, Star, ChevronDown, ThumbsUp, Activity, ExternalLink, Search, Info } from 'lucide-react';
import InterviewSetupModal from './InterviewSetupModal';
import { findRelevantJobs } from '../services/geminiService';
import ApplicationHelperModal from './ApplicationHelperModal';
import Spinner from './ui/Spinner';
import ScoreRing from './ui/ScoreRing';
import VocalDeliveryAnalysis from './VocalDeliveryAnalysis';

interface Props {
  roadmap: Roadmap;
  userProfile: UserProfile;
  resumeData: ResumeData;
  completedRounds: Record<string, InterviewRound[]>;
  interviewFeedbacks: InterviewFeedback[];
  onStartInterview: (milestone: Milestone, type: InterviewType, round: InterviewRound) => void;
  onNavigateToDashboard: () => void;
}

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="mt-6">
        <h4 className="flex items-center text-md font-semibold text-text-primary mb-3">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        {children}
    </div>
);

const InteractiveCheckListItem: React.FC<{
  item: string;
  isChecked: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}> = ({ item, isChecked, onToggle, isDisabled }) => (
  <label className={`flex items-center space-x-3 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onToggle}
      disabled={isDisabled}
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span className={`text-text-secondary text-sm ${isChecked ? 'line-through text-text-secondary/70' : ''}`}>
      {item}
    </span>
  </label>
);

const FeedbackResult: React.FC<{ feedback: InterviewFeedback }> = ({ feedback }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-border rounded-lg bg-background/50">
            <button
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3"/>
                    <span className="font-semibold text-text-primary">{feedback.round} Round Feedback</span>
                </div>
                <div className="flex items-center gap-3">
                    <ScoreRing score={feedback.overallScore} />
                    <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-border bg-white animate-fade-in space-y-4">
                    <div className="flex items-start gap-4 p-3 bg-background rounded-md">
                        <ScoreRing score={feedback.overallScore} size={50} strokeWidth={5} />
                        <div className="flex-1">
                            <h5 className="flex items-center font-semibold text-text-primary text-sm"><Info className="h-4 w-4 mr-2 text-primary"/>Score Justification</h5>
                            <p className="text-sm text-text-secondary mt-1">{feedback.scoreReason}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h5 className="font-semibold text-text-primary text-sm">Detailed Assessment</h5>
                        <p className="text-sm text-text-secondary mt-1">{feedback.detailedFeedback}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <h5 className="flex items-center font-semibold text-green-700 text-sm"><ThumbsUp className="h-4 w-4 mr-2" />Strengths</h5>
                        <ul className="list-disc list-inside text-text-secondary text-sm pl-2 mt-1 space-y-1">
                          {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="flex items-center font-semibold text-yellow-700 text-sm"><Activity className="h-4 w-4 mr-2" />Areas for Improvement</h5>
                        <ul className="list-disc list-inside text-text-secondary text-sm pl-2 mt-1 space-y-1">
                          {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>

                    {feedback.vocalDelivery && <VocalDeliveryAnalysis vocalDelivery={feedback.vocalDelivery} />}
                </div>
            )}
        </div>
    );
};


const RoadmapDisplay: React.FC<Props> = ({ roadmap, userProfile, resumeData, completedRounds, interviewFeedbacks, onStartInterview, onNavigateToDashboard }) => {
    const [copied, setCopied] = useState(false);
    const [completedItems, setCompletedItems] = useState<Record<string, Set<string>>>(() => {
        const initialState: Record<string, Set<string>> = {};
        roadmap.milestones.forEach((milestone) => {
             const isInterviewDone = (completedRounds[milestone.title]?.length || 0) > 0;
            if (isInterviewDone) {
                // If interview is done, all skills are considered completed
                initialState[milestone.title] = new Set(milestone.skillsToAcquire);
            } else {
                initialState[milestone.title] = new Set();
            }
        });
        return initialState;
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

    const [jobs, setJobs] = useState<Job[] | null>(null);
    const [isFindingJobs, setIsFindingJobs] = useState(false);
    const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);


    const handleToggleItem = (milestoneTitle: string, item: string) => {
        setCompletedItems(prev => {
            const newItems = new Set(prev[milestoneTitle] || []);
            if (newItems.has(item)) {
                newItems.delete(item);
            } else {
                newItems.add(item);
            }
            return { ...prev, [milestoneTitle]: newItems };
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roadmap.networkingSuggestions.messageTemplate);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleInitiateInterview = (milestone: Milestone) => {
        setSelectedMilestone(milestone);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (type: InterviewType, round: InterviewRound) => {
        if (selectedMilestone) {
            onStartInterview(selectedMilestone, type, round);
        }
    };

    const handleFindJobs = async () => {
        setIsFindingJobs(true);
        try {
            const relevantJobs = await findRelevantJobs(userProfile);
            setJobs(relevantJobs);
        } catch (error) {
            console.error("Failed to find jobs:", error);
        } finally {
            setIsFindingJobs(false);
        }
    };

    const handleOpenApplyModal = (job: Job) => {
        setSelectedJobForApply(job);
        setIsApplyModalOpen(true);
    };


    const completedMilestones = Object.keys(completedRounds).length;
    const totalMilestones = roadmap.milestones.length;
    const overallProgressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">

            {/* Introduction Section */}
            <div className="text-center max-w-4xl mx-auto">
                <div className="flex justify-center items-center gap-3">
                    <Target className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Your Roadmap to {userProfile.targetDesignation}</h2>
                </div>
                <p className="mt-4 text-md text-text-secondary leading-relaxed">
                    {roadmap.gapAnalysis}
                </p>
            </div>

            {/* Progress and Milestones Section */}
            <div>
                 <div className="mb-6">
                    <p className="text-sm font-semibold text-text-secondary mb-2">Overall Progress ({Math.round(overallProgressPercentage)}%)</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${overallProgressPercentage}%`}}></div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-text-primary">Your Milestones</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Milestones Column */}
                <div className="lg:col-span-2 space-y-8">
                    {roadmap.milestones.map((milestone, index) => {
                        const isAnyInterviewDone = (completedRounds[milestone.title]?.length || 0) > 0;
                        const milestoneFeedbacks = interviewFeedbacks.filter(f => f.milestoneTitle === milestone.title);
                        
                        // Only track skills for progress and unlocking the interview
                        const totalSkills = milestone.skillsToAcquire.length;
                        const completedSkillsCount = milestone.skillsToAcquire.filter(skill => completedItems[milestone.title]?.has(skill)).length;
                        const milestoneProgressPercentage = totalSkills > 0 ? (completedSkillsCount / totalSkills) * 100 : 0;
                        const isMilestoneComplete = completedSkillsCount === totalSkills;

                        return (
                        <Card key={index} className="p-8 animate-scale-in overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-start gap-6">
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${isAnyInterviewDone ? 'bg-green-500' : 'bg-primary'}`}>
                                        {isAnyInterviewDone ? <Check size={28} /> : index + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-2xl font-bold text-text-primary">{milestone.title}</h3>
                                    </div>
                                    <p className="mt-2 text-text-secondary">{milestone.description}</p>
                                    
                                    <Section icon={<Wrench className="h-5 w-5 text-primary"/>} title="Skills to Acquire">
                                        <div className="space-y-2">
                                            {milestone.skillsToAcquire.map(skill => (
                                                <InteractiveCheckListItem 
                                                    key={skill} 
                                                    item={skill}
                                                    isChecked={completedItems[milestone.title]?.has(skill) || false}
                                                    onToggle={() => handleToggleItem(milestone.title, skill)}
                                                    isDisabled={isAnyInterviewDone}
                                                />
                                            ))}
                                        </div>
                                    </Section>

                                    <Section icon={<BookOpen className="h-5 w-5 text-primary"/>} title="Suggested Courses">
                                        {milestone.suggestedCourses.length > 0 ? (
                                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth pr-8">
                                                {milestone.suggestedCourses.map((course, idx) => (
                                                    <a
                                                        key={`${course.name}-${idx}`}
                                                        href={course.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex flex-col justify-between flex-shrink-0 w-64 snap-start block bg-background border border-border rounded-lg p-4 group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary h-32"
                                                    >
                                                        <h5 className="font-semibold text-text-primary text-base leading-snug line-clamp-3">{course.name}</h5>
                                                        <div className="flex items-center text-sm text-primary mt-2 font-semibold">
                                                            <span>View Course</span>
                                                            <ExternalLink className="h-4 w-4 ml-auto text-text-secondary transition-transform group-hover:translate-x-0.5" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-secondary italic">No courses recommended for this milestone.</p>
                                        )}
                                    </Section>

                                    <Section icon={<Code className="h-5 w-5 text-primary"/>} title="Capstone Project">
                                        <Card className="bg-background">
                                            <h5 className="font-semibold text-text-primary">{milestone.capstoneProject.title}</h5>
                                            <p className="text-sm text-text-secondary mt-1">{milestone.capstoneProject.description}</p>
                                        </Card>
                                    </Section>

                                     <div className="mt-8 pt-6 border-t border-border">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                                            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${milestoneProgressPercentage}%`}}></div>
                                        </div>
                                        
                                        <Button 
                                            onClick={() => handleInitiateInterview(milestone)} 
                                            disabled={!isMilestoneComplete}
                                            className="w-full"
                                        >
                                            {!isMilestoneComplete && <Lock className="h-4 w-4 mr-2"/>}
                                            {isMilestoneComplete ? 'Start Mock Interview' : `Complete skills to unlock mock interview (${completedSkillsCount}/${totalSkills})`}
                                        </Button>
                                        
                                        {milestoneFeedbacks.length > 0 && (
                                            <div className="mt-6 space-y-3">
                                                 <h4 className="font-semibold text-text-primary">Interview Feedback</h4>
                                                 {milestoneFeedbacks
                                                    .sort((a,b) => a.round.localeCompare(b.round))
                                                    .map(feedback => (
                                                        <FeedbackResult key={`${feedback.milestoneTitle}-${feedback.round}`} feedback={feedback} />
                                                 ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )})}
                </div>

                {/* Side Column for Soft Skills & Networking */}
                <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
                    <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
                        <h3 className="flex items-center text-xl font-bold text-text-primary">
                            <Lightbulb className="h-6 w-6 text-primary mr-3"/>
                            Soft Skills
                        </h3>
                        <div className="mt-4 space-y-4">
                            {roadmap.softSkills.map(softSkill => (
                                <div key={softSkill.skill}>
                                    <h4 className="font-semibold text-text-primary">{softSkill.skill}</h4>
                                    <p className="text-sm text-text-secondary">{softSkill.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
                        <h3 className="flex items-center text-xl font-bold text-text-primary">
                            <Users className="h-6 w-6 text-primary mr-3"/>
                            Networking
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-semibold text-text-primary">Suggestion</h4>
                                <p className="text-sm text-text-secondary">{roadmap.networkingSuggestions.suggestion}</p>
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-text-primary">Message Template</h4>
                                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                                        {copied ? <ClipboardCheck className="h-4 w-4 mr-1"/> : <Clipboard className="h-4 w-4 mr-1"/>}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <div className="mt-2 p-3 bg-background rounded-md text-sm text-text-secondary border border-border">
                                    <p className="whitespace-pre-wrap">{roadmap.networkingSuggestions.messageTemplate}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="animate-scale-in" style={{ animationDelay: '300ms' }}>
                        <h3 className="flex items-center text-xl font-bold text-text-primary">
                            <Search className="h-6 w-6 text-primary mr-3"/>
                            Relevant Jobs
                        </h3>
                        <div className="mt-4">
                            {isFindingJobs ? (
                                <div className="flex flex-col items-center justify-center h-24">
                                    <Spinner />
                                    <p className="text-sm text-text-secondary mt-2">Finding jobs for you...</p>
                                </div>
                            ) : !jobs ? (
                                <>
                                    <p className="text-sm text-text-secondary mb-4">Discover job opportunities tailored to your career goal.</p>
                                    <Button onClick={handleFindJobs} className="w-full">
                                        Find Jobs
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    {jobs.map((job, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                                            <div>
                                                <p className="font-semibold text-text-primary text-sm">{job.designation}</p>
                                                <p className="text-xs text-text-secondary">{job.companyName}</p>
                                            </div>
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenApplyModal(job)}>
                                                Apply
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
             {selectedMilestone && (
                 <InterviewSetupModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    milestoneTitle={selectedMilestone.title}
                />
            )}
            {selectedJobForApply && (
                 <ApplicationHelperModal
                    isOpen={isApplyModalOpen}
                    onClose={() => setIsApplyModalOpen(false)}
                    job={selectedJobForApply}
                    resumeData={resumeData}
                />
            )}
        </div>
    );
};

export default RoadmapDisplay;
