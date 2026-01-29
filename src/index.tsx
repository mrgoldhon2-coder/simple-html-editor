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

const SearchableDropdown = ({ value, onChange, options, placeholder = 'Выберите...', allowCustom = false, aliases = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const isSelectionMade = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt: string) => {
    const searchLower = search.toLowerCase().replace(/-/g, '');
    const optLower = opt.toLowerCase().replace(/-/g, '');
    
    if (optLower.includes(searchLower)) return true;
    
    const optAliases = aliases[opt] || [];
    return optAliases.some((alias: string) => alias.toLowerCase().includes(searchLower));
  });

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
      if (isSelectionMade.current) { isSelectionMade.current = false; setIsOpen(false); setSearch(''); return; }
      if (!inputValue || (!options.includes(inputValue) && !allowCustom)) { setInputValue(previousValue); }
      else { onChange(inputValue); setPreviousValue(inputValue); }
      setIsOpen(false); setSearch('');
    }, 200);
  };

  const handleSelect = (opt: string) => {
    isSelectionMade.current = true;
    setInputValue(opt);
    setPreviousValue(opt);
    onChange(opt);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
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
              <button key={i} type="button" onMouseDown={() => handleSelect(opt)} className="w-full text-left px-4 py-3 hover:bg-[#2a3040] text-sm border-b border-[#2a3040] last:border-b-0 text-white">{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = [{ id: 'home', l: 'Главная' }, { id: 'sell', l: 'Продать' }, { id: 'profile', l: 'Заявки' }, { id: 'rewards', l: 'Награды' }];

  return (
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="page-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="logo">P2P</div>
          <span className="font-bold">P2P Express</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <button key={link.id} onClick={() => setPage(link.id as Page)} className={`nav-link ${page === link.id ? 'nav-link-active' : 'nav-link-inactive'}`}>{link.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="btn-primary py-2 px-4 text-sm">Войти</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex flex-col gap-1.5 p-2 z-50">
            <span className={`block w-6 h-0.5 bg-white transition ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#1a1f26] py-4 px-4 flex flex-col gap-2 shadow-2xl">
          {links.map(link => (
            <button key={link.id} onClick={() => { setPage(link.id as Page); setMobileMenuOpen(false); }} className={`w-full text-left p-4 rounded-xl text-sm font-medium ${page === link.id ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF]'}`}>{link.l}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const HomePage = ({ setPage }: any) => (
  <div className="page-container py-12 sm:py-20">
    <div className="text-center mb-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Продавайте криптовалюту <span className="text-[#FDB913]">быстро и выгодно</span></h1>
      <p className="text-base sm:text-lg text-[#9CA3AF] mb-8 max-w-2xl mx-auto">Мгновенный обмен TON и USDT на рубли с лучшим курсом и моментальными выплатами</p>
      <button onClick={() => setPage('sell')} className="btn-primary px-8 py-4 mx-auto text-lg">Продать криптовалюту <span>→</span></button>
    </div>
    <div className="mb-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Как это работает</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {[ { n: '1', t: 'Выберите актив', d: 'TON или USDT' }, { n: '2', t: 'Укажите сумму', d: 'И реквизиты' }, { n: '3', t: 'Отправьте крипту', d: 'По адресу' }, { n: '4', t: 'Получите деньги', d: 'За 1-5 минут' } ].map(s => (
          <div key={s.n} className="text-center">
            <div className="step-number">{s.n}</div>
            <h3 className="font-semibold mb-2">{s.t}</h3>
            <p className="text-sm text-[#6B7280]">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="card-dark grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[ { i: '⚡', t: 'Быстро', d: 'Выплаты за 1-5 минут' }, { i: '💎', t: 'Выгодно', d: 'Лучшие курсы обмена' }, { i: '🔒', t: 'Безопасно', d: 'Проверенный сервис' }, { i: '🎁', t: 'Бонусы', d: 'Кэшбэк за сделки' }, { i: '🌐', t: 'TON & USDT', d: 'Популярные активы' }, { i: '📱', t: 'Удобно', d: 'Простой интерфейс' } ].map((item, i) => (
        <div key={i} className="feature-card">
          <div className="text-4xl mb-3">{item.i}</div>
          <h3 className="font-semibold mb-2">{item.t}</h3>
          <p className="text-sm text-[#6B7280]">{item.d}</p>
        </div>
      ))}
    </div>
  </div>
);

const SellPage = () => {
  const networkData = [
    { id: 'TON', name: 'The Open Network', display: 'TON (The Open Network)', aliases: ['тон', 'тонкоин'] },
    { id: 'TRC20', name: 'Tron', display: 'Tron (TRC20)', aliases: ['трон', 'тронкоин'] },
    { id: 'ERC20', name: 'Ethereum', display: 'Ethereum (ERC20)', aliases: ['эфириум', 'эфир', 'етх'] },
    { id: 'BEP20', name: 'Binance Smart Chain', display: 'BSC (BEP20)', aliases: ['бинанс', 'бсц', 'бнб'] }
  ];
  
  const networks = networkData.map(n => n.display);
  const networkAliases: Record<string, string[]> = networkData.reduce((acc, n) => {
    acc[n.display] = n.aliases;
    return acc;
  }, {} as Record<string, string[]>);
  
  const assetsMap: any = { 
    'TON (The Open Network)': ['USDT', 'TON'], 
    'Tron (TRC20)': ['USDT'], 
    'Ethereum (ERC20)': ['USDT'], 
    'BSC (BEP20)': ['USDT'] 
  };
  
  const methods = ['СБП', 'Банковская карта', 'ЮМани', 'Пополнение мобильного'];
  const banks = ['Сбербанк', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Газпромбанк', 'Райффайзенбанк', 'Совкомбанк', 'МТС Банк', 'Яндекс Банк', 'Озон Банк'];
  
  const [network, setNetwork] = useState(networks[0]);
  const [asset, setAsset] = useState('USDT');
  const [method, setMethod] = useState('СБП');
  const [bank, setBank] = useState('');

  return (
    <div className="page-container py-12">
      <h1 className="text-3xl font-bold mb-8">Продать криптовалюту</h1>
      <div className="card-dark space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Сеть</label>
            <SearchableDropdown 
              value={network} 
              onChange={(v: string) => { setNetwork(v); setAsset(assetsMap[v][0]); }} 
              options={networks}
              aliases={networkAliases}
            />
          </div>
          <div>
            <label className="label">Актив</label>
            <SearchableDropdown value={asset} onChange={setAsset} options={assetsMap[network] || ['USDT']} />
          </div>
          <div>
            <label className="label">Способ оплаты</label>
            <SearchableDropdown value={method} onChange={setMethod} options={methods} />
          </div>
        </div>
        <div className={`grid grid-cols-1 ${method === 'СБП' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          <div>
            <label className="label">Сумма {asset}</label>
            <input type="text" placeholder="0.00" className="input-base text-lg font-bold" />
          </div>
          <div>
            <label className="label">Реквизиты</label>
            <input type="text" placeholder="Номер телефона или карты" className="input-base" />
          </div>
          {method === 'СБП' && (
            <div>
              <label className="label">Банк получателя</label>
              <SearchableDropdown value={bank} onChange={setBank} options={banks} allowCustom={true} placeholder="Введите банк" />
            </div>
          )}
        </div>
        <button className="btn-secondary md:w-96 mx-auto block text-lg">Создать заявку</button>
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
        <p className="text-sm">Режим инкогнито. Данные хранятся только в браузере и будут потеряны при очистке данных.</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Мои заявки</h1>
        <button onClick={() => setPage('sell')} className="btn-primary">+ Создать заявку</button>
      </div>
      <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-8">
        {['all', 'active', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn-tab ${tab === t ? 'btn-tab-active' : 'btn-tab-inactive'}`}>
            {t === 'all' ? 'Все' : t === 'active' ? 'Активные' : 'Завершённые'}
          </button>
        ))}
      </div>
      <div className="empty-state">
        <div className="empty-icon"><span className="text-4xl">📋</span></div>
        <p className="text-[#9CA3AF]">Заявки отсутствуют</p>
      </div>
    </div>
  );
};

