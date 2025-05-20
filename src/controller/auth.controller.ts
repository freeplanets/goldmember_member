import { Controller, Req, Res, HttpStatus, Post, Body, UseGuards, UseInterceptors, UploadedFile, Session, Get } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthRequestDto } from '../dto/auth/auth-request.dto';
import { AuthResponseDto } from '../dto/auth/auth-response.dto';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { RefreshTokenGuard } from '../utils/tokens/refresh-token-guard';
import { RefreshTokenDto } from '../dto/auth/auth-refresh-token-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberRegisterRequestDto } from '../dto/member/member-register-request.dto';
import { AuthSMSRequestDto } from '../dto/auth/auth-sms-request.dto';
import { AuthResetPasswordDto } from '../dto/auth/auth-resetpassword.dto';
import { AuthSendVerificationResponseDto } from '../dto/auth/auth-send-verification-response.dto';
import { RealIP } from 'nestjs-real-ip';
import { TokenGuard } from '../utils/tokens/token-guard';
import { DeviceRefreshTokenDto } from '../dto/auth/auth-device-refresh-token-request.dto';
import { DeviceTokenGuard } from '../utils/tokens/device-token-guard';
import { AuthRefreshTokenResponse } from '../dto/auth/auth-refresh-token-response';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '使用者登入',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: AuthResponseDto,
  })
  @Post('')
  async auth(
    @Body() authRequestDto: AuthRequestDto,
    @RealIP() ip: string,
    @Res() res: Response,
  ) {
    const arRes = await this.authService.auth(authRequestDto, ip);
    return res.status(HttpStatus.OK).json(arRes);
  }

  @ApiOperation({
    summary: '會員註冊',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '新會員資料及上傳圖檔',
    type: MemberRegisterRequestDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('register')
  async createMember(
    @Body() memberCreate:MemberRegisterRequestDto,
    @UploadedFile() file:Express.Multer.File,
    @Res() res:Response,
  ){
    const comRes = await this.authService.memberCreate(memberCreate, file);
    return res.status(HttpStatus.OK).json(comRes);
  }

  @ApiOperation({
    summary: '重置Token時間',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: AuthRefreshTokenResponse,
  })
  @UseGuards(RefreshTokenGuard)
  // @ApiParam({type: String, name: 'refreshToken'})
  @ApiBearerAuth()
  @Post('/refreshToken')
  //async authRefreshToken(@Body('refreshToken') rtoken:string, @Res() res:Response) {
  async authRefreshToken(@Body() body:RefreshTokenDto, @Req() req:Request, @Res() res:Response) {
    const alr = await this.authService.authRefreshToken(req);
    return res.status(HttpStatus.OK).json(alr);
  }

  @ApiOperation({
    summary: '重置Token時間',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: AuthResponseDto,
  })
  @UseGuards(DeviceTokenGuard)
  // @ApiParam({type: String, name: 'refreshToken'})
  @ApiBearerAuth()
  @Post('/deviceRefreshToken')
  //async authRefreshToken(@Body('refreshToken') rtoken:string, @Res() res:Response) {
  async authDeviceRefreshToken(@Body() body:DeviceRefreshTokenDto, @Req() req:Request, @Res() res:Response) {
    const alr = await this.authService.authDeviceRefreshToken(req);
    return res.status(HttpStatus.OK).json(alr);
  }

  @ApiOperation({
    summary: '產生驗證碼圖片',
    description: '',
  })
  @ApiResponse({
    description: '驗證碼(svg)',
    type: AuthSendVerificationResponseDto,
  })
  @Get('captcha')
  async getCaptcha(@Res() res:Response,@Session() session:any) {
    const verifyRes = await this.authService.getCaptcha();
    // console.log('captcha', session.captcha);
    //return res.type('svg').status(HttpStatus.OK).send(verifyRes);
    return res.status(HttpStatus.OK).json(verifyRes);
  }  

  @ApiOperation({
    summary: '傳送sms驗證碼',
    description: '傳送sms驗證碼',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('sendsmscode')
  async sendSmsCode(
    @Body() smsphone:AuthSMSRequestDto,
    @Res() res:Response,
  ) {
    const comRes = await this.authService.sendSmsCode(smsphone);
    return res.status(HttpStatus.OK).json(comRes);    
  }

  @ApiOperation({
    summary: '重設密碼',
    description: '重設密碼',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('resetpassword')
  async resetPassword(
    @Body() authResetPass:AuthResetPasswordDto,
    @Res() res:Response,
  ) {
    const comRes = await this.authService.authResetPassword(authResetPass);
    return res.status(HttpStatus.OK).json(comRes);    
  }

  @ApiOperation({
    summary: '登出',
    description: '登出'
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,    
  })
  @UseGuards(TokenGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req:any,@Res() res:Response) {
    const comRes = await this.authService.logout(req.user);
    return res.status(HttpStatus.OK).json(comRes);
  }
}
