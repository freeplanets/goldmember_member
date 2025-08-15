import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthRequestDto } from '../dto/auth/auth-request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDcoument } from '../dto/schemas/member.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { MEMBER_DEFAULT_FIELDS } from '../utils/base-fields-for-searh';
import { LoginResponseData } from '../dto/auth/login-response.data';
import { IMember } from '../dto/interface/member.if';
import { Upload2S3 } from '../utils/upload-2-s3';
import {v1 as uuidv1} from 'uuid';
import { MemberRegisterRequestDto } from '../dto/member/member-register-request.dto';
import { AuthSMSRequestDto } from '../dto/auth/auth-sms-request.dto';
import { sendSMSCode, verifyPhoneCode } from '../utils/sms';
import { OtpCode } from '../utils/otp-code';
import { AuthResetPasswordDto } from '../dto/auth/auth-resetpassword.dto';
import { AuthResponseDto } from '../dto/auth/auth-response.dto';
import { ErrCode } from '../utils/enumError';
import { CommonResponseDto } from '../dto/common/common-response.dto';
import { PASSWORD_RETRY_COUNT, PASSWORD_RETRY_TIME, VERIFY_CODE_MESSAGE } from '../utils/constant';
import { AuthSendVerificationResponseDto } from '../dto/auth/auth-send-verification-response.dto';
import * as svgCaptcha from "svg-captcha";
import { TempData, TempDataDocument } from '../dto/schemas/tempdata.schema';
import { ITempData } from '../dto/interface/common.if';
import { LoginToken, LoginTokenDocument } from '../dto/schemas/login-token.schema';
import { SmsCodeUsage } from '../utils/enum';
import { ProfileCheck } from '../dto/member/profile-check';
import { ILoginToken } from '../dto/interface/auth.if';
import { AuthRefreshTokenResponse } from '../dto/auth/auth-refresh-token-response';
import { RefreshTokenData } from '../dto/auth/refresh-token-data';
import { ILoginDevice } from '../dto/interface/devices.if';
import { MemberActivity, MemberActivityDocument } from '../dto/schemas/member-activity.schema';
import { MemberGrowth, MemberGrowthDocument } from '../dto/schemas/member-growth.schema';
import { DateLocale } from '../classes/common/date-locale';

