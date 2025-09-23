import { Controller, Get, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FieldManagementService } from '../service/field-management.service';
import { TokenGuard } from '../utils/tokens/token-guard';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { Request, Response } from 'express';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('field-management')
@ApiTags('field-management')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class FieldManagementController {
    constructor(private fmService:FieldManagementService){}

    @ApiOperation({
        summary: '取得果嶺速度記錄',
        description: '查詢指定日期範圍內的果嶺速度記錄',
    })
    @ApiResponse({
      description: '成功或失敗',
      type: CommonResponseDto,
    })
    @Get('green-speeds')
    async getGreenSpeeds(
      @Query() dates:DateRangeQueryReqDto,
      @Req() req:Request,
      @Res() res:Response,
    ){
      const rlt = await this.fmService.getGreenSpeeds(dates);
      AddTraceIdToResponse(rlt, req);
      return res.status(HttpStatus.OK).json(rlt);
    }   
}
