import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: [String], description: "Role codes, e.g. PLOT_SUPERVISOR" })
  @IsArray()
  @ArrayMinSize(1)
  roleCodes!: string[];

  @ApiProperty({ type: [String], required: false, description: "FarmArea ids this user is scoped to" })
  @IsOptional()
  @IsArray()
  farmAreaIds?: string[];
}
