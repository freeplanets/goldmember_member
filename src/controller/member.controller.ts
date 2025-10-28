import { Controller, Req, Res, HttpStatus, Get, Put, Body, Post, UploadedFile, UseInterceptors, Param, UseGuards, ValidationPipe, UsePipes, Query, Delete } from '@nestjs/common';
import { MemberService } from '../service/member.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MemberPutProfileRequestDto } from '../dto/member/member-put-profile-request.dto';
import { MemberPasswordRequestDto } from '../dto/member/member-password-request.dto';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenGuard } from '../utils/tokens/token-guard';
import { MemberProfileResponseDto } from '../dto/member/member-profile-response.dto';
import { ShareholderSwitchReqDto } from '../dto/member/shareholder-switch-request.dto';
import { PushTokenReqDto } from '../dto/member/push-token-request.dto';
import { AddTraceIdToResponse } from '../utils/constant';
import { MemberNotifyOptRes } from '../dto/member/member-notify-opt-response';
import { MemberNotifyOptReq } from '../dto/member/member-notify-opt-request.dto';

@Controller('member')
@ApiTags('member')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: '取得會員詳細資料',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: MemberProfileResponseDto,
  })
  @Get('/detail')
  async memberDetailInfo(@Req() req:any, @Res() res:Response){
    const mpRes = await this.memberService.memberProfile(req.user);
    return res.status(HttpStatus.OK).json(mpRes);
  }

  @ApiOperation({
    summary: '更新使用者資料',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @ApiParam({
    description: '會員代號',
    name: 'id',
  })
  @UseGuards(TokenGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '會員資料修改及上傳圖檔',
    type: MemberPutProfileRequestDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Put('profile/:id')
  async usersPutProfile(
    @Body()
    memberPutProfileRequestDto: MemberPutProfileRequestDto,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const comRes = await this.memberService.memberPutProfile(
        id,
        memberPutProfileRequestDto,
        file,
      );
    AddTraceIdToResponse(comRes, req);
    return res.status(HttpStatus.OK).json(comRes);
  }

  @ApiOperation({
    summary: '變更密碼',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto
  })
  @UseGuards(TokenGuard)
  @Put('password')
  async usersPassword(
    @Body() memberPasswordRequestDto : MemberPasswordRequestDto,
    @Req() req: any,
    @Res() res: Response
  ){
    const comRes = await this.memberService.memberPassword(memberPasswordRequestDto, req.user)
    AddTraceIdToResponse(comRes, req);
    return res.status(HttpStatus.OK).json(comRes)
  }
  
  @ApiOperation({
    summary: '一般會員轉換為股東(邀請碼輸入)',
    description: '一般會員轉換為股東(邀請碼輸入)',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Get('invitationcode')
  async membersConvertToShareholder(
    @Query() ssdto:ShareholderSwitchReqDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const commonRes = await this.memberService.membersConvertToShareholder(ssdto, req.user);
    AddTraceIdToResponse(commonRes, req);
    return res
      .status(HttpStatus.OK)
      .json(commonRes);
  }  

  @ApiOperation({
    summary: 'updatePushToken',
    description: 'updatePushToken',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('updatePushToken')
  async updatePushToken(
    @Body() data:PushTokenReqDto,
    @Req() req:Request,
    @Res() res:Response,
  ) {
    const rlt = await this.memberService.updatePushToken(data, req['user']);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '取得會員通知設定',
    description: '取得會員通知設定',
  })
    @ApiResponse({
    description: '成功或失敗',
    type: MemberNotifyOptRes,
  })
  @Get('notification-settings')
  async getNotificationSettings(
    @Req() req:Request,
    @Res() res:Response,
  ) {
    const rlt = await this.memberService.getNotifyOpt(req['user']);
    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '會員通知設定',
    description: '會員通知設定',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: MemberNotifyOptRes,
  })
  @Put('notification-settings')
  async setNotificationSettings(
    @Body() data:MemberNotifyOptReq,
    @Req() req:Request,
    @Res() res:Response,
  ) {
    const rlt = await this.memberService.setNotifyOpt(req['user'], data);
    return res.status(HttpStatus.OK).json(rlt);
  }
  
  @ApiOperation({
    summary: '會員剛除帳號',
    description: '會員刪除帳號',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Delete('account')
  async delAccount(
    @Req() req:Request,
    @Res() res:Response
  ){
    const rlt = await this.memberService.delAccount(req['user']);
    return res.status(HttpStatus.OK).json(rlt);
  }
}
