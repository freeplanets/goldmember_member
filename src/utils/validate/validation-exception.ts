import { BadRequestException } from "@nestjs/common";
import { isObject, ValidationError } from "class-validator";
import { ErrCode } from "../enumError";
import { IValidationError } from "./validation-if";
import { CommonResponseDto } from "../../dto/common/common-response.dto";

export const ValidationException = (errors: ValidationError[]) => {
    // const newErrors:Record<string, unknown> = {
    //     errorcode: ErrCode.ERROR_PARAMETER,
    // };
    // console.log('ValidationException:', errors);
    const newErrors:CommonResponseDto = new CommonResponseDto();
    newErrors.ErrorCode = ErrCode.ERROR_PARAMETER;
    const extra = {};
    const err_msgs:string[] = [];
    Object.keys(errors).forEach((key) => {
        // console.log('errors key:', key);
        if (isObject(errors[key])) {
            // extra[key] = errors[key]; 
            // console.log(`errors[${key}]`, errors[key]);
            const obj= errors[key] as IValidationError;
            extra[obj.property] = { ...obj.constraints };
            extra[obj.property].value = obj.value;
            //if (extra[obj.property].matches) {
            console.log('obj.constraints:', obj.constraints);
            if (isObject(obj.constraints)) {
                Object.keys(obj.constraints).forEach((key) => {
                    if (obj.constraints[key]) {
                        //newErrors.error.message = obj.constraints[key];
                        err_msgs.push(obj.constraints[key]);
                    }
                });
            }   
            //}
        }
    })
    if (err_msgs.length>0) {
       newErrors.error.message = err_msgs.join(',');
    }
    // console.log(extra);
    newErrors.error.extra = extra;
    //BadRequestException(objectOrError?: string | object | any, descriptionOrOptions?: string | HttpExceptionOptions)
    return new BadRequestException(newErrors);
}


