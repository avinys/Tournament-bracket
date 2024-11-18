//const Match = require("../models/matchModelAlternating");
//const Match = require("../models/matchModel");
//const Match = require("../models/matchModelDoubleElimination");
const Match = require("../models/matchModelKataPoints");

let currentIndex = 0;
let matchArray = [];
let match;

let date;
let group;

async function getMatches(req, res) {
    date = req.query.date;
    group = req.query.group;
    if(match == undefined) 
        match = new Match(date, group)
    const sections = await match.getParticipants()
    res.render("pages/bracket.ejs", { date: date, group: group, sections: sections})
}

async function getMatchesKataPoints(req, res) {
    date = req.query.date;
    group = req.query.group;
    if(match == undefined)
        match = new Match(date, group);
    const rounds = await match.getParticipants();
    res.render("pages/bracket-kata-points.ejs", { date: date, group: group, rounds: rounds})
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
    console.log("Client Data: ", responseData);
    res.json(responseData);
}

async function getNextMatchKataPoints(req, res) {
    let newMatch = await match.getMatch();
    let responseData = {
        message: 'Data received successfully!',
        receivedData: newMatch,
        isEnd: false
    }
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

async function postMatchKataPoints(req, res) {
    let scores = [];
    for (let score of req.body.scores.map(parseFloat)) {
        if(!isNaN(score))
            scores.push(score);
    }
    console.log("Scores in postMatchKataPoints controller: ", scores)
    const participants = await match.matchResult(scores);

    let responseData = {
        message: 'Scores recorded succesfully!',
        participants: participants,
        isEnd: false
    };

    if(match.finalFlag == true) {
        responseData = {
            message: "Scores recorded succesfully! Competition ended!",
            participants: participants,
            isEnd: true
        }
    }

    return res.json(responseData)
}

module.exports = {
    getMatches: getMatches,
    getMatchesKataPoints: getMatchesKataPoints,
    getNextMatch: getNextMatch,
    getNextMatchKataPoints: getNextMatchKataPoints,
    postMatch: postMatch,
    postMatchKataPoints: postMatchKataPoints
}