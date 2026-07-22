"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Токены                                                             */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#191714",
  bgDeep: "#131110",
  surface: "#221F1B",
  surfaceUp: "#2A2621",
  line: "rgba(255,255,255,0.09)",
  lineSoft: "rgba(255,255,255,0.05)",
  text: "#EDE8DF",
  dim: "#A79F94",
  faint: "#6E675E",
};

const SERIF = "'Charter', 'Iowan Old Style', Georgia, 'Times New Roman', serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace";

const POLES = {
  L: { key: "L", letter: "Л", name: "Люди", to: "к людям", thanks: "за то, что ты понимаешь людей", color: "#DC8A6B" },
  S: { key: "S", letter: "С", name: "Системы", to: "к системам и логике", thanks: "за то, что ты разбираешься в сложном", color: "#79A0BE" },
  M: { key: "M", letter: "М", name: "Материя", to: "к тому, что можно сделать руками", thanks: "за то, что ты берёшь и делаешь", color: "#B39B57" },
  O: { key: "O", letter: "О", name: "Образы", to: "к идеям и форме", thanks: "за то, что ты умеешь объяснять", color: "#9E86BE" },
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
      color: color || C.faint,
    }}
  >
    {children}
  </div>
);

function Ticks({ total, done }: any) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 2,
            borderRadius: 2,
            background: i < done ? C.text : "rgba(255,255,255,0.12)",
            transition: "background 300ms ease",
          }}
        />
      ))}
    </div>
  );
}

function Card({ children, style }: any) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: 20,
        ...style,
      }}
    >
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
        minHeight: 54,
        borderRadius: 14,
        border: solid ? "none" : `1px solid ${C.line}`,
        background: disabled ? "rgba(255,255,255,0.06)" : solid ? C.text : "transparent",
        color: disabled ? C.faint : solid ? C.bgDeep : C.text,
        fontFamily: SANS,
        fontSize: 16,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        transition: "transform 120ms ease, opacity 150ms ease",
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Экран: вступление                                                  */
/* ------------------------------------------------------------------ */

function Intro({ onStart }) {
  return (
    <div style={{ paddingTop: 48 }}>
      <Eyebrow>Глава первая</Eyebrow>
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 42,
          lineHeight: 1.05,
          margin: "14px 0 0",
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        К чему тебя
        <br />
        тянет
      </h1>

      <div style={{ margin: "32px 0 14px" }}>
        <MaterialBand values={{ L: 25, S: 25, M: 25, O: 25 }} feather={9.5} height={72} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        {ORDER.map((p) => (
          <div key={p} style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
            {POLES[p].letter}
          </div>
        ))}
      </div>

      <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.5, color: C.text, margin: "0 0 16px" }}>
        11 ситуаций. Без вопросов про профессии. За 3 минуты узнаешь, какой тип задач тебе ближе всего —
        люди, идеи, системы или реальные вещи.
      </p>
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "0 0 36px" }}>
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
/*  Экран: вопрос                                                      */
/* ------------------------------------------------------------------ */

