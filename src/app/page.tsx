"use client";
// @ts-nocheck

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  QUESTIONS2,
  computeResult2,
  isComplete2,
  computeResonance,
  chapterPctFromMeasurements,
  combineProfile,
  TEXTS2_HIGH,
  partialText,
  gapText,
  blindSpotText,
} from "@/lib/chapter2";
import {
  VERBS,
  VERB_META,
  QUESTIONS3,
  computeResult3,
  crossCheck3,
  TEXTS3,
  linkText3,
  flatText3,
  crossCheckText3,
} from "@/lib/chapter3";
import {
  QUESTIONS4,
  computeResult4,
  levelOf4,
  TEXTS4_A,
  TEXTS4_B,
  QUADRANTS,
  crossCheck4,
  crossCheckText4,
} from "@/lib/chapter4";
import {
  DRIVERS,
  DRIVER_META,
  QUESTIONS5,
  FALSIFICATION_ID,
  falsificationQuestion,
  computeResult5,
  isComplete5,
  driverLevel,
  densityLevel,
  TEXTS5,
  DENSITY_TEXTS,
  falsificationText,
  directionLine,
  crossTexts5,
  flatDriversText,
} from "@/lib/chapter5";
import {
  SUBSCALES,
  SUB_META,
  QUESTIONS6,
  CONTRADICTION_ID,
  contradictionQuestion,
  computeResult6,
  SCALE6_LEFT,
  SCALE6_RIGHT,
  ANTI_TEXTS,
  ANTI_FOOTER,
  contradictionText6,
  consistencyText6,
} from "@/lib/chapter6";
import { narrowDirections, focusCount, narrowingHistory } from "@/lib/directions";
import {
  CONSTRAINTS,
  CONSTRAINT_META,
  QUESTIONS7_MAIN,
  antiScenarioQuestion,
  FINAL_Q7,
  computeResult7,
  isComplete7,
  constraintText,
  scenarioVerbText,
  scenarioDriverText,
  scenarioThinkText,
  scenarioAntiText,
  buildFinalProfile,
} from "@/lib/chapter7";

/* ------------------------------------------------------------------ */
/*  Токены                                                             */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#F2F2F7",
  bgCard: "#FFFFFF",
  bgDeep: "#FFFFFF",
  bgInput: "#FFFFFF",
  bgInset: "#E5E5EA",
  surface: "#FFFFFF",
  surfaceUp: "#F2F2F7",
  line: "rgba(60,60,67,0.12)",
  lineSoft: "rgba(60,60,67,0.06)",
  text: "#1C1C1E",
  textSec: "#3A3A3C",
  dim: "#6D6D72",
  faint: "#AEAEB2",
  accent: "#007AFF",
  accentDim: "rgba(0,122,255,0.10)",
  poleL: "#FF6B6B",
  poleS: "#007AFF",
  poleM: "#FF9500",
  poleO: "#AF52DE",
  shadow: "0 2px 12px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.10)",
};

const SERIF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SANS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

const POLES = {
  L: { key: "L", letter: "Л", name: "Люди", to: "к людям", thanks: "за то, что ты понимаешь людей", color: C.poleL },
  S: { key: "S", letter: "С", name: "Системы", to: "к системам и логике", thanks: "за то, что ты разбираешься в сложном", color: C.poleS },
  M: { key: "M", letter: "М", name: "Материя", to: "к тому, что можно сделать руками", thanks: "за то, что ты берёшь и делаешь", color: C.poleM },
  O: { key: "O", letter: "О", name: "Образы", to: "к идеям и форме", thanks: "за то, что ты умеешь объяснять", color: C.poleO },
};
const ORDER = ["L", "S", "M", "O"];

/* ------------------------------------------------------------------ */
/*  Вопросы                                                            */
/* ------------------------------------------------------------------ */

const QUESTIONS = [
  {
    id: "q1",
    kind: "single",
    weight: 0.8,
    text: "Ты оказался в гостях у человека, который вышел из комнаты. Что первое привлекает внимание?",
    options: [
      { id: "a", label: "Замечаю книги, фотографии, детали — пытаюсь понять, что это за человек", score: { O: 3, L: 1 } },
      { id: "b", label: "Смотрю, как всё устроено: где что лежит, как организовано пространство", score: { S: 3, M: 1 } },
      { id: "c", label: "Беру незнакомую вещь и начинаю разбираться, как она работает", score: { M: 3, S: 1 } },
      { id: "d", label: "Рассматриваю фотографии и думаю, какие истории стоят за этими людьми", score: { L: 3, O: 1 } },
    ],
  },
  {
    id: "q2",
    kind: "rank",
    weight: 1.0,
    tag: "по порядку",
    text: "Тебе подарили возможность пройти любой курс. Что выберешь первым?",
    hint: "Нажимай по порядку — сначала самое интересное. Нажми ещё раз, чтобы снять.",
    items: [
      { id: "l", label: "🧠 Научиться понимать людей: почему они думают и поступают именно так", pole: "L" },
      { id: "s", label: "📊 Научиться видеть скрытую логику бизнеса и цифр", pole: "S" },
      { id: "m", label: "🔨 Создать что-то своими руками с нуля", pole: "M" },
      { id: "o", label: "✍️ Научиться создавать тексты, идеи или визуальные образы, которые цепляют людей", pole: "O" },
    ],
    rankPoints: [4, 2, 1, 0],
  },
  {
    id: "q3",
    kind: "single",
    weight: 1.0,
    text: "В команде что-то пошло не так, тебя попросили разобраться. С чего начнёшь?",
    options: [
      { id: "a", label: "Поговорю с людьми отдельно. Часто настоящая причина не звучит вслух", score: { L: 4 } },
      { id: "b", label: "Посмотрю данные и факты. Нужно понять, где именно сломалась система", score: { S: 4 } },
      { id: "c", label: "Пойду туда, где всё происходит, и посмотрю своими глазами", score: { M: 4 } },
      { id: "d", label: "Попрошу каждого описать ситуацию. По словам часто видно больше, чем кажется", score: { O: 4 } },
    ],
  },
  {
    id: "q4",
    kind: "distribute",
    weight: 1.2,
    total: 10,
    tag: "10 баллов",
    text: "У тебя полностью свободный день и никаких обязанностей. Чем ты скорее займёшься?",
    hint: "Распредели 10 баллов между вариантами.",
    items: [
      { pole: "L", label: "👥 Встретиться с людьми, поговорить, обсудить жизнь" },
      { pole: "S", label: "🧩 Разобраться в сложном вопросе, который давно интересовал" },
      { pole: "M", label: "🔧 Что-то сделать руками: собрать, приготовить, починить, изменить" },
      { pole: "O", label: "🎨 Читать, писать, создавать или искать красивые идеи" },
    ],
  },
  {
    id: "q5",
    kind: "single",
    weight: 1.0,
    text: "Какая фраза задела бы тебя сильнее всего?",
    options: [
      { id: "a", label: "«Ты совсем не чувствуешь людей»", score: { L: 4 } },
      { id: "b", label: "«В твоих рассуждениях что-то не сходится»", score: { S: 4 } },
      { id: "c", label: "«Сделано плохо, можно было лучше руками»", score: { M: 4 } },
      { id: "d", label: "«Это невозможно нормально воспринимать, ты плохо объяснил»", score: { O: 4 } },
    ],
  },
  {
    id: "q6",
    kind: "single",
    weight: 1.0,
    text: "Тебе дали месяц на большой проект. Делай что хочешь. Какой результат заставит сказать: «Вот это было не зря»?",
    options: [
      { id: "a", label: "Человек начал жить иначе и поблагодарил тебя за это", score: { L: 4 } },
      { id: "b", label: "Появилась система, которая продолжает работать без меня", score: { S: 4 } },
      { id: "c", label: "Остался реальный результат, который можно увидеть и потрогать", score: { M: 4 } },
      { id: "d", label: "Появилась идея или объяснение, после которого люди всё поняли", score: { O: 4 } },
    ],
  },
  {
    id: "q7",
    kind: "single",
    weight: 0.9,
    text: "Ты случайно завис в телефоне на 40 минут. На чём скорее всего?",
    options: [
      { id: "a", label: "Истории людей, обсуждения, комментарии, чужой опыт", score: { L: 3 } },
      { id: "b", label: "Разборы: как что-то устроено, почему работает именно так", score: { S: 3 } },
      { id: "c", label: "Видео, где кто-то создаёт что-то руками от начала до конца", score: { M: 3 } },
      { id: "d", label: "Красивые кадры, дизайн, необычные идеи", score: { O: 3 } },
    ],
  },
  {
    id: "q8",
    kind: "scale",
    weight: 1.0,
    pole: "L",
    tag: "насколько это про тебя",
    text: "Я часто замечаю, что человек изменил настроение, ещё до того, как он сам это сказал.",
  },
  {
    id: "q9",
    kind: "scale",
    weight: 1.0,
    pole: "S",
    tag: "насколько это про тебя",
    text: "Мне нравится доводить до идеала вещи, где важна точность и каждая деталь имеет значение.",
  },
  {
    id: "q10",
    kind: "scale",
    weight: 1.0,
    pole: "M",
    reverse: true,
    tag: "насколько это про тебя",
    text: "Мне легко жить без того, чтобы что-то создавать или делать руками.",
  },
  {
    id: "q11",
    kind: "single",
    weight: 1.0,
    control: true,
    tag: "последний вопрос",
    text: "За что тебя чаще всего благодарили в жизни?",
    options: [
      { id: "a", label: "Друг пришёл с личной проблемой, и после разговора с тобой ему стало легче и понятнее, что делать", score: { L: 4 } },
      { id: "b", label: "Кто-то столкнулся с запутанной проблемой, а ты разобрался, где ошибка и как её решить", score: { S: 4 } },
      { id: "c", label: "Нужно было что-то сделать: починить, собрать, приготовить или организовать — и ты взял это на себя", score: { M: 4 } },
      { id: "d", label: "Кто-то не понимал сложную тему, а ты объяснил простыми словами, и всё наконец стало ясно", score: { O: 4 } },
    ],
  },
];

const IPSATIVE_IDS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

/* ------------------------------------------------------------------ */
/*  Тексты                                                             */
/* ------------------------------------------------------------------ */

const TEXTS = {
  L: {
    high: {
      title: "Ты замечаешь человека раньше, чем проблему",
      body: "Твой главный рабочий материал — люди: их состояние, мотивация, реакции и то, что часто остаётся между словами. Ты быстро считываешь атмосферу, замечаешь, когда человек что-то недоговаривает или когда за внешним поведением скрывается совсем другая причина.",
      life: "Ты выходишь со встречи и примерно понимаешь, кто действительно согласен, кто сомневается, а кто просто промолчал.",
      power: "Там, где другие видят только задачу, ты видишь ещё и людей вокруг неё. А большинство проблем в командах возникают не из-за самой задачи, а из-за того, как люди взаимодействуют между собой.",
      watch: "Твоя способность понимать людей может легко превратиться в привычку постоянно помогать всем вокруг. Важно отличать профессиональную работу с людьми от бесплатного эмоционального спасательства. Твоё поле — не просто «быть хорошим человеком», а использовать понимание людей как инструмент: переговоры, обучение, исследования, управление, развитие команд.",
    },
    mid: {
      title: "Люди тебе интересны, но тебе нужен баланс",
      body: "Ты хорошо взаимодействуешь с людьми, понимаешь их и можешь находить общий язык — но постоянный контакт не является твоим главным источником энергии. Тебе комфортно работать с людьми, когда у общения есть цель: решить задачу, создать что-то вместе, договориться.",
      life: "Ты можешь провести весь день на встречах и переговорах, но потом тебе хочется побыть одному и восстановить силы.",
      power: "Ты умеешь работать там, где люди являются частью процесса, но не обязаны быть главным содержанием каждого дня.",
      watch: "Тебе могут не подойти роли, где весь день состоит только из общения, поддержки и постоянной включённости в чужие эмоции. Ты можешь устать не от людей, а от отсутствия пространства для себя.",
    },
    low: {
      title: "Люди — не твой основной материал",
      body: "Это не значит, что ты плохо понимаешь людей. Просто чужие эмоции, мотивация и отношения редко становятся тем, что тебя по-настоящему захватывает. Тебе обычно интереснее разобраться в задаче, создать что-то конкретное или найти решение проблемы.",
      life: "Когда обсуждение долго идёт вокруг чувств и мнений, у тебя может появиться мысль: «Хорошо, а что мы конкретно будем делать?»",
      power: "Ты умеешь держать фокус на результате и не теряешься в групповой динамике.",
      watch: "Осторожнее с ролями, где главный результат — изменить состояние другого человека: постоянные продажи, поддержка, консультирование, часть HR-направлений. Это не про отсутствие эмпатии. Просто там, где другим интересно разбираться в людях часами, тебе может потребоваться больше энергии.",
    },
  },
  S: {
    high: {
      title: "Ты замечаешь, где система даёт сбой",
      body: "Твой рабочий материал — устройство вещей: правила, процессы, данные, связи между элементами. Тебе интересно не просто получить ответ, а понять, почему это работает именно так. Ты разбираешься не из тревоги, а из любопытства: система, которую удалось понять, сама по себе приносит удовольствие.",
      life: "Ты можешь открыть настройки программы не потому, что что-то сломалось, а просто потому что интересно узнать, какие возможности там спрятаны.",
      power: "Ты находишь причины там, где другие видят только последствия. Именно поэтому такие люди часто становятся теми, кто улучшает процессы и делает сложное проще.",
      watch: "Иногда можно слишком долго улучшать уже работающую систему. Периодически спрашивай себя: «Эта сложность действительно кому-то нужна или я просто увлёкся настройкой?»",
    },
    mid: {
      title: "Ты умеешь разбираться в системах, но не живёшь ими",
      body: "Ты способен понять сложную структуру, разобраться в правилах и навести порядок, когда это необходимо. Но сам процесс изучения системы редко является целью.",
      life: "Ты можешь сделать идеальную таблицу для планирования поездки, но после этого с удовольствием закроешь её и больше не будешь смотреть.",
      power: "Ты понимаешь логику процессов, но не становишься их заложником. Это полезно там, где нужно соединять разные стороны.",
      watch: "Тебе могут подойти роли, где системность помогает достигать результата, но не является всей работой: управление проектами, продукт, аналитика с людьми, координация.",
    },
    low: {
      title: "Разбираться ради разбора — не твоё",
      body: "Тебя обычно интересует не то, как устроен механизм внутри, а то, что можно получить с его помощью. Долгие правила, инструкции и попытки идеально настроить процесс могут быстро утомлять.",
      life: "Ты сначала пробуешь сделать сам, а инструкцию открываешь уже тогда, когда что-то пошло не так.",
      power: "Ты не застреваешь в подготовке и способен двигаться вперёд даже без идеальной схемы.",
      watch: "Работа, где нужно постоянно следить за деталями, регламентами и точностью каждого шага, может забирать больше энергии, чем давать. Тебе чаще подходят роли, где важнее действие, результат и движение, чем поддержание сложной системы.",
    },
  },
  M: {
    high: {
      title: "Тебе важно видеть результат",
      body: "Тебе нужен след от работы. Не просто закрытая задача в компьютере, а что-то, что реально появилось благодаря тебе. Ты любишь ощущение «я сделал это». Это может быть вещь, пространство, тело, продукт — любой результат, сделанный руками.",
      life: "После дня за экраном тебе хочется что-то приготовить, починить или переставить — и только тогда день ощущается прожитым.",
      power: "Ты доводишь работу до состояния «готово», а не «в целом сделано».",
      watch: "Не считай работу руками менее ценной. Мир держится не только на идеях, но и на людях, которые превращают идеи в реальность.",
    },
    mid: {
      title: "Тебе важно физическое, но живёшь ты не им",
      body: "Тебе нужен контакт с материальным, чтобы восстанавливаться, — но скорее как опора и хобби, чем как профессия.",
      life: "Мастерская, спорт или готовка на выходных возвращают тебя в рабочее состояние на всю неделю.",
      power: "У тебя есть встроенный способ разгружаться, который не требует ни от кого разрешения.",
      watch: "Ищи работу, где хотя бы иногда есть выход в физическое: выезды, съёмки, объекты, живые события. Полностью экранная роль будет подтачивать тебя медленно и незаметно.",
    },
    low: {
      title: "Тебе неважно, в какой форме результат",
      body: "Тебе не нужно, чтобы у результата были вес и объём. Он может быть текстом, схемой, договорённостью — главное, что он работает.",
      life: "Ты спокойно живёшь с тем, что итог года — это папка файлов, и не чувствуешь по этому поводу пустоты.",
      power: "Ты не привязан к месту, инструментам и оборудованию.",
      watch: "Просто следи за телом отдельно. Если работа не даёт никакой физической нагрузки, её придётся организовывать себе специально.",
    },
  },
  O: {
    high: {
      title: "Ты превращаешь идеи в понятную форму",
      body: "Для тебя важно не только что сказать, но и как это выглядит и ощущается. Ты замечаешь плохую формулировку, скучную подачу или красивое решение там, где другие проходят мимо.",
      life: "Ты переписываешь короткое сообщение несколько раз не из-за смысла — смысл был готов сразу — а потому что звучит не так.",
      power: "Ты делаешь сложное понятным, а обычное — интересным.",
      watch: "Есть ловушка: можно слишком долго улучшать форму и забывать про результат. Красота становится силой, когда помогает людям понять, почувствовать или сделать действие.",
    },
    mid: {
      title: "Ты замечаешь форму, но не считаешь её главным",
      body: "Ты видишь разницу между аккуратно сделанным и небрежным и раздражаешься на второе — но тратить на это половину рабочего времени не готов.",
      life: "Ты поправишь заголовок в чужой презентации, но не станешь переделывать всю вёрстку.",
      power: "Ты умеешь останавливаться на «достаточно хорошо», и это экономит годы.",
      watch: "Тебе подходят роли, где форма — часть качества, а не отдельная профессия.",
    },
    low: {
      title: "Форма для тебя — обёртка",
      body: "Тебя интересует, что внутри и работает ли оно. Разговоры про подачу, тон и оформление кажутся тебе второстепенными — и в своей области ты часто прав.",
      life: "Ты отправляешь письмо с первой формулировки и больше к нему не возвращаешься.",
      power: "Ты не застреваешь в полировке и выпускаешь то, что другие ещё доводят.",
      watch: "Работу оценивают в том числе по подаче, и это часть задачи, а не несправедливость. Не обязательно любить эту часть — достаточно найти того, кто её закроет.",
    },
  },
};

