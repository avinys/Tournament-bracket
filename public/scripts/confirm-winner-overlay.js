const confirmWinnerOverlay= document.getElementById("confirm-winner-overlay");
const confirmButton = document.getElementById("confirm-winner-selection");
const confirmWinnerMessage = confirmWinnerOverlay.querySelector("p");
const cancelConfirmWinnerButton = document.getElementById("cancel-confirm-winner-selection");
const confirmWinnerOverlayContents = document.getElementById("confirm-winner-overlay-contents");

let delegate;

function closeConfirm() {
    if (confirmWinnerOverlay.classList.contains("active")) {
        confirmWinnerOverlay.classList.remove("active");
    }
}

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

    confirmButton.removeEventListener("click", confirmHandler);
    confirmButton.addEventListener("click", confirmHandler);
}

function confirmHandler() {
    closeConfirm();
    console.log("Confirmed, calling delegate function");
    delegate();
}

cancelConfirmWinnerButton.addEventListener("click", closeConfirm);
confirmWinnerOverlay.addEventListener("click", closeConfirm);
confirmWinnerOverlayContents.addEventListener("click", (event) => {
    event.stopPropagation();
});