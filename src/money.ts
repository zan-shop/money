import { CurrencyEnum, validateCurrencyCode } from './currency.enum';
import BigNumber from 'bignumber.js';

import { ZanNumber } from './zan-number';
import { MoneyDto } from './money.dto';

export const comparementError = 'Cannot compare Money instances with different currencies';
export const sumError = 'Cannot sum Money instances with different currencies';

/**
 * Type guard to check if a value is a Money instance
 */
export function isMoney(value: unknown): value is Money {
  return value instanceof Money;
}

export class Money {
  private readonly _value: ZanNumber;
  private readonly currencyCode: CurrencyEnum;

  /**
   * Consider using MoneyFactory for creating Money instances with validation
   */
  constructor(value: BigNumber | number | string, currencyCode: CurrencyEnum) {
    // Validate currency code
    validateCurrencyCode(currencyCode);

    // ZanNumber constructor handles value validation (NaN, Infinity, type checking)
    this._value = new ZanNumber(value);
    this.currencyCode = currencyCode;
  }

  public static sum(...args: Money[]): Money {
    if (args.length === 0) {
      throw new Error('Cannot sum empty array');
    }

    const first = args[0];
    const currency = first.currencyCode;

    // Validate all currencies match
    for (let i = 1; i < args.length; i++) {
      if (args[i].currencyCode !== currency) {
        throw new Error(sumError);
      }
    }

    return new Money(ZanNumber.sum(...args.map(m => m._value)).toBigNumber(), currency);
  }

  public static min(...args: Money[]): Money {
    if (args.length === 0) {
      throw new Error('Cannot get min of empty array');
    }

    const first = args[0];
    const currency = first.currencyCode;

    // Validate all currencies match
    for (let i = 1; i < args.length; i++) {
      if (args[i].currencyCode !== currency) {
        throw new Error(comparementError);
      }
    }

    return new Money(ZanNumber.min(...args.map(m => m._value)).toBigNumber(), currency);
  }

  public static max(...args: Money[]): Money {
    if (args.length === 0) {
      throw new Error('Cannot get max of empty array');
    }

    const first = args[0];
    const currency = first.currencyCode;

    // Validate all currencies match
    for (let i = 1; i < args.length; i++) {
      if (args[i].currencyCode !== currency) {
        throw new Error(comparementError);
      }
    }

    return new Money(ZanNumber.max(...args.map(m => m._value)).toBigNumber(), currency);
  }


  public getCurrencyCode(): string {
    return this.currencyCode;
  }

  public toNumber(): number {
    return this._value.toNumber();
  }

  public toString(base?: number): string {
    return this._value.toString(base);
  }

  public toBigNumber(): BigNumber {
    return this._value.toBigNumber();
  }

  public toMoneyDto(): MoneyDto {
    return { amount: this._value.toString(), currency: this.currencyCode };
  }

  public toCents(): number {
    return Math.round(this._value.toBigNumber().times(100).toNumber());
  }

  public add(other: Money): Money {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error('Cannot add money with different currency codes');
    }
    return new Money(this._value.add(other._value).toBigNumber(), this.currencyCode);
  }

  public subtract(other: Money): Money {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error('Cannot subtract money with different currency codes');
    }
    return new Money(this._value.subtract(other._value).toBigNumber(), this.currencyCode);
  }

  public multiplyAndRound(multiplier: number, scale: number = BigNumber.config().DECIMAL_PLACES!): Money {
    return new Money(this._value.multiplyAndRound(multiplier, scale).toBigNumber(), this.currencyCode);
  }

  public divideAndRound(divider: number, scale: number = BigNumber.config().DECIMAL_PLACES!): Money {
    return new Money(this._value.divideAndRound(divider, scale).toBigNumber(), this.currencyCode);
  }

  public round(scale: number = BigNumber.config().DECIMAL_PLACES!): Money {
    return new Money(this._value.round(scale).toBigNumber(), this.currencyCode);
  }

  public isEqual(other: Money): boolean {
    if (!isMoney(other)) {
      return false;
    }
    return this.currencyCode === other.currencyCode && this._value.isEqual(other._value);
  }

  public isLessThan(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this._value.isLessThan(other._value);
  }

  public isLessThanOrEqual(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this._value.isLessThanOrEqual(other._value);
  }

  public isGreaterThan(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this._value.isGreaterThan(other._value);
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this._value.isGreaterThanOrEqual(other._value);
  }

  public min(other: Money): Money {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this.isLessThan(other) ? this : other;
  }

  public max(other: Money): Money {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(comparementError);
    }
    return this.isGreaterThan(other) ? this : other;
  }
}
