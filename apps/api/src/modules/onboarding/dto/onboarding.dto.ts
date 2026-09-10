import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { ChecklistTaskStatus } from "@fms/shared";

export class CreateOnboardingCaseDto {
  @ApiProperty() @IsString() employeeId!: string;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiProperty({ type: [String], required: false, description: "Defaults to the standard onboarding checklist if omitted" })
  @IsOptional()
  @IsArray()
  taskTitles?: string[];
}

export class UpdateOnboardingTaskDto {
  @ApiProperty({ enum: ChecklistTaskStatus }) @IsIn(ChecklistTaskStatus) status!: (typeof ChecklistTaskStatus)[number];
}
