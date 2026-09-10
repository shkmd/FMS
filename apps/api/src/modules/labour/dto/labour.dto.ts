import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { RequestUrgency } from "@fms/shared";

export class CreateLabourRequestDto {
  @ApiProperty() @IsString() taskId!: string;
  @ApiProperty() @IsInt() @Min(1) requestedCount!: number;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() skillsNeeded?: string[];
  @ApiProperty({ enum: RequestUrgency, required: false }) @IsOptional() @IsIn(RequestUrgency) urgency?: (typeof RequestUrgency)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class DecideLabourRequestDto {
  @ApiProperty() @IsInt() @Min(0) fulfilledCount!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateReassignmentRequestDto {
  @ApiProperty() @IsString() workerId!: string;
  @ApiProperty() @IsString() fromTaskId!: string;
  @ApiProperty() @IsString() toTaskId!: string;
  @ApiProperty() @IsString() reason!: string;
  @ApiProperty({ enum: RequestUrgency, required: false }) @IsOptional() @IsIn(RequestUrgency) urgency?: (typeof RequestUrgency)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() replacementWorkerId?: string;
}

export class DecideReassignmentRequestDto {
  @ApiProperty() @IsBoolean() approve!: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
