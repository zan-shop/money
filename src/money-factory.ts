import BigNumber from 'bignumber.js';

import { CurrencyEnum, validateCurrencyCode } from './currency.enum';
import { Money } from './money';
import { MoneyDto } from './money.dto';

const invalidStringFormatError = 'Invalid Money string format';

export class MoneyFactory {
  public static fromMoneyDto(dto: MoneyDto): Money {
    const value = new BigNumber(dto.amount);
    if (value.isNaN() || !value.isFinite()) {
      throw new Error(invalidStringFormatError);
    }
    return new Money(value, dto.currency);
  }

  public static fromNumber(value: number, currencyCode: CurrencyEnum = CurrencyEnum.USD): Money {
    validateCurrencyCode(currencyCode);
    if (isNaN(value) || !isFinite(value)) {
      throw new Error('Invalid Money number value');
    }
    return new Money(new BigNumber(value), currencyCode);
  }

  public static fromString(data: string, currencyCode: CurrencyEnum = CurrencyEnum.USD): Money {
    validateCurrencyCode(currencyCode);
    const value = new BigNumber(data);
    if (value.isNaN() || !value.isFinite()) {
      throw new Error(invalidStringFormatError);
    }
    return new Money(value, currencyCode);
  }

  public static fromAnyOrThrow(
    value: string | number | BigNumber | MoneyDto,
    currencyCode: CurrencyEnum = CurrencyEnum.USD,
  ): Money {
    validateCurrencyCode(currencyCode);
    if (value === undefined || value === null) {
      throw new Error('Invalid Money input value');
    }
    if (typeof value === 'number') {
      return this.fromNumber(value, currencyCode);
    } else if (typeof value === 'string') {
      return this.fromString(value, currencyCode);
    } else if (value instanceof BigNumber) {
      if (value.isNaN() || !value.isFinite()) {
        throw new Error('Invalid Money BigNumber value: must be finite and not NaN');
      }
      return new Money(value, currencyCode);
    } else if (
      typeof value === 'object' &&
      'amount' in value &&
      'currency' in value &&
      typeof value.amount === 'string'
    ) {
      return this.fromMoneyDto(value as MoneyDto);
    } else {
      throw new Error('Invalid Money input value');
    }
  }

  public static zero(currencyCode: CurrencyEnum = CurrencyEnum.USD): Money {
    validateCurrencyCode(currencyCode);
    return new Money(0, currencyCode);
  }

  public static fromCents(cents: number, currencyCode: CurrencyEnum = CurrencyEnum.USD): Money {
    validateCurrencyCode(currencyCode);
    if (!Number.isInteger(cents) || !isFinite(cents)) {
      throw new Error('Cents must be an integer');
    }
    return new Money(new BigNumber(cents).dividedBy(100), currencyCode);
  }
}

