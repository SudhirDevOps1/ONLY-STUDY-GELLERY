import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-blue-100 text-sm">Navigate faster with keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ShortcutSection title="Navigation">
            <ShortcutRow keys={['←', '→']} description="Previous / Next in lightbox" />
            <ShortcutRow keys={['Esc']} description="Close lightbox or modal" />
            <ShortcutRow keys={['?']} description="Toggle this help" />
          </ShortcutSection>

          <ShortcutSection title="Media Controls">
            <ShortcutRow keys={['Space']} description="Play/Pause video or audio" />
            <ShortcutRow keys={['F']} description="Toggle fullscreen" />
            <ShortcutRow keys={['M']} description="Toggle mute" />
            <ShortcutRow keys={['S']} description="Toggle slideshow" />
          </ShortcutSection>

          <ShortcutSection title="Actions">
            <ShortcutRow keys={['D']} description="Download current media" />
            <ShortcutRow keys={['C']} description="Copy link to clipboard" />
            <ShortcutRow keys={['F', '♥']} description="Toggle favorite" />
            <ShortcutRow keys={['+']} description="Zoom in (images)" />
            <ShortcutRow keys={['-']} description="Zoom out (images)" />
            <ShortcutRow keys={['0']} description="Reset zoom" />
          </ShortcutSection>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">?</kbd> anywhere to open this help dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ShortcutSectionProps {
  title: string;
  children: React.ReactNode;
}

const ShortcutSection: React.FC<ShortcutSectionProps> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-800/50 rounded-lg transition-colors">
    <span className="text-gray-300 text-sm">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, idx) => (
        <React.Fragment key={idx}>
          <kbd className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono text-gray-200 shadow-sm min-w-[28px] text-center">
            {key}
          </kbd>
          {idx < keys.length - 1 && <span className="text-gray-500 text-xs mx-1">or</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);
