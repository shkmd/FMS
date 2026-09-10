import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { AttendanceMethod, AttendanceStatus } from "@fms/shared";

export class MarkAttendanceDto {
  @ApiProperty() @IsString() workerId!: string;
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty({ enum: AttendanceMethod, required: false }) @IsOptional() @IsIn(AttendanceMethod) method?: (typeof AttendanceMethod)[number];
  @ApiProperty({ enum: AttendanceStatus, required: false }) @IsOptional() @IsIn(AttendanceStatus) status?: (typeof AttendanceStatus)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() checkInAt?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() checkOutAt?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() farmAreaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() photoMediaId?: string;
}

export class CorrectAttendanceDto {
  @ApiProperty() @IsString() reason!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() checkInAt?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() checkOutAt?: string;
  @ApiProperty({ enum: AttendanceStatus, required: false }) @IsOptional() @IsIn(AttendanceStatus) status?: (typeof AttendanceStatus)[number];
}
