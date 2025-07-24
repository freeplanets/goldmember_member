import { Controller, Req, Res, HttpStatus, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from '../service/bookings.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsPostResponseDto } from '../dto/bookings-post-response.dto';
import { BookingsPostRequestDto } from '../dto/bookings-post-request.dto';
import { ReservationsQueryRequestDto } from '../dto/bookings/reservations-query-request.dto';
import { TokenGuard } from '../utils/tokens/token-guard';
import { ReservationsResponse } from '../dto/bookings/reservations-response';
import { CommonResponseDto } from '../dto/common/common-response.dto';

@Controller('bookings')
@ApiTags('bookings')
@UseGuards(TokenGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({
    summary: '取得使用者的預約列表',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: ReservationsResponse,
  })
  @Get('')
  async bookingsGet(
    @Query() query: ReservationsQueryRequestDto,
    @Req() req: any, 
    @Res() res: Response
  ) {
    const result =  await this.bookingsService.bookingsGet(query, req.user);
    return res.status(HttpStatus.OK).json(result);
  }

  @ApiOperation({
    summary: '建立預約',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: BookingsPostResponseDto,
  })
  @Post('')
  async bookingsPost(
    @Body() bookingsPostRequestDto: BookingsPostRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const rlt = await this.bookingsService.bookingsPost(bookingsPostRequestDto, req.user);

    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '取得已被預約時段',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Get('/available')
  async bookingsAvailable(
    @Query('date') date: string,

    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingsService.bookingsAvailable(date, req);

    return res.status(HttpStatus.OK).json(new CommonResponseDto());
  }
}
