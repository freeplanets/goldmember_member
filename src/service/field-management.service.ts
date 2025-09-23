import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GreenSpeeds, GreenSpeedsDocument } from '../dto/schemas/green-speeds.schema';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { GreenSpeedsOp } from '../classes/field-management/green-speeds-op';

@Injectable()
export class FieldManagementService {
    private gsOP:GreenSpeedsOp;
    constructor(@InjectModel(GreenSpeeds.name) private readonly modelGS:Model<GreenSpeedsDocument>) {
        this.gsOP = new GreenSpeedsOp(modelGS);
    }

    async getGreenSpeeds(dates:DateRangeQueryReqDto) {
        return FuncWithTryCatchNew(this.gsOP, 'list', dates.startDate, dates.endDate);
    }    
}