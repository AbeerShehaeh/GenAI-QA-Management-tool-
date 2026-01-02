
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Document, Requirement, TestCase, DocumentStatus, RequirementStatus, RequirementType, Priority, TestCaseStatus, Severity, ToastMessage, UserStory, UserStoryStatus, RecentSearch, Theme } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_REQUIREMENTS, INITIAL_TEST_CASES } from '../constants';

interface ProjectContextType {
    documents: Document[];
    requirements: Requirement[];
    testCases: TestCase[];
    userStories: UserStory[];
    recentSearches: RecentSearch[];
    toasts: ToastMessage[];
    theme: Theme;
    toggleTheme: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    removeToast: (id: number) => void;
    addDocuments: (files: File[]) => void;
    deleteDocument: (id: string) => void;
    extractRequirements: (documentId: string) => Promise<void>;
    addRequirement: (requirementData: Omit<Requirement, 'id' | 'status' | 'createdOn' | 'qualityScore'>) => void;
    updateRequirement: (updatedRequirement: Partial<Requirement> & { id: string }) => void;
    bulkUpdateRequirements: (ids: string[], updates: Partial<Pick<Requirement, 'status' | 'type' | 'priority'>>) => void;
    generateTestCases: (requirementIds: string[]) => Promise<void>;
    addTestCase: (testCaseData: Omit<TestCase, 'id' | 'status' | 'requirementId' | 'linkMethod'>, requirementId: string) => void;
    updateTestCase: (updatedTestCase: TestCase) => void;
    deleteTestCase: (id: string) => void;
    addUserStories: (files: File[]) => void;
    deleteUserStory: (id: string) => void;
    updateUserStory: (story: UserStory) => void;
    extractUserStory: (id: string) => Promise<void>;
    generateTestCasesForUserStory: (id: string) => Promise<void>;
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
    kpis: {
        totalRequirements: number;
        testCasesGenerated: number;
        overallCoverage: number;
        approvedTestCases: number;
    };
    requirementCoverageData: { name: string; value: number }[];
    testCaseStatusData: { name: string; value: number }[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const MAX_CONCURRENT_EXTRACTIONS = 3;
const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
    const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_REQUIREMENTS);
    const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
    const [userStories, setUserStories] = useState<UserStory[]>([]);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('app-theme');
        return (saved as Theme) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addDocuments = (files: File[]) => {
        const newDocuments: Document[] = files.map(file => ({
            id: `doc-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            dateUploaded: new Date().toISOString(),
            status: DocumentStatus.Pending,
            content: '',
        }));

        setDocuments(prev => [...prev, ...newDocuments]);
        
        newDocuments.forEach((doc, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setDocuments(prev => prev.map(d => d.id === doc.id ? {...d, content} : d));
            };
            reader.readAsDataURL(files[index]);
        });
    };

    const deleteDocument = (id: string) => {
        const docToDelete = documents.find(d => d.id === id);
        if (!docToDelete) return; 

        const requirementsToDeleteIds = new Set(
            requirements
                .filter(req => req.source === docToDelete.fileName)
                .map(req => req.id)
        );

        setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== id));
        setRequirements(prevRequirements => prevRequirements.filter(req => !requirementsToDeleteIds.has(req.id)));
        setTestCases(prevTestCases => prevTestCases.filter(tc => !requirementsToDeleteIds.has(tc.requirementId)));
    };
    
    const extractRequirements = useCallback(async (documentId: string) => {
        const doc = documents.find(d => d.id === documentId);
        if (!doc || !doc.content) {
            setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status: DocumentStatus.Error } : d));
            return;
        }

        if (!SUPPORTED_MIME_TYPES.includes(doc.fileType)) {
            setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status: DocumentStatus.Error } : d));
            addToast(`File type not supported.`, 'error');
            return;
        }

        setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status: DocumentStatus.Parsing } : d));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = doc.content.split(',')[1];
            const filePart = { inlineData: { mimeType: doc.fileType, data: base64Data } };
            const textPart = { text: `Extract all individual software requirements from this document. Provide them in a structured JSON list.` };

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { parts: [textPart, filePart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                text: { type: Type.STRING },
                                type: { type: Type.STRING, enum: Object.values(RequirementType) },
                                priority: { type: Type.STRING, enum: Object.values(Priority) },
                            },
                            required: ["id", "text", "type", "priority"]
                        }
                    },
                }
            });
            
            const jsonResult = JSON.parse(response.text.trim());
            const newRequirements: Requirement[] = jsonResult.map((item: any) => ({
                id: item.id || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                text: item.text || 'No text provided',
                source: doc.fileName,
                status: RequirementStatus.Unmapped,
                type: item.type || RequirementType.Functional,
                priority: item.priority || Priority.Medium,
                createdOn: new Date().toISOString(),
                qualityScore: Math.floor(Math.random() * (98 - 75 + 1) + 75),
            }));

            setRequirements(prev => [...prev, ...newRequirements]);
            setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status: DocumentStatus.Success } : d));
            addToast(`${doc.fileName} processed: ${newRequirements.length} requirements extracted.`, 'success');
        } catch (error) {
            console.error("Extraction error:", error);
            setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status: DocumentStatus.Error } : d));
            addToast(`Processing failed for ${doc.fileName}`, 'error');
        }
    }, [documents, addToast]);

    const addRequirement = (requirementData: Omit<Requirement, 'id' | 'status' | 'createdOn' | 'qualityScore'>) => {
        const newRequirement: Requirement = {
            id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            status: RequirementStatus.Unmapped,
            createdOn: new Date().toISOString(),
            qualityScore: 100,
            ...requirementData,
        };
        setRequirements(prev => [...prev, newRequirement]);
    };

    const updateRequirement = (updatedRequirement: Partial<Requirement> & { id: string }) => {
        setRequirements(prev =>
            prev.map(req =>
                req.id === updatedRequirement.id
                    ? { ...req, ...updatedRequirement, lastUpdated: new Date().toISOString() }
                    : req
            )
        );
    };

    const bulkUpdateRequirements = (ids: string[], updates: Partial<Pick<Requirement, 'status' | 'type' | 'priority'>>) => {
        const idSet = new Set(ids);
        const now = new Date().toISOString();
        setRequirements(prev =>
            prev.map(req => idSet.has(req.id) ? { ...req, ...updates, lastUpdated: now } : req)
        );
    };

    useEffect(() => {
        const parsingCount = documents.filter(doc => doc.status === DocumentStatus.Parsing).length;
        const pendingDocs = documents.filter(doc => doc.status === DocumentStatus.Pending && doc.content);
        const availableSlots = MAX_CONCURRENT_EXTRACTIONS - parsingCount;
        if (availableSlots > 0 && pendingDocs.length > 0) {
            pendingDocs.slice(0, availableSlots).forEach(doc => extractRequirements(doc.id));
        }
    }, [documents, extractRequirements]);

    const generateTestCases = async (requirementIds: string[]) => {
        const reqsToProcess = requirements.filter(r => requirementIds.includes(r.id));
        if (reqsToProcess.length === 0) return;
        
        const requirementsText = reqsToProcess.map(r => `Requirement [${r.id}]: ${r.text}`).join('\n');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Act as an expert QA Engineer. Generate comprehensive validation test cases for the following software requirements. Return the test cases as a JSON array of objects.\n\nRequirements:\n${requirementsText}`;
            
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "Unique Test Case ID, e.g., TC-001" },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                requirementId: { type: Type.STRING, description: "The ID of the requirement this test case covers" },
                                priority: { type: Type.STRING, enum: Object.values(Priority) },
                                severity: { type: Type.STRING, enum: Object.values(Severity) },
                                preconditions: { type: Type.STRING },
                                steps: { type: Type.STRING },
                                expectedResult: { type: Type.STRING }
                            },
                            required: ["id", "title", "requirementId", "priority", "severity", "steps", "expectedResult"]
                        }
                    }
                }
            });

            const generatedData = JSON.parse(response.text.trim());
            const newTestCases: TestCase[] = generatedData.map((item: any) => ({
                ...item,
                status: TestCaseStatus.Draft,
                linkMethod: 'AI-Generated'
            }));

            setTestCases(prev => [...prev, ...newTestCases]);
            setRequirements(prev => prev.map(r => requirementIds.includes(r.id) ? { ...r, status: RequirementStatus.Mapped } : r));
            addToast(`Successfully generated ${newTestCases.length} test cases.`, 'success');
        } catch (error) {
            console.error("Error generating test cases:", error);
            addToast("Failed to generate test cases. Please try again.", "error");
        }
    };
    
    const addTestCase = (testCaseData: Omit<TestCase, 'id' | 'status' | 'requirementId' | 'linkMethod'>, requirementId: string) => {
        const newTestCase: TestCase = {
            id: `TC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            requirementId,
            status: TestCaseStatus.Draft,
            linkMethod: 'Manual',
            ...testCaseData,
        };
        setTestCases(prev => [...prev, newTestCase]);
        setRequirements(prev => prev.map(r => r.id === requirementId ? { ...r, status: RequirementStatus.Mapped } : r));
    };

    const updateTestCase = (updatedTestCase: TestCase) => {
        const oldTestCase = testCases.find(tc => tc.id === updatedTestCase.id);
        const newTestCases = testCases.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc);
        setTestCases(newTestCases);

        if (oldTestCase && oldTestCase.requirementId !== updatedTestCase.requirementId) {
            setRequirements(prevReqs => {
                const oldReqStillCovered = newTestCases.some(tc => tc.requirementId === oldTestCase.requirementId);
                return prevReqs.map(req => {
                    if (req.id === updatedTestCase.requirementId) return { ...req, status: RequirementStatus.Mapped };
                    if (req.id === oldTestCase.requirementId && !oldReqStillCovered) return { ...req, status: RequirementStatus.Unmapped };
                    return req;
                });
            });
        }
    };

    const deleteTestCase = (id: string) => {
        const tcToDelete = testCases.find(tc => tc.id === id);
        if (!tcToDelete) return;
        const { requirementId } = tcToDelete;
        const newTestCases = testCases.filter(tc => tc.id !== id);
        const isRequirementStillCovered = newTestCases.some(tc => tc.requirementId === requirementId);
        setTestCases(newTestCases);
        if (!isRequirementStillCovered) {
            setRequirements(prevReqs => prevReqs.map(req => req.id === requirementId ? { ...req, status: RequirementStatus.Unmapped } : req));
        }
    };

    const addUserStories = (files: File[]) => {
        const newStories: UserStory[] = files.map(file => ({
            id: `story-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            status: UserStoryStatus.Pending,
        }));
        setUserStories(prev => [...prev, ...newStories]);
    };

    const deleteUserStory = (id: string) => setUserStories(prev => prev.filter(us => us.id !== id));
    const updateUserStory = (story: UserStory) => setUserStories(prev => prev.map(us => us.id === story.id ? story : us));

    const extractUserStory = async (id: string) => {
        const us = userStories.find(item => item.id === id);
        if (!us) return;
        setUserStories(prev => prev.map(item => item.id === id ? { ...item, status: UserStoryStatus.Parsing } : item));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Extract user story details from ${us.fileName}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            storyIdentifier: { type: Type.STRING },
                            storyText: { type: Type.STRING },
                            acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["storyIdentifier", "storyText", "acceptanceCriteria"]
                    }
                }
            });
            const result = JSON.parse(response.text);
            setUserStories(prev => prev.map(item => item.id === id ? { ...item, ...result, status: UserStoryStatus.Ready } : item));
            addToast(`Successfully extracted ${result.storyIdentifier}`, 'success');
        } catch (error) {
            setUserStories(prev => prev.map(item => item.id === id ? { ...item, status: UserStoryStatus.Error } : item));
            addToast(`Failed to process ${us.fileName}`, 'error');
        }
    };

    const generateTestCasesForUserStory = async (id: string) => {
        const us = userStories.find(item => item.id === id);
        if (!us || !us.storyText) return;
        setUserStories(prev => prev.map(item => item.id === id ? { ...item, status: UserStoryStatus.Generating } : item));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate test cases for User Story: ${us.storyText}. Provide them as a JSON array.`;
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                priority: { type: Type.STRING, enum: Object.values(Priority) },
                                severity: { type: Type.STRING, enum: Object.values(Severity) },
                                steps: { type: Type.STRING },
                                expectedResult: { type: Type.STRING }
                            },
                            required: ["id", "title", "steps", "expectedResult"]
                        }
                    }
                }
            });
            const generatedData = JSON.parse(response.text);
            const newTestCases: TestCase[] = generatedData.map((tc: any) => ({
                ...tc,
                requirementId: us.storyIdentifier || 'UserStory',
                status: TestCaseStatus.Draft,
                linkMethod: 'AI-Generated'
            }));
            setTestCases(prev => [...prev, ...newTestCases]);
            setUserStories(prev => prev.map(item => item.id === id ? { ...item, status: UserStoryStatus.Complete } : item));
            addToast(`Generated ${newTestCases.length} test cases`, 'success');
        } catch (error) {
            setUserStories(prev => prev.map(item => item.id === id ? { ...item, status: UserStoryStatus.Ready } : item));
            addToast(`Generation failed`, 'error');
        }
    };

    const addRecentSearch = useCallback((query: string) => {
        if (!query.trim()) return;
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.query.toLowerCase() !== query.toLowerCase());
            return [{ query, timestamp: Date.now() }, ...filtered].slice(0, 10);
        });
    }, []);

    const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

    const kpis = useMemo(() => {
        const totalRequirements = requirements.length;
        const testCasesGenerated = testCases.length;
        const coveredRequirements = requirements.filter(r => testCases.some(tc => tc.requirementId === r.id)).length;
        const overallCoverage = totalRequirements > 0 ? Math.round((coveredRequirements / totalRequirements) * 100) : 0;
        const approvedTestCases = testCases.filter(tc => tc.status === TestCaseStatus.Approved).length;
        return { totalRequirements, testCasesGenerated, overallCoverage, approvedTestCases };
    }, [requirements, testCases]);

    const requirementCoverageData = useMemo(() => {
        const covered = requirements.filter(r => testCases.some(tc => tc.requirementId === r.id)).length;
        const uncovered = requirements.length - covered;
        return [{ name: 'Covered', value: covered }, { name: 'Uncovered', value: uncovered }];
    }, [requirements, testCases]);

    const testCaseStatusData = useMemo(() => {
        return Object.values(TestCaseStatus).map(status => ({
            name: status,
            value: testCases.filter(tc => tc.status === status).length
        })).filter(item => item.value > 0);
    }, [testCases]);
    
    const value = {
        documents, requirements, testCases, userStories, recentSearches, toasts,
        theme, toggleTheme, addToast, removeToast, addDocuments, deleteDocument,
        extractRequirements, addRequirement, updateRequirement, bulkUpdateRequirements,
        generateTestCases, addTestCase, updateTestCase, deleteTestCase, addUserStories,
        deleteUserStory, updateUserStory, extractUserStory, generateTestCasesForUserStory,
        addRecentSearch, clearRecentSearches, kpis, requirementCoverageData, testCaseStatusData
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProject must be used within a ProjectProvider');
    return context;
};
