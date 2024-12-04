const Data = require("../models/dataModel");

let data = new Data();

async function getViewGroups(req, res) {
    let groupProperties = await data.getAllGroups();
    res.render("../views/pages/view-groups", { groups: groupProperties })
}

async function getUploadGroup(req, res) {
    res.render("../views/pages/data-upload", { 
        correct: true, 
        message: "", 
        formData: { 
            type: "", 
            date: "", 
            name: "",
            group : "",
            participants: "" 
        } 
    });
}

async function postUploadGroup(req, res) {
    const type = req.body.type;
    const date = req.body.date;
    const name = req.body.name;
    const group = req.body.group;
    const participants = req.body.participants;
    console.log("postUploadGroup controlller, params: ", {type, date, name, group, participants})

    const correct = await data.validateUpload(type, date, name, group, participants);
    if(correct == "") {
        const success = await data.createNewGroup(type, date, name, group, participants);
        res.redirect("/data/view-groups");
    } else {
        res.render("../views/pages/data-upload", { correct: false, message: correct, formData: { type, date, name, group, participants }  });
    }
}


module.exports = {
    getViewGroups: getViewGroups,
    getUploadGroup: getUploadGroup,
    postUploadGroup: postUploadGroup
}