import { useState } from 'react';

const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#27272a"/>
  <g stroke="#71717a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M200 150 L200 175"/>
    <path d="M160 175 L240 175 L280 220 L260 235 L240 220 L240 350 L160 350 L160 220 L140 235 L120 220 Z"/>
    <circle cx="200" cy="145" r="8"/>
  </g>
  <text x="200" y="400" font-family="Arial, sans-serif" font-size="16" fill="#a8a29e" text-anchor="middle" letter-spacing="2">GARDEROB MEN</text>
</svg>
`)}`;

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

export default function SafeImage({ src, alt = '', className, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed || !src ? PLACEHOLDER : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
