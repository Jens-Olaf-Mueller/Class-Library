import Collection from './collection_class.js';
import Column from './column_class.js';

/**
 * A string with pre-defined values, similarly to the typeof keyword.
 * The values "array" and "object-array" are special cases in order to specify the
 * content type more detailled and differ objects from arrays.
 * @typedef {('string' | 'object' | 'array' | 'object-array')} contentType 
 */

class Table {
    #table = null;
    #parent = null;
    #content = null;
    #headers = [];
    #columns = [];
    #cells = new Collection();
    #cssSheet = null;
    #columnWidth = 'auto';
    #rowHeight = 'auto';
    #gridColor = 'silver';
    #cellColor = 'whitesmoke';
    #headerColor = 'whitesmoke';
    #captionColor = 'inherit';
    
    /**
     * The splitter character is used to seperate a passed content or header string
     * into single values. The default char is the comma.
     * @see #{@link headers}
     */
    splitter = ',';
    /**
     * Determines whether the table's column captions are displayed or not.
     */
    showColumnHeaders = true;
    /**
     * Logs out the created table on console or not.
     */
    logTable = true;
     /**
     * Determines whether the table displays the row numbers or not.
     */   
    showRowIndex = false;

    showStripes = true;

    get rowsCount() {
        if (this.contentType.includes('array')) {
            const colOffset = this.showRowIndex ? 1 : 0;
            // if (this.contentType == 'object-array') debugger
            if (this.tableContent.length <= this.headers.length) return 1;
            return this.tableContent.length;
        }        
    }


    /**
     * Returns the count of columns in the table. 
     * By default the count is 1. If the row indexes are displayed it's 2.
     * The final value depends on the count of header columns. See {@link headers}
     */
    get columnsCount() {
        if (this.headers.length) return this.headers.length;
        return this.showRowIndex ? 2 : 1;
    }


