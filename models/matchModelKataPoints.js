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

        this.showFinalFlag = false; // For marking that the final bracket round has started
        this.finalFlag = false; // For marking that bracket has ended
    }

    async loadSections() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            this.participants = data
                .split("--SECTION--")
                .map((section) =>
                    section
                        .trim()
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0)
                        .map((line) => {
                            const [name, currentRoundPoints, totalPoints] = line.split(",");
                            return {
                                name,
                                currentRoundPoints: parseFloat(currentRoundPoints) || 0,
                                totalPoints: parseFloat(totalPoints) || 0,
                            };
                        })
                );
            this.currentParticipants = this.participants[this.participants.length - 1];
            this.currentMatchIndex = 0;

            // For refreshing the current Match Index
            while(this.currentParticipants[this.currentMatchIndex].currentRoundPoints != 0 && this.currentParticipants.length -1 != this.currentMatchIndex)
                this.currentMatchIndex++;

            // For refreshing final and showFinal flags
            if (this.participants.length > 1 && this.currentParticipants.length <= 4)
                if (this.currentMatchIndex == this.currentParticipants.length - 1  && this.currentParticipants[this.currentMatchIndex].currentRoundPoints != 0) {
                    this.finalFlag = true
                    //console.log("Load sections, finalFlag: " + this.finalFlag)
                }
                    
                else
                    this.showFinalFlag = true;


            //console.log("Loaded participants: ", this.participants);
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

        if (this.finalFlag == true) {
            let part = this.currentParticipants.map(p => ({
                name: p.name, 
                currentRoundPoints: parseFloat(p.currentRoundPoints),
                totalPoints: parseFloat(p.totalPoints)
            }));
            part.sort((a, b) => b.totalPoints - a.totalPoints)
            return part
        }

        //if (this.results[0] != "") return this.results;

        return this.currentParticipants[this.currentMatchIndex];
    }

    async matchResult(scores) {
        await this.loadSections()
        let roundScore = 0;

        if(scores.length > 3) {
            scores.sort((a, b) => a - b);
            scores.shift();
            scores.pop();
        }
    
        //console.log("Scores in matchResult model: ", scores);
    
        for (let score of scores) roundScore += score;
    
        this.currentParticipants[this.currentMatchIndex].currentRoundPoints = roundScore.toFixed(1);
        this.currentParticipants[this.currentMatchIndex].totalPoints =
            parseFloat(this.currentParticipants[this.currentMatchIndex].totalPoints) + roundScore;
        this.currentParticipants[this.currentMatchIndex].totalPoints =
            this.currentParticipants[this.currentMatchIndex].totalPoints.toFixed(1);
        this.currentMatchIndex++;
    
        if (this.currentMatchIndex === this.currentParticipants.length) {
            this.createNewSection();
            return this.participants;
        }
    
        //console.log("Participants in matchResult: ", this.participants);
    
        await this.saveState();
    
        return this.participants;
    }
    
    async saveState() {
        try {
            const data = this.participants
                .map((section) =>
                    section
                        .map(
                            (participant) =>
                                `${participant.name},${participant.currentRoundPoints},${participant.totalPoints}`
                        )
                        .join("\n")
                )
                .join("\n--SECTION--\n");
    
            await fs.writeFile(this.filePath, data, "utf-8");
            console.log("State saved successfully.");
        } catch (err) {
            console.error("Error saving state: ", err);
        }
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
        let part = this.currentParticipants.map(p => ({
            name: p.name, 
            currentRoundPoints: 0,
            totalPoints: parseFloat(p.totalPoints)
        }));

        part.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return b.currentRoundPoints - a.currentRoundPoints;
        });

        //console.log("Create New Section: finalFlag = " + this.finalFlag + ", showFinalFlag = " + this.showFinalFlag + ", part: ")
        for (var p of part)
            console.log(p.name + "\n")
         
        let target = 32
        let l = part.length

        if (l > 16)
            target = 16
        else if (l > 8)
            target = 8
        else if (l > 4) {
            target = 4
            this.showFinalFlag == true;
            console.log("Finalinis rezimas 1")
        }
        else {
            if (this.showFinalFlag) 
                return this.finalFlag = true

            this.showFinalFlag = true;
            target = 4
            console.log("Finalinis rezimas 2")
        }

        this.participants.push([]);
        this.currentParticipants = this.participants[this.participants.length - 1];
        this.currentMatchIndex = 0;

        while (part.length > target){
            part.pop()
        }

        for(var p of part)
            this.currentParticipants.push(p)

        await this.saveState()
    }

    isFinal() {
        return this.showFinalFlag;
    }

    isEnd() {
        return this.finalFlag;
    }

    updateSections() {
        //method for human error handling
    }
}

module.exports = Match;
