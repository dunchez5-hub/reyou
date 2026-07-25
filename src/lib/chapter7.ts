// @ts-nocheck
/* ------------------------------------------------------------------ */
/*  Глава 7 — «Последняя проверка»                                     */
/*  Три части: ограничения (нормативные, независимые), поведенческий    */
/*  сценарий (не новая шкала — модификатор уже собранных весов),        */
/*  финальный свободный вопрос (не оценивается).                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Вопросы                                                            */
/* ------------------------------------------------------------------ */

export const QUESTIONS7 = [
  {
    id: "c7l1",
    kind: "scale",
    sub: "retraining",
    weight: 1.2,
    tag: "без прикрас — честный ответ здесь стоит дороже красивого",
    text: "Тебе показывают направление, которое реально тебе подходит — но там нужно начать почти с нуля: новые навыки, никакого стажа, первые месяцы будешь слабее большинства новичков вокруг.",
    leftLabel: "это меня остановит",
    rightLabel: "нормально, все с чего-то начинают",
  },
  {
    id: "c7l2",
    kind: "scale",
    sub: "retraining",
    reverse: true,
    weight: 1.0,
    tag: "насколько это про тебя",
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
    sub: "financial",
    weight: 1.3,
    text: "Смена направления означает временное снижение дохода на 6–12 месяцев. Насколько это реально для тебя прямо сейчас — не в теории, а с учётом твоей текущей жизни?",
    leftLabel: "совсем нереально",
    rightLabel: "спокойно выдержу",
  },
  {
    id: "c7l5",
    kind: "single",
    pair: true,
    sub: "financial",
    weight: 1.0,
    tag: "если бы пришлось выбирать прямо сейчас",
    text: "Что выберешь?",
    options: [
      { id: "a", label: "Направление, которое подходит идеально, но с просадкой дохода на год", financialDelta: 4 },
      { id: "b", label: "Направление похуже, но без просадки", financialDelta: -4 },
    ],
  },
];

export const SCENARIO_ID = "c7scenario";
export const SCENARIO_Q1_ID = "c7scenario_q1";
export const SCENARIO_Q2_ID = "c7scenario_q2";
export const SCENARIO_Q3_ID = "c7scenario_q3";
export const FINAL_ID = "c7final";

export const SCENARIO_QUESTION = {
  id: SCENARIO_ID,
  kind: "single",
  weight: 1.4,
  tag: "последний блок — не анкета, а ситуация. здесь нет правильного ответа",
  text: "Тебе дают месяц и команду из 5 человек. Задача сформулирована широко: «Сделайте так, чтобы это заработало». Ресурсы ограничены, руководитель появляется раз в неделю, дальше — сами.\n\nС чего ты начнёшь в первый день?",
  options: [
    { id: "a", label: "Соберу всех и распределю, кто за что отвечает", verb: "OR" },
    { id: "b", label: "Пойду разбираться, почему это до сих пор не работает", verb: "IS" },
    { id: "c", label: "Накидаю несколько вариантов решения, которых ещё не пробовали", verb: "SO" },
    { id: "d", label: "Возьму то, что уже почти работает, и доведу до ума", verb: "CHI" },
    { id: "e", label: "Пойду говорить с теми, от кого зависит, чтобы получить ресурсы и поддержку", verb: "UB" },
    { id: "f", label: "Начну с того, чтобы объяснить команде, что и зачем мы делаем", verb: "PE" },
  ],
};

export const SCENARIO_Q1 = {
  id: SCENARIO_Q1_ID,
  kind: "single",
  weight: 1.2,
  text: "Прошла неделя. Что-то пошло не так — команда буксует. Что делаешь в первую очередь?",
  options: [
    { id: "a", label: "Разбираюсь сам(а), не подключая остальных, пока не пойму суть", driver: "AV" },
    { id: "b", label: "Собираю команду и вместе ищем, что сломалось", driver: "VL" },
    { id: "c", label: "Пробую совсем другой подход, раз этот не работает", driver: "TV" },
    { id: "d", label: "Возвращаюсь к изначальному плану и довожу его до конца без резких смен", driver: "ST" },
  ],
};

export const SCENARIO_Q2 = {
  id: SCENARIO_Q2_ID,
  kind: "single",
  weight: 1.0,
  text: "Проект получился. Руководитель спрашивает: «Что было сложнее всего?» Что ты отвечаешь в первую очередь?",
  options: [
    { id: "a", label: "Держать в голове все детали одновременно", focus: "detail" },
    { id: "b", label: "Не сорваться в детали и видеть картину целиком", focus: "system" },
    { id: "c", label: "Объяснять логику решений тем, кто не в теме", think: "analytic" },
    { id: "d", label: "Не потерять ощущение того, зачем мы вообще это делаем", think: "figurative" },
  ],
};

