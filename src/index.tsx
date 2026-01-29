import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

const GlobalStyles = () => (
  <style>{`
    html, body, #root { background-color: #000000 !important; margin: 0; min-height: 100vh; overscroll-behavior-y: none; }
    @media (min-width: 768px) {
      * { scrollbar-width: thin; scrollbar-color: #374151 #0a0a0a; }
      *::-webkit-scrollbar { width: 16px; }
      *::-webkit-scrollbar-track { background: #0a0a0a; }
      *::-webkit-scrollbar-thumb { background: #374151; border-radius: 8px; }
    }
  `}</style>
);

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
        className={`input-base py-2.5 text-sm md:text-base ${isOpen ? 'relative z-[100] !border-[#FDB913]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80] pointer-events-none backdrop-blur-sm" />
          <div className="absolute z-[100] w-full mt-2 bg-[#0f1419] border-2 border-[#FDB913] rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-5 py-4 hover:bg-[#1e2430] text-sm border-b border-white/5 last:border-b-0 text-white">
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
    <header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-[#1e2430] z-[110]">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
          <div className="logo">P2P</div>
          <span className="font-bold text-white uppercase text-[10px] md:text-xs tracking-tight">{RU.common.exchangeName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`nav-link ${page === l.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{l.l}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary !py-2 !px-4 !text-xs uppercase">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white">
            <div className={`w-6 h-0.5 bg-white mb-1.5 transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            {!mobileOpen && <div className="w-6 h-0.5 bg-white mb-1.5" />}
            <div className={`w-6 h-0.5 bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black border-b border-[#1e2430] p-4 flex flex-col gap-2 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl text-sm ${page === l.id ? 'bg-[#1e2430] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </header>
  );
};

const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  
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
  const [loading, setLoading] = useState(false);

  const currentConfig = (RU.sell.methodConfigs as any)[method];
  const isValid = Number(amount) > 0 && details.length >= 5;

  const handleCreate = async () => {
    setLoading(true);
    const res = await Api.createOrder({ network, asset, method, amount, details, bank });
    alert(res.success ? "Заявка создана!" : res.message);
    setLoading(false);
  };

  return (
    <div className="page-container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-black mb-8 text-white uppercase tracking-tighter">{RU.sell.title}</h1>
      <div className="card-dark space-y-8">
        {/* ЛИНИЯ 1: 3 СТОЛБЦА */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="label !text-[10px] uppercase font-bold">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div><label className="label !text-[10px] uppercase font-bold">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div><label className="label !text-[10px] uppercase font-bold">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        
        {/* ЛИНИЯ 2: АДАПТИВНАЯ СЕТКА */}
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div><label className="label !text-[10px] uppercase font-bold">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base text-sm md:text-base font-bold" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div><label className="label !text-[10px] uppercase font-bold">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base text-sm md:text-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div><label className="label !text-[10px] uppercase font-bold">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        
        <button onClick={handleCreate} disabled={!isValid || loading} className={`btn-secondary !w-full md:!w-96 mx-auto ${!isValid ? 'opacity-20 pointer-events-none' : ''}`}>
          {loading ? RU.common.loading : RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('currentPage') as Page) || 'home');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  useEffect(() => { localStorage.setItem('currentPage', page); window.scrollTo(0, 0); }, [page]);

  return (
    <div className="min-h-screen text-white font-sans antialiased">
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} />
      <main className="pt-20 pb-24">
        {page === 'home' && (
          <div className="page-container py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-tight">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
            <p className="text-sm md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto">{RU.home.sub}</p>
            <button onClick={() => setPage('sell')} className="btn-primary px-10 py-4 mx-auto !text-sm md:!text-base">{RU.home.btn}</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {RU.home.steps.map(s => (
                <div key={s.n} className="feature-card !text-left">
                  <div className="text-[#FDB913] text-xl font-black mb-2">{s.n}</div>
                  <h3 className="font-bold mb-2 text-white text-xs md:text-sm uppercase">{s.t}</h3>
                  <p className="text-[11px] md:text-xs text-gray-500">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16">
              {RU.home.features.map((f, i) => (
                <div key={i} className="p-4 bg-[#0f1419] border border-[#1e2430] rounded-xl">
                  <div className="text-2xl mb-2">{f.i}</div>
                  <div className="font-bold text-[10px] text-white uppercase mb-1">{f.t}</div>
                  <div className="text-[9px] text-gray-500 uppercase leading-tight">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && (
          <div className="page-container py-12">
            <div className="warning-banner">
              <span className="text-2xl">🛡️</span>
              <p className="text-[11px] md:text-xs text-[#FDB913] font-bold uppercase tracking-wider">{RU.common.saveIncognito}</p>
            </div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black uppercase">{RU.profile.title}</h1>
              <button onClick={() => setPage('sell')} className="btn-primary !py-2 !px-4 !text-xs uppercase">{RU.profile.createBtn}</button>
            </div>
            <div className="empty-state">
              <div className="empty-icon text-4xl">📁</div>
              <p className="text-xs md:text-sm text-gray-500 uppercase font-bold tracking-widest">{RU.profile.empty}</p>
            </div>
          </div>
        )}
        {page === 'rewards' && (
          <div className="page-container py-12">
            <h1 className="text-2xl font-black mb-2 text-white uppercase">{RU.rewards.title}</h1>
            <p className="text-xs md:text-sm text-gray-500 mb-10 font-medium">{RU.rewards.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {RU.rewards.stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.i}</div>
                  <div className="stat-value text-xl md:text-3xl">{s.v}</div>
                  <div className="stat-label uppercase font-bold tracking-widest !text-[10px]">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {RU.rewards.items.map((item, i) => (
                <div key={i} className="reward-card">
                  <div className="flex items-center gap-4">
                    <div className="reward-icon text-sm md:text-xl">💎</div>
                    <div>
                      <h3 className="font-bold text-white text-xs md:text-sm uppercase mb-1">{item.t}</h3>
                      <p className="text-[11px] md:text-xs text-gray-500">{item.d}</p>
                    </div>
                  </div>
                  <div className="reward-points text-xs md:text-sm">+{item.p} PTS</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'auth' && (
          <div className="page-container py-12 flex justify-center">
            <div className="w-full max-w-sm">
               <div className="tabs-container mb-6">
                <button onClick={() => setMode('login')} className={`btn-tab ${mode === 'login' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.login}</button>
                <button onClick={() => setMode('register')} className={`btn-tab ${mode === 'register' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.register}</button>
              </div>
              <div className="card-dark space-y-4">
                <input className="input-base text-sm" placeholder="Email" type="email" />
                <input className="input-base text-sm" type="password" placeholder={RU.auth.placeholders.pass} />
                {mode === 'register' && <input className="input-base text-sm" type="password" placeholder={RU.auth.placeholders.passConfirm} />}
                <button className="btn-primary w-full !py-4 uppercase text-xs tracking-widest mt-4">
                   {mode === 'login' ? RU.auth.tabs.login : RU.auth.tabs.register}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="py-12 border-t border-[#1e2430] text-center text-[9px] md:text-[10px] text-gray-600 uppercase tracking-[0.3em]">
        <p>© 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}</p>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);