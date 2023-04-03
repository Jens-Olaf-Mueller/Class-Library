import Library from './library_class.js';

const MEM_DISPLAY = 'divMemDisplay',
      PREV_OPERAND = 'divPrevOperand',
      CURR_OPERAND = 'divCurrOperand';

class Calculator extends Library {
    #element = null;
    #buttons;
    get executeOperators() { return 'n! x² √ ± % 1/x'; } 

    #currOpDisplay;
    #prevOpDisplay;
    #memDisplay;
    get currOperandDisplay() { return this.#currOpDisplay.innerText; }
    set currOperandDisplay(value) {
        this.#currOpDisplay.innerText = value;
    }

    get prevOperandDisplay() { return this.#prevOpDisplay; }
    set prevOperandDisplay(value) {
        this.#prevOpDisplay.innerText = value;
    }

    get memDisplay() { return this.#memDisplay; }
    set memDisplay(text) {
        this.#memDisplay.innerText = text;
    }
    
    get currValue() { 
        return parseFloat(this.currentOperand.toString().replace(this.decSeparator, '.')); 
    }
    get prevValue() { 
        return parseFloat(this.previousOperand.toString().replace(this.decSeparator, '.')); 
    }


    currentOperand;
    previousOperand;
    
    operation;
    memory = null;
    error = false;
    calcDone = false;

    get opIsPending() {return this.operation !== null;}

    /**
     * Returns the decimal separator of the local system.
     * this works in FF, Chrome, IE, Safari and Opera
     */
    get decSeparator() {
        let decSep = '.'; // fallback
        try {            
            const sep = parseFloat(3/2).toLocaleString().substring(1,2);
            if (sep === '.' || sep === ',') decSep = sep;  
        } catch(err) {
            console.warn('local decimal separator is ' + sep);
        }
        return decSep;
    }

    get element() { return this.#element; }

    get buttons() { return this.#buttons; }
 
    constructor(styleSheet, parent) {
        super(styleSheet);
        this.parent = (parent == undefined) ? document.body : parent;
        this.#render();
        this.#setEventListeners();
        this.clear();
    }

    show() {
        
    }

    hide() {
        this.cssAddStyle(this.element, 'display: none;')
    }

    /**
     * reset the calculator to a defined state
     */
    clear() {
        this.currentOperand = '0';
        // this.currentOperand = 'Math.sqrt((12 + 8)* 4 + 20)'; // testing eval
        this.previousOperand = '';
        this.operation = null;
        this.error = false;
        // this.error = 'Division by zero';        
        this.calcDone = false;
        this.updateDisplay();
    }

    /**
     * delete the last input
     */
    delete() {
        if (this.error) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand.endsWith(this.decSeparator)) this.currentOperand = this.currentOperand.slice(0, -1);
        if (this.currentOperand.length == 0) this.currentOperand = '0';
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.error) this.operation = null;
        this.currOperandDisplay = (this.error) ? this.error : this.#formatNumber(this.currentOperand);
        this.prevOperandDisplay = this.operation ? `${this.#formatNumber(this.previousOperand)} ${this.operation}` : this.error ? 'Error' : '';
        this.memDisplay = this.memory ? 'M' : '';
    }

    #formatNumber(number) {
        // console.log(this.evaluate(this.currentOperand))
        const term = number.toString().replace('.', this.decSeparator),
        openBracket = term.indexOf('('),
        closeBracket = term.indexOf(')'),
        stringNumber = term.replace(/[()]/g, ''),
        integerDigits = parseFloat(stringNumber.split(this.decSeparator)[0]),
        decimalDigits = stringNumber.split(this.decSeparator)[1];
  
        let integer = '';
        if (!isNaN(integerDigits)) {
            integer = integerDigits.toLocaleString('de', {maximumFractionDigits: 0});
        }

        // adding the removed brackets again:
        if (openBracket != -1) {
            integer = integer.substring(0, openBracket) + '(' + integer.substring(openBracket);
            if (closeBracket != -1 && !decimalDigits) {
                integer = integer.substring(0, closeBracket) + ')' + integer.substring(closeBracket);
            }
        }

        if (!decimalDigits) return integer;
        let output = `${integer}${this.decSeparator}${decimalDigits}`;
        if (closeBracket != -1) output = output.substring(0, closeBracket) + ')' + output.substring(closeBracket);
        return output;

        // if (decimalDigits != null) {
        //     return `${integer}${this.decSeparator}${decimalDigits}`;
        // } else {
        //     return integer;
        // }
    }

    /**
     * Appends a number as current digit to the display.
     * @param {string} number Numerical string or PI
     */
    appendNumber(number) {
        if (this.error) return;
        const PI = Math.PI.toString().replace('.', this.decSeparator);
        if (number == 'π') {
            number = PI;
            this.currentOperand = ''; // don't add PI behind existing digits!
        }
        // allow only ONE decimal separator!
        if (number === this.decSeparator) {
            if (this.currentOperand.includes(this.decSeparator) && this.currentOperand != this.previousOperand) return;
            number = this.decSeparator;            
        } 
        // make sure that first operator keeps in correct place in display
        if (!this.opIsPending || this.currentOperand != this.previousOperand) {
            if (this.calcDone) {
                this.currentOperand = '';
                this.calcDone = false;
            }
            // avoid inputs like 0815 and don't allow digtits after PI!
            if (this.currentOperand == '0'|| this.currentOperand == PI) this.currentOperand = '';          
            // if (this.currentOperand.toString() == PI) this.currentOperand = ''; // 
            this.currentOperand = this.currentOperand.toString() + number.toString();
        } else {
            // add a leading 0 if input is just the decimal seperator
            if (number == this.decSeparator) number = '0' + this.decSeparator;
            this.currentOperand = number.toString();
        }        
        this.updateDisplay();
    }

    evaluateOperation(operation) {
        if (this.error || this.currentOperand == '') return;
        if (this.executeOperators.includes(operation)) {            
            this.compute(operation);
            return;
        }
        if (this.previousOperand !== '') {
            this.compute(); 
            this.calcDone = false; // allow chain computing with previous result!
        } 
        if ('()'.includes(operation)) {
            operation = this.checkForBrackets(operation)
            debugger
            this.currentOperand = (operation == '(') ? operation + this.currentOperand : this.currentOperand +operation;
            operation = null;
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.updateDisplay();
    } 

    checkForBrackets() {
        if (this.previousOperand.indexOf('(') == -1 || 
            this.previousOperand.indexOf('(') != -1 && 
            this.previousOperand.indexOf(')') != -1 && 
            this.previousOperand.lastIndexOf('(') < this.previousOperand.lastIndexOf(')'))
            return '(';
        if (this.previousOperand.indexOf('(') != -1 && 
            this.previousOperand.indexOf(')') == -1 || 
            this.previousOperand.indexOf('(') != -1 &&
            this.previousOperand.indexOf(')') != -1 &&
            this.previousOperand.lastIndexOf('(') > this.previousOperand.lastIndexOf(')'))
            return ')';
        return '';
    }

    executeMemoryOperation(memOp) {
        if (this.error) return;
        switch (memOp) {
            case 'R':  if (this.memory) this.currentOperand = this.memory;               
                break;
            case 'S': this.memory = parseFloat(this.currentOperand);
                break;
            case 'C': this.memory = null;
                break;
            case '+': this.memory += parseFloat(this.currentOperand);
                break;
            case '-': this.memory -= parseFloat(this.currentOperand);
                break;
            default:
                break;
        }
        this.updateDisplay();
    }

    compute(operation) {
        if (operation !== undefined) {
            this.executeSingleOpCalculation(operation);
            return;
        }
        // make sure we got some operands:
        if (isNaN(this.prevValue) || isNaN(this.currValue)) return;
        let result;
        switch (this.operation.charCodeAt(0)) {            
            case 43: result = this.prevValue + this.currValue;  // add              
                break;
            case 45: result = this.prevValue - this.currValue;  // minus            
                break;
            case 215: result = this.prevValue * this.currValue; // times             
                break;
            case 247:                                           // divide
                result = this.prevValue / this.currValue;  
                if (result === Infinity) this.error = 'Division by zero';
                break;
            default: return;
        }
        if (!this.error) this.currentOperand = this.round(result, 12).toString();
        this.operation = null;
        this.previousOperand = ''
        this.calcDone = true;
        this.updateDisplay();
    }

    executeSingleOpCalculation(operation) {
        switch (operation) {
            case 'x²': this.currentOperand = this.round(Math.pow(this.currValue, 2), 12).toString();                            
                break;
            case '±': this.currentOperand = (this.currValue * -1).toString();
                break;
            case '1/x': 
                if (this.currValue == 0) {
                    this.error = 'Division by zero';
                } else {
                    this.currentOperand = (1 / this.currValue).toString();
                } 
                break;
            case '%': 
                this.currentOperand = (this.currValue / 100).toString();
                this.compute();
                break;
            case '√': 
                if (this.currValue < 0) {
                    this.error = 'Negative root';
                } else {
                    this.currentOperand = Math.sqrt(this.currValue).toString();
                }                
                break;
            case 'n!':
                this.operation = this.currentOperand + '!';
                this.currentOperand = this.factorial(this.currValue);                       
                break;
            default:
                break;
        }
        this.calcDone = (!this.error && operation !== '±' && operation !== 'n!');
        this.updateDisplay();
    }

    factorial(number) {        
        if (number.toLocaleString().includes(this.decSeparator) || number < 0) {
            this.error = 'Not defined';
            return;
        }
        if (number == 0 || number == 1) return 1;    
        let result = number;    
        while (number > 1) { 
            number--;
            result *= number;
        }
        if (result == Infinity) this.error = 'Overflow';
        return result;
    }

    evaluate(expression) {
        return Function(`'use strict'; return (${expression})`)()
    }

    round(value, decimals = 0) {
        const factor10 = Math.pow(10, decimals);
        let retVal = Math.round((value + Number.EPSILON) * factor10) / factor10;
        return retVal;
    }

    #render() {
        const pod = document.createElement('div');
        this.setAttributes(pod, {class: 'calculator-parent'});
        const grid = document.createElement('div');
        this.setAttributes(grid, {class: 'calculator-grid'});
        const output = document.createElement('div');
        this.setAttributes(output, {class: 'output'});

        grid.appendChild(output);
        pod.appendChild(grid);
        this.parent.appendChild(pod);

        this.#createDisplay(output);
        this.#createButtons(grid);
        this.#createMemButtons();
        this.#createNumButtons();
        this.#createSpecialButtons();   // ATTENTION! Must be BEFORE operators!
        this.#createOperatorButtons();  // OP-buttons are the ones that are left in the DOM!
    }

    #createDisplay(parentNode) {
        const arrM = [
            {id: MEM_DISPLAY, class: 'mem-display'},
            {id: PREV_OPERAND, class: 'prev-operand-txt'},
            {id: CURR_OPERAND, class: 'curr-operand-txt'}
        ].forEach(item => {
            const div = document.createElement('div');
            this.setAttributes(div, item);
            parentNode.appendChild(div);       
        });
        this.#currOpDisplay = document.getElementById(CURR_OPERAND);
        this.#prevOpDisplay = document.getElementById(PREV_OPERAND);        
        this.#memDisplay = document.getElementById(MEM_DISPLAY);
    }

    #createButtons(parentNode) {
        for (let i = 0; i < 32; i++) {
            parentNode.appendChild(document.createElement('button'));         
        }
        this.#buttons = Array.from(document.querySelectorAll('.calculator-grid >button'));
    }

