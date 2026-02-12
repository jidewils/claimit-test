// ClaimIt UI Components
// components/claimit-ui.jsx

'use client';

export const ProgressBar = ({ progress, timeLeft }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 sm:w-48 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-gray-500 text-sm">{progress}%</span>
      </div>
      <span className="text-gray-500 text-sm">{timeLeft}</span>
    </div>
  </div>
);

export const RunningEstimate = ({ amount }) => {
  if (amount === 0) return null;
  const isRefund = amount > 0;
  
  return (
    <div className={`fixed bottom-4 right-4 ${isRefund ? 'bg-emerald-900/90 border-emerald-700' : 'bg-red-900/90 border-red-700'} backdrop-blur border rounded-xl px-4 py-3 shadow-lg z-50`}>
      <div className={`text-xs ${isRefund ? 'text-emerald-400' : 'text-red-400'}`}>
        {isRefund ? '💰 Estimated refund' : '📊 Estimated owing'}
      </div>
      <div className={`text-2xl font-bold ${isRefund ? 'text-emerald-300' : 'text-red-300'}`}>
        ${Math.abs(amount).toLocaleString()}
      </div>
    </div>
  );
};

export const InputField = ({ label, value, onChange, placeholder, helper, prefix = '$', type = 'number' }) => (
  <div className="mb-4">
    <label className="text-gray-400 text-sm mb-2 block">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border border-gray-700 rounded-xl py-3 ${prefix ? 'pl-8' : 'pl-4'} pr-4 text-lg focus:border-emerald-500 focus:outline-none transition-colors`}
      />
    </div>
    {helper && <p className="text-gray-600 text-sm mt-1">{helper}</p>}
  </div>
);

export const CheckboxCard = ({ checked, onClick, emoji, label, sub }) => (
  <button
    onClick={onClick}
    type="button"
    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
      checked
        ? 'border-emerald-500 bg-emerald-900/30'
        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {sub && <p className="text-gray-500 text-sm mt-0.5">{sub}</p>}
      </div>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
      }`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
    </div>
  </button>
);

export const RadioCard = ({ selected, onClick, emoji, label, sub }) => (
  <button
    onClick={onClick}
    type="button"
    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
      selected
        ? 'border-emerald-500 bg-emerald-900/30'
        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {sub && <p className="text-gray-500 text-sm mt-0.5">{sub}</p>}
      </div>
    </div>
  </button>
);

export const NavButtons = ({ onBack, onNext, canContinue = true, continueText = 'Continue' }) => (
  <div className="flex gap-3 mt-6">
    <button 
      onClick={onBack}
      type="button"
      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 transition-colors"
    >
      Back
    </button>
    <button 
      onClick={onNext}
      disabled={!canContinue}
      type="button"
      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
    >
      {continueText}
    </button>
  </div>
);

