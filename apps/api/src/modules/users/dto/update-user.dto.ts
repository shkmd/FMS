import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] })
  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}
