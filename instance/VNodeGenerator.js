import {VElement} from "./VNodes/VElement";

export function createElement(tagName, args, children){
return new VElement(tagName, args, children)
}
