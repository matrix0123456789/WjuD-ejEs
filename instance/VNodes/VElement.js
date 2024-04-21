export class VElement {
    constructor(tagName, args, children) {
        this.tagName = tagName;
        this.arguments = args;
        this.children = children;
    }

    render(component, oldElement = null) {
        let ret = document.createElement(this.tagName);
        for (const key in this.arguments) {
            if (key == 'on') {
                for (const event in this.arguments[key]) {
                    ret.addEventListener(event, this.arguments[key][event].bind(component));
                }
            } else {
                ret.setAttribute(key, this.arguments[key]);
            }
            console.log({key})
        }
        for (const child of this.children) {
            if (child instanceof VElement)
                ret.appendChild(child.render(component));
            else
                ret.append(child)
        }
        return ret;
    }
}
