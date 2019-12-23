AFRAME.registerComponent('logger', {
    init: function() {
        console.dir(this.el);
        console.log(this.data);
        this.el.addEventListener('collide', e => {
            console.dir(e);
        });
    },
});
