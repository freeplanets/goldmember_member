import { Injectable } from '@nestjs/common';
import { MEMBER_LEVEL, SmsCodeUsage } from '../utils/enum';
import { MemberPutProfileRequestDto } from '../dto/member/member-put-profile-request.dto';
import { MemberPasswordRequestDto } from '../dto/member/member-password-request.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from '../dto/schemas/member.schema';
import mongoose, { Model, UpdateQuery } from 'mongoose';
import { Upload2S3 } from '../utils/upload-2-s3';
import { IMember, INotificationOptions, IPushToken } from '../dto/interface/member.if';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { ErrCode } from '../utils/enumError';
import { TempData } from '../dto/schemas/tempdata.schema';
import { ProfileCheck } from '../../src/dto/member/profile-check';
import { MemberProfileResponseDto } from '../dto/member/member-profile-response.dto';
import { MEMBER_DETAIL_FIELDS } from '../utils/base-fields-for-searh';
import { KsMember, KsMemberDocument } from '../dto/schemas/ksmember.schema';
import { MemberGrowth, MemberGrowthDocument } from '../dto/schemas/member-growth.schema';
import { MemberTransferLog, MemberTransferLogDocument } from '../dto/schemas/member-transfer-log.schema';
import { Coupon, CouponDocument } from '../dto/schemas/coupon.schema';
import { MemberShareholderSwitch } from '../classes/member/member-shareholder-switch';
import { InvitationCode, InvitationCodeDocument } from '../dto/schemas/invitation-code.schema';
import { MembersConvertToShareholderRequestDto } from '../dto/member/members-convert-to-shareholder-request.dto';
import { IUser } from '../dto/interface/user.if';
import { ShareholderSwitchReqDto } from '../dto/member/shareholder-switch-request.dto';
import { PushToken, PushTokenDocument } from '../dto/schemas/push-token.schema';
import { IReturnObj } from '../dto/interface/common.if';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { MemberNotifyOpt } from '../classes/member/member-notify-opt';
import { MemberDelete } from '../classes/member/member-delete';
import { Team, TeamDocument } from '../dto/schemas/team.schema';
import { TeamMember, TeamMemberDocument } from '../dto/schemas/team-member.schema';
import { Friend, FriendDocument } from '../dto/schemas/friend.schema';

@Injectable()
export class MemberService {
  private mbrOptOp:MemberNotifyOpt;
  constructor(
    @InjectModel(Member.name) private readonly modelMember:Model<MemberDocument>,
    @InjectModel(TempData.name) private readonly tempDataModel:Model<TempData>,
    @InjectModel(KsMember.name) private ksMemberModel:Model<KsMemberDocument>,
    @InjectModel(MemberGrowth.name) private modelMG:Model<MemberGrowthDocument>,
    @InjectModel(MemberTransferLog.name) private modelMTL:Model<MemberTransferLogDocument>,
    @InjectModel(Coupon.name) private modelCoupon:Model<CouponDocument>,
    @InjectModel(InvitationCode.name) private readonly modelIC:Model<InvitationCodeDocument>,
    @InjectModel(PushToken.name) private readonly modelPT:Model<PushTokenDocument>,
    @InjectModel(Team.name) private readonly modelTeam:Model<TeamDocument>,
    @InjectModel(TeamMember.name) private readonly modelTM:Model<TeamMemberDocument>,
    @InjectModel(Friend.name) private readonly modelFrd:Model<FriendDocument>,
    @InjectConnection() private readonly connection:mongoose.Connection,    
  ) {
    this.mbrOptOp = new MemberNotifyOpt(modelMember);
  }
  async memberProfile(user:Partial<IMember>): Promise<any> {
    const mpRes = new MemberProfileResponseDto();
    try {
      // console.log('memberProfile', user)
      // name displayName membershipType isDirector passwordLastModifiedTs gender birthDate phone email joinDate expiryDate notes  lastLogin lastLoginIp isDirector
      const member = await this.modelMember.findOne({id: user.id}, MEMBER_DETAIL_FIELDS);
      if (member) {
        mpRes.data = member;
      } else {
        mpRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
      }
    } catch (e) {
      mpRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      mpRes.error.extra = e;
    }
    return mpRes;
  }

