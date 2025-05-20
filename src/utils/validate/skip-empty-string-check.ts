import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class SkipEmptyStringCheckPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        console.log('sescp:', value);
        if (typeof value === 'string' && value.trim() === '') {
            // throw new BadRequestException('Empty strings are not allowed');
            return undefined;
        }
        return value;
    }
}