export default function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6", check: "m5 12 4 4L19 6",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    phone: "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-5",
    chart: "M4 3v17h17M8 15v-4m5 4V7m5 8v-6",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h5",
    settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
    download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
    close: "m6 6 12 12M6 18 18 6",
    play: "m9 5 11 7-11 7V5Z",
    clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    log: "M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01",
    reset: "M3 11a9 9 0 1 1 2.7 7M3 4v7h7",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.heart} /></svg>;
}
export function Brand({ compact = false }) {
  return <span className="setu-brand"><svg width="38" height="38" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="15" fill="currentColor"/><path d="M11 31C15 13 33 13 37 31M16 31V24M32 31V24" fill="none" stroke="#f5eee2" strokeWidth="3.4" strokeLinecap="round"/></svg><span>setu<span className="brand-dot">.</span>{!compact && <small>A bridge back to care</small>}</span></span>;
}
