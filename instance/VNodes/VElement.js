export class VElement {
    constructor(tagName, attributes, children) {
        this.tagName = tagName;
        this.attributes = attributes;
        this.children = children;
    }

    render(component, oldElement = null) {
        let ret = document.createElement(this.tagName);
        for (const key in this.attributes) {
            if (key == 'on') {
                for (const event in this.attributes[key]) {
                    ret.addEventListener(event, this.attributes[key][event].bind(component));
                }
            } else {
                ret.setAttribute(key, this.attributes[key]);
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
