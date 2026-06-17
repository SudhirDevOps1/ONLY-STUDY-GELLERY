import React, { useEffect, useState, useCallback } from 'react';
import { SectionHeader, ApiToolCard, LoadingSpinner, StatBlock, ImagePreview } from './SectionBase';
import * as api from '../../utils/apis';
import { MediaItem } from '../../types';
import { copyToClipboard } from '../../utils/storage';
import { Copy, Check, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (name?: string) => {
    const query = (name || search).trim().toLowerCase();
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const r = await api.getPokemon(query);
      if (r.success && r.data?.id) {
        setPokemon(r.data);
      } else {
        setError(`Pokemon "${query}" not found. Try a valid name like pikachu, charizard, or a number like 25.`);
      }
    } catch {
      setError('Failed to fetch Pokemon. Check your connection.');
    }
    setLoading(false);
  };

  const loadRandom = async () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    setSearch(String(randomId));
    await load(String(randomId));
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
        <button onClick={() => load()} disabled={loading} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Searching...' : 'Search'}</button>
        <button onClick={loadRandom} disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-50" title="Random Pokemon">🎲</button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-rose-500 animate-spin" /></div>}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mb-6">
          <p className="text-red-300">⚠️ {error}</p>
        </div>
      )}

      {!loading && pokemon && !error && (
        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/30 rounded-3xl p-8 text-center">
          <img src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default} alt={pokemon.name} className="w-64 h-64 mx-auto object-contain mb-4" />
          <h2 className="text-3xl font-bold text-white capitalize mb-2">#{pokemon.id} {pokemon.name}</h2>
          <div className="flex gap-2 justify-center mb-6">
            {pokemon.types?.map((t: any, i: number) => <span key={i} className={`${typeColors[t.type.name] || 'bg-gray-500'} px-4 py-1 rounded-full text-sm font-bold text-white capitalize`}>{t.type.name}</span>)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBlock label="Height" value={`${pokemon.height / 10}m`} icon="📏" />
            <StatBlock label="Weight" value={`${pokemon.weight / 10}kg`} icon="⚖️" />
            <StatBlock label="HP" value={pokemon.stats?.[0]?.base_stat ?? '?'} icon="❤️" />
            <StatBlock label="Attack" value={pokemon.stats?.[1]?.base_stat ?? '?'} icon="⚔️" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <StatBlock label="Defense" value={pokemon.stats?.[2]?.base_stat ?? '?'} icon="🛡️" />
            <StatBlock label="Sp.Atk" value={pokemon.stats?.[3]?.base_stat ?? '?'} icon="✨" />
            <StatBlock label="Sp.Def" value={pokemon.stats?.[4]?.base_stat ?? '?'} icon="🔰" />
            <StatBlock label="Speed" value={pokemon.stats?.[5]?.base_stat ?? '?'} icon="⚡" />
            <StatBlock label="Exp" value={pokemon.base_experience ?? '?'} icon="📊" />
            <StatBlock label="Abilities" value={pokemon.abilities?.length ?? '?'} icon="💫" />
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
  const [loading, setLoading] = useState(false);

  const searchCountry = useCallback(async (searchName?: string) => {
    const query = (searchName || name).trim();
    if (!query) return;
    setLoading(true);
    try {
      const r = await api.getCountryByName(query);
      if (r.success && r.data?.[0]) setCountry(r.data[0]);
    } catch { /* ignore */ }
    setLoading(false);
  }, [name]);

  const loadAll = async () => {
    const r = await api.getAllCountries();
    if (r.success) setAllCountries(r.data || []);
  };

  useEffect(() => { searchCountry('India'); loadAll(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🌏" title="Country Explorer" description="Detailed info on all 250 countries (ApiCountries API)" />
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchCountry()} placeholder="Country name (e.g. India, USA, Japan)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={() => searchCountry()} disabled={loading} className="bg-lime-600 hover:bg-lime-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Searching...' : 'Search'}</button>
      </div>
      {country && (
        <div className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img src={country.flags?.png} alt="" className="w-24 h-16 object-cover rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold text-white">{country.name}</h2>
              <p className="text-sm text-gray-400">{country.nativeName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBlock label="Capital" value={country.capital || 'N/A'} icon="🏛️" />
            <StatBlock label="Population" value={country.population?.toLocaleString()} icon="👥" />
            <StatBlock label="Region" value={country.region} icon="🌍" />
            <StatBlock label="Currency" value={country.currencies?.[0]?.name || 'N/A'} icon="💰" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-3">All Countries</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allCountries.slice(0, 36).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((c, i) => (
          <button key={i} onClick={() => { setName(c.name); searchCountry(c.name); }} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-lime-500/50 transition-colors">
            <img src={c.flags?.png} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
            <p className="text-xs text-white font-medium truncate">{c.name}</p>
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

// ===== DOG BREEDS =====
export const DogBreedsSection: React.FC = () => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    const loadBreeds = async () => {
      setLoading(true);
      const r = await api.getDogBreeds();
      if (r.success && r.data?.message) {
        const breedList = Object.keys(r.data.message).sort();
        setBreeds(breedList);
        if (breedList.length > 0) {
          setSelectedBreed(breedList[0]);
          loadBreedImages(breedList[0]);
        }
      }
      setLoading(false);
    };
    loadBreeds();
  }, []);

  const loadBreedImages = async (breed: string) => {
    setImgLoading(true);
    const r = await api.getDogBreedImages(breed);
    if (r.success && r.data?.message) setImages(r.data.message);
    setImgLoading(false);
  };

  const handleBreedSelect = (breed: string) => {
    setSelectedBreed(breed);
    loadBreedImages(breed);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🐶" title="Dog Breeds Explorer" description="Browse all dog breeds with images (Dog CEO API)" />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="flex flex-wrap gap-2 mb-6 max-h-40 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
            {breeds.map(breed => (
              <button key={breed} onClick={() => handleBreedSelect(breed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${selectedBreed === breed ? 'bg-amber-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {breed}
              </button>
            ))}
          </div>
          <h3 className="text-lg font-bold text-white mb-4 capitalize">📸 {selectedBreed} Photos</h3>
          {imgLoading ? <LoadingSpinner text="Loading images..." /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {images.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors">
                  <img src={url} alt={`${selectedBreed} ${i + 1}`} className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          )}
          <button onClick={() => loadBreedImages(selectedBreed)} className="mt-4 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl font-medium">Load More Photos</button>
        </>
      )}
    </div>
  );
};

// ===== BOOKS (Open Library) =====
export const BooksSection: React.FC<CommonProps> = ({ onAddMedia }) => {
  const [query, setQuery] = useState('javascript');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const r = await api.searchBooks(query);
    if (r.success) setBooks(r.data?.docs || []);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="📚" title="Books Search" description="Search millions of books via Open Library API" />
      <div className="flex gap-2 mb-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search books (e.g. python, harry potter, science)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Searching...' : 'Search'}</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {books.slice(0, 15).map((book, i) => (
            <div key={i} className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl overflow-hidden hover:border-indigo-400/60 transition-colors">
              {book.cover_i ? (
                <img src={api.getBookCover(book.cover_i, 'M')} alt={book.title} className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-gray-800 flex items-center justify-center text-4xl">📖</div>
              )}
              <div className="p-3">
                <p className="text-sm font-bold text-white line-clamp-2">{book.title}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">✍️ {book.author_name?.[0] || 'Unknown'}</p>
                <p className="text-xs text-indigo-300 mt-1">📅 {book.first_publish_year || 'N/A'}</p>
                {book.cover_i && (
                  <button onClick={() => onAddMedia({ id: `book-${book.key}`, title: book.title, type: 'image', src: api.getBookCover(book.cover_i, 'L'), category: 'books', description: `By ${book.author_name?.[0] || 'Unknown'} (${book.first_publish_year || 'N/A'})` })}
                    className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded-lg text-xs">Add Cover to Gallery</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== ART GALLERY (Met Museum) =====
export const ArtGallerySection: React.FC<CommonProps> = ({ onAddMedia }) => {
  const [query, setQuery] = useState('sunflowers');
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await api.getMetArtSearch(query);
      if (r.success && r.data?.objectIDs) {
        const ids = r.data.objectIDs.slice(0, 12);
        const details = await Promise.all(ids.map((id: number) => api.getMetArtObject(id)));
        setArtworks(details.filter(d => d.success && d.data?.primaryImage).map(d => d.data));
      } else {
        setArtworks([]);
      }
    } catch { setArtworks([]); }
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🏛️" title="Art Gallery" description="Explore artwork from The Metropolitan Museum of Art (free API)" />
      <div className="flex gap-2 mb-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search art (e.g. monet, van gogh, landscape)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Searching...' : 'Search'}</button>
      </div>
      {loading ? <LoadingSpinner text="Loading artwork..." /> : artworks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No artwork found. Try another search term.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artworks.map((art, i) => (
            <div key={i} className="bg-violet-500/10 border border-violet-500/30 rounded-xl overflow-hidden hover:border-violet-400/60 transition-colors">
              <img src={art.primaryImageSmall || art.primaryImage} alt={art.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold text-white line-clamp-2">{art.title}</p>
                <p className="text-xs text-violet-300 mt-1 truncate">🎨 {art.artistDisplayName || 'Unknown Artist'}</p>
                <p className="text-xs text-gray-400 mt-1">{art.objectDate || 'Date unknown'} • {art.department}</p>
                <button onClick={() => onAddMedia({ id: `art-${art.objectID}`, title: art.title, type: 'image', src: art.primaryImage, category: 'art', description: `${art.artistDisplayName || 'Unknown'} - ${art.objectDate || ''}` })}
                  className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded-lg text-xs">Add to Gallery</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== SPACEX =====
export const SpaceXSection: React.FC = () => {
  const [latest, setLatest] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [rockets, setRockets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [l, u, r] = await Promise.all([api.getSpacexLaunches(), api.getSpacexUpcoming(), api.getSpacexRockets()]);
      if (l.success) setLatest(l.data);
      if (u.success) setUpcoming(Array.isArray(u.data) ? u.data.slice(0, 5) : []);
      if (r.success) setRockets(Array.isArray(r.data) ? r.data : []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🚀" title="SpaceX Explorer" description="Latest launches, upcoming missions, and rockets (SpaceX API)" />
      {loading ? <LoadingSpinner /> : (
        <>
          {/* Latest Launch */}
          {latest && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">🛰️ Latest Launch</h3>
              <div className="flex flex-col md:flex-row gap-4">
                {latest.links?.patch?.small && <img src={latest.links.patch.small} alt="" className="w-24 h-24 object-contain" />}
                <div className="flex-1">
                  <p className="text-xl font-bold text-white">{latest.name}</p>
                  <p className="text-sm text-gray-400 mt-1">📅 {new Date(latest.date_utc).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-3">{latest.details || 'No details available.'}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${latest.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {latest.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">📅 Upcoming Launches</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((launch, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm font-bold text-white">{launch.name}</p>
                    <p className="text-xs text-gray-400 mt-1">📅 {launch.date_utc ? new Date(launch.date_utc).toLocaleDateString() : 'TBD'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rockets */}
          {rockets.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">🚀 Rockets</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {rockets.map((rocket, i) => (
                  <div key={i} className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5">
                    {rocket.flickr_images?.[0] && <img src={rocket.flickr_images[0]} alt={rocket.name} className="w-full h-48 object-cover rounded-xl mb-3" />}
                    <p className="text-lg font-bold text-white">{rocket.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{rocket.company} • {rocket.country}</p>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-3">{rocket.description}</p>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <StatBlock label="Height" value={`${rocket.height?.meters || '?'}m`} icon="📏" />
                      <StatBlock label="Mass" value={`${rocket.mass?.kg ? (rocket.mass.kg / 1000).toFixed(0) + 't' : '?'}`} icon="⚖️" />
                      <StatBlock label="Cost" value={`$${rocket.cost_per_launch ? (rocket.cost_per_launch / 1e6).toFixed(0) + 'M' : '?'}`} icon="💰" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ===== MUSIC SEARCH (Jamendo) =====
export const MusicSearchSection: React.FC = () => {
  const [query, setQuery] = useState('rock');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const r = await api.searchMusic(query, 15);
    if (r.success) setResults(r.data?.results || []);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  const togglePlay = (previewUrl: string) => {
    if (playing === previewUrl) {
      setPlaying(null);
      document.querySelectorAll('audio').forEach(a => a.pause());
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
      setPlaying(previewUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🎵" title="Music Search" description="Search tracks and listen to previews (Jamendo API)" />
      <div className="flex gap-2 mb-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search music (e.g. Imagine Dragons, BTS, Arijit Singh)" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{loading ? 'Searching...' : 'Search'}</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((track, i) => (
            <div key={i} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 hover:border-green-400/60 transition-colors">
              <div className="flex items-center gap-3">
                <img src={track.image} alt="" className="w-16 h-16 rounded-lg flex-shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{track.name}</p>
                  <p className="text-xs text-gray-400 truncate">🎤 {track.artist_name}</p>
                  <p className="text-xs text-green-300 truncate">💿 {track.album_name}</p>
                </div>
              </div>
              {track.audio && (
                <div className="mt-3">
                  <button onClick={() => togglePlay(track.audio)} className={`w-full text-xs py-2 rounded-lg font-medium transition-colors ${playing === track.audio ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                    {playing === track.audio ? '⏹️ Stop Preview' : '▶️ Play Preview'}
                  </button>
                  {playing === track.audio && <audio src={track.audio} autoPlay onEnded={() => setPlaying(null)} />}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">⏱️ {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')} • {track.license_ccurl ? 'Creative Commons' : 'Copyrighted'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== DICTIONARY =====
export const DictionarySection: React.FC = () => {
  const [word, setWord] = useState('developer');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!word) return;
    setLoading(true);
    const r = await api.searchDictionary(word);
    if (r.success && Array.isArray(r.data)) setData(r.data[0]);
    else setData(null);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  const playAudio = (phonetics: any[]) => {
    const audioUrl = phonetics?.find(p => p.audio)?.audio;
    if (audioUrl) new Audio(audioUrl).play();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <SectionHeader icon="📖" title="Dictionary" description="Search word meanings, synonyms, and pronunciation" />
      <div className="flex gap-2 mb-6">
        <input value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search a word..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 rounded-xl font-medium">Search</button>
      </div>
      {loading ? <LoadingSpinner /> : data ? (
        <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">{data.word}</h2>
              <p className="text-fuchsia-400 mt-1">{data.phonetic}</p>
            </div>
            {data.phonetics?.some((p: any) => p.audio) && (
              <button onClick={() => playAudio(data.phonetics)} className="w-12 h-12 bg-fuchsia-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform">🔊</button>
            )}
          </div>
          {data.meanings?.map((m: any, i: number) => (
            <div key={i} className="mb-6 last:mb-0">
              <h3 className="text-lg font-bold text-white mb-2 italic border-b border-gray-700 pb-2">{m.partOfSpeech}</h3>
              <ul className="space-y-3 mt-3">
                {m.definitions?.slice(0, 3).map((d: any, j: number) => (
                  <li key={j} className="text-gray-300">
                    <span className="text-fuchsia-400 mr-2">•</span>{d.definition}
                    {d.example && <p className="text-sm text-gray-500 mt-1 ml-4">"{d.example}"</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : <p className="text-center text-gray-500 mt-8">Word not found or failed to load.</p>}
    </div>
  );
};

// ===== GITHUB EXPLORER =====
export const GithubSection: React.FC = () => {
  const [username, setUsername] = useState('octocat');
  const [user, setUser] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!username) return;
    setLoading(true);
    const [uRes, rRes] = await Promise.all([api.getGithubUser(username), api.getGithubRepos(username)]);
    if (uRes.success) setUser(uRes.data);
    else setUser(null);
    if (rRes.success) setRepos(rRes.data || []);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🐙" title="GitHub Explorer" description="Find GitHub users and their latest repositories" />
      <div className="flex gap-2 mb-6 max-w-2xl mx-auto">
        <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="GitHub username..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium">Search</button>
      </div>
      {loading ? <LoadingSpinner /> : user && user.login ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center">
            <img src={user.avatar_url} alt="" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-700" />
            <h2 className="text-2xl font-bold text-white">{user.name || user.login}</h2>
            <p className="text-gray-400">@{user.login}</p>
            <p className="text-sm text-gray-300 mt-4">{user.bio || 'No bio available'}</p>
            <div className="flex justify-center gap-4 mt-6 text-sm text-gray-400">
              <div><strong className="text-white text-lg">{user.followers}</strong><br/>Followers</div>
              <div><strong className="text-white text-lg">{user.following}</strong><br/>Following</div>
              <div><strong className="text-white text-lg">{user.public_repos}</strong><br/>Repos</div>
            </div>
            <a href={user.html_url} target="_blank" rel="noreferrer" className="inline-block w-full mt-6 bg-white text-black font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors">View Profile</a>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">Latest Repositories</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {repos.map((repo, i) => (
                <a href={repo.html_url} target="_blank" rel="noreferrer" key={i} className="bg-gray-800/30 border border-gray-700 hover:border-gray-500 rounded-xl p-4 transition-colors block">
                  <h4 className="text-lg font-bold text-blue-400 truncate">{repo.name}</h4>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{repo.description || 'No description'}</p>
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    {repo.language && <span>🟢 {repo.language}</span>}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : <p className="text-center text-gray-500 mt-8">User not found</p>}
    </div>
  );
};

// ===== RICK & MORTY =====
export const RickMortySection: React.FC = () => {
  const [name, setName] = useState('rick');
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    const r = await api.searchRickAndMorty(name || 'rick');
    if (r.success) setCharacters(r.data?.results || []);
    else setCharacters([]);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🛸" title="Rick and Morty" description="Search characters from the multiverse" />
      <div className="flex gap-2 mb-6 max-w-xl mx-auto">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Character name..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none" />
        <button onClick={search} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium">Search</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((c, i) => (
            <div key={i} className="flex bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:border-teal-500/50 transition-colors">
              <img src={c.image} alt={c.name} className="w-32 h-full object-cover" />
              <div className="p-4 flex-1">
                <h3 className="text-lg font-bold text-white leading-tight">{c.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${c.status === 'Alive' ? 'bg-green-500' : c.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-300 font-medium">{c.status} - {c.species}</span>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Last known location:</p>
                  <p className="text-sm text-white line-clamp-1">{c.location?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
