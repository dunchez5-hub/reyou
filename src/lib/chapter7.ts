// @ts-nocheck
/* ------------------------------------------------------------------ */
/*  Глава 7 — «Последняя проверка»                                     */
/*  Три независимые нормативные субшкалы-ограничения (0-100) +          */
/*  один поведенческий сценарий, который сверяет глагол (гл.3),         */
/*  драйвер (гл.5), квадрант мышления (гл.4) и антипрофиль (гл.6)        */
/*  сразу, в одной живой ситуации. Финал главы — не «глава», а           */
/*  собранный итоговый профиль с 1-3 рекомендованными направлениями.     */
/* ------------------------------------------------------------------ */

import { narrowDirections } from "./directions";

export const CONSTRAINTS = ["retraining", "horizon", "financial_buffer"];

export const CONSTRAINT_META = {
  retraining: { name: "Готовность переучиваться", color: "#007AFF" },
  horizon: { name: "Горизонт терпения", color: "#34C759" },
  financial_buffer: { name: "Финансовая подушка", color: "#FF9500" },
};

/* ------------------------------------------------------------------ */
/*  Локальные словари имён — по образцу chapter5.ts/chapter6.ts         */
/* ------------------------------------------------------------------ */

const POLE_NAME = { L: "Люди", S: "Системы", M: "Материя", O: "Образы" };
const VERB_NAME = { SO: "Создавать", CHI: "Чинить / улучшать", IS: "Исследовать", OR: "Организовывать", PE: "Передавать", UB: "Убеждать" };
const VERB_NAME_LOWER = { SO: "создаёшь", CHI: "чинишь", IS: "исследуешь", OR: "организовываешь", PE: "передаёшь", UB: "убеждаешь" };
const DRIVER_NAME = { AV: "Автономия", VL: "Влияние на людей", TV: "Творчество", ST: "Стабильность", RZ: "Развитие", PR: "Признание" };

/* ------------------------------------------------------------------ */
/*  Основные вопросы (без последнего сценарного и финального —          */
/*  они подставляются в page.tsx через antiScenarioQuestion/FINAL_Q7)   */
/* ------------------------------------------------------------------ */

