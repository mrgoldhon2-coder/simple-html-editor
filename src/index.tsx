import "./index.css";
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const PAGES = ['home', 'sell', 'profile', 'rewards', 'auth'] as const;
type Page = typeof PAGES[number];

const App = () => {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem('currentPage');
    return (saved && PAGES.includes(saved as Page)) ? saved as Page : 'home';
  });

  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar page={page} setPage={setPage} />
      <main className="pt-20">
        {page === 'home' && <HomePage />}
        {page === 'sell' && <SellPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'rewards' && <RewardsPage />}
        {page === 'auth' && <AuthPage />}
      </main>
    </div>
  );
};

const Navbar = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  return (
    <nav className="fixed top-0 w-full bg-black border-b border-[#1a1f26] z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FDB913] rounded-lg flex items-center justify-center text-black font-bold text-sm">
            P2P
          </div>
          <span className="text-base sm:text-lg font-bold">P2P Express</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setPage('home')} className={`text-sm font-medium transition ${page === 'home' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Главная</button>
          <button onClick={() => setPage('sell')} className={`text-sm font-medium transition ${page === 'sell' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Продать</button>
          <button onClick={() => setPage('profile')} className={`text-sm font-medium transition ${page === 'profile' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Профиль</button>
          <button onClick={() => setPage('rewards')} className={`text-sm font-medium transition ${page === 'rewards' ? 'text-[#FDB913]' : 'text-[#9CA3AF] hover:text-white'}`}>Награды</button>
        </div>
        <button onClick={() => setPage('auth')} className="bg-[#FDB913] text-black px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#E5A712] transition">
          Войти
        </button>
      </div>
    </nav>
  );
};

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-20 sm:mb-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Продавайте криптовалюту <span className="text-[#FDB913]">быстро и выгодно</span>
        </h1>
        <p className="text-base sm:text-lg text-[#9CA3AF] mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Мгновенный обмен TON и USDT на рубли с лучшим курсом и моментальными выплатами
        </p>
        <button className="bg-[#FDB913] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-[#E5A712] transition inline-flex items-center gap-2">
          Продать криптовалюту
          <span>→</span>
        </button>
      </div>

      <div className="mb-12 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16">Как это работает</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: '💳', title: 'Создайте заявку', desc: 'Укажите сумму и реквизиты для получения рублей' },
            { icon: '✈️', title: 'Отправьте крипту', desc: 'Переведите криптовалюту на указанный кошелёк' },
            { icon: '💰', title: 'Получите рубли', desc: 'Деньги поступят на вашу карту или СБП' },
            { icon: '✓', title: 'Готово!', desc: 'Сохраните чек для подтверждения' }
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-[#FDB913] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-[#9CA3AF]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SellPage = () => {
  const [network, setNetwork] = useState('TON');
  const [asset, setAsset] = useState('USDT');
  const [paymentMethod, setPaymentMethod] = useState('sbp');
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-[#0f1419] rounded-2xl p-6 md:p-8 border border-[#1e2430]">
        <h2 className="text-2xl font-bold mb-8">Продать криптовалюту</h2>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Сеть</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['TON', 'LOL'].map(n => (
                <button key={n} onClick={() => setNetwork(n)} className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${network === n ? 'border-[#FDB913] bg-[#1a1f26]' : 'border-[#2a3040] bg-[#0f1419] hover:bg-[#1e2430]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${network === n ? 'border-[#FDB913] bg-[#FDB913]' : 'border-[#374151]'}`}></div>
                  <div className="w-8 h-8 bg-[#0088CC] rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm sm:text-base">{n} Network</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Выберите актив</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['USDT', 'TON'].map(a => (
                <button key={a} onClick={() => setAsset(a)} className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${asset === a ? 'border-[#FDB913] bg-[#1a1f26]' : 'border-[#2a3040] bg-[#0f1419] hover:bg-[#1e2430]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${asset === a ? 'border-[#FDB913] bg-[#FDB913]' : 'border-[#374151]'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 ${a === 'USDT' ? 'bg-[#26A17B]' : 'bg-[#0088CC]'}`}></div>
                  <span className="font-medium text-sm sm:text-base">{a}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Способ оплаты</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ id: 'sbp', label: 'СБП', sub: 'По номеру телефона' }, { id: 'card', label: 'Банковская карта', sub: 'Возможна комиссия' }].map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-4 rounded-xl border-2 transition text-left ${paymentMethod === m.id ? 'border-[#FDB913] bg-[#1a1f26]' : 'border-[#2a3040] bg-[#0f1419] hover:bg-[#1e2430]'}`}>
                  <div className="font-medium mb-1 text-sm sm:text-base">{m.label}</div>
                  <div className={`text-xs ${m.id === 'card' ? 'text-[#FDB913]' : 'text-[#6B7280]'}`}>{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Сумма USDT</label>
            <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 text-lg focus:border-[#FDB913] focus:outline-none transition" />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Номер телефона</label>
            <input type="tel" placeholder="+7 (___) __-__-__" className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 focus:border-[#FDB913] focus:outline-none transition" />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Банк получателя</label>
            <select className="w-full bg-[#0f1419] border border-[#2a3040] rounded-xl px-4 py-4 focus:border-[#FDB913] focus:outline-none transition">
              <option>Введите название банка</option>
              <option>Сбербанк</option>
              <option>Т-Банк</option>
              <option>Альфа-Банк</option>
            </select>
          </div>

          <button className="w-full bg-[#C89000] text-white py-4 rounded-xl font-semibold hover:bg-[#B8860B] transition">
            Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [tab, setTab] = useState<'all' | 'active' | 'processing' | 'completed'>('all');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[#1a1f26] rounded-xl border border-[#FDB913] p-4 sm:p-6 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
        <span className="text-xl sm:text-2xl flex-shrink-0">🔒</span>
        <p className="text-xs sm:text-sm">Режим инкогнито. Данные хранятся только в браузере и будут потеряны при авторизации или очистке данных браузера.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Мои заявки</h1>
        <button className="bg-[#FDB913] text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-[#E5A712] transition flex items-center gap-2">
          <span>+</span>
          Создать заявку
        </button>
      </div>

      <div className="bg-[#0f1419] rounded-xl p-2 flex gap-2 mb-6 sm:mb-8 overflow-x-auto">
        {(['all', 'active', 'processing', 'completed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 min-w-[80px] py-3 rounded-lg text-xs sm:text-sm font-medium transition ${tab === t ? 'bg-[#1e2430] text-white' : 'text-[#6B7280] hover:text-white'}`}>
            {t === 'all' ? 'Все' : t === 'active' ? 'Активные' : t === 'processing' ? 'В работе' : 'Завершённые'}
          </button>
        ))}
      </div>

      <div className="bg-[#0f1419] rounded-2xl p-8 sm:p-12 text-center">
        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#1e2430] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <span className="text-3xl sm:text-4xl">📋</span>
        </div>
        <p className="text-sm sm:text-base text-[#9CA3AF] mb-4 sm:mb-6">Заявки гостей хранятся только в этом браузере</p>
        <button className="bg-[#FDB913] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-[#E5A712] transition">
          Создать первую заявку
        </button>
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