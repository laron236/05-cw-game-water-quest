// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Initial time for the timer

// Add high score tracking
let highScore = localStorage.getItem('hydrateTheWorldHighScore') ? parseInt(localStorage.getItem('hydrateTheWorldHighScore')) : 0;

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
  currentCans++;
  document.getElementById('current-cans').textContent = currentCans;
  this.parentElement.innerHTML = '';
  if (currentCans > highScore) {
    highScore = currentCans;
    localStorage.setItem('hydrateTheWorldHighScore', highScore);
    updateHighScoreDisplay();
  }
  if (currentCans >= GOAL_CANS) {
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
  currentCans = 0;
  document.getElementById('current-cans').textContent = currentCans;
  gameActive = true;
  timeLeft = 30;
  updateTimer();
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  if (currentCans < GOAL_CANS) {
    showGameOverMessage(false);
  }
}

function showGameOverMessage(win) {
  const achievements = document.getElementById('achievements');
  if (win) {
    achievements.innerHTML = '<span class="win-message">You Win! 🎉</span>';
    launchConfetti();
  } else {
    achievements.innerHTML = '<span class="lose-message">Game Over! Try again!</span>';
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
  setInterval(setRandomFact, 30000);
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
window.addEventListener('DOMContentLoaded', createSettingsUI);
