'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type Status = 'present' | 'absent';
type Tab = 'dashboard' | 'calendar' | 'timetable' | 'syllabus' | 'settings';
type SubjectType = 'Theory' | 'Practical' | 'Mandatory Course';

type Subject = {
  code: string;
  name: string;
  type: SubjectType;
  classesPerWeek: number;
  credits: number;
};

type Slot = {
  day: number;
  start: string;
  end: string;
  code: string;
  detail?: string;
};

type Holiday = { date: string; name: string };
type RecordMap = Record<string, Status>;
type AppState = { records: RecordMap; holidays: Holiday[]; threshold: number; studentName: string; semester: string; slots: Slot[] };

const SUBJECTS: Subject[] = [
  { code: 'CS101', name: 'Introduction to Programming and Problem Solving', type: 'Theory', classesPerWeek: 3, credits: 3 },
  { code: 'PH101', name: 'Engineering Physics', type: 'Theory', classesPerWeek: 3, credits: 3 },
  { code: 'M101', name: 'Engineering Mathematics-I', type: 'Theory', classesPerWeek: 3, credits: 3 },
  { code: 'HU101', name: 'Environmental Science', type: 'Theory', classesPerWeek: 2, credits: 2 },
  { code: 'HU102', name: 'Indian Knowledge System', type: 'Theory', classesPerWeek: 1, credits: 1 },
  { code: 'CS191', name: 'Introduction to Programming and Problem-Solving Lab (CSE & Allied)', type: 'Practical', classesPerWeek: 3, credits: 1.5 },
  { code: 'PH191', name: 'Engineering Physics Lab', type: 'Practical', classesPerWeek: 3, credits: 1.5 },
  { code: 'ME194', name: 'Engineering Graphics & Computer Aided Design Lab', type: 'Practical', classesPerWeek: 3, credits: 1.5 },
  { code: 'HU191', name: 'Communication & Presentation Skill', type: 'Practical', classesPerWeek: 3, credits: 1.5 },
  { code: 'MC181', name: 'Induction Program', type: 'Mandatory Course', classesPerWeek: 0, credits: 0 },
];

const SLOTS: Slot[] = [
  { day: 1, start: '10:00', end: '10:50', code: 'PH101' },
  { day: 1, start: '12:30', end: '13:20', code: 'PH191', detail: 'Group A' },
  { day: 2, start: '10:50', end: '11:40', code: 'M101' },
  { day: 2, start: '13:20', end: '14:10', code: 'ME194', detail: 'Group A' },
  { day: 2, start: '15:00', end: '15:50', code: 'PH101' },
  { day: 2, start: '15:50', end: '16:40', code: 'HU101' },
  { day: 3, start: '10:00', end: '10:50', code: 'CS101' },
  { day: 3, start: '10:50', end: '11:40', code: 'M101' },
  { day: 3, start: '13:20', end: '14:10', code: 'CS191', detail: 'Group A' },
  { day: 3, start: '15:00', end: '15:50', code: 'HU102' },
  { day: 4, start: '14:10', end: '15:00', code: 'HU191', detail: 'Group A' },
  { day: 4, start: '15:00', end: '15:50', code: 'CS101' },
  { day: 5, start: '10:00', end: '10:50', code: 'M101' },
  { day: 5, start: '10:50', end: '11:40', code: 'PH101' },
  { day: 5, start: '12:30', end: '13:20', code: 'CS101' },
  { day: 5, start: '14:10', end: '15:00', code: 'HU101' },
];

const HOLIDAYS: Holiday[] = [
  ['2026-08-15','Independence Day'], ['2026-09-04','Janmashtami'], ['2026-09-18','Vishwakarma Puja'],
  ['2026-10-02','Mahatma Gandhi Jayanti / Mahalaya'], ['2026-10-10','Mahalaya'], ['2026-10-16','Durga Puja'],
  ['2026-10-17','Durga Puja'], ['2026-10-18','Durga Puja'], ['2026-10-19','Durga Puja'], ['2026-10-20','Durga Puja'],
  ['2026-10-21','Vijays Dashami, Dashera & Gandhi Birthday'], ['2026-10-22','Additional Day for Durga Puja'], ['2026-10-23','Additional Day for Durga Puja'],
  ['2026-10-25','Lakshmi Puja (Kojagari Purnima)'], ['2026-11-08','Kali Puja / Diwali'], ['2026-11-09','Additional Day for Kali Puja'],
  ['2026-11-10','Bhai Dooj'], ['2026-11-24','Guru Nanak Jayanti'], ['2026-12-25','Christmas Day'], ['2027-01-01','New Year'],
  ['2027-01-12','Swami Vivekananda Jayanti & Sports'], ['2027-01-23','Netaji Subhas Chandra Bose Jayanti'], ['2027-01-26','Republic Day'],
  ['2027-02-11','Saraswati Puja'], ['2027-03-10','Id-ul-Fitr'], ['2027-03-22','Dol Jatra / Holi'], ['2027-03-26','Good Friday'],
  ['2027-04-14','Ambedkar Jayanti'], ['2027-04-15','Bengali New Year / Ram Navami'], ['2027-05-01','May Day'], ['2027-05-10','Rabindra Jayanti'],
  ['2027-05-17','Id-ul-Adha'], ['2027-05-20','Buddha Purnima'],
].map(([date,name]) => ({ date, name }));

