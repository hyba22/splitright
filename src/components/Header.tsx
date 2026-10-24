import { useI18n, type Lang } from '../i18n'
import { useTheme } from '../theme'

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden="true">
      {/* Fixed brand colors so the mark looks the same in both themes */}
      <rect width="32" height="32" rx="9" fill="#ffd64a" />
      <path d="M18 7.5 L14.6 24.5" stroke="#0f7a4f" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.7 1.25 A3.5 3.5 0 1 0 4 7 A3.5 3.5 0 1 1 1.3 12.75" transform="translate(4.4 9)" stroke="#0f7a4f" />
        <path d="M0 14 V0 H3.6 A3.5 3.5 0 0 1 3.6 7 H0 M3.4 7 L7.6 14" transform="translate(20 9)" stroke="#0e1a13" />
      </g>
    </svg>
  )
}

export function Header() {
  const { lang, setLang, t } = useI18n()
  const [theme, toggleTheme] = useTheme()

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
      <a href="/" className="flex items-center gap-2.5 rounded-xl">
        <Logo />
        <span className="font-display text-xl font-bold tracking-tight">
          Split<span className="text-primary">Right</span>
        </span>
      </a>

      <div className="flex items-center gap-2">
        <div role="group" aria-label={t('language')} className="flex rounded-full border border-border bg-surface p-1">
          {(['en', 'fr'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                lang === l ? 'bg-primary text-primary-ink' : 'text-muted hover:text-text'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          className="grid size-9 place-items-center rounded-full border border-border bg-surface text-text transition-colors hover:bg-surface-2"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
