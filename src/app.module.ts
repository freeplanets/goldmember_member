import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';
import { AuthModule} from './module/auth.module';
import { BookingsModule} from './module/bookings.module';
import { WeatherModule} from './module/weather.module';
import { CoursesModule} from './module/courses.module';
import { CouponsModule} from './module/coupons.module';
import { MemberModule} from './module/member.module';
import mongoConfig from './config/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementsModule } from './module/announcements.module';
import { DevicesModule } from './module/devices.module';
import { EventNewsModule } from './module/event-news.module';

let dbase = process.env.MONGO_DB;
if (process.env.IS_OFFLINE) dbase = process.env.LMONGO_DB;

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: `${__dirname}/../src/config/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [mongoConfig]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config:ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        directConnection: true,
        dbName: dbase,
        connectTimeoutMS: 5000,
      }),
    }),
    AuthModule, BookingsModule, WeatherModule, CoursesModule, AnnouncementsModule, CouponsModule, DevicesModule, MemberModule, EventNewsModule ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('');
  }
}
