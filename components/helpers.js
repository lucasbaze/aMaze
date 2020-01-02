// helper function for debugging in browser
function dif(i) {
    AFRAME.scenes[0].emit('setDifficulty', { difficulty: i });
}
function start(b) {
    AFRAME.scenes[0].emit('setStarted', { started: b });
}
function debug(b) {
    document.getElementById("starting-room-front").setAttribute('visible', false)
}
