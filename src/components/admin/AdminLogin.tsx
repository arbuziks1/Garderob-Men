import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';

const DEMO_PIN = '1234';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin === DEMO_PIN) {
      onSuccess();
    } else {
      setError('Неверный PIN-код');
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
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            placeholder="PIN-код"
            autoFocus
            className="w-full rounded-md border border-stone-300 px-4 py-3 text-center text-lg tracking-[0.3em] focus:border-graphite-950 focus:outline-none"
          />
          {error && <p className="text-center text-sm text-ember">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-graphite-950 py-3 font-display text-sm uppercase tracking-wider text-white hover:bg-graphite-800"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => {
              setPin(DEMO_PIN);
              onSuccess();
            }}
            className="w-full rounded-full border border-ember py-3 font-display text-sm uppercase tracking-wider text-ember hover:bg-ember hover:text-white"
          >
            Войти как владелец (Демо)
          </button>
          <button type="button" onClick={onBack} className="mt-1 text-sm text-graphite-500 underline underline-offset-2">
            Вернуться в магазин
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400">Демо-доступ: PIN 1234</p>
      </div>
    </div>
  );
}
