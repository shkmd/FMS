import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { RecipientType } from "@fms/shared";

export class CreateRecipientDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: RecipientType }) @IsIn(RecipientType) type!: (typeof RecipientType)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() contactInfo?: string;
}

class DispatchItemDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() harvestBatchId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() productionBatchId?: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
}

export class CreateDispatchDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() recipientId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vehicleOrCourier?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() destination?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [DispatchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispatchItemDto)
  items!: DispatchItemDto[];
}

export class RecordPodDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() receivedByName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
