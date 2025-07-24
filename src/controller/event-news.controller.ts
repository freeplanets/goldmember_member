import { Body, Controller, Delete, Get, HttpStatus, Injectable, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiPreconditionFailedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TokenGuard } from '../utils/tokens/token-guard';
import { EventNewsService } from '../service/event-news.service';
import { EventNewsListRes } from '../dto/eventnews/event-news-list-response';
import { EventNewsRes } from '../dto/eventnews/event-news-response';
import { EventNewsQueryRequest } from '../dto/eventnews/event-news-query-request.dto';

@Controller('event-news')
@ApiTags('event-news')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class EventNewsController {
    constructor(private readonly enService:EventNewsService){}

    @ApiOperation({
        summary: '取得賽事消息清單',
        description: '取得賽事消息清單',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: EventNewsListRes
    })
    @Get()
    async getEventNews(
        @Query() query:EventNewsQueryRequest,
        @Res() res:Response,
    ){
        const rlt = await this.enService.list(query);
        return res.status(HttpStatus.OK).json(rlt);
    }

    @ApiOperation({
        summary: '取得單一賽事消息',
        description: '取得單一賽事消息',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: EventNewsRes
    })
    @ApiParam({ name: 'id', description: '賽事消息ID'})
    @Get(':id')
    async getEventNewsDetail(
        @Param('id') id:string,
        @Res() res:Response,
    ){
        const rlt = await this.enService.findOne(id);
        return res.status(HttpStatus.OK).json(rlt);
    }
}