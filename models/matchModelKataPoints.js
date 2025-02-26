const fs = require("fs").promises;

class Match {
    constructor(date, group) {
        this.date = date;
        this.group = group;
        this.filePath = "./data/" + date + "-group-" + group + ".txt";

        this.participants = [];
        this.currentParticipants = [];
        this.currentMatchIndex = 0;
        this.roundEnded = true;
        this.results = ["", "", "", ""];
    }

    async loadSections() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            this.participants = data
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((participant) => ({
                    name: participant,
                    currentRoundPoints: 0,
                    totalPoints: 0
                }));
            this.currentParticipants = this.participants;
            this.participants = [this.participants];
            console.log(this.participants);
        } catch (err) {
            console.error("Error reading data from " + this.filePath + ": ", err);
        }
    }

    async getParticipants() {
        await this.loadSections();
        return this.participants;
    }

    async getMatch() {
        console.log("Participants in getMatch: ", this.participants);

        if (this.results[0] != "") return this.results;

        return this.currentParticipants[this.currentMatchIndex];
    }

    async matchResult(scores) {
        let roundScore = 0;

        if(scores.length > 3) {
            scores.sort((a, b) => a - b);
            scores.shift();
            scores.pop();
        }

        console.log("Scores in matchResult model: ", scores)

        for(let score of scores)
            roundScore += score;

        this.currentParticipants[this.currentMatchIndex].currentRoundPoints = roundScore.toFixed(1);
        this.currentParticipants[this.currentMatchIndex].totalPoints += roundScore;
            this.currentParticipants[this.currentMatchIndex].totalPoints.toFixed(1);
        this.currentMatchIndex += 1;

        if(this.currentMatchIndex == this.currentParticipants.length - 1) {
            this.createNewSection();
        }

        console.log("Participants in matchResult: ", this.participants);
        return this.participants;
    }

    async writeWinnerToFile() {
        let lastSection = this.sections[this.sections.length - 1];
        let dataToWrite = `${lastSection[lastSection.length - 1]}\n`;
        try {
            await fs.appendFile(this.filePath, dataToWrite, "utf-8");
            this.currentMatchIndex += 2;
            if (this.currentMatchIndex == this.currentSection.length - 1) {
                await fs.appendFile(
                    this.filePath,
                    this.currentSection[this.currentMatchIndex] + "\n",
                    "utf-8"
                );
                this.sections[this.sections.length - 1].push(
                    this.currentSection[this.currentMatchIndex]
                );
            }
        } catch (err) {
            console.error("Error writing to file:", err);
        }
        await this.loadSections();
    }

    async createNewSection() {
        this.currentParticipants = this.participants[this.participants.length - 1];
        this.participants.push([]);
        this.currentMatchIndex = 0;
    }

    updateSections() {
        //method for human error handling
    }
}

module.exports = Match;
