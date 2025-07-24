import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ICoupon, ICouponTransferLog } from "../interface/coupon.if";
import { COUPON_STATUS } from "../../utils/enum";
import { IModifiedBy } from "../interface/modifyed-by.if";
import { Document } from "mongoose";
import { ModifiedByData } from "../common/modified-by.data";
import { CouponTransferLog } from "./coupon-transfer-log.schema";

export type CouponDocument = Document & Coupon;

@Schema()
export class Coupon implements ICoupon {
    @Prop({index: true, unique: true})
    id?: string;

    @Prop()
    batchId: string;

    @Prop()
    name: string;

    @Prop()
    type?: string;
    
    @Prop()
    mode?:string;

    @Prop()
    memberId?: string;

    @Prop()
    memberName?: string;

    @Prop()
    issueDate?: string;

    @Prop()
    expiryDate?: string;

    @Prop()
    status: COUPON_STATUS;

    @Prop()
    usedDate?: string;

    @Prop()
    description?: string;

    @Prop()
    originalOwner: string;

    @Prop()
    originalOwnerId?: string;

    @Prop()
    toPaperNo: string;

    @Prop()
    notAppMember?: boolean;

    @Prop({
        type: ModifiedByData
    })
    updater: IModifiedBy;
    
    @Prop({
        type: ModifiedByData
    })
    collector: IModifiedBy;

    @Prop({
        type: Array<CouponTransferLog>,
        default: [],
    })
    logs: Partial<ICouponTransferLog>[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);