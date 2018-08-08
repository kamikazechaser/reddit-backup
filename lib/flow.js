exports = module.exports = {
    cliFlow: [{
        type: "input",
        name: "redditUsername",
        message: "Enter your Reddit username"
    }, {
        type: "password",
        name: "redditPassword",
        message: "Enter your Reddit password",
        mask: "*"
    }, {
        type: "checkbox",
        name: "backupChoices",
        message: "Select what to backup",
        choices: [{
                name: "submitted"
            },
            {
                name: "saved"
            },
            {
                name: "hidden"
            },
            {
                name: "upvoted"
            },
            {
                name: "downvoted"
            },
            {
                name: "gilded"
            }
        ],
        validate: function(answer) {
            if (answer.length < 1) {
                return "You must select atleast 1 choice"
            }
            return true;
        }
    }]
}