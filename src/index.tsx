import "./index.css";
import { RU } from "./locales";
import { Api } from "./api";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

/**
 * ВЫПАДАЮЩИЙ СПИСОК (Исправленный скролл страницы к центру)
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

  // Мгновенная центровка страницы
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 60);
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
        className={`input-base transition-all ${isOpen ? 'relative z-[70] border-[#FDB913] ring-2 ring-[#FDB913]/20' : ''}`}
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
            {filtered.length > 0 ? filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-4 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0 active:bg-[#FDB913] active:text-black transition-colors">
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
 * ГЛАВНАЯ СТРАНИЦА
 */
const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center">
    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight uppercase italic">
      {RU.home.title} <span className="text-[#FDB913]">{RU.home.accent}</span>
    </h1>
    <p className="text-gray-400 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">{RU.home.sub}</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-16 py-6 text-xl font-black uppercase italic tracking-widest hover:scale-105 transition-transform shadow-xl shadow-[#FDB913]/20">
      {RU.home.btn}
    </button>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32">
      {RU.home.steps.map(s => (
        <div key={s.n} className="p-8 bg-[#111] rounded-3xl border border-white/5 text-left group hover:border-[#FDB913]/30 transition-all">
          <div className="text-[#FDB913] text-4xl font-black mb-4 opacity-30 italic">{s.n}</div>
          <h3 className="font-black text-white uppercase text-sm mb-2">{s.t}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * СТРАНИЦА ОБМЕНА
 */
const SellPage = () => {
  const networks = RU.sell.networks.map(n => n.display);
  const networkAliases: any = RU.sell.networks.reduce((acc, n) => ({...acc, [n.display]: n.aliases}), {});
  const assetsMap: any = { 
    'TON (The Open Network)': ['TON', 'USDT', 'NOT', 'DOGS', 'REDI'], 
    'Tron (TRC20)': ['USDT', 'TRX', 'USDC'], 
    'Ethereum (ERC20)': ['ETH', 'USDT', 'USDC', 'WBTC'], 
    'BNB Smart Chain (BEP20)': ['BNB', 'USDT', 'CAKE'] 
  };
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState(assetsMap[networks[0]][0]);
  const [method, setMethod] = useState(RU.sell.methods[0]);
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const currentConfig = (RU.sell.methodConfigs as any)[method];

  // Валидация полей
  const isDetailsValid = details.replace(/\s/g, '').length >= (method === 'Карта РФ' ? 16 : 5);
  const isBankValid = method.includes('СБП') ? bank.length > 2 : true;
  const isValid = Number(amount) > 0 && isDetailsValid && isBankValid;

  const handleCreateOrder = async () => {
    setLoading(true);
    const res = await Api.createOrder({ network, asset, method, amount, details, bank });
    alert(res.success ? "Заявка успешно создана!" : res.message);
    setLoading(false);
  };

  return (
    <div className="page-container py-12 animate-in fade-in slide-in-from-bottom-2">
      <h1 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">{RU.sell.title}</h1>
      <div className="card-dark p-6 md:p-12 space-y-10 border border-white/5 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.network}</label><SearchableDropdown value={network} onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} options={networks} aliases={networkAliases} /></div>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.asset}</label><SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network]} /></div>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.method}</label><SearchableDropdown value={method} onChange={(v: string) => { setMethod(v); setDetails(''); }} options={RU.sell.methods} /></div>
        </div>
        <div className={`grid grid-cols-1 ${method.includes('СБП') ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 relative z-10`}>
          <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.amount} {asset}</label><input type="text" placeholder="0.00" className="input-base font-bold text-xl text-[#FDB913]" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
          <div className="space-y-3"><label className="label opacity-50">{currentConfig.label}</label><input type="text" placeholder={currentConfig.placeholder} className="input-base" value={details} onChange={e => setDetails(e.target.value)} /></div>
          {method.includes('СБП') && <div className="space-y-3"><label className="label opacity-50">{RU.sell.labels.bank}</label><SearchableDropdown value={bank} onChange={setBank} options={RU.sell.banks} allowCustom={true} placeholder={RU.sell.placeholders.bank} /></div>}
        </div>
        <div className="pt-6 flex justify-center">
          <button onClick={handleCreateOrder} disabled={!isValid || loading} className={`btn-secondary w-full md:w-96 h-16 text-lg font-black uppercase tracking-widest transition-all ${(!isValid || loading) ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#FDB913] hover:text-black hover:scale-[1.02] active:scale-95'}`}>
            {loading ? RU.common.loading : RU.sell.submitBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ИСТОРИЯ СДЕЛОК
 */
const ProfilePage = () => (
  <div className="page-container py-12 animate-in fade-in duration-700">
    <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">{RU.profile.title}</h1>
    <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
      {Object.entries(RU.profile.tabs).map(([k, v]) => (
        <button key={k} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition ${k === 'all' ? 'bg-[#FDB913] text-black' : 'bg-[#1a1f26] text-white hover:bg-[#222]'}`}>{v}</button>
      ))}
    </div>
    <div className="flex flex-col items-center justify-center py-40 bg-[#0a0a0a] rounded-[40px] border border-white/5 border-dashed">
      <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-6 text-3xl opacity-20 italic font-black">?</div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{RU.profile.empty}</p>
    </div>
  </div>
);

/**
 * БОНУСНАЯ ПРОГРАММА
 */
const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">{RU.rewards.title}</h1>
    <p className="text-gray-500 mb-12 font-bold text-sm uppercase tracking-widest">{RU.rewards.subtitle}</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {RU.rewards.stats.map((s, i) => (
        <div key={i} className="p-10 bg-[#1a1f26] rounded-[32px] border border-white/5 group hover:border-[#FDB913]/40 transition-all">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2 font-black">{s.l}</div>
          <div className="text-4xl font-black text-white italic">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      {RU.rewards.items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-8 bg-[#111] rounded-3xl border border-white/5 hover:bg-[#161616] transition-colors">
          <div className="flex items-center gap-8">
            <div className="text-3xl font-black text-[#FDB913] italic opacity-40">0{i+1}</div>
            <div>
              <h3 className="font-black text-white uppercase text-sm tracking-tight">{item.t}</h3>
              <p className="text-xs text-gray-500 font-medium">{item.d}</p>
            </div>
          </div>
          <div className="text-[#FDB913] font-black italic">+{item.p} PTS</div>
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
  useEffect(() => { localStorage.setItem('currentPage', page); window.scrollTo(0, 0); }, [page]);

  const Navbar = () => (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 z-[100]">
      <div className="page-container h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="bg-[#FDB913] text-black px-2 py-0.5 rounded font-black text-[10px]">FAST</div>
          <span className="font-black text-white tracking-tighter uppercase text-lg italic">P2P</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {RU.nav.map(l => (
            <button key={l.id} onClick={() => setPage(l.id as Page)} className={`text-[10px] uppercase font-black tracking-[0.25em] transition ${page === l.id ? 'text-[#FDB913]' : 'text-gray-500 hover:text-white'}`}>{l.l}</button>
          ))}
        </div>
        <button onClick={() => setPage('auth')} className="btn-primary py-3 px-8 text-[10px] uppercase font-black tracking-widest italic">{RU.auth.loginBtn}</button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FDB913] selection:text-black antialiased font-sans">
      <Navbar />
      <main className="pt-24 pb-32">
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && (
          <div className="page-container py-20 flex justify-center">
            <div className="card-dark w-full max-w-md p-12 border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">{RU.auth.tabs.login}</h2>
              <div className="space-y-6">
                <input className="input-base" placeholder="EMAIL ADDRESS" />
                <input className="input-base" type="password" placeholder="PASSWORD" />
                <button className="btn-primary w-full py-5 font-black uppercase italic tracking-widest text-lg mt-4">AUTHORIZE</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="py-16 border-t border-white/5 text-center bg-black">
        <div className="text-[10px] text-gray-700 uppercase tracking-[0.5em] font-black">
          © 2026 {RU.common.exchangeName} • {RU.common.saveIncognito}
        </div>
      </footer>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);