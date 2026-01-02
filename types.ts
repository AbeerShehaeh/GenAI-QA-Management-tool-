
export type Tab = 'Dashboard' | 'Documents' | 'Requirements' | 'Test Cases' | 'Traceability' | 'Reports' | 'JS Code Test Generator';

export type Theme = 'light' | 'dark';

export enum DocumentStatus {
    Pending = 'Pending',
    Parsing = 'Parsing',
    Success = 'Success',
    Error = 'Error',
}

export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    size: number;
    dateUploaded: string;
    status: DocumentStatus;
    content: string; // File content
}

export enum RequirementStatus {
    Mapped = 'Mapped',
    Unmapped = 'Unmapped',
    NeedsReview = 'Needs Review',
}

export enum RequirementType {
    Functional = 'Functional',
    NonFunctional = 'Non-Functional',
}

export enum Priority {
    Critical = 'Critical',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export interface Requirement {
    id: string;
    text: string;
    source: string; // document fileName
    status: RequirementStatus;
    type: RequirementType;
    priority: Priority;
    createdOn: string;
    lastUpdated?: string;
    qualityScore?: number; // 0-100
}

export enum TestCaseStatus {
    Draft = 'Draft',
    Reviewed = 'Reviewed',
    Approved = 'Approved',
    Executed = 'Executed',
}

export enum Severity {
    Critical = 'Critical',
    Major = 'Major',
    Minor = 'Minor',
    Trivial = 'Trivial',
}

export interface TestCase {
    id: string;
    title: string;
    description?: string;
    requirementId: string;
    status: TestCaseStatus;
    priority: Priority;
    severity: Severity;
    preconditions: string;
    steps: string;
    expectedResult: string;
    actualResult?: string;
    linkMethod?: 'AI-Generated' | 'Manual';
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// User Story Types
export enum UserStoryStatus {
    Pending = 'Pending',
    Parsing = 'Parsing',
    Ready = 'Ready',
    Generating = 'Generating',
    Complete = 'Complete',
    Error = 'Error',
}

export interface UserStory {
    id: string;
    fileName: string;
    storyIdentifier?: string;
    storyText?: string;
    acceptanceCriteria?: string[];
    status: UserStoryStatus;
}

export interface RecentSearch {
    query: string;
    timestamp: number;
}
