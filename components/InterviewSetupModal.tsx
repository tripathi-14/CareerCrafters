import React, { useState } from 'react';
import { InterviewRound, InterviewType } from '../types';
import Button from './ui/Button';
import { Bot, MessageSquare, Mic, Shield, Users, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: InterviewType, round: InterviewRound) => void;
  milestoneTitle: string;
}

const rounds: { id: InterviewRound, label: string, icon: React.ReactNode }[] = [
    { id: 'General', label: 'General', icon: <Bot size={20} /> },
    { id: 'Technical', label: 'Technical', icon: <Zap size={20} /> },
    { id: 'HR', label: 'HR', icon: <Users size={20} /> },
    { id: 'Leadership', label: 'Leadership', icon: <Shield size={20} /> },
];

const types: { id: InterviewType, label: string, icon: React.ReactNode }[] = [
    { id: InterviewType.CHAT, label: 'Chat-based', icon: <MessageSquare size={20} /> },
    { id: InterviewType.AUDIO, label: 'Audio-based', icon: <Mic size={20} /> },
];


const InterviewSetupModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, milestoneTitle }) => {
    const [selectedRound, setSelectedRound] = useState<InterviewRound>('General');
    const [selectedType, setSelectedType] = useState<InterviewType>(InterviewType.CHAT);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit(selectedType, selectedRound);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-xl shadow-2xl w-full max-w-lg p-8 space-y-8 transform transition-transform animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Start Mock Interview</h2>
                    <p className="text-text-secondary mt-1">Configure your interview for: <span className="font-semibold text-primary">{milestoneTitle}</span></p>
                </div>

                {/* Interview Round Selection */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-text-primary">Choose Interview Round</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {rounds.map(round => (
                            <button
                                key={round.id}
                                onClick={() => setSelectedRound(round.id)}
                                className={`flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 transition-all duration-200 ${selectedRound === round.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:border-primary/50'}`}
                            >
                                {round.icon}
                                <span className="mt-2 text-sm font-medium">{round.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interview Type Selection */}
                 <div className="space-y-3">
                    <h3 className="font-semibold text-text-primary">Choose Interview Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {types.map(type => (
                             <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${selectedType === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:border-primary/50'}`}
                            >
                                {type.icon}
                                <span className="mt-2 text-sm font-medium">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Begin Interview</Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewSetupModal;
