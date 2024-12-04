const confirmWinnerOverlay= document.getElementById("confirm-winner-overlay");
const confirmButton = document.getElementById("confirm-winner-selection");
const confirmWinnerMessage = confirmWinnerOverlay.querySelector("p")

let delegate;

function openConfirm(del, mode, winner = null, scores = null) {
    delegate = del;

    if (!confirmWinnerOverlay.classList.contains("active")) {
        confirmWinnerOverlay.classList.add("active");
    }

    if (mode === "bracket-single-elimination" || mode === "bracket-double-elimination") {
        confirmWinnerMessage.innerHTML =
            "Please confirm, that winner of the match is <b>" + winner + "</b>";
    } else if (mode === "bracket-kata-points") {
        confirmWinnerMessage.innerHTML =
            "Please confirm, that entered scores are correct <b>" +
            scores.map((score) => "|" + score + "|") +
            "</b>";
    }

    // Remove existing listener first
    confirmButton.removeEventListener("click", confirmHandler);

    // Add the event listener
    confirmButton.addEventListener("click", confirmHandler);
}

function confirmHandler() {
    if (confirmWinnerOverlay.classList.contains("active")) {
        confirmWinnerOverlay.classList.remove("active");
    }
    console.log("Confirmed, calling delegate function");
    delegate();
}