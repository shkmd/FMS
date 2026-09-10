import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCropCalendarDto {
  @ApiProperty() @IsString() cropId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() varietyId?: string;
  @ApiProperty() @IsString() season!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() nurseryPeriodDays?: number;
  @ApiProperty() @IsString() sowingWindowStart!: string; // MM-DD
  @ApiProperty() @IsString() sowingWindowEnd!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() transplantingWindowStart?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() transplantingWindowEnd?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() irrigationSchedule?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() manuringSchedule?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() pestControlSchedule?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() expectedYieldPerUnitArea?: number;
}

export class CreateActivityDto {
  @ApiProperty() @IsString() cropCalendarId!: string;
  @ApiProperty() @IsString() stageName!: string;
  @ApiProperty({ description: "Days from sowing date this activity falls due" }) @IsInt() dayOffset!: number;
  @ApiProperty() @IsString() activityName!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() inputsNeeded?: string;
}

export class GenerateTasksDto {
  @ApiProperty() @IsString() cropCycleId!: string;
}
