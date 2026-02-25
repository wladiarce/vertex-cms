import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex-cms/core';
import { Movie } from './collections/movie.collection';
import { User } from './collections/user.collection';
import { Page } from './collections/page.collection';
import { Author } from './collections/author.collection';
import { Tag } from './collections/tag.collection';
import { Post } from './collections/post.collection';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StorageLocalPlugin } from '@vertex-cms/plugin-storage-local';
import { DatabaseMongoPlugin } from '@vertex-cms/plugin-db-mongo';
import { DatabaseTypeORMPlugin } from '@vertex-cms/plugin-db-typeorm';
import { EmailSmtpPlugin } from '@vertex-cms/plugin-email-smtp';


@Module({
  imports: [
    // Serve Uploads (Volume Mount)
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    VertexCoreModule.forRoot({
      entities: [
        Movie,
        User,
        Page,
        Author,
        Tag,
        Post
      ],
      // Database Plugin
      database: DatabaseMongoPlugin({
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/vertex-playground'
      }),
      // database: DatabaseTypeORMPlugin({
      //   type: 'postgres',
      //   host: 'localhost',
      //   port: 5432,
      //   username: 'mab_admin',
      //   password: 'mab_pass',
      //   database: 'vertex-cms'

      // }),
      email: EmailSmtpPlugin({
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE) || true,
        auth: { user: process.env.SMTP_USER || 'username', pass: process.env.SMTP_PASS || 'password' },
        from: process.env.SMTP_FROM || 'from@example.com'
      }),
      // Configure locales for your application
      locales: {
        default: 'en',
        supported: ['en', 'es', 'pt'],
        names: {
          en: 'English',
          es: 'Español',
          pt: 'Português'
        }
      },
      storage: StorageLocalPlugin({
        uploadDir: join(process.cwd(), 'uploads')
      }),
      plugins: []
    })
  ],
})
export class AppModule {}