import { Fraunces } from 'next/font/google'
import Link from 'next/link'

const fraunces = Fraunces({
	subsets: ['latin'],
	weight: ['500', '700'],
	variable: '--font-fraunces',
	display: 'swap',
})

export default function HomePage() {
	return (
		<main className={`landing ${fraunces.variable}`}>
			<section className='landing-hero'>
				<div className='landing-visual' aria-hidden>
					<div className='landing-orbit'>
						<span className='orbit-ring ring-a' />
						<span className='orbit-ring ring-b' />
						<span className='orbit-node node-a' />
						<span className='orbit-node node-b' />
						<span className='orbit-node node-c' />
						<span className='orbit-core' />
					</div>
				</div>

				<div className='landing-content animate-fade-up'>
					<h1 className='brand'>
						Communication
						<span>Survival</span>
					</h1>
					<p className='hero-line'>
						Survive waves of conversations. Transform objections
						into alliance.
					</p>
					<div className='cta-row'>
						<Link href='/play' className='btn btn-primary' prefetch>
							Enter the room
						</Link>
						<Link href='/progress' className='btn btn-ghost'>
							Disciplines
						</Link>
					</div>
				</div>
			</section>

			<section className='section'>
				<h2 className='animate-fade-up'>Not monsters — moments</h2>
				<p className='lead'>
					Every obstacle is a real communication challenge. Your
					skills fire automatically. Your choices between waves teach
					the craft.
				</p>
				<div className='feature-strip'>
					<div className='feature-item'>
						<h3>Auto-respond with skills</h3>
						<p>
							Open Questions, Empathy, Storytelling, and more
							engage nearby obstacles like weapons — without the
							violence.
						</p>
					</div>
					<div className='feature-item'>
						<h3>Transform, don’t defeat</h3>
						<div className='transform-row'>
							<span className='pill'>Angry → Understood</span>
							<span className='pill'>Distant → Engaged</span>
							<span className='pill'>Skeptical → Convinced</span>
						</div>
					</div>
					<div className='feature-item'>
						<h3>Learn between waves</h3>
						<p>
							Short scenarios after each round. Pick the best
							response. Unlock upgrades that change how you play.
						</p>
					</div>
				</div>
			</section>
		</main>
	)
}