const SYLLABUS: Record<string, { overview: string; modules: {title:string; hours?:string; topics:string[]}[]; flow:string[]; outcomes:string[] }> = {
  CS101:{overview:'Introduction to computing, algorithmic problem solving and structured C programming.',modules:[
    {title:'Basics of Computing & Number Representation',hours:'7L',topics:['Computer generations and classification','CPU and memory architecture','Number systems and conversions','1’s and 2’s complement','IEEE-754 floating-point representation','ASCII','Compiler, interpreter and assembler overview']},
    {title:'Problem Solving & Introduction to C',hours:'7L',topics:['Algorithms, flowcharts and pseudocode','Procedural vs structured programming','C keywords and identifiers','Data types and variables','Operators and precedence','scanf() and printf()']},
    {title:'Control Structures & Program Design',hours:'7L',topics:['if, else, nested conditions and switch','while, for and do-while loops','break and continue','goto','Functions and recursion','Parameter passing','Storage classes: auto, static, extern, register','Preprocessor directives and macros']},
    {title:'Arrays, Pointers & Strings',hours:'8L',topics:['1D and 2D arrays','Passing arrays to functions','Pointers and pointer arithmetic','Pointers to arrays','Character arrays and strings','String library functions','Array of strings','malloc(), calloc(), realloc() and free()']},
    {title:'Structured Data Types, File Handling & System Interface',hours:'7L',topics:['Structures and initialization','Array of structures and pointers to structures','Union, enum, typedef and bit fields','File I/O: fopen(), fclose(), fprintf(), fscanf(), fgetc(), fputc()','Command-line arguments']}
  ],flow:['Problem','Algorithm / Pseudocode','Flowchart','C Program','Compile','Run & Test','Debug','Final Solution'],outcomes:['Understand computer architecture and number representation','Construct algorithms and flowcharts','Write modular C programs','Use arrays, pointers and dynamic memory','Use structures and file I/O for persistent data']},
  PH101:{overview:'Modern optics, solid-state physics, quantum and statistical mechanics, nanomaterials, and display/storage devices.',modules:[
    {title:'Modern Optics',hours:'11L',topics:['Laser: absorption and emission processes','Einstein A and B coefficients','Metastable state and population inversion','Optical resonator','Ruby, He-Ne and semiconductor lasers','Laser applications and numericals','Fibre optics: step-index and graded-index fibres','Single and multimode propagation','Numerical aperture and acceptance angle','Optical-fibre losses','Holography: basic concepts and applications']},
    {title:'Solid State Physics',hours:'5L',topics:['Crystal structures and Bravais lattices','Miller indices','Packing factor','Bragg equation','Band theory','Metals, semiconductors and insulators','p-n junction basics']},
    {title:'Quantum & Statistical Mechanics',hours:'14L',topics:['Quantization','Photoelectric and Compton effects','de Broglie hypothesis','Davisson-Germer experiment','Wave function and uncertainty principle','Schrödinger equation','Maxwell-Boltzmann, Bose-Einstein and Fermi-Dirac statistics','Fermi level']},
    {title:'Physics of Nanomaterials',hours:'4L',topics:['Quantum wells, wires and dots','Quantum confinement','Carbon allotropes: CNT and graphene','Nanomaterial applications']},
    {title:'Storage & Display Devices',hours:'2L',topics:['Magnetic storage','CRT','CRO','LED','OLED','Operation and applications']}
  ],flow:['Physical principle','Mathematical model','Experiment / observation','Analysis','Engineering application'],outcomes:['Explain lasers, fibre optics and holography','Analyze crystal structures and semiconductor behaviour','Apply quantum and statistical concepts','Explain nanomaterial properties','Describe modern display and storage devices']},
  M101:{overview:'Engineering Mathematics-I develops linear algebra and single- and multivariable calculus tools used across engineering.',modules:[
    {title:'Linear Algebra',hours:'11L',topics:['Echelon and normal (canonical) form','Inverse and rank of a matrix','Consistency and inconsistency of linear systems','Solutions of systems of linear equations','Eigenvalues and eigenvectors','Cayley-Hamilton theorem','Diagonalization and related matrix methods']},
    {title:'Single Variable Calculus',hours:'8L',topics:['Limits and continuity','Differentiation','Mean-value concepts','Rolle’s theorem','Lagrange mean value theorem','Taylor and Maclaurin expansions','Applications of derivatives']},
    {title:'Integral Calculus',hours:'6L',topics:['Indefinite and definite integration','Standard integration techniques','Improper integrals','Applications of integration']},
    {title:'Multivariable Differential Calculus',hours:'5L',topics:['Functions of several variables','Partial derivatives','Total derivatives','Maxima and minima','Engineering interpretation of multivariable change']},
    {title:'Multivariable Integral Calculus',hours:'6L',topics:['Double integrals','Triple integrals','Change of order / variables where applicable','Applications to engineering quantities']}
  ],flow:['Given engineering problem','Choose mathematical model','Matrix / derivative / integral method','Solve','Interpret result','Engineering application'],outcomes:['Solve matrix systems and compute rank','Find eigenvalues/eigenvectors','Apply differential and integral calculus','Analyze multivariable functions','Interpret mathematical results in engineering contexts']},
  HU101:{overview:'Environmental resources, ecosystems, environmental degradation, pollution control, laws and disaster management.',modules:[
    {title:'Resources and Ecosystem',hours:'6L',topics:['Types of resources','Human resource','Population growth: exponential and logistic models','Maximum Sustainable Yield and derivation','Solar, tidal, geothermal and biomass energy','Ecosystem components and types','Forest, grassland, desert and pond ecosystems','Food chains and food webs']},
    {title:'Environmental Degradation',hours:'10L',topics:['Air pollutants: primary, secondary and criteria pollutants','Photochemical and London smog','Greenhouse effect, global warming, acid rain and ozone depletion','Water pollutants and oxygen-demanding wastes','Heavy metals, BOD, COD and eutrophication','Hardness, alkalinity, TDS and chloride','As, Hg and Pb toxicity','Solid, municipal, hazardous, biomedical and e-waste','Noise frequency, pressure, intensity and decibel measurement','Health effects and numerical problems']},
    {title:'Environmental Management',hours:'6L',topics:['Environmental Impact Assessment','Environmental auditing','Environmental laws and Protection Acts of India','Carbon footprint and green buildings (GRIHA norms)','Air pollution control devices','Catalytic converter and electrostatic precipitator','Surface-water treatment and activated sludge process','Temporary and permanent hardness removal using permutit process','Solid waste management, land filling, incineration, composting and vermicomposting','E-waste and biomedical waste management']},
    {title:'Disaster Management',hours:'2L',topics:['Natural and man-made disasters','Earthquakes, floods, droughts and landslides','Cyclones, volcanic eruptions and tsunami','Oil spills and forest fires','Disaster management principles','Disaster management cycle','Disaster management policy and awareness programmes']}
  ],flow:['Resource / activity','Environmental impact','Pollution / degradation','Risk assessment','Control / treatment','Management & law','Sustainable practice'],outcomes:['Understand natural resources and ecosystems','Assess environmental and health risks','Understand environmental laws and safety procedures','Solve air, water, land and noise pollution problems']},
  HU102:{overview:'Indian Knowledge System covering ancient knowledge frameworks, Vedic corpus, philosophy, mathematics, astronomy, science, technology and traditional practices.',modules:[
    {title:'Overview of Indian Knowledge System',hours:'3L',topics:['Importance of ancient knowledge','Definition and classification framework of IKS','Unique aspects of IKS','Vedas and Vedangas','Distinctive features of Vedic life','Orthodox and unorthodox schools of Indian philosophy']},
    {title:'Indian Mathematics & Astronomy',hours:'3L',topics:['Indian numeral system','Development of mathematics in ancient India','Decimal representation','Discovery and importance of zero','Approaches to representing numbers','Contributions of ancient Indian mathematicians','Historical development of Indian astronomy','Key contributions of ancient Indian astronomers']},
    {title:'Science & Technology Heritage',hours:'3L',topics:['Metals and metalworking','Mining and ore extraction','Structural engineering and architecture','Planning, materials and construction approaches','Dyes and painting','Shipbuilding']},
    {title:'Traditional Knowledge in Different Sectors',hours:'3L',topics:['Traditional knowledge and engineering','Traditional agricultural practices and technical aids','Traditional medicine and surgery','History of traditional art forms and culture']}
  ],flow:['Ancient knowledge source','Classify / understand context','Scientific or cultural contribution','Historical development','Modern relevance / application'],outcomes:['Describe philosophical and socio-religious heritage','Compare Indian developments in mathematics and astronomy','Analyze science and technology heritage','Explore traditional knowledge in health, architecture, agriculture and art']},
  CS191:{overview:'Practical C programming aligned with the theory course, from basic I/O through pointers, structures and file-based applications.',modules:[
    {title:'C Fundamentals',topics:['Introduction to C','Basic input/output','Data types','Operators and precedence','Simple computational programs']},{title:'Control & Functions',topics:['Decision making','Loops','Functions','Modular programming','Recursion and debugging']},{title:'Arrays, Strings & Pointers',topics:['1D/2D arrays','String handling','Pointers','Pointer arithmetic','Dynamic memory management']},{title:'Structures & Files',topics:['Structures and pointers to structures','File operations','Formatted data handling','Persistent storage']},{title:'Integrated Mini-Project',topics:['Combine programming concepts','Team-based implementation','Testing and debugging','Functional project delivery']}
  ],flow:['Problem statement','Algorithm / flowchart','C implementation','Compile & debug','Test with cases','Document result'],outcomes:['Apply fundamental programming constructs','Design modular programs','Use pointers and dynamic memory','Build file-based applications','Integrate concepts into a functional mini-project']},
  PH191:{overview:'Hands-on physics experiments covering measurement, classical physics, optics, quantum physics and electronic devices.',modules:[
    {title:'Measurements & Errors',topics:['Mandatory error-estimation experiment using slide calipers, screw gauge or travelling microscope']},{title:'Classical Physics Experiments',topics:['Torsional oscillation of torsional pendulum','Young’s modulus','Rigidity modulus','Newton’s rings wavelength','Laser diffraction wavelength','Optical-fibre numerical aperture and power loss']},{title:'Quantum Physics Experiments',topics:['Planck’s constant using photoelectric cell','Frank-Hertz experiment','Stefan’s constant','Solar-cell characteristics: illumination/areal/spectral and I-V/power-load/power-wavelength characteristics']},{title:'Electronic Device Experiments',topics:['Q factor using LCR circuit','I-V characteristics of LED/LDR','Band gap of a semiconductor']},{title:'Advanced / Innovative Experiments',topics:['Specific charge e/m by Thomson method','Hall coefficient and magnetoresistance','Prism dispersive power','Thermal conductivity','Optical rotation','One experiment beyond the syllabus is recommended']}
  ],flow:['Set up apparatus','Measure / observe','Record readings','Calculate physical quantity','Compare / analyze','Conclude with uncertainty'],outcomes:['Determine mechanical properties experimentally','Perform optical experiments','Investigate quantum effects','Characterize semiconductor/electronic devices','Apply advanced physics principles experimentally']},
  ME194:{overview:'Engineering drawing and CAD skills: drafting standards, projections, sections, dimensioning, surface development, 3D modelling and assemblies.',modules:[
    {title:'Introduction to Engineering Drawing',hours:'6P',topics:['Engineering graphics principles','Drawing instruments and standards','Lettering','Conic sections including rectangular hyperbola','Cycloid, epicycloid and involute','Plain, diagonal and vernier scales']},{title:'Projection & Descriptive Geometry',topics:['Orthographic projection','Descriptive geometry','Isometric projection','True length and angle','Intersection and shortest distance']},{title:'Sections, Dimensioning & Development',topics:['Sectional views','Dimensioning and tolerances','Surface development','Reading engineering drawings','Perspective concepts']},{title:'Computer Aided Drafting',topics:['CAD representation of lines, surfaces and solids','Different engineering viewpoints','2D drafting and annotations','Layers and drawing customization']},{title:'3D Parts, Assembly & Design Project',topics:['Part modelling','Assembly operations','Engineering model representation','Design project and presentation']}
  ],flow:['Design intent','2D sketch / projection','Dimensions & constraints','3D part / surface','Assembly','Engineering drawing','Presentation'],outcomes:['Use drafting tools and standards','Understand scales, projections and sections','Apply CAD techniques','Create part models and assemblies','Represent and present a design project']},
  HU191:{overview:'Communication and presentation skill through language-lab practice: communication theory, LSRW, professional writing and workplace interaction.',modules:[
    {title:'Theories of Communication & Soft Skills',topics:['Communication and cyclic process','Workplace communication principles','Non-verbal communication','Introduction and significance of soft skills','Soft skills versus hard skills']},{title:'Listening & Speaking',topics:['Listening strategies','Speaking practice','Pronunciation and fluency','Interpersonal speaking','Professional conversations']},{title:'Reading & Writing',topics:['Reading for academic and professional contexts','Writing clarity and structure','Vocabulary and language accuracy','Professional written communication']},{title:'Professional Writing',topics:['Professional documents','Models and templates','Formal workplace writing','Editing and improving professional documents']},{title:'Presentation & Workplace Interaction',topics:['Presentation skills','Interpersonal communication','Negotiation and collaboration','Work-specific interactions and professional conclaves']}
  ],flow:['Understand audience','Choose message','Organize content','Deliver / present','Receive feedback','Refine communication'],outcomes:['Use advanced technical communication and soft skills','Apply LSRW skills professionally','Communicate effectively in academic/business settings','Critique professional writing','Collaborate and present confidently']},
  MC181:{overview:'Mandatory induction programme for orientation and transition into the academic environment.',modules:[{title:'Induction Program',topics:['Orientation and institutional familiarization','Academic transition','Student engagement and introductory activities']}],flow:['Orientation','Familiarization','Participation','Reflection'],outcomes:['Become familiar with the academic environment','Participate in induction activities']}
};

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STORAGE_KEY = 'attendly-cse4-group-a-v5';
const START_DATE = '2026-08-01';

