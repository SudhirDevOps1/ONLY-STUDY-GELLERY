import React, { useState } from 'react';
import { SectionHeader } from './SectionBase';
import * as api from '../../utils/apis';

interface Formula {
  id: string;
  name: string;
  category: string;
  icon: string;
  fields: { key: string; label: string; type?: string; defaultValue?: string }[];
  calc: (vals: Record<string, number>) => string;
}

const formulas: Formula[] = [
  // Health
  { id: 'bmi', name: 'BMI Calculator', category: 'Health', icon: '⚖️',
    fields: [{ key: 'weight', label: 'Weight (kg)', defaultValue: '70' }, { key: 'height', label: 'Height (cm)', defaultValue: '170' }],
    calc: (v) => {
      const bmi = api.calcBMI(v.weight, v.height);
      const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
      return `${bmi} (${cat})`;
    }
  },
  { id: 'bmr', name: 'BMR Calculator', category: 'Health', icon: '🔥',
    fields: [{ key: 'weight', label: 'Weight (kg)', defaultValue: '70' }, { key: 'height', label: 'Height (cm)', defaultValue: '170' }, { key: 'age', label: 'Age', defaultValue: '25' }],
    calc: (v) => `${api.calcBMR(v.weight, v.height, v.age)} kcal/day`
  },
  { id: 'water', name: 'Water Intake', category: 'Health', icon: '💧',
    fields: [{ key: 'weight', label: 'Weight (kg)', defaultValue: '70' }],
    calc: (v) => `${(v.weight * 0.033).toFixed(2)} liters/day`
  },
  { id: 'tdee', name: 'TDEE Calculator', category: 'Health', icon: '🏃',
    fields: [{ key: 'bmr', label: 'BMR (kcal)', defaultValue: '1700' }, { key: 'activity', label: 'Activity (1.2-1.9)', defaultValue: '1.5' }],
    calc: (v) => `${Math.round(v.bmr * v.activity)} kcal/day`
  },
  // Finance
  { id: 'compound', name: 'Compound Interest', category: 'Finance', icon: '💰',
    fields: [{ key: 'p', label: 'Principal ($)', defaultValue: '10000' }, { key: 'r', label: 'Rate (%/year)', defaultValue: '7' }, { key: 't', label: 'Years', defaultValue: '10' }],
    calc: (v) => `$${api.calcCompoundInterest(v.p, v.r, v.t).toLocaleString()}`
  },
  { id: 'emi', name: 'Loan EMI', category: 'Finance', icon: '🏦',
    fields: [{ key: 'p', label: 'Loan Amount ($)', defaultValue: '500000' }, { key: 'r', label: 'Rate (%/year)', defaultValue: '8' }, { key: 'm', label: 'Months', defaultValue: '60' }],
    calc: (v) => `$${api.calcEMI(v.p, v.r, v.m).toLocaleString()}/month`
  },
  { id: 'sip', name: 'SIP Calculator', category: 'Finance', icon: '📈',
    fields: [{ key: 'monthly', label: 'Monthly ($)', defaultValue: '500' }, { key: 'rate', label: 'Rate (%/year)', defaultValue: '12' }, { key: 'years', label: 'Years', defaultValue: '10' }],
    calc: (v) => `$${api.calcSIP(v.monthly, v.rate, v.years).toLocaleString()}`
  },
  { id: 'tax', name: 'GST/Tax Calculator', category: 'Finance', icon: '💸',
    fields: [{ key: 'amount', label: 'Amount ($)', defaultValue: '1000' }, { key: 'rate', label: 'Tax Rate (%)', defaultValue: '18' }],
    calc: (v) => `Tax: $${(v.amount * v.rate / 100).toFixed(2)} | Total: $${(v.amount + v.amount * v.rate / 100).toFixed(2)}`
  },
  // Math
  { id: 'circle', name: 'Circle Area', category: 'Math', icon: '⭕',
    fields: [{ key: 'r', label: 'Radius', defaultValue: '5' }],
    calc: (v) => `Area: ${(Math.PI * v.r ** 2).toFixed(2)} | Circumference: ${(2 * Math.PI * v.r).toFixed(2)}`
  },
  { id: 'sphere', name: 'Sphere Volume', category: 'Math', icon: '🌐',
    fields: [{ key: 'r', label: 'Radius', defaultValue: '5' }],
    calc: (v) => `Volume: ${(4/3 * Math.PI * v.r ** 3).toFixed(2)} | Surface: ${(4 * Math.PI * v.r ** 2).toFixed(2)}`
  },
  { id: 'triangle', name: 'Triangle Area', category: 'Math', icon: '📐',
    fields: [{ key: 'base', label: 'Base', defaultValue: '10' }, { key: 'height', label: 'Height', defaultValue: '5' }],
    calc: (v) => `Area: ${(0.5 * v.base * v.height).toFixed(2)}`
  },
  { id: 'pythagoras', name: 'Pythagoras', category: 'Math', icon: '📏',
    fields: [{ key: 'a', label: 'Side A', defaultValue: '3' }, { key: 'b', label: 'Side B', defaultValue: '4' }],
    calc: (v) => `Hypotenuse: ${Math.sqrt(v.a ** 2 + v.b ** 2).toFixed(2)}`
  },
  { id: 'factorial', name: 'Factorial', category: 'Math', icon: '!',
    fields: [{ key: 'n', label: 'Number (max 20)', defaultValue: '5' }],
    calc: (v) => {
      let result = 1;
      for (let i = 2; i <= Math.min(v.n, 20); i++) result *= i;
      return `${v.n}! = ${result.toLocaleString()}`;
    }
  },
  // Physics
  { id: 'speed', name: 'Speed Calculator', category: 'Physics', icon: '🚀',
    fields: [{ key: 'd', label: 'Distance (km)', defaultValue: '100' }, { key: 't', label: 'Time (hours)', defaultValue: '2' }],
    calc: (v) => `Speed: ${(v.d / v.t).toFixed(2)} km/h`
  },
  { id: 'force', name: 'Force (F=ma)', category: 'Physics', icon: '⚡',
    fields: [{ key: 'm', label: 'Mass (kg)', defaultValue: '10' }, { key: 'a', label: 'Acceleration (m/s²)', defaultValue: '9.8' }],
    calc: (v) => `Force: ${(v.m * v.a).toFixed(2)} N`
  },
  { id: 'ohms', name: "Ohm's Law", category: 'Physics', icon: '🔌',
    fields: [{ key: 'V', label: 'Voltage (V)', defaultValue: '12' }, { key: 'R', label: 'Resistance (Ω)', defaultValue: '6' }],
    calc: (v) => `Current: ${(v.V / v.R).toFixed(2)} A | Power: ${(v.V ** 2 / v.R).toFixed(2)} W`
  },
  // Conversion
  { id: 'temp', name: 'Temp (C→F)', category: 'Conversion', icon: '🌡️',
    fields: [{ key: 'c', label: 'Celsius', defaultValue: '25' }],
    calc: (v) => `${(v.c * 9 / 5 + 32).toFixed(2)} °F | ${(v.c + 273.15).toFixed(2)} K`
  },
  { id: 'len', name: 'Length (m→ft)', category: 'Conversion', icon: '📏',
    fields: [{ key: 'm', label: 'Meters', defaultValue: '10' }],
    calc: (v) => `${(v.m * 3.281).toFixed(2)} ft | ${(v.m * 39.37).toFixed(2)} inches | ${(v.m / 1000).toFixed(4)} km`
  },
  { id: 'age', name: 'Age Calculator', category: 'Date & Time', icon: '🎂',
    fields: [{ key: 'year', label: 'Birth Year', defaultValue: '2000' }, { key: 'month', label: 'Birth Month (1-12)', defaultValue: '1' }],
    calc: (v) => {
      const now = new Date();
      const birth = new Date(v.year, v.month - 1);
      const years = now.getFullYear() - birth.getFullYear();
      const months = now.getMonth() - birth.getMonth();
      return `${years > 0 ? years + ' years' : ''} ${months >= 0 ? months : 12 + months} months`;
    }
  },
];

