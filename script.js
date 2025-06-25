// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Initial time for the timer

// Add high score tracking
let highScore = localStorage.getItem('hydrateTheWorldHighScore') ? parseInt(localStorage.getItem('hydrateTheWorldHighScore')) : 0;

// Difficulty modes configuration
const difficulties = {
  Easy: {
    label: 'Easy',
    goal: 15,
    spawnRate: 1200,
    timer: 40,
    description: 'Relaxed pace, more time, fewer cans needed!'
  },
  Normal: {
    label: 'Normal',
    goal: 25,
    spawnRate: 1000,
    timer: 30,
    description: 'Classic Hydrate the World experience.'
  },
  Hard: {
    label: 'Hard',
    goal: 35,
    spawnRate: 650,
    timer: 20,
    description: 'Fast cans, less time, more challenge!'
  },
  "Hydration Frenzy": {
    label: 'Hydration Frenzy',
    goal: 50,
    spawnRate: 350,
    timer: 15,
    description: 'Cans everywhere! Can you keep up?'
  }
};
let currentDifficulty = 'Normal';

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  // Add click event to the water can
  const can = randomCell.querySelector('.water-can');
  if (can) {
    can.addEventListener('click', collectCan, { once: true });
  }
}

function updateHighScoreDisplay() {
  let highScoreElem = document.getElementById('high-score');
  if (!highScoreElem) {
    // Create the high score element if it doesn't exist
    const containerDiv = document.querySelector('.container');
    highScoreElem = document.createElement('p');
    highScoreElem.id = 'high-score';
    highScoreElem.style.position = 'absolute';
    highScoreElem.style.top = '18px';
    highScoreElem.style.right = '32px';
    highScoreElem.style.fontWeight = 'bold';
    highScoreElem.style.fontSize = '1.2em';
    highScoreElem.style.margin = '0';
    highScoreElem.style.zIndex = '2';
    containerDiv.appendChild(highScoreElem);
    containerDiv.style.position = 'relative';
  }
  highScoreElem.textContent = `High Score: ${highScore}`;
}

// Call on load
updateHighScoreDisplay();

function collectCan() {
  if (!gameActive) return;
  // Play click sound if enabled
  let soundOn = localStorage.getItem('hydrateTheWorldSound') !== 'off';
  if (typeof clickAudio !== 'undefined' && soundOn) {
    clickAudio.currentTime = 0;
    clickAudio.play();
  }
  currentCans++;
  document.getElementById('current-cans').textContent = currentCans;
  this.parentElement.innerHTML = '';
  // Show milestone message if applicable
  milestones.forEach(m => {
    if (currentCans === m.score && !milestonesShown[m.score]) {
      showMilestoneMessage(m.message);
      milestonesShown[m.score] = true;
    }
  });
  if (currentCans > highScore) {
    highScore = currentCans;
    localStorage.setItem('hydrateTheWorldHighScore', highScore);
    updateHighScoreDisplay();
  }
  if (currentCans >= getCurrentDifficulty().goal) {
    // Play level complete sound if enabled
    let soundOn = localStorage.getItem('hydrateTheWorldSound') !== 'off';
    if (typeof levelCompleteAudio !== 'undefined' && soundOn) {
      levelCompleteAudio.currentTime = 0;
      levelCompleteAudio.play();
    }
    endGame();
    showGameOverMessage(true);
  }
}

function updateTimer() {
  document.getElementById('timer').textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
    clearInterval(timerInterval);
  }
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  // Clear game over message
  document.getElementById('achievements').innerHTML = '';
  // Remove any popups if present
  let popup = document.getElementById('instructions-popup');
  if (popup) popup.remove();
  popup = document.getElementById('countdown-popup');
  if (popup) popup.remove();

  showInstructionsPopup(() => {
    showCountdownAndStartGame();
  });
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  if (currentCans < getCurrentDifficulty().goal) {
    showGameOverMessage(false);
  }
}

