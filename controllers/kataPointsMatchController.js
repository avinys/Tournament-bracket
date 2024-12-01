const Match = require("../models/matchModelKataPoints");

let currentIndex = 0;
let matchArray = [];
let match;

let date;
let group;

async function getMatchesKataPoints(req, res) {
    date = req.query.date;
    group = req.query.group;
    if(match == undefined)
        match = new Match(date, group);
    const rounds = await match.getParticipants();

    // Add check for finalFlag and showFinalFlag    
    const isEnd = match.finalFlag;
    const isFinal = match.showFinalFlag;

    res.render("pages/bracket-kata-points.ejs", { date: date, group: group, rounds: rounds, isEnd: isEnd, isFinal: isFinal})
}

async function getNextMatchKataPoints(req, res) {
    let newMatch = await match.getMatch();
    let responseData = {
        message: 'Data received successfully!',
        receivedData: newMatch,
        isEnd: false
    }
    if (match.finalFlag == true) {
        responseData["message"] += " Bracket Ended.";
        responseData["isEnd"] = true;
    }
    console.log("Client Data getNextMatch controller: ", responseData);
    res.json(responseData);
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
        isEnd: false,
        isFinal: false
    };

    if(match.showFinalFlag == true) {
        responseData = {
            message: "Scores recorded succesfully! Final started!",
            participants: participants,
            isEnd: false,
            isFinal: true
        }
    }

    if(match.finalFlag == true) {
        responseData = {
            message: "Scores recorded succesfully! Competition ended!",
            participants: participants,
            isEnd: true,
            isFinal: false
        }
    }

    return res.json(responseData)
}

module.exports = {
    getMatchesKataPoints: getMatchesKataPoints,
    getNextMatchKataPoints: getNextMatchKataPoints,
    postMatchKataPoints: postMatchKataPoints
}