import Library from './library_class.js'

const OVERLAY_ID = 'msg-BoxOverlay',
      Z_INDEX_TOP = 2147483647,
      BTN_ID = 'msg-btn-';

class MessageBox extends Library{
    #prompt;
    get prompt() { return this.#prompt };
    set prompt(text) {
        this.#prompt = (text == null) ? '' : text;
    }
    #title;
    get title() { return this.#title };
    set title(text) {         
        if (text == null || text.trim() == '') {
            this.#title = document.getElementsByTagName('title')[0].innerText;
        } else {
            this.#title = text;
        }
    }
    modal = true;       // box is per default ALWAYS modal!
    #gradient = true;
    get gradient() { return this.#gradient; }
    set gradient(newGradient) {
        if (typeof newGradient == 'boolean') {
            this.#gradient = newGradient;
        } else if (typeof newGradient == 'object') {
            this.#gradient = (newGradient.hasOwnProperty('from') && newGradient.hasOwnProperty('to'));
            if (this.#gradient) {
                this.gradientColorFrom = newGradient.from;
                this.gradientColorTo = newGradient.to;
            }
        }
    }

    #gradientFrom = null;
    // #gradientFrom ='#000A6D';
    get gradientColorFrom() { return this.#gradientFrom; } 
    set gradientColorFrom(value) { 
        this.#gradientFrom = value;
        this.#setCSSVar('msg-gradient-color-from', value);
    }
    #gradientTo = null;
    // #gradientTo = 'whitesmoke';
    get gradientColorTo() { return this.#gradientTo; }
    set gradientColorTo(value) {
        this.#gradientTo = value;
        this.#setCSSVar('msg-gradient-color-to', value);
    }
    #backGround = 'whitesmoke';
    get backGroundColor() { return this.#backGround; }
    set backGroundColor(value) {
        this.#backGround = value;
        this.#setCSSVar('msg-background-color', value);
    }

    #btnColor ='buttonface';
    get buttonColor() { return this.#btnColor; } 
    set buttonColor(value) {
        this.#btnColor = value;
        this.#setCSSVar('msg-button-color', value);
    }

    #borderRadius = 8;
    get borderRadius() { return this.#borderRadius; } 
    set borderRadius(value) {
        if (value.substr(-2) != 'px') debugger
        this.#borderRadius = value;
        this.#setCSSVar('msg-border-radius', value);        
    }
    titleColor = 'whitesmoke';
    textColor = 'black';
    

    get cssClassOverlay() {
        return this.modal ? 'msg-overlay msg-modal' : 'msg-overlay';
    }
    #overlayBG = '#00000040';
    get overlayBackground() { return this.modal ? this.#overlayBG : 'transparent'; }
    set overlayBackground(color) { this.#overlayBG = color; }


    #arrButtons = ['Ok'];
    get buttons() { return this.#arrButtons; }
    /**
     * Assigns or returns the submitted buttons.
     * @param {string | string[]} buttons [Optional] String, separetd by comma or string array.
     * If omitted a default button is set to 'Ok'
     */
    set buttons(buttons) {        
        if (buttons == null) {
            this. #arrButtons = ['Ok'];
        } else if (buttons instanceof Array) {
            this.#arrButtons = buttons;
        } else {
            if (buttons.trim().length == 0) buttons = 'Ok';
            // eliminate white spaces!
            this.#arrButtons = buttons.split(',').map(btn => btn.trim());               
        }
    }


    /**
     * Creates a new instance of the MessageBox.
     * @param {string} styleSheet [Optional] the path to the stylesheet in order to style the messagebox as favoured.
     */
    constructor(styleSheet) {
        super(styleSheet);
        this.styleSheetChanged = false;
    }

    /**
     * The main method of the class. Creates and displays a messagebox according to the settings
     * and the passed parameters. The calling function must be marked with the key word AWAIT. 
     * @param {string} prompt [Optional] The displayd message to the user. If no message is passed,
     * a non-modal default box with a single "OK" button will be displayed.
     * @param {string} title [Optional] The Caption of the message box. If omitted, the page title is used.
     * @param {string | string[]} buttons [Optional] String, separeted by comma or string array.
     * If omitted, a single "OK" button is displayed.
     * @param {boolean} modal [Optional] Tells whether the messagebox is displayed modal (default) or not
     * @param {boolean} gradient [Optional] Tells whether the title bar has got a color gradient (default) or not.
     * @returns A promise. The promise is solved to the clicked button text, which serves as the answer.
     */
    async show(prompt, title, buttons, modal, gradient) {
        this.#setParams(prompt, title, buttons, modal, gradient);
        this.#createOverlay();
        this.#renderBox();
        const modular = this.modal;
        // now we create a promise with an event listener
        return new Promise(function(resolve, reject) {
            document.body.addEventListener('click', function btnHandler(event) {
                const clickedOn = event.target.id;
                if (clickedOn.startsWith(BTN_ID)) {                
                    resolve(document.getElementById(clickedOn).innerText);
                    document.body.removeEventListener('click', btnHandler);
                    document.getElementById(OVERLAY_ID).remove();
                } else if (event.target.id == OVERLAY_ID && !modular) {                
                    resolve('false');
                    document.body.removeEventListener('click', btnHandler);
                    document.getElementById(OVERLAY_ID).remove();
                }       
            });        
        });
    }

    
    /**
     * PRIVATE helper function.
     * 
     * Generates the actual box according to the class properties.
     */
    #renderBox() {
        // titlebar with gradient ?
        let dlgClass = 'msg-titlebar';
        if (this.gradient) {
            // if (this.styleSheetChanged) {
            //     const root = document.documentElement;
            //     root.style.removeProperty('--msg-gradient-color-from');
            //     root.style.removeProperty('--msg-gradient-color-to');
            //     this.gradientColorFrom = getComputedStyle(root).getPropertyValue('--msg-gradient-color-from');
            //     this.gradientColorTo = getComputedStyle(root).getPropertyValue('--msg-gradient-color-to');
            // }
            dlgClass += ' msg-gradient'
        }
        // set a white caption when gradient exists!
        let captionStyle = this.gradient ? `style="color: whitesmoke !important"` : '';
        document.getElementById(OVERLAY_ID).innerHTML = `
        <div class="msg-dialog">
            <div class ="${dlgClass}">
                <h2 id="msgCaption" ${captionStyle}>${this.title}</h2>
            </div>
            <p class="msg-Prompt">${this.prompt}</p>
            ${this.#renderButtons()}
        </div>`;
    }

    /**
     * PRIVATE helper function.
     * 
     * Renders the required buttons for the messagebox.
     * @returns {HTMLButtonElement} HTML code of the buttons.
     */
    #renderButtons() {
        let btnCode = '';            
        for (let i = 0; i < this.buttons.length; i++) {
            btnCode += `<button id="${BTN_ID}${i}" class="msg-button">${this.buttons[i]}</button>`;
        }
        return btnCode;
    }


    /**
     * PRIVATE helper function.
     * 
     * Parses the passed parameters of the {@link show} method.
     */
    #setParams(prompt, title, buttons, modal, gradient) { 
        this.prompt = prompt;
        this.title = title;
        this.buttons = buttons;
        this.modal = (modal == null) ? true : modal;
        this.gradient = gradient;
        // if (typeof gradient == 'boolean') {
        //     this.gradient = gradient;
        // } else if (typeof gradient == 'object') {
        //     if (gradient.hasOwnProperty('from')) this.gradientColorFrom = gradient.from;
        //     if (gradient.hasOwnProperty('to')) this.gradientColorTo = gradient.from;
        // }        
    }


    /**
     * PRIVATE helper function that creates the dialog wrapper.
     */
    #createOverlay() {
        const parentBox = document.createElement('div');
        this.setAttributes(parentBox, {
            id: OVERLAY_ID,
            style: `z-index: ${Z_INDEX_TOP} !important; 
                    background-color: ${this.overlayBackground};
                    position: fixed;
                    inset: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;`,
            class: this.cssClassOverlay});
        document.body.appendChild(parentBox);
    }


    // Set the value of css variables to another value
    #setCSSVar(varName, value) {
        document.querySelector(':root').style.setProperty(`--${varName}`, value);
    }
}

export default MessageBox;