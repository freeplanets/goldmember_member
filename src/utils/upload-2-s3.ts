import * as AWS from "aws-sdk";
import { Readable } from "stream";
import { v1 as uuidv1 } from 'uuid';

export class Upload2S3 {
    AWS_S3_BUCKET = 'images.uuss.net/linkougolf';
    private s3 = new AWS.S3({
      region: 'ap-southeast-1',
    });
    async uploadFile(file:Express.Multer.File) {
        console.log('file:', file);
        const { originalname } = file;
        const ary = originalname.split('.');
        const newname = `${uuidv1()}.${ary[ary.length-1]}`;
        file.originalname = newname;
        return await this.s3_upload(
            file.buffer,
            this.AWS_S3_BUCKET,
            file.originalname,
            file.mimetype
        );
    }
    
    private async s3_upload(fileBuffer:Buffer|Uint8Array|Blob|string|Readable, bucket:string, name:string, mimetype:string) {
        const params:AWS.S3.PutObjectRequest = {
            Bucket: bucket,
            Key: String(name),
            Body: fileBuffer,
            // ACL: 'public-read',
            ContentType: mimetype,
            ContentDisposition: 'inline',
        };
        try {
            const s3Response = await this.s3.upload(params).promise();
            return s3Response;
        } catch(err) {
            console.log("S3 Upload Error:", err);
            return false;
        }
    }    
}