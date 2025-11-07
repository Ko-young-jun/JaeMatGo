const API_BASE_URL = resolveApiBaseUrl();
const SHEET_ID = '1yH51YyNJu-L5HUYriCyHdezZGPFNZf5-sJPG6crqQvQ';
const SHEET_NAME = '데이터베이스';
const SHEET_RANGE = 'A1:N60';

const sampleFaqs = [
  {
    question: '재맞고는 무엇인가요?',
    answers: [
      '재맞고는 사내 구성원을 위한 FAQ 안내 페이지 예시입니다.',
      'Google Sheets에서 불러온 데이터를 기반으로 안내합니다.',
    ],
  },
  {
    question: '웹앱 확인은 어떻게 하나요?',
    answers: [
      '이 페이지를 열면 FAQ 목록이 인터랙티브하게 표시됩니다.',
      '질문을 클릭하면 답변이 펼쳐지고 접히는 애니메이션을 볼 수 있습니다.',
    ],
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const faqList = document.getElementById('faq-list');
  const loader = document.getElementById('loader');
  const userId = `user_${Math.random().toString(36).slice(2, 11)}`;
  let isRendered = false;
  let allFaqs = [];

  initializeApp();

  const searchInput = document.getElementById('faq-search-input');
  searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredFaqs = allFaqs.filter(faq => {
      const question = faq.question.toLowerCase();
      const answers = faq.answers.join(' ').toLowerCase();
      return question.includes(searchTerm) || answers.includes(searchTerm);
    });
    populateFaqs(filteredFaqs, false, false, true);
  });

  function initializeApp() {
    if (!API_BASE_URL) {
      fetchFaqsFromSheet()
        .then((data) => {
          if (isRendered) {
            return;
          }
          populateFaqs(data, false, true, false);
        })
        .catch((error) => {
          if (isRendered) {
            return;
          }
          console.warn('시트 직접 호출 실패, 샘플 데이터를 표시합니다.', error);
          populateFaqs(sampleFaqs, true, true, false);
        });
      return;
    }

    const fallbackTimer = setTimeout(() => {
      if (!isRendered) {
        console.warn('API 응답이 없어 샘플 데이터로 대체합니다.');
        populateFaqs(sampleFaqs, true, false);
      }
    }, 4000);

    fetch(`${API_BASE_URL}/api/faqs`)
      .then(handleFetchResponse)
      .then((data) => {
        if (isRendered) {
          return;
        }
        clearTimeout(fallbackTimer);
        populateFaqs(data, false, false, false);
      })
      .catch((error) => {
        if (isRendered) {
          return;
        }
        clearTimeout(fallbackTimer);
        console.warn('API 호출 실패, 샘플 데이터를 대체로 사용합니다.', error);
        populateFaqs(sampleFaqs, true, false, false);
      });
  }

  function populateFaqs(faqData, isSample, isDirectSheet, isFiltering = false) {
    if (!isFiltering) {
      allFaqs = faqData;
    }

    if (isRendered && !isFiltering) {
      return;
    }
    isRendered = true;

    if (loader) {
      loader.remove();
    }

    faqList.innerHTML = '';

    if (!faqData || faqData.length === 0) {
      faqList.innerHTML = '<p>FAQ 정보를 불러오지 못했습니다.</p>';
      return;
    }

    faqData.forEach((item) => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item';

      const questionHtml = formatTextToHtml(item.question, false);
      const answerHtml = (item.answers || [])
        .map((line) => formatTextToHtml(line, true))
        .join('');

      faqItem.innerHTML = `
        <div class="faq-question">${questionHtml}</div>
        <div class="faq-answer">${answerHtml}</div>
      `;

      faqList.appendChild(faqItem);
    });

    attachQuestionHandlers();

    if (isSample) {
      const info = document.createElement('p');
      info.style.marginTop = '20px';
      info.style.color = '#666';
      info.textContent = isDirectSheet
        ? '스프레드시트 데이터를 불러오지 못해 샘플 데이터를 표시합니다.'
        : '현재는 샘플 데이터로 표시 중입니다. 서버를 실행하면 실제 스프레드시트 데이터를 불러옵니다.';
      faqList.appendChild(info);
    }
  }

  function attachQuestionHandlers() {
    document.querySelectorAll('.faq-question').forEach((questionEl) => {
      questionEl.addEventListener('click', (event) => {
        const faqItem = event.currentTarget.parentElement;
        const answerEl = faqItem.querySelector('.faq-answer');

        if (faqItem.classList.contains('active')) {
          faqItem.classList.remove('active');
          answerEl.style.maxHeight = null;
          return;
        }

        document.querySelectorAll('.faq-item.active').forEach((activeItem) => {
          activeItem.classList.remove('active');
          const activeAnswer = activeItem.querySelector('.faq-answer');
          activeAnswer.style.maxHeight = null;
        });

        faqItem.classList.add('active');
        answerEl.style.maxHeight = `${answerEl.scrollHeight}px`;

        setTimeout(() => {
          faqItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        logUsage({
          userId,
          queryType: 'FAQ 클릭',
          queryContent: faqItem.querySelector('.faq-question').textContent.trim(),
          responseSource: '데이터베이스',
        });
      });
    });
  }

  function logUsage(payload) {
    if (!API_BASE_URL) {
      return;
    }

    fetch(`${API_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.warn('로그 전송 실패:', error);
    });
  }

  function handleFetchResponse(response) {
    if (!response.ok) {
      throw new Error(`요청이 실패했습니다. (${response.status})`);
    }
    return response.json();
  }
});

/**
 * 원본 텍스트를 FAQ 표시용 HTML 문자열로 변환한다.
 * 이미지 링크, 간단한 마크업(굵게, 색상, 하이라이트, 링크)을 처리한다.
 */
function formatTextToHtml(text, isParagraph = true) {
  let html = (text ?? '').toString().trim();

  if (html.startsWith('https://lh3.googleusercontent.com/d/')) {
    return `<p><img src="${html}" style="max-width:100%; border-radius:8px; margin:10px 0;" alt="첨부 이미지"></p>`;
  }

  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\n/g, '<br>');

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[color=(.*?)\](.*?)\[\/color\]/g, '<span style="color:$1;">$2</span>')
    .replace(/\[size=(.*?)\](.*?)\[\/size\]/g, '<span style="font-size:$1;">$2</span>')
    .replace(/\[font=(.*?)\](.*?)\[\/font\]/g, '<span style="font-family:\'$1\';">$2</span>')
    .replace(/\[highlight\](.*?)\[\/highlight\]/g, '<span class="highlight">$1</span>');

  const urlRegex = /(https?:\/\/[^\s"<>]+)/g;
  html = html.replace(urlRegex, '<a class="content-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  if (isParagraph) {
    return `<p>${html}</p>`;
  }

  return html;
}

function resolveApiBaseUrl() {
  if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.trim().length > 0) {
    return window.API_BASE_URL.trim().replace(/\/$/, '');
  }

  if (window.location.protocol === 'file:' || window.location.hostname.endsWith('.github.io')) {
    return null;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  return null;
}

function fetchFaqsFromSheet() {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('문서 환경이 아닙니다.'));
  }

  const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
  url.searchParams.set('tqx', 'out:json');
  url.searchParams.set('sheet', SHEET_NAME);
  url.searchParams.set('range', SHEET_RANGE);

  return new Promise((resolve, reject) => {
    const google = (window.google = window.google || {});
    const visualization = (google.visualization = google.visualization || {});
    const Query = (visualization.Query = visualization.Query || {});

    const previousHandler = Query.setResponse;

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('스프레드시트 응답 시간이 초과되었습니다.'));
    }, 8000);

    Query.setResponse = (response) => {
      cleanup();

      if (!response || response.status !== 'ok') {
        const message = response && response.errors && response.errors.length > 0 ? response.errors[0].detailed_message : '스프레드시트 응답이 올바르지 않습니다.';
        reject(new Error(message));
        return;
      }

      try {
        const matrix = parseGvizTable(response.table);
        const faqs = transpose(matrix)
          .filter((column) => column[0])
          .map((column) => {
            const [question, ...answers] = column;
            return {
              question,
              answers: answers.filter((answer) => answer && answer.toString().trim() !== ''),
            };
          });

        resolve(faqs);
      } catch (error) {
        reject(error);
      }
    };

    const script = document.createElement('script');
    script.src = url.toString();
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('스프레드시트 데이터를 불러오는 중 오류가 발생했습니다.'));
    };

    document.head.appendChild(script);

    function cleanup() {
      clearTimeout(timeoutId);
      script.remove();
      if (previousHandler) {
        Query.setResponse = previousHandler;
      } else {
        delete Query.setResponse;
      }
    }
  });
}

function parseGvizTable(table) {
  const colsLength = table.cols.length;

  return table.rows.map((row) => {
    const cells = row.c || [];
    const values = new Array(colsLength);
    for (let i = 0; i < colsLength; i += 1) {
      const cell = cells[i];
      values[i] = cell && cell.v !== null ? cell.v : '';
    }
    return values;
  });
}

function transpose(matrix) {
  if (!matrix || matrix.length === 0) {
    return [];
  }
  const rowLength = Math.max(...matrix.map((row) => row.length));
  const result = [];

  for (let col = 0; col < rowLength; col += 1) {
    const column = [];
    for (let row = 0; row < matrix.length; row += 1) {
      column.push(matrix[row][col] ?? '');
    }
    result.push(column);
  }

  return result;
}
