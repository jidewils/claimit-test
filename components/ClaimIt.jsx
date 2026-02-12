'use client';

import { useState, useMemo } from 'react';
import {
  PROVINCES, CLIMATE_ACTION, TAX_YEARS, INCOME_SOURCES, LIFE_SITUATIONS,
  createEmptyT4, createEmptyT5, getTimeEstimate
} from '../lib/claimit-data';
import {
  ProgressBar, RunningEstimate, InputField, CheckboxCard, RadioCard,
  NavButtons, ProvinceGrid, T4Card, T5Card, AddSlipButton, PageWrapper, ResultsCard
} from './claimit-ui';

export default function ClaimIt() {
  // ==================== STATE ====================
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [taxYear, setTaxYear] = useState(2025);
  
  // Profile
  const [province, setProvince] = useState(null);
  const [ageRange, setAgeRange] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState(null);
  const [spouseIncomeBracket, setSpouseIncomeBracket] = useState(null);
  const [spouseIncome, setSpouseIncome] = useState('');
  
  // Dependants
  const [hasKids, setHasKids] = useState(null);
  const [kidsUnder6, setKidsUnder6] = useState(0);
  const [kids6to17, setKids6to17] = useState(0);
  const [hasDisabledDependant, setHasDisabledDependant] = useState(false);
  const [hasElderlyDependant, setHasElderlyDependant] = useState(false);
  
  // Residency
  const [isNewcomer, setIsNewcomer] = useState(null);
  const [arrivalDate, setArrivalDate] = useState('');
  
  // Income
  const [incomeSources, setIncomeSources] = useState([]);
  const [t4Slips, setT4Slips] = useState([createEmptyT4(1)]);
  const [t5Slips, setT5Slips] = useState([createEmptyT5(1)]);
  const [selfEmployment, setSelfEmployment] = useState({ grossRevenue: '', expenses: '' });
  const [rentalIncome, setRentalIncome] = useState({ grossRent: '', expenses: '' });
  
  // Quick mode
  const [quickIncome, setQuickIncome] = useState('');
  const [quickTaxPaid, setQuickTaxPaid] = useState('');
  
  // Deductions
  const [rrspContribution, setRrspContribution] = useState('');
  const [childcareExpenses, setChildcareExpenses] = useState('');
  
  // Life situations
  const [lifeChecks, setLifeChecks] = useState([]);
  const [rentAmount, setRentAmount] = useState('');
  const [wfhDays, setWfhDays] = useState('');
  const [medicalExpenses, setMedicalExpenses] = useState('');
  const [charitableDonations, setCharitableDonations] = useState('');
  const [tuitionAmount, setTuitionAmount] = useState('');
  const [studentLoanInterest, setStudentLoanInterest] = useState('');

  // ==================== COMPUTED ====================
  const hasSpouse = maritalStatus === 'married' || maritalStatus === 'common-law';
  const isSenior = ageRange === '65+';
  
  const totalSteps = useMemo(() => {
    if (mode === 'quick') return 8;
    let steps = 7; // Base steps
    if (incomeSources.includes('t4')) steps++;
    if (incomeSources.includes('t5') || incomeSources.includes('t3')) steps++;
    if (incomeSources.includes('self')) steps++;
    return steps + 3; // deductions, life situations, results
  }, [mode, incomeSources]);
  
  const progress = step > 0 ? Math.min(100, Math.round((step / totalSteps) * 100)) : 0;
  const timeLeft = getTimeEstimate(mode, step, totalSteps);

  // ==================== CALCULATIONS ====================
  const getTotalIncome = () => {
    if (mode === 'quick') return parseFloat(quickIncome) || 0;
    let total = 0;
    t4Slips.forEach(s => total += parseFloat(s.box14_income) || 0);
    t5Slips.forEach(s => {
      total += parseFloat(s.box13_interest) || 0;
      total += parseFloat(s.box11_dividendsTaxable) || 0;
      total += (parseFloat(s.box18_capitalGains) || 0) * 0.5;
    });
    const selfNet = (parseFloat(selfEmployment.grossRevenue) || 0) - (parseFloat(selfEmployment.expenses) || 0);
    if (selfNet > 0) total += selfNet;
    const rentalNet = (parseFloat(rentalIncome.grossRent) || 0) - (parseFloat(rentalIncome.expenses) || 0);
    if (rentalNet > 0) total += rentalNet;
    return total;
  };
  
  const getTaxPaid = () => {
    if (mode === 'quick') return parseFloat(quickTaxPaid) || 0;
    let total = 0;
    t4Slips.forEach(s => total += parseFloat(s.box22_taxDeducted) || 0);
    return total;
  };

  const estimatedRefund = useMemo(() => {
    const income = getTotalIncome();
    const taxPaid = getTaxPaid();
    if (income === 0 && taxPaid === 0) return 0;
    
    // Simplified tax calculation
    let tax = 0;
    if (income <= 55867) tax = income * 0.15;
    else if (income <= 111733) tax = 55867 * 0.15 + (income - 55867) * 0.205;
    else tax = 55867 * 0.15 + (111733 - 55867) * 0.205 + (income - 111733) * 0.26;
    
    // Provincial tax (~10-15%)
    tax += income * 0.12;
    
    // Basic personal amount
    tax -= 16129 * 0.15;
    
    // Canada employment amount
    if (incomeSources.includes('t4') || mode === 'quick') tax -= 1433 * 0.15;
    
    // Spousal amount
    if (hasSpouse && spouseIncomeBracket === 'low') {
      const spousal = Math.max(0, 16129 - (parseFloat(spouseIncome) || 0));
      tax -= spousal * 0.15;
    }
    
    // Age amount
    if (isSenior && income < 98309) tax -= 8790 * 0.15;
    
    // RRSP
    const rrsp = parseFloat(rrspContribution) || 0;
    if (rrsp > 0) tax -= rrsp * 0.25;
    
    // Childcare
    const childcare = parseFloat(childcareExpenses) || 0;
    if (childcare > 0) {
      const max = (kidsUnder6 * 8000) + (kids6to17 * 5000);
      tax -= Math.min(childcare, max) * 0.15;
    }
    
    // Medical
    const medical = parseFloat(medicalExpenses) || 0;
    if (medical > income * 0.03) tax -= (medical - income * 0.03) * 0.15;
    
    // Donations
    const donations = parseFloat(charitableDonations) || 0;
    if (donations > 0) {
      tax -= Math.min(donations, 200) * 0.15 + Math.max(0, donations - 200) * 0.29;
    }
    
    // Tuition
    const tuition = parseFloat(tuitionAmount) || 0;
    if (tuition > 0) tax -= tuition * 0.15;
    
    // WFH
    const wfh = parseInt(wfhDays) || 0;
    if (wfh > 0) tax -= Math.min(wfh * 2, 500) * 0.15;
    
    // First home
    if (lifeChecks.includes('firstHome')) tax -= 10000 * 0.15;
    
    tax = Math.max(0, tax);
    let refund = taxPaid - tax;
    
    // Climate Action
    const climate = CLIMATE_ACTION[province];
    if (climate) {
      refund += climate.single;
      if (hasSpouse) refund += climate.spouse;
      refund += (kidsUnder6 + kids6to17) * climate.child;
    }
    
    // GST Credit (simplified)
    if (income < 50000) {
      refund += hasSpouse ? 680 : 340;
      refund += (kidsUnder6 + kids6to17) * 179;
    }
    
    // Ontario Trillium
    if (province === 'ON' && lifeChecks.includes('paidRent')) {
      refund += Math.min((parseFloat(rentAmount) || 0) * 0.05 + 243, 1248);
    }
    
    return Math.round(refund);
  }, [mode, quickIncome, quickTaxPaid, t4Slips, t5Slips, selfEmployment, rentalIncome,
      province, hasSpouse, spouseIncomeBracket, spouseIncome, isSenior, rrspContribution,
      childcareExpenses, kidsUnder6, kids6to17, medicalExpenses, charitableDonations,
      tuitionAmount, wfhDays, lifeChecks, rentAmount, incomeSources]);

  // ==================== HANDLERS ====================
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));
  
  const toggleIncomeSource = (id) => {
    setIncomeSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  
  const toggleLifeCheck = (id) => {
    setLifeChecks(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  
  const addT4 = () => {
    const newId = Math.max(...t4Slips.map(s => s.id)) + 1;
    setT4Slips([...t4Slips, createEmptyT4(newId)]);
  };
  
  const removeT4 = (id) => {
    if (t4Slips.length > 1) setT4Slips(t4Slips.filter(s => s.id !== id));
  };
  
  const updateT4 = (id, field, value) => {
    setT4Slips(t4Slips.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const addT5 = () => {
    const newId = Math.max(...t5Slips.map(s => s.id)) + 1;
    setT5Slips([...t5Slips, createEmptyT5(newId)]);
  };
  
  const removeT5 = (id) => {
    if (t5Slips.length > 1) setT5Slips(t5Slips.filter(s => s.id !== id));
  };
  
  const updateT5 = (id, field, value) => {
    setT5Slips(t5Slips.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // ==================== SCREENS ====================
  
  // SCREEN 0: Welcome
  if (step === 0) {
    return (
      <PageWrapper>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">✨ ClaimIt</h1>
          <p className="text-gray-400 text-lg">Find tax credits you didn't know existed.</p>
          <div className="text-3xl mt-4">🍁 🦫 🏒 ☕</div>
        </div>
        
        <div className="mb-8 text-center">
          <label className="text-gray-400 text-sm mb-2 block">Filing for tax year:</label>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-lg focus:border-emerald-500 focus:outline-none"
          >
            {TAX_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <p className="text-gray-600 text-xs mt-2">Most people file for {TAX_YEARS[0]} (last year)</p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => { setMode('quick'); nextStep(); }}
            className="bg-gray-900 border-2 border-gray-700 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all"
          >
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-xl font-bold text-white mb-1">QUICK</h3>
            <p className="text-emerald-400 text-sm font-medium mb-2">~2 minutes</p>
            <p className="text-gray-500 text-sm">Perfect if you just have a regular job (T4).</p>
          </button>
          
          <button
            onClick={() => { setMode('detailed'); nextStep(); }}
            className="bg-gray-900 border-2 border-gray-700 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-xl font-bold text-white mb-1">DETAILED</h3>
            <p className="text-emerald-400 text-sm font-medium mb-2">~5-10 minutes</p>
            <p className="text-gray-500 text-sm">Investments, self-employment, maximize credits.</p>
          </button>
        </div>
        
        <p className="text-center text-gray-600 text-sm">💡 Start with Quick – add details anytime.</p>
        <div className="text-center mt-8 text-gray-600 text-xs">🔒 Your data stays on your device.</div>
      </PageWrapper>
    );
  }

  // SCREEN 1: Province
  if (step === 1) {
    return (
      <PageWrapper>
        <ProgressBar progress={progress} timeLeft={timeLeft} />
        <h2 className="text-2xl font-bold mb-2">🍁 Where do you call home?</h2>
        <p className="text-gray-400 mb-6">Your province on December 31, {taxYear}</p>
        <ProvinceGrid provinces={PROVINCES} selected={province} onSelect={setProvince} />
        {province === 'QC' && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-4">
            <p className="text-blue-300 text-sm">⚜️ Quebec files a separate provincial return with Revenu Québec.</p>
          </div>
        )}
        <NavButtons onBack={prevStep} onNext={nextStep} canContinue={!!province} />
        <RunningEstimate amount={estimatedRefund} />
      </PageWrapper>
    );
  }

  // SCREEN 2: About You
  if (step === 2) {
    return (
      <PageWrapper>
        <ProgressBar progress={progress} timeLeft={timeLeft} />
        <h2 className="text-2xl font-bold mb-2">👋 A bit about you</h2>
        <p className="text-gray-400 mb-6">As of December 31, {taxYear}</p>
        
        <div className="mb-6">
          <label className="text-gray-300 font-medium mb-3 block">Age range</label>
          <div className="space-y-2">
            {[
              { value: 'under25', label: 'Under 25', emoji: '🧑' },
              { value: '25-64', label: '25 to 64', emoji: '🧑‍💼' },
              { value: '65+', label: '65 or older', emoji: '👴', sub: 'Unlocks Age Amount!' },
            ].map(opt => (
              <RadioCard key={opt.value} selected={ageRange === opt.value} onClick={() => setAgeRange(opt.value)} {...opt} />
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="text-gray-300 font-medium mb-3 block">Relationship status</label>
          <div className="space-y-2">
            {[
              { value: 'single', emoji: '🙋', label: 'Single' },
              { value: 'married', emoji: '💍', label: 'Married' },
              { value: 'common-law', emoji: '🏠', label: 'Common-law', sub: 'Living together 12+ months' },
              { value: 'separated', emoji: '💔', label: 'Separated / Divorced / Widowed' },
            ].map(opt => (
              <RadioCard key={opt.value} selected={maritalStatus === opt.value} onClick={() => setMaritalStatus(opt.value)} {...opt} />
            ))}
          </div>
        </div>
        
        {hasSpouse && (
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <label className="text-gray-300 font-medium mb-3 block">💑 Spouse's income in {taxYear}?</label>
            <div className="space-y-2">
              <RadioCard selected={spouseIncomeBracket === 'none'} onClick={() => setSpouseIncomeBracket('none')} emoji="📭" label="No income" sub="Full Spousal Amount!" />
              <RadioCard selected={spouseIncomeBracket === 'low'} onClick={() => setSpouseIncomeBracket('low')} emoji="📉" label="Under $17,000" sub="Partial Spousal Amount" />
              <RadioCard selected={spouseIncomeBracket === 'high'} onClick={() => setSpouseIncomeBracket('high')} emoji="📈" label="$17,000 or more" />
            </div>
            {spouseIncomeBracket === 'low' && (
              <div className="mt-4">
                <InputField label="Approximately how much?" value={spouseIncome} onChange={setSpouseIncome} placeholder="12000" />
              </div>
            )}
          </div>
        )}
        
        <NavButtons onBack={prevStep} onNext={nextStep} canContinue={!!ageRange && !!maritalStatus && (!hasSpouse || !!spouseIncomeBracket)} />
        <RunningEstimate amount={estimatedRefund} />
      </PageWrapper>
    );
  }

  // SCREEN 3: Dependants
  if (step === 3) {
    return (
      <PageWrapper>
        <ProgressBar progress={progress} timeLeft={timeLeft} />
        <h2 className="text-2xl font-bold mb-2">👨‍👩‍👧‍👦 Any dependants?</h2>
        <p className="text-gray-400 mb-6">People who rely on you financially</p>
        
        <div className="mb-6">
          <label className="text-gray-300 font-medium mb-3 block">Children under 18?</label>
          <div className="grid grid-cols-2 gap-3">
            <RadioCard selected={hasKids === false} onClick={() => { setHasKids(false); setKidsUnder6(0); setKids6to17(0); }} emoji="🚫" label="No kids" />
            <RadioCard selected={hasKids === true} onClick={() => setHasKids(true)} emoji="👶" label="Yes!" />
          </div>
        </div>
        
        {hasKids && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Under 6 👶</label>
                <select value={kidsUnder6} onChange={(e) => setKidsUnder6(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                  {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <p className="text-emerald-400 text-xs mt-1">Higher childcare limits!</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Ages 6-17 🧒</label>
                <select value={kids6to17} onChange={(e) => setKids6to17(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                  {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <CheckboxCard checked={hasElderlyDependant} onClick={() => setHasElderlyDependant(!hasElderlyDependant)} emoji="👴" label="I support an elderly parent" sub="May qualify for Caregiver Amount" />
          <CheckboxCard checked={hasDisabledDependant} onClick={() => setHasDisabledDependant(!hasDisabledDependant)} emoji="💙" label="I care for family member with disability" sub="May qualify for Caregiver Amount" />
        </div>
        
        <NavButtons onBack={prevStep} onNext={nextStep} canContinue={hasKids !== null} />
        <RunningEstimate amount={estimatedRefund} />
      </PageWrapper>
    );
  }

  // SCREEN 4: Newcomer
  if (step === 4) {
    return (
      <PageWrapper>
        <ProgressBar progress={progress} timeLeft={timeLeft} />
        <h2 className="text-2xl font-bold mb-2">🍁 New to Canada?</h2>
        <p className="text-gray-400 mb-6">Did you move to Canada in {taxYear}?</p>
        
        <div className="space-y-3 mb-6">
          <RadioCard selected={isNewcomer === false} onClick={() => setIsNewcomer(false)} emoji="🏠" label="Nope, been here!" sub="Resident for the full year" />
          <RadioCard selected={isNewcomer === true} onClick={() => setIsNewcomer(true)} emoji="✈️" label={`Yes, moved to Canada in ${taxYear}`} sub="Welcome! 🎉" />
        </div>
        
        {isNewcomer && (
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <label className="text-gray-400 text-sm mb-2 block">When did you arrive?</label>
            <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} max={`${taxYear}-12-31`} min={`${taxYear}-01-01`} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none" />
            <p className="text-emerald-400 text-sm mt-2">💡 You only pay tax on income earned AFTER you arrived!</p>
          </div>
        )}
        
        <NavButtons onBack={prevStep} onNext={nextStep} canContinue={isNewcomer !== null} />
        <RunningEstimate amount={estimatedRefund} />
      </PageWrapper>
    );
  }

  // ==================== QUICK MODE SCREENS ====================
  
  if (mode === 'quick') {
    // Quick: Income
    if (step === 5) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">💰 Your Income</h2>
          <p className="text-gray-400 mb-6">Just the basics!</p>
          
          <InputField label="Total income before taxes" value={quickIncome} onChange={setQuickIncome} placeholder="65000" helper={`Your gross salary in ${taxYear}`} />
          <InputField label="Total tax already deducted" value={quickTaxPaid} onChange={setQuickTaxPaid} placeholder="15000" helper="From paystubs or T4 Box 22" />
          
          <div className="bg-gray-900 rounded-xl p-4 mt-4">
            <p className="text-gray-500 text-sm">💡 Don't have exact numbers? Estimate: Gross pay × pay periods</p>
          </div>
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Quick: Deductions
    if (step === 6) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">📊 Quick Deductions</h2>
          <p className="text-gray-400 mb-6">These reduce your taxable income</p>
          
          <InputField label={`RRSP contributions in ${taxYear}`} value={rrspContribution} onChange={setRrspContribution} placeholder="6000" helper="Check your contribution receipts" />
          {hasKids && <InputField label="Childcare expenses" value={childcareExpenses} onChange={setChildcareExpenses} placeholder="8000" helper={`Max $${kidsUnder6 * 8000 + kids6to17 * 5000}`} />}
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Quick: Life Situations
    if (step === 7) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">🏠 Life in {taxYear}</h2>
          <p className="text-gray-400 mb-6">Check all that apply!</p>
          
          <div className="space-y-3">
            <CheckboxCard checked={lifeChecks.includes('paidRent')} onClick={() => toggleLifeCheck('paidRent')} emoji="🏢" label="I paid rent" sub={PROVINCES[province]?.hasRentCredit ? "You may get rent credits!" : ""} />
            <CheckboxCard checked={lifeChecks.includes('wfh')} onClick={() => toggleLifeCheck('wfh')} emoji="💻" label="I worked from home" sub="$2/day up to $500!" />
            <CheckboxCard checked={lifeChecks.includes('firstHome')} onClick={() => toggleLifeCheck('firstHome')} emoji="🏡" label="I bought my first home" sub="$1,500 credit!" />
            <CheckboxCard checked={lifeChecks.includes('medical')} onClick={() => toggleLifeCheck('medical')} emoji="🏥" label="Significant medical expenses" sub="Dental, glasses, prescriptions..." />
            <CheckboxCard checked={lifeChecks.includes('charity')} onClick={() => toggleLifeCheck('charity')} emoji="💝" label="I donated to charity" sub="15-29% back as credit" />
            <CheckboxCard checked={lifeChecks.includes('tuition')} onClick={() => toggleLifeCheck('tuition')} emoji="🎓" label="I paid tuition" sub="15% credit" />
          </div>
          
          {lifeChecks.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 mt-6 space-y-3">
              <p className="text-gray-300 font-medium">Quick details:</p>
              {lifeChecks.includes('paidRent') && <InputField label="Total rent paid" value={rentAmount} onChange={setRentAmount} placeholder="18000" />}
              {lifeChecks.includes('wfh') && <InputField label="Days worked from home" value={wfhDays} onChange={setWfhDays} placeholder="200" prefix="" helper="Max 250 days" />}
              {lifeChecks.includes('medical') && <InputField label="Medical expenses" value={medicalExpenses} onChange={setMedicalExpenses} placeholder="2500" />}
              {lifeChecks.includes('charity') && <InputField label="Charitable donations" value={charitableDonations} onChange={setCharitableDonations} placeholder="500" />}
              {lifeChecks.includes('tuition') && <InputField label="Tuition (T2202)" value={tuitionAmount} onChange={setTuitionAmount} placeholder="7500" />}
            </div>
          )}
          
          <NavButtons onBack={prevStep} onNext={nextStep} continueText="See My Results! 🎉" />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
  }

  // ==================== DETAILED MODE SCREENS ====================
  
  if (mode === 'detailed') {
    // Detailed: Income Sources
    if (step === 5) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">💼 Your Income Sources</h2>
          <p className="text-gray-400 mb-6">Check all that apply for {taxYear}</p>
          
          <div className="space-y-3">
            {INCOME_SOURCES.map(src => (
              <CheckboxCard key={src.id} checked={incomeSources.includes(src.id)} onClick={() => toggleIncomeSource(src.id)} emoji={src.emoji} label={src.label} sub={src.sub} />
            ))}
          </div>
          
          <NavButtons onBack={prevStep} onNext={nextStep} canContinue={incomeSources.length > 0} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Detailed: T4
    if (step === 6 && incomeSources.includes('t4')) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">👔 T4 - Employment Income</h2>
          <p className="text-gray-400 mb-6">Enter info from your T4 slip(s)</p>
          
          {t4Slips.map((slip, i) => (
            <T4Card key={slip.id} slip={slip} index={i} total={t4Slips.length} onUpdate={updateT4} onRemove={removeT4} />
          ))}
          
          <AddSlipButton onClick={addT4} label="Add another T4" />
          <p className="text-gray-600 text-sm mb-4">💡 All fields except income are optional.</p>
          
          <NavButtons onBack={prevStep} onNext={nextStep} canContinue={t4Slips.some(s => s.box14_income)} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Calculate which step we're on
    const hasT4 = incomeSources.includes('t4');
    const hasT5 = incomeSources.includes('t5') || incomeSources.includes('t3');
    const hasSelf = incomeSources.includes('self');
    
    const t5Step = hasT4 ? 7 : 6;
    const selfStep = t5Step + (hasT5 ? 1 : 0);
    const deductionsStep = selfStep + (hasSelf ? 1 : 0);
    const lifeStep = deductionsStep + 1;
    const detailsStep = lifeStep + 1;
    
    // Detailed: T5/T3
    if (step === t5Step && hasT5) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">📈 Investment Income</h2>
          <p className="text-gray-400 mb-6">T5 from banks, T3 from funds</p>
          
          {t5Slips.map((slip, i) => (
            <T5Card key={slip.id} slip={slip} index={i} total={t5Slips.length} onUpdate={updateT5} onRemove={removeT5} />
          ))}
          
          <AddSlipButton onClick={addT5} label="Add another T5/T3" />
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Detailed: Self-Employment
    if (step === selfStep && hasSelf) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">💼 Self-Employment</h2>
          <p className="text-gray-400 mb-6">Freelance, consulting, side hustle</p>
          
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <InputField label="Gross revenue" value={selfEmployment.grossRevenue} onChange={(v) => setSelfEmployment({...selfEmployment, grossRevenue: v})} placeholder="50000" helper="Total before expenses" />
            <InputField label="Business expenses" value={selfEmployment.expenses} onChange={(v) => setSelfEmployment({...selfEmployment, expenses: v})} placeholder="15000" helper="Software, supplies, ads, etc." />
            
            {selfEmployment.grossRevenue && (
              <div className="p-3 bg-emerald-900/20 rounded-lg mt-2">
                <p className="text-emerald-400 text-sm">Net: ${((parseFloat(selfEmployment.grossRevenue) || 0) - (parseFloat(selfEmployment.expenses) || 0)).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Detailed: Deductions
    if (step === deductionsStep) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">📉 Deductions</h2>
          <p className="text-gray-400 mb-6">Reduce your taxable income</p>
          
          <InputField label="RRSP contributions" value={rrspContribution} onChange={setRrspContribution} placeholder="6000" helper="Jan 1 - Mar 3 contributions" />
          {hasKids && <InputField label="Childcare expenses" value={childcareExpenses} onChange={setChildcareExpenses} placeholder="10000" helper={`Max $${kidsUnder6 * 8000 + kids6to17 * 5000}`} />}
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Detailed: Life Situations
    if (step === lifeStep) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">🏠 Life in {taxYear}</h2>
          <p className="text-gray-400 mb-6">Check all that apply!</p>
          
          <div className="space-y-3">
            {LIFE_SITUATIONS.map(item => (
              <CheckboxCard key={item.id} checked={lifeChecks.includes(item.id)} onClick={() => toggleLifeCheck(item.id)} emoji={item.emoji} label={item.label} />
            ))}
          </div>
          
          <NavButtons onBack={prevStep} onNext={nextStep} />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
    
    // Detailed: Life Details
    if (step === detailsStep && lifeChecks.length > 0) {
      return (
        <PageWrapper>
          <ProgressBar progress={progress} timeLeft={timeLeft} />
          <h2 className="text-2xl font-bold mb-2">📝 A Few Details</h2>
          <p className="text-gray-400 mb-6">For the items you checked</p>
          
          <div className="space-y-3">
            {lifeChecks.includes('paidRent') && <InputField label="🏢 Total rent paid" value={rentAmount} onChange={setRentAmount} placeholder="18000" />}
            {lifeChecks.includes('wfh') && <InputField label="💻 Days worked from home" value={wfhDays} onChange={setWfhDays} placeholder="200" prefix="" />}
            {lifeChecks.includes('medical') && <InputField label="🏥 Medical expenses" value={medicalExpenses} onChange={setMedicalExpenses} placeholder="2500" />}
            {lifeChecks.includes('charity') && <InputField label="💝 Charitable donations" value={charitableDonations} onChange={setCharitableDonations} placeholder="500" />}
            {lifeChecks.includes('tuition') && <InputField label="🎓 Tuition (T2202)" value={tuitionAmount} onChange={setTuitionAmount} placeholder="7500" />}
            {lifeChecks.includes('studentLoan') && <InputField label="📚 Student loan interest" value={studentLoanInterest} onChange={setStudentLoanInterest} placeholder="1200" />}
          </div>
          
          <NavButtons onBack={prevStep} onNext={nextStep} continueText="See My Results! 🎉" />
          <RunningEstimate amount={estimatedRefund} />
        </PageWrapper>
      );
    }
  }

  // ==================== RESULTS SCREEN ====================
  
  const income = getTotalIncome();
  const creditsFound = [];
  
  if (income > 0) creditsFound.push({ emoji: '🍁', label: 'Basic Personal Amount', value: '$2,419' });
  if (incomeSources.includes('t4') || mode === 'quick') creditsFound.push({ emoji: '👔', label: 'Canada Employment Amount', value: '$215' });
  if (hasSpouse && spouseIncomeBracket !== 'high') creditsFound.push({ emoji: '💑', label: 'Spousal Amount', value: 'Up to $2,419' });
  if (isSenior) creditsFound.push({ emoji: '👴', label: 'Age Amount', value: 'Up to $1,319' });
  if (CLIMATE_ACTION[province]) creditsFound.push({ emoji: '🌍', label: 'Climate Action Incentive', value: `$${CLIMATE_ACTION[province].single}/yr` });
  if (lifeChecks.includes('firstHome')) creditsFound.push({ emoji: '🏡', label: 'First-Time Home Buyer', value: '$1,500' });
  if (lifeChecks.includes('wfh') && wfhDays) creditsFound.push({ emoji: '💻', label: 'Work From Home', value: `$${Math.min(parseInt(wfhDays) * 2, 500)}` });
  
  const missingCredits = [];
  if (!lifeChecks.includes('wfh')) missingCredits.push({ emoji: '💻', label: 'Work From Home', value: 'Up to $500' });
  if (!rrspContribution) missingCredits.push({ emoji: '📊', label: 'RRSP Contribution', value: 'Varies' });
  if (!lifeChecks.includes('digitalNews')) missingCredits.push({ emoji: '📰', label: 'Digital News Subscription', value: 'Up to $75' });
  
  return (
    <PageWrapper>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-emerald-400 mb-2">Your Results!</h2>
      </div>
      
      <div className={`${estimatedRefund >= 0 ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700' : 'bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700'} border rounded-2xl p-6 mb-6 text-center`}>
        <p className={`text-sm mb-2 ${estimatedRefund >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          {estimatedRefund >= 0 ? '💰 ESTIMATED REFUND' : '📊 ESTIMATED OWING'}
        </p>
        <p className="text-5xl font-bold text-white mb-2">${Math.abs(estimatedRefund).toLocaleString()}</p>
        <p className={`text-sm ${estimatedRefund >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {estimatedRefund >= 0 ? `That's ${Math.round(estimatedRefund / 2)} Tim Hortons coffees! ☕` : "Don't worry, you can reduce this!"}
        </p>
      </div>
      
      {creditsFound.length > 0 && (
        <ResultsCard title="✅ Credits You Qualify For" items={creditsFound} variant="success" />
      )}
      
      {missingCredits.length > 0 && (
        <ResultsCard title="⚠️ Credits You Might Be Missing" items={missingCredits} variant="warning" />
      )}
      
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <h3 className="font-bold mb-4">🚀 Ready to File?</h3>
        <div className="space-y-3">
          <a href="https://www.wealthsimple.com/en-ca/tax" target="_blank" rel="noopener noreferrer" className="block w-full p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center font-medium transition-colors">
            🟢 File with Wealthsimple Tax - FREE
          </a>
          <a href="https://turbotax.intuit.ca" target="_blank" rel="noopener noreferrer" className="block w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-medium transition-colors">
            🔵 File with TurboTax
          </a>
        </div>
      </div>
      
      <div className="text-center">
        <button onClick={() => { setStep(0); setMode(null); }} className="text-gray-500 hover:text-gray-400 text-sm">
          Start Over
        </button>
      </div>
    </PageWrapper>
  );
}
