const h2Element = document.querySelector("h2");
const startMatchBtn = document.getElementById("start-match-button");
const overlay = document.getElementById("overlay");
const overlayContents = document.getElementById("select-winner-overlay");
const overlayHeader = document.querySelector("#select-winner-overlay h2");

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
    scores.push(input.value);
    input.value = "";
  }

  console.log("Scores in postScore() script: ", scores);

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
      if (data["isEnd"] == true) {
        startMatchBtn.textContent = "View Results";
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

startMatchBtn.addEventListener("click", startMatch);
submitBtn.addEventListener("click", postScore);
