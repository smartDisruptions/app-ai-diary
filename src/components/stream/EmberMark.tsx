/** The companion's picture: a firefly's glow. Decorative; the name is always written beside it. */
export function EmberMark({ size = 32, blink = false }: { size?: number; blink?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="flex-none">
      <circle className={blink ? 'firefly-blink' : undefined} cx="16" cy="16" r="15" fill="url(#sd-fly)" />
      <circle cx="16" cy="16" r="3.4" fill="#fff7c2" />
    </svg>
  );
}