  async memberPutProfile(
    id: string,
    memberPutProfile: MemberPutProfileRequestDto,
    file: Express.Multer.File | undefined = undefined,
  ): Promise<CommonResponseDto> {
    const comRes = new CommonResponseDto();
    try {
      console.log('memberPutProfile:', id);
      const usr = await this.modelMember.findOne({id}, 'id phone');
      if (usr) {
        const profileChk = new ProfileCheck(memberPutProfile);
        if (profileChk.Error) {
          comRes.ErrorCode = ErrCode.ERROR_PARAMETER;
          comRes.error.message = profileChk.ErrorMessage;
          comRes.error.extra = profileChk.Error;
          return comRes;
        }
        const memberProfile = profileChk.Data;
        console.log('memberProfile:', memberProfile);
        if (memberPutProfile.phone && memberPutProfile.phone !== usr.phone) {
          const phoneExist = await this.modelMember.findOne({phone: memberPutProfile.phone});
          if (phoneExist) {
            comRes.ErrorCode = ErrCode.PHONE_EXIST;
            return comRes;
          }
          const verify = await this.tempDataModel.findOne({code: memberPutProfile.phone});
          if (!verify || verify.codeUsage !== SmsCodeUsage.PHONE_CHANGE || verify.value !== memberPutProfile.verificationCode) {
            comRes.ErrorCode = ErrCode.VERIFY_CODE_ERROR;
            return comRes;
          }
        }
        // const memberProfile:Partial<IMember> = {};
        // Object.keys(memberPutProfile).forEach((key) => {
        //   if (memberPutProfile[key] !=='' && key !== 'verificationCode') {
        //     if (key == 'handicap') {
        //       memberProfile[key] = typeof memberPutProfile[key] !== 'number' ? Number(memberPutProfile[key]) : memberPutProfile[key];
        //     } else if (key== 'birthDate') {
        //       memberProfile[key] = memberPutProfile[key];
        //       memberProfile.birthMonth = getBirthMonth(memberPutProfile[key]);
        //     } else {
        //       memberProfile[key] = memberPutProfile[key];
        //     }
        //   }
        // });
        if (file) {
          console.log("check1:", file);
          const filename = await this.upload(file);
          if (filename) {
            console.log('filename:', filename);
            memberProfile.pic = filename;
          }
        }

        console.log("check2:", memberProfile);
        await this.modelMember.updateOne({id}, memberProfile);  
      } else {
        comRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
      }
    } catch (e) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async memberPassword(
    memberPasswordRequestDto: MemberPasswordRequestDto,
    member:Partial<IMember>,
  ): Promise<CommonResponseDto> {
    const comRes = new CommonResponseDto();
    try {
      const usr = await this.modelMember.findOne({id: member.id}, 'password');
      if (usr) {
        const isPassOk = usr.schema.methods.comparePassword(memberPasswordRequestDto.currentPassword, usr.password);
        if (isPassOk) {
          const upd = await this.modelMember.updateOne(
            {id:member.id},
            {
              password: memberPasswordRequestDto.newPassword,
              passwordLastModifiedTs: Date.now(),
            });
          console.log('upd:', upd);
        } else {
          comRes.ErrorCode = ErrCode.ACCOUNT_OR_PASSWORD_ERROR;
        }
      } else {
        comRes.ErrorCode = ErrCode.ITEM_NOT_FOUND;
      }
    } catch (e) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async upload(file:Express.Multer.File) {
    const uploader = new Upload2S3();
    const upload = await uploader.uploadFile(file);
    console.log('upload:', upload);
    if (upload) {
      //return  `https://${uploader.AWS_S3_BUCKET}/${file.originalname}`;
      return uploader.file_url;
    }
    return false;
  }
  async membersConvertToShareholder(ssdto:ShareholderSwitchReqDto, mbr:Partial<IMember>) {
    let comRes = new CommonResponseDto();
    //console.log('memberschipType check:', mbr.membershipType , MEMBER_LEVEL.SHARE_HOLDER);
    const myInfo = await this.modelMember.findOne({id: mbr.id}, 'membershipType');
    if (myInfo.membershipType === MEMBER_LEVEL.SHARE_HOLDER) {
      comRes.ErrorCode = ErrCode.SHARE_HOLDER_ALREADY_ERROR;
      return comRes;
    } else {
      console.log('memberschipType check else:', mbr.membershipType , MEMBER_LEVEL.SHARE_HOLDER); 
    }
    const memberSW = new MemberShareholderSwitch(
      this.modelMember,
      this.ksMemberModel,
      this.modelMTL,
      this.modelMG,
      this.modelCoupon,
      this.connection,
    );
    try {
      const f = await this.modelIC.findOne(ssdto);
      if (f) {
        if (f.isCodeUsed || f.isTransferred) {
          comRes.ErrorCode = ErrCode.INVITATION_CODE_IS_USED;
        } else {
          const data:MembersConvertToShareholderRequestDto = new MembersConvertToShareholderRequestDto();
          data.id = mbr.id;
          data.membershipType = MEMBER_LEVEL.SHARE_HOLDER;
          data.systemId = f.no;
          const user:Partial<IUser> = {
            id: mbr.id,
            username: mbr.name,
          }
          comRes = await memberSW.membertypesSwitch(data, user);
          if (!comRes.errorcode) {
            const upd = await this.modelIC.updateOne({no:f.no}, {isCodeUsed: true});
            console.log('upd:', upd);
          }
        }
      } else {
        comRes.ErrorCode = ErrCode.INVITATION_CODE_NOT_FOUND;
      }
    } catch (error) {
      console.log('membersConvertToShareholder error:', error);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = error.message;
    }
    return comRes;
  }
  async updatePushToken(data:Partial<IPushToken>, mbr:Partial<IMember>) {
    return FuncWithTryCatchNew(this, 'modifyPushToken', data, mbr);
    // const comRes = new CommonResponseDto();
    // try {
    //   console.log('data:', data);
    //   // data.userId = mbr.id;
    //   comRes.data = await this.modelPT.updateOne({userId: mbr.id}, data, {upsert: true});
    // } catch(error) {
    //   comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
    //   comRes.error.extra = error.message;
    // }
    // return comRes;
  }
  private async modifyPushToken(data:Partial<IPushToken>, mbr:Partial<IMember>) {
    const rtn:IReturnObj = {};
    data.userId = mbr.id;
    const deviceId = data.deviceId;
    delete data.deviceId;
    rtn.data = await this.modelPT.updateOne({deviceId}, data, {upsert: true});
    return rtn; 
  }
  async getNotifyOpt(user:Partial<IMember>) {
    return FuncWithTryCatchNew(this.mbrOptOp, 'get', user.id);
  }
  async setNotifyOpt(user:Partial<IMember>, data:INotificationOptions) {
    return FuncWithTryCatchNew(this.mbrOptOp, 'set', user.id, data);
  }
  async delAccount(user:Partial<IMember>) {
    const session = await this.connection.startSession();
    const mbrDel = new MemberDelete(this.modelMember, this.ksMemberModel, this.modelMG, this.modelFrd, this.modelTeam, this.modelTM, session);
    return FuncWithTryCatchNew(mbrDel, 'remove', user.id);
  }
}