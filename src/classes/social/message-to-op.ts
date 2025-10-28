import axios from 'axios';
import { SendMessageReqDto } from '../../dto/social/send-message-request.dto';
import { IncomingHttpHeaders } from 'http2';
import { IReturnObj } from '../../dto/interface/common.if';
import { ErrCode } from '../../utils/enumError';
let file_proxy = process.env.FILE_PROXY;
if (process.env.IS_OFFLINE) {
  file_proxy = process.env.FILE_PROXY_LOCAL;
}
export class MessageToOp {
    async send(data:SendMessageReqDto) {
        const rtn:IReturnObj = {};
        const headers:IncomingHttpHeaders = {
            "content-type": "application/json",
        }
        const url = `${file_proxy}/expo-message/send`;
        try {
            const res = await axios.post(
                url,
                data,
                {
                    headers,
                }
            )
            rtn.data = res.data;
        } catch (error) {
            if (error.response  && error.response.data) {
                rtn.error = ErrCode.UNEXPECTED_ERROR_ARISE;
                rtn.extra = error.message;
                // return error.response.data; 
            }
            console.error('file proxy error:', error);
            //return error.message;
        }
        return rtn;
    }
}