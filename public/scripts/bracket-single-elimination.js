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

const nextUpContentDiv = document.getElementById("next-up-content");
const bracketContainer = document.getElementById("bracket-container");

let addEventListenerToParticipantsFlag = false;
let akaEventHandler = null;
let shiroEventHandler = null;

async function postWinner(index) {
  await fetch("/bracket-single-elimination/next", {
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
      generateBracket(data["sections"], data["results"]);
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

  await fetch("/bracket-single-elimination/next", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
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
          Array.isArray(data["receivedData"][0])
        ) {
          aka.textContent = data["receivedData"][0][0];
          shiro.textContent = data["receivedData"][0][1];
          console.log("Data received:", data);
          akaPostWinnerData = data["receivedData"][1][0];
          shiroPostWinnerData = data["receivedData"][1][1];

          // Re-add eventListeners on aka and shiro

          if (akaEventHandler)
            aka.removeEventListener("click", akaEventHandler);
          if (shiroEventHandler)
            shiro.removeEventListener("click", shiroEventHandler);

          akaEventHandler = () =>
            openConfirm(
              akaButtonParticipantFunction,
              "bracket-single-elimination",
              data["receivedData"][0][0]
            );
          shiroEventHandler = () =>
            openConfirm(
              shiroButtonParticipantFunction,
              "bracket-single-elimination",
              data["receivedData"][0][1]
            );

          aka.addEventListener("click", akaEventHandler);
          shiro.addEventListener("click", shiroEventHandler);
          // aka.addEventListener("click", akaButtonParticipantFunction);
          // shiro.addEventListener("click", shiroButtonParticipantFunction);
          addEventListenerToParticipantsFlag = true;
          overlay.classList.add("active");
        } else if (!Array.isArray(data["receivedData"][0])) location.reload();
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
  getNextUp();
}

async function getNextUp() {
  await fetch("/bracket-single-elimination/next-up", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      fillNextUp(data["data"]);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function fillNextUp(data) {
  let header = "<h3>Next up:</h3>";
  let AKA = "<p><b>AKA: </b>";
  let SHIRO = "<p><b>SHIRO: </b>";
  if (data == null) {
    nextUpContentDiv.innerHTML = "<h3>No more upcomming fights</h3>";
  } else if (data == "&&") return;
  else {
    if (data[0] != "##" && data[0] != "!!") AKA += data[0] + "</p>";
    else if (data[0] == "##") AKA += "***Winner of current fight***" + "</p>";
    else AKA += "***Loser of current fight***" + "</p>";

    if (data[1] != "##" && data[1] != "!!") SHIRO += data[1] + "</p>";
    else if (data[1] == "##") SHIRO += "***Winner of current fight***" + "</p>";
    else SHIRO += "***Loser of current fight***" + "</p>";

    nextUpContentDiv.innerHTML = `
      ${header}
      ${AKA}
      ${SHIRO}
    `;
  }
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
  const close = document.createElement("button");
  close.textContent = "Close";
  close.addEventListener("click", removeOverlay);
  bracketResultOverlayContent.appendChild(close);
}

document.addEventListener("DOMContentLoaded", () => {
  generateBracket(sections, results);
  getNextUp();
});
startMatchBtn.addEventListener("click", startMatch);
