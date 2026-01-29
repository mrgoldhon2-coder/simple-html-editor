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
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt: string) => {
    const s = search.toLowerCase().replace(/-/g, '');
    const o = opt.toLowerCase().replace(/-/g, '');
    return o.includes(s) || (aliases[opt] || []).some((a: string) => a.toLowerCase().includes(s));
  });

  useEffect(() => { if (!isOpen) { setInputValue(value); setPreviousValue(value); } }, [value, isOpen]);

  useEffect(() => {
    if (filtered.length === 1 && search.length >= 3) {
      handleSelect(filtered[0]);
      inputRef.current?.blur();
    }
  }, [filtered, search]);

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
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="logo">P2P</div>
          <span className="font-bold">{RU.common.exchangeName}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`nav-link ${page === l.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-sm">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col gap-1.5 p-2 z-50">
            <span className={`block w-6 h-0.5 bg-white transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white ${mobileOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#1a1f26] py-4 px-4 flex flex-col gap-2 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl text-sm font-medium ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF]'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const HomePage = ({ setPage }: any) => (
  <div className="page-container py-12 sm:py-20">
    <div className="text-center mb-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
      <p className="text-base sm:text-lg text-[#9CA3AF] mb-8 max-w-2xl mx-auto">{RU.home.sub}</p>
      <button onClick={() => setPage('sell')} className="btn-primary px-8 py-4 mx-auto text-lg">{RU.home.btn} <span>→</span></button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20">
      {RU.home.steps.map(s => (
        <div key={s.n} className="text-center">
          <div className="step-number">{s.n}</div>
          <h3 className="font-semibold mb-2">{s.t}</h3>
          <p className="text-sm text-[#6B7280]">{s.d}</p>
        </div>
      ))}
    </div>
    <div className="card-dark grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {RU.home.features.map((f, i) => (
        <div key={i} className="feature-card">
          <div className="text-4xl mb-3">{f.i}</div>
          <h3 className="font-semibold mb-2">{f.t}</h3>
          <p className="text-sm text-[#6B7280]">{f.d}</p>
        </div>
      ))}
    </div>
  </div>
);

