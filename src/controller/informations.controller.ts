import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InformationsService } from '../service/informations.service';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { Request, Response } from 'express';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('informations')
@ApiTags('informations')
export class InformationsController {
    constructor(private readonly infoService:InformationsService){}
    @ApiOperation({
        summary: '取得公告,天氣,賽事,果嶺速度',
        description: '取得公告,天氣,賽事,果嶺速度',
    })
    @ApiResponse({
      description: '成功或失敗',
      type: CommonResponseDto,
    })
    @Get('list')
    async getGreenSpeeds(
      @Query() dates:DateRangeQueryReqDto,
      @Req() req:Request,
      @Res() res:Response,
    ){
      const rlt = await this.infoService.getInfo(dates);
      AddTraceIdToResponse(rlt, req);
      return res.status(HttpStatus.OK).json(rlt);
    }     
}