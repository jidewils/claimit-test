// ClaimIt Constants and Data
// lib/claimit-data.js

export const PROVINCES = {
  ON: { name: 'Ontario', emoji: '🍁', hasRentCredit: true },
  BC: { name: 'British Columbia', emoji: '🏔️', hasRentCredit: true },
  AB: { name: 'Alberta', emoji: '🏔️', hasRentCredit: false },
  SK: { name: 'Saskatchewan', emoji: '🌾', hasRentCredit: false },
  MB: { name: 'Manitoba', emoji: '🌾', hasRentCredit: true },
  QC: { name: 'Quebec', emoji: '⚜️', hasRentCredit: true, separateReturn: true },
  NB: { name: 'New Brunswick', emoji: '🦞', hasRentCredit: false },
  NS: { name: 'Nova Scotia', emoji: '🌊', hasRentCredit: false },
  PE: { name: 'P.E.I.', emoji: '🥔', hasRentCredit: false },
  NL: { name: 'Newfoundland', emoji: '🐋', hasRentCredit: false },
  YT: { name: 'Yukon', emoji: '🐻', hasRentCredit: false },
  NT: { name: 'N.W.T.', emoji: '❄️', hasRentCredit: false },
  NU: { name: 'Nunavut', emoji: '🌌', hasRentCredit: false },
};

export const CLIMATE_ACTION = {
  ON: { single: 140, spouse: 140, child: 70 },
  AB: { single: 772, spouse: 772, child: 386 },
  SK: { single: 680, spouse: 680, child: 340 },
  MB: { single: 528, spouse: 528, child: 264 },
  NB: { single: 380, spouse: 380, child: 190 },
  NS: { single: 380, spouse: 380, child: 190 },
  PE: { single: 360, spouse: 360, child: 180 },
  NL: { single: 328, spouse: 328, child: 164 },
};

export const TAX_YEARS = [2025, 2024, 2023, 2022];

export const INCOME_SOURCES = [
  { id: 't4', emoji: '👔', label: 'Employment (T4)', sub: 'Regular job, salary' },
  { id: 't4a', emoji: '📄', label: 'Other Income (T4A)', sub: 'Pension, scholarships, gig work' },
  { id: 't4e', emoji: '🍼', label: 'EI Benefits (T4E)', sub: 'Parental leave, job loss' },
  { id: 't5', emoji: '🏦', label: 'Investment Income (T5)', sub: 'Bank interest, dividends' },
  { id: 't3', emoji: '📈', label: 'Trust/Fund Income (T3)', sub: 'Mutual funds, ETFs' },
  { id: 't5008', emoji: '📊', label: 'Sold Investments (T5008)', sub: 'Stocks, crypto, capital gains' },
  { id: 'self', emoji: '💼', label: 'Self-Employed', sub: 'Freelance, business owner' },
  { id: 'rental', emoji: '🏠', label: 'Rental Income', sub: 'Landlord income' },
  { id: 'none', emoji: '😬', label: 'No income this year', sub: 'Still file for benefits!' },
];

export const LIFE_SITUATIONS = [
  { id: 'paidRent', emoji: '🏢', label: 'Paid rent', category: 'housing' },
  { id: 'ownHome', emoji: '🏡', label: 'Own my home (paid property tax)', category: 'housing' },
  { id: 'firstHome', emoji: '🎉', label: 'Bought my FIRST home!', category: 'housing' },
  { id: 'wfh', emoji: '💻', label: 'Worked from home', category: 'housing' },
  { id: 'moved', emoji: '📦', label: 'Moved 40+ km for work/school', category: 'housing' },
  { id: 'medical', emoji: '🏥', label: 'Had medical expenses', category: 'health' },
  { id: 'disability', emoji: '💙', label: 'Have a disability (T2201)', category: 'health' },
  { id: 'caregiver', emoji: '🤝', label: 'Care for disabled family member', category: 'health' },
  { id: 'tuition', emoji: '🎓', label: 'Paid tuition', category: 'education' },
  { id: 'studentLoan', emoji: '📚', label: 'Paid student loan interest', category: 'education' },
  { id: 'childcare', emoji: '👶', label: 'Paid for childcare', category: 'family' },
  { id: 'charity', emoji: '💝', label: 'Donated to charity', category: 'giving' },
  { id: 'political', emoji: '🗳️', label: 'Donated to political party', category: 'giving' },
  { id: 'digitalNews', emoji: '📰', label: 'Subscribed to Canadian news', category: 'other' },
  { id: 'volunteer', emoji: '🚒', label: 'Volunteer firefighter/SAR', category: 'other' },
  { id: 'teacher', emoji: '📖', label: 'Teacher who bought supplies', category: 'other' },
  { id: 'northern', emoji: '🌨️', label: 'Live in a northern zone', category: 'other' },
];

export const createEmptyT4 = (id = 1) => ({
  id,
  employer: '',
  box14_income: '',
  box22_taxDeducted: '',
  box16_cpp: '',
  box18_ei: '',
  box20_rpp: '',
  box44_unionDues: '',
});

export const createEmptyT5 = (id = 1) => ({
  id,
  institution: '',
  box13_interest: '',
  box10_dividendsActual: '',
  box11_dividendsTaxable: '',
  box18_capitalGains: '',
});

export const getTimeEstimate = (mode, currentStep, totalSteps) => {
  const stepsRemaining = totalSteps - currentStep;
  
  if (mode === 'quick') {
    const seconds = stepsRemaining * 15;
    if (seconds <= 15) return 'Almost done!';
    if (seconds < 60) return `~${seconds} sec`;
    return `~${Math.ceil(seconds / 60)} min`;
  } else {
    const seconds = stepsRemaining * 25;
    if (seconds <= 20) return 'Almost done!';
    if (seconds < 60) return `~${seconds} sec`;
    return `~${Math.ceil(seconds / 60)} min`;
  }
};
