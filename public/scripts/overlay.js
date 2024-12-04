const overlayBackground = document.getElementById("overlay");
const selectOverlayContent = document.getElementById("select-winner-overlay");
const kataPointsOverlayContent = document.getElementById("kata-points-overlay");
const resultOverlayBackground = document.getElementById("result-overlay");
const resultOverlayContent = document.getElementById("bracket-result-overlay");
const backBtn = document.getElementById("overlay-back");

overlayBackground.addEventListener("click", removeOverlay);
if (selectOverlayContent)
    selectOverlayContent.addEventListener("click", stopPropagation);

if(kataPointsOverlayContent)
    kataPointsOverlayContent.addEventListener("click", stopPropagation);

resultOverlayBackground.addEventListener("click", removeOverlay);
resultOverlayContent.addEventListener("click", stopPropagation);

backBtn.addEventListener("click", removeOverlay);

function removeOverlay(){
    resultOverlayBackground.classList.remove("active");
    overlayBackground.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function stopPropagation(){
    event.stopPropagation()
}