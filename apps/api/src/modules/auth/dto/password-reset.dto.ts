import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @MinLength(8)
  newPassword!: string;
}
