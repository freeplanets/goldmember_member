import { MEMBER_LEVEL } from "./enum";

export enum ErrCode {
	MISS_PARAMETER = 'MISS_PARAMETER',
	DATABASE_ACCESS_ERROR = 'DATABASE_ACCESS_ERROR',
	TOKEN_ERROR = 'TOKEN_ERROR',
	ERROR_PARAMETER = 'ERROR_PARAMETER',
	ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
	INSUFFICENT_PERMISSIONS = 'INSUFFICENT_PERMISSIONS',
	USER_IS_NOT_ACTIVATED = 'USER_IS_NOT_ACTIVATED',
	VERIFY_CODE_ERROR = 'VERIFY_CODE_ERROR',
	ACCOUNT_OR_PASSWORD_ERROR = 'ACCOUNT_OR_PASSWORD_ERROR',
	ACCOUNT_IS_NOT_ACTIVATED = 'ACCOUNT_IS_NOT_ACTIVATED',
	ACCOUNT_IS_LOCKED = 'ACCOUNT_IS_LOCKED',
	UNEXPECTED_ERROR_ARISE = 'UNEXPECTED_ERROR_ARISE',
	SMS_SEND_ERROR = 'SMS_SEND_ERROR',
	CAPTCHA_ERROR = 'CAPTCHA_ERROR',
	SMS_CODE_TOO_FAST = 'SMS_CODE_TOO_FAST',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	BEEN_LOGOUT = 'BEEN_LOGOUT',
	PHONE_ERROR = 'PHONE_ERROR',
	CAPTCHA_TOO_LATE = 'CAPTCHA_TOO_LATE',
	PHONE_EXIST = 'PHONE_EXIST',
	COUPON_TRANSFER_ERROR = 'COUPON_TRANSFER_ERROR',
	COUPON_TARGET_USER_ERROR = 'COUPON_TARGET_USER_ERROR',
	SMS_TOO_LATE = 'SMS_TOO_LATE',
	COUPON_NOT_FOUND = 'COUPON_NOT_FOUND',
	TO_PAPER_ALREADY = 'TO_PAPER_ALREADY',
	COUPON_MUST_NOT_USED = 'COUPON_MUST_NOT_USED',
	RESERVE_SECTION_IS_BOOKED = 'RESERVE_SECTION_IS_BOOKED',
}
export enum ErrMsg {
	MISS_PARAMETER = '參數不足',
	DATABASE_ACCESS_ERROR = '資料庫連線錯誤',
	TOKEN_ERROR = '權杖(token)錯誤',
	ERROR_PARAMETER = '參數錯誤',
	ITEM_NOT_FOUND = '查無資料',
	INSUFFICENT_PERMISSIONS = '權限不足',
	USER_IS_NOT_ACTIVATED = '帳號未啟用',
	VERIFY_CODE_ERROR = '驗證碼錯誤',
	ACCOUNT_OR_PASSWORD_ERROR = '帳號或密碼錯誤',
	ACCOUNT_IS_NOT_ACTIVATED = '帳號未啟用',
	ACCOUNT_IS_LOCKED = '帳號已鎖定',
	UNEXPECTED_ERROR_ARISE = '出現意外錯誤',
	SMS_SEND_ERROR = '簡訊驗證碼傳送訊息',
	CAPTCHA_ERROR = '圖形驗證碼產生錯誤',
	SMS_CODE_TOO_FAST = '簡訊驗證碼發送間隔過短',
	TOKEN_EXPIRED = '權杖(token)過期',
	BEEN_LOGOUT = '帳號已登出',
	PHONE_ERROR = '手機號碼錯誤',
	CAPTCHA_TOO_LATE = '圖形驗證碼過期',
	PHONE_EXIST = '手機號碼已存在',
	COUPON_TRANSFER_ERROR = '只有未使用的優惠券,才能轉贈',
	COUPON_TARGET_USER_ERROR = '找不到受贈者',
	SMS_TOO_LATE = '簡訊驗證碼過期',
	COUPON_NOT_FOUND = '查無此優惠券',
	TO_PAPER_ALREADY = '已轉為紙本,無法轉讓',
	COUPON_MUST_NOT_USED = '優惠券必需為未使用狀態',
	RESERVE_SECTION_IS_BOOKED = '該時段已被預約',
}
export const getErrorMessage = (code: ErrCode): string => {
	const errKey = Object.keys(ErrCode).find((key) => ErrCode[key as keyof typeof ErrCode] === code);
	return errKey ? ErrMsg[errKey as keyof typeof ErrMsg] : '未知錯誤';
};

export enum DtoErrMsg {
	ID_STYLE_ERROR = '不正確的id格式',
	ID_OR_PHONE_AT_LEAST = 'id或手機號碼,請擇一輸入',
	PHONE_STYLE_ERROR = '電話號碼格式錯誤',
	PASSWORD_STYLE_ERROR = '密碼格式錯誤,應包含大小寫字母、數字,長度6-15碼',
	DATE_STYLE_ERROR = '日期格式(YYYY/MM/DD)錯誤',
	TIME_STYLE_ERROR = '時間格式(00:00 - 23:59)錯誤',
	EMAIL_STYLE_ERROR = '電子郵件格式錯誤',
	ARRAY_STYLE_ERROR = '資料必須是陣列格式',
	MISS_BIRTH_MONTH = '生日月份未填',
	ID_ERROR = '代號錯誤',
	UUID_STYLE_ERROR = 'UUID格式錯誤',
	SHARE_HOLDER_ERROR = `membershipType 只能是 ${MEMBER_LEVEL.GENERAL_MEMBER} 或 ${MEMBER_LEVEL.DEPENDENTS}.`,
	MISS_FREQUENCY = '當發行為自動時,參數 frequency 是比填的.'
}
// export const errorMsg = (code:ErrCode) => {
// 	let errKey = '';
// 	Object.keys(ErrCode).some((key) => {
// 		if (ErrCode[key] === code) {
// 			errKey = key;
// 			return true;
// 		}
// 	});
// 	console.log("errorMsg:", errKey);
// 	return ErrMsg[errKey];	
// } 