import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Weather, WeatherDocument } from '../dto/schemas/weather.schema';
import { Model } from 'mongoose';
import { IWeather } from '../dto/interface/weather.if';
import { WeatherResponseDto } from '../dto/weather/weather-response.dto';
import { ErrCode } from '../utils/enumError';


@Injectable()
export class WeatherService {
  constructor(@InjectModel(Weather.name) private readonly weatherModel:Model<WeatherDocument>){}
  async weather(): Promise<WeatherResponseDto> {
    const whRes = new WeatherResponseDto()
    try {
      const w:Partial<IWeather> = {};
      const rlt = await this.weatherModel.findOne({StationName: '林口'});
      if (rlt) {
        w.temperature = rlt.temperature;
        w.condition=rlt.condition;
        w.windSpeed=rlt.windSpeed;
        w.humidity=rlt.humidity;
        w.lowTemp=rlt.lowTemp;
        w.highTemp=rlt.highTemp;
        w.forecast = rlt.forecast;
      }
      whRes.data = w;
    } catch (e) {
      whRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      whRes.error.extra = e;
    }
    return whRes;
  }
}
