'use client';

interface AdSlotProps {
  slot: string;
  className?: string;
}

export function AdSlot({ slot, className = '' }: AdSlotProps) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-border-light p-8 text-sm text-text-muted ${className}`}
      >
        Ad Slot: {slot}
      </div>
    );
  }

  return <div data-ad-slot={slot} className={className} />;
}
