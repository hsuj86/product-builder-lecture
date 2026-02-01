class LottoBall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const number = this.getAttribute('number');
    let color;

    if (number <= 10) {
      color = '#fbc400'; // Yellow
    } else if (number <= 20) {
      color = '#69c8f2'; // Blue
    } else if (number <= 30) {
      color = '#ff7272'; // Red
    } else if (number <= 40) {
      color = '#aaa'; // Gray
    } else {
      color = '#b0d840'; // Green
    }

    this.shadowRoot.innerHTML = `
      <style>
        .ball {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: ${color};
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 0 5px rgba(0,0,0,0.4);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3), inset 0 -5px 10px rgba(0,0,0,0.4);
          animation: appear 0.5s ease-out forwards;
        }

        @keyframes appear {
            from {
                transform: scale(0);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
      </style>
      <div class="ball">${number}</div>
    `;
  }
}

customElements.define('lotto-ball', LottoBall);

const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers-container');

generateBtn.addEventListener('click', () => {
  lottoNumbersContainer.innerHTML = '';
  const numbers = new Set();
  while (numbers.size < 6) {
    const randomNumber = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNumber);
  }
  
  const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

  sortedNumbers.forEach((number, index) => {
    setTimeout(() => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoNumbersContainer.appendChild(lottoBall);
    }, index * 200); // Stagger the appearance
  });
});