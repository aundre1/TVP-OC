// ============================================
// THE VIDEO POOL - DOWNLOAD COUNTER
// Shows download count in header with status colors
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown, Crown, Infinity as InfinityIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useDownloadLimits } from '@/hooks';
import { useAppStore } from '@/stores/appStore';

interface DownloadCounterProps {
  variant?: 'compact' | 'expanded';
  showTooltip?: boolean;
}

export default function DownloadCounter({
  variant = 'compact',
  showTooltip = true,
}: DownloadCounterProps) {
  const navigate = useNavigate();
  const { openDownloadLimitModal } = useAppStore();
  const { data: limits, isLoading } = useDownloadLimits();
  const [isHovered, setIsHovered] = useState(false);

  const used = limits?.used ?? 0;
  const limit = limits?.limit;
  const tier = limits?.tier ?? 'free';
  const isUnlimited = limit === 'unlimited';
  const remaining: number = isUnlimited ? Number.POSITIVE_INFINITY : (typeof limit === 'number' ? limit - used : 0);

  // Calculate percentage for color status
  const percentUsed = isUnlimited ? 0 : (typeof limit === 'number' ? (used / limit) * 100 : 100);

  // Determine status color
  const getStatusColor = () => {
    if (isUnlimited) return 'text-tvp-accent-cyan';
    if (remaining <= 0) return 'text-tvp-status-error';
    if (percentUsed >= 80) return 'text-tvp-status-warning';
    return 'text-tvp-text-secondary';
  };

  const getStatusBgColor = () => {
    if (isUnlimited) return 'bg-tvp-accent-cyan/10';
    if (remaining <= 0) return 'bg-tvp-status-error/10';
    if (percentUsed >= 80) return 'bg-tvp-status-warning/10';
    return 'bg-tvp-bg-tertiary';
  };

  const getBorderColor = () => {
    if (isUnlimited) return 'border-tvp-accent-cyan/30';
    if (remaining <= 0) return 'border-tvp-status-error/30';
    if (percentUsed >= 80) return 'border-tvp-status-warning/30';
    return 'border-tvp-border-subtle';
  };

  const handleClick = () => {
    if (remaining <= 0 && !isUnlimited) {
      openDownloadLimitModal();
    } else {
      navigate('/membership');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-tvp-bg-tertiary border border-tvp-border-subtle',
          'animate-pulse'
        )}
      >
        <Download className="w-4 h-4 text-tvp-text-muted" />
        <span className="text-sm text-tvp-text-muted">--/--</span>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'relative flex items-center gap-3 px-4 py-2.5 rounded-lg',
          'border transition-all duration-fast',
          getStatusBgColor(),
          getBorderColor(),
          'hover:border-tvp-accent-cyan'
        )}
      >
        <Download className={clsx('w-4 h-4', getStatusColor())} />

        <div className="flex flex-col items-start">
          <span className="text-xs text-tvp-text-muted capitalize">{tier} Plan</span>
          <div className="flex items-center gap-1">
            <span className={clsx('text-sm font-semibold', getStatusColor())}>
              {isUnlimited ? (
                <InfinityIcon className="w-4 h-4 inline" />
              ) : (
                `${remaining}/${limit}`
              )}
            </span>
            <span className="text-xs text-tvp-text-muted">downloads left</span>
          </div>
        </div>

        {!isUnlimited && remaining <= 10 && (
          <Crown className="w-4 h-4 text-tvp-accent-coral ml-1" />
        )}

        {/* Tooltip on hover */}
        {showTooltip && isHovered && (
          <div
            className={clsx(
              'absolute top-full left-1/2 -translate-x-1/2 mt-2',
              'px-3 py-2 rounded-lg',
              'bg-tvp-bg-primary border border-tvp-border-default',
              'shadow-elevated z-50',
              'text-xs text-tvp-text-secondary whitespace-nowrap',
              'animate-fade-in'
            )}
          >
            {remaining <= 0 && !isUnlimited ? (
              <span className="text-tvp-status-error">Click to upgrade</span>
            ) : (
              <span>
                {limits?.resetsAt
                  ? `Resets ${new Date(limits.resetsAt).toLocaleDateString()}`
                  : 'View membership'}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Compact variant (default)
  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg',
        'border transition-all duration-fast',
        getStatusBgColor(),
        getBorderColor(),
        'hover:border-tvp-accent-cyan'
      )}
      title={`${isUnlimited ? 'Unlimited' : remaining} downloads remaining`}
    >
      <Download className={clsx('w-4 h-4', getStatusColor())} />

      <span className={clsx('text-sm font-mono font-medium', getStatusColor())}>
        {isUnlimited ? (
          <InfinityIcon className="w-4 h-4" />
        ) : (
          `${remaining}/${limit}`
        )}
      </span>

      {/* Warning indicator for low downloads */}
      {!isUnlimited && remaining > 0 && remaining <= 5 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-tvp-status-warning animate-pulse" />
      )}

      {/* Critical indicator when at limit */}
      {!isUnlimited && remaining <= 0 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-tvp-status-error" />
      )}

      {/* Tooltip on hover */}
      {showTooltip && isHovered && (
        <div
          className={clsx(
            'absolute top-full left-1/2 -translate-x-1/2 mt-2',
            'px-3 py-2 rounded-lg',
            'bg-tvp-bg-primary border border-tvp-border-default',
            'shadow-elevated z-50',
            'text-xs whitespace-nowrap',
            'animate-fade-in'
          )}
        >
          <div className="flex flex-col gap-1">
            <span className="text-tvp-text-secondary capitalize">
              {tier} Plan
            </span>
            {remaining <= 0 && !isUnlimited ? (
              <span className="text-tvp-status-error font-medium">
                Download limit reached - Click to upgrade
              </span>
            ) : (
              <span className="text-tvp-text-muted">
                {isUnlimited ? 'Unlimited downloads' : `${remaining} downloads remaining`}
              </span>
            )}
            {limits?.resetsAt && !isUnlimited && (
              <span className="text-tvp-text-muted text-[10px]">
                Resets {new Date(limits.resetsAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