function iso(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseDate(s: string) { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
function subject(code: string) { return SUBJECTS.find(s => s.code === code)!; }
function slotKey(date: string, code: string, start: string) { return `${date}|${code}|${start}`; }
function isHoliday(date: string, holidays: Holiday[]) { return holidays.some(h => h.date === date); }
function weekSlots(day: number) { return SLOTS.filter(s => s.day === day); }
function pct(attended: number, total: number) { return total <= 0 ? 0 : Math.round((attended / total) * 1000) / 10; }
function neededToReach(attended: number, total: number, target: number) { return Math.max(0, Math.ceil(((target/100) * total - attended) / (1 - target/100))); }
function safeSkips(attended: number, total: number, target: number) { return Math.max(0, Math.floor((attended - (target/100)*total) / (target/100))); }

function buildSeedRecords(holidays: Holiday[]) {
  const records: RecordMap = {};
  const start = parseDate(START_DATE);
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let d = new Date(start); d <= today; d.setDate(d.getDate()+1)) {
    const date = iso(d);
    const dow = d.getDay();
    if (dow === 0 || dow === 6 || isHoliday(date, holidays)) continue;
    weekSlots(dow).forEach((slot, index) => {
      const key = slotKey(date, slot.code, slot.start);
      const dayIndex = Math.floor((d.getTime() - start.getTime()) / 86400000);
      const deterministic = (dayIndex + index + slot.code.length) % 10 !== 0;
      records[key] = deterministic ? 'present' : 'absent';
    });
  }
  return records;
}

function defaultState(): AppState {
  return { records: buildSeedRecords(HOLIDAYS), holidays: HOLIDAYS, threshold: 75, studentName: 'Sneha', semester: 'Semester 1', slots: SLOTS };
}

function PenguinLogo({ size = 38 }: { size?: number }) {
  return <div className="penguinLogo" style={{ width: size, height: size }} aria-label="Attendly penguin logo">
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img">
      <defs><linearGradient id="penguinGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7a294f"/><stop offset="1" stopColor="#d85b8a"/></linearGradient></defs>
      <circle cx="32" cy="32" r="31" fill="#fff0f6"/>
      <ellipse cx="32" cy="36" rx="19" ry="22" fill="url(#penguinGradient)"/>
      <ellipse cx="32" cy="39" rx="12.5" ry="15" fill="#fff"/>
      <circle cx="25" cy="27" r="3.2" fill="#fff"/><circle cx="39" cy="27" r="3.2" fill="#fff"/>
      <circle cx="25" cy="27" r="1.35" fill="#7a294f"/><circle cx="39" cy="27" r="1.35" fill="#7a294f"/>
      <path d="M28 31 L36 31 L32 36 Z" fill="#ee8fb1"/>
      <ellipse cx="19" cy="49" rx="8" ry="3.5" fill="#ee8fb1"/><ellipse cx="45" cy="49" rx="8" ry="3.5" fill="#ee8fb1"/>
    </svg>
  </div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [state, setState] = useState<AppState>(() => defaultState());
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(iso(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [syllabusCode, setSyllabusCode] = useState('CS101');
  const [settingsName, setSettingsName] = useState('Sneha');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState({ ...defaultState(), ...parsed, holidays: HOLIDAYS });
        setSettingsName(parsed.studentName || 'Sneha');
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state, ready]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(t); }, [toast]);

  const stats = useMemo(() => {
    return SUBJECTS.map(s => {
      const entries = Object.entries(state.records).filter(([k]) => k.split('|')[1] === s.code);
      const total = entries.length;
      const attended = entries.filter(([,v]) => v === 'present').length;
      const percent = pct(attended,total);
      return { ...s, total, attended, absent: total-attended, percent, needed: neededToReach(attended,total,state.threshold), safe: safeSkips(attended,total,state.threshold) };
    });
  }, [state.records, state.threshold]);

  const todaySlots = useMemo(() => state.slots.filter(s => s.day === new Date().getDay()), [state.slots]);
  const overall = useMemo(() => {
    const regular = stats.filter(s => s.total > 0);
    const attended = regular.reduce((a,s)=>a+s.attended,0); const total = regular.reduce((a,s)=>a+s.total,0);
    return { attended, total, percent: pct(attended,total) };
  }, [stats]);

  function mark(date: string, slot: Slot, status: Status) {
    if (isHoliday(date,state.holidays)) return;
    setState(prev => ({ ...prev, records: { ...prev.records, [slotKey(date,slot.code,slot.start)]: status } }));
    setToast(status === 'present' ? 'Marked present' : 'Marked absent');
  }

  function resetData() {
    if (!window.confirm('Reset all attendance records to the initial Aug 1 seed?')) return;
    const next = defaultState(); setState(next); setToast('Attendance reset');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='attendly-backup.json'; a.click(); URL.revokeObjectURL(url); setToast('Backup exported');
  }

  function importData(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const parsed = JSON.parse(String(reader.result)); if (!parsed.records) throw new Error(); setState({ ...defaultState(), ...parsed, holidays: HOLIDAYS }); setToast('Backup imported'); }
      catch { setToast('Invalid backup file'); }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  function goToDate(date: string) { setSelectedDate(date); const d=parseDate(date); setCalendarMonth(new Date(d.getFullYear(),d.getMonth(),1)); setTab('calendar'); }

  const filteredSubjects = SUBJECTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (!ready) return <div className="loading"><PenguinLogo size={52}/>Loading Attendly…<style jsx>{styles}</style></div>;

  return <main className="appShell">
    <aside className="sidebar">
      <div className="brand"><PenguinLogo size={40}/><div><b>Attendly</b><span>Smart attendance</span></div></div>
      <div className="studentCard"><div className="avatar">{(state.studentName||'S')[0].toUpperCase()}</div><div><strong>{state.studentName}</strong><span>CSE 4 · Group A</span><small>{state.semester}</small></div></div>
      <nav>{([['dashboard','⌂','Dashboard'],['calendar','▦','Calendar'],['timetable','☷','Timetable'],['syllabus','▤','Syllabus'],['settings','⚙','Settings']] as const).map(([id,icon,label]) => <button key={id} className={tab===id?'nav active':'nav'} onClick={()=>setTab(id)}><i>{icon}</i>{label}</button>)}</nav>
      <div className="sideBottom"><div className="miniStat"><span>Overall</span><strong>{overall.percent}%</strong></div><div className="sideHint">Target <b>{state.threshold}%</b><br/>Keep every subject safe.</div></div>
    </aside>

    <section className="content">
      <header className="topbar"><div><span className="eyebrow">CSE 4 · GROUP A</span><h1>{tabTitle(tab)}</h1></div><button className="searchBtn" onClick={()=>setSearchOpen(true)}>⌕ <span>Search</span><kbd>⌘ K</kbd></button></header>
      {tab==='dashboard' && <Dashboard stats={stats} threshold={state.threshold} todaySlots={todaySlots} records={state.records} selectedDate={selectedDate} onDate={goToDate} overall={overall} onMark={mark} holidays={state.holidays} />}
      {tab==='calendar' && <Calendar month={calendarMonth} setMonth={setCalendarMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} holidays={state.holidays} records={state.records} onMark={mark} threshold={state.threshold} slots={state.slots} />}
      {tab==='timetable' && <Timetable selectedDate={selectedDate} setSelectedDate={setSelectedDate} records={state.records} holidays={state.holidays} slots={state.slots} onMark={mark} onEdit={(next)=>setState(prev=>({...prev,slots:next}))} />}
      {tab==='syllabus' && <Syllabus code={syllabusCode} setCode={setSyllabusCode} />}
      {tab==='settings' && <Settings state={state} setState={setState} settingsName={settingsName} setSettingsName={setSettingsName} onSaveName={()=>{setState(s=>({...s,studentName:settingsName.trim()||'Sneha'}));setToast('Settings saved')}} onExport={exportData} onImport={()=>fileRef.current?.click()} onReset={resetData} />}
    </section>

    <input ref={fileRef} hidden type="file" accept="application/json" onChange={importData}/>
    {searchOpen && <div className="overlay" onMouseDown={()=>setSearchOpen(false)}><div className="searchModal" onMouseDown={e=>e.stopPropagation()}><div className="searchRow"><span>⌕</span><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subjects…"/><kbd>ESC</kbd></div><div className="searchResults">{filteredSubjects.map(s=><button key={s.code} onClick={()=>{setSearchOpen(false);setSearch('');setSyllabusCode(s.code);setTab('syllabus')}}><b>{s.name}</b></button>)}{!filteredSubjects.length&&<div className="empty">No subjects found.</div>}</div></div></div>}
    {toast && <div className="toast">✓ {toast}</div>}
    <style jsx>{styles}</style>
  </main>;
}

function tabTitle(tab: Tab) { return ({dashboard:'Dashboard',calendar:'Attendance Calendar',timetable:'Weekly Timetable',syllabus:'Syllabus',settings:'Settings'} as Record<Tab,string>)[tab]; }

function Dashboard({stats,threshold,todaySlots,records,onDate,overall,onMark,holidays}:{stats:any[];threshold:number;todaySlots:Slot[];records:RecordMap;selectedDate:string;onDate:(d:string)=>void;overall:{attended:number;total:number;percent:number};onMark:(date:string,slot:Slot,status:Status)=>void;holidays:Holiday[]}) {
  const date=iso(new Date());
  return <div className="page">
    <div className="heroGrid"><div className="heroCard"><div><span className="eyebrow">TODAY · {formatLongDate(new Date())}</span><h2>{overall.percent >= threshold ? 'You are on track.' : 'A little catch-up needed.'}</h2><p>{overall.attended} of {overall.total} classes attended overall. Your target is {threshold}%.</p></div><div className="ring" style={{'--p':`${Math.min(overall.percent,100)}%`} as React.CSSProperties}><span>{overall.percent}%</span></div></div><div className="quickCard todayClasses"><div className="todayHead"><div><span className="eyebrow">TODAY’S CLASSES</span><h3>{formatLongDate(new Date())}</h3></div><span className="penguinBadge"><PenguinLogo size={28}/></span></div>{isHoliday(date,holidays)?<div className="todayEmpty"><b>Holiday today</b><span>{holidays.find(h=>h.date===date)?.name}</span></div>:todaySlots.length ? todaySlots.map((s,i)=><ClassLine key={i} slot={s} date={date} records={records} compact onMark={onMark}/>):<div className="todayEmpty"><b>No classes today</b><span>Enjoy your day.</span></div>}<button className="textBtn" onClick={()=>onDate(date)}>Open today →</button></div></div>
    <div className="sectionHead"><div><span className="eyebrow">SUBJECT HEALTH</span><h2>All subjects</h2></div><span className="pill">Minimum {threshold}%</span></div>
    <div className="subjectGrid">{stats.filter(s=>s.code!=='MC181').map(s=><SubjectCard key={s.code} s={s} threshold={threshold}/>)}</div>
    <div className="bottomGrid"><div className="panel"><div className="panelHead"><div><span className="eyebrow">QUICK INSIGHT</span><h3>Smart skip planner</h3></div></div>{stats.filter(s=>s.code!=='MC181').sort((a,b)=>a.percent-b.percent).slice(0,3).map(s=><div className="insight" key={s.code}><span className="dot" data-good={s.percent>=threshold}/><div><b>{s.name}</b><small>{s.percent>=threshold?`${s.safe} safe skip${s.safe===1?'':'s'} available`:`Attend ${s.needed} more consecutive class${s.needed===1?'':'es'} to reach ${threshold}%`}</small></div><strong>{s.percent}%</strong></div>)}</div><div className="panel calendarMini"><div className="panelHead"><div><span className="eyebrow">ATTENDANCE</span><h3>At a glance</h3></div></div><div className="miniBars">{stats.filter(s=>s.code!=='MC181').map(s=><div key={s.code}><span>{s.name}</span><div><i style={{width:`${Math.min(s.percent,100)}%`}}/></div><b>{s.percent}%</b></div>)}</div></div></div>
  </div>;
}

function SubjectCard({s,threshold}:{s:any;threshold:number}) { const good=s.percent>=threshold; return <div className="subjectCard"><div className="subjectTop"><span className="code">{s.type}</span><span className={good?'status good':'status warn'}>{good?'Safe':'Needs focus'}</span></div><h3>{s.name}</h3><div className="percentRow"><strong>{s.percent}%</strong><span>{s.attended}/{s.total} attended</span></div><div className="progress"><i style={{width:`${Math.min(s.percent,100)}%`}}/></div><div className="cardFoot">{good?<span>Can safely skip <b>{s.safe}</b></span>:<span>Need <b>{s.needed}</b> more</span>}<span>{s.credits} credit{s.credits===1?'':'s'}</span></div></div>; }

function ClassLine({slot,date,records,compact,onMark}:{slot:Slot;date:string;records:RecordMap;compact?:boolean;onMark?: (date:string,slot:Slot,status:Status)=>void}) { const s=subject(slot.code); const status=records[slotKey(date,slot.code,slot.start)]; return <div className={compact?'classLine compact':'classLine'}><div className="time">{slot.start}<small>{slot.end}</small></div><div className="classInfo"><b>{s.name}</b><span>{s.type}{slot.detail?` · ${slot.detail}`:''}</span></div>{onMark&&<div className="markBtns"><button className={status==='present'?'marked present':''} onClick={()=>onMark(date,slot,'present')}>P</button><button className={status==='absent'?'marked absent':''} onClick={()=>onMark(date,slot,'absent')}>A</button></div>}</div>; }

function Calendar({month,setMonth,selectedDate,setSelectedDate,holidays,records,onMark,threshold,slots}:{month:Date;setMonth:(d:Date)=>void;selectedDate:string;setSelectedDate:(d:string)=>void;holidays:Holiday[];records:RecordMap;onMark:(date:string,slot:Slot,status:Status)=>void;threshold:number;slots:Slot[]}) {
  const first=new Date(month.getFullYear(),month.getMonth(),1); const start=new Date(first); start.setDate(1-first.getDay());
  const cells=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d});
  const selectedSlots=slots.filter(s=>s.day===parseDate(selectedDate).getDay()); const holiday=isHoliday(selectedDate,holidays);
  return <div className="page"><div className="calendarLayout"><div className="panel calendarPanel"><div className="calendarHead"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>‹</button><h2>{MONTHS[month.getMonth()]} {month.getFullYear()}</h2><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>›</button></div><div className="weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><span key={x}>{x}</span>)}</div><div className="calendarGrid">{cells.map(d=>{const ds=iso(d),out=d.getMonth()!==month.getMonth(),hol=isHoliday(ds,holidays),sel=ds===selectedDate;const has=Object.keys(records).some(k=>k.startsWith(ds+'|'));return <button key={ds} className={`day ${out?'muted':''} ${sel?'selected':''} ${hol?'holiday':''}`} onClick={()=>setSelectedDate(ds)}><span>{d.getDate()}</span>{hol&&<i/>}{has&&!hol&&<em/>}</button>})}</div><div className="legend"><span><i className="legendDot holidayDot"/>Holiday</span><span><i className="legendDot classDot"/>Class records</span><span><i className="legendDot selectedDot"/>Selected</span></div></div><div className="panel dayPanel"><span className="eyebrow">SELECTED DAY</span><h2>{formatLongDate(parseDate(selectedDate))}</h2>{holiday?<div className="holidayBox">☀ <div><b>{holidays.find(h=>h.date===selectedDate)?.name}</b><span>No scheduled attendance on a holiday.</span></div></div>:selectedSlots.length?<div className="dayClasses">{selectedSlots.map(s=><ClassLine key={s.start+s.code} slot={s} date={selectedDate} records={records} onMark={onMark}/>)}</div>:<div className="empty">No classes scheduled.</div>}<div className="dayNote">Attendance target: <b>{threshold}%</b></div></div></div></div>;
}

