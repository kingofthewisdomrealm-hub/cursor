import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/layout/Logo";
import { DoshaPreviewCards, HowItWorks } from "@/components/landing/DoshaCards";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ArrowRight, Leaf } from "lucide-react";

export default function LandingPage() {
  return (
    <AppShell showNav>
      {/* Hero — one composition */}
      <section className="relative overflow-hidden pb-10 pt-8 sm:pt-12">
        <div className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 rounded-full bg-vata/10 blur-3xl animate-breathe" />
        <div className="pointer-events-none absolute -left-10 top-40 h-48 w-48 rounded-full bg-kapha/10 blur-3xl" />

        <div className="relative animate-fade-up">
          <Logo size="lg" />
          <h1 className="mt-8 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Discover the yoga practice your body actually needs.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Dosha Yoga combines classical yoga with Ayurvedic dosha wisdom—so
            your practice matches your constitution, energy, and how you feel
            today.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/quiz" size="lg">
              Discover My Dosha
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/check-in" variant="outline" size="lg">
              Daily check-in
            </Button>
          </div>
        </div>

        {/* Full-bleed atmospheric visual plane */}
        <div className="relative mt-10 -mx-4 h-52 overflow-hidden sm:mx-0 sm:h-64 sm:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-leaf-deep via-leaf to-vata" />
          <div className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(247,243,236,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25) 0%, transparent 35%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <Leaf className="mb-3 h-8 w-8 opacity-90 animate-breathe" />
            <p className="font-display text-xl font-medium sm:text-2xl">
              Balance body · breath · mind
            </p>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Personalized routines for Vata, Pitta, and Kapha
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <h2 className="font-display text-2xl font-semibold text-ink">
          The three doshas
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Each person carries a unique blend. Your primary dosha guides the
          practices that restore balance.
        </p>
        <div className="mt-6">
          <DoshaPreviewCards />
        </div>
      </section>

      <section className="py-10">
        <h2 className="font-display text-2xl font-semibold text-ink">
          How it works
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          From assessment to mat—in a few calm minutes.
        </p>
        <div className="mt-6">
          <HowItWorks />
        </div>
        <div className="mt-8">
          <Button href="/quiz" size="lg" className="w-full sm:w-auto">
            Begin assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-ink/5 py-8">
        <Disclaimer />
      </footer>
    </AppShell>
  );
}