function QuestionScreen({ q, index, answer, onAnswer, onBack, onNext }: any) {
  const [pressed, setPressed] = useState(null);

  const optionStyle = (active) => ({
    width: "100%",
    textAlign: "left",
    background: active ? C.surfaceUp : C.surface,
    border: `1px solid ${active ? "rgba(255,255,255,0.28)" : C.line}`,
    borderRadius: 14,
    padding: "17px 18px",
    color: C.text,
    fontFamily: SANS,
    fontSize: 15.5,
    lineHeight: 1.45,
    cursor: "pointer",
    display: "flex",
    gap: 14,
    alignItems: "center",
    transition: "background 140ms ease, border-color 140ms ease, transform 120ms ease",
    transform: pressed === active ? "scale(0.99)" : "none",
  });

  return (
    <div style={{ paddingTop: 24 }}>
      <Ticks total={QUESTIONS.length} done={index} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
          marginBottom: 26,
        }}
      >
        <Eyebrow>
          Вопрос {String(index + 1).padStart(2, "0")} · {QUESTIONS.length}
        </Eyebrow>
        {q.tag && <Eyebrow>{q.tag}</Eyebrow>}
      </div>

      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 26,
          lineHeight: 1.25,
          fontWeight: 400,
          margin: "0 0 8px",
        }}
      >
        {q.kind === "scale" ? `«${q.text}»` : q.text}
      </h2>
      {q.hint && (
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.dim, margin: "0 0 4px", lineHeight: 1.5 }}>
          {q.hint}
        </p>
      )}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {q.kind === "single" &&
          q.options.map((o) => {
            const active = answer === o.id;
            return (
              <button
                key={o.id}
                className="tap"
                style={optionStyle(active)}
                onMouseDown={() => setPressed(active)}
                onMouseUp={() => setPressed(null)}
                onClick={() => onAnswer(o.id)}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    flexShrink: 0,
                    border: `1.5px solid ${active ? C.text : "rgba(255,255,255,0.25)"}`,
                    background: active ? C.text : "transparent",
                  }}
                />
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

        {q.kind === "scale" && <ScaleQuestion answer={answer} onAnswer={onAnswer} />}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
        <button
          className="tap"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: C.faint,
            fontFamily: SANS,
            fontSize: 15,
            padding: "12px 4px",
            cursor: "pointer",
          }}
        >
          Назад
        </button>
        <div style={{ flex: 1 }}>
          <Button onClick={onNext} disabled={!isComplete(q, answer)}>
            {index === QUESTIONS.length - 1 ? "Показать результат" : "Дальше"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function isComplete(q, a) {
  if (a == null) return false;
  if (q.kind === "rank") return a.length === q.items.length;
  if (q.kind === "distribute")
    return ORDER.reduce((s, p) => s + (a[p] || 0), 0) === q.total;
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
            className="tap"
            onClick={() => toggle(item.id)}
            style={{
              width: "100%",
              textAlign: "left",
              background: active ? C.surfaceUp : C.surface,
              border: `1px solid ${active ? color + "88" : C.line}`,
              borderRadius: 14,
              padding: "16px 18px",
              color: C.text,
              fontFamily: SANS,
              fontSize: 15.5,
              lineHeight: 1.4,
              cursor: "pointer",
              display: "flex",
              gap: 14,
              alignItems: "center",
              transition: "all 150ms ease",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                fontFamily: MONO,
                fontSize: 13,
                background: active ? color : "transparent",
                color: active ? C.bgDeep : C.faint,
                border: active ? "none" : "1px dashed rgba(255,255,255,0.2)",
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
  const val = answer || { L: 0, S: 0, M: 0, O: 0 };
  const used = ORDER.reduce((s, p) => s + (val[p] || 0), 0);
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
        const color = POLES[item.pole].color;
        const v = val[item.pole] || 0;
        return (
          <div
            key={item.pole}
            style={{
              background: C.surface,
              border: `1px solid ${v > 0 ? color + "66" : C.line}`,
              borderRadius: 14,
              padding: "14px 14px 14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
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

const stepBtn = (enabled: boolean) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: enabled ? "rgba(255,255,255,0.06)" : "transparent",
  color: enabled ? C.text : C.faint,
  fontSize: 18,
  lineHeight: 1,
  cursor: enabled ? "pointer" : "default",
  fontFamily: SANS,
});

function ScaleQuestion({ answer, onAnswer }: any) {
  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = answer === n;
          return (
            <button
              key={n}
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Eyebrow>совсем не про меня</Eyebrow>
        <Eyebrow>очень похоже на меня</Eyebrow>
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
            background: "rgba(255,255,255,0.07)",
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
      <h3 style={{ fontFamily: SERIF, fontSize: 23, lineHeight: 1.25, fontWeight: 400, margin: "0 0 14px" }}>
        {t.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: C.text, margin: 0 }}>{t.body}</p>
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
      <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.dim, margin: "6px 0 0" }}>
        {text}
      </p>
    </div>
  );
}

function Result({ res, onNext, onRestart, saved, onBack }: any) {
  const [details, setDetails] = useState(false);
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
    <div style={{ paddingTop: 28 }}>
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

      <div style={{ margin: "22px 0 12px" }}>
        <MaterialBand values={res.pct} feather={res.H} height={76} animate />
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

      <Button onClick={onNext}>
        {onBack ? "Вернуться в профиль" : saved ? "Открыть профиль" : "Сохранить результат"}
      </Button>

      <button
        className="tap"
        onClick={() => setDetails(!details)}
        style={{
          marginTop: 18,
          background: "transparent",
          border: "none",
          color: C.faint,
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

      {details && (
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
/*  Экран: карта глав                                                  */
/* ------------------------------------------------------------------ */

const CHAPTERS = [
  { state: "done", title: "Твоё поле", note: "открыто · 24 направления в фокусе" },
  {
    state: "next",
    title: "Глава 2. За что тебя уже ценят другие люди",
    note: "9 вопросов, 2 минуты",
    sub: "проверит то, что мы предположили сейчас",
  },
  { state: "locked", title: "Глава 3. Глагол, который тебе идёт" },
  { state: "locked", title: "Глава 4. Как думает твоя голова" },
  { state: "locked", title: "Что тебя выключает", at: "откроется на 67%" },
  { state: "hidden", title: "Раздел ещё не назван", at: "откроется на 83%" },
];

function Map({ res, done, onOpenResult, onStart }: any) {
  return (
    <div style={{ paddingTop: 36 }}>
      <Eyebrow>Твой профиль · изучен на 8%</Eyebrow>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 32,
          lineHeight: 1.15,
          fontWeight: 400,
          margin: "12px 0 6px",
        }}
      >
        Твоё поле открыто
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 15, color: C.dim, margin: "0 0 24px" }}>
        Одна глава из шести пройдена. Остальное пока закрыто.
      </p>

      <div style={{ marginBottom: 30 }}>
        <MaterialBand values={res.pct} feather={res.H} height={40} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CHAPTERS.map((ch, i) => {
          const locked = ch.state === "locked" || ch.state === "hidden";
          return (
            <div
              key={i}
              style={{
                background: ch.state === "next" ? C.surfaceUp : C.surface,
                border: `1px solid ${ch.state === "next" ? "rgba(255,255,255,0.22)" : C.line}`,
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
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

      <div style={{ marginTop: 22 }}>
        <Button variant="ghost" onClick={done ? onOpenResult : onStart}>
          {done ? "Смотреть результат главы 1" : "Пройти главу 1"}
        </Button>
      </div>
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
/*  Экран входа                                                         */
/* ------------------------------------------------------------------ */

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: C.bgDeep,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: "15px 16px",
  color: C.text,
  fontFamily: SANS,
  fontSize: 16,
};

function AuthGate() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const err = await fn(email.trim(), password);
    setLoading(false);
    if (err) {
      if (err.includes("Invalid login")) setError("Неверная почта или пароль");
      else if (err.includes("already registered")) setError("Эта почта уже зарегистрирована. Попробуй войти.");
      else if (err.includes("Password should be")) setError("Пароль должен быть не короче 6 символов");
      else setError(err);
    }
  };

  const ok = email.includes("@") && password.length >= 6;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`.tap:active{transform:scale(0.985)}.tap:focus-visible{outline:2px solid #EDE8DF;outline-offset:3px}button{-webkit-tap-highlight-color:transparent}input::placeholder{color:#6E675E}input:focus{border-color:rgba(255,255,255,0.28)!important;outline:none}@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`}</style>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 20px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, fontWeight: 400, margin: "0 0 10px" }}>Твоё поле</h1>
        <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.55, color: C.dim, margin: "0 0 36px" }}>
          {mode === "login" ? "Войди, чтобы вернуться к своим результатам." : "Создай аккаунт, чтобы сохранить прогресс на любом устройстве."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ marginBottom: 8 }}><Eyebrow>Почта</Eyebrow></div>
            <input style={fieldStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}><Eyebrow>Пароль</Eyebrow></div>
            <input style={fieldStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Не короче 6 символов" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
        </div>
        {error && <p style={{ fontFamily: SANS, fontSize: 14, color: "#DC8A6B", marginTop: 14 }}>{error}</p>}
        <div style={{ marginTop: 24 }}><Button onClick={submit} disabled={!ok || loading}>{loading ? "Секунду…" : mode === "login" ? "Войти" : "Создать аккаунт"}</Button></div>
        <button className="tap" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
          style={{ marginTop: 18, background: "transparent", border: "none", color: C.dim, fontFamily: SANS, fontSize: 14, cursor: "pointer", width: "100%", textAlign: "center" as const }}>
          {mode === "login" ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
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
        background: "rgba(19,17,16,0.92)",
        backdropFilter: "blur(12px)",
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
              color: active ? C.text : C.faint,
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
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={C.text}
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
        style={{ fontFamily: MONO, fontSize: 15 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

function Profile({ state, res, onOpenResult, onEdit, onReset, onSignOut }: any) {
  const p = state.profile;
  const done = !!state.ch1;
  const lead = res && done ? POLES[res.lead] : null;
  const date = state.ch1?.date ? new Date(state.ch1.date) : null;
  const dateLabel = date
    ? date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{ paddingTop: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
        <ProgressRing percent={done ? 8 : 0} />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, fontWeight: 400, margin: 0 }}>
            {p?.name ? p.name : "Твой профиль"}
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.dim, margin: "6px 0 0" }}>
            {done ? "Изучен на 8%. Одна глава из шести." : "Пока пусто. Первая глава всё начнёт."}
          </p>
        </div>
      </div>

      {done && res && (
        <>
          <div style={{ marginBottom: 8 }}>
            <MaterialBand values={res.pct} feather={res.H} height={44} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            {ORDER.map((k) => (
              <div key={k} style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                {POLES[k].letter} {Math.round(res.pct[k])}
              </div>
            ))}
          </div>

          <button
            className="tap"
            onClick={onOpenResult}
            style={{
              width: "100%",
              textAlign: "left",
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderLeft: `3px solid ${lead.color}`,
              borderRadius: 16,
              padding: 20,
              cursor: "pointer",
              color: C.text,
            }}
          >
            <Eyebrow>Твоё поле · открыто</Eyebrow>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 21,
                lineHeight: 1.25,
                margin: "10px 0 10px",
              }}
            >
              {TEXTS[res.lead][levelOf(res.pct[res.lead])].title}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.faint }}>
              Смотреть разбор целиком →
            </div>
          </button>

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
                    background: lead.color,
                  }}
                />
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
                  {dateLabel}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, marginTop: 5, lineHeight: 1.5 }}>
                  Первый замер: {POLES[res.lead].name.toLowerCase()} — {Math.round(res.pct[res.lead])} из 100
                </div>
              </div>
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
                  Следующая отметка появится после главы 2
                </div>
              </div>
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

      <button
        className="tap"
        onClick={onSignOut}
        style={{
          marginTop: 14,
          background: "transparent",
          border: "none",
          color: C.faint,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase" as const,
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        выйти из аккаунта
      </button>
      <button
        className="tap"
        onClick={onReset}
        style={{
          marginTop: 22,
          background: "transparent",
          border: "none",
          color: C.faint,
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
/*  Приложение                                                         */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { ready, user, state, saveProfile, saveChapter, signOut } = useAuth();
  const [screen, setScreen] = useState("intro");
  const [tab, setTab] = useState("chapters");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [fromProfile, setFromProfile] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Восстановить ответы если глава уже пройдена
  useEffect(() => {
    if (ready && user && state.ch1) {
      setAnswers(state.ch1.answers as Record<string, unknown>);
      setScreen("tabs");
      setTab("me");
    }
  }, [ready, user, state.ch1]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ block: "start" });
  }, [screen, index, tab]);

  const res = useMemo(() => computeResult(answers), [answers]);
  const q = QUESTIONS[index];

  const finish = useCallback(async () => {
    // Собрать замеры для базы
    const measurements = ORDER.map((pole) => ({
      pole,
      kind: "ipsative" as string,
      value: res.pct[pole],
      weight: res.sumW,
    }));
    await saveChapter("ch1", answers, measurements);
    setScreen("result");
  }, [answers, res, saveChapter]);

  const next = () => {
    if (index === QUESTIONS.length - 1) finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index === 0) setScreen("intro");
    else setIndex((i) => i - 1);
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setScreen("intro");
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bgDeep }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.18em" }}>загрузка…</span>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  const showTabs = screen === "tabs";

  return (
    <Shell>
      <div ref={topRef} style={{ position: "absolute", top: 0 }} />
      {screen === "intro" && (
        <Intro onStart={() => { setIndex(0); setScreen("q"); }} />
      )}
      {screen === "q" && (
        <QuestionScreen
          q={q}
          index={index}
          answer={answers[q.id]}
          onAnswer={(v: unknown) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          onBack={back}
          onNext={next}
        />
      )}
      {screen === "result" && (
        <Result
          res={res}
          saved={!!state.profile}
          onBack={fromProfile ? () => { setFromProfile(false); setScreen("tabs"); } : undefined}
          onNext={() => {
            if (fromProfile) { setFromProfile(false); setScreen("tabs"); }
            else if (state.profile) { setScreen("tabs"); setTab("me"); }
            else setScreen("save");
          }}
          onRestart={restart}
        />
      )}
      {screen === "save" && (
        <SaveProfile
          initial={state.profile}
          onSave={async (p) => {
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
              res={res}
              done={!!state.ch1}
              onOpenResult={() => { setFromProfile(true); setScreen("result"); }}
              onStart={() => { setAnswers({}); setIndex(0); setScreen("q"); }}
            />
          )}
          {tab === "me" && (
            <Profile
              state={state}
              res={res}
              onOpenResult={() => { setFromProfile(true); setScreen("result"); }}
              onEdit={() => setScreen("save")}
              onReset={async () => {
                // только сбрасываем локальный стейт для переделки
                setAnswers({});
                setIndex(0);
                setTab("chapters");
                setScreen("intro");
              }}
              onSignOut={signOut}
            />
          )}
          <TabBar tab={tab} onTab={setTab} />
        </>
      )}
    </Shell>
  );
}
