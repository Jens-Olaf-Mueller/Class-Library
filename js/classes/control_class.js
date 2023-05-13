// https://web.dev/custom-elements-v1/#attrchanges
// https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements
// https://glitch.com/edit/#!/morning-yam?path=scripts%2Fcounter.js%3A20%3A0
// https://www.youtube.com/watch?v=j0qG-afD244
// focus to webcomponent:
// https://stackoverflow.com/questions/32417235/how-to-make-a-custom-web-component-focusable
// https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus

const TMP_STYLE = document.createElement('template');
const DEF_CAPTIONWIDTH = '8rem';
const DEF_STYLESHEET_SELECTOR = 'link[data-control]';

TMP_STYLE.innerHTML = ` 
    <style>
        :host,
        label[for^="opt"] {
            display: flex;
            align-items: center;
            gap: 0.315rem;
        }
        :host([hidden]) { display: none; }
        *[disabled] {color: #999;}
        input[disabled] {background-color: whitesmoke;}
        input {
            min-height: 1.125rem;
            height: 100%;
        }
        
        input[type="text"],
        input[type="url"],
        input[type="search"] {
            width: 16rem;
        }
        input[type="number"] {
            text-align: right;
            padding-right: 4px;
            width: 3.25rem;
            -moz-appearance: textfield;
        }
        input[data-counter] {
            text-align: center;
            width: 4rem;
        }

        input:not([data-counter])::-webkit-outer-spin-button,
        input:not([data-counter])::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="checkbox"],
        input[type="radio"],
        label[data-button] {
            min-width:  1.125rem;
            min-height: 1.125rem;
            max-height: 1.25rem;
        }
        input[type="date"],
        input[type="time"] {
            width: 6.5rem;
            text-align: center;
        }
        input[type="month"],
        input[type="week"],
        input[type="range"], {
            width: 8rem;
        }
        input[type="datetime-local"],
        input[type="tel"] {width: 10rem;}
        input[type="file"] {
            display: none;
        }
        label.jom-caption:first-child {
            min-width: ${DEF_CAPTIONWIDTH};
            width: auto;
        } 
        label[data-button] {
            border: 1px solid silver;
            background-color: buttonface;
        }
        select {
            width: 10rem;
            height: 100%;
        } 
        @media (max-width: 480px) {
            :host:not([type="checkbox"] {
                flex-direction: column;
                align-items: flex-start;
            }
        } 
    </style>`; 

// TODO
// - implement mask attribute ?
// - phone?
// - radio: caption, default = radio1, radio2 etc..., options: {caption: ..., value: ...}
//          disabled not working
// - focus / tabindex
// - styling range ---> class="jom-range"

class Control extends HTMLElement {
    #captionWidth = DEF_CAPTIONWIDTH;
    #unit = '';

    /**
     * This returns all writable (and readable) properties of this class.
     * If those wanted who are readonly, the code must be changed to: => typeof descriptor.get...
     */
    get properties() { 
        //https://stackoverflow.com/questions/39310890/get-all-static-getters-in-a-class
        // old variant:
        // const props = Object.defineProperties({}, Object.getOwnPropertyDescriptors(Control.prototype));
        // // const props = Object.getOwnPropertyNames(Control.prototype).filter(prop => prop.startsWith('get'));
        // return Object.getOwnPropertyDescriptors(props) ; 
        const props = Object.entries(Object.getOwnPropertyDescriptors(Control.prototype))
        .filter(([key, descriptor]) => typeof descriptor.set === 'function').map(([key]) => key);
        return props;
    }

