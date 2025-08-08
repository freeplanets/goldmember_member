import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IAnnouncement, IAttachmemt } from "../interface/announcement.if";
import { ANNOUNCEMENT_GROUP, MEMBER_EXTEND_GROUP, SEARCH_GROUP_METHOD } from "../../utils/enum";
import { IModifiedBy } from "../interface/modifyed-by.if";
import { Document } from "mongoose";
import { Attachment } from "../announcements/attachment";
import { ModifiedByData } from "../data/modified-by.data";

export type AnnouncementDocument = Document & Announcement;

@Schema()
export class Announcement implements IAnnouncement {
    @Prop({index: true, required: true, unique: true})
    id?: string;

    @Prop()
    title?: string;

    @Prop()
    content?: string;

    @Prop({
        type: String,
    })
    type?: string;

    @Prop()
    publishDate?: string;

    @Prop()
    expiryDate?: string;

    @Prop()
    isPublished?: boolean;

    @Prop()
    isTop?: boolean;

    @Prop()
    iconType?: string;

    @Prop({
        type: [Attachment],
    })
    attachments?: [IAttachmemt];

    @Prop({
        type: Array<String>,
        enum: ANNOUNCEMENT_GROUP
    })
    targetGroups: any[];

    @Prop()
    extendFilter?: MEMBER_EXTEND_GROUP[];

    @Prop({
        type: String,
        enum: SEARCH_GROUP_METHOD,
    })
    method?: SEARCH_GROUP_METHOD;

    @Prop({
        type: ModifiedByData
    })
    creator: IModifiedBy;

    @Prop({
        type: ModifiedByData
    })    
    updater: IModifiedBy;

    // @Prop({
    //     default: true,
    // })
    // isApprev: boolean;
    
    @Prop({
        type: ModifiedByData
    })
    authorizer: IModifiedBy;

    @Prop()
    publishedTs: number;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);