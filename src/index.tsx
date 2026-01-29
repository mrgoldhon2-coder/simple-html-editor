import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

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

  return (
    <div className="relative w-full">
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
        className={`input-base py-2.5 text-sm md:text-base ${isOpen ? 'relative z-[100] border-[#FDB913] bg-[#1a1f26]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80] pointer-events-none backdrop-blur-sm" />
          <div className="absolute z-[100] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-5 py-4 hover:bg-[#2a3040] text-sm border-b border-white/5 last:border-b-0 active:bg-[#FDB913] active:text-black">
                {opt}
              </button>
            )) : <div className="p-4 text-center text-gray-500 text-xs">Ничего не найдено</div>}
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="w-full bg-black border-b border-[#1a1f26] sticky top-0 z-[110]">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="logo font-black text-[#FDB913] text-xl">P2P</div>
          <span className="font-bold text-white uppercase text-[10px] md:text-xs tracking-tight">{RU.common.exchangeName}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`text-[11px] uppercase font-bold tracking-widest transition-colors ${page === l.id ? 'text-[#FDB913]' : 'text-gray-400 hover:text-white'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-[10px] md:text-xs font-black uppercase tracking-tighter">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white">
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#1a1f26] p-4 flex flex-col gap-2 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl text-sm ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </header>
  );
};

const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  
  // ВЕРНУЛ ВСЕ МОНЕТЫ + USDT на первом месте
  const assetsMap: any = { 
    'TON (The Open Network)': ['USDT', 'TON', 'NOT', 'DOGS'], 
    'Tron (TRC20)': ['USDT', 'TRX', 'USDC'], 
    'Ethereum (ERC20)': ['USDT', 'ETH', 'USDC', 'DAI', 'WBTC'], 
    'BNB Smart Chain (BEP20)': ['USDT', 'BNB', 'BUSD', 'CAKE'] 
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
    <div className="page-container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-black mb-8 text-white uppercase tracking-tighter">{RU.sell.title}</h1>
      <div className="card-dark space-y-8 p-6 md:p-10 bg-[#11141a] rounded-3xl border border-white/5">
        {/* ПЕРВАЯ ЛИНИЯ - 3 СТОЛБЦА */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        
        {/* ВТОРАЯ ЛИНИЯ - 2 ИЛИ 3 СТОЛБЦА */}
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base text-sm md:text-base font-bold" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base text-sm md:text-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div><label className="text-[10px] uppercase font-black text-gray-500 mb-2 block ml-1">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        
        <button disabled={!isValid} className={`btn-secondary w-full md:w-96 mx-auto h-14 md:h-16 flex items-center justify-center gap-3 font-black uppercase text-xs md:text-sm tracking-widest transition-all ${!isValid ? 'opacity-20' : 'hover:scale-[1.02] active:scale-[0.98]'}`}>
          {RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-2xl font-black mb-2 text-white uppercase">{RU.rewards.title}</h1>
    <p className="text-xs md:text-sm text-gray-500 mb-10 font-medium">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-6 md:p-8 bg-[#1a1f26] rounded-3xl border border-white/5">
          <div className="text-2xl md:text-3xl mb-2">{s.i}</div>
          <div className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-wider">{s.l}</div>
          <div className="text-xl md:text-2xl font-black text-white">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-3">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-5 bg-[#1a1f26] rounded-2xl border border-white/5">
          <div className="pr-4"><h3 className="font-black text-white text-xs md:text-sm uppercase mb-1">{item.t}</h3><p className="text-[11px] md:text-xs text-gray-500">{item.d}</p></div>
          <div className="text-[#FDB913] font-black text-xs md:text-sm whitespace-nowrap">+{item.p} PTS</div>
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
      <main className="pb-24">
        {page === 'home' && (
          <div className="page-container py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-[0.9]">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
            <p className="text-sm md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">{RU.home.sub}</p>
            <button onClick={() => setPage('sell')} className="btn-primary px-10 py-4 text-sm md:text-base font-black uppercase tracking-[0.2em]">{RU.home.btn}</button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
              {RU.home.steps.map(s => (
                <div key={s.n} className="p-6 bg-[#1a1f26] rounded-2xl text-left border border-white/5">
                  <div className="text-[#FDB913] text-xl font-black mb-2">{s.n}</div>
                  <h3 className="font-bold mb-2 text-white text-xs md:text-sm uppercase">{s.t}</h3>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-normal">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && (
          <div className="page-container py-12">
            <h1 className="text-2xl font-black mb-8 uppercase">Профиль</h1>
            <div className="p-20 text-center bg-[#1a1f26] rounded-3xl border border-dashed border-white/10">
              <p className="text-xs md:text-sm text-gray-500">{RU.profile.empty}</p>
            </div>
          </div>
        )}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && (
          <div className="page-container py-12 flex justify-center">
            <div className="w-full max-w-sm p-8 md:p-10 bg-[#1a1f26] rounded-3xl border border-white/5">
              <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest">Вход</h2>
              <div className="space-y-4">
                <input className="input-base text-sm md:text-base" placeholder="Email" />
                <input className="input-base text-sm md:text-base" type="password" placeholder="Пароль" />
                <button className="w-full py-4 bg-[#FDB913] text-black rounded-xl font-black uppercase text-xs md:text-sm tracking-widest">Войти</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="py-12 border-t border-[#1a1f26] text-center text-[9px] md:text-[10px] text-gray-600 uppercase tracking-[0.3em]">
        <p>© 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}</p>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);