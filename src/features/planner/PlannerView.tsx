import React, { useState, useEffect } from 'react';
import { Button } from '../../components/form-controls/Button';
import { Input } from '../../components/form-controls/Input';
import { Card } from '../../components/data-display/Card';
import { StudySessionCard, WeeklyGrid, StudySession } from './components/StudySession';
import { Modal } from '../../components/layout/Modal';
import { Sparkles, Calendar as CalendarIcon, Edit3, Loader2 } from 'lucide-react';
import { Badge } from '../../components/data-display/Badge';
import {
  fetchSubjects,
  generateTimetable,
  type SubjectResponse,
  type StudySessionResponse,
} from '../../services/api';

export function PlannerView() {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [generating, setGenerating] = useState(false);
  const [timetableStats, setTimetableStats] = useState({ totalHours: 0, days: 0, subjectsCovered: 0 });

  const [formData, setFormData] = useState({
    hoursPerDay: '4',
    studyBlocks: [] as string[],
    examDate: '',
    selectedSubjectIds: [] as string[],
    daysCount: '7',
  });

  // Load subjects from backend
  useEffect(() => {
    fetchSubjects()
      .then(data => {
        setSubjects(data);
        // Pre-select all subjects
        setFormData(prev => ({
          ...prev,
          selectedSubjectIds: data.map(s => s.id),
        }));
      })
      .catch(() => { });
  }, []);

  const handleSessionClick = (session: StudySession) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleGenerate = async () => {
    if (formData.selectedSubjectIds.length === 0) return;

    setGenerating(true);
    try {
      const result = await generateTimetable({
        subject_ids: formData.selectedSubjectIds,
        hours_per_day: parseFloat(formData.hoursPerDay) || 4,
        preferred_blocks: formData.studyBlocks.length > 0
          ? formData.studyBlocks
          : ['Morning (6-12)', 'Afternoon (12-18)'],
        exam_date: formData.examDate || undefined,
        days_count: parseInt(formData.daysCount) || 7,
      });

      // Map API response to UI StudySession format
      const sessions: StudySession[] = result.sessions.map(s => ({
        id: s.id,
        subject: s.subject,
        title: s.title,
        duration: s.duration,
        startTime: s.start_time,
        color: s.subject_color,
        type: s.session_type,
      }));

      setStudySessions(sessions);
      setTimetableStats({
        totalHours: result.total_hours,
        days: result.days,
        subjectsCovered: result.subjects_covered,
      });
      setShowGenerateForm(false);
    } catch (error: any) {
      console.error('Failed to generate timetable:', error);
    } finally {
      setGenerating(false);
    }
  };

  const timeBlocks = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'];

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Study Planner
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Generate a personalized study schedule from your uploaded materials
          </p>
        </div>
        <div className="flex gap-3">
          {studySessions.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setViewMode(viewMode === 'week' ? 'list' : 'week')}
            >
              <CalendarIcon size={18} />
              {viewMode === 'week' ? 'List View' : 'Week View'}
            </Button>
          )}
          <Button onClick={() => setShowGenerateForm(true)}>
            <Sparkles size={18} />
            Generate Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      {studySessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <Card variant="compact">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Time</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{timetableStats.totalHours}h</p>
          </Card>
          <Card variant="compact">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Sessions</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{studySessions.length}</p>
          </Card>
          <Card variant="compact">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Days</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{timetableStats.days}</p>
          </Card>
          <Card variant="compact">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Subjects</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{timetableStats.subjectsCovered}</p>
          </Card>
        </div>
      )}

      {/* Timetable */}
      {studySessions.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          {viewMode === 'week' ? (
            <Card variant="default">
              <WeeklyGrid
                sessions={studySessions}
                onSessionClick={handleSessionClick}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {studySessions.map(session => (
                <StudySessionCard
                  key={session.id}
                  session={session}
                  onClick={() => handleSessionClick(session)}
                  draggable
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <Card variant="default">
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto mb-4 text-[var(--color-primary-violet)] opacity-40" />
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                No timetable yet
              </h3>
              <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                Upload PPTs in the Analyze tab, then click "Generate Plan" to create a personalized study schedule based on your materials.
              </p>
              <Button onClick={() => setShowGenerateForm(true)}>
                <Sparkles size={18} />
                Generate Plan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Generate Form Modal */}
      <Modal
        isOpen={showGenerateForm}
        onClose={() => setShowGenerateForm(false)}
        title="Generate Study Plan"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowGenerateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating || formData.selectedSubjectIds.length === 0}>
              {generating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {generating ? 'Generating...' : 'Generate Timetable'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours per day"
              type="number"
              value={formData.hoursPerDay}
              onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
              placeholder="4"
            />
            <Input
              label="Days to plan"
              type="number"
              value={formData.daysCount}
              onChange={(e) => setFormData({ ...formData, daysCount: e.target.value })}
              placeholder="7"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
              Preferred study blocks
            </label>
            <div className="flex flex-wrap gap-2">
              {timeBlocks.map(block => (
                <Badge
                  key={block}
                  variant={formData.studyBlocks.includes(block) ? 'info' : 'default'}
                  className="cursor-pointer"
                  onClick={() => setFormData({
                    ...formData,
                    studyBlocks: toggleArrayItem(formData.studyBlocks, block)
                  })}
                >
                  {block}
                </Badge>
              ))}
            </div>
          </div>

          <Input
            label="Exam date (optional)"
            type="date"
            value={formData.examDate}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
          />

          <div>
            <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
              Subjects to include
            </label>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge
                    key={subject.id}
                    variant={formData.selectedSubjectIds.includes(subject.id) ? 'info' : 'default'}
                    className="cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      selectedSubjectIds: toggleArrayItem(formData.selectedSubjectIds, subject.id)
                    })}
                  >
                    {subject.name}
                    {subject.total_study_time > 0 && (
                      <span className="ml-1 opacity-70">
                        ({Math.round(subject.total_study_time)}m)
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                No subjects found. Upload PPTs in the Analyze tab first.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Study Session Details"
        footer={
          <Button variant="ghost" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
        }
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedSession.color }}
              />
              <span className="font-medium text-[var(--color-text-primary)]">
                {selectedSession.subject}
              </span>
            </div>
            <Input
              label="Title"
              value={selectedSession.title}
              onChange={() => { }}
              disabled
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                value={selectedSession.duration.toString()}
                onChange={() => { }}
                disabled
              />
              <Input
                label="Start time"
                type="time"
                value={selectedSession.startTime}
                onChange={() => { }}
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-[var(--color-text-primary)]">
                Session type
              </label>
              <Badge variant="info">{selectedSession.type}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
