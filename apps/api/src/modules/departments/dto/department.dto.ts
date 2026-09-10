import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
