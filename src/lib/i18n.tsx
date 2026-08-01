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

Object.assign(ru, {
  "hero.badge": "Возможности, которые подходят именно тебе",
  "card.share": "Поделиться",
  "toast.linkCopied": "Ссылка скопирована",
  "auth.name": "Имя",
  "auth.namePlaceholder": "Айгерим",
  "auth.passwordHint": "Минимум 8 символов",
  "auth.passwordShort": "Пароль должен содержать минимум 8 символов",
  "auth.tabIn": "Вход",
  "auth.tabUp": "Регистрация",
  "auth.titleIn": "С возвращением",
  "auth.subtitleIn": "Войдите, чтобы вернуться к сохранённым возможностям.",
  "auth.titleUp": "Создать аккаунт",
  "auth.subtitleUp": "Займёт минуту — потом сможете сохранять олимпиады и конкурсы.",
  "auth.createAccount": "Создать аккаунт",
  "auth.needName": "Укажите имя",
  "welcome.title": "Аккаунт активирован!",
  "welcome.text":
    "Спасибо за подтверждение почты. Теперь вы можете сохранять олимпиады, конкурсы и программы в личный список и возвращаться к ним с любого устройства.",
  "welcome.cta": "Перейти в каталог",
  "welcome.signIn": "Войти в аккаунт",
  "tour.s1.title": "Шаг 1: Направление",
  "tour.s1.text": "Список открыт — выберите направление, которое вам интересно. После выбора мы перейдём к следующему фильтру.",
  "tour.s2.title": "Шаг 2: Класс",
  "tour.s2.text": "Укажите свой класс или «Студент» — покажем только те возможности, куда вас берут.",
  "tour.s3.title": "Шаг 3: Стоимость",
  "tour.s3.text": "Бесплатно или платно. У платных прямо на карточке видна цена участия.",
  "tour.s4.title": "Шаг 4: Формат",
  "tour.s4.text": "Индивидуальное или командное участие — выберите, что вам ближе.",
  "tour.s5.title": "Шаг 5: Онлайн / офлайн",
  "tour.s5.text": "Онлайн, офлайн или гибрид — так вы сразу отсечёте то, куда не сможете добраться.",
  "tour.s6.title": "Шаг 6: Страна",
  "tour.s6.text": "Выберите страну проведения. После этого станет доступен фильтр по городу.",
  "tour.s7.title": "Шаг 7: Город",
  "tour.s7.text": "Начните печатать название города — подскажем варианты. Можно пропустить.",
  "tour.s8.title": "Шаг 8: Дедлайн",
  "tour.s8.text": "Задайте диапазон дат, чтобы не пропустить приём заявок.",
  "tour.s9.title": "Готово!",
  "tour.s9.text": "Теперь вы найдёте нужную олимпиаду за секунды. Удачи!",
  "tour.skipStep": "Пропустить шаг",
  "tour.finish": "Понятно",
});