function Timetable({selectedDate,setSelectedDate,records,holidays,slots,onMark,onEdit}:{selectedDate:string;setSelectedDate:(d:string)=>void;records:RecordMap;holidays:Holiday[];slots:Slot[];onMark:(date:string,slot:Slot,status:Status)=>void;onEdit:(slots:Slot[])=>void}) {
  const monday=new Date(); const dow=monday.getDay(); monday.setDate(monday.getDate()-(dow===0?6:dow-1));
  const days=Array.from({length:6},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d});
  const [editMode,setEditMode]=useState(false);
  const [draft,setDraft]=useState<Slot[]>(slots);
  useEffect(()=>setDraft(slots),[slots]);
  function updateSlot(index:number,key:keyof Slot,value:string){ setDraft(prev=>prev.map((x,i)=>i===index?({...x,[key]:key==='day'?Number(value):value}):x)); }
  function addSlot(day:number){ setDraft(prev=>[...prev,{day,start:'10:00',end:'10:50',code:'CS101'}]); }
  function removeSlot(index:number){ setDraft(prev=>prev.filter((_,i)=>i!==index)); }
  function save(){ onEdit(draft); setEditMode(false); }
  return <div className="page"><div className="timetableToolbar"><div><span className="eyebrow">EDITABLE TIMETABLE</span><h2>Weekly Schedule</h2></div>{editMode?<div className="editActions"><button className="softBtn" onClick={()=>{setDraft(slots);setEditMode(false)}}>Cancel</button><button className="primary" onClick={save}>Save changes</button></div>:<button className="primary" onClick={()=>setEditMode(true)}>✎ Edit timetable</button>}</div>{editMode?<div className="panel timetableEditor"><p className="mutedText">Change the day, time or subject. Add/remove classes and save. Changes are stored locally.</p>{draft.map((slot,i)=><div className="editorRow" key={i}><select value={slot.day} onChange={e=>updateSlot(i,'day',e.target.value)}>{[1,2,3,4,5,6].map(d=><option key={d} value={d}>{DAY_NAMES[d]}</option>)}</select><input type="time" value={slot.start} onChange={e=>updateSlot(i,'start',e.target.value)}/><input type="time" value={slot.end} onChange={e=>updateSlot(i,'end',e.target.value)}/><select value={slot.code} onChange={e=>updateSlot(i,'code',e.target.value)}>{SUBJECTS.filter(x=>x.code!=='MC181').map(x=><option key={x.code} value={x.code}>{x.name}</option>)}</select><button className="dangerIcon" onClick={()=>removeSlot(i)}>×</button></div>)}<div className="addGrid">{[1,2,3,4,5].map(d=><button key={d} className="softBtn" onClick={()=>addSlot(d)}>+ {DAY_NAMES[d]}</button>)}</div></div>:<><div className="weekStrip">{days.map(d=>{const ds=iso(d);return <button key={ds} className={ds===selectedDate?'weekDay active':'weekDay'} onClick={()=>setSelectedDate(ds)}><small>{DAY_NAMES[d.getDay()].slice(0,3)}</small><b>{d.getDate()}</b><span>{MONTHS[d.getMonth()].slice(0,3)}</span></button>})}</div><div className="schedule">{days.map(d=>{const ds=iso(d);const daySlots=slots.filter(s=>s.day===d.getDay());const hol=isHoliday(ds,holidays);return <div className="scheduleDay" key={ds}><div className="scheduleTitle"><div><b>{DAY_NAMES[d.getDay()]}</b><span>{formatShortDate(d)}</span></div>{hol&&<span className="holidayBadge">Holiday</span>}</div>{hol?<div className="holidayBox">☀ <div><b>{holidays.find(h=>h.date===ds)?.name}</b><span>Classes are not counted.</span></div></div>:daySlots.length?daySlots.map(s=><ClassLine key={s.start+s.code} slot={s} date={ds} records={records} onMark={onMark}/>):<div className="empty">No classes.</div>}</div>})}</div></>}</div>;
}

