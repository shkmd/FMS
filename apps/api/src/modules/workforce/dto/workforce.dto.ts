import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { EmploymentCategory, UserStatus } from "@fms/shared";

export class CreateEmployeeDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() employeeCode!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() departmentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() designationId?: string;
  @ApiProperty({ enum: EmploymentCategory }) @IsIn(EmploymentCategory) employmentCategory!: (typeof EmploymentCategory)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() joinDate?: string;
  @ApiProperty({ required: false, description: "Create a Worker profile (field labour) alongside the employee record" })
  @IsOptional()
  @IsBoolean()
  isFieldWorker?: boolean;
  @ApiProperty({ required: false, description: "Field-worker only" }) @IsOptional() @IsBoolean() availability?: boolean;
  @ApiProperty({ required: false, description: "Field-worker only — e.g. no heavy lifting, no pesticide handling" })
  @IsOptional()
  @IsString()
  workRestrictions?: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() skillIds?: string[];
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({ enum: UserStatus, required: false }) @IsOptional() @IsIn(UserStatus) status?: (typeof UserStatus)[number];
}

export class CreateSkillDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
