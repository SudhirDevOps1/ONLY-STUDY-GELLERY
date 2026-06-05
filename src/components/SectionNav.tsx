import React from 'react';
import {
  Grid3x3, Wrench, CloudSun, Calculator, Laugh, Newspaper,
  DollarSign, GraduationCap, Code, Utensils, Gamepad2,
  Database, MapPin, Users, BookOpen, Heart, Sparkles,
  Shield, Globe, MessageSquare, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

export const sectionList = [
  { id: 'gallery', name: 'Gallery', icon: 'Grid3x3', color: 'blue', desc: 'Images, Videos, Audio' },
  { id: 'tools', name: 'Tools', icon: 'Wrench', color: 'cyan', desc: '12+ Free API Tools' },
  { id: 'weather', name: 'Weather', icon: 'CloudSun', color: 'yellow', desc: 'Live Weather & Forecast' },
  { id: 'calculator', name: 'Calculator', icon: 'Calculator', color: 'green', desc: 'Health, Finance, Math' },
  { id: 'fun', name: 'Fun Zone', icon: 'Laugh', color: 'pink', desc: 'Jokes, Facts, Trivia' },
  { id: 'news', name: 'News', icon: 'Newspaper', color: 'orange', desc: 'World News & Headlines' },
  { id: 'finance', name: 'Finance', icon: 'DollarSign', color: 'emerald', desc: 'Crypto, Currency' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: 'indigo', desc: 'Universities, Research' },
  { id: 'developer', name: 'Dev Tools', icon: 'Code', color: 'violet', desc: 'GitHub, QR, UUID' },
  { id: 'food', name: 'Food', icon: 'Utensils', color: 'amber', desc: 'Recipes, Meals' },
  { id: 'entertainment', name: 'Fun', icon: 'Gamepad2', color: 'rose', desc: 'Pokemon, Music' },
  { id: 'facts', name: 'Facts', icon: 'Database', color: 'teal', desc: 'Number Facts, Advice' },
  { id: 'locations', name: 'Locations', icon: 'MapPin', color: 'lime', desc: 'IP, Country Info' },
  { id: 'social', name: 'Social', icon: 'Users', color: 'fuchsia', desc: 'Random Users' },
  { id: 'reading', name: 'Reading', icon: 'BookOpen', color: 'sky', desc: 'Posts, Lorem Ipsum' },
  { id: 'wellness', name: 'Wellness', icon: 'Heart', color: 'red', desc: 'BMI, Health Calc' },
  { id: 'random', name: 'Random', icon: 'Sparkles', color: 'purple', desc: 'Bored Activities' },
  { id: 'security', name: 'Security', icon: 'Shield', color: 'green', desc: 'Password, QR' },
  { id: 'world', name: 'World', icon: 'Globe', color: 'cyan', desc: 'Timezones, Clock' },
  { id: 'chat', name: 'Chat', icon: 'MessageSquare', color: 'blue', desc: 'Quotes, Wisdom' }
];

export const iconMap: Record<string, React.ComponentType<any>> = {
  Grid3x3, Wrench, CloudSun, Calculator, Laugh, Newspaper,
  DollarSign, GraduationCap, Code, Utensils, Gamepad2,
  Database, MapPin, Users, BookOpen, Heart, Sparkles,
  Shield, Globe, MessageSquare
};

export const colorMap: Record<string, { bg: string; text: string; border: string; badge: string; hover: string; grad: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-400', hover: 'hover:bg-blue-500/10', grad: 'from-blue-500/20 to-cyan-500/20' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/20', badge: 'bg-cyan-500/10 text-cyan-400', hover: 'hover:bg-cyan-500/10', grad: 'from-cyan-500/20 to-teal-500/20' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/20', badge: 'bg-yellow-500/10 text-yellow-400', hover: 'hover:bg-yellow-500/10', grad: 'from-yellow-500/20 to-orange-500/20' },
  green: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/20', badge: 'bg-green-500/10 text-green-400', hover: 'hover:bg-green-500/10', grad: 'from-green-500/20 to-emerald-500/20' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500/20', badge: 'bg-pink-500/10 text-pink-400', hover: 'hover:bg-pink-500/10', grad: 'from-pink-500/20 to-rose-500/20' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/20', badge: 'bg-orange-500/10 text-orange-400', hover: 'hover:bg-orange-500/10', grad: 'from-orange-500/20 to-amber-500/20' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-400', hover: 'hover:bg-emerald-500/10', grad: 'from-emerald-500/20 to-green-500/20' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20', badge: 'bg-indigo-500/10 text-indigo-400', hover: 'hover:bg-indigo-500/10', grad: 'from-indigo-500/20 to-blue-500/20' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/20', badge: 'bg-violet-500/10 text-violet-400', hover: 'hover:bg-violet-500/10', grad: 'from-violet-500/20 to-purple-500/20' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-400', hover: 'hover:bg-amber-500/10', grad: 'from-amber-500/20 to-yellow-500/20' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', badge: 'bg-rose-500/10 text-rose-400', hover: 'hover:bg-rose-500/10', grad: 'from-rose-500/20 to-pink-500/20' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/20', badge: 'bg-teal-500/10 text-teal-400', hover: 'hover:bg-teal-500/10', grad: 'from-teal-500/20 to-cyan-500/20' },
  lime: { bg: 'bg-lime-500', text: 'text-lime-400', border: 'border-lime-500/20', badge: 'bg-lime-500/10 text-lime-400', hover: 'hover:bg-lime-500/10', grad: 'from-lime-500/20 to-green-500/20' },
  fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', badge: 'bg-fuchsia-500/10 text-fuchsia-400', hover: 'hover:bg-fuchsia-500/10', grad: 'from-fuchsia-500/20 to-pink-500/20' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/20', badge: 'bg-sky-500/10 text-sky-400', hover: 'hover:bg-sky-500/10', grad: 'from-sky-500/20 to-blue-500/20' },
  red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20', badge: 'bg-red-500/10 text-red-400', hover: 'hover:bg-red-500/10', grad: 'from-red-500/20 to-pink-500/20' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/20', badge: 'bg-purple-500/10 text-purple-400', hover: 'hover:bg-purple-500/10', grad: 'from-purple-500/20 to-indigo-500/20' }
};

interface SectionNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({ activeSection, onSectionChange, collapsed, onToggle }) => {
  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-gray-800 rounded-xl text-white shadow-xl border border-gray-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar overlay on mobile */}
      {collapsed && (
        <div className="lg:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-[58] bg-gray-950 border-r border-gray-800 transition-all duration-300 overflow-y-auto
          ${collapsed ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">MediaHub</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">40+ Free APIs</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Sections */}
        <div className="p-3 space-y-1">
          {sectionList.map((section) => {
            const Icon = iconMap[section.icon];
            const colors = colorMap[section.color];
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? `${colors.bg} text-white shadow-lg`
                    : `text-gray-400 ${colors.hover} hover:text-white`
                } ${collapsed ? '' : 'justify-center'}`}
                title={section.name}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : colors.text}`} />
                {collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{section.name}</p>
                    {!isActive && <p className="text-[10px] text-gray-500 truncate">{section.desc}</p>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
