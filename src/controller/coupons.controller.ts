import { Controller, Req, Res, HttpStatus, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CouponsService } from '../service/coupons.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiBearerAuth, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { CouponsResponseDto } from '../dto/coupon/coupons-response.dto';
import { CouponsPostRequestDto } from '../dto/coupon/coupons-post-request.dto';
import { CouponsTransferRequestDto } from '../dto/coupon/coupons-transfer-request.dto';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { TokenGuard } from '../utils/tokens/token-guard';
import { CouponAcceptRequestDto } from '../dto/coupon/coupon-accept-request.dto';
import { CouponsTransferOneDto } from '../dto/coupon/coupons-transfer-one.dto';
import { CouponsTransferManyDto } from '../dto/coupon/coupons-transfer-many.dto';

@Controller('coupons')
@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(TokenGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}
  @ApiOperation({
    summary: '取得使用者優惠券',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CouponsResponseDto,
  })
  @Get('')
  async couponsGet(@Req() req: any, @Res() res: Response) {
    const cpRes = await this.couponsService.couponsGet(req.user);
    return res.status(HttpStatus.OK).json(cpRes);
  }

  @ApiOperation({
    summary: '使用優惠券',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('')
  async couponsPost(
    @Body() couponsPostRequestDto: CouponsPostRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const comRes = await this.couponsService.couponsPost(couponsPostRequestDto, req.user);
    return res.status(HttpStatus.OK).json(comRes);
  }

  @ApiOperation({
    summary: '轉贈優惠券',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @ApiBody({
    description: '受贈者代號或手機號碼,請擇一輸入',
    type: CouponsTransferRequestDto
  })
  @Post('transfer')
  async couponsTransfer(
    @Body() couponsTransferRequestDto: CouponsTransferRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    console.log('transfer:', couponsTransferRequestDto);
    const comRes = await this.couponsService.couponsTransfer(
      couponsTransferRequestDto,
      req.user,
    );
    return res.status(HttpStatus.OK).json(comRes);
  }

  @ApiOperation({
    summary: '接受優惠券'
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('accept')
  async couponsAccept(
    @Body() cpAccept:CouponAcceptRequestDto,
    @Req() req:any,
    @Res() res:Response
  ) {
    const comRes = await this.couponsService.couponAccept(cpAccept, req.user);
    res.status(HttpStatus.OK).json(comRes);
  }
}
