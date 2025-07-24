import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EventNewsOp } from '../classes/eventnews/event-news-op';
import { FuncWithTryCatch } from '../classes/common/func.def';
import { EventNews, EventNewsDocument } from '../dto/schemas/event-news.schema';
import { EventNewsQueryRequest } from '../dto/eventnews/event-news-query-request.dto';
import { DateWithLeadingZeros } from '../utils/common';

@Injectable()
export class EventNewsService {
    private dbOP:EventNewsOp<EventNewsDocument>;
    constructor(@InjectModel(EventNews.name) private readonly modelEN:Model<EventNewsDocument>){
        this.dbOP = new EventNewsOp(modelEN);
    }

    async list(query:EventNewsQueryRequest) {
        const filter:FilterQuery<EventNewsDocument> = {
            isDeleted: false,
        }
        if (query.dateEnd && query.dateEnd) {
            filter.$and = [
                {dateStart: { $gte: query.dateStart}},
                {dateEnd: { $lte: query.dateEnd }},
            ]
        } else if (query.dateStart) {
            filter.dateStart = query.dateStart;
        } else if (query.dateEnd) {
            filter.dateEnd = query.dateEnd;
        } else {
            filter.dateStart = { $gte: DateWithLeadingZeros() };
        }
        return FuncWithTryCatch(this.dbOP.list, filter);
    }

    async findOne(id: string) {
        return FuncWithTryCatch(this.dbOP.findOne, id);
    }
}