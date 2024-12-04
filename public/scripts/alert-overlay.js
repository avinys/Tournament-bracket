//const alertOverlay =  document.getElementById("alert-overlay");
//const alertOverlayButton = document.querySelector("#alert-overlay-contents button");
//const alertOverlayText = document.querySelector("#alert-overlay-contents p");

function showAlert(message) {
    alertMessageDiv.textContent = message;
    alertOverlay.classList.add("active");
}

function closeAlertDiv() {
    if (document.getElementById("alert-overlay").classList.contains("active"))
        document.querySelector("#alert-overlay-contents p").textContent = 
            "Unknown error occured. Please try to reload the page." + 
            " If error still persists, please contact the system administrator";

            document.getElementById("alert-overlay").classList.remove("active");
}


document.querySelector("#alert-overlay-contents button").addEventListener("click", closeAlertDiv);
document.getElementById("alert-overlay").addEventListener("click", closeAlertDiv);
document.getElementById("alert-overlay-contents").addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the event from bubbling to the overlay
});
