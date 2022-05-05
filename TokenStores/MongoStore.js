const mongoose = require('mongoose');

class MongoStore {
    constructor(url, modelName='DiscordDashboardTokensStore') {
        const conn = mongoose.createConnection(url);

        const TokenStore = conn.model(modelName, new mongoose.Schema({
            key: {
                type: String,
                unique: true,
            },
            data: {
                type: String,
            }
        }));

        this.TokenStore = TokenStore;
    }

    set = async (key, data) => {
        const Token = await this.TokenStore.findOne({key});
        if(Token){
            await Token.updateOne({data: JSON.stringify(data)});
        }else{
            await this.TokenStore.create({key,data: JSON.stringify(data)}).catch(err=>console.log(err))
        }
        return true;
    }

    get = async (keyDb) => {
        let Token = await this.TokenStore.findOne({key:keyDb});
        if(!Token)return null;
        let {data} = Token;
        data = JSON.parse(data);
        return data;
    }

    delete = async (key) => {
        const Token = await this.TokenStore.findOne({key});
        if(!Token)return true;
        await this.TokenStore.findOneAndDelete({key});
        return true;
    }
}

module.exports = MongoStore;
