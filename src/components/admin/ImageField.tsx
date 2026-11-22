import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { fileToCompressedDataUrl } from '../../utils/image';
import SafeImage from '../shared/SafeImage';

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  placeholder?: string;
}

export default function ImageField({ value, onChange, onRemove, placeholder }: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError('Не удалось загрузить файл. Попробуйте другое изображение.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
          <SafeImage src={value} alt="" className="h-full w-full object-cover" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://... или загрузите файл'}
          className="input flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Загрузить из галереи или файлов"
          className="shrink-0 rounded-md border border-stone-300 p-2 text-graphite-600 hover:border-graphite-500 disabled:opacity-50"
        >
          <Upload size={15} />
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md p-2 text-graphite-400 hover:bg-stone-100"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {loading && <p className="pl-12 text-xs text-graphite-500">Обработка изображения…</p>}
      {error && <p className="pl-12 text-xs text-ember">{error}</p>}
    </div>
  );
}