// Winning and losing messages
const winningMessages = [
  "Congratulations! You hydrated the world! 💧🌍",
  "Amazing! You brought clean water to everyone!",
  "You did it! Every can counts!",
  "Victory! The world is a little brighter now.",
  "Incredible! You made a difference!"
];
const losingMessages = [
  "Try again! The world still needs you.",
  "Don't Give Up! Any and Everything Can Help.",
  "Almost there! Give it another go.",
  "Keep going! Clean water is worth it.",
  "So close! Try once more."
];

function showGameOverMessage(win) {
  const achievements = document.getElementById('achievements');
  let msg;
  if (win) {
    msg = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    achievements.innerHTML = `<span class="win-message">${msg}</span>`;
    launchConfetti();
  } else {
    msg = losingMessages[Math.floor(Math.random() * losingMessages.length)];
    achievements.innerHTML = `<span class="lose-message">${msg}</span>`;
  }
}

function launchConfetti() {
  // Simple confetti effect using emojis
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('span');
    confetti.textContent = ['🎉','✨','🎊','🥳'][Math.floor(Math.random()*4)];
    confetti.style.position = 'absolute';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-5vh';
    confetti.style.fontSize = (Math.random() * 24 + 16) + 'px';
    confetti.style.animation = `fall ${Math.random() * 1.5 + 1.5}s linear forwards`;
    confettiContainer.appendChild(confetti);
  }
  document.body.appendChild(confettiContainer);
  setTimeout(() => confettiContainer.remove(), 2500);
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
@keyframes fall {
  to {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0.7;
  }
}
.confetti-container {
  pointer-events: none;
  position: fixed;
  left: 0; top: 0; width: 100vw; height: 100vh; z-index: 9999;
}
.win-message { color: #2ecc40; font-size: 2em; font-weight: bold; }
.lose-message { color: #ff4136; font-size: 2em; font-weight: bold; }
`;
document.head.appendChild(style);

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// --- Random Fact Bar ---
const waterFacts = [
  "771 million people in the world live without access to clean water. – That’s nearly 1 in 10 people worldwide.",
  "The water crisis mostly affects women and children. – They spend hours every day walking to collect dirty water.",
  "Dirty water kills more people every year than all forms of violence, including war. – Most victims are children under 5.",
  "Every 2 minutes, a child dies from a water-related disease.",
  "Diseases from dirty water are entirely preventable with access to clean water, sanitation, and hygiene.",
  "When a community gets access to clean water, child mortality drops by up to 90%.",
  "Clean water access can improve school attendance by reducing the time kids spend collecting water.",
  "Access to clean water boosts the economy. – Every $1 invested in clean water can yield $4–$12 in economic returns.",
  "The average distance women in rural Africa walk for water is 3.7 miles – often to collect contaminated water.",
  "charity: water uses 100% of public donations to fund clean water projects. – Private donors cover operating costs separately.",
  "Contaminated water is a major carrier of diseases like cholera, dysentery, typhoid, and diarrhea.",
  "Diarrhea from unsafe water and poor sanitation is a leading cause of death among children globally.",
  "Clean water helps prevent the spread of COVID-19 and other illnesses by enabling proper hygiene.",
  "Without safe water, hospitals and clinics struggle to deliver proper care.",
  "In areas with clean water access, nutrition improves because people can grow crops and prepare food safely.",
  "charity: water has funded over 137,000 water projects in 29 countries (as of 2024).",
  "These projects have brought clean and safe drinking water to over 17.5 million people.",
  "Clean water projects by charity: water include wells, piped systems, rainwater catchments, and filtration systems.",
  "Each project is mapped and monitored, with GPS coordinates and real-time sensor data for transparency.",
  "Communities are trained in maintenance and repair, so solutions are sustainable long after installation."
];

function setRandomFact() {
  const factBar = document.getElementById('fact-bar');
  let lastFact = factBar.getAttribute('data-last-fact');
  let idx;
  do {
    idx = Math.floor(Math.random() * waterFacts.length);
  } while (waterFacts[idx] === lastFact && waterFacts.length > 1);
  factBar.textContent = waterFacts[idx];
  factBar.setAttribute('data-last-fact', waterFacts[idx]);
}

function startFactRotation() {
  setRandomFact();
  setInterval(setRandomFact, 10000); // Change every 10 seconds
}

// Add the fact bar to the bottom of the page
window.addEventListener('DOMContentLoaded', () => {
  const factBar = document.createElement('div');
  factBar.id = 'fact-bar';
  factBar.style.position = 'fixed';
  factBar.style.left = 0;
  factBar.style.right = 0;
  factBar.style.bottom = 0;
  factBar.style.width = '100vw';
  factBar.style.background = 'linear-gradient(90deg, #2E9DF7 0%, #8BD1CB 100%)';
  factBar.style.color = '#fff';
  factBar.style.fontWeight = 'bold';
  factBar.style.fontSize = '1.1em';
  factBar.style.textAlign = 'center';
  factBar.style.padding = '16px 8px 14px 8px';
  factBar.style.zIndex = 10000;
  factBar.style.boxShadow = '0 -2px 12px #2E9DF733';
  factBar.style.letterSpacing = '0.01em';
  factBar.style.userSelect = 'none';
  document.body.appendChild(factBar);
  startFactRotation();
});

// --- Settings Button and Modal ---
function createSettingsUI() {
  // Create settings button
  let settingsBtn = document.getElementById('settings-btn');
  if (!settingsBtn) {
    settingsBtn = document.createElement('button');
    settingsBtn.id = 'settings-btn';
    settingsBtn.title = 'Settings';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.style.position = 'absolute';
    settingsBtn.style.top = '18px';
    settingsBtn.style.left = '32px';
    settingsBtn.style.right = '';
    settingsBtn.style.zIndex = '3';
    settingsBtn.style.background = 'rgba(255,255,255,0.85)';
    settingsBtn.style.border = 'none';
    settingsBtn.style.borderRadius = '50%';
    settingsBtn.style.width = '38px';
    settingsBtn.style.height = '38px';
    settingsBtn.style.fontSize = '1.3em';
    settingsBtn.style.cursor = 'pointer';
    settingsBtn.style.boxShadow = '0 2px 8px #0001';
    settingsBtn.style.display = 'flex';
    settingsBtn.style.alignItems = 'center';
    settingsBtn.style.justifyContent = 'center';
    document.querySelector('.container').appendChild(settingsBtn);
  }

  // Create modal overlay
  let modal = document.getElementById('settings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = 20000;
    modal.innerHTML = `
      <div id="settings-content" style="background: #fff; border-radius: 16px; max-width: 350px; width: 90vw; padding: 32px 20px 24px 20px; box-shadow: 0 8px 32px #0002; position: relative;">
        <button id="close-settings" style="position:absolute;top:10px;right:14px;font-size:1.3em;background:none;border:none;cursor:pointer;">✖️</button>
        <h2 style="margin-top:0;text-align:center;color:#2E9DF7;">Settings</h2>
        <div style="margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:bold;">Sound</span>
          <button id="sound-toggle" style="background:#2E9DF7;color:#fff;border:none;border-radius:16px;padding:6px 18px;font-size:1em;cursor:pointer;">On</button>
        </div>
        <div style="margin-bottom:18px;">
          <span style="font-weight:bold;">Difficulty</span>
          <select id="difficulty-select" style="margin-left:10px;padding:4px 10px;border-radius:8px;font-size:1em;">
            ${Object.keys(difficulties).map(d => `<option value="${d}">${difficulties[d].label}</option>`).join('')}
          </select>
          <div id="difficulty-desc" style="font-size:0.95em;color:#2E9DF7;margin-top:4px;text-align:center;"></div>
        </div>
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 6px 0;font-size:1.1em;color:#F5402C;">About charity: water</h3>
          <p style="font-size:0.98em;line-height:1.5;color:#333;">charity: water is a non-profit organization bringing clean and safe drinking water to people in developing countries. 100% of public donations fund water projects. Learn more at <a href='https://www.charitywater.org/' target='_blank' style='color:#2E9DF7;text-decoration:underline;'>charitywater.org</a>.</p>
        </div>
        <button id="reset-btn" style="background:#F5402C;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:1em;cursor:pointer;">Reset Game</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Event listeners
  settingsBtn.onclick = () => { modal.style.display = 'flex'; };
  modal.querySelector('#close-settings').onclick = () => { modal.style.display = 'none'; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  // Sound toggle
  let soundOn = localStorage.getItem('hydrateTheWorldSound') !== 'off';
  const soundToggle = modal.querySelector('#sound-toggle');
  function updateSoundBtn() {
    soundToggle.textContent = soundOn ? 'On' : 'Off';
    soundToggle.style.background = soundOn ? '#2E9DF7' : '#ccc';
  }
  updateSoundBtn();
  soundToggle.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem('hydrateTheWorldSound', soundOn ? 'on' : 'off');
    updateSoundBtn();
  };

  // Difficulty selector logic
  const diffSelect = modal.querySelector('#difficulty-select');
  const diffDesc = modal.querySelector('#difficulty-desc');
  diffSelect.value = currentDifficulty;
  diffDesc.textContent = difficulties[currentDifficulty].description;
  diffSelect.onchange = function() {
    currentDifficulty = this.value;
    localStorage.setItem('hydrateTheWorldDifficulty', currentDifficulty);
    diffDesc.textContent = difficulties[currentDifficulty].description;
    updateInstructionsText(); // <-- Add this line
  };

  // Reset button
  modal.querySelector('#reset-btn').onclick = () => {
    if (confirm('Are you sure you want to reset your high score and progress?')) {
      localStorage.removeItem('hydrateTheWorldHighScore');
      highScore = 0;
      updateHighScoreDisplay();
      modal.style.display = 'none';
    }
  };
}

// Call on load
window.addEventListener('DOMContentLoaded', () => {
  createSettingsUI();
  const savedDiff = localStorage.getItem('hydrateTheWorldDifficulty');
  if (savedDiff && difficulties[savedDiff]) currentDifficulty = savedDiff;
  updateInstructionsText();

  // Accessibility: Add aria-live to dynamic message containers
  // Add aria-live to achievements for screen readers
  const achievements = document.getElementById('achievements');
  if (achievements) achievements.setAttribute('aria-live', 'polite');
});

// --- Instructions Popup ---
function showInstructionsPopup(callback) {
  // Remove any existing popup
  let popup = document.getElementById('instructions-popup');
  if (popup) popup.remove();

  // Play instructions sound if enabled
  if (typeof instructionsAudio !== 'undefined') {
    let soundOn = localStorage.getItem('hydrateTheWorldSound') !== 'off';
    if (soundOn) {
      instructionsAudio.currentTime = 0;
      instructionsAudio.play();
    }
  }

  // Create popup
  popup = document.createElement('div');
  popup.id = 'instructions-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#fff';
  popup.style.color = '#2E9DF7';
  popup.style.padding = '32px 24px';
  popup.style.borderRadius = '16px';
  popup.style.boxShadow = '0 8px 32px #0002';
  popup.style.zIndex = 30000;
  popup.style.textAlign = 'center';
  popup.style.fontSize = '1.2em';
  popup.innerHTML = `
    <h2>How to Play (${difficulties[currentDifficulty].label})</h2>
    <p>${difficulties[currentDifficulty].description}</p>
    <p style="margin-top:12px;font-size:1em;color:#333;">
      Collect <b>${difficulties[currentDifficulty].goal}</b> cans in <b>${difficulties[currentDifficulty].timer}</b> seconds.<br>
      Avoid obstacles and beat your high score!
    </p>
    <p style="margin-top:18px;color:#888;font-size:0.95em;">Game starts soon...</p>
  `;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
    callback();
  }, 5000); // Show for 5 seconds
}