function Syllabus({code,setCode}:{code:string;setCode:(c:string)=>void}) {
  const s=subject(code); const data=SYLLABUS[code];
  return <div className="page syllabusPage">
    <div className="syllabusTabs">{SUBJECTS.map(x=><button key={x.code} className={x.code===code?'active':''} onClick={()=>setCode(x.code)}>{x.name}</button>)}</div>
    <div className="syllabusHero"><div><span className="eyebrow">{s.type.toUpperCase()} · {s.code}</span><h2>{s.name}</h2><p>{data.overview}</p></div><div className="courseMeta"><b>{s.classesPerWeek||0}</b><span>classes / week</span><b>{s.credits}</b><span>credits</span></div></div>
    <div className="studyFlow"><div className="flowHead"><div><span className="eyebrow">LEARNING FLOW</span><h3>How the subject connects</h3></div></div><div className="flowTrack">{data.flow.map((x,i)=><React.Fragment key={x}><div className="flowNode"><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b></div>{i<data.flow.length-1&&<div className="flowArrow">→</div>}</React.Fragment>)}</div></div>
    <div className="syllabusDetailGrid">{data.modules.map((m,i)=><div className="detailModule" key={m.title}><div className="moduleBadge">MODULE {i+1}{m.hours&&<small>{m.hours}</small>}</div><h3>{m.title}</h3><div className="topicList">{m.topics.map(t=><div key={t}><span>✓</span><p>{t}</p></div>)}</div></div>)}</div>
    <div className="outcomePanel"><span className="eyebrow">COURSE OUTCOMES</span><h3>By the end of this course</h3><div className="outcomeGrid">{data.outcomes.map((o,i)=><div key={o}><b>CO{i+1}</b><span>{o}</span></div>)}</div></div>
    <div className="sourceNote">Detailed syllabus is based on the R25 B.Tech. CSE curriculum supplied for this project. Flow diagrams are a visual organization of the listed syllabus topics.</div>
  </div>;
}

