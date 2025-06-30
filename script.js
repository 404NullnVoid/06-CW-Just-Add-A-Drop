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

// Start game from logo click
gameLogo.addEventListener("click", startGame);
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);

function startGame() {
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  paused = false;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  popup.classList.add("hidden");
  gameWrapper.classList.remove("hidden");
  startScreen.classList.add("hidden");
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => drop.remove());

  dropInterval = setInterval(() => {
    if (!paused) createDrop();
  }, 800);

  timerInterval = setInterval(() => {
    if (!paused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️" : "⏸";
  // Pause or resume all drops' animations
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => {
    drop.style.animationPlayState = paused ? 'paused' : 'running';
  });
}

function createDrop() {
  const drop = document.createElement("div");
  const isBad = Math.random() < 0.3;
  drop.className = isBad ? "bad-drop" : "water-drop";

  const size = 30 + Math.random() * 30;
  drop.style.width = `${size}px`;
  drop.style.height = `${size * 1.5}px`;
  drop.style.left = `${Math.random() * (gameContainer.offsetWidth - size)}px`;
  drop.style.animationDuration = "4s";

  drop.addEventListener("click", () => {
    if (!gameRunning || paused) return;
    score += isBad ? -2 : 1;
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => drop.remove());
  gameContainer.appendChild(drop);
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(timerInterval);
  gameRunning = false;
  finalScore.textContent = score;
  popup.classList.remove("hidden");

  const messageArr = score >= 20 ? winMessages : loseMessages;
  popupMessage.textContent = messageArr[Math.floor(Math.random() * messageArr.length)];

  if (score >= 20) {
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
