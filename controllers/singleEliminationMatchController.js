const Match = require("../models/matchModelAlternating");

let currentIndex = 0;
let matchArray = [];
let match;

let date;
let group;

async function getMatches(req, res) {
    date = req.query.date;
    group = req.query.group;

    if (!date || !group) {
        return res.status(400).send("Missing required query parameters: date and group");
    }

    if(match == undefined) 
        match = new Match(date, group)
    const sections = await match.getParticipants()
    res.render("pages/bracket-single-elimination.ejs", { date: date, group: group, sections: sections})
}

async function getNextMatch(req, res) { 
    await match.loadSections()
    let newMatch = await match.getMatch()

    let clientData = newMatch;

    let responseData = {
        message: 'Data received successfully!',
        receivedData: clientData,
        isEnd: false
    };

    if(clientData.length == 4) {
        responseData["message"] += " Bracket Ended.";
        responseData["isEnd"] = true;
    }
    console.log("Client Data (getNextMatch - singleEliminationController): ", responseData);
    res.json(responseData);
}

async function getNextUp(req, res) {
    let data = await match.getNextUp();
    let responseData = {
        message: "Next up data received succesfully!",
        data: data
    };
    console.log("Client data (getNextUp - singleEliminationController): ", data);
    res.json(responseData);
}

async function postMatch(req, res) {
    let winner = req.body.winnerIndex;

    await match.matchResult(winner);
    let sections = await match.getParticipants();

    let responseData = {
        message: 'Winner posted succesfully!',
        sections: sections,
        isEnd: false
    };

    if(match.finalFlag == true) {
        responseData = {
            message: "Winner posted succesfully. Group Bracket ended.",
            sections: sections,
            isEnd: true
        }
    }

    return res.json(responseData)
}

module.exports = {
    getMatches: getMatches,
    getNextMatch: getNextMatch,
    postMatch: postMatch,
    getNextUp: getNextUp
}