import BigNumber from 'bignumber.js';

type ComparableNumber = ZanNumber | BigNumber | number;

export class ZanNumber {
  protected readonly value: BigNumber;

  constructor(value: BigNumber | number | string) {
    if (value instanceof BigNumber) {
      if (value.isNaN() || !value.isFinite()) {
        throw new Error('Invalid ZanNumber BigNumber value: must be finite and not NaN');
      }
      this.value = value;
    } else if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        throw new Error('Invalid ZanNumber number value: must be finite and not NaN');
      }
      this.value = new BigNumber(value);
    } else if (typeof value === 'string') {
      const bigNumValue = new BigNumber(value);
      if (bigNumValue.isNaN() || !bigNumValue.isFinite()) {
        throw new Error('Invalid ZanNumber string format: must be finite and not NaN');
      }
      this.value = bigNumValue;
    } else {
      throw new Error('Invalid ZanNumber input type: must be BigNumber, number, or string');
    }
  }

  public static sum(...args: ZanNumber[]): ZanNumber {
    return new ZanNumber(BigNumber.sum(...args.map(elem => elem.value)));
  }

  public static min(...args: ZanNumber[]): ZanNumber {
    return new ZanNumber(BigNumber.min(...args.map(elem => elem.value)));
  }

  public static max(...args: ZanNumber[]): ZanNumber {
    return new ZanNumber(BigNumber.max(...args.map(elem => elem.value)));
  }

  private static createValueForComparisonOperations(value: ComparableNumber): ZanNumber {
    if (value instanceof ZanNumber) {
      return value;
    }
    return new ZanNumber(value);
  }

  public toNumber(): number {
    return this.value.toNumber();
  }


  public toString(base?: number): string {
    return this.value.toString(base);
  }

  public toBigNumber(): BigNumber {
    return this.value;
  }

  public add(other: ZanNumber): ZanNumber {
    return new ZanNumber(this.value.plus(other.value));
  }

  public subtract(other: ZanNumber): ZanNumber {
    return new ZanNumber(this.value.minus(other.value));
  }

  public multiply(multiplier: number): ZanNumber {
    return new ZanNumber(this.value.times(multiplier));
  }

  public divide(divisor: number): ZanNumber {
    if (new BigNumber(divisor).isZero()) {
      throw new Error('Division by zero');
    }
    return new ZanNumber(this.value.dividedBy(divisor));
  }

  /**
   * Default BigNumber config DECIMAL_PLACES:20
   */

  public multiplyAndRound(multiplier: number, scale: number = BigNumber.config().DECIMAL_PLACES!): ZanNumber {
    return new ZanNumber(this.value.times(multiplier).decimalPlaces(scale, BigNumber.ROUND_HALF_UP));
  }

  /**
   * Default BigNumber config DECIMAL_PLACES:20
   */

  public divideAndRound(divider: number, scale: number = BigNumber.config().DECIMAL_PLACES!): ZanNumber {
    if (new BigNumber(divider).isZero()) {
      throw new Error('Division by zero');
    }
    return new ZanNumber(this.value.dividedBy(divider).decimalPlaces(scale, BigNumber.ROUND_HALF_UP));
  }

  /**
   * Default BigNumber config DECIMAL_PLACES:20
   */

  public round(scale: number = BigNumber.config().DECIMAL_PLACES!): ZanNumber {
    return new ZanNumber(this.value.decimalPlaces(scale, BigNumber.ROUND_HALF_UP));
  }

  public isEqual(other: ComparableNumber): boolean {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.value.isEqualTo(data.value);
  }

  public isLessThan(other: ComparableNumber): boolean {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.value.isLessThan(data.value);
  }

  public isLessThanOrEqual(other: ComparableNumber): boolean {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.value.isLessThanOrEqualTo(data.value);
  }

  public isGreaterThan(other: ComparableNumber): boolean {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.value.isGreaterThan(data.value);
  }

  public isGreaterThanOrEqual(other: ComparableNumber): boolean {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.value.isGreaterThanOrEqualTo(data.value);
  }

  /**
   * During comparison between BigNumber and number types, the result will be transformed into a ZanNumber.
   */
  public min(other: ComparableNumber): ZanNumber {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.isLessThan(data) ? this : data;
  }

  /**
   * During comparison between BigNumber and number types, the result will be transformed into a ZanNumber.
   */
  public max(other: ComparableNumber): ZanNumber {
    const data = ZanNumber.createValueForComparisonOperations(other);
    return this.isGreaterThan(data) ? this : data;
  }
}
