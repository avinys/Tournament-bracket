const { create } = require("domain");
const { PassThrough } = require("stream");

const fs = require("fs").promises;

async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, err);
    } else {
      console.log(`File not found, nothing to delete: ${filePath}`);
    }
  }
}

class Match {
  constructor(date, group) {
    this.date = date;
    this.group = group;
    this.filePath = "./data/" + date + "-group-" + group + ".txt";
    this.tempFilePath = "./data/temp/TEMP-" + date + "-group-" + group + ".txt";
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
    this.getLoser = false;
    this.losersInLastMatch = [];
    // If alternatingPicker == false, execute matches top to bottom
    // If alternatingPicker == true, execute matches bottom to top
    this.alternatingPicker = false;

    // Delete temp file, then save initialized state
    this.initializeState();
  }

  async initializeState() {
    try {
      await deleteFile(this.tempFilePath);
      await this.saveCurrentLosersAndIndexState();
      //console.log("initializeState: ",this.alternatingPicker)
    } catch (err) {
      console.error("Error during state initialization:", err);
    }
  }

  async loadSections() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.sections = data
        .split("--SECTION--")
        .map((section) => section.trim())
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
    await this.loadCurrentLosersAndIndexState();
    //console.log("getParticipants: ",this.alternatingPicker)
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
    await this.loadCurrentLosersAndIndexState();
    console.log("Sections in getMatch: ", this.sections);
    console.log("Losers in getMatch: ", this.losers);
    console.log("getLoser in getMatch: ", this.getLoser);
    console.log("alternatingPicker in getMatch: ", this.getLoser);
    console.log("currentSection in getMatch: ", this.currentSection);
    if (this.results[0] != "") return this.results;

    // Add a new section if the round is over
    if (this.currentSection.length - 1 < this.currentMatchIndex) {
      await this.createNewSection();
      this.roundEnded = true;
      if (this.alternatingPicker == true) this.alternatingPicker = false;
      else this.alternatingPicker = true;
    }
    // If down to 2 participants, execute small and big final mode
    if (this.currentSection.length == 2) {
      return this.getMatchFinal();
    }

