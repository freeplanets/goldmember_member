import { Model } from 'mongoose';
import { MemberDocument } from '../../dto/schemas/member.schema';
import { INotificationOptions } from '../../dto/interface/member.if';
import { IReturnObj } from '../../dto/interface/common.if';

export class MemberNotifyOpt {
    constructor(private readonly model:Model<MemberDocument>){}
    async get(id:string) {
        const rtn:IReturnObj = {};
        const ans =  await this.model.findOne({id}, 'NotifyOptions');
        if (!ans || !ans.NotifyOptions) rtn.data = this.default;
        else {
            const tmp:INotificationOptions = {
                announcements: ans.NotifyOptions.announcements,
                bookingReminders: ans.NotifyOptions.bookingReminders,
                teamInvites: ans.NotifyOptions.teamInvites,
                systemNotifications: ans.NotifyOptions.systemNotifications,
                couponNotifications: ans.NotifyOptions.couponNotifications,
            };
            rtn.data = tmp;
        };
        return rtn;
    }
    async set(id:string, data:INotificationOptions) {
        const rtn:IReturnObj = {};
        rtn.data = await this.model.updateOne({id}, {NotifyOptions: data});
        return rtn;
    }
    private get default():INotificationOptions {
        return {
            announcements: false,
            bookingReminders: false,
            teamInvites: false,
            systemNotifications: false,
            couponNotifications: false,
        }
    }
}