import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeatherForecastData } from './weather-forecast.data';
import { IWeather } from '../interface/weather.if';

export class WeatherData implements IWeather {
  @ApiProperty({
    description: '氣候資料收集站名稱',
    required: false,
  })
  @IsOptional()
  @IsString()
  StationName?: string;

  @ApiProperty({
    description: '温度',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({
    description: '狀態',
    required: false,
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({
    description: '風速',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  windSpeed?: number;

  @ApiProperty({
    description: '濕度',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  humidity?: number;

  @ApiProperty({
    description: '最後更新時間',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastUpdated?: string;

  @ApiProperty({
    description: '預報資料',
    required: false,
    type: WeatherForecastData,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  forecast?: WeatherForecastData[];
}
