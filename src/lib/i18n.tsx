import { formatGrades, localizeOpportunity, type Opportunity } from "@/lib/opportunities";
import { localizePlace } from "@/lib/locations";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGUAGES = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "kk", label: "Қазақша", short: "KK" },
  { code: "en", label: "English", short: "EN" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const ru: Dict = {
  "hero.tagline": "Green Lit Space — Каталог олимпиад и возможностей!",
  "meta.title": "Green Lit Space — каталог олимпиад и возможностей",
  "meta.description":
    "Каталог олимпиад, конкурсов и программ: фильтры по направлению, классу, стоимости, формату и участию онлайн или офлайн.",
  "filter.delivery": "Онлайн / офлайн",
  "delivery.online": "Онлайн",
  "delivery.offline": "Офлайн",
  "delivery.hybrid": "Гибрид",
  "dialog.delivery": "Участие",
  "dialog.instagram": "Instagram",
  "dialog.register": "Регистрация",
  "share.deliveryLabel": "Онлайн, офлайн или гибрид?",
  "share.instagram": "Ссылка на Instagram (необязательно)",
  "share.register": "Ссылка на регистрацию (необязательно)",
  "hero.badge": "Новые возможности каждый день",
  "hero.subtitle":
    "Олимпиады, конкурсы и программы, которые открывают двери. Найди то, что подходит именно тебе — по направлению, классу, формату и дедлайну.",
  "hero.cta": "Начать поиск",
  "banner.title": "Поделись своей возможностью бесплатно!",
  "banner.subtitle": "Организуешь олимпиаду или конкурс? Разместим после быстрой модерации.",
  "banner.action": "Заполнить форму",
  "search.placeholder": "Поиск по названию, направлению или описанию…",
  "search.aria": "Поиск возможностей",
  "filter.sphere": "Направление",
  "filter.grade": "Класс / уровень",
  "filter.cost": "Стоимость",
  "filter.format": "Формат",
  "filter.all": "Все",
  "filter.from": "Дедлайн с",
  "filter.to": "Дедлайн по",
  "filter.pickDate": "Выберите дату",
  "filter.reset": "Сбросить фильтры",
  "filter.clearDate": "Очистить",
  "list.loading": "Загружаем возможности…",
  "list.found": "Найдено",
  "empty.text": "Увы, пока нет подходящих олимпиад. Попробуйте сбросить фильтры",
  "card.more": "Подробнее",
  "card.noDeadline": "Без дедлайна",
  "cost.free": "Бесплатно",
  "cost.paid": "Платно",
  "format.individual": "Индивидуально",
  "format.team": "Командно",
  "dialog.deadline": "Дедлайн",
  "dialog.cost": "Стоимость",
  "dialog.paidTbd": "Платно (уточняется)",
  "dialog.formatTeam": "Командное участие",
  "dialog.formatIndividual": "Индивидуальное участие",
  "dialog.steps": "Как участвовать",
  "dialog.official": "Перейти на официальный сайт",
  "share.back": "Назад",
  "share.title": "Поделись своей возможностью бесплатно!",
  "share.subtitle": "Заполните короткую форму — мы проверим заявку и опубликуем её в каталоге. Это бесплатно.",
  "share.name": "Ваше имя",
  "share.namePlaceholder": "Айгерим",
  "share.contact": "Контакт (Email / Telegram)",
  "share.contactPlaceholder": "you@mail.com или @username",
  "share.eventTitle": "Название события",
  "share.price": "Сколько стоит участие?",
  "share.pricePlaceholder": "Например: 15 000 ₸ за участника",
  "share.formatLabel": "Формат участия",
  "share.url": "Ссылка на сайт",
  "share.description": "Описание",
  "share.descriptionPlaceholder": "Кратко о событии, этапах и призах.\nКаждый шаг участия — с новой строки.",
  "share.counterHint": "переносы строк сохраняются в описании.",
  "share.selectPlaceholder": "Выберите…",
  "share.submit": "Отправить на модерацию",
  "share.submitting": "Отправляем…",
  "share.already": "Уже отправили?",
  "share.backToCatalog": "Вернуться в каталог",
  "toast.success": "Заявка отправлена на модерацию!",
  "toast.error": "Не удалось отправить заявку",
  "toast.needSphere": "Выберите направление и класс",
  "toast.needPrice": "Укажите стоимость участия",
  "lang.label": "Язык",
  "grade.undergrad": "Студент",
  "grade.suffix": "класс",
  "share.gradesLabel": "Для каких классов",
  "share.gradesHint": "Отметьте все классы, которые могут участвовать — например 9, 10 и 11.",
  "share.gradesSelected": "Выбрано",
};

const kk: Dict = {
  "hero.tagline": "Green Lit Space — Олимпиадалар мен мүмкіндіктер каталогы!",
  "meta.title": "Green Lit Space — олимпиадалар мен мүмкіндіктер каталогы",
  "meta.description":
    "Олимпиадалар, байқаулар мен бағдарламалар каталогы: бағыт, сынып, құны, формат және онлайн/офлайн бойынша сүзгілер.",
  "filter.delivery": "Онлайн / офлайн",
  "delivery.online": "Онлайн",
  "delivery.offline": "Офлайн",
  "delivery.hybrid": "Аралас",
  "dialog.delivery": "Қатысу",
  "dialog.instagram": "Instagram",
  "dialog.register": "Тіркелу",
  "share.deliveryLabel": "Онлайн, офлайн әлде аралас па?",
  "share.instagram": "Instagram сілтемесі (міндетті емес)",
  "share.register": "Тіркелу сілтемесі (міндетті емес)",
  "hero.badge": "Күн сайын жаңа мүмкіндіктер",
  "hero.subtitle":
    "Есік ашатын олимпиадалар, байқаулар мен бағдарламалар. Бағыт, сынып, формат және мерзім бойынша өзіңе қолайлысын тап.",
  "hero.cta": "Іздеуді бастау",
  "banner.title": "Өз мүмкіндігіңмен тегін бөліс!",
  "banner.subtitle": "Олимпиада не байқау ұйымдастырасың ба? Жылдам модерациядан кейін жариялаймыз.",
  "banner.action": "Форманы толтыру",
  "search.placeholder": "Атауы, бағыты немесе сипаттамасы бойынша іздеу…",
  "search.aria": "Мүмкіндіктерді іздеу",
  "filter.sphere": "Бағыт",
  "filter.grade": "Сынып / деңгей",
  "filter.cost": "Құны",
  "filter.format": "Формат",
  "filter.all": "Барлығы",
  "filter.from": "Мерзімі: бастап",
  "filter.to": "Мерзімі: дейін",
  "filter.pickDate": "Күнді таңдаңыз",
  "filter.reset": "Сүзгілерді тазалау",
  "filter.clearDate": "Тазалау",
  "list.loading": "Мүмкіндіктер жүктелуде…",
  "list.found": "Табылды",
  "empty.text": "Өкінішке орай, сәйкес олимпиада жоқ. Сүзгілерді тазалап көріңіз",
  "card.more": "Толығырақ",
  "card.noDeadline": "Мерзімсіз",
  "cost.free": "Тегін",
  "cost.paid": "Ақылы",
  "format.individual": "Жеке",
  "format.team": "Командалық",
  "dialog.deadline": "Соңғы мерзім",
  "dialog.cost": "Құны",
  "dialog.paidTbd": "Ақылы (нақтыланады)",
  "dialog.formatTeam": "Командалық қатысу",
  "dialog.formatIndividual": "Жеке қатысу",
  "dialog.steps": "Қалай қатысуға болады",
  "dialog.official": "Ресми сайтқа өту",
  "share.back": "Артқа",
  "share.title": "Өз мүмкіндігіңмен тегін бөліс!",
  "share.subtitle": "Қысқа форманы толтырыңыз — өтінімді тексеріп, каталогта жариялаймыз. Бұл тегін.",
  "share.name": "Атыңыз",
  "share.namePlaceholder": "Айгерім",
  "share.contact": "Байланыс (Email / Telegram)",
  "share.contactPlaceholder": "you@mail.com немесе @username",
  "share.eventTitle": "Іс-шара атауы",
  "share.price": "Қатысу құны қанша?",
  "share.pricePlaceholder": "Мысалы: қатысушыға 15 000 ₸",
  "share.formatLabel": "Қатысу форматы",
  "share.url": "Сайтқа сілтеме",
  "share.description": "Сипаттама",
  "share.descriptionPlaceholder": "Іс-шара, кезеңдер және жүлделер туралы қысқаша.\nӘр қадам — жаңа жолдан.",
  "share.counterHint": "жол ауыстырулары сипаттамада сақталады.",
  "share.selectPlaceholder": "Таңдаңыз…",
  "share.submit": "Модерацияға жіберу",
  "share.submitting": "Жіберілуде…",
  "share.already": "Жіберіп қойдыңыз ба?",
  "share.backToCatalog": "Каталогқа оралу",
  "toast.success": "Өтінім модерацияға жіберілді!",
  "toast.error": "Өтінімді жіберу мүмкін болмады",
  "toast.needSphere": "Бағыт пен сыныпты таңдаңыз",
  "toast.needPrice": "Қатысу құнын көрсетіңіз",
  "lang.label": "Тіл",
  "grade.undergrad": "Студент",
  "grade.suffix": "сынып",
  "share.gradesLabel": "Қай сыныптарға арналған",
  "share.gradesHint": "Қатыса алатын барлық сыныпты белгілеңіз — мысалы 9, 10 және 11.",
  "share.gradesSelected": "Таңдалды",
};

const en: Dict = {
  "hero.tagline": "Green Lit Space – Catalog of Olympiads and Opportunities!",
  "meta.title": "Green Lit Space — catalog of olympiads and opportunities",
  "meta.description":
    "A catalog of olympiads, contests and programs: filter by field, grade, cost, format and online or offline participation.",
  "filter.delivery": "Online / offline",
  "delivery.online": "Online",
  "delivery.offline": "Offline",
  "delivery.hybrid": "Hybrid",
  "dialog.delivery": "Participation",
  "dialog.instagram": "Instagram",
  "dialog.register": "Registration",
  "share.deliveryLabel": "Online, offline or hybrid?",
  "share.instagram": "Instagram link (optional)",
  "share.register": "Registration link (optional)",
  "hero.badge": "New opportunities every day",
  "hero.subtitle":
    "Olympiads, contests and programs that open doors. Find the right one by field, grade, format and deadline.",
  "hero.cta": "Start searching",
  "banner.title": "Share your opportunity for free!",
  "banner.subtitle": "Organizing an olympiad or contest? We'll publish it after a quick review.",
  "banner.action": "Fill the form",
  "search.placeholder": "Search by title, field or description…",
  "search.aria": "Search opportunities",
  "filter.sphere": "Field",
  "filter.grade": "Grade / level",
  "filter.cost": "Cost",
  "filter.format": "Format",
  "filter.all": "All",
  "filter.from": "Deadline from",
  "filter.to": "Deadline to",
  "filter.pickDate": "Pick a date",
  "filter.reset": "Reset filters",
  "filter.clearDate": "Clear",
  "list.loading": "Loading opportunities…",
  "list.found": "Found",
  "empty.text": "No matching opportunities yet. Try resetting the filters",
  "card.more": "Details",
  "card.noDeadline": "No deadline",
  "cost.free": "Free",
  "cost.paid": "Paid",
  "format.individual": "Individual",
  "format.team": "Team-based",
  "dialog.deadline": "Deadline",
  "dialog.cost": "Cost",
  "dialog.paidTbd": "Paid (TBD)",
  "dialog.formatTeam": "Team participation",
  "dialog.formatIndividual": "Individual participation",
  "dialog.steps": "How to participate",
  "dialog.official": "Go to official website",
  "share.back": "Back",
  "share.title": "Share your opportunity for free!",
  "share.subtitle": "Fill in a short form — we'll review it and publish it in the catalog. It's free.",
  "share.name": "Your name",
  "share.namePlaceholder": "Aigerim",
  "share.contact": "Contact (Email / Telegram)",
  "share.contactPlaceholder": "you@mail.com or @username",
  "share.eventTitle": "Event title",
  "share.price": "How much does it cost?",
  "share.pricePlaceholder": "E.g. 15,000 ₸ per participant",
  "share.formatLabel": "Participation format",
  "share.url": "Website link",
  "share.description": "Description",
  "share.descriptionPlaceholder": "Briefly about the event, stages and prizes.\nEach step on a new line.",
  "share.counterHint": "line breaks are preserved in the description.",
  "share.selectPlaceholder": "Select…",
  "share.submit": "Submit for review",
  "share.submitting": "Sending…",
  "share.already": "Already submitted?",
  "share.backToCatalog": "Back to catalog",
  "toast.success": "Your submission was sent for review!",
  "toast.error": "Could not send the submission",
  "toast.needSphere": "Choose a field and a grade",
  "toast.needPrice": "Specify the participation cost",
  "lang.label": "Language",
  "grade.undergrad": "Undergrad",
  "grade.suffix": "grade",
  "share.gradesLabel": "Eligible grades",
  "share.gradesHint": "Select every grade that can take part — e.g. 9, 10 and 11.",
  "share.gradesSelected": "Selected",
};


// ---- Additions: fields, locations, accounts, guided tour ----
Object.assign(ru, {
  "hero.badge": "\u2726 Возможности, которые подходят именно тебе",
  "hero.stats": "500+ возможностей · 14 направлений · Обновляется регулярно",
  "hero.popular": "Популярные запросы:",
  "hero.secondary": "Поделиться своей",
  "filter.location": "Локация",
  "filter.country": "Страна",
  "filter.city": "Город",
  "filter.cityPlaceholder": "Начните вводить…",
  "filter.sort": "Сортировка",
  "sort.deadlineAsc": "Дедлайн: ближайшие",
  "sort.deadlineDesc": "Дедлайн: поздние",
  "sort.titleAsc": "По названию (А–Я)",
  "sort.savedFirst": "Сохранённые сверху",
  "filter.onlySaved": "Только сохранённые",
  "card.save": "Сохранить",
  "card.saved": "Сохранено",
  "toast.saveNeedsAuth": "Войдите, чтобы сохранять возможности",
  "toast.saved": "Добавлено в сохранённые",
  "toast.unsaved": "Убрано из сохранённых",
  "auth.signIn": "Войти",
  "auth.signUp": "Регистрация",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.google": "Войти через Google",
  "auth.signOut": "Выйти",
  "auth.account": "Аккаунт",
  "auth.title": "Вход в Green Lit Space",
  "auth.subtitle": "Войдите, чтобы сохранять возможности и возвращаться к ним с любого устройства.",
  "auth.haveAccount": "Уже есть аккаунт?",
  "auth.noAccount": "Нет аккаунта?",
  "auth.checkEmail": "Проверьте почту — мы отправили ссылку для подтверждения.",
  "auth.welcome": "С возвращением!",
  "nav.saved": "Сохранённые",
  "help.tooltip": "Как пользоваться поиском?",
  "tour.next": "Далее",
  "tour.done": "Понятно",
  "tour.skip": "Пропустить",
  "tour.s1.title": "Шаг 1: Направление",
  "tour.s1.text": "Выберите сферу интересов (например, Информатика, Право, Искусство), чтобы отсеять лишнее.",
  "tour.s2.title": "Шаг 2: Класс / уровень",
  "tour.s2.text": "Укажите ваш класс. Система автоматически подберёт возможности, где вы можете участвовать (например, если программа открыта для 8–11 классов).",
  "tour.s3.title": "Шаг 3: Стоимость",
  "tour.s3.text": "Выберите «Бесплатно» или «Платно». Если программа платная, рядом с ней сразу будет указана точная цена.",
  "tour.s4.title": "Шаг 4: Формат",
  "tour.s4.text": "Отфильтруйте по формату участия — «Индивидуально» или «Командно».",
  "tour.s5.title": "Шаг 5: Дедлайн",
  "tour.s5.text": "Настройте диапазон дат, чтобы успеть подать заявку до закрытия приёма!",
  "tour.s6.title": "Готово!",
  "tour.s6.text": "Теперь вы легко найдёте нужную олимпиаду или конкурс. Удачи!",
  "share.country": "Страна проведения",
  "share.city": "Город",
  "share.cityHint": "Начните вводить название — мы подскажем.",
  "share.deadline": "Дедлайн подачи",
  "share.url": "Ссылка на сайт (необязательно)",
  "share.instagram": "Ссылка на Instagram",
  "share.descriptionHint": "Описание должно быть не короче 50 слов.",
  "share.words": "слов",
  "toast.needInstagram": "Укажите ссылку на Instagram",
  "toast.needDescription": "Описание должно содержать минимум 50 слов",
});

Object.assign(kk, {
  "hero.badge": "\u2726 Саған сай мүмкіндіктерді тап",
  "hero.stats": "500+ мүмкіндік · 14 бағыт · Тұрақты жаңарады",
  "hero.popular": "Танымал сұраныстар:",
  "hero.secondary": "Өз мүмкіндігіңмен бөліс",
  "filter.location": "Орналасуы",
  "filter.country": "Ел",
  "filter.city": "Қала",
  "filter.cityPlaceholder": "Жаза бастаңыз…",
  "filter.sort": "Сұрыптау",
  "sort.deadlineAsc": "Мерзімі: жақындары",
  "sort.deadlineDesc": "Мерзімі: кейінгілері",
  "sort.titleAsc": "Атауы бойынша (А–Я)",
  "sort.savedFirst": "Сақталғандар жоғарыда",
  "filter.onlySaved": "Тек сақталғандар",
  "card.save": "Сақтау",
  "card.saved": "Сақталды",
  "toast.saveNeedsAuth": "Сақтау үшін жүйеге кіріңіз",
  "toast.saved": "Сақталғандарға қосылды",
  "toast.unsaved": "Сақталғандардан алынды",
  "auth.signIn": "Кіру",
  "auth.signUp": "Тіркелу",
  "auth.email": "Email",
  "auth.password": "Құпиясөз",
  "auth.google": "Google арқылы кіру",
  "auth.signOut": "Шығу",
  "auth.account": "Аккаунт",
  "auth.title": "Green Lit Space-ке кіру",
  "auth.subtitle": "Мүмкіндіктерді сақтап, кез келген құрылғыдан қарау үшін кіріңіз.",
  "auth.haveAccount": "Аккаунтыңыз бар ма?",
  "auth.noAccount": "Аккаунт жоқ па?",
  "auth.checkEmail": "Поштаңызды тексеріңіз — растау сілтемесін жібердік.",
  "auth.welcome": "Қайта келгеніңізге қуаныштымыз!",
  "nav.saved": "Сақталғандар",
  "help.tooltip": "Іздеуді қалай пайдалану керек?",
  "tour.next": "Әрі қарай",
  "tour.done": "Түсінікті",
  "tour.skip": "Өткізіп жіберу",
  "tour.s1.title": "1-қадам: Бағыт",
  "tour.s1.text": "Қызығушылық саласын таңдаңыз (мысалы, Информатика, Құқық, Өнер) — артығы сүзіледі.",
  "tour.s2.title": "2-қадам: Сынып / деңгей",
  "tour.s2.text": "Сыныбыңызды көрсетіңіз. Жүйе сіз қатыса алатын мүмкіндіктерді өзі таңдайды (мысалы, бағдарлама 8–11 сыныпқа ашық болса).",
  "tour.s3.title": "3-қадам: Құны",
  "tour.s3.text": "«Тегін» немесе «Ақылы» таңдаңыз. Ақылы болса, нақты бағасы бірден көрінеді.",
  "tour.s4.title": "4-қадам: Формат",
  "tour.s4.text": "Қатысу форматы бойынша сүзіңіз — «Жеке» әлде «Командалық».",
  "tour.s5.title": "5-қадам: Мерзім",
  "tour.s5.text": "Өтінім қабылдау жабылғанша үлгеру үшін күн аралығын баптаңыз!",
  "tour.s6.title": "Дайын!",
  "tour.s6.text": "Енді қажет олимпиада не байқауды оңай табасыз. Сәттілік!",
  "share.country": "Өтетін елі",
  "share.city": "Қала",
  "share.cityHint": "Атауын жаза бастаңыз — ұсыныс береміз.",
  "share.deadline": "Өтінім мерзімі",
  "share.url": "Сайт сілтемесі (міндетті емес)",
  "share.instagram": "Instagram сілтемесі",
  "share.descriptionHint": "Сипаттама кемінде 50 сөзден тұруы керек.",
  "share.words": "сөз",
  "toast.needInstagram": "Instagram сілтемесін көрсетіңіз",
  "toast.needDescription": "Сипаттамада кемінде 50 сөз болуы керек",
});

Object.assign(en, {
  "hero.badge": "\u2726 Discover opportunities that fit you",
  "hero.stats": "500+ opportunities · 14 fields · Updated regularly",
  "hero.popular": "Popular searches:",
  "hero.secondary": "Share yours",
  "filter.location": "Location",
  "filter.country": "Country",
  "filter.city": "City",
  "filter.cityPlaceholder": "Start typing…",
  "filter.sort": "Sort by",
  "sort.deadlineAsc": "Deadline: soonest",
  "sort.deadlineDesc": "Deadline: latest",
  "sort.titleAsc": "Title (A–Z)",
  "sort.savedFirst": "Saved first",
  "filter.onlySaved": "Saved only",
  "card.save": "Save",
  "card.saved": "Saved",
  "toast.saveNeedsAuth": "Sign in to save opportunities",
  "toast.saved": "Added to your saved list",
  "toast.unsaved": "Removed from your saved list",
  "auth.signIn": "Sign in",
  "auth.signUp": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.google": "Continue with Google",
  "auth.signOut": "Sign out",
  "auth.account": "Account",
  "auth.title": "Sign in to Green Lit Space",
  "auth.subtitle": "Sign in to save opportunities and pick them up on any device.",
  "auth.haveAccount": "Already have an account?",
  "auth.noAccount": "No account yet?",
  "auth.checkEmail": "Check your inbox — we sent a confirmation link.",
  "auth.welcome": "Welcome back!",
  "nav.saved": "Saved",
  "help.tooltip": "How does the search work?",
  "tour.next": "Next",
  "tour.done": "Got it",
  "tour.skip": "Skip",
  "tour.s1.title": "Step 1: Field",
  "tour.s1.text": "Pick your field of interest (e.g. Computer Science, Law, Art) to filter out the noise.",
  "tour.s2.title": "Step 2: Grade / level",
  "tour.s2.text": "Set your grade. We automatically show programs you are eligible for (e.g. one open to grades 8–11).",
  "tour.s3.title": "Step 3: Cost",
  "tour.s3.text": "Choose Free or Paid. Paid programs show the exact price right on the card.",
  "tour.s4.title": "Step 4: Format",
  "tour.s4.text": "Filter by participation format — Individual or Team-based.",
  "tour.s5.title": "Step 5: Deadline",
  "tour.s5.text": "Set a date range so you never miss an application window!",
  "tour.s6.title": "All set!",
  "tour.s6.text": "You can now find the right olympiad or contest in seconds. Good luck!",
  "share.country": "Host country",
  "share.city": "City",
  "share.cityHint": "Start typing the name — we'll suggest matches.",
  "share.deadline": "Application deadline",
  "share.url": "Website link (optional)",
  "share.instagram": "Instagram link",
  "share.descriptionHint": "The description must be at least 50 words.",
  "share.words": "words",
  "toast.needInstagram": "Add an Instagram link",
  "toast.needDescription": "The description needs at least 50 words",
});

const DICTS: Record<Lang, Dict> = { ru, kk, en };

const SPHERE_LABELS: Record<Lang, Dict> = {
  en: {},
  ru: {
    "Computer Science & Technology": "Информатика и технологии",
    Law: "Право",
    "International Relations": "Международные отношения",
    "Medicine & Biology": "Медицина и биология",
    "Journalism & Media": "Журналистика и медиа",
    "Film & Directing": "Кино и режиссура",
    "Art & Design": "Искусство и дизайн",
    "Business & Economics": "Бизнес и экономика",
    "Science & Research": "Наука и исследования",
    Engineering: "Инженерия",
    "Psychology & Social Sciences": "Психология и социальные науки",
    "Humanities & Languages": "Гуманитарные науки и языки",
    "Environment & Sustainability": "Экология и устойчивое развитие",
    "Politics & Public Policy": "Политика и госуправление",
  },
  kk: {
    "Computer Science & Technology": "Информатика және технологиялар",
    Law: "Құқық",
    "International Relations": "Халықаралық қатынастар",
    "Medicine & Biology": "Медицина және биология",
    "Journalism & Media": "Журналистика және медиа",
    "Film & Directing": "Кино және режиссура",
    "Art & Design": "Өнер және дизайн",
    "Business & Economics": "Бизнес және экономика",
    "Science & Research": "Ғылым және зерттеу",
    Engineering: "Инженерия",
    "Psychology & Social Sciences": "Психология және әлеуметтік ғылымдар",
    "Humanities & Languages": "Гуманитарлық ғылымдар және тілдер",
    "Environment & Sustainability": "Экология және тұрақты даму",
    "Politics & Public Policy": "Саясат және мемлекеттік басқару",
  },
};

const LOCALE_TAG: Record<Lang, string> = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

const STORAGE_KEY = "gls-lang";

/** Picks the site language from the browser preferences (falls back to English). */
export function detectBrowserLang(): Lang {
  const prefs =
    typeof navigator === "undefined" ? [] : [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const raw of prefs) {
    const code = raw.toLowerCase().split("-")[0];
    if (code === "ru") return "ru";
    if (code === "kk" || code === "kz") return "kk";
    if (code === "en") return "en";
  }
  return "en";
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tSphere: (value: string) => string;
  tGrade: (value: string) => string;
  tGrades: (values: string[]) => string;
  tCost: (value: string) => string;
  tFormat: (value: string) => string;
  tDelivery: (value: string) => string;
  tPlace: (value?: string) => string;
  tItem: (item: Opportunity) => Opportunity;
  localeTag: string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored as Lang);
      document.documentElement.lang = stored;
      return;
    }
    // No explicit choice yet — follow the browser language.
    const detected = detectBrowserLang();
    setLangState(detected);
    document.documentElement.lang = detected;
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    const t = (key: string) => dict[key] ?? DICTS.en[key] ?? key;
    return {
      lang,
      setLang,
      t,
      localeTag: LOCALE_TAG[lang],
      tSphere: (v: string) => SPHERE_LABELS[lang][v] ?? v,
      tGrade: (v: string) => {
        if (v === "Undergrad") return t("grade.undergrad");
        const num = v.match(/\d+/)?.[0];
        if (!num) return v;
        return lang === "en" ? `${num}th grade` : `${num} ${t("grade.suffix")}`;
      },
      tGrades: (values: string[]) => {
        const tg = (v: string) => {
          if (v === "Undergrad") return t("grade.undergrad");
          const num = v.match(/\d+/)?.[0];
          if (!num) return v;
          return lang === "en" ? `${num}th grade` : `${num} ${t("grade.suffix")}`;
        };
        return formatGrades(values, tg, lang === "en" ? "grade" : t("grade.suffix"));
      },
      tCost: (v: string) => (v === "Free" ? t("cost.free") : t("cost.paid")),
      tFormat: (v: string) => (v === "Team-based" ? t("format.team") : t("format.individual")),
      tDelivery: (v: string) =>
        v === "Offline" ? t("delivery.offline") : v === "Hybrid" ? t("delivery.hybrid") : t("delivery.online"),
      tPlace: (v?: string) => localizePlace(v, lang),
      tItem: (item: Opportunity) => localizeOpportunity(item, lang),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
