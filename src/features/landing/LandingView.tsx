import React from 'react';
import { Upload, BarChart3, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../../components/form-controls/Button';
import { Card } from '../../components/data-display/Card';

interface LandingViewProps {
  onGetStarted: () => void;
}

export function LandingView({ onGetStarted }: LandingViewProps) {
  const features = [
    {
      icon: <Upload size={32} />,
      title: 'Upload Materials',
      description: 'Drop your PDFs, PPTs, and study materials to get started'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Auto-Analyze',
      description: 'AI analyzes content density, difficulty, and estimated study time'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Generate Timetable',
      description: 'Get a personalized study schedule optimized for your goals'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
            <Sparkles size={16} className="text-[var(--color-primary-violet)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Smart Study Planning for College Students
            </span>
          </div>
          
          <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
            <span className="gradient-text">STUDIFY</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--color-text-primary)] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
            Study smarter — not longer
          </p>
          
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
            Turn slides into smart study plans — auto estimate effort & schedule time
          </p>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
            <Button size="lg" onClick={onGetStarted}>
              Try it — Upload Materials
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
          {features.map((feature, index) => (
            <Card 
              key={index} 
              variant="elevated" 
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-muted)]">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[var(--color-primary-violet)]/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[var(--color-primary-pink)]/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>
    </div>
  );
}
