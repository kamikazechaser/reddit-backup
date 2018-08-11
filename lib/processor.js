exports = module.exports = { init }

const _ = require("lodash");
const async = require("async");
const fs = require("fs");
const Pino = require("pino");
const RateLimiter = require("limiter").RateLimiter;
const req = require("request-promise-native");

const limiter = new RateLimiter(1, 1500);
const logger = Pino({ prettyPrint: true });

const writeableStream = fs.createWriteStream("backup.json");

function init(opts) {
    const baseUrl = `https://old.reddit.com/api/login/${opts.redditUsername}`;
    const formData = {
        api_type: "json",
        op: "login-main",
        passwd: opts.redditPassword,
        user: opts.redditUsername
    };

    req.post({ uri: baseUrl, form: formData }).then(res => {
        const redditResponse = JSON.parse(res).json;

        if (redditResponse.errors.length >= 1) return logger.error(new Error(redditResponse.errors));

        const sessionObject = {};
        sessionObject.cookie = redditResponse.data.cookie;
        sessionObject.username = opts.redditUsername;

        return startDownloadQueue({ session: sessionObject, choices: opts.backupChoices });
    }).catch(error => {
        return logger.error(new Error(error));
    });
}

function startDownloadQueue(inputObject, done) {
    async.eachSeries(inputObject.choices, (item, callback) => {
        paginatedRequest(item, inputObject.session, "", (completed) => callback());
    }, queueCompleted => {
        return writeableStream.end();
    });
}

function paginatedRequest(choiceType, sessionData, pageNo, done) {
    const requestOptions = {
        uri: `https://www.reddit.com/user/${sessionData.username}/${choiceType}/.json?after=${pageNo}`,
        headers: {
            "Cookie": `reddit_session=${sessionData.cookie}`
        },
        json: true
    };

    req.get(requestOptions).then(response => {
        const pageId = response.data.after;

        if (pageId !== null) logger.info(`=> processing ${choiceType} : [${pageId}]`);
        else logger.info(`=> completed processing ${choiceType}`);

        _.forEach(response.data.children, data => writeableStream.write(JSON.stringify({ choice: choiceType, data: data })));

        if (pageId !== null) limiter.removeTokens(1, () => paginatedRequest(choiceType, sessionData, pageId, done));
        else return done(true);
    }).catch(error => {
        return logger.error(new Error(error));
    });
}