'use strict';

// --- DOM Elements ---
const startGameButton = document.getElementById('start-game');
const btnMusicToggle = document.getElementById('toggle-music');

const btnRolls = document.querySelectorAll('.btn--roll');
const btnHolds = document.querySelectorAll('.btn--hold');
const btnNew = document.querySelector('.btn--new');

const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');
const tortoise0 = document.getElementById('tortoise--0');
const tortoise1 = document.getElementById('tortoise--1');

// --- Game State Variables ---
let scores, currentScore, activePlayer, playing, scoreLimit;

// --- Sounds ---
const backgroundMusic = new Audio('sounds/background-music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;

const diceSound = new Audio('sounds/dice-roll.mp3');
const holdSound = new Audio('sounds/hold-dice.mp3');
const winSound = new Audio('sounds/celebration.mp3');

diceSound.volume = 0.15;
holdSound.volume = 0.1;

// --- Event: Start Game ---
if (startGameButton) {
  startGameButton.addEventListener('click', () => {
    const player1Name = document.getElementById('player1-name').value.trim();
    const player2Name = document.getElementById('player2-name').value.trim();
    const limit = parseInt(document.getElementById('score-limit').value);

    if (player1Name && player2Name && limit > 0) {
      localStorage.setItem('player1Name', player1Name);
      localStorage.setItem('player2Name', player2Name);
      localStorage.setItem('scoreLimit', limit);

      window.location.href = 'game.html'; // Redirect to the game
    } else {
      alert('Please fill in all fields correctly!');
    }
  });
}

// --- Initialize Game ---
const init = () => {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;

  scoreLimit = parseInt(localStorage.getItem('scoreLimit')) || 100;
  document.getElementById('name--0').textContent =
    localStorage.getItem('player1Name') || 'Player 1';
  document.getElementById('name--1').textContent =
    localStorage.getItem('player2Name') || 'Player 2';

  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');
  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');

  tortoise0.style.left = '0%';
  tortoise1.style.left = '0%';
};
init();

// --- Music Toggle ---
if (btnMusicToggle) {
  btnMusicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play().catch(() => console.error('Music play error'));
      btnMusicToggle.textContent = '🔊';
    } else {
      backgroundMusic.pause();
      btnMusicToggle.textContent = '🔇';
    }
  });

  // Autoplay music on load
  window.addEventListener('load', () => {
    backgroundMusic.play().catch(() => console.error('Autoplay blocked'));
  });
}

// --- Switch Player ---
const switchPlayer = () => {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
};

// --- Dice Roll ---
// Assign event listeners for both players' Roll buttons
btnRolls.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (playing && activePlayer === index) {
      const dice = Math.trunc(Math.random() * 6) + 1;
      diceSound.play();
      diceEl.src = `dice-${dice}.png`;
      diceEl.classList.remove('hidden');

      if (dice !== 1) {
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent =
          currentScore;
      } else {
        switchPlayer();
      }
    }
  });
});

// --- Hold Score ---
// Assign event listeners for both players' Hold buttons
btnHolds.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (playing && activePlayer === index) {
      holdSound.play();
      scores[activePlayer] += currentScore;
      document.getElementById(`score--${activePlayer}`).textContent =
        scores[activePlayer];

      const progress = Math.min((scores[activePlayer] / scoreLimit) * 100, 100);
      document.getElementById(
        `tortoise--${activePlayer}`
      ).style.left = `${progress}%`;

      if (scores[activePlayer] >= scoreLimit) {
        playing = false;
        winSound.play();
        diceEl.classList.add('hidden');
        document
          .querySelector(`.player--${activePlayer}`)
          .classList.add('player--winner');
        document
          .querySelector(`.player--${activePlayer}`)
          .classList.remove('player--active');
      } else {
        switchPlayer();
      }
    }
  });
});

// --- New Game ---
btnNew.addEventListener('click', init);

// --- Cheat Code ---
document.addEventListener('keydown', e => {
  if (e.key === 'c' && playing && activePlayer === 0) {
    scores[0] += 10;
    score0El.textContent = scores[0];
    const progress = Math.min((scores[0] / scoreLimit) * 100, 100);
    tortoise0.style.left = `${progress}%`;
    console.log('Cheat activated!');
  }
});

// Keyboard shortcuts for rolling the dice and holding
document.addEventListener('keydown', function (e) {
  if (playing) {
    // For rolling the dice (Shift key)
    if (e.key === 'Shift' && activePlayer === 0) {
      e.preventDefault();
      btnRolls[0].click(); // Simulate dice roll for Player 0
    } else if (e.key === 'Shift' && activePlayer === 1) {
      e.preventDefault();
      btnRolls[1].click(); // Simulate dice roll for Player 1
    }
    // For holding the score (Spacebar)
    if (e.key === ' ' && activePlayer === 0) {
      e.preventDefault(); // Prevent page scroll on spacebar
      btnHolds[0].click(); // Simulate hold action for Player 0
    } else if (e.key === ' ' && activePlayer === 1) {
      e.preventDefault(); // Prevent page scroll on spacebar
      btnHolds[1].click(); // Simulate hold action for Player 1
    }
  }
});
