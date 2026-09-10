import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateExpenseDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() department?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vendorId?: string;
  @ApiProperty() @IsPositive() amount!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() tax?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() paymentMethod?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() relatedTaskId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() receiptMediaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() date?: string;
}

export class CreatePettyCashDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() type!: string; // opening | expense | reimbursement | closing
  @ApiProperty() @IsPositive() amount!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() relatedExpenseId?: string;
}
