import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/layout/Modal';
import { CircularProgress } from '../../../components/feedback/ProgressBar';
import { Button } from '../../../components/form-controls/Button';
import { Badge } from '../../../components/data-display/Badge';
import { Clock, BookOpen, TrendingUp, CheckCircle2, Brain, Sparkles, Lightbulb } from 'lucide-react';

interface AnalysisResult {
  totalPages: number;
  contentDensity: number;
  estimatedHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  recommendedSessions: { duration: number; type: string }[];
  suggestedTopics: string[];
  aiReasoning?: string;
  studyTips?: string[];
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onComplete: (result: AnalysisResult) => void;
  fileMetadata?: {
    pages?: number;
    estimatedTime?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    aiKeyTopics?: string[];
    aiStudyTips?: string[];
    aiReasoning?: string;
    wordCount?: number;
    imageCount?: number;
  };
}

export function AnalysisModal({ isOpen, onClose, fileName, onComplete, fileMetadata }: AnalysisModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Uploading file...');
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStep('Uploading file...');
      setIsComplete(false);
      setResult(null);
      return;
    }

    const steps = [
      { label: 'Processing file...', duration: 300 },
      { label: 'Extracting content...', duration: 400 },
      { label: 'Analyzing with AI...', duration: 500 },
      { label: 'Estimating study time...', duration: 300 },
      { label: 'Generating insights...', duration: 200 }
    ];

    const runAnalysis = async () => {
      let currentProgress = 0;

      for (const step of steps) {
        setCurrentStep(step.label);
        const increment = 100 / steps.length;

        await new Promise(resolve => setTimeout(resolve, step.duration));

        currentProgress += increment;
        setProgress(Math.min(currentProgress, 100));
      }

      const pages = fileMetadata?.pages || 20;
      const estimatedTimeStr = fileMetadata?.estimatedTime || '3h';
      const hours = parseFloat(estimatedTimeStr.replace(/[hm]/g, '')) || 3;

      const analysisResult: AnalysisResult = {
        totalPages: pages,
        contentDensity: Math.min(Math.floor((fileMetadata?.wordCount || 0) / Math.max(pages, 1) / 1.2) + 30, 100),
        estimatedHours: Math.ceil(hours),
        difficulty: fileMetadata?.difficulty || 'medium',
        recommendedSessions: [
          { duration: 90, type: 'Deep focus' },
          { duration: 60, type: 'Review' },
          { duration: 90, type: 'Deep focus' },
          { duration: 30, type: 'Quick recap' }
        ],
        suggestedTopics: fileMetadata?.aiKeyTopics || [
          'Core concepts',
          'Key principles',
          'Applications',
          'Practice problems'
        ],
        aiReasoning: fileMetadata?.aiReasoning,
        studyTips: fileMetadata?.aiStudyTips,
      };

      setResult(analysisResult);
      setIsComplete(true);
    };

    runAnalysis();
  }, [isOpen]);

  const handleAddToPlan = () => {
    if (result) {
      onComplete(result);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isComplete ? 'Analysis Complete' : 'Analyzing Material'}
      size="lg"
      footer={
        isComplete && result ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleAddToPlan}>
              Add to Study Plan
            </Button>
          </>
        ) : null
      }
    >
      {!isComplete ? (
        <div className="py-8">
          <div className="flex flex-col items-center">
            <CircularProgress value={progress} size={140} />
            <p className="mt-6 text-lg font-medium text-[var(--color-text-primary)]">
              {currentStep}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Analyzing: {fileName}
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
            <CheckCircle2 className="text-[var(--color-success)]" size={24} />
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">Analysis Successful</p>
              <p className="text-sm text-[var(--color-text-muted)]">{fileName}</p>
            </div>
          </div>

          {/* AI Reasoning */}
          {result.aiReasoning && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-primary-violet)]/10 border border-[var(--color-primary-violet)]/30">
              <Brain className="text-[var(--color-primary-violet)] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-[var(--color-primary-violet)] mb-1">AI Analysis</p>
                <p className="text-sm text-[var(--color-text-primary)]">{result.aiReasoning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                <BookOpen size={18} />
                <span className="text-sm">Total Slides</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{result.totalPages}</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                <TrendingUp size={18} />
                <span className="text-sm">Difficulty</span>
              </div>
              <Badge variant={
                result.difficulty === 'easy' ? 'success' :
                  result.difficulty === 'hard' ? 'error' : 'warning'
              } size="lg">
                {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
              </Badge>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                <Clock size={18} />
                <span className="text-sm">Estimated Time</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{result.estimatedHours}h</p>
            </div>
          </div>

          {/* Key Topics */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-primary-violet)]" />
              Key Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.suggestedTopics.map((topic, index) => (
                <Badge key={index}>{topic}</Badge>
              ))}
            </div>
          </div>

          {/* Study Tips */}
          {result.studyTips && result.studyTips.length > 0 && (
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-[var(--color-warning)]" />
                AI Study Tips
              </h4>
              <div className="space-y-2">
                {result.studyTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <span className="text-xs font-bold text-[var(--color-primary-violet)] bg-[var(--color-primary-violet)]/20 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Sessions */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">
              Recommended Study Sessions
            </h4>
            <div className="space-y-2">
              {result.recommendedSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/10"
                >
                  <span className="text-[var(--color-text-primary)]">Session {index + 1}</span>
                  <div className="flex items-center gap-3">
                    <Badge size="sm">{session.type}</Badge>
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                      {session.duration} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
