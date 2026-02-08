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
const shareSection = document.getElementById('share-section');
const shareButtons = shareSection.querySelectorAll('[data-share]');
const shareUrlInput = document.getElementById('share-url');
const shareMessage = document.getElementById('share-message');
const ogTitle = document.getElementById('og-title');
const ogDescription = document.getElementById('og-description');
const ogUrl = document.getElementById('og-url');
const ogImage = document.getElementById('og-image');
const twitterCard = document.getElementById('twitter-card');
const twitterTitle = document.getElementById('twitter-title');
const twitterDescription = document.getElementById('twitter-description');
const twitterImage = document.getElementById('twitter-image');

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

function getShareUrl(topLabel) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  if (topLabel) {
    const params = new URLSearchParams({ result: topLabel });
    return `${baseUrl}?${params.toString()}`;
  }
  return baseUrl;
}

function buildShareText(topLabel) {
  if (topLabel) {
    return `내 동물상 결과는 ${topLabel}!`;
  }
  return '사진으로 동물상 테스트 해봤어!';
}

function updateMetaTags(topLabel = '') {
  const baseTitle = 'Animal Face Test';
  const title = topLabel ? `${topLabel} 결과 | ${baseTitle}` : baseTitle;
  const description = topLabel
    ? `${topLabel} 결과가 나왔어요. 사진으로 동물상 테스트 해보세요!`
    : '사진 한 장으로 강아지/고양이 동물상을 예측하는 체험형 테스트입니다.';
  const shareUrl = getShareUrl(topLabel);

  document.title = title;
  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', shareUrl);
  if (twitterCard) twitterCard.setAttribute('content', 'summary');
  if (twitterTitle) twitterTitle.setAttribute('content', title);
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (ogImage && twitterImage) {
    const imageUrl = ogImage.getAttribute('content');
    twitterImage.setAttribute('content', imageUrl);
  }
}

function updateShareUI(topLabel = '') {
  shareSection.dataset.result = topLabel;
  const shareUrl = getShareUrl(topLabel);
  shareUrlInput.value = shareUrl;
  shareMessage.textContent = topLabel
    ? `공유 문구가 "${topLabel}" 결과로 업데이트됐어요.`
    : '링크를 공유해보세요.';
}

function openShareWindow(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function copyShareLink() {
  const url = getShareUrl(shareSection.dataset.result);
  try {
    await navigator.clipboard.writeText(url);
    shareMessage.textContent = '링크가 복사됐어요!';
  } catch (err) {
    shareMessage.textContent = '복사에 실패했어요. 직접 선택해서 공유해 주세요.';
  }
}

async function handleShare(type) {
  const url = getShareUrl(shareSection.dataset.result);
  const text = buildShareText(shareSection.dataset.result);
  const hashtags = '#동물상테스트 #AnimalFaceTest';
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text} ${hashtags}`);

  switch (type) {
    case 'native':
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Animal Face Test',
            text: `${text} ${hashtags}`,
            url
          });
          shareMessage.textContent = '공유가 완료됐어요!';
        } catch (err) {
          shareMessage.textContent = '공유가 취소되었어요.';
        }
      } else {
        copyShareLink();
      }
      break;
    case 'copy':
      copyShareLink();
      break;
    case 'x':
      openShareWindow(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
      break;
    case 'facebook':
      openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
      break;
    case 'kakaostory':
      openShareWindow(`https://story.kakao.com/share?url=${encodedUrl}`);
      break;
    case 'line':
      openShareWindow(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`);
      break;
    default:
      break;
  }
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
    updateShareUI(top.className);
    updateMetaTags(top.className);
  };
  reader.readAsDataURL(file);
}

shareButtons.forEach((button) => {
  button.addEventListener('click', () => handleShare(button.dataset.share));
});

if (!navigator.share) {
  const nativeButton = shareSection.querySelector('[data-share="native"]');
  if (nativeButton) {
    nativeButton.textContent = '빠른 공유';
  }
}

const urlParams = new URLSearchParams(window.location.search);
const initialResult = urlParams.get('result');
updateShareUI(initialResult || '');
updateMetaTags(initialResult || '');

analyzeBtn.addEventListener('click', () => {
  const file = imageInput.files[0];
  if (!file) {
    result.textContent = '먼저 사진을 업로드해주세요.';
    updateShareUI();
    return;
  }
  analyzeImage(file);
});