function showCountdownAndStartGame() {
  let countdown = 3;
  let popup = document.createElement('div');
  popup.id = 'countdown-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#fff';
  popup.style.color = '#F5402C';
  popup.style.padding = '32px 24px';
  popup.style.borderRadius = '16px';
  popup.style.boxShadow = '0 8px 32px #0002';
  popup.style.zIndex = 30000;
  popup.style.textAlign = 'center';
  popup.style.fontSize = '2.5em';
  popup.textContent = countdown;
  document.body.appendChild(popup);

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      popup.textContent = countdown;
    } else {
      clearInterval(interval);
      popup.remove();
      actuallyStartGame();
    }
  }, 1000);
}

function actuallyStartGame() {
  currentCans = 0;
  document.getElementById('current-cans').textContent = currentCans;
  const diff = getCurrentDifficulty();
  timeLeft = diff.timer;
  updateTimer();
  createGrid();
  gameActive = true;
  spawnWaterCan(); // <-- Add this line!
  spawnInterval = setInterval(spawnWaterCan, diff.spawnRate);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
  }, 1000);
}

function getCurrentDifficulty() {
  return difficulties[currentDifficulty] || difficulties['Normal'];
}

// Add this function to update the instructions text
function updateInstructionsText() {
  const instructions = document.querySelector('.game-instructions');
  const diff = getCurrentDifficulty();
  if (instructions && diff) {
    instructions.textContent = `Collect ${diff.goal} items to complete the game!`;
  }
}

