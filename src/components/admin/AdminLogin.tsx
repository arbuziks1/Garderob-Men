import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api, ApiError } from '../../services/api';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.adminLogin(email.trim(), password);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Не удалось войти. Проверьте подключение к серверу.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-graphite-950 text-white">
            <Lock size={20} />
          </div>
          <h1 className="font-display text-xl font-semibold text-graphite-950">Вход в админ-панель</h1>
          <p className="mt-1 text-sm text-graphite-500">GARDEROB MEN — панель управления</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Email"
            autoFocus
            autoComplete="username"
            className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm focus:border-graphite-950 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Пароль"
            autoComplete="current-password"
            className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm focus:border-graphite-950 focus:outline-none"
          />
          {error && <p className="text-center text-sm text-ember">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full rounded-full bg-graphite-950 py-3 font-display text-sm uppercase tracking-wider text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {submitting ? 'Входим…' : 'Войти'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-1 text-sm text-graphite-500 underline underline-offset-2"
          >
            Вернуться в магазин
          </button>
        </form>
      </div>
    </div>
  );
}