function Settings({state,setState,settingsName,setSettingsName,onSaveName,onExport,onImport,onReset}:{state:AppState;setState:React.Dispatch<React.SetStateAction<AppState>>;settingsName:string;setSettingsName:(x:string)=>void;onSaveName:()=>void;onExport:()=>void;onImport:()=>void;onReset:()=>void}) { return <div className="page settingsPage"><div className="panel settingPanel"><div className="panelHead"><div><span className="eyebrow">PROFILE</span><h2>Student setup</h2></div></div><label>Student name<input value={settingsName} onChange={e=>setSettingsName(e.target.value)}/></label><div className="fixedRow"><div><span>Class</span><b>CSE 4</b></div><div><span>Group</span><b>Group A</b></div><div><span>Semester</span><b>{state.semester}</b></div></div><button className="primary" onClick={onSaveName}>Save profile</button></div><div className="panel settingPanel"><div className="panelHead"><div><span className="eyebrow">ATTENDANCE RULE</span><h2>Minimum target</h2></div></div><div className="rangeRow"><input type="range" min="50" max="100" value={state.threshold} onChange={e=>setState(s=>({...s,threshold:Number(e.target.value)}))}/><strong>{state.threshold}%</strong></div><p className="mutedText">Safe-skip and required-class calculations use this target for every subject.</p></div><div className="panel settingPanel"><div className="panelHead"><div><span className="eyebrow">DATA</span><h2>Backup & restore</h2></div></div><div className="actionGrid"><button onClick={onExport}>↓ Export backup</button><button onClick={onImport}>↑ Import backup</button><button className="danger" onClick={onReset}>↻ Reset attendance</button></div><p className="mutedText">Your attendance is stored locally in this browser. Export a backup before clearing browser data.</p></div><div className="panel settingPanel"><div className="panelHead"><div><span className="eyebrow">CURRICULUM</span><h2>Semester structure</h2></div></div><div className="curriculumList">{SUBJECTS.map(s=><div key={s.code}><b>{s.name}</b><small>{s.type} · {s.credits} credits · {s.classesPerWeek}/week</small></div>)}</div><div className="totalLine"><b>Total theory + practical</b><span>24 contact hours · 18 credits</span></div></div></div>; }

function formatLongDate(d:Date) { return `${DAY_NAMES[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
function formatShortDate(d:Date) { return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`; }

