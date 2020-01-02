// helper function for debugging in browser
function dif(i) {
    AFRAME.scenes[0].emit('setDifficulty', { difficulty: i });
}
function start(b) {
    AFRAME.scenes[0].emit('setStarted', { started: b });
}
function debug() {
    document.getElementById("starting-room-front").setAttribute('visible', false)
    document.getElementById("player").removeAttribute('kinema-body')
}

function nextLevel() {
    document.getElementById("amaze").emit('gameOver');
}
