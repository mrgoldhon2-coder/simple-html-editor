import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * ВЫПАДАЮЩИЙ СПИСОК
 * Исправлено: Центрирование с вертикальным смещением вверх для вмещения всех 5 элементов
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
      const timer = setTimeout(() => {
        if (dropdownRef.current) {
          // Сначала центрируем инпут
          dropdownRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Через мгновение после начала анимации смещаем экран чуть ниже, 
          // чтобы инпут поднялся выше центра и влезло 5 элементов списка
          setTimeout(() => {
            window.scrollBy({
              top: 120, // Сдвигаем вьюпорт вниз на 120px, поднимая контент выше
              behavior: 'smooth'
            });
          }, 50);
        }
      }, 150);
      return () => clearTimeout(timer);
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
    <div ref={dropdownRef} className="relative w-full">
      <input
        type="text" value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={handleBlur} placeholder={placeholder} 
        className={`input-base ${isOpen ? 'relative z-[70] border-[#FDB913]' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-[250px] overflow-y-auto">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-4 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0 active:bg-[#2a3040]">
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
 * НАВБАР
 */
const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="w-full bg-black border-b border-[#1a1f26] relative z-[100]">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="logo font-black text-[#FDB913]">P2P</div>
          <span className="font-bold text-white uppercase text-sm tracking-tight">{RU.common.exchangeName}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`nav-link ${page === l.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{l.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-sm font-bold uppercase">{RU.auth.loginBtn}</button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white">
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#1a1f26] p-4 flex flex-col gap-2 shadow-2xl">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id as Page); setMobileOpen(false); }} className={`w-full text-left p-4 rounded-xl ${page === l.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-gray-400'}`}>{l.l}</button>
          ))}
        </div>
      )}
    </header>
  );
};

const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-6">{RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span></h1>
    <p className="text-lg text-[#9CA3AF] mb-10 max-w-2xl mx-auto">{RU.home.sub}</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-10 py-4 text-xl font-bold uppercase">{RU.home.btn}</button>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
      {RU.home.steps.map(s => (
        <div key={s.n} className="p-6 bg-[#1a1f26] rounded-2xl text-left border border-white/5">
          <div className="text-[#FDB913] text-2xl font-bold mb-2">{s.n}</div>
          <h3 className="font-bold mb-2 text-white">{s.t}</h3>
          <p className="text-sm text-[#6B7280]">{s.d}</p>
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
      <h1 className="text-3xl font-bold mb-8 text-white">{RU.sell.title}</h1>
      <div className="card-dark space-y-8 p-6 md:p-10 bg-[#11141a] rounded-3xl border border-white/5">
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
        <button onClick={handleCreateOrder} disabled={!isValid || loading} className={`btn-secondary w-full md:w-96 mx-auto h-16 flex items-center justify-center gap-3 font-bold transition-all ${(!isValid || loading) ? 'opacity-30' : 'hover:scale-105 active:scale-95'}`}>
          {loading ? RU.common.loading : RU.sell.submitBtn}
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-8 text-white">{RU.profile.title}</h1>
    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
      {Object.entries(RU.profile.tabs).map(([k, v]) => (
        <button key={k} className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap ${k === 'all' ? 'bg-[#FDB913] text-black font-bold' : 'bg-[#1a1f26] text-white'}`}>{v}</button>
      ))}
    </div>
    <div className="p-20 text-center bg-[#1a1f26] rounded-3xl border border-white/5 border-dashed">
      <p className="text-[#9CA3AF] font-medium">{RU.profile.empty}</p>
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
          <div className="text-3xl mb-2">{s.i}</div>
          <div className="text-sm text-[#6B7280] font-bold uppercase mb-1">{s.l}</div>
          <div className="text-2xl font-bold text-white">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-6 bg-[#1a1f26] rounded-2xl border border-white/5">
          <div>
            <h3 className="font-bold text-white">{item.t}</h3>
            <p className="text-sm text-[#6B7280]">{item.d}</p>
          </div>
          <div className="text-[#FDB913] font-bold">+{item.p} PTS</div>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem('currentPage') as Page) || 'home');
  useEffect(() => { localStorage.setItem('currentPage', page); window.scrollTo(0, 0); }, [page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#FDB913] selection:text-black">
      <Navbar page={page} setPage={setPage} />
      
      <main className="pb-24">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && (
          <div className="page-container py-12 flex justify-center">
            <div className="card-dark w-full max-w-md p-10 bg-[#1a1f26] rounded-3xl">
              <h2 className="text-2xl font-bold mb-8 text-center text-white uppercase">Login</h2>
              <div className="space-y-4">
                <input className="input-base" placeholder="Email" />
                <input className="input-base" type="password" placeholder="Пароль" />
                <button className="btn-primary w-full py-4 uppercase font-bold text-black bg-[#FDB913] rounded-xl">Войти</button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 border-t border-[#1a1f26] text-center text-xs text-[#4B5563]">
        <p>© 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}</p>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);