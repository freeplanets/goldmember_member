import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { SocialService } from '../service/social.service';
import { TokenGuard } from '../utils/tokens/token-guard';
import { FriendsRes } from '../dto/social/friends-response';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('social')
@ApiTags('social')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class SocialContorller {
    constructor(private readonly frdService:SocialService) {}
    @ApiOperation({
        summary: '成為朋友',
        description: '成為朋友',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name:'memberId', description:'對方會員ID'})
    @Post('friends/making/:memberId')
    async MakingFriends(
        @Param('memberId') memberId:string,
        @Req() req:any,
        @Res() res:Response,
    ){
        const rlt = await this.frdService.makingFriend(memberId, req.user);
        AddTraceIdToResponse(rlt, req);
        return res.status(HttpStatus.OK).json(rlt);
    }

    @ApiOperation({
        summary: '朋友清單',
        description: '朋友清單',
    })
    @ApiResponse({
        description: '成功或失敗',
        type: FriendsRes,
    })    
    @Get('friends/list')
    async ListFriends(
        @Req() req:any,
        @Res() res:Response,
    ) {
        const rlt = await this.frdService.friendList(req.user);
        AddTraceIdToResponse(rlt, req);
        return res.status(HttpStatus.OK).json(rlt);
    }

    @ApiOperation({
        summary: '解除好友狀態',
        description: '解除好友狀態',
    })    
    @ApiResponse({
        description: '成功或失敗',
        type: CommonResponseDto,
    })
    @ApiParam({name:'memberId', description:'對方會員ID'})
    @Get('friends/undo/:memberId')
    async UndoFriends(
        @Param('memberId') memberId:string,
        @Req() req:any,
        @Res() res:Response,        
    ){
        const rlt = await this.frdService.undoFriend(memberId, req.user);
        AddTraceIdToResponse(rlt, req);
        return res.status(HttpStatus.OK).json(rlt);        
    }
}