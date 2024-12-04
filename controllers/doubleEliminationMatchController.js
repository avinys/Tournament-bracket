const Match = require("../models/matchModelDoubleElimination");

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

    if(match == undefined || match.date != date || match.group != group) 
        match = new Match(date, group)
    const sections = await match.getParticipants()
    const losers = [...match.losers];
    res.render("pages/bracket-double-elimination.ejs", { date: date, group: group, sections: sections, losers:losers})
}

async function getNextMatch(req, res) { 
    await match.loadSections()
    let newMatch = await match.getMatch()

    let clientData = newMatch;

    let responseData = {
        message: 'Data received successfully!',
        receivedData: clientData,
        isEnd: false,
        isFinal: false
    };

    if (match.showFinalFlag == true)
        responseData["isFinal"] = true;

    if(clientData.length == 4) {
        responseData["message"] += " Bracket Ended.";
        responseData["isEnd"] = true;
        responseData["isFinal"] = false
    }
    console.log("Client Data: ", responseData);
    res.json(responseData);
}

async function postMatch(req, res) {
    let winner = req.body.winnerIndex;

    await match.matchResult(winner);
    let sections = await match.getParticipants();
    let losers = [...match.losers];

    let responseData = {
        message: 'Winner posted succesfully!',
        sections: sections,
        losers: losers,
        isEnd: false
    };

    if(match.finalFlag == true) {
        responseData = {
            message: "Winner posted succesfully. Group Bracket ended.",
            sections: sections,
            losers, losers,
            isEnd: true
        }
    }

    return res.json(responseData)
}

async function getNextUp(req, res) {
    let data = await match.getNextUp();
    let responseData = {
        message: "Next up data received succesfully!",
        data: data
    };
    console.log("Client data (getNextUp - doubleEliminationController): ", data);
    res.json(responseData);
}

module.exports = {
    getMatches: getMatches,
    getNextMatch: getNextMatch,
    postMatch: postMatch,
    getNextUp: getNextUp,
}