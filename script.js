console.log('script.js loaded');

const startScreen = document.getElementById("start-screen");
const gameLogo = document.getElementById("game-logo");
const gameWrapper = document.querySelector(".game-wrapper");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const difficultyScreen = document.getElementById("difficulty-screen");
const classicBtn = document.getElementById("classic-btn");
const challengeBtn = document.getElementById("challenge-btn");
const homeBtn = document.getElementById("home-btn");
const gameFooter = document.getElementById("game-footer");
const difficultyFooter = document.getElementById("difficulty-footer");

let currentMode = "classic"; // Will be either 'classic' or 'challenge'
let score = 0;
let timeLeft = 30;

let gameRunning = false;
let paused = false;
let dropInterval, timerInterval;

const winMessages = [
  "You’re a water hero!",
  "Clean water for the win!",
  "Ripple effect achieved!",
];
const loseMessages = [
  "Oops! Try again to make a bigger splash.",
  "So close! Help more next time.",
  "Give it another shot!",
];

// --- Sound Effects ---
const gameMusic = new Audio('sounds/game-music-loop-7-145285.mp3');
gameMusic.loop = true;
const selectSound = new Audio('sounds/select-sound-121244.mp3');
const clickSound = new Audio('sounds/click-for-game-menu-131903.mp3');
const gameStartSound = new Audio('sounds/game-start-317318.mp3');
const gameOverSound = new Audio('sounds/game-over-classic-206486.mp3');

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}
function playSelectSound() {
  selectSound.currentTime = 0;
  selectSound.play();
}
function playGameStartSound() {
  gameStartSound.currentTime = 0;
  gameStartSound.play();
}

function showFooter(footer) {
  if (gameFooter) gameFooter.classList.add("hidden");
  if (difficultyFooter) difficultyFooter.classList.add("hidden");
  if (footer) footer.classList.remove("hidden");
}

// --- Navigation logic for strict screen separation ---
homeBtn.addEventListener("click", () => {
  playClickSound();
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  gameMusic.pause();
  gameMusic.currentTime = 0;
  gameRunning = false;
  paused = false;
  gameWrapper.classList.add("hidden");
  popup.classList.add("hidden");
  startScreen.classList.remove("hidden");
  difficultyScreen.classList.add("hidden");
  showFooter(null); // Hide all footers
  document.getElementById('game-footer').classList.add('hidden'); // Hide game footer
});

gameLogo.addEventListener("click", () => {
  playGameStartSound();
  showDifficultyScreen();
});

// Add click sound to all buttons
[...document.querySelectorAll('button')].forEach(btn => {
  btn.addEventListener('click', playClickSound);
});

function showDifficultyScreen() {
  startScreen.classList.add("hidden");
  difficultyScreen.classList.remove("hidden");
  gameWrapper.classList.add("hidden");
  popup.classList.add("hidden");
  showFooter(difficultyFooter);
  document.getElementById('difficulty-footer').classList.remove('hidden'); // Show difficulty footer
  document.getElementById('game-footer').classList.add('hidden'); // Hide game footer
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);
classicBtn.addEventListener("click", () => {
  currentMode = "classic";
  startGame();
});

challengeBtn.addEventListener("click", () => {
  currentMode = "challenge";
  startGame();
});

function showMilestoneMessage(msg) {
  const el = document.getElementById('milestone-message');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 500);
  }, 1800);
}

// Track milestone state
let halfwayShown = false;
let winMilestoneShown = false;

function resetMilestones() {
  halfwayShown = false;
  winMilestoneShown = false;
}

