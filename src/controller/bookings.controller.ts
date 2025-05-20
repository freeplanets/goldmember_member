import { Controller, Req, Res, HttpStatus, Get, Query, Post, Body } from '@nestjs/common';
import { BookingsService } from '../service/bookings.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsAvailableResponseDto } from '../dto/bookings-available-response.dto';
import { BookingsResponseDto } from '../dto/bookings-response.dto';
import { BookingsPostResponseDto } from '../dto/bookings-post-response.dto';
import { BookingsPostRequestDto } from '../dto/bookings-post-request.dto';

@Controller('bookings')
@ApiTags('bookings')
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({
    summary: '取得使用者的預約列表',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: BookingsResponseDto,
  })
  @Get('')
  async bookingsGet(@Req() req: Request, @Res() res: Response) {
    await this.bookingsService.bookingsGet(req);

    return res.status(HttpStatus.OK).json(new BookingsResponseDto());
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingsService.bookingsPost(bookingsPostRequestDto, req);

    return res.status(HttpStatus.OK).json(new BookingsPostResponseDto());
  }

  @ApiOperation({
    summary: '取得可預約時段',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: BookingsAvailableResponseDto,
  })
  @Get('/available')
  async bookingsAvailable(
    @Query('date') date: string,

    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingsService.bookingsAvailable(date, req);

    return res.status(HttpStatus.OK).json(new BookingsAvailableResponseDto());
  }
}
