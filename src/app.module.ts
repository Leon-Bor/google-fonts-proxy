import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // <-- path to the static files
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