const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
const assetsMap: any = { 
  // Основные: TON и USDT. Доп: Notcoin (NOT) и Dogs (DOGS) — лидеры экосистемы
  'TON (The Open Network)': ['USDT', 'TON', 'NOT', 'DOGS'], 
  
  // Основные: TRX и USDT. Доп: USDC и стабильный стейблкоин USDD
  'Tron (TRC20)': ['USDT', 'TRX', 'USDC', 'USDD'], 
  
  // Основные: ETH и USDT. Доп: USDC и обернутый биткоин (WBTC)
  'Ethereum (ERC20)': ['ETH', 'USDT', 'USDC', 'WBTC', 'LINK'], 
  
  // Основные: BNB и USDT. Доп: FDUSD (основной стейбл Бинанса), CAKE и TWT
  'BNB Smart Chain (BEP20)': ['BNB', 'USDT', 'FDUSD', 'CAKE', 'TWT'] 
};
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState('USDT');
  const [method, setMethod] = useState(RU.sell.methods[0]);
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  // Получаем конфиг текущего метода из локализации
  const currentMethodConfig = (RU.sell.methodConfigs as any)[method];

  // Логика валидации (остается в коде, так как это бизнес-логика)
  const validateDetails = () => {
    const d = details.replace(/\s/g, '');
    if (method === 'Карта РФ') return d.length === 16;
    if (method === 'ЮMoney') return d.length >= 5;
    return d.length >= 10; // Для СБП и Мобильных
  };

  const isValid = Number(amount) > 0 && validateDetails() && (method.includes('СБП') ? bank !== '' : true);

  const handleCreateOrder = async () => {
    setLoading(true);
    const result = await Api.createOrder({ network, asset, method, amount, details, bank: method.includes('СБП') ? bank : null });
    if (result.success) {
      alert("Заявка создана!");
      setAmount(''); setDetails('');
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-bold mb-8">{RU.sell.title}</h1>
      <div className="card-dark space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">{RU.sell.labels.network}</label>
            <SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} />
          </div>
          <div>
            <label className="label">{RU.sell.labels.asset}</label>
            <SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network] || ['USDT']} />
          </div>
          <div>
            <label className="label">{RU.sell.labels.method}</label>
            <SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} />
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div>
            <label className="label">{RU.sell.labels.amount} {asset}</label>
            <input 
              type="text" inputMode="decimal" placeholder="0.00" 
              className="input-base text-lg font-bold"
              value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} 
            />
          </div>
          <div>
            <label className="label">{currentMethodConfig.label}</label>
            <input 
              type="text" placeholder={currentMethodConfig.placeholder} className="input-base"
              value={details} onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          {method.includes('СБП') && (
            <div>
              <label className="label">{RU.sell.labels.bank}</label>
              <SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} />
            </div>
          )}
        </div>

        <button 
          onClick={handleCreateOrder} disabled={!isValid || loading}
          className={`btn-secondary md:w-96 mx-auto flex items-center justify-center gap-3 ${(!isValid || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{RU.common.loading}</> : RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const ProfilePage = ({ setPage }: any) => {
  const [tab, setTab] = useState('all');
  return (
    <div className="page-container py-12">
      <div className="warning-banner">
        <span className="text-2xl">🔒</span>
        <p className="text-sm">{RU.common.saveIncognito}</p>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{RU.profile.title}</h1>
        <button onClick={() => setPage('sell')} className="btn-primary">{RU.profile.createBtn}</button>
      </div>
      <div className="tabs-container mb-8">
        {['all', 'active', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn-tab ${tab === t ? 'btn-tab-active' : 'btn-tab-inactive'}`}>
            {t === 'all' ? RU.profile.tabs.all : t === 'active' ? RU.profile.tabs.active : RU.profile.tabs.completed}
          </button>
        ))}
      </div>
      <div className="empty-state">
        <div className="empty-icon"><span className="text-4xl">📋</span></div>
        <p className="text-[#9CA3AF]">{RU.profile.empty}</p>
      </div>
    </div>
  );
};

const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-8">{RU.rewards.title}</h1>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon">{s.i}</div>
          <div className="stat-value">{s.v}</div>
          <div className="stat-label">{s.l}</div>
        </div>
      ))}
    </div>
    <div className="card-dark space-y-4">
      <h2 className="text-xl font-bold mb-6">{RU.rewards.subtitle}</h2>
      {RU.rewards.items.map((r, i) => (
        <div key={i} className="reward-card">
          <div className="flex items-center gap-4">
            <div className="reward-icon">🔒</div>
            <div><div className="font-semibold">{r.t}</div><div className="text-sm text-[#6B7280]">{r.d}</div></div>
          </div>
          <div className="reward-points">+{r.p}</div>
        </div>
      ))}
    </div>
  </div>
);

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  return (
    <div className="page-container py-20 max-w-md mx-auto">
      <div className="tabs-container mb-8">
        <button onClick={() => setMode('login')} className={`btn-tab ${mode === 'login' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.login}</button>
        <button onClick={() => setMode('register')} className={`btn-tab ${mode === 'register' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>{RU.auth.tabs.register}</button>
      </div>
      <div className="card-dark space-y-4">
        <input type="email" placeholder="Email" className="input-base" />
        <input type="password" placeholder={RU.auth.placeholders.pass} className="input-base" />
        {mode === 'register' && <input type="password" placeholder={RU.auth.placeholders.passConfirm} className="input-base" />}
        <button className="btn-primary w-full py-4 mt-4">{mode === 'login' ? RU.auth.tabs.login : RU.auth.tabs.register}</button>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState<Page>(() => {
    const s = localStorage.getItem('currentPage');
    return (s && PAGES.includes(s as Page)) ? (s as Page) : 'home';
  });
  useEffect(() => { localStorage.setItem('currentPage', page); }, [page]);
  return (
    <div className="min-h-screen">
      <Navbar page={page} setPage={setPage} />
      <main className="pt-20">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage setPage={setPage} />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && <AuthPage />}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);