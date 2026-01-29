import "./index.css";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

const GlobalStyles = () => (
  <style>{`
    /* Фикс белого фона на мобильных и при скролле */
    html, body, #root {
      background-color: #000000;
      margin: 0;
      padding: 0;
      min-height: 100%;
      overscroll-behavior-y: none; /* Убирает эффект подпрыгивания, если нужно */
    }

    @media (min-width: 768px) {
      * {
        scrollbar-width: thin;
        scrollbar-color: #374151 #0a0a0a;
      }
      *::-webkit-scrollbar {
        width: 16px;
        height: 16px;
      }
      *::-webkit-scrollbar-track {
        background: #0a0a0a;
      }
      *::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 8px;
      }
      *::-webkit-scrollbar-thumb:hover {
        background: #4B5563;
      }
    }
    html {
      overflow-y: scroll;
    }
  `}</style>
);

const SearchableDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Выберите...', 
  allowCustom = false 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder?: string;
  allowCustom?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  
  // Ref для мгновенной фиксации выбора (исправляет баг сброса)
  const isSelectionMade = useRef(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(opt => 
    opt.toLowerCase().replace(/-/g, '').includes(search.toLowerCase().replace(/-/g, ''))
  );

  useEffect(() => {
    if (!isOpen) {
      setInputValue(value);
      setPreviousValue(value);
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (filtered.length === 1 && search.length >= 3) {
      const selected = filtered[0];
      isSelectionMade.current = true;
      setInputValue(selected);
      setPreviousValue(selected);
      onChange(selected);
      setSearch('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [filtered, search, onChange]);

  const handleInputChange = (val: string) => {
    isSelectionMade.current = false;
    setSearch(val);
    setInputValue(val);
    setIsOpen(true);
  };

  const handleFocus = () => {
    isSelectionMade.current = false;
    setPreviousValue(inputValue);
    setSearch('');
    setInputValue('');
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    isSelectionMade.current = true;
    setInputValue(opt);
    setPreviousValue(opt);
    onChange(opt);
    setSearch('');
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (isSelectionMade.current) {
        setIsOpen(false);
        setSearch('');
        return;
      }

      if (!inputValue || (!options.includes(inputValue) && !allowCustom)) {
        setInputValue(previousValue);
      } else {
        onChange(inputValue);
        setPreviousValue(inputValue);
      }

      setIsOpen(false);
      setSearch('');
    }, 200);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 focus:border-[#FDB913] focus:outline-none transition ${isOpen ? 'relative z-[70]' : ''}`}
      />
      
      {isOpen && filtered.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-200"
          onMouseDown={(e) => e.preventDefault()}
        />
      )}
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[70] w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-48 md:max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(opt)}
              className="w-full text-left px-4 py-3 hover:bg-[#2a3040] transition text-sm border-b border-[#2a3040] last:border-b-0"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem('currentPage');
    return (saved && PAGES.includes(saved as Page)) ? saved as Page : 'home';
  });

  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-black text-white selection:bg-[#FDB913]/30">
        <Navbar page={page} setPage={setPage} />
        <main className="pt-20">
          {page === 'home' && <HomePage setPage={setPage} />}
          {page === 'sell' && <SellPage />}
          {page === 'profile' && <ProfilePage setPage={setPage} />}
          {page === 'rewards' && <RewardsPage />}
          {page === 'auth' && <AuthPage />}
        </main>
      </div>
    </>
  );
};

// ... (остальные компоненты Navbar, HomePage, SellPage и т.д. остаются без изменений)
// Копирую их из предыдущего контекста для полноты файла:

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FDB913] rounded-lg flex items-center justify-center text-black font-bold text-sm">P2P</div>
          <span className="text-base sm:text-lg font-bold">P2P Express</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setPage('home')} className={`text-sm font-medium transition ${page === 'home' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Главная</button>
          <button onClick={() => setPage('sell')} className={`text-sm font-medium transition ${page === 'sell' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Продать</button>
          <button onClick={() => setPage('profile')} className={`text-sm font-medium transition ${page === 'profile' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Заявки</button>
          <button onClick={() => setPage('rewards')} className={`text-sm font-medium transition ${page === 'rewards' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Награды</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="bg-[#FDB913] text-black px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#E5A712] transition">Войти</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center">
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1a1f26]">
          <div className="px-4 py-2 space-y-1">
            {['home', 'sell', 'profile', 'rewards'].map((p) => (
              <button key={p} onClick={() => { setPage(p as Page); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${page === p ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF] hover:bg-[#1a1f26] hover:text-white'}`}>
                {p === 'home' ? 'Главная' : p === 'sell' ? 'Продать' : p === 'profile' ? 'Заявки' : 'Награды'}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const HomePage = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
    <div className="text-center mb-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Продавайте криптовалюту <span className="text-[#FDB913]">быстро и выгодно</span></h1>
      <p className="text-base sm:text-lg text-[#9CA3AF] mb-8 max-w-2xl mx-auto">Мгновенный обмен TON и USDT на рубли с лучшим курсом и моментальными выплатами</p>
      <button onClick={() => setPage('sell')} className="bg-[#FDB913] text-black px-8 py-4 rounded-xl font-semibold hover:bg-[#E5A712] transition inline-flex items-center gap-2">Продать криптовалюту <span>→</span></button>
    </div>
  </div>
);

const SellPage = () => {
  const networks = ['TON (The Open Network)', 'Tron (TRC20)', 'Ethereum (ERC20)', 'BSC (BEP20)'];
  const banks = ['Сбербанк', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Газпромбанк', 'Райффайзенбанк', 'Совкомбанк', 'МТС Банк', 'Яндекс Банк', 'Озон Банк'];
  const [network, setNetwork] = useState('TON (The Open Network)');
  const [bank, setBank] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Продать криптовалюту</h1>
      <div className="bg-[#0f1419] border border-[#1e2430] rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Сеть</label>
            <SearchableDropdown value={network} onChange={setNetwork} options={networks} />
          </div>
          <div>
            <label className="text-sm font-medium mb-3 block">Банк (СБП)</label>
            <SearchableDropdown value={bank} onChange={setBank} options={banks} allowCustom={true} placeholder="Введите название банка" />
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="w-full md:w-96 bg-[#C89000] text-white py-4 rounded-xl font-semibold hover:bg-[#B8860B] transition">Создать заявку</button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ setPage }: { setPage: (p: Page) => void }) => <div className="p-8 text-center text-[#9CA3AF]">Раздел заявок пуст</div>;
const RewardsPage = () => <div className="p-8 text-center text-[#9CA3AF]">Раздел наград в разработке</div>;
const AuthPage = () => <div className="p-8 text-center text-[#9CA3AF]">Форма авторизации</div>;

createRoot(document.getElementById('root')!).render(<App />);