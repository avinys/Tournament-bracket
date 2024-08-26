const Match = require("../models/matchModel")

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

async function getNextMatch(req, res) {
    await match.loadSections()
    let newMatch = await match.getMatch()

    let clientData = newMatch;

    const responseData = {
        message: 'Data received successfully!',
        receivedData: clientData
    };
    //console.log(clientData);

    res.json(responseData);
}

async function postMatch(req, res) {
    let firstParticipant = req.body.index1;
    let secondParticipant = req.body.index2;
    let winner = req.body.winnerIndex;

    await match.matchResult(winner);
    let sections = await match.getParticipants();

    const responseData = {
        message: 'Winner posted succesfully!',
        sections: sections
    };
    // let section = await match.getParticipants();
    // res.render("pages/bracket.ejs", { date: date, group: group, sections: sections})
    return res.json(responseData)
}

module.exports = {
    getMatches: getMatches,
    getNextMatch: getNextMatch,
    postMatch: postMatch
}