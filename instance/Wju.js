export class Wju {
    $currentContextStack = [];
    $reactivityDependency = new Map();
    $watchers = new Map();

    constructor(config) {
        if (config.data) {
            Object.assign(this, config.data());
        }
        if (config.computed) {
            for (const key in config.computed) {
                Object.defineProperty(this, key, {
                    get: config.computed[key]
                })
            }
        }
        if (config.methods) {
            for (const key in config.methods) {
                this[key] = config.methods[key];
            }
        }
        this.$render = config.render;
    }

    $mount(parentElement) {
        this.$update();
        parentElement.appendChild(this.$el);
        this.$setWatch('$render', () => {
           this.$update()
        })
    }

    $setWatch(name, fun) {
        if (!this.$watchers.has(name)) {
            this.$watchers.set(name, new Set());
        }
        this.$watchers.get(name).add(fun);
    }

    $update() {
        console.log('update')
        const vnode = this.$executeWatch('$render', () => this.$render());
        console.log(vnode);
        const oldElement = this.$el;
        this.$el = vnode.render(this, oldElement);
        if (oldElement && oldElement !== this.$el) {
            oldElement.replaceWith(this.$el);
        }
    }

    $executeWatch(name, fun) {
        const executionContext = {touchedProperties: new Set()};
        this.$currentContextStack.push(executionContext);
        try {
            return fun()
        } finally {
            console.log('aaaaaaaa')
            const popped = this.$currentContextStack.pop();
            if (popped !== executionContext) {
                throw new Error('Stack corrupted')
            }
            this.$reactivityDependency.set(name, executionContext.touchedProperties);
        }
    }
}

class WjuProxyHandler {
    cache = new Map();
    changeListeners = new Map();

    constructor(obj) {
        this.obj = obj;
    }

    get(target, prop, receiver) {
        console.log({target, prop, receiver})
        const context = target.$currentContextStack[target.$currentContextStack.length - 1];
        if (context) {
            context.touchedProperties.add(prop);
        }
        if (prop in target) {
            return target[prop];
        }
        return Reflect.get(target, prop, receiver);
    }

    set(target, prop, value, receiver) {

        console.log({target, prop, value, receiver})
        target[prop] = value;

        for (const [listeningKey, set] of target.$reactivityDependency) {
            if (set.has(prop)) {
                for (const listener of target.$watchers.get(listeningKey) ?? []) {
                    listener();
                }
            }
        }

        return true;
    }
}

export function createWjuInstance(config) {
    const obj = new Wju(config);
    const proxyHandler = new WjuProxyHandler(obj);
    return new Proxy(obj, proxyHandler);
}
