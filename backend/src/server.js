const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createSheetsClient } = require('./sheetsClient');
const { sampleFaqs } = require('./mockData');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const staticDir =
  process.env.STATIC_DIR || path.resolve(__dirname, '../../frontend');

const FAQ_SHEET_ID = process.env.FAQ_SHEET_ID;
const LOG_SHEET_ID = process.env.LOG_SHEET_ID || FAQ_SHEET_ID;
const FAQ_SHEET_NAME = process.env.FAQ_SHEET_NAME || '데이터베이스';
const LOG_SHEET_NAME = process.env.LOG_SHEET_NAME || '이용내역';
const FAQ_RANGE = process.env.FAQ_RANGE || 'A1:N60';

if (!FAQ_SHEET_ID) {
  throw new Error('FAQ_SHEET_ID 환경변수가 필요합니다.');
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/faqs', async (_req, res, next) => {
  try {
    if (useMockData) {
      return res.json(sampleFaqs);
    }

    const sheets = await createSheetsClient();
    const range = `'${FAQ_SHEET_NAME}'!${FAQ_RANGE}`;

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: FAQ_SHEET_ID,
      range,
    });

    const values = data.values || [];
    const faqs = transpose(values)
      .filter((column) => column[0])
      .map((column) => {
        const [question, ...answers] = column;
        return {
          question,
          answers: answers.filter((answer) => answer && answer.trim() !== ''),
        };
      });

    res.json(faqs);
  } catch (error) {
    next(error);
  }
});

app.post('/api/logs', async (req, res, next) => {
  try {
    const { userId, queryType, queryContent, responseSource } = req.body || {};

    if (!userId || !queryType || !queryContent || !responseSource) {
      return res.status(400).json({ message: 'userId, queryType, queryContent, responseSource는 필수입니다.' });
    }

    const timestamp = new Date().toISOString();

    if (useMockData) {
      console.log('[mock-log]', timestamp, userId, queryType, queryContent, responseSource);
    } else {
      const sheets = await createSheetsClient();
      const range = `'${LOG_SHEET_NAME}'!A:E`;

      await sheets.spreadsheets.values.append({
        spreadsheetId: LOG_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, userId, queryType, queryContent, responseSource]],
        },
      });
    }

    res.status(201).json({ message: 'logged' });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(staticDir));

app.use((_req, res, next) => {
  if (!staticDir) {
    return next();
  }

  res.sendFile(path.join(staticDir, 'index.html'), (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

function transpose(matrix) {
  if (matrix.length === 0) {
    return [];
  }
  return matrix[0].map((_, columnIndex) => matrix.map((row) => row[columnIndex] || ''));
}
const useMockData = process.env.USE_MOCK_DATA === 'true';

module.exports = app;