Object.assign(kk, {
  "hero.badge": "Саған сай мүмкіндіктерді тап",
  "card.share": "Бөлісу",
  "toast.linkCopied": "Сілтеме көшірілді",
  "auth.name": "Аты",
  "auth.namePlaceholder": "Айгерім",
  "auth.passwordHint": "Кемінде 8 таңба",
  "auth.passwordShort": "Құпиясөз кемінде 8 таңбадан тұруы керек",
  "auth.tabIn": "Кіру",
  "auth.tabUp": "Тіркелу",
  "auth.titleIn": "Қайта қош келдіңіз",
  "auth.subtitleIn": "Сақталған мүмкіндіктерге оралу үшін кіріңіз.",
  "auth.titleUp": "Аккаунт құру",
  "auth.subtitleUp": "Бір минут — содан кейін олимпиадалар мен байқауларды сақтай аласыз.",
  "auth.createAccount": "Аккаунт құру",
  "auth.needName": "Атыңызды жазыңыз",
  "welcome.title": "Аккаунт белсендірілді!",
  "welcome.text":
    "Поштаңызды растағаныңыз үшін рахмет. Енді олимпиадалар мен бағдарламаларды жеке тізімге сақтап, кез келген құрылғыдан қарай аласыз.",
  "welcome.cta": "Каталогқа өту",
  "welcome.signIn": "Аккаунтқа кіру",
  "tour.s1.title": "1-қадам: Бағыт",
  "tour.s1.text": "Тізім ашық — қызықтыратын бағытты таңдаңыз. Таңдағаннан кейін келесі сүзгіге өтеміз.",
  "tour.s2.title": "2-қадам: Сынып",
  "tour.s2.text": "Сыныбыңызды немесе «Студент» дегенді таңдаңыз — тек сізге сай мүмкіндіктер қалады.",
  "tour.s3.title": "3-қадам: Құны",
  "tour.s3.text": "Тегін немесе ақылы. Ақылы болса, баға карточкада бірден көрінеді.",
  "tour.s4.title": "4-қадам: Формат",
  "tour.s4.text": "Жеке немесе командалық қатысу — өзіңізге ыңғайлысын таңдаңыз.",
  "tour.s5.title": "5-қадам: Онлайн / офлайн",
  "tour.s5.text": "Онлайн, офлайн немесе аралас — жете алмайтын нұсқаларды бірден алып тастаңыз.",
  "tour.s6.title": "6-қадам: Ел",
  "tour.s6.text": "Өтетін елді таңдаңыз. Содан кейін қала сүзгісі қолжетімді болады.",
  "tour.s7.title": "7-қадам: Қала",
  "tour.s7.text": "Қала атауын тере бастаңыз — нұсқаларды ұсынамыз. Өткізіп жіберуге болады.",
  "tour.s8.title": "8-қадам: Мерзім",
  "tour.s8.text": "Өтінім қабылдауды жіберіп алмау үшін күн аралығын белгілеңіз.",
  "tour.s9.title": "Дайын!",
  "tour.s9.text": "Енді керекті олимпиаданы бірнеше секундта табасыз. Сәттілік!",
  "tour.skipStep": "Қадамды өткізу",
  "tour.finish": "Түсінікті",
});

Object.assign(en, {
  "hero.badge": "Discover opportunities that fit you",
  "card.share": "Share",
  "toast.linkCopied": "Link copied",
  "auth.name": "Name",
  "auth.namePlaceholder": "Aigerim",
  "auth.passwordHint": "At least 8 characters",
  "auth.passwordShort": "Password must be at least 8 characters",
  "auth.tabIn": "Sign in",
  "auth.tabUp": "Sign up",
  "auth.titleIn": "Welcome back",
  "auth.subtitleIn": "Sign in to get back to your saved opportunities.",
  "auth.titleUp": "Create an account",
  "auth.subtitleUp": "Takes a minute — then you can save olympiads and contests.",
  "auth.createAccount": "Create account",
  "auth.needName": "Please enter your name",
  "welcome.title": "Your account is activated!",
  "welcome.text":
    "Thanks for confirming your email. You can now save olympiads, contests and programmes to your personal list and open them on any device.",
  "welcome.cta": "Go to the catalog",
  "welcome.signIn": "Sign in",
  "tour.s1.title": "Step 1: Field",
  "tour.s1.text": "The list is open — pick the field you care about. We'll move to the next filter once you choose.",
  "tour.s2.title": "Step 2: Grade",
  "tour.s2.text": "Set your grade or “Undergrad” — we only keep programmes you're eligible for.",
  "tour.s3.title": "Step 3: Cost",
  "tour.s3.text": "Free or paid. Paid ones show the exact price right on the card.",
  "tour.s4.title": "Step 4: Format",
  "tour.s4.text": "Individual or team-based participation — pick what suits you.",
  "tour.s5.title": "Step 5: Online / offline",
  "tour.s5.text": "Online, offline or hybrid — filter out what you can't attend.",
  "tour.s6.title": "Step 6: Country",
  "tour.s6.text": "Choose the host country. The city filter unlocks right after.",
  "tour.s7.title": "Step 7: City",
  "tour.s7.text": "Start typing a city name — we'll suggest matches. You can skip this one.",
  "tour.s8.title": "Step 8: Deadline",
  "tour.s8.text": "Set a date range so you never miss an application window.",
  "tour.s9.title": "All set!",
  "tour.s9.text": "You can now find the right olympiad in seconds. Good luck!",
  "tour.skipStep": "Skip this step",
  "tour.finish": "Got it",
});

