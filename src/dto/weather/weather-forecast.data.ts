import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IForecast } from '../interface/weather.if';

export class WeatherForecastData implements IForecast {
  @ApiProperty({
    description: '日期',
    required: false,
    example: '2025-01-01'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: '狀態',
    required: false,
    example: '',
  })
  @IsOptional()
  @IsString()
  condition?: string;
  
  @ApiProperty({
    description: '狀態',
    required: false,
    example: '',
  })
  @IsOptional()
  @IsString()
  conditionCode?: string;

  @ApiProperty({
    description: '最高温度',
    required: false,
    example: 30.5
  })
  @IsOptional()
  @IsNumber()
  highTemp?: number;

  @ApiProperty({
    description: '最低温度',
    required: false,
    example: 15.3,
  })
  @IsOptional()
  @IsNumber()
  lowTemp?: number;
}
