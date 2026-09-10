import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as crypto from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket = process.env.S3_BUCKET ?? "fms-media";
  private readonly publicEndpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";

  constructor(private readonly prisma: PrismaService) {
    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
      region: process.env.S3_REGION ?? "us-east-1",
      forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "fms_minio",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "fms_minio_password",
      },
    });
  }

  /** Returns a short-lived PUT URL the client uploads directly to, plus the key to register afterwards. */
  async createUploadUrl(fileName: string, mimeType: string) {
    const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: mimeType });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { uploadUrl, key, publicUrl: `${this.publicEndpoint}/${this.bucket}/${key}` };
  }

  async registerMediaFile(params: {
    url: string;
    mimeType: string;
    sizeBytes?: number;
    uploadedById: string;
    entityType?: string;
    entityId?: string;
    caption?: string;
    gpsLat?: number;
    gpsLng?: number;
    farmId?: string;
  }) {
    return this.prisma.mediaFile.create({
      data: {
        url: params.url,
        mimeType: params.mimeType,
        sizeBytes: params.sizeBytes,
        uploadedById: params.uploadedById,
        entityType: params.entityType,
        entityId: params.entityId,
        caption: params.caption,
        gpsLat: params.gpsLat,
        gpsLng: params.gpsLng,
        farmId: params.farmId,
        capturedAt: new Date(),
      },
    });
  }
}
