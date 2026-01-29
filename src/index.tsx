import "./index.css";
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

const GlobalStyles = () => (
  <style>{`
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
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(opt => 
    opt.toLowerCase().replace(/-/g, '').includes(search.toLowerCase().replace(/-/g, ''))
  );

  // Синхронизируем внутренний inputValue с внешним value только когда не в режиме редактирования
  useEffect(() => {
    if (!isOpen && !search) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (filtered.length === 1 && search.length >= 3) {
      onChange(filtered[0]);
      setInputValue(filtered[0]);
      setSearch('');
      setIsOpen(false);
      // Снимаем фокус с поля ввода
      inputRef.current?.blur();
    }
  }, [filtered, search]);

  const handleInputChange = (val: string) => {
    setSearch(val);
    setInputValue(val);
    setIsOpen(true);
    
    if (!allowCustom) {
      const match = options.find(opt => 
        opt.toLowerCase().replace(/-/g, '').includes(val.toLowerCase().replace(/-/g, ''))
      );
      if (!match && val) return;
    }
  };

  const handleFocus = () => {
    setSearch('');
    setInputValue('');
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    onChange(opt);
    setInputValue(opt);
    setSearch('');
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      // Если поле пустое или это search mode, просто закрываем
      if (search) {
        setSearch('');
        setIsOpen(false);
        return;
      }
      
      if (allowCustom && inputValue) {
        onChange(inputValue);
      } else if (inputValue && !options.includes(inputValue)) {
        // Возвращаем к последнему валидному значению только если текущее невалидно
        setInputValue(value);
      }
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search || inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 focus:border-[#FDB913] focus:outline-none transition"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1f26] border-2 border-[#FDB913] rounded-xl shadow-xl max-h-60 overflow-y-auto">
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
      <div className="min-h-screen bg-black text-white">
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

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FDB913] rounded-lg flex items-center justify-center text-black font-bold text-sm">
            P2P
          </div>
          <span className="text-base sm:text-lg font-bold">P2P Express</span>
        </div>

        {/* Desktop меню */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setPage('home')} className={`text-sm font-medium transition ${page === 'home' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Главная</button>
          <button onClick={() => setPage('sell')} className={`text-sm font-medium transition ${page === 'sell' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Продать</button>
          <button onClick={() => setPage('profile')} className={`text-sm font-medium transition ${page === 'profile' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Заявки</button>
          <button onClick={() => setPage('rewards')} className={`text-sm font-medium transition ${page === 'rewards' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Награды</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setPage('auth')} className="bg-[#FDB913] text-black px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#E5A712] transition">
            Войти
          </button>

          {/* Бургер-кнопка для мобильных */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1a1f26]">
          <div className="px-4 py-2 space-y-1">
            <button 
              onClick={() => { setPage('home'); setMobileMenuOpen(false); }} 
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${page === 'home' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF] hover:bg-[#1a1f26] hover:text-white'}`}
            >
              Главная
            </button>
            <button 
              onClick={() => { setPage('sell'); setMobileMenuOpen(false); }} 
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${page === 'sell' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF] hover:bg-[#1a1f26] hover:text-white'}`}
            >
              Продать
            </button>
            <button 
              onClick={() => { setPage('profile'); setMobileMenuOpen(false); }} 
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${page === 'profile' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF] hover:bg-[#1a1f26] hover:text-white'}`}
            >
              Заявки
            </button>
            <button 
              onClick={() => { setPage('rewards'); setMobileMenuOpen(false); }} 
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${page === 'rewards' ? 'bg-[#1a1f26] text-[#FDB913]' : 'text-[#9CA3AF] hover:bg-[#1a1f26] hover:text-white'}`}
            >
              Награды
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const HomePage = ({ setPage }: { setPage: (p: Page) => void }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-20 sm:mb-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Продавайте криптовалюту <span className="text-[#FDB913]">быстро и выгодно</span>
        </h1>
        <p className="text-base sm:text-lg text-[#9CA3AF] mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Мгновенный обмен TON и USDT на рубли с лучшим курсом и моментальными выплатами
        </p>
        <button 
          onClick={() => setPage('sell')}
          className="bg-[#FDB913] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-[#E5A712] transition inline-flex items-center gap-2"
        >
          Продать криптовалюту
          <span>→</span>
        </button>
      </div>

      <div className="mb-12 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16">Как это работает</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { num: '1', title: 'Выберите актив', desc: 'TON или USDT', icon: '💰' },
            { num: '2', title: 'Укажите сумму', desc: 'И реквизиты', icon: '✍️' },
            { num: '3', title: 'Отправьте крипту', desc: 'По адресу', icon: '📤' },
            { num: '4', title: 'Получите деньги', desc: 'За 1-5 минут', icon: '✅' }
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#FDB913] rounded-full flex items-center justify-center text-black font-bold text-lg sm:text-xl mx-auto mb-4 sm:mb-6">
                {step.num}
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">{step.title}</h3>
              <p className="text-xs sm:text-sm text-[#6B7280]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0f1419] border border-[#1e2430] rounded-2xl p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Преимущества</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {[
            { icon: '⚡', title: 'Быстро', desc: 'Выплаты за 1-5 минут' },
            { icon: '💎', title: 'Выгодно', desc: 'Лучшие курсы обмена' },
            { icon: '🔒', title: 'Безопасно', desc: 'Проверенный сервис' },
            { icon: '🎁', title: 'Бонусы', desc: 'Кэшбэк за сделки' },
            { icon: '🌐', title: 'TON & USDT', desc: 'Популярные активы' },
            { icon: '📱', title: 'Удобно', desc: 'Простой интерфейс' }
          ].map((item, i) => (
            <div key={i} className="text-center p-4 sm:p-6 bg-[#1a1f26] rounded-xl border border-[#2a3040] hover:border-[#FDB913] transition">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#6B7280]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SellPage = () => {
  const networks = ['The Open Network (TON)', 'Tron (TRC20)', 'Ethereum (ERC20)', 'BSC (BEP20)'];
  const assetsForNetwork: Record<string, string[]> = {
    'The Open Network (TON)': ['USDT', 'TON'],
    'Tron (TRC20)': ['USDT'],
    'Ethereum (ERC20)': ['USDT'],
    'BSC (BEP20)': ['USDT']
  };
  const paymentMethods = ['СБП', 'Банковская карта', 'ЮМани', 'Пополнение мобильного телефона'];
  const banks = ['Сбербанк', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Газпромбанк', 'Райффайзенбанк', 'Совкомбанк', 'Открытие', 'Росбанк', 'МТС Банк', 'Яндекс Банк', 'Озон Банк'];

  const [network, setNetwork] = useState('The Open Network (TON)');
  const [asset, setAsset] = useState('USDT');
  const [paymentMethod, setPaymentMethod] = useState('СБП');
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [bank, setBank] = useState('');

  const availableAssets = assetsForNetwork[network] || ['USDT'];

  useEffect(() => {
    if (!availableAssets.includes(asset)) {
      setAsset(availableAssets[0]);
    }
  }, [network]);

  const getPaymentFieldConfig = () => {
    switch(paymentMethod) {
      case 'СБП':
        return { label: 'Номер телефона', placeholder: '+7 (___) ___-__-__', type: 'tel' };
      case 'Банковская карта':
        return { label: 'Номер карты', placeholder: '0000 0000 0000 0000', type: 'text' };
      case 'ЮМани':
        return { label: 'Номер телефона/карты/счёта', placeholder: 'Телефон, карта или номер счёта', type: 'text' };
      case 'Пополнение мобильного телефона':
        return { label: 'Номер телефона', placeholder: '+7 (___) ___-__-__', type: 'tel' };
      default:
        return { label: 'Реквизиты', placeholder: 'Введите реквизиты', type: 'text' };
    }
  };

  const fieldConfig = getPaymentFieldConfig();
  const showBankField = paymentMethod === 'СБП';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Продать криптовалюту</h1>
      
      <div className="bg-[#0f1419] border border-[#1e2430] rounded-2xl p-6 sm:p-8">
        {/* Первая строка: Сеть + Актив + Способ оплаты */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Сеть</label>
            <SearchableDropdown
              value={network}
              onChange={setNetwork}
              options={networks}
              placeholder="Выберите сеть"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Актив</label>
            <SearchableDropdown
              value={asset}
              onChange={setAsset}
              options={availableAssets}
              placeholder="Выберите актив"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Способ оплаты</label>
            <SearchableDropdown
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={paymentMethods}
              placeholder="Выберите способ оплаты"
            />
          </div>
        </div>

        {/* Вторая строка: Сумма + Детали платежа + Банк (если нужен) */}
        <div className={`grid grid-cols-1 ${showBankField ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`}>
          <div>
            <label className="text-sm font-medium mb-3 block">Сумма {asset}</label>
            <input 
              type="text" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0.00" 
              className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 text-lg focus:border-[#FDB913] focus:outline-none transition" 
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{fieldConfig.label}</label>
            <input 
              type={fieldConfig.type} 
              value={paymentDetails}
              onChange={e => setPaymentDetails(e.target.value)}
              placeholder={fieldConfig.placeholder}
              className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 focus:border-[#FDB913] focus:outline-none transition" 
            />
          </div>

          {showBankField && (
            <div>
              <label className="text-sm font-medium mb-3 block">Банк получателя</label>
              <SearchableDropdown
                value={bank}
                onChange={setBank}
                options={banks}
                placeholder="Введите название банка"
                allowCustom={true}
              />
            </div>
          )}
        </div>

        {/* Кнопка центрирована и имеет фиксированную максимальную ширину */}
        <div className="flex justify-center">
          <button className="w-full md:w-96 bg-[#C89000] text-white py-4 rounded-xl font-semibold hover:bg-[#B8860B] transition">
            Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[#1a1f26] rounded-xl border border-[#FDB913] p-4 sm:p-6 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
        <span className="text-xl sm:text-2xl flex-shrink-0">🔒</span>
        <p className="text-xs sm:text-sm">Режим инкогнито. Данные хранятся только в браузере и будут потеряны при авторизации или очистке данных браузера.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Мои заявки</h1>
        <button 
          onClick={() => setPage('sell')}
          className="bg-[#FDB913] text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-[#E5A712] transition flex items-center gap-2"
        >
          <span>+</span>
          Создать заявку
        </button>
      </div>

      <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-6 sm:mb-8">
        {(['all', 'active', 'completed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 rounded-lg text-xs sm:text-sm font-medium transition ${tab === t ? 'bg-[#1e2430] text-white' : 'text-[#6B7280] hover:text-white'}`}>
            {t === 'all' ? 'Все' : t === 'active' ? 'Активные' : 'Завершённые'}
          </button>
        ))}
      </div>

      <div className="bg-[#0f1419] rounded-2xl p-8 sm:p-12 text-center">
        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#1e2430] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <span className="text-3xl sm:text-4xl">📋</span>
        </div>
        <p className="text-sm sm:text-base text-[#9CA3AF]">Заявки гостей хранятся только в этом браузере</p>
      </div>
    </div>
  );
};

const RewardsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Награды</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {[
          { label: 'Баллы', value: '0', icon: '⭐' },
          { label: 'Уровень', value: 'Новичок', icon: '🎯' },
          { label: 'Бонусы', value: '0 ₽', icon: '💰' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f1419] border border-[#1e2430] rounded-xl p-5 sm:p-6">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{stat.icon}</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stat.value}</div>
            <div className="text-xs sm:text-sm text-[#6B7280]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1419] border border-[#1e2430] rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Доступные награды</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { title: 'Первая сделка', desc: 'Завершите свою первую сделку', points: 100, locked: true },
            { title: 'Постоянный клиент', desc: 'Совершите 10 сделок', points: 500, locked: true },
            { title: 'VIP статус', desc: 'Оборот более 100 000 ₽', points: 1000, locked: true }
          ].map((reward, i) => (
            <div key={i} className="bg-[#1a1f26] rounded-xl p-4 sm:p-6 flex items-center justify-between border border-[#2a3040] gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#2a3040] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                  {reward.locked ? '🔒' : '✓'}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold mb-1 text-sm sm:text-base">{reward.title}</div>
                  <div className="text-xs sm:text-sm text-[#6B7280]">{reward.desc}</div>
                </div>
              </div>
              <div className="text-[#FDB913] font-bold text-sm sm:text-base flex-shrink-0">+{reward.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-md mx-auto">
        <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-6 sm:mb-8">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-[#1e2430] text-white' : 'text-[#6B7280] hover:text-white'}`}>
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        {mode === 'login' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input type="email" placeholder="your@email.com" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-3 focus:border-[#FDB913] focus:outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <input type="text" placeholder="Введите пароль" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-3 focus:border-[#FDB913] focus:outline-none transition" />
            </div>
            <button className="w-full bg-[#FDB913] text-black py-3 rounded-xl font-semibold hover:bg-[#E5A712] transition mt-6">
              Войти
            </button>
            <button className="w-full text-sm text-[#6B7280] hover:text-[#FDB913] transition">
              Забыли пароль?
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input type="email" placeholder="your@email.com" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-3 focus:border-[#FDB913] focus:outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <input type="text" placeholder="Создайте пароль" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-3 focus:border-[#FDB913] focus:outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Подтвердите пароль</label>
              <input type="text" placeholder="Повторите пароль" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-3 focus:border-[#FDB913] focus:outline-none transition" />
            </div>
            <button className="w-full bg-[#FDB913] text-black py-3 rounded-xl font-semibold hover:bg-[#E5A712] transition mt-6">
              Зарегистрироваться
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);