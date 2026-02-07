// ============================================
// THE VIDEO POOL - LAYOUT PRESET SELECTOR v5.5
// Three modes: Club Mode, Prep Mode, Custom
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Layout, ChevronDown, Monitor, Disc3, Settings2, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { LayoutPreset } from '@/types';

interface PresetOption {
  id: LayoutPreset;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'club',
    name: 'Club Mode',
    description: 'Set builder open, list view',
    icon: <Disc3 className="w-5 h-5" />,
  },
  {
    id: 'prep',
    name: 'Prep Mode',
    description: 'Recent downloads open, grid view',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your saved layout',
    icon: <Settings2 className="w-5 h-5" />,
  },
];

export default function LayoutPresetSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { layoutPreset, setLayoutPreset, showToast } = useAppStore();

  const currentPreset = PRESET_OPTIONS.find((p) => p.id === layoutPreset) || PRESET_OPTIONS[2];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: LayoutPreset) => {
    setLayoutPreset(preset);
    setIsOpen(false);
    showToast('success', `Switched to ${PRESET_OPTIONS.find((p) => p.id === preset)?.name}`);
  };

  const handleSaveCustom = () => {
    // In a real app, this would save current layout to localStorage
    showToast('success', 'Custom layout saved');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2',
          'bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg',
          'text-tvp-text-secondary text-[13px]',
          'transition-all duration-fast',
          'hover:bg-tvp-accent-cyan-subtle hover:border-tvp-accent-cyan hover:text-tvp-accent-cyan',
          isOpen && 'bg-tvp-accent-cyan-subtle border-tvp-accent-cyan text-tvp-accent-cyan'
        )}
      >
        <Layout className="w-4 h-4" />
        <span className="font-medium">{currentPreset.name}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-fast',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={clsx(
            'absolute top-[calc(100%+8px)] right-0 w-[260px]',
            'bg-tvp-bg-secondary border border-tvp-border-default rounded-xl',
            'shadow-elevated p-2 z-500',
            'animate-fade-in'
          )}
        >
          {/* Preset Options */}
          {PRESET_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectPreset(option.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'transition-colors duration-fast',
                layoutPreset === option.id
                  ? 'bg-tvp-accent-cyan-subtle'
                  : 'hover:bg-tvp-bg-tertiary'
              )}
            >
              <span
                className={clsx(
                  'text-xl w-7 text-center',
                  layoutPreset === option.id ? 'text-tvp-accent-cyan' : 'text-tvp-text-muted'
                )}
              >
                {option.icon}
              </span>
              <div className="flex-1 text-left">
                <div
                  className={clsx(
                    'text-sm font-medium',
                    layoutPreset === option.id
                      ? 'text-tvp-accent-cyan'
                      : 'text-tvp-text-primary'
                  )}
                >
                  {option.name}
                </div>
                <div className="text-[11px] text-tvp-text-muted mt-0.5">
                  {option.description}
                </div>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="h-px bg-tvp-border-subtle my-2" />

          {/* Save Custom Option */}
          <button
            onClick={handleSaveCustom}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-colors duration-fast',
              'hover:bg-[rgba(29,185,84,0.1)]',
              'group'
            )}
          >
            <Save className="w-5 h-5 text-tvp-text-muted group-hover:text-[#1DB954]" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-tvp-text-primary group-hover:text-[#1DB954]">
                Save Current as Custom
              </div>
              <div className="text-[11px] text-tvp-text-muted mt-0.5">
                Remember your layout preferences
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
