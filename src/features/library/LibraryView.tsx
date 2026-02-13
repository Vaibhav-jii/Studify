import React, { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, BookOpen, Clock, FileText, BarChart3, Download, Trash2 } from 'lucide-react';
import { SearchInput } from '../../components/form-controls/Input';
import { Chip } from '../../components/form-controls/Chip';
import { Button } from '../../components/form-controls/Button';
import { Card } from '../../components/data-display/Card';
import { Badge } from '../../components/data-display/Badge';
import { SubjectManagement } from './SubjectManagement';
import {
  fetchSubjects,
  fetchFiles,
  deleteFile,
  getDownloadUrl,
  type SubjectResponse,
  type UploadedFileResponse,
} from '../../services/api';

interface LibraryViewProps {
  onAnalyze: (id: string) => void;
  onAddToPlan: (id: string) => void;
}

export function LibraryView({ onAnalyze, onAddToPlan }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'subjects'>('materials');
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [files, setFiles] = useState<UploadedFileResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, filesData] = await Promise.all([
        fetchSubjects(),
        fetchFiles(),
      ]);
      setSubjects(subjectsData);
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = subjects.map(s => s.name);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(file.subject_name || '');
    return matchesSearch && matchesTags;
  });

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
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
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
              Library
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Manage subjects and browse all your uploaded study materials
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 font-medium transition-all relative ${activeTab === 'materials'
                ? 'text-[var(--color-primary-violet)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
          >
            Materials ({files.length})
            {activeTab === 'materials' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary-violet)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 font-medium transition-all relative ${activeTab === 'subjects'
                ? 'text-[var(--color-primary-violet)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} />
              Subjects ({subjects.length})
            </span>
            {activeTab === 'subjects' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary-violet)]" />
            )}
          </button>
        </div>
      </div>

      {/* Subject Management Tab */}
      {activeTab === 'subjects' && (
        <SubjectManagement />
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <>
          {/* Search and Filters */}
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search files..."
                  onClear={() => setSearchQuery('')}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={20} />
                </Button>
              </div>
            </div>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-[var(--color-text-muted)]">
            Showing {filteredFiles.length} of {files.length} files
          </div>

          {/* Files Grid/List */}
          <div className={`
            animate-in fade-in slide-in-from-bottom-4 duration-500
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
              : 'space-y-3'
            }
          `} style={{ animationDelay: '300ms' }}>
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => (
                <Card key={file.id} variant="default">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${file.subject_color || '#8B5CF6'}20` }}
                        >
                          <FileText size={20} style={{ color: file.subject_color || '#8B5CF6' }} />
                        </div>
                        <div>
                          <h3 className="font-medium text-[var(--color-text-primary)]">
                            {file.original_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {formatFileSize(file.file_size)}
                            </span>
                            <span className="text-xs" style={{ color: file.subject_color || undefined }}>
                              {file.subject_name}
                            </span>
                            <Badge variant="default" size="sm">
                              {file.file_type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={getDownloadUrl(file.id)} download>
                          <Button variant="ghost" className="p-2">
                            <Download size={14} />
                          </Button>
                        </a>
                        <Button variant="ghost" className="p-2 text-red-400 hover:text-red-300" onClick={() => handleDelete(file.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Analysis info */}
                    {file.analysis && (
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)] pt-2 border-t border-white/10">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {file.analysis.slide_count} slides
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={12} />
                          {file.analysis.total_word_count.toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1 text-[var(--color-primary-violet)]">
                          <Clock size={12} />
                          ~{formatMinutes(file.analysis.estimated_study_time)}
                        </span>
                        <Badge
                          variant={file.analysis.difficulty === 'easy' ? 'success' : file.analysis.difficulty === 'hard' ? 'error' : 'info'}
                          size="sm"
                        >
                          {file.analysis.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="glass-card rounded-[var(--radius-lg)] p-12 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    <List size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                    {files.length === 0 ? 'No files uploaded yet' : 'No files match your filters'}
                  </h3>
                  <p className="text-[var(--color-text-muted)] mb-6">
                    {files.length === 0
                      ? 'Go to the Analyze tab to upload your PPT files'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {files.length === 0 ? (
                    <Button onClick={() => window.location.hash = '#analyze'}>
                      Upload Files
                    </Button>
                  ) : (
                    <Button onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