// c7scenario_q3 собирается динамически — варианты зависят от субшкалы
// антипрофиля с флагом contradiction (глава 6), либо от субшкалы с
// максимальным баллом, если противоречия не было
const SUB_PHRASE = {
  flow: "снова окажешься среди потока незнакомых людей без перерыва",
  regulation: "снова будет жёсткий регламент без права его менять",
  public: "придётся снова каждую неделю отчитываться цифрами перед всеми",
  isolation: "опять придётся тащить всё в одиночку без обратной связи",
  rush: "снова будет такой же хаос без права всё наладить",
  routine: "задача за полгода не изменится ни на шаг",
  risk: "доход снова станет непредсказуемым",
};

export function scenarioQ3(targetSub: string) {
  const phrase = SUB_PHRASE[targetSub] || SUB_PHRASE.rush;
  return {
    id: SCENARIO_Q3_ID,
    kind: "single",
    weight: 1.1,
    text: "Через месяц предлагают продолжить в том же формате ещё на квартал. Что перевешивает при решении?",
    options: [
      { id: "a", label: `Если ${phrase} — откажусь, даже если интересно`, confirmSub: targetSub },
      { id: "b", label: "Ничего из этого меня не остановит, если задача интересная", softenSub: targetSub },
    ],
    _targetSub: targetSub,
  };
}

export const FINAL_QUESTION = {
  id: FINAL_ID,
  kind: "text",
  weight: 0,
  tag: "последний вопрос в этих семи главах — он ни на что не влияет, кроме того, что останется с тобой",
  text: "Из всего, что ты узнал(а) о себе за эти семь глав — что удивило больше всего?",
  options: [], // <== Та самая заглушка, спасающая от краша
};

export function questions7Full(targetSub: string) {
  return [
    ...QUESTIONS7,
    SCENARIO_QUESTION,
    SCENARIO_Q1,
    SCENARIO_Q2,
    scenarioQ3(targetSub),
    FINAL_QUESTION,
  ];
}

export function isComplete7(q, a) {
  if (q.kind === "text") {
    // Теперь вопрос будет считаться отвеченным, только если ввели текст
    return typeof a === "string" && a.trim().length > 0; 
  }
  return a != null;
}

/* ------------------------------------------------------------------ */
/*  Скоринг                                                            */
/* ------------------------------------------------------------------ */

function to100(v: number) {
  return ((v - 1) / 4) * 100;
}

export function computeResult7(answers: Record<string, unknown>, targetSub: string) {
  /* --- ограничения ------------------------------------------------ */
  const constraints = { retraining: { sum: 0, w: 0 }, horizon: { sum: 0, w: 0 }, financial: { sum: 0, w: 0 } };

  QUESTIONS7.forEach((q) => {
    const a = answers[q.id];
    if (a == null) return;
    if (q.kind === "scale") {
      const v = q.reverse ? 6 - a : a;
      constraints[q.sub].sum += to100(v) * q.weight;
      constraints[q.sub].w += q.weight;
    }
  });

  const a5 = answers.c7l5;
  if (a5) {
    const opt = QUESTIONS7.find((q) => q.id === "c7l5").options.find((o) => o.id === a5);
    if (opt) {
      const delta50 = 50 + opt.financialDelta * 6.25; // ±4 → ±25 пунктов вокруг середины
      constraints.financial.sum += delta50 * 1.0;
      constraints.financial.w += 1.0;
    }
  }

  const constraintScore = {};
  const constraintH = {};
  Object.keys(constraints).forEach((k) => {
    constraintScore[k] = constraints[k].w > 0 ? constraints[k].sum / constraints[k].w : 50;
    constraintH[k] = constraints[k].w > 0 ? Math.max(4, Math.min(30, 25 / Math.sqrt(constraints[k].w))) : 30;
  });

  /* --- сценарий: глагол -------------------------------------------- */
  const scenarioAnswer = answers[SCENARIO_ID];
  const scenarioOpt = scenarioAnswer
    ? SCENARIO_QUESTION.options.find((o) => o.id === scenarioAnswer)
    : null;
  const scenarioVerb = scenarioOpt ? scenarioOpt.verb : null;

  /* --- сценарий: драйвер под давлением ------------------------------ */
  const q1Answer = answers[SCENARIO_Q1_ID];
  const q1Opt = q1Answer ? SCENARIO_Q1.options.find((o) => o.id === q1Answer) : null;
  const pressureDriver = q1Opt ? q1Opt.driver : null;

  /* --- сценарий: квадрант -------------------------------------------- */
  const q2Answer = answers[SCENARIO_Q2_ID];
  const q2Opt = q2Answer ? SCENARIO_Q2.options.find((o) => o.id === q2Answer) : null;

  /* --- сценарий: антипрофиль ----------------------------------------- */
  const q3 = scenarioQ3(targetSub);
  const q3Answer = answers[SCENARIO_Q3_ID];
  const q3Opt = q3Answer ? q3.options.find((o) => o.id === q3Answer) : null;
  const antiConfirmed = q3Opt ? !!q3Opt.confirmSub : false;
  const antiSoftened = q3Opt ? !!q3Opt.softenSub : false;

  const finalText = answers[FINAL_ID] || "";

  return {
    constraintScore, constraintH,
    scenarioVerb, pressureDriver, q2Opt,
    antiTargetSub: targetSub, antiConfirmed, antiSoftened,
    finalText,
  };
}

