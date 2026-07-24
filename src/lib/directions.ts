// @ts-nocheck
/* ------------------------------------------------------------------ */
/*  Воронка направлений                                                */
/*  Счётчик «направлений в фокусе» должен показывать не голое число,    */
/*  а конкретные названия. Здесь лежит и полный список 40, и правила    */
/*  сужения по главам.                                                 */
/* ------------------------------------------------------------------ */

/* Полный банк направлений, размеченный по предмету труда (главы 1-2),
   глаголу (глава 3) и средам (глава 6). Разметка нужна, чтобы список
   сужался осмысленно, а не просто обрезался по длине. */

export const DIRECTIONS = [
  // --- Люди ---
  { id: "hr", name: "HR и подбор", pole: "L", verbs: ["PE", "UB", "OR"], envs: ["flow"] },
  { id: "teach", name: "Обучение взрослых, преподавание", pole: "L", verbs: ["PE"], envs: ["flow", "public"] },
  { id: "mentor", name: "Наставничество и коучинг", pole: "L", verbs: ["PE", "UB"], envs: [] },
  { id: "therapy", name: "Психология, терапия", pole: "L", verbs: ["PE"], envs: [] },
  { id: "userres", name: "Исследование пользователей", pole: "L", verbs: ["IS"], envs: [] },
  { id: "teamlead", name: "Управление командой, тимлид", pole: "L", verbs: ["OR", "UB"], envs: ["public"] },
  { id: "sales", name: "Сложные продажи, B2B", pole: "L", verbs: ["UB"], envs: ["public", "risk"] },
  { id: "negotiate", name: "Переговоры, медиация", pole: "L", verbs: ["UB"], envs: [] },
  { id: "community", name: "Комьюнити-менеджмент", pole: "L", verbs: ["OR", "PE"], envs: ["flow"] },
  { id: "support", name: "Клиентская поддержка", pole: "L", verbs: ["CHI", "PE"], envs: ["flow", "routine"] },

  // --- Системы ---
  { id: "analytics", name: "Аналитика и работа с данными", pole: "S", verbs: ["IS"], envs: ["isolation"] },
  { id: "dev", name: "Разработка", pole: "S", verbs: ["SO", "CHI"], envs: ["isolation"] },
  { id: "architect", name: "Архитектура систем", pole: "S", verbs: ["SO", "OR"], envs: [] },
  { id: "qa", name: "Тестирование и контроль качества", pole: "S", verbs: ["CHI", "IS"], envs: ["routine"] },
  { id: "secops", name: "Информационная безопасность", pole: "S", verbs: ["IS", "CHI"], envs: ["rush"] },
  { id: "finmodel", name: "Финансовое моделирование", pole: "S", verbs: ["IS", "OR"], envs: [] },
  { id: "audit", name: "Аудит и экспертиза", pole: "S", verbs: ["IS"], envs: ["regulation"] },
  { id: "opsmanage", name: "Операционное управление", pole: "S", verbs: ["OR", "CHI"], envs: ["rush"] },
  { id: "projmanage", name: "Проектное управление", pole: "S", verbs: ["OR"], envs: ["rush"] },
  { id: "logistics", name: "Логистика и планирование", pole: "S", verbs: ["OR"], envs: ["rush", "routine"] },
  { id: "science", name: "Наука и исследования", pole: "S", verbs: ["IS"], envs: ["isolation", "risk"] },
  { id: "consult", name: "Консалтинг", pole: "S", verbs: ["IS", "PE", "UB"], envs: ["risk"] },

  // --- Материя ---
  { id: "engineer", name: "Инженерия", pole: "M", verbs: ["SO", "CHI"], envs: [] },
  { id: "manufact", name: "Производство", pole: "M", verbs: ["CHI", "OR"], envs: ["routine", "regulation"] },
  { id: "construct", name: "Строительство и монтаж", pole: "M", verbs: ["SO", "OR"], envs: ["rush"] },
  { id: "equipment", name: "Работа с оборудованием", pole: "M", verbs: ["CHI"], envs: ["routine"] },
  { id: "culinary", name: "Кулинария, гастрономия", pole: "M", verbs: ["SO", "CHI"], envs: ["rush", "flow"] },
  { id: "restore", name: "Реставрация и ремесло", pole: "M", verbs: ["CHI", "SO"], envs: ["isolation"] },
  { id: "body", name: "Работа с телом: спорт, реабилитация", pole: "M", verbs: ["PE", "CHI"], envs: ["flow"] },
  { id: "lab", name: "Лаборатория, диагностика", pole: "M", verbs: ["IS", "CHI"], envs: ["isolation", "regulation"] },

  // --- Образы ---
  { id: "design", name: "Графический и продуктовый дизайн", pole: "O", verbs: ["SO"], envs: [] },
  { id: "ux", name: "UX и интерфейсы", pole: "O", verbs: ["SO", "IS"], envs: [] },
  { id: "content", name: "Контент и редактура", pole: "O", verbs: ["SO", "PE"], envs: ["isolation"] },
  { id: "brand", name: "Бренд и коммуникации", pole: "O", verbs: ["SO", "UB"], envs: ["public"] },
  { id: "advert", name: "Реклама и креатив", pole: "O", verbs: ["SO"], envs: ["rush", "public"] },
  { id: "journal", name: "Журналистика", pole: "O", verbs: ["IS", "PE"], envs: ["rush", "risk"] },
  { id: "techwrite", name: "Техническое письмо и документация", pole: "O", verbs: ["PE"], envs: ["isolation", "routine"] },
  { id: "archit", name: "Архитектура и предметный дизайн", pole: "O", verbs: ["SO"], envs: [] },
  { id: "scene", name: "Сцена, свет, сценография", pole: "O", verbs: ["SO"], envs: ["rush", "risk"] },
  { id: "photo", name: "Фотография и видео", pole: "O", verbs: ["SO"], envs: ["risk", "flow"] },
];

