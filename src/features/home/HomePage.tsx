import React from 'react';
import { BookOpen, TrendingUp, Clock, Target, Zap, Calendar, BarChart3, Award, LogOut, Menu, X, Plus, Play, ChevronRight, Edit, Trash2, CheckCircle, AlertCircle, Brain, Book, FileText, Settings, Upload, Paperclip } from 'lucide-react';

interface HomePageProps {
  onLogout: () => void;
}

export function HomePage({ onLogout }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [showModal, setShowModal] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<any>(null);
  const [selectedSession, setSelectedSession] = React.useState<any>(null);
  const [isStudying, setIsStudying] = React.useState(false);
  const [studyTimer, setStudyTimer] = React.useState(0);
  const [uploadedFiles, setUploadedFiles] = React.useState<{ [subjectId: number]: File[] }>({});
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [newSubjectName, setNewSubjectName] = React.useState('');
  const [newSubjectColor, setNewSubjectColor] = React.useState('#9B7CFF');

  const stats = [
    { icon: <Clock size={24} />, label: "Study Time", value: "24.5h", change: "+12%", color: "#9B7CFF" },
    { icon: <Target size={24} />, label: "Goals Hit", value: "8/10", change: "+2", color: "#5AC8FA" },
    { icon: <TrendingUp size={24} />, label: "Streak", value: "14 days", change: "🔥", color: "#33CC99" },
    { icon: <Award size={24} />, label: "Level", value: "Pro", change: "New!", color: "#FFABE1" }
  ];

  const [subjects, setSubjects] = React.useState([
    { id: 1, name: "Data Structures", progress: 75, color: "#9B7CFF", sessions: 12, topics: ["Arrays", "Linked Lists", "Trees", "Graphs"] },
    { id: 2, name: "Algorithms", progress: 60, color: "#5AC8FA", sessions: 9, topics: ["Sorting", "Searching", "Dynamic Programming"] },
    { id: 3, name: "Database Systems", progress: 85, color: "#33CC99", sessions: 15, topics: ["SQL", "Normalization", "Transactions"] },
    { id: 4, name: "Computer Networks", progress: 45, color: "#FFABE1", sessions: 7, topics: ["OSI Model", "TCP/IP", "Routing"] }
  ]);

  const [sessions, setSessions] = React.useState([
    { id: 1, subject: "Data Structures", topic: "Binary Trees", time: "14:00", duration: "90 min", completed: false },
    { id: 2, subject: "Algorithms", topic: "Dynamic Programming", time: "16:30", duration: "60 min", completed: false },
    { id: 3, subject: "Database Systems", topic: "SQL Queries", time: "18:00", duration: "45 min", completed: false }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'library', label: 'Library', icon: <Book size={18} /> },
    { id: 'planner', label: 'Planner', icon: <Calendar size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
    }
  };

  const handleStatClick = (stat: any) => {
    setShowModal('stat-detail');
    setSelectedSubject(stat);
  };

  const handleSubjectClick = (subject: any) => {
    setSelectedSubject(subject);
    setShowModal('subject-detail');
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    setShowModal('session-detail');
  };

  const handleStartStudying = () => {
    setIsStudying(true);
    setStudyTimer(0);
    setShowModal('study-session');
  };

  const handleCompleteSession = (sessionId: number) => {
    setSessions(sessions.map(s => 
      s.id === sessionId ? { ...s, completed: true } : s
    ));
    setShowModal(null);
  };

  const handleDeleteSession = (sessionId: number) => {
    if (window.confirm('Delete this session?')) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      setShowModal(null);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, subjectId: number) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const currentFiles = uploadedFiles[subjectId] || [];
      setUploadedFiles(prev => ({
        ...prev,
        [subjectId]: [...currentFiles, ...Array.from(files)]
      }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, subjectId: number) => {
    const files = e.target.files;
    if (files) {
      const currentFiles = uploadedFiles[subjectId] || [];
      setUploadedFiles(prev => ({
        ...prev,
        [subjectId]: [...currentFiles, ...Array.from(files)]
      }));
    }
  };

  const handleRemoveFile = (subjectId: number, fileIndex: number) => {
    const currentFiles = uploadedFiles[subjectId] || [];
    setUploadedFiles(prev => ({
      ...prev,
      [subjectId]: currentFiles.filter((_, index) => index !== fileIndex)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0E1324] to-[#1A1F35] bg-noise neural-pattern">
      {/* Header */}
      <header className="border-b border-white/10 glass-card-dark sticky top-0 z-50 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group"
              aria-label="Go to home"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#9B7CFF] to-[#FFABE1] flex items-center justify-center shadow-[0_0_20px_rgba(155,124,255,0.4)] group-hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-shadow">
                <Zap size={18} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#9B7CFF] to-[#FFABE1] bg-clip-text text-transparent">
                STUDIFY
              </h1>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${activeTab === item.id 
                      ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(155,124,255,0.3)]' 
                      : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Side - User & Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300"
                aria-label="Log out"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Log Out</span>
              </button>

              {/* Logout Button - Mobile Icon */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white border border-white/10 transition-all"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>

              {/* User Avatar */}
              <button 
                onClick={() => setShowModal('profile')}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#9B7CFF] to-[#5AC8FA] flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-[0_4px_12px_rgba(155,124,255,0.3)] hover:shadow-[0_4px_20px_rgba(155,124,255,0.5)] transition-shadow"
              >
                AJ
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-300
                    ${activeTab === item.id 
                      ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(155,124,255,0.3)]' 
                      : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <>
            {/* Hero Section */}
            <div className="relative mb-8 sm:mb-12 rounded-2xl sm:rounded-[var(--radius-xl)] overflow-hidden animate-in fade-in duration-700">
              <div className="absolute inset-0 opacity-20 sm:opacity-30 pointer-events-none">
                <iframe
                  src="https://my.spline.design/animatedlightdesktop-q3VkMLsfCZi7SQXbWNIgqvIe/"
                  className="w-full h-full border-0 scale-125 sm:scale-150"
                  title="Background Animation"
                  loading="lazy"
                />
              </div>
              
              <div className="relative glass-card-dark p-6 sm:p-8 md:p-12">
                <div className="max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                    Welcome back, Alex 👋
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mb-4 sm:mb-6">
                    You're on a 14-day streak! Keep up the momentum and crush your goals today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={handleStartStudying}
                      className="px-6 py-3 rounded-xl sm:rounded-[var(--radius-md)] bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Start Studying
                    </button>
                    <button 
                      onClick={() => handleNavClick('analytics')}
                      className="px-6 py-3 rounded-xl sm:rounded-[var(--radius-md)] glass-card-dark text-white font-semibold hover:bg-white/10 transition-all border border-white/10"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
              {stats.map((stat, index) => (
                <button
                  key={index}
                  onClick={() => handleStatClick(stat)}
                  className="glass-card-dark rounded-xl sm:rounded-[var(--radius-lg)] p-4 sm:p-6 hover:bg-white/10 transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#9B7CFF]/20 to-[#5AC8FA]/20 flex items-center justify-center text-[#9B7CFF] group-hover:scale-110 transition-transform">
                      {React.cloneElement(stat.icon as React.ReactElement, { size: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24 })}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#33CC99]">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Subjects Progress */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="glass-card-dark rounded-xl sm:rounded-[var(--radius-xl)] p-4 sm:p-6 animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <BookOpen size={20} className="sm:w-6 sm:h-6 text-[#9B7CFF]" />
                      <span className="hidden sm:inline">Subject Progress</span>
                      <span className="sm:hidden">Subjects</span>
                    </h3>
                    <button 
                      onClick={() => handleNavClick('library')}
                      className="text-xs sm:text-sm text-[#9B7CFF] hover:text-[#5AC8FA] transition-colors font-medium"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectClick(subject)}
                        className="w-full p-3 sm:p-4 rounded-xl sm:rounded-[var(--radius-md)] bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base text-white">{subject.name}</h4>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{subject.sessions} sessions completed</p>
                          </div>
                          <span className="text-base sm:text-lg font-bold text-white">{subject.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${subject.progress}%`,
                              backgroundColor: subject.color,
                              boxShadow: `0 0 10px ${subject.color}80`
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="glass-card-dark rounded-xl sm:rounded-[var(--radius-xl)] p-4 sm:p-6 animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-4 sm:mb-6">
                    <BarChart3 size={20} className="sm:w-6 sm:h-6 text-[#5AC8FA]" />
                    This Week's Activity
                  </h3>
                  
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                      const height = Math.random() * 60 + 40;
                      return (
                        <button
                          key={index}
                          onClick={() => alert(`${day}: ${Math.floor(height / 10)} hours studied`)}
                          className="flex flex-col items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-full h-24 sm:h-32 bg-white/5 rounded-lg flex items-end justify-center p-0.5 sm:p-1">
                            <div 
                              className="w-full rounded-md bg-gradient-to-t from-[#9B7CFF] to-[#5AC8FA] transition-all duration-500 hover:scale-105 cursor-pointer"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--color-text-secondary)]">{day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card-dark rounded-xl sm:rounded-[var(--radius-xl)] p-4 sm:p-6 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <Calendar size={20} className="sm:w-6 sm:h-6 text-[#9B7CFF]" />
                      Today's Sessions
                    </h3>
                    <button
                      onClick={() => setShowModal('add-session')}
                      className="p-1.5 rounded-lg bg-[#9B7CFF]/20 hover:bg-[#9B7CFF]/30 text-[#9B7CFF] transition-all"
                      aria-label="Add session"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {sessions.filter(s => !s.completed).map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        className="w-full p-3 sm:p-4 rounded-xl sm:rounded-[var(--radius-md)] bg-white/5 hover:bg-white/10 border-l-4 border-[#9B7CFF] transition-all cursor-pointer group text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#9B7CFF] transition-colors">
                              {session.topic}
                            </h4>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{session.subject}</p>
                          </div>
                          <ChevronRight size={18} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                            {session.time}
                          </span>
                          <span>•</span>
                          <span>{session.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleNavClick('planner')}
                    className="w-full mt-3 sm:mt-4 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-[var(--radius-md)] border border-white/10 text-sm text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-all"
                  >
                    View Full Schedule
                  </button>
                </div>

                {/* AI Insights */}
                <button
                  onClick={() => setShowModal('ai-insight')}
                  className="w-full glass-card-dark rounded-xl sm:rounded-[var(--radius-xl)] p-4 sm:p-6 bg-gradient-to-br from-[#9B7CFF]/10 to-transparent animate-in fade-in slide-in-from-right-4 duration-700 hover:bg-white/10 transition-all text-left"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9B7CFF] to-[#5AC8FA] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(155,124,255,0.4)]">
                      <Brain size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-white mb-1">AI Insight</h4>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        You're most productive between 2-5 PM. Consider scheduling complex topics during this window.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-[#9B7CFF] hover:text-[#5AC8FA] transition-colors font-medium flex items-center gap-1">
                    Optimize Schedule <ChevronRight size={14} />
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Library View */}
        {activeTab === 'library' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Study Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="glass-card-dark rounded-xl p-6 hover:bg-white/10 transition-all text-left relative cursor-pointer"
                  onClick={() => handleSubjectClick(subject)}
                >
                  {/* Upload Button - Top Right Corner */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubject(subject);
                      setShowModal('upload-materials');
                    }}
                    className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-md
                      bg-transparent hover:bg-[#9B7CFF]/10
                      border border-white/20 hover:border-[#9B7CFF]/40
                      text-[var(--color-text-secondary)] hover:text-[#9B7CFF]
                      transition-all duration-300 active:scale-95
                      hover:shadow-[0_0_20px_rgba(155,124,255,0.3)]
                      flex items-center gap-1"
                    aria-label="Upload materials"
                  >
                    <Upload size={12} />
                    <span>Upload</span>
                  </button>

                  <div className="w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: `${subject.color}30` }}>
                    <BookOpen size={24} className="m-3" style={{ color: subject.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{subject.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    {subject.topics.length} topics • {subject.sessions} sessions
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">{subject.progress}% Complete</span>
                    <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowModal('add-subject')}
                className="glass-card-dark rounded-xl p-6 border-2 border-dashed border-white/20 hover:border-[#9B7CFF]/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center min-h-[200px]"
              >
                <Plus size={32} className="text-[#9B7CFF] mb-2" />
                <span className="text-white font-medium">Add New Subject</span>
              </button>
            </div>
          </div>
        )}

        {/* Planner View */}
        {activeTab === 'planner' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Study Planner</h2>
              <button
                onClick={() => setShowModal('add-session')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Add Session
              </button>
            </div>
            <div className="glass-card-dark rounded-xl p-6 space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className={`w-2 h-16 rounded-full ${session.completed ? 'bg-[#33CC99]' : 'bg-[#9B7CFF]'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {session.completed && <CheckCircle size={16} className="text-[#33CC99]" />}
                      <h4 className="font-semibold text-white">{session.topic}</h4>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{session.subject} • {session.time} • {session.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSessionClick(session)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#5AC8FA] transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Analytics & Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card-dark rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#33CC99]" />
                  Study Performance
                </h3>
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white">{subject.name}</span>
                        <span className="text-sm font-semibold text-white">{subject.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${subject.progress}%`,
                            backgroundColor: subject.color,
                            boxShadow: `0 0 10px ${subject.color}80`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card-dark rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-[#9B7CFF]" />
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-[#33CC99]/10 border border-[#33CC99]/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-[#33CC99] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Great Progress!</h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          You're 85% through Database Systems. Complete 2 more sessions to master it!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FFABE1]/10 border border-[#FFABE1]/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-[#FFABE1] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Needs Attention</h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Computer Networks progress is slower. Schedule 3 sessions this week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowModal(null)}>
          <div className="glass-card-dark rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            {showModal === 'subject-detail' && selectedSubject && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedSubject.name}</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${selectedSubject.progress}%`,
                            backgroundColor: selectedSubject.color,
                            boxShadow: `0 0 10px ${selectedSubject.color}80`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">{selectedSubject.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">Topics</p>
                    <div className="space-y-2">
                      {selectedSubject.topics?.map((topic: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                          <FileText size={16} className="text-[#9B7CFF]" />
                          <span className="text-sm text-white">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(null);
                      handleStartStudying();
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Start Studying
                  </button>
                </div>
              </>
            )}

            {showModal === 'session-detail' && selectedSession && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedSession.topic}</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{selectedSession.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {selectedSession.time}
                      </span>
                      <span>•</span>
                      <span>{selectedSession.duration}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleCompleteSession(selectedSession.id);
                        alert('Session marked as complete!');
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#33CC99]/20 text-[#33CC99] font-semibold hover:bg-[#33CC99]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Complete
                    </button>
                    <button
                      onClick={() => handleDeleteSession(selectedSession.id)}
                      className="flex-1 px-4 py-3 rounded-lg bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}

            {showModal === 'study-session' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Study Session</h3>
                  <button onClick={() => { setShowModal(null); setIsStudying(false); }} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#9B7CFF] to-[#5AC8FA] flex items-center justify-center">
                    <div className="text-4xl font-bold text-white">
                      {formatTime(studyTimer)}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-1">Focus Mode Active</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Stay focused and crush your goals!</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsStudying(!isStudying)}
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                    >
                      {isStudying ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => {
                        alert(`Great job! You studied for ${formatTime(studyTimer)}`);
                        setShowModal(null);
                        setIsStudying(false);
                        setStudyTimer(0);
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </>
            )}

            {showModal === 'profile' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Profile</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#9B7CFF] to-[#5AC8FA] flex items-center justify-center text-white font-bold text-2xl">
                    AJ
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Alex Johnson</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">alex.johnson@studify.com</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">43</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">14</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">Pro</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Level</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(null)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Settings size={18} />
                    Edit Profile
                  </button>
                </div>
              </>
            )}

            {showModal === 'add-subject' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Add New Subject</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Subject Name Input */}
                  <div>
                    <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="e.g., Machine Learning"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#9B7CFF]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {['#9B7CFF', '#5AC8FA', '#33CC99', '#FFABE1', '#FF9F0A', '#FF6B6B'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewSubjectColor(color)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            newSubjectColor === color 
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0E1324] scale-110' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (newSubjectName.trim()) {
                          const newSubject = {
                            id: subjects.length + 1,
                            name: newSubjectName,
                            progress: 0,
                            color: newSubjectColor,
                            sessions: 0,
                            topics: []
                          };
                          setSubjects([...subjects, newSubject]);
                          setNewSubjectName('');
                          setNewSubjectColor('#9B7CFF');
                          setShowModal(null);
                          setActiveTab('library');
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newSubjectName.trim()}
                    >
                      Add Subject
                    </button>
                    <button
                      onClick={() => {
                        setNewSubjectName('');
                        setNewSubjectColor('#9B7CFF');
                        setShowModal(null);
                      }}
                      className="px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}

            {showModal === 'add-session' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Add New Session</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  This feature is coming soon! Stay tuned for updates.
                </p>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all"
                >
                  Got it!
                </button>
              </>
            )}

            {(showModal === 'stat-detail' || showModal === 'ai-insight') && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {showModal === 'stat-detail' ? 'Detailed Stats' : 'AI Insights'}
                  </h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Detailed analytics and personalized recommendations will be available here.
                </p>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all"
                >
                  Close
                </button>
              </>
            )}

            {showModal === 'upload-materials' && selectedSubject && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Upload to {selectedSubject.name}</h3>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Drag & Drop Zone */}
                  <div
                    className={`w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                      ${isDragging 
                        ? 'border-[#9B7CFF] bg-[#9B7CFF]/10 scale-[1.02]' 
                        : 'border-white/30 hover:border-[#9B7CFF]/50 hover:bg-white/5'
                      }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, selectedSubject.id)}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#9B7CFF]/20 flex items-center justify-center mb-4">
                      <Upload size={28} className="text-[#9B7CFF]" />
                    </div>
                    <h4 className="text-base font-semibold text-white mb-2">Drop files here or click to browse</h4>
                    <p className="text-sm text-[var(--color-text-secondary)] text-center">
                      Supported formats: PDF, PPT, PPTX, DOCX, MP4, etc.
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileInput(e, selectedSubject.id)}
                  />

                  {/* Uploaded Files List */}
                  {uploadedFiles[selectedSubject.id] && uploadedFiles[selectedSubject.id].length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Uploaded Files ({uploadedFiles[selectedSubject.id].length})</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {uploadedFiles[selectedSubject.id].map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-[#9B7CFF]/20 flex items-center justify-center flex-shrink-0">
                                <FileText size={18} className="text-[#9B7CFF]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{file.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(selectedSubject.id, index)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all flex-shrink-0"
                              aria-label="Remove file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        alert(`${uploadedFiles[selectedSubject.id]?.length || 0} file(s) uploaded successfully to ${selectedSubject.name}!`);
                        setShowModal(null);
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#9B7CFF] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_30px_rgba(155,124,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!uploadedFiles[selectedSubject.id] || uploadedFiles[selectedSubject.id].length === 0}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setShowModal(null)}
                      className="px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}