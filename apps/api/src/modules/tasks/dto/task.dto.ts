import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { TaskPriority } from "@fms/shared";

export class CreateTaskDto {
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty() @IsString() farmAreaId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() plotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() subPlotId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() cropCycleId?: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: TaskPriority, required: false }) @IsOptional() @IsIn(TaskPriority) priority?: (typeof TaskPriority)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) requestedWorkers?: number;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() requiredSkills?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() plannedStart?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() plannedEnd?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() expectedOutput?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() requiredInputsNotes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assignedSupervisorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() safetyNotes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() requiresEvidence?: boolean;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() dependsOnTaskIds?: string[];
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() machineryAssetIds?: string[];
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class AssignWorkerDto {
  @ApiProperty() @IsString() workerId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() roleOnTask?: string;
  @ApiProperty({ required: false }) @IsOptional() hoursPlanned?: number;
}

export class RecordProgressDto {
  @ApiProperty() @IsString() statusTo!: string;
  @ApiProperty({ required: false }) @IsOptional() quantityCompleted?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() gpsLat?: number;
  @ApiProperty({ required: false }) @IsOptional() gpsLng?: number;
}

export class CarryForwardDto {
  @ApiProperty() @IsString() reason!: string;
}

export class CancelTaskDto {
  @ApiProperty() @IsString() reason!: string;
}

export class AddEvidenceDto {
  @ApiProperty() @IsString() mediaFileId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() caption?: string;
}
