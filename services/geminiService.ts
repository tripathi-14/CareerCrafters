
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, UserProfile, Roadmap, Milestone, InterviewFeedback, InterviewRound, Job } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses a JSON string from a Gemini response, safely handling markdown code blocks.
 * @param responseText The raw text from the Gemini API response.
 * @returns The parsed JSON object.
 */
const parseGeminiResponse = <T>(responseText: string): T => {
    try {
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        return JSON.parse(jsonStr) as T;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", responseText);
        throw new Error("The AI model returned an invalid data format. Please try again.");
    }
};

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        personalInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                age: { type: Type.INTEGER, nullable: true },
                currentDesignation: { type: Type.STRING },
            },
        },
        workExperience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    summary: { type: Type.STRING },
                },
            },
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.INTEGER, nullable: true },
                },
            },
        },
        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
                },
            },
        },
    },
};

export const extractResumeDataFromText = async (resumeText: string): Promise<ResumeData> => {
    if (!resumeText.trim()) {
        throw new Error("The provided text is empty. Please paste your resume or describe your experience.");
    }

    const prompt = `Based on the following text, which is either a pasted resume or a self-description, extract the user's professional information. Identify personal details (name, age, current role), all work experiences (role, company, duration, job summary), education history, and a list of technical and soft skills. For each skill, estimate an expertise level (Beginner, Intermediate, Advanced, Expert) based on the context provided. If some information is not available, leave it blank but maintain the structure. Structure the output in the requested JSON format. Here is the text:\n\n${resumeText}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
        }
    });

    return parseGeminiResponse<ResumeData>(response.text);
};


const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        gapAnalysis: { type: Type.STRING },
        milestones: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedCourses: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the course." },
                                link: { type: Type.STRING, description: "A valid URL to the course." }
                            }
                        } 
                    },
                    capstoneProject: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    },
                }
            }
        },
        softSkills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        },
        networkingSuggestions: {
            type: Type.OBJECT,
            properties: {
                suggestion: { type: Type.STRING },
                messageTemplate: { type: Type.STRING }
            }
        }
    }
}

export const generateRoadmap = async (resumeData: ResumeData, userProfile: UserProfile): Promise<Roadmap> => {
    const prompt = `
        Based on the following resume data and career goals, generate a comprehensive, personalized career roadmap.

        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}

        Career Goals:
        Target Designation: ${userProfile.targetDesignation}
        Expected Salary Range: ${userProfile.expectedSalaryMin} - ${userProfile.expectedSalaryMax}

        Instructions:
        1.  Provide a 'gapAnalysis' as a 2-paragraph summary written in a professional and encouraging tone. The first paragraph should summarize the user's current situation based on their resume and state their target role. The second paragraph should be an encouraging bridge, explaining how this roadmap will guide them toward their goal.
        2.  Create exactly 3 actionable 'milestones'. This is a strict requirement. Each milestone must follow the same structure.
        3.  For each milestone, you MUST provide all of the following: a clear 'title', a short 'description', a list of specific 'skillsToAcquire', a list of 2-3 'suggestedCourses' (each with a 'name' and a valid 'link'), and a relevant 'capstoneProject' (with a 'title' and 'description'). Do NOT include a timeline.
        4.  Provide a list of 3-4 key 'softSkills' (with skill name and description) that are crucial for the target role.
        5.  Provide 'networkingSuggestions' including a general suggestion and a professional, ready-to-use 'messageTemplate' for reaching out to people on LinkedIn for informational interviews.
        6.  The roadmap should be realistic and tailored to the provided information.
        7.  Ensure the output is in the requested JSON format.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: roadmapSchema,
        }
    });

    return parseGeminiResponse<Roadmap>(response.text);
}

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER, description: "A score from 1 to 10." },
        scoreReason: { type: Type.STRING, description: "A concise, 1-2 sentence justification for the score provided." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
        detailedFeedback: { type: Type.STRING },
    }
}

const vocalDeliveryMetricSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "A score from 1 to 10." },
        feedback: { type: Type.STRING, description: "1-2 sentences of feedback for this specific metric." },
    }
};

const audioFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        ...feedbackSchema.properties,
        vocalDelivery: {
            type: Type.OBJECT,
            properties: {
                pace: vocalDeliveryMetricSchema,
                clarity: vocalDeliveryMetricSchema,
                confidence: vocalDeliveryMetricSchema,
                fillerWords: vocalDeliveryMetricSchema,
                energy: vocalDeliveryMetricSchema,
            }
        }
    }
}

export const getInterviewFeedback = async (
    chatHistory: string,
    milestone: Milestone,
    resumeData: ResumeData,
    round: InterviewRound,
    isAudio: boolean
): Promise<Omit<InterviewFeedback, 'milestoneTitle' | 'round'>> => {

    const prompt = `
        As an expert career coach, analyze the following interview transcript and provide feedback.

        Candidate's Resume Summary:
        - Current Role: ${resumeData.personalInfo.currentDesignation}
        - Key Skills: ${resumeData.skills.map(s => s.name).join(', ')}

        Interview Context:
        - This was a '${round}' round interview.
        - This interview was for the milestone: "${milestone.title}".
        - The goal of this milestone was to develop skills in: ${milestone.skillsToAcquire.join(', ')}.

        Interview Transcript:
        ${chatHistory}

        Instructions:
        1. Evaluate the candidate's responses based on relevance, depth, and alignment with the milestone's goals and the '${round}' interview type.
        2. Provide an 'overallScore' from 1 to 10.
        3. Provide a concise 'scoreReason' (1-2 sentences) that directly justifies the score, referencing specific strengths or weaknesses.
        4. List key 'strengths' demonstrated by the candidate.
        5. List specific 'areasForImprovement'.
        6. Write a 'detailedFeedback' summary that acts as a broader, constructive assessment of the overall performance.
        ${isAudio ? `7. Also, provide a unique and simulated 'vocalDelivery' analysis. This analysis MUST be directly inferred from the provided interview transcript. For each metric (pace, clarity, confidence, fillerWords, energy), provide a 'score' from 1 to 10 and a short, specific 'feedback' text. Justify your assessment by referencing the candidate's word choice, sentence structure, or response patterns found in the transcript. For example, if the candidate used phrases like 'I think...' or 'maybe...', mention this as a reason for a lower confidence score. If their answers are consistently short, it might affect their 'energy' score. AVOID generic, boilerplate feedback. The analysis for this interview should be distinct from any other interview.` : ""}
        8. Ensure the output is in the requested JSON format.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: isAudio ? audioFeedbackSchema : feedbackSchema,
        }
    });
    
    return parseGeminiResponse<Omit<InterviewFeedback, 'milestoneTitle' | 'round'>>(response.text);
}

const jobsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            designation: { type: Type.STRING },
            companyName: { type: Type.STRING }
        },
        required: ['designation', 'companyName']
    }
}

export const findRelevantJobs = async (userProfile: UserProfile): Promise<Job[]> => {
    const prompt = `
        Based on the user's target role of '${userProfile.targetDesignation}', generate a list of exactly 6 fictional but realistic job openings in the tech industry.
        For each job, provide a 'designation' and a 'companyName'.
        Ensure the output is in the requested JSON array format.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: jobsSchema,
        }
    });

    return parseGeminiResponse<Job[]>(response.text);
};


export const generateApplicationContent = async (
    resumeData: ResumeData,
    job: Job,
    type: 'summary' | 'coverLetter'
): Promise<string> => {

    const contentRequest = type === 'summary'
        ? `Generate a concise professional summary in 4-5 bullet points, tailored for the job application of '${job.designation}' at '${job.companyName}'. Highlight the most relevant skills and experiences from the resume.`
        : `Write a professional and compelling cover letter for the job application of '${job.designation}' at '${job.companyName}'. The letter should be addressed to the 'Hiring Manager', express enthusiasm for the role, highlight 2-3 key experiences or skills from the resume that align with the job, and conclude with a call to action. Keep it concise, professional, and within 200 words.`;

    const prompt = `
        A candidate is applying for a job. Here is their resume data and the job details. Please generate the requested content.

        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}

        Job Details:
        - Designation: ${job.designation}
        - Company: ${job.companyName}

        Content Request:
        ${contentRequest}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};
