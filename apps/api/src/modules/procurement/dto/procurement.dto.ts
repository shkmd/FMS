import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateVendorDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contactPerson?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() category?: string;
}

class RequisitionLineDto {
  @ApiProperty() @IsString() itemId!: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreateRequisitionDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() farmAreaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() neededBy?: string;
  @ApiProperty({ type: [RequisitionLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitionLineDto)
  lines!: RequisitionLineDto[];
}

class OrderLineDto {
  @ApiProperty() @IsString() itemId!: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty() @IsNumber() unitPrice!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() requisitionId?: string;
  @ApiProperty() @IsString() vendorId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expectedDeliveryDate?: string;
  @ApiProperty({ type: [OrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  lines!: OrderLineDto[];
}

class ReceiptLineDto {
  @ApiProperty() @IsString() itemId!: string;
  @ApiProperty() @IsPositive() quantityReceived!: number;
  @ApiProperty() @IsString() unit!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() batchNumber?: string;
}

export class CreateGoodsReceiptDto {
  @ApiProperty() @IsString() purchaseOrderId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() invoiceRef?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() storageLocationId?: string;
  @ApiProperty({ type: [ReceiptLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptLineDto)
  lines!: ReceiptLineDto[];
}
