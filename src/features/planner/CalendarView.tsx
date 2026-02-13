import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '../../components/form-controls/Button';
import { Card } from '../../components/data-display/Card';
import { Badge } from '../../components/data-display/Badge';
import { StudySession } from './components/StudySession';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const sessions: StudySession[] = [
    {
      id: '1',
      subject: 'Data Structures',
      title: 'Binary Trees',
      duration: 90,
      startTime: '9:00',
      color: '#9B7CFF',
      type: 'Deep focus'
    },
    {
      id: '2',
      subject: 'Algorithms',
      title: 'DP Practice',
      duration: 60,
      startTime: '14:00',
      color: '#5AC8FA',
      type: 'Review'
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Calendar
          </h1>
          <p className="text-[var(--color-text-muted)]">
            View and manage your study schedule
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setView(view === 'month' ? 'week' : 'month')}>
            {view === 'month' ? 'Week' : 'Month'} View
          </Button>
          <Button>
            <Download size={18} />
            Export
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="icon" size="sm" onClick={previousMonth} aria-label="Previous month">
              <ChevronLeft size={20} />
            </Button>
            <Button variant="icon" size="sm" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-[var(--color-text-muted)] py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for alignment */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {days.map(day => {
            const isToday = day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const hasSessions = day % 3 === 0; // Mock data

            return (
              <div
                key={day}
                className={`
                  aspect-square p-2 rounded-lg border transition-all duration-200
                  ${isToday
                    ? 'border-[var(--color-primary-violet)] bg-[var(--color-primary-violet)]/10'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }
                  ${hasSessions ? 'cursor-pointer' : ''}
                `}
              >
                <div className="h-full flex flex-col">
                  <span className={`
                    text-sm font-medium
                    ${isToday ? 'text-[var(--color-primary-violet)]' : 'text-[var(--color-text-primary)]'}
                  `}>
                    {day}
                  </span>
                  {hasSessions && (
                    <div className="mt-1 space-y-1">
                      <div className="w-full h-1 rounded-full bg-[var(--color-primary-violet)]" />
                      <div className="w-full h-1 rounded-full bg-[var(--color-accent-blue)]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's Schedule */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Today's Schedule
        </h2>
        <div className="space-y-3">
          {sessions.map(session => (
            <Card key={session.id} variant="compact">
              <div className="flex items-start gap-4">
                <div 
                  className="w-1 h-full rounded-full"
                  style={{ backgroundColor: session.color }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {session.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">{session.subject}</p>
                    </div>
                    <Badge size="sm">{session.type}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {session.startTime} • {session.duration} minutes
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card variant="compact" className="animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
        <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[var(--color-primary-violet)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Deep Focus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[var(--color-accent-blue)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[var(--color-warning)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Practice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Quick Recap</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
