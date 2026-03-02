import { IsString, IsNotEmpty, IsOptional, MaxLength, IsObject, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Q4 Project Plan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  declare title: string;

  @ApiPropertyOptional({ description: 'BlockNote JSON content' })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
