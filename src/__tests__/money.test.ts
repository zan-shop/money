import { describe, expect, it, beforeEach } from '@jest/globals';
import BigNumber from 'bignumber.js';

import { Money, comparementError, sumError, isMoney } from '../money';
import { CurrencyEnum } from '../currency.enum';
import { MoneyFactory } from '../money-factory';

describe('Money', () => {
  beforeEach(() => {
    BigNumber.config({ DECIMAL_PLACES: 20 });
  });

  describe('constructor', () => {
    it('should create Money from BigNumber', () => {
      const money = new Money(new BigNumber(100), CurrencyEnum.USD);

      expect(money.toNumber()).toBe(100);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should create Money from number', () => {
      const money = new Money(100.50, CurrencyEnum.EUR);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should create Money from string', () => {
      const money = new Money('100.50', CurrencyEnum.PLN);

      expect(money.toNumber()).toBe(100.50);
      expect(money.getCurrencyCode()).toBe(CurrencyEnum.PLN);
    });


    it('should handle zero value', () => {
      const money = new Money(0, CurrencyEnum.USD);

      expect(money.toNumber()).toBe(0);
    });

    it('should handle negative value', () => {
      const money = new Money(-100, CurrencyEnum.USD);

      expect(money.toNumber()).toBe(-100);
    });

    it('should throw error for NaN number', () => {
      expect(() => new Money(NaN, CurrencyEnum.USD)).toThrow('Invalid ZanNumber number value: must be finite and not NaN');
    });

    it('should throw error for Infinity number', () => {
      expect(() => new Money(Infinity, CurrencyEnum.USD)).toThrow('Invalid ZanNumber number value: must be finite and not NaN');
    });

    it('should throw error for negative Infinity number', () => {
      expect(() => new Money(-Infinity, CurrencyEnum.USD)).toThrow('Invalid ZanNumber number value: must be finite and not NaN');
    });

    it('should throw error for NaN BigNumber', () => {
      const nanBigNumber = new BigNumber(NaN);
      expect(() => new Money(nanBigNumber, CurrencyEnum.USD)).toThrow('Invalid ZanNumber BigNumber value: must be finite and not NaN');
    });

    it('should throw error for Infinity BigNumber', () => {
      const infinityBigNumber = new BigNumber(Infinity);
      expect(() => new Money(infinityBigNumber, CurrencyEnum.USD)).toThrow('Invalid ZanNumber BigNumber value: must be finite and not NaN');
    });

    it('should throw error for invalid string', () => {
      expect(() => new Money('invalid', CurrencyEnum.USD)).toThrow('Invalid ZanNumber string format: must be finite and not NaN');
    });

    it('should throw error for NaN string', () => {
      expect(() => new Money('NaN', CurrencyEnum.USD)).toThrow('Invalid ZanNumber string format: must be finite and not NaN');
    });

    it('should throw error for Infinity string', () => {
      expect(() => new Money('Infinity', CurrencyEnum.USD)).toThrow('Invalid ZanNumber string format: must be finite and not NaN');
    });

    it('should throw error for invalid type', () => {
      expect(() => new Money({} as any, CurrencyEnum.USD)).toThrow('Invalid ZanNumber input type: must be BigNumber, number, or string');
    });
  });

  describe('getCurrencyCode', () => {
    it('should return correct currency code', () => {
      const money = new Money(100, CurrencyEnum.EUR);

      expect(money.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });


    it('should return correct currency for all supported currencies', () => {
      const currencies = Object.values(CurrencyEnum);

      currencies.forEach(currency => {
        const money = new Money(100, currency);
        expect(money.getCurrencyCode()).toBe(currency);
      });
    });
  });

  describe('toMoneyDto', () => {
    it('should convert Money to MoneyDto', () => {
      const money = new Money(100.50, CurrencyEnum.USD);
      const dto = money.toMoneyDto();

      expect(dto).toEqual({
        amount: '100.5',
        currency: CurrencyEnum.USD,
      });
    });

    it('should handle zero value', () => {
      const money = new Money(0, CurrencyEnum.EUR);
      const dto = money.toMoneyDto();

      expect(dto).toEqual({
        amount: '0',
        currency: CurrencyEnum.EUR,
      });
    });

    it('should handle negative value', () => {
      const money = new Money(-50.25, CurrencyEnum.PLN);
      const dto = money.toMoneyDto();

      expect(dto).toEqual({
        amount: '-50.25',
        currency: CurrencyEnum.PLN,
      });
    });

    it('should preserve precision in string', () => {
      const money = new Money('123.456789012345', CurrencyEnum.USD);
      const dto = money.toMoneyDto();

      expect(dto.amount).toBe('123.456789012345');
    });

    it('should handle very large numbers', () => {
      const money = new Money('999999999999999.99', CurrencyEnum.USD);
      const dto = money.toMoneyDto();

      expect(dto.amount).toBe('999999999999999.99');
    });
  });

  describe('toCents', () => {
    it('should convert positive Money to cents', () => {
      const money = new Money(100.50, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(10050);
    });

    it('should convert zero to cents', () => {
      const money = new Money(0, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(0);
    });

    it('should convert negative Money to cents', () => {
      const money = new Money(-50.25, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(-5025);
    });

    it('should handle single cent', () => {
      const money = new Money(0.01, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(1);
    });

    it('should handle large amounts', () => {
      const money = new Money(999999999999.99, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(99999999999999);
    });

    it('should round to nearest cent', () => {
      const money1 = new Money(100.124, CurrencyEnum.USD);
      const money2 = new Money(100.125, CurrencyEnum.USD);
      const money3 = new Money(100.126, CurrencyEnum.USD);
      
      expect(money1.toCents()).toBe(10012);
      expect(money2.toCents()).toBe(10013);
      expect(money3.toCents()).toBe(10013);
    });

    it('should be symmetrical with fromCents', () => {
      const originalCents = 10050;
      const money = MoneyFactory.fromCents(originalCents, CurrencyEnum.USD);
      const backToCents = money.toCents();
      
      expect(backToCents).toBe(originalCents);
    });

    it('should work with all currencies', () => {
      const currencies = [CurrencyEnum.USD, CurrencyEnum.EUR, CurrencyEnum.PLN, CurrencyEnum.JPY];
      
      currencies.forEach(currency => {
        const money = new Money(100.50, currency);
        expect(money.toCents()).toBe(10050);
      });
    });

    it('should handle negative zero', () => {
      const money = new Money(-0, CurrencyEnum.USD);
      const cents = money.toCents();
      
      // -0 and 0 are both valid results (edge case in JavaScript)
      expect(Math.abs(cents)).toBe(0);
    });

    it('should handle very small amounts', () => {
      const money = new Money(0.001, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(0);
    });

    it('should handle amounts just below rounding threshold', () => {
      const money = new Money(100.004, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(10000);
    });

    it('should handle amounts just above rounding threshold', () => {
      const money = new Money(100.005, CurrencyEnum.USD);
      
      expect(money.toCents()).toBe(10001);
    });
  });

  describe('add', () => {
    it('should add two Money instances with same currency', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(150);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should add zero', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(100);
    });

    it('should add negative values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(50);
    });

    it('should add two negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(-150);
    });

    it('should preserve precision', () => {
      const money1 = new Money('100.123456789', CurrencyEnum.USD);
      const money2 = new Money('50.987654321', CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toString()).toBe('151.11111111');
    });

    it('should handle very large additions', () => {
      const money1 = new Money('999999999999999', CurrencyEnum.USD);
      const money2 = new Money('999999999999999', CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toString()).toBe('1999999999999998');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.add(money2)).toThrow('Cannot add money with different currency codes');
    });

    it('should not modify original instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      money1.add(money2);

      expect(money1.toNumber()).toBe(100);
      expect(money2.toNumber()).toBe(50);
    });
  });

  describe('subtract', () => {
    it('should subtract two Money instances with same currency', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(50);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should subtract zero', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(100);
    });

    it('should result in negative when subtracting larger value', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(-50);
    });

    it('should subtract negative values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(150);
    });

    it('should subtract two negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(-50);
    });

    it('should preserve precision', () => {
      const money1 = new Money('100.987654321', CurrencyEnum.USD);
      const money2 = new Money('50.123456789', CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toString()).toBe('50.864197532');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.subtract(money2)).toThrow('Cannot subtract money with different currency codes');
    });

    it('should not modify original instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      money1.subtract(money2);

      expect(money1.toNumber()).toBe(100);
      expect(money2.toNumber()).toBe(50);
    });

    it('should result in zero when subtracting same value', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(0);
    });
  });

  describe('multiplyAndRound', () => {
    it('should multiply Money by number', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(2);

      expect(result.toNumber()).toBe(200);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should multiply by zero', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(0);

      expect(result.toNumber()).toBe(0);
    });

    it('should multiply by negative number', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(-2);

      expect(result.toNumber()).toBe(-200);
    });

    it('should multiply by decimal', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(0.5);

      expect(result.toNumber()).toBe(50);
    });

    it('should round to specified scale', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(1.23456789, 2);

      expect(result.toNumber()).toBe(123.46);
    });

    it('should use default scale from BigNumber config', () => {
      BigNumber.config({ DECIMAL_PLACES: 4 });
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(1.23456789);

      expect(result.toString()).toBe('123.4568');
    });

    it('should round half up', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result1 = money.multiplyAndRound(1.045, 2);
      const result2 = money.multiplyAndRound(1.044, 2);

      expect(result1.toNumber()).toBe(104.5);
      expect(result2.toNumber()).toBe(104.4);
    });

    it('should handle very small multipliers', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.multiplyAndRound(0.00001, 10);

      expect(result.toNumber()).toBe(0.001);
    });

    it('should preserve currency', () => {
      const money = new Money(100, CurrencyEnum.EUR);
      const result = money.multiplyAndRound(2);

      expect(result.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should not modify original instance', () => {
      const money = new Money(100, CurrencyEnum.USD);
      money.multiplyAndRound(2);

      expect(money.toNumber()).toBe(100);
    });
  });

  describe('divideAndRound', () => {
    it('should divide Money by number', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.divideAndRound(2);

      expect(result.toNumber()).toBe(50);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should divide by negative number', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.divideAndRound(-2);

      expect(result.toNumber()).toBe(-50);
    });

    it('should divide by decimal', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.divideAndRound(0.5);

      expect(result.toNumber()).toBe(200);
    });

    it('should round to specified scale', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.divideAndRound(3, 2);

      expect(result.toNumber()).toBe(33.33);
    });

    it('should use default scale from BigNumber config', () => {
      BigNumber.config({ DECIMAL_PLACES: 4 });
      const money = new Money(100, CurrencyEnum.USD);
      const result = money.divideAndRound(3);

      expect(result.toString()).toBe('33.3333');
    });

    it('should round half up', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result1 = money.divideAndRound(7, 2);
      const result2 = money.divideAndRound(8, 2);

      expect(result1.toNumber()).toBe(14.29);
      expect(result2.toNumber()).toBe(12.5);
    });

    it('should handle division resulting in very small numbers', () => {
      const money = new Money(1, CurrencyEnum.USD);
      const result = money.divideAndRound(100000, 10);

      expect(result.toNumber()).toBe(0.00001);
    });

    it('should preserve currency', () => {
      const money = new Money(100, CurrencyEnum.EUR);
      const result = money.divideAndRound(2);

      expect(result.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should not modify original instance', () => {
      const money = new Money(100, CurrencyEnum.USD);
      money.divideAndRound(2);

      expect(money.toNumber()).toBe(100);
    });

    it('should handle zero dividend', () => {
      const money = new Money(0, CurrencyEnum.USD);
      const result = money.divideAndRound(5);

      expect(result.toNumber()).toBe(0);
    });

    it('should throw error for division by zero in all forms', () => {
      const money = new Money(100, CurrencyEnum.USD);

      expect(() => money.divideAndRound(0)).toThrow('Division by zero');
      expect(() => money.divideAndRound(0.0)).toThrow('Division by zero');
      expect(() => money.divideAndRound(-0)).toThrow('Division by zero');
    });
  });

  describe('round', () => {
    it('should round to specified scale', () => {
      const money = new Money(100.12345, CurrencyEnum.USD);
      const result = money.round(2);

      expect(result.toNumber()).toBe(100.12);
    });

    it('should round up when needed', () => {
      const money = new Money(100.126, CurrencyEnum.USD);
      const result = money.round(2);

      expect(result.toNumber()).toBe(100.13);
    });

    it('should round half up', () => {
      const money1 = new Money(100.125, CurrencyEnum.USD);
      const money2 = new Money(100.135, CurrencyEnum.USD);

      expect(money1.round(2).toNumber()).toBe(100.13);
      expect(money2.round(2).toNumber()).toBe(100.14);
    });

    it('should use default scale from BigNumber config', () => {
      BigNumber.config({ DECIMAL_PLACES: 3 });
      const money = new Money(100.12345, CurrencyEnum.USD);
      const result = money.round();

      expect(result.toString()).toBe('100.123');
    });

    it('should handle rounding to zero decimals', () => {
      const money = new Money(100.567, CurrencyEnum.USD);
      const result = money.round(0);

      expect(result.toNumber()).toBe(101);
    });

    it('should preserve currency', () => {
      const money = new Money(100.12345, CurrencyEnum.EUR);
      const result = money.round(2);

      expect(result.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should not modify original instance', () => {
      const money = new Money(100.12345, CurrencyEnum.USD);
      money.round(2);

      expect(money.toNumber()).toBe(100.12345);
    });

    it('should handle already rounded numbers', () => {
      const money = new Money(100.12, CurrencyEnum.USD);
      const result = money.round(2);

      expect(result.toNumber()).toBe(100.12);
    });
  });

  describe('isEqual', () => {
    it('should return true for equal Money with same currency', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(false);
    });

    it('should return false for same amount but different currency', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.EUR);

      expect(money1.isEqual(money2)).toBe(false);
    });

    it('should return true for zero values with same currency', () => {
      const money1 = new Money(0, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(true);
    });

    it('should return false for zero values with different currency', () => {
      const money1 = new Money(0, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.EUR);

      expect(money1.isEqual(money2)).toBe(false);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(true);
    });

    it('should handle very precise comparisons', () => {
      const money1 = new Money('100.12345678901234567890', CurrencyEnum.USD);
      const money2 = new Money('100.12345678901234567890', CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(true);
    });

    it('should return false for slightly different precise values', () => {
      const money1 = new Money('100.12345678901234567890', CurrencyEnum.USD);
      const money2 = new Money('100.12345678901234567891', CurrencyEnum.USD);

      expect(money1.isEqual(money2)).toBe(false);
    });
  });

  describe('isLessThan', () => {
    it('should return true when first is less than second', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isLessThan(money2)).toBe(true);
    });

    it('should return false when first is greater than second', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);

      expect(money1.isLessThan(money2)).toBe(false);
    });

    it('should return false when values are equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isLessThan(money2)).toBe(false);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);

      expect(money1.isLessThan(money2)).toBe(true);
    });

    it('should handle zero comparison', () => {
      const money1 = new Money(-1, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);

      expect(money1.isLessThan(money2)).toBe(true);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.EUR);

      expect(() => money1.isLessThan(money2)).toThrow(comparementError);
    });
  });

  describe('isLessThanOrEqual', () => {
    it('should return true when first is less than second', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isLessThanOrEqual(money2)).toBe(true);
    });

    it('should return true when values are equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isLessThanOrEqual(money2)).toBe(true);
    });

    it('should return false when first is greater than second', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);

      expect(money1.isLessThanOrEqual(money2)).toBe(false);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);

      expect(money1.isLessThanOrEqual(money2)).toBe(true);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.EUR);

      expect(() => money1.isLessThanOrEqual(money2)).toThrow(comparementError);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when first is greater than second', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);

      expect(money1.isGreaterThan(money2)).toBe(true);
    });

    it('should return false when first is less than second', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isGreaterThan(money2)).toBe(false);
    });

    it('should return false when values are equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isGreaterThan(money2)).toBe(false);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-50, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);

      expect(money1.isGreaterThan(money2)).toBe(true);
    });

    it('should handle zero comparison', () => {
      const money1 = new Money(1, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);

      expect(money1.isGreaterThan(money2)).toBe(true);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.isGreaterThan(money2)).toThrow(comparementError);
    });
  });

  describe('isGreaterThanOrEqual', () => {
    it('should return true when first is greater than second', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);

      expect(money1.isGreaterThanOrEqual(money2)).toBe(true);
    });

    it('should return true when values are equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isGreaterThanOrEqual(money2)).toBe(true);
    });

    it('should return false when first is less than second', () => {
      const money1 = new Money(50, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);

      expect(money1.isGreaterThanOrEqual(money2)).toBe(false);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);

      expect(money1.isGreaterThanOrEqual(money2)).toBe(true);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.isGreaterThanOrEqual(money2)).toThrow(comparementError);
    });
  });

  describe('min (instance method)', () => {
    it('should return smaller value', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = money1.min(money2);

      expect(result.toNumber()).toBe(50);
    });

    it('should return first value when equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const result = money1.min(money2);

      expect(result.toNumber()).toBe(100);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-50, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);
      const result = money1.min(money2);

      expect(result.toNumber()).toBe(-100);
    });

    it('should handle zero', () => {
      const money1 = new Money(0, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const result = money1.min(money2);

      expect(result.toNumber()).toBe(0);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.min(money2)).toThrow(comparementError);
    });
  });

  describe('max (instance method)', () => {
    it('should return larger value', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = money1.max(money2);

      expect(result.toNumber()).toBe(100);
    });

    it('should return first value when equal', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const result = money1.max(money2);

      expect(result.toNumber()).toBe(100);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-50, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);
      const result = money1.max(money2);

      expect(result.toNumber()).toBe(-50);
    });

    it('should handle zero', () => {
      const money1 = new Money(0, CurrencyEnum.USD);
      const money2 = new Money(-100, CurrencyEnum.USD);
      const result = money1.max(money2);

      expect(result.toNumber()).toBe(0);
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);

      expect(() => money1.max(money2)).toThrow(comparementError);
    });
  });

  describe('Money.sum (static method)', () => {
    it('should sum multiple Money instances with same currency', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const money3 = new Money(25, CurrencyEnum.USD);
      const result = Money.sum(money1, money2, money3);

      expect(result.toNumber()).toBe(175);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should sum two Money instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = Money.sum(money1, money2);

      expect(result.toNumber()).toBe(150);
    });

    it('should handle single Money instance', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = Money.sum(money);

      expect(result.toNumber()).toBe(100);
    });

    it('should sum including zero values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(0, CurrencyEnum.USD);
      const money3 = new Money(50, CurrencyEnum.USD);
      const result = Money.sum(money1, money2, money3);

      expect(result.toNumber()).toBe(150);
    });

    it('should sum including negative values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const money3 = new Money(25, CurrencyEnum.USD);
      const result = Money.sum(money1, money2, money3);

      expect(result.toNumber()).toBe(75);
    });

    it('should preserve precision', () => {
      const money1 = new Money('100.111', CurrencyEnum.USD);
      const money2 = new Money('50.222', CurrencyEnum.USD);
      const money3 = new Money('25.333', CurrencyEnum.USD);
      const result = Money.sum(money1, money2, money3);

      expect(result.toString()).toBe('175.666');
    });

    it('should throw error for empty array', () => {
      expect(() => Money.sum()).toThrow('Cannot sum empty array');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);
      const money3 = new Money(25, CurrencyEnum.USD);

      expect(() => Money.sum(money1, money2, money3)).toThrow(sumError);
    });

    it('should throw error when any currency differs', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const money3 = new Money(25, CurrencyEnum.EUR);

      expect(() => Money.sum(money1, money2, money3)).toThrow(sumError);
    });

    it('should handle large number of summands', () => {
      const moneyArray = Array.from({ length: 100 }, () => new Money(1, CurrencyEnum.USD));
      const result = Money.sum(...moneyArray);

      expect(result.toNumber()).toBe(100);
    });
  });

  describe('Money.min (static method)', () => {
    it('should return minimum from multiple Money instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const money3 = new Money(75, CurrencyEnum.USD);
      const result = Money.min(money1, money2, money3);

      expect(result.toNumber()).toBe(50);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should return minimum from two Money instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = Money.min(money1, money2);

      expect(result.toNumber()).toBe(50);
    });

    it('should handle single Money instance', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = Money.min(money);

      expect(result.toNumber()).toBe(100);
    });

    it('should handle negative values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const money3 = new Money(0, CurrencyEnum.USD);
      const result = Money.min(money1, money2, money3);

      expect(result.toNumber()).toBe(-50);
    });

    it('should handle all equal values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const money3 = new Money(100, CurrencyEnum.USD);
      const result = Money.min(money1, money2, money3);

      expect(result.toNumber()).toBe(100);
    });

    it('should throw error for empty array', () => {
      expect(() => Money.min()).toThrow('Cannot get min of empty array');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);
      const money3 = new Money(75, CurrencyEnum.USD);

      expect(() => Money.min(money1, money2, money3)).toThrow(comparementError);
    });
  });

  describe('Money.max (static method)', () => {
    it('should return maximum from multiple Money instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const money3 = new Money(75, CurrencyEnum.USD);
      const result = Money.max(money1, money2, money3);

      expect(result.toNumber()).toBe(100);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should return maximum from two Money instances', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.USD);
      const result = Money.max(money1, money2);

      expect(result.toNumber()).toBe(100);
    });

    it('should handle single Money instance', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = Money.max(money);

      expect(result.toNumber()).toBe(100);
    });

    it('should handle negative values', () => {
      const money1 = new Money(-100, CurrencyEnum.USD);
      const money2 = new Money(-50, CurrencyEnum.USD);
      const money3 = new Money(0, CurrencyEnum.USD);
      const result = Money.max(money1, money2, money3);

      expect(result.toNumber()).toBe(0);
    });

    it('should handle all equal values', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(100, CurrencyEnum.USD);
      const money3 = new Money(100, CurrencyEnum.USD);
      const result = Money.max(money1, money2, money3);

      expect(result.toNumber()).toBe(100);
    });

    it('should throw error for empty array', () => {
      expect(() => Money.max()).toThrow('Cannot get max of empty array');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, CurrencyEnum.USD);
      const money2 = new Money(50, CurrencyEnum.EUR);
      const money3 = new Money(75, CurrencyEnum.USD);

      expect(() => Money.max(money1, money2, money3)).toThrow(comparementError);
    });
  });

  describe('edge cases and integration tests', () => {
    it('should maintain immutability across operations', () => {
      const original = new Money(100, CurrencyEnum.USD);
      const doubled = original.multiplyAndRound(2);
      const rounded = original.round(0);
      const added = original.add(new Money(50, CurrencyEnum.USD));

      expect(original.toNumber()).toBe(100);
      expect(doubled.toNumber()).toBe(200);
      expect(rounded.toNumber()).toBe(100);
      expect(added.toNumber()).toBe(150);
    });

    it('should chain operations correctly', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const result = money
        .add(new Money(50, CurrencyEnum.USD))
        .multiplyAndRound(2)
        .divideAndRound(3, 2)
        .round(2);

      expect(result.toNumber()).toBe(100);
      expect(result.getCurrencyCode()).toBe(CurrencyEnum.USD);
    });

    it('should handle complex calculation with precision', () => {
      const price = new Money('99.99', CurrencyEnum.USD);
      const quantity = 3;
      const tax = 0.08;

      const subtotal = price.multiplyAndRound(quantity, 2);
      const taxAmount = subtotal.multiplyAndRound(tax, 2);
      const total = subtotal.add(taxAmount);

      expect(subtotal.toNumber()).toBe(299.97);
      expect(taxAmount.toNumber()).toBe(24.00);
      expect(total.toNumber()).toBe(323.97);
    });

    it('should handle discount calculation', () => {
      const price = new Money(100, CurrencyEnum.USD);
      const discount = 0.25;

      const discountAmount = price.multiplyAndRound(discount, 2);
      const finalPrice = price.subtract(discountAmount);

      expect(discountAmount.toNumber()).toBe(25);
      expect(finalPrice.toNumber()).toBe(75);
    });

    it('should work with MoneyFactory integration', () => {
      const money1 = MoneyFactory.fromNumber(100, CurrencyEnum.USD);
      const money2 = MoneyFactory.fromString('50.50', CurrencyEnum.USD);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(150.50);
    });

    it('should convert between different representations', () => {
      const original = MoneyFactory.fromCents(10050, CurrencyEnum.USD);
      const dto = original.toMoneyDto();
      const restored = MoneyFactory.fromMoneyDto(dto);

      expect(restored.isEqual(original)).toBe(true);
    });

    it('should handle rounding in realistic scenarios', () => {
      const unitPrice = new Money('19.99', CurrencyEnum.USD);
      const quantity = 7;
      const total = unitPrice.multiplyAndRound(quantity, 2);

      expect(total.toNumber()).toBe(139.93);
    });

    it('should handle split bill scenario', () => {
      const total = new Money(100, CurrencyEnum.USD);
      const people = 3;
      const perPerson = total.divideAndRound(people, 2);
      const remainder = total.subtract(perPerson.multiplyAndRound(people - 1, 2));

      expect(perPerson.toNumber()).toBe(33.33);
      expect(remainder.toNumber()).toBe(33.34);
    });

    it('should handle currency consistency in batch operations', () => {
      const prices = [
        new Money(10, CurrencyEnum.EUR),
        new Money(20, CurrencyEnum.EUR),
        new Money(30, CurrencyEnum.EUR),
      ];

      const total = Money.sum(...prices);
      const average = total.divideAndRound(prices.length, 2);

      expect(total.toNumber()).toBe(60);
      expect(average.toNumber()).toBe(20);
      expect(total.getCurrencyCode()).toBe(CurrencyEnum.EUR);
    });

    it('should prevent currency mixing in complex scenarios', () => {
      const usd = new Money(100, CurrencyEnum.USD);
      const eur = new Money(100, CurrencyEnum.EUR);

      expect(() => usd.add(eur)).toThrow();
      expect(() => usd.subtract(eur)).toThrow();
      expect(() => usd.min(eur)).toThrow();
      expect(() => usd.max(eur)).toThrow();
      expect(() => usd.isLessThan(eur)).toThrow();
      expect(() => Money.sum(usd, eur)).toThrow();
    });

    it('should validate currencies in static methods with better error messages', () => {
      const usd = new Money(100, CurrencyEnum.USD);
      const eur = new Money(100, CurrencyEnum.EUR);

      expect(() => Money.sum(usd, eur)).toThrow(sumError);
      expect(() => Money.min(usd, eur)).toThrow(comparementError);
      expect(() => Money.max(usd, eur)).toThrow(comparementError);
    });

    it('should handle type guards correctly', () => {
      const money = new Money(100, CurrencyEnum.USD);
      const notMoney = { amount: '100', currency: CurrencyEnum.USD };

      expect(isMoney(money)).toBe(true);
      expect(isMoney(notMoney)).toBe(false);
      expect(isMoney(null)).toBe(false);
      expect(isMoney(undefined)).toBe(false);
      expect(isMoney(100)).toBe(false);
      expect(isMoney('100')).toBe(false);
    });

    it('should handle isEqual with non-Money objects', () => {
      const money = new Money(100, CurrencyEnum.USD);

      expect(money.isEqual({} as any)).toBe(false);
      expect(money.isEqual(null as any)).toBe(false);
      expect(money.isEqual(undefined as any)).toBe(false);
    });
  });
});

