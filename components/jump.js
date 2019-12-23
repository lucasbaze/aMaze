AFRAME.registerComponent('jump', {
    init: function() {
        this.listener = this.onKeyUp.bind(this);
        this.attachEventListeners();
    },
    attachEventListeners: function() {
        window.addEventListener('keyup', this.listener);
    },
    onKeyUp: function() {
        if (event.keyCode == 32) {
            this.el.body.velocity.set(0, 20, 0);
        }
    },
});
