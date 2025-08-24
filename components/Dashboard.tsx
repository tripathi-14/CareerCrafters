import React from 'react';
import { ResumeData, UserProfile, Roadmap, InterviewFeedback, Skill } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';
import { ArrowLeft } from 'lucide-react';
import VocalDeliveryAnalysis from './VocalDeliveryAnalysis';

interface Props {
  resumeData: ResumeData;
  userProfile: UserProfile;
  roadmap: Roadmap;
  interviewFeedbacks: InterviewFeedback[];
  onNavigateToRoadmap: () => void;
}

const SkillGapReport: React.FC<{ roadmap: Roadmap; resumeSkills: Skill[] }> = ({ roadmap, resumeSkills }) => {
  const targetSkills = new Set(roadmap.milestones.flatMap(m => m.skillsToAcquire));
  const resumeSkillNames = new Set(resumeSkills.map(s => s.name.toLowerCase()));
  const gapSkills = [...targetSkills].filter(skill => !resumeSkillNames.has(skill.toLowerCase()));

  return (
    <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold mb-4">Skill Gap Report</h3>
      {gapSkills.length > 0 ? (
        <>
          <p className="text-text-secondary mb-3">Skills to focus on to reach your target role:</p>
          <div className="flex flex-wrap gap-2">
            {gapSkills.map(skill => (
              <span key={skill} className="bg-yellow-400/20 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-green-600">Excellent! You have all the required skills mentioned in the roadmap.</p>
      )}
    </Card>
  );
};


const InterviewPerformanceChart: React.FC<{ feedbacks: InterviewFeedback[] }> = ({ feedbacks }) => {
  const data = feedbacks.map(f => ({
    name: f.milestoneTitle.split(' ').slice(0, 2).join(' '),
    score: f.overallScore
  }));

  return (
    <Card className="animate-scale-in" style={{ animationDelay: '300ms' }}>
      <h3 className="text-lg font-semibold mb-4">Interview Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 90%)" />
          <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" />
          <YAxis domain={[0, 10]} stroke="hsl(240, 5%, 55%)" />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(240, 10%, 90%)' }} cursor={{fill: 'hsla(245, 90%, 65%, 0.1)'}} />
          <Legend wrapperStyle={{color: 'hsl(240, 5%, 55%)'}}/>
          <Bar dataKey="score" fill="hsl(245, 90%, 65%)" name="Overall Score (out of 10)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface CareerProgressReportProps {
    roadmap: Roadmap;
    feedbacks: InterviewFeedback[];
    userProfile: UserProfile;
}

const CareerProgressReport: React.FC<CareerProgressReportProps> = ({ roadmap, feedbacks, userProfile }) => {
    const completedMilestones = feedbacks.length;
    const totalMilestones = roadmap.milestones.length;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    
    const data = [
        { name: 'Completed', value: completedMilestones },
        { name: 'Remaining', value: totalMilestones - completedMilestones },
    ];

    const COLORS = ['hsl(145, 63%, 49%)', 'hsl(240, 10%, 90%)'];

    return (
        <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold mb-4">Career Progress</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(240, 10%, 90%)' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <p className="text-4xl font-bold text-primary">{Math.round(progress)}%</p>
                    <p className="text-text-secondary">complete towards your goal of becoming a {userProfile.targetDesignation}.</p>
                    <p className="mt-2 text-sm text-text-secondary">{completedMilestones} of {totalMilestones} milestones completed.</p>
                </div>
            </div>
        </Card>
    );
}

const Dashboard: React.FC<Props> = ({ resumeData, userProfile, roadmap, interviewFeedbacks, onNavigateToRoadmap }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in">
        <h2 className="text-3xl font-bold text-text-primary">Analytics Dashboard</h2>
        <Button onClick={onNavigateToRoadmap} variant="secondary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Roadmap
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareerProgressReport roadmap={roadmap} feedbacks={interviewFeedbacks} userProfile={userProfile} />
        <SkillGapReport roadmap={roadmap} resumeSkills={resumeData.skills} />
      </div>

      {interviewFeedbacks.length > 0 && <InterviewPerformanceChart feedbacks={interviewFeedbacks} />}
      
       <div className="space-y-4">
        <h3 className="text-2xl font-bold mt-8 text-text-primary animate-fade-in" style={{ animationDelay: '400ms' }}>Interview Feedback History</h3>
        {interviewFeedbacks.map((feedback, index) => (
          <Card key={index} className="animate-scale-in" style={{ animationDelay: `${500 + index * 100}ms`}}>
            <h4 className="text-lg font-semibold text-primary">{feedback.milestoneTitle}</h4>
            <p className="text-sm text-text-secondary mb-1">Overall Score: {feedback.overallScore}/10</p>
            <p className="text-sm text-text-secondary italic bg-background p-2 rounded-md border border-border mb-3">"{feedback.scoreReason}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-green-600">Strengths</h5>
                <ul className="list-disc list-inside text-text-secondary text-sm">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-yellow-600">Areas for Improvement</h5>
                <ul className="list-disc list-inside text-text-secondary text-sm">
                  {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
             {feedback.vocalDelivery && (
                <VocalDeliveryAnalysis vocalDelivery={feedback.vocalDelivery} />
            )}
          </Card>
        ))}
        {interviewFeedbacks.length === 0 && (
            <Card className="animate-scale-in">
                <p className="text-text-secondary text-center">No interview feedback yet. Complete a mock interview to see your performance history.</p>
            </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;