export type Opportunity = {
  id: string;
  title: string;
  sphere: string;
  grade: string;
  cost: "Free" | "Paid";
  price?: string;
  format: "Individual" | "Team-based";
  deadline: string; // ISO date
  snippet: string;
  description: string;
  steps: string[];
  url: string;
};

export const SPHERES = [
  "Computer Science",
  "Law",
  "International Relations",
  "Medicine & Biology",
  "Journalism",
  "Film & Directing",
  "Debates",
  "Business & Economics",
  "Art & Design",
] as const;

export const GRADES = ["8 Grade", "9 Grade", "10 Grade", "11 Grade", "12 Grade", "Undergrad"] as const;

export const COSTS = ["Free", "Paid"] as const;
export const FORMATS = ["Individual", "Team-based"] as const;

export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "s1",
    title: "Global Informatics Challenge",
    sphere: "Computer Science",
    grades: ["10 Grade"],
    cost: "Free",
    format: "Individual",
    deadline: "2026-09-15",
    snippet: "Международная олимпиада по алгоритмам и структурам данных с онлайн-отбором.",
    description:
      "Трёхэтапная олимпиада: онлайн-квалификация, региональный тур и международный финал. Победители получают приглашения от университетов-партнёров.",
    steps: [
      "Зарегистрируйтесь на официальном сайте",
      "Пройдите онлайн-квалификацию (2 часа, 5 задач)",
      "Получите приглашение на региональный тур",
      "Финал проходит очно осенью",
    ],
    url: "https://example.com/global-informatics",
  },
  {
    id: "s2",
    title: "Model United Nations Summit",
    sphere: "International Relations",
    grades: ["11 Grade"],
    price: "50 000 ₸",
    cost: "Paid",
    format: "Team-based",
    deadline: "2026-08-30",
    snippet: "Командная конференция по международным отношениям с делегациями из 40 стран.",
    description:
      "Участники представляют страны в смоделированных комитетах ООН, готовят позиционные документы и защищают резолюции.",
    steps: ["Соберите делегацию 3–6 человек", "Подайте заявку", "Оплатите взнос", "Подготовьте position paper"],
    url: "https://example.com/mun-summit",
  },
  {
    id: "s3",
    title: "Young Filmmakers Lab",
    sphere: "Film & Directing",
    grades: ["Undergrad"],
    cost: "Free",
    format: "Team-based",
    deadline: "2026-10-01",
    snippet: "Лаборатория короткого метра с менторами из индустрии и питчингом проектов.",
    description:
      "Шестинедельная программа: сценарное мастерство, режиссура, монтаж. Лучшие проекты получают продюсерскую поддержку.",
    steps: ["Отправьте шоурил или короткометражку", "Пройдите онлайн-интервью", "Сформируйте съёмочную группу"],
    url: "https://example.com/filmmakers-lab",
  },
  {
    id: "s4",
    title: "BioMed Research Olympiad",
    sphere: "Medicine & Biology",
    grades: ["12 Grade"],
    cost: "Free",
    format: "Individual",
    deadline: "2026-07-20",
    snippet: "Исследовательская олимпиада по биомедицине с защитой собственного проекта.",
    description:
      "Участники представляют оригинальное исследование в области биологии или медицины и защищают его перед научным жюри.",
    steps: ["Подготовьте абстракт (500 слов)", "Загрузите постер", "Защита онлайн"],
    url: "https://example.com/biomed-olympiad",
  },
  {
    id: "s5",
    title: "Debate Masters Cup",
    sphere: "Debates",
    grades: ["9 Grade"],
    price: "25 000 ₸",
    cost: "Paid",
    format: "Team-based",
    deadline: "2026-06-05",
    snippet: "Турнир по британскому парламентскому формату для школьных команд.",
    description: "Пять отборочных раундов и финал. Судьи — чемпионы национальных лиг дебатов.",
    steps: ["Зарегистрируйте команду из 2 человек", "Оплатите взнос", "Пройдите брифинг"],
    url: "https://example.com/debate-cup",
  },
  {
    id: "s6",
    title: "Future Lawyers Case Contest",
    sphere: "Law",
    grades: ["11 Grade"],
    cost: "Free",
    format: "Individual",
    deadline: "2026-11-12",
    snippet: "Кейс-чемпионат по праву: решение реальных юридических задач.",
    description: "Участники анализируют кейсы из практики и предлагают правовые решения. Финал — устная защита.",
    steps: ["Решите отборочный кейс", "Пройдите во второй тур", "Устная защита перед жюри"],
    url: "https://example.com/future-lawyers",
  },
  {
    id: "s7",
    title: "Startup Sprint for Teens",
    sphere: "Business & Economics",
    grades: ["10 Grade"],
    cost: "Free",
    format: "Team-based",
    deadline: "2026-09-01",
    snippet: "Акселератор выходного дня: от идеи до питча за 48 часов.",
    description: "Команды разрабатывают бизнес-модель, прототип и презентуют инвесторам.",
    steps: ["Соберите команду", "Подайте идею", "Пройдите 48-часовой спринт"],
    url: "https://example.com/startup-sprint",
  },
  {
    id: "s8",
    title: "Student Press Award",
    sphere: "Journalism",
    grades: ["12 Grade"],
    cost: "Free",
    format: "Individual",
    deadline: "2026-05-25",
    snippet: "Премия для школьных и студенческих журналистов за лучший репортаж.",
    description: "Принимаются тексты, подкасты и видеорепортажи. Победители проходят стажировку в редакции.",
    steps: ["Отправьте до 3 работ", "Дождитесь шортлиста", "Церемония награждения"],
    url: "https://example.com/press-award",
  },
  {
    id: "s9",
    title: "Digital Art Biennale (Youth)",
    sphere: "Art & Design",
    grades: ["8 Grade"],
    price: "15 000 ₸",
    cost: "Paid",
    format: "Individual",
    deadline: "2026-12-10",
    snippet: "Выставка цифрового искусства для молодых художников и дизайнеров.",
    description: "Работы отбираются кураторами и экспонируются онлайн и в галерее.",
    steps: ["Загрузите портфолио", "Оплатите заявку", "Дождитесь решения кураторов"],
    url: "https://example.com/digital-biennale",
  },
];

