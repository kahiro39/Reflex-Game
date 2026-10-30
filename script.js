const area = document.getElementById("gameArea");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const inputToggle = document.getElementById("inputToggle");
const inputLabel = document.getElementById("inputLabel");
const rootStyles = getComputedStyle(document.documentElement);

const shadowX = rootStyles.getPropertyValue('--shadow-x').trim();
const shadowY = rootStyles.getPropertyValue('--shadow-y').trim();

let state = "init";
let startTime;
let timeoutId;
let attemptCount = 1;
let waitHue = 0;
let isKeyboardMode = false;

function updateInputModeUI() {
  if (state === "init" || state === "result") {
    area.textContent = isKeyboardMode
      ? "Press Enter/Space to start"
      : "Click here to start";
  }
}

function initInputMode() {
  const savedMode = localStorage.getItem("inputMode");
  isKeyboardMode = savedMode === "keyboard";
  inputToggle.checked = isKeyboardMode;
  updateInputModeUI();
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.checked = true;
  }
}

function resetGameState() {
  clearTimeout(timeoutId);
  state = "init";
  area.style.backgroundColor = "var(--area-bg)";
  area.style.boxShadow = `${shadowX} ${shadowY} var(--area-shadow)`;
  area.style.color = "var(--text-color)";
  updateInputModeUI();
}

function getWaitColor() {
  waitHue = Math.floor(Math.random() * 360);
  return `hsl(${waitHue}, 70%, 50%)`;
}

function getTargetColor() {
  const shift = 180 + (Math.floor(Math.random() * 90) - 45);
  const targetHue = (waitHue + shift) % 360;
  return `hsl(${targetHue}, 80%, 45%)`;
}

function addRecord(time) {
  const li = document.createElement("li");
  li.textContent = `${time} ms`;
  historyList.prepend(li);
  attemptCount++;
}

function handleGameAction() {
  if (state === "init" || state === "result") {
    state = "waiting";
    const areaColor = getWaitColor();
    const areaColorShadow = `color-mix(in srgb, ${areaColor} 50%, black)`;
    area.style.backgroundColor = `${areaColor}`;
    area.style.boxShadow = `${shadowX} ${shadowY} ${areaColorShadow}`;
    area.style.color = "white";
    area.textContent = "Wait...";

    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    timeoutId = setTimeout(() => {
      state = "ready";
      const areaColor = getTargetColor();
      const areaColorShadow = `color-mix(in srgb, ${areaColor} 50%, black)`;
      area.style.backgroundColor = `${areaColor}`;
      area.style.boxShadow = `${shadowX} ${shadowY} ${areaColorShadow}`;
      area.textContent = "Action!";
      startTime = Date.now();
    }, randomDelay);
  } else if (state === "waiting") {
    clearTimeout(timeoutId);
    state = "result";
    area.style.backgroundColor = "var(--area-bg)";
    area.style.boxShadow = `${shadowX} ${shadowY} var(--area-shadow)`;
    area.style.color = "var(--text-color)";
    area.textContent = "Too early. Retry.";
    setTimeout(updateInputModeUI, 1500);
  } else if (state === "ready") {
    const reactionTime = Date.now() - startTime;
    state = "result";
    area.style.backgroundColor = "var(--area-bg)";
    area.style.boxShadow = `${shadowX} ${shadowY} var(--area-shadow)`;
    area.style.color = "var(--text-color)";
    area.textContent = `${reactionTime} ms`;
    addRecord(reactionTime);
    setTimeout(updateInputModeUI, 1500);
  }
}

inputToggle.addEventListener("change", () => {
  isKeyboardMode = inputToggle.checked;
  localStorage.setItem("inputMode", isKeyboardMode ? "keyboard" : "mouse");
  updateInputModeUI();
  resetGameState();
});

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  resetGameState();
});

area.addEventListener("mousedown", (e) => {
  if (isKeyboardMode) return;
  if (e.button !== 0) return;
  handleGameAction();
});

window.addEventListener("keydown", (e) => {
  if (!isKeyboardMode) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleGameAction();
  }
});

initTheme();
initInputMode();
