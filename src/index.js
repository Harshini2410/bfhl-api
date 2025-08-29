import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const CFG = {
  FULL_NAME: (process.env.FULL_NAME || 'john_doe').toLowerCase(),
  DOB: process.env.DOB_DDMMYYYY || '17091999',
  EMAIL: process.env.EMAIL || 'john@xyz.com',
  ROLL: process.env.ROLL_NUMBER || 'ABCD123',
};

// helpers
const isIntegerString = (s) => /^-?\d+$/.test(s);      // "92", "-3" -> true; "-", "3.2" -> false
const isAlphaString  = (s) => /^[A-Za-z]+$/.test(s);    // "abc", "R" -> true; "a1", "@" -> false

const alternatingCapsReverse = (chars) => {
  const arr = [...chars].reverse();
  return arr.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join('');
};

// ---------- ROUTES ----------

// health on root (so opening the base URL in a browser shows something)
app.get('/', (_req, res) => res.send('OK'));

// health/info on GET /bfhl (useful for graders clicking in a browser)
app.get('/bfhl', (_req, res) => {
  res.status(200).json({
    is_success: true,
    roll_number: CFG.ROLL,
    message: 'GET /bfhl alive'
  });
});

// main assignment endpoint
app.post('/bfhl', (req, res) => {
  try {
    const data = req.body?.data;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: `${CFG.FULL_NAME}_${CFG.DOB}`,
        email: CFG.EMAIL,
        roll_number: CFG.ROLL,
        odd_numbers: [],
        even_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: "0",
        concat_string: "",
        error: "Invalid payload: 'data' must be an array."
      });
    }

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];

    let sum = 0;
    const letters = [];

    for (const item of data) {
      const s = String(item).trim();

      if (isIntegerString(s)) {
        const n = parseInt(s, 10);
        sum += n;
        if (Math.abs(n) % 2 === 0) even_numbers.push(s);
        else odd_numbers.push(s);
        continue;
      }

      if (isAlphaString(s)) {
        alphabets.push(s.toUpperCase());
        letters.push(...s);
        continue;
      }

      if (s !== '') special_characters.push(s);
    }

    const concat_string = alternatingCapsReverse(letters);

    return res.status(200).json({
      is_success: true,
      user_id: `${CFG.FULL_NAME}_${CFG.DOB}`,
      email: CFG.EMAIL,
      roll_number: CFG.ROLL,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string
    });
  } catch {
    return res.status(500).json({ is_success: false, message: 'Internal server error' });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