export function constraintLevel(v: number) {
  return v >= 65 ? "high" : v >= 35 ? "mid" : "low";
}

/* ------------------------------------------------------------------ */
/*  Тексты ограничений                                                  */
/* ------------------------------------------------------------------ */

export const CONSTRAINT_META = {
  retraining: { name: "Готовность переучиваться", color: "#007AFF" },
  horizon: { name: "Горизонт терпения", color: "#AF52DE" },
  financial: { name: "Финансовая подушка", color: "#34C759" },
};

export const CONSTRAINT_TEXTS = {
  retraining: {
    high: "Ты реально готов(а) начать сначала. Это редкость — большинство людей на словах открыты новому, а на деле выбирают то, где уже сильны. Это открывает тебе направления, которые иначе были бы закрыты по формальному признаку «нет опыта».",
    mid: "Ты пойдёшь в новое, если увидишь план и разумные сроки. Это нормальная, рабочая позиция — просто учитывай, что решение о смене стоит принимать не спонтанно, а с чётким пониманием, через сколько появится первый результат.",
    low: "Смена поля с нуля будет для тебя дорогой психологически, даже если формально возможной. Это не недостаток — это значит, что тебе разумнее искать направления, которые продолжают то, что ты уже умеешь, а не начинают с чистого листа.",
  },
  horizon: {
    high: "Ты можешь вкладываться долго без немедленной отдачи. Это ценный ресурс — многие интересные направления именно так и устроены: сначала вложение, потом результат.",
    mid: "Тебе нужен видимый прогресс хотя бы раз в несколько месяцев, и это разумно. Выбирай направления с промежуточными результатами, а не только с далёким финалом.",
    low: "Тебе нужен результат быстро. Это значит, что длинные траектории с отложенной отдачей — плохой выбор для тебя прямо сейчас, вне зависимости от того, насколько они теоретически подходят.",
  },
  financial: {
    high: "У тебя есть реальный запас, чтобы позволить себе просадку ради лучшего направления. Это не всем доступно — используй это окно, пока оно открыто.",
    mid: "Ты можешь выдержать временное снижение дохода, но не бесконечное. Планируй смену с чёткой границей по времени и деньгам, а не «как пойдёт».",
    low: "Прямо сейчас просадка дохода нереалистична, и это нужно учитывать честно, не как временную слабость, а как текущий факт. Это не значит «никогда» — это значит «не за счёт резкого шага, а постепенно, без риска для текущей стабильности».",
  },
};

/* ------------------------------------------------------------------ */
/*  Тексты сценария                                                     */
/* ------------------------------------------------------------------ */

const VERB_NAMES7 = { SO: "создаёшь", CHI: "чинишь и улучшаешь", IS: "исследуешь", OR: "организовываешь", PE: "передаёшь", UB: "убеждаешь" };
const DRIVER_NAMES7 = { AV: "автономия", VL: "влияние на людей", TV: "творчество", ST: "стабильность", RZ: "развитие", PR: "признание" };

export function scenarioVerbText(verbLead: string, scenarioVerb: string) {
  if (!scenarioVerb) return null;
  if (verbLead && scenarioVerb === verbLead) {
    return {
      title: "В живом выборе ты повёл(а) себя так же, как рассказывал(а) о себе",
      body: `В спокойной анкете ты назвал(а) себя тем, кто ${VERB_NAMES7[verbLead]}. В смоделированной живой ситуации — с реальным давлением, командой и неопределённостью — ты выбрал(а) то же самое. Это самое надёжное подтверждение из всех семи глав: то, что ты говоришь о себе, и то, что ты делаешь под нагрузкой, совпадает.`,
    };
  }
  return {
    title: "В живом выборе ты повёл(а) себя иначе, чем в анкете",
    body: `Интересно: в анкете ты чаще выбирал(а) то, что ты ${verbLead ? VERB_NAMES7[verbLead] : "—"}, а в живом сценарии, под давлением и с реальными ставками, повёл(а) себя как тот, кто ${VERB_NAMES7[scenarioVerb]}. Это не ошибка предыдущих глав. Часто это значит: один глагол — это то, кем ты видишь себя в спокойном состоянии, а другой — то, кто ты есть, когда деваться некуда. Второе обычно точнее предсказывает, в какой роли ты продержишься дольше.`,
  };
}

