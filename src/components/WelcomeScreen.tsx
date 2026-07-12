interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center animate-pop-in">
      <div className="mb-6 text-6xl animate-float">🎯</div>

      <h1 className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
        Yes or No?
      </h1>

      <p className="mt-3 max-w-xs text-lg text-cyan-300/90">
        Learn when to say yes — and when to say no.
      </p>

      <div className="mt-10 w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
        <HowToStep number={1} text="Read each situation card" />
        <HowToStep number={2} text="Drag it — or tap Yes / No" />
        <HowToStep number={3} text="Build your streak & score" />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 w-full max-w-sm rounded-full bg-gradient-to-r from-[var(--color-yes)] to-[var(--color-cyan)] px-8 py-4 text-lg font-bold text-[#0f0720] shadow-lg shadow-green-500/25 transition-transform active:scale-95 hover:scale-[1.02]"
      >
        Start Playing
      </button>

      <p className="mt-6 text-sm text-white/40">20 cards · Mobile friendly</p>
    </div>
  );
}

function HowToStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold">
        {number}
      </span>
      <span className="text-sm text-white/80">{text}</span>
    </div>
  );
}
