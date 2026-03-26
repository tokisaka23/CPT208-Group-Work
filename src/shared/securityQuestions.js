export const SECURITY_QUESTION_FIELDS = ['favoriteColor', 'birthday', 'studentId'];

export const SECURITY_QUESTION_PROMPTS = {
  favoriteColor: '你最喜欢的颜色是什么？',
  birthday: '你的生日是什么？',
  studentId: '你的学号是什么？',
};

export const SECURITY_QUESTION_COLUMNS = {
  favoriteColor: 'security_answer_favorite_color',
  birthday: 'security_answer_birthday',
  studentId: 'security_answer_student_id',
};

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
