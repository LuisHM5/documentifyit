import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareLinkEntity } from './entities/share-link.entity';
import { ShareLinksService } from './share-links.service';
import { ShareLinksController } from './share-links.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShareLinkEntity])],
  controllers: [ShareLinksController],
  providers: [ShareLinksService],
  exports: [ShareLinksService],
})
export class ShareLinksModule {}