    #options = undefined;
    #type = null;
    get type() { 
        if (this.#type) return this.#type;
        if (this.hasAttribute('type')) return this.getAttribute('type');
        return 'text';
    }
    set type(newType) {
        this.#type = newType;
        const input = this.shadowRoot.querySelector('input[id^="jom"]'); 

        if (newType == 'dropdown' || input == null) return; // special case: radio!       
        if (newType == 'counter') {
            this.setAttributes(input, {type: 'number',"data-counter": ''});         
        } else {
            input.type = newType;
        }
    }


    /**
     * A control can have buddies, if it is from type checkbox 
     * and has specified any buddy-types.
     */
    get hasBuddy() {
        return (this.type == 'checkbox' && this.hasAttribute('switch') && this.getAttribute('switch').length > 0);
    }

    get buddies() {
        // const buddies = this.shadowRoot.querySelectorAll('[id^="chkBuddy"]');
        const buddies = this.shadowRoot.querySelectorAll('[buddy]');
        return buddies.length > 0 ? buddies : null;
    } 

    /**
     * Returns the constituent element:<br>
     * - input, select, etc.
     */
    get child() {
        let id = 'jomInput';
        if (this.type == 'dropdown') id = 'jomDropdown';
        if (this.type == 'checkbox') id = 'jomCheckbox';
        if (this.type == 'combobox') id = 'jomCombo';
        return this.shadowRoot.getElementById(id);
    }

    get name() {
        if (this.child) return this.child.name;
        return this.hasAttribute('name') ? this.getAttribute('name') : '';
    }
    set name(newName) {
        if (this.child) this.child.name = newName;
        if (!this.hasAttribute('name')) this.setAttribute('name', newName);
    }

    get min() {return this.child.hasAttribute('min') ? this.child.min : '';}
    set min(newValue) {
        const input = this.shadowRoot.getElementById('jomInput');
        if (input) input.setAttribute('min', newValue);
        if (!this.hasAttribute('min')) this.setAttribute('min', newValue);
    }

    get max() {return this.child.hasAttribute('max') ? this.child.max : '';}
    set max(newValue) {
        const input = this.shadowRoot.getElementById('jomInput');
        if (input) input.setAttribute('max', newValue);
        if (!this.hasAttribute('max')) this.setAttribute('max', newValue);
    }

    get maxlength() {return this.child.hasAttribute('maxlength') ? this.child.maxlength : undefined;}
    set maxlength(newValue) {
        const input = this.shadowRoot.getElementById('jomInput');
        if (input) input.setAttribute('maxlength', newValue);
        if (!this.hasAttribute('maxlength')) this.setAttribute('maxlength', newValue);
    }

    get value() { 
        if (this.type == 'radio') {
            const radio = this.shadowRoot.querySelector('input[type="radio"]:checked');
            return radio ? radio.value : null;
        } else if (this.type == 'dropdown') {
            const selection = this.shadowRoot.querySelector('option[selected]');
            return selection ? selection.value : null;
        } else if (this.type == 'combobox') {
            return this.child.value;
        } else if (this.hasBuddy) {
            if (this.buddies.length == 1 || this.buddies.length == 2 && this.buddies[1] == this.unit) return this.buddies[0].value;
            let buddyVals = [];
            this.buddies.forEach((buddy) => {
                if (buddy.localName !== 'label') buddyVals.push(
                    {type: buddy.type, 
                     value: buddy.value
                });               
            });
            return buddyVals;
        } else if ('number,counter,range'.includes(this.type)) {
            return Number(this.child.value);
        } else {
            return this.child.value;
        }         
    }
    set value(newValue) {
        if (this.type == 'radio' || this.type == 'dropdown') {
            // TODO setting option-values (radio, dropdown...) ???
            // looping through captions and set it to selected if match!
            return;  
        // } else if (this.type == 'dropdown') {
        } else if (this.type == 'checkbox') {
            const isChecked = 'on,true,checked'.includes(newValue) ? true : 
                              'off,false,unchecked'.includes(newValue) ? false: null;
            if (isChecked) {
                this.setAttribute('checked','');
            } else if (isChecked === false) {
                this.removeAttribute('checked');                
            } else if (this.buddies) {
                this.buddies[0].value = newValue;
            } else {
                this.setAttribute('value', newValue); // assign any value to the checkbox
            }
        } else {
            const input = this.shadowRoot.querySelector('input');
            if (input) input.value = newValue;
        }        
    }


    /**
     * Getter & setter for a disabled property.
     * Reflect the value of the disabled property as an HTML attribute.
     */
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(flag) {
        const children = this.shadowRoot.querySelectorAll('[class|="jom"]');   
        if (Boolean(flag)) {
            children.forEach((child) => child.setAttribute('disabled', ''));
            // avoid endless recursive calls!
            if (!this.hasAttribute('disabled')) this.setAttribute('disabled', '');          
        } else {
            children.forEach((child) => child.removeAttribute('disabled'));
            this.removeAttribute('disabled');            
        }
    }


    get required() { return this.hasAttribute('required'); }
    set required(flag) {
        if (Boolean(flag)) {
            this.child.setAttribute('required', '');
            // avoid endless recursive calls!
            if (!this.hasAttribute('required')) this.setAttribute('required', '');                      
        } else {
            this.child.removeAttribute('required');
            this.removeAttribute('required');            
        }
    }

    get checked() { return this.hasAttribute('checked'); }
    set checked(flag) {
        const chkBox = this.shadowRoot.getElementById('jomCheckbox'),
              state = Boolean(flag);
        if (this.type != 'checkbox' || !chkBox) return;
        if (state) {
            if (!this.hasAttribute('checked')) this.setAttribute('checked','');    
        } else {
            this.removeAttribute('checked');
        }
        if (chkBox) chkBox.checked = state;
    }

    
    get selected() { 
        if (!'radio, dropdown'.includes(this.type)) return null;
        if (this.type == 'dropdown') return this.shadowRoot.querySelector('option[selected]');
        return this.shadowRoot.querySelector('input[type="radio"]:checked');
    }
    set selected(newSelection) {
        if (!'radio, dropdown'.includes(this.type)) return;
        const index = Number(newSelection),
              selector = (this.type == 'dropdown') ? 'option' : 'input[type="radio"]',
              attribute = (selector == 'option') ? 'selected' : 'checked',
              options = this.shadowRoot.querySelectorAll(selector);
        if (index < options.length) options[index].setAttribute(attribute,'');
    }

    get unit() { return this.shadowRoot.querySelector('[data-unit]');}
    set unit(text) {
        if (!this.hasAttribute('unit')) this.setAttribute('unit', text);
        const unit = this.shadowRoot.querySelector('[data-unit]');
        if (unit) {
            unit.removeAttribute('hidden');
            text = text.split(':');
            if (text[0] === 'value') {
                if (typeof this.value == 'object') {
                    // console.log(Object.keys(this.value))
                    // debugger
                    Object.keys(this.value).forEach((val) => {
                        if (val.hasOwnProperty('type')) {
                            debugger
                        }
                    });                   
                } else {
                    unit.textContent = text.length > 1 ? this.value + text[1] : this.value;
                }                
            } else {
                unit.textContent = text[0];
            }
        }
    }

    // https://softauthor.com/javascript-get-width-of-an-html-element/
    get width() {
        if (this.child.hasAttribute('width')) {
            return this.child.getAttribute('width');
        } else {
            // return this.clientWidth;
        }
    }
    set width(newWidth) {
        if (this.type == 'checkbox') return;
        if (!this.hasAttribute('width')) this.setAttribute('width', newWidth); 
        if (this.child) this.child.style.cssText += `width: ${newWidth};`;
    }

    get caption() {return this.shadowRoot.querySelector('label.jom-caption');}

    get captionwidth() { return this.#captionWidth; }
    set captionwidth(newWidth) {
        // filter out all units like: px, rem, % etc.
        const nWidth = Number(newWidth.toString().replace(/\D/g, ''));
        // if (newWidth == '' || newWidth.toString() == '0') this.#captionWidth = 'width: 0;';        
        if (this.caption) {
            // this.caption.style.cssText += this.#captionWidth;
            // this.caption.setAttribute('style', this.#captionWidth);
            // // filter out all units like: px, rem, % etc.
            // const strWidth = newWidth.toString().replace(/\D/g, '');
            if (newWidth == 'none' || nWidth == 0) {
                this.caption.setAttribute('hidden','');
            } else {
                this.caption.removeAttribute('hidden');
                this.#captionWidth = newWidth;
                this.caption.setAttribute('style', `width: ${newWidth};`);
            }
        }       
    }

    get captionText() {
        if (this.caption && !this.caption.hasAttribute('hidden')) return this.caption.innerHTML;
        return '';
    }
    set captionText(newCaption) {
        if (this.caption) {
            this.caption.innerHTML = newCaption;
            // caption can be later assigned! So we set the width to default or attribute value!
            if (newCaption.length > 0) {
                this.captionwidth = (this.hasAttribute('captionwidth')) ? this.getAttribute('captionwidth') : this.#captionWidth;
            }
        } else {
            this.captionwidth = 0;
        }
    }

    get placeholder() { return this.shadowRoot.querySelector('input').placeholder; }
    set placeholder(newText) {
        this.shadowRoot.querySelector('input').placeholder = newText;
    }

    get options() { 
        if (this.#options) return this.#options; 
        if (this.hasAttribute('options')) return this.parseOptions(this.getAttribute('options'));
        return null;
    }
    set options(newOpts) {
        this.#options = this.parseOptions(newOpts); 
        if (this.type == 'combobox') this.child.options = newOpts;
        if (this.type == 'dropdown') this.#renderDropDownList(this.#options);
        if (this.type == 'radio') this.#renderRadioButtons(this.#options);
    }

    parseOptions(options) {
        if (typeof options == 'string') {
            options = options.split(',').map(opt => opt.trim());
        } else if (options instanceof Array) { // object: {caption: ..., value: ...}
            const isStringArray = options.every((type) => typeof type == 'string');
            let isValidObject = false;
            if (!isStringArray) {
                isValidObject = options.every((obj) => {
                    return obj.hasOwnProperty('caption') && obj.hasOwnProperty('value');
                });
            }
            // TODO: parse object-options: {caption: ..., value: ...}
            if (!isStringArray && ! isValidObject) return;
        } 
        return options;
    }

    get booleanAttributes() { return ['checked', 'disabled', 'required']; }

    /**
     * Here we define all allowed attributes and those to be observed.<br>
     * Elements can react to attribute changes by defining a attributeChangedCallback. 
     * The browser will call this method for every change to attributes 
     * listed in the observedAttributes array: 
     * @see #{@link attributeChangedCallback}
     */
    static get observedAttributes() {
        return ['checked', 'caption', 'captionwidth', 'disabled', 'min', 'max','maxlength', 'name',
                'placeholder', 'required', 'selected', 'type', 'unit', 'value', 'visible', 'width'];
    }

    static get formAssociated() { return true; }

    constructor() {
        super(); // init all HTMLElement-properties
        this.attachShadow({mode: 'open', delegatesFocus: true});
        this.importStyleSheet();
    }


    /**
     * The connectedCallback-method is always called when the component is added to the DOM.<br>
     * All dynamical settings, event-listeners and attributes should be done here, 
     * in order to avoid circle calls, while creating the component-children and default settings
     * should be initialized in the constructor:
     * https://web.dev/custom-elements-best-practices/#dont-override-the-page-author
     * Ensure any initial properties set before the component was initialised or passed through our setters:
     * Captures the value from the unupgraded instance and deletes the property,
     * so it does not shadow the custom element's own property setter.
     * This way, when the element's definition does finally load, it can immediately reflect the correct state.
     */
    connectedCallback() { 
        this.#createChildren();
        Object.keys(this.properties).forEach((prop) => {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        });
        // assign the HTML attributes to it's properties
        const attributes = this.getAttributeNames();
        attributes.forEach((attr) => {
            this[attr] = this.booleanAttributes.includes(attr) ? true : this.getAttribute(attr);
        });
        this.setAttribute('tabindex', '0');
        if (this.hasBuddy && this.hasAttribute ('value')) this.value = this.getAttribute('value'); 
        this.captionText = this.textContent.trim();
        if (!this.hasAttribute('captionwidth') && this.captionText == '') this.captionwidth = 0;        
        this.#setEventListeners();
    }

    /**
     * Will be called, when an attribute has been changed!
     * @param {string} attrName represents the attribute's name.
     * @param {any} oldVal provides the old value of this attribute.
     * @param {any} newVal provides the new value of this attribute.
     */
    attributeChangedCallback(attrName, oldVal, newVal) { 
        if (oldVal === newVal) return; // leave immediately if there are no changes!
        if (attrName == 'checked') this.checked = this.hasAttribute('checked') ? true : false;
        if (attrName == 'disabled') this.disabled = this.hasAttribute('disabled') ? true : false;  
        if (attrName == 'required') this.required = this.hasAttribute('required') ? true : false;    
        if (attrName == 'value') this.value = newVal;  
        if (attrName == 'caption') this.captionText = newVal;
        if (attrName == 'captionwidth') this.captionwidth = newVal;  
        if (attrName == 'placeholder') this.placeholder = newVal;  
        if (attrName == 'min') this.min = newVal; 
        if (attrName == 'max') this.max = newVal;  
        if (attrName == 'maxlength') this.maxlength = newVal; 
        if (attrName == 'name') this.name = newVal; 
        if (attrName == 'selected') this.selected = newVal;  
        if (attrName == 'type') this.type = newVal;  
        if (attrName == 'unit') this.unit = newVal; 
        if (attrName == 'width') this.width = newVal; 
    }


    /**
     * This method imports any common CSS stylesheet.<br>
     * Usually the CSS styling is invisible for the shadow-DOM. 
     * But we can add a copy of the stylesheet inside the shadow-DOM.
     * To achieve this, the stylesheet MUST contain a unique data-attribute called DATA-CONTROL.
     * The constructor calls this method in order to install this sheet.
     */
    importStyleSheet(selector = DEF_STYLESHEET_SELECTOR) {
        const link = document.querySelector(selector);
        if (link) this.shadowRoot.innerHTML += link.outerHTML;
    }

    #setEventListeners() {
        if (this.hasBuddy) {
            this.child.addEventListener('change',(event)=> this.onToggleBuddies(event));
            // ensure our callbacks are bound to the component context
            this.onToggleBuddies = this.onToggleBuddies.bind(this);
            this.buddies.forEach((buddy) => {
                buddy.addEventListener('input',(event) => this.handleEvents(event));
                buddy.addEventListener('change',(event) => this.handleEvents(event));                
            });
        }
        if (this.type == 'radio') {
            const radios = this.shadowRoot.querySelectorAll('input[id^="opt"]');
            radios.forEach((opt) => {
                opt.addEventListener('click', (event) => this.onChange(event));
                opt.addEventListener('keydown', (event) => this.onKeyDown(event));
                opt.addEventListener('focus', (event) => this.onFocus(event));
            });
        }
        if (this.child) {
            this.child.addEventListener('input',(event) => this.handleEvents(event));
            this.child.addEventListener('change',(event) => this.handleEvents(event));
            // this.addEventListener('keydown', (event) => this.onKeyDown(event));
        }
    }

    onChange(event) {
        const radio = event.target;
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail: {element: radio, checked: radio.checked, value: radio.value}
        }));
    }

    onFocus(event) {
        console.log(event.target, document.activeElement)
        // debugger
    }

    onKeyDown(event) {
        if (event.target.type == 'radio' && event.keyCode == 32) {
            debugger 
            event.target.setAttribute('checked','');
            event.preventDefault();
        }  
    }

    /**
     * Triggers the toggle-event of the control.
     * Switches the corresponding buddy elements on or off by setting or removing the 'disabled' attribute.
     * @param {event} checkbox the host checkbox
     */
    onToggleBuddies(checkbox) {
        const state = checkbox.target.checked;
        this.buddies.forEach((buddy) => {
            buddy.toggleAttribute('disabled', !state);
        });
        if (this.unit) this.unit.toggleAttribute('disabled', !state);
        this.dispatchEvent(new CustomEvent('toggle', {
            bubbles: true,
            composed: true,
            detail: {element: checkbox.target, ckecked: state, value: checkbox.target.value}
        }));
    }

    
    handleEvents(event) {
        // console.log('Neuer Wert: ' + this.value, event)
        if (this.hasAttribute('unit')) {
            const unit = this.getAttribute('unit');
            this.unit = unit;
        }
    }


    #createChildren() {
        const type = this.getAttribute('type') || 'text';
        if ('button,reset,submit,image,hidden,password'.includes(type)) return;
        if (type === 'checkbox') {
            this.#renderCheckbox();
        } else if (type === 'combobox') {
            this.#renderCombobox();
        } else if (type === 'dropdown') {
            this.#renderDropdown();
        } else if (type === 'radio') {
            this.#renderRadioButtons(this.options);
            return;
        } else {
            this.#renderInput(type);
        }
        this.shadowRoot.appendChild(TMP_STYLE.content.cloneNode(true));
    }

    #renderInput(type = 'text') {
        const label = document.createElement('label'),
              input = document.createElement('input'),
              disabled = this.hasAttribute('disabled'),
              classname = type === 'range' ? 'jom-input jom-range' : 'jom-input';
        this.setAttributes(label, {for: 'jomInput', class: 'jom-caption'});
        this.setAttributes(input, {type: `${type}`, id: 'jomInput', class: `${classname}`});
        this.shadowRoot.append(label, input);
        if (type === 'file') this.shadowRoot.appendChild(this.#renderUnit(disabled,'button'));
        this.shadowRoot.appendChild(this.#renderUnit(disabled));
    }


    #renderCheckbox() {
        const checkbox = document.createElement('input'),
              label = document.createElement('label');
        this.setAttributes(checkbox, {type: 'checkbox', id: 'jomCheckbox', class: 'jom-checkbox'});
        this.setAttributes(label, {for: 'jomCheckbox', class: 'jom-caption'});
        this.shadowRoot.append(checkbox, label);
        if (this.hasAttribute('switch')) {
            const buddies = this.getAttribute('switch').split(',').map(type => type.trim());
            this.#renderBuddies(buddies);
        }
        const disabled = (this.hasBuddy && !this.hasAttribute('checked')) || this.hasAttribute('disabled'),
                unit = this.#renderUnit(disabled);
        this.shadowRoot.appendChild(unit);
    }

    #renderBuddies(buddies) {
        for (let i = 0; i < buddies.length; i++) {
            const buddy = document.createElement('input'), 
                  isCounter = (buddies[i] == 'counter'),
                  type = isCounter ? 'number' : buddies[i],
                  classname = type == 'checkbox' || type == 'radio' ? 'jom-checkbox' : 'jom-input',
                  attributes = {type: type, id: 'chkBuddy' + i, class: classname, buddy: i};
            if (!this.hasAttribute('checked')) attributes.disabled = '';
            if (isCounter) attributes['data-counter'] = ''; // set flag for counter-arrows!
            // if (this.value) attributes.value = this.value;
            this.setAttributes(buddy, attributes);
            this.shadowRoot.appendChild(buddy);
        }
    }

    #renderDropdown() {
        const label = document.createElement('label'),
              select = document.createElement('select');         
        this.setAttributes(label, {for: 'jomDropdown',class: 'jom-caption'});
        this.setAttributes(select, {id: 'jomDropdown',class: 'jom-input'});
        this.shadowRoot.append(label, select);
        this.#renderDropDownList(this.options); 
    }

