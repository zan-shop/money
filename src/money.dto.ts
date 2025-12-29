import 'reflect-metadata';
import { IsEnum, IsString, Matches } from 'class-validator';
import { CurrencyEnum } from './currency.enum';

export class MoneyDto {
  @IsString()
  @Matches(/^-?\d+(\.\d+)?$/)
  public amount!: string;

  @IsEnum(CurrencyEnum)
  public currency!: CurrencyEnum;
}