    // Losers bracket execution
    if (this.getLoser == true) {
      if (this.losers != this.losersInLastMatch) {
        return [
          [
            this.losers[this.losers.length - 1],
            this.losers[this.losers.length - 2],
          ],
          [0, 1],
        ];
      } else {
        this.getLoser == false;
      }
    }
    // Upper bracket execution
    // Normal order execution
    if (this.alternatingPicker == false) {
      // If need to push one player left
      if (this.currentSection.length - 1 == this.currentMatchIndex) {
        //this.getLoser = false;
        await this.matchResult(this.currentMatchIndex);
        return [
          this.currentSection[this.currentMatchIndex - 2],
          this.currentMatchIndex,
        ];
      } else if (this.currentSection.length != 0) {
        return [
          [
            this.currentSection[this.currentMatchIndex],
            this.currentSection[this.currentMatchIndex + 1],
          ],
          [this.currentMatchIndex, this.currentMatchIndex + 1],
        ];
      } else return [[], []];
      // Reverse order execution
    } else {
      // If need to push one player left
      if (this.currentSection.length - 1 == this.currentMatchIndex) {
        //this.getLoser = false;
        await this.matchResult(0);
        return [this.currentSection[0], 0];
      } else if (this.currentSection.length != 0) {
        return [
          [
            this.currentSection[
              this.currentSection.length - this.currentMatchIndex - 1
            ],
            this.currentSection[
              this.currentSection.length - this.currentMatchIndex - 2
            ],
          ],
          [
            this.currentSection.length - this.currentMatchIndex - 1,
            this.currentSection.length - this.currentMatchIndex - 2,
          ],
        ];
      }
    }
  }

  getMatchFinal() {
    console.log("getMatchFinal(). Sections: ", this.sections);
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
          [0, 1],
        ];
      } else {
        return [
          [
            this.sections[this.sections.length - 2][0],
            this.sections[this.sections.length - 2][1],
          ],
          [0, 1],
        ];
      }
    }
  }

  async matchResult(winnerIndex) {
    // If handling the match for 3rd place and 1st place
    if (this.place3Sent == true) this.matchResult3Place(winnerIndex);
    // If not handling the match for 3rd place and executing Losers bracket
    else if (this.getLoser == true) {
      if (winnerIndex == 0)
        this.losers.push(this.losers[this.losers.length - 1]);
      else if (winnerIndex == 1)
        this.losers.push(this.losers[this.losers.length - 2]);
    }
    // If not handling the match for 3rd place and executing Upper bracket
    else {
      if (this.alternatingPicker == false) {
        this.sections[this.sections.length - 1].push(
          this.currentSection[winnerIndex]
        );
      } else {
        this.sections[this.sections.length - 1].unshift(
          this.currentSection[winnerIndex]
        );
      }

      // Saving losers
      if (this.currentSection.length - 1 != this.currentMatchIndex) {
        if (this.alternatingPicker == false) {
          if (winnerIndex == this.currentMatchIndex)
            this.losers.push(this.currentSection[this.currentMatchIndex + 1]);
          else this.losers.push(this.currentSection[this.currentMatchIndex]);
        } else if (this.alternatingPicker == true) {
          const higherIndex =
            this.currentSection.length - this.currentMatchIndex - 1;
          if (winnerIndex == higherIndex)
            this.losers.push(this.currentSection[higherIndex - 1]);
          else this.losers.push(this.currentSection[higherIndex]);
        }
      }
      this.currentMatchIndex += 2;
      await this.writeSectionsToFile();

    }

    if (this.losers.length == 2) this.getLoser = true;
    else if (this.losers.length > 2)
      if (this.getLoser == true) this.getLoser = false;
      else this.getLoser = true;

    if (this.currentMatchIndex == this.currentSection.length - 1)
      this.getLoser = false;
    console.log("Sections in matchResult: ", this.sections);
    console.log("Losers in matchResult: ", this.losers);
    console.log("getLoser in matchResult: ", this.getLoser);
    console.log("place3Sent in matchResult: ", this.place3Sent);
    await this.saveCurrentLosersAndIndexState();
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
    } else {
      if (winnerIndex == 0) {
        this.results[2] = this.losers[this.losers.length - 1];
        this.results[3] = this.losers[this.losers.length - 2];
      } else if (winnerIndex == 1) {
        this.results[2] = this.losers[this.losers.length - 2];
        this.results[3] = this.losers[this.losers.length - 1];
      }
      this.place3Done = true;
    }

    console.log("matchResult3Place. Sections: ", this.sections);
    await this.writeSectionsToFile();
    await this.saveCurrentLosersAndIndexState();
  }

  // matchResultLoserBracket() {}

  // async writeWinnerToFile() {
  //   let lastSection = this.sections[this.sections.length - 1];
  //   let dataToWrite = `${lastSection[lastSection.length - 1]}\n`;
  //   try {
  //     await fs.appendFile(this.filePath, dataToWrite, "utf-8");
  //     //this.currentMatchIndex += 2;
  //     if (this.currentMatchIndex == this.currentSection.length - 1) {
  //       await fs.appendFile(
  //         this.filePath,
  //         this.currentSection[this.currentMatchIndex] + "\n",
  //         "utf-8"
  //       );
  //       this.sections[this.sections.length - 1].push(
  //         this.currentSection[this.currentMatchIndex]
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Error writing to file:", err);
  //   }
  //   //await this.loadSections();
  // }

  async writeSectionsToFile() {
    try {
      const customData = this.sections
        .map((innerArray) => innerArray.join("\n"))
        .join("\n--SECTION--\n");
      let resultData = "";
      for (let i = 0; i < this.results.length; i++) {
        resultData += `${i + 1} place: ${this.results[i]}\n`;
      }
      await fs.writeFile(this.filePath, customData);
      await fs.writeFile(this.resultFilePath, resultData);
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  }

  async loadCurrentLosersAndIndexState() {
    try {
      // Read and clean up the file
      const tempData = await fs.readFile(this.tempFilePath, "utf-8");
      //console.log("Raw file content:", tempData);
      
      const tempLines = tempData
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== ""); // Remove empty lines
  
      //console.log("Loaded state: ", tempLines);
  
      // Load losers from the first line
      if (tempLines.length > 0) {
        this.losers =
          tempLines[0] === "EMPTY"
            ? []
            : tempLines[0].split(",").filter((loser) => loser.trim() !== "");
      }
  
      // Load other data from the last line
      if (tempLines.length > 1) {
        const parsedData = tempLines[tempLines.length - 1].split(",").map((value) => {
          if (value === "true" || value === "false") return value === "true"; // Handle booleans
          if (!isNaN(value)) return Number(value); // Handle numbers
          return value;
        });
  
        const [
          currentMatchIndex = 0,
          roundEnded = false,
          finalFlag = false,
          place3Done = false,
          place3Sent = false,
          getLoser = false,
          alternatingPicker = false,
        ] = parsedData;
  
        this.currentMatchIndex = currentMatchIndex;
        this.roundEnded = roundEnded;
        this.finalFlag = finalFlag;
        this.place3Done = place3Done;
        this.place3Sent = place3Sent;
        this.getLoser = getLoser;
        this.alternatingPicker = alternatingPicker;
      }
  
      // Load results from the result file
      const resultData = await fs.readFile(this.resultFilePath, "utf-8");
      this.results = resultData
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => line.split(": ")[1]); // Extract only the result part after 'place: '
  
    } catch (err) {
      console.error("Error reading from file:", err);
    }
  }

  async saveCurrentLosersAndIndexState() {
    try {
      const losers = this.losers.length > 0 ? this.losers.join(",") : "EMPTY";
      const tempFileData = `${losers}\n${[
        this.currentMatchIndex || 0,
        this.roundEnded || true,
        this.finalFlag || false,
        this.place3Done || false,
        this.place3Sent || false,
        this.getLoser || false,
        this.alternatingPicker || false,
      ].join(",")}\n`;
  
      let resultData = "";
      for (let i = 0; i < this.results.length; i++) {
        resultData += `${i + 1} place: ${this.results[i]}\n`;
      }
  
      await Promise.all([
        fs.writeFile(this.tempFilePath, tempFileData),
        fs.writeFile(this.resultFilePath, resultData),
      ]);
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  }
  

  async createNewSection() {
    if (this.sections[this.sections.length - 1].length === 0) return;
    this.currentSection = this.sections[this.sections.length - 1];
    this.sections.push([]);
    this.currentMatchIndex = 0;
    let dataToWrite = "\n--SECTION--\n";
    await fs.appendFile(this.filePath, dataToWrite, "utf-8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("New section in the file has been created succesfully!");
        this.roundEnded = false;
      }
    });
    await this.saveCurrentLosersAndIndexState();
  }

  updateSections() {
    //method for human error handling
  }
}

module.exports = Match;
