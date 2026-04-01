export const SECURITY_QUESTION_FIELDS = ['favoriteColor', 'birthday', 'studentId'];

export const SECURITY_QUESTION_PROMPT_SOURCE = {
  favoriteColor: {
    zh: '你最喜欢的颜色是什么？',
    en: 'What is your favorite color?',
    ja: 'あなたの好きな色は何ですか？',
    ko: '가장 좋아하는 색은 무엇인가요?',
  },
  birthday: {
    zh: '你的生日是什么？',
    en: 'What is your birthday?',
    ja: 'あなたの誕生日はいつですか？',
    ko: '생일은 언제인가요?',
  },
  studentId: {
    zh: '你的学号是什么？',
    en: 'What is your student ID?',
    ja: 'あなたの学籍番号は何ですか？',
    ko: '학번은 무엇인가요?',
  },
};

export const SECURITY_QUESTION_PROMPTS = Object.fromEntries(
  Object.entries(SECURITY_QUESTION_PROMPT_SOURCE).map(([field, localized]) => [field, localized.zh]),
);

export const SECURITY_QUESTION_COLUMNS = {
  favoriteColor: 'security_answer_favorite_color',
  birthday: 'security_answer_birthday',
  studentId: 'security_answer_student_id',
};

export function getSecurityQuestionPrompt(field, language = 'zh') {
  const localized = SECURITY_QUESTION_PROMPT_SOURCE[field];

  if (!localized) {
    return '';
  }

  return localized[language] || localized.zh || '';
}

function collapseSpaces(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeBirthday(value) {
  const normalized = collapseSpaces(value);

  if (!normalized) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalized;
  }

  return parsedDate.toISOString().slice(0, 10);
}

export function normalizeSecurityAnswer(field, value) {
  const normalized = collapseSpaces(value);

  if (!normalized) {
    return '';
  }

  if (field === 'favoriteColor') {
    return normalized.toLowerCase();
  }

  if (field === 'birthday') {
    return normalizeBirthday(normalized);
  }

  if (field === 'studentId') {
    return normalized.replace(/\s+/g, '').toUpperCase();
  }

  return normalized;
}

export function normalizeSecurityAnswers(answers = {}) {
  return SECURITY_QUESTION_FIELDS.reduce((result, field) => {
    result[field] = normalizeSecurityAnswer(field, answers[field]);
    return result;
  }, {});
}
