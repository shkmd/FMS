import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateDesignationDto {
  @ApiProperty() @IsString() farmId!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() departmentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() grade?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class UpdateDesignationDto extends PartialType(CreateDesignationDto) {}