export function pressureDriverText(driverLead: string, pressureDriver: string) {
  if (!pressureDriver) return null;
  const name = DRIVER_NAMES7[pressureDriver];
  if (driverLead && pressureDriver === driverLead) {
    return {
      title: `Под давлением ты выбрал(а) ${name}`,
      body: "Это тот же драйвер, что и в спокойных условиях — значит, он не ситуативный, а базовый.",
    };
  }
  return {
    title: `Под давлением ты выбрал(а) ${name}`,
    body: `В спокойных условиях твой ведущий драйвер — ${driverLead ? DRIVER_NAMES7[driverLead] : "не определился"}, но под стрессом на первый план вышел ${name}. Это не противоречие — многие люди работают на одном топливе, а держатся в кризис на другом. Учитывай оба.`,
  };
}

export function quadrantScenarioText(quadrantKey: string, q2Opt: any) {
  if (!q2Opt) return null;
  const matched =
    (quadrantKey === "ARCHITECT" && (q2Opt.focus === "system" || q2Opt.think === "analytic")) ||
    (quadrantKey === "INVESTIGATOR" && (q2Opt.focus === "detail" || q2Opt.think === "analytic")) ||
    (quadrantKey === "VISIONARY" && (q2Opt.focus === "system" || q2Opt.think === "figurative")) ||
    (quadrantKey === "MASTER" && (q2Opt.focus === "detail" || q2Opt.think === "figurative"));

  if (matched) {
    return {
      title: "Способ думать подтвердился и под нагрузкой",
      body: "То, что было сложнее всего в завершённом проекте, совпадает с тем, что показал тест на способ мышления. Это усиливает уверенность в квадранте.",
    };
  }
  return {
    title: "Мышление гибче, чем показал тест",
    body: "В живом сценарии ты отметил(а) сложность с другой стороны, чем предполагает твой квадрант. Это не ошибка — просто в разных ситуациях включаются разные грани мышления. Стоит держать это в уме, а не считать квадрант единственной рамкой.",
  };
}

export function antiScenarioText(targetSub: string, confirmed: boolean) {
  const subName = targetSub;
  if (confirmed) {
    return {
      title: "Финальное подтверждение",
      body: `Даже в сценарии с интересной задачей ты бы отказался(-ась) от продолжения, если бы пришлось снова столкнуться с тем, что тебя выключает. Этот пункт входит в антипрофиль с высокой уверенностью.`,
    };
  }
  return {
    title: "Порог не абсолютный",
    body: `Здесь любопытно — в главе 6 это было одним из твоих сильных исключений, но в конкретной интересной задаче ты был(а) готов(а) это перетерпеть. Значит, порог не абсолютный: интересность задачи может частично компенсировать среду. Стоит держать это в уме, а не считать правило железным.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Итоговая сборка профиля                                             */
/* ------------------------------------------------------------------ */

const POLE_NAMES7 = { L: "людях", S: "системах", M: "материи", O: "образах" };

export function finalDisclaimer() {
  return "Это результат на 7 главах. Впереди ещё 4 главы, которые уточнят картину — особенно про ценности, долгосрочный горизонт и то, как ты ведёшь себя в команде вживую. Они не перечеркнут то, что мы собрали, но сделают это точнее и интереснее.";
}

export function buildFinalProfile({
  materialLead, verbLead, quadrantTitle, driverLead, resonanceLevel,
  scenarioVerb, exclusions, directions,
}: any) {
  const verb = verbLead ? VERB_NAMES7[verbLead] : "работаешь";
  const pole = materialLead ? POLE_NAMES7[materialLead] : "своём поле";
  const driver = driverLead ? DRIVER_NAMES7[driverLead] : "разные вещи одновременно";
  const confirmedNote = scenarioVerb && verbLead && scenarioVerb === verbLead
    ? "подтверждено живым сценарием"
    : "уточнено живым сценарием";

  const summary = `Ты — тот, кто ${verb} в ${pole}${quadrantTitle ? `, мыслит как «${quadrantTitle.toLowerCase()}»` : ""}, а держит тебя ${driver}. Это ${confirmedNote}.`;

  return {
    summary,
    directions: directions || [],
    exclusions: exclusions || [],
    disclaimer: finalDisclaimer(),
  };
}
