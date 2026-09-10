import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsDateString, IsEmail } from "class-validator";
import { ApplicationStage, EmploymentCategory, RequisitionStatus } from "@fms/shared";

export class CreateJobRequisitionDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() departmentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() designationId?: string;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @IsInt() @IsPositive() openings?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() targetJoinDate?: string;
}

export class UpdateJobRequisitionDto extends PartialType(CreateJobRequisitionDto) {
  @ApiProperty({ enum: RequisitionStatus, required: false }) @IsOptional() @IsIn(RequisitionStatus) status?: (typeof RequisitionStatus)[number];
}

export class CreateJobApplicationDto {
  @ApiProperty() @IsString() candidateName!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class UpdateApplicationStageDto {
  @ApiProperty({ enum: ApplicationStage }) @IsIn(ApplicationStage) stage!: (typeof ApplicationStage)[number];
}

export class HireApplicationDto {
  @ApiProperty() @IsString() employeeCode!: string;
  @ApiProperty({ enum: EmploymentCategory }) @IsIn(EmploymentCategory) employmentCategory!: (typeof EmploymentCategory)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() joinDate?: string;
}
