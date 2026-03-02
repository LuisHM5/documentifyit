import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Client | null = null;
  private readonly bucket: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';
    this.bucket = this.configService.get<string>('S3_BUCKET_NAME') ?? null;

    if (accessKeyId && secretAccessKey && this.bucket) {
      this.s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
      this.logger.log('UploadsService: using S3 storage');
    } else {
      this.logger.warn('UploadsService: AWS credentials not set — using local disk storage');
      // Ensure local uploads directory exists
      if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
        fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
      }
    }
  }

  validateMimeType(mimetype: string): void {
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      throw new InternalServerErrorException(
        `Unsupported file type: ${mimetype}. Allowed: jpeg, png, gif, webp, svg.`,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    orgId: string,
  ): Promise<{ url: string; key: string }> {
    this.validateMimeType(file.mimetype);

    const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
    const key = `${orgId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    if (this.s3 && this.bucket) {
      return this.uploadToS3(file, key);
    }
    return this.uploadToDisk(file, key);
  }

  private async uploadToS3(
    file: Express.Multer.File,
    key: string,
  ): Promise<{ url: string; key: string }> {
    // s3 and bucket are guaranteed non-null when this method is called
    const s3 = this.s3 as S3Client;
    const bucket = this.bucket as string;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );

      // Generate a pre-signed URL valid for 7 days
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 604800 },
      );

      this.logger.log(`Uploaded to S3: ${key}`);
      return { url, key };
    } catch (err) {
      this.logger.error('S3 upload failed', err);
      throw new InternalServerErrorException('File upload failed.');
    }
  }

  private uploadToDisk(
    file: Express.Multer.File,
    key: string,
  ): { url: string; key: string } {
    const destPath = path.join(LOCAL_UPLOADS_DIR, key);
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(destPath, file.buffer);
    // URL served by NestJS static file middleware
    const url = `/uploads/${key}`;
    this.logger.log(`Saved to disk: ${destPath}`);
    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.s3 && this.bucket) {
      try {
        await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      } catch (err) {
        this.logger.error(`S3 delete failed for key ${key}`, err);
      }
    } else {
      const filePath = path.join(LOCAL_UPLOADS_DIR, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