    get hasTable() { return this.#getElement(this.#table) !== null; }

    get table() { return this.#table; }    
    set table(expression) {
        this.#table = this.#getElement(expression);
        // if there is no table we create it!
        if (!this.hasTable) {
            this.#table = document.createElement('table');
            if (typeof expression == 'string') this.#table.setAttribute('id', expression);
        }
    }

    /**
     * readonly Value is set in the {@link table} property. 
     * @returns {string} Returns the table's unique id.
     */
    get id() { return this.#table.id; }


    /**
     * Returns all cells with the current table-id
     */
    get cells() { return this.#cells.items; }
    get rows() { return Array.from(this.#table.rows); }
    get columns() { return this.#columns;}
   
     
    /**
     * Sets the column width for ALL columns.
     * To set it for one specific column, use the columns-property and the 
     * column's index instead. As value any CSS property can be used!
     */
    set columnWidth(newWidth) { 
        this.#columnWidth = newWidth;        
        const cols = Array.from(document.querySelectorAll(`th[id*="${this.id}"]`));
        this.#cssUpdate(cols, `width: ${newWidth}`);
        // this.#setCSSVar('column-width', newWidth);
    }
    get columnWidth() { return this.#columnWidth; }


    /**
     * Sets the height for ALL rows.
     * As value any CSS property can be used!
     */
    set rowHeight(newHeight) { 
        this.#rowHeight = newHeight;
        this.#cssUpdate(this.rows, `height: ${newHeight}`);
    }
    get rowHeight() { return this.#rowHeight; } 

    
    set gridColor(newColor) {
        this.#gridColor = newColor;
        this.#cssUpdate(this.cells, `border: 1px solid ${newColor}`);
    }
    get gridColor() { return this.#gridColor; }


    set cellColor(newColor) {
        this.#cellColor = newColor;
        this.#cssUpdate(this.cells, `background-color: ${newColor}`);
        if (this.showStripes) {
            // (`th[id*="${this.id}"]`)
            const evenRows = Array.from(document.querySelectorAll(`tr[id*="${this.id}"]:nth-child(even)`));
            this.#cssUpdate(evenRows, `filter: brightness(0.85)`);
        }
    }
    get cellColor() { return this.#cellColor; }

    
    set headerColor(newColor) {
        this.#headerColor = newColor;
        const heads = Array.from(document.querySelectorAll(`th[id*="${this.id}"]`));
        this.#cssUpdate(heads, `background-color: ${newColor}`);
    }
    get headerColor() { return this.#headerColor; }

    
    set captionColor(newColor) {
        this.#captionColor = newColor;
        const heads = Array.from(document.querySelectorAll(`th[id*="${this.id}"]`));
        this.#cssUpdate(heads, `color: ${newColor}`);
    }
    get captionColor() { return this.#captionColor; }
    
    
    set parentElement(expression) {      
        if (this.hasTable) {
            this.#parent = null;
        } else {      
            // using <body> as parent if there is neither a table nor a parent passed!      
            this.#parent = this.#getElement(expression);
            if (this.#parent == null) this.#parent = document.body;
        }
    }
    get parentElement() { return this.#parent; }

    /**
     * Sets or returns the column headers of the table, similarly to the content property.
     * @param {string | string[] | object[]} expression The data containing the headers.
     * It can be a string, joined by the classe's splitter, a string array or an object array.
     * If expression is an object array, the keys of the objects ere used as headers.
     * If the "showRowIndex" property is set to true, an additional empty header is put as
     * the first place of the list to display the row numbers.
     */
    set headers(expression) { 
        if (expression instanceof Array) {
            if (expression.length > 0) {
                if (typeof expression[0] == 'object') {
                    this.#headers = this.#getHeadersFromObject(expression);
                } else {
                    this.#headers = expression;
                }
            }            
        } else if (typeof expression == 'string') {
            this.#headers = expression.split(this.splitter).map(e => { return e.trim() });
        }
        if (this.showRowIndex) this.#headers.unshift(''); // create additional column for the rows to be displayed
    }
    get headers() { return this.#headers; }


    /**
     * Tells us, what kind of content is assigned to the table.
     * @returns { contentType} the table content can be a simple string, an array or an object-array.
     */
    get contentType() {
        if (this.#content instanceof Array) {
            return (this.#content.length > 0 && 
            typeof this.#content[0] == 'object') ? 'object-array' : 'array';
        } else { 
            return (typeof this.#content); 
        }        
    }


    /**
     * Sets or returns the content to be displayed in the table.
     * The passed data can be either an object, a string array 
     * or a joined string (will be splitted into an array).
     */
    get tableContent() { return this.#content; }
    set tableContent(content) {
        this.#content = content; // assign first to have correct access to 'this.contentType'
        if (this.contentType == 'object-array') {
            this.headers = content;
        } else if (this.contentType == 'string') {
            this.#content = content.split(this.splitter).map(e => { return e.trim() });
        } else if (this.contentType == 'object') {
            this.#content = Object.values(content);
            this.headers = Object.keys(content);
        }
    }


    get stylesheet() { return this.#cssSheet; }
    set stylesheet(href) {
        if (href == null) return;        
        const filename = href.replace(/^.*[\\\/]/, ''); // avoid duplicates!
        for (let i = 0; i < document.styleSheets.length; i++) {
            // console.log('Sheet '+ i+1, document.styleSheets[i].href)
            if (document.styleSheets[i].href.includes(filename)) return;
        }
        this.#cssSheet = href;
        const link  = document.createElement('link');
        this.#setAttributes(link, {
            rel: 'stylesheet',
            type: 'text/css',
            href: href,
            title: 'table_' + this.table.id
        });
        document.head.appendChild(link);
    }


    /**
     * Creates a new Table class and a HTML-table-element, according to the passed content.
     * All parameters excpt from table are optional.
     * @param {string | HTMLElement} table Mandatory parameter! 
     * The reference or the id of the table to be created.
     * @param {object[] | string[] | string} content The content to be displayed in the table.
     * The parameter can be either a string, separated by the set splitter property (default is comma)
     * or a string array or an object consisting of key-value pairs. 
     * If 'content' is an object, the keys are used as column captions (headers).
     * @param {string[] | string} headers A string array or a connected string, 
     * splittable by the classe's splitter-property
     * @param {string | HTMLElement} parent The parent HTML-element, it's id or the document.body if omitted.
     * @param {string?} stylesheet The path to a related style sheet in order to style the table.
     */
    constructor(table, content, headers, parent, stylesheet) {
        this.parentElement = parent;
        this.table = table;
        this.stylesheet = stylesheet;
        if (typeof content == 'string' || content instanceof Array) this.create(content, headers);
    }


    /**
     * Removes the passed table from DOM.
     * @param {string | HTMLElement} table [Optional] The id for the table 
     * or the HTML table-element itself. If the param is omitted, the classe's registered table is used.
     */
     remove(table) {
        table = this.#getElement(table) || this.table;
        table.remove();
    }


    /**
     * Clears a table by removing all rows
     * @param {string | HTMLElement} table [Optional] The id for the table 
     * or the HTML table-element itself. If omitted, the registered table is used.
     */
    clear(table) {
        table = this.#getElement(table) || this.table;
        const thead = document.getElementById(`${this.id}-head`);
        let rowOffset = 1;
        if (this.showColumnHeaders && thead) {
            table.removeChild(thead);
            rowOffset = 2;
        }
        for (let row = table.rows.length - rowOffset; row >= 0; row--) {
            console.log(table.rows[row] + ' removed...', row)
            table.removeChild(table.rows[row]);
        }
        this.#content = null;
        this.#headers.length = 0;
        this.#columns.length = 0;        
    }


    /**
     * Creates the table according to the passed parameters and the class settings.
     * @param {object | string | string[]} content Mandatory parameter containing 
     * the content to be stored into the table.
     * @param {string | string[] | boolean} headers [Optional] Determines the column captions of the table.
     * Parameter is either a string array or a connected string, joined by the classe's splitter-property. 
     * If headers parameter is a boolean, 
     * the method switches the showColumnHeaders property on or off.
     * @see #{@link showColumnHeaders}
     */
    create(content, headers) {
        if (content === undefined) return;         
        this.tableContent = content;
        if (typeof headers == 'boolean') {
            this.showColumnHeaders = headers;
        } else if (headers !== undefined) {
            this.headers = headers;
        }  
        this.#generateTableGrid();
        this.refresh();
        if (this.parentElement) this.parentElement.appendChild(this.table);
        if (this.logTable) console.table(this.tableContent);
    }
    

    /**
     * Draws the table new after some visual changes.
     */
    refresh() {
        this.stylesheet = this.#cssSheet;
        this.columnWidth = this.#columnWidth;
        this.rowHeight = this.#rowHeight;
        this.gridColor = this.#gridColor;
        this.cellColor = this.#cellColor;
        this.headerColor = this.#headerColor;
        this.captionColor = this.#captionColor;
    }


    /**
     * Stores a new value in the passed cell. If the cell index does not exist, an error occurs.
     * @param {number} row the cell's row index
     * @param {number} column the cell's column index
     * @param {any} value the value to be stored in the table cell.
     */
    cell(row, column, value) {
        const id = `${this.id}-R${row}C${column}`,
              cell = document.getElementById(id);
        if (cell) {
            cell.innerText = value;
        } else {
            throw new Error(`Cell '${id}' does not exist.`);
        }
    }


    /**
     * PRIVATE helper function.
     * 
     * Core function to create the physical table.
     * An id for each single cell is created as well as to the headers.
     * The content is stored into the cells.
     * At the end the columns will be determined according to the newc reated table.
     */
    #generateTableGrid() {
        this.#addTableHeads();
        const showRowIndex = this.showRowIndex ? 1 : 0;
        const vertical = (this.tableContent.length > this.headers.length);
        for (let row = 0; row < this.rowsCount; row++) {
            const tr = document.createElement('tr');
            this.#setAttributes(tr, {id: `${this.id}-row${row + 1}`});
            for (let col = 0; col < this.columnsCount; col++) {
                const cell = document.createElement('td');
                this.#setAttributes(cell, {id: `${this.id}-R${row+1}C${col}`});
                let cellContent;
                if (showRowIndex && col == 0) {
                    cellContent = row + 1;
                } else if (this.contentType == 'object-array') {
                    cellContent = Object.values(this.tableContent[row])[col- showRowIndex] || '';
                } else if (this.contentType == 'array') {                                    
                    if (vertical) {
                        cellContent = col == 0 + showRowIndex ? this.tableContent[row] : '';
                    } else {
                        const index = row * this.columnsCount + col - showRowIndex;    
                        cellContent = this.tableContent[index] || '';
                    }                    
                }        
                tr.appendChild(cell).appendChild(document.createTextNode(cellContent));
                this.#cells.add(cell);
            }
            this.table.appendChild(tr);
        }
        this.#getColumns();
    }


    /**
     * PRIVATE helper function.
     * 
     * Creates the head (column captions) of the table if ths flag 'showColumnHeaders' 
     * is set to true and some headers are specified.
     */
    #addTableHeads() {
        if (!this.showColumnHeaders || !this.headers.length) return;
        const thead = document.createElement('thead');
        this.#setAttributes(thead, {id: `${this.id}-head`});
        const tr = document.createElement('tr');        
        this.#setAttributes(tr, {id: `${this.id}-row0`});
        thead.appendChild(tr);

        for (let i = 0; i < this.headers.length; i++) {
            const th = document.createElement('th');
            this.#setAttributes(th, {id: `${this.id}-R0C${i}`});
            tr.appendChild(th).appendChild(document.createTextNode(this.capitalize(this.headers[i])));
        }
        this.table.appendChild(thead);
    }

    /**
     * PRIVATE helper function.
     * 
     * Filters all to a column belonging cells out and adds them to a column class instance.
     * The columns property gives access to the created {@link columns}.
     */
    #getColumns() {
        for (let col = 0; col < this.columnsCount; col++) {
            const column = new Column(col, this);
            column.add(this.cells.filter((cell) => {
                return cell.id.includes(`C${col}`);
            }));
            if (this.showColumnHeaders && this.headers.length) {
                column.caption = this.capitalize(this.headers[col]);
            }
            this.#columns.push(column);
        }   
    }


    /**
     *  PRIVATE helper function.
     * 
     * Generates the column captions from the passed object.
     * @param {object} obj An object containing key-value-pairs.
     * @returns {array} String array that contains the column names (headers)
     */
    #getHeadersFromObject(obj) {
        let colHeaders = [];
        obj.forEach(item => {
            const keys = Object.keys(item);
            if (colHeaders.length < keys.length) colHeaders = keys;
        });
        return colHeaders;
    }


    /**
     *  PUBLIC helper function.
     * 
     * Capitalize the first letter of the passed string: name ==> Name
     * @param {string} string A single string to be converted.
     * @returns The capitalized string.
     */
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    /**
     * PRIVATE helper function. 
     * 
     * Determines if the passed parameter is a string-id or an HTML-element. 
     * If the passed expression is an HTML-object, the method returns this element.
     * If the parameter is a string, the method assumes that the parameter is
     * the id of the element we're looking for.
     * In case the expression is from another type, the method returns null.
     * @param {string | HTMLElement} expression the id of the wanted HTML-element, or the element itself
     * @returns {HTMLElement | null} the wanted HTML-element.
     */
    #getElement(expression) {
        if (typeof expression == 'string') return document.getElementById(expression);
        if (expression instanceof HTMLElement) return expression;
        return null;
    }

    /**
     * PRIVATE helper function. 
     * 
     * Assigns a list of attributes as key-value pairs to the passed element.
     * @param {HTMLElement} element element to assign the attributes
     * @param {object} attributes 
     * @usage  setAttributes (element, { id: "myDivId", height: "100%", ...})
     */
    #setAttributes(element, attributes) {
        for(const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
    }


    /**
     * Adds a new style property to the passed elements
     * @param {HTMLElement} tabElements array of table elements to be styled
     * @param {string} style CSS-conform style property
     */
    #cssUpdate(tabElements, style) {
        tabElements.forEach(element => {
            element.style.cssText += style;
        });
    }

}

export default Table;