'use client';

import { useState, useMemo } from 'react';

// Inline data for demo
const PROVINCES = {
  BC: { name: 'British Columbia', emoji: '🏔️' },
  AB: { name: 'Alberta', emoji: '🏔️' },
  SK: { name: 'Saskatchewan', emoji: '🌾' },
  MB: { name: 'Manitoba', emoji: '🌾' },
  ON: { name: 'Ontario', emoji: '🍁' },
  QC: { name: 'Quebec', emoji: '⚜️' },
  NB: { name: 'New Brunswick', emoji: '🦞' },
  NS: { name: 'Nova Scotia', emoji: '🌊' },
  PE: { name: 'P.E.I.', emoji: '🥔' },
  NL: { name: 'Newfoundland', emoji: '🐋' },
  YT: { name: 'Yukon', emoji: '🐻' },
  NT: { name: 'N.W.T.', emoji: '❄️' },
  NU: { name: 'Nunavut', emoji: '🌌' },
};

const CLIMATE_ACTION = {
  ON: { single: 140, spouse: 140, child: 70 },
  AB: { single: 772, spouse: 772, child: 386 },
  SK: { single: 680, spouse: 680, child: 340 },
  MB: { single: 528, spouse: 528, child: 264 },
};

export default function ClaimItDemo() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null); // 'quick' or 'detailed'
  
  // User data
  const [province, setProvince] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState(null);
  const [hasKids, setHasKids] = useState(null);
  const [kidsUnder6, setKidsUnder6] = useState(0);
  const [kids6to17, setKids6to17] = useState(0);
  const [isNewcomer, setIsNewcomer] = useState(null);
  const [incomeSources, setIncomeSources] = useState([]);
  const [employmentIncome, setEmploymentIncome] = useState('');
  const [taxDeducted, setTaxDeducted] = useState('');
  const [spouseIncome, setSpouseIncome] = useState('');
  const [lifeChecks, setLifeChecks] = useState([]);
  const [rentAmount, setRentAmount] = useState('');
  const [medicalAmount, setMedicalAmount] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [rrspAmount, setRrspAmount] = useState('');
  
  // Calculate running estimate
  const runningEstimate = useMemo(() => {
    let refund = 0;
    const income = parseFloat(employmentIncome) || 0;
    const tax = parseFloat(taxDeducted) || 0;
    
    if (income > 0 && tax > 0) {
      // Basic estimate: assume over-withholding
      const estimatedTax = income * 0.25; // Rough average rate
      refund = Math.max(0, tax - estimatedTax);
      
      // Spousal credit boost
      if (maritalStatus === 'married' && (parseFloat(spouseIncome) || 0) < 15000) {
        refund += 1500;
      }
      
      // Climate action
      const climate = CLIMATE_ACTION[province];
      if (climate) {
        refund += climate.single;
        if (maritalStatus === 'married') refund += climate.spouse;
        refund += (kidsUnder6 + kids6to17) * (climate.child || 70);
      }
      
      // Rent credits
      if (lifeChecks.includes('rent') && province === 'ON') {
        refund += Math.min(840, (parseFloat(rentAmount) || 0) * 0.05);
      }
      
      // RRSP
      const rrsp = parseFloat(rrspAmount) || 0;
      if (rrsp > 0) {
        refund += rrsp * 0.30; // Marginal rate approximation
      }
    }
    
    return Math.round(refund);
  }, [employmentIncome, taxDeducted, maritalStatus, spouseIncome, province, kidsUnder6, kids6to17, lifeChecks, rentAmount, rrspAmount]);
  
  const totalSteps = mode === 'quick' ? 8 : 10;
  const progress = step > 0 ? Math.round((step / totalSteps) * 100) : 0;
  const timeLeft = Math.max(1, totalSteps - step);
  
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));
  
  const toggleLifeCheck = (item) => {
    setLifeChecks(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };
  
  const toggleIncomeSource = (source) => {
    setIncomeSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  // SCREEN 0: Welcome
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-emerald-400 mb-2">✨ ClaimIt</h1>
            <p className="text-gray-400 text-lg">Find tax credits you didn't know existed.</p>
            <p className="text-gray-500">See your refund in about 5 minutes.</p>
            <div className="text-3xl mt-4">🍁 🦫 🏒 ☕</div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => { setMode('quick'); nextStep(); }}
              className="bg-gray-900 border-2 border-gray-700 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all"
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">QUICK</h3>
              <p className="text-gray-400 text-sm mb-2">~5 minutes</p>
              <p className="text-gray-500 text-sm">Great for simple taxes (just a job)</p>
            </button>
            
            <button
              onClick={() => { setMode('detailed'); nextStep(); }}
              className="bg-gray-900 border-2 border-gray-700 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all"
            >
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">DETAILED</h3>
              <p className="text-gray-400 text-sm mb-2">~15 minutes</p>
              <p className="text-gray-500 text-sm">Great for investments, business, etc.</p>
            </button>
          </div>
          
          <p className="text-center text-gray-600 text-sm">
            💡 Not sure? Start with Quick. You can always add details later.
          </p>
          
          <div className="text-center mt-8 text-gray-600 text-xs">
            🔒 Your data stays on your device. Pinky promise.
          </div>
        </div>
      </div>
    );
  }
  
  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-gray-500 text-sm">{progress}%</span>
        </div>
        <span className="text-gray-500 text-sm">~{timeLeft} min left</span>
      </div>
    </div>
  );
  
  // Running estimate component
  const RunningEstimate = () => (
    runningEstimate > 0 && (
      <div className="fixed bottom-4 right-4 bg-emerald-900/90 backdrop-blur border border-emerald-700 rounded-xl px-4 py-3 shadow-lg">
        <div className="text-xs text-emerald-400">Running estimate</div>
        <div className="text-2xl font-bold text-emerald-300">${runningEstimate.toLocaleString()}</div>
      </div>
    )
  );

  // SCREEN 1: Province
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">🍁 First things first...</h2>
          <p className="text-gray-400 mb-6">Where in this beautiful country do you call home?</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {Object.entries(PROVINCES).map(([code, { name, emoji }]) => (
              <button
                key={code}
                onClick={() => setProvince(code)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  province === code 
                    ? 'border-emerald-500 bg-emerald-900/30' 
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className="text-xl mr-2">{emoji}</span>
                <span className="text-sm">{name}</span>
              </button>
            ))}
          </div>
          
          <p className="text-gray-600 text-sm mb-6">
            💡 This matters because each province has different credits. Yes, Canada is complicated. Sorry! 🤷
          </p>
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">
              Back
            </button>
            <button 
              onClick={nextStep}
              disabled={!province}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // SCREEN 2: Relationship Status
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">💕 What's your situation?</h2>
          <p className="text-gray-400 mb-6">(as of December 31, 2025)</p>
          
          <div className="space-y-3 mb-6">
            {[
              { value: 'single', emoji: '🙋', label: 'Single', sub: 'Flying solo and that\'s totally cool' },
              { value: 'married', emoji: '💑', label: 'Married', sub: 'Congratulations! (or condolences? 😉)' },
              { value: 'common-law', emoji: '🏠', label: 'Common-law', sub: 'Living together 12+ months = basically married to CRA' },
              { value: 'separated', emoji: '💔', label: 'Separated/Divorced/Widowed', sub: 'We\'re sorry. There are credits that help.' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setMaritalStatus(opt.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  maritalStatus === opt.value
                    ? 'border-emerald-500 bg-emerald-900/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className="text-xl mr-3">{opt.emoji}</span>
                <span className="font-medium">{opt.label}</span>
                <p className="text-gray-500 text-sm mt-1 ml-9">{opt.sub}</p>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              disabled={!maritalStatus}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // SCREEN 3: Kids
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">👶 Any tiny humans depending on you?</h2>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => { setHasKids(false); setKidsUnder6(0); setKids6to17(0); }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                hasKids === false
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              Nope, just me (and maybe some plants 🌱)
            </button>
            
            <button
              onClick={() => setHasKids(true)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                hasKids === true
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              Yes! I have kids under 18
            </button>
          </div>
          
          {hasKids && (
            <div className="bg-gray-900 rounded-xl p-4 mb-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Under 6 years old 👶 (bigger credits!)</label>
                <select 
                  value={kidsUnder6}
                  onChange={(e) => setKidsUnder6(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
                >
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Ages 6-17 🧒</label>
                <select 
                  value={kids6to17}
                  onChange={(e) => setKids6to17(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
                >
                  {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <p className="text-gray-600 text-sm">💡 Under 6 = more Canada Child Benefit. Thanks, diapers!</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              disabled={hasKids === null}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // SCREEN 4: Newcomer
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">🍁 Did you move to Canada in 2025?</h2>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setIsNewcomer(false)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isNewcomer === false
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              Nope, been here (surviving the winters ❄️)
            </button>
            
            <button
              onClick={() => setIsNewcomer(true)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isNewcomer === true
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              Yes! I'm new here! 🎉 Welcome!
            </button>
          </div>
          
          {isNewcomer && (
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 mb-6">
              <p className="text-emerald-300 text-sm">
                💡 Great news! You only pay tax on income earned AFTER you arrived. That's actually good news!
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              disabled={isNewcomer === null}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // SCREEN 5: Income Sources
  if (step === 5) {
    const sources = [
      { id: 't4', emoji: '👔', label: 'Regular job (T4)', sub: 'The 9-to-5 grind' },
      { id: 'gig', emoji: '🚗', label: 'Gig work / Side hustle (T4A)', sub: 'Uber, DoorDash, freelance' },
      { id: 'self', emoji: '💼', label: 'Self-employed / Business', sub: "You're your own boss" },
      { id: 'invest', emoji: '📈', label: 'Investments (T5/T3)', sub: 'Interest, dividends, funds' },
      { id: 'ei', emoji: '🍼', label: 'EI / Parental leave (T4E)', sub: 'Government benefits' },
      { id: 'none', emoji: '😬', label: 'No income in 2025', sub: 'Still worth filing for benefits!' },
    ];
    
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">💼 How did you make money in 2025?</h2>
          <p className="text-gray-400 mb-6">Check all that apply (no judgment, we all hustle)</p>
          
          <div className="space-y-3 mb-6">
            {sources.map(src => (
              <button
                key={src.id}
                onClick={() => toggleIncomeSource(src.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  incomeSources.includes(src.id)
                    ? 'border-emerald-500 bg-emerald-900/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className="text-xl mr-3">{src.emoji}</span>
                <span className="font-medium">{src.label}</span>
                <p className="text-gray-500 text-sm ml-9">{src.sub}</p>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              disabled={incomeSources.length === 0}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // SCREEN 6: Employment Income Details
  if (step === 6 && incomeSources.includes('t4')) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">👔 Let's talk about that job money</h2>
          
          <div className="space-y-6 mb-6">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                What was your total employment income? (Box 14 on T4)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={employmentIncome}
                  onChange={(e) => setEmploymentIncome(e.target.value)}
                  placeholder="85,000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pl-8 pr-4 text-xl"
                />
              </div>
              <p className="text-gray-600 text-sm mt-2">
                💡 Don't have your T4 yet? Estimate from your last paystub.
              </p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                How much tax did your employer already take? (Box 22)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={taxDeducted}
                  onChange={(e) => setTaxDeducted(e.target.value)}
                  placeholder="20,000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pl-8 pr-4 text-xl"
                />
              </div>
              <p className="text-gray-600 text-sm mt-2">
                💡 This is why you might get a refund - they often take too much! 🤞
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // Skip to next screen if no T4
  if (step === 6 && !incomeSources.includes('t4')) {
    nextStep();
    return null;
  }
  
  // SCREEN 7: Spouse Income (if married)
  if (step === 7 && (maritalStatus === 'married' || maritalStatus === 'common-law')) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <ProgressBar />
          
          <h2 className="text-2xl font-bold mb-2">💑 Quick question about your better half...</h2>
          <p className="text-gray-400 mb-6">What was their income in 2025?</p>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSpouseIncome('high')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                spouseIncome === 'high'
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              They earned over $15,000
            </button>
            
            <button
              onClick={() => setSpouseIncome('low')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                spouseIncome === 'low'
                  ? 'border-emerald-500 bg-emerald-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              They earned under $15,000 (or no income)
            </button>
          </div>
          
          {spouseIncome === 'low' && (
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 mb-6">
              <p className="text-emerald-300">
                🎉 Nice! You likely qualify for the Spousal Amount credit!
                This could be worth up to $2,000+ in tax savings!
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button onClick={prevStep} className="px-6 py-3 bg-gray-800 rounded-xl text-gray-400">Back</button>
            <button 
              onClick={nextStep}
              disabled={!spouseIncome}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
        <RunningEstimate />
      </div>
    );
  }
  
  // Skip spouse screen if single
  if (step === 7 && maritalStatus !== 'married' && maritalStatus !== 'common-law') {
    nextStep();
    return null;
  }
  
  // SCREEN 8: Life Stuff & Results (simplified for demo)
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-emerald-400 mb-2">BOOM! You did it!</h2>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700 rounded-2xl p-6 mb-6 text-center">
          <p className="text-emerald-300 text-sm mb-2">💰 YOUR ESTIMATED REFUND</p>
          <p className="text-5xl font-bold text-white mb-2">${runningEstimate.toLocaleString()}</p>
          <p className="text-emerald-400 text-sm">
            That's like {Math.round(runningEstimate / 2)} Tim Hortons coffees! ☕
          </p>
        </div>
        
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4">✅ Credits You Qualify For</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <span className="mr-2">🍁</span>
                <span>Basic Personal Amount</span>
              </div>
              <span className="text-emerald-400 font-medium">$2,421</span>
            </div>
            {incomeSources.includes('t4') && (
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <span className="mr-2">👔</span>
                  <span>Canada Employment Amount</span>
                </div>
                <span className="text-emerald-400 font-medium">$215</span>
              </div>
            )}
            {spouseIncome === 'low' && (
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <span className="mr-2">💑</span>
                  <span>Spousal Amount</span>
                </div>
                <span className="text-emerald-400 font-medium">$1,834</span>
              </div>
            )}
            {CLIMATE_ACTION[province] && (
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <div>
                  <span className="mr-2">🌍</span>
                  <span>Climate Action Incentive</span>
                </div>
                <span className="text-emerald-400 font-medium">${CLIMATE_ACTION[province].single}/yr</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-300 mb-4">⚠️ Credits You Might Be Missing</h3>
          <div className="space-y-3">
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">🏠</span>
                <div>
                  <p className="font-medium">Work From Home Expenses</p>
                  <p className="text-gray-400 text-sm">Claim $2/day without receipts (up to $500)!</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">📰</span>
                <div>
                  <p className="font-medium">Digital News Subscription</p>
                  <p className="text-gray-400 text-sm">Globe & Mail, Toronto Star, etc. - up to $75!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4">🚀 Ready to File?</h3>
          <div className="space-y-3">
            <a href="https://www.wealthsimple.com/en-ca/tax" target="_blank" rel="noopener noreferrer" 
               className="block w-full p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center font-medium transition-colors">
              🟢 File with Wealthsimple Tax - FREE
            </a>
            <a href="https://turbotax.intuit.ca" target="_blank" rel="noopener noreferrer"
               className="block w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-medium transition-colors">
              🔵 File with TurboTax
            </a>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => { setStep(0); setMode(null); }}
            className="text-gray-500 hover:text-gray-400 text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