const RewardsPage = () => (
  <div className="page-container py-12">
    <h1 className="text-3xl font-bold mb-8">Награды</h1>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {[ { l: 'Баллы', v: '0', i: '⭐' }, { l: 'Уровень', v: 'Новичок', i: '🎯' }, { l: 'Бонусы', v: '0 ₽', i: '💰' } ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon">{s.i}</div>
          <div className="stat-value">{s.v}</div>
          <div className="stat-label">{s.l}</div>
        </div>
      ))}
    </div>
    <div className="card-dark space-y-4">
      <h2 className="text-xl font-bold mb-6">Доступные награды</h2>
      {[ { t: 'Первая сделка', d: 'Завершите свою первую сделку', p: 100 }, { t: 'Постоянный клиент', d: 'Совершите 10 сделок', p: 500 }, { t: 'VIP статус', d: 'Оборот более 100 000 ₽', p: 1000 } ].map((r, i) => (
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
      <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-8 border border-[#1e2430]">
        <button onClick={() => setMode('login')} className={`btn-tab ${mode === 'login' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>Вход</button>
        <button onClick={() => setMode('register')} className={`btn-tab ${mode === 'register' ? 'btn-tab-active' : 'btn-tab-inactive'}`}>Регистрация</button>
      </div>
      <div className="card-dark space-y-4">
        <input type="email" placeholder="Email" className="input-base" />
        <input type="password" placeholder="Пароль" className="input-base" />
        {mode === 'register' && <input type="password" placeholder="Повторите пароль" className="input-base" />}
        <button className="btn-primary w-full py-4 mt-4">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem('currentPage');
    return (saved && PAGES.includes(saved as Page)) ? (saved as Page) : 'home';
  });
  useEffect(() => { localStorage.setItem('currentPage', page); }, [page]);

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen text-white">
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

createRoot(document.getElementById('root')!).render(<App />);