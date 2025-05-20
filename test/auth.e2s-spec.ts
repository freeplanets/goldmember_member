import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/service/auth.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Member, MemberDcoument, MemberSchema } from '../src/dto/schemas/member.schema';
import { AuthModule } from '../src/module/auth.module';
import { TempData, TempDataSchema } from '../src/dto/schemas/tempdata.schema';
import { JwtModule } from '@nestjs/jwt';
import { ErrCode } from '../src/utils/enumError';
import { AuthSMSRequestDto } from '../src/dto/auth/auth-sms-request.dto';
import { AuthResetPasswordDto } from '../src/dto/auth/auth-resetpassword.dto';
import { MemberRegisterRequestDto } from '../src/dto/member/member-register-request.dto';
import { Model } from 'mongoose';
import { SmsCodeUsage } from '../src/utils/enum';
//import { User } from '../src/schemas/user.schema';

describe('AuthService (e2e)', () => {
    let service: AuthService;
    let memberModel: Model<Member>
    const username = process.env.LMONGO_USER;
    const password = process.env.LMONGO_PASS;
    const resource = process.env.LMONGO_HOST;
    const port =process.env.LMONGO_PORT;
    const rpSet = process.env.LMONGO_REPLICA_SET;
    //const dbase = process.env.LMONGO_DB
    const encodePassword = encodeURIComponent(password);
    const uri = `mongodb://${username}:${encodePassword}@${resource}:${port}/?retryWrites=true&w=majority&replicaSet=${rpSet}`;
    console.log('uri:', uri);
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                // ConfigModule.forRoot({
                //     load: [mongoConfig],
                // }),
                MongooseModule.forRoot(uri, {
                    dbName: process.env.LMONGO_DB,
                    directConnection: true,
                    connectTimeoutMS: 5000,
                }),
                MongooseModule.forFeature([
                    { name: Member.name, schema: MemberSchema },
                    { name: TempData.name, schema: TempDataSchema },
                ]),
                JwtModule.register({
                    secret: process.env.API_KEY,
                    signOptions: {
                        expiresIn: '5m',
                    },
                }),
                AuthModule,
            ],
            providers: [
                AuthService,
                // {
                //     provide: getModelToken('User'),
                //     useValue: {
                //         findOne: jest.fn(),
                //         create: jest.fn(),
                //     },
                // },
                // {
                //     provide: uri,
                //     useValue: {
                //         dbName: dbase,
                //         directConnection: true,
                //         connectTimeoutMS: 5000,
                //     }, // Mock database connection
                // },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        memberModel = module.get<Model<Member>>(getModelToken(Member.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a valid token', async () => {
        const token = await service.auth({ phone: '0936962772', password: 'Abc12345', fingerprint: '' }, '::1');
        // console.log('token:', token);
        expect(token).toBeDefined();
        expect(typeof token.data.token).toBe('string');
        expect(typeof token.data.refreshToken).toBe('string');
    });

    it('should return account error', async () => {
        const authRequestDto = {
            phone: '0936962771',
            password: 'wrong-password',
            fingerprint: '',
        };
        const result = await service.auth(authRequestDto, '::1');
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.ACCOUNT_OR_PASSWORD_ERROR);
    });

    it('should throw password error', async () => {
        const authRequestDto = {
            phone: '0936962772',
            password: 'wrong-password',
            fingerprint: '',
        };
        const result = await service.auth(authRequestDto, '::1');
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.ACCOUNT_OR_PASSWORD_ERROR);
    });

    let captcha: string;
    let captchaId: string;
    it('should return a valid captcha', async () => {
        const verifyRes = await service.getCaptcha(true);
        // console.log('verifyRes:', verifyRes);
        expect(verifyRes).toBeDefined();
        expect(typeof verifyRes.data.captchaId).toBe('string');
        captcha = verifyRes.error.extra;
        captchaId = verifyRes.data.captchaId;
        console.log('captcha:', captcha, 'captchaId:', captchaId);
    });
    let verifyCode:string;
    it('should send sms successfully', async () => {
        const smsReq:AuthSMSRequestDto= {
            phone: '0936962772',
            captchaId: captchaId,
            captchaCode: captcha,
            codeUsage: SmsCodeUsage.RESET_PASS,
        }
        const result = await service.sendSmsCode(smsReq, true);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(undefined);
        verifyCode = result.error.extra;
    });

    it('should throw reset password account error', async () => {
        const authResetPass:AuthResetPasswordDto = {
            phone: '0936962770',
            newPassword: 'Abc12345',
            verificationCode: verifyCode,
        };
        const result = await service.authResetPassword(authResetPass);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.ACCOUNT_OR_PASSWORD_ERROR);
    });

    it('should throw reset password verify code error', async () => {
        const authResetPass:AuthResetPasswordDto = {
            phone: '0936962772',
            newPassword: 'Abc12345',
            verificationCode: '123456',
        };
        const result = await service.authResetPassword(authResetPass);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.VERIFY_CODE_ERROR);
    });

    it('should throw reset password ok', async () => {
        const authResetPass:AuthResetPasswordDto = {
            phone: '0936962772',
            newPassword: 'Abc12345',
            verificationCode: verifyCode,
        };
        const result = await service.authResetPassword(authResetPass);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(undefined);
    });

    it('should throw sms error sms re-access to soon', async () => {
        const verifyRes = await service.getCaptcha(true);
        // console.log('verifyRes:', verifyRes);
        captcha = verifyRes.error.extra;
        captchaId = verifyRes.data.captchaId;
        console.log('captcha:', captcha, 'captchaId:', captchaId);

        const smsReq:AuthSMSRequestDto= {
            phone: '0936962772',
            captchaId: captchaId,
            captchaCode: captcha,
            codeUsage: SmsCodeUsage.RESET_PASS,
        };
        const result = await service.sendSmsCode(smsReq);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.SMS_CODE_TOO_FAST);
    });
    let member:MemberRegisterRequestDto = {
        phone: '0936962772#246',
        password: 'Abc12345',
        name: 'james246',
        email: '',
        birthDate: new Date().toISOString().split('T')[0],
        verificationCode: verifyCode,
        file: undefined
    };

    it('get a valid captcha', async () => {
        const verifyRes = await service.getCaptcha(true);
        expect(verifyRes).toBeDefined();
        expect(typeof verifyRes.data.captchaId).toBe('string');
        captcha = verifyRes.error.extra;
        captchaId = verifyRes.data.captchaId;
        console.log('captcha:', captcha, 'captchaId:', captchaId);
    });
    it('get sms code', async () => {
        const smsReq:AuthSMSRequestDto= {
            phone: member.phone,
            captchaId: captchaId,
            captchaCode: captcha,
            codeUsage: SmsCodeUsage.REGISTER,
        }
        const result = await service.sendSmsCode(smsReq, true);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(undefined);
        verifyCode = result.error.extra;
        console.log('get sms verifyCode:', verifyCode);
    });
    it('get sms re-use captcha error', async () => {
        const smsReq:AuthSMSRequestDto= {
            phone: member.phone,
            captchaId: captchaId,
            captchaCode: captcha,
            codeUsage: SmsCodeUsage.REGISTER,
        }
        const result = await service.sendSmsCode(smsReq, true);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.CAPTCHA_ERROR);
    });

    it('register a new member use wrong verifycode, should throw error', async () => {
        member.verificationCode = '123456';
        const result = await service.memberCreate(member, undefined);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.VERIFY_CODE_ERROR);
        member.verificationCode = verifyCode;
    });

    it('register a new member use wrong number, should throw error', async () => {
        const oldPhone = member.phone;
        member.phone = '0936962770';
        const result = await service.memberCreate(member, undefined);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(ErrCode.PHONE_ERROR);
        member.phone = oldPhone;
    });

    it('register a new member, should success', async () => {
        const rlt = await memberModel.deleteOne({ phone: member.phone });
        console.log('delete member:', rlt);
        const result = await service.memberCreate(member, undefined);
        expect(result).toBeDefined();
        expect(result.errorcode).toBe(undefined);
    });

    // it('should validate a token successfully', async () => {
    //     const token = await service.generateToken({ id: 1, username: 'testuser' });
    //     const isValid = await service.validateToken(token);
    //     expect(isValid).toBeTruthy();
    // });

    // it('should fail to validate an invalid token', async () => {
    //     const isValid = await service.validateToken('invalid-token');
    //     expect(isValid).toBeFalsy();
    // });

    // it('should throw an error for invalid credentials', async () => {
    //     jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

    //     await expect(
    //         service.auth({ phone: 'invalid-phone', password: 'wrong-password' }),
    //     ).rejects.toThrow('Invalid credentials');
    // });
});