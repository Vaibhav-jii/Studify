/**
 * Subject Management Component
 * Uses backend API for CRUD operations on subjects
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '../../components/form-controls/Button';
import { Input } from '../../components/form-controls/Input';
import { Card } from '../../components/data-display/Card';
import { Modal } from '../../components/layout/Modal';
import { Toast, useToast } from '../../components/feedback/Toast';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  type SubjectResponse,
} from '../../services/api';

const SUBJECT_COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#3B82F6', '#F97316', '#06B6D4', '#EF4444',
];

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: SUBJECT_COLORS[0],
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (error) {
      showToast('Failed to load subjects', 'error');
    }
  };

  const handleOpenModal = (subject?: SubjectResponse) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        description: subject.description || '',
        color: subject.color,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        description: '',
        color: SUBJECT_COLORS[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({ name: '', description: '', color: SUBJECT_COLORS[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
        showToast('Subject updated successfully', 'success');
      } else {
        await createSubject(formData);
        showToast('Subject created successfully', 'success');
      }

      await loadSubjects();
      handleCloseModal();
    } catch (error) {
      showToast('Failed to save subject', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all its files.`)) {
      try {
        await deleteSubject(id);
        showToast('Subject deleted successfully', 'success');
        await loadSubjects();
      } catch (error) {
        showToast('Failed to delete subject', 'error');
      }
    }
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            My Subjects
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Manage your study subjects and organize your materials
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Subject</span>
        </Button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        {subjects.map((subject) => (
          <Card key={subject.id} variant="default">
            <div className="flex flex-col h-full">
              {/* Color Bar */}
              <div
                className="h-2 rounded-t-[var(--radius-md)] -mx-4 -mt-4 mb-4"
                style={{ backgroundColor: subject.color }}
              />

              {/* Content */}
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  <BookOpen size={24} style={{ color: subject.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1 truncate">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {subject.file_count} file{subject.file_count !== 1 ? 's' : ''}
                </span>
                {subject.total_study_time > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatMinutes(subject.total_study_time)} study
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(subject)}
                  className="flex-1"
                >
                  <Edit2 size={16} />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subject.id, subject.name)}
                  className="flex-1 text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {subjects.length === 0 && (
          <div className="col-span-full">
            <Card variant="default">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <BookOpen size={32} className="text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                  No subjects yet
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Create your first subject to start organizing your study materials
                </p>
                <Button onClick={() => handleOpenModal()}>
                  <Plus size={20} />
                  Add Your First Subject
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSubject ? 'Edit Subject' : 'Create New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Subject Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Data Structures"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this subject"
              className="w-full px-4 py-2 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-violet)] resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all ${formData.color === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F0420] scale-110'
                      : 'hover:scale-105'
                    }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingSubject ? 'Update' : 'Create'} Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
