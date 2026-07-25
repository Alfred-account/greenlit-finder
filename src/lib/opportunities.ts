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
    grade: "10 Grade",
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
    grade: "11 Grade",
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
    grade: "Undergrad",
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
    grade: "12 Grade",
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
    grade: "9 Grade",
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
    grade: "11 Grade",
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
    grade: "10 Grade",
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
    grade: "12 Grade",
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
    grade: "8 Grade",
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
