import { Controller, Req, Res, HttpStatus, Get, Query, Post, Body, UseGuards, Param, Put, Delete } from '@nestjs/common';
import { BookingsService } from '../service/bookings.service';
import { Request, Response } from 'express';
import { ApiResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsPostResponseDto } from '../dto/bookings/bookings-post-response.dto';
import { ReservationsQueryRequestDto } from '../dto/bookings/reservations-query-request.dto';
import { TokenGuard } from '../utils/tokens/token-guard';
import { ReservationsResponse } from '../dto/bookings/reservations-response';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { TeamReserveReqDto } from '../dto/bookings/team-reserve-request.dto';
import { ReservationCreateRequestDto } from '../dto/bookings/reservation-create-request.dto';
import { ReservationModifyRequestDto } from '../dto/bookings/reservation-modify-request.dto';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { AddTraceIdToResponse } from '../utils/constant';

@Controller('reservation')
@ApiTags('reservation')
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
    AddTraceIdToResponse(result, req);
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
    //@Body() bookingsPostRequestDto: BookingsPostRequestDto,
    @Body() bookingsPostRequestDto: ReservationCreateRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const rlt = await this.bookingsService.bookingsPost(bookingsPostRequestDto, req.user);
    AddTraceIdToResponse(rlt, req);
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
    @Query() dates: DateRangeQueryReqDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(dates);
    const rlt = await this.bookingsService.bookingsAvailable(dates);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '取消預約時段',
    description: '',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Delete('/cancel/:id')
  async cancelBooking(
    @Param('id') revId:string,
    @Req() req:any,
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.cancelBooking(revId, req.user);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '球隊預約',
    description: '球隊預約',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Post('/team')
  async teamBooking(
    @Body() reser:TeamReserveReqDto,
    @Req() req:any,
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.teamBooking(reser, req.user);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }

  @ApiOperation({
    summary: '球隊預約修改',
    description: '球隊預約修改',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Put('/team/:teamId')
  async modifyBooking(
    @Param('teamId') teamId:string,
    @Body() reser:ReservationModifyRequestDto,
    @Req() req:any,
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.modifyBooking(teamId, reser, req.user);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }
  
  @ApiOperation({
    summary: '球隊預約取消',
    description: '球隊預約取消',
  })
  @ApiResponse({
    description: '成功或失敗',
    type: CommonResponseDto,
  })
  @Delete('/team/cancel/:teamId/:id')
  async cancelTeamBooking(
    @Param('teamId') teamId:string,
    @Param('id') revId:string,
    //@Body() reser:ReservationModifyRequestDto,
    @Req() req:any,
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.cancelBooking(revId, req.user, teamId);
    AddTraceIdToResponse(rlt, req);
    return res.status(HttpStatus.OK).json(rlt);
  }
  
  @Get('/refilldata')
  async refilldata(
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.refilldata();
    return res.status(HttpStatus.OK).json(rlt);    
  }
  @Get('/fillAppointment')
  async fillAppointment(
    @Res() res:Response,
  ) {
    const rlt = await this.bookingsService.fillAppointment();
    return res.status(HttpStatus.OK).json(rlt);    
  }
  
  @Get('refillInfo')
  async refillnfo(
    @Res() res:Response,
  ){
    const rlt = await this.bookingsService.refillInfo();
    return res.status(HttpStatus.OK).json(rlt);    
  }
}