    #createMemButtons() {        
        const captions = ['MR','MS','MC','M+','M-'];
        for (let i = 0; i < 5; i++) {
            this.buttons[i].appendChild(document.createTextNode(`${captions[i]}`));
            this.setAttributes(this.buttons[i], {'data-memory': '', class: 'btn-memory'})         
        }
    }

    #createNumButtons() {
        let dgt = 4, row = -1;        
        for (let i = 30; i > 12; i--) {
            const isPi = (i == 13), mod = (i-3) % 5,
                  skip = ( mod == 0 || mod == 4) && !isPi ? true : false;
            if (mod == 0) {                
                row++;
                dgt = 3; 
            }
            if (!skip) {
                const btn = this.buttons[i], isComma = (i == 30), 
                      text = isComma ? ',' : isPi ? 'π' : row * 3 + dgt;
                btn.appendChild(document.createTextNode(text));
                this.setAttributes(btn, {'data-number': ''});
                if (text == 0) this.setAttributes(btn, {class: 'span2'});
                if (isPi) this.setAttributes(btn, {class: 'btn-operator'});
                dgt--;
            }
        }
    }

    #createSpecialButtons() {
        const arrSpecials = [
            {index: 5, caption: 'AC', attributes: {class: 'btn-special span2', 'data-allclear': ''}},
            {index: 8, caption: 'DEL', attributes: {class: 'btn-special', id: 'btnDelete', 'data-delete': ''}},
            {index: 28, caption: '=', attributes: {class: 'btn-equals col-span2', id: 'btnEquals', 'data-equals': ''},
        }].forEach(item => {
            const btn = this.buttons[item.index];
            btn.appendChild(document.createTextNode(item.caption));
            this.setAttributes(btn, item.attributes);
        });
    }    

    #createOperatorButtons() {
        const arrOperators = Array.from(document.querySelectorAll('.calculator-grid >button')).filter((btn) => {
            return btn.attributes.length == 0;
        });
        const arrCaptions = '( ) n! x² √ ± &#247 % &#215 1/x - +'.split(' ');
        for (let i = 0; i < arrOperators.length; i++) {
            arrOperators[i].innerHTML = arrCaptions[i];
            const exec = this.executeOperators.includes(arrCaptions[i]) ? 'execute' : '';
            this.setAttributes(arrOperators[i], {class: 'btn-operator', 'data-operator': `${exec}`});
        }
    }

    #setEventListeners() {
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.appendNumber(btn.innerText);
            });
        });
        document.querySelectorAll('[data-memory]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeMemoryOperation(btn.innerText.slice(-1));
            });
        });

        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.evaluateOperation(btn.innerText);
            })
        })

        document.querySelectorAll('[data-allclear]')[0].addEventListener('click', () => this.clear());
        document.querySelectorAll('[data-delete]')[0].addEventListener('click', btn => this.delete());
        document.querySelectorAll('[data-equals]')[0].addEventListener('click', btn => this.compute());
        
    }
}                 

export default Calculator;