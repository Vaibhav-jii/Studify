import React from 'react';
import { FileText, Video, Presentation, Clock, Upload, BarChart3 } from 'lucide-react';
import { Card } from './Card';
import { Badge, DifficultyBadge } from './Badge';
import { Button } from '../form-controls/Button';

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'video';
  subject: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pages?: number;
  progress?: number;
}

interface ResourceCardProps {
  resource: Resource;
  onAnalyze: (id: string) => void;
  onAddToPlan: (id: string) => void;
}

export function ResourceCard({ resource, onAnalyze, onAddToPlan }: ResourceCardProps) {
  const typeIcons = {
    pdf: <FileText size={24} />,
    ppt: <Presentation size={24} />,
    video: <Video size={24} />
  };

  const typeColors = {
    pdf: 'text-[var(--color-error)]',
    ppt: 'text-[var(--color-warning)]',
    video: 'text-[var(--color-accent-blue)]'
  };

  return (
    <Card variant="resource" hoverable>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-white/20 ${typeColors[resource.type]}`}>
          {typeIcons[resource.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
              {resource.title}
            </h3>
            <DifficultyBadge level={resource.difficulty} />
          </div>

          <div className="flex items-center gap-3 mb-3 text-sm text-[var(--color-text-muted)]">
            <Badge size="sm">{resource.subject}</Badge>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {resource.estimatedTime}
            </span>
            {resource.pages && (
              <span>{resource.pages} pages</span>
            )}
          </div>

          {resource.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-text-muted)]">Progress</span>
                <span className="text-xs font-medium text-[var(--color-text-primary)]">{resource.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary transition-all duration-500"
                  style={{ width: `${resource.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onAnalyze(resource.id)}
            >
              <BarChart3 size={16} />
              Analyze
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAddToPlan(resource.id)}
            >
              Add to Plan
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function UploadZone({ onUpload }: { onUpload: (files: FileList) => void }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        glass-card rounded-[var(--radius-lg)] p-12 text-center
        border-2 border-dashed transition-all duration-300
        ${isDragging 
          ? 'border-[var(--color-primary-violet)] bg-[var(--color-primary-violet)]/10 scale-[1.02]' 
          : 'border-white/30 hover:border-white/50'
        }
      `}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
        <Presentation size={32} className="text-[var(--color-primary-violet)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        Upload your study materials
      </h3>
      <p className="text-[var(--color-text-muted)] mb-6">
        Drag & drop files here, or click to browse
      </p>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Supports: PDF, PPT, PPTX (Max 50MB)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.ppt,.pptx"
        multiple
        className="hidden"
      />
      <Button onClick={() => fileInputRef.current?.click()}>
        Select Files
      </Button>
    </div>
  );
}