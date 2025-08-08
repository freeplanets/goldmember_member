import { IMember } from '../interface/member.if';
import { MemberPutProfileRequestDto } from './member-put-profile-request.dto';
import { DATE_STYLE, EMAIL_STYLE, PHONE_STYLE } from '../../../src/utils/constant';
import { DtoErrMsg } from '../../../src/utils/enumError';
import { DateLocale } from '../../classes/common/date-locale';

export class ProfileCheck {
    private _data:Partial<IMember>;
    private _error:any;
    private myDate = new DateLocale();
    constructor(memberPutProfile:MemberPutProfileRequestDto){
        const memberProfile:Partial<IMember> = {};
        const error = {};
        let isErrorOccur = false;
        Object.keys(memberPutProfile).forEach((key) => {
            if (memberPutProfile[key] && key !== 'verificationCode') {
                if (key == 'handicap') {
                    memberProfile[key] = typeof memberPutProfile[key] !== 'number' ? Number(memberPutProfile[key]) : memberPutProfile[key];
                } else {
                    if (key== 'birthDate') {
                        if (!DATE_STYLE.test(memberPutProfile[key])) {
                            // throw new Error(`Invalid date format for ${key}. Expected formats: YYYY-MM-DD or YYYY/MM/DD`);
                            isErrorOccur = true;
                            error[key]= {
                                'stylecheck': DtoErrMsg.DATE_STYLE_ERROR,
                                value: memberPutProfile[key], 
                            }
                        } else {
                            memberProfile.birthMonth = this.myDate.getBirthMonth(memberPutProfile[key]);
                            memberPutProfile[key] = this.myDate.toDateString(memberPutProfile[key]);
                        }
                    } else if (key== 'phone') {
                        if (!PHONE_STYLE.test(memberPutProfile[key])) {
                            isErrorOccur = true;
                            error[key] = {
                                'stylecheck' : DtoErrMsg.PHONE_STYLE_ERROR,
                                value: memberPutProfile[key], 
                            }
                        }  
                    } else if (key == 'email') {
                        if (!EMAIL_STYLE.test(memberPutProfile[key])) {
                            isErrorOccur = true;
                            error[key] = {
                                'stylecheck' : DtoErrMsg.EMAIL_STYLE_ERROR,
                                value: memberPutProfile[key], 
                            }
                        }
                    }
                    memberProfile[key] = memberPutProfile[key];
                }
            }
        });
        this._error = isErrorOccur ? error : isErrorOccur;
        this._data = memberProfile;
    }
    get Data() {
        return this._data;
    }
    get Error() {
        return this._error;
    }
}