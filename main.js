const themeToggle = document.getElementById('theme-toggle');
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.innerHTML = isDark ? '<span aria-hidden="true">☀️</span>' : '<span aria-hidden="true">🌙</span>';
}

const initialTheme = storedTheme ? storedTheme : (prefersDark ? 'dark' : 'light');
applyTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
});

const analyzeBtn = document.getElementById('analyze-btn');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const result = document.getElementById('result');
const labelContainer = document.getElementById('label-container');

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/R_wnQyyLS/';
let model;

async function loadModel() {
  if (model) return model;
  const modelURL = `${MODEL_URL}model.json`;
  const metadataURL = `${MODEL_URL}metadata.json`;
  model = await tmImage.load(modelURL, metadataURL);
  return model;
}

function clearLabels() {
  labelContainer.innerHTML = '';
}

function renderPredictions(predictions) {
  clearLabels();
  predictions.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'label-item';
    row.innerHTML = `<span>${item.className}</span><span>${(item.probability * 100).toFixed(1)}%</span>`;
    labelContainer.appendChild(row);
  });
}

async function analyzeImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    previewImage.src = reader.result;
    previewImage.style.display = 'block';
    result.textContent = '분석 중...';
    const loadedModel = await loadModel();
    const predictions = await loadedModel.predict(previewImage);
    const sorted = predictions.sort((a, b) => b.probability - a.probability);
    const top = sorted[0];
    result.textContent = `결과: ${top.className}`;
    renderPredictions(sorted);
  };
  reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', () => {
  const file = imageInput.files[0];
  if (!file) {
    result.textContent = '먼저 사진을 업로드해주세요.';
    return;
  }
  analyzeImage(file);
});
