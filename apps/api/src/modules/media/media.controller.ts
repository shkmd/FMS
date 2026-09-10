import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PERMISSIONS } from "@fms/shared";
import { MediaService } from "./media.service";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

class CreateUploadUrlDto {
  @IsString() fileName!: string;
  @IsString() mimeType!: string;
}

class RegisterMediaDto {
  @IsString() url!: string;
  @IsString() mimeType!: string;
  @IsOptional() @IsNumber() sizeBytes?: number;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsNumber() gpsLat?: number;
  @IsOptional() @IsNumber() gpsLng?: number;
}

@ApiTags("media")
@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post("upload-url")
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.service.createUploadUrl(dto.fileName, dto.mimeType);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  register(@Body() dto: RegisterMediaDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.registerMediaFile({ ...dto, uploadedById: actor.id });
  }
}