const styles = `
:root{--penguin-navy:#7a294f;--penguin-blue:#d85b8a;--penguin-ice:#fff0f6;--penguin-sky:#ffd7e6;--penguin-orange:#ee8fb1;--penguin-soft:#fff7fa;--penguin-line:#f0d3df}
:global(*){box-sizing:border-box}:global(body){margin:0;background:#f6f6f8;color:#19191d;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",Inter,system-ui,sans-serif}:global(button),:global(input){font:inherit}.appShell{min-height:100vh;display:flex;background:linear-gradient(135deg,#f7f7f9,#f2f1f5);}.sidebar{position:fixed;inset:0 auto 0 0;width:248px;padding:24px 16px;display:flex;flex-direction:column;background:rgba(255,255,255,.76);backdrop-filter:blur(26px);border-right:1px solid rgba(0,0,0,.06);z-index:5}.brand{display:flex;gap:11px;align-items:center;padding:2px 8px 24px}.brandMark{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:800;color:#fff;background:linear-gradient(145deg,#d85b8a,#7d9bc7);box-shadow:0 7px 20px rgba(49,75,120,.18)}.brand b{display:block;font-size:17px}.brand span{display:block;color:#888;font-size:11px;margin-top:2px}.studentCard{display:flex;align-items:center;gap:10px;padding:12px;margin-bottom:18px;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,.05);box-shadow:0 7px 24px rgba(0,0,0,.035)}.avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#fff0f6;color:var(--penguin-blue);font-weight:800}.studentCard strong{display:block;font-size:13px}.studentCard span,.studentCard small{display:block;color:#888;font-size:10px;margin-top:3px}.nav{width:100%;border:0;background:transparent;padding:11px 12px;border-radius:12px;text-align:left;display:flex;gap:11px;align-items:center;color:#777;font-weight:600;cursor:pointer;margin:2px 0}.nav i{font-style:normal;width:20px;text-align:center;font-size:17px}.nav:hover{background:#f5f4f7;color:#333}.nav.active{background:var(--penguin-ice);color:var(--penguin-blue);box-shadow:0 4px 16px rgba(49,75,120,.07)}.sideBottom{margin-top:auto}.miniStat{padding:14px 15px;border-radius:16px;background:#19191d;color:white;display:flex;justify-content:space-between;align-items:center}.miniStat span{font-size:11px;color:#bbb}.miniStat strong{font-size:20px}.sideHint{padding:12px 4px 0;color:#999;font-size:10px;line-height:1.5}.content{margin-left:248px;width:calc(100% - 248px);min-height:100vh}.topbar{height:92px;padding:20px 42px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(0,0,0,.045);background:rgba(247,247,249,.72);backdrop-filter:blur(18px);position:sticky;top:0;z-index:4}.eyebrow{font-size:9px;letter-spacing:.14em;font-weight:800;color:#9b9ba2}.topbar h1{font-size:24px;letter-spacing:-.03em;margin:4px 0 0}.searchBtn{border:1px solid rgba(0,0,0,.07);background:#fff;border-radius:12px;padding:9px 10px;color:#888;display:flex;align-items:center;gap:8px;cursor:pointer}.searchBtn span{font-size:12px}.searchBtn kbd,.searchRow kbd{font-size:9px;padding:3px 6px;border:1px solid #ddd;border-radius:5px;color:#aaa}.page{padding:30px 42px 55px;max-width:1440px;margin:auto}.heroGrid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.heroCard,.quickCard,.panel,.subjectCard,.syllabusHero{background:rgba(255,255,255,.8);border:1px solid rgba(0,0,0,.055);box-shadow:0 14px 40px rgba(20,20,30,.045);border-radius:22px}.heroCard{padding:28px;display:flex;justify-content:space-between;align-items:center;min-height:200px;background:linear-gradient(135deg,#fff,var(--penguin-soft))}.heroCard h2{font-size:29px;letter-spacing:-.04em;margin:8px 0}.heroCard p{color:#777;font-size:13px;max-width:480px}.ring{width:122px;height:122px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--penguin-blue) var(--p),#f0e9ec 0);position:relative;flex:none}.ring:after{content:"";position:absolute;inset:10px;background:#fff;border-radius:50%}.ring span{position:relative;z-index:1;font-size:22px;font-weight:800}.quickCard{padding:22px}.quickCard>.eyebrow{display:block;margin-bottom:9px}.textBtn{border:0;background:none;color:var(--penguin-blue);font-weight:700;font-size:11px;cursor:pointer;margin-top:7px;padding:0}.sectionHead{display:flex;justify-content:space-between;align-items:end;margin:32px 0 14px}.sectionHead h2{margin:4px 0 0;font-size:20px}.pill,.status,.holidayBadge{font-size:10px;font-weight:800;border-radius:999px;padding:6px 9px}.pill{background:#fff;border:1px solid #e5e4e8;color:#888}.subjectGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.subjectCard{padding:18px}.subjectTop{display:flex;justify-content:space-between;align-items:center}.code{font-size:10px;font-weight:800;letter-spacing:.08em;color:#a0a0a7}.status.good{color:#248c5a;background:#eaf8f1}.status.warn{color:#b96b1c;background:#fff4df}.subjectCard h3{font-size:14px;line-height:1.3;margin:15px 0 18px;min-height:37px}.percentRow{display:flex;align-items:baseline;justify-content:space-between}.percentRow strong{font-size:25px;letter-spacing:-.04em}.percentRow span{font-size:10px;color:#999}.progress{height:6px;background:#eeeef1;border-radius:99px;overflow:hidden;margin:10px 0 13px}.progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--penguin-blue),#6e8fbd)}.cardFoot{display:flex;justify-content:space-between;color:#999;font-size:10px}.cardFoot b{color:#333}.bottomGrid{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;margin-top:14px}.panel{padding:20px}.panelHead{display:flex;justify-content:space-between;align-items:start;margin-bottom:16px}.panelHead h3,.panelHead h2{margin:4px 0 0;font-size:18px}.insight{display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid #eee}.insight .dot{width:8px;height:8px;border-radius:50%;background:var(--penguin-orange)}.insight .dot[data-good="true"]{background:#41ad78}.insight div{flex:1}.insight b,.insight small{display:block}.insight b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.insight small{color:#999;font-size:10px;margin-top:3px}.insight strong{font-size:13px}.miniBars>div{display:grid;grid-template-columns:48px 1fr 40px;gap:9px;align-items:center;margin:13px 0}.miniBars span,.miniBars b{font-size:9px;color:#888}.miniBars b{text-align:right}.miniBars div>div{height:5px;background:#eee;border-radius:9px;overflow:hidden}.miniBars i{display:block;height:100%;background:var(--penguin-blue);border-radius:9px}.classLine{display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid #eee}.classLine:first-of-type{border-top:0}.time{width:50px;font-size:11px;font-weight:800}.time small{display:block;color:#aaa;font-size:8px;margin-top:3px}.classInfo{flex:1;min-width:0}.classInfo b,.classInfo span{display:block}.classInfo b{font-size:11px;line-height:1.3}.classInfo span{font-size:9px;color:#999;margin-top:3px}.markBtns{display:flex;gap:5px}.markBtns button{width:28px;height:28px;border-radius:9px;border:1px solid #e5e4e7;background:#fff;color:#aaa;font-weight:800;font-size:10px;cursor:pointer}.markBtns .marked.present{background:#eaf8f1;color:#24905e;border-color:#cbeedc}.markBtns .marked.absent{background:#fff0f1;color:#c9485e;border-color:#f2ccd3}.calendarLayout{display:grid;grid-template-columns:1.45fr .8fr;gap:16px}.calendarPanel{padding:22px}.calendarHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.calendarHead h2{font-size:18px;margin:0}.calendarHead button{width:34px;height:34px;border:0;border-radius:10px;background:#f3f2f5;cursor:pointer;font-size:22px}.weekdays,.calendarGrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.weekdays span{text-align:center;font-size:9px;color:#aaa;font-weight:800;padding-bottom:8px}.day{height:68px;border:1px solid transparent;background:#fff;border-radius:12px;cursor:pointer;position:relative;text-align:left;padding:10px;color:#444}.day:hover{border-color:#eee}.day.muted{opacity:.35}.day.selected{background:var(--penguin-ice);border-color:#bdd7f3;color:var(--penguin-blue)}.day.holiday{background:#fff8ed}.day i,.day em{position:absolute;bottom:9px;left:11px;width:5px;height:5px;border-radius:50%;background:var(--penguin-orange)}.day em{left:20px;background:var(--penguin-blue)}.legend{display:flex;gap:15px;margin-top:15px;color:#999;font-size:9px}.legend span{display:flex;gap:5px;align-items:center}.legendDot{width:6px;height:6px;border-radius:50%;display:inline-block}.holidayDot{background:var(--penguin-orange)}.classDot{background:var(--penguin-blue)}.selectedDot{background:var(--penguin-blue)}.dayPanel h2{font-size:20px;margin:6px 0 20px}.holidayBox{display:flex;gap:10px;align-items:flex-start;padding:13px;border-radius:14px;background:#fff7ec;color:#a06a25}.holidayBox b,.holidayBox span{display:block}.holidayBox b{font-size:11px}.holidayBox span{font-size:9px;margin-top:3px;color:#a8875c}.dayNote{font-size:10px;color:#999;margin-top:16px}.dayNote b{color:#444}.weekStrip{display:flex;gap:8px;overflow:auto;padding-bottom:18px}.weekDay{min-width:85px;padding:12px;border:1px solid #e7e6ea;border-radius:15px;background:#fff;cursor:pointer;text-align:left}.weekDay small,.weekDay b,.weekDay span{display:block}.weekDay small{font-size:9px;color:#aaa}.weekDay b{font-size:22px;margin:3px 0}.weekDay span{font-size:9px;color:#999}.weekDay.active{background:var(--penguin-ice);border-color:#bdd7f3;color:var(--penguin-blue)}.schedule{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.scheduleDay{background:#fff;border:1px solid #e9e8eb;border-radius:19px;padding:16px}.scheduleTitle{display:flex;justify-content:space-between;margin-bottom:5px}.scheduleTitle b,.scheduleTitle span{display:block}.scheduleTitle b{font-size:14px}.scheduleTitle span{font-size:9px;color:#999;margin-top:2px}.holidayBadge{background:#fff7ec;color:#a76c1d}.syllabusTabs{display:flex;gap:7px;overflow:auto;padding-bottom:16px}.syllabusTabs button{border:1px solid #e5e4e8;background:#fff;border-radius:10px;padding:8px 10px;font-size:10px;font-weight:800;color:#999;cursor:pointer}.syllabusTabs button.active{background:var(--penguin-ice);color:var(--penguin-blue);border-color:#f0cbd7}.syllabusHero{padding:26px;display:flex;justify-content:space-between;gap:30px;background:linear-gradient(135deg,#fff,var(--penguin-soft))}.syllabusHero h2{font-size:27px;letter-spacing:-.04em;margin:7px 0}.syllabusHero p{max-width:700px;color:#777;font-size:12px;line-height:1.6}.courseMeta{min-width:130px;display:grid;grid-template-columns:1fr 1fr;align-content:center;gap:4px 10px}.courseMeta b{font-size:22px}.courseMeta span{font-size:9px;color:#999}.moduleGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}.module{padding:20px;border:1px solid #e7e6ea;background:#fff;border-radius:17px}.module>span{font-size:9px;font-weight:800;color:var(--penguin-blue);letter-spacing:.12em}.module h3{font-size:13px;line-height:1.45;margin:10px 0 16px}.moduleLine{height:2px;background:linear-gradient(90deg,var(--penguin-blue),#eee);width:42px}.sourceNote{font-size:9px;color:#aaa;margin-top:18px}.settingsPage{max-width:920px}.settingPanel{margin-bottom:14px}.settingPanel label{font-size:10px;color:#888;font-weight:700;display:block}.settingPanel input:not([type="range"]){width:100%;margin-top:7px;border:1px solid #e4e3e7;background:#fafafc;border-radius:11px;padding:11px;outline:0}.settingPanel input:focus{border-color:#a9c7e7}.fixedRow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.fixedRow div{background:var(--penguin-soft);padding:12px;border-radius:12px}.fixedRow span,.fixedRow b{display:block}.fixedRow span{font-size:8px;color:#aaa}.fixedRow b{font-size:11px;margin-top:4px}.primary{border:0;background:var(--penguin-navy);color:#fff;padding:10px 15px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer}.rangeRow{display:flex;gap:15px;align-items:center}.rangeRow input{flex:1}.rangeRow strong{font-size:20px}.mutedText{font-size:10px;color:#999;line-height:1.5}.actionGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.actionGrid button{padding:11px;border:1px solid #e3e2e6;background:#fff;border-radius:11px;font-size:10px;font-weight:800;cursor:pointer}.actionGrid .danger{color:#c7475f;background:#fff5f6}.curriculumList{display:grid;gap:7px}.curriculumList>div{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px;border-radius:11px;background:#f8f7f9}.curriculumList span{font-size:9px;font-weight:800;color:var(--penguin-blue)}.curriculumList b{font-size:10px}.curriculumList small{font-size:8px;color:#999}.totalLine{display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid #eee;font-size:10px}.totalLine span{color:#999}.overlay{position:fixed;inset:0;background:rgba(20,20,25,.18);backdrop-filter:blur(10px);z-index:20;display:grid;place-items:start center;padding-top:110px}.searchModal{width:min(600px,calc(100% - 30px));background:rgba(255,255,255,.96);border:1px solid #eee;border-radius:18px;box-shadow:0 25px 80px rgba(0,0,0,.18);overflow:hidden}.searchRow{display:flex;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid #eee}.searchRow input{flex:1;border:0;outline:0;font-size:14px;background:transparent}.searchResults{max-height:420px;overflow:auto;padding:7px}.searchResults button{width:100%;border:0;background:transparent;text-align:left;padding:11px;border-radius:10px;cursor:pointer}.searchResults button:hover{background:var(--penguin-soft)}.searchResults span,.searchResults b{display:block}.searchResults span{font-size:9px;color:var(--penguin-blue);font-weight:800}.searchResults b{font-size:11px;margin-top:3px}.empty{padding:20px;color:#aaa;text-align:center;font-size:10px}.toast{position:fixed;right:24px;bottom:24px;background:#1d1d21;color:#fff;padding:11px 15px;border-radius:12px;font-size:11px;box-shadow:0 15px 40px rgba(0,0,0,.18);z-index:30}.loading{min-height:100vh;display:grid;place-items:center;color:#888;font-size:12px;gap:10px}.loaderDot{width:9px;height:9px;border-radius:50%;background:var(--penguin-blue);box-shadow:0 0 0 7px var(--penguin-ice)}.penguinLogo{flex:0 0 auto;display:grid;place-items:center}.penguinLogo svg{display:block;filter:drop-shadow(0 5px 10px rgba(23,35,61,.12))}.todayClasses{background:linear-gradient(145deg,#fff,var(--penguin-soft));border-color:#dce8f5}.todayHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.todayHead h3{font-size:15px;margin:4px 0 0;color:var(--penguin-navy)}.penguinBadge{display:grid;place-items:center}.todayEmpty{padding:20px 8px;color:#7d8ca3;text-align:center}.todayEmpty b,.todayEmpty span{display:block}.todayEmpty b{font-size:12px;color:var(--penguin-navy)}.todayEmpty span{font-size:9px;margin-top:4px}.quickCard .markBtns button{width:34px;height:30px;border-radius:10px}.quickCard .markBtns{margin-left:auto}.quickCard .classLine{padding:11px 0}.brand{display:flex;align-items:center;gap:10px}.brandMark{background:var(--penguin-navy)!important}.eyebrow{color:var(--penguin-blue)!important}.status.good{color:#287b61}.status.warn{color:#b97927}.pill{background:var(--penguin-ice)!important;color:var(--penguin-blue)!important;border-color:#cfe1f4!important}.primary{background:var(--penguin-navy)!important}.loading{display:flex;flex-direction:column;align-items:center;justify-content:center}.
.timetableToolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px}.timetableToolbar h2{margin:4px 0 0;font-size:20px}.editActions{display:flex;gap:8px}.softBtn{border:1px solid #f0c8d8;background:#fff4f8;color:#b33f69;padding:10px 14px;border-radius:11px;font-size:10px;font-weight:800;cursor:pointer}.timetableEditor{padding:18px}.editorRow{display:grid;grid-template-columns:120px 110px 110px minmax(220px,1fr) 38px;gap:8px;align-items:center;margin:8px 0}.editorRow input,.editorRow select{min-width:0;border:1px solid #f0d3df;background:#fffafd;border-radius:10px;padding:10px;font-size:11px;outline:0}.editorRow input:focus,.editorRow select:focus{border-color:#d85b8a;box-shadow:0 0 0 3px #fff0f6}.dangerIcon{width:36px;height:36px;border:1px solid #f2ccd8;background:#fff2f5;color:#c43f68;border-radius:10px;font-weight:900;cursor:pointer}.addGrid{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.quickCard .markBtns button{font-size:11px}.quickCard .markBtns button:first-child{background:#fff0f6;color:#b33f69;border-color:#f1bfd2}.quickCard .markBtns .marked.present{background:#d85b8a;color:#fff;border-color:#d85b8a}.quickCard .markBtns .marked.absent{background:#7a294f;color:#fff;border-color:#7a294f}.todayClasses{background:linear-gradient(145deg,#fff,#fff0f6)!important;border-color:#f0c8d8!important}.heroCard{background:linear-gradient(135deg,#fff,#fff0f6)!important}.progress i{background:linear-gradient(90deg,#ee8fb1,#d85b8a)!important}.ring{background:conic-gradient(#d85b8a var(--p),#f9dce7 0)!important}.day.selected,.weekDay.active{background:#fff0f6!important;border-color:#f0bfd2!important;color:#b33f69!important}.nav.active{background:#fff0f6!important;color:#b33f69!important}.moduleLine{background:linear-gradient(90deg,#d85b8a,#f6dbe5)!important}.primary{background:#7a294f!important}.eyebrow{color:#d85b8a!important}.pill{background:#fff0f6!important;color:#b33f69!important;border-color:#f0c8d8!important}
@media(max-width:1050px){.subjectGrid{grid-template-columns:repeat(2,1fr)}.heroGrid,.calendarLayout,.bottomGrid{grid-template-columns:1fr}.schedule{grid-template-columns:1fr}.sidebar{width:210px}.content{margin-left:210px;width:calc(100% - 210px)}}
@media(max-width:760px){.timetableToolbar{align-items:flex-start;flex-direction:column}.editorRow{grid-template-columns:1fr 1fr}.editorRow select:nth-of-type(2){grid-column:1/-1}.editorRow .dangerIcon{grid-column:2;justify-self:end}.appShell{display:block}.sidebar{position:fixed;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:65px;padding:7px;flex-direction:row;align-items:center;border-radius:20px;border:1px solid rgba(0,0,0,.07);box-shadow:0 10px 35px rgba(0,0,0,.12)}.brand,.studentCard,.sideBottom{display:none}.sidebar nav{display:flex;width:100%;justify-content:space-around}.nav{width:auto;display:block;text-align:center;padding:7px;font-size:8px;margin:0}.nav i{display:block;width:auto;font-size:17px;margin-bottom:2px}.content{margin-left:0;width:100%;padding-bottom:85px}.topbar{height:76px;padding:14px 18px}.topbar h1{font-size:20px}.searchBtn span,.searchBtn kbd{display:none}.page{padding:20px 15px 30px}.subjectGrid{grid-template-columns:1fr}.heroCard{padding:20px;min-height:175px}.heroCard h2{font-size:23px}.ring{width:90px;height:90px}.syllabusHero{display:block}.moduleGrid{grid-template-columns:1fr}.actionGrid{grid-template-columns:1fr}.fixedRow{grid-template-columns:1fr}.curriculumList>div{grid-template-columns:1fr}.curriculumList small{grid-column:1}.calendarGrid{gap:3px}.day{height:54px;padding:8px}.day i,.day em{bottom:7px}.weekDay{min-width:68px}.schedule{grid-template-columns:1fr}}

.syllabusPage{max-width:1180px}.studyFlow,.detailModule,.outcomePanel{background:rgba(255,255,255,.84);border:1px solid var(--penguin-line);border-radius:24px}.studyFlow{padding:22px;margin:18px 0}.flowHead h3{margin:4px 0 0}.flowTrack{display:flex;align-items:stretch;gap:8px;overflow-x:auto;padding:18px 2px 4px}.flowNode{min-width:135px;flex:1;padding:14px;border:1px solid #f0d3df;background:#fff7fa;border-radius:16px;display:flex;flex-direction:column;gap:8px}.flowNode span{font-size:11px;color:#d85b8a;font-weight:800}.flowNode b{font-size:13px;line-height:1.25}.flowArrow{align-self:center;color:#d85b8a;font-size:22px;font-weight:800}.syllabusDetailGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.detailModule{padding:22px}.moduleBadge{display:flex;justify-content:space-between;color:#b83e6e;font-size:11px;font-weight:900;letter-spacing:.08em}.moduleBadge small{font-size:11px;color:#a07a89}.detailModule h3{margin:8px 0 16px;font-size:19px}.topicList{display:grid;gap:9px}.topicList>div{display:flex;gap:10px;align-items:flex-start}.topicList span{width:21px;height:21px;display:grid;place-items:center;border-radius:50%;background:#ffe0eb;color:#c64c7d;font-weight:900;font-size:12px;flex:none}.topicList p{margin:0;font-size:13px;line-height:1.45;color:#555}.outcomePanel{padding:24px;margin-top:16px}.outcomePanel h3{margin:5px 0 18px}.outcomeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.outcomeGrid>div{display:flex;gap:12px;padding:13px;border-radius:15px;background:#fff7fa;border:1px solid #f3dbe5}.outcomeGrid b{color:#c44d7b;font-size:12px}.outcomeGrid span{font-size:13px;line-height:1.4}@media(max-width:800px){.syllabusDetailGrid,.outcomeGrid{grid-template-columns:1fr}.flowNode{min-width:125px}}
`;
