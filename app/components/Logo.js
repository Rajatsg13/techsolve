/**
 * Tools by Decyfy logo.
 *
 * Pure SVG + text, no raster asset, so it stays crisp at any size and can be
 * recoloured for dark surfaces (the footer) without shipping a second file.
 *
 * The mark is a toolbox: a blue lid with a wrench cut out of it, over three
 * tiles standing for what the tools actually operate on — a document, an image,
 * and data. The tile colours are the category accents defined in
 * tailwind.config.js, so the logo and the catalogue use one palette.
 *
 * <LogoMark />  the toolbox on its own (favicon, compact spaces)
 * <Logo />      mark + wordmark, used in the header and footer
 */

export function LogoMark({ className = 'w-9 h-9', title }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'} aria-label={title}>
      {title && <title>{title}</title>}
      {/* handle */}
      <path d="M17 11.5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2.5h-3.6v-2.2a1.2 1.2 0 0 0-1.2-1.2h-4.4a1.2 1.2 0 0 0-1.2 1.2v2.2H17z"
        fill="currentColor" />
      {/* body tiles */}
      <rect x="6"  y="27" width="12" height="14" rx="2.5" fill="#22b49a" />
      <rect x="18" y="27" width="12" height="14" rx="2.5" fill="#7c4dd6" />
      <rect x="30" y="27" width="12" height="14" rx="2.5" fill="#f59331" />
      {/* squared inner corners so the three tiles read as one box */}
      <rect x="15" y="27" width="18" height="14" fill="#7c4dd6" />
      <rect x="6"  y="27" width="12" height="6"  fill="#22b49a" />
      <rect x="30" y="27" width="12" height="6"  fill="#f59331" />
      {/* lid */}
      <path d="M6 16.5A2.5 2.5 0 0 1 8.5 14h31a2.5 2.5 0 0 1 2.5 2.5V29H6z" fill="#1b6bf0" />
      {/* Open-ended wrench knocked out of the lid. Each jaw is a white ring
          with a notch punched out of its outer edge in the lid blue, which
          reads as an open spanner rather than a closed circle. */}
      <g>
        <rect x="17.5" y="21.2" width="13" height="2.6" fill="#fff" />
        <circle cx="17.5" cy="22.5" r="4.1" fill="none" stroke="#fff" strokeWidth="2.6" />
        <circle cx="30.5" cy="22.5" r="4.1" fill="none" stroke="#fff" strokeWidth="2.6" />
        <rect x="11.9" y="20.9" width="3.4" height="3.2" fill="#1b6bf0" />
        <rect x="32.7" y="20.9" width="3.4" height="3.2" fill="#1b6bf0" />
      </g>
    </svg>
  );
}

/**
 * @param {'header'|'footer'} tone  header = navy on light, footer = white on dark
 */
export default function Logo({ tone = 'header', className = '' }) {
  const onDark = tone === 'footer';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`w-9 h-9 shrink-0 ${onDark ? 'text-white' : 'text-ink-900'}`} />
      <span className="font-display leading-none">
        <span className={`block text-[19px] font-extrabold tracking-tight ${onDark ? 'text-white' : 'text-ink-900'}`}>
          Tools
        </span>
        <span className={`block text-[11px] font-semibold tracking-wide mt-0.5 ${onDark ? 'text-brand-200' : 'text-brand-600'}`}>
          by Decyfy
        </span>
      </span>
    </span>
  );
}
