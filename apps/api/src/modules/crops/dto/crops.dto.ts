import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { CropCycleStage } from "@fms/shared";

export class CreateCropCycleDto {
  @ApiProperty() @IsString() cultivationBlockId!: string;
  @ApiProperty() @IsString() cropId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() varietyId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() sownDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expectedHarvestStart?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expectedHarvestEnd?: string;
  @ApiProperty({ required: false }) @IsOptional() expectedYield?: number;
  @ApiProperty({ required: false, description: "Set true to override the out-of-season sowing warning" })
  @IsOptional()
  outOfSeasonOverride?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() outOfSeasonReason?: string;
}

export class UpdateCropCycleStageDto {
  @ApiProperty({ enum: CropCycleStage }) @IsIn(CropCycleStage) stage!: (typeof CropCycleStage)[number];
}
