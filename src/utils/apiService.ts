export interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  description: string;
  city: string;
  country: string;
  icon: string;
  source: 'location' | 'ip';
}

export interface IpData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  org: string;
}

export interface JokeData {
  setup?: string;
  punchline?: string;
  joke?: string;
}

export interface NasaData {
  title: string;
  explanation: string;
  url: string;
  hdurl: string;
  media_type: string;
  date: string;
}

export interface UnsplashData {
  url: string;
  thumb: string;
  author: string;
  description: string;
  link: string;
}

// Get weather by coordinates
export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  );
  const data = await res.json();
  const codes: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 95: 'Thunderstorm'
  };
  const code = data.current?.weather_code ?? 0;
  const weatherDesc = codes[code] || 'Unknown';
  const weatherIcons: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️', 80: '🌦️', 95: '⛈️'
  };
  return {
    temp: data.current?.temperature_2m ?? 0,
    humidity: data.current?.relative_humidity_2m ?? 0,
    wind: data.current?.wind_speed_10m ?? 0,
    description: weatherDesc,
    city: '',
    country: '',
    icon: weatherIcons[code] || '🌡️',
    source: 'location'
  };
}

// Get IP-based location + weather
export async function getIpAndWeather(): Promise<{ ip: IpData; weather: WeatherData }> {
  const ipRes = await fetch('https://ipapi.co/json/');
  const ip = await ipRes.json();
  const weather = await getWeatherByCoords(ip.latitude, ip.longitude);
  weather.city = ip.city || 'Unknown';
  weather.country = ip.country_name || '';
  weather.source = 'ip';
  return {
    ip: {
      ip: ip.ip,
      city: ip.city,
      region: ip.region,
      country: ip.country_name,
      latitude: ip.latitude,
      longitude: ip.longitude,
      org: ip.org
    },
    weather
  };
}

// Get user location
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}

// English joke
export async function getEnglishJoke(): Promise<JokeData> {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke');
    return await res.json();
  } catch {
    return { joke: 'Why did the developer go broke? Because he used up all his cache.' };
  }
}

// Hindi jokes pool
const hindiJokes = [
  { q: 'Teacher: Tumhara homework kahan hai?', a: 'Student: Sir, homework to kiya tha par notebook ne privacy policy accept nahi ki!' },
  { q: 'Papa: Beta, kya banoge bade hokar?', a: 'Beta: Papa, vlogger. Khana khaunga, ghoomunga, aur log dekhenge.' },
  { q: 'Doctor: Aapko rest ki zarurat hai.', a: 'Patient: Doctor sahab, ye baat mere boss ko PDF mein bhej do.' },
  { q: 'WiFi slow ho to kya karein?', a: 'Sabse pehle router nahi, apni expectations restart karo!' },
  { q: 'Interviewer: Aapki weakness kya hai?', a: 'Candidate: Main bahut honest hoon. Interviewer: Ye to weakness nahi hai. Candidate: Mujhe aapki opinion se koi fark nahi padta.' },
  { q: 'Biwi: Mujhe aur mummy mein se kisko chuna hai?', a: 'Pati: Aankhen band karke soch raha hai, ab ambulance kisko bulaye!' },
  { q: 'Pappu: Main multitasking karta hoon!', a: 'Dost: Kaise? Pappu: Ek saath bhookha bhi rehta hoon aur kaam bhi nahi karta.' },
  { q: 'Teacher: Paani ka chemical formula batao.', a: 'Student: H₂O. Teacher: Sahi! Teacher: Aur sharab ka? Student: H₂O too!' },
];
export function getHindiJoke() {
  return hindiJokes[Math.floor(Math.random() * hindiJokes.length)];
}

// NASA APOD
export async function getNasaApod(): Promise<NasaData> {
  const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
  return await res.json();
}

// Unsplash random photo
export async function getUnsplashPhoto(query: string = 'nature'): Promise<UnsplashData> {
  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=demo`);
    const data = await res.json();
    return {
      url: data.urls?.regular || `https://source.unsplash.com/1600x900/?${query}`,
      thumb: data.urls?.small || `https://source.unsplash.com/400x300/?${query}`,
      author: data.user?.name || 'Unsplash',
      description: data.alt_description || query,
      link: data.links?.html || 'https://unsplash.com'
    };
  } catch {
    return {
      url: `https://source.unsplash.com/1600x900/?${query}`,
      thumb: `https://source.unsplash.com/400x300/?${query}`,
      author: 'Unsplash',
      description: query,
      link: 'https://unsplash.com'
    };
  }
}

// Random wallpaper from picsum
export function getRandomWallpaper(): string {
  return `https://picsum.photos/1600/900?random=${Date.now()}`;
}

// GIPHY search
export async function searchGiphy(query: string, limit: number = 6): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
    );
    const data = await res.json();
    return data.data?.map((g: any) => g.images?.original?.url).filter(Boolean) || [];
  } catch {
    return ['https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'];
  }
}
