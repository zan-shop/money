# zan-money

Library for precise money operations with multi-currency support.

## Installation

```bash
npm install zan-money
```

## Features

- Precise decimal arithmetic using BigNumber.js
- Multi-currency support
- Type-safe currency operations
- Immutable Money instances
- Factory methods for convenient creation
- DTO validation with class-validator

## Quick Start

```typescript
import { Money, MoneyFactory, CurrencyEnum } from 'zan-money';

// Create money instances
const price = MoneyFactory.fromNumber(100.50, CurrencyEnum.PLN);
const discount = MoneyFactory.fromNumber(10, CurrencyEnum.PLN);

// Perform operations
const finalPrice = price.subtract(discount);
console.log(finalPrice.toNumber()); // 90.5
console.log(finalPrice.getCurrencyCode()); // PLN
```

## API Reference

### MoneyFactory

Factory methods for creating Money instances with validation.

#### `fromNumber(value: number, currency?: CurrencyEnum): Money`

Create Money from a number.

```typescript
const money = MoneyFactory.fromNumber(100, CurrencyEnum.EUR);
```

#### `fromString(value: string, currency?: CurrencyEnum): Money`

Create Money from a string with validation.

```typescript
const money = MoneyFactory.fromString("123.45", CurrencyEnum.USD);
// Throws error if string is not a valid number
```

#### `fromCents(cents: number, currency?: CurrencyEnum): Money`

Create Money from cents (must be an integer).

```typescript
const money = MoneyFactory.fromCents(10000, CurrencyEnum.USD); // $100.00
// Throws error if cents is not an integer
```

#### `fromMoneyDto(dto: MoneyDto): Money`

Create Money from a DTO object.

```typescript
const dto = { amount: "99.99", currency: CurrencyEnum.GBP };
const money = MoneyFactory.fromMoneyDto(dto);
```

#### `fromAnyOrThrow(value: string | number | BigNumber | MoneyDto, currency?: CurrencyEnum): Money`

Universal factory method that accepts any supported type.

```typescript
const m1 = MoneyFactory.fromAnyOrThrow(100, CurrencyEnum.PLN);
const m2 = MoneyFactory.fromAnyOrThrow("50.25", CurrencyEnum.PLN);
const m3 = MoneyFactory.fromAnyOrThrow({ amount: "75", currency: CurrencyEnum.PLN });
```

#### `zero(currency?: CurrencyEnum): Money`

Create a Money instance with zero value.

```typescript
const zero = MoneyFactory.zero(CurrencyEnum.EUR); // €0
```

### Money Class

Main class representing a monetary amount with currency.

#### Constructor

```typescript
new Money(value: BigNumber | number | string, currency?: CurrencyEnum)
```

**Note:** Consider using MoneyFactory for creating instances with validation.

#### Arithmetic Operations

All arithmetic operations return new Money instances (immutable).

**`add(other: Money): Money`**

Add two Money instances (same currency required).

```typescript
const total = price.add(tax);
// Throws error if currencies don't match
```

**`subtract(other: Money): Money`**

Subtract two Money instances (same currency required).

```typescript
const difference = price.subtract(discount);
```

**`multiplyAndRound(multiplier: number, scale?: number): Money`**

Multiply Money by a number and round to specified decimal places (default: 20).

```typescript
const doubled = price.multiplyAndRound(2);
const withVat = price.multiplyAndRound(1.23, 2); // 23% VAT, round to cents
```

**`divideAndRound(divisor: number, scale?: number): Money`**

Divide Money by a number and round to specified decimal places (default: 20).

```typescript
const half = price.divideAndRound(2);
const perPerson = total.divideAndRound(3, 2); // Split bill, round to cents
```

**`round(scale?: number): Money`**

Round to specified decimal places (default: 20).

```typescript
const rounded = price.round(2); // Round to 2 decimal places
```

#### Comparison Operations

All comparison operations require the same currency.

**`isEqual(other: Money): boolean`**

Check if two Money instances are equal (amount and currency).

```typescript
if (price.isEqual(expectedPrice)) { /* ... */ }
```

**`isLessThan(other: Money): boolean`**

```typescript
if (price.isLessThan(maxPrice)) { /* ... */ }
```

**`isLessThanOrEqual(other: Money): boolean`**

```typescript
if (price.isLessThanOrEqual(budget)) { /* ... */ }
```

**`isGreaterThan(other: Money): boolean`**

```typescript
if (revenue.isGreaterThan(costs)) { /* ... */ }
```

**`isGreaterThanOrEqual(other: Money): boolean`**

```typescript
if (balance.isGreaterThanOrEqual(minimumBalance)) { /* ... */ }
```

**`min(other: Money): Money`**

Return the smaller of two Money instances.

```typescript
const lower = price1.min(price2);
```

**`max(other: Money): Money`**

Return the larger of two Money instances.

```typescript
const higher = price1.max(price2);
```

#### Static Methods

**`Money.sum(...amounts: Money[]): Money`**

Sum multiple Money instances (all must have the same currency).

```typescript
const total = Money.sum(price1, price2, price3);
// Throws error if currencies don't match or array is empty
```

