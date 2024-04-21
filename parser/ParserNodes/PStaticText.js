export class PStaticText {
    constructor(text) {
        this.text=text;
    }

    generateJsCode() {
        return JSON.stringify(this.text);
    }
}
