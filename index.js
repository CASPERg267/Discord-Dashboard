const {resolve} = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const DiscordOauth2 = require("discord-oauth2");

class DiscordDashboard {
    constructor(settings) {
        this.settings = settings;

        this.client = null;
        this.discordJSClient = settings.discordJSClient;

        this.options = {};

        this.getFiles = async (dir) => {
            const dirents = await readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent) => {
                const res = resolve(dir, dirent.name);
                return dirent.isDirectory() ? this.getFiles(res) : res;
            }));
            return files.flat();
        }

        this.getDirs = (dir) => fs.readdirSync(dir);
    }

    integrateClient = (client) => this.client = client;

    createServer = async () => {
        const { OAuth2Client, optionsFolder, clientUrl, serverUrl, tokenStore, discordJSClient, optionsReferences } = this.settings;

        let fastify = require('fastify')({ logger: false });
        const oauth = new DiscordOauth2({
            clientId: OAuth2Client.id,
            clientSecret: OAuth2Client.secret,
            redirectUri: `${serverUrl}/api/auth`,
        });
        fastify.uuidv4 = uuidv4;
        fastify.oauth = oauth;
        fastify.discordJSClient = discordJSClient;
        let {buildPath, build} = this.client || {};

        const oauthPlugin = require('@fastify/oauth2');

        fastify.register(require('@fastify/cors'), {
            origin: (o, cb) => {
                if(!o)return cb(null, true);
                const {origin, href} = new URL(o);
                if(origin == clientUrl || href == clientUrl){
                    cb(null, true)
                    return
                }
                cb(new Error(`Discord-Dashboard API: Origin not allowed. If you are using ports 80/443 with Client, please do not specify them in the clientUrl.`));
            }
        });

        fastify.register(oauthPlugin, {
            name: 'DiscordOAuth2',
            scope: OAuth2Client.scopes || ['email', 'guilds', 'guilds.join', 'identify'],
            credentials: {
                client: {
                    id: OAuth2Client.id,
                    secret: OAuth2Client.secret,
                },
                auth: oauthPlugin.DISCORD_CONFIGURATION
            },
            startRedirectPath: '/api/auth/gen',
            callbackUri: `${serverUrl}/api/auth`,
        });

        const SettingsFolders = this.getDirs(optionsFolder);
        for(const SettingsCategory of SettingsFolders){
            const CategoryOptions = await this.getFiles(`${optionsFolder}/${SettingsCategory}`);
            for(const Option of CategoryOptions){
                if(!this.options[SettingsCategory])this.options[SettingsCategory] = {id: SettingsCategory.toLowerCase(), name: SettingsCategory, options: []};
                this.options[SettingsCategory].options.push(require(Option));
            }
        }

        this.options = Object.values(this.options);

        const APIEndpoints = await this.getFiles(__dirname+'/API');
        for(const Endpoint of APIEndpoints){
            require(Endpoint)({fastify,settings:this.settings,options:this.options,optionsReferences});
        }

        if(this.client){
            await build();
            fastify.register(require('fastify-static'), {
                root: buildPath,
                prefix: '/',
            });

            fastify.setNotFoundHandler(function (req, reply) {
                const bufferIndexHtml = fs.readFileSync(buildPath+'/index.html');
                reply.type('text/html').send(bufferIndexHtml);
            });
        }else{
            fastify.setNotFoundHandler(function (req, reply) {
                reply.code(404).send({ error: 'Not Found', message: 'Four Oh Four 🤷‍♂️', statusCode: 404 });
            });
        }

        await fastify.listen(80);
    }
}

module.exports = {
    Dashboard: DiscordDashboard,
    TokenStores: require('./TokenStores/index'),
    OptionTypes: require('./OptionTypes/index'),
};
