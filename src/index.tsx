import "./index.css";
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

const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt: string) => 
    opt.toLowerCase().replace(/-/g, '').includes(search.toLowerCase().replace(/-/g, ''))
  );

  useEffect(() => { if (!isOpen) { setInputValue(value); setPreviousValue(value); } }, [value, isOpen]);

  useEffect(() => {
    if (filtered.length === 1 && search.length >= 3) {
      const selected = filtered[0];
      isSelectionMade.current = true;
      setInputValue(selected); setPreviousValue(selected);
      onChange(selected); setSearch(''); setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [filtered, search]);

  const handleBlur = () => {
    setTimeout(() => {
      if (isSelectionMade.current) { setIsOpen(false); setSearch(''); return; }
      if (!inputValue || (!options.includes(inputValue) && !allowCustom)) { setInputValue(previousValue); }
      else { onChange(inputValue); setPreviousValue(inputValue); }
      setIsOpen(false); setSearch('');
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : inputValue}
        onChange={e => { isSelectionMade.current = false; setSearch(e.target.value); setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => { isSelectionMade.current = false; setPreviousValue(inputValue); setSearch(''); setInputValue(''); setIsOpen(true); }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`input-base ${isOpen ? 'relative z-[70]' : ''}`}
      />
      {isOpen && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onMouseDown={e => e.preventDefault()} />
          <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {filtered.map((opt: string, i: number) => (
              <button key={i} type="button" onMouseDown={() => { isSelectionMade.current = true; setInputValue(opt); setPreviousValue(opt); onChange(opt); setSearch(''); setIsOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0">{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = ({ page, setPage }: any) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = [{id: 'home', l: 'Главная'}, {id: 'sell', l: 'Продать'}, {id: 'profile', l: 'Заявки'}, {id: 'rewards', l: 'Награды'}];

  return (
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FDB913] rounded-lg flex items-center justify-center text-black font-bold text-sm">P2P</div>
          <span className="font-bold">P2P Express</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <button key={link.id} onClick={() => setPage(link.id)} className={`nav-link ${page === link.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{link.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-sm">Войти</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden space-y-1.5 p-2">
            <span className={`block w-6 h-0.5 bg-white transition ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const HomePage = ({ setPage }: any) => (
  <div className="page-container py-20 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-6">Продавайте криптовалюту <span className="text-[#FDB913]">быстро и выгодно</span></h1>
    <p className="text-[#9CA3AF] mb-8 max-w-2xl mx-auto">Мгновенный обмен TON и USDT на рубли с моментальными выплатами</p>
    <button onClick={() => setPage('sell')} className="btn-primary px-8 py-4 mx-auto">Продать криптовалюту <span>→</span></button>
  </div>
);

const SellPage = () => {
  const [method, setMethod] = useState('СБП');
  const [asset, setAsset] = useState('USDT');
  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-bold mb-8">Продать криптовалюту</h1>
      <div className="card-dark space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="text-sm font-medium mb-3 block">Сеть</label><SearchableDropdown value="TON (The Open Network)" options={['TON', 'TRC20', 'ERC20']} /></div>
          <div><label className="text-sm font-medium mb-3 block">Актив</label><SearchableDropdown value={asset} onChange={setAsset} options={['USDT', 'TON']} /></div>
          <div><label className="text-sm font-medium mb-3 block">Способ оплаты</label><SearchableDropdown value={method} onChange={setMethod} options={['СБП', 'Карта', 'ЮМани']} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-sm font-medium mb-3 block">Сумма</label><input type="text" placeholder="0.00" className="input-base text-lg" /></div>
          <div><label className="text-sm font-medium mb-3 block">Реквизиты</label><input type="text" placeholder="Введите данные" className="input-base" /></div>
        </div>
        <button className="btn-secondary md:w-96 mx-auto block">Создать заявку</button>
      </div>
    </div>
  );
};

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  return (
    <div className="page-container py-20 max-w-md mx-auto">
      <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-8">
        <button onClick={() => setMode('login')} className={`btn-tab ${mode === 'login' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>Вход</button>
        <button onClick={() => setMode('register')} className={`btn-tab ${mode === 'register' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>Регистрация</button>
      </div>
      <div className="space-y-4">
        <input type="email" placeholder="Email" className="input-base py-3" />
        <input type="password" placeholder="Пароль" className="input-base py-3" />
        <button className="btn-primary w-full py-3">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState<Page>('home');
  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen text-white">
        <Navbar page={page} setPage={setPage} />
        <main className="pt-20">
          {page === 'home' && <HomePage setPage={setPage} />}
          {page === 'sell' && <SellPage />}
          {page === 'auth' && <AuthPage />}
          {['profile', 'rewards'].includes(page) && <div className="text-center py-20 text-gray-500">В разработке</div>}
        </main>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);