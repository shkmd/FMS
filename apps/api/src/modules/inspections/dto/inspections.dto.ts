import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { IssueSeverity } from "@fms/shared";

export class CreateInspectionDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() farmAreaId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() type?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateIssueDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() farmAreaId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() plotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() inspectionId?: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty({ enum: IssueSeverity }) @IsIn(IssueSeverity) severity!: (typeof IssueSeverity)[number];
  @ApiProperty() @IsString() description!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendedAction?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assignedToId?: string;
}

export class ResolveIssueDto {
  @ApiProperty() @IsString() description!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() result?: string;
}