export const QUESTIONS7_MAIN = [
  {
    id: "c7l1",
    kind: "scale",
    sub: "retraining",
    weight: 1.2,
    tag: "Без прикрас. Честный ответ здесь стоит дороже красивого.",
    text: "Тебе показывают направление, которое реально тебе подходит — но там нужно начать почти с нуля: новые навыки, никакого стажа, первые месяцы будешь слабее большинства новичков вокруг.",
    leftLabel: "это меня остановит",
    rightLabel: "нормально, все с чего-то начинают",
  },
  {
    id: "c7l2",
    kind: "scale",
    sub: "retraining",
    weight: 1.0,
    reverse: true,
    text: "Мне важно быть на среднем или выше уровне в том, чем я занимаюсь, почти всегда — состояние новичка меня выматывает быстрее, чем сама работа.",
  },
  {
    id: "c7l3",
    kind: "scale",
    sub: "horizon",
    weight: 1.2,
    text: "Представь: результат в новом направлении появится не раньше, чем через два года стабильной работы. До этого — только процесс, без явного прогресса, который можно было бы предъявить.",
    leftLabel: "два года без результата — это не про меня",
    rightLabel: "нормально, я так и планирую",
  },
  {
    id: "c7l4",
    kind: "scale",
    sub: "financial_buffer",
    weight: 1.3,
    text: "Смена направления означает временное снижение дохода на 6–12 месяцев. Насколько это реально для тебя прямо сейчас — не в теории, а с учётом твоей текущей жизни?",
    leftLabel: "совсем нереально",
    rightLabel: "спокойно выдержу",
  },
  {
    id: "c7l5",
    kind: "single",
    pair: true,
    weight: 1.0,
    sub: "financial_buffer",
    tag: "придётся выбрать — оба варианта реальные",
    text: "Если бы пришлось выбирать прямо сейчас:",
    options: [
      { id: "a", label: "Направление, которое подходит идеально, но с просадкой дохода на год" },
      { id: "b", label: "Направление похуже, но без просадки" },
    ],
  },
  {
    id: "c7scenario",
    kind: "single",
    weight: 1.4,
    tag: "Последний блок. Не анкета — ситуация. Читай внимательно, здесь нет правильного ответа.",
    text: "Тебе дают месяц и команду из 5 человек. Задача сформулирована широко: «Сделайте так, чтобы это заработало». Ресурсы ограничены, руководитель появляется раз в неделю, дальше — сами.\n\nС чего ты начнёшь в первый день?",
    options: [
      { id: "a", label: "Соберу всех и распределю, кто за что отвечает", verb: "OR" },
      { id: "b", label: "Пойду разбираться, почему это до сих пор не работает", verb: "IS" },
      { id: "c", label: "Накидаю несколько вариантов решения, которых ещё не пробовали", verb: "SO" },
      { id: "d", label: "Возьму то, что уже почти работает, и доведу до ума", verb: "CHI" },
      { id: "e", label: "Пойду говорить с теми, от кого зависит, чтобы получить ресурсы и поддержку", verb: "UB" },
      { id: "f", label: "Начну с того, чтобы объяснить команде, что и зачем мы делаем", verb: "PE" },
    ],
  },
  {
    id: "c7scenario_q1",
    kind: "single",
    weight: 1.2,
    text: "Прошла неделя. Что-то пошло не так — команда буксует. Что делаешь в первую очередь?",
    options: [
      { id: "a", label: "Разбираюсь сам(а), не подключая остальных, пока не пойму суть", driver: "AV" },
      { id: "b", label: "Собираю команду и вместе ищем, что сломалось", driver: "VL" },
      { id: "c", label: "Пробую совсем другой подход, раз этот не работает", driver: "TV" },
      { id: "d", label: "Возвращаюсь к изначальному плану и довожу его до конца без резких смен", driver: "ST" },
    ],
  },
  {
    id: "c7scenario_q2",
    kind: "single",
    weight: 1.0,
    text: "Проект получился. Руководитель спрашивает: «Что было сложнее всего?» Что ты отвечаешь в первую очередь?",
    options: [
      { id: "a", label: "Держать в голове все детали одновременно", dim: "focus", value: "detail" },
      { id: "b", label: "Не сорваться в детали и видеть картину целиком", dim: "focus", value: "system" },
      { id: "c", label: "Объяснять логику решений тем, кто не в теме", dim: "think", value: "analytic" },
      { id: "d", label: "Не потерять ощущение того, зачем мы вообще это делаем", dim: "think", value: "figurative" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Динамический вопрос-перепроверка антипрофиля — по образцу           */
/*  contradictionQuestion из chapter6.ts                               */
/* ------------------------------------------------------------------ */

export const ANTI_SCENARIO_ID = "c7scenario_q3";

const ANTI_SCENARIO_PHRASES = {
  flow: "Если придётся снова работать в потоке новых лиц без передышки — откажусь, даже если интересно",
  regulation: "Если опять всё будет расписано по инструкции без права отклониться — откажусь, даже если интересно",
  public: "Если придётся снова каждую неделю отчитываться цифрами перед всеми — откажусь, даже если интересно",
  isolation: "Если опять придётся тащить всё в одиночку без обратной связи — откажусь, даже если интересно",
  rush: "Если снова будет такой же хаос без права всё наладить — откажусь, даже если интересно",
  routine: "Если задача через полгода станет чистым повторением без права что-то менять — откажусь, даже если интересно",
  risk: "Если доход снова будет непредсказуемо скакать без всякой подушки — откажусь, даже если интересно",
};

export function antiScenarioQuestion(targetSub: string) {
  const sub = ANTI_SCENARIO_PHRASES[targetSub] ? targetSub : "rush";
  return {
    id: ANTI_SCENARIO_ID,
    kind: "single",
    pair: true,
    weight: 1.1,
    tag: "и ещё один поворот той же ситуации",
    text: "Через месяц предлагают продолжить в том же формате ещё на квартал. Что перевешивает при решении?",
    options: [
      { id: "confirm", label: ANTI_SCENARIO_PHRASES[sub] },
      { id: "soften", label: "Ничего из этого меня не остановит, если задача интересная" },
    ],
    _sub: sub,
  };
}

export const FINAL_ID = "c7final";

export const FINAL_Q7 = {
  id: FINAL_ID,
  kind: "text",
  weight: 0,
  tag: "Последний вопрос в этих семи главах. Он ни на что не влияет — кроме того, что останется с тобой.",
  text: "Из всего, что ты узнал(а) о себе за эти семь глав — что удивило больше всего?",
};

/* ------------------------------------------------------------------ */
/*  Скоринг                                                            */
/* ------------------------------------------------------------------ */

export function levelOf7(v: number) {
  return v >= 65 ? "high" : v <= 35 ? "low" : "mid";
}

function findOpt(options, id) {
  return options ? options.find((o: any) => o.id === id) : null;
}

export function computeResult7(
  answers: Record<string, unknown>,
  ctx: {
    verbLead: string | null;
    verbFlat: boolean;
    driverLead: string | null;
    driverFlat: boolean;
    thinkType: string | null;
    focusType: string | null;
    antiTargetSub: string;
  }
) {
  const sum: any = { retraining: 0, horizon: 0, financial_buffer: 0 };
  const w: any = { retraining: 0, horizon: 0, financial_buffer: 0 };

  function addScale(id: string, sub: string, weight: number, reverse?: boolean) {
    const a = answers[id];
    if (a == null) return;
    const v = reverse ? 6 - (a as number) : (a as number);
    const s100 = ((v - 1) / 4) * 100;
    sum[sub] += s100 * weight;
    w[sub] += weight;
  }

  addScale("c7l1", "retraining", 1.2, false);
  addScale("c7l2", "retraining", 1.0, true);
  addScale("c7l3", "horizon", 1.2, false);
  addScale("c7l4", "financial_buffer", 1.3, false);

  const l5 = answers.c7l5;
  if (l5 != null) {
    const val = l5 === "a" ? 75 : 25;
    sum.financial_buffer += val * 1.0;
    w.financial_buffer += 1.0;
  }

  const constraints: any = {};
  CONSTRAINTS.forEach((k) => {
    const score = w[k] > 0 ? sum[k] / w[k] : 50;
    constraints[k] = { score, level: levelOf7(score) };
  });

  /* --- сценарий: глагол, драйвер, квадрант, антипрофиль ------------ */
  const scenarioQ = QUESTIONS7_MAIN.find((q) => q.id === "c7scenario");
  const scOpt: any = findOpt(scenarioQ.options, answers.c7scenario);
  const scenarioVerb = scOpt ? scOpt.verb : null;

  const q1 = QUESTIONS7_MAIN.find((q) => q.id === "c7scenario_q1");
  const q1Opt: any = findOpt(q1.options, answers.c7scenario_q1);
  const scenarioDriver = q1Opt ? q1Opt.driver : null;

  const q2 = QUESTIONS7_MAIN.find((q) => q.id === "c7scenario_q2");
  const q2Opt: any = findOpt(q2.options, answers.c7scenario_q2);
  const scenarioThink = q2Opt ? { dim: q2Opt.dim, value: q2Opt.value } : null;

  const antiConfirmed = answers[ANTI_SCENARIO_ID] === "confirm";
  const antiAnswered = answers[ANTI_SCENARIO_ID] != null;

  const verbMatch =
    scenarioVerb && ctx.verbLead && !ctx.verbFlat ? scenarioVerb === ctx.verbLead : null;
  const combinedVerb = !ctx.verbFlat && ctx.verbLead ? ctx.verbLead : scenarioVerb;

  const driverMatch =
    scenarioDriver && ctx.driverLead && !ctx.driverFlat ? scenarioDriver === ctx.driverLead : null;
  const combinedDriver = !ctx.driverFlat && ctx.driverLead ? ctx.driverLead : scenarioDriver;

  let thinkMatch = null;
  if (scenarioThink) {
    if (scenarioThink.dim === "focus" && ctx.focusType) {
      thinkMatch = ctx.focusType === "mixed" ? true : scenarioThink.value === ctx.focusType;
    } else if (scenarioThink.dim === "think" && ctx.thinkType) {
      thinkMatch = ctx.thinkType === "mixed" ? true : scenarioThink.value === ctx.thinkType;
    }
  }

  return {
    constraints,
    scenarioVerb,
    scenarioDriver,
    scenarioThink,
    verbMatch,
    combinedVerb,
    driverMatch,
    combinedDriver,
    thinkMatch,
    antiConfirmed,
    antiAnswered,
    antiTargetSub: ctx.antiTargetSub,
  };
}

export function isComplete7(q: any, a: unknown) {
  if (q.kind === "text") return true; // финальный вопрос не обязателен и не считается
  return a != null;
}

/* ------------------------------------------------------------------ */
/*  Тексты — блок ограничений                                          */
/* ------------------------------------------------------------------ */

export const CONSTRAINT_TEXTS = {
  retraining: {
    high: {
      title: "Готовность переучиваться высокая",
      body: "Ты реально готов(а) начать сначала. Это редкость — большинство людей на словах открыты новому, а на деле выбирают то, где уже сильны. Это открывает тебе направления, которые иначе были бы закрыты по формальному признаку «нет опыта».",
    },
    mid: {
      title: "Готовность переучиваться средняя",
      body: "Ты пойдёшь в новое, если увидишь план и разумные сроки. Это нормальная, рабочая позиция — просто учитывай, что решение о смене стоит принимать не спонтанно, а с чётким пониманием, через сколько появится первый результат.",
    },
    low: {
      title: "Готовность переучиваться низкая",
      body: "Смена поля с нуля будет для тебя дорогой психологически, даже если формально возможной. Это не недостаток — это значит, что тебе разумнее искать направления, которые продолжают то, что ты уже умеешь, а не начинают с чистого листа.",
    },
  },
  horizon: {
    high: {
      title: "Горизонт терпения высокий",
      body: "Ты можешь вкладываться долго без немедленной отдачи. Это ценный ресурс — многие интересные направления именно так и устроены: сначала вложение, потом результат.",
    },
    mid: {
      title: "Горизонт терпения средний",
      body: "Тебе нужен видимый прогресс хотя бы раз в несколько месяцев, и это разумно. Выбирай направления с промежуточными результатами, а не только с далёким финалом.",
    },
    low: {
      title: "Горизонт терпения низкий",
      body: "Тебе нужен результат быстро. Это значит, что длинные траектории с отложенной отдачей — плохой выбор для тебя прямо сейчас, вне зависимости от того, насколько они теоретически подходят.",
    },
  },
  financial_buffer: {
    high: {
      title: "Финансовая подушка высокая",
      body: "У тебя есть реальный запас, чтобы позволить себе просадку ради лучшего направления. Это не всем доступно — используй это окно, пока оно открыто.",
    },
    mid: {
      title: "Финансовая подушка средняя",
      body: "Ты можешь выдержать временное снижение дохода, но не бесконечное. Планируй смену с чёткой границей по времени и деньгам, а не «как пойдёт».",
    },
    low: {
      title: "Финансовая подушка низкая",
      body: "Прямо сейчас просадка дохода нереалистична, и это нужно учитывать честно, не как временную слабость, а как текущий факт. Это не значит «никогда» — это значит «не за счёт резкого шага, а постепенно, без риска для текущей стабильности».",
    },
  },
};

export function constraintText(sub: string, level: string) {
  return CONSTRAINT_TEXTS[sub][level];
}

/* ------------------------------------------------------------------ */
/*  Тексты — сверка со сценарием                                       */
/* ------------------------------------------------------------------ */

export function scenarioVerbText(res7: any) {
  if (res7.verbMatch == null) {
    return {
      title: "Глагол определился прямо в сценарии",
      body: `В анкете глава 3 не смогла определить твой ведущий глагол уверенно. В живом сценарии, под давлением и с реальными ставками, ты выбрал(а) «${VERB_NAME[res7.scenarioVerb] || "—"}». Считаем это самым надёжным сигналом из всех: то, что ты выбираешь под нагрузкой, обычно точнее предсказывает роль, чем спокойный ответ на вопрос.`,
    };
  }
  if (res7.verbMatch) {
    return {
      title: "Слова и поведение совпали",
      body: `В спокойной анкете ты назвал(а) себя «${VERB_NAME[res7.scenarioVerb]}». В смоделированной живой ситуации — с реальным давлением, командой и неопределённостью — ты выбрал(а) то же самое. Это самое надёжное подтверждение из всех семи глав: то, что ты говоришь о себе, и то, что ты делаешь под нагрузкой, совпадает.`,
    };
  }
  return {
    title: "Слова и поведение разошлись — и это тоже сигнал",
    body: `Интересно: в анкете ты чаще выбирал(а) «${VERB_NAME[res7.combinedVerb]}», а в живом сценарии, под давлением и с реальными ставками, повёл(а) себя как «${VERB_NAME[res7.scenarioVerb]}». Это не ошибка предыдущих глав. Часто это значит: один глагол — это то, кем ты видишь себя в спокойном состоянии, а другой — то, кто ты есть, когда деваться некуда. Второе обычно точнее предсказывает, в какой роли ты продержишься дольше.`,
  };
}

export function scenarioDriverText(res7: any) {
  const underPressure = DRIVER_NAME[res7.scenarioDriver] || "—";
  if (res7.driverMatch == null) {
    return {
      title: "Драйвер под давлением",
      body: `Под давлением ты выбрал(а) «${underPressure}». Глава 5 не дала уверенного лидера в спокойных условиях, так что этот замер сейчас — самый чёткий сигнал о том, что тебя держит, когда легче не становится.`,
    };
  }
  if (res7.driverMatch) {
    return {
      title: "Драйвер под давлением",
      body: `Под давлением ты выбрал(а) «${underPressure}» — тот же драйвер, что и в спокойных условиях. Значит, он не ситуативный, а базовый: он держит тебя и когда всё хорошо, и когда всё горит.`,
    };
  }
  return {
    title: "Драйвер под давлением",
    body: `В спокойных условиях твой ведущий драйвер — «${DRIVER_NAME[res7.combinedDriver] || "—"}», но под стрессом на первый план вышел «${underPressure}». Это не противоречие — многие люди работают на одном топливе, а держатся в кризис на другом. Учитывай оба.`,
  };
}

export function scenarioThinkText(res7: any) {
  if (res7.thinkMatch == null) {
    return {
      title: "Мышление в конкретной ситуации",
      body: "Этот ответ пока не с чем сравнивать напрямую — но он лёг в общую картину твоего стиля мышления и учтён в итоговом профиле.",
    };
  }
  if (res7.thinkMatch) {
    return {
      title: "Квадрант мышления подтверждён",
      body: "То, что было сложнее всего в завершённом проекте, совпадает с квадрантом мышления из главы 4. Это второй независимый замер того же самого — уверенность в нём выше, чем в обычном одиночном результате.",
    };
  }
  return {
    title: "Мышление гибче, чем показал тест",
    body: "В конкретной завершённой ситуации ты назвал(а) сложным не то, что предсказывала глава 4. Это не ошибка — это значит, что твой стиль мышления не жёсткий, а меняется в зависимости от того, что именно происходит в моменте.",
  };
}

export function scenarioAntiText(res7: any) {
  const subName = res7.antiTargetSub;
  if (res7.antiConfirmed) {
    return {
      title: "Финальное подтверждение",
      body: `Даже в сценарии с интересной задачей ты бы отказался(-ась) от продолжения, если бы пришлось снова столкнуться с этим. Это финальное подтверждение — этот пункт входит в антипрофиль с высокой уверенностью.`,
    };
  }
  return {
    title: "Порог не абсолютный",
    body: `Здесь любопытно — этот пункт был одним из твоих сильных исключений в главе 6, но в конкретной интересной задаче ты был(а) готов(а) это перетерпеть. Значит, порог не абсолютный: интересность задачи может частично компенсировать среду. Стоит держать это в уме, а не считать правило железным.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Банки для финального профиля                                       */
/* ------------------------------------------------------------------ */

const TASK_BANK: Record<string, (pole: string) => string[]> = {
  SO: (pole) => [`Придумывать решения с нуля в области «${pole}», которых ещё не пробовали`, "Запускать проекты с пустого листа, а не доводить чужие"],
  CHI: (pole) => [`Брать то, что в «${pole}» почти работает, и доводить до отличного состояния`, "Чинить процессы и продукты, у которых уже есть первая версия"],
  IS: (pole) => [`Глубоко разбираться в вопросах из области «${pole}», до которых у других не доходят руки`, "Искать причины, а не следствия"],
  OR: (pole) => [`Выстраивать процессы в «${pole}», которые продолжают работать без тебя`, "Наводить порядок там, где сейчас хаос"],
  PE: (pole) => [`Объяснять сложные вещи из «${pole}» так, чтобы стало понятно всем`, "Передавать знания и обучать"],
  UB: (pole) => [`Убеждать и договариваться в контексте «${pole}»`, "Получать ресурсы и поддержку под задачи, которые сами себя не продадут"],
};

const SKILLS_BANK: Record<string, string[]> = {
  SO: ["Доводить начатое до конца, а не только до интересной части", "Базовые инструменты быстрого прототипирования"],
  CHI: ["Формулировать, что именно и зачем улучшается, — не только как", "Работа с чужим кодом/процессом без переписывания с нуля"],
  IS: ["Превращать находки в понятные выводы для тех, кто не погружался в тему так же глубоко", "Доводить исследование до практического решения"],
  OR: ["Делегирование и работа через людей, а не только через процессы", "Публичная презентация результатов"],
  PE: ["Структурировать материал для разных уровней подготовки аудитории", "Работа с обратной связью без потери уверенности"],
  UB: ["Аргументация на цифрах, а не только на голосе и энергии", "Долгие переговоры без немедленного результата"],
};

function reasonFor(d: any, verbLead: string | null, driverLead: string | null, materialLead: string | null) {
  const bits: string[] = [];
  if (materialLead && d.pole === materialLead) bits.push(`совпадает с твоим полем «${POLE_NAME[materialLead]}»`);
  if (verbLead && d.verbs && d.verbs.includes(verbLead)) bits.push(`использует твоё действие «${VERB_NAME[verbLead]}»`);
  if (driverLead && d.drivers && d.drivers.includes(driverLead)) bits.push(`подпитывает драйвер «${DRIVER_NAME[driverLead]}»`);
  if (bits.length === 0) return "Осталось в списке после всех фильтров предыдущих глав.";
  const joined = bits.join(", ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

/* ------------------------------------------------------------------ */
/*  Сборка итогового профиля — вызывается один раз, после c7final       */
/* ------------------------------------------------------------------ */

export function buildFinalProfile({
  materialLead,
  pctByPole,
  verbLead,
  verbFlat,
  driverLead,
  driverFlat,
  quadrantTitle,
  antiExclusions,
  res7,
}: any) {
  const combinedVerb = res7.combinedVerb;
  const combinedDriver = res7.combinedDriver;

  const paragraph =
    `Ты — тот, кто ${combinedVerb ? VERB_NAME_LOWER[combinedVerb] : "ищет своё действие"} в поле «${POLE_NAME[materialLead] || "—"}»` +
    `${quadrantTitle ? `, думает как «${quadrantTitle.toLowerCase()}»` : ""}` +
    `${combinedDriver ? `, а держит тебя «${DRIVER_NAME[combinedDriver].toLowerCase()}»` : ""}. ` +
    `${res7.verbMatch === true ? "Живой сценарий это подтвердил — редкое и сильное совпадение." : res7.verbMatch === false ? "Живой сценарий показал чуть другую грань — учитывай обе." : "Живой сценарий стал решающим голосом там, где анкета сомневалась."}`;

  const tasks = combinedVerb && TASK_BANK[combinedVerb] ? TASK_BANK[combinedVerb](POLE_NAME[materialLead] || "твоё поле") : [];
  const skills = combinedVerb && SKILLS_BANK[combinedVerb] ? SKILLS_BANK[combinedVerb] : [];

  const roleObjs = narrowDirections({
    pctByPole,
    verbRanked: combinedVerb ? [combinedVerb] : null,
    driverRanked: combinedDriver ? [combinedDriver] : null,
    antiHigh: antiExclusions,
    limit: 3,
    withDetails: true,
  });

  const roles = (roleObjs || []).map((d: any) => ({
    name: d.name,
    reason: reasonFor(d, combinedVerb, combinedDriver, materialLead),
  }));

  const avoid = (antiExclusions || []).slice(0, 2);
  const avoidSoftened = avoid.length && avoid[0] === res7.antiTargetSub && !res7.antiConfirmed;

  const disclaimer =
    "Это результат семи глав. Программа продолжится — со следующей версией мы добавим больше глубины: ценности, долгосрочный горизонт и то, как ты ведёшь себя в команде вживую. Они не перечеркнут эту картину, но сделают её точнее и шире.";

  return { paragraph, tasks, roles, skills, avoid, avoidSoftened, disclaimer };
}
