import React, { useState, useEffect } from 'react';
import { LoginPage } from '../features/auth/LoginPage';
import { HomePage } from '../features/home/HomePage';
import { LandingView } from '../features/landing/LandingView';
import { DashboardView } from '../features/dashboard/DashboardView';
import { LibraryView } from '../features/library/LibraryView';
import { AnalyzeView } from '../features/analyze/AnalyzeView';
import { PlannerView } from '../features/planner/PlannerView';
import { CalendarView } from '../features/planner/CalendarView';
import { SettingsView } from '../features/settings/SettingsView';
import { Sidebar, MobileNav } from '../components/layout/Sidebar';
import { AnalysisModal } from '../features/analyze/components/AnalysisModal';
import { Toast, useToast } from '../components/feedback/Toast';
import { getAllUploadedFiles } from '../services/fileUploadService';

export default function App() {
  const [appMode, setAppMode] = useState<'dark' | 'light'>('light'); // Light = proper routing structure
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Light theme states (Sprint 1 features accessible here)
  const [isSignedIn, setIsSignedIn] = useState(false); // Start with login
  const [activeView, setActiveView] = useState<string>('library'); // Start at library to see Sprint 1 features
  const [analyzingResourceId, setAnalyzingResourceId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    // Always use dark theme - remove light theme class
    document.body.classList.remove('light-theme');
  }, [appMode]);

  const handleLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsTransitioning(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsTransitioning(false);
    }, 500);
  };

  // Legacy light theme handlers
  const handleGetStarted = () => {
    setIsSignedIn(true);
    setActiveView('library'); // Go directly to library after sign in
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handleAnalyze = (id: string) => {
    setAnalyzingResourceId(id);
  };

  const handleAddToPlan = (id: string) => {
    showToast('Material added to study plan', 'success');
  };

  const handleAnalysisComplete = (result: any) => {
    showToast('Analysis complete! Material added to library.', 'success');
    setAnalyzingResourceId(null);
  };

  // Use the light mode structure (proper routing) but with dark theme styling
  // This gives us access to Sprint 1 features with dark UI
  
  // Show landing page with sign in
  if (!isSignedIn) {
    return <LandingView onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1320px] mx-auto">
            {activeView === 'dashboard' && <DashboardView onNavigate={handleViewChange} />}
            {activeView === 'library' && (
              <LibraryView onAnalyze={handleAnalyze} onAddToPlan={handleAddToPlan} />
            )}
            {activeView === 'analyze' && <AnalyzeView />}
            {activeView === 'planner' && <PlannerView />}
            {activeView === 'calendar' && <CalendarView />}
            {activeView === 'settings' && <SettingsView />}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={analyzingResourceId !== null}
        onClose={() => setAnalyzingResourceId(null)}
        fileName={`Resource ${analyzingResourceId}`}
        onComplete={handleAnalysisComplete}
        fileMetadata={analyzingResourceId ? (() => {
          const uploadedFiles = getAllUploadedFiles();
          const file = uploadedFiles.find(f => f.id === analyzingResourceId);
          return file?.metadata;
        })() : undefined}
      />

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
