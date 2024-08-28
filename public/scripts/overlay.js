const overlayBackground = document.getElementById("overlay");
const overlayContent = document.getElementById("select-winner-overlay");
const resultOverlayBackground = document.getElementById("result-overlay");
const resultOverlayContent = document.getElementById("bracket-result-overlay");

overlayBackground.addEventListener("click", () => {
    overlayBackground.classList.remove("active");
});
overlayContent.addEventListener("click", () => {
    event.stopPropagation()
})

resultOverlayBackground.addEventListener("click", () => {
    resultOverlayBackground.classList.remove("active");
});
resultOverlayContent.addEventListener("click", () => {
    event.stopPropagation()
})