/* связки: ведущее направление + сильное второе */
const LINKS = {
  LS: {
    title: "Ты понимаешь людей и видишь, как всё устроено",
    body: "Ты замечаешь не только эмоции и поведение людей, но и понимаешь, в какой системе они находятся и почему возникают проблемы. Поэтому ты часто видишь настоящую причину конфликта ещё до того, как остальные начинают искать виноватых.",
    where: "Управление командами, операционная деятельность, HR, исследование пользователей, организационное развитие, продуктовые команды.",
  },
  LM: {
    title: "Тебе нужны и люди, и живое дело рядом",
    body: "Разговор в пустой переговорной даётся тебе тяжелее, чем тот же разговор там, где что-то реально происходит. Тебе важно, чтобы у общения был физический контекст: площадка, зал, мастерская, событие.",
    where: "Тренерство, реабилитация, организация событий, гостеприимство, работа с командами на производстве, полевые исследования.",
  },
  LO: {
    title: "Ты объясняешь людям их самих",
    body: "Ты понимаешь, что происходит с человеком, и умеешь подобрать слова, после которых он понимает это тоже. Первое без второго остаётся у тебя в голове, второе без первого получается красиво, но мимо.",
    where: "Обучение и наставничество, психология, интервью, публичные выступления, бренд-коммуникация.",
  },
  SL: {
    title: "Ты чинишь систему, помня, что в ней живут люди",
    body: "Для тебя первично устройство процесса, а люди — та среда, в которой оно должно заработать. Ты видишь и схему, и причину, по которой её обходят стороной, — а обычно эти два зрения не совпадают в одной голове.",
    where: "Операционное управление, внедрение процессов, продуктовая аналитика, организационный дизайн, консалтинг.",
  },
  SM: {
    title: "Ты доводишь схему до реального воплощения",
    body: "Тебе мало, чтобы решение было верным на бумаге. Оно должно работать в материале, где всё сложнее, грязнее и с допусками.",
    where: "Инженерия, производство и качество, логистика, лаборатория, эксплуатация, автоматизация.",
  },
  SO: {
    title: "Ты превращаешь сложное в понятное",
    body: "Ты умеешь не только разобраться в сложной теме, но и объяснить её так, чтобы понял почти любой человек. Многие хорошо анализируют. Многие умеют красиво говорить. Но сочетание этих двух качеств встречается намного реже — именно поэтому оно так ценно.",
    where: "Продукт, бизнес-аналитика, техническое письмо, образование, консалтинг, создание сложных продуктов, которые должны понимать обычные люди.",
  },
  ML: {
    title: "Ты делаешь руками — и рядом всегда кто-то учится",
    body: "Руки для тебя первичны, но в одиночной мастерской быстро становится глухо. Тебе нужен кто-то, кому это передаётся: ученик, команда, зал.",
    where: "Мастер с учениками, кухня, бригада, тренерская работа, сцена и площадка, сервис с личным контактом.",
  },
  MS: {
    title: "Ты собираешь то, что должно работать точно",
    body: "Тебе нужен физический результат, но не любой: он должен быть посчитан и держать допуск. Красиво, но криво — для тебя не сделано.",
    where: "Оборудование, инженерная сборка, прототипирование, реставрация с расчётом, инженерные сети, лаборатория.",
  },
  MO: {
    title: "Ты создаёшь вещи, которые хочется запомнить",
    body: "Для тебя важно не просто сделать работающую вещь. Хочется, чтобы она ещё выглядела красиво, вызывала эмоции или оставляла впечатление. Практичность без идеи кажется тебе скучной. Но и красивая идея без реального воплощения тоже не приносит удовольствия.",
    where: "Промышленный дизайн, архитектура, предметный дизайн, сцена, свет, гастрономия, ремесло, создание физических продуктов.",
  },
  OL: {
    title: "Ты попадаешь словом в человека",
    body: "Форма для тебя не самоцель — ты подбираешь её до тех пор, пока она не срабатывает в конкретной голове. Тебе нужна реакция, а не одобрение вкуса.",
    where: "Сценарий и драматургия, интервью, реклама и бренд, писательство, преподавание.",
  },
  OS: {
    title: "Ты придаёшь форму сложному",
    body: "Ты берёшь то, что запутано по существу, и находишь ему вид, в котором оно становится очевидным. Это не украшение — это работа со структурой через форму.",
    where: "Интерфейсы и продуктовый дизайн, визуализация данных, документация и курсы, инфографика, техническое письмо.",
  },
  OM: {
    title: "Форма, которая существует в материале",
    body: "Тебе важно, как сделано, и важно, чтобы это можно было потрогать. Файл на экране для тебя ещё не результат — результат начинается там, где у формы появляется поверхность.",
    where: "Типографика и печать, керамика и предметный дизайн, сценография и свет, фотография, ремесло.",
  },
};

/* ------------------------------------------------------------------ */
/*  Скоринг                                                            */
/* ------------------------------------------------------------------ */

function computeResult(answers: Record<string, unknown>) {
  const raw = { L: 0, S: 0, M: 0, O: 0 };
  let sumW = 0;

  QUESTIONS.forEach((q) => {
    if (!IPSATIVE_IDS.includes(q.id)) return;
    const a = answers[q.id];
    if (a == null) return;
    sumW += q.weight;

    if (q.kind === "single") {
      const opt = q.options.find((o) => o.id === a);
      if (opt) Object.entries(opt.score).forEach(([p, v]) => (raw[p] += v * q.weight));
    }
    if (q.kind === "rank") {
      a.forEach((itemId, idx) => {
        const item = q.items.find((i) => i.id === itemId);
        if (item) raw[item.pole] += q.rankPoints[idx] * q.weight;
      });
    }
    if (q.kind === "distribute") {
      q.items.forEach((item) => {
        raw[item.pole] += (a[item.pole] || 0) * q.weight;
      });
    }
  });

  const total = ORDER.reduce((s, p) => s + raw[p], 0) || 1;
  const pct = {};
  ORDER.forEach((p) => (pct[p] = (raw[p] / total) * 100));

  const norm = {};
  QUESTIONS.filter((q) => q.kind === "scale").forEach((q) => {
    const a = answers[q.id];
    if (a == null) return;
    const v = q.reverse ? 6 - a : a;
    norm[q.pole] = ((v - 1) / 4) * 100;
  });

  let H = 25 / Math.sqrt(sumW || 1);
  H = Math.max(4, Math.min(25, H));

  const ranked = [...ORDER].sort((a, b) => pct[b] - pct[a]);
  const lead = ranked[0];
  const second = ranked[1];
  const last = ranked[3];
  const flat = pct[lead] < 30;

  const controlOpt = QUESTIONS.find((q) => q.id === "q11").options.find(
    (o) => o.id === answers.q11
  );
  const controlPole = controlOpt ? Object.keys(controlOpt.score)[0] : null;
  const controlGap = controlPole ? ranked.indexOf(controlPole) >= 2 : false;

  const normFlag =
    !flat && norm[lead] != null && pct[lead] >= 35 && norm[lead] < 30 ? lead : null;

  const focus = flat ? 33 : pct[lead] >= 35 ? 24 : 28;

  return { raw, pct, norm, H, sumW, ranked, lead, second, last, flat, controlPole, controlGap, normFlag, focus };
}

function levelOf(v) {
  return v >= 35 ? "high" : v >= 20 ? "mid" : "low";
}

/* ------------------------------------------------------------------ */
/*  Полоса материала — подпись главы                                   */
/* ------------------------------------------------------------------ */

function MaterialBand({ values, feather, height = 64, animate = false }: any) {
  const [t, setT] = useState(animate ? 0 : 1);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animate) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(1);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const cur = ORDER.map((p) => 25 + (values[p] - 25) * t);

  const stops = [];
  let x = 0;
  const f = Math.max(0.6, (feather || 0) / 2);
  ORDER.forEach((p, i) => {
    const w = cur[i];
    const color = POLES[p].color;
    const from = i === 0 ? 0 : Math.min(100, x + f);
    const to = i === ORDER.length - 1 ? 100 : Math.max(0, x + w - f);
    stops.push({ offset: Math.max(0, Math.min(100, from)), color });
    stops.push({ offset: Math.max(0, Math.min(100, Math.max(to, from))), color });
    x += w;
  });

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block", borderRadius: 12 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
            {stops.map((s, i) => (
              <stop key={i} offset={`${s.offset}%`} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="10" fill="url(#band)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Мелкие элементы                                                    */
/* ------------------------------------------------------------------ */

const Eyebrow = ({ children, color }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: color || C.dim,
    }}
  >
    {children}
  </div>
);

function Ticks({ total, done }: any) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 4,
          background: i < done ? C.accent : C.faint,
          transition: "background 300ms ease",
        }} />
      ))}
    </div>
  );
}

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.74)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
};

function Card({ children, style }: any) {
  return (
    <div style={{ ...GLASS, borderRadius: 20, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "solid" }: any) {
  const solid = variant === "solid";
  return (
    <button
      className="tap"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        minHeight: 56,
        borderRadius: 16,
        border: solid ? "none" : "1.5px solid rgba(255,255,255,0.7)",
        background: disabled
          ? "rgba(120,120,128,0.16)"
          : solid
          ? `linear-gradient(180deg, #2B90FF 0%, ${C.accent} 100%)`
          : "rgba(255,255,255,0.62)",
        backdropFilter: solid ? undefined : "blur(20px)",
        WebkitBackdropFilter: solid ? undefined : "blur(20px)",
        color: disabled ? "rgba(60,60,67,0.4)" : solid ? "#fff" : C.accent,
        fontFamily: SANS,
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled
          ? "none"
          : solid
          ? "0 8px 24px rgba(0,122,255,0.28), inset 0 1px 0 rgba(255,255,255,0.25)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вступление                                                  */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Приветственный экран                                               */
/* ------------------------------------------------------------------ */

function Welcome({ onStart, onLogin, user, onProfile }: any) {
  return (
    <div className="scene" style={{
      paddingTop: 72, flex: 1, display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 36 }}>
        {ORDER.map((p: string) => (
          <div key={p} style={{
            width: 34, height: 34, borderRadius: 12,
            background: `linear-gradient(150deg, ${POLES[p].color} 0%, ${POLES[p].color}AA 100%)`,
            boxShadow: `0 6px 18px ${POLES[p].color}55`,
            display: "grid", placeItems: "center",
            fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#fff",
          }}>
            {POLES[p].letter}
          </div>
        ))}
      </div>

      <h1 style={{
        fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, fontWeight: 700,
        letterSpacing: "-0.03em", color: C.text, margin: "0 0 16px",
      }}>
        Твоё поле
      </h1>

      <p style={{
        fontFamily: SANS, fontSize: 18, lineHeight: 1.5,
        color: C.textSec, margin: "0 0 12px",
      }}>
        Шесть коротких глав, которые складываются в портрет: с чем тебе работать,
        что у тебя уже получается и как ты меняешься со временем.
      </p>

      <p style={{
        fontFamily: SANS, fontSize: 15.5, lineHeight: 1.55,
        color: C.dim, margin: "0 0 auto",
      }}>
        Ни одного вопроса про профессии. Первая глава — 11 ситуаций, около трёх минут.
      </p>

      <div style={{ marginTop: 40 }}>
        {user ? (
          <>
            <Button onClick={onProfile}>Открыть мой профиль</Button>
            <div style={{ marginTop: 12 }}>
              <Button variant="ghost" onClick={onStart}>Пройти главу 1 заново</Button>
            </div>
            <p style={{
              fontFamily: SANS, fontSize: 13.5, color: C.dim,
              textAlign: "center" as const, margin: "16px 0 0",
            }}>
              Вошёл как {user.email}
            </p>
          </>
        ) : (
          <>
            <Button onClick={onStart}>Начать тест</Button>
            <div style={{ marginTop: 12 }}>
              <Button variant="ghost" onClick={onLogin}>У меня уже есть аккаунт</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Intro({ onStart, user, onProfile }: any) {
  return (
    <div className="scene" style={{ paddingTop: 56 }}>
      {user && (
        <button
          className="tap"
          onClick={onProfile}
          style={{
            background: "none", border: "none", padding: "0 0 20px",
            color: C.accent, fontFamily: SANS, fontSize: 15, fontWeight: 500,
          }}
        >
          {user.email} · профиль
        </button>
      )}
      <Eyebrow>Глава первая</Eyebrow>
      <h1 style={{
        fontFamily: SERIF, fontSize: 40, lineHeight: 1.08,
        margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.02em", color: C.text,
      }}>
        К чему тебя
        <br />
        тянет
      </h1>

      <div style={{ display: "flex", gap: 8, margin: "28px 0 28px" }}>
        {ORDER.map((p) => (
          <div key={p} style={{
            flex: 1, padding: "10px 4px", borderRadius: 12,
            background: POLES[p].color + "18",
            border: `1.5px solid ${POLES[p].color}40`,
            textAlign: "center" as const,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: POLES[p].color, margin: "0 auto 6px" }} />
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: POLES[p].color }}>{POLES[p].letter}</div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: C.dim, marginTop: 2 }}>{POLES[p].name}</div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: C.textSec, margin: "0 0 16px" }}>
        11 ситуаций. Без вопросов про профессии. За 3 минуты узнаешь, какой тип задач тебе ближе всего —
        люди, идеи, системы или реальные вещи.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 32px" }}>
        Четыре направления делят между собой 100 баллов. Выбирая одно, ты забираешь у остальных —
        поэтому варианта «всё сразу» здесь нет.
      </p>

      <Button onClick={onStart}>Начать</Button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Eyebrow>11 ситуаций · 3 минуты · открывает раздел «твоё поле»</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вступление к главе 2                                        */
/* ------------------------------------------------------------------ */

function Intro2({ onStart, user, onProfile }: any) {
  return (
    <div className="scene" style={{ paddingTop: 56 }}>
      {user && (
        <button
          className="tap"
          onClick={onProfile}
          style={{
            background: "none", border: "none", padding: "0 0 20px",
            color: C.accent, fontFamily: SANS, fontSize: 15, fontWeight: 500,
          }}
        >
          {user.email} · профиль
        </button>
      )}
      <Eyebrow>Глава вторая · 17%</Eyebrow>
      <h1 style={{
        fontFamily: SERIF, fontSize: 40, lineHeight: 1.08,
        margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.02em", color: C.text,
      }}>
        За что тебя
        <br />
        уже хвалили
      </h1>

      <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: C.textSec, margin: "28px 0 16px" }}>
        Девять вопросов про то, что уже случилось. Не про мечты — про факты.
        Это самый честный блок во всей линейке.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 32px" }}>
        Глава 1 спросила, куда тянется. Эта глава спрашивает, что уже получалось.
        Мы сверим одно с другим — и покажем, совпадают они или нет.
      </p>

      <Button onClick={onStart}>Начать</Button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Eyebrow>9 вопросов · 2–3 минуты · открывает «твой проверенный фундамент»</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вопрос                                                      */
/* ------------------------------------------------------------------ */

function QuestionScreen({ q, index, total, answer, onAnswer, onBack, onNext }: any) {
  const totalCount = total || QUESTIONS.length;
  const left = totalCount - index - 1;
  const secs = left * 16;
  const minutesLeft =
    secs >= 90 ? `${Math.round(secs / 60)} мин` : secs >= 45 ? "около минуты" : "меньше минуты";

  const anySelected = answer != null;
  const optionStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    textAlign: "left" as const,
    background: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.68)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: `1.5px solid ${active ? C.accent : "rgba(255,255,255,0.65)"}`,
    borderRadius: 18,
    padding: "18px 20px",
    color: C.text,
    fontFamily: SANS,
    fontSize: 16,
    lineHeight: 1.45,
    cursor: "pointer",
    display: "flex",
    gap: 14,
    alignItems: "center",
    transform: active ? "scale(1.015)" : "scale(1)",
    opacity: anySelected && !active ? 0.55 : 1,
    boxShadow: active
      ? `0 10px 30px rgba(0,122,255,0.22), inset 0 1px 0 rgba(255,255,255,0.9)`
      : "0 6px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
    transition: "transform 200ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background 200ms ease",
  });

  return (
    <div className="scene" style={{ paddingTop: 24 }}>
      <Ticks total={totalCount} done={index} />
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginTop: 16,
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
            {index + 1}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 15, color: C.dim }}>
            из {totalCount}
          </span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 14, color: C.dim }}>
          {left <= 0 ? "последний вопрос" : left === 1 ? "остался один" : `осталось ${minutesLeft}`}
        </span>
      </div>

      {q.tag && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: C.accentDim,
          border: `1px solid ${C.accent}33`,
          borderRadius: 12,
          padding: "10px 14px",
          margin: "0 0 14px",
        }}>
          <span aria-hidden style={{
            width: 6, height: 6, borderRadius: 3, background: C.accent, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: SANS,
            fontSize: 14.5,
            lineHeight: 1.4,
            fontWeight: 600,
            color: C.accent,
          }}>
            {q.tag}
          </span>
        </div>
      )}
      <h2 style={{
        fontFamily: SERIF, fontSize: 24, lineHeight: 1.3,
        fontWeight: 700, margin: "0 0 8px", color: C.text,
      }}>
        {q.kind === "scale" ? `«${q.text}»` : q.text}
      </h2>
      {q.hint && (
        <p style={{ fontFamily: SANS, fontSize: 15, color: C.textSec, fontWeight: 500, margin: "0 0 4px", lineHeight: 1.5 }}>
          {q.hint}
        </p>
      )}

      <div
        role={q.kind === "single" || q.kind === "single4" || q.kind === "single4ab" ? "radiogroup" : undefined}
        aria-label={q.kind === "single" || q.kind === "single4" || q.kind === "single4ab" ? q.text : undefined}
        style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}
      >
        {(q.kind === "single" || q.kind === "single4" || q.kind === "single4ab") &&
          q.options.map((o: any) => {
            const active = answer === o.id;
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={active}
                className="tap"
                style={optionStyle(active)}
                onClick={() => { try { (navigator as any).vibrate?.(8); } catch {} onAnswer(o.id); }}
              >
                <span style={{
                    width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                    border: `2px solid ${active ? C.accent : C.faint}`,
                    background: active ? C.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />}
                  </span>
                <span>{o.label}</span>
              </button>
            );
          })}

        {q.kind === "rank" && (
          <RankQuestion q={q} answer={answer || []} onAnswer={onAnswer} />
        )}

        {q.kind === "distribute" && (
          <DistributeQuestion q={q} answer={answer} onAnswer={onAnswer} />
        )}

        {q.kind === "scale" && (
          <ScaleQuestion
            answer={answer}
            onAnswer={onAnswer}
            leftLabel={q.leftLabel}
            rightLabel={q.rightLabel}
          />
        )}

        {q.kind === "scale6" && (
          <ScaleQuestion
            answer={answer}
            onAnswer={onAnswer}
            leftLabel={SCALE6_LEFT}
            rightLabel={SCALE6_RIGHT}
          />
        )}

        {q.kind === "slider" && (
          <SliderQuestion q={q} answer={answer} onAnswer={onAnswer} />
        )}

        {q.kind === "text" && (
          <TextQuestion answer={answer} onAnswer={onAnswer} />
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
        <button
          className="tap"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: C.accent,
            fontFamily: SANS,
            fontSize: 17,
            fontWeight: 500,
            padding: "12px 4px",
            cursor: "pointer",
          }}
        >
          Назад
        </button>
        <div style={{ flex: 1 }}>
          <Button onClick={onNext} disabled={!isComplete(q, answer)}>
            {index === totalCount - 1 ? "Показать результат" : "Дальше"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function isComplete(q, a) {
  if (q.kind === "text") return true; // необязательный свободный вопрос, не блокирует «Дальше»
  if (a == null) return false;
  if (q.kind === "rank") return a.length === q.items.length;
  if (q.kind === "distribute") {
    const poles = q.items.map((i) => i.pole);
    return poles.reduce((s, p) => s + (a[p] || 0), 0) === q.total;
  }
  return true;
}

function RankQuestion({ q, answer, onAnswer }: any) {
  const toggle = (id) => {
    if (answer.includes(id)) onAnswer(answer.filter((x) => x !== id));
    else onAnswer([...answer, id]);
  };
  return (
    <>
      {q.items.map((item) => {
        const pos = answer.indexOf(item.id);
        const active = pos >= 0;
        const color = POLES[item.pole].color;
        return (
          <button
            key={item.id}
            aria-pressed={active}
            aria-label={active ? `${item.label}, выбрано на месте ${pos + 1}` : item.label}
            className="tap"
            onClick={() => toggle(item.id)}
            style={{
              width: "100%", textAlign: "left" as const,
              background: active ? C.accentDim : C.bgCard,
              border: `1.5px solid ${active ? C.accent : C.line}`,
              borderRadius: 14, padding: "16px 18px",
              color: C.text, fontFamily: SANS, fontSize: 16, lineHeight: 1.4,
              cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
              boxShadow: active ? "none" : C.shadow,
              transition: "all 150ms ease",
            }}
          >
            <span
              style={{
                width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                display: "grid", placeItems: "center",
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                background: active ? C.accent : "transparent",
                color: active ? "#fff" : C.faint,
                border: active ? "none" : `2px dashed ${C.faint}`,
              }}
            >
              {active ? pos + 1 : ""}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em", marginTop: 2 }}>
        {answer.length < q.items.length
          ? `выбрано ${answer.length} из ${q.items.length} · нажми ещё раз, чтобы снять`
          : "порядок задан"}
      </div>
    </>
  );
}

function DistributeQuestion({ q, answer, onAnswer }: any) {
  const poles = q.items.map((i) => i.pole);
  const val = answer || poles.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
  const used = poles.reduce((s, p) => s + (val[p] || 0), 0);
  const left = q.total - used;

  const set = (pole, delta) => {
    const next = { ...val };
    const nv = (next[pole] || 0) + delta;
    if (nv < 0 || (delta > 0 && left <= 0)) return;
    next[pole] = nv;
    onAnswer(next);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 34, color: left === 0 ? C.faint : C.text }}>
          {left}
        </span>
        <Eyebrow>{left === 0 ? "всё распределено" : "очков осталось"}</Eyebrow>
      </div>

      {q.items.map((item) => {
        const meta = POLES[item.pole] || VERB_META[item.pole] || DRIVER_META[item.pole];
        const color = meta.color;
        const v = val[item.pole] || 0;
        return (
          <div
            key={item.pole}
            style={{
              background: C.bgCard, boxShadow: C.shadow,
              border: `1.5px solid ${v > 0 ? color : C.line}`,
              borderRadius: 14,
              padding: "14px 14px 14px 18px",
              display: "flex", alignItems: "center", gap: 12,
              transition: "border-color 150ms ease",
            }}
          >
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 15, lineHeight: 1.4 }}>
              {item.label}
            </span>
            <button
              className="tap"
              onClick={() => set(item.pole, -1)}
              aria-label="убрать очко"
              style={stepBtn(v > 0)}
            >
              −
            </button>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 17,
                width: 22,
                textAlign: "center",
                color: v > 0 ? color : C.faint,
              }}
            >
              {v}
            </span>
            <button
              className="tap"
              onClick={() => set(item.pole, 1)}
              aria-label="добавить очко"
              style={stepBtn(left > 0)}
            >
              +
            </button>
          </div>
        );
      })}
    </>
  );
}

