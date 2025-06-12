export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface LegalDocument {
  id: string;
  name: string;
  type: 'contract' | 'form' | 'guide' | 'law';
  category: string;
  description: string;
  downloadUrl?: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  estimatedTime?: string;
}

export interface LegalProcess {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: ProcessStep[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  analysis?: {
    summary: string;
    category: string;
    keyTerms: string[];
    recommendations: string[];
  };
}