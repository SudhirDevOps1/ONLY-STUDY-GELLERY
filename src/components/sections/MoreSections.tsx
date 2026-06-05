import React, { useEffect, useState } from 'react';
import { SectionHeader, ApiToolCard, LoadingSpinner, StatBlock } from './SectionBase';
import * as api from '../../utils/apis';
import { MediaItem } from '../../types';
import { copyToClipboard } from '../../utils/storage';
import { Copy, Check } from 'lucide-react';

interface CommonProps {
  onAddMedia: (item: MediaItem) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

// ===== NEWS SECTION =====
export const NewsSection: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [tech, setTech] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [n, t] = await Promise.all([api.getNews(), api.getTechNews()]);
    if (n.success) setNews(n.data?.items || []);
    if (t.success) setTech(t.data?.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="📰" title="World News" description="Latest news from BBC and TechCrunch (via RSS)" />
      {loading ? <LoadingSpinner /> : (
        <>
          <h3 className="text-lg font-bold text-white mb-4">🌍 World News (BBC)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {news.slice(0, 9).map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors">
                {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <p className="text-sm font-semibold text-white line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3">{item.description?.replace(/<[^>]*>/g, '')}</p>
                  <p className="text-xs text-blue-400 mt-3">Read more →</p>
                </div>
              </a>
            ))}
          </div>

          <h3 className="text-lg font-bold text-white mb-4">💻 Tech News (TechCrunch)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tech.slice(0, 6).map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors">
                {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <p className="text-sm font-semibold text-white line-clamp-2">{item.title}</p>
                  <p className="text-xs text-purple-400 mt-3">Read more →</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ===== EDUCATION =====
export const EducationSection: React.FC = () => {
  const [unis, setUnis] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [word, setWord] = useState('hello');
  const [definition, setDefinition] = useState<any>(null);
  const [country, setCountry] = useState('india');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [u, p] = await Promise.all([api.getUniversities(country), api.getResearchPapers('Machine Learning', 10)]);
    if (u.success) setUnis((u.data || []).slice(0, 12));
    if (p.success) setPapers(p.data?.results || []);
    setLoading(false);
  };

  const lookupWord = async () => {
    const result = await api.getDictionary(word);
    if (result.success) setDefinition(result.data);
  };

  useEffect(() => { load(); lookupWord(); }, [country]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🎓" title="Education Dashboard" description="Universities, research papers & dictionary lookup" />

      {/* Dictionary */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-3">📖 Dictionary Lookup</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupWord()}
            placeholder="Enter word..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
          />
          <button onClick={lookupWord} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium">Search</button>
        </div>
        {definition?.[0] && (
          <div>
            <p className="text-2xl font-bold text-white">{definition[0].word}</p>
            <p className="text-sm text-purple-300 italic">{definition[0].phonetic}</p>
            {definition[0].meanings?.slice(0, 2).map((m: any, i: number) => (
              <div key={i} className="mt-3">
                <p className="text-sm text-purple-400 font-semibold">{m.partOfSpeech}</p>
                {m.definitions?.slice(0, 2).map((d: any, j: number) => (
                  <p key={j} className="text-sm text-gray-300 ml-3">• {d.definition}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Universities */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">🏫 Universities</h3>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none">
                <option value="india">India</option><option value="united states">USA</option><option value="united kingdom">UK</option><option value="canada">Canada</option><option value="australia">Australia</option>
              </select>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {unis.map((u, i) => (
                <a key={i} href={u.web_pages?.[0]} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-blue-500/50 transition-colors">
                  <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.country}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Papers */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">📄 Research Papers</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {papers.map((p, i) => (
                <a key={i} href={p.doi || p.id} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                  <p className="text-sm font-semibold text-white line-clamp-2">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-2">📊 {p.cited_by_count || 0} citations • 📅 {p.publication_year}</p>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== DEVELOPER =====
export const DeveloperSection: React.FC = () => {
  const [uuid, setUuid] = useState(api.generateUuid());
  const [password, setPassword] = useState(api.generatePassword(20));
  const [pwLength, setPwLength] = useState(20);
  const [qrText, setQrText] = useState('https://example.com');
  const [githubUser, setGithubUser] = useState('torvalds');
  const [githubData, setGithubData] = useState<any>(null);
  const [copied, setCopied] = useState('');

  const copy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const loadGithub = async () => {
    const r = await api.getGithubUser(githubUser);
    if (r.success) setGithubData(r.data);
  };

  useEffect(() => { loadGithub(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="💻" title="Developer Tools" description="QR codes, UUIDs, passwords, GitHub lookup & more" />

      <div className="grid gap-4 md:grid-cols-2">
        {/* QR Generator */}
        <ApiToolCard icon="🔲" title="QR Code Generator" color="cyan">
          <input
            type="text"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="Enter URL or text..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none mb-3 text-sm"
          />
          <div className="flex justify-center mb-3">
            <img src={api.getQrCode(qrText)} alt="QR" className="rounded-lg" />
          </div>
          <a href={api.getQrCode(qrText, 500)} download="qrcode.png" className="block text-center text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg">Download QR</a>
        </ApiToolCard>

        {/* UUID */}
        <ApiToolCard icon="🆔" title="UUID Generator" onRefresh={() => setUuid(api.generateUuid())} color="purple">
          <div className="bg-black/30 rounded-lg p-4 mb-3 font-mono text-sm text-purple-300 break-all">{uuid}</div>
          <button onClick={() => copy(uuid, 'uuid')} className="w-full flex items-center justify-center gap-2 text-xs bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg">
            {copied === 'uuid' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'uuid' ? 'Copied!' : 'Copy UUID'}
          </button>
        </ApiToolCard>

        {/* Password */}
        <ApiToolCard icon="🔐" title="Password Generator" onRefresh={() => setPassword(api.generatePassword(pwLength))} color="green">
          <div className="bg-black/30 rounded-lg p-4 mb-3 font-mono text-sm text-green-300 break-all">{password}</div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-gray-400">Length: {pwLength}</label>
            <input type="range" min="8" max="32" value={pwLength} onChange={(e) => { setPwLength(+e.target.value); setPassword(api.generatePassword(+e.target.value)); }} className="flex-1" />
          </div>
          <button onClick={() => copy(password, 'pw')} className="w-full flex items-center justify-center gap-2 text-xs bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg">
            {copied === 'pw' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'pw' ? 'Copied!' : 'Copy Password'}
          </button>
        </ApiToolCard>

        {/* GitHub */}
        <ApiToolCard icon="🐙" title="GitHub User Lookup" color="yellow">
          <div className="flex gap-2 mb-3">
            <input value={githubUser} onChange={(e) => setGithubUser(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadGithub()} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="GitHub username" />
            <button onClick={loadGithub} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">Search</button>
          </div>
          {githubData && (
            <div className="flex items-center gap-3">
              <img src={githubData.avatar_url} alt="" className="w-16 h-16 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">{githubData.name || githubData.login}</p>
                <p className="text-xs text-gray-400 truncate">{githubData.bio}</p>
                <p className="text-xs text-yellow-400 mt-1">📦 {githubData.public_repos} repos • 👥 {githubData.followers} followers</p>
              </div>
            </div>
          )}
        </ApiToolCard>
      </div>
    </div>
  );
};

// ===== FOOD =====
export const FoodSection: React.FC<CommonProps> = ({ onAddMedia }) => {
  const [meal, setMeal] = useState<any>(null);
  const [cocktail, setCocktail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mealSearch, setMealSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [m, c] = await Promise.all([api.getRandomMeal(), api.getRandomCocktail()]);
    if (m.success) setMeal(m.data?.meals?.[0]);
    if (c.success) setCocktail(c.data?.drinks?.[0]);
    setLoading(false);
  };

  const search = async () => {
    if (!mealSearch.trim()) return;
    const r = await api.getMealByName(mealSearch);
    if (r.success && r.data?.meals?.[0]) setMeal(r.data.meals[0]);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="max-w-6xl mx-auto p-4 md:p-8"><SectionHeader icon="🍕" title="Food & Drinks" description="" /><LoadingSpinner /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🍕" title="Food & Drinks" description="Recipes from TheMealDB and TheCocktailDB" />

      <div className="flex gap-2 mb-6">
        <input value={mealSearch} onChange={(e) => setMealSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search recipe (e.g. pasta, curry, biryani)..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-medium">Search</button>
        <button onClick={() => api.getRandomMeal().then(r => r.success && setMeal(r.data?.meals?.[0]))} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium">Random</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {meal && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl overflow-hidden">
            <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-64 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-1">{meal.strMeal}</h3>
              <p className="text-xs text-amber-300 mb-3">🌍 {meal.strArea} • 🍽️ {meal.strCategory}</p>
              <p className="text-sm text-gray-300 line-clamp-4 mb-3">{meal.strInstructions}</p>
              <div className="flex gap-2">
                <button onClick={() => onAddMedia({ id: `meal-${Date.now()}`, title: meal.strMeal, type: 'image', src: meal.strMealThumb, category: 'food', description: meal.strInstructions?.substring(0, 200) })} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm">Add to Gallery</button>
                {meal.strYoutube && <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer" className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm text-center">Watch Video</a>}
              </div>
            </div>
          </div>
        )}

        {cocktail && (
          <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl overflow-hidden">
            <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} className="w-full h-64 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold text-white mb-1">{cocktail.strDrink}</h3>
              <p className="text-xs text-pink-300 mb-3">🥂 {cocktail.strAlcoholic} • 🍹 {cocktail.strCategory}</p>
              <p className="text-sm text-gray-300 line-clamp-4 mb-3">{cocktail.strInstructions}</p>
              <button onClick={() => onAddMedia({ id: `cocktail-${Date.now()}`, title: cocktail.strDrink, type: 'image', src: cocktail.strDrinkThumb, category: 'food', description: cocktail.strInstructions })} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm">Add to Gallery</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== POKEMON =====
export const PokemonSection: React.FC = () => {
  const [pokemon, setPokemon] = useState<any>(null);
  const [search, setSearch] = useState('pikachu');

  const load = async () => {
    const r = await api.getPokemon(search);
    if (r.success) setPokemon(r.data);
  };

  useEffect(() => { load(); }, []);

  const typeColors: Record<string, string> = {
    fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500', electric: 'bg-yellow-500',
    psychic: 'bg-pink-500', ice: 'bg-cyan-500', dragon: 'bg-purple-500', dark: 'bg-gray-700',
    fairy: 'bg-pink-300', normal: 'bg-gray-400', fighting: 'bg-red-700', poison: 'bg-purple-600',
    ground: 'bg-yellow-700', flying: 'bg-indigo-400', bug: 'bg-lime-500', rock: 'bg-yellow-800',
    ghost: 'bg-purple-700', steel: 'bg-gray-500'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🎮" title="Pokemon Database" description="Search any of 1000+ Pokemon (powered by PokeAPI)" />

      <div className="flex gap-2 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Pokemon name (e.g. charizard, mewtwo, eevee)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={load} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-medium">Search</button>
      </div>

      {pokemon && (
        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/30 rounded-3xl p-8 text-center">
          <img src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default} alt={pokemon.name} className="w-64 h-64 mx-auto object-contain mb-4" />
          <h2 className="text-3xl font-bold text-white capitalize mb-2">#{pokemon.id} {pokemon.name}</h2>
          <div className="flex gap-2 justify-center mb-6">
            {pokemon.types.map((t: any, i: number) => <span key={i} className={`${typeColors[t.type.name] || 'bg-gray-500'} px-4 py-1 rounded-full text-sm font-bold text-white capitalize`}>{t.type.name}</span>)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBlock label="Height" value={`${pokemon.height / 10}m`} icon="📏" />
            <StatBlock label="Weight" value={`${pokemon.weight / 10}kg`} icon="⚖️" />
            <StatBlock label="HP" value={pokemon.stats[0].base_stat} icon="❤️" />
            <StatBlock label="Attack" value={pokemon.stats[1].base_stat} icon="⚔️" />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Wellness =====
export const WellnessSection: React.FC = () => {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');

  const bmi = api.calcBMI(+weight, +height);
  const bmiCat = bmi < 18.5 ? { text: 'Underweight', color: 'text-yellow-400' } : bmi < 25 ? { text: 'Normal', color: 'text-green-400' } : bmi < 30 ? { text: 'Overweight', color: 'text-orange-400' } : { text: 'Obese', color: 'text-red-400' };
  const bmr = api.calcBMR(+weight, +height, +age, gender);
  const water = (+weight * 0.033).toFixed(2);
  const tdeeSed = Math.round(bmr * 1.2);
  const tdeeAct = Math.round(bmr * 1.55);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <SectionHeader icon="❤️" title="Wellness Dashboard" description="Health calculators - BMI, BMR, water intake, calorie needs" />

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Enter Your Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-xs text-gray-400">Weight (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1 outline-none" /></div>
          <div><label className="text-xs text-gray-400">Height (cm)</label><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1 outline-none" /></div>
          <div><label className="text-xs text-gray-400">Age</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1 outline-none" /></div>
          <div><label className="text-xs text-gray-400">Gender</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white mt-1 outline-none"><option value="male">Male</option><option value="female">Female</option></select></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5 text-center">
          <p className="text-xs uppercase text-gray-400 mb-2">BMI</p>
          <p className="text-4xl font-bold text-white">{bmi}</p>
          <p className={`text-sm font-semibold mt-2 ${bmiCat.color}`}>{bmiCat.text}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
          <p className="text-xs uppercase text-gray-400 mb-2">BMR</p>
          <p className="text-4xl font-bold text-white">{bmr}</p>
          <p className="text-sm text-gray-400 mt-2">kcal/day at rest</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-5 text-center">
          <p className="text-xs uppercase text-gray-400 mb-2">Water</p>
          <p className="text-4xl font-bold text-white">{water}</p>
          <p className="text-sm text-gray-400 mt-2">liters/day</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
          <p className="text-xs uppercase text-gray-400 mb-2">TDEE</p>
          <p className="text-2xl font-bold text-white">{tdeeSed}-{tdeeAct}</p>
          <p className="text-sm text-gray-400 mt-2">kcal range</p>
        </div>
      </div>
    </div>
  );
};

// ===== WORLD CLOCK =====
export const WorldSection: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cities = [
    { tz: 'Asia/Kolkata', label: 'New Delhi', flag: '🇮🇳' },
    { tz: 'America/New_York', label: 'New York', flag: '🇺🇸' },
    { tz: 'Europe/London', label: 'London', flag: '🇬🇧' },
    { tz: 'Asia/Tokyo', label: 'Tokyo', flag: '🇯🇵' },
    { tz: 'Europe/Paris', label: 'Paris', flag: '🇫🇷' },
    { tz: 'Asia/Dubai', label: 'Dubai', flag: '🇦🇪' },
    { tz: 'Australia/Sydney', label: 'Sydney', flag: '🇦🇺' },
    { tz: 'America/Los_Angeles', label: 'LA', flag: '🌴' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🌍" title="World Clock" description="Live time across major cities worldwide" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map(c => (
          <div key={c.tz} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">{c.flag}</div>
            <p className="text-xs uppercase text-gray-400 tracking-widest">{c.label}</p>
            <p className="text-3xl font-bold text-white font-mono mt-2">{time.toLocaleTimeString('en-US', { timeZone: c.tz, hour12: false })}</p>
            <p className="text-xs text-gray-400 mt-1">{time.toLocaleDateString('en-US', { timeZone: c.tz, weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== SOCIAL =====
export const SocialSection: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api.getRandomUsers(8);
    if (r.success) setUsers(r.data?.results || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="👥" title="Random Users" description="Generate fake user profiles for testing (RandomUser.me)" />
      <button onClick={load} className="mb-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded-xl">Generate New Users</button>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {users.map((u, i) => (
            <div key={i} className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl p-5 text-center">
              <img src={u.picture.large} alt="" className="w-24 h-24 rounded-full mx-auto mb-3" />
              <p className="font-bold text-white">{u.name.first} {u.name.last}</p>
              <p className="text-xs text-gray-400 mt-1">📧 {u.email}</p>
              <p className="text-xs text-gray-400">📞 {u.phone}</p>
              <p className="text-xs text-fuchsia-300 mt-2">📍 {u.location.city}, {u.location.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== NAME PREDICTOR =====
export const NamePredictorSection: React.FC = () => {
  const [name, setName] = useState('Alex');
  const [results, setResults] = useState<any>(null);

  const predict = async () => {
    if (!name.trim()) return;
    const [age, gender, nat] = await Promise.all([api.predictAge(name), api.predictGender(name), api.predictNationality(name)]);
    setResults({
      age: age.data,
      gender: gender.data,
      nationality: nat.data,
    });
  };

  useEffect(() => { predict(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🔮" title="Name Predictor" description="Predict age, gender, and nationality from name (Agify/Genderize/Nationalize APIs)" />
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && predict()} placeholder="Enter a name..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={predict} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl">Predict</button>
      </div>
      {results && (
        <div className="grid gap-4 md:grid-cols-3">
          <ApiToolCard icon="🎂" title="Age Prediction" color="blue">
            <p className="text-4xl font-bold text-white text-center">{results.age?.age || '?'}</p>
            <p className="text-xs text-gray-400 text-center mt-2">Based on {results.age?.count || 0} samples</p>
          </ApiToolCard>
          <ApiToolCard icon="⚧" title="Gender Prediction" color="pink">
            <p className="text-2xl font-bold text-white text-center capitalize">{results.gender?.gender || '?'}</p>
            <p className="text-xs text-gray-400 text-center mt-2">Probability: {((results.gender?.probability || 0) * 100).toFixed(1)}%</p>
          </ApiToolCard>
          <ApiToolCard icon="🌍" title="Nationality" color="green">
            <div className="space-y-2">
              {results.nationality?.country?.slice(0, 3).map((c: any, i: number) => (
                <div key={i} className="flex justify-between"><span className="text-white">{c.country_id}</span><span className="text-green-400">{(c.probability * 100).toFixed(1)}%</span></div>
              ))}
            </div>
          </ApiToolCard>
        </div>
      )}
    </div>
  );
};

// ===== ANIME =====
export const AnimeSection: React.FC<CommonProps> = ({ onAddMedia }) => {
  const [query, setQuery] = useState('naruto');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    const r = await api.searchAnime(query);
    if (r.success) setResults(r.data?.data || []);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🎌" title="Anime Database" description="Search anime via Jikan API (MyAnimeList)" />
      <div className="flex gap-2 mb-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search anime..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl">Search</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {results.map((a, i) => (
            <div key={i} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-colors">
              <img src={a.images?.jpg?.image_url} alt={a.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold text-white line-clamp-1">{a.title}</p>
                <p className="text-xs text-gray-400 mt-1">⭐ {a.score || 'N/A'} • 📺 {a.episodes || '?'} eps</p>
                <button onClick={() => onAddMedia({ id: `anime-${a.mal_id}`, title: a.title, type: 'image', src: a.images?.jpg?.large_image_url, category: 'anime', description: a.synopsis?.substring(0, 200) })} className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white py-1.5 rounded-lg text-xs">Add to Gallery</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== COUNTRIES =====
export const CountriesSection: React.FC = () => {
  const [name, setName] = useState('India');
  const [country, setCountry] = useState<any>(null);
  const [allCountries, setAllCountries] = useState<any[]>([]);

  const search = async () => {
    const r = await api.getCountryByName(name);
    if (r.success) setCountry(r.data?.[0]);
  };

  const loadAll = async () => {
    const r = await api.getAllCountries();
    if (r.success) setAllCountries(r.data || []);
  };

  useEffect(() => { search(); loadAll(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🌏" title="Country Explorer" description="Detailed info on all 250 countries (RestCountries API)" />
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Country name (e.g. India, USA, Japan)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-lime-600 hover:bg-lime-500 text-white px-6 py-3 rounded-xl">Search</button>
      </div>
      {country && (
        <div className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img src={country.flags.png} alt="" className="w-24 h-16 object-cover rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold text-white">{country.name.common}</h2>
              <p className="text-sm text-gray-400">{country.name.official}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBlock label="Capital" value={country.capital?.[0] || 'N/A'} icon="🏛️" />
            <StatBlock label="Population" value={country.population?.toLocaleString()} icon="👥" />
            <StatBlock label="Region" value={country.region} icon="🌍" />
            <StatBlock label="Currency" value={Object.keys(country.currencies || {})[0] || 'N/A'} icon="💰" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-3">All Countries</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allCountries.slice(0, 36).sort((a, b) => a.name.common.localeCompare(b.name.common)).map((c, i) => (
          <button key={i} onClick={() => { setName(c.name.common); search(); }} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-lime-500/50 transition-colors">
            <img src={c.flags.png} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
            <p className="text-xs text-white font-medium truncate">{c.name.common}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== READING/POSTS =====
export const ReadingSection: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [lorem, setLorem] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, l] = await Promise.all([api.getPosts(10), api.getLoremIpsum(3)]);
    if (p.success) setPosts(p.data || []);
    if (l.success) setLorem(l.data || '');
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <SectionHeader icon="📖" title="Reading Material" description="Sample posts and Lorem Ipsum text for testing" />
      {loading ? <LoadingSpinner /> : (
        <>
          <h3 className="text-lg font-bold text-white mb-3">📝 Lorem Ipsum (3 paragraphs)</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{lorem}</p>
            <button onClick={() => copyToClipboard(lorem)} className="mt-3 text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">Copy</button>
          </div>
          <h3 className="text-lg font-bold text-white mb-3">📰 Sample Posts (JSONPlaceholder)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {posts.map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-bold text-white mb-2 capitalize">{p.title}</p>
                <p className="text-xs text-gray-400 line-clamp-3">{p.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ===== COLORS =====
export const ColorSection: React.FC = () => {
  const [palette, setPalette] = useState(api.generateColorPalette(5));
  const [copied, setCopied] = useState('');

  const copy = async (color: string) => {
    await copyToClipboard(color);
    setCopied(color);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🎨" title="Color Palette Generator" description="Generate random color palettes for design inspiration" />
      <button onClick={() => setPalette(api.generateColorPalette(5))} className="mb-6 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium">Generate New Palette</button>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {palette.map((color, i) => (
          <button key={i} onClick={() => copy(color)} className="rounded-2xl overflow-hidden hover:scale-105 transition-transform">
            <div style={{ background: color }} className="h-32"></div>
            <div className="bg-gray-900 p-3 text-center">
              <p className="text-white font-mono text-sm font-bold">{color.toUpperCase()}</p>
              <p className="text-xs text-gray-400 mt-1">{copied === color ? '✅ Copied!' : 'Click to copy'}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
