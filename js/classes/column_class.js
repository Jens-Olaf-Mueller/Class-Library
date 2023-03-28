import Table from './table_class.js';

const STR_ALIGNS = ['unset','left','right','center','decimal'];

class Column {
    #index = null;
    #parentTable = null;
    #caption = '';
    #align = 'unset';
    #cells = [];

    get index() { return this.#index; }

    /**
     *  Returns the parent table class.
     * @readonly
     * @returns {Table} Returns the parent table class.
     */
    get parentTable() { return this.#parentTable; }


    /**
     * Sets or returns the column's alignment. <br>
     * Valid values are all CSS-settings plus a class-own setting called "decimal".<br>
     * If the align is set to decimal, the content is aligned to the decimal seperator.<br>
     * This works only with monospace font-families.
     * @param {string} newAlign the align to be set to the column.
     */
    set align(newAlign) {      
        if (typeof newAlign == 'string' && STR_ALIGNS.includes(newAlign)) {
            this.#align = newAlign;
            if (newAlign == 'decimal') {
                this.#alignToDecimal();
                newAlign = 'right';
            } 
            this.#cells.forEach(cell => {
                cell.style.cssText += `text-align: ${newAlign}`;
                if (newAlign === 'right') cell.style.cssText += 'padding-right: 0.5rem;';
            });
        }
    }
    get align() { return this.#align; }

    
    /**
     * Sets or returns the column's caption (header).
     *  @param {string} newCaption caption to be displayed
     */
    set caption(newCaption) {
        if (typeof newCaption == 'string' || typeof newCaption == 'number') {
            this.#caption = newCaption;
            this.parentTable.headers[this.index] = newCaption;
            // const id = `${this.parentTable.id}-R0C${this.index}`;
            const cell = document.getElementById(`${this.parentTable.id}-R0C${this.index}`);
            if (cell) cell.innerText = newCaption;
        }
    }
    get caption() { return this.#caption; }


    /**
     * Creates a new table column.
     * @param {number} index The column index.
     * @param {class} parentTable The parent table class, the column belongs to.
     * @param  {...any} cells A single cell or an array of cells.
     */
    constructor(index, parentTable, ...cells) {
        if (typeof index == 'number') {
            this.#index = index;
            this.#parentTable = parentTable;
            if (cells.length) {
                for (let i = 0; i < cells.length; i++) {
                    this.add(cells[i]);                    
                }
            }
        }
    }


    /**
     * Adds a new table cell(s) to the column.<br>
     * The cell must be a valid HTML table cell: &lt td &gt 
     * @param {HTMLElement | array} cell Either a single HTML-element or an array of them.
     * If an array of HTML cells is passed, the method calls itself recursively.
     */
    add(cell) {        
        if (cell instanceof HTMLElement) {
            this.#cells.push(cell);
        } else if (cell instanceof Array) {
            // recursive call
            for (let i = 0; i < cell.length; i++) {
                this.add(cell[i]);
            }
        }
    }

    #alignToDecimal() {
        let decCount = 0;
        // first find the length of decimal places
        this.#cells.forEach(cell => {
            const value = cell.innerText.toString();
            if (value.includes('.')) {
                const decimals = value.split('.')[1].length;
                if (decimals > decCount) decCount = decimals;
            }
        });

        this.#cells.forEach(cell => {
            let value = cell.innerText.toString();
            const hasSeperator = value.includes('.'),
                  numParts = value.split('.');
            if (numParts[1] === undefined) numParts[1] = '';
            let len = hasSeperator ? 0 : 1;
            while (numParts[1].length < decCount + len) {
                numParts[1] += String.fromCharCode(160);
            }
            let decChar = hasSeperator ? '.' : '';
            cell.innerText = numParts[0] + decChar + numParts[1];
        });
    }
}

export default Column;