/* ---- Guided tour phrasing + username auth (added last so they win) ---- */
Object.assign(ru, {
  "tour.gotIt": "Понятно!",
  "tour.pickBelow": "Выбери подходящий вариант",
  "tour.great": "Отлично!",
  "tour.showResults": "Показать результаты",
  "tour.close": "Закрыть подсказку",
  "tour.skipStep": "Пропустить шаг",
  "tour.s3.text":
    "Бесплатно или платно. Если выбрать «Платно», точная цена участия будет видна прямо рядом с названием на карточке.",
  "tour.s8.title": "Шаг 8: Дедлайн / даты",
  "tour.s8.text":
    "Задай диапазон дат приёма заявок — так ты не пропустишь закрытие регистрации на интересные конкурсы.",
  "tour.s9.title": "Готово!",
  "tour.s9.text": "Все настройки применены, и сайт подстроился под твои интересы. Удачи в победах!",
  "auth.username": "Юзернейм",
  "auth.usernameHint": "Латиница, цифры и «_», от 3 до 20 символов",
  "auth.usernamePlaceholder": "aigerim_k",
  "auth.identifier": "Email или юзернейм",
  "auth.needUsername": "Укажите юзернейм",
  "auth.badUsername": "Юзернейм: 3–20 символов, латиница, цифры и «_»",
  "auth.usernameTaken": "Этот юзернейм уже занят",
  "auth.badCredentials": "Неверный email/юзернейм или пароль",
});

Object.assign(kk, {
  "tour.gotIt": "Түсінікті!",
  "tour.pickBelow": "Қолайлы нұсқаны таңда",
  "tour.great": "Тамаша!",
  "tour.showResults": "Нәтижелерді көрсету",
  "tour.close": "Жабу",
  "tour.skipStep": "Қадамды өткізу",
  "tour.s3.text":
    "Тегін немесе ақылы. «Ақылы» таңдасаң, нақты бағасы карточкадағы атаудың жанында бірден көрінеді.",
  "tour.s8.title": "8-қадам: Мерзім / күндер",
  "tour.s8.text": "Өтінім қабылдау күндерін көрсет — тіркелудің жабылуын өткізіп алмайсың.",
  "tour.s9.title": "Дайын!",
  "tour.s9.text": "Барлық баптау қолданылды, сайт сенің қызығушылығыңа бейімделді. Жеңістер тілейміз!",
  "auth.username": "Юзернейм",
  "auth.usernameHint": "Латын әріптері, сандар және «_», 3–20 таңба",
  "auth.usernamePlaceholder": "aigerim_k",
  "auth.identifier": "Email немесе юзернейм",
  "auth.needUsername": "Юзернейм енгізіңіз",
  "auth.badUsername": "Юзернейм: 3–20 таңба, латын әрпі, сан және «_»",
  "auth.usernameTaken": "Бұл юзернейм бос емес",
  "auth.badCredentials": "Email/юзернейм немесе құпиясөз қате",
});

Object.assign(en, {
  "tour.gotIt": "Got it!",
  "tour.pickBelow": "Pick an option below",
  "tour.great": "Nice one!",
  "tour.showResults": "Show results",
  "tour.close": "Close the tip",
  "tour.skipStep": "Skip this step",
  "tour.s3.text":
    "Free or paid. If you pick “Paid”, the exact price is shown right next to the title on the card.",
  "tour.s8.title": "Step 8: Deadline / dates",
  "tour.s8.text": "Set a date range for applications so you never miss a closing deadline.",
  "tour.s9.title": "All set!",
  "tour.s9.text": "Your settings are applied and the catalog now matches your interests. Good luck out there!",
  "auth.username": "Username",
  "auth.usernameHint": "Latin letters, digits and “_”, 3–20 characters",
  "auth.usernamePlaceholder": "aigerim_k",
  "auth.identifier": "Email or username",
  "auth.needUsername": "Choose a username",
  "auth.badUsername": "Username: 3–20 characters, latin letters, digits and “_”",
  "auth.usernameTaken": "That username is already taken",
  "auth.badCredentials": "Wrong email/username or password",
});

/** Sample first names shown as a placeholder — rotated so it is never always "Айгерим". */
const NAME_SAMPLES: Record<Lang, string[]> = {
  ru: ["Айгерим", "Данияр", "Алина", "Тимур", "Мадина", "Арман", "Камила", "Ерасыл", "София", "Нурислам"],
  kk: ["Айгерім", "Данияр", "Әлия", "Темірлан", "Мәдина", "Арман", "Камила", "Ерасыл", "Аружан", "Нұрислам"],
  en: ["Aigerim", "Daniyar", "Alina", "Timur", "Madina", "Arman", "Kamila", "Yerassyl", "Sofia", "Nurislam"],
};

/** Deterministic per-mount pick, so the field does not flicker while typing. */
export function sampleName(lang: Lang, seed = Math.floor(Math.random() * 100)) {
  const list = NAME_SAMPLES[lang];
  return list[seed % list.length];
}

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
