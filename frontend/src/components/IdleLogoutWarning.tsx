import React from 'react';
import Button from './ui/Button';

interface IdleLogoutWarningProps {
  isOpen: boolean;
  secondsUntilLogout: number;
  onDismiss: () => void;
  onLogout: () => void;
}

export function IdleLogoutWarning({
  isOpen,
  secondsUntilLogout,
  onDismiss,
  onLogout,
}: IdleLogoutWarningProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(secondsUntilLogout / 60);
  const seconds = secondsUntilLogout % 60;
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <span className="text-2xl">⏱️</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Session Timeout Warning</h2>
        </div>

        <p className="text-muted-foreground mb-6">
          You've been inactive for a while. For your security, your session will expire in:
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6 text-center">
          <div className="text-4xl font-bold text-primary">{timeString}</div>
          <p className="text-sm text-muted-foreground mt-2">Move your mouse or press a key to stay logged in</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onDismiss}
            className="flex-1"
          >
            Stay Logged In
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={onLogout}
            className="flex-1"
          >
            Logout Now
          </Button>
        </div>
      </div>
    </div>
  );
}
