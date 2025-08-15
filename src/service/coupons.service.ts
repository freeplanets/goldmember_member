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
import { ICouponTransferLog } from '../dto/interface/coupon.if';
import { DateLocale } from '../classes/common/date-locale';
import { IbulkWriteItem } from '../dto/interface/common.if';
import { sendSMSCode } from '../utils/sms';
import { MessageOp } from '../classes/announcements/message-op';
import lang from '../utils/lang';
import { Announcement, AnnouncementDocument } from '../dto/schemas/announcement.schema';

@Injectable()
export class CouponsService {
  private myDate = new DateLocale();
  //private dbEN:dbOp<EventNewsDocument>;
  private msgOp:MessageOp;
  constructor(
    @InjectModel(Coupon.name) private readonly modelCoupon:Model<CouponDocument>,
    @InjectModel(Member.name) private readonly modelMember:Model<MemberDcoument>,
    @InjectModel(CouponTransferLog.name) private readonly modelCTL:Model<CouponTransferLogDocument>,
    @InjectModel(Announcement.name) private readonly modelAnn:Model<AnnouncementDocument>,
    @InjectConnection() private readonly connection:mongoose.Connection,
  ){
    //this.dbEN = new dbOp<EventNewsDocument>(modelEN);
    this.msgOp = new MessageOp(modelAnn);
  }
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
      // 查詢會員或新增無名會員
      let targetId = '';
      let targetName = '';
      let smsPhone = '';
      const member = await this.modelMember.findOne(filter, 'id name phone');
      if (member) {
        targetId = member.id;
        targetName = member.name;
      } else {
        if (ctfrd.targetPhone) {
          targetId = await this.createJDoeMember(ctfrd.targetPhone, mbr);
          targetName = ctfrd.targetPhone;
          smsPhone = ctfrd.targetPhone; 
        }
      }
      if (targetId === '') {
        comRes.ErrorCode = ErrCode.COUPON_TARGET_USER_ERROR;
        return comRes;
      }      

      const coupons = await this.modelCoupon.find({id: { $in: ctfrd.couponId }}, 'id memberId memberName status toPaperNo');
      console.log("coupon:", coupons);
      //const newDatas: UpdateQuery<CouponDocument>[]=[];
      const bulks:IbulkWriteItem<CouponDocument>[] = []; 
      for (const coupon of coupons) {
        if (coupon.status !== COUPON_STATUS.NOT_USED) {
          comRes.ErrorCode = ErrCode.COUPON_MUST_NOT_USED;
          return comRes;
        }        
        if (coupon.toPaperNo) {
          comRes.ErrorCode = ErrCode.TO_PAPER_ALREADY;
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
        log.transferDate = this.myDate.toDateTimeString();
        log.transferDateTS = d.getTime();
        //const newData:Partial<ICoupon> = {
        bulks.push({
          updateOne: {
            filter: { id: coupon.id },
            update: {
              memberId: targetId,
              memberName: targetName,
              //originalOwnerId: coupon.memberId,
              //originalOwner: coupon.memberName,
              updater,
              $push: { logs: log },
            }
          }
        });
      }
      if (bulks.length > 0) {
        bulks.forEach((b) => {
          console.log(b.updateOne.filter, b.updateOne.update );
        })
        const bulk = await this.modelCoupon.bulkWrite(bulks as any);
        console.log(bulk);
        //const events = new MessageOp(this.modelAnn);
        const dt = this.myDate.toDateTimeString();
        const title = '優惠券轉贈通知';
        if (smsPhone) {
          const phone = smsPhone.indexOf('#')>0 ? smsPhone.split('#')[0] : smsPhone;
          //const msg = `林口高爾夫球場通知，${mbr.name}剛剛發送了${bulks.length}張優惠券給你，請查看。`;
          const msg = lang.zhTW.CouponTransferTo.replace('{from}', mbr.name).replace('{number}', bulks.length+'');
          const sms = await sendSMSCode(phone, msg);
          console.log('sms:', sms);
        } else {
          const msgApp = lang.zhTW.CouponTransforToAppUser.replace('{from}', mbr.name).replace('{datetime}', dt).replace('{number}', bulks.length+'');
          this.msgOp.createPersonalMsg(targetId, title, msgApp);
          //console.log('transfer to', ans1);
        }
        const msgSelf = lang.zhTW.CouponTransferToForSelf.replace('{datetime}', dt).replace('{number}', bulks.length+'').replace('{to}', targetName);
        this.msgOp.createPersonalMsg(mbr.id, title, msgSelf);
        const ans = await this.msgOp.send();
        console.log('transfer msg self:', ans);
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
      id: { $in: cpAccept.id.map((cid) => cid )},
      memberId: cpAccept.currentOwnerId,
    };
    try {
      console.log('filter:', filter);
      const coupons = await this.modelCoupon.find(filter, 'id memberId memberName status toPaperNo');
      // const session = await this.connection.startSession();
      // session.startTransaction();
      const bulks:IbulkWriteItem<CouponDocument>[] = [];
      let fromName = '';
      for (let i =0, n=coupons.length; i < n ; i+=1) {
        const coupon =  coupons[i];
        if (coupon.status !== COUPON_STATUS.NOT_USED) {
          comRes.ErrorCode = ErrCode.COUPON_MUST_NOT_USED;
          return comRes;
        }
        if (coupon.toPaperNo) {
          comRes.ErrorCode = ErrCode.TO_PAPER_ALREADY;
          return comRes;
        }
        const log:Partial<ICouponTransferLog> = {};
        if (!fromName) fromName = coupon.memberName;
        log.description = `${coupon.memberName}轉讓給${mbr.name}`;
        log.transferDate = this.myDate.toDateTimeString();
        log.transferDateTS = Date.now();
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
        bulks.push({
          updateOne: {
            filter: {id: coupon.id},
            update: newData,
          }
        })
        // const upd = await this.modelCoupon.updateOne({id: cpAccept.id}, newData, {session});
        // console.log('couponAccept:', upd);
        // let isfinal = false;
        // if (upd) {
        //   const commit = await session.commitTransaction();
        //   console.log('commit:', commit);
        // } else {
        //   const abort = await session.abortTransaction();
        //   console.log('abort:', abort);
        //   comRes.ErrorCode = ErrCode.DATABASE_ACCESS_ERROR;
        // }
      }
      if (bulks.length > 0) {
        const upds = await this.modelCoupon.bulkWrite(bulks as any);
        console.log('upds:', upds);
        const dt = this.myDate.toDateTimeString();
        const title = '優惠券轉贈通知';
        const msg1 = lang.zhTW.CouponTransforToAppUser.replace('{from}', fromName).replace('{datetime}', dt).replace('{number}', bulks.length + '');
        this.msgOp.createPersonalMsg(mbr.id, title, msg1)
        const msg2 = lang.zhTW.CouponTransferToForSelf.replace('{datetime}', dt).replace('{number}', bulks.length + '').replace('{to}', mbr.name);
        this.msgOp.createPersonalMsg(cpAccept.currentOwnerId,title, msg2);
        const ans = await this.msgOp.send();
        console.log('ans:', ans);
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
