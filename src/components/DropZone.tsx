import type { Answer } from '../data/situations';

interface DropZoneProps {
  type: Answer;
  active: boolean;
  onDrop: () => void;
}

export default function DropZone({ type, active, onDrop }: DropZoneProps) {
  const isYes = type === 'yes';

  return (
    <div
      data-drop-zone={type}
      onPointerUp={() => active && onDrop()}
      className={`flex min-h-[130px] flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-white/25 p-3 text-center transition-all duration-200 ${
        isYes
          ? 'bg-gradient-to-b from-green-500/25 to-green-600/10'
          : 'bg-gradient-to-b from-pink-500/25 to-pink-600/10'
      } zone-drop`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold ${
          isYes
            ? 'bg-[var(--color-yes)] text-[#0f0720]'
            : 'bg-[var(--color-no)] text-white'
        }`}
      >
        {isYes ? '✓' : '✗'}
      </div>
      <h2 className="mt-2 text-sm leading-tight font-bold">
        Worth Saying
        <br />
        {isYes ? 'Yes To' : 'No To'}
      </h2>
      <p className="mt-1 text-[0.65rem] text-white/50">Drop here</p>
    </div>
  );
}
