import { Module } from '@nestjs/common';
import { WeatherController } from '../controller/weather.controller';
import { WeatherService } from '../service/weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from '../dto/schemas/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Weather.name, schema: WeatherSchema}
    ])
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {

}
