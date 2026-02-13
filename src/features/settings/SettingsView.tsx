import React, { useState } from 'react';
import { User, Bell, Palette, Clock, Shield } from 'lucide-react';
import { Card } from '../../components/data-display/Card';
import { Input } from '../../components/form-controls/Input';
import { Button } from '../../components/form-controls/Button';
import { Badge } from '../../components/data-display/Badge';

export function SettingsView() {
  const [settings, setSettings] = useState({
    name: 'Vaibhav Bansal',
    email: 'bansalvaibhav@gmail.com',
    studyStyle: 'pomodoro',
    sessionDuration: '25',
    breakDuration: '5',
    difficultyCalibration: 'medium',
    notifications: {
      sessionReminders: true,
      dailySummary: true,
      examAlerts: true,
      weeklyReport: false
    },
    theme: 'default'
  });

  const handleSave = () => {
    // Save settings logic
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          Settings
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Customize your study preferences and profile
        </p>
      </div>

      {/* Profile Settings */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Profile
          </h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Full Name"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>
      </Card>

      {/* Study Preferences */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Study Preferences
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
              Study Style
            </label>
            <div className="flex flex-wrap gap-2">
              {['pomodoro', 'long-block', 'flexible'].map(style => (
                <Badge
                  key={style}
                  variant={settings.studyStyle === style ? 'info' : 'default'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSettings({ ...settings, studyStyle: style })}
                >
                  {style.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {settings.studyStyle === 'pomodoro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Session Duration (minutes)"
                type="number"
                value={settings.sessionDuration}
                onChange={(e) => setSettings({ ...settings, sessionDuration: e.target.value })}
              />
              <Input
                label="Break Duration (minutes)"
                type="number"
                value={settings.breakDuration}
                onChange={(e) => setSettings({ ...settings, breakDuration: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
              Difficulty Calibration
            </label>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Adjust how the AI estimates content difficulty for you
            </p>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map(level => (
                <Badge
                  key={level}
                  variant={settings.difficultyCalibration === level ? 'info' : 'default'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSettings({ ...settings, difficultyCalibration: level })}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <Bell size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <span className="text-[var(--color-text-primary)] capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    [key]: e.target.checked
                  }
                })}
                className="w-5 h-5 rounded accent-[var(--color-primary-violet)]"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <Palette size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Appearance
          </h2>
        </div>

        <div>
          <label className="block mb-3 font-medium text-[var(--color-text-primary)]">
            Theme
          </label>
          <div className="flex flex-wrap gap-2">
            {['default', 'high-contrast'].map(theme => (
              <Badge
                key={theme}
                variant={settings.theme === theme ? 'info' : 'default'}
                className="cursor-pointer capitalize"
                onClick={() => setSettings({ ...settings, theme })}
              >
                {theme.replace('-', ' ')}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            High-contrast mode improves readability for low-vision users
          </p>
        </div>
      </Card>

      {/* Privacy */}
      <Card variant="default" className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <Shield size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Privacy & Data
          </h2>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Your study data is stored locally and never shared with third parties.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost">Export Data</Button>
          <Button variant="ghost">Delete Account</Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 animate-in fade-in duration-500" style={{ animationDelay: '600ms' }}>
        <Button variant="ghost">Reset to Defaults</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
