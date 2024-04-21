export class PElement {
    tagName = '';
    staticAttributes = {};
    eventListeners = {};
    children = [];

    generateJsCode() {
        const childrenCode = this.children.map(child => child.generateJsCode()).join(',');
        const eventsCode = Object.entries(this.eventListeners).map(([key, value]) => {
            return JSON.stringify(key) + ':' + value
        });
        const attributesCode = Object.entries(this.staticAttributes).map(([key, value]) => {
            return JSON.stringify(key) + ':' + JSON.stringify(value)
        })
        attributesCode.push(JSON.stringify('on') + ':' + '{' + eventsCode.join(',') + '}');
        let code = 'createElement(' + JSON.stringify(this.tagName) + ',{' + (attributesCode.join(', ')) + '},[' + childrenCode + '])';
        return code;
    }
}
