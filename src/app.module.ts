import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlgoritmoModule } from './modules/algoritmo/algoritmo.module';

@Module({
  imports: [AlgoritmoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
