import { COUPON_STATUS, COUPON_TYPES } from "../../utils/enum";
import { IModifiedBy } from "./modifyed-by.if";

export interface ICoupon {
    id?: string;
    batchId?: string;
    name: string;
    type?: string;
    mode?: string;
    memberId?: string;
    memberName?:string;
    issueDate?: string;
    expiryDate?: string;
    status?: COUPON_STATUS;
    usedDate?: string;
    description?: string;
    originalOwnerId?:string;
    originalOwner?: string;
    notAppMember?: boolean;
    toPaperNo: string;
    updater?: IModifiedBy;
    collector: IModifiedBy;
    logs:Partial<ICouponTransferLog>[];
}

export interface ICouponTransferLog {
    id:string;
    couponId:string;
    description:string;
    newOwner:string;
    newOwnerId:string;
    previousOwner:string;
    previousId:string;
    transferDate: string;
    transferDateTS: number;
}
export interface IBirthDayCoupon {}     // 生日券
export interface IShareholderCoupon {}  // 股東券
export interface IDirectorSupervisorCoupon{} // 董監券

// paper 6 位數序號