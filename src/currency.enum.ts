export enum CurrencyEnum {
  PLN = 'PLN',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
  CZK = 'CZK',
  DKK = 'DKK',
  SEK = 'SEK',
  NOK = 'NOK',
  HUF = 'HUF',
  RON = 'RON',
  BGN = 'BGN',
  UAH = 'UAH',
  TRY = 'TRY',
  JPY = 'JPY',
  CNY = 'CNY',
  AUD = 'AUD',
  CAD = 'CAD',
  NZD = 'NZD',
  ZAR = 'ZAR',
  BRL = 'BRL',
  MXN = 'MXN',
  INR = 'INR',
  KRW = 'KRW',
  SGD = 'SGD',
  HKD = 'HKD',
  THB = 'THB',
  IDR = 'IDR',
  MYR = 'MYR',
  PHP = 'PHP',
  SAR = 'SAR',
  KWD = 'KWD',
  QAR = 'QAR',
  OMR = 'OMR',
  AED = 'AED',
  BHD = 'BHD',
  IQD = 'IQD',
  SYP = 'SYP',
  EGP = 'EGP',
}

export function isValidCurrencyCode(value: any): value is CurrencyEnum {
  if (value === null || value === undefined) {
    return false;
  }
  return Object.values(CurrencyEnum).includes(value);
}

export function validateCurrencyCode(currencyCode: CurrencyEnum): void {
  if (!isValidCurrencyCode(currencyCode)) {
    throw new Error(`Invalid currency code: ${currencyCode}`);
  }
}

