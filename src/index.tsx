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
    html { overflow-y: scroll; }
  `}</style>
);

const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false, aliases = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt: string) => {
    const s = search.toLowerCase().replace(/-/g, '');
    const o = opt.toLowerCase().replace(/-/g, '');
    const a = (aliases[opt] || []).some((alias: string) => alias.toLowerCase().includes(s));
    return o.includes(s) || a;
  });

  useEffect(() => { if (!isOpen) { setInputValue(value); setPreviousValue(value); } }, [value, isOpen]);

  useEffect(() => {
    if (isOpen && filtered.length === 1 && search.length >= 3) {
      handleSelect(filtered[0]);
      inputRef.current?.blur();
    }
  }, [filtered, search, isOpen]);

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
    <div className="relative w-full">
      <input
        ref={inputRef} type="text" value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={handleBlur} placeholder={placeholder} className={`input-base ${isOpen ? 'relative z-[70]' : ''}`}
      />
      {isOpen && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-3 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0">{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-[100]">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="logo">P2P</div>
          <span className="font-bold text-sm md:text-base">{RU.common.exchangeName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`nav-link ${page === l.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{l.l}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-xs md:text-sm">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            <div className={`w-6 h-0.5 bg-white mb-1.5 transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-6 h-0.5 bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black border-b border-[#1a1f26] p-4 flex flex-col gap-2">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
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
    'Ethereum (ERC20)': ['USDT', 'ETH', 'USDC'], 
    'BNB Smart Chain (BEP20)': ['USDT', 'BNB', 'FDUSD'] 
  };
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState('USDT');
  const [method, setMethod] = useState(RU.sell.methods[0]);
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const config = (RU.sell.methodConfigs as any)[method];
  const isValid = Number(amount) > 0 && details.length >= 5;

  const handleCreate = async () => {
    setLoading(true);
    const res = await Api.createOrder({ network, asset, method, amount, details, bank });
    alert(res.success ? "Заявка создана" : res.message);
    setLoading(false);
  };

  return (
    <div className="page-container py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{RU.sell.title}</h1>
      <div className="card-dark space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="label">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div><label className="label">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div><label className="label">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div><label className="label">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base font-bold" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div><label className="label">{config.label}</label><input type="text" placeholder={config.placeholder} className="input-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div><label className="label">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        <button onClick={handleCreate} disabled={!isValid || loading} className={`btn-secondary w-full md:w-80 mx-auto ${!isValid ? 'opacity-50' : ''}`}>
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
    <div className="min-h-screen text-white">
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} />
      <main className="pt-20">
        {page === 'home' && (
          <div className="page-container py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto">{RU.home.sub}</p>
            <button onClick={() => setPage('sell')} className="btn-primary px-10 py-4 mx-auto">{RU.home.btn}</button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
              {RU.home.steps.map(s => (
                <div key={s.n} className="feature-card !text-left">
                  <div className="text-[#FDB913] text-2xl font-bold mb-2">{s.n}</div>
                  <h3 className="font-bold mb-1">{s.t}</h3>
                  <p className="text-sm text-gray-500">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && (
          <div className="page-container py-12">
            <div className="warning-banner mb-8">
              <p className="text-sm text-[#FDB913]">{RU.common.saveIncognito}</p>
            </div>
            <h1 className="text-2xl font-bold mb-8">{RU.profile.title}</h1>
            <div className="empty-state">
              <p className="text-gray-500">{RU.profile.empty}</p>
            </div>
          </div>
        )}
        {page === 'rewards' && (
          <div className="page-container py-12">
            <h1 className="text-2xl font-bold mb-8">{RU.rewards.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {RU.rewards.stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.i}</div>
                  <div className="stat-value">{s.v}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'auth' && (
          <div className="page-container py-12 flex justify-center">
            <div className="w-full max-w-sm card-dark">
              <div className="tabs-container mb-6">
                <button onClick={() => setMode('login')} className={`btn-tab ${mode === 'login' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.login}</button>
                <button onClick={() => setMode('register')} className={`btn-tab ${mode === 'register' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.register}</button>
              </div>
              <div className="space-y-4">
                <input className="input-base" placeholder="Email" />
                <input className="input-base" type="password" placeholder={RU.auth.placeholders.pass} />
                <button className="btn-primary w-full py-4">{mode === 'login' ? RU.auth.tabs.login : RU.auth.tabs.register}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);