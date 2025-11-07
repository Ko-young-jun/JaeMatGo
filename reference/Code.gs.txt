// --- 1. 환경 설정 (Configuration) ---
const FAQ_SHEET_ID = '1yH51YyNJu-L5HUYriCyHdezZGPFNZf5-sJPG6crqQvQ';
const LOG_SHEET_ID = '1yH51YyNJu-L5HUYriCyHdezZGPFNZf5-sJPG6crqQvQ';

const FAQ_SHEET = SpreadsheetApp.openById(FAQ_SHEET_ID).getSheetByName('데이터베이스');
const LOG_SHEET = SpreadsheetApp.openById(LOG_SHEET_ID).getSheetByName('이용내역');

// --- 2. 웹 앱 진입점 (Web App Entry Point) ---
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('재맞고 이용안내')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- 3. 클라이언트 측에서 호출할 함수들 (Client-callable Functions) ---

/**
 * '데이터베이스' 시트에서 FAQ 목록을 원본 텍스트 그대로 가져옵니다.
 * @returns {Array<Object>} FAQ 데이터 객체 배열 [{question, answers}, ...]
 */
function getFaqData() {
  try {
    const range = FAQ_SHEET.getRange('A1:N60');
    const data = range.getValues();
    
    const transposedData = data[0].map((_, colIndex) => data.map(row => row[colIndex]));
    
    const faqList = [];
    transposedData.forEach(column => {
      const question = column[0];
      if (question) {
        const answers = column.slice(1).filter(cell => cell !== '');
        faqList.push({
          question: question,
          answers: answers
        });
      }
    });
    
    return faqList;
  } catch (e) {
    Logger.log('FAQ 데이터 로딩 실패: ' + e.message);
    return [];
  }
}

/**
 * 사용자의 활동을 '이용내역' 시트에 기록합니다.
 * @param {string} userId - 사용자 식별자
 * @param {string} queryType - 질의 유형 (예: 'FAQ 클릭')
 * @param {string} queryContent - 질문 내용
 * @param {string} responseSource - 답변 출처 (예: '데이터베이스')
 */
function logUsage(userId, queryType, queryContent, responseSource) {
  try {
    const timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    LOG_SHEET.appendRow([timestamp, userId, queryType, queryContent, responseSource]);
    SpreadsheetApp.flush();
  } catch(e) {
    Logger.log('로그 기록 실패: ' + e.message);
  }
}