@Injectable()
export class AuthService {
  private myDate = new DateLocale();
  constructor(
    @InjectModel(Member.name) private readonly modelMember:Model<MemberDcoument>,
    @InjectModel(TempData.name) private readonly modelTempData:Model<TempDataDocument>,
    @InjectModel(LoginToken.name) private readonly modelLoginToken:Model<LoginTokenDocument>,
    @InjectModel(MemberActivity.name) private readonly modelMA:Model<MemberActivityDocument>,
    @InjectModel(MemberGrowth.name) private readonly modelMG:Model<MemberGrowthDocument>,
    private readonly jwt: JwtService,
  ){}
  async auth(authRequestDto: AuthRequestDto, ip:string): Promise<AuthResponseDto> {
    console.log("authRequestDto:", authRequestDto);
    const ahRes = new AuthResponseDto();
    try {
      const device = this.jwt.decode(authRequestDto.fingerprint);
      console.log('fingerprint:', authRequestDto.fingerprint);
      console.log('device', device);
      if (!device.deviceId) {
        ahRes.ErrorCode = ErrCode.ERROR_PARAMETER;
        ahRes.error.extra = 'fingerprint decode error';
        return ahRes;
      }
      const mbr = await this.modelMember.findOne(
        {phone: authRequestDto.phone},
        `${MEMBER_DEFAULT_FIELDS} systemId phone password passwordLastModifiedTs isLocked passwordFailedCount passwordLastTryTs devices`,
      );
      console.log("member:", mbr);
      if (mbr) {
        if (mbr.isLocked) {
          ahRes.ErrorCode = ErrCode.ACCOUNT_IS_LOCKED;
          return ahRes;
        }
        const isPassOk = await mbr.schema.methods.comparePassword(authRequestDto.password, mbr.password);
        console.log("isPassOk:", isPassOk);
        if (isPassOk) {
          const mbrInfo:Partial<IMember> = {
            _id: mbr._id,
            id: mbr.id,
            name: mbr.name,
            displayName: mbr.displayName,
            joinDate: mbr.joinDate,
            isDirector: mbr.isDirector,
            handicap: mbr.handicap,
            // birthDate: mbr.birthDate,
            // birthMonth: getBirthMonth(mbr.birthDate),
            membershipType: mbr.membershipType,
            announcementReadTs: mbr.announcementReadTs,
            systemId: mbr.systemId,
            phone: mbr.phone,
            pic: mbr.pic,
            //phone: mbr.phone,
            //isDirector: mbr.isDirector,
          };
          if (mbr.passwordLastModifiedTs && mbr.passwordLastModifiedTs > 0) {
              mbrInfo.passwordUpdateReminderDays = Math.floor((new Date().getTime() - mbr.passwordLastModifiedTs) / (1000 * 60 * 60 * 24));
          }
          // if (device.iat) delete device.iat;
          // if (device.exp) delete device.exp;
          const loginD:Partial<ILoginDevice> = {};
          Object.keys(device).forEach((key) => {
            if (key !== 'iat' && key !== 'exp' && key !== 'deviceId') {
              loginD[key] = device[key];
            }
          });
          ahRes.data = new LoginResponseData(mbrInfo, this.jwt, loginD);
          const loginTime = Date.now();
          loginD.lastLogin = loginTime;
          loginD.lastLoginIp = ip;
          loginD.deviceId = device.deviceId;
          const devices = mbr.devices ? mbr.devices : [];
          let fIdx = devices.findIndex((itm) => itm.deviceId === device.deviceId);
          if (fIdx !== -1) {
            // Object.keys(f).forEach((key) => {
            //   f[key] = device[key];
            // });
            devices[fIdx] = loginD;
            // console.log("f=loginD check");
          } else {
            devices.push(loginD);
          }
          // console.log(devices, loginD);
          const upd = await this.modelMember.updateOne(
            {id: mbr.id}, 
            {
              lastLogin: loginTime,
              lastLoginIp: ip,
              devices,
              passwordFailedCount: 0,
              passwordLastTryTs: 0,
            });
          console.log("update:", upd);
          
          const upsert = await this.modelLoginToken.updateOne(
            {uid:mbr.id}, 
            {token: ahRes.data.token}, 
            {upsert:true}
          );
          console.log('upsert:', upsert);
          console.log('new dtoken:', ahRes.data.deviceRefreshToken);
          const updev = await this.modelLoginToken.updateOne(
            {uid: device.deviceId},
            {token: ahRes.data.deviceRefreshToken, lastLoginId: mbr.id},
            {upsert:true}
          );
          console.log('updev:', updev);
          console.log('deviceId', device.deviceId)
          await this.addMemberActivity(mbr.id, mbr.membershipType, loginTime);
        } else {
          let passwordLastTryTs = mbr.passwordLastTryTs ? mbr.passwordLastTryTs : 0;
          let passwordFailedCount = mbr.passwordFailedCount ? mbr.passwordFailedCount : 0;
          if (passwordLastTryTs === 0) {
            passwordLastTryTs = new Date().getTime();
          } else {
            const now = new Date().getTime();
            if (now - passwordLastTryTs > PASSWORD_RETRY_TIME) {
              console.log('check:', now, passwordLastTryTs, PASSWORD_RETRY_TIME);
              passwordFailedCount = 0;
              passwordLastTryTs = now;
            }
          }
          passwordFailedCount++;
          const updta:Partial<IMember> = {
            passwordFailedCount,
            passwordLastTryTs,
          }
          if (passwordFailedCount >= PASSWORD_RETRY_COUNT) {
            updta.isLocked = true;
          }
          const upd = await this.modelMember.findOneAndUpdate({id:mbr.id}, updta);
          console.log("update pass", upd);
            ahRes.ErrorCode = ErrCode.ACCOUNT_OR_PASSWORD_ERROR;
        }
      } else {
        ahRes.ErrorCode = ErrCode.ACCOUNT_OR_PASSWORD_ERROR;
      }
    } catch (e) {
      console.log("auth error:", e);
      ahRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      ahRes.error.extra = e;
      // throw new CommonError(
      //   e.type || ERROR_TYPE.SYSTEM,
      //   e.status || STATUS_CODE.FAIL,
      //   e.status ? e.clientErrorMessage : ERROR_MESSAGE.SERVER_ERROR,
      //   e.message,
      // );
    }
    return ahRes;
  }

