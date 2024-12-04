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
      //console.log(data);
      if (data["isEnd"]) {
        startMatchBtn.textContent = "View Results";
        fillResultOverlay(data["receivedData"]);
        if (!bracketResultOverlay.classList.contains("active"))
          bracketResultOverlay.classList.add("active");
        if(finalNoticeDiv.classList.contains("active"))
          finalNoticeDiv.classList.remove("active");
      } else {
        //console.log("Data received (startMatch):", data);
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
  //console.log("Scores in postScore() script: ", scores);

  if (scores.length < 3) {
    showAlert("Please add points for at least 3 judges.");
    return;
  } else if (scores.filter((score) => score > 9.9 || score < 0.0).length > 0) {
    showAlert("All scores must be between 0 and 9.9, inclusive.");
    return;
  }else {
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
      console.log("Received data(postScore front): " + JSON.stringify(data));
      if (overlay.classList.contains("active"))
        overlay.classList.remove("active");
      if (bracketResultOverlay.classList.contains("active"))
        bracketResultOverlay.classList.remove("active");

      if(data["participants"][data["participants"].length - 1].length <= 4 && data["isFinal"] != true)
        location.reload()

      if(data["isFinal"] == true) {
        if (!finalNoticeDiv.classList.contains("active")) 
          finalNoticeDiv.classList.add("active");
        //console.log("Pagautas isFinal ir pakeistas")
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
  mainBracketDiv.innerHTML = ""; // Clear existing content

  for (let roundIndex = 0; roundIndex < scores.length; roundIndex++) {
    // Create and append the heading for the round
    const roundHeading = document.createElement("h3");
    roundHeading.textContent = `Round ${roundIndex + 1}`;
    mainBracketDiv.appendChild(roundHeading);

    // Create the table for the round
    const table = document.createElement("table");
    table.id = `participant-table-kata-points-round-${roundIndex}`;

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    let headers = ["Participant's name", "Current round points", "Points in total"];
    for (let header of headers) {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");

    // Add participants for the round
    for (let participant of scores[roundIndex]) {
      const row = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = participant.name;
      row.appendChild(tdName);

      const tdRoundScore = document.createElement("td");
      tdRoundScore.textContent = participant.currentRoundPoints;
      row.appendChild(tdRoundScore);

      const tdTotalScore = document.createElement("td");
      tdTotalScore.textContent = participant.totalPoints;
      row.appendChild(tdTotalScore);

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    mainBracketDiv.appendChild(table);
  }
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
      liElement.textContent =  result["name"] + " - " + result["totalPoints"];
      olElement.appendChild(liElement);
      counter++;
    }
  });

  bracketResultOverlayContent.appendChild(olElement);
  const close = document.createElement("button")
  close.textContent = "Close"
  close.addEventListener("click", removeOverlay);
  bracketResultOverlayContent.appendChild(close);
}

startMatchBtn.addEventListener("click", startMatch);
submitBtn.addEventListener("click", () =>
{
  let scores = [];

  for (let input of document.querySelectorAll("#participant-points input")) {
    if (input.value != "") 
      scores.push(input.value);
  }
  console.log("Po paspaudimo atidarom patvirtinima")
  openConfirm(postScore, "bracket-kata-points", null, scores)
});
//submitBtn.addEventListener("click", postScore);
