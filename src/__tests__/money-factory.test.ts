import { describe, expect, it, beforeEach } from '@jest/globals';
import BigNumber from 'bignumber.js';

import { MoneyFactory } from '../money-factory';
import { CurrencyEnum } from '../currency.enum';
import { Money } from '../money';
import { MoneyDto } from '../money.dto';

describe('MoneyFactory', () => {
  beforeEach(() => {
    BigNumber.config({ DECIMAL_PLACES: 20 });
  });

  describe('fromMoneyDto', () => {
    it('should create Money from valid MoneyDto', () => {
      const dto: MoneyDto = { amount: '100.50', currency: CurrencyEnum.USD };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money).toBeInstanceOf(Money);
      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from MoneyDto with zero amount', () => {
      const dto: MoneyDto = { amount: '0', currency: CurrencyEnum.EUR };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money.toNumber()).toBe(0);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should create Money from MoneyDto with negative amount', () => {
      const dto: MoneyDto = { amount: '-50.25', currency: CurrencyEnum.PLN };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money.toNumber()).toBe(-50.25);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.PLN);
    });

    it('should create Money from MoneyDto with very large amount', () => {
      const dto: MoneyDto = { amount: '999999999999999.99', currency: CurrencyEnum.USD };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money.toString()).toBe('999999999999999.99');
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from MoneyDto with very small decimal', () => {
      const dto: MoneyDto = { amount: '0.00000001', currency: CurrencyEnum.USD };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money.toNumber()).toBe(0.00000001);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from MoneyDto with scientific notation', () => {
      const dto: MoneyDto = { amount: '1e10', currency: CurrencyEnum.USD };
      const money = MoneyFactory.fromMoneyDto(dto);

      expect(money.toNumber()).toBe(10000000000);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should throw error for invalid string format', () => {
      const dto: MoneyDto = { amount: 'invalid', currency: CurrencyEnum.USD };

      expect(() => MoneyFactory.fromMoneyDto(dto)).toThrow('Invalid Money string format');
    });

    it('should throw error for empty string', () => {
      const dto: MoneyDto = { amount: '', currency: CurrencyEnum.USD };

      expect(() => MoneyFactory.fromMoneyDto(dto)).toThrow('Invalid Money string format');
    });

    it('should throw error for NaN string', () => {
      const dto: MoneyDto = { amount: 'NaN', currency: CurrencyEnum.USD };

      expect(() => MoneyFactory.fromMoneyDto(dto)).toThrow('Invalid Money string format');
    });

    it('should throw error for Infinity in MoneyDto', () => {
      const dto: MoneyDto = { amount: 'Infinity', currency: CurrencyEnum.USD };

      expect(() => MoneyFactory.fromMoneyDto(dto)).toThrow('Invalid Money string format');
    });

    it('should throw error for negative Infinity in MoneyDto', () => {
      const dto: MoneyDto = { amount: '-Infinity', currency: CurrencyEnum.USD };

      expect(() => MoneyFactory.fromMoneyDto(dto)).toThrow('Invalid Money string format');
    });

    it('should handle different currency codes', () => {
      const currencies = [
        CurrencyEnum.USD, CurrencyEnum.EUR, CurrencyEnum.PLN, CurrencyEnum.GBP,
        CurrencyEnum.JPY, CurrencyEnum.CHF, CurrencyEnum.AUD, CurrencyEnum.CAD
      ];

      currencies.forEach(currency => {
        const dto: MoneyDto = { amount: '100', currency };
        const money = MoneyFactory.fromMoneyDto(dto);
        expect(money.getCurrencyCode()).toBe(currency);
      });
    });
  });

  describe('fromNumber', () => {
    it('should create Money from valid positive number', () => {
      const money = MoneyFactory.fromNumber(100.50);

      expect(money).toBeInstanceOf(Money);
      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from zero', () => {
      const money = MoneyFactory.fromNumber(0);

      expect(money.toNumber()).toBe(0);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from negative number', () => {
      const money = MoneyFactory.fromNumber(-50.25);

      expect(money.toNumber()).toBe(-50.25);
    });

    it('should create Money with specified currency', () => {
      const money = MoneyFactory.fromNumber(100, CurrencyEnum.EUR);

      expect(money.toNumber()).toBe(100);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should handle very large numbers', () => {
      const money = MoneyFactory.fromNumber(999999999999999.99);

      expect(money.toNumber()).toBe(999999999999999.99);
    });

    it('should handle very small numbers', () => {
      const money = MoneyFactory.fromNumber(0.00000001);

      expect(money.toNumber()).toBe(0.00000001);
    });

    it('should handle negative zero', () => {
      const money = MoneyFactory.fromNumber(-0);

      expect(money.toNumber()).toBe(-0);
    });

    it('should handle Number.MAX_SAFE_INTEGER', () => {
      const money = MoneyFactory.fromNumber(Number.MAX_SAFE_INTEGER);

      expect(money.toNumber()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle Number.MIN_SAFE_INTEGER', () => {
      const money = MoneyFactory.fromNumber(Number.MIN_SAFE_INTEGER);

      expect(money.toNumber()).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should throw error for NaN', () => {
      expect(() => MoneyFactory.fromNumber(NaN)).toThrow('Invalid Money number value');
    });

    it('should throw error for Infinity', () => {
      expect(() => MoneyFactory.fromNumber(Infinity)).toThrow('Invalid Money number value');
    });

    it('should throw error for negative Infinity', () => {
      expect(() => MoneyFactory.fromNumber(-Infinity)).toThrow('Invalid Money number value');
    });

    it('should handle floating point precision issues', () => {
      const money = MoneyFactory.fromNumber(0.1 + 0.2);

      expect(money.toNumber()).toBeCloseTo(0.3, 10);
    });
  });

  describe('fromString', () => {
    it('should create Money from valid string', () => {
      const money = MoneyFactory.fromString('100.50');

      expect(money).toBeInstanceOf(Money);
      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from string with specified currency', () => {
      const money = MoneyFactory.fromString('100.50', CurrencyEnum.EUR);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should handle zero string', () => {
      const money = MoneyFactory.fromString('0');

      expect(money.toNumber()).toBe(0);
    });

    it('should handle negative string', () => {
      const money = MoneyFactory.fromString('-50.25');

      expect(money.toNumber()).toBe(-50.25);
    });

    it('should handle string without decimal part', () => {
      const money = MoneyFactory.fromString('100');

      expect(money.toNumber()).toBe(100);
    });

    it('should handle string with leading zeros', () => {
      const money = MoneyFactory.fromString('0000100.50');

      expect(money.toNumber()).toBe(100.50);
    });

    it('should handle string with trailing zeros', () => {
      const money = MoneyFactory.fromString('100.5000');

      expect(money.toString()).toBe('100.5');
    });

    it('should handle very large string number', () => {
      const money = MoneyFactory.fromString('999999999999999999999999.99');

      expect(money.toBigNumber().toFixed()).toBe('999999999999999999999999.99');
    });

    it('should handle very small decimal string', () => {
      const money = MoneyFactory.fromString('0.00000000000000000001');

      expect(money.toBigNumber().toFixed()).toBe('0.00000000000000000001');
    });

    it('should handle scientific notation string', () => {
      const money = MoneyFactory.fromString('1e10');

      expect(money.toNumber()).toBe(10000000000);
    });

    it('should handle negative scientific notation', () => {
      const money = MoneyFactory.fromString('-1e-5');

      expect(money.toNumber()).toBe(-0.00001);
    });

    it('should throw error for invalid string', () => {
      expect(() => MoneyFactory.fromString('invalid')).toThrow('Invalid Money string format');
    });

    it('should throw error for empty string', () => {
      expect(() => MoneyFactory.fromString('')).toThrow('Invalid Money string format');
    });

    it('should throw error for NaN string', () => {
      expect(() => MoneyFactory.fromString('NaN')).toThrow('Invalid Money string format');
    });

    it('should throw error for Infinity string', () => {
      expect(() => MoneyFactory.fromString('Infinity')).toThrow('Invalid Money string format');
    });

    it('should throw error for negative Infinity string', () => {
      expect(() => MoneyFactory.fromString('-Infinity')).toThrow('Invalid Money string format');
    });

    it('should throw error for string with invalid characters', () => {
      expect(() => MoneyFactory.fromString('100.50$')).toThrow('Invalid Money string format');
    });

    it('should throw error for string with spaces', () => {
      expect(() => MoneyFactory.fromString('100 .50')).toThrow('Invalid Money string format');
    });

    it('should throw error for multiple decimal points', () => {
      expect(() => MoneyFactory.fromString('100.50.25')).toThrow('Invalid Money string format');
    });
  });

  describe('fromAnyOrThrow', () => {
    it('should create Money from number', () => {
      const money = MoneyFactory.fromAnyOrThrow(100.50);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from string', () => {
      const money = MoneyFactory.fromAnyOrThrow('100.50');

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from BigNumber', () => {
      const bigNum = new BigNumber('100.50');
      const money = MoneyFactory.fromAnyOrThrow(bigNum);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from MoneyDto', () => {
      const dto: MoneyDto = { amount: '100.50', currency: CurrencyEnum.EUR };
      const money = MoneyFactory.fromAnyOrThrow(dto);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should create Money with specified currency for number', () => {
      const money = MoneyFactory.fromAnyOrThrow(100, CurrencyEnum.PLN);

      expect(money.getCurrencyCode()).toBe(CurrencyEnum.PLN);
    });

    it('should create Money with specified currency for string', () => {
      const money = MoneyFactory.fromAnyOrThrow('100', CurrencyEnum.GBP);

      expect(money.getCurrencyCode()).toBe(CurrencyEnum.GBP);
    });

    it('should create Money with specified currency for BigNumber', () => {
      const bigNum = new BigNumber('100');
      const money = MoneyFactory.fromAnyOrThrow(bigNum, CurrencyEnum.CHF);

      expect(money.getCurrencyCode()).toBe(CurrencyEnum.CHF);
    });

    it('should ignore currency parameter for MoneyDto', () => {
      const dto: MoneyDto = { amount: '100', currency: CurrencyEnum.EUR };
      const money = MoneyFactory.fromAnyOrThrow(dto, CurrencyEnum.USD);

      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should handle zero from any type', () => {
      expect(MoneyFactory.fromAnyOrThrow(0).toNumber()).toBe(0);
      expect(MoneyFactory.fromAnyOrThrow('0').toNumber()).toBe(0);
      expect(MoneyFactory.fromAnyOrThrow(new BigNumber(0)).toNumber()).toBe(0);
    });

    it('should handle negative values from any type', () => {
      expect(MoneyFactory.fromAnyOrThrow(-100).toNumber()).toBe(-100);
      expect(MoneyFactory.fromAnyOrThrow('-100').toNumber()).toBe(-100);
      expect(MoneyFactory.fromAnyOrThrow(new BigNumber(-100)).toNumber()).toBe(-100);
    });

    it('should throw error for undefined', () => {
      expect(() => MoneyFactory.fromAnyOrThrow(undefined as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for null', () => {
      expect(() => MoneyFactory.fromAnyOrThrow(null as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for boolean', () => {
      expect(() => MoneyFactory.fromAnyOrThrow(true as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for array', () => {
      expect(() => MoneyFactory.fromAnyOrThrow([100] as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for plain object', () => {
      expect(() => MoneyFactory.fromAnyOrThrow({} as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for object without amount', () => {
      expect(() => MoneyFactory.fromAnyOrThrow({ currency: CurrencyEnum.USD } as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for object without currency', () => {
      expect(() => MoneyFactory.fromAnyOrThrow({ amount: '100' } as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for object with number amount instead of string', () => {
      expect(() => MoneyFactory.fromAnyOrThrow({ amount: 100, currency: CurrencyEnum.USD } as any)).toThrow('Invalid Money input value');
    });

    it('should throw error for NaN number', () => {
      expect(() => MoneyFactory.fromAnyOrThrow(NaN)).toThrow('Invalid Money number value');
    });

    it('should throw error for invalid string', () => {
      expect(() => MoneyFactory.fromAnyOrThrow('invalid')).toThrow('Invalid Money string format');
    });

    it('should throw error for MoneyDto with invalid amount', () => {
      const dto: MoneyDto = { amount: 'invalid', currency: CurrencyEnum.USD };
      expect(() => MoneyFactory.fromAnyOrThrow(dto)).toThrow('Invalid Money string format');
    });
  });

  describe('zero', () => {
    it('should create zero Money with default currency', () => {
      const money = MoneyFactory.zero();

      expect(money.toNumber()).toBe(0);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create zero Money with specified currency', () => {
      const money = MoneyFactory.zero(CurrencyEnum.EUR);

      expect(money.toNumber()).toBe(0);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should create zero Money for all supported currencies', () => {
      const currencies = Object.values(CurrencyEnum);

      currencies.forEach(currency => {
        const money = MoneyFactory.zero(currency);
        expect(money.toNumber()).toBe(0);
        expect(money.getCurrencyCode()).toBe(currency);
      });
    });

    it('should create Money that equals to zero', () => {
      const zero1 = MoneyFactory.zero(CurrencyEnum.USD);
      const zero2 = MoneyFactory.fromNumber(0, CurrencyEnum.USD);

      expect(zero1.isEqual(zero2)).toBe(true);
    });

    it('should create Money that is neither positive nor negative', () => {
      const zero = MoneyFactory.zero();

      expect(zero.isGreaterThan(MoneyFactory.fromNumber(-1, CurrencyEnum.USD))).toBe(true);
      expect(zero.isLessThan(MoneyFactory.fromNumber(1, CurrencyEnum.USD))).toBe(true);
    });
  });

  describe('fromCents', () => {
    it('should create Money from positive cents', () => {
      const money = MoneyFactory.fromCents(10050);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from zero cents', () => {
      const money = MoneyFactory.fromCents(0);

      expect(money.toNumber()).toBe(0);
    });

    it('should create Money from negative cents', () => {
      const money = MoneyFactory.fromCents(-5025);

      expect(money.toNumber()).toBe(-50.25);
    });

    it('should create Money with specified currency', () => {
      const money = MoneyFactory.fromCents(10050, CurrencyEnum.EUR);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should handle single cent', () => {
      const money = MoneyFactory.fromCents(1);

      expect(money.toNumber()).toBe(0.01);
    });

    it('should handle large cent values', () => {
      const money = MoneyFactory.fromCents(99999999999999);

      expect(money.toNumber()).toBe(999999999999.99);
    });

    it('should handle Number.MAX_SAFE_INTEGER cents', () => {
      const money = MoneyFactory.fromCents(Number.MAX_SAFE_INTEGER);

      expect(money.toString()).toBe('90071992547409.91');
    });

    it('should handle Number.MIN_SAFE_INTEGER cents', () => {
      const money = MoneyFactory.fromCents(Number.MIN_SAFE_INTEGER);

      expect(money.toString()).toBe('-90071992547409.91');
    });

    it('should throw error for non-integer cents', () => {
      expect(() => MoneyFactory.fromCents(100.5)).toThrow('Cents must be an integer');
    });

    it('should throw error for decimal cents', () => {
      expect(() => MoneyFactory.fromCents(100.999)).toThrow('Cents must be an integer');
    });

    it('should throw error for NaN cents', () => {
      expect(() => MoneyFactory.fromCents(NaN)).toThrow('Cents must be an integer');
    });

    it('should throw error for Infinity cents', () => {
      expect(() => MoneyFactory.fromCents(Infinity)).toThrow('Cents must be an integer');
    });

    it('should throw error for negative Infinity cents', () => {
      expect(() => MoneyFactory.fromCents(-Infinity)).toThrow('Cents must be an integer');
    });

    it('should create correct value when converting back and forth', () => {
      const originalCents = 12345;
      const money = MoneyFactory.fromCents(originalCents);
      const backToCents = Math.round(money.toNumber() * 100);

      expect(backToCents).toBe(originalCents);
    });
  });

  describe('edge cases and integration tests', () => {
    it('should handle creating Money from different methods with same value', () => {
      const fromNumber = MoneyFactory.fromNumber(100.50, CurrencyEnum.USD);
      const fromString = MoneyFactory.fromString('100.50', CurrencyEnum.USD);
      const fromCents = MoneyFactory.fromCents(10050, CurrencyEnum.USD);
      const fromBigNumber = MoneyFactory.fromAnyOrThrow(new BigNumber('100.50'), CurrencyEnum.USD);
      const fromDto = MoneyFactory.fromMoneyDto({ amount: '100.50', currency: CurrencyEnum.USD });

      expect(fromNumber.isEqual(fromString)).toBe(true);
      expect(fromString.isEqual(fromCents)).toBe(true);
      expect(fromCents.isEqual(fromBigNumber)).toBe(true);
      expect(fromBigNumber.isEqual(fromDto)).toBe(true);
    });

    it('should preserve precision across different creation methods', () => {
      const value = '123456789.123456789';
      const fromString = MoneyFactory.fromString(value);
      const fromDto = MoneyFactory.fromMoneyDto({ amount: value, currency: CurrencyEnum.USD });
      const fromAny = MoneyFactory.fromAnyOrThrow(value);

      expect(fromString.toString()).toBe(value);
      expect(fromDto.toString()).toBe(value);
      expect(fromAny.toString()).toBe(value);
    });

    it('should handle very precise decimal values', () => {
      const preciseValue = '0.12345678901234567890';
      const money = MoneyFactory.fromString(preciseValue);

      expect(money.toString()).toBe('0.1234567890123456789');
    });

    it('should handle extreme negative values', () => {
      const extremeNegative = '-999999999999999999.99';
      const money = MoneyFactory.fromString(extremeNegative);

      expect(money.toString()).toBe(extremeNegative);
      expect(money.toNumber()).toBe(-999999999999999999.99);
    });

    it('should create instances that work with Money operations', () => {
      const money1 = MoneyFactory.fromNumber(100, CurrencyEnum.USD);
      const money2 = MoneyFactory.fromString('50', CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(150);
    });
  });
});