// Milestone messages for player progress
const milestones = [
  { score: 5, message: "Great start! Keep going!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "Amazing! You're making a difference!" },
  { score: 20, message: "So close! Don't stop now!" }
];
let milestonesShown = {};

// Show milestone message function
function showMilestoneMessage(msg) {
  const achievements = document.getElementById('achievements');
  if (!achievements) return;
  const milestoneElem = document.createElement('div');
  milestoneElem.className = 'milestone-message';
  milestoneElem.textContent = msg;
  achievements.appendChild(milestoneElem);
  setTimeout(() => {
    if (milestoneElem.parentNode) milestoneElem.remove();
  }, 2000);
}

// Preload instructions sound
let instructionsAudio;
window.addEventListener('DOMContentLoaded', () => {
  instructionsAudio = new Audio('Sounds/Instructions water splash.mp3');
  instructionsAudio.preload = 'auto';
});

// Preload click sound
let clickAudio;
window.addEventListener('DOMContentLoaded', () => {
  clickAudio = new Audio('Sounds/click sound water drop.mp3');
  clickAudio.preload = 'auto';
});

// Preload level complete sound
let levelCompleteAudio;
window.addEventListener('DOMContentLoaded', () => {
  levelCompleteAudio = new Audio('Sounds/level complete sound.mp3');
  levelCompleteAudio.preload = 'auto';
});

// Event Delegation Example (optional, for future scalability)
// For now, direct listeners are fine, but here's how you'd do it:
// document.querySelector('.game-grid').addEventListener('click', function(e) {
//   if (e.target.classList.contains('water-can')) {
//     collectCan.call(e.target);
//   }
// });

// Modular DOM manipulation functions are already used throughout the code:
// - spawnWaterCan: adds/removes cans
// - showInstructionsPopup: adds/removes instructions popup
// - showGameOverMessage: updates achievements
// - updateInstructionsText, updateHighScoreDisplay: update text
// - collectCan: removes can after click
// - All state is kept in JS variables, not the DOM
// - Unique IDs for popups, classes for repeated elements
// - Confetti uses CSS animation and is removed after animation
