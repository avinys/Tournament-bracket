const overlayBackground = document.getElementById("overlay");
const overlayContent = document.getElementById("select-winner-overlay");

overlayBackground.addEventListener("click", () => {
    overlayBackground.classList.remove("active");
});
overlayContent.addEventListener("click", () => {
    event.stopPropagation()
})