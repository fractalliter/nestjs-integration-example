import {HttpModule} from '@nestjs/axios';
import {CacheModule, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
