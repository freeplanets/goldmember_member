import { ApiProperty } from "@nestjs/swagger";
import { ICommonError, ICommonResponse } from "../interface/common.if";
import { ErrCode, getErrorMessage } from "../../utils/enumError";
import { CommonErrorDto } from "./common-error.dto";

export class CommonResponseData implements ICommonResponse<any> {
    @ApiProperty({
        description: '錯誤代碼',
        enum: ErrCode,
        example: ErrCode.ERROR_PARAMETER,
    })
    errorcode?: ErrCode;

    set ErrorCode(value: ErrCode) {
        this.errorcode = value;
        if (!this.error) {
            this.error = {};
        }
        this.error.message = getErrorMessage(value);
    }

    @ApiProperty({
        description: '當有錯時顯示錯誤訊息',
        type: CommonErrorDto,
    })
    error?: ICommonError;

    data?: any;
}