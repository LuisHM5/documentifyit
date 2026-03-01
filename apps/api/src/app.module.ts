import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

// Config
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { authConfig } from './config/auth.config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DocumentVersionsModule } from './modules/document-versions/document-versions.module';
import { FoldersModule } from './modules/folders/folders.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ApprovalFlowsModule } from './modules/approval-flows/approval-flows.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ShareLinksModule } from './modules/share-links/share-links.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SearchModule } from './modules/search/search.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, authConfig],
    }),

    // Logger (Pino)
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),

    // TypeORM (PostgreSQL)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...config.get('database'),
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'public', ttl: 60000, limit: 20 },
      { name: 'authenticated', ttl: 60000, limit: 100 },
    ]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    DocumentsModule,
    DocumentVersionsModule,
    FoldersModule,
    TemplatesModule,
    ApprovalFlowsModule,
    PermissionsModule,
    ShareLinksModule,
    AuditLogsModule,
    ApiKeysModule,
    SearchModule,
    AiModule,
  ],
})
export class AppModule {}
