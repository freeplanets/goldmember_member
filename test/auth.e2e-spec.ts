import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../src/module/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MemberModule } from '../src/module/member.module';
import { INestApplication } from '@nestjs/common';
import { AuthRequestDto } from '../src/dto/auth/auth-request.dto';
import { DeviceRefreshTokenDto } from '../src/dto/auth/auth-device-refresh-token-request.dto';
import { DevicesModule } from '../src/module/devices.module';
//import { User } from '../src/schemas/user.schema';

describe('AuthService (e2e)', () => {
    let app:INestApplication;
    // let memberModel: Model<Member>
    const jwt= new JwtService();
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
                JwtModule.register({
                    secret: process.env.API_KEY,
                    signOptions: {
                        expiresIn: '5m',
                    },
                }),
                AuthModule, MemberModule, DevicesModule
            ],
        }).compile();
        app = module.createNestApplication()
        await app.init();
        //service = module.get<AuthService>(AuthService);
        //memberModel = module.get<Model<Member>>(getModelToken(Member.name));
    });
    let token = '';
    let refreshToken = '';
    let deviceRefreshToken = '';
    it('/auth (POST)', async () => {
        const auth:AuthRequestDto = {
            phone: '0936962772#246',
            password: 'Abc12345',
            fingerprint: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWl2Y2VCcmFuZCI6IkFwcGxlIiwiZGV2aWNlTW9kZWwiOiJpUGhvbmUiLCJkZXZpY2VOYW1lIjoiQXBwbGUgaVBob25lIFNhZmFyaSIsImRldmljZUlkIjoiMWRjYTMxNTktNDY1YS00OGRlLWIyNDgtOTcwNmUxNzY2MDAxIiwic3lzdGVtTmFtZSI6IlNhZmFyaSIsInN5c3RlbVZlcnNpb24iOiIxNi42IiwiaWF0IjoxNzQ1ODIxOTkxLCJleHAiOjE3NTM1OTc5OTF9.zWcvUuBLdVUtDnrCbtpsrgFqdza4qk5SGSRo7cxYPB0'
        };
        return request(app.getHttpServer()).post('/auth').send(auth).expect(res=>{
            console.log("/auth (POST) res:", res.body);
            token = res.body.data.token;
            refreshToken = res.body.data.refreshToken;
            deviceRefreshToken = res.body.data.deviceRefreshToken;
            expect(res.body).toHaveProperty('data');
            if (res.body.data) {
                expect(res.body.data).toHaveProperty('token');
                expect(res.body.data).toHaveProperty('refreshToken');
                expect(res.body.data).toHaveProperty('deviceRefreshToken');
            }
        })
    });
    it('/auth/deviceRefreshToken POST', async ()=> {
        const device = new DeviceRefreshTokenDto();
        device.deviceId = '1dca3159-465a-48de-b248-9706e1766001';
        return request(app.getHttpServer())
        .post('/auth/deviceRefreshToken')
        .set('Authorization', `Bearer ${deviceRefreshToken}`)
        .send(device)
        .expect((res) => {
            console.log("res:", res.body);
            token = res.body.data.token;
            refreshToken = res.body.data.refreshToken;
            deviceRefreshToken = res.body.data.deviceRefreshToken;
            expect(res.body).toHaveProperty('data');
            if (res.body.data) {
                expect(res.body.data).toHaveProperty('token');
                expect(res.body.data).toHaveProperty('refreshToken');
                expect(res.body.data).toHaveProperty('deviceRefreshToken');
            }            
        });
    });
    it('/devices GET', async () => {
        return request(app.getHttpServer())
        .get('/devices').set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
            console.log('devices', res.body);
            expect(res.body).toHaveProperty('data');
        })
    });
    it('/devices/:deviceId DELETE', async () => {
        const deviceId = '1dca3159-465a-48de-b248-9706e1766001';
        return request(app.getHttpServer())
        .delete(`/devices/${deviceId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
            console.log("del device", res.body);
            expect(res.body.errorcode).toBeUndefined();
        })
    })
    // it('/member/profile/{id} (PUT)', () => {
    //     const FormData = require('form-data');
    //     const profile = new FormData();
    //     profile.append('email', 'aaa.bbb.ccc');
    //     profile.append('birthDate', '2002-02-02');

    //     console.log("token:", token);
    //     try {
    //         const decodedToken = jwt.decode(token) as Partial<IMember>;
    //         if (!decodedToken || !decodedToken.id) {
    //             throw new Error('Invalid token: Missing member ID');
    //         }
    //         const url = `/member/profile/${decodedToken.id}`;
    //         console.log('member & url', url, decodedToken);
    //         return request(app.getHttpServer())
    //         .put(url)
    //         .set('Authorization', `Bearer ${token}`)
    //         .set('Content-Type', 'multipart/form-data')
    //         .send(profile.getBuffer())
    //         .set(profile.getHeaders())
    //         .expect((res) => {
    //             console.log("profile:", res.body.error.extra);
    //             expect(res.body).toBeDefined();
    //             expect(res.body.errorcode).toBe(ErrCode.ERROR_PARAMETER);
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // })
    // it('/member/profile/{id} (PUT)', () => {
    //     const FormData = require('form-data');
    //     const profile = new FormData();
    //     profile.append('email', 'aaa@bbb.ccc');
    //     profile.append('birthDate', '2002/04/05');

    //     console.log("token:", token);
    //     try {
    //         const decodedToken = jwt.decode(token) as Partial<IMember>;
    //         if (!decodedToken || !decodedToken.id) {
    //             throw new Error('Invalid token: Missing member ID');
    //         }
    //         const url = `/member/profile/${decodedToken.id}`;
    //         console.log('member & url', url, decodedToken);
    //         return request(app.getHttpServer())
    //         .put(url)
    //         .set('Authorization', `Bearer ${token}`)
    //         .set('Content-Type', 'multipart/form-data')
    //         .send(profile.getBuffer())
    //         .set(profile.getHeaders())
    //         .expect((res) => {
    //             console.log("profile:", res.body);
    //             expect(res.body).toBeDefined();
    //             expect(res.body.errorcode).toBeUndefined();
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // })
    afterAll(async () => {
        console.log('close app');
        await app.close();
    });
});