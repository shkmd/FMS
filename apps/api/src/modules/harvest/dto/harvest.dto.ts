import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateForecastDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() cropCycleId!: string;
  @ApiProperty() @IsDateString() expectedDate!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() expectedGrade?: string;
  @ApiProperty() @IsPositive() expectedQuantity!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
}

export class CreateHarvestBatchDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() cropCycleId!: string;
  @ApiProperty() @IsString() cultivationBlockId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() harvestDate?: string;
  @ApiProperty() @IsPositive() grossQuantity!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() damagedQuantity?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storageLocationId?: string;
}

export class CreateQualityRecordDto {
  @ApiProperty() @IsString() harvestBatchId!: string;
  @ApiProperty() @IsString() grade!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() rejectionReason?: string;
}
