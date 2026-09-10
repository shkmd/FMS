import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { AnimalSpecies, MilkSession } from "@fms/shared";

export class CreateAnimalDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() animalTag!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ enum: AnimalSpecies }) @IsIn(AnimalSpecies) species!: (typeof AnimalSpecies)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() breed?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sex?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() birthDate?: string;
}

export class CreateAnimalHealthRecordDto {
  @ApiProperty() @IsString() animalId!: string;
  @ApiProperty() @IsString() type!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() nextDueDate?: string;
}

export class RecordMilkCollectionDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() animalId!: string;
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty({ enum: MilkSession }) @IsIn(MilkSession) session!: (typeof MilkSession)[number];
  @ApiProperty() @IsPositive() quantityLitres!: number;
}

export class RecordMilkQualityDto {
  @ApiProperty() @IsString() milkCollectionId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() fat?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() protein?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() lactose?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() snf?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() abnormality?: string;
}
