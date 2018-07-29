const inquirer = require("inquirer");

const flow = require("./lib/flow");
const processor = require("./lib/processor");

inquirer.prompt(flow.cliFlow).then(cliRes => {
    return processor.init(cliRes);
});

/*req({
    method: "POST",
    uri: `https://old.reddit.com/api/login/${loginDetails.user}`,
    form: loginDetails
}).then(res => {
    const sessionCookie = JSON.parse(res).json.data.cookie
    console.log(sessionCookie);
}).catch(error => {
    console.error(error);
});*/