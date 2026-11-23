import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Multi-value sibling of SearchableSelect — holds several values at once as a single
 *  comma-joined string (so it slots into the same characteristics: Record<string,string>
 *  storage), shown as removable chips. The text input filters `options` as you type; a
 *  suggestion click or Enter on typed text adds it as a new chip. Same "always allow a
 *  custom value" philosophy as SearchableSelect — never forces a chip into the list. */
export default function TagInput({ value, onChange, options, placeholder }: TagInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const tags = parseTags(value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setQuery('');
      return;
    }
    onChange([...tags, trimmed].join(', '));
    setQuery('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag).join(', '));
  };

  const q = query.trim().toLowerCase();
  const filtered = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).filter(
    (o) => !tags.includes(o)
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex min-h-[2.5rem] flex-wrap items-center gap-1.5 rounded-md border border-stone-300 px-2 py-1.5 focus-within:border-graphite-950">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-sm bg-stone-100 px-2 py-1 text-xs font-medium text-graphite-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-graphite-400 hover:text-ember"
              aria-label={`Удалить ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(query);
            } else if (e.key === 'Backspace' && !query && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[8ch] flex-1 border-none p-0.5 text-sm outline-none"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(opt)}
              className="block w-full px-3 py-1.5 text-left text-sm text-graphite-800 hover:bg-stone-100"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
