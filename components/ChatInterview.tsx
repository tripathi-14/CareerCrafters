import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Milestone, ResumeData, UserProfile, InterviewFeedback, InterviewRound } from '../types';
import { getInterviewFeedback } from '../services/geminiService';
import Button from './ui/Button';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import { Send } from 'lucide-react';

interface Props {
  milestone: Milestone;
  round: InterviewRound;
  resumeData: ResumeData;
  userProfile: UserProfile;
  onComplete: (feedback: InterviewFeedback) => void;
}

const ChatInterview: React.FC<Props> = ({ milestone, round, resumeData, userProfile, onComplete }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `You are a friendly but professional interviewer. Your goal is to assess a candidate for a role based on a specific career milestone.
        This is a '${round}' round interview.
        The candidate's target role is '${userProfile.targetDesignation}'. 
        This interview focuses on the milestone: '${milestone.title}', which requires knowledge in '${milestone.skillsToAcquire.join(', ')}'.
        Based on the round type, ask relevant questions. For a 'Technical' round, focus on the skills. For 'HR', ask behavioral questions. For 'Leadership', ask situational questions. For 'General', ask a mix.
        Start with a greeting and the first question. Ask 3-4 questions in total, one by one. Do not provide feedback during the interview. Keep your responses concise.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction }
        });
        setChat(newChat);
        
        const initialResponse = await newChat.sendMessage({ message: "Hello, let's begin the interview." });
        setMessages([{ role: 'model', text: initialResponse.text }]);
      } catch (e) {
        console.error("Failed to initialize chat", e);
        setMessages([{role: 'model', text: 'Sorry, there was an error starting the interview. Please try again later.'}])
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone, userProfile, round]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage = { role: 'user' as const, text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const response = await chat.sendMessage({ message: userInput });
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch(err) {
        console.error("Error sending message:", err);
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsFinishing(true);
    const chatHistory = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
    try {
      const feedbackData = await getInterviewFeedback(chatHistory, milestone, resumeData, round, false);
      onComplete({
        milestoneTitle: milestone.title,
        round: round,
        ...feedbackData,
      });
    } catch (err) {
      console.error("Failed to get feedback:", err);
      // Fallback in case of API error
      onComplete({
        milestoneTitle: milestone.title,
        round: round,
        overallScore: 0,
        scoreReason: 'Could not be generated due to an error.',
        strengths: [],
        areasForImprovement: ['Failed to generate feedback due to an error.'],
        detailedFeedback: 'Could not retrieve feedback from the AI.'
      });
    }
  };

  return (
    <Card className="flex flex-col h-[70vh] max-h-[800px]">
      <h2 className="text-xl font-bold mb-4 text-primary border-b border-white/10 pb-2">Chat Interview: {milestone.title} ({round})</h2>
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-background text-text-primary'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
             <div className="max-w-md px-4 py-2 rounded-lg bg-background text-text-primary">
                <Spinner size="sm" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer..."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading || isFinishing}
          />
          <Button type="submit" disabled={isLoading || isFinishing || !userInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-center mt-4">
          <Button 
            variant="secondary" 
            onClick={handleEndInterview} 
            disabled={isLoading || isFinishing || messages.length < 2}
          >
            {isFinishing ? <><Spinner size="sm" className="mr-2"/>Analyzing...</> : 'End Interview & Get Feedback'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterview;