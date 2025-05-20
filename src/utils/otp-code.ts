import { authenticator } from "otplib";
import * as qrcode from "qrcode";

declare type SecretKey = string;

interface VerifyOptions {
    token: string;
    secret: SecretKey;
}

export class OtpCode {
    getTotpCode(secret:string, appName:string, username:string) {
        const keyuri = authenticator.keyuri(
            encodeURIComponent(username), 
            encodeURIComponent(appName), 
            secret,
        );
        return keyuri;
    }
    async getImg(secret:string, appName:string, username:string) {
        const otpauth = this.getTotpCode(secret, appName, username);
        return qrcode.toDataURL(otpauth);

        // return new Promise((resolve, reject) => {
        //     const otpauth = this.getTotpCode(secret, appName, username);
        //     qrcode.toDataURL(otpauth, (err:any, imageUrl:string) => {
        //         if (err) {
        //             console.log('Otp getImag Error:', err);
        //             //return false;
        //             //resolve(false);
        //             reject(err);
        //         }
        //         console.log('imageurl:', imageUrl);
        //         resolve(imageUrl);
        //         // return imageUrl;
        //     });
        // })
    }
    getToken(secret:string):string {
        authenticator.options = {step: 60};
        // console.log('getToken', authenticator.allOptions());
        return authenticator.generate(secret);
    }
    verify(totpCode:string, secret:string):boolean {
        // console.log(typeof(totpCode), typeof(secret), totpCode, secret);
        const opts:VerifyOptions = {
            token: totpCode,
            secret: secret,
        }
        return authenticator.verify(opts);
    }
    get SecretCode(): string {
        const str: string[] = [];
        while (str.length < 17) {
          const s = String.fromCharCode(this.Random);
          if (str.indexOf(s) < 0) {
            str.push(s);
          }
        }
        return str.join("");
    }
    get Random() {
        // 48-57 => 0-9
        // 65-90 => A-Z
        const min = 65;
        const max = 90;
        let rnd = 0;
        do {
            rnd = this.myRandom(min, max);
        } while (rnd > 57 && rnd < 65);
        return rnd;
    }
    public myRandom(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}