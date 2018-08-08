const inquirer = require("inquirer");

const flow = require("./lib/flow");
const processor = require("./lib/processor");

inquirer.prompt(flow.cliFlow).then(cliRes => {
    return processor.init(cliRes);
});