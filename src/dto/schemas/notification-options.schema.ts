import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { INotificationOptions } from "../interface/member.if";


@Schema()
export class NotificationOptions implements INotificationOptions {
    @Prop()
    announcements: boolean;

    @Prop()
    bookingReminders: boolean;

    @Prop()
    teamInvites: boolean;

    @Prop()
    systemNotifications: boolean;

    @Prop()
    couponNotifications: boolean;    
}

export const NotificationOptionsSchema = SchemaFactory.createForClass(NotificationOptions);