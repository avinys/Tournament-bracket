const { create } = require("domain");
const { PassThrough } = require("stream");

const fs = require("fs").promises;

class Match {
  constructor(date, group) {
    this.date = date;
    this.group = group;
    this.filePath = "./data/" + date + "-group-" + group + ".txt";
    this.resultFilePath = "./data/" + date + "-group-" + group + "-results.txt";
    this.sections = [];
    this.currentSection = [];
    this.currentMatchIndex = 0;
    this.roundEnded = true;
    this.finalFlag = false;
    this.results = ["", "", "", ""];
    this.losers = [];
    this.place3Done = false;
    this.place3Sent = false;
    // If alternatingPicker == false, execute matches top to bottom
    // If alternatingPicker == true, execute matches bottom to top
    this.alternatingPicker = false;
  }

  async loadSections() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.sections = data
        .split(/\s*break\s*/)
        .map((section) => section.trim())
        //.filter((section) => section.length > 0)
        .map((section) =>
          section
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        );
    } catch (err) {
      console.error("Error reading data from " + this.filePath + ": ", err);
    }
  }

  async getParticipants() {
    await this.loadSections();
    this.roundEnded = false;
    if (this.sections.length == 0) {
      this.currentSection = [];
      return [[]];
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
    await this.loadSections();
    console.log("Sections in getMatch: ", this.sections)
    if (this.results[0] != "") return this.results;

    // Add a new section if the round is over
    if (this.currentSection.length - 1 < this.currentMatchIndex) {
      await this.createNewSection();
      this.roundEnded = true;
      if(this.alternatingPicker == true)
        this.alternatingPicker = false;
      else 
        this.alternatingPicker = true;
    }
    // If down to 2 participants, execute small and big final mode
    if (this.currentSection.length == 2) {
      return this.getMatchFinal();
    }

    // Normal order execution
    if(this.alternatingPicker == false) {
      // If need to push one player left
      if(this.currentSection.length - 1 == this.currentMatchIndex) {
        await this.matchResult(this.currentMatchIndex);
        return [
            this.currentSection[this.currentMatchIndex],
            this.currentMatchIndex
        ]
      } else if (this.currentSection.length != 0) {
        return [
            [
              this.currentSection[this.currentMatchIndex],
              this.currentSection[this.currentMatchIndex + 1],
            ],
            [this.currentMatchIndex, this.currentMatchIndex + 1],
          ];
      } else
          return [[],[]];
    // Reverse order execution
    } else {
        // If need to push one player left
        if(this.currentSection.length - 1 == this.currentMatchIndex) {
            await this.matchResult(0);
            return [this.currentSection[0], 0]
        } else if (this.currentSection.length != 0) {
            return [
                [
                  this.currentSection[this.currentSection.length - this.currentMatchIndex - 1],
                  this.currentSection[this.currentSection.length - this.currentMatchIndex - 2],
                ],
                [
                    this.currentSection.length - this.currentMatchIndex - 1,
                    this.currentSection.length - this.currentMatchIndex - 2
                ],
              ];
        }
    }
  }

  getMatchFinal() {
    console.log("getMatchFinal(). Sections: ", this.sections)
    if (this.currentSection.length == 2) {
      if (!this.place3Done) {
        //this.currentSection.push(this.losers[this.losers.length - 1]);
        //this.currentSection.push(this.losers[this.losers.length - 2]);
        this.place3Sent = true;
        return [
          [
            this.losers[this.losers.length - 1],
            this.losers[this.losers.length - 2],
          ],
          [2, 3],
        ];
      } else {
        return [
          [this.sections[this.sections.length - 2][0], this.sections[this.sections.length - 2][1]],
          [0, 1],
        ];
      }
    }
  }

  async matchResult(winnerIndex) {
    // If handling the match for 3rd place and 1st place
    console.log("matchResult funkcija, ar 3 place sent: ", this.place3Sent);
    if (this.place3Sent) await this.matchResult3Place(winnerIndex);
    // If not handling the match for 3rd place
    else {
      if(this.alternatingPicker == false) {
        this.sections[this.sections.length - 1].push(this.currentSection[winnerIndex]);
      } else {
        this.sections[this.sections.length - 1].unshift(this.currentSection[winnerIndex]);
      }

      // Saving losers
      if(this.currentSection.length - 1 != this.currentMatchIndex) {
        if(this.alternatingPicker == false) {
            if(winnerIndex == this.currentMatchIndex)
                this.losers.push(this.currentSection[this.currentMatchIndex + 1]);
            else
                this.losers.push(this.currentSection[this.currentMatchIndex]);
        } else if(this.alternatingPicker == true) {
            const higherIndex = this.currentSection.length - this.currentMatchIndex - 1;
            if(winnerIndex == higherIndex)
                this.losers.push(this.currentSection[higherIndex - 1])
            else 
                this.losers.push(this.currentSection[higherIndex])
        }
      }
      this.currentMatchIndex += 2;
      console.log("Sections in matchResult: ", this.sections);
      this.writeSectionsToFile();

    //   if (winnerIndex == this.currentMatchIndex) {
    //     if (this.currentSection.length - 1 != winnerIndex)
    //       this.losers.push(this.currentSection[this.currentMatchIndex + 1]);
    //   } else {
    //     this.losers.push(this.currentSection[this.currentMatchIndex]);
    //   }

      // Writing the winner to file IF ALTERNATING, NEED TO WRITE ONLY AFTER ROUND END
      //await this.writeWinnerToFile();
    }
  }

  async matchResult3Place(winnerIndex) {
    if (this.place3Done) {
      if (winnerIndex == 0) {
        this.results[0] = this.currentSection[0];
        this.results[1] = this.currentSection[1];
        this.finalFlag = true;
      } else if (winnerIndex == 1) {
        this.results[0] = this.currentSection[1];
        this.results[1] = this.currentSection[0];
        this.finalFlag = true;
      }
      //await this.writeWinnerToFile(winnerIndex);
    }

    if (winnerIndex == 2) {
      this.results[2] = this.losers[this.losers.length - 1];
      this.results[3] = this.losers[this.losers.length - 2];
    } else if (winnerIndex == 3) {
      this.results[2] = this.losers[this.losers.length - 2];
      this.results[3] = this.losers[this.losers.length - 1];
    }
    this.place3Done = true;
    console.log("matchResult3Place. Sections: ", this.sections)
    this.writeSectionsToFile();
  }

  async writeWinnerToFile() {
    let lastSection = this.sections[this.sections.length - 1];
    let dataToWrite = `${lastSection[lastSection.length - 1]}\n`;
    try {
      await fs.appendFile(this.filePath, dataToWrite, "utf-8");
      //this.currentMatchIndex += 2;
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
    //await this.loadSections();
  }

  async writeSectionsToFile() {
    try{
        const customData = this.sections.map(innerArray => innerArray.join('\n')).join('\n\nbreak\n\n'); 
        let resultData = "";
        for(let i=0; i < this.results.length; i++) {
          resultData += `${i+1} place: ${this.results[i]}\n`
        }
        await fs.writeFile(this.filePath, customData);
        await fs.writeFile(this.resultFilePath, resultData);
    }catch(err){
        console.error('Error writing to file:', err);
    }
  }

  async createNewSection() {
    if (this.sections[this.sections.length - 1].length === 0) return;
    this.currentSection = this.sections[this.sections.length - 1];
    this.sections.push([]);
    this.currentMatchIndex = 0;
    let dataToWrite = "\nbreak\n\n";
    await fs.appendFile(this.filePath, dataToWrite, "utf-8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("New section in the file has been created succesfully!");
        this.roundEnded = false;
      }
    });
  }

  updateSections() {
    //method for human error handling
  }
}

module.exports = Match;
