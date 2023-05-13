import Library from './library_class.js';
import { $ } from '../library.js';

const CALC_POD = 'divCalculator',
      CALC_GRID = 'divGrid',
      CALC_DISPLAY = 'divOutput',
      MEM_DISPLAY = 'divMemDisplay',
      PREV_OPERAND = 'divPrevOperand',
      CURR_OPERAND = 'divCurrOperand';

class Calculator extends Library {
    #calculator;
    #buttons;
    #currOpDisplay;
    #prevOpDisplay;
    #memDisplay;
    #buddy = null;
    #opsCount = 0;
    get operatorSwitched() { return this.#opsCount > 1; }

    get executeOperators() { return 'n! x² √ ± % 1/x'; } 

    get result() { return this.#currOpDisplay.innerText;}

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

    get buddy() { return this.#buddy; }
    set buddy(newBuddy) {
        const buddy = this.getElement(newBuddy);
        if (buddy instanceof HTMLElement && 
            buddy.tagName.toLocaleLowerCase() == 'input' && 
            (buddy.getAttribute('type') == 'number' || buddy.getAttribute('type') == 'text')){
                this.#buddy = buddy;
        }
    }

    get operandsDifferent() { return this.currentOperand != this.previousOperand && this.previousOperand != ''; }

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

    get calculator() { return this.#calculator; }

    get buttons() { return this.#buttons; }
 
    constructor(styleSheet, parent) {
        super(styleSheet);
        this.parent = (parent == undefined) ? document.body : parent;
    }

    /**
     * Displays the calculator on screen.
     * @param {string} displayMode Either 'fullscreen' (default) or 'popup'
     * @param {HTMLElement} buddy Corresponding input-element to receive the result
     */
    show(buddy, displayMode = 'fullscreen') {
        this.#render(buddy);
        this.buddy = buddy;       
        this.#setEventListeners();        
        this.clear();
        if (this.buddy && this.buddy.value) {
            this.currentOperand = this.buddy.value;
            this.updateDisplay();
        }
    }

    hide(event) {
        if (event && (event.target == this.calculator && !this.buddy) || 
            event.target == this.buttons[32]) {
            this.calculator.remove();
            this.#buddy = null;
        }        
    }

    returnValue(event) {
        if (!this.calcDone) this.compute();
        this.buddy.value = this.error ? '' : this.result;
        this.hide(event);
    }

    /**
     * reset the calculator to a defined state
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.error = false;      
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
        if (this.error) {
            this.prevOperandDisplay = 'Error';
            this.currOperandDisplay = this.error;
            this.operation = null;
        } else {
            this.prevOperandDisplay = this.operation ? this.#formatNumber(this.previousOperand) + this.operation : this.previousOperand;
            this.currOperandDisplay = this.#formatNumber(this.currentOperand);
        }
        this.memDisplay = this.memory ? 'M' : '';
    }

    #formatNumber(number) {
        // console.log(this.evaluate(this.currentOperand))
        const term = number.toString().replace('.', this.decSeparator),
        openBracket = term.indexOf('('),
        closeBracket = term.indexOf(')'),
        stringNumber = term.replace(/[()]/g, ''),
        decimalDigits = stringNumber.split(this.decSeparator)[1],
        integerDigits = isNaN(decimalDigits) ? parseInt(stringNumber) : parseFloat(stringNumber.split(this.decSeparator)[0]);

        const therm = {
            separator: this.decSeparator,
            stringNumber: term.replace(/[()]/g, ''),
            bracket: {
                open: {position: term.indexOf('('), get exists() {return this.position > -1}},
                close: {position: term.indexOf(')'),get exists() {return this.position > -1}}                
            },          
            get integerDigits() { return parseFloat(this.stringNumber.split(this.separator)[0]); },
            get decimalDigits() { return parseFloat(this.stringNumber.split(this.separator)[1]); },
            get isInteger() {return isNaN(this.decimalDigits); }
        }

        console.log('therm: ', therm)       
  
        let integer = '';
        if (!isNaN(integerDigits)) {
            integer = integerDigits.toLocaleString('de', {maximumFractionDigits: 0});
        }

        // adding the removed brackets again:
        // if (openBracket != -1) {
        if (therm.bracket.open.exists) {
            integer = integer.substring(0, openBracket) + '(' + integer.substring(openBracket);
            if (closeBracket != -1 && !decimalDigits) {
                integer = integer.substring(0, closeBracket) + ')' + integer.substring(closeBracket);
            }
        }

        if (!decimalDigits) return term.endsWith(this.decSeparator) ? integer + this.decSeparator : integer;
        let output = `${integer}${this.decSeparator}${decimalDigits}`;
        if (closeBracket != -1) output = output.substring(0, closeBracket) + ')' + output.substring(closeBracket);
        return output;
    }

    // TODO
    // Nach single-Operation funktioniert Eingabe von 0,x nicht!
    // was ist nach x² anders als nach 5 x 5...????
    /**
     * Appends a number as current digit to the display.
     * @param {string} number Numerical string or PI
     */
    appendNumber(number) {
        if (this.error) return;
        const decSep = this.decSeparator, PI = Math.PI.toString().replace('.', decSep);
        // allow only ONE decimal separator!
        if (number == decSep) {
            if (this.currentOperand.includes(decSep) && this.operandsDifferent) return;
        } else if (number == 'π') {
            number = PI;
            this.currentOperand = ''; // don't add PI behind existing digits!
        }

        // make sure that first operator keeps in correct place in display
        if (!this.opIsPending || this.operandsDifferent) {
            if (this.calcDone) {
                this.calcDone = false;
                if (!this.currentOperand.startsWith(`0${decSep}`)) this.currentOperand = '';
                if (number == decSep) this.currentOperand = '0';                
            }
            // avoid inputs like 0815 and don't allow digtits after PI!
            if ((this.currentOperand == '0' && number != decSep) || 
                this.currentOperand == PI) this.currentOperand = '';
            if (this.currentOperand.includes('(0') && !this.currentOperand.includes(decSep) && number != decSep) 
                this.currentOperand = this.currentOperand.replace('(0','(');
            if (this.currentOperand.length < 15) this.currentOperand += number.toString();
        } else {
            // add a leading 0 if input is just the decimal seperator
            if (number == decSep) number = '0' + decSep;
            this.currentOperand = number.toString();
        }
        this.#opsCount = 0;        
        this.updateDisplay();
    }

    evaluateOperation(operation) {
        if (this.error || this.currentOperand == '') return;
        if (this.executeOperators.includes(operation)) { 
            this.executeSingleOperator(operation);
            return;
        }
        this.#opsCount++;
        // allow chain computing with previous result!    
        if (this.previousOperand && this.opIsPending && !this.operatorSwitched) this.compute(false);

        if ('()'.includes(operation)) {
            operation = this.#checkForBrackets(operation)
            if (operation == '(') {                
                if (this.operation) {
                    debugger
                    this.previousOperand = this.currentOperand + this.operation + '(';
                    this.currentOperand = '0';
                    this.operation = null;
                } else {
                    this.currentOperand = '(' + this.currentOperand; // input number after bracket!
                }
                // operation = this.operation; // keep the previous operation!
            } else if (operation == ')') {
                this.previousOperand = this.previousOperand + this.operation + this.currentOperand + ')';
                const term = this.#createTerm(this.previousOperand);
                this.currentOperand = eval(term); // this.evaluate(term);
                this.operation = null;
            }
        } else {
            this.operation = operation;
            this.previousOperand = this.currentOperand;
        }
        this.updateDisplay();
    } 

    #createTerm(expression) {
        // string.replaceAll(search, replaceWith) replaces all string occurrences.
        expression = expression.replace('÷', '/').replace('×', '*')
        expression = expression.replace(/^0+/, ''); // remove leading zeros!
        const regexp = new RegExp(this.decSeparator, 'g');
        expression = expression.replace(regexp, '.');
        return expression;
    }

    #checkForBrackets() {
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

    compute(calcdone = true) {
        // make sure we got some operands:
        if (isNaN(this.prevValue) || isNaN(this.currValue)) return;
        let result;
        switch (this.operation) {            
            case '+': result = this.prevValue + this.currValue;  // charcode 43             
                break;
            case '-': result = this.prevValue - this.currValue;  // charcode 45            
                break;
            case '×': result = this.prevValue * this.currValue; // charcode 215              
                break;
            case '÷':                                           // charcode 247 
                result = this.prevValue / this.currValue;  
                if (result === Infinity || isNaN(result)) this.error = 'Division by zero';
                break;
            default: return;
        }
        if (!this.error) this.currentOperand = this.round(result, 12).toString().replace('.', this.decSeparator);
        this.operation = null;
        this.previousOperand = ''
        this.calcDone = calcdone;
        this.updateDisplay();
    }

    executeSingleOperator(operation) {
        switch (operation) {
            case 'x²': 
                this.operation = 'square(' + this.currentOperand + ')';
                this.currentOperand = this.round(Math.pow(this.currValue, 2), 10).toString();                            
                break;
            case '±': this.currentOperand = (this.currValue * -1).toString();
                break;
            case '1/x': 
                if (this.currValue == 0) {
                    this.error = 'Division by zero';
                } else {
                    this.operation = 'reciproc(' + this.currentOperand + ')';
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
                    this.operation = '√(' + this.currentOperand + ')';
                    this.currentOperand = Math.sqrt(this.currValue).toString();
                }                
                break;
            case 'n!':
                this.operation = 'fact(' + this.currentOperand + ')';
                this.currentOperand = this.factorial(this.currValue).toString();                       
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
            return '';
        } else if (number > 200) {
            this.error = 'Overflow';
            return '';
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
        expression = expression.replace('÷', '/').replace('×', '*')
        expression = expression.replace(/^0+/, ''); // remove leading zeros!
        return Function(`'use strict'; return (${expression})`)()
    }

    round(value, decimals = 0) {
        const factor10 = Math.pow(10, decimals);
        let retVal = Math.round((value + Number.EPSILON) * factor10) / factor10;
        return retVal;
    }


    #render(buddy) {
        this.#createPod();
        this.#createDisplay($(CALC_DISPLAY));
        this.#createButtons($(CALC_GRID), buddy);
        this.#createMemButtons();
        this.#createNumButtons();
        this.#createSpecialButtons(buddy);   // ATTENTION! Must be BEFORE operators!
        this.#createOperatorButtons();  // OP-buttons are the ones that are left in the DOM!
    }


    #createPod() {
        const _parent = this.parent;
        const arrComponents = [
            {attributes: {id: CALC_POD, class: 'calculator-overlay'}, parent: _parent},
            {attributes: {id: CALC_GRID, class: 'calculator-grid'}, parent: CALC_POD},
            {attributes: {id: CALC_DISPLAY, class: 'output'}, parent: CALC_GRID},
        ].forEach(item => {
            const div = document.createElement('div');
            this.setAttributes(div, item.attributes);
            this.getElement(item.parent).appendChild(div);
            if (item.parent == _parent) this.#calculator = div; // set the calculator element for access to hide    
        });
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
        this.#currOpDisplay = $(CURR_OPERAND);
        this.#prevOpDisplay = $(PREV_OPERAND);        
        this.#memDisplay = $(MEM_DISPLAY);
    }

    #createButtons(parentNode, buddy) {
        for (let i = 0; i < 33; i++) {       
            parentNode.appendChild(document.createElement('button'));         
        }        
        this.#buttons = Array.from($('.calculator-grid >button'));
        this.buttons[32].innerHTML = '&#9166';
        const display = buddy ? 'block' : 'none';
        this.setAttributes(this.buttons[32], {style: `display: ${display}; font-size: xx-large;`});
    }

    #createMemButtons() {        
        const captions = ['MR','MS','MC','M+','M-'];
        for (let i = 0; i < 5; i++) {
            this.buttons[i].appendChild(document.createTextNode(`${captions[i]}`));
            this.setAttributes(this.buttons[i], {class: 'btn-memory', 'data-memory': ''})         
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

    #createSpecialButtons(buddy) {
        const colSpan2 = buddy ? '' : ' col-span2';
        const arrSpecialButtons = [
            {index: 5, caption: 'AC', attributes: {class: 'btn-special span2', 'data-allclear': ''}},
            {index: 8, caption: 'DEL', attributes: {class: 'btn-special', id: 'btnDelete', 'data-delete': ''}},
            {index: 28, caption: '=', attributes: {class: `btn-equals${colSpan2}`, id: 'btnEquals', 'data-equals': ''}
        }].forEach(item => {
            const btn = this.buttons[item.index];
            btn.appendChild(document.createTextNode(item.caption));
            this.setAttributes(btn, item.attributes);
        });
        if (buddy) this.setAttributes(this.buttons[32], {class: 'btn-return btn-equals', id: 'btnReturn', 'data-return': ''});
    }    

    #createOperatorButtons() {
        const arrOperators = Array.from($('.calculator-grid >button')).filter((btn) => {
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
        $('[data-number]').forEach(btn => {
            btn.addEventListener('click', () => this.appendNumber(btn.innerText));
        });
        $('[data-memory]').forEach(btn => {
            btn.addEventListener('click', () => this.executeMemoryOperation(btn.innerText.slice(-1)));
        });
        $('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.evaluateOperation(btn.innerText));
        });
        $('[data-allclear]').addEventListener('click', () => this.clear());
        $('[data-delete]').addEventListener('click', () => this.delete());
        $('[data-equals]').addEventListener('click', () => this.compute()); 
        if (this.buddy) {
            $('btnReturn').addEventListener('click', (event) => this.returnValue(event));
        } else {
            this.calculator.addEventListener('click', (event) => this.hide(event));
        }
    }
}                 

export default Calculator;