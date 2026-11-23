import { useEffect, useRef, useState } from 'react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

/** A text input that offers a filterable dropdown of suggestions (type to search, click to
 *  pick) but never forces the value into the list — typing something not in `options` and
 *  clicking away just keeps what was typed, the same "pick from the list or type your own"
 *  behaviour Kaspi Магазин uses for its attribute fields. */
export default function SearchableSelect({ value, onChange, options, placeholder }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query))
    : options;

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
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