// TODO add combobox
    #renderCombobox() {
        const label = document.createElement('label'),
              combo = document.createElement('jom-combo');
        this.setAttributes(label, {for: 'jomCombo',class: 'jom-caption'});
        this.setAttributes(combo, {id: 'jomCombo',class: 'jom-combobox'});
        this.shadowRoot.append(label, combo);
    }


    #renderDropDownList(options) {
        if (!options) return;
        this.child.innerHTML = '';
        for (let i = 0; i < options.length; i++) {
            const settings = options[i].split(':'),
                  caption = settings[0],
                  value = settings.length == 1 ? caption : settings[1]; // value = caption?
            this.child.innerHTML += `<option value="${value}">${caption}</option>`;
        } 
    }

    #renderRadioButtons(options) {
        const name = this.name, text = this.textContent.trim();
        this.shadowRoot.innerHTML = '';
        if (text) {
            const label = document.createElement('label');
            this.setAttributes(label, {class: 'jom-caption'});
            this.shadowRoot.appendChild(label);
            this.captionText =text;
        }
        for (let i = 0; i < options.length; i++) {
            const settings = options[i].split(':'),
                  caption = settings[0],
                  value = settings.length == 1 ? caption : settings[1], // value = caption?
                  input = document.createElement('input'),
                  label = document.createElement('label'),
                  attributes = {type: 'radio', 
                                id: 'opt' + name + i, 
                                tabIndex: i+1,
                                class: 'jom-checkbox', 
                                name: name, 
                                value: value};
            this.setAttributes(input, attributes);
            this.setAttributes(label, {for: attributes.id, tabIndex: 0});      
            if (this.hasAttribute('disabled')) label.setAttribute('disabled','');    
            label.appendChild(input);
            label.innerHTML += caption;
            label.addEventListener('keydown', (event) => this.onKeyDown(event));
            this.shadowRoot.appendChild(label);                
        }
        this.shadowRoot.appendChild(TMP_STYLE.content.cloneNode(true));
        this.importStyleSheet();
    }

    #renderUnit(disabled, element = 'unit') {
        const label = document.createElement('label'),
              attributes = {class: `jom-${element}`, hidden: ''};
        attributes['data-' + element] = '';
        if (disabled === true) attributes['disabled'] = '';
        this.setAttributes(label, attributes);
        return label;
    }

    setAttributes(element, attributes) {
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
    }
}

customElements.define('jom-control', Control);