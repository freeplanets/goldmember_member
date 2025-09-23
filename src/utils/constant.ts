import mongoose from 'mongoose';
import { ICommonResponse, IOrganization } from '../dto/interface/common.if';
import { ORGANIZATION_TYPE } from './enum';
import { Request } from 'express';


/**
 * @author
 * @description 常見狀態代碼
 */
export const STATUS_CODE = {
  SUCCESS: 'success',
  FAIL: 'fail',
  DISASTER: 'disaster',
};

/**
 * @author
 * @description 定義每個網域錯誤訊息
 */
export const ERROR_MESSAGE = {
  SERVER_ERROR: '請聯絡開發團隊。',
};

export const AcceptedImageTypes = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
];

const default_organization:IOrganization = {
  id: 'linkougolf',
  type: ORGANIZATION_TYPE.COURT,
  name: '林口高爾夫球場',
}

export const ORGANIZATION = default_organization;

export const VERIFY_CODE_MESSAGE = '林口高爾夫球場會員系統認證碼[{CODE}],請勿分享他人。';
export const PASSWORD_STYLE = new RegExp(/^((?=.{6,15}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*|(?=.{6,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!\u0022#$%&'()*+,./:;<=>?@[\]\^_`{|}~-]).*)/);
export const PHONE_STYLE = new RegExp(/^09\d{8}(#\d+)?$/, 'g');
export const DATE_STYLE = new RegExp(/^\d{4}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/);   // YYYY/MM/DD
export const DATE_DASH_STYLE = new RegExp(/^((19|20)?[0-9]{2}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01]))$/); // YYYY-MM-DD
export const TIME_STYLE = new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/); // 00:00 - 23:59
export const EMAIL_STYLE = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
export const PHONE_OR_EXTENSION_STYLE = new RegExp(/^09\d{8}(#\d+)?$/);
export const UUID_V1_STYLE = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i');
export const UUID_V4_STYLE = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, 'i');
export const KS_MEMBER_STYLE_FOR_SEARCH = new RegExp(/^[1256]\d{2,3}$/); //3個數字即可查詢


export const PASSWORD_RETRY_COUNT = 5;
export const PASSWORD_RETRY_TIME = 1800000; // 30分鐘
export const THREE_MONTH =  7776000000; // 1000*60*60*24*90 = 90天

export const ObjectId = mongoose.Types.ObjectId;

export function needsBuffer(str: string): boolean {
  // 檢查是否有明顯亂碼（如不可見字元或常見亂碼範圍）
  // 這裡以出現不可見控制字元為例
  return /[\u0000-\u001F\u007F-\u009F]/.test(str);
}

export function AddTraceIdToResponse(res:ICommonResponse<any>, req:Request) {
  try {
    if (!res.error) res.error =  { extra: {} };
    else if (!res.error.extra) {
      res.error.extra = {};
    }
    res.error.extra.traceId = req['traceId'];
  } catch (err) {
    console.log('AddTraceIdToResponse err:', err);
    res['traceId'] = req['traceId'];
    console.log('AddTraceIdToResponse res:', res);
    //res.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
  }
  //return res;
}