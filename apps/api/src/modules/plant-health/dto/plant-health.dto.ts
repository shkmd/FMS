import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { IssueSeverity } from "@fms/shared";

export class CreateSoilTestDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() plotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() subPlotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sampleLocation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() nitrogen?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() phosphorus?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() potassium?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() ph?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() moisture?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() testMethod?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observations?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() followUpDate?: string;
}

export class CreatePlantHealthRecordDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() cropCycleId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() growthStage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() symptoms?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() affectedArea?: string;
  @ApiProperty({ enum: IssueSeverity, required: false }) @IsOptional() @IsIn(IssueSeverity) severity?: (typeof IssueSeverity)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() suspectedCause?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendedTreatment?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() organicInputBatchId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() applicationRate?: string;
}

export class CreatePestTreatmentDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() plantHealthRecordId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() cropCycleId?: string;
  @ApiProperty() @IsDateString() scheduleDate!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() method?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() inputBatchId?: string;
}
