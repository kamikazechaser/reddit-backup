exports = module.exports = { init }

const asyc = require("async");
const Pino = require("pino");
const req = require("request-promise-native");

const logger = Pino({ prettyPrint: true });

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

        if (redditResponse.errors.length >= 1) {
            return logger.error(new Error(redditResponse.errors));
        }
        return startDownloadQueue({ session: redditResponse.data.cookie, choices: opts.backupChoices })
    }).catch(error => {
        return logger.error(new Error(error));
    });
}

function startDownloadQueue(session, done) {
    async.eachSeries(session.choices, (item, callback) => {
        paginatedRequest(item, completed => {
            logger.info(completed);
            return callback();
        })
    }, queueCompleted => {
        logger.info("Backup complete!");
    });
}

function paginatedRequest(choiceType, callback) {
    // recurse request
}