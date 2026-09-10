import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @MinLength(8)
  newPassword!: string;
}