  async memberCreate(
    memberCreate:MemberRegisterRequestDto, 
    file:Express.Multer.File | undefined = undefined,
  ):Promise<CommonResponseDto> {
    const comRes = new CommonResponseDto();
    try {
      const f = await this.modelTempData.findOne({code: memberCreate.phone});
      if (f) {
        const verificationCode = memberCreate.verificationCode;
        // const memberRegister:Partial<IMember> = {};
        // Object.keys(memberCreate).forEach((key) => {
        //   if (key == 'verificationCode') {
        //     verificationCode = memberCreate[key];
        //   } else if (key == 'handicap') {
        //     memberRegister[key] = typeof memberCreate[key] !== 'number' ? Number(memberCreate[key]) : memberCreate[key];
        //   } else {
        //     memberRegister[key] = memberCreate[key];
        //   }
        // })
        const profileChk = new ProfileCheck(memberCreate);
        if (profileChk.Error) {
          comRes.ErrorCode = ErrCode.ERROR_PARAMETER;
          comRes.error.extra = profileChk.Error;
          return comRes;
        }
        const memberRegister = profileChk.Data;
        if (f.codeUsage !== SmsCodeUsage.REGISTER || verificationCode !== f.value) {
          comRes.ErrorCode = ErrCode.VERIFY_CODE_ERROR;
        } else {
          if (file) {
            const filename = await this.upload(file);
            console.log('filename:', filename);
            if (filename) {
              memberCreate.pic = filename;
            }
          }
          memberRegister.passwordLastModifiedTs = new Date().getTime();
          memberRegister.joinDate = this.myDate.toDateString();
          const existsMbr = await this.modelMember.findOne({phone: memberCreate.phone, isCouponTriggered: true}, 'id');
          console.log('existsMbr:', existsMbr);
          let rlt:any;
          if (existsMbr) {
            // memberRegister.id = existsMbr.id;
            if (existsMbr.name) {
              comRes.ErrorCode = ErrCode.ACCOUNT_EXISTS;
              return comRes;
            }
            rlt = await this.modelMember.updateOne({id: existsMbr.id}, memberRegister);
          } else {
            memberRegister.id = uuidv1();
            rlt = await this.modelMember.create(memberRegister);
          }
          console.log("create:", rlt);
          if (rlt) {
            const upd = await this.modifyMemberGrowth();
            console.log("modifyMemberGrowth:", upd);
          }
        }
      } else {
        comRes.ErrorCode = ErrCode.PHONE_ERROR;
      }
    } catch (e) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async getCaptcha(forTest=false):Promise<AuthSendVerificationResponseDto> {
    const verifyRes = new AuthSendVerificationResponseDto();
    try {
      const opt:svgCaptcha.ConfigObject = {
        size: 4,
        fontSize: 50,
        width: 110,
        height: 40,
        ignoreChars: '0o1liI',
        background: '#cc9966',      
      }
      const captcha = svgCaptcha.create(opt);
      const captchaId = Math.floor(Math.random() * 1000000000).toString();
      console.log("Generated Random ID:", captchaId);
      const tmp:ITempData = {
        code: captchaId,
        value: captcha.text,
        ts: new Date().getTime(),  
      }
      const f = await this.modelTempData.findOne({code: tmp.code});
      console.log("findOne:", f);
      if (f) {
        await this.modelTempData.deleteOne({code: tmp.code});
      }
      const tmpData = await this.modelTempData.create(tmp);
      if (tmpData) {
        verifyRes.data = {
          captcha: captcha.data,
          captchaId,
        }
        if (forTest) {
          if (!verifyRes.error) verifyRes.error = {};
          verifyRes.error.extra = captcha.text;
        }
      } else {
        verifyRes.ErrorCode = ErrCode.CAPTCHA_ERROR;
      }
    } catch (err) {
      verifyRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      verifyRes.error = {
        extra: err,
      }
    }
    return verifyRes    
  }
  async sendSmsCode(smsReq:AuthSMSRequestDto, forTest=false):Promise<CommonResponseDto>{
    const comRes = new CommonResponseDto();
    try {
      const f = await this.modelTempData.findOne({code: smsReq.captchaId});
      if (f && f.value === smsReq.captchaCode ) {
        if (f.ts + 60*3*1000 < new Date().getTime()) {
          comRes.ErrorCode = ErrCode.CAPTCHA_TOO_LATE;
          return comRes;
        }
        let phone = smsReq.phone.indexOf('#')>0 ? smsReq.phone.split('#')[0] : smsReq.phone;
        phone = verifyPhoneCode(phone);
        const oldSmsData = await this.modelTempData.findOne({code: smsReq.phone});
        if (oldSmsData) {
          if(oldSmsData.ts + 60*3*1000 > new Date().getTime()) {
            comRes.ErrorCode = ErrCode.SMS_CODE_TOO_FAST;
            return comRes
          }
        }
        const otp = new OtpCode();
        const secret = otp.SecretCode;
        const verifyCode = otp.getToken(secret);
        //session.smsCode = verifyCode;
        //session.smsSecret = secret;
        const tmp:ITempData = {
          // code: phone,
          value: verifyCode,
          codeUsage: smsReq.codeUsage,
          ts: new Date().getTime(),  
        }
        const ans = await this.modelTempData.updateOne({code: smsReq.phone}, tmp, {upsert:true});
        console.log("save verifyCode", ans);
        if (!ans) {
          comRes.ErrorCode = ErrCode.SMS_SEND_ERROR;
          return comRes;
        }
        const msg = VERIFY_CODE_MESSAGE.replace('{CODE}', verifyCode);
        let rlt:any;
        if (forTest) {
          rlt = true;
        } else {
          rlt = await sendSMSCode(phone, msg);
        }
        console.log('sendSMSCode', rlt);
        if (rlt) {
          if(forTest) {
            if (!comRes.error) comRes.error = {};
            comRes.error.extra = verifyCode;
          } 
          const del = await this.modelTempData.deleteOne({code: smsReq.captchaId});
          console.log("delete:", del);
        }
      } else {
        comRes.ErrorCode = ErrCode.CAPTCHA_ERROR;
      }
    } catch (err) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = err;
    }
    return comRes;
  }
  async authRefreshToken(req:Request):Promise<AuthRefreshTokenResponse> {
    const ahRes = new AuthRefreshTokenResponse();
    try {
      const { user } = req as any;
      console.log("user:", user);
      // delete user.exp;
      // delete user.iat;
      // const ans = this.jwt.sign(user);
      if (user.iat) delete user.iat;
      if (user.exp) delete user.exp;
      const ans = new RefreshTokenData(user, this.jwt);

      // console.log('new token:', ans);
      if (ans) {
        // ahRes.data = {
        //   token: ans as string,
        // }
        ahRes.data = ans;
        const upsert = await this.modelLoginToken.updateOne({uid:user.id}, {token: ans.token}, {upsert:true});
        console.log("upsert:", upsert);        
      } else {
        ahRes.ErrorCode = ErrCode.VERIFY_CODE_ERROR;
      }
    } catch (e) {
      ahRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      ahRes.error.extra =  e;
    }
    // console.log('authRefreshToken before return');
    return ahRes;
  }

