import React, { useState, useEffect } from 'react';
import { UploadZone } from '../../components/data-display/ResourceCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Card } from '../../components/data-display/Card';
import { FileText, CheckCircle2, Clock, BookOpen, BarChart3, Image, Trash2, Download } from 'lucide-react';
import { useToast, Toast } from '../../components/feedback/Toast';
import { Button } from '../../components/form-controls/Button';
import { Badge } from '../../components/data-display/Badge';
import {
  fetchSubjects,
  uploadFile as apiUploadFile,
  fetchFiles,
  deleteFile,
  getDownloadUrl,
  createSubject,
  type SubjectResponse,
  type UploadedFileResponse,
} from '../../services/api';

export function AnalyzeView() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileResponse[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [analyzingFile, setAnalyzingFile] = useState<UploadedFileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  // Load subjects and files from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, filesData] = await Promise.all([
        fetchSubjects(),
        fetchFiles(),
      ]);
      setSubjects(subjectsData);
      setUploadedFiles(filesData);
      if (subjectsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (error: any) {
      showToast('Failed to load data. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reload files when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      fetchFiles(selectedSubjectId).then(setUploadedFiles).catch(() => { });
    }
  }, [selectedSubjectId]);

  const handleUpload = async (files: FileList) => {
    if (!selectedSubjectId) {
      showToast('Please select a subject first', 'error');
      return;
    }

    for (const file of Array.from(files)) {
      const tempId = `uploading_${Date.now()}_${file.name}`;
      try {
        setUploadingFiles(prev => new Map(prev.set(tempId, 0)));

        const result = await apiUploadFile(file, selectedSubjectId, (progress) => {
          setUploadingFiles(prev => new Map(prev.set(tempId, progress)));
        });

        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(tempId);
          return next;
        });

        setUploadedFiles(prev => [result, ...prev]);
        showToast(`${file.name} uploaded and analyzed!`, 'success');

        // Auto-open analysis modal for PPT files
        if (result.analysis) {
          setAnalyzingFile(result);
        }
      } catch (error: any) {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(tempId);
          return next;
        });
        showToast(error.message || 'Upload failed', 'error');
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      showToast('File deleted', 'success');
    } catch (error: any) {
      showToast('Failed to delete file', 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          Upload & Analyze
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Upload your PPT files to get content analysis and time estimates
        </p>
      </div>

      {/* Subject Selection */}
      {subjects.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '50ms' }}>
          <Card variant="compact">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Select Subject:
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSubjectId === subject.id
                      ? 'text-white shadow-lg'
                      : 'bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10'
                      }`}
                    style={{
                      backgroundColor: selectedSubjectId === subject.id ? subject.color : undefined,
                    }}
                  >
                    {subject.name}
                    {subject.file_count > 0 && (
                      <span className="ml-2 opacity-70">({subject.file_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {subjects.length === 0 && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '50ms' }}>
          <Card variant="compact">
            <div className="text-center py-6">
              <p className="text-[var(--color-text-muted)] mb-4">
                No subjects found. Create a subject to start uploading files.
              </p>
              <Button onClick={() => window.location.hash = '#library'}>
                Go to Library
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Zone */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <UploadZone onUpload={handleUpload} />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-3">
          {Array.from(uploadingFiles.entries()).map(([id, progress]) => (
            <Card key={id} variant="compact">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-violet)]/20 flex items-center justify-center">
                  <FileText size={20} className="text-[var(--color-primary-violet)] animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-text-muted)]">Uploading & analyzing...</p>
                  <div className="mt-1 w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[var(--color-primary-violet)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{progress}%</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Uploaded Files with Analysis */}
      {uploadedFiles.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Your Files
          </h2>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <Card key={file.id} variant="compact">
                <div className="flex flex-col gap-3">
                  {/* File header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-violet)]/20 flex items-center justify-center">
                        <FileText size={20} className="text-[var(--color-primary-violet)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{file.original_name}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {formatFileSize(file.file_size)}
                          {file.subject_name && (
                            <span className="ml-2" style={{ color: file.subject_color || undefined }}>
                              • {file.subject_name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.analysis && (
                        <Button
                          variant="ghost"
                          onClick={() => setAnalyzingFile(file)}
                          className="text-sm"
                        >
                          View Analysis
                        </Button>
                      )}
                      <a href={getDownloadUrl(file.id)} download>
                        <Button variant="ghost" className="p-2">
                          <Download size={16} />
                        </Button>
                      </a>
                      <Button variant="ghost" className="p-2 text-red-400 hover:text-red-300" onClick={() => handleDelete(file.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Analysis stats row */}
                  {file.analysis && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {file.analysis.slide_count} slides
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {file.analysis.total_word_count.toLocaleString()} words
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image size={14} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {file.analysis.total_image_count} images
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[var(--color-primary-violet)]" />
                        <span className="text-sm font-medium text-[var(--color-primary-violet)]">
                          ~{formatMinutes(file.analysis.estimated_study_time)} study
                        </span>
                      </div>
                    </div>
                  )}

                  {/* No analysis badge */}
                  {!file.analysis && file.file_type !== 'ppt' && (
                    <div className="pt-2 border-t border-white/10">
                      <Badge variant="default">Analysis available for .pptx files only</Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Detail Modal */}
      {analyzingFile && analyzingFile.analysis && (
        <AnalysisModal
          isOpen={true}
          onClose={() => setAnalyzingFile(null)}
          fileName={analyzingFile.original_name}
          onComplete={() => setAnalyzingFile(null)}
          fileMetadata={{
            pages: analyzingFile.analysis.slide_count,
            estimatedTime: formatMinutes(analyzingFile.analysis.estimated_study_time),
            difficulty: analyzingFile.analysis.difficulty as 'easy' | 'medium' | 'hard',
            aiKeyTopics: analyzingFile.analysis.ai_key_topics || undefined,
            aiStudyTips: analyzingFile.analysis.ai_study_tips || undefined,
            aiReasoning: analyzingFile.analysis.ai_reasoning || undefined,
            wordCount: analyzingFile.analysis.total_word_count,
            imageCount: analyzingFile.analysis.total_image_count,
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
