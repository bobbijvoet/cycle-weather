const request = require('request');
const send = require('../helpers/send.js');
const lib = require('lib');


/**
 * A Weather SMS function
 * @returns {string}
 */
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

module.exports = (context, callback) => {

    request(`https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/52.3594,4.9255?lang=nl&exclude=[currently,minutely,alert,flags]`, function (error, response, body) {
        const data = JSON.parse(body);

        const percipData = data.hourly.data.map((block) => {
            //Local hours
            const blockHour = new Date(block.time * 1000).getHours() - new Date().getTimezoneOffset() / 60;

            //Check if today
            if (new Date(block.time * 1000).getDay() !== new Date().getDay()) {
                return;
            }

            //Check if between 8:00 to 10:00 and 17:00 to 19:00
            if ((blockHour >= 8 && blockHour <= 10) || (blockHour >= 17 && blockHour <= 19)) {
                return {
                    time: block.time,
                    precipProbability: block.precipProbability * 100
                }
            }
        }).filter(value => !!value);

        const percipMessage = percipData.map((block) => {
            return (`${weekdays[new Date(block.time * 1000).getDay()]} ${new Date(block.time * 1000).getHours() - new Date().getTimezoneOffset() / 60}h : ${block.precipProbability.toFixed()}%`);
        });

        send(
            process.env.RECIPIENT_NUMBER,
            percipMessage.join('\n'),
            null,
            (err, result) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, {status: 'sent', message: percipMessage.join('\n'), tel: process.env.RECIPIENT_NUMBER});
            }
        );

    });
};
