import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'fr'

const en = {
  tagline: 'Split bills fairly. Down to the last cent.',
  heroTitle: 'Fair shares,',
  heroTitleAccent: 'exact cents.',
  heroText: 'Split rent and bills by percentage, room size or fixed amounts. Every split adds up to the exact total, with no missing cent.',
  total: 'Total amount',
  currency: 'Currency',
  people: 'People',
  addPerson: 'Add person',
  personPlaceholder: 'Name',
  removePerson: 'Remove {name}',
  method: 'How to split',
  methodEqual: 'Equal',
  methodPercent: 'Percentage',
  methodRatio: 'Ratio',
  methodFixed: 'Fixed + rest',
  hintEqual: 'Everyone pays the same.',
  hintPercent: 'Give each person a percentage. They must add up to 100 %.',
  hintRatio: 'Use any numbers, like room size in m². Bigger number, bigger share.',
  hintFixed: 'Set a fixed amount for some people. Everyone left blank splits the rest equally.',
  percentLeft: '{value} % left',
  percentOver: '{value} % too much',
  percentOk: 'Adds up to 100 %',
  fixedPlaceholder: 'Splits the rest',
  result: 'Breakdown',
  addsUp: 'Adds up to {total} exactly',
  extraCentTitle: 'Why the extra {unit}?',
  extraCentWhy: "{name}'s exact share is {exact}. Amounts can only be paid in whole {unit} steps, so the leftover goes to the people closest to rounding up.",
  emptyResult: 'Enter a total and add people to see the split.',
  fillValues: 'Fill in a value for each person to see the split.',
  featuredCurrencies: 'Popular',
  otherCurrencies: 'All currencies',
  valueFor: '{method} for {name}',
  errNoPeople: 'Add at least one person.',
  errPercentNot100: 'Percentages must add up to exactly 100 %.',
  errRatioZero: 'Give at least one person a ratio above zero.',
  errFixedExceedsTotal: 'The fixed amounts are more than the total.',
  errFixedMismatch: 'Everyone has a fixed amount, but they do not add up to the total.',
  errAmount: 'Enter a valid amount (up to {digits} decimals).',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  language: 'Language',
  defaultNames: 'Alex,Sam,Jordan',
  footer: 'Made by Hyba',
}

type Key = keyof typeof en

const fr: Record<Key, string> = {
  tagline: 'Partagez vos factures équitablement, au centime près.',
  heroTitle: 'Parts justes,',
  heroTitleAccent: 'centimes exacts.',
  heroText: 'Partagez le loyer et les factures par pourcentage, taille de chambre ou montants fixes. Chaque partage tombe juste, sans aucun centime perdu.',
  total: 'Montant total',
  currency: 'Devise',
  people: 'Personnes',
  addPerson: 'Ajouter',
  personPlaceholder: 'Nom',
  removePerson: 'Retirer {name}',
  method: 'Mode de partage',
  methodEqual: 'Égal',
  methodPercent: 'Pourcentage',
  methodRatio: 'Ratio',
  methodFixed: 'Fixe + reste',
  hintEqual: 'Tout le monde paie la même chose.',
  hintPercent: 'Donnez un pourcentage à chacun. Le total doit faire 100 %.',
  hintRatio: 'Utilisez n’importe quel nombre, comme la surface de la chambre en m². Plus il est grand, plus la part l’est.',
  hintFixed: 'Fixez un montant pour certaines personnes. Celles laissées vides se partagent le reste.',
  percentLeft: 'Il reste {value} %',
  percentOver: '{value} % en trop',
  percentOk: 'Total de 100 %',
  fixedPlaceholder: 'Partage le reste',
  result: 'Répartition',
  addsUp: 'Total exact : {total}',
  extraCentTitle: 'Pourquoi {unit} de plus ?',
  extraCentWhy: '{name} : part exacte de {exact}. On ne peut payer que par pas de {unit} : le reste va aux personnes les plus proches de l’arrondi supérieur.',
  emptyResult: 'Saisissez un total et ajoutez des personnes pour voir le partage.',
  fillValues: 'Saisissez une valeur pour chaque personne pour voir le partage.',
  featuredCurrencies: 'Populaires',
  otherCurrencies: 'Toutes les devises',
  valueFor: '{method} pour {name}',
  errNoPeople: 'Ajoutez au moins une personne.',
  errPercentNot100: 'Les pourcentages doivent faire exactement 100 %.',
  errRatioZero: 'Donnez un ratio supérieur à zéro à au moins une personne.',
  errFixedExceedsTotal: 'Les montants fixes dépassent le total.',
  errFixedMismatch: 'Tout le monde a un montant fixe, mais leur somme ne fait pas le total.',
  errAmount: 'Saisissez un montant valide ({digits} décimales max).',
  themeLight: 'Thème clair',
  themeDark: 'Thème sombre',
  language: 'Langue',
  defaultNames: 'Alex,Sam,Jordan',
  footer: 'Réalisé par Hyba',
}

const dictionaries: Record<Lang, Record<Key, string>> = { en, fr }

export type Translate = (key: Key, vars?: Record<string, string | number>) => string

type I18n = { lang: Lang; locale: string; setLang: (l: Lang) => void; t: Translate }

const I18nContext = createContext<I18n | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('sr-lang')
    if (saved === 'en' || saved === 'fr') return saved
  } catch {
    // storage unavailable
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('sr-lang', lang)
    } catch {
      // storage unavailable
    }
  }, [lang])

  const t: Translate = (key, vars) =>
    dictionaries[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? ''))

  return (
    <I18nContext.Provider value={{ lang, locale: lang === 'fr' ? 'fr-FR' : 'en-US', setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
