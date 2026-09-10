import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ProductionInputDto {
  @ApiProperty() @IsString() sourceType!: string; // harvestBatch | inventoryBatch | organicInputBatch
  @ApiProperty({ required: false }) @IsOptional() @IsString() harvestBatchId?: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
}

class ProductionOutputDto {
  @ApiProperty() @IsString() productName!: string;
  @ApiProperty() @IsPositive() quantity!: number;
  @ApiProperty() @IsString() unit!: string;
}

export class CreateProductionBatchDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() productName!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() productionDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() processingDurationMinutes?: number;
  @ApiProperty({ type: [ProductionInputDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "A production batch must link to at least one raw-material batch" })
  @ValidateNested({ each: true })
  @Type(() => ProductionInputDto)
  inputs!: ProductionInputDto[];
  @ApiProperty({ type: [ProductionOutputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductionOutputDto)
  outputs!: ProductionOutputDto[];
}
