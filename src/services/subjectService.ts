/**
 * Local storage service for managing subjects
 * Sprint 1: Simple localStorage-based persistence (no backend required)
 */

import { Subject, CreateSubjectDTO } from '../types';

const SUBJECTS_KEY = 'studify_subjects';

/**
 * Predefined color palette for subjects
 */
export const SUBJECT_COLORS = [
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
];

/**
 * Get all subjects from localStorage
 */
export function getAllSubjects(): Subject[] {
  try {
    const stored = localStorage.getItem(SUBJECTS_KEY);
    if (!stored) return getDefaultSubjects();
    
    const subjects = JSON.parse(stored);
    return subjects.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading subjects:', error);
    return getDefaultSubjects();
  }
}

/**
 * Create a new subject
 */
export function createSubject(data: CreateSubjectDTO): Subject {
  const subjects = getAllSubjects();
  
  const newSubject: Subject = {
    id: generateId(),
    name: data.name,
    description: data.description,
    color: data.color,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const updatedSubjects = [...subjects, newSubject];
  saveSubjects(updatedSubjects);
  
  return newSubject;
}

/**
 * Update an existing subject
 */
export function updateSubject(id: string, data: Partial<CreateSubjectDTO>): Subject | null {
  const subjects = getAllSubjects();
  const index = subjects.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  const updatedSubject: Subject = {
    ...subjects[index],
    ...data,
    updatedAt: new Date(),
  };
  
  subjects[index] = updatedSubject;
  saveSubjects(subjects);
  
  return updatedSubject;
}

/**
 * Delete a subject
 */
export function deleteSubject(id: string): boolean {
  const subjects = getAllSubjects();
  const filtered = subjects.filter(s => s.id !== id);
  
  if (filtered.length === subjects.length) return false;
  
  saveSubjects(filtered);
  return true;
}

/**
 * Get a single subject by ID
 */
export function getSubjectById(id: string): Subject | null {
  const subjects = getAllSubjects();
  return subjects.find(s => s.id === id) || null;
}

/**
 * Save subjects to localStorage
 */
function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error('Error saving subjects:', error);
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default subjects for first-time users
 */
function getDefaultSubjects(): Subject[] {
  return [
    {
      id: 'default_1',
      name: 'Computer Science',
      description: 'Programming, algorithms, and data structures',
      color: SUBJECT_COLORS[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default_2',
      name: 'Mathematics',
      description: 'Calculus, algebra, and statistics',
      color: SUBJECT_COLORS[1],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default_3',
      name: 'Database Systems',
      description: 'SQL, NoSQL, and database design',
      color: SUBJECT_COLORS[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default_4',
      name: 'Algorithms',
      description: 'Algorithm design and analysis',
      color: SUBJECT_COLORS[3],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

/**
 * Reset subjects to defaults (useful for testing)
 */
export function resetSubjects(): void {
  localStorage.removeItem(SUBJECTS_KEY);
}