function startGame() {
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  paused = false;
  gameRunning = true;
  score = 0;
  // Challenge mode: 50s, Classic: 30s
  timeLeft = currentMode === "challenge" ? 50 : 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  popup.classList.add("hidden");
  gameWrapper.classList.remove("hidden");
  startScreen.classList.add("hidden");
  difficultyScreen.classList.add("hidden"); // Always hide difficulty screen when game starts
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => drop.remove());
  showFooter(gameFooter);
  document.getElementById('difficulty-footer').classList.add('hidden'); // Hide difficulty footer
  document.getElementById('game-footer').classList.remove('hidden'); // Show game footer
  gameMusic.currentTime = 0;
  gameMusic.play();
  resetMilestones();

  // Set drop rate and drop logic based on mode
  if (currentMode === "classic") {
    dropInterval = setInterval(() => {
      if (!paused) createDrop();
    }, 800);
  } else {
    // Challenge mode: more blue, slightly more green, blue drops fall faster
    dropInterval = setInterval(() => {
      if (!paused) {
        // 80% blue, 20% green (was 70/30), but more total drops
        const isBad = Math.random() < 0.35; // Slightly more bad drops
        createDrop(isBad, true); // true = challenge mode
      }
    }, 300); // More frequent drops
  }

  timerInterval = setInterval(() => {
    if (!paused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);
}

// Accepts isBad and isChallengeMode for drop logic
function createDrop(isBad = Math.random() < 0.3, isChallengeMode = false) {
  const drop = document.createElement("div");
  drop.className = isBad ? "bad-drop" : "water-drop";

  const size = 30 + Math.random() * 30;
  drop.style.width = `${size}px`;
  drop.style.height = `${size * 1.5}px`;
  drop.style.left = `${Math.random() * (gameContainer.offsetWidth - size)}px`;

  // Randomize stacking order so blue/green drops can be above/below each other
  drop.style.zIndex = Math.floor(Math.random() * 90) + 10; // 10-99

  // Drop speed logic
  if (isChallengeMode) {
    if (isBad) {
      drop.style.animationDuration = "5.5s"; // slower bad drops
    } else {
      drop.style.animationDuration = "3.2s"; // faster blue drops
    }
  } else {
    drop.style.animationDuration = "4s";
  }

  drop.addEventListener("click", () => {
    if (!gameRunning || paused) return;
    if (isBad) {
      playSelectSound();
      showMilestoneMessage("Oops! Bad drop!");
      score += -2;
    } else {
      playSelectSound();
      score += 1;
      // Check for milestones only on good drops
      const winThreshold = currentMode === "classic" ? 20 : 35;
      if (!halfwayShown && score >= Math.floor(winThreshold/2)) {
        halfwayShown = true;
        showMilestoneMessage("Halfway there!");
      }
      if (!winMilestoneShown && score >= winThreshold) {
        winMilestoneShown = true;
        showMilestoneMessage("You did it!");
      }
    }
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => drop.remove());
  gameContainer.appendChild(drop);
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️" : "⏸";
  // Pause or resume all drops' animations
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => {
    drop.style.animationPlayState = paused ? 'paused' : 'running';
  });
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  gameRunning = false;
  finalScore.textContent = score;
  popup.classList.remove("hidden");
  showFooter(null); // Hide all footers
  document.getElementById('game-footer').classList.add('hidden'); // Hide game footer
  gameMusic.pause();
  gameMusic.currentTime = 0;
  setTimeout(() => {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  }, 300); // slight delay for popup

  // Win threshold: classic 20, challenge 35
  const winThreshold = currentMode === "classic" ? 20 : 35;
  const messageArr = score >= winThreshold ? winMessages : loseMessages;
  popupMessage.textContent = messageArr[Math.floor(Math.random() * messageArr.length)];

  if (score >= winThreshold) {
    launchConfetti();
  }
}

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  // Make canvas cover the whole viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "1000";
  canvas.style.pointerEvents = "none";
  const ctx = canvas.getContext("2d");

  // Fewer, slower confetti pieces
  const pieces = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * 2 + 1, // slower fall
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));

  let animationId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d;
      if (p.y > canvas.height) p.y = -20;
    });
    animationId = requestAnimationFrame(draw);
  }

  draw();

  // Stop confetti after 3 seconds
  setTimeout(() => {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  }, 3000);
}

// --- ClickSpark Vanilla JS ---
(function() {
  const sparkColor = "#FFC907"; // Updated to yellow
  const sparkSize = 10;
  const sparkRadius = 15;
  const sparkCount = 8;
  const duration = 400;

  const gameContainer = document.getElementById("game-container");
  const canvas = document.getElementById("spark-canvas");
  if (!canvas || !gameContainer) return;

  // Style the canvas to cover the game area
  function resizeCanvas() {
    canvas.width = gameContainer.offsetWidth;
    canvas.height = gameContainer.offsetHeight;
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 2;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let sparks = [];

  function easeOut(t) {
    return t * (2 - t);
  }

  function drawSparks(now) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks = sparks.filter(spark => {
      const elapsed = now - spark.startTime;
      if (elapsed > duration) return false;

      const progress = elapsed / duration;
      const eased = easeOut(progress);

      const distance = eased * sparkRadius;
      const lineLength = sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      return true;
    });

    if (sparks.length > 0) {
      requestAnimationFrame(drawSparks);
    }
  }

  gameContainer.addEventListener("click", function(e) {
    // Only trigger if not clicking on a button or control
    if (e.target.tagName === "BUTTON") return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x, y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      });
    }
    requestAnimationFrame(drawSparks);
  });
})();
