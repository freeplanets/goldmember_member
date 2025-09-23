import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemParameterService } from '../service/system-parameter.service';
import { Request, Response } from 'express';
import { SettingsResponse } from '../dto/settings/settings.response';
import { ParamTypes } from '../utils/settings/settings.enum';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { TimeslotsResponse } from '../dto/settings/timeslots-response';
import { TimeslotsDto } from '../dto/settings/timeslots.dto';
import { TokenGuard } from '../utils/tokens/token-guard';
import { HolidaysRes } from '../dto/settings/holidays-response';
import { HolidayReq } from '../dto/settings/holiday-request.dto';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('settings')
@ApiTags('settings')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class SystemParameterController {
    constructor(private readonly spService:SystemParameterService){}

    @Get('init')
    @ApiExcludeEndpoint(true)
    async init(
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.spService.init();
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result)
    }

    @ApiOperation({
        summary: '取得所有系統參數的列表',
        description: '取得所有系統參數的列表',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: SettingsResponse
    })
    @ApiParam({ name: 'ids', description: '參數類別', required: false})
    @Get('parameters/:ids')
    async getParameters(
        @Param('ids') key:string,
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.spService.getParameters(key);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }
    
    @ApiOperation({
        summary: '更新系統參數值',
        description: '更新系統參數值',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,      
    })
    @ApiParam({ name: 'id', required: true, description: '參數類別', enum: ParamTypes})
    @ApiBody({ 
        description: 'value項下值,項目須相符',
        schema: {
            type: 'Object',
            example: {notification_hours: '72'},
        } 
    })
    @Put('parameters/:id')
    async modifyParameters(
        @Param('id') id:ParamTypes,
        @Body() value: Object,
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.spService.modifyParameters(id, value);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '取得預約時段設定',
        description: '取得預約時段設定',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: TimeslotsResponse,
    })
    @Get('reservation-limits')
    async getParamReservation(
        @Req() req:Request,
        @Res() res:Response,
    ){
        const result = await this.spService.getParamReservation();
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '更新預約時段設定',
        description: '更新預約時段設定',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiBody({
        description: '更新預約時段的設定資訊',
        type: TimeslotsDto,
        isArray: true,
    })
    @Put('reservation-limits')
    async modifyParamReservation(
        @Body() timeslots:TimeslotsDto[],
        @Req() req:Request,
        @Res() res:Response,
    ) {
        const result = await this.spService.modifyParamReservation(timeslots);
        AddTraceIdToResponse(result, req);
        return res.status(HttpStatus.OK).json(result);
    }

    @ApiOperation({
        summary: '取得假日清單',
        description: '依年度及月份取得假日清單',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: HolidaysRes,
    })
    @Post('holidays')
    async holidays(
        @Body() hdy:HolidayReq,
        @Req() req:Request,
        @Res() res:Response,
    ) {
        const rlt = await this.spService.getHolidays(hdy.year, hdy.month);
        AddTraceIdToResponse(rlt, req);
        return res.status(HttpStatus.OK).json(rlt);
    }    
}