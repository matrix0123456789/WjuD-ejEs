import {HtmlParser} from "../parser/HtmlParser/HtmlParser";
import {createElement as _createElement} from "./VNodeGenerator";

export class Wju {
    $currentContextStack = [];
    $reactivityDependency = new Map();
    $watchers = new Map();
    $computedCache = new Map();
    $proxy = null;

    constructor(config) {
        if (config.template) {
            const parser = new HtmlParser(config.template);
            console.log({parser})
            const parsed = parser.parse();
            console.log({parsed})
            const renderFunction = parsed.generateJsCode();
            console.log({renderFunction})
            this.$render= function () {
                const createElement = _createElement;
                return eval(renderFunction);
            }
        }else{
            this.$render = config.render;
        }
        if (config.data) {
            Object.assign(this, config.data());
        }
        if (config.computed) {
            for (const key in config.computed) {
                Object.defineProperty(this, key, {
                    get: () => {
                        if (this.$computedCache.has(key)) {
                            return this.$computedCache.get(key);
                        } else {
                            const value = this.$executeWatch(key, config.computed[key].bind(this.$proxy));
                            this.$computedCache.set(key, value);
                            return value;
                        }
                    }
                })
                this.$setWatch(key, () => {
                    console.log('watchComputed')
                    this.$computedCache.delete(key);
                });
            }
        }
        if (config.methods) {
            for (const key in config.methods) {
                this[key] = config.methods[key];
            }
        }
        if (config.watch) {
            for (const key in config.watch) {
                this.$setWatch(key, () => config.watch[key].apply(this.$proxy))
            }
        }
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
        const vnode = this.$executeWatch('$render', () => this.$render());
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
            const popped = this.$currentContextStack.pop();
            if (popped !== executionContext) {
                throw new Error('Stack corrupted')
            }
            this.$reactivityDependency.set(name, executionContext.touchedProperties);
        }
    }
}

class WjuProxyHandler {
    changeListeners = new Map();

    constructor(obj) {
        this.obj = obj;
    }

    get(target, prop, receiver) {
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
        target[prop] = value;

        for (const listener of target.$watchers.get(prop) ?? []) {
            listener();
        }
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
    const proxy = new Proxy(obj, proxyHandler);
    obj.$proxy = proxy;
    return proxy;
}
