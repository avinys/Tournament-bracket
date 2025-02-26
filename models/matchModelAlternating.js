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
    this.resultFilePath = "./data/" + date + "-group-" + group + "-results.txt";
    this.tempFilePath = "./data/temp/TEMP-" + date + "-group-" + group + ".txt";
    this.sections = [];
    this.currentSection = [];
    this.currentMatchIndex = 0;
    this.roundEnded = true;
    this.finalFlag = false;
    this.results = ["", "", "", ""];
    this.losers = [];
    this.place3Done = false;
    this.place3Sent = false;
    this.two3places = false;
    // If alternatingPicker == false, execute matches top to bottom
    // If alternatingPicker == true, execute matches bottom to top
    this.alternatingPicker = false;

    this.initializeState();
  }

  async initializeState() {
    try {
      //await deleteFile(this.tempFilePath);
      await this.loadCurrentLosersAndIndexState();
      await this.loadSections();
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
    console.log(
      "Sections in getMatch(model): ",
      this.sections,
      "Alternating: ",
      this.alternatingPicker
    );
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

    // Normal order execution
    if (this.alternatingPicker == false) {
      // If need to push one player left
      if (this.currentSection.length - 1 == this.currentMatchIndex) {
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
    console.log("getMatchFinal()(model). Sections: ", this.sections);
    if (this.currentSection.length == 2) {
      if (!this.place3Done) {
        this.place3Sent = true;

        // Critical case if bracket consists of 3 participants
        if (this.sections[0].length == 3) {
          this.matchResult3Place(3);
          return this.getMatchFinal();
        }

        return [
          [
            this.losers[this.losers.length - 2],
            this.losers[this.losers.length - 1],
          ],
          [2, 3],
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
    console.log(
      "matchResult(model) funkcija, ar 3 place sent: ",
      this.place3Sent
    );
    if (this.place3Sent) await this.matchResult3Place(winnerIndex);
    // If not handling the match for 3rd place
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
      console.log("Sections in matchResult(model): ", this.sections);
      await this.writeSectionsToFile();

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
        // this.sections[this.sections.length - 1].push(this.currentSection[0]);

        this.results[0] = this.currentSection[0];
        this.results[1] = this.currentSection[1];
        this.finalFlag = true;
      } else if (winnerIndex == 1) {
        // this.sections[this.sections.length - 1].push(this.currentSection[1]);

        this.results[0] = this.currentSection[1];
        this.results[1] = this.currentSection[0];
        this.finalFlag = true;
      }
      //await this.writeWinnerToFile(winnerIndex);
    }

    if (winnerIndex == 2) {
      this.results[2] = this.losers[this.losers.length - 2];
      this.results[3] = this.losers[this.losers.length - 1];
    } else if (winnerIndex == 3) {
      this.results[2] = this.losers[this.losers.length - 1];
      this.results[3] = this.losers[this.losers.length - 2];
    }
    this.place3Done = true;
    console.log("matchResult3Place(model). Sections: ", this.sections);
    await this.writeSectionsToFile();
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
        const parsedData = tempLines[tempLines.length - 1]
          .split(",")
          .map((value) => {
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
  }

  getNextUp() {
    let alternating = this.alternatingPicker;

    console.log("\n");
    console.log("getNextUp model method - before: ");
    console.log("alternating: ", alternating);
    console.log("tempMatchIndex: ", this.currentMatchIndex);
    console.log("tempSection: ", this.currentSection);
    console.log("tempLosers: ", this.losers);

    // If bracket is completed or only final left
    if (this.results[0] != "" || this.place3Done) return null;

    let tempMatchIndex = this.currentMatchIndex + 2;
    let tempSection = [...this.currentSection];
    let tempLosers = [...this.losers];

    // If after current match doing moving of odd element
    if (tempMatchIndex == tempSection.length - 1) {
      tempSection = [...this.sections[this.sections.length - 1]];
      if (alternating == true) {
        tempSection.unshift("##");
        tempSection.unshift(this.currentSection[0]);
        alternating = false;
        tempMatchIndex = 0;
      } else {
        tempSection.push("##");
        tempSection.push(this.currentSection[tempMatchIndex]);
        alternating = true;
        tempMatchIndex = 0;
      }
      tempLosers.push("!!");
    }

    // If round is already over
    if (tempMatchIndex - 2 > tempSection.length - 1) {
      tempMatchIndex = 0;
      tempSection = [...this.sections[this.sections.length - 1]];

      if (alternating == true) alternating = false;
      else alternating = true;
    }

    // If next up is big final
    if (this.place3Sent)
      return [
        tempSection[tempSection.length - 2],
        tempSection[tempSection.length - 1],
      ];

    // Simulating next match state if round is going to be over
    if (tempMatchIndex >= tempSection.length - 1) {
      tempMatchIndex = 0;
      tempSection = [...this.sections[this.sections.length - 1]];
      if (alternating == false) tempSection.push("##");
      else tempSection.unshift("##");
      tempLosers.push("!!");

      if (alternating == true) alternating = false;
      else alternating = true;
    }

    console.log("getNextUp model method - after: ");
    console.log("alternating: ", alternating);
    console.log("tempMatchIndex: ", tempMatchIndex);
    console.log("tempSection: ", tempSection);
    console.log("tempLosers: ", tempLosers);
    console.log("\n");

    // If next up small final
    if (tempSection.length == 2) {
      // Edge case of 3 participants
      if (this.sections[0].length == 3)
        return [
          tempSection[tempSection.length - 2],
          tempSection[tempSection.length - 1],
        ];

      return [
        tempLosers[tempLosers.length - 2],
        tempLosers[tempLosers.length - 1],
      ];
    }

    // Normal case
    if (alternating == false) {
      if (tempSection.length != 0) {
        return [tempSection[tempMatchIndex], tempSection[tempMatchIndex + 1]];
      } else return null;
      // Reverse order execution
    } else {
      if (tempSection.length != 0) {
        return [
          tempSection[tempSection.length - tempMatchIndex - 1],
          tempSection[tempSection.length - tempMatchIndex - 2],
        ];
      }
    }
  }

  updateSections() {
    //method for human error handling
  }
}

module.exports = Match;
