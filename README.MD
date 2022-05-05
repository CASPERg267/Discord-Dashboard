# DBD v3 BETA (v3.0.0-beta.0)

## Install:

```js
npm i discord-dashboard discord-dashboard-reactclient
```

or

```js
yarn add discord-dashboard discord-dashboard-reactclient
```

## Example Usage:

```js
const DBD = require('discord-dashboard');
const DBD_RC = require('discord-dashboard-reactclient');

const {Client, Intents} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const OAuth2AndUrls = {
   OAuth2Client: {
       id: '#',
       secret: '#',
   },
   serverUrl: 'http://localhost',
   clientUrl: 'http://localhost',
}

const Dashboard = new DBD.Dashboard({
   ...OAuth2AndUrls,
   discordJSClient: client,
   optionsFolder: `${__dirname}/DashboardOptions`,
   optionsReferences: {
      exampleRef: null,
   },
   tokenStore: new DBD.TokenStores.MongoStore('mongo url'),
});

const DBD_Client = new DBD_RC({
   ...OAuth2AndUrls,
   websiteName: 'Assistants Center',
});

Dashboard.integrateClient(DBD_Client);

client.login('bot client token').then(()=>{
   Dashboard.createServer();
});

```

© 2020-2022 Assistants Center, All rights reserved