const stepBtn = (enabled: boolean): React.CSSProperties => ({
  width: 44, height: 44, flexShrink: 0, borderRadius: 12,
  border: `1.5px solid ${enabled ? C.accent : C.faint}`,
  background: enabled ? C.accentDim : "transparent",
  color: enabled ? C.accent : C.faint,
  fontSize: 20, lineHeight: "1",
  cursor: enabled ? "pointer" : "default",
  fontFamily: SANS,
  display: "flex", alignItems: "center", justifyContent: "center",
});

function ScaleQuestion({ answer, onAnswer, leftLabel, rightLabel }: any) {
  return (
    <>
      <div role="radiogroup" aria-label="Насколько это про тебя" style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = answer === n;
          return (
            <button
              key={n}
              role="radio"
              aria-checked={active}
              aria-label={`${n} из 5`}
              className="tap"
              onClick={() => onAnswer(n)}
              style={{
                flex: 1,
                height: 58,
                borderRadius: 14,
                border: `1px solid ${active ? "rgba(255,255,255,0.3)" : C.line}`,
                background: active ? C.text : C.surface,
                color: active ? C.bgDeep : C.dim,
                fontFamily: MONO,
                fontSize: 16,
                cursor: "pointer",
                transition: "all 140ms ease",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSec, fontWeight: 500, flex: 1 }}>
          {leftLabel || "совсем не про меня"}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSec, fontWeight: 500, flex: 1, textAlign: "right" }}>
          {rightLabel || "очень похоже на меня"}
        </span>
      </div>
    </>
  );
}

function SliderQuestion({ q, answer, onAnswer }: any) {
  const v = answer == null ? 50 : answer;
  return (
    <>
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => onAnswer(Number(e.target.value))}
        aria-label={q.text}
        style={{ width: "100%", accentColor: C.accent, height: 32 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSec, fontWeight: 500 }}>{q.leftLabel}</span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSec, fontWeight: 500 }}>{q.midLabel}</span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSec, fontWeight: 500 }}>{q.rightLabel}</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 15, color: C.accent }}>
          {answer == null ? "подвинь ползунок" : v}
        </span>
      </div>
    </>
  );
}

