const fs = require("fs").promises;

class Data {
  constructor() {
    this.dataFolderPath = "./data";
    this.groupMatchLogPath = "./data/groups.txt";
  }

  async getGroupMatchTypes() {
    try {
      const tempData = await fs.readFile(this.groupMatchLogPath, "utf-8");
      const lines = tempData.split("\n").filter((line) => line.trim() !== "");
      const results = lines.map((line) =>
        line.split("--SEP--").map((value) => value.trim())
      );

      return results;
    } catch (error) {
      console.error("Error reading file:", error);
      return [];
    }
  }

  async getAllGroups() {
    try {
      const files = await fs.readdir(this.dataFolderPath, {
        withFileTypes: true,
      });
      const fileNames = files
        .filter((file) => file.isFile()) // Only include files, not directories
        .map((file) => file.name)
        .filter((file) => file != "groups.txt" && !file.includes("results"));

      console.log("Fetched fileNames: ", fileNames);

      const props = [];
      const results = await this.getGroupMatchTypes();

      for (let fileName of fileNames) {
        let date = fileName.split("-group-")[0];
        let group = fileName.split("-group-")[1].split(".")[0];
        let type;
        let name;
        for (let l of results) {
          if (l[0] == fileName) {
            type = l[1];
            name = l[2];
          }
        }
        props.push([date, group, type, name].map((file) => file.trim()));
      }

      console.log("PROPS: ", props);

      return props;
    } catch (error) {
      console.error("Error reading directory:", error);
      return [];
    }
  }

  async validateUpload(type, date, name, group, participants) {
    const existing = await this.getGroupMatchTypes();
    const fileNames = existing.map((line) => line[0]);
    const newFileName = date + "-group-" + group + ".txt";
    const participantsArr = participants.split("\n").map((line) => line.trim());

    console.log("All filenames: ", fileNames);

    // Check if any are undefined
    if (!type || !date || !name || !participants) {
      return "Something went wrong! Please try again";
    }

    // Check if any are empty
    if (type == "" || date == "" || name == "" || participantsArr.length == 0)
      return "Please fill all fields with valid data (spaces are not valid data).";

    // Check if fileName already exists
    if (fileNames.includes(newFileName))
      return (
        "Group with provided date and number already exists. " +
        "If you would like to assign the group to several match types," +
        " please change the group number with underline (1 → 1_1, 1_2, etc.)."
      );

    // Check if group with same parameters exists
    if (
      existing.filter(
        (file) => file[0] == date && file[1] == type && file[2] == name
      ).length > 0
    )
      return (
        "Group with the same date, match type and name already exists!" +
        " If you would like to overwrite this group with new data, please delete it first."
      );

    return "";
  }

  async createNewGroup(type, date, name, group, participants) {
    try {
      const newFileName = date.trim() + "-group-" + group.trim() + ".txt";
      const filePath = "./data/" + newFileName;
      const part = participants
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Shuffle the participants array
      this.shuffleArray(part);

      const fileContents = part.join("\n");
      const logContents =
        newFileName + "--SEP--" + type + "--SEP--" + name.trim() + "\n";

      await fs.writeFile(filePath, fileContents);
      await fs.appendFile(this.groupMatchLogPath, logContents);

      console.log("Group file created succesfully!");
      return true;
    } catch (error) {
      console.error("Error reading file:", error);
      return false;
    }
  }

  // Fisher-Yates Shuffle algorithm
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  }

  async deleteGroup(date, number) {}
}

module.exports = Data;
