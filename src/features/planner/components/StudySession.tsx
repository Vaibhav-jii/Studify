import React from 'react';
import { Clock, GripVertical } from 'lucide-react';
import { Badge } from '../../../components/data-display/Badge';

export interface StudySession {
  id: string;
  subject: string;
  title: string;
  duration: number;
  startTime: string;
  color: string;
  type: string;
}

interface StudySessionCardProps {
  session: StudySession;
  onClick?: () => void;
  draggable?: boolean;
}

export function StudySessionCard({ session, onClick, draggable = false }: StudySessionCardProps) {
  return (
    <div
      className={`
        glass-card p-4 rounded-lg border-l-4 transition-all duration-300
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(88,76,120,0.15)]' : ''}
        ${draggable ? 'cursor-move' : ''}
      `}
      style={{ borderLeftColor: session.color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        {draggable && (
          <div className="text-[var(--color-text-muted)] pt-1">
            <GripVertical size={16} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)] truncate">
                {session.title}
              </h4>
              <p className="text-sm text-[var(--color-text-muted)]">{session.subject}</p>
            </div>
            <Badge size="sm">{session.type}</Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {session.duration} min
            </span>
            <span>{session.startTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimelineView({ sessions, onSessionClick }: { 
  sessions: StudySession[];
  onSessionClick?: (session: StudySession) => void;
}) {
  const groupedByDay = sessions.reduce((acc, session) => {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {} as Record<string, StudySession[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDay).map(([day, daySessions]) => (
        <div key={day}>
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{day}</h3>
          <div className="space-y-3">
            {daySessions.map(session => (
              <StudySessionCard
                key={session.id}
                session={session}
                onClick={onSessionClick ? () => onSessionClick(session) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyGrid({ sessions, onSessionClick }: {
  sessions: StudySession[];
  onSessionClick?: (session: StudySession) => void;
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">Time</div>
          {days.map(day => (
            <div key={day} className="text-sm font-medium text-[var(--color-text-primary)] text-center">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-2">
              <div className="text-xs text-[var(--color-text-muted)] py-2">
                {hour}:00
              </div>
              {days.map(day => {
                const daySession = sessions.find(s => 
                  s.startTime.startsWith(`${hour}:`)
                );
                
                return (
                  <div 
                    key={`${day}-${hour}`}
                    className="min-h-[60px] rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {daySession && (
                      <div
                        className="h-full p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ backgroundColor: `${daySession.color}40`, borderLeft: `3px solid ${daySession.color}` }}
                        onClick={() => onSessionClick?.(daySession)}
                      >
                        <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                          {daySession.subject}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {daySession.duration}m
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