  async authDeviceRefreshToken(req:Request):Promise<AuthResponseDto> {
    const ahRes = new AuthResponseDto();
    try {
      const { user, device, deviceId } = req as any;
      console.log('authDeviceRefreshToken user:', user)
      console.log('authDeviceRefreshToken deviceId:', deviceId);
      // if (device.iat) delete device.iat;
      // if (device.exp) delete device.exp;
      const loginD:Partial<ILoginDevice> = {};
      Object.keys(device).forEach((key) => {
        if (key !== 'iat' && key !== 'exp') {
          loginD[key] = device[key];
        }
      });
      //loginD.lastLogin = new Date().toLocaleString('zh-TW');
      //loginD.lastLoginIp = ip;
      const mbr = await this.modelMember.findOne({id:user.id}, MEMBER_DEFAULT_FIELDS);
      if (mbr) {
        const mbrInfo:Partial<IMember> = {
          id: mbr.id,
          name: mbr.name,
          displayName: mbr.displayName,
          // birthDate: mbr.birthDate,
          // birthMonth: getBirthMonth(mbr.birthDate),
          membershipType: mbr.membershipType,
          announcementReadTs: mbr.announcementReadTs,
          pic: mbr.pic,
          //phone: mbr.phone,
          //isDirector: mbr.isDirector,
        };
        if (mbr.passwordLastModifiedTs && mbr.passwordLastModifiedTs > 0) {
          mbrInfo.passwordUpdateReminderDays = Math.floor((new Date().getTime() - mbr.passwordLastModifiedTs) / (1000 * 60 * 60 * 24));
        } 
        const ans = new LoginResponseData(mbrInfo, this.jwt, loginD);
        // console.log('new token:', ans);
        if (ans) {
          // ahRes.data = {
          //   token: ans as string,
          // }
          ahRes.data = ans;
          const upsert = await this.modelLoginToken.updateOne({uid:user.id}, {token: ans.token}, {upsert:true});
          console.log('upsert:', upsert);
          const updev = await this.modelLoginToken.updateOne(
            {uid:deviceId}, 
            {
              token: ans.deviceRefreshToken,
              lastLoginId: mbr.id,
            },
            {upsert: true}
          );
          console.log('updev:', updev, deviceId);
          await this.addMemberActivity(mbr.id, mbr.membershipType, Date.now());
        } else {
          ahRes.ErrorCode = ErrCode.VERIFY_CODE_ERROR;
        }
      }
    } catch (e) {
      ahRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      ahRes.error.extra =  e;
    }
    // console.log('authRefreshToken before return');
    return ahRes;
  }
  async upload(file:Express.Multer.File) {
    const uploader = new Upload2S3();
    const upload = await uploader.uploadFile(file);
    console.log('upload:', upload);
    if (upload) {
      //return  `${uploader.AWS_S3_BUCKET}/${file.originalname}`;
      return uploader.file_url;
    }
    return false;
  }
  async authResetPassword(
    authResetPassword: AuthResetPasswordDto,
  ): Promise<CommonResponseDto> {
    const comRes =  new CommonResponseDto();
    try {
      const f = await this.modelTempData.findOne({code: authResetPassword.phone});
      if (f) {
        if(f.codeUsage !== SmsCodeUsage.RESET_PASS || authResetPassword.verificationCode !== f.value) {
          comRes.ErrorCode = ErrCode.VERIFY_CODE_ERROR;
        } else {
          const upd = await this.modelMember.findOneAndUpdate(
            { phone: authResetPassword.phone }, 
            {
              password: authResetPassword.newPassword,
              passwordLastModifiedTs: new Date().getTime(),
              passwordFailedCount: 0,
              isLocked: false,
              passwordLastTryTs: 0,
            }
          );
          console.log("update:", upd);
          // if (upd){
          //   const del = await this.modelTempData.deleteOne({code: authResetPassword.phone});
          //   console.log("delete:", del);
          // }
        }
      } else {
        comRes.ErrorCode = ErrCode.ACCOUNT_OR_PASSWORD_ERROR;
      }
    } catch (e) {
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra
    }
    return comRes;
  }
  async logout(member:Partial<IMember>){
    const comRes = new CommonResponseDto();
    try {
      console.log("member:", member);
      if (member) {
        const data:Partial<ILoginToken> = {
          token: '',
        }
        const ans = await this.modelLoginToken.updateOne({uid:member.id}, data);
        console.log('logout', ans);
        const dev = await this.modelLoginToken.updateOne({lastLoginId: member.id}, data);
        console.log('logout dev', dev);
      } else {
        comRes.ErrorCode = ErrCode.TOKEN_ERROR;
      }
    } catch(e) {
      console.log('logout error', e);
      comRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
      comRes.error.extra = e;
    }
    return comRes;
  }
  async addMemberActivity(memberId:string, membershipType:string, lastLogin:number):Promise<void> {
    //const d = new Date();
    //const year = d.getFullYear();
    //const month = this.myDate.getMonth();  //d.getMonth() + 1;
    const {year, month} = this.myDate.getYearMonth();
    const upsert = await this.modelMA.updateOne({year, month, memberId}, {membershipType, lastLogin}, {upsert: true});
    console.log('AddMemberActivity:', upsert);
  }
  async modifyMemberGrowth() {
    // const d = new Date();
    // const year = d.getFullYear();
    // const month = d.getMonth() + 1;
    const {year, month} = this.myDate.getYearMonth();
    const filter = {
      year,
      month,
    };
    const data:Partial<MemberGrowth> = {
      regularGrowth: 1,
    }
    const growth = await this.modelMG.findOne(filter);
    if (growth) {
      data.regularGrowth = growth.regularGrowth + 1;
    }
    const upsert = await this.modelMG.updateOne(filter, data, {upsert: true});
    console.log('modifyMemberGrowth:', upsert);
    if (upsert.acknowledged) {
      return true;
    }
    return false;
  }
}
