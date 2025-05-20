import { Controller, Req, Res, HttpStatus, Get, Put, Body, Post, UploadedFile, UseInterceptors, Param, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { MemberService } from '../service/member.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MemberPutProfileRequestDto } from '../dto/member/member-put-profile-request.dto';
import { MemberPasswordRequestDto } from '../dto/member/member-password-request.dto';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { ErrCode } from '../utils/enumError';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenGuard } from '../utils/tokens/token-guard';
import { SkipEmptyStringCheckPipe } from '../utils/validate/skip-empty-string-check';
import { MemberProfileResponseDto } from '../dto/member/member-profile-response.dto';

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
    @Res() res: Response,
  ) {
    const comRes = await this.memberService.memberPutProfile(
        id,
        memberPutProfileRequestDto,
        file,
      );
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
    return res.status(HttpStatus.OK).json(comRes)
  }
}