**`Money.min(...amounts: Money[]): Money`**

Find the minimum Money value (all must have the same currency).

```typescript
const cheapest = Money.min(price1, price2, price3);
```

**`Money.max(...amounts: Money[]): Money`**

Find the maximum Money value (all must have the same currency).

```typescript
const mostExpensive = Money.max(price1, price2, price3);
```

#### Conversion Methods

**`toNumber(): number`**

Convert to a JavaScript number.

```typescript
const num = money.toNumber(); // 123.45
```

**`toString(base?: number): string`**

Convert to a string representation.

```typescript
const str = money.toString(); // "123.45"
```

**`toCents(): number`**

Convert to cents (rounded to nearest integer). Symmetrical with `MoneyFactory.fromCents()`.

```typescript
const money = MoneyFactory.fromNumber(100.50, CurrencyEnum.USD);
const cents = money.toCents(); // 10050

// Useful for APIs that expect amounts in cents
const apiPayload = { amount: money.toCents() };
```

**`toMoneyDto(): MoneyDto`**

Convert to a DTO object.

```typescript
const dto = money.toMoneyDto();
// { amount: "123.45", currency: CurrencyEnum.USD }
```

**`getCurrencyCode(): string`**

Get the currency code.

```typescript
const currency = money.getCurrencyCode(); // "USD"
```

**`toBigNumber(): BigNumber`**

Get the underlying BigNumber value.

```typescript
const bigNum = money.toBigNumber();
```

### MoneyDto

Data Transfer Object for Money serialization/deserialization.

```typescript
interface MoneyDto {
  amount: string;      // String representation of the amount
  currency: CurrencyEnum;
}
```

Used with class-validator decorators:
- `@IsString()` on amount
- `@Matches(/^-?\d+(\.\d+)?$/)` on amount
- `@IsEnum(CurrencyEnum)` on currency

### CurrencyEnum

Enum of supported currencies:

```typescript
enum CurrencyEnum {
  PLN = 'PLN',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
  // ... and more
}
```

## Examples

### Basic Usage

```typescript
import { MoneyFactory, CurrencyEnum } from 'zan-money';

const price = MoneyFactory.fromNumber(100, CurrencyEnum.PLN);
const tax = MoneyFactory.fromNumber(23, CurrencyEnum.PLN);
const total = price.add(tax);

console.log(`Total: ${total.toString()} ${total.getCurrencyCode()}`);
// Output: Total: 123 PLN
```

### Working with Cents

```typescript
// API often returns amounts in cents
const centsFromApi = 12599; // $125.99
const money = MoneyFactory.fromCents(centsFromApi, CurrencyEnum.USD);
console.log(money.toNumber()); // 125.99

// Converting back to cents for API requests
const price = MoneyFactory.fromNumber(125.99, CurrencyEnum.USD);
const centsToSend = price.toCents(); // 12599
console.log(centsToSend); // 12599
```

### Calculating Discounts

```typescript
const originalPrice = MoneyFactory.fromNumber(200, CurrencyEnum.EUR);
const discountPercent = 0.15; // 15% discount

const discount = originalPrice.multiply(discountPercent);
const finalPrice = originalPrice.subtract(discount);

console.log(`Original: €${originalPrice.toNumber()}`);
console.log(`Discount: €${discount.toNumber()}`);
console.log(`Final: €${finalPrice.toNumber()}`);
```

### Currency Validation

```typescript
const usd = MoneyFactory.fromNumber(100, CurrencyEnum.USD);
const eur = MoneyFactory.fromNumber(100, CurrencyEnum.EUR);

try {
  const result = usd.add(eur);
} catch (error) {
  console.error(error.message);
  // Output: Cannot add money with different currency codes
}
```

### Working with DTOs

```typescript
// Receiving from API
const dto = { amount: "150.50", currency: CurrencyEnum.GBP };
const money = MoneyFactory.fromMoneyDto(dto);

// Sending to API
const responseDto = money.toMoneyDto();
```

### Aggregate Operations

```typescript
const prices = [
  MoneyFactory.fromNumber(10, CurrencyEnum.PLN),
  MoneyFactory.fromNumber(20, CurrencyEnum.PLN),
  MoneyFactory.fromNumber(30, CurrencyEnum.PLN),
];

const total = Money.sum(...prices);
const cheapest = Money.min(...prices);
const mostExpensive = Money.max(...prices);

console.log(`Total: ${total.toNumber()}`);        // 60
console.log(`Cheapest: ${cheapest.toNumber()}`);  // 10
console.log(`Most expensive: ${mostExpensive.toNumber()}`); // 30
```

### Rounding

```typescript
const price = MoneyFactory.fromNumber(10, CurrencyEnum.USD);
const result = price.divideAndRound(3, 2); // Divide by 3, round to 2 decimals

console.log(result.toString()); // "3.33"
```

## Requirements

- Node.js >= 22.14.0
- TypeScript >= 5.0 (recommended)

## Dependencies

- `bignumber.js` - For precise decimal arithmetic
- `class-validator` - For DTO validation
- `reflect-metadata` - Required for decorators

## License

UNLICENSED - Private library