/* ------------------------------------------------------------------ */
/*  Сужение по главам                                                  */
/* ------------------------------------------------------------------ */

// Порядок сужения из спецификаций: 40 → 24/28/33 (гл.1) → 18 (гл.2)
// → 14 (гл.3) → 10 (гл.4) → 12 (гл.5, пересчёт) → 7 (гл.6)

function scoreByPole(d, pctByPole) {
  if (!pctByPole) return 0;
  return pctByPole[d.pole] || 0;
}

export function narrowDirections({ pctByPole, verbRanked, antiHigh, limit }) {
  let list = DIRECTIONS.map((d) => {
    let score = scoreByPole(d, pctByPole);

    // глагол: направления, где ведущий глагол человека в списке, поднимаются
    if (verbRanked && verbRanked.length) {
      const lead = verbRanked[0];
      const second = verbRanked[1];
      if (d.verbs.includes(lead)) score += 40;
      else if (second && d.verbs.includes(second)) score += 18;
    }
    return { ...d, score };
  });

  // антипрофиль (глава 6): выкидываем направления с исключёнными средами
  if (antiHigh && antiHigh.length) {
    const filtered = list.filter((d) => !d.envs.some((e) => antiHigh.includes(e)));
    // не даём списку схлопнуться в ноль из-за жёсткого антипрофиля
    if (filtered.length >= limit) list = filtered;
  }

  list.sort((a, b) => b.score - a.score);
  return list.slice(0, limit).map((d) => d.name);
}

export function focusCount(done1, done2, done3, done4, done5, done6, res1) {
  if (done6) return 7;
  if (done5) return 12;
  if (done4) return 10;
  if (done3) return 14;
  if (done2) return 18;
  if (done1) {
    if (!res1) return 24;
    return res1.flat ? 33 : res1.pct[res1.lead] >= 35 ? 24 : 28;
  }
  return 40;
}

export function narrowingHistory(done1, done2, done3, done4, done5, done6, res1) {
  const steps = [{ label: "старт", n: 40 }];
  if (done1) steps.push({ label: "глава 1 · твоё поле", n: focusCount(true, false, false, false, false, false, res1) });
  if (done2) steps.push({ label: "глава 2 · фундамент", n: 18 });
  if (done3) steps.push({ label: "глава 3 · действие", n: 14 });
  if (done4) steps.push({ label: "глава 4 · способ думать", n: 10 });
  if (done5) steps.push({ label: "глава 5 · что держит", n: 12 });
  if (done6) steps.push({ label: "глава 6 · антипрофиль", n: 7 });
  return steps;
}
