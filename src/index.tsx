import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * ВЫПАДАЮЩИЙ СПИСОК С МГНОВЕННЫМ ПРЫЖКОМ В ЦЕНТР
 */
const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false, aliases = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);
  
  const pageAnchorRef = useRef<HTMLDivElement>(null); // Якорь для прокрутки всей страницы

  const filtered = options.filter((opt: string) => {
    const s = search.toLowerCase().replace(/-/g, '');
    const o = opt.toLowerCase().replace(/-/g, '');
    const a = (aliases[opt] || []).some((alias: string) => alias.toLowerCase().includes(s));
    return o.includes(s) || a;
  });

  useEffect(() => {
    if (isOpen && filtered.length > 0) {
      // Используем небольшую задержку, чтобы браузер успел отрисовать высоту списка
      requestAnimationFrame(() => {
        pageAnchorRef.current?.scrollIntoView({ 
          behavior: 'auto', 
          block: 'end' // Докручиваем НИЗ списка до НИЗА видимой области
        });
      });
    }
  }, [isOpen, filtered.length]);

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
    <div className="relative w-full">
      <input
        type="text" value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={handleBlur} placeholder={placeholder} className={`input-base ${isOpen ? 'relative z-[70]' : ''}`}
      />
      
      {isOpen && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filtered.map((opt: string, i: number) => (
              <button 
                key={i} 
                type="button" 
                onMouseDown={() => handleSelect(opt)} 
                className="w-full text-left px-4 py-3 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0"
              >
                {opt}
              </button>
            ))}
          </div>
          {/* Этот элемент находится ВНЕ абсолютного списка, но ВНУТРИ контейнера. 
              Он растягивает родителя, пока список открыт, и служит целью для скролла страницы. */}
          <div 
            ref={pageAnchorRef} 
            className="absolute top-0 left-0 w-full"
            style={{ height: 'calc(100% + 250px)', pointerEvents: 'none', zIndex: -1 }} 
          />
        </>
      )}
    </div>
  );
};

/**
 * ШАПКА
 */
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

/**
 * ГЛАВНАЯ
 */
const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center">
    <h1 className="text-5xl font-bold mb-6">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
    <p className="text-lg text-[#9CA3AF] mb-10 max-w-2xl mx-auto">{RU.home.sub}</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-10 py-4 text-xl">{RU.home.btn}</button>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
      {RU.home.steps.map(s => (
        <div key={s.n} className="p-6 bg-[#1a1f26] rounded-2xl text-left border border-white/5">
          <div className="text-[#FDB913] text-2xl font-bold mb-2">{s.n}</div>
          <h3 className="font-bold mb-2">{s.t}</h3>
          <p className="text-sm text-[#6B7280]">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * ПРОДАЖА
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

  const validate = () => {
    const d = details.replace(/\s/g, '');
    const isSbp = method.includes('СБП');
    if (method === 'Карта РФ') return d.length === 16;
    if (method === 'ЮMoney') return d.length >= 5;
    return d.length >= 10 && (isSbp ? bank !== '' : true);
  };

  const isValid = Number(amount) > 0 && validate();

  const handleCreateOrder = async () => {
    setLoading(true);
    const res = await Api.createOrder({ network, asset, method, amount, details, bank: method.includes('СБП') ? bank : null });
    alert(res.success ? "Заявка успешно создана!" : res.message);
    if (res.success) { setAmount(''); setDetails(''); }
    setLoading(false);
  };

  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-bold mb-8">{RU.sell.title}</h1>
      <div className="card-dark space-y-8">
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
        <button onClick={handleCreateOrder} disabled={!isValid || loading} className={`btn-secondary md:w-96 mx-auto flex items-center justify-center gap-3 ${(!isValid || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>{loading ? RU.common.loading : RU.sell.submitBtn}</button>
      </div>
    </div>
  );
};

/**
 * ПРОФИЛЬ (ИСТОРИЯ)
 */
const ProfilePage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-8">{RU.profile.title}</h1>
    <div className="flex gap-4 mb-8">
      {Object.entries(RU.profile.tabs).map(([key, label]) => (
        <button key={key} className={`px-6 py-2 rounded-full text-sm font-medium ${key === 'all' ? 'bg-[#FDB913] text-black' : 'bg-[#1a1f26] text-white'}`}>{label}</button>
      ))}
    </div>
    <div className="p-20 text-center bg-[#1a1f26] rounded-3xl border-2 border-dashed border-[#2a3040]">
       <p className="text-[#9CA3AF]">{RU.profile.empty}</p>
    </div>
  </div>
);

/**
 * БОНУСЫ
 */
const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-2">{RU.rewards.title}</h1>
    <p className="text-[#9CA3AF] mb-10">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-6 bg-[#1a1f26] rounded-2xl border border-white/5">
          <div className="text-3xl mb-2">{s.i}</div>
          <div className="text-sm text-[#9CA3AF]">{s.l}</div>
          <div className="text-2xl font-bold">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-6 bg-[#1a1f26] rounded-2xl border border-white/5">
          <div>
            <h3 className="font-bold">{item.t}</h3>
            <p className="text-sm text-[#6B7280]">{item.d}</p>
          </div>
          <div className="text-[#FDB913] font-bold">+{item.p} pts</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * АВТОРИЗАЦИЯ
 */
const AuthPage = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  return (
    <div className="page-container py-12 flex justify-center">
      <div className="card-dark w-full max-w-md">
        <div className="flex bg-black rounded-xl p-1 mb-8">
          <button onClick={() => setTab('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'login' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#6B7280]'}`}>{RU.auth.tabs.login}</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'register' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#6B7280]'}`}>{RU.auth.tabs.register}</button>
        </div>
        <div className="space-y-6">
          <div><label className="label">Email</label><input type="email" placeholder="example@mail.com" className="input-base" /></div>
          <div><label className="label">{RU.auth.placeholders.pass}</label><input type="password" placeholder="••••••••" className="input-base" /></div>
          {tab === 'register' && <div><label className="label">{RU.auth.placeholders.passConfirm}</label><input type="password" placeholder="••••••••" className="input-base" /></div>}
          <button className="btn-primary w-full py-4 mt-4">{tab === 'login' ? RU.auth.tabs.login : RU.auth.tabs.register}</button>
        </div>
      </div>
    </div>
  );
};

/**
 * КОРНЕВОЙ КОМПОНЕНТ
 */
const App = () => {
  const [page, setPage] = useState<Page>(() => {
    const s = localStorage.getItem('currentPage');
    return (s && PAGES.includes(s as Page)) ? (s as Page) : 'home';
  });
  
  useEffect(() => { 
    localStorage.setItem('currentPage', page);
    window.scrollTo(0, 0); // Сброс скролла при переходе между страницами
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#FDB913] selection:text-black">
      <Navbar page={page} setPage={setPage} />
      <main className="pt-16 pb-20">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && <AuthPage />}
      </main>
      <footer className="py-10 border-t border-[#1a1f26] text-center text-sm text-[#4B5563]">
        <p>© 2026 {RU.common.exchangeName}. {RU.common.saveIncognito}</p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}