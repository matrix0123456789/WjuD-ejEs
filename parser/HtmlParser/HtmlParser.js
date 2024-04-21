import {PElement} from "../ParserNodes/PElement";
import {PStaticText} from "../ParserNodes/PStaticText";
import {PExpressionText} from "../ParserNodes/PExpressionText";

export class HtmlParser {
    constructor(template) {
        this.template = template;
    }

    parse() {
        const parent = document.createElement('div');
        parent.innerHTML = this.template;

        return this.traverse(parent.firstElementChild)[0]
    }

    traverse(element) {
        if (element instanceof HTMLElement) {
            const ret = new PElement();
            ret.tagName = element.tagName;
            for (const attr of element.attributes) {
                if (attr.name.startsWith('v-on-')) {
                    ret.eventListeners[attr.name.substr(5)] = attr.value;
                } else {
                    ret.staticAttributes[attr.name] = attr.value;
                }
            }
            ret.children = Array.from(element.childNodes).flatMap(child => this.traverse(child));
            return [ret];
        } else if (element instanceof Text) {
            const text = element.textContent.trim();
            let position = 0;
            let current = '';
            const ret = [];
            while (position < text.length) {
                if (text[position] === '{' && text[position + 1] === '{') {
                    if (current.length > 0) {
                        ret.push(new PStaticText(current));
                        current = '';
                    }
                    position += 2;
                    while (position < text.length) {
                        if (text[position] === '}' && text[position + 1] === '}') {
                            position += 2;
                            ret.push(new PExpressionText(current));
                            current = '';
                            break;
                        } else {
                            current += text[position];
                            position++;
                        }
                    }
                } else {
                    current += text[position];
                    position++
                }
            }
            if (current.length > 0) {
                ret.push(new PStaticText(current));
            }

            return ret;
        }
    }
}
