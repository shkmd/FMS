import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { FarmAreaType } from "@fms/shared";

export class CreateFarmDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() totalArea?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() areaUnit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
}
export class UpdateFarmDto extends PartialType(CreateFarmDto) {}

export class CreateFarmAreaDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ enum: FarmAreaType }) @IsIn(FarmAreaType) type!: (typeof FarmAreaType)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() areaSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() areaUnit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() soilType?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() irrigationMethod?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() supervisorId?: string;
  @ApiProperty({ required: false }) @IsOptional() boundary?: unknown;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() centerLat?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() centerLng?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
export class UpdateFarmAreaDto extends PartialType(CreateFarmAreaDto) {
  @ApiProperty({ required: false }) @IsOptional() @IsIn(["ACTIVE", "FALLOW", "UNDER_PREPARATION", "ISSUE", "INACTIVE"])
  status?: "ACTIVE" | "FALLOW" | "UNDER_PREPARATION" | "ISSUE" | "INACTIVE";
}

export class CreatePlotDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() farmAreaId?: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() totalArea?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() soilType?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() irrigationMethod?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() supervisorId?: string;
  @ApiProperty({ required: false }) @IsOptional() boundary?: unknown;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() centerLat?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() centerLng?: number;
}
export class UpdatePlotDto extends PartialType(CreatePlotDto) {}

export class CreateCultivationBlockDto {
  @ApiProperty() @IsString() plotId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() subPlotId?: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() area?: number;
}

export class CreateSubPlotDto {
  @ApiProperty() @IsString() plotId!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() area?: number;
  @ApiProperty({ required: false }) @IsOptional() boundary?: unknown;
}
export class UpdateSubPlotDto extends PartialType(CreateSubPlotDto) {}