function TextQuestion({ answer, onAnswer }: any) {
  return (
    <>
      <textarea
        value={(answer as string) || ""}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Необязательно — но если хочешь, напиши пару слов"
        rows={5}
        style={{
          width: "100%",
          background: C.bgCard,
          border: `1.5px solid ${C.line}`,
          borderRadius: 14,
          padding: "14px 16px",
          color: C.text,
          fontFamily: SANS,
          fontSize: 16,
          lineHeight: 1.5,
          resize: "vertical" as const,
          boxShadow: C.shadow,
        }}
      />
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.08em", marginTop: 6 }}>
        не влияет на результат · можно пропустить
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат                                                   */
/* ------------------------------------------------------------------ */

function PoleRow({ pole, value, H }: any) {
  const p = POLES[pole];
  const from = Math.max(0, value - H / 2);
  const to = Math.min(100, value + H / 2);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: p.color,
          color: C.bgDeep,
          display: "grid",
          placeItems: "center",
          fontFamily: SERIF,
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {p.letter}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, marginBottom: 6 }}>{p.name}</div>
        <div
          style={{
            position: "relative",
            height: 6,
            borderRadius: 3,
            background: C.faint,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${from}%`,
              width: `${to - from}%`,
              top: 0,
              bottom: 0,
              borderRadius: 3,
              background: p.color,
              opacity: 0.45,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `calc(${value}% - 1px)`,
              width: 2,
              top: -3,
              bottom: -3,
              background: p.color,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: 15, width: 34, textAlign: "right", color: C.text }}>
        {Math.round(value)}
      </span>
    </div>
  );
}

function TextBlock({ t, accent, compact }: any) {
  return (
    <Card style={{ borderLeft: `3px solid ${accent}` }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, fontWeight: 700, margin: "0 0 12px", color: C.text }}>
        {t.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: C.textSec, margin: 0 }}>{t.body}</p>
      {!compact && t.life && <Detail label="В жизни" text={t.life} />}
      {!compact && t.power && <Detail label="Твоя сила" text={t.power} />}
      {t.watch && <Detail label="На что смотреть" text={t.watch} />}
    </Card>
  );
}

function Detail({ label, text }: any) {
  return (
    <div style={{ marginTop: 16 }}>
      <Eyebrow>{label}</Eyebrow>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "6px 0 0", whiteSpace: "pre-line" }}>
        {text}
      </p>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Скачивание результата (.doc — открывается в Word и Google Docs)     */
/* ------------------------------------------------------------------ */

function buildResultDoc(res: any, name?: string) {
  const lead = POLES[res.lead];
  const t = TEXTS[res.lead][levelOf(res.pct[res.lead])];
  const second = POLES[res.second];
  const link = LINKS[res.lead + res.second];
  const strongSecond = res.pct[res.second] >= 25;
  const last = POLES[res.last];
  const tLast = TEXTS[res.last][levelOf(res.pct[res.last])];
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const esc = (s: string) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows = res.ranked
    .map(
      (p: string) =>
        `<tr><td style="padding:6px 16px 6px 0;"><b>${POLES[p].name}</b></td>` +
        `<td style="padding:6px 0;">${Math.round(res.pct[p])} из 100</td></tr>`
    )
    .join("");

  const section = (title: string, body: string) =>
    body ? `<p style="margin:14px 0 4px;"><b>${esc(title)}</b></p><p style="margin:0;">${esc(body)}</p>` : "";

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Твоё поле</title></head>
<body style="font-family:Georgia,serif; font-size:12pt; line-height:1.6; color:#1C1C1E;">
  <h1 style="font-size:24pt; margin:0 0 4px;">Твоё поле</h1>
  <p style="margin:0 0 24px; color:#6D6D72;">
    Глава 1 — «К чему тебя тянет»${name ? ` · ${esc(name)}` : ""} · ${today}
  </p>

  <h2 style="font-size:16pt; margin:0 0 8px;">Ведущее направление: ${esc(lead.name)}</h2>
  <table style="margin:0 0 20px; border-collapse:collapse;">${rows}</table>

  <h2 style="font-size:15pt; margin:24px 0 8px;">${esc(t.title)}</h2>
  <p style="margin:0;">${esc(t.body)}</p>
  ${section("В жизни", t.life)}
  ${section("Твоя сила", t.power)}
  ${section("На что смотреть", t.watch)}

  ${
    strongSecond && link
      ? `<h2 style="font-size:15pt; margin:28px 0 8px;">Связка: ${esc(lead.letter)} + ${esc(second.letter)} — ${esc(link.title)}</h2>
         <p style="margin:0;">${esc(link.body)}</p>
         <p style="margin:12px 0 0;"><b>Куда смотреть:</b> ${esc(link.where)}</p>`
      : ""
  }

  <h2 style="font-size:15pt; margin:28px 0 8px;">Что отпало: ${esc(last.name)}</h2>
  <p style="margin:0;">${esc(tLast.body)}</p>
  ${section("На что смотреть", tLast.watch)}

  <p style="margin:32px 0 0; color:#6D6D72; font-size:10pt;">
    Это первый замер. Следующие главы уточнят картину — она не поменяется целиком, но станет резче.
  </p>
</body></html>`;

  return html;
}

function downloadResult(res: any, name?: string) {
  try {
    const html = buildResultDoc(res, name);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tvoyo-pole-glava-1.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error("download failed", e);
  }
}

function Result({ res, onNext, onRestart, saved, onBack }: any) {
  const [details, setDetails] = useState(false);
  const isDebug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";
  const lead = POLES[res.lead];
  const second = POLES[res.second];
  const strongSecond = res.pct[res.second] >= 25;
  const link = LINKS[res.lead + res.second];

  const headline =
    res.H > 9
      ? `Похоже, твоё поле — ${lead.name.toLowerCase()}`
      : res.H >= 6
      ? `Судя по всему, твоё поле — ${lead.name.toLowerCase()}`
      : `Твоё поле — ${lead.name.toLowerCase()}`;

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      {onBack && (
        <button
          className="tap"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: C.faint,
            fontFamily: SANS,
            fontSize: 15,
            padding: "0 0 18px",
            cursor: "pointer",
          }}
        >
          ← Назад
        </button>
      )}
      <Eyebrow>Глава 1 пройдена · первый замер</Eyebrow>

      {!res.flat && (
        <div style={{
          position: "relative",
          marginTop: 16,
          marginBottom: 8,
          borderRadius: 24,
          padding: "32px 24px 28px",
          overflow: "hidden",
          background: `linear-gradient(160deg, ${lead.color}1F 0%, rgba(255,255,255,0.72) 70%)`,
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 14px 44px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}>
          <span aria-hidden style={{
            position: "absolute",
            right: -18,
            bottom: -64,
            fontFamily: SERIF,
            fontSize: 220,
            fontWeight: 800,
            lineHeight: 1,
            color: lead.color,
            opacity: 0.16,
            letterSpacing: "-0.04em",
            pointerEvents: "none",
          }}>
            {lead.letter}
          </span>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: lead.color, marginBottom: 6 }}>
              Твоё ведущее направление
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: 34, fontWeight: 700,
              letterSpacing: "-0.025em", color: C.text, lineHeight: 1.1,
            }}>
              {lead.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
              <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: lead.color, letterSpacing: "-0.03em" }}>
                {Math.round(res.pct[res.lead])}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 16, color: C.dim }}>из 100</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, margin: "16px 0 16px" }}>
        {res.ranked.map((p: string, i: number) => (
          <div key={p} style={{
            flex: i === 0 ? 2 : 1,
            padding: "12px 4px",
            borderRadius: 12,
            background: POLES[p].color + (i === 0 ? "20" : "10"),
            border: `1.5px solid ${POLES[p].color}${i === 0 ? "60" : "30"}`,
            textAlign: "center" as const,
            transition: "flex 600ms ease",
          }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: POLES[p].color }}>
              {POLES[p].letter}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: POLES[p].color, opacity: 0.8, marginTop: 2 }}>
              {Math.round(res.pct[p])}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ marginTop: 4 }}>
          {res.ranked.map((p) => (
            <PoleRow key={p} pole={p} value={res.pct[p]} H={res.H} />
          ))}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13, color: C.faint, lineHeight: 1.5, marginTop: 10 }}>
          Это первый замер, поэтому у каждой оценки есть допуск примерно ±{Math.round(res.H / 2)} пунктов.
          Следующие главы его сузят.
        </p>
      </div>

      {res.flat ? (
        <TextBlock
          accent={C.dim}
          t={{
            title: "Похоже, ты пока не выбрал своё поле",
            body: "Сейчас ни одно направление не выделилось достаточно сильно. И это совсем не означает, что тест не сработал. Обычно такое бывает по двум причинам. Первая — ты действительно человек на стыке нескольких направлений и одинаково комфортно чувствуешь себя в разных типах задач. Вторая — ты пока просто не успел попробовать достаточно разных занятий, поэтому предпочтения ещё не успели проявиться.",
            watch: "Следующая глава поможет понять, какой из этих вариантов ближе к тебе. Она опирается не на предпочтения, а на твой реальный опыт и то, что уже происходило в жизни.",
          }}
        />
      ) : (
        <>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 27,
              lineHeight: 1.2,
              fontWeight: 400,
              margin: "0 0 18px",
            }}
          >
            {headline}
          </h2>
          {res.H > 9 && (
            <p
              style={{
                fontFamily: SANS,
                fontSize: 14.5,
                lineHeight: 1.55,
                color: C.dim,
                margin: "-8px 0 18px",
              }}
            >
              …но рядом идёт второе направление: {second.name.toLowerCase()}. Следующая глава разведёт их.
            </p>
          )}
          <TextBlock t={TEXTS[res.lead][levelOf(res.pct[res.lead])]} accent={lead.color} />
        </>
      )}

      {!res.flat && strongSecond && link && (
        <div style={{ marginTop: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <Eyebrow>Связка · {lead.letter} + {second.letter}</Eyebrow>
          </div>
          <Card
            style={{
              background: `linear-gradient(135deg, ${lead.color}18, ${second.color}18)`,
              border: `1px solid ${C.line}`,
            }}
          >
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                lineHeight: 1.25,
                fontWeight: 400,
                margin: "0 0 12px",
              }}
            >
              {link.title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, margin: 0 }}>{link.body}</p>
            <Detail label="Куда смотреть" text={link.where} />
          </Card>
        </div>
      )}

      {!res.flat && (
        <div style={{ marginTop: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <Eyebrow>Что отпало</Eyebrow>
          </div>
          <TextBlock
            compact
            t={TEXTS[res.last][levelOf(res.pct[res.last])]}
            accent={POLES[res.last].color}
          />
        </div>
      )}

      {res.controlGap && (
        <div style={{ marginTop: 14 }}>
          <Card style={{ background: "rgba(255,255,255,0.04)", borderStyle: "dashed" }}>
            <Eyebrow>Расхождение</Eyebrow>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                lineHeight: 1.25,
                fontWeight: 400,
                margin: "10px 0 12px",
              }}
            >
              Тебя тянет к одному, а ценят за другое
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, margin: 0 }}>
              Получилась интересная картина. По большинству ответов тебя естественно тянет{" "}
              {POLES[res.lead].to}. Но когда люди вспоминают, чем ты был им полезен, чаще благодарят тебя
              совсем за другое — {POLES[res.controlPole].thanks}.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.dim, marginTop: 12 }}>
              Такое встречается намного чаще, чем кажется. Иногда человек настолько легко делает что-то
              хорошо, что перестаёт считать это своей сильной стороной. А иногда наоборот — очень хочет
              заниматься тем, во что пока ещё вложил мало времени.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.dim, marginTop: 12 }}>
              Пока рано делать выводы. Следующая глава как раз проверит это предположение: она покажет,
              что в твоей жизни повторялось снова и снова, независимо от твоих желаний.
            </p>
          </Card>
        </div>
      )}

      {res.normFlag && (
        <div style={{ marginTop: 14 }}>
          <Card style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>Пометка для главы 2</Eyebrow>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "10px 0 0" }}>
              Внутри себя ты ставишь «{POLES[res.normFlag].name.toLowerCase()}» на первое место, но по
              прямым вопросам этот материал у тебя проседает. Обычно это значит, что выбор сделан за
              неимением альтернативы, а не по силе. Глава 2 проверит.
            </p>
          </Card>
        </div>
      )}

      <div
        style={{
          marginTop: 26,
          padding: "22px 20px",
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>{res.focus}</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>
            направлений в фокусе
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 40 → стало {res.focus}
          </div>
        </div>
      </div>

      <p
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 1.5,
          color: C.dim,
          margin: "26px 0 24px",
        }}
      >
        Сейчас мы нашли, какие задачи тебя естественно притягивают. Но это только первая часть. Следующая
        глава проверит другое: за что тебя уже ценят другие люди? Потому что иногда нас тянет в одну
        сторону, а наши реальные сильные стороны уже проявились совсем в другой.
      </p>

      {!saved && !onBack && (
        <div style={{
          ...GLASS,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderLeft: `3px solid ${C.accent}`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 10 }}>
            Сохрани, чтобы не проходить заново
          </div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: C.textSec }}>
            Сейчас результат живёт только на этой странице. Закроешь вкладку — он исчезнет,
            и главу придётся проходить с нуля.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: C.textSec, marginTop: 12 }}>
            Впереди ещё пять глав, и каждая уточняет эту картину. Они складываются
            только если результаты копятся в одном профиле — с ним ты вернёшься
            с любого телефона и увидишь, как менялся со временем.
          </div>
        </div>
      )}

      <Button onClick={onNext}>
        {onBack ? "Вернуться в профиль" : saved ? "Открыть профиль" : "Сохранить результат"}
      </Button>

      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={() => downloadResult(res)}>
          Скачать разбор документом
        </Button>
      </div>

      {isDebug && (
      <button
        className="tap"
        onClick={() => setDetails(!details)}
        style={{
          marginTop: 18,
          background: "transparent",
          border: "none",
          color: C.dim,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {details ? "скрыть расчёт" : "как это посчиталось"}
      </button>
      )}

      {isDebug && details && (
        <div
          style={{
            marginTop: 12,
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.9,
            color: C.dim,
            background: C.bgDeep,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 16,
            overflowX: "auto",
          }}
        >
          {ORDER.map((p) => (
            <div key={p}>
              {POLES[p].letter}: raw {res.raw[p].toFixed(1)} → {res.pct[p].toFixed(1)}%
              {res.norm[p] != null ? ` · норматив ${res.norm[p].toFixed(0)}` : " · норматива нет"}
            </div>
          ))}
          <div style={{ marginTop: 8, color: C.faint }}>
            Σw = {res.sumW.toFixed(1)} · коридор H = {res.H.toFixed(1)}
          </div>
          <div style={{ color: C.faint }}>
            контроль Q11 → {res.controlPole ? POLES[res.controlPole].letter : "—"}
            {res.controlGap ? " (расхождение)" : " (сходится)"}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={onRestart}>
          Пройти заново
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 2 — резонанс                                */
/* ------------------------------------------------------------------ */

function Result2({ res1, res2, resonance, onNext, onRestart }: any) {
  const lead1 = res1.lead;
  const lead2 = res2.lead;
  const p1 = POLES[lead1];
  const p2 = POLES[lead2];

  let content;
  let accentColor;
  let eyebrowLabel;

  if (resonance.level === "high") {
    content = TEXTS2_HIGH[lead2];
    accentColor = p2.color;
    eyebrowLabel = "Высокий резонанс · Δ " + resonance.delta;
  } else if (resonance.level === "partial") {
    content = partialText(lead1, lead2);
    accentColor = p2.color;
    eyebrowLabel = "Частичный резонанс · Δ " + resonance.delta;
  } else {
    content = gapText(lead1, lead2);
    accentColor = p1.color;
    eyebrowLabel = "Разрыв · Δ " + resonance.delta;
  }

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 2 пройдена · {eyebrowLabel}</Eyebrow>

      <div style={{ display: "flex", gap: 8, margin: "20px 0 20px" }}>
        <div style={{ flex: 1, ...GLASS, borderRadius: 16, padding: "16px 14px", textAlign: "center" as const }}>
          <Eyebrow>Тянет (глава 1)</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: p1.color, marginTop: 8 }}>
            {p1.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.dim, marginTop: 4 }}>
            {Math.round(res1.pct[lead1])} из 100
          </div>
        </div>
        <div style={{ flex: 1, ...GLASS, borderRadius: 16, padding: "16px 14px", textAlign: "center" as const }}>
          <Eyebrow>Получается (глава 2)</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: p2.color, marginTop: 8 }}>
            {p2.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.dim, marginTop: 4 }}>
            {Math.round(res2.pct[lead2])} из 100
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.25, fontWeight: 700, margin: "6px 0 16px", color: C.text }}>
        {content.title}
      </h2>

      <Card style={{ borderLeft: `3px solid ${accentColor}` }}>
        <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: C.textSec, margin: 0, whiteSpace: "pre-line" }}>
          {content.body}
        </p>

        {resonance.level === "high" && (
          <>
            <Detail label="Вспомни" text={content.memory} />
            <Detail label="Обратная сторона" text={content.watch} />
          </>
        )}

        {resonance.level === "gap" && (
          <>
            <div style={{ marginTop: 16 }}>
              <Eyebrow>Вариант 1</Eyebrow>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "6px 0 0" }}>
                {content.variant1}
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <Eyebrow>Вариант 2</Eyebrow>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "6px 0 0" }}>
                {content.variant2}
              </p>
            </div>
            <Detail label="Что дальше" text={content.footer} />
          </>
        )}

        {content.where && <Detail label="Куда с этим" text={content.where} />}
        {content.burnout && <Detail label="Где сгоришь" text={content.burnout} />}
      </Card>

      {res2.blindSpot && (
        <div style={{ marginTop: 14 }}>
          <Card style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>Слепое пятно</Eyebrow>
            <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "10px 0 10px", color: C.text }}>
              {blindSpotText(res2.blindSpot).title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: 0, whiteSpace: "pre-line" }}>
              {blindSpotText(res2.blindSpot).body}
            </p>
          </Card>
        </div>
      )}

      <div
        style={{
          marginTop: 26,
          padding: "22px 20px",
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>18</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>
            направлений в фокусе
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 24 → стало 18
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «твой проверенный фундамент»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>
          Пройти главу 2 заново
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вступление к главе 3                                        */
/* ------------------------------------------------------------------ */

function Intro3({ onStart, user, onProfile }: any) {
  return (
    <div className="scene" style={{ paddingTop: 56 }}>
      {user && (
        <button
          className="tap"
          onClick={onProfile}
          style={{
            background: "none", border: "none", padding: "0 0 20px",
            color: C.accent, fontFamily: SANS, fontSize: 15, fontWeight: 500,
          }}
        >
          {user.email} · профиль
        </button>
      )}
      <Eyebrow>Глава третья · 27%</Eyebrow>
      <h1 style={{
        fontFamily: SERIF, fontSize: 40, lineHeight: 1.08,
        margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.02em", color: C.text,
      }}>
        Глагол, который
        <br />
        тебе идёт
      </h1>

      <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: C.textSec, margin: "28px 0 16px" }}>
        Предыдущие две главы показали, с чем тебе работать. Эта — что именно ты делаешь.
        Одно и то же поле «люди» — это и переговорщик, и терапевт, и рекрутер. Разводит их глагол.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 32px" }}>
        Часть вопросов — жёсткий выбор из двух. Выбрать надо одно, даже если хочется оба.
      </p>

      <Button onClick={onStart}>Начать</Button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Eyebrow>12 вопросов · 3 минуты · открывает «твоё действие»</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вступление к главе 4                                        */
/* ------------------------------------------------------------------ */

function Intro4({ onStart, user, onProfile }: any) {
  return (
    <div className="scene" style={{ paddingTop: 56 }}>
      {user && (
        <button
          className="tap"
          onClick={onProfile}
          style={{
            background: "none", border: "none", padding: "0 0 20px",
            color: C.accent, fontFamily: SANS, fontSize: 15, fontWeight: 500,
          }}
        >
          {user.email} · профиль
        </button>
      )}
      <Eyebrow>Глава четвёртая · 36%</Eyebrow>
      <h1 style={{
        fontFamily: SERIF, fontSize: 40, lineHeight: 1.08,
        margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.02em", color: C.text,
      }}>
        Как думает
        <br />
        твоя голова
      </h1>

      <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: C.textSec, margin: "28px 0 16px" }}>
        Ты уже сказал(а), что делаешь. Теперь — как именно устроена голова, которая это делает.
        Девять вопросов, и это самая быстрая глава во всей линейке.
      </p>

      <Button onClick={onStart}>Начать</Button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Eyebrow>9 вопросов · 2–2,5 минуты · открывает «твой способ думать»</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Полоса значения — переиспользуемая версия PoleRow с явной meta      */
/* ------------------------------------------------------------------ */

function VerbRow({ meta, value, H }: any) {
  const from = Math.max(0, value - H / 2);
  const to = Math.min(100, value + H / 2);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
      <span
        style={{
          width: 26, height: 26, borderRadius: 8, background: meta.color, color: "#fff",
          display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 14, flexShrink: 0,
        }}
      >
        {meta.letter}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, marginBottom: 6 }}>{meta.name}</div>
        <div style={{ position: "relative", height: 6, borderRadius: 3, background: C.faint }}>
          <div style={{
            position: "absolute", left: `${from}%`, width: `${to - from}%`, top: 0, bottom: 0,
            borderRadius: 3, background: meta.color, opacity: 0.45,
          }} />
          <div style={{
            position: "absolute", left: `calc(${value}% - 1px)`, width: 2, top: -3, bottom: -3,
            background: meta.color, borderRadius: 2,
          }} />
        </div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: 15, width: 34, textAlign: "right", color: C.text }}>
        {Math.round(value)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 3 — глагол + связка «поле + глагол»          */
/* ------------------------------------------------------------------ */

function Result3({ res3, materialLead, onNext, onRestart }: any) {
  const cross = crossCheck3(materialLead, res3.lead);
  const verbMeta = VERB_META[res3.lead];

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 3 пройдена · твоё действие</Eyebrow>

      <div style={{ display: "flex", gap: 8, margin: "20px 0 16px", flexWrap: "wrap" as const }}>
        {res3.ranked.map((v: string) => (
          <div key={v} style={{
            flex: "1 1 30%",
            padding: "10px 4px",
            borderRadius: 12,
            background: VERB_META[v].color + "18",
            border: `1.5px solid ${VERB_META[v].color}40`,
            textAlign: "center" as const,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: VERB_META[v].color }}>
              {VERB_META[v].letter}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: VERB_META[v].color, opacity: 0.85 }}>
              {Math.round(res3.pct[v])}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 22 }}>
        {res3.ranked.map((v: string) => (
          <VerbRow key={v} meta={VERB_META[v]} value={res3.pct[v]} H={res3.H} />
        ))}
      </div>

      {res3.flat ? (
        <TextBlock accent={C.dim} t={flatText3()} />
      ) : (
        <>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.25, fontWeight: 700, margin: "6px 0 16px", color: C.text }}>
            {materialLead ? linkText3(materialLead, res3.lead).title : TEXTS3[res3.lead].title}
          </h2>
          <Card style={{ borderLeft: `3px solid ${verbMeta.color}` }}>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: C.textSec, margin: 0 }}>
              {materialLead ? linkText3(materialLead, res3.lead).body : TEXTS3[res3.lead].body}
            </p>
            <Detail label="Вспомни" text={TEXTS3[res3.lead].memory} />
            <Detail label="Обратная сторона" text={TEXTS3[res3.lead].watch} />
            <Detail label="Куда с этим" text={materialLead ? linkText3(materialLead, res3.lead).focus : TEXTS3[res3.lead].where} />
            <Detail label="Где сгоришь" text={TEXTS3[res3.lead].burnout} />
          </Card>
        </>
      )}

      {cross && (
        <div style={{ marginTop: 14 }}>
          <Card style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>Перекрёстная проверка</Eyebrow>
            <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "10px 0 10px", color: C.text }}>
              {crossCheckText3(res3.lead).title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: 0, whiteSpace: "pre-line" }}>
              {crossCheckText3(res3.lead).body}
            </p>
          </Card>
        </div>
      )}

      <div style={{
        marginTop: 26, padding: "22px 20px", border: `1px solid ${C.line}`, borderRadius: 16,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>14</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>направлений в фокусе</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 18 → стало 14
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «твоё действие»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>
          Пройти главу 3 заново
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Полоса континуальной шкалы (не ипсативной) — маркер + коридор H     */
/* ------------------------------------------------------------------ */

function ContinuumBar({ label, value, H, color, leftCaption, rightCaption }: any) {
  const from = Math.max(0, value - H / 2);
  const to = Math.min(100, value + H / 2);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color }}>{Math.round(value)}</span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 4, background: C.bgInset }}>
        <div style={{
          position: "absolute", left: "35%", width: "30%", top: 0, bottom: 0,
          background: C.faint, opacity: 0.25,
        }} />
        <div style={{
          position: "absolute", left: `${from}%`, width: `${to - from}%`, top: 0, bottom: 0,
          borderRadius: 4, background: color, opacity: 0.4,
        }} />
        <div style={{
          position: "absolute", left: `calc(${value}% - 2px)`, width: 4, top: -3, bottom: -3,
          background: color, borderRadius: 2,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <Eyebrow>{leftCaption}</Eyebrow>
        <Eyebrow>{rightCaption}</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 4 — квадрант «как думает голова»             */
/* ------------------------------------------------------------------ */

function Result4({ res4, verbLead, onNext, onRestart }: any) {
  const q = QUADRANTS[res4.quadrant];
  const cross = verbLead ? crossCheck4(verbLead, res4.thinkType, res4.focusType) : null;

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 4 пройдена · твой способ думать</Eyebrow>

      <div style={{
        position: "relative", marginTop: 16, marginBottom: 20, borderRadius: 24,
        padding: "32px 24px 28px", overflow: "hidden",
        background: `linear-gradient(160deg, ${C.accent}1F 0%, rgba(255,255,255,0.72) 70%)`,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 14px 44px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 6 }}>
          {q.sub}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, letterSpacing: "-0.025em", color: C.text, lineHeight: 1.1 }}>
          {q.title}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: "14px 0 0" }}>
          {q.body}
        </p>
      </div>

      <ContinuumBar
        label="А · Тип мышления"
        value={res4.pctA}
        H={res4.HA}
        color={C.poleS}
        leftCaption="образное"
        rightCaption="аналитическое"
      />
      <ContinuumBar
        label="Б · Фокус внимания"
        value={res4.pctB}
        H={res4.HB}
        color={C.poleO}
        leftCaption="деталь"
        rightCaption="система"
      />

      <Card style={{ borderLeft: `3px solid ${C.poleS}` }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "0 0 12px", color: C.text }}>
          {TEXTS4_A[levelOf4(res4.pctA)].title}
        </h3>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: 0 }}>
          {TEXTS4_A[levelOf4(res4.pctA)].body}
        </p>
        <Detail label="Вспомни" text={TEXTS4_A[levelOf4(res4.pctA)].memory} />
        <Detail label="Сила" text={TEXTS4_A[levelOf4(res4.pctA)].power} />
        <Detail label="На что смотреть" text={TEXTS4_A[levelOf4(res4.pctA)].watch} />
      </Card>
      <div style={{ marginTop: 14 }}>
        <Card style={{ borderLeft: `3px solid ${C.poleO}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "0 0 12px", color: C.text }}>
            {TEXTS4_B[levelOf4(res4.pctB)].title}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: 0 }}>
            {TEXTS4_B[levelOf4(res4.pctB)].body}
          </p>
          <Detail label="Вспомни" text={TEXTS4_B[levelOf4(res4.pctB)].memory} />
          <Detail label="Сила" text={TEXTS4_B[levelOf4(res4.pctB)].power} />
          <Detail label="На что смотреть" text={TEXTS4_B[levelOf4(res4.pctB)].watch} />
        </Card>
      </div>

      {cross && (
        <div style={{ marginTop: 14 }}>
          <Card style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>Сверка с главой 3</Eyebrow>
            <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "10px 0 10px", color: C.text }}>
              {crossCheckText4(verbLead, cross.matched).title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: 0, whiteSpace: "pre-line" }}>
              {crossCheckText4(verbLead, cross.matched).body}
            </p>
          </Card>
        </div>
      )}

      <div style={{
        marginTop: 26, padding: "22px 20px", border: `1px solid ${C.line}`, borderRadius: 16,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>10</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>направлений в фокусе</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 14 → стало 10
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «твой способ думать»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>
          Пройти главу 4 заново
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Интро глав 5 и 6                                                   */
/* ------------------------------------------------------------------ */

function IntroChapter({ eyebrow, titleTop, titleBottom, lead, sub, footer, onStart, user, onProfile }: any) {
  return (
    <div className="scene" style={{ paddingTop: 56 }}>
      {user && (
        <button
          className="tap"
          onClick={onProfile}
          style={{
            background: "none", border: "none", padding: "0 0 20px",
            color: C.accent, fontFamily: SANS, fontSize: 15, fontWeight: 500,
          }}
        >
          {user.email} · профиль
        </button>
      )}
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 style={{
        fontFamily: SERIF, fontSize: 40, lineHeight: 1.08,
        margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.02em", color: C.text,
      }}>
        {titleTop}
        <br />
        {titleBottom}
      </h1>

      <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: C.textSec, margin: "28px 0 16px" }}>
        {lead}
      </p>
      {sub && (
        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 32px" }}>
          {sub}
        </p>
      )}

      <Button onClick={onStart}>Начать</Button>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Eyebrow>{footer}</Eyebrow>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: направления в фокусе — постоянно доступный список            */
/* ------------------------------------------------------------------ */

function FocusScreen({ count, names, history, onBack }: any) {
  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <button
        className="tap"
        onClick={onBack}
        style={{
          background: "transparent", border: "none", color: C.accent,
          fontFamily: SANS, fontSize: 15, padding: "0 0 18px", cursor: "pointer",
        }}
      >
        ← Назад
      </button>

      <Eyebrow>Направления в фокусе</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "12px 0 6px" }}>
        <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>
          {count}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 17, color: C.dim }}>из 40</span>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 24px" }}>
        Это не список «кем стать». Это то, что осталось после отсева — направления, которые пока
        не противоречат твоим ответам.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {names.map((n: string, i: number) => (
          <div key={n} style={{
            ...GLASS,
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{
              fontFamily: MONO, fontSize: 12, color: C.faint, width: 22, flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.4, color: C.text }}>
              {n}
            </span>
          </div>
        ))}
      </div>

      <Eyebrow>Как сужалось</Eyebrow>
      <div style={{ marginTop: 14, borderLeft: `1px solid ${C.line}`, paddingLeft: 18 }}>
        {history.map((h: any, i: number) => (
          <div key={i} style={{ position: "relative", paddingBottom: 16 }}>
            <span style={{
              position: "absolute", left: -23, top: 5, width: 9, height: 9, borderRadius: 5,
              background: i === history.length - 1 ? C.accent : C.faint,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: 14.5, color: C.textSec }}>{h.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 14, color: C.text }}>{h.n}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint, lineHeight: 1.6, marginTop: 12 }}>
        Список пересобирается после каждой главы. Чем дальше — тем он точнее.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Бейдж счётчика — виден всегда, открывает FocusScreen                */
/* ------------------------------------------------------------------ */

function FocusBadge({ count, onOpen }: any) {
  return (
    <button
      className="tap"
      onClick={onOpen}
      style={{
        width: "100%",
        ...GLASS,
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        marginBottom: 18,
        textAlign: "left",
      }}
    >
      <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
        {count}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text }}>
          направлений в фокусе
        </span>
        <span style={{ display: "block", fontFamily: SANS, fontSize: 13, color: C.dim, marginTop: 2 }}>
          посмотреть список и историю →
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 5 — драйверы, плотность, фальсификация       */
/* ------------------------------------------------------------------ */

function Result5({ res5, verbLead, materialLead, quadrantTitle, resonanceLevel, onNext, onRestart }: any) {
  const leadMeta = DRIVER_META[res5.lead];
  const crosses = crossTexts5(res5, verbLead, materialLead, quadrantTitle, resonanceLevel);
  const fals = res5.falsification
    ? falsificationText(res5.falsification, verbLead, materialLead, res5.lead)
    : null;

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 5 пройдена · что тебя держит</Eyebrow>

      <div style={{
        position: "relative", marginTop: 16, marginBottom: 20, borderRadius: 24,
        padding: "30px 24px 26px", overflow: "hidden",
        background: `linear-gradient(160deg, ${leadMeta.color}1F 0%, rgba(255,255,255,0.72) 70%)`,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 14px 44px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: leadMeta.color, marginBottom: 6 }}>
          Твой ведущий драйвер
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", color: C.text, lineHeight: 1.1 }}>
          {leadMeta.name}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: "14px 0 0" }}>
          {directionLine(verbLead, materialLead, res5.lead, !verbLead)}
        </p>
      </div>

      <div style={{ marginBottom: 22 }}>
        {res5.ranked.map((d: string) => (
          <VerbRow key={d} meta={DRIVER_META[d]} value={res5.pct[d]} H={res5.H} />
        ))}
      </div>

      {res5.flat ? (
        <TextBlock accent={C.dim} t={flatDriversText()} />
      ) : (
        <Card style={{ borderLeft: `3px solid ${leadMeta.color}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.3, fontWeight: 700, margin: "0 0 12px", color: C.text }}>
            {TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].title}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: C.textSec, margin: 0 }}>
            {TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].body}
          </p>
          <Detail label="Вспомни" text={TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].memory} />
          <Detail label="Сила" text={TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].power} />
          <Detail label="Обратная сторона" text={TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].watch} />
          <Detail label="На что смотреть" text={TEXTS5[res5.lead][driverLevel(res5.pct[res5.lead])].where} />
        </Card>
      )}

      <div style={{ marginTop: 20 }}>
        <Eyebrow>Социальная плотность</Eyebrow>
        <div style={{ marginTop: 12 }}>
          <ContinuumBar
            label="Сколько людей в дне"
            value={res5.density}
            H={res5.densityH}
            color={C.poleL}
            leftCaption="один"
            rightCaption="поток"
          />
        </div>
        <Card style={{ borderLeft: `3px solid ${C.poleL}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "0 0 12px", color: C.text }}>
            {DENSITY_TEXTS[densityLevel(res5.density)].title}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: 0 }}>
            {DENSITY_TEXTS[densityLevel(res5.density)].body}
          </p>
          <Detail label="Вспомни" text={DENSITY_TEXTS[densityLevel(res5.density)].memory} />
          <Detail label="Норма для тебя" text={DENSITY_TEXTS[densityLevel(res5.density)].norm} />
          <Detail label="Где сгоришь" text={DENSITY_TEXTS[densityLevel(res5.density)].burnout} />
        </Card>
      </div>

      {fals && (
        <div style={{ marginTop: 20 }}>
          <Card style={{
            borderLeft: `3px solid ${res5.falsification === "broken" ? C.poleM : C.accent}`,
          }}>
            <Eyebrow>Проверка на прочность</Eyebrow>
            <h3 style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.3, fontWeight: 700, margin: "10px 0 12px", color: C.text }}>
              {fals.title}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: 0, whiteSpace: "pre-line" }}>
              {fals.body}
            </p>
          </Card>
        </div>
      )}

      {crosses.map((c: any, i: number) => (
        <div key={i} style={{ marginTop: 14 }}>
          <Card style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>{c.title}</Eyebrow>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "10px 0 0" }}>
              {c.body}
            </p>
          </Card>
        </div>
      ))}

      <div style={{
        marginTop: 26, padding: "22px 20px", border: `1px solid ${C.line}`, borderRadius: 16,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>12</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>направлений в фокусе</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 18 → стало 12
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «что тебя держит»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>Пройти главу 5 заново</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 6 — антипрофиль                             */
/* ------------------------------------------------------------------ */

function Result6({ res6, verbLead, onNext, onRestart }: any) {
  const contra = res6.contradiction;

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 6 пройдена · антипрофиль</Eyebrow>

      <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.15, fontWeight: 700, margin: "16px 0 10px", color: C.text }}>
        Тебе точно не подходит
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 20px" }}>
        {res6.soft
          ? "Ни одна среда не набрала критического балла — значит, ты довольно вынослив. Вот три, которые всё же тяжелее прочих."
          : "Эти среды выключают тебя сильнее всего — по убыванию."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {res6.exclusions.map((sub: string, i: number) => (
          <Card key={sub} style={{ borderLeft: `3px solid ${SUB_META[sub].color}` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: 0, color: C.text }}>
                {ANTI_TEXTS[sub].title}
              </h3>
              <span style={{ fontFamily: MONO, fontSize: 14, color: SUB_META[sub].color, flexShrink: 0 }}>
                {Math.round(res6.score[sub])}
              </span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: "12px 0 0" }}>
              {ANTI_TEXTS[sub].body}
            </p>
            <Detail label="Например" text={ANTI_TEXTS[sub].examples} />
          </Card>
        ))}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.65, color: C.textSec, margin: "22px 0 0" }}>
        {ANTI_FOOTER}
      </p>

      <div style={{ marginTop: 18 }}>
        <Card style={{ background: "transparent", borderStyle: "dashed" }}>
          <Eyebrow>{contra ? "Нестыковка" : "Согласованность"}</Eyebrow>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.3, fontWeight: 700, margin: "10px 0 10px", color: C.text }}>
            {contra ? contradictionText6(contra.sub, contra.verbLead).title : consistencyText6().title}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: 0, whiteSpace: "pre-line" }}>
            {contra ? contradictionText6(contra.sub, contra.verbLead).body : consistencyText6().body}
          </p>
        </Card>
      </div>

      <div style={{
        marginTop: 26, padding: "22px 20px", border: `1px solid ${C.line}`, borderRadius: 16,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>7</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>направлений в фокусе</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 12 → стало 7
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «антипрофиль»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>Пройти главу 6 заново</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: результат главы 7 — ограничения, сценарий, итоговый профиль  */
/* ------------------------------------------------------------------ */

function Result7({ res7, finalProfile, onNext, onRestart }: any) {
  const crosses = [
    scenarioVerbText(res7),
    scenarioDriverText(res7),
    scenarioThinkText(res7),
    res7.antiAnswered ? scenarioAntiText(res7) : null,
  ].filter(Boolean);

  return (
    <div className="scene" style={{ paddingTop: 28 }}>
      <Eyebrow>Глава 7 пройдена · последняя проверка</Eyebrow>

      <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.15, fontWeight: 700, margin: "16px 0 10px", color: C.text }}>
        Вот что нужно учесть
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CONSTRAINTS_ORDER.map((sub: string) => {
          const c = res7.constraints[sub];
          const t = constraintText(sub, c.level);
          return (
            <Card key={sub} style={{ borderLeft: `3px solid ${CONSTRAINT_META[sub].color}` }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.3, fontWeight: 700, margin: 0, color: C.text }}>
                  {t.title}
                </h3>
                <span style={{ fontFamily: MONO, fontSize: 14, color: CONSTRAINT_META[sub].color, flexShrink: 0 }}>
                  {Math.round(c.score)}
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.textSec, margin: "10px 0 0" }}>
                {t.body}
              </p>
            </Card>
          );
        })}
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.2, fontWeight: 700, margin: "28px 0 10px", color: C.text }}>
        В живом выборе ты повёл(а) себя как…
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {crosses.map((c: any, i: number) => (
          <Card key={i} style={{ background: "transparent", borderStyle: "dashed" }}>
            <Eyebrow>{c.title}</Eyebrow>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "10px 0 0", whiteSpace: "pre-line" }}>
              {c.body}
            </p>
          </Card>
        ))}
      </div>

      <div style={{
        position: "relative", marginTop: 26, marginBottom: 20, borderRadius: 24,
        padding: "30px 24px 26px", overflow: "hidden",
        background: `linear-gradient(160deg, ${C.accent}1F 0%, rgba(255,255,255,0.72) 70%)`,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 14px 44px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}>
        <Eyebrow>100% · семь глав пройдены</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.4, fontWeight: 700, color: C.text, margin: "12px 0 0" }}>
          Кто ты как специалист
        </div>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.textSec, margin: "12px 0 0" }}>
          {finalProfile.paragraph}
        </p>
      </div>

      {finalProfile.tasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Eyebrow>Задачи, которые тебе подходят</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {finalProfile.tasks.map((t: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: C.accent, fontFamily: SANS, fontSize: 15 }}>·</span>
                <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: C.textSec }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {finalProfile.roles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Eyebrow>Роли, которые стоит рассмотреть</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {finalProfile.roles.map((r: any, i: number) => (
              <Card key={i}>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.text }}>{r.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: C.dim, marginTop: 6 }}>{r.reason}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {finalProfile.skills.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Eyebrow>Что развивать первым</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {finalProfile.skills.map((s: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: C.accent, fontFamily: SANS, fontSize: 15 }}>·</span>
                <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: C.textSec }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {finalProfile.avoid.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Eyebrow>Куда точно не идти</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {finalProfile.avoid.map((sub: string) => (
              <div key={sub} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: SUB_META[sub].color, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: C.textSec }}>
                  {ANTI_TEXTS[sub].title}
                  {finalProfile.avoidSoftened && sub === res7.antiTargetSub ? " — не железное, а сильное предпочтение" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: C.dim, margin: "26px 0 0", fontStyle: "italic" }}>
        {finalProfile.disclaimer}
      </p>

      <div style={{
        marginTop: 22, padding: "22px 20px", border: `1px solid ${C.line}`, borderRadius: 16,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1 }}>{finalProfile.roles.length || 1}</div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.45 }}>рекомендованных направления</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em", marginTop: 4 }}>
            было 7 → стало {finalProfile.roles.length || 1}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onNext}>Открыть «твой профиль»</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onRestart}>Пройти главу 7 заново</Button>
      </div>
    </div>
  );
}

const CONSTRAINTS_ORDER = ["retraining", "horizon", "financial_buffer"];

/* ------------------------------------------------------------------ */
/*  Экран: карта глав                                                  */
/* ------------------------------------------------------------------ */

function buildChapters(hasCh1: boolean, hasCh2: boolean, hasCh3: boolean, hasCh4: boolean, hasCh5: boolean, hasCh6: boolean, hasCh7: boolean) {
  return [
    hasCh1
      ? { state: "done", title: "Твоё поле", note: hasCh2 ? "обновлено · данные из двух глав" : "открыто · 24 направления в фокусе" }
      : { state: "next", title: "Твоё поле", note: "11 вопросов, 3 минуты" },
    hasCh1 && !hasCh2
      ? { state: "next", title: "Глава 2. За что тебя уже хвалили", note: "9 вопросов, 2 минуты", sub: "проверит то, что мы предположили сейчас" }
      : hasCh2
      ? { state: "done", title: "Твой проверенный фундамент", note: "открыто" }
      : { state: "locked", title: "Глава 2. За что тебя уже хвалили" },
    hasCh2 && !hasCh3
      ? { state: "next", title: "Глава 3. Глагол, который тебе идёт", note: "12 вопросов, 3 минуты", sub: "создавать, чинить, исследовать, организовывать — что твоё?" }
      : hasCh3
      ? { state: "done", title: "Твоё действие", note: "открыто · «ты — тот, кто … в …»" }
      : { state: "locked", title: "Глава 3. Глагол, который тебе идёт" },
    hasCh3 && !hasCh4
      ? { state: "next", title: "Глава 4. Как думает твоя голова", note: "9 вопросов, 2 минуты", sub: "проверит, совпадает ли твой стиль мышления с твоим глаголом" }
      : hasCh4
      ? { state: "done", title: "Твой способ думать", note: "открыто" }
      : { state: "locked", title: "Глава 4. Как думает твоя голова" },
    hasCh4 && !hasCh5
      ? { state: "next", title: "Глава 5. Что тебя заряжает", note: "10 вопросов, 3 минуты", sub: "проверит гипотезу на прочность" }
      : hasCh5
      ? { state: "done", title: "Что тебя держит", note: "открыто · драйвер и социальная плотность" }
      : { state: "locked", title: "Глава 5. Что тебя заряжает", at: "откроется после главы 4" },
    hasCh5 && !hasCh6
      ? { state: "next", title: "Глава 6. Что тебя выключает", note: "9 вопросов, 2 минуты", sub: "список сред, куда не идти даже за хорошие деньги" }
      : hasCh6
      ? { state: "done", title: "Антипрофиль", note: "открыто · куда не идти" }
      : { state: "locked", title: "Что тебя выключает", at: "откроется после главы 5" },
    hasCh6 && !hasCh7
      ? { state: "next", title: "Глава 7. Последняя проверка", note: "10 вопросов, 3–3,5 минуты", sub: "проверит, выдержит ли всё собранное живой выбор" }
      : hasCh7
      ? { state: "done", title: "Твой профиль", note: "открыто · итоговая сборка" }
      : { state: "locked", title: "Глава 7. Последняя проверка", at: "откроется после главы 6" },
  ];
}

function Map({ res, res2, res3, res4, res5, res6, res7, done, done2, done3, done4, done5, done6, done7, focus, onOpenFocus, onOpenResult, onStart, onStart2, onStart3, onStart4, onStart5, onStart6, onStart7, onOpenResult2, onOpenResult3, onOpenResult4, onOpenResult5, onOpenResult6, onOpenResult7 }: any) {
  const chapters = buildChapters(done, done2, done3, done4, done5, done6, done7);
  const percentLabel = done7 ? "100" : done6 ? "86" : done5 ? "71" : done4 ? "36" : done3 ? "27" : done2 ? "17" : done ? "8" : "0";

  return (
    <div className="scene" style={{ paddingTop: 36 }}>
      <Eyebrow>Твой профиль · изучен на {percentLabel}%</Eyebrow>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 32,
          lineHeight: 1.15,
          fontWeight: 400,
          margin: "12px 0 6px",
        }}
      >
        {done7 ? "Твой профиль собран" : done6 ? "Антипрофиль открыт" : done5 ? "Что тебя держит — открыто" : done4 ? "Твой способ думать открыт" : done3 ? "Твоё действие открыто" : done2 ? "Фундамент подтверждён" : done ? "Твоё поле открыто" : "Ничего ещё не пройдено"}
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, color: C.dim, margin: "0 0 24px" }}>
        {done7
          ? "Все семь глав пройдены. MVP-профиль полностью собран."
          : done6
          ? "Шесть глав из семи пройдены. Осталась одна."
          : done5
          ? "Пять глав из семи пройдены. Остальное пока закрыто."
          : done4
          ? "Четыре главы из семи пройдены. Остальное пока закрыто."
          : done3
          ? "Три главы из семи пройдены. Остальное пока закрыто."
          : done2
          ? "Две главы из семи пройдены. Остальное пока закрыто."
          : done
          ? "Одна глава из семи пройдена. Остальное пока закрыто."
          : "Начни с главы 1 — три минуты, без вопросов про профессии."}
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {res && ORDER.map((p: string) => (
          <div key={p} style={{
            flex: 1, padding: "8px 4px", borderRadius: 10,
            background: POLES[p].color + "15",
            textAlign: "center" as const,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: POLES[p].color }}>
              {POLES[p].letter} {Math.round(res.pct[p])}
            </div>
          </div>
        ))}
      </div>

      {done && <FocusBadge count={focus} onOpen={onOpenFocus} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {chapters.map((ch, i) => {
          const locked = ch.state === "locked" || ch.state === "hidden";
          return (
            <div
              key={i}
              onClick={() => {
                if (ch.state === "next" && i === 0) onStart();
                else if (ch.state === "next" && i === 1) onStart2 && onStart2();
                else if (ch.state === "next" && i === 2) onStart3 && onStart3();
                else if (ch.state === "next" && i === 3) onStart4 && onStart4();
                else if (ch.state === "next" && i === 4) onStart5 && onStart5();
                else if (ch.state === "next" && i === 5) onStart6 && onStart6();
                else if (ch.state === "next" && i === 6) onStart7 && onStart7();
                else if (ch.state === "done" && i === 0) onOpenResult();
                else if (ch.state === "done" && i === 1) onOpenResult2 && onOpenResult2();
                else if (ch.state === "done" && i === 2) onOpenResult3 && onOpenResult3();
                else if (ch.state === "done" && i === 3) onOpenResult4 && onOpenResult4();
                else if (ch.state === "done" && i === 4) onOpenResult5 && onOpenResult5();
                else if (ch.state === "done" && i === 5) onOpenResult6 && onOpenResult6();
                else if (ch.state === "done" && i === 6) onOpenResult7 && onOpenResult7();
              }}
              style={{
                background: ch.state === "next" ? C.surfaceUp : C.surface,
                border: `1px solid ${ch.state === "next" ? "rgba(255,255,255,0.22)" : C.line}`,
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                cursor: ch.state === "next" || ch.state === "done" ? "pointer" : "default",
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1.4, opacity: locked ? 0.5 : 1 }}>
                {ch.state === "done" ? "✓" : locked ? "🔒" : "→"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 15.5,
                    fontWeight: ch.state === "next" ? 600 : 500,
                    filter: ch.state === "hidden" ? "blur(5px)" : "none",
                    color: locked ? C.dim : C.text,
                  }}
                >
                  {ch.title}
                </div>
                {ch.note && (
                  <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.dim, marginTop: 4 }}>
                    {ch.note}
                  </div>
                )}
                {ch.sub && (
                  <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.dim, marginTop: 4, fontStyle: "italic" }}>
                    ↳ {ch.sub}
                  </div>
                )}
                {locked && (
                  <div
                    style={{
                      marginTop: 8,
                      height: 9,
                      borderRadius: 5,
                      width: "72%",
                      background:
                        "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 14px, rgba(255,255,255,0.05) 14px 22px)",
                      filter: "blur(2.5px)",
                    }}
                  />
                )}
                {ch.at && (
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: C.faint,
                      marginTop: 8,
                    }}
                  >
                    {ch.at}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint, lineHeight: 1.6, marginTop: 22 }}>
        Закрытые разделы уже что-то про тебя знают — они просто ещё не проявлены.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Хранилище                                                          */
/* ------------------------------------------------------------------ */
/*  В прототипе профиль лежит в window.storage — он переживает         */
/*  перезагрузку страницы. В боевой версии эти же две функции          */
/*  заменяются на запросы к Supabase, остальной код не меняется.       */

const STORE_KEY = "profile:main";
let memory = null;

async function loadState() {
  try {
    if (typeof window !== "undefined" && window.storage) {
      const r = await window.storage.get(STORE_KEY);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) {
    /* ключа ещё нет — это нормально */
  }
  return memory;
}

async function saveState(state) {
  memory = state;
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(STORE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    /* остаёмся в памяти сессии */
  }
}


/* ------------------------------------------------------------------ */
/*  Экран входа — появляется после результата                         */
/* ------------------------------------------------------------------ */

const fieldStyleAuth: React.CSSProperties = {
  width: "100%",
  background: C.bgCard,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: "14px 16px",
  color: C.text,
  fontFamily: SANS,
  fontSize: 17,
  boxShadow: C.shadow,
};

function GoogleButton({ onClick, loading }: any) {
  return (
    <button
      className="tap"
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        minHeight: 54,
        borderRadius: 14,
        border: `1px solid ${C.line}`,
        background: C.bgCard,
        color: C.text,
        fontFamily: SANS,
        fontSize: 17,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxShadow: C.shadow,
        transition: "opacity 150ms ease",
      }}
    >
      {!loading && (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {loading ? "Секунду…" : "Войти через Google"}
    </button>
  );
}

function AuthGate({ context = "save" }: any) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setLoading(false);
      setError("Не получилось открыть Google. Попробуй через почту.");
    }
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const err = await fn(email.trim(), password);
    setLoading(false);
    if (err) {
      if (err.includes("Invalid login")) setError("Неверная почта или пароль");
      else if (err.includes("already registered")) setError("Уже зарегистрирован. Войди.");
      else if (err.includes("Password should be")) setError("Пароль — не короче 6 символов");
      else setError(err);
    }
  };

  const ok = email.includes("@") && password.length >= 6;

  return (
    <div className="scene" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, margin: "0 0 10px", color: C.text, letterSpacing: "-0.02em" }}>
        {context === "login" ? "С возвращением" : "Сохранить результат"}
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 16, color: C.textSec, margin: "0 0 20px", lineHeight: 1.55 }}>
        {context === "login"
          ? "Войди — и профиль со всеми пройденными главами подтянется сюда."
          : "Аккаунт нужен для одного: чтобы твои главы копились в одном месте."}
      </p>

      <div style={{ ...GLASS, borderRadius: 20, padding: 20, marginBottom: 24, display: context === "login" ? "none" : "block" }}>
        {[
          ["Результат не потеряется", "Без аккаунта он живёт только в этой вкладке. Закроешь — и главу придётся проходить заново."],
          ["Главы складываются", "Впереди ещё пять. Каждая уточняет предыдущую, но только если они привязаны к одному профилю."],
          ["Видно, как ты меняешься", "Через полгода можно пройти снова и сравнить — это и есть главное, ради чего всё затевалось."],
        ].map(([title, body], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginTop: i === 0 ? 0 : 16 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 1,
              background: C.accent, color: "#fff", display: "grid", placeItems: "center",
              fontFamily: SANS, fontSize: 13, fontWeight: 700,
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 600, color: C.text }}>{title}</div>
              <div style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.5, color: C.dim, marginTop: 3 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>

      <GoogleButton onClick={handleGoogle} loading={loading} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.line }} />
        <span style={{ fontFamily: SANS, fontSize: 13, color: C.faint }}>или</span>
        <div style={{ flex: 1, height: 1, background: C.line }} />
      </div>

      {!showEmail ? (
        <button
          className="tap"
          onClick={() => setShowEmail(true)}
          style={{
            width: "100%", minHeight: 54, borderRadius: 14,
            border: `1px solid ${C.line}`, background: "transparent",
            color: C.dim, fontFamily: SANS, fontSize: 17, fontWeight: 500,
          }}
        >
          Войти через почту
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            style={fieldStyleAuth} type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Почта" autoComplete="email"
          />
          <input
            style={fieldStyleAuth} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль (не короче 6 символов)"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && (
            <p style={{ fontFamily: SANS, fontSize: 14, color: C.poleL, margin: 0 }}>{error}</p>
          )}
          <button
            className="tap"
            onClick={submit}
            disabled={!ok || loading}
            style={{
              width: "100%", minHeight: 54, borderRadius: 14, border: "none",
              background: ok && !loading ? C.accent : C.faint,
              color: "#fff", fontFamily: SANS, fontSize: 17, fontWeight: 600,
              transition: "background 150ms ease",
            }}
          >
            {loading ? "Секунду…" : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
          <button
            className="tap"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
            style={{ background: "none", border: "none", color: C.accent, fontFamily: SANS, fontSize: 15, padding: "8px 0" }}
          >
            {mode === "login" ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Иконки                                                             */
/* ------------------------------------------------------------------ */

const IconChapters = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.22 : 0}
    />
    <path d="M4 12.5 12 16l8-3.5M4 17 12 20.5 20 17" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const IconMe = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle
      cx="12"
      cy="8.5"
      r="3.6"
      stroke="currentColor"
      strokeWidth="1.6"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.22 : 0}
    />
    <path d="M4.8 20c.6-3.7 3.6-5.8 7.2-5.8s6.6 2.1 7.2 5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function TabBar({ tab, onTab }: any) {
  const items = [
    { id: "chapters", label: "Главы", Icon: IconChapters },
    { id: "me", label: "Я", Icon: IconMe },
  ];
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        marginTop: 32,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: `1px solid ${C.line}`,
        display: "flex",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            className="tap"
            onClick={() => onTab(id)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: active ? C.accent : C.dim,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "8px 0",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 11,
              letterSpacing: "0.04em",
            }}
          >
            <Icon active={active} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: сохранить результат                                         */
/* ------------------------------------------------------------------ */

const field = {
  width: "100%",
  boxSizing: "border-box",
  background: C.bgDeep,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: "15px 16px",
  color: C.text,
  fontFamily: SANS,
  fontSize: 16,
  outline: "none",
};

function SaveProfile({ initial, onSave, onSkip }: any) {
  const [name, setName] = useState(initial?.name || "");
  const [age, setAge] = useState(initial?.age || "");
  const [gender, setGender] = useState(initial?.gender || "");
  const ok = name.trim().length > 0;

  return (
    <div style={{ paddingTop: 40 }}>
      <Eyebrow>Шаг перед профилем</Eyebrow>
      <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.15, fontWeight: 400, margin: "14px 0 10px" }}>
        Сохранить результат
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 28px" }}>
        Чтобы вернуться к своему полю позже и открывать новые главы. Возраст и пол влияют на то, с кем
        сравнивать твои ответы, — но их можно не указывать.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Eyebrow>Как тебя зовут</Eyebrow>
          </div>
          <input
            style={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            autoComplete="given-name"
          />
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>
            <Eyebrow>Возраст</Eyebrow>
          </div>
          <input
            style={field}
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="Например, 29"
            inputMode="numeric"
          />
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>
            <Eyebrow>Пол</Eyebrow>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "m", label: "Мужской" },
              { id: "f", label: "Женский" },
              { id: "x", label: "Не указывать" },
            ].map((g) => {
              const active = gender === g.id;
              return (
                <button
                  key={g.id}
                  className="tap"
                  onClick={() => setGender(g.id)}
                  style={{
                    flex: 1,
                    minHeight: 50,
                    borderRadius: 12,
                    border: `1px solid ${active ? "rgba(255,255,255,0.3)" : C.line}`,
                    background: active ? C.text : C.surface,
                    color: active ? C.bgDeep : C.dim,
                    fontFamily: SANS,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Button disabled={!ok} onClick={() => onSave({ name: name.trim(), age, gender })}>
          Сохранить и открыть профиль
        </Button>
      </div>

      <div style={{ marginTop: 14 }}>
        <Button variant="ghost" onClick={onSkip}>
          Пока не сохранять
        </Button>
      </div>

      <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: C.faint, marginTop: 18 }}>
        В прототипе профиль хранится на этом устройстве. В рабочей версии здесь будет вход через Google
        или почту, и профиль поедет за тобой на любой телефон.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: профиль                                                     */
/* ------------------------------------------------------------------ */

function ProgressRing({ percent }: any) {
  const r = 30;
  const len = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.bgInset} strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={C.accent}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(len * percent) / 100} ${len}`}
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fill={C.text}
        style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

function Profile({ state, res, res3, res4, res5, res6, res7, finalProfile, combined, focus, onOpenFocus, onOpenResult, onOpenResult2, onOpenResult3, onOpenResult4, onOpenResult5, onOpenResult6, onOpenResult7, onEdit, onReset, onSignOut, done: doneProp, done2, done3, done4, done5, done6, done7, user }: any) {
  const p = state.profile;
  const done = doneProp ?? !!state.ch1;
  const lead = combined && (done || done2) ? POLES[combined.lead] : null;
  const date = state.ch1?.date ? new Date(state.ch1.date) : null;
  const dateLabel = date
    ? date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date2 = state.ch2?.date ? new Date(state.ch2.date) : null;
  const dateLabel2 = date2
    ? date2.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date3 = state.ch3?.date ? new Date(state.ch3.date) : null;
  const dateLabel3 = date3
    ? date3.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date4 = state.ch4?.date ? new Date(state.ch4.date) : null;
  const dateLabel4 = date4
    ? date4.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date5 = state.ch5?.date ? new Date(state.ch5.date) : null;
  const dateLabel5 = date5
    ? date5.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date6 = state.ch6?.date ? new Date(state.ch6.date) : null;
  const dateLabel6 = date6
    ? date6.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const date7 = state.ch7?.date ? new Date(state.ch7.date) : null;
  const dateLabel7 = date7
    ? date7.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="scene" style={{ paddingTop: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
        <ProgressRing percent={done7 ? 100 : done6 ? 86 : done5 ? 71 : done4 ? 36 : done3 ? 27 : done2 ? 17 : done ? 8 : 0} />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, fontWeight: 700, margin: 0, color: C.text }}>
            {p?.name ? p.name : user?.email ? user.email.split("@")[0] : "Твой профиль"}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.dim, margin: "6px 0 0" }}>
            {done7
              ? "Изучен на 100%. Все семь глав MVP."
              : done6
              ? "Изучен на 86%. Шесть глав из семи."
              : done5
              ? "Изучен на 71%. Пять глав из семи."
              : done4
              ? "Изучен на 36%. Четыре главы из семи."
              : done3
              ? "Изучен на 27%. Три главы из семи."
              : done2
              ? "Изучен на 17%. Две главы из семи."
              : done
              ? "Изучен на 8%. Одна глава из семи."
              : "Пока пусто. Первая глава всё начнёт."}
          </p>
        </div>
      </div>

      {done && <FocusBadge count={focus} onOpen={onOpenFocus} />}

      {done && combined && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
            {ORDER.map((k: string) => (
              <div key={k} style={{
                flex: 1, padding: "10px 4px", borderRadius: 12,
                background: POLES[k].color + "15",
                textAlign: "center" as const,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: POLES[k].color }}>
                  {POLES[k].letter}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: POLES[k].color, marginTop: 2 }}>
                  {Math.round(combined.pct[k])}
                </div>
              </div>
            ))}
          </div>

          <button
            className="tap"
            onClick={onOpenResult}
            style={{
              width: "100%",
              textAlign: "left" as const,
              background: C.bgCard,
              boxShadow: C.shadow,
              border: `1px solid ${C.line}`,
              borderLeft: `3px solid ${lead.color}`,
              borderRadius: 16,
              padding: 20,
              cursor: "pointer",
              color: C.text,
            }}
          >
            <Eyebrow>Твоё поле · {done2 ? "обновлено" : "открыто"}</Eyebrow>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 21,
                lineHeight: 1.25,
                margin: "10px 0 10px",
              }}
            >
              {TEXTS[combined.lead][levelOf(combined.pct[combined.lead])].title}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
              Смотреть разбор целиком →
            </div>
          </button>

          {done2 && (
            <button
              className="tap"
              onClick={onOpenResult2}
              style={{
                width: "100%",
                textAlign: "left" as const,
                background: C.bgCard,
                boxShadow: C.shadow,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${C.accent}`,
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                color: C.text,
                marginTop: 12,
              }}
            >
              <Eyebrow>Твой проверенный фундамент · открыто</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                За что тебя уже хвалили
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                Смотреть разбор резонанса →
              </div>
            </button>
          )}

          {done3 && res3 && (
            <button
              className="tap"
              onClick={onOpenResult3}
              style={{
                width: "100%",
                textAlign: "left" as const,
                background: C.bgCard,
                boxShadow: C.shadow,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${VERB_META[res3.lead].color}`,
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                color: C.text,
                marginTop: 12,
              }}
            >
              <Eyebrow>Твоё действие · открыто</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                {res3.flat ? "Глагол пока не определился" : `Ты — тот, кто ${VERB_META[res3.lead].name.toLowerCase()}`}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                Смотреть разбор действия →
              </div>
            </button>
          )}

          {done4 && res4 && (
            <button
              className="tap"
              onClick={onOpenResult4}
              style={{
                width: "100%",
                textAlign: "left" as const,
                background: C.bgCard,
                boxShadow: C.shadow,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${C.accent}`,
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                color: C.text,
                marginTop: 12,
              }}
            >
              <Eyebrow>Твой способ думать · открыто</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                {QUADRANTS[res4.quadrant].title}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                Смотреть квадрант целиком →
              </div>
            </button>
          )}

          {done5 && res5 && (
            <button
              className="tap"
              onClick={onOpenResult5}
              style={{
                width: "100%", textAlign: "left" as const, background: C.bgCard,
                boxShadow: C.shadow, border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${DRIVER_META[res5.lead].color}`,
                borderRadius: 16, padding: 20, cursor: "pointer", color: C.text, marginTop: 12,
              }}
            >
              <Eyebrow>Что тебя держит · открыто</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                {res5.flat ? "Драйвер пока не определился" : DRIVER_META[res5.lead].name}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                Смотреть драйверы и плотность →
              </div>
            </button>
          )}

          {done6 && res6 && (
            <button
              className="tap"
              onClick={onOpenResult6}
              style={{
                width: "100%", textAlign: "left" as const, background: C.bgCard,
                boxShadow: C.shadow, border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${SUB_META[res6.exclusions[0]].color}`,
                borderRadius: 16, padding: 20, cursor: "pointer", color: C.text, marginTop: 12,
              }}
            >
              <Eyebrow>Антипрофиль · открыто</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                Куда тебе не идти
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                {res6.exclusions.length} среды в списке исключений →
              </div>
            </button>
          )}

          {done7 && res7 && finalProfile && (
            <button
              className="tap"
              onClick={onOpenResult7}
              style={{
                width: "100%", textAlign: "left" as const, background: C.bgCard,
                boxShadow: C.shadow, border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${C.accent}`,
                borderRadius: 16, padding: 20, cursor: "pointer", color: C.text, marginTop: 12,
              }}
            >
              <Eyebrow>Твой профиль · собран на 100%</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.25, margin: "10px 0 10px" }}>
                {finalProfile.roles[0]?.name || "Итоговая сборка"}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
                {finalProfile.roles.length} рекомендованных направления →
              </div>
            </button>
          )}

          <div style={{ marginTop: 26 }}>
            <Eyebrow>Хроника</Eyebrow>
            <div style={{ marginTop: 14, borderLeft: `1px solid ${C.line}`, paddingLeft: 18 }}>
              <div style={{ position: "relative", paddingBottom: 20 }}>
                <span
                  style={{
                    position: "absolute",
                    left: -23,
                    top: 5,
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    background: POLES[res.lead].color,
                  }}
                />
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                  {dateLabel}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                  Первый замер: {POLES[res.lead].name.toLowerCase()} — {Math.round(res.pct[res.lead])} из 100
                </div>
              </div>
              {done2 ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: -23,
                      top: 5,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: C.accent,
                    }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel2}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Второй замер: фундамент — {POLES[combined.lead].name.toLowerCase()}, коридор сузился
                  </div>
                </div>
              ) : null}
              {done3 && res3 ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: -23,
                      top: 5,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: VERB_META[res3.lead].color,
                    }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel3}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Третий замер: действие — {res3.flat ? "пока не определилось" : VERB_META[res3.lead].name.toLowerCase()}
                  </div>
                </div>
              ) : null}
              {done4 && res4 ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: -23,
                      top: 5,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: C.accent,
                    }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel4}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Четвёртый замер: способ думать — {QUADRANTS[res4.quadrant].title.toLowerCase()}
                  </div>
                </div>
              ) : null}
              {done5 && res5 ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span style={{
                    position: "absolute", left: -23, top: 5, width: 9, height: 9,
                    borderRadius: 5, background: DRIVER_META[res5.lead].color,
                  }} />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel5}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Пятый замер: держит — {res5.flat ? "связка драйверов" : DRIVER_META[res5.lead].name.toLowerCase()}
                  </div>
                </div>
              ) : null}
              {done6 && res6 ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span style={{
                    position: "absolute", left: -23, top: 5, width: 9, height: 9,
                    borderRadius: 5, background: SUB_META[res6.exclusions[0]].color,
                  }} />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel6}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Шестой замер: антипрофиль — {res6.exclusions.length} среды исключены
                  </div>
                </div>
              ) : null}
              {done7 && res7 && finalProfile ? (
                <div style={{ position: "relative", paddingBottom: 20 }}>
                  <span style={{
                    position: "absolute", left: -23, top: 5, width: 9, height: 9,
                    borderRadius: 5, background: C.accent,
                  }} />
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                    {dateLabel7}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                    Седьмой замер: итоговый профиль — {finalProfile.roles.length} направления
                  </div>
                </div>
              ) : (
                <div style={{ position: "relative", opacity: 0.45 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: -23,
                      top: 5,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      border: `1px dashed ${C.dim}`,
                    }}
                  />
                  <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5 }}>
                    Следующая отметка появится после {done6 ? "главы 7" : done5 ? "главы 6" : done4 ? "главы 5" : done3 ? "главы 4" : done2 ? "главы 3" : "главы 2"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: 30 }}>
        <Eyebrow>Мои данные</Eyebrow>
        <Card style={{ marginTop: 12, padding: 18 }}>
          <Row label="Имя" value={p?.name || "не указано"} />
          <Row label="Возраст" value={p?.age ? `${p.age}` : "не указан"} />
          <Row
            label="Пол"
            value={p?.gender === "m" ? "мужской" : p?.gender === "f" ? "женский" : "не указан"}
            last
          />
          <div style={{ marginTop: 16 }}>
            <Button variant="ghost" onClick={onEdit}>
              Изменить
            </Button>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          className="tap"
          onClick={onSignOut}
          style={{
            width: "100%",
            minHeight: 54,
            borderRadius: 14,
            border: "none",
            background: C.bgCard,
            boxShadow: C.shadow,
            color: C.poleL,
            fontFamily: SANS,
            fontSize: 17,
            fontWeight: 500,
          }}
        >
          Выйти из аккаунта
        </button>
      </div>
      <button
        className="tap"
        onClick={onReset}
        style={{
          marginTop: 16,
          background: "transparent",
          border: "none",
          color: C.dim,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        сбросить всё · для тестирования
      </button>
    </div>
  );
}

