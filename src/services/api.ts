/**
 * API client for communicating with the Studify backend.
 * All requests go through the Vite proxy (/api → backend).
 */

const API_BASE = '/api';

// ─── Generic helpers ─────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options?.headers || {}),
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(error.detail || `Request failed: ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json();
}

// ─── Subject API ─────────────────────────────────────────

export interface SubjectResponse {
    id: string;
    name: string;
    description: string | null;
    color: string;
    file_count: number;
    total_study_time: number;
    created_at: string;
    updated_at: string;
}

export async function fetchSubjects(): Promise<SubjectResponse[]> {
    return request<SubjectResponse[]>('/subjects/');
}

export async function createSubject(data: {
    name: string;
    description?: string;
    color: string;
}): Promise<SubjectResponse> {
    return request<SubjectResponse>('/subjects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function updateSubject(
    id: string,
    data: { name?: string; description?: string; color?: string }
): Promise<SubjectResponse> {
    return request<SubjectResponse>(`/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function deleteSubject(id: string): Promise<void> {
    return request<void>(`/subjects/${id}`, { method: 'DELETE' });
}

// ─── File Upload API ─────────────────────────────────────

export interface SlideDetail {
    slide_number: number;
    word_count: number;
    image_count: number;
    has_text: boolean;
    has_images: boolean;
    estimated_minutes: number;
}

export interface FileAnalysisResponse {
    slide_count: number;
    total_word_count: number;
    total_image_count: number;
    total_char_count: number;
    estimated_reading_time: number;
    estimated_study_time: number;
    difficulty: string;
    slides: SlideDetail[];
    // AI-powered fields (Gemini)
    ai_estimated_study_time: number | null;
    ai_difficulty: string | null;
    ai_key_topics: string[] | null;
    ai_study_tips: string[] | null;
    ai_reasoning: string | null;
}

export interface UploadedFileResponse {
    id: string;
    file_name: string;
    original_name: string;
    file_type: string;
    file_size: number;
    subject_id: string;
    subject_name: string | null;
    subject_color: string | null;
    uploaded_at: string;
    analysis: FileAnalysisResponse | null;
}

export async function uploadFile(
    file: File,
    subjectId: string,
    onProgress?: (progress: number) => void
): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', subjectId);

    // Note: fetch doesn't support upload progress natively.
    // For progress tracking we use XMLHttpRequest.
    if (onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE}/files/upload`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err.detail || 'Upload failed'));
                    } catch {
                        reject(new Error('Upload failed'));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
        });
    }

    return request<UploadedFileResponse>('/files/upload', {
        method: 'POST',
        body: formData,
    });
}

export async function fetchFiles(subjectId?: string): Promise<UploadedFileResponse[]> {
    const query = subjectId ? `?subject_id=${subjectId}` : '';
    return request<UploadedFileResponse[]>(`/files/${query}`);
}

export async function fetchFile(fileId: string): Promise<UploadedFileResponse> {
    return request<UploadedFileResponse>(`/files/${fileId}`);
}

export async function deleteFile(fileId: string): Promise<void> {
    return request<void>(`/files/${fileId}`, { method: 'DELETE' });
}

export function getDownloadUrl(fileId: string): string {
    return `${API_BASE}/files/${fileId}/download`;
}

// ─── Timetable API ───────────────────────────────────────

export interface StudySessionResponse {
    id: string;
    subject: string;
    subject_color: string;
    title: string;
    duration: number;
    start_time: string;
    day: string;
    session_type: string;
}

export interface TimetableResponse {
    sessions: StudySessionResponse[];
    total_hours: number;
    days: number;
    subjects_covered: number;
}

export async function generateTimetable(data: {
    subject_ids: string[];
    hours_per_day?: number;
    preferred_blocks?: string[];
    exam_date?: string;
    days_count?: number;
}): Promise<TimetableResponse> {
    return request<TimetableResponse>('/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

// ─── Dashboard API ───────────────────────────────────────

export interface DashboardRecentFile {
    id: string;
    title: string;
    subject: string;
    subject_color: string;
    uploaded_at: string | null;
    estimated_hours?: number;
    difficulty?: string;
    slide_count?: number;
    word_count?: number;
    ai_reasoning?: string;
}

export interface DashboardSubjectStat {
    id: string;
    name: string;
    color: string;
    file_count: number;
    total_study_minutes: number;
}

export interface DashboardStats {
    total_subjects: number;
    total_files: number;
    total_analyzed: number;
    total_study_hours: number;
    recent_analyses: DashboardRecentFile[];
    subjects: DashboardSubjectStat[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/dashboard/stats');
}
