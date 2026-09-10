import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateRecipeDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty({ required: false }) @IsOptional() ingredientsJson?: unknown;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() standardYield?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateInputBatchDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() recipeId!: string;
  @ApiProperty({ required: false }) @IsOptional() ingredientsUsedJson?: unknown;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() preparationDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() fermentationPeriodDays?: number;
  @ApiProperty() @IsPositive() availableQuantity!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiryDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storageLocationId?: string;
}

export class CreateApplicationDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() batchId!: string;
  @ApiProperty() @IsString() targetType!: string; // plot | cropCycle | animalArea
  @ApiProperty() @IsString() targetId!: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() dilutionRatio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() method?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() purpose?: string;
}
