/**
 * Core type definitions for Studify application
 * Sprint 1: Subject management and file upload types
 */

// Subject Types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubjectDTO {
  name: string;
  description?: string;
  color: string;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  fileName: string;
  originalName: string;
  fileType: 'ppt' | 'pdf' | 'doc' | 'video' | 'other';
  fileSize: number;
  filePath: string;
  subjectId: string;
  uploadedAt: Date;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  pages?: number;
  duration?: string;
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// Resource Types (for Library)
export interface Resource {
  id: string;
  title: string;
  type: 'ppt' | 'pdf' | 'video' | 'doc';
  subject: string;
  subjectId?: string;
  estimatedTime: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  pages?: number;
  progress?: number;
  uploadedFileId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
