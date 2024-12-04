const h2Element = document.querySelector("h2");
const startMatchBtn = document.getElementById("start-match-button");
const overlay = document.getElementById("overlay");
const overlayContents = document.getElementById("select-winner-overlay");
const overlayHeader = document.querySelector("#kata-points-overlay h2");
const finalNoticeDiv = document.getElementById("final-notice");
const alertOverlay = document.getElementById("alert-overlay");
const alertOverlayDiv = document.getElementById("alert-overlay-contents")
const alertOverlayText = document.querySelector("#alert-overlay-contents p");

const submitBtn = document.getElementById("overlay-submit");

const bracketResultOverlayContent = document.getElementById(
  "bracket-result-overlay"
);
const bracketResultOverlay = document.getElementById("result-overlay");

const date = document.getElementById("bracket-name").textContent.split(" ")[4];
const group = document
  .getElementById("bracket-name")
  .textContent.split(" ")[6]
  .split(":")[0];



async function startMatch() {
  await fetch("/bracket-kata-points/next", {
    method: "GET", // Specify the request method
    headers: {
      "Content-Type": "application/json", // Specify the content type
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON from the response
    })
    .then((data) => {
      console.log(data);
      if (data["isEnd"]) {
        startMatchBtn.textContent = "View Results";
        fillResultOverlay(data["receivedData"]);
        if (!bracketResultOverlay.classList.contains("active"))
          bracketResultOverlay.classList.add("active");
        if(finalNoticeDiv.classList.contains("active"))
          finalNoticeDiv.classList.remove("active");
      } else {
        console.log("Data received:", data);
        overlayHeader.textContent = `Please input points for participant ${data["receivedData"].name}`;
        if (!overlay.classList.contains("active")) {
          document.body.style.overflow = "hidden";
          overlay.classList.add("active");
        }
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

async function postScore() {
  let inputs = document.querySelectorAll("#participant-points input");
  let scores = [];

  for (let input of inputs) {
    if (input.value != "") 
      scores.push(input.value);
  }
  console.log("Scores in postScore() script: ", scores);

  if (scores.length < 3) {
    showAlert("Please add points for at least 3 judges");
    return;
  } else {
    for (let input of inputs) {
      input.value = ""
    }
  }

  await fetch("/bracket-kata-points/next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scores: scores }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Received data: " + JSON.stringify(data));
      if (overlay.classList.contains("active"))
        overlay.classList.remove("active");
      if (bracketResultOverlay.classList.contains("active"))
        bracketResultOverlay.classList.remove("active");

      if(data["isFinal"] == true) {
        if (!finalNoticeDiv.classList.contains("active")) 
          finalNoticeDiv.classList.add("active");
      }

      if (data["isEnd"] == true) {
        startMatchBtn.textContent = "View Results";
        if(finalNoticeDiv.classList.contains("active"))
          finalNoticeDiv.classList.remove("active");
      }
      fillScoresInPage(data["participants"]);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function fillScoresInPage(scores) {
  const mainBracketDiv = document.getElementById("main-bracket");
  mainBracketDiv.innerHTML = "";
  const participantsUl = document.createElement("ul");
  participantsUl.id = "participants-list-kata-points";

  console.log("Sections in script: ", scores);

  for (let i = 0; i < scores.length; i++) {
    // Only in the first iteration fill header
    if (i == 0) {
      const headerLiElement = document.createElement("li");
      const headerDivElement = document.createElement("div");
      headerDivElement.id = "table-headers";
      let headers = [
        "Participant's name",
        "Current round points",
        "Points in total",
      ];
      for (let header of headers) {
        const newHeaderElement = document.createElement("h3");
        newHeaderElement.textContent = header;
        headerDivElement.appendChild(newHeaderElement);
      }
      headerLiElement.appendChild(headerDivElement);
      participantsUl.appendChild(headerLiElement);
    }
    // For every section fill in participants
    for(let participant of scores[i]) {
        const newLiElement = document.createElement("li");
        const newDivElement = document.createElement("div");
    
        const pName = document.createElement("p");
        pName.textContent = participant.name;
        newDivElement.appendChild(pName);
        const pRoundScore = document.createElement("p");
        pRoundScore.textContent = participant.currentRoundPoints;
        newDivElement.appendChild(pRoundScore);
        const pTotalScore = document.createElement("p");
        pTotalScore.textContent = participant.totalPoints;
        newDivElement.appendChild(pTotalScore);
    
        newLiElement.appendChild(newDivElement);
        participantsUl.appendChild(newLiElement);
    }
  }
  mainBracketDiv.appendChild(participantsUl);
}

function fillResultOverlay(result) {
  bracketResultOverlayContent.innerHTML = "";
  const h2Element = document.createElement("h2");
  h2Element.textContent = `Results of the ${date} group ${group} bracket:`;
  bracketResultOverlayContent.appendChild(h2Element);
  const olElement = document.createElement("ol");

  let counter = 1

  result.forEach((result) => {
    if (result != "") {
      const liElement = document.createElement("li");
      liElement.textContent = counter + ". " + result["name"] + " - " + result["totalPoints"];
      olElement.appendChild(liElement);
      counter++;
    }
  });

  bracketResultOverlayContent.appendChild(olElement);
}

startMatchBtn.addEventListener("click", startMatch);
submitBtn.addEventListener("click", () =>
{
  let scores = [];

  for (let input of document.querySelectorAll("#participant-points input")) {
    if (input.value != "") 
      scores.push(input.value);
  }
  openConfirm(postScore, "bracket-kata-points", null, scores)
});
//submitBtn.addEventListener("click", postScore);
