export class Wju {
    constructor(config) {
        if (config.data) {
            Object.assign(this, config.data());
        }
        if(config.computed){
            for(const key in config.computed) {
                Object.defineProperty(this, key, {
                    get: config.computed[key].bind(this)
                })
            }
        }
        if(config.methods){
            for(const key in config.methods) {
                this[key] = config.methods[key].bind(this);
            }
        }
        this.$render = config.render;
    }

    $mount(parentElement) {
        this.$update();
        parentElement.appendChild(this.$el);
    }

    $update() {
        const vnode = this.$render();
        console.log(vnode);
        const oldElement = this.$el;
        this.$el = vnode.render(oldElement);
        if (oldElement && oldElement !== this.$el) {
            oldElement.replaceWith(this.$el);
        }
    }
}
