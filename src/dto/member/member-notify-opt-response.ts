import { ApiProperty } from "@nestjs/swagger";
import { CommonResponseDto } from "../common/common-response.dto";
import { ICommonResponse } from "../interface/common.if";
import { MemberNotifyOptReq } from "./member-notify-opt-request.dto";

export class MemberNotifyOptRes extends CommonResponseDto implements ICommonResponse<MemberNotifyOptReq> {
    @ApiProperty({
        description: '會員通知設定項目',
        type: MemberNotifyOptReq,
    })
    data?: MemberNotifyOptReq;
}