export type LocalizedContent = {
  title?: string;
  snippet?: string;
  description?: string;
  steps?: string[];
};

/** Translations of opportunity content. Base fields (ru) live on the item itself. */
export const OPPORTUNITY_I18N: Record<string, { kk?: LocalizedContent; en?: LocalizedContent }> = {
  s1: {
    en: {
      snippet: "International olympiad in algorithms and data structures with an online qualifier.",
      description:
        "A three-stage olympiad: online qualification, a regional round and an international final. Winners receive invitations from partner universities.",
      steps: [
        "Register on the official website",
        "Pass the online qualifier (2 hours, 5 problems)",
        "Get an invitation to the regional round",
        "The final takes place on site in autumn",
      ],
    },
    kk: {
      snippet: "Алгоритмдер мен деректер құрылымы бойынша халықаралық олимпиада, онлайн іріктеумен.",
      description:
        "Үш кезеңді олимпиада: онлайн іріктеу, аймақтық тур және халықаралық финал. Жеңімпаздар серіктес университеттерден шақыру алады.",
      steps: [
        "Ресми сайтта тіркеліңіз",
        "Онлайн іріктеуден өтіңіз (2 сағат, 5 есеп)",
        "Аймақтық турға шақыру алыңыз",
        "Финал күзде офлайн өтеді",
      ],
    },
  },
  s2: {
    en: {
      snippet: "A team conference on international relations with delegations from 40 countries.",
      description:
        "Participants represent countries in simulated UN committees, prepare position papers and defend resolutions.",
      steps: ["Gather a delegation of 3–6 people", "Submit an application", "Pay the fee", "Prepare a position paper"],
    },
    kk: {
      snippet: "40 елден келген делегациялары бар халықаралық қатынастар бойынша командалық конференция.",
      description:
        "Қатысушылар БҰҰ комитеттерінің моделінде елдерді таныстырады, позициялық құжат дайындап, қарарларды қорғайды.",
      steps: ["3–6 адамнан делегация жинаңыз", "Өтінім беріңіз", "Жарнаны төлеңіз", "Position paper дайындаңыз"],
    },
  },
  s3: {
    en: {
      snippet: "A short-film lab with industry mentors and a project pitch.",
      description:
        "A six-week program: screenwriting, directing, editing. The best projects receive producer support.",
      steps: ["Send a showreel or a short film", "Pass an online interview", "Form your film crew"],
    },
    kk: {
      snippet: "Индустрия менторлары мен жоба питчингі бар қысқаметражды фильм зертханасы.",
      description:
        "Алты апталық бағдарлама: сценарий шеберлігі, режиссура, монтаж. Үздік жобалар продюсерлік қолдау алады.",
      steps: ["Шоурил не қысқаметраж жіберіңіз", "Онлайн сұхбаттан өтіңіз", "Түсірілім тобын құрыңыз"],
    },
  },
  s4: {
    en: {
      snippet: "A biomedical research olympiad where you defend your own project.",
      description:
        "Participants present original research in biology or medicine and defend it before a scientific jury.",
      steps: ["Prepare an abstract (500 words)", "Upload a poster", "Defend online"],
    },
    kk: {
      snippet: "Өз жобаңды қорғайтын биомедицина бойынша зерттеу олимпиадасы.",
      description:
        "Қатысушылар биология не медицина саласындағы төл зерттеуін ұсынып, ғылыми қазылар алдында қорғайды.",
      steps: ["Абстракт дайындаңыз (500 сөз)", "Постер жүктеңіз", "Онлайн қорғау"],
    },
  },
  s5: {
    en: {
      snippet: "A British Parliamentary format tournament for school teams.",
      description: "Five qualifying rounds and a final. Judges are champions of national debate leagues.",
      steps: ["Register a team of 2", "Pay the fee", "Attend the briefing"],
    },
    kk: {
      snippet: "Мектеп командаларына арналған британдық парламенттік формат турнирі.",
      description: "Бес іріктеу раунды және финал. Қазылар — ұлттық дебат лигаларының чемпиондары.",
      steps: ["2 адамнан команда тіркеңіз", "Жарнаны төлеңіз", "Брифингтен өтіңіз"],
    },
  },
  s6: {
    en: {
      snippet: "A law case championship: solving real legal problems.",
      description:
        "Participants analyse real-life cases and propose legal solutions. The final is an oral defence.",
      steps: ["Solve the qualifying case", "Advance to the second round", "Oral defence before the jury"],
    },
    kk: {
      snippet: "Құқық бойынша кейс-чемпионат: нақты заңдық мәселелерді шешу.",
      description: "Қатысушылар тәжірибедегі кейстерді талдап, құқықтық шешім ұсынады. Финал — ауызша қорғау.",
      steps: ["Іріктеу кейсін шешіңіз", "Екінші турға өтіңіз", "Қазылар алдында ауызша қорғау"],
    },
  },
  s7: {
    en: {
      snippet: "A weekend accelerator: from idea to pitch in 48 hours.",
      description: "Teams build a business model and a prototype, then pitch to investors.",
      steps: ["Gather a team", "Submit your idea", "Complete the 48-hour sprint"],
    },
    kk: {
      snippet: "Демалыс күндік акселератор: идеядан питчке дейін 48 сағатта.",
      description: "Командалар бизнес-модель мен прототип жасап, инвесторларға таныстырады.",
      steps: ["Команда жинаңыз", "Идеяңызды жіберіңіз", "48 сағаттық спринттен өтіңіз"],
    },
  },
  s8: {
    en: {
      snippet: "An award for school and student journalists for the best story.",
      description: "Texts, podcasts and video reports are accepted. Winners get an editorial internship.",
      steps: ["Submit up to 3 works", "Wait for the shortlist", "Award ceremony"],
    },
    kk: {
      snippet: "Үздік репортаж үшін мектеп және студент журналистерге арналған сыйлық.",
      description: "Мәтін, подкаст және бейнерепортаждар қабылданады. Жеңімпаздар редакцияда тәжірибеден өтеді.",
      steps: ["3-ке дейін жұмыс жіберіңіз", "Шорт-листті күтіңіз", "Марапаттау рәсімі"],
    },
  },
  s9: {
    en: {
      snippet: "A digital art exhibition for young artists and designers.",
      description: "Works are selected by curators and exhibited online and in the gallery.",
      steps: ["Upload your portfolio", "Pay the application fee", "Wait for the curators' decision"],
    },
    kk: {
      snippet: "Жас суретшілер мен дизайнерлерге арналған цифрлық өнер көрмесі.",
      description: "Жұмыстарды кураторлар іріктеп, онлайн және галереяда көрсетеді.",
      steps: ["Портфолио жүктеңіз", "Өтінім ақысын төлеңіз", "Кураторлар шешімін күтіңіз"],
    },
  },
};

export function localizeOpportunity(item: Opportunity, lang: string): Opportunity {
  if (lang === "ru") return item;
  const tr = OPPORTUNITY_I18N[item.id]?.[lang as "kk" | "en"];
  if (!tr) return item;
  return {
    ...item,
    title: tr.title ?? item.title,
    snippet: tr.snippet ?? item.snippet,
    description: tr.description ?? item.description,
    steps: tr.steps ?? item.steps,
  };
}
