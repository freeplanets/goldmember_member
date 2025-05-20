import { Controller, Req, Res, HttpStatus,
    Get,
} from '@nestjs/common';
import { WeatherService } from '../service/weather.service';
import { Request, Response } from 'express';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherResponseDto } from '../dto/weather/weather-response.dto';

@Controller('weather')
@ApiTags('weather')
export class WeatherController {
   constructor(private readonly weatherService: WeatherService) {}

  @ApiOperation({
    summary: '取得球場天氣資訊',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: WeatherResponseDto
  })
  @Get('')
  async weather(@Res() res: Response){
    const wRes = await this.weatherService.weather();
    return res.status(HttpStatus.OK).json(wRes)
  }
}
