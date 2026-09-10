import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { VarietyClassification, NurseryStage } from "@fms/shared";

export class CreateSeedLotDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() cropId!: string;
  @ApiProperty() @IsString() varietyId!: string;
  @ApiProperty({ enum: VarietyClassification }) @IsIn(VarietyClassification) classification!: (typeof VarietyClassification)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() source?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() procurementDate?: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storageLocationId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() container?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() storageTemperature?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() storageHumidity?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiryDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() initialQualityNotes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() certificationDetails?: string;
}

export class AddStorageReadingDto {
  @ApiProperty() @IsString() seedLotId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() temperature?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() humidity?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateGerminationTrialDto {
  @ApiProperty() @IsString() seedLotId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() trialDate?: string;
  @ApiProperty() @IsInt() @Min(1) seedsTested!: number;
  @ApiProperty() @IsInt() @Min(0) seedsGerminated!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() growingMedium?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() temperature?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() moistureConditions?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observations?: string;
}

export class DecideGerminationTrialDto {
  @ApiProperty() @IsBoolean() approvedForSowing!: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() rejected?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() quarantined?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() correctiveAction?: string;
}

export class CreateNurseryBatchDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() seedLotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() germinationTrialId?: string;
  @ApiProperty({ required: false, description: "Required when seedLotId is omitted (spec §13)" })
  @IsOptional()
  @IsString()
  externalSourceNote?: string;
  @ApiProperty() @IsString() cropId!: string;
  @ApiProperty() @IsString() varietyId!: string;
  @ApiProperty() @IsInt() @Min(1) quantity!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expectedReadyDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() currentLocation?: string;
}

export class UpdateNurseryStageDto {
  @ApiProperty({ enum: NurseryStage }) @IsIn(NurseryStage) stage!: (typeof NurseryStage)[number];
}
