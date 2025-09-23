import { registerAs } from "@nestjs/config";

export default registerAs('mongo', () => {
    let username = process.env.MONGO_USER;
    let password = process.env.MONGO_PASS;
    let resource = process.env.MONGO_HOST;
    let port =process.env.MONGO_PORT;
    let rpSet = process.env.MONGO_REPLICA_SET;
    if (process.env.IS_OFFLINE) {
        username = process.env.LMONGO_USER;
        password = process.env.LMONGO_PASS;
        resource = process.env.LMONGO_HOST;
        port =process.env.LMONGO_PORT;
        rpSet = process.env.LMONGO_REPLICA_SET;        
    }
    const hosts = resource.split(',').map((h) => `${h}:${port}`).join(',')
    const encodePassword = encodeURIComponent(password);
    //const uri = `mongodb://${username}:${encodePassword}@${resource}:${port}/?retryWrites=true&w=majority&replicaSet=${rpSet}`;
    const uri = `mongodb://${username}:${encodePassword}@${hosts}/?retryWrites=true&w=majority&replicaSet=${rpSet}&authSource=admin`;
    //mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    console.log(uri)
    return {username, password, resource, uri};
});