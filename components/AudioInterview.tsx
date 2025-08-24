
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Milestone, ResumeData, UserProfile, InterviewFeedback, InterviewRound } from '../types';
import { getInterviewFeedback } from '../services/geminiService';
import { useSpeechToText } from '../hooks/useSpeechToText';
import Button from './ui/Button';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import { Mic, MicOff, Send } from 'lucide-react';

interface Props {
  milestone: Milestone;
  round: InterviewRound;
  resumeData: ResumeData;
  userProfile: UserProfile;
  onComplete: (feedback: InterviewFeedback) => void;
}

const AudioInterview: React.FC<Props> = ({ milestone, round, resumeData, userProfile, onComplete }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const questionCount = useRef(0);
  
  const { isListening, transcript, error, startListening, stopListening, hasRecognitionSupport } = useSpeechToText();

  useEffect(() => {
    const initializeChat = async () => {
      setIsProcessing(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are an interviewer for an audio interview. 
      This is a '${round}' round interview.
      The candidate's target role is '${userProfile.targetDesignation}'. 
      This interview focuses on the milestone: '${milestone.title}'.
      Based on the round type, ask relevant questions. For a 'Technical' round, focus on the skills. For 'HR', ask behavioral questions. For 'Leadership', ask situational questions. For 'General', ask a mix.
      Ask one question at a time. After the user provides an answer, you will say "Thank you. Here is the next question:" followed by the new question. 
      Ask a total of 3 questions. After the third question's answer, respond with "Thank you, that concludes the interview.".
      Start with a greeting and the first question.`;
      
      const newChat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
      setChat(newChat);
      
      const initialResponse = await newChat.sendMessage({ message: "Hello, please start the interview." });
      setCurrentQuestion(initialResponse.text);
      questionCount.current = 1;
      setIsProcessing(false);
    };
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone, userProfile, round]);

  const handleNextQuestion = async () => {
    if (!chat || !transcript.trim()) return;

    setIsProcessing(true);
    stopListening();

    const answer = transcript;
    const currentFullTranscript = fullTranscript + `\n\nInterviewer: ${currentQuestion}\nCandidate: ${answer}`;
    setFullTranscript(currentFullTranscript);

    const response = await chat.sendMessage({ message: answer });
    setCurrentQuestion(response.text);
    
    if (questionCount.current < 3) {
      questionCount.current++;
      setIsProcessing(false);
      setIsAnswering(false);
    } else {
      await handleEndInterview(currentFullTranscript);
    }
  };

  const handleEndInterview = async (finalTranscript: string) => {
    setIsFinishing(true);
    try {
      const feedbackData = await getInterviewFeedback(finalTranscript, milestone, resumeData, round, true);
      onComplete({
        milestoneTitle: milestone.title,
        round: round,
        ...feedbackData,
      });
    } catch (err) {
        console.error("Error getting feedback", err);
        onComplete({
            milestoneTitle: milestone.title,
            round: round,
            overallScore: 0,
            scoreReason: 'Could not be generated due to an error.',
            strengths: [],
            areasForImprovement: ['Failed to generate feedback due to an error.'],
            detailedFeedback: 'Could not retrieve feedback from the AI.',
            vocalDelivery: {
                pace: { score: 0, feedback: 'N/A' },
                clarity: { score: 0, feedback: 'N/A' },
                confidence: { score: 0, feedback: 'N/A' },
                fillerWords: { score: 0, feedback: 'N/A' },
                energy: { score: 0, feedback: 'N/A' },
            }
        });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (isFinishing) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-8">
        <Spinner size="lg" />
        <p className="text-text-secondary text-center">Analyzing your performance and generating feedback...</p>
      </Card>
    );
  }
  
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">Audio Interview: {milestone.title} ({round})</h2>
      
      <div className="min-h-[200px] bg-background p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-text-secondary mb-2">Interviewer Question:</h3>
        {isProcessing && !currentQuestion ? <Spinner size="sm"/> : <p className="text-lg">{currentQuestion}</p>}
      </div>

      {!hasRecognitionSupport && <p className="text-red-500">Your browser does not support speech recognition.</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="space-y-4">
        <textarea
          value={transcript}
          readOnly
          placeholder="Your transcribed answer will appear here..."
          className="w-full h-32 bg-background border border-border rounded-md p-2"
        />
        <div className="flex items-center justify-center gap-4">
          <Button onClick={toggleListening} disabled={isProcessing} className="w-24">
            {isListening ? <><MicOff className="mr-2 h-4 w-4" /> Stop</> : <><Mic className="mr-2 h-4 w-4" /> Speak</>}
          </Button>
          <Button onClick={handleNextQuestion} disabled={isProcessing || isListening || !transcript.trim()}>
            <Send className="mr-2 h-4 w-4" /> Submit Answer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AudioInterview;