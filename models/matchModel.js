const { create } = require('domain');

const fs = require('fs').promises

class Match {
    constructor(date, group) {
        this.dataArray = [];
        this.date = date;
        this.group = group;
        this.filePath = "./data/" + date + "-group-" + group;
        this.sections = [];
        this.currentSection = [];
        this.currentSingleMatch = [];
        this.currentMatchIndex = 0;
        this.roundEnded = true;
    }

    async loadSections() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            this.sections = data
            .split(/\s*break\s*/)
            .map(section => section.trim())
            .filter(section => section.length > 0)
            .map(section =>
                section.split('\n').map(line => line.trim()).filter(line => line.length > 0)
            );
        } catch (err) {
            console.error('Error reading data from ' + this.filePath + ': ', err);
        }
    }

    async getParticipants() {
        await this.loadSections();
        this.roundEnded = false;
        if (this.sections.length == 0) {
            this.currentSection = [];
            return [[]]
        } else if (this.sections.length == 1) {
            this.createNewSection();
            this.currentSection = this.sections[0];
            return this.sections;
        } else {
            this.currentSection = this.sections[this.sections.length - 2];
            return this.sections;
        }
    }

    async getMatch() {
        await this.loadSections()
        if(this.currentSection.length - 1 <= this.currentMatchIndex) {
            await this.createNewSection()
            this.roundEnded = true;
        }
        if(this.currentSection.length - 1 == this.currentMatchIndex) {
            await this.matchResult(this.currentMatchIndex)
            return [this.currentSection[this.currentMatchIndex], [this.currentMatchIndex]]
        } else if(this.currentSection.length != 0) {
            return this.currentSingleMatch = [[this.currentSection[this.currentMatchIndex], this.currentSection[this.currentMatchIndex + 1]],
                [this.currentMatchIndex, this.currentMatchIndex + 1]];
        } else {
            return [[], []];
        }
    }

    async matchResult(winnerIndex) {
        this.sections[this.sections.length - 1].push(this.currentSection[winnerIndex])
        await this.writeWinnerToFile()
    }

    async writeWinnerToFile() {
        let lastSection = this.sections[this.sections.length - 1]
        let dataToWrite = `${lastSection[lastSection.length - 1]}\n`
        try {
            await fs.appendFile(this.filePath, dataToWrite, 'utf-8');
            this.currentMatchIndex += 2;
            if(this.currentMatchIndex == this.currentSection.length - 1) {
                await fs.appendFile(this.filePath, this.currentSection[this.currentMatchIndex] + "\n", "utf-8");
                this.sections[this.sections.length - 1].push(this.currentSection[this.currentMatchIndex])
            }
        } catch (err) {
            console.error('Error writing to file:', err);
        }
        await this.loadSections();
    }

    async createNewSection() {
        if (this.sections[this.sections.length - 1].length === 0)
            return;
        this.sections.push([])
        this.currentSection = [];
        this.currentSection = this.sections[this.sections.length - 2]
        this.currentMatchIndex = 0;
        let dataToWrite = "\nbreak\n\n"
        await fs.appendFile(this.filePath, dataToWrite, 'utf-8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('New section in the file has been created succesfully!');
                this.roundEnded = false;
            }
        });
    }

    updateSections() {
        //method for human error handling
    }
}

module.exports = Match;