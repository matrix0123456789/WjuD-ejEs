export class PExpressionText{
    constructor(expression) {
        this.expression = expression;
    }

    generateJsCode() {
        return this.expression;
    }
}
