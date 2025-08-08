import { Filter } from 'aws-sdk/clients/devicefarm';
import { MEMBER_EXTEND_GROUP, MEMBER_GROUP } from '../../utils/enum';
import { ErrCode } from '../../utils/enumError';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface ICommonResponse<T> {
    errorcode?: ErrCode;
    ErrorCode?: ErrCode;
    error?: ICommonError;
    data?: T;
}

export interface ICommonError {
    message?: string;
    extra?: any;
}

export interface ISmsVerify {
    secret: string;
    code: string;
}

export interface ITempData {
    code?:string;
    value?:string;
    codeUsage?:string;
    ts:number;
}

export interface IHasFilterItem {
    id?:string;
    type?: string;
    targetGroups: any[];
    extendFilter?: MEMBER_EXTEND_GROUP[];    
}

export interface IHoliday {
    year: number;
    date: string;
    name: string;
    isHoliday: boolean;
    holidayCategory: string;
    description: string;
}

export interface AnyObject {
    [key:string]:any;
}

export interface IHasId extends AnyObject {
    id?:string;
}

export interface IHasPhone extends AnyObject {
    phone:string;
}

export interface IbulkWriteItem<D> {
    insertOne?: {
        document:D
    },
    updateOne?: {
        filter: FilterQuery<D>;    // key of document like { key: "yourvalue" }
        update: UpdateQuery<D>;
    }
}

export interface ICommonLog {
    description?:string;
    transferDate?: string;
    transferDateTS?: number;  
}

export interface IReturnObj {
    data?: any,
    error?: ErrCode,
}

export interface IHasFilterItem {
    id?:string;
    type?: string;
    targetGroups: any[];
    extendFilter?: MEMBER_EXTEND_GROUP[];    
}