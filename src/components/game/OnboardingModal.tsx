"use client";

interface Props {
	onDone: () => void;
}

export function OnboardingModal({ onDone }: Props) {
	return (
		<div
			className='overlay animate-fade-in'
			role='dialog'
			aria-modal='true'
			aria-labelledby='onboard-title'
		>
			<div className='panel panel-onboard animate-scale-in'>
				<p className='eyebrow'>Your first 30 seconds</p>
				<div className='onboard-visual' aria-hidden>
					<span className='onboard-face before' />
					<span className='onboard-arrow' />
					<span className='onboard-face after' />
				</div>
				<h2 id='onboard-title' className='panel-title'>
					Feel the room, then transform it
				</h2>
				<p className='panel-sub'>
					Move with the joystick. Skills auto-respond to nearby
					obstacles. Watch tension turn into understanding — then
					answer one real scenario between waves.
				</p>
				<div className='panel-actions'>
					<button
						type='button'
						className='btn btn-primary'
						onClick={onDone}
					>
						Enter the conversation
					</button>
				</div>
			</div>
		</div>
	);
}
