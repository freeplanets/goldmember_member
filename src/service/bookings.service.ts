import { Injectable } from '@nestjs/common';
import { ReserveType } from '../utils/enum';
import { ReservationsQueryRequestDto } from '../dto/bookings/reservations-query-request.dto';
import { IMember } from '../dto/interface/member.if';
import { ReservationsResponse } from '../dto/bookings/reservations-response';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Reservations, ReservationsDocument } from '../dto/schemas/reservations.schema';
import mongoose, { Model } from 'mongoose';
import { IReservations } from '../dto/interface/reservations.if';
import { ReserveSection, ReserveSectionDocument } from '../dto/schemas/reserve-section.schema';
import { TeamReserveReqDto } from '../dto/bookings/team-reserve-request.dto';
import { ReserveOp } from '../classes/reservation/reverve-op';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { IbulkWriteItem } from '../dto/interface/common.if';
import { CommonResponseData } from '../dto/common/common-response.data';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';

@Injectable()
export class BookingsService {
  private revOp:ReserveOp;
  constructor(
    @InjectModel(Reservations.name) private readonly modelRvn:Model<ReservationsDocument>,
    @InjectModel(ReserveSection.name) private readonly modelRS:Model<ReserveSectionDocument>,
    @InjectConnection() private readonly connection:mongoose.Connection,
  ){
    this.revOp = new ReserveOp(modelRvn, modelRS, connection);
  }
  async bookingsGet(rqr: ReservationsQueryRequestDto, user:Partial<IMember>): Promise<ReservationsResponse> {
    return FuncWithTryCatchNew(this.revOp, 'get', rqr, user)
  }

  async bookingsPost(
    //bookingsPostRequestDto: BookingsPostRequestDto,
    bookingsPostRequestDto: Partial<IReservations>,
    user:Partial<IMember>,
  ): Promise<any> {
    if (!bookingsPostRequestDto.type) bookingsPostRequestDto.type = ReserveType.INDIVIDUAL;
    if (!bookingsPostRequestDto.contactPhone) {
      bookingsPostRequestDto.contactPerson = user.name;
      bookingsPostRequestDto.contactPhone = user.phone;
    }
    bookingsPostRequestDto.memberId = user.id;
    bookingsPostRequestDto.memberName = user.name;
    bookingsPostRequestDto.memberPhone = user.phone;
    bookingsPostRequestDto.membershipType = user.membershipType;
    //return this.revOp.createReservation(bookingsPostRequestDto, user);

    return FuncWithTryCatchNew(this.revOp, 'create', bookingsPostRequestDto, user);
    // const comRes = new CommonResponseDto();
    // try {
    //   const filter:FilterQuery<ReserveSectionDocument> = {
    //     course: bookingsPostRequestDto.course,
    //     date: bookingsPostRequestDto.date,
    //     $or: [
    //       {timeSlot: bookingsPostRequestDto.timeSlot},
    //       {$and: [
    //         {startTime: { $lte: bookingsPostRequestDto.timeSlot }},
    //         {endTime: {$gte: bookingsPostRequestDto.timeSlot}},
    //       ]}
    //     ],
    //   };
    //   console.log('bookingsPost filter:', filter, filter.$or);
    //   const isBooked = await this.modelRS.findOne(filter);
    //   console.log('bookingsPost:', isBooked);
    //   if (!isBooked) {
    //     const resvSC:Partial<IReserveSection> = {
    //       id: uuidv1(),
    //       date: bookingsPostRequestDto.date,
    //       course: bookingsPostRequestDto.course,
    //       timeSlot: bookingsPostRequestDto.timeSlot,
    //       type: TimeSectionType.TIMESLOT,
    //     }
    //     const session = await this.connection.startSession();
    //     session.startTransaction();
    //     const ins =  await this.modelRS.create([resvSC], {session});
    //     console.log('bookingsPost ins:', ins);
    //     if (ins[0]) {
    //       const resv:Partial<IReservations> = {
    //         id: uuidv1(),
    //         memberId: user.id,
    //         memberName: user.name,
    //         memberPhone: user.phone,
    //         membershipType: user.membershipType,
    //         data: [ ins[0]._id ],
    //         createdAt: this.myDate.toDateString(),
    //       };
    //       const rvn = await this.modelRvn.create([resv], {session});
    //       console.log('bookingsPost rvn:', rvn);
    //       console.log(rvn);
    //       if (rvn[0]) {
    //         comRes.data = rvn[0].id;
    //         await session.commitTransaction();
    //       } else {
    //         await session.abortTransaction();
    //       }
    //     } else {
    //       await session.abortTransaction();
    //     }
    //     await session.endSession();
    //   } else {
    //     console.log('Error: Section is booked!!');
    //     comRes.ErrorCode = ErrCode.RESERVE_SECTION_IS_BOOKED;
    //   }
    // } catch (e) {
    //   console.log('bookingsPost error:', e);
    //   comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
    //   comRes.error.extra = e.message;
    // }
    // return comRes;
  }  
  
  bookingsAvailable(dates: DateRangeQueryReqDto): Promise<any> {
    return FuncWithTryCatchNew(this.revOp, 'list', dates);
  }
  async cancelBooking(id:string, user:Partial<IMember>, teamId:string='') {
    return FuncWithTryCatchNew(this.revOp, 'cancel', id, user, teamId);
  }
  async teamBooking(reser:TeamReserveReqDto, user:Partial<IMember>){
    return FuncWithTryCatchNew(this.revOp, 'create', reser, user);
  }
  async modifyBooking(teamId:string, reser:Partial<IReservations>, user:Partial<IMember>) {
    return FuncWithTryCatchNew(this.revOp, 'modify', teamId, reser, user);
  }
  async refilldata() {
    const comRes = new CommonResponseData();
    const bulks:IbulkWriteItem<ReserveSectionDocument>[] = [];
    const lists = await this.modelRvn.find();
    lists.forEach((rev) => {
      rev.data.forEach((_id) => {
        bulks.push({
          updateOne: {
            filter: { _id },
            update: { 
              reservationId: rev.id,
              refId: rev.teamId ? rev.teamId : rev.memberId,
            }
          }
        })
      }) 
    })
    comRes.data = await this.modelRS.bulkWrite(bulks as any);
    return comRes;
  } 
}
