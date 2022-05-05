const fs = require('fs');
const files = fs.readdirSync(`${__dirname}/Types`);

// That's only BETA solution

let OptionTypes = {};
for(const Type of files){
    OptionTypes[Type.replace('.js','')] = require(`./Types/${Type.replace('.js','')}`);
}

module.exports = OptionTypes;
