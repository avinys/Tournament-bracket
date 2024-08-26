const h2Element = document.querySelector("h2");
const startMatchBtn = document.getElementById("start-match-button");
const overlay = document.getElementById("overlay");
const aka = document.getElementById("aka");
const shiro = document.getElementById("shiro");

let akaPostWinnerData;
let shiroPostWinnerData;
const date = document.querySelector("h2").textContent.split(" ")[4];
const group = document.querySelector("h2").textContent.split(" ")[6].split(":")[0];

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
      refreshParticipantBracket();
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function refreshParticipantBracket() {
  let mainBracketDiv = document.getElementById("main-bracket");

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
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
  overlay.classList.add("active");
}

startMatchBtn.addEventListener("click", startMatch);
