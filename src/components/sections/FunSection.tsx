import React, { useEffect, useState } from 'react';
import { SectionHeader, ApiToolCard } from './SectionBase';
import * as api from '../../utils/apis';

export const FunSection: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const load = async (key: string, fn: () => Promise<any>) => {
    setLoading((p: any) => ({ ...p, [key]: true }));
    try {
      const r = await fn();
      if (r.success !== false) {
        setData((p: any) => ({ ...p, [key]: r.data || r }));
      }
    } catch (e) {
      console.warn(`Failed to load ${key}:`, e);
    }
    setLoading((p: any) => ({ ...p, [key]: false }));
  };

  useEffect(() => {
    load('joke', api.getJoke);
    load('dadjoke', api.getDadJoke);
    load('fact', api.getRandomFact);
    load('catfact', api.getCatFact);
    load('advice', api.getAdvice);
    load('quote', api.getQuote);
    load('bored', api.getBoredActivity);
    load('numfact', () => api.getNumberFact('random'));
    load('trivia', () => api.getTrivia(5));
  }, []);

  const hindiJokes = [
    { q: 'Teacher: Homework kahan hai?', a: 'Sir, homework to kiya tha par notebook ne privacy policy accept nahi ki!' },
    { q: 'Doctor: Aapko rest ki zarurat hai', a: 'Doctor sahab, ye baat mere boss ko PDF mein bhej do!' },
    { q: 'WiFi slow ho to kya karein?', a: 'Pehle router nahi, apni expectations restart karo!' },
    { q: 'Interviewer: Aapki weakness kya hai?', a: 'Main bahut honest hoon - mujhe aapki opinion se koi fark nahi padta!' },
    { q: 'Pappu: Main multitasking karta hoon', a: 'Ek saath bhookha bhi rehta hoon aur kaam bhi nahi karta!' },
  ];
  const [hindiIdx, setHindiIdx] = useState(0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="😂" title="Fun Zone" description="Jokes (English/Hindi), facts, trivia, advice & quotes" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ApiToolCard icon="😂" title="Random Joke" loading={loading.joke} onRefresh={() => load('joke', api.getJoke)} color="yellow">
          {data.joke?.setup ? (
            <>
              <p className="text-white">{data.joke.setup}</p>
              <p className="text-yellow-300 mt-2 font-bold">{data.joke.delivery}</p>
            </>
          ) : data.joke?.joke ? (
            <p className="text-white">{data.joke.joke}</p>
          ) : 'Loading...'}
        </ApiToolCard>

        <ApiToolCard icon="👨" title="Dad Joke" loading={loading.dadjoke} onRefresh={() => load('dadjoke', api.getDadJoke)} color="orange">
          <p className="text-white">{data.dadjoke?.joke || 'Loading...'}</p>
        </ApiToolCard>

        <ApiToolCard icon="🇮🇳" title="Hindi Joke" onRefresh={() => setHindiIdx((p) => (p + 1) % hindiJokes.length)} color="red">
          <p className="text-white">Q: {hindiJokes[hindiIdx].q}</p>
          <p className="text-yellow-300 mt-2 font-bold">A: {hindiJokes[hindiIdx].a}</p>
        </ApiToolCard>

        <ApiToolCard icon="🤔" title="Useless Fact" loading={loading.fact} onRefresh={() => load('fact', api.getRandomFact)} color="purple">
          <p className="text-white">{data.fact?.text || 'Loading...'}</p>
        </ApiToolCard>

        <ApiToolCard icon="🐱" title="Cat Fact" loading={loading.catfact} onRefresh={() => load('catfact', api.getCatFact)} color="pink">
          <p className="text-white">{data.catfact?.fact || 'Loading...'}</p>
        </ApiToolCard>

        <ApiToolCard icon="💡" title="Random Advice" loading={loading.advice} onRefresh={() => load('advice', api.getAdvice)} color="cyan">
          <p className="text-white italic">"{data.advice?.slip?.advice || 'Loading...'}"</p>
        </ApiToolCard>

        <ApiToolCard icon="💬" title="Inspirational Quote" loading={loading.quote} onRefresh={() => load('quote', api.getQuote)} color="emerald">
          {data.quote ? (
            <>
              <p className="text-white italic">"{data.quote.quote}"</p>
              <p className="text-gray-400 text-xs mt-2">— {data.quote.author}</p>
            </>
          ) : 'Loading...'}
        </ApiToolCard>

        <ApiToolCard icon="🎯" title="Bored Activity" loading={loading.bored} onRefresh={() => load('bored', api.getBoredActivity)} color="green">
          {data.bored ? (
            <>
              <p className="text-white font-semibold">{data.bored.activity}</p>
              <p className="text-xs text-gray-400 mt-2">Type: {data.bored.type} • Participants: {data.bored.participants}</p>
            </>
          ) : 'Loading...'}
        </ApiToolCard>

        <ApiToolCard icon="🔢" title="Number Fact" loading={loading.numfact} onRefresh={() => load('numfact', () => api.getNumberFact('random'))} color="blue">
          <p className="text-white">{data.numfact?.text || 'Loading...'}</p>
        </ApiToolCard>
      </div>

      {/* Trivia Section */}
      <div className="mt-6">
        <ApiToolCard icon="❓" title="Trivia Quiz (5 questions)" loading={loading.trivia} onRefresh={() => load('trivia', () => api.getTrivia(5))} color="purple">
          <div className="space-y-3 mt-2">
            {data.trivia?.results?.map((q: any, i: number) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg">
                <p className="text-white text-sm font-medium mb-2">{i + 1}. {decodeURIComponent(q.question)}</p>
                <p className="text-green-400 text-xs">✅ Answer: {decodeURIComponent(q.correct_answer)}</p>
              </div>
            ))}
          </div>
        </ApiToolCard>
      </div>
    </div>
  );
};
