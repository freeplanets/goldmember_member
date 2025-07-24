import { Model } from 'mongoose';
import { v1 as uuidv1 } from 'uuid';
import { IHasId } from '../../dto/interface/common.if';
import { asyncfunc } from '../common/func.def';
import { ADbBasicMethods } from '../common/db-basic-methods';

export class EventNewsOp<T extends IHasId> extends ADbBasicMethods<T> {
    constructor(private readonly model:Model<T>) {
        super();
    }
    add:asyncfunc = async (params:any) => { // (obj: Partial<T>) => {
        const [ obj ]= params;
        console.log('add before check id:', obj);
        if (!obj.id) obj.id = uuidv1();
        console.log('add:', obj);
        return this.model.create(obj);    
    }
    // async add(comRes:ICommonResponse<T>, obj: Partial<T>): Promise<any> {
    //     if (!obj.id) obj.id = uuidv1()
    //     comRes.data = await this.model.create(obj);
    //     return comRes;
    // }

    modify:asyncfunc = async(params:any) => { // ( id: string, obj: Partial<T>): Promise<UpdateWriteOpResult> => {
        const [id, obj] = params;
        const ans =  await this.model.updateOne({id}, obj);
        console.log('EventNewsOp modify:', ans);
        return ans;
    }

    list:asyncfunc = async (params:any): Promise<T[]> => {
        const [filter]=  params;
        return this.model.find(filter);
    }

    findOne:asyncfunc = async (params:any): Promise<T> => {
        const [id] = params;
        return this.model.findOne({id});
    }


}