const categories = ['All', ...Array.from(new Set(formulas.map(f => f.category)))];

export const CalculatorSection: React.FC = () => {
  const [selectedFormula, setSelectedFormula] = useState(formulas[0]);
  const [category, setCategory] = useState('All');
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    formulas[0].fields.forEach(f => init[f.key] = f.defaultValue || '');
    return init;
  });
  const [result, setResult] = useState<string>('');

  const selectFormula = (f: Formula) => {
    setSelectedFormula(f);
    const init: Record<string, string> = {};
    f.fields.forEach(field => init[field.key] = field.defaultValue || '');
    setValues(init);
    setResult('');
  };

  const calculate = () => {
    const nums: Record<string, number> = {};
    selectedFormula.fields.forEach(f => nums[f.key] = parseFloat(values[f.key] || '0'));
    setResult(selectedFormula.calc(nums));
  };

  const filtered = category === 'All' ? formulas : formulas.filter(f => f.category === category);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🧮" title="Calculator" description="20+ calculators: Health, Finance, Math, Physics, Conversion" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formula List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${category === c ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 max-h-[600px] overflow-y-auto">
            {filtered.map(f => (
              <button
                key={f.id}
                onClick={() => selectFormula(f)}
                className={`w-full text-left p-3 border-b border-white/5 last:border-0 transition-colors ${selectedFormula.id === f.id ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Form */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{selectedFormula.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedFormula.name}</h2>
              <p className="text-sm text-gray-400">{selectedFormula.category}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {selectedFormula.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">{f.label}</label>
                <input
                  type="number"
                  step="any"
                  value={values[f.key] || ''}
                  onChange={(e) => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
            Calculate
          </button>

          {result && (
            <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
              <p className="text-xs text-green-300 uppercase tracking-wider mb-2">Result</p>
              <p className="text-2xl md:text-3xl font-bold text-green-400">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
