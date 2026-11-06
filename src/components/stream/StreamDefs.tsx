/**
 * Shared SVG paint for every firefly and stretch of water in the app,
 * rendered once in the root layout and referenced by id.
 */
export function StreamDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sd-fly">
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset="0.35" stopColor="#f2b55e" />
          <stop offset="1" stopColor="#f2b55e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sd-dim">
          <stop offset="0" stopColor="#dfe4ff" />
          <stop offset="0.35" stopColor="#8e9be0" />
          <stop offset="1" stopColor="#8e9be0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sd-unread">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.35" stopColor="#e9dcc2" />
          <stop offset="1" stopColor="#e9dcc2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sd-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1a30" />
          <stop offset="1" stopColor="#0d0b12" />
        </linearGradient>
        <filter id="sd-blur">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>
    </svg>
  );
}

export function paintFor(tone: 'calm' | 'restless' | 'unread'): string {
  return tone === 'calm' ? 'url(#sd-fly)' : tone === 'restless' ? 'url(#sd-dim)' : 'url(#sd-unread)';
}
