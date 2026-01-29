import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * ВЫПАДАЮЩИЙ СПИСОК
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

  useEffect(() => {
    if (isOpen && filtered.length > 0) {
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          dropdownRef.current.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center' 
          });
        }
      });
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
        className={`input-base ${isOpen ? 'relative z-[90] border-[#FDB913]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80]" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[90] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-4 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0 active:bg-[#FDB913] active:text-black transition-none">
                {opt}
              </button>
            ))}
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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-[#1a1f26] z-[1000] flex items-center">
      <div className="page-container w-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="logo text-[#FDB913] font-black">P2P</div>
          <span className="font-bold text-white uppercase text-sm">{RU.common.exchangeName}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`nav-link ${page === l.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-6 text-xs font-bold uppercase">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white outline-none">
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black border-b border-[#1a1f26] p-4 flex flex-col gap-2 shadow-2xl z-[110]">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

/**
 * КОНТЕНТ СТРАНИЦ
 */
const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-6">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
    <p className="text-lg text-[#9CA3AF] mb-10 max-w-2xl mx-auto font-medium">{RU.home.sub}</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-12 py-4 text-xl font-bold uppercase">{RU.home.btn}</button>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
      {RU.home.steps.map(s => (
        <div key={s.n} className="p-8 bg-[#1a1f26] rounded-3xl text-left border border-white/5">
          <div className="text-[#FDB913] text-2xl font-bold mb-3">{s.n}</div>
          <h3 className="font-bold mb-2 text-white uppercase text-sm">{s.t}</h3>
          <p className="text-xs text-[#6B7280]">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
);

const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  const assetsMap: any = { 
    'TON (The Open Network)': ['TON', 'USDT', 'NOT', 'DOGS'], 
    'Tron (TRC20)': ['USDT', 'TRX', 'USDC'], 
    'Ethereum (ERC20)': ['ETH', 'USDT', 'USDC'], 
    'BNB Smart Chain (BEP20)': ['BNB', 'USDT'] 
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
    alert(res.success ? "Заявка успешно создана!" : res.message);
    setLoading(false);
  };

  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-bold mb-8 text-white uppercase">{RU.sell.title}</h1>
      <div className="card-dark space-y-8 p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="label">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div><label className="label">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div><label className="label">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div><label className="label">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base font-bold text-lg" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div><label className="label">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div><label className="label">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        <button onClick={handleCreateOrder} disabled={!isValid || loading} className={`btn-secondary w-full md:w-96 mx-auto h-16 flex items-center justify-center gap-3 font-bold ${(!isValid || loading) ? 'opacity-20' : 'hover:scale-105 active:scale-95'}`}>
          {loading ? RU.common.loading : RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-8 text-white">{RU.profile.title}</h1>
    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
      {Object.entries(RU.profile.tabs).map(([k, v]) => (
        <button key={k} className={`px-8 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap ${k === 'all' ? 'bg-[#FDB913] text-black' : 'bg-[#1a1f26] text-white hover:bg-[#222]'}`}>{v}</button>
      ))}
    </div>
    <div className="p-32 text-center bg-[#1a1f26] rounded-[40px] border border-white/5 border-dashed">
      <p className="text-[#4B5563] font-bold uppercase text-xs">{RU.profile.empty}</p>
    </div>
  </div>
);

const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-2 text-white">{RU.rewards.title}</h1>
    <p className="text-[#6B7280] mb-10 font-medium">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-8 bg-[#1a1f26] rounded-3xl border border-white/5">
          <div className="text-sm text-[#6B7280] font-bold uppercase mb-2">{s.l}</div>
          <div className="text-3xl font-bold text-white">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-8 bg-[#1a1f26] rounded-3xl border border-white/5 hover:border-[#FDB913]/30">
          <div>
            <h3 className="font-bold text-white uppercase text-sm mb-1">{item.t}</h3>
            <p className="text-xs text-[#6B7280]">{item.d}</p>
          </div>
          <div className="text-[#FDB913] font-black">+{item.p} PTS</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * ГЛАВНЫЙ КОМПОНЕНТ APP
 */
const App = () => {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('currentPage') as Page) || 'home');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    localStorage.setItem('currentPage', page); 
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      <Navbar page={page} setPage={setPage} />
      
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-16 touch-pan-y" 
        id="main-scroll-root"
      >
        <div className="pb-32">
          {page === 'home' && <HomePage setPage={setPage} />}
          {page === 'sell' && <SellPage />}
          {page === 'profile' && <ProfilePage />}
          {page === 'rewards' && <RewardsPage />}
          {page === 'auth' && (
            <div className="page-container py-20 flex justify-center">
              <div className="card-dark w-full max-w-md p-12 bg-[#1a1f26] rounded-[40px]">
                <h2 className="text-3xl font-black mb-8 text-center uppercase">Login</h2>
                <div className="space-y-4">
                  <input className="input-base" placeholder="EMAIL" />
                  <input className="input-base" type="password" placeholder="PASSWORD" />
                  <button className="btn-primary w-full py-5 font-bold uppercase">Authorize</button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="py-16 border-t border-white/5 text-center">
          <p className="text-[10px] text-[#333] font-bold uppercase tracking-[0.4em]">
            © 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}
          </p>
        </footer>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);