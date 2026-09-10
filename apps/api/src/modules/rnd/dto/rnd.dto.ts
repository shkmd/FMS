import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { TrialOutcome } from "@fms/shared";

export class CreateTrialDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() objective!: string;
  @ApiProperty() @IsString() cropId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() varietyId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() hypothesis?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() cultivationBlockId?: string;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() methodology?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() inputProtocol?: string;
}

export class AddObservationDto {
  @ApiProperty() @IsString() trialId!: string;
  @ApiProperty({ required: false }) @IsOptional() measurementsJson?: unknown;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class DecideTrialDto {
  @ApiProperty({ enum: TrialOutcome }) @IsIn(TrialOutcome) outcome!: (typeof TrialOutcome)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() yieldResult?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() qualityResult?: string;
}
