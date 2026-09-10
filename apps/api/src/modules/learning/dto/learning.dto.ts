import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { EnrollmentStatus, TrainingSessionStatus } from "@fms/shared";

export class CreateTrainingProgramDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() category?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class UpdateTrainingProgramDto extends PartialType(CreateTrainingProgramDto) {}

export class CreateTrainingSessionDto {
  @ApiProperty() @IsDateString() scheduledDate!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() trainer?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() location?: string;
}

export class UpdateTrainingSessionDto extends PartialType(CreateTrainingSessionDto) {
  @ApiProperty({ enum: TrainingSessionStatus, required: false }) @IsOptional() @IsIn(TrainingSessionStatus) status?: (typeof TrainingSessionStatus)[number];
}

export class EnrollEmployeeDto {
  @ApiProperty() @IsString() employeeId!: string;
}

export class UpdateEnrollmentDto {
  @ApiProperty({ enum: EnrollmentStatus, required: false }) @IsOptional() @IsIn(EnrollmentStatus) status?: (typeof EnrollmentStatus)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() score?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() feedback?: string;
}
