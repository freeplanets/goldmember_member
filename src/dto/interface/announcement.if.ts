import { ANNOUNCEMENT_EXTEND_GROUP, ANNOUNCEMENT_GROUP, ANNOUNCEMENT_READ_STATUS } from "../../utils/enum";
import { IModifiedBy } from "./modifyed-by.if";

export interface IAnnouncement {
    id?: string;
    title?: string;
    content?: string;
    type?: string;
    publishDate?: string;
    expiryDate?: string;
    isPublished?: boolean;
    isTop?: boolean;
    iconType?: string;
    attachments?: IAttachmemt[];
    targetGroups: ANNOUNCEMENT_GROUP[];
    extendFilter: ANNOUNCEMENT_EXTEND_GROUP;
    creator: IModifiedBy;
    updater: IModifiedBy;
    isApprev: boolean;
    apprevor:IModifiedBy;
    publishedTs:number;
}

export interface IAttachmemt {
    name?: string;
    url?: string;
    size?: number;
}

export interface IAnnouncement2Member {
    id:string;
    memberId: string;
    announcementId:string;
    publishDate?: string;
    expiryDate?: string;
    readStatus: ANNOUNCEMENT_READ_STATUS; // 0 未讀, 1 已讀
    isDeleted: boolean;
}


// 未下架和三個月內 
// 預設