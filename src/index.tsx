import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * КОМПОНЕНТ ДРОПДАУНА С ФИКСИРОВАННЫМ СКРОЛЛОМ СТРАНИЦЫ
 */
const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false, aliases = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt: string) => {
    const s = search.toLowerCase().replace(/-/g, '');
    const o = opt.toLowerCase().replace(/-/g, '');
    const a = (aliases[opt] || []).some((alias: string) => alias.toLowerCase().includes(s));
    return o.includes(s) || a;
  });

  // Мгновенный скролл всей страницы к центру при открытии
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ 
          behavior: 'auto', 
          block: 'center' 
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => { if (!isOpen) { setInputValue(value); setPreviousValue(value); } }, [value, isOpen]);

  const handleSelect = (opt: string) => {
    isSelectionMade.current = true;
    setInputValue(opt); setPreviousValue(opt); onChange(opt);
    setSearch(''); setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (isSelectionMade.current) { isSelectionMade.current = false; setIsOpen(false); return; }
      if (!inputValue || (!options.includes(inputValue) && !allowCustom)) setInputValue(previousValue);
      else { onChange(inputValue); setPreviousValue(inputValue); }
      setIsOpen(false); setSearch('');
    }, 200);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <input
        type="text" value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={handleBlur} placeholder={placeholder} 
        className={`input-base transition-all ${isOpen ? 'relative z-[70] border-[#FDB913] ring-1 ring-[#FDB913]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-4 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0 active:bg-[#FDB913] active:text-black">
                {opt}
              </button>
            )) : <div className="p-4 text-center text-gray-500 text-sm">Ничего не найдено</div>}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * КОМПОНЕНТ НАВИГАЦИИ
 */
const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-[#1a1f26] z-[100]">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="bg-[#FDB913] text-black px-2 py-0.5 rounded font-black text-xs">QUICK</div>
          <span className="font-bold text-white tracking-tight uppercase text-sm">P2P</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`text-xs uppercase tracking-widest transition ${page === l.id ? 'text-[#FDB913] font-bold' : 'text-gray-400 hover:text-white'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-5 text-[10px] uppercase font-bold tracking-widest">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-white transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 w-full bg-white ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#1a1f26] p-6 flex flex-col gap-4 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`text-left text-lg font-bold ${page === l.id ? 'text-[#FDB913]' : 'text-gray-500'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

/**
 * СТРАНИЦА ПРОДАЖИ (ОСНОВНАЯ)
 */
const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  const assetsMap: any = { 
    'TON (The Open Network)': ['TON', 'USDT', 'NOT', 'DOGS'], 
    'Tron (TRC20)': ['USDT', 'TRX', 'USDC', 'USDD'], 
    'Ethereum (ERC20)': ['ETH', 'USDT', 'USDC', 'WBTC', 'LINK'], 
    'BNB Smart Chain (BEP20)': ['BNB', 'USDT', 'FDUSD', 'CAKE', 'TWT'] 
  };
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState(assetsMap[networks[0]][0]);
  const [method, setMethod] = useState(RU.sell.methods[0]);
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const currentConfig = (RU.sell.methodConfigs as any)[method];
  const isValid = Number(amount) > 0 && details.length >= 5;

  const handleCreateOrder = async () => {
    setLoading(true);
    const res = await Api.createOrder({ network, asset, method, amount, details, bank });
    alert(res.success ? "Заявка создана!" : res.message);
    setLoading(false);
  };

  return (
    <div className="page-container py-12 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">{RU.sell.title}</h1>
      <div className="card-dark p-6 md:p-10 space-y-10 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8`}>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base font-bold text-xl text-[#FDB913]" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div className="space-y-3"><label className="label opacity-50">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        <button onClick={handleCreateOrder} disabled={!isValid || loading} className={`btn-secondary w-full md:w-80 mx-auto h-16 text-lg font-black uppercase tracking-widest ${(!isValid || loading) ? 'opacity-20' : 'hover:bg-[#FDB913] hover:text-black'}`}>
          {loading ? RU.common.loading : RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

/**
 * ВСПОМОГАТЕЛЬНЫЕ СТРАНИЦЫ (ПОЛНЫЕ)
 */
const ProfilePage = () => (
  <div className="page-container py-12 animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end mb-10">
      <h1 className="text-4xl font-black uppercase tracking-tighter">{RU.profile.title}</h1>
      <button className="text-[#FDB913] text-sm font-bold border-b border-[#FDB913] pb-1 hover:opacity-70">{RU.profile.createBtn}</button>
    </div>
    <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
      {Object.entries(RU.profile.tabs).map(([k, v]) => (
        <button key={k} className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition ${k === 'all' ? 'bg-[#FDB913] text-black' : 'bg-[#1a1f26] text-white hover:bg-[#222]'}`}>{v}</button>
      ))}
    </div>
    <div className="flex flex-col items-center justify-center py-32 bg-[#111] rounded-3xl border border-white/5 border-dashed">
      <div className="text-5xl mb-6 opacity-20">📦</div>
      <p className="text-gray-500 font-medium">{RU.profile.empty}</p>
    </div>
  </div>
);

const RewardsPage = () => (
  <div className="page-container py-12 animate-in fade-in duration-500">
    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{RU.rewards.title}</h1>
    <p className="text-gray-500 mb-12 font-medium">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-8 bg-[#1a1f26] rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">{s.i}</div>
          <div className="text-xs uppercase tracking-tighter text-gray-400 mb-1 font-bold">{s.l}</div>
          <div className="text-3xl font-black text-white italic">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-6 bg-[#111] rounded-2xl border border-white/5 hover:border-[#FDB913]/30 transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-[#FDB913]/10 rounded-full flex items-center justify-center text-[#FDB913] font-black text-xl">!</div>
            <div>
              <h3 className="font-black text-white uppercase text-sm">{item.t}</h3>
              <p className="text-xs text-gray-500">{item.d}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#FDB913] font-black italic">+{item.p} PTS</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FDB913]/5 blur-[120px] rounded-full pointer-events-none" />
    <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
      {RU.home.title} <br/><span className="text-[#FDB913]">{RU.home.accent}</span>
    </h1>
    <p className="text-gray-400 mb-12 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">{RU.home.sub}</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-16 py-6 text-xl font-black uppercase italic tracking-widest shadow-[0_20px_50px_rgba(253,185,19,0.2)] hover:scale-105 transition-transform">{RU.home.btn}</button>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-32">
      {RU.home.steps.map(s => (
        <div key={s.n} className="p-8 bg-[#111] rounded-3xl border border-white/5 text-left group hover:border-[#FDB913]/20 transition-colors">
          <div className="text-[#FDB913] text-4xl font-black mb-4 opacity-20 group-hover:opacity-100 transition-opacity italic">{s.n}</div>
          <h3 className="font-black text-white uppercase text-sm mb-2">{s.t}</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('currentPage') as Page) || 'home');
  useEffect(() => { localStorage.setItem('currentPage', page); window.scrollTo({top: 0, behavior: 'auto'}); }, [page]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FDB913] selection:text-black font-sans antialiased">
      <Navbar page={page} setPage={setPage} />
      <main className="pt-20 pb-20">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && <div className="page-container py-24 flex justify-center"><div className="card-dark w-full max-w-md p-10 border border-white/5"><h2 className="text-3xl font-black mb-8 uppercase italic">{RU.auth.tabs.login}</h2><input className="input-base mb-4" placeholder="EMAIL"/><input className="input-base mb-8" type="password" placeholder="PASSWORD"/><button className="btn-primary w-full py-5 font-black uppercase italic tracking-widest text-lg">ENTER</button></div></div>}
      </main>
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">© 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}</p>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);