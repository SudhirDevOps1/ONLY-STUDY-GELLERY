export interface ToolResult {
  title: string;
  icon: string;
  data: any;
  raw?: any;
}

// =================== FREE API SERVICES ===================

// 1. IP Location
export async function fetchIpLocation() {
  const res = await fetch('https://ipapi.co/json/');
  return res.json();
}

// 2. Currency Converter
export async function fetchCurrency() {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  return res.json();
}

// 3. News (RSS via RSS2JSON)
export async function fetchNews() {
  const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
  return res.json();
}

// 4. Random User
export async function fetchRandomUser(count = 3) {
  const res = await fetch(`https://randomuser.me/api/?results=${count}`);
  return res.json();
}

// 5. Color Palette (Coolors)
export async function fetchColorPalette() {
  const res = await fetch('https://coolors.co/generate/json');
  return res.json();
}

// 6. Universities
export async function fetchUniversities(country = 'india') {
  const res = await fetch(`http://universities.hipolabs.com/search?country=${country}`);
  return res.json();
}

// 7. Research Papers (OpenAlex)
export async function fetchResearchPapers(query = 'AI', perPage = 10) {
  const res = await fetch(`https://api.openalex.org/works?search=${query}&per_page=${perPage}`);
  return res.json();
}

// 8. Dictionary
export async function fetchDictionary(word: string) {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  return res.json();
}

// 9. Trivia
export async function fetchTrivia(amount = 5) {
  const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
  return res.json();
}

// 10. NASA APOD
export async function fetchNasaApod() {
  const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
  return res.json();
}

// 11. Dog Photos
export async function fetchDogPhotos(count = 6) {
  const res = await fetch(`https://dog.ceo/api/breeds/image/random/${count}`);
  return res.json();
}

// 12. Cat Facts
export async function fetchCatFacts(count = 3) {
  const res = await fetch(`https://catfact.ninja/facts?limit=${count}`);
  return res.json();
}

// 13. Weather
export async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
  );
  return res.json();
}

// 14. Location Search (Nominatim)
export async function fetchLocationSearch(query: string) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
  return res.json();
}

// 15. Country Info
export async function fetchCountryInfo(name: string) {
  const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`);
  return res.json();
}

// 16. GitHub User
export async function fetchGithubUser(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  return res.json();
}

// 17. Crypto Prices
export async function fetchCryptoPrices() {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1');
  return res.json();
}

// 18. Stock Market (Yahoo Finance via proxy)
export async function fetchStockInfo(symbol = 'AAPL') {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    return res.json();
  } catch {
    return null;
  }
}

// 19. Timezone
export async function fetchTimezone(lat: number, lon: number) {
  const res = await fetch(`https://timeapi.io/api/timezone/zone?latitude=${lat}&longitude=${lon}`);
  return res.json();
}

// 20. QR Code Generator
export function getQrCodeUrl(text: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

// 21. UUID Generator
export function generateUuid() {
  return crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// 22. Lorem Ipsum
export async function fetchLoremIpsum(sentences = 3) {
  const res = await fetch(`https://loripsum.net/api/${sentences}/short/plaintext`);
  return res.text();
}

// 23. Password Generator
export function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 24. World Time
export async function fetchWorldTime(timezone = 'Asia/Kolkata') {
  const res = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
  return res.json();
}

// 25. IP Geolocation (Alternative)
export async function fetchIpInfo() {
  const res = await fetch('https://ipinfo.io/json');
  return res.json();
}

// 26. Exchange Rate
export async function fetchExchangeRate(from = 'USD', to = 'INR') {
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  const data = await res.json();
  return data.rates[to];
}

// 27. Random Quote
export async function fetchRandomQuote() {
  const res = await fetch('https://api.quotable.io/random');
  return res.json();
}

// 28. Joke API
export async function fetchJoke() {
  const res = await fetch('https://v2.jokeapi.dev/joke/Any?safe');
  return res.json();
}

// 29. Bored Activity
export async function fetchBoredActivity() {
  const res = await fetch('https://bored-api.appbrewery.com/random');
  return res.json();
}

// 30. Pokemon
export async function fetchPokemon(name = 'pikachu') {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
  return res.json();
}

// 31. Cocktail Recipe
export async function fetchCocktail(name = 'margarita') {
  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`);
  return res.json();
}

// 32. Meal Recipe
export async function fetchMeal(name = 'chicken') {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
  return res.json();
}

// 33. Number Facts
export async function fetchNumberFact(num = 42) {
  const res = await fetch(`https://numbersapi.com/${num}`);
  return res.text();
}

// 34. HTTP Status
export async function fetchHttpStatus(code = 200) {
  try {
    const res = await fetch(`https://httpstatuses.io/${code}`);
    return res.status === 200 ? 'OK' : `Status: ${res.status}`;
  } catch {
    return 'Network error';
  }
}

// 35. JSON Placeholder Posts
export async function fetchPosts(count = 5) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${count}`);
  return res.json();
}

// 36. JSON Placeholder Users
export async function fetchUsers(count = 5) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users?_limit=${count}`);
  return res.json();
}

// 37. JSON Placeholder Comments
export async function fetchComments(postId = 1) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
  return res.json();
}

// 38. Advice Slip
export async function fetchAdvice() {
  const res = await fetch('https://api.adviceslip.com/advice');
  return res.json();
}

// 39. Dad Jokes
export async function fetchDadJoke() {
  const res = await fetch('https://icanhazdadjoke.com/', {
    headers: { 'Accept': 'application/json' }
  });
  return res.json();
}

// 40. Useless Facts
export async function fetchUselessFact() {
  try {
    const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
    return res.json();
  } catch {
    return { text: 'Did you know? Honey never spoils. Archaeologists have found 3000-year-old honey that is still edible.' };
  }
}
