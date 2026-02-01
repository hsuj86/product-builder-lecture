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

const generateBtn = document.getElementById('generate-btn');
const menuResult = document.getElementById('menu-result');

const menuData = [
  { name: '김치찌개', tags: ['따뜻함', '국물', '매콤'] },
  { name: '부대찌개', tags: ['든든함', '국물', '치즈'] },
  { name: '순두부찌개', tags: ['부드러움', '국물', '매콤'] },
  { name: '국밥', tags: ['보양', '국물', '푸짐'] },
  { name: '칼국수', tags: ['쫄깃', '국물', '담백'] },
  { name: '잔치국수', tags: ['가볍게', '국물', '따뜻함'] },
  { name: '라멘', tags: ['진한맛', '국물', '짭짤'] },
  { name: '카레', tags: ['향신', '따뜻함', '든든함'] },
  { name: '오징어볶음', tags: ['매콤', '밥도둑', '해산물'] },
  { name: '치킨너겟 + 샐러드', tags: ['간편', '바삭', '균형'] },
  { name: '우동', tags: ['국물', '부드러움', '간편'] },
  { name: '전 + 막걸리', tags: ['비오는날', '전통', '고소'] },
];

function pickMenu() {
  const index = Math.floor(Math.random() * menuData.length);
  return menuData[index];
}

generateBtn.addEventListener('click', () => {
  const choice = pickMenu();
  menuResult.textContent = `오늘의 추천: ${choice.name}`;
});
