import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { AssetType, AssetStatus, TaskPriority } from "@fms/shared";

export class CreateAssetDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() assetCode!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: AssetType }) @IsIn(AssetType) type!: (typeof AssetType)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() purchaseDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() purchaseCost?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() currentLocationId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assignedToId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() serviceIntervalHours?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() warrantyExpiry?: string;
}
export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiProperty({ enum: AssetStatus, required: false }) @IsOptional() @IsIn(AssetStatus) operationalStatus?: (typeof AssetStatus)[number];
}

export class LogUsageDto {
  @ApiProperty() @IsString() assetId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() taskId?: string;
  @ApiProperty() @IsString() operatorId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() date?: string;
  @ApiProperty() @IsNumber() hoursUsed!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() meterStart?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() meterEnd?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() fuelUsed?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateMaintenanceRequestDto {
  @ApiProperty() @IsString() assetId!: string;
  @ApiProperty() @IsString() issueDescription!: string;
  @ApiProperty({ enum: TaskPriority, required: false }) @IsOptional() @IsIn(TaskPriority) priority?: (typeof TaskPriority)[number];
}

export class CompleteMaintenanceDto {
  @ApiProperty() @IsString() type!: string; // preventive | breakdown
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() cost?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() partsUsed?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() downtimeHours?: number;
}
