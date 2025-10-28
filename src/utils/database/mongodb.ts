import mongoose from "mongoose";

export const getDbUri = ():string => {
    let username = process.env.MONGO_USER;
    let password = process.env.MONGO_PASS;
    let resource = process.env.MONGO_HOST;
    let port =process.env.MONGO_PORT;
    let rpSet = process.env.MONGO_REPLICA_SET;
    let appname = process.env.MONGO_APPNAME
    let hosts = resource.split(',').map((h) => `${h}:${port}`).join(',');
    let encodePassword = encodeURIComponent(password);
    let uri = `mongodb://${username}:${encodePassword}@${hosts}/?retryWrites=true&w=majority&replicaSet=${rpSet}&authSource=admin`;
    if (process.env.IS_OFFLINE) {
        username = process.env.LMONGO_USER;
        password = process.env.LMONGO_PASS;
        resource = process.env.LMONGO_HOST;
        port =process.env.LMONGO_PORT;
        rpSet = process.env.LMONGO_REPLICA_SET;
        appname = process.env.LMONGO_APPNAME;
        encodePassword = encodeURIComponent(password);
        hosts = resource;
        uri = `mongodb+srv://${username}:${encodePassword}@${hosts}/?retryWrites=true&w=majority&appName=${appname}`;
    }
    console.log(uri)
    //return `mongodb://${username}:${encodePassword}@${resource}:${port}/?retryWrites=true&w=majority&replicaSet=${rpSet}`;
    return uri;
}
export const getMongoDB = async ():Promise<mongoose.Mongoose> => {
    const uri = getDbUri();
    let dbase = process.env.MONGO_DB;
    if (process.env.IS_OFFLINE) dbase = process.env.LMONGO_DB;
    const opt:mongoose.ConnectOptions = {
        dbName: dbase,
        directConnection: !process.env.IS_OFFLINE,
        connectTimeoutMS: 5000,
    }
    return mongoose.connect(uri, opt);
}