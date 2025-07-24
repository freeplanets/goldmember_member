import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CommonError } from '../utils/common-exception';
import { ERROR_TYPE, ReserveStatus, TimeSectionType } from '../utils/enum';
import { ERROR_MESSAGE, STATUS_CODE } from '../utils/constant';
import { BookingsPostRequestDto } from '../dto/bookings-post-request.dto';
import { ReservationsQueryRequestDto } from '../dto/bookings/reservations-query-request.dto';
import { IMember } from '../dto/interface/member.if';
import { ReservationsResponse } from '../dto/bookings/reservations-response';
import { ErrCode } from '../utils/enumError';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Reservations, ReservationsDocument } from '../dto/schemas/reservations.schema';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { IReservations, IReserveSection } from '../dto/interface/reservations.if';
import { ReserveSection, ReserveSectionDocument } from '../dto/schemas/reserve-section.schema';
import {v1 as uuidv1 } from 'uuid';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Reservations.name) private readonly modelRvn:Model<ReservationsDocument>,
    @InjectModel(ReserveSection.name) private readonly modelRS:Model<ReserveSectionDocument>,
    @InjectConnection() private readonly connection:mongoose.Connection,
  ){}
  async bookingsGet(rqr: ReservationsQueryRequestDto, user:Partial<IMember>): Promise<ReservationsResponse> {
    const comRes = new ReservationsResponse();
    try {
      const filter:FilterQuery<ReservationsDocument> = {
        memberId: user.id,
      }
      const matches: FilterQuery<ReserveSectionDocument> = {};
      if (rqr.status && rqr.status !== ReserveStatus.ALL) {
        filter.status = rqr.status;
      }
      if (rqr.startDate || rqr.endDate) {
        if (!rqr.startDate) rqr.startDate = rqr.endDate;
        if (!rqr.endDate) rqr.endDate = rqr.startDate;
        // filter.data = {
        //   $elemMatch: {
        //     $and: [
        //       { date: {$gte: rqr.startDate } },
        //       { date: {$lte: rqr.endDate} },
        //     ]
        //   }
        // }
        matches.$and = [
          { date: {$gte: rqr.startDate } },
          { date: {$lte: rqr.endDate} },
        ];
      }
      console.log('bookingsGet filter:', filter, matches);
      const rlt = await this.modelRvn.find(filter).populate({
        path: 'data',
        match: matches,
      });
      if (rlt) {
        comRes.data = rlt;
      }
    } catch (e) {
      console.log('bookingsGet error:', e);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e.message;
    }
    return comRes;
  }

  async bookingsPost(
    bookingsPostRequestDto: BookingsPostRequestDto,
    user:Partial<IMember>,
  ): Promise<any> {
    const comRes = new CommonResponseDto();
    try {
      const filter:FilterQuery<ReserveSectionDocument> = {
        course: bookingsPostRequestDto.course,
        date: bookingsPostRequestDto.date,
        $or: [
          {timeSlot: bookingsPostRequestDto.timeSlot},
          {$and: [
            {startTime: { $lte: bookingsPostRequestDto.timeSlot }},
            {endTime: {$gte: bookingsPostRequestDto.timeSlot}},
          ]}
        ],
      };
      console.log('bookingsPost filter:', filter, filter.$or);
      const isBooked = await this.modelRS.findOne(filter);
      console.log('bookingsPost:', isBooked);
      if (!isBooked) {
        const resvSC:Partial<IReserveSection> = {
          id: uuidv1(),
          date: bookingsPostRequestDto.date,
          course: bookingsPostRequestDto.course,
          timeSlot: bookingsPostRequestDto.timeSlot,
          type: TimeSectionType.TIMESLOT,
        }
        const session = await this.connection.startSession();
        session.startTransaction();
        const ins =  await this.modelRS.create([resvSC], {session});
        console.log('bookingsPost ins:', ins);
        if (ins[0]) {
          const resv:Partial<IReservations> = {
            id: uuidv1(),
            memberId: user.id,
            memberName: user.name,
            memberPhone: user.phone,
            membershipType: user.membershipType,
            data: [ ins[0]._id ],
            createdAt: new Date().toLocaleString('zh-TW', {hour12: false}),
          };
          const rvn = await this.modelRvn.create([resv], {session});
          console.log('bookingsPost rvn:', rvn);
          console.log(rvn);
          if (rvn[0]) {
            comRes.data = rvn[0].id;
            await session.commitTransaction();
          } else {
            await session.abortTransaction();
          }
        } else {
          await session.abortTransaction();
        }
        await session.endSession();
      } else {
        console.log('Error: Section is booked!!');
        comRes.ErrorCode = ErrCode.RESERVE_SECTION_IS_BOOKED;
      }
    } catch (e) {
      console.log('bookingsPost error:', e);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e.message;
    }
    return comRes;
  }  
  
  bookingsAvailable(date: string, req: Request): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    } catch (e) {
      throw new CommonError(
        e.type || ERROR_TYPE.SYSTEM,
        e.status || STATUS_CODE.FAIL,
        e.status ? e.clientErrorMessage : ERROR_MESSAGE.SERVER_ERROR,
        e.message,
      );
    }
  }
}
