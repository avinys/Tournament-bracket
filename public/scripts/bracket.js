const h2Element = document.querySelector("h2");
const startMatchBtn = document.getElementById("start-match-button");
const overlay = document.getElementById("overlay");
const aka = document.getElementById("aka");
const shiro = document.getElementById("shiro");
const bracketResultOverlayContent = document.getElementById(
  "bracket-result-overlay"
);
const bracketResultOverlay = document.getElementById("result-overlay");

let akaPostWinnerData;
let shiroPostWinnerData;
const date = document.getElementById("bracket-name").textContent.split(" ")[4];
const group = document
  .getElementById("bracket-name")
  .textContent.split(" ")[6]
  .split(":")[0];

let addEventListenerToParticipantsFlag = false;

async function postWinner(index) {
  await fetch("/bracket/next", {
    method: "POST", // Specify the request method
    headers: {
      "Content-Type": "application/json", // Specify the content type
    },
    body: JSON.stringify({ winnerIndex: index }), // Convert the data to a JSON string
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON from the response
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
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function akaButtonParticipantFunction() {
  postWinner(akaPostWinnerData);
}

function shiroButtonParticipantFunction() {
  postWinner(shiroPostWinnerData);
}

async function startMatch() {
  let participantOne;
  let participantTwo;

  await fetch("/bracket/next", {
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
        if (bracketResultOverlay.classList.contains("active"))
          bracketResultOverlay.classList.remove("active");
        bracketResultOverlay.classList.add("active");
      } else {
        if (
          data["receivedData"] != [[], []] &&
          data["receivedData"][0].length != 1
        ) {
          aka.textContent = data["receivedData"][0][0];
          shiro.textContent = data["receivedData"][0][1];
          console.log("Data received:", data); // Handle the response data from the server
          akaPostWinnerData = data["receivedData"][1][0];
          shiroPostWinnerData = data["receivedData"][1][1];
          if (!addEventListenerToParticipantsFlag) {
            aka.addEventListener("click", akaButtonParticipantFunction);
            shiro.addEventListener("click", shiroButtonParticipantFunction);
            addEventListenerToParticipantsFlag = true;
          }
          overlay.classList.add("active");
        }
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function fillResultOverlay(result) {
  bracketResultOverlayContent.innerHTML = "";
  const h2Element = document.createElement("h2");
  h2Element.textContent = `Results of the ${date} group ${group} bracket:`;
  bracketResultOverlayContent.appendChild(h2Element);
  const olElement = document.createElement("ol");

  result.forEach((result) => {
    if (result != "") {
      const liElement = document.createElement("li");
      liElement.textContent = result;
      olElement.appendChild(liElement);
    }
  });

  bracketResultOverlayContent.appendChild(olElement);
}

startMatchBtn.addEventListener("click", startMatch);
