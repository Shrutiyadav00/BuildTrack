export const CURRENCIES = {
  PKR: { symbol: '₨', name: 'Pakistani Rupee',   locale: 'ur-PK',  flag: '🇵🇰' },
  INR: { symbol: '₹', name: 'Indian Rupee',       locale: 'en-IN',  flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar',           locale: 'en-US',  flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro',                locale: 'de-DE',  flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound',       locale: 'en-GB',  flag: '🇬🇧' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham',        locale: 'ar-AE',  flag: '🇦🇪' },
  SAR: { symbol: '﷼',  name: 'Saudi Riyal',        locale: 'ar-SA',  flag: '🇸🇦' },
  QAR: { symbol: '﷼',  name: 'Qatari Riyal',       locale: 'ar-QA',  flag: '🇶🇦' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar',     locale: 'ar-KW',  flag: '🇰🇼' },
  OMR: { symbol: 'ر.ع.', name: 'Omani Rial',       locale: 'ar-OM',  flag: '🇴🇲' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka',    locale: 'bn-BD',  flag: '🇧🇩' },
  NPR: { symbol: 'रू', name: 'Nepalese Rupee',     locale: 'ne-NP',  flag: '🇳🇵' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee',   locale: 'si-LK',  flag: '🇱🇰' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit',  locale: 'ms-MY',  flag: '🇲🇾' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar',   locale: 'en-SG',  flag: '🇸🇬' },
  CNY: { symbol: '¥',  name: 'Chinese Yuan',       locale: 'zh-CN',  flag: '🇨🇳' },
  JPY: { symbol: '¥',  name: 'Japanese Yen',       locale: 'ja-JP',  flag: '🇯🇵' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar',    locale: 'en-CA',  flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar',  locale: 'en-AU',  flag: '🇦🇺' },
  TRY: { symbol: '₺',  name: 'Turkish Lira',       locale: 'tr-TR',  flag: '🇹🇷' },
  ZAR: { symbol: 'R',  name: 'South African Rand', locale: 'en-ZA',  flag: '🇿🇦' },
  NGN: { symbol: '₦',  name: 'Nigerian Naira',     locale: 'en-NG',  flag: '🇳🇬' },
  BRL: { symbol: 'R$', name: 'Brazilian Real',     locale: 'pt-BR',  flag: '🇧🇷' },
  MXN: { symbol: '$',  name: 'Mexican Peso',       locale: 'es-MX',  flag: '🇲🇽' },
};

export const COUNTRY_DATA = {
  PK: { name: 'Pakistan',       currency: 'PKR', languages: ['en','ur','pa'],                                                       flag: '🇵🇰' },
  IN: { name: 'India',          currency: 'INR', languages: ['en','hi','ta','te','kn','ml','bn','mr','gu','pa','ur'],                flag: '🇮🇳' },
  US: { name: 'United States',  currency: 'USD', languages: ['en','es'],                                                            flag: '🇺🇸' },
  GB: { name: 'United Kingdom', currency: 'GBP', languages: ['en'],                                                                 flag: '🇬🇧' },
  AE: { name: 'UAE',            currency: 'AED', languages: ['en','ar'],                                                            flag: '🇦🇪' },
  SA: { name: 'Saudi Arabia',   currency: 'SAR', languages: ['ar','en'],                                                            flag: '🇸🇦' },
  QA: { name: 'Qatar',          currency: 'QAR', languages: ['ar','en'],                                                            flag: '🇶🇦' },
  KW: { name: 'Kuwait',         currency: 'KWD', languages: ['ar','en'],                                                            flag: '🇰🇼' },
  OM: { name: 'Oman',           currency: 'OMR', languages: ['ar','en'],                                                            flag: '🇴🇲' },
  DE: { name: 'Germany',        currency: 'EUR', languages: ['de','en'],                                                            flag: '🇩🇪' },
  FR: { name: 'France',         currency: 'EUR', languages: ['fr','en'],                                                            flag: '🇫🇷' },
  ES: { name: 'Spain',          currency: 'EUR', languages: ['es','en'],                                                            flag: '🇪🇸' },
  CN: { name: 'China',          currency: 'CNY', languages: ['zh','en'],                                                            flag: '🇨🇳' },
  JP: { name: 'Japan',          currency: 'JPY', languages: ['en'],                                                                 flag: '🇯🇵' },
  BD: { name: 'Bangladesh',     currency: 'BDT', languages: ['bn','en'],                                                            flag: '🇧🇩' },
  NP: { name: 'Nepal',          currency: 'NPR', languages: ['hi','en'],                                                            flag: '🇳🇵' },
  SG: { name: 'Singapore',      currency: 'SGD', languages: ['en','zh','ta'],                                                       flag: '🇸🇬' },
  MY: { name: 'Malaysia',       currency: 'MYR', languages: ['en','zh','ta'],                                                       flag: '🇲🇾' },
  AU: { name: 'Australia',      currency: 'AUD', languages: ['en'],                                                                 flag: '🇦🇺' },
  CA: { name: 'Canada',         currency: 'CAD', languages: ['en','fr'],                                                            flag: '🇨🇦' },
  ZA: { name: 'South Africa',   currency: 'ZAR', languages: ['en'],                                                                 flag: '🇿🇦' },
  NG: { name: 'Nigeria',        currency: 'NGN', languages: ['en'],                                                                 flag: '🇳🇬' },
  TR: { name: 'Turkey',         currency: 'TRY', languages: ['en'],                                                                 flag: '🇹🇷' },
  BR: { name: 'Brazil',         currency: 'BRL', languages: ['es','en'],                                                            flag: '🇧🇷' },
  MX: { name: 'Mexico',         currency: 'MXN', languages: ['es','en'],                                                            flag: '🇲🇽' },
};

export const formatAmount = (value, currencyCode = 'PKR') => {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.PKR;
  const num = Number(value) || 0;
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency', currency: currencyCode,
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${curr.symbol}${Math.round(num).toLocaleString()}`;
  }
};

export const formatCompact = (value, currencyCode = 'PKR') => {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.PKR;
  const num = Number(value) || 0;
  if (num >= 1e9) return `${curr.symbol}${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${curr.symbol}${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${curr.symbol}${(num / 1e3).toFixed(0)}K`;
  return formatAmount(num, currencyCode);
};
