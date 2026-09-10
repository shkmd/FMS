import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { InventoryCategory, StockMovementType } from "@fms/shared";

export class CreateInventoryItemDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: InventoryCategory }) @IsIn(InventoryCategory) category!: (typeof InventoryCategory)[number];
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minStockLevel?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class CreateLocationDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() farmAreaId?: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() type?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() capacity?: number;
}

export class ReceiveStockDto {
  @ApiProperty() @IsString() itemId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() batchId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() batchNumber?: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storageLocationId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiryDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() costPerUnit?: number;
  @ApiProperty({ enum: StockMovementType, required: false })
  @IsOptional()
  @IsIn(StockMovementType)
  movementType?: (typeof StockMovementType)[number];
}

export class IssueStockDto {
  @ApiProperty() @IsString() batchId!: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty({ enum: StockMovementType }) @IsIn(StockMovementType) movementType!: (typeof StockMovementType)[number];
  @ApiProperty({ required: false }) @IsOptional() @IsString() relatedTaskId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() reason?: string;
}

export class TransferStockDto {
  @ApiProperty() @IsString() batchId!: string;
  @ApiProperty() @IsString() toLocationId!: string;
}

export class CreateStockCountDto {
  @ApiProperty() @IsString() locationId!: string;
  @ApiProperty({ type: [Object] }) lines!: { batchId: string; countedQty: number }[];
}

export class ApplyStockCountDto {
  @ApiProperty() @IsString() reason!: string;
}
