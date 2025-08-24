import React, { useState } from 'react';
import { ResumeData, UserProfile, Skill } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import TrashIcon from './icons/TrashIcon';
import { ChevronDown } from 'lucide-react';

interface EditorProps {
  step: 'personal_info' | 'skills' | 'experience' | 'goals';
  resumeData: ResumeData;
  userProfile: UserProfile;
  onResumeChange: (data: ResumeData) => void;
  onProfileChange: (profile: UserProfile) => void;
}

const skillLevels: Skill['level'][] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const ResumeEditorJourney: React.FC<EditorProps> = ({ step, resumeData, userProfile, onResumeChange, onProfileChange }) => {
    const [openExperienceIndex, setOpenExperienceIndex] = useState<number | null>(0);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onResumeChange({
            ...resumeData,
            personalInfo: { ...resumeData.personalInfo, [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value }
        });
    };

    const handleSkillChange = (index: number, field: 'name' | 'level', value: string) => {
        const newSkills = [...resumeData.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        onResumeChange({ ...resumeData, skills: newSkills });
    };

    const handleRemoveSkill = (index: number) => {
        onResumeChange({
            ...resumeData,
            skills: resumeData.skills.filter((_, i) => i !== index)
        });
    };
    
    const handleAddSkill = () => {
        onResumeChange({
            ...resumeData,
            skills: [...resumeData.skills, { name: '', level: 'Intermediate' }]
        });
    };
    
    const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newExperience = [...resumeData.workExperience];
        newExperience[index] = { ...newExperience[index], [name]: value };
        onResumeChange({ ...resumeData, workExperience: newExperience });
    };

    const handleRemoveExperience = (index: number) => {
        onResumeChange({
            ...resumeData,
            workExperience: resumeData.workExperience.filter((_, i) => i !== index)
        });
    };

    const handleAddExperience = () => {
        const newExperience = [...resumeData.workExperience, { role: '', company: '', duration: '', summary: '' }];
        onResumeChange({
            ...resumeData,
            workExperience: newExperience
        });
        setOpenExperienceIndex(newExperience.length - 1);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onProfileChange({ ...userProfile, [name]: value });
    };

    switch (step) {
        case 'personal_info':
            return (
                <div className="space-y-4">
                    <Input label="Full Name" id="name" name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} />
                    <Input label="Current Designation" id="currentDesignation" name="currentDesignation" value={resumeData.personalInfo.currentDesignation} onChange={handlePersonalInfoChange} />
                    <Input label="Age" id="age" name="age" type="number" value={resumeData.personalInfo.age || ''} onChange={handlePersonalInfoChange} />
                </div>
            );
        case 'skills':
            return (
                <div className="space-y-6">
                    <div className="space-y-3">
                        {resumeData.skills.map((skill, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                                <input
                                    type="text"
                                    placeholder="e.g., React"
                                    value={skill.name}
                                    onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <div className="relative">
                                    <select
                                        value={skill.level}
                                        onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                                        className="bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8"
                                    >
                                        {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveSkill(index)} className="inline-flex items-center justify-center rounded-md h-10 w-10 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                                     <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddSkill} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                        + Add another skill
                    </button>
                </div>
            );
        case 'experience':
            return (
                <div className="space-y-4">
                    {resumeData.workExperience.map((exp, index) => {
                        const isOpen = openExperienceIndex === index;
                        return (
                            <div key={index} className="border border-border rounded-lg overflow-hidden animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                <button 
                                    onClick={() => setOpenExperienceIndex(isOpen ? null : index)}
                                    className="w-full flex justify-between items-center p-4 bg-background hover:bg-slate-100 transition-colors text-left"
                                >
                                    <div>
                                        <p className="font-semibold text-text-primary">{exp.role || 'New Role'}</p>
                                        <p className="text-sm text-text-secondary">{exp.company || 'Company Name'}</p>
                                    </div>
                                    <ChevronDown className={`h-5 w-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isOpen && (
                                    <div className="p-4 space-y-3 bg-white">
                                        <Input label="Role" name="role" value={exp.role} onChange={(e) => handleExperienceChange(index, e)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Company" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} />
                                            <Input label="Duration" name="duration" value={exp.duration} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., 2020 - Present"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
                                            <textarea name="summary" value={exp.summary} onChange={(e) => handleExperienceChange(index, e)} rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                        </div>
                                        <div className="flex justify-end pt-2 border-t border-border mt-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExperience(index)}
                                                className="inline-flex items-center justify-center rounded-md h-10 w-10 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    <button onClick={handleAddExperience} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors pt-2">
                        + Add another experience
                    </button>
                </div>
            );
        case 'goals':
            return (
                <div className="space-y-6">
                    <div>
                        <label htmlFor="targetDesignation" className="block text-sm font-semibold text-text-primary mb-2">
                            Expected Designation
                        </label>
                        <input
                            id="targetDesignation"
                            name="targetDesignation"
                            value={userProfile.targetDesignation}
                            onChange={handleProfileChange}
                            placeholder="e.g., Senior Frontend Engineer"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Expected Salary Range (Annual)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                name="expectedSalaryMin"
                                value={userProfile.expectedSalaryMin}
                                onChange={handleProfileChange}
                                placeholder="Minimum, e.g., ₹25,00,000"
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <input
                                name="expectedSalaryMax"
                                value={userProfile.expectedSalaryMax}
                                onChange={handleProfileChange}
                                placeholder="Maximum, e.g., ₹35,00,000"
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

export default ResumeEditorJourney;