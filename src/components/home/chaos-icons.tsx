/**
 * Brand marks for the hero's chaos field. These have no Lucide equivalent, so they
 * are hand-inlined; the generic sources (terminal, file, bookmark) use Lucide.
 * Each accepts `className` so it can be sized like a Lucide icon.
 */
export type BrandIcon = (props: { className?: string }) => React.JSX.Element;

export const NotionIcon: BrandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#fff" />
    <path
      d="M7.5 7.2v9.6l1.9.15V10.6l4.6 6.5 2.4.2V7.4l-1.9-.2v6.1L9.8 7.35z"
      fill="#111"
    />
  </svg>
);

export const GitHubIcon: BrandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.35 4.69-4.58 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
    />
  </svg>
);

export const SlackIcon: BrandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#36C5F0" d="M6.2 14.7a2 2 0 1 1-2-2h2z" />
    <path fill="#36C5F0" d="M7.3 14.7a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0z" />
    <path fill="#2EB67D" d="M9.3 6.2a2 2 0 1 1 2-2v2z" />
    <path fill="#2EB67D" d="M9.3 7.3a2 2 0 1 1 0 4h-5a2 2 0 1 1 0-4z" />
    <path fill="#ECB22E" d="M17.8 9.3a2 2 0 1 1 2 2h-2z" />
    <path fill="#ECB22E" d="M16.7 9.3a2 2 0 1 1-4 0v-5a2 2 0 1 1 4 0z" />
    <path fill="#E01E5A" d="M14.7 17.8a2 2 0 1 1-2 2v-2z" />
    <path fill="#E01E5A" d="M14.7 16.7a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4z" />
  </svg>
);

export const VsCodeIcon: BrandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#22a7f0"
      d="M17.2 2.3 8.9 10 4.6 6.8 3 7.6v8.8l1.6.8L8.9 14l8.3 7.7L21 20V4zM17.4 7.1v9.8L11.3 12z"
    />
  </svg>
);

export const TabsIcon: BrandIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect
      x="2"
      y="5"
      width="20"
      height="15"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M2 9h20" stroke="currentColor" strokeWidth="1.6" />
    <rect x="4" y="6" width="5" height="2.2" rx="1" fill="currentColor" />
    <rect x="10" y="6" width="5" height="2.2" rx="1" fill="currentColor" opacity=".55" />
    <rect x="16" y="6" width="4" height="2.2" rx="1" fill="currentColor" opacity=".3" />
  </svg>
);
