import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatAmount, formatCompact, CURRENCIES, COUNTRY_DATA } from '../utils/currencies';
import { t as translate, LANGUAGES } from '../utils/translations';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem('bt_' + key)) ?? fallback; } catch { return fallback; }
};
const save = (key, val) => localStorage.setItem('bt_' + key, JSON.stringify(val));

export const SettingsProvider = ({ children }) => {
  const [country,  setCountryState]  = useState(() => load('country',  'PK'));
  const [currency, setCurrencyState] = useState(() => load('currency', 'PKR'));
  const [language, setLanguageState] = useState(() => load('language', 'en'));

  /* Apply language to DOM */
  useEffect(() => {
    const isRTL = LANGUAGES[language]?.rtl ?? false;
    document.documentElement.lang = language;
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
    document.body.style.textAlign  = isRTL ? 'right' : 'left';
  }, [language]);

  const setCountry = (code) => {
    const countryInfo = COUNTRY_DATA[code];
    setCountryState(code);
    save('country', code);
    if (countryInfo?.currency) {
      setCurrencyState(countryInfo.currency);
      save('currency', countryInfo.currency);
    }
    if (countryInfo?.languages?.length) {
      const newLang = countryInfo.languages[0];
      setLanguageState(newLang);
      save('language', newLang);
    }
  };

  const setCurrency = (code) => {
    setCurrencyState(code);
    save('currency', code);
  };

  const setLanguage = (code) => {
    setLanguageState(code);
    save('language', code);
  };

  /* Format helpers */
  const fmt      = useCallback((val) => formatAmount(val, currency), [currency]);
  const fmtShort = useCallback((val) => formatCompact(val, currency), [currency]);
  const t        = useCallback((key) => translate(key, language), [language]);

  const availableLanguages = COUNTRY_DATA[country]?.languages ?? Object.keys(LANGUAGES);

  return (
    <SettingsContext.Provider value={{
      country, currency, language,
      setCountry, setCurrency, setLanguage,
      fmt, fmtShort, t,
      currencyInfo: CURRENCIES[currency],
      availableLanguages,
      allCurrencies: CURRENCIES,
      allCountries: COUNTRY_DATA,
      allLanguages: LANGUAGES,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