export const ProvinceGrid = ({ provinces, selected, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
    {Object.entries(provinces).map(([code, { name, emoji }]) => (
      <button
        key={code}
        onClick={() => onSelect(code)}
        type="button"
        className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
          selected === code 
            ? 'border-emerald-500 bg-emerald-900/30' 
            : 'border-gray-700 bg-gray-900 hover:border-gray-600'
        }`}
      >
        <span className="text-lg sm:text-xl mr-2">{emoji}</span>
        <span className="text-sm">{name}</span>
      </button>
    ))}
  </div>
);

export const T4Card = ({ slip, index, total, onUpdate, onRemove }) => (
  <div className="bg-gray-900 rounded-xl p-4 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-emerald-400">T4 #{index + 1}</h3>
      {total > 1 && (
        <button onClick={() => onRemove(slip.id)} type="button" className="text-red-400 hover:text-red-300 text-sm">
          🗑️ Remove
        </button>
      )}
    </div>
    
    <div className="space-y-3">
      <InputField
        label="Employer name (optional)"
        value={slip.employer}
        onChange={(v) => onUpdate(slip.id, 'employer', v)}
        placeholder="ABC Company"
        prefix=""
        type="text"
      />
      
      <div className="grid sm:grid-cols-2 gap-3">
        <InputField
          label="Box 14 - Employment income"
          value={slip.box14_income}
          onChange={(v) => onUpdate(slip.id, 'box14_income', v)}
          placeholder="65000"
          helper="Your gross salary"
        />
        <InputField
          label="Box 22 - Tax deducted"
          value={slip.box22_taxDeducted}
          onChange={(v) => onUpdate(slip.id, 'box22_taxDeducted', v)}
          placeholder="15000"
          helper="Tax already paid"
        />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-3">
        <InputField
          label="Box 16 - CPP contributions"
          value={slip.box16_cpp}
          onChange={(v) => onUpdate(slip.id, 'box16_cpp', v)}
          placeholder="3867"
        />
        <InputField
          label="Box 18 - EI premiums"
          value={slip.box18_ei}
          onChange={(v) => onUpdate(slip.id, 'box18_ei', v)}
          placeholder="1049"
        />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-3">
        <InputField
          label="Box 20 - RPP contributions"
          value={slip.box20_rpp}
          onChange={(v) => onUpdate(slip.id, 'box20_rpp', v)}
          placeholder="0"
          helper="Pension plan"
        />
        <InputField
          label="Box 44 - Union dues"
          value={slip.box44_unionDues}
          onChange={(v) => onUpdate(slip.id, 'box44_unionDues', v)}
          placeholder="0"
          helper="Deductible!"
        />
      </div>
    </div>
  </div>
);

export const T5Card = ({ slip, index, total, onUpdate, onRemove }) => (
  <div className="bg-gray-900 rounded-xl p-4 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-emerald-400">T5/T3 #{index + 1}</h3>
      {total > 1 && (
        <button onClick={() => onRemove(slip.id)} type="button" className="text-red-400 hover:text-red-300 text-sm">
          🗑️ Remove
        </button>
      )}
    </div>
    
    <div className="space-y-3">
      <InputField
        label="Institution (optional)"
        value={slip.institution}
        onChange={(v) => onUpdate(slip.id, 'institution', v)}
        placeholder="TD Bank"
        prefix=""
        type="text"
      />
      
      <InputField
        label="Box 13 - Interest income"
        value={slip.box13_interest}
        onChange={(v) => onUpdate(slip.id, 'box13_interest', v)}
        placeholder="250"
        helper="From savings accounts, GICs"
      />
      
      <div className="grid sm:grid-cols-2 gap-3">
        <InputField
          label="Box 10 - Actual dividends"
          value={slip.box10_dividendsActual}
          onChange={(v) => onUpdate(slip.id, 'box10_dividendsActual', v)}
          placeholder="500"
        />
        <InputField
          label="Box 11 - Taxable dividends"
          value={slip.box11_dividendsTaxable}
          onChange={(v) => onUpdate(slip.id, 'box11_dividendsTaxable', v)}
          placeholder="690"
          helper="Usually 1.38× actual"
        />
      </div>
      
      <InputField
        label="Box 18 - Capital gains"
        value={slip.box18_capitalGains}
        onChange={(v) => onUpdate(slip.id, 'box18_capitalGains', v)}
        placeholder="0"
        helper="Only 50% is taxable"
      />
    </div>
  </div>
);

export const AddSlipButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    type="button"
    className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl text-gray-400 hover:text-emerald-400 transition-colors mb-4"
  >
    + {label}
  </button>
);

export const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
    <div className="max-w-2xl mx-auto">
      {children}
    </div>
  </div>
);

export const ResultsCard = ({ title, items, variant = 'success' }) => {
  const bgColor = variant === 'success' ? 'bg-emerald-900/20 border-emerald-800' : 'bg-amber-900/20 border-amber-800';
  const titleColor = variant === 'success' ? 'text-emerald-400' : 'text-amber-400';
  
  return (
    <div className={`${bgColor} border rounded-2xl p-6 mb-6`}>
      <h3 className={`font-bold ${titleColor} mb-4`}>{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
            <div className="flex items-center gap-2">
              <span>{item.emoji}</span>
              <span className="text-gray-300">{item.label}</span>
            </div>
            <span className={`font-medium ${variant === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
