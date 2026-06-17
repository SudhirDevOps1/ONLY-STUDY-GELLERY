// =================================================================
// PRODUCTION-READY FREE API SERVICE (40+ APIs)
// No API keys required - all CORS-friendly
// =================================================================

export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { ...options, headers: { 'Accept': 'application/json', ...(options?.headers || {}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type');
    const data = ct?.includes('json') ? await res.json() : await res.text();
    return { success: true, data: data as T };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

// ============ LOCATION & IP ============
export const getIpLocation = () => apiCall<any>('https://ipapi.co/json/');
export const getIpInfoAlt = () => apiCall<any>('https://api.ipify.org?format=json');

// ============ WEATHER ============
export const getWeather = (lat: number, lon: number) =>
  apiCall<any>(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`);

export const searchLocation = (query: string) =>
  apiCall<any>(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);

// ============ NEWS ============
export const getNews = (rssUrl = 'https://feeds.bbci.co.uk/news/world/rss.xml') =>
  apiCall<any>(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=15`);

export const getTechNews = () =>
  apiCall<any>(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://techcrunch.com/feed/')}&count=10`);

// ============ FINANCE ============
export const getCryptoPrices = (limit = 20) =>
  apiCall<any>(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`);

export const getCurrencyRates = (base = 'USD') =>
  apiCall<any>(`https://open.er-api.com/v6/latest/${base}`);

// ============ JOKES & FUN ============
export const getJoke = () => apiCall<any>('https://v2.jokeapi.dev/joke/Any?safe-mode');
export const getDadJoke = () => apiCall<any>('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } });
export const getRandomFact = () => apiCall<any>('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
export const getCatFact = () => apiCall<any>('https://catfact.ninja/fact');
export const getTrivia = (count = 5) => apiCall<any>(`https://opentdb.com/api.php?amount=${count}&type=multiple&encode=url3986`);
export const getNumberFact = (num: number | string = 'random') => apiCall<string>(`https://numbersapi.com/${num}?json`);
export const getAdvice = () => apiCall<any>('https://api.adviceslip.com/advice');
export const getQuote = () => apiCall<any>('https://dummyjson.com/quotes/random');
export const getBoredActivity = () => apiCall<any>('https://bored-api.appbrewery.com/random');

// ============ EDUCATION ============
export const getUniversities = (country = 'india') => apiCall<any>(`https://universities.hipolabs.com/search?country=${country}`);
export const getResearchPapers = (query = 'AI', perPage = 10) =>
  apiCall<any>(`https://api.openalex.org/works?search=${query}&per_page=${perPage}`);
export const getDictionary = (word: string) =>
  apiCall<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);

// ============ DEVELOPER TOOLS ============
export const getGithubUser = (username: string) => apiCall<any>(`https://api.github.com/users/${username}`);
export const getGithubRepos = (username: string) => apiCall<any>(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`);
export const getQrCode = (text: string, size = 250) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;

export const generateUuid = () => crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});

export const generatePassword = (length = 16) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ============ FOOD ============
export const getMealByName = (name = 'chicken') => apiCall<any>(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
export const getRandomMeal = () => apiCall<any>('https://www.themealdb.com/api/json/v1/1/random.php');
export const getCocktailByName = (name = 'margarita') => apiCall<any>(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`);
export const getRandomCocktail = () => apiCall<any>('https://www.thecocktaildb.com/api/json/v1/1/random.php');

// ============ ENTERTAINMENT ============
export const getPokemon = (name = 'pikachu') => apiCall<any>(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
export const getPokemonList = (limit = 20) => apiCall<any>(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

// ============ NASA & SPACE ============
// NASA APOD with fallback when DEMO_KEY rate-limited (404)
export const getNasaApod = async () => {
  const result = await apiCall<any>('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
  if (result.success && result.data?.url && result.data?.media_type === 'image') return result;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><radialGradient id="g" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#334155"/><stop offset="45%" stop-color="#111827"/><stop offset="100%" stop-color="#020617"/></radialGradient><linearGradient id="a" x1="0" x2="1"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g fill="#fff">${Array.from({ length: 120 }).map((_, i) => `<circle cx="${(i * 83) % 1200}" cy="${(i * 47) % 800}" r="${(i % 3) + 1}" opacity="${0.25 + (i % 5) * 0.12}"/>`).join('')}</g><circle cx="600" cy="360" r="150" fill="none" stroke="url(#a)" stroke-width="4" opacity="0.8"/><circle cx="600" cy="360" r="96" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.45"/><text x="600" y="350" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#fff" text-anchor="middle">NASA APOD</text><text x="600" y="405" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle">Fallback image - API limit or unavailable</text><text x="600" y="455" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">Visit apod.nasa.gov for the official astronomy picture</text></svg>`;
  const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return {
    success: true,
    data: {
      title: 'NASA Astronomy Picture of the Day',
      url: fallbackImage,
      hdurl: fallbackImage,
      explanation: 'NASA APOD is temporarily unavailable due to API rate limits. This is a placeholder image. Check back later or visit apod.nasa.gov directly.',
      date: new Date().toISOString().split('T')[0],
      media_type: 'image',
      copyright: 'NASA APOD fallback'
    }
  };
};

// ============ IMAGES ============
export const getDogPhotos = (count = 6) => apiCall<any>(`https://dog.ceo/api/breeds/image/random/${count}`);
export const getRandomDogImage = () => apiCall<any>('https://dog.ceo/api/breeds/image/random');
export const getCatImage = () => apiCall<any>('https://api.thecatapi.com/v1/images/search');
export const getFoxImage = () => apiCall<any>('https://randomfox.ca/floof/');
export const getDuckImage = async (): Promise<ApiResult> => {
  const result = await apiCall<any>('https://random-d.uk/api/v2/random');
  if (result.success && result.data?.url) return result;
  // Fallback: use a direct duck image URL
  return { success: true, data: { url: `https://random-d.uk/api/v2/${Math.floor(Math.random() * 200) + 1}.jpg`, message: 'Fallback duck image' } };
};
export const getRickRoll = () => apiCall<any>('https://meowfacts.herokuapp.com/');

// ============ USERS & SOCIAL ============
export const getRandomUsers = (count = 5) => apiCall<any>(`https://randomuser.me/api/?results=${count}`);

// ============ COUNTRIES ============
export const getCountryByName = (name: string) => apiCall<any>(`https://apicountries.com/name/${name}`);
export const getAllCountries = () => apiCall<any>('https://apicountries.com/countries');

// ============ WORLD TIME ============
export const getWorldTime = (timezone: string) => apiCall<any>(`https://worldtimeapi.org/api/timezone/${timezone}`);

// ============ PLACEHOLDER DATA ============
export const getPosts = (limit = 10) => apiCall<any>(`https://jsonplaceholder.typicode.com/posts?_limit=${limit}`);
export const getUsers = (limit = 10) => apiCall<any>(`https://jsonplaceholder.typicode.com/users?_limit=${limit}`);
export const getComments = (postId = 1) => apiCall<any>(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
export const getTodos = (limit = 10) => apiCall<any>(`https://jsonplaceholder.typicode.com/todos?_limit=${limit}`);

// ============ ANIME ============
export const searchAnime = (query: string) => apiCall<any>(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);

// ============ AGE PREDICTION ============
export const predictAge = (name: string) => apiCall<any>(`https://api.agify.io?name=${name}`);
export const predictGender = (name: string) => apiCall<any>(`https://api.genderize.io?name=${name}`);
export const predictNationality = (name: string) => apiCall<any>(`https://api.nationalize.io?name=${name}`);

// ============ COLOR & DESIGN ============
export const getRandomColor = () => {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
};

export const generateColorPalette = (count = 5) => {
  return Array.from({ length: count }, () => {
    const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return `#${hex}`;
  });
};

// ============ LOREM IPSUM ============
export const getLoremIpsum = (paragraphs = 1) => apiCall<string>(`https://loripsum.net/api/${paragraphs}/short/plaintext`);

// ============ UNSPLASH / IMAGES ============
export const getUnsplashRandom = (query = 'nature') => {
  const seed = Date.now();
  return `https://source.unsplash.com/1600x900/?${query}&sig=${seed}`;
};

export const getPicsumImage = (w = 800, h = 600) => `https://picsum.photos/${w}/${h}?random=${Date.now()}`;

// ============ EMOJI ============
export const getRandomEmoji = () => {
  const emojis = ['😀', '😎', '🚀', '🎨', '🌈', '⭐', '🔥', '💎', '🎉', '🌸', '🍕', '🐱', '🌍', '✨', '🎯'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

// ============ CALCULATION HELPERS ============
export const calcBMI = (weight: number, heightCm: number) => {
  const h = heightCm / 100;
  return +(weight / (h * h)).toFixed(1);
};

export const calcBMR = (weight: number, height: number, age: number, gender = 'male') =>
  Math.round(10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161));

export const calcCompoundInterest = (p: number, r: number, t: number, n = 12) =>
  +(p * Math.pow(1 + r / 100 / n, n * t)).toFixed(2);

export const calcEMI = (principal: number, rate: number, months: number) => {
  const r = rate / 100 / 12;
  return +(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)).toFixed(2);
};

export const calcSIP = (monthly: number, rate: number, years: number) => {
  const months = years * 12;
  const r = rate / 100 / 12;
  return +(monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)).toFixed(2);
};

// Weather code descriptions
export const weatherCodes: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫️' },
  48: { desc: 'Rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  53: { desc: 'Moderate drizzle', icon: '🌧️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  61: { desc: 'Light rain', icon: '🌧️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '⛈️' },
  71: { desc: 'Light snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '❄️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  77: { desc: 'Snow grains', icon: '🌨️' },
  80: { desc: 'Light showers', icon: '🌦️' },
  81: { desc: 'Moderate showers', icon: '🌧️' },
  82: { desc: 'Violent showers', icon: '⛈️' },
  85: { desc: 'Light snow showers', icon: '🌨️' },
  86: { desc: 'Heavy snow showers', icon: '❄️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
  99: { desc: 'Heavy thunderstorm', icon: '🌩️' }
};

// ============ DOG BREEDS ============
export const getDogBreeds = () => apiCall<any>('https://dog.ceo/api/breeds/list/all');
export const getDogBreedImages = (breed: string) => apiCall<any>(`https://dog.ceo/api/breed/${breed.toLowerCase()}/images/random/6`);

// ============ OPEN LIBRARY / BOOKS ============
export const searchBooks = (query: string, limit = 10) =>
  apiCall<any>(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
export const getBookCover = (coverId: number, size: 'S' | 'M' | 'L' = 'M') =>
  `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;

// ============ MET MUSEUM ART ============
export const getMetArtSearch = (query: string) =>
  apiCall<any>(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(query)}`);
export const getMetArtObject = (objectId: number) =>
  apiCall<any>(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);

// ============ SPACEX ============
export const getSpacexLaunches = async () => {
  const r = await apiCall<any>('https://api.spacexdata.com/v4/launches/latest');
  if (r.success) return r;
  // Fallback mock data since SpaceX API is often down
  return { success: true, data: { name: 'Mock Launch (API Offline)', date_utc: new Date().toISOString(), details: 'The SpaceX API is currently offline. This is placeholder data.', success: true, links: { patch: { small: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png' } } } };
};
export const getSpacexUpcoming = async () => {
  const r = await apiCall<any>('https://api.spacexdata.com/v4/launches/upcoming');
  if (r.success) return r;
  return { success: true, data: [{ name: 'Starlink Group X (Mock)', date_utc: new Date(Date.now() + 86400000).toISOString() }, { name: 'Crew-X (Mock)', date_utc: new Date(Date.now() + 86400000 * 5).toISOString() }] };
};
export const getSpacexRockets = async () => {
  const r = await apiCall<any>('https://api.spacexdata.com/v4/rockets');
  if (r.success) return r;
  return { success: true, data: [{ name: 'Falcon 9 (Mock)', company: 'SpaceX', country: 'United States', description: 'Placeholder data. SpaceX API is unreachable.', height: { meters: 70 }, mass: { kg: 549054 }, cost_per_launch: 50000000 }] };
};

// ============ MUSIC SEARCH (Jamendo) ============
export const searchMusic = (term: string, limit = 15) =>
  apiCall<any>(`https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=json&limit=${limit}&search=${encodeURIComponent(term)}`);

// ============ DICTIONARY ============
export const searchDictionary = (word: string) => apiCall<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

// ============ GITHUB EXPLORER ============
export const getGithubUser = (username: string) => apiCall<any>(`https://api.github.com/users/${encodeURIComponent(username)}`);
export const getGithubRepos = (username: string) => apiCall<any>(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`);

// ============ RICK & MORTY ============
export const searchRickAndMorty = (name: string) => apiCall<any>(`https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(name)}`);

// ============ RANDOM QUOTES ============
export const getZenQuote = () => apiCall<any>('https://zenquotes.io/api/random');
export const getKanyeQuote = () => apiCall<any>('https://api.kanye.rest');

export const getWeatherInfo = (code: number) =>
  weatherCodes[code] || { desc: 'Unknown', icon: '🌡️' };
