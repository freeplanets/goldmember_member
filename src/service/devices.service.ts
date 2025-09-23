import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Member, MemberDocument } from "../dto/schemas/member.schema";
import { IMember } from "../dto/interface/member.if";
import { DevicesResponse } from "../dto/devices/devices-response";
import { ErrCode } from "../utils/enumError";
import { CommonResponseDto } from "../dto/common/common-response.dto";

@Injectable()
export class DevicesService {
    constructor(@InjectModel(Member.name) private readonly modelMember:Model<MemberDocument>){}
    async getDevices(user:Partial<IMember>):Promise<DevicesResponse> {
        const devRes = new DevicesResponse();
        try {
            const mbr = await this.modelMember.findOne({id: user.id}, 'devices');
            if (mbr) {
                devRes.data = mbr.devices;
            }
        } catch (e) {
            console.log("getDevices Error:", e);
            devRes.ErrorCode = ErrCode.ERROR_PARAMETER;
            devRes.error.extra = e;
        }
        return devRes;
    }
    async delDevice(user:Partial<IMember>, deviceId:string):Promise<CommonResponseDto> {
        const comRes = new CommonResponseDto();
        try {
            const mbr = await this.modelMember.findOne({id: user.id}, 'devices');
            if (mbr.devices && mbr.devices.length > 0) {
                const devices = mbr.devices;
                const newList = [];
                devices.forEach((itm) => {
                    if (itm.deviceId !== deviceId) {
                        newList.push(itm);
                    }
                });
                const upd = await this.modelMember.updateOne({id: user.id}, {devices: newList});
                console.log('delDevice upd:', upd);
            }
        } catch (e) {
            console.log("getDevices Error:", e);
            comRes.ErrorCode = ErrCode.ERROR_PARAMETER;
            comRes.error.extra = e;            
        }
        return comRes;
    }
}