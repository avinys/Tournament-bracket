//const alertOverlay =  document.getElementById("alert-overlay");
const alertOverlayButton = document.querySelector("#alert-overlay-contents button");
//const alertOverlayText = document.querySelector("#alert-overlay-contents p");

function closeAlertDiv() {
    if (alertOverlay.classList.contains("active"))
        alertOverlayText.textContent = 
            "Unknown error occured. Please try to reload the page." + 
            " If error still persists, please contact the system administrator";

            alertOverlay.classList.remove("active");
}

alertOverlayButton.addEventListener("click", closeAlertDiv);
alertOverlay.addEventListener("click", closeAlertDiv);
