import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from '../utils/tokens/token-guard';
import { Response, Request } from 'express';
import { AnnouncementsResponseDto } from '../dto/announcements/announcements-response.dto';
import { AnnouncementsService } from '../service/announcements.service';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('announcements')
@ApiTags('announcements')
export class AnnouncementsController {
    constructor(private readonly annonceService:AnnouncementsService){}
    @ApiOperation({
        summary: '取得公告列表(未登者)',
        description: '',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: AnnouncementsResponseDto,
    })
    @Get('list')
    async announcementsGetForAll(
        @Req() req:Request,
        @Res() res:Response,
    ) {
        const annRes = await this.annonceService.getAnnounce();
        AddTraceIdToResponse(annRes, req);
        return res.status(HttpStatus.OK).json(annRes);
    }

    @ApiOperation({
        summary: '取得公告列表',
        description: '',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: AnnouncementsResponseDto,
    })
    @UseGuards(TokenGuard)
    @ApiBearerAuth()    
    @Post('list')
    async announcementsGet(
        @Req() req: any,
        @Res() res: Response,
    ) {
        const annRes = await this.annonceService.getAnnounce(req.user);
        AddTraceIdToResponse(annRes, req);
        return res.status(HttpStatus.OK).json(annRes);
    }

}