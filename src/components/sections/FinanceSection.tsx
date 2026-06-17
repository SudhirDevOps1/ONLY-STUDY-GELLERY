import React, { useEffect, useState } from 'react';
import { SectionHeader, LoadingSpinner, ActionButton } from './SectionBase';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import * as api from '../../utils/apis';

export const FinanceSection: React.FC = () => {
  const [crypto, setCrypto] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setToCur] = useState('INR');
  const [amount, setAmount] = useState('100');

  const load = async () => {
    setLoading(true);
    const [c, r] = await Promise.all([api.getCryptoPrices(15), api.getCurrencyRates(fromCur)]);
    if (c.success) setCrypto(c.data || []);
    if (r.success) setRates(r.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [fromCur]);

  const converted = rates?.rates?.[toCur] ? (parseFloat(amount) * rates.rates[toCur]).toFixed(2) : '0';
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW', 'AED', 'SGD'];

  if (loading && crypto.length === 0) return <div className="max-w-6xl mx-auto p-4 md:p-8"><SectionHeader icon="💰" title="Finance Dashboard" description="" /><LoadingSpinner /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="💰" title="Finance Dashboard" description="Live crypto prices, currency rates & converter (no API key)" />

      {/* Currency Converter */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">💱 Currency Converter</h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">From</label>
            <div className="flex gap-2">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none" />
              <select value={fromCur} onChange={(e) => setFromCur(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none">
                {popularCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="text-center"><ArrowRight className="w-6 h-6 text-green-400 mx-auto" /></div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">To</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-bold">{converted}</div>
              <select value={toCur} onChange={(e) => setToCur(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none">
                {popularCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">1 {fromCur} = {rates?.rates?.[toCur]?.toFixed(4) || '...'} {toCur}</p>
      </div>

      {/* Crypto Prices */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🪙 Top Cryptocurrencies</h3>
          <ActionButton onClick={load} loading={loading} variant="secondary">Refresh</ActionButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {crypto.map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <img src={c.image} alt="" className="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 uppercase">{c.symbol}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">${c.current_price.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-1 text-sm font-semibold ${c.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {c.price_change_percentage_24h > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {c.price_change_percentage_24h?.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500 mt-2">MCap: ${(c.market_cap / 1e9).toFixed(2)}B</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Exchange Rates */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">💸 Exchange Rates (1 {fromCur})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {rates?.rates && Object.entries(rates.rates).slice(0, 24).map(([k, v]: [string, any]) => (
            <div key={k} className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-xs text-gray-400">{k}</p>
              <p className="text-sm font-bold text-white">{Number(v).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
