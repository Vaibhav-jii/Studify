/**
 * File upload service with validation
 * Sprint 1: Local file handling with file type validation
 */

import { UploadedFile, FileMetadata, UploadProgress } from '../types';

const UPLOADED_FILES_KEY = 'studify_uploaded_files';

// Allowed file types and their extensions
export const ALLOWED_FILE_TYPES = {
  ppt: ['.ppt', '.pptx'],
  pdf: ['.pdf'],
  doc: ['.doc', '.docx'],
  video: ['.mp4', '.avi', '.mkv', '.mov'],
};

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  // Check file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      valid: false,
      error: 'Unsupported file type. Allowed: PPT, PDF, DOC, Video files',
    };
  }

  return { valid: true };
}

/**
 * Detect file type from extension
 */
export function detectFileType(fileName: string): 'ppt' | 'pdf' | 'doc' | 'video' | null {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
  for (const [type, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return type as 'ppt' | 'pdf' | 'doc' | 'video';
    }
  }
  
  return null;
}

/**
 * Upload file (Sprint 1: Store metadata only, actual file in browser memory)
 */
export async function uploadFile(
  file: File,
  subjectId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileId = generateFileId();
  const fileType = detectFileType(file.name);
  
  if (!fileType) {
    throw new Error('Invalid file type');
  }

  // Simulate upload progress
  if (onProgress) {
    onProgress({
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });
  }

  // Simulate upload delay
  await simulateUpload(fileId, file.name, onProgress);

  // Create file metadata
  const uploadedFile: UploadedFile = {
    id: fileId,
    fileName: file.name,
    originalName: file.name,
    fileType,
    fileSize: file.size,
    filePath: `local://${fileId}`, // Sprint 1: Mock path
    subjectId,
    uploadedAt: new Date(),
    metadata: extractMetadata(file, fileType),
  };

  // Save to localStorage
  saveUploadedFile(uploadedFile);

  if (onProgress) {
    onProgress({
      fileId,
      fileName: file.name,
      progress: 100,
      status: 'complete',
    });
  }

  return uploadedFile;
}

/**
 * Get all uploaded files
 */
export function getAllUploadedFiles(): UploadedFile[] {
  try {
    const stored = localStorage.getItem(UPLOADED_FILES_KEY);
    if (!stored) return [];
    
    const files = JSON.parse(stored);
    return files.map((f: any) => ({
      ...f,
      uploadedAt: new Date(f.uploadedAt),
    }));
  } catch (error) {
    console.error('Error loading uploaded files:', error);
    return [];
  }
}

/**
 * Get files by subject ID
 */
export function getFilesBySubject(subjectId: string): UploadedFile[] {
  const allFiles = getAllUploadedFiles();
  return allFiles.filter(f => f.subjectId === subjectId);
}

/**
 * Get file by ID
 */
export function getFileById(id: string): UploadedFile | null {
  const allFiles = getAllUploadedFiles();
  return allFiles.find(f => f.id === id) || null;
}

/**
 * Delete uploaded file
 */
export function deleteUploadedFile(id: string): boolean {
  const files = getAllUploadedFiles();
  const filtered = files.filter(f => f.id !== id);
  
  if (filtered.length === files.length) return false;
  
  try {
    localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Save uploaded file to localStorage
 */
function saveUploadedFile(file: UploadedFile): void {
  const files = getAllUploadedFiles();
  files.push(file);
  
  try {
    localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(files));
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file metadata');
  }
}

/**
 * Extract metadata from file
 */
function extractMetadata(file: File, fileType: string): FileMetadata {
  const metadata: FileMetadata = {
    difficulty: 'medium',
  };

  // Estimate based on file size and type
  if (fileType === 'ppt' || fileType === 'pdf') {
    // Rough estimate: 50KB per page
    const estimatedPages = Math.ceil(file.size / 51200);
    metadata.pages = estimatedPages;
    
    // Estimate reading time: 2 minutes per page
    const totalMinutes = estimatedPages * 2;
    metadata.estimatedTime = formatTime(totalMinutes);
  } else if (fileType === 'video') {
    // For videos, we'd need actual duration - using file size estimate
    const estimatedMinutes = Math.ceil(file.size / (1024 * 1024)); // Rough: 1MB = 1min
    metadata.duration = formatTime(estimatedMinutes);
    metadata.estimatedTime = formatTime(estimatedMinutes);
  } else {
    // For docs, similar to PDFs
    const estimatedPages = Math.ceil(file.size / 51200);
    metadata.pages = estimatedPages;
    metadata.estimatedTime = formatTime(estimatedPages * 2);
  }

  // Determine difficulty based on file size
  if (file.size < 1024 * 1024 * 5) {
    metadata.difficulty = 'easy';
  } else if (file.size > 1024 * 1024 * 20) {
    metadata.difficulty = 'hard';
  }

  return metadata;
}

/**
 * Format time in hours and minutes
 */
function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Generate unique file ID
 */
function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate upload progress
 */
async function simulateUpload(
  fileId: string,
  fileName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  if (!onProgress) return;

  const steps = [20, 40, 60, 80, 95];
  
  for (const progress of steps) {
    await new Promise(resolve => setTimeout(resolve, 200));
    onProgress({
      fileId,
      fileName,
      progress,
      status: 'uploading',
    });
  }
}

/**
 * Reset all uploaded files (for testing)
 */
export function resetUploadedFiles(): void {
  localStorage.removeItem(UPLOADED_FILES_KEY);
}
