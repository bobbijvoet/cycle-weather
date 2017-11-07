const request = require('request');

/**
* A basic Hello World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/


module.exports = (name = 'world', context, callback) => {

    request('https://api.darksky.net/forecast/27241d6e886644e874d3c4010c324dc5/52.3594,4.9255?lang=nl&exclude=[currently,minutely,alert,flags]', function (error, response, body) {
        const data = JSON.parse(body);

        data.hourly.data.forEach((block)=> {
            console.log(new Date(block.time * 1000).toISOString(), block.precipProbability);
        });
        callback(null, JSON.stringify(data.hourly.summary));

    });

};
