const SITUATIONS = [
  { text: 'A friend asks you to cover their shift last-minute — again.', emoji: '🔄', answer: 'no' },
  { text: 'Someone offers you a free class in something you\'ve always wanted to learn.', emoji: '🎓', answer: 'yes' },
  { text: 'Your coworker wants you to do their work because they "forgot."', emoji: '📋', answer: 'no' },
  { text: 'A neighbor invites you to a community garden potluck.', emoji: '🌻', answer: 'yes' },
  { text: 'An ex texts at 2 AM asking to "talk."', emoji: '📱', answer: 'no' },
  { text: 'Your doctor recommends a screening you\'ve been putting off.', emoji: '🩺', answer: 'yes' },
  { text: 'A relative guilt-trips you into lending money you can\'t spare.', emoji: '💸', answer: 'no' },
  { text: 'A friend asks you to be their plus-one to a wedding you\'d enjoy.', emoji: '💒', answer: 'yes' },
  { text: 'Someone pressures you to share a password "just this once."', emoji: '🔐', answer: 'no' },
  { text: 'You get invited to join a book club with people you like.', emoji: '📚', answer: 'yes' },
  { text: 'A date keeps rescheduling and cancels again last minute.', emoji: '📅', answer: 'no' },
  { text: 'Your team asks you to lead a project you\'re excited about.', emoji: '🚀', answer: 'yes' },
  { text: 'A stranger on the street asks for your home address.', emoji: '🏠', answer: 'no' },
  { text: 'A mentor offers 30 minutes to review your resume.', emoji: '🤝', answer: 'yes' },
  { text: 'Friends plan a trip but expect you to pay upfront for everyone.', emoji: '✈️', answer: 'no' },
  { text: 'You\'re offered a paid speaking gig on a topic you know well.', emoji: '🎤', answer: 'yes' },
  { text: 'Someone says "it\'s just a joke" after insulting you.', emoji: '😤', answer: 'no' },
  { text: 'A gym buddy invites you to try a new workout class together.', emoji: '💪', answer: 'yes' },
  { text: 'A brand offers free product only if you post without disclosing it\'s an ad.', emoji: '📸', answer: 'no' },
  { text: 'Your kid\'s school needs a volunteer for one afternoon you\'re free.', emoji: '🏫', answer: 'yes' },
];

const state = {
  deck: [],
  correct: 0,
  streak: 0,
  bestStreak: 0,
  total: 0,
  dragging: null,
  ghost: null,
  offsetX: 0,
  offsetY: 0,
};

const $ = (sel) => document.querySelector(sel);
const cardStack = $('#card-stack');
const feedbackEl = $('#feedback');
const gameOverEl = $('#game-over');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function updateScoreboard() {
  $('#score-correct').textContent = state.correct;
  $('#score-streak').textContent = state.streak;
  $('#score-remaining').textContent = state.deck.length;
}

function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.hidden = false;
  clearTimeout(showFeedback._timer);
  showFeedback._timer = setTimeout(() => {
    feedbackEl.hidden = true;
  }, 1200);
}

function createCardElement(situation, index) {
  const card = document.createElement('div');
  card.className = 'situation-card';
  card.dataset.answer = situation.answer;
  card.dataset.index = index;

  if (index === 1) card.classList.add('behind-1');
  if (index >= 2) card.classList.add('behind-2');
  if (index > 0) card.style.pointerEvents = 'none';

  card.innerHTML = `
    <div class="card-emoji">${situation.emoji}</div>
    <p class="card-text">${situation.text}</p>
    <p class="card-drag-hint">👆 Drag me</p>
  `;

  if (index === 0) attachDragHandlers(card);
  return card;
}

function renderCards() {
  cardStack.innerHTML = '';
  const visible = state.deck.slice(0, 3);
  visible.forEach((situation, i) => {
    cardStack.appendChild(createCardElement(situation, i));
  });
  updateScoreboard();
}

function getDropZoneAt(x, y) {
  const zones = document.querySelectorAll('.drop-zone');
  for (const zone of zones) {
    const rect = zone.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return zone;
    }
  }
  return null;
}

function highlightZone(zone) {
  document.querySelectorAll('.drop-zone').forEach((z) => z.classList.remove('drag-over'));
  if (zone) zone.classList.add('drag-over');
}

function createGhost(card, x, y) {
  const ghost = card.cloneNode(true);
  ghost.classList.add('drag-ghost');
  ghost.classList.remove('behind-1', 'behind-2');
  ghost.style.width = `${card.offsetWidth}px`;
  document.body.appendChild(ghost);
  positionGhost(ghost, x, y);
  return ghost;
}

function positionGhost(ghost, x, y) {
  ghost.style.left = `${x - state.offsetX}px`;
  ghost.style.top = `${y - state.offsetY}px`;
}

function attachDragHandlers(card) {
  const onStart = (e) => {
    if (state.dragging) return;
    const point = e.touches ? e.touches[0] : e;
    const rect = card.getBoundingClientRect();
    state.dragging = card;
    state.offsetX = point.clientX - rect.left;
    state.offsetY = point.clientY - rect.top;
    card.classList.add('dragging');
    state.ghost = createGhost(card, point.clientX, point.clientY);
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!state.dragging) return;
    const point = e.touches ? e.touches[0] : e;
    positionGhost(state.ghost, point.clientX, point.clientY);
    highlightZone(getDropZoneAt(point.clientX, point.clientY));
    e.preventDefault();
  };

  const onEnd = (e) => {
    if (!state.dragging) return;
    const point = e.changedTouches ? e.changedTouches[0] : e;
    const zone = getDropZoneAt(point.clientX, point.clientY);
    highlightZone(null);

    if (zone) {
      handleDrop(state.dragging, zone.dataset.answer);
    }

    card.classList.remove('dragging');
    if (state.ghost) {
      state.ghost.remove();
      state.ghost = null;
    }
    state.dragging = null;
  };

  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, { passive: false });

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

function handleDrop(card, chosen) {
  const correct = card.dataset.answer === chosen;
  const situation = state.deck[0];

  if (correct) {
    state.correct++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    card.classList.add('exiting-correct');
    showFeedback(['Nice!', 'You got it!', 'Spot on!', 'Great call!'][Math.floor(Math.random() * 4)], 'correct');
  } else {
    state.streak = 0;
    card.classList.add('exiting-wrong');
    const hint = situation.answer === 'yes' ? 'Yes was the better call here.' : 'No was the better call here.';
    showFeedback(hint, 'wrong');
  }

  setTimeout(() => {
    state.deck.shift();
    if (state.deck.length === 0) {
      endGame();
    } else {
      renderCards();
    }
  }, correct ? 450 : 550);
}

function endGame() {
  cardStack.innerHTML = '';
  updateScoreboard();

  const pct = Math.round((state.correct / state.total) * 100);
  $('#final-correct').textContent = state.correct;
  $('#final-total').textContent = state.total;

  let message;
  if (pct === 100) message = 'Perfect! You know your boundaries.';
  else if (pct >= 80) message = 'Great instincts — trust yourself more often.';
  else if (pct >= 60) message = 'Solid effort! Saying yes and no gets easier with practice.';
  else message = 'Keep playing — every round builds your confidence.';

  $('#final-message').textContent = message;
  gameOverEl.hidden = false;
}

function initGame() {
  state.deck = shuffle(SITUATIONS);
  state.correct = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.total = SITUATIONS.length;
  gameOverEl.hidden = true;
  renderCards();
}

$('#play-again').addEventListener('click', initGame);

initGame();
