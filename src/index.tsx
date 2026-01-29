import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * ВЫПАДАЮЩИЙ СПИСОК
 * Компактный шрифт sm (14px)
 */
const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false, aliases = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);

  const filtered = options.filter((opt: string) => {
    const s = search.toLowerCase().replace(/-/g, '');
    const o = opt.toLowerCase().replace(/-/g, '');
    const a = (aliases[opt] || []).some((alias: string) => alias.toLowerCase().includes(s));
    return o.includes(s) || a;
  });

  useEffect(() => { if (!isOpen) { setInputValue(value); setPreviousValue(value); } }, [value, isOpen]);

  const handleSelect = (opt: string) => {
    isSelectionMade.current = true;
    setInputValue(opt); setPreviousValue(opt); onChange(opt);
    setSearch(''); setIsOpen(false);
  };

  return (
    <div className="relative w-full text-sm"> {/* Уменьшен общий размер */}
      <input
        type="text" value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={() => setTimeout(() => {
          if (isSelectionMade.current) { isSelectionMade.current = false; setIsOpen(false); return; }
          if (!inputValue || (!options.includes(inputValue) && !allowCustom)) setInputValue(previousValue);
          else { onChange(inputValue); setPreviousValue(inputValue); }
          setIsOpen(false); setSearch('');
        }, 200)}
        placeholder={placeholder} 
        className={`input-base py-3 text-sm ${isOpen ? 'relative z-[100] border-[#FDB913] bg-[#1a1f26]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80] pointer-events-none backdrop-blur-[2px]" />
          <div className="absolute z-[100] w-full mt-1 bg-[#1a1f26] border border-[#FDB913]/50 rounded-xl shadow-2xl max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-3 hover:bg-[#2a3040] text-sm border-b border-white/5 last:border-b-0 active:bg-[#FDB913] active:text-black">
                {opt}
              </button>
            )) : <div className="p-4 text-center text-gray-500 text-xs">Ничего не найдено</div>}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * НАВБАР
 */
const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="w-full bg-black border-b border-[#1a1f26] sticky top-0 z-[110]">
      <div className="page-container h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="text-lg font-black text-[#FDB913]">P2P</div>
          <span className="font-bold text-white uppercase text-[11px] tracking-tight">{RU.common.exchangeName}</span>
        </div>
        <div className="hidden md:flex items-center gap-5">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`text-xs uppercase font-bold tracking-wider ${page === l.id ? 'text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage('auth')} className="bg-[#FDB913] text-black text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-tighter">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5">
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-black/95 border-b border-[#1a1f26] p-3 flex flex-col gap-1 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-3 rounded-lg text-sm ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </header>
  );
};

const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  
  // ИСПРАВЛЕНО: USDT теперь везде первый (порядок по популярности)
  const assetsMap: any = { 
    'TON (The Open Network)': ['USDT', 'TON', 'NOT', 'DOGS'], 
    'Tron (TRC20)': ['USDT', 'TRX', 'USDC'], 
    'Ethereum (ERC20)': ['USDT', 'ETH', 'USDC'], 
    'BNB Smart Chain (BEP20)': ['USDT', 'BNB'] 
  };
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState(assetsMap[networks[0]][0]);
  const [method, setMethod] = useState(RU.sell.methods[0]);
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');

  const currentConfig = (RU.sell.methodConfigs as any)[method];
  const isValid = Number(amount) > 0 && details.length >= 5;

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-black mb-6 text-white uppercase tracking-tight">{RU.sell.title}</h1>
      <div className="space-y-5 p-5 bg-[#11141a] rounded-2xl border border-white/5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Сеть</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Актив</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Метод</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Сумма {asset}</label><input type="text" placeholder="0.00" className="input-base text-sm font-bold" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base text-sm" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div className="md:col-span-2"><label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Банк получателя</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder="Выберите банк..." /></div>}
        </div>
        <button disabled={!isValid} className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${!isValid ? 'bg-white/5 text-white/20' : 'bg-[#FDB913] text-black shadow-[0_0_20px_rgba(253,185,19,0.2)] active:scale-95'}`}>
          {RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const RewardsPage = () => (
  <div className="page-container py-8">
    <h1 className="text-xl font-black mb-1 text-white uppercase">{RU.rewards.title}</h1>
    <p className="text-xs text-gray-500 mb-6 font-medium">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-3 gap-3 mb-8">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-4 bg-[#1a1f26] rounded-xl border border-white/5 text-center">
          <div className="text-xl mb-1">{s.i}</div>
          <div className="text-[9px] text-gray-500 font-black uppercase leading-tight mb-1">{s.l}</div>
          <div className="text-sm font-black text-white">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-[#1a1f26] rounded-xl border border-white/5">
          <div className="pr-4"><h3 className="font-bold text-white text-[13px] leading-tight mb-0.5">{item.t}</h3><p className="text-[11px] text-gray-500 leading-tight">{item.d}</p></div>
          <div className="text-[#FDB913] font-black text-xs whitespace-nowrap">+{item.p} PTS</div>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('currentPage') as Page) || 'home');
  useEffect(() => { localStorage.setItem('currentPage', page); window.scrollTo(0, 0); }, [page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      <Navbar page={page} setPage={setPage} />
      <main className="pb-16">
        {page === 'home' && (
          <div className="page-container py-16 text-center">
            <h1 className="text-3xl font-black mb-4 uppercase leading-none tracking-tighter">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
            <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">{RU.home.sub}</p>
            <button onClick={() => setPage('sell')} className="bg-[#FDB913] text-black px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest active:scale-95 transition-transform">{RU.home.btn}</button>
          </div>
        )}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && (
          <div className="page-container py-8">
            <h1 className="text-xl font-black mb-6 uppercase">Личный кабинет</h1>
            <div className="p-12 text-center bg-[#1a1f26] rounded-2xl border border-dashed border-white/10">
              <p className="text-xs text-gray-500 font-medium">{RU.profile.empty}</p>
            </div>
          </div>
        )}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && (
          <div className="page-container py-12 flex justify-center">
            <div className="w-full max-w-xs p-6 bg-[#1a1f26] rounded-2xl border border-white/5">
              <h2 className="text-lg font-black mb-6 text-center uppercase tracking-widest">Вход</h2>
              <div className="space-y-3">
                <input className="input-base text-sm" placeholder="Email" />
                <input className="input-base text-sm" type="password" placeholder="Пароль" />
                <button className="w-full py-3.5 bg-[#FDB913] text-black rounded-xl font-black uppercase text-xs tracking-widest">Войти</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="py-8 border-t border-[#1a1f26] text-center text-[9px] text-gray-600 uppercase tracking-[0.2em]">
        <p>© 2026 {RU.common.exchangeName}</p>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);