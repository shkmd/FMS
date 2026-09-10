import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { ChecklistTaskStatus, OffboardingReason } from "@fms/shared";

export class CreateOffboardingCaseDto {
  @ApiProperty() @IsString() employeeId!: string;
  @ApiProperty({ enum: OffboardingReason }) @IsIn(OffboardingReason) reason!: (typeof OffboardingReason)[number];
  @ApiProperty() @IsDateString() lastWorkingDay!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [String], required: false, description: "Defaults to the standard offboarding checklist if omitted" })
  @IsOptional()
  @IsArray()
  taskTitles?: string[];
}

export class UpdateOffboardingTaskDto {
  @ApiProperty({ enum: ChecklistTaskStatus }) @IsIn(ChecklistTaskStatus) status!: (typeof ChecklistTaskStatus)[number];
}
