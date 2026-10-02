import {
  IsDateString, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString,
  Matches, Max, MaxLength, Min, ValidateIf,
} from 'class-validator';
import { RecordInput, RecordType, STATUSES } from './business-record';

export class RecordDto implements RecordInput {
  @IsIn(Object.keys(STATUSES))
  type!: RecordType;

  @IsString()
  @Matches(/\S/)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/\S/)
  @MaxLength(120)
  company!: string;

  @ValidateIf((_object, value) => value !== null && value !== undefined && value !== '')
  @IsEmail({ require_tld: false })
  @MaxLength(160)
  email: string | null = null;

  @IsString()
  @Matches(/\S/)
  @MaxLength(40)
  status!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  amount!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;

  @IsString()
  @Matches(/\S/)
  @MaxLength(80)
  owner!: string;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes: string | null = null;
}
