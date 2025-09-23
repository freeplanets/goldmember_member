import { ApiProperty } from "@nestjs/swagger";
import { INotificationOptions } from "../interface/member.if";
import { IsBoolean } from "class-validator";

export class MemberNotifyOptReq implements INotificationOptions {
    @ApiProperty({
        description: '公告通知',
        required: true,
        example: true
    })
    @IsBoolean()
    announcements: boolean;

    @ApiProperty({
        description: '預約通知',
        example: true
    })
    @IsBoolean()
    bookingReminders: boolean;

    @ApiProperty({
        description: '球隊邀請通知',
        example: true
    })
    @IsBoolean()
    teamInvites: boolean;

    @ApiProperty({
        description: '系統通知',
        example: true
    })
    @IsBoolean()
    systemNotifications: boolean;

    @ApiProperty({
        description: '優惠券通知',
        example: true,
    })
    @IsBoolean()
    couponNotifications: boolean;    
}