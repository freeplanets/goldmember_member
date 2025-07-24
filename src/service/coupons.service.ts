import { Injectable } from '@nestjs/common';
import { COUPON_STATUS, ERROR_TYPE } from '../utils/enum';
import { CouponsPostRequestDto } from '../dto/coupon/coupons-post-request.dto';
import { CouponsTransferRequestDto } from '../dto/coupon/coupons-transfer-request.dto';
import { IMember } from '../dto/interface/member.if';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Coupon, CouponDocument } from '../dto/schemas/coupon.schema';
import mongoose, { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Member, MemberDcoument } from '../dto/schemas/member.schema';
import { CouponsResponseDto } from '../dto/coupon/coupons-response.dto';
import { DtoErrMsg, ErrCode } from '../utils/enumError';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { v1 as uuidv1 } from 'uuid';
import { IModifiedBy } from '../dto/interface/modifyed-by.if';
import { CouponAcceptRequestDto } from '../dto/coupon/coupon-accept-request.dto';
import { CouponTransferLog, CouponTransferLogDocument } from '../dto/schemas/coupon-transfer-log.schema';
import { ICoupon, ICouponTransferLog } from '../dto/interface/coupon.if';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private readonly modelCoupon:Model<CouponDocument>,
    @InjectModel(Member.name) private readonly modelMember:Model<MemberDcoument>,
    @InjectModel(CouponTransferLog.name) private readonly modelCTL:Model<CouponTransferLogDocument>,
    @InjectConnection() private readonly connection:mongoose.Connection,
  ){}
  async couponsGet(mbr:Partial<IMember>): Promise<CouponsResponseDto> {
    const cpRes = new CouponsResponseDto()
    try {
      cpRes.data = await this.modelCoupon.find({
        memberId: mbr.id,
        status: { $ne: COUPON_STATUS.NOT_ISSUED }
      });
    } catch (e) {
      cpRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      cpRes.error.extra = e;
    }
    return cpRes;
  }
  
  async couponsPost(
    couponsPostRequestDto: CouponsPostRequestDto,
    mbr:Partial<IMember>,
  ): Promise<CommonResponseDto> {
    const comRes = new CommonResponseDto();
    try {
      const upd = await this.modelCoupon.updateOne(
        {
          id: couponsPostRequestDto.couponId,
          memberId: mbr.id
        }, {
          status: COUPON_STATUS.READY_TO_USE
        });
        console.log('conpous post:', upd);
    } catch (e) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async couponsTransfer(
    ctfrd: CouponsTransferRequestDto,
    mbr:Partial<IMember>,
  ): Promise<CommonResponseDto> {
    console.log("coupons transfer service");
    const comRes = new CommonResponseDto();
    try {
      if (
        (!ctfrd.targetPhone && !ctfrd.targetUserId) ||
        (ctfrd.targetPhone && ctfrd.targetUserId)
      ) {
        comRes.ErrorCode = ErrCode.ERROR_PARAMETER;
        comRes.error.extra = DtoErrMsg.ID_OR_PHONE_AT_LEAST;
        return comRes;
      }
      const filter:FilterQuery<MemberDcoument> = {};
      if (ctfrd.targetPhone) {
        filter.phone = ctfrd.targetPhone;
      } else {
        filter.id = ctfrd.targetUserId;
      }
      const coupon = await this.modelCoupon.findOne({id: ctfrd.couponId}, 'memberId memberName status toPaperNo');
      console.log("coupon:", coupon);
      if (coupon) {
        if (coupon.status !== COUPON_STATUS.NOT_USED) {
          comRes.ErrorCode = ErrCode.COUPON_MUST_NOT_USED;
          return comRes;
        }        
        if (coupon.toPaperNo) {
          comRes.ErrorCode = ErrCode.TO_PAPER_ALREADY;
          return comRes;
        }
        let targetId = '';
        let targetName = '';
        const member = await this.modelMember.findOne(filter, 'id name');
        if (member) {
          targetId = member.id;
          targetName = member.name;
        } else {
          if (ctfrd.targetPhone) {
            targetId = await this.createJDoeMember(ctfrd.targetPhone, mbr);
          }
        }
        if (targetId === '') {
          comRes.ErrorCode = ErrCode.COUPON_TARGET_USER_ERROR;
          return comRes;
        }
        const updater:IModifiedBy = {
          modifiedAt: Date.now(),
          modifiedBy: mbr.id,
          modifiedByWho: mbr.name,
        }
        const d = new Date();
        const log:Partial<ICouponTransferLog> = {};
        log.description = `${mbr.name}轉讓給${targetName}`;
        log.transferDate = d.toLocaleString('zh-TW', {hour12: false});
        log.transferDateTS = d.getTime();
        //const newData:Partial<ICoupon> = {
        const newData: UpdateQuery<CouponDocument> = {
          memberId: targetId,
          memberName: targetName,
          //originalOwnerId: coupon.memberId,
          //originalOwner: coupon.memberName,
          updater,
          $push: { logs: log },
        }
        const session = await this.connection.startSession();
        session.startTransaction();
        const upd = await this.modelCoupon.updateOne({
          id: ctfrd.couponId,
          memberId: mbr.id,
          status: COUPON_STATUS.NOT_USED,
        }, newData, {session});
        console.log('coupon transfer:', upd);
        // let isfinal = false;
        if (upd) {
        //   const tf:Partial<ICouponTransferLog> = {
        //     newOwner: newData.memberName,
        //     newOwnerId: newData.memberId,
        //     previousId: coupon.memberId,
        //     previousOwner: coupon.memberName,
        //   }
        //   isfinal = await this.addTransferLog(ctfrd.couponId, tf, session);
        // }
        // if (isfinal) {
          const commit = await session.commitTransaction();
          console.log('commit:', commit);
        } else {
          const abort = await session.abortTransaction();
          console.log('abort:', abort);
          comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
        }
      } else {
        console.log('check1');
        comRes.ErrorCode = ErrCode.COUPON_TRANSFER_ERROR;
      }
    } catch (e) {
      console.log('couponsTransfer error:', e);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async createJDoeMember(phone:string, mbr:Partial<IMember>){
    const J_Doe:Partial<IMember> = {
      id: uuidv1(),
      phone,
      //isLocked: true,
      isCouponTriggered: true,
      notes: `會員{${mbr.name}}轉贈優惠券,而新增之會員`, 
    }
    const newMbr = await this.modelMember.create(J_Doe);
    console.log('createJDoeMember', newMbr);
    if (newMbr) return newMbr.id;
  }
  async couponAccept(cpAccept:CouponAcceptRequestDto, mbr:Partial<IMember>):Promise<CommonResponseDto> {
    const comRes = new CommonResponseDto();
    const filter:FilterQuery<CouponDocument> = {
      id: cpAccept.id,
      memberId: cpAccept.currentOwnerId,
    };
    try {
      const coupon = await this.modelCoupon.findOne(filter, 'memberId memberName status toPaperNo');
      if (coupon) {
        if (coupon.status !== COUPON_STATUS.NOT_USED) {
          comRes.ErrorCode = ErrCode.COUPON_MUST_NOT_USED;
          return comRes;
        }
        if (coupon.toPaperNo) {
          comRes.ErrorCode = ErrCode.TO_PAPER_ALREADY;
          return comRes;
        }
        const session = await this.connection.startSession();
        session.startTransaction();
        const d = new Date();
        const log:Partial<ICouponTransferLog> = {};
        log.description = `${coupon.memberName}轉讓給${mbr.name}`;
        log.transferDate = d.toLocaleString('zh-TW', {hour12: false});
        log.transferDateTS = d.getTime();
        // const newData:Partial<ICoupon> = {
        const newData:UpdateQuery<CouponDocument> = {
          memberName: mbr.name,
          memberId: mbr.id,
          //originalOwner: coupon.memberName,
          //originalOwnerId: coupon.memberId,
          updater: {
            modifiedByWho: mbr.name,
            modifiedAt: Date.now(),
            modifiedBy: mbr.id,
          },
          $push: { logs: log },
        } 
        const upd = await this.modelCoupon.updateOne({id: cpAccept.id}, newData, {session});
        console.log('couponAccept:', upd);
        let isfinal = false;
        if (upd) {
        //   const tf:Partial<ICouponTransferLog> = {
        //     newOwner: newData.memberName,
        //     newOwnerId: newData.memberId,
        //     previousId: coupon.memberId,
        //     previousOwner: coupon.memberName,
        //   }
        //   isfinal = await this.addTransferLog(cpAccept.id, tf, session);
        // }
        // if (isfinal) {
          const commit = await session.commitTransaction();
          console.log('commit:', commit);
        } else {
          const abort = await session.abortTransaction();
          console.log('abort:', abort);
          comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
        }
      } else {
        comRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
      }
    } catch (e) {
      console.log('couponAccept error:', e);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async addTransferLog(couponId:string, log:Partial<ICouponTransferLog>, session:mongoose.ClientSession):Promise<boolean> {
    let isPass = false;
    const d = new Date();
    // const log:Partial<ICouponTransferLog>={
    //   id: uuidv1(),
    //   couponId: couponId,
    //   newOwner: updatedCP.memberName,
    //   newOwnerId: updatedCP.memberId,
    //   originalOwner: updatedCP.originalOwner,
    //   originalOwnerId: updatedCP.originalOwnerId,
    //   transferDate: d.toLocaleString('zh-TW', {hour12: false}),
    //   transferDateTS: d.getTime(),
    // }
    log.id = uuidv1();
    log.description = `${log.previousOwner}轉讓給${log.newOwner}`;
    log.transferDate = d.toLocaleString('zh-TW', {hour12: false});
    log.transferDateTS = d.getTime();
    try {
      const cc = await this.modelCTL.create([log], {session});
      console.log('addTransLog:', cc);
      if (cc) {
        isPass = true;
      }
    } catch(e) {
      console.log('addTransferLog error:', e);
    }
    return isPass;
  }
}