function Row({ label, value, last }: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "11px 0",
        borderBottom: last ? "none" : `1px solid ${C.lineSoft}`,
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: 14.5, color: C.dim }}>{label}</span>
      <span style={{ fontFamily: SANS, fontSize: 14.5 }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  iOS Shell                                                          */
/* ------------------------------------------------------------------ */

function Shell({ children, mood }: any) {
  const tint = mood || C.accent;
  return (
    <div style={{
      background: `linear-gradient(180deg, #FAFAFC 0%, ${C.bg} 55%, #EFEFF4 100%)`,
      minHeight: "100vh",
      color: C.text,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* мягкие цветовые пятна — почти не видны, но дают глубину */}
      <div aria-hidden style={{
        position: "fixed", top: "-18%", left: "-22%",
        width: 460, height: 460, borderRadius: "50%",
        background: tint, opacity: 0.13, filter: "blur(120px)",
        transition: "background 900ms ease", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "fixed", bottom: "-20%", right: "-18%",
        width: 420, height: 420, borderRadius: "50%",
        background: tint, opacity: 0.09, filter: "blur(120px)",
        transition: "background 900ms ease", pointerEvents: "none",
      }} />

      <style>{`
        * { box-sizing: border-box; }
        .tap { transition: transform 180ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms ease, opacity 150ms ease; }
        .tap:active { transform: scale(0.97); }
        .tap:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        button { -webkit-tap-highlight-color: transparent; cursor: pointer; }
        input::placeholder { color: ${C.faint}; }
        input:focus { outline: none; }

        @keyframes appear {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scene > * { opacity: 0; animation: appear .42s cubic-bezier(.2,.8,.2,1) forwards; }
        .scene > *:nth-child(1) { animation-delay: .02s; }
        .scene > *:nth-child(2) { animation-delay: .07s; }
        .scene > *:nth-child(3) { animation-delay: .12s; }
        .scene > *:nth-child(4) { animation-delay: .17s; }
        .scene > *:nth-child(5) { animation-delay: .22s; }
        .scene > *:nth-child(6) { animation-delay: .27s; }
        .scene > *:nth-child(n+7) { animation-delay: .3s; }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
          .scene > * { opacity: 1 !important; }
        }
      `}</style>
      <div style={{
        position: "relative",
        maxWidth: 560,
        margin: "0 auto",
        padding: "env(safe-area-inset-top) 16px calc(24px + env(safe-area-inset-bottom))",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Черновик прохождения                                               */
/*  Google-вход уводит со страницы и возвращает обратно — вся память   */
/*  React при этом теряется. Поэтому ответы кладём в localStorage      */
/*  и достаём после возврата.                                          */
/* ------------------------------------------------------------------ */

function draftKey(chapter: string) {
  return `pole:draft:${chapter}`;
}

function saveDraft(chapter: string, answers: Record<string, unknown>, startedAt: number) {
  try {
    if (!answers || Object.keys(answers).length === 0) return;
    localStorage.setItem(draftKey(chapter), JSON.stringify({ answers, startedAt }));
  } catch {}
}

function readDraft(chapter: string): { answers: Record<string, unknown>; startedAt: number } | null {
  try {
    const raw = localStorage.getItem(draftKey(chapter));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.answers || Object.keys(parsed.answers).length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft(chapter: string) {
  try {
    localStorage.removeItem(draftKey(chapter));
  } catch {}
}


export default function Home() {
  const {
    ready, user, state,
    saveProfile, saveChapter, recordCompletion, signOut,
  } = useAuth();

  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("chapters");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [index2, setIndex2] = useState(0);
  const [answers2, setAnswers2] = useState<Record<string, unknown>>({});
  const [index3, setIndex3] = useState(0);
  const [answers3, setAnswers3] = useState<Record<string, unknown>>({});
  const [index4, setIndex4] = useState(0);
  const [answers4, setAnswers4] = useState<Record<string, unknown>>({});
  const [index5, setIndex5] = useState(0);
  const [answers5, setAnswers5] = useState<Record<string, unknown>>({});
  const [index6, setIndex6] = useState(0);
  const [answers6, setAnswers6] = useState<Record<string, unknown>>({});
  const [index7, setIndex7] = useState(0);
  const [answers7, setAnswers7] = useState<Record<string, unknown>>({});
  const [focusFrom, setFocusFrom] = useState("tabs");
  const [fromProfile, setFromProfile] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const startedAtRef = useRef<number>(Date.now());
  const startedAt2Ref = useRef<number>(Date.now());
  const startedAt3Ref = useRef<number>(Date.now());
  const startedAt4Ref = useRef<number>(Date.now());
  const startedAt5Ref = useRef<number>(Date.now());
  const startedAt6Ref = useRef<number>(Date.now());
  const startedAt7Ref = useRef<number>(Date.now());
  const bootedRef = useRef(false);
  const recordedRef = useRef(false);
  const recorded2Ref = useRef(false);
  const recorded3Ref = useRef(false);
  const recorded4Ref = useRef(false);
  const recorded5Ref = useRef(false);
  const recorded6Ref = useRef(false);
  const recorded7Ref = useRef(false);
  const savingRef = useRef(false);

  /* --- восстановление черновика при первом рендере ---------------- */
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const draft = readDraft("ch1");
    if (draft) {
      setAnswers(draft.answers);
      startedAtRef.current = draft.startedAt || Date.now();
    }
    const draft2 = readDraft("ch2");
    if (draft2) {
      setAnswers2(draft2.answers);
      startedAt2Ref.current = draft2.startedAt || Date.now();
    }
    const draft3 = readDraft("ch3");
    if (draft3) {
      setAnswers3(draft3.answers);
      startedAt3Ref.current = draft3.startedAt || Date.now();
    }
    const draft4 = readDraft("ch4");
    if (draft4) {
      setAnswers4(draft4.answers);
      startedAt4Ref.current = draft4.startedAt || Date.now();
    }
    const draft5 = readDraft("ch5");
    if (draft5) {
      setAnswers5(draft5.answers);
      startedAt5Ref.current = draft5.startedAt || Date.now();
    }
    const draft6 = readDraft("ch6");
    if (draft6) {
      setAnswers6(draft6.answers);
      startedAt6Ref.current = draft6.startedAt || Date.now();
    }
    const draft7 = readDraft("ch7");
    if (draft7) {
      setAnswers7(draft7.answers);
      startedAt7Ref.current = draft7.startedAt || Date.now();
    }
  }, []);

  /* --- черновик пишем при каждом изменении ответов ---------------- */
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveDraft("ch1", answers, startedAtRef.current);
    }
  }, [answers]);

  useEffect(() => {
    if (Object.keys(answers2).length > 0) {
      saveDraft("ch2", answers2, startedAt2Ref.current);
    }
  }, [answers2]);

  useEffect(() => {
    if (Object.keys(answers3).length > 0) {
      saveDraft("ch3", answers3, startedAt3Ref.current);
    }
  }, [answers3]);

  useEffect(() => {
    if (Object.keys(answers4).length > 0) {
      saveDraft("ch4", answers4, startedAt4Ref.current);
    }
  }, [answers4]);

  useEffect(() => {
    if (Object.keys(answers5).length > 0) {
      saveDraft("ch5", answers5, startedAt5Ref.current);
    }
  }, [answers5]);

  useEffect(() => {
    if (Object.keys(answers6).length > 0) {
      saveDraft("ch6", answers6, startedAt6Ref.current);
    }
  }, [answers6]);

  useEffect(() => {
    if (Object.keys(answers7).length > 0) {
      saveDraft("ch7", answers7, startedAt7Ref.current);
    }
  }, [answers7]);

  const res = useMemo(() => computeResult(answers), [answers]);
  const res2 = useMemo(() => computeResult2(answers2), [answers2]);
  const res3 = useMemo(() => computeResult3(answers3), [answers3]);
  const res4 = useMemo(() => computeResult4(answers4), [answers4]);
  const res3ForBank = useMemo(() => ({ lead: res3.lead, flat: res3.flat }), [res3.lead, res3.flat]);
  const res5 = useMemo(
    () => computeResult5(answers5, res3ForBank.lead, res3ForBank.flat),
    [answers5, res3ForBank]
  );
  const res6 = useMemo(
    () => computeResult6(answers6, res3ForBank.lead, res3ForBank.flat),
    [answers6, res3ForBank]
  );

  // полный список вопросов главы 5 = базовые + подставной фальсификационный
  const questions5Full = useMemo(
    () => [...QUESTIONS5, falsificationQuestion(res3ForBank.lead, res3ForBank.flat)],
    [res3ForBank]
  );
  // глава 6 = базовые + контрольный вопрос по глаголу
  const questions6Full = useMemo(
    () => [...QUESTIONS6, contradictionQuestion(res3ForBank.lead, res3ForBank.flat)],
    [res3ForBank]
  );

  const complete = useMemo(
    () => QUESTIONS.every((qq: any) => isComplete(qq, answers[qq.id])),
    [answers]
  );
  const complete2 = useMemo(
    () => QUESTIONS2.every((qq: any) => isComplete2(qq, answers2[qq.id])),
    [answers2]
  );
  const complete3 = useMemo(
    () => QUESTIONS3.every((qq: any) => isComplete(qq, answers3[qq.id])),
    [answers3]
  );
  const complete4 = useMemo(
    () => QUESTIONS4.every((qq: any) => answers4[qq.id] != null),
    [answers4]
  );
  const complete5 = useMemo(
    () => questions5Full.every((qq: any) => isComplete5(qq, answers5[qq.id])),
    [answers5, questions5Full]
  );
  const complete6 = useMemo(
    () => questions6Full.every((qq: any) => answers6[qq.id] != null),
    [answers6, questions6Full]
  );

  // цель антисценария главы 7: субшкала с флагом противоречия из главы 6,
  // иначе — самая сильная субшкала антипрофиля
  const antiTargetSub = useMemo(
    () => (res6.contradiction ? res6.contradiction.sub : res6.exclusions[0]),
    [res6]
  );

  // глава 7 = базовые + подставной вопрос-перепроверка антипрофиля + финальный свободный
  const questions7Full = useMemo(
    () => [...QUESTIONS7_MAIN, antiScenarioQuestion(antiTargetSub), FINAL_Q7],
    [antiTargetSub]
  );

  const res7 = useMemo(
    () =>
      computeResult7(answers7, {
        verbLead: res3ForBank.lead,
        verbFlat: res3ForBank.flat,
        driverLead: res5.flat ? null : res5.lead,
        driverFlat: res5.flat,
        thinkType: res4.thinkType,
        focusType: res4.focusType,
        antiTargetSub,
      }),
    [answers7, res3ForBank, res5.lead, res5.flat, res4.thinkType, res4.focusType, antiTargetSub]
  );

  const complete7 = useMemo(
    () => questions7Full.every((qq: any) => isComplete7(qq, answers7[qq.id])),
    [answers7, questions7Full]
  );

  // резонанс: сравниваем ведущий полюс главы 1 (из зафиксированных
  // measurements, а не из текущей формулы) с процентом главы 2
  const chapter1Frozen = useMemo(() => {
    if (state.measurements && state.measurements.length) {
      const m = chapterPctFromMeasurements(state.measurements, "ch1");
      if (m.sumW > 0) return m;
    }
    return { pct: res.pct, sumW: res.sumW };
  }, [state.measurements, res]);

  const resonance = useMemo(() => {
    if (!complete2) return null;
    return computeResonance(chapter1Frozen.pct, res.lead, res2.pct);
  }, [chapter1Frozen, res.lead, res2, complete2]);

  const combined = useMemo(() => {
    if (state.measurements && state.measurements.length) {
      const c = combineProfile(state.measurements);
      if (c.sumW > 0) return c;
    }
    return res;
  }, [state.measurements, res]);

  // итоговый профиль главы 7: собирается один раз, когда есть все ответы
  const finalProfile = useMemo(() => {
    if (!complete7) return null;
    return buildFinalProfile({
      materialLead: combined.lead,
      pctByPole: combined.pct,
      verbLead: res3ForBank.lead,
      verbFlat: res3ForBank.flat,
      driverLead: res5.flat ? null : res5.lead,
      driverFlat: res5.flat,
      quadrantTitle: QUADRANTS[res4.quadrant]?.title,
      antiExclusions: res6.exclusions,
      res7,
    });
  }, [complete7, combined, res3ForBank, res5.lead, res5.flat, res4.quadrant, res6.exclusions, res7]);

  /* --- вернулись после входа: досохраняем незаписанное (глава 1) --- */
  useEffect(() => {
    if (!ready || !user) return;
    if (state.ch1) return;        // уже есть в базе
    if (!complete) return;         // глава не пройдена
    if (savingRef.current) return;

    savingRef.current = true;
    (async () => {
      const measurements = ORDER.map((pole: string) => ({
        pole,
        kind: "ipsative" as string,
        value: res.pct[pole],
        weight: res.sumW,
      }));
      await saveChapter("ch1", answers, measurements);
      clearDraft("ch1");
      setScreen("tabs");
      setTab("me");
      savingRef.current = false;
    })();
  }, [ready, user, state.ch1, complete, answers, res, saveChapter]);

  /* --- есть сохранённая глава 1: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch1 && !complete) {
      setAnswers(state.ch1.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch1, complete]);

  /* --- есть сохранённая глава 2: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch2 && !complete2) {
      setAnswers2(state.ch2.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch2, complete2]);

  /* --- есть сохранённая глава 3: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch3 && !complete3) {
      setAnswers3(state.ch3.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch3, complete3]);

  /* --- есть сохранённая глава 4: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch4 && !complete4) {
      setAnswers4(state.ch4.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch4, complete4]);

  /* --- есть сохранённая глава 5: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch5 && !complete5) {
      setAnswers5(state.ch5.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch5, complete5]);

  /* --- есть сохранённая глава 6: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch6 && !complete6) {
      setAnswers6(state.ch6.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch6, complete6]);

  /* --- есть сохранённая глава 7: подтягиваем ----------------------- */
  useEffect(() => {
    if (ready && user && state.ch7 && !complete7) {
      setAnswers7(state.ch7.answers as Record<string, unknown>);
    }
  }, [ready, user, state.ch7, complete7]);

  useEffect(() => {
    if (ready && user && (state.ch1 || state.ch2 || state.ch3 || state.ch4 || state.ch5 || state.ch6 || state.ch7) && screen === "welcome") {
      setScreen("tabs");
      setTab("me");
    }
  }, [ready, user, state.ch1, state.ch2, state.ch3, state.ch4, state.ch5, state.ch6, state.ch7]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ block: "start" });
  }, [screen, index, index2, index3, index4, index5, index6, index7, tab]);

  const q = QUESTIONS[index];
  const q2 = QUESTIONS2[index2];
  const q3 = QUESTIONS3[index3];
  const q4 = QUESTIONS4[index4];
  const q5 = questions5Full[index5];
  const q6 = questions6Full[index6];
  const q7 = questions7Full[index7];

  /* --- завершение главы 1 ------------------------------------------ */
  const finish = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    if (!recordedRef.current) {
      recordedRef.current = true;
      recordCompletion({
        chapter: "ch1",
        leadPole: res.flat ? null : res.lead,
        scores: ORDER.reduce((acc: any, p: string) => {
          acc[p] = Math.round(res.pct[p] * 10) / 10;
          return acc;
        }, {}),
        isFlat: res.flat,
        hasGap: !!res.controlGap,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = ORDER.map((pole: string) => ({
        pole,
        kind: "ipsative" as string,
        value: res.pct[pole],
        weight: res.sumW,
      }));
      await saveChapter("ch1", answers, measurements);
      clearDraft("ch1");
    }
    setScreen("result");
  }, [answers, res, saveChapter, recordCompletion, user]);

  /* --- завершение главы 2 ------------------------------------------ */
  const finish2 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt2Ref.current) / 1000));

    if (!recorded2Ref.current) {
      recorded2Ref.current = true;
      recordCompletion({
        chapter: "ch2",
        leadPole: res2.lead,
        scores: ORDER.reduce((acc: any, p: string) => {
          acc[p] = Math.round(res2.pct[p] * 10) / 10;
          return acc;
        }, {}),
        isFlat: false,
        hasGap: resonance ? resonance.level === "gap" : false,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = [
        ...ORDER.map((pole: string) => ({
          pole,
          kind: "ipsative" as string,
          value: res2.pct[pole],
          weight: res2.sumW,
        })),
        ...Object.entries(res2.norm).map(([pole, value]: any) => ({
          pole,
          kind: "normative" as string,
          value,
          weight: 1,
        })),
      ];
      await saveChapter("ch2", answers2, measurements);
      clearDraft("ch2");
    }
    setScreen("result2");
  }, [answers2, res2, resonance, saveChapter, recordCompletion, user]);

  /* --- завершение главы 3 ------------------------------------------ */
  const finish3 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt3Ref.current) / 1000));
    const cross = crossCheck3(combined.lead, res3.lead);

    if (!recorded3Ref.current) {
      recorded3Ref.current = true;
      recordCompletion({
        chapter: "ch3",
        leadPole: res3.flat ? null : res3.lead,
        scores: VERBS.reduce((acc: any, v: string) => {
          acc[v] = Math.round(res3.pct[v] * 10) / 10;
          return acc;
        }, {}),
        isFlat: res3.flat,
        hasGap: !!cross,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = [
        ...VERBS.map((pole: string) => ({
          pole,
          kind: "ipsative" as string,
          value: res3.pct[pole],
          weight: res3.sumW,
        })),
        ...Object.entries(res3.norm).map(([pole, value]: any) => ({
          pole,
          kind: "normative" as string,
          value,
          weight: 1,
        })),
      ];
      await saveChapter("ch3", answers3, measurements);
      clearDraft("ch3");
    }
    setScreen("result3");
  }, [answers3, res3, combined, saveChapter, recordCompletion, user]);

  /* --- завершение главы 4 ------------------------------------------ */
  const finish4 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt4Ref.current) / 1000));
    const cross4 = res3.flat ? null : crossCheck4(res3.lead, res4.thinkType, res4.focusType);

    if (!recorded4Ref.current) {
      recorded4Ref.current = true;
      recordCompletion({
        chapter: "ch4",
        leadPole: res4.quadrant,
        scores: { A: Math.round(res4.pctA * 10) / 10, B: Math.round(res4.pctB * 10) / 10 },
        isFlat: false,
        hasGap: cross4 ? !cross4.matched : false,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = [
        { pole: "A", kind: "continuous" as string, value: res4.pctA, weight: res4.wA },
        { pole: "B", kind: "continuous" as string, value: res4.pctB, weight: res4.wB },
      ];
      await saveChapter("ch4", answers4, measurements);
      clearDraft("ch4");
    }
    setScreen("result4");
  }, [answers4, res3, res4, saveChapter, recordCompletion, user]);

  /* --- завершение главы 5 ------------------------------------------ */
  const finish5 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt5Ref.current) / 1000));

    if (!recorded5Ref.current) {
      recorded5Ref.current = true;
      recordCompletion({
        chapter: "ch5",
        leadPole: res5.flat ? null : res5.lead,
        scores: DRIVERS.reduce((acc: any, d: string) => {
          acc[d] = Math.round(res5.pct[d] * 10) / 10;
          return acc;
        }, { density: Math.round(res5.density) }),
        isFlat: res5.flat,
        hasGap: res5.falsification === "broken",
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = [
        ...DRIVERS.map((pole: string) => ({
          pole, kind: "ipsative" as string, value: res5.pct[pole], weight: res5.sumW,
        })),
        { pole: "density", kind: "normative" as string, value: res5.density, weight: 2.8 },
      ];
      await saveChapter("ch5", answers5, measurements);
      clearDraft("ch5");
    }
    setScreen("result5");
  }, [answers5, res5, saveChapter, recordCompletion, user]);

  /* --- завершение главы 6 ------------------------------------------ */
  const finish6 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt6Ref.current) / 1000));

    if (!recorded6Ref.current) {
      recorded6Ref.current = true;
      recordCompletion({
        chapter: "ch6",
        leadPole: res6.exclusions[0] || null,
        scores: SUBSCALES.reduce((acc: any, sub: string) => {
          acc[sub] = Math.round(res6.score[sub] * 10) / 10;
          return acc;
        }, {}),
        isFlat: res6.soft,
        hasGap: !!res6.contradiction,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = SUBSCALES.map((sub: string) => ({
        pole: sub, kind: "antiprofile" as string, value: res6.score[sub], weight: 1,
      }));
      await saveChapter("ch6", answers6, measurements);
      clearDraft("ch6");
    }
    setScreen("result6");
  }, [answers6, res6, saveChapter, recordCompletion, user]);

  /* --- завершение главы 7 (финал MVP) ------------------------------- */
  const finish7 = useCallback(async () => {
    const secs = Math.max(1, Math.round((Date.now() - startedAt7Ref.current) / 1000));

    if (!recorded7Ref.current) {
      recorded7Ref.current = true;
      recordCompletion({
        chapter: "ch7",
        leadPole: res7.combinedVerb || null,
        scores: CONSTRAINTS.reduce((acc: any, k: string) => {
          acc[k] = Math.round(res7.constraints[k].score * 10) / 10;
          return acc;
        }, {}),
        isFlat: false,
        hasGap: res7.verbMatch === false || res7.driverMatch === false,
        secondsSpent: secs,
        savedAccount: !!user,
      });
    }

    if (user) {
      const measurements = [
        ...CONSTRAINTS.map((k: string) => ({
          pole: k, kind: "normative" as string, value: res7.constraints[k].score, weight: 1,
        })),
        ...(res7.scenarioVerb
          ? [{ pole: res7.scenarioVerb, kind: "behavioral_scenario" as string, value: 100, weight: 1.4 }]
          : []),
        ...(res7.scenarioDriver
          ? [{ pole: res7.scenarioDriver, kind: "behavioral_scenario" as string, value: 100, weight: 1.2 }]
          : []),
      ];
      await saveChapter("ch7", answers7, measurements);
      clearDraft("ch7");
    }
    setScreen("result7");
  }, [answers7, res7, saveChapter, recordCompletion, user]);

  const next = () => {
    if (index === QUESTIONS.length - 1) finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index === 0) setScreen("welcome");
    else setIndex((i) => i - 1);
  };

  const next2 = () => {
    if (index2 === QUESTIONS2.length - 1) finish2();
    else setIndex2((i) => i + 1);
  };

  const back2 = () => {
    if (index2 === 0) setScreen("tabs");
    else setIndex2((i) => i - 1);
  };

  const next3 = () => {
    if (index3 === QUESTIONS3.length - 1) finish3();
    else setIndex3((i) => i + 1);
  };

  const back3 = () => {
    if (index3 === 0) setScreen("tabs");
    else setIndex3((i) => i - 1);
  };

  const next4 = () => {
    if (index4 === QUESTIONS4.length - 1) finish4();
    else setIndex4((i) => i + 1);
  };

  const back4 = () => {
    if (index4 === 0) setScreen("tabs");
    else setIndex4((i) => i - 1);
  };

  const next5 = () => {
    if (index5 === questions5Full.length - 1) finish5();
    else setIndex5((i) => i + 1);
  };

  const back5 = () => {
    if (index5 === 0) setScreen("tabs");
    else setIndex5((i) => i - 1);
  };

  const next6 = () => {
    if (index6 === questions6Full.length - 1) finish6();
    else setIndex6((i) => i + 1);
  };

  const back6 = () => {
    if (index6 === 0) setScreen("tabs");
    else setIndex6((i) => i - 1);
  };

  const next7 = () => {
    if (index7 === questions7Full.length - 1) finish7();
    else setIndex7((i) => i + 1);
  };

  const back7 = () => {
    if (index7 === 0) setScreen("tabs");
    else setIndex7((i) => i - 1);
  };

  const restart = () => {
    clearDraft("ch1");
    recordedRef.current = false;
    startedAtRef.current = Date.now();
    setAnswers({});
    setIndex(0);
    setScreen("intro");
  };

  const restart2 = () => {
    clearDraft("ch2");
    recorded2Ref.current = false;
    startedAt2Ref.current = Date.now();
    setAnswers2({});
    setIndex2(0);
    setScreen("intro2");
  };

  const restart3 = () => {
    clearDraft("ch3");
    recorded3Ref.current = false;
    startedAt3Ref.current = Date.now();
    setAnswers3({});
    setIndex3(0);
    setScreen("intro3");
  };

  const restart4 = () => {
    clearDraft("ch4");
    recorded4Ref.current = false;
    startedAt4Ref.current = Date.now();
    setAnswers4({});
    setIndex4(0);
    setScreen("intro4");
  };

  const restart5 = () => {
    clearDraft("ch5");
    recorded5Ref.current = false;
    startedAt5Ref.current = Date.now();
    setAnswers5({});
    setIndex5(0);
    setScreen("intro5");
  };

  const restart6 = () => {
    clearDraft("ch6");
    recorded6Ref.current = false;
    startedAt6Ref.current = Date.now();
    setAnswers6({});
    setIndex6(0);
    setScreen("intro6");
  };

  const restart7 = () => {
    clearDraft("ch7");
    recorded7Ref.current = false;
    startedAt7Ref.current = Date.now();
    setAnswers7({});
    setIndex7(0);
    setScreen("intro7");
  };

  const handleSignOut = useCallback(async () => {
    clearDraft("ch1");
    clearDraft("ch2");
    clearDraft("ch3");
    clearDraft("ch4");
    clearDraft("ch5");
    clearDraft("ch6");
    clearDraft("ch7");
    recordedRef.current = false;
    recorded2Ref.current = false;
    recorded3Ref.current = false;
    recorded4Ref.current = false;
    recorded5Ref.current = false;
    recorded6Ref.current = false;
    recorded7Ref.current = false;
    savingRef.current = false;
    startedAtRef.current = Date.now();
    startedAt2Ref.current = Date.now();
    startedAt3Ref.current = Date.now();
    startedAt4Ref.current = Date.now();
    startedAt5Ref.current = Date.now();
    startedAt6Ref.current = Date.now();
    startedAt7Ref.current = Date.now();
    await signOut();
    setAnswers({});
    setAnswers2({});
    setAnswers3({});
    setAnswers4({});
    setAnswers5({});
    setAnswers6({});
    setAnswers7({});
    setIndex(0);
    setIndex2(0);
    setIndex3(0);
    setIndex4(0);
    setIndex5(0);
    setIndex6(0);
    setIndex7(0);
    setTab("chapters");
    setFromProfile(false);
    setScreen("welcome");
  }, [signOut]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bg }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          border: `3px solid ${C.faint}`,
          borderTopColor: C.accent,
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const showTabs = screen === "tabs";
  const hasCh1 = !!state.ch1 || complete;
  const hasCh2 = !!state.ch2 || complete2;
  const hasCh3 = !!state.ch3 || complete3;
  const hasCh4 = !!state.ch4 || complete4;
  const hasCh5 = !!state.ch5 || complete5;
  const hasCh6 = !!state.ch6 || complete6;
  const hasCh7 = !!state.ch7 || complete7;

  const focusNow = focusCount(hasCh1, hasCh2, hasCh3, hasCh4, hasCh5, hasCh6, hasCh1 ? res : null, hasCh7, finalProfile ? finalProfile.roles.length : null);
  const focusNames = hasCh7 && finalProfile
    ? finalProfile.roles.map((r: any) => r.name)
    : narrowDirections({
        pctByPole: hasCh1 ? (combined ? combined.pct : res.pct) : null,
        verbRanked: hasCh3 && !res3.flat ? res3.ranked : null,
        antiHigh: hasCh6 ? res6.exclusions : null,
        limit: focusNow,
      });
  const focusHistory = narrowingHistory(hasCh1, hasCh2, hasCh3, hasCh4, hasCh5, hasCh6, hasCh1 ? res : null, hasCh7, finalProfile ? finalProfile.roles.length : null);

  const mood =
    screen === "q"
      ? POLES[ORDER[index % ORDER.length]].color
      : screen === "q2"
      ? POLES[ORDER[index2 % ORDER.length]].color
      : screen === "q3"
      ? VERB_META[VERBS[index3 % VERBS.length]].color
      : screen === "q4"
      ? C.accent
      : screen === "q5"
      ? DRIVER_META[DRIVERS[index5 % DRIVERS.length]].color
      : screen === "q6"
      ? SUB_META[SUBSCALES[index6 % SUBSCALES.length]].color
      : screen === "q7"
      ? C.accent
      : (screen === "result" || screen === "tabs") && res && !res.flat && complete
      ? POLES[res.lead].color
      : C.accent;

  return (
    <Shell mood={mood}>
      <div ref={topRef} style={{ position: "absolute", top: 0 }} />

      {screen === "welcome" && (
        <Welcome
          user={user}
          onStart={() => {
            clearDraft("ch1");
            recordedRef.current = false;
            startedAtRef.current = Date.now();
            setAnswers({});
            setIndex(0);
            setScreen("intro");
          }}
          onLogin={() => setScreen("login")}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "login" && (
        <div style={{ paddingTop: 20 }}>
          <button
            className="tap"
            onClick={() => setScreen("welcome")}
            style={{ background: "none", border: "none", color: C.accent, fontFamily: SANS, fontSize: 17, padding: "0 0 8px" }}
          >
            ← Назад
          </button>
          <AuthGate context="login" />
        </div>
      )}

      {screen === "intro" && (
        <Intro
          onStart={() => { setIndex(0); setScreen("q"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro2" && (
        <Intro2
          onStart={() => { setIndex2(0); setScreen("q2"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro3" && (
        <Intro3
          onStart={() => { setIndex3(0); setScreen("q3"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro4" && (
        <Intro4
          onStart={() => { setIndex4(0); setScreen("q4"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro5" && (
        <IntroChapter
          eyebrow="Глава пятая · 71%"
          titleTop="Что тебя"
          titleBottom="заряжает"
          lead="Ты уже знаешь, что делаешь и как думаешь. Осталось понять, ради чего ты это делаешь — и не сломается ли всё, что мы собрали, об эту правду."
          sub="Последний вопрос будет подставным: мы намеренно попробуем сломать гипотезу четырёх глав."
          footer="10 вопросов · 3 минуты · открывает «что тебя держит»"
          onStart={() => { setIndex5(0); setScreen("q5"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro6" && (
        <IntroChapter
          eyebrow="Глава шестая · 86%"
          titleTop="Что тебя"
          titleBottom="выключает"
          lead="Мы почти не спросим, чего ты хочешь. Мы спросим, от чего ты уйдёшь через полгода — даже если зарплата хорошая."
          sub="Самая практичная глава: после неё будет список сред, куда не стоит идти, даже если позовут на хорошие деньги."
          footer="9 вопросов · 2 минуты · открывает «антипрофиль»"
          onStart={() => { setIndex6(0); setScreen("q6"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "intro7" && (
        <IntroChapter
          eyebrow="Глава седьмая · последняя"
          titleTop="Последняя"
          titleBottom="проверка"
          lead="Осталась одна глава. Она не ищет в тебе ничего нового — она проверяет, выдержит ли всё собранное живой выбор, а не анкету."
          sub="Один большой поведенческий сценарий сталкивает всё, что мы уже узнали, разом — и после него мы соберём твой итоговый профиль с 1–3 направлениями."
          footer="10 вопросов · 3–3,5 минуты · открывает «твой профиль»"
          onStart={() => { setIndex7(0); setScreen("q7"); }}
          user={user}
          onProfile={() => { setScreen("tabs"); setTab("me"); }}
        />
      )}

      {screen === "focus" && (
        <FocusScreen
          count={focusNow}
          names={focusNames}
          history={focusHistory}
          onBack={() => setScreen(focusFrom)}
        />
      )}

      {screen === "q" && (
        <QuestionScreen
          key={q.id}
          q={q} index={index} total={QUESTIONS.length} answer={answers[q.id]}
          onAnswer={(v: unknown) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          onBack={back} onNext={next}
        />
      )}

      {screen === "q2" && (
        <QuestionScreen
          key={q2.id}
          q={q2} index={index2} total={QUESTIONS2.length} answer={answers2[q2.id]}
          onAnswer={(v: unknown) => setAnswers2((a) => ({ ...a, [q2.id]: v }))}
          onBack={back2} onNext={next2}
        />
      )}

      {screen === "q3" && (
        <QuestionScreen
          key={q3.id}
          q={q3} index={index3} total={QUESTIONS3.length} answer={answers3[q3.id]}
          onAnswer={(v: unknown) => setAnswers3((a) => ({ ...a, [q3.id]: v }))}
          onBack={back3} onNext={next3}
        />
      )}

      {screen === "q4" && (
        <QuestionScreen
          key={q4.id}
          q={q4} index={index4} total={QUESTIONS4.length} answer={answers4[q4.id]}
          onAnswer={(v: unknown) => setAnswers4((a) => ({ ...a, [q4.id]: v }))}
          onBack={back4} onNext={next4}
        />
      )}

      {screen === "q5" && (
        <QuestionScreen
          key={q5.id}
          q={q5} index={index5} total={questions5Full.length} answer={answers5[q5.id]}
          onAnswer={(v: unknown) => setAnswers5((a) => ({ ...a, [q5.id]: v }))}
          onBack={back5} onNext={next5}
        />
      )}

      {screen === "q6" && (
        <QuestionScreen
          key={q6.id}
          q={q6} index={index6} total={questions6Full.length} answer={answers6[q6.id]}
          onAnswer={(v: unknown) => setAnswers6((a) => ({ ...a, [q6.id]: v }))}
          onBack={back6} onNext={next6}
        />
      )}

      {screen === "q7" && (
        <QuestionScreen
          key={q7.id}
          q={q7} index={index7} total={questions7Full.length} answer={answers7[q7.id]}
          onAnswer={(v: unknown) => setAnswers7((a) => ({ ...a, [q7.id]: v }))}
          onBack={back7} onNext={next7}
        />
      )}

      {screen === "result" && (
        <Result
          res={res}
          saved={!!user}
          onBack={fromProfile ? () => { setFromProfile(false); setScreen("tabs"); } : undefined}
          onNext={() => {
            if (fromProfile) { setFromProfile(false); setScreen("tabs"); }
            else if (user && state.profile) { setScreen("tabs"); setTab("me"); }
            else if (user) { setScreen("save"); }
            else { setScreen("auth"); }
          }}
          onRestart={restart}
        />
      )}

      {screen === "result2" && resonance && (
        <Result2
          res1={{ pct: chapter1Frozen.pct, lead: res.lead }}
          res2={res2}
          resonance={resonance}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart2}
        />
      )}

      {screen === "result3" && (
        <Result3
          res3={res3}
          materialLead={combined ? combined.lead : null}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart3}
        />
      )}

      {screen === "result4" && (
        <Result4
          res4={res4}
          verbLead={res3.flat ? null : res3.lead}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart4}
        />
      )}

      {screen === "result5" && (
        <Result5
          res5={res5}
          verbLead={res3.flat ? null : res3.lead}
          materialLead={combined ? combined.lead : res.lead}
          quadrantTitle={hasCh4 ? QUADRANTS[res4.quadrant].title : null}
          resonanceLevel={resonance ? resonance.level : null}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart5}
        />
      )}

      {screen === "result6" && (
        <Result6
          res6={res6}
          verbLead={res3.flat ? null : res3.lead}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart6}
        />
      )}

      {screen === "result7" && finalProfile && (
        <Result7
          res7={res7}
          finalProfile={finalProfile}
          onNext={() => { setFromProfile(false); setScreen("tabs"); setTab("me"); }}
          onRestart={restart7}
        />
      )}

      {screen === "auth" && (
        <div style={{ paddingTop: 20 }}>
          <button
            className="tap"
            onClick={() => setScreen("result")}
            style={{ background: "none", border: "none", color: C.accent, fontFamily: SANS, fontSize: 17, padding: "0 0 16px" }}
          >
            ← Назад
          </button>
          <AuthGate context="save" />
          <button
            className="tap"
            onClick={() => { setScreen("tabs"); setTab("chapters"); }}
            style={{ width: "100%", background: "none", border: "none", color: C.dim, fontFamily: SANS, fontSize: 15, padding: "16px 0", marginTop: 8 }}
          >
            Не сейчас — результат не сохранится
          </button>
        </div>
      )}

      {screen === "save" && (
        <SaveProfile
          initial={state.profile}
          onSave={async (p: any) => {
            await saveProfile(p);
            setScreen("tabs");
            setTab("me");
          }}
          onSkip={() => { setScreen("tabs"); setTab("chapters"); }}
        />
      )}

      {showTabs && (
        <>
          {tab === "chapters" && (
            <Map
              res={hasCh1 ? res : null}
              res2={hasCh2 ? res2 : null}
              res3={hasCh3 ? res3 : null}
              res4={hasCh4 ? res4 : null}
              res5={hasCh5 ? res5 : null}
              res6={hasCh6 ? res6 : null}
              res7={hasCh7 ? res7 : null}
              done={hasCh1}
              done2={hasCh2}
              done3={hasCh3}
              done4={hasCh4}
              done5={hasCh5}
              done6={hasCh6}
              done7={hasCh7}
              focus={focusNow}
              onOpenFocus={() => { setFocusFrom("tabs"); setScreen("focus"); }}
              onOpenResult={() => { setFromProfile(true); setScreen("result"); }}
              onOpenResult2={() => { setFromProfile(true); setScreen("result2"); }}
              onOpenResult3={() => { setFromProfile(true); setScreen("result3"); }}
              onOpenResult4={() => { setFromProfile(true); setScreen("result4"); }}
              onOpenResult5={() => { setFromProfile(true); setScreen("result5"); }}
              onOpenResult6={() => { setFromProfile(true); setScreen("result6"); }}
              onOpenResult7={() => { setFromProfile(true); setScreen("result7"); }}
              onStart={() => {
                clearDraft("ch1");
                recordedRef.current = false;
                startedAtRef.current = Date.now();
                setAnswers({}); setIndex(0); setScreen("q");
              }}
              onStart2={() => {
                clearDraft("ch2");
                recorded2Ref.current = false;
                startedAt2Ref.current = Date.now();
                setAnswers2({}); setIndex2(0); setScreen("intro2");
              }}
              onStart3={() => {
                clearDraft("ch3");
                recorded3Ref.current = false;
                startedAt3Ref.current = Date.now();
                setAnswers3({}); setIndex3(0); setScreen("intro3");
              }}
              onStart4={() => {
                clearDraft("ch4");
                recorded4Ref.current = false;
                startedAt4Ref.current = Date.now();
                setAnswers4({}); setIndex4(0); setScreen("intro4");
              }}
              onStart5={() => {
                clearDraft("ch5");
                recorded5Ref.current = false;
                startedAt5Ref.current = Date.now();
                setAnswers5({}); setIndex5(0); setScreen("intro5");
              }}
              onStart6={() => {
                clearDraft("ch6");
                recorded6Ref.current = false;
                startedAt6Ref.current = Date.now();
                setAnswers6({}); setIndex6(0); setScreen("intro6");
              }}
              onStart7={() => {
                clearDraft("ch7");
                recorded7Ref.current = false;
                startedAt7Ref.current = Date.now();
                setAnswers7({}); setIndex7(0); setScreen("intro7");
              }}
            />
          )}
          {tab === "me" && (
            <Profile
              state={state} res={res} res3={hasCh3 ? res3 : null} res4={hasCh4 ? res4 : null}
              res5={hasCh5 ? res5 : null} res6={hasCh6 ? res6 : null} res7={hasCh7 ? res7 : null}
              finalProfile={hasCh7 ? finalProfile : null} combined={combined}
              done={hasCh1}
              done2={hasCh2}
              done3={hasCh3}
              done4={hasCh4}
              done5={hasCh5}
              done6={hasCh6}
              done7={hasCh7}
              focus={focusNow}
              onOpenFocus={() => { setFocusFrom("tabs"); setScreen("focus"); }}
              user={user}
              onOpenResult={() => { setFromProfile(true); setScreen("result"); }}
              onOpenResult2={() => { setFromProfile(true); setScreen("result2"); }}
              onOpenResult3={() => { setFromProfile(true); setScreen("result3"); }}
              onOpenResult4={() => { setFromProfile(true); setScreen("result4"); }}
              onOpenResult5={() => { setFromProfile(true); setScreen("result5"); }}
              onOpenResult6={() => { setFromProfile(true); setScreen("result6"); }}
              onOpenResult7={() => { setFromProfile(true); setScreen("result7"); }}
              onEdit={() => setScreen("save")}
              onReset={restart}
              onSignOut={handleSignOut}
            />
          )}
          <TabBar tab={tab} onTab={setTab} />
        </>
      )}
    </Shell>
  );
}
