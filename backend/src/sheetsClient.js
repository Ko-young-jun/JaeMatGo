const { google } = require('googleapis');

const SHEETS_SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Google Sheets API 클라이언트를 생성한다.
 * 서비스 계정 키는 아래 환경변수 중 하나로 제공되어야 한다.
 * - GOOGLE_SERVICE_ACCOUNT_JSON : JSON 문자열
 * - GOOGLE_APPLICATION_CREDENTIALS : JSON 파일 경로
 */
function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: loadCredentials(),
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SHEETS_SCOPE,
  });

  const authClientPromise = auth.getClient();

  return authClientPromise.then((client) =>
    google.sheets({
      version: 'v4',
      auth: client,
    }),
  );
}

function loadCredentials() {
  const jsonString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!jsonString) {
    return undefined;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON 환경변수의 값이 올바른 JSON이 아닙니다.');
  }
}

module.exports = {
  createSheetsClient,
};
