const TMP_COMBOSTYLE = document.createElement('template');
TMP_COMBOSTYLE.innerHTML = `
    <style>
        :host {
            height: 100%;
        }

        .jom-combo {
            height: 100%;
            display: inline-block;
            position: relative;
        }

        #inpCombo {
            min-height: 1.125rem;
            height: 100%;
        }

        #divCombo.extended-list::after {
            display: block;
            content: '';
            position: absolute;
            top: 2px;
            right: -20px;
            width: 24px;
            height: 24px;
            background: linear-gradient(#008000 0 0), 
                        linear-gradient(#008000 0 0);
            background-position: center;
            background-size: 50% 3px,3px 50%;
            background-repeat: no-repeat;
        }

        #divArrow.jom-arrow-down {
            position: absolute;
            margin: 4px;
            width: 7px;
            height: 7px;
            right: 4px;
            top: 8px;
            border-bottom: 2px solid rgba(0, 0, 0, 0.5);
            border-right: 2px solid rgba(0, 0, 0, 0.5);
            transform: translate(0, -65%) rotate(45deg);
            cursor: pointer;
            z-index: 9999;
        }

        #divArrow.jom-arrow-up {
            top: 12px;
            transform: translate(0, -65%) rotate(225deg);
        } 

        .jom-combo ul {
            position: absolute;
            width: 100%;
            z-index: 999999;
            list-style: none;
            padding: unset;
            margin: unset;
            overflow-y: hidden;
        }

        .jom-combo ul.scroll {
            overflow-y: scroll;
        }

        li.jom-list-item {
            padding: 0 3px;
            border-left: 1px solid silver;
            border-right: 1px solid silver;
            background-color: field;
            cursor: pointer;
        }

        li.jom-list-item:last-child {
            border-bottom: 1px solid silver;
        }

        li.jom-list-item[selected] {
            background-color: cornflowerblue;
        }
    </style>`;

class Combobox extends HTMLElement {
    #size = 6;
    #dropped = false;
    #listindex = -1;
    #options = null;
    newEntryAutoAdd = true;

    get options() {
        if (this.#options) return this.#options;
        if (this.hasAttribute('options')) return this.getAttribute('options');
        return null; // --> or better [] ???
    }
    set options(newOpts) {
        this.#options = newOpts.split(',').map(opt => opt.trim());
        if (this.#options.length == 0) return;
        if (!this.hasAttribute('options')) this.setAttribute('options', newOpts);
        // this.openDropdownList(this.#options);
    }

    get size() { return this.#size; }
    set size(newSize) {
        this.#size = newSize;
        if (!this.hasAttribute('size')) this.setAttribute('size', newSize);
    }

    get value() { return this.shadowRoot.getElementById('inpCombo').value; }
    set value(newVal) { 
        if (!this.hasAttribute('value')) this.setAttribute('value', newVal);
        const input = this.shadowRoot.getElementById('inpCombo');
        if (input) input.value = newVal;
    }

    get list() { return this.shadowRoot.querySelector('#divCombo ul'); }
    get selectedItem() { return this.shadowRoot.querySelector('li[selected]'); }

    get isDropped() { return this.#dropped; }
    set isDropped(flag) {
        this.#dropped = (Boolean(flag)) ? true : false;
        const arrow = this.shadowRoot.getElementById('divArrow');
        if (this.#dropped) {
            arrow.classList.add('jom-arrow-up');
        } else {
            arrow.classList.remove('jom-arrow-up');
        }
    }

    static get observedAttributes() {
        return ['options','size', 'value'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open', delegatesFocus: true});
        this.importStyleSheet();
    }

    connectedCallback() {
        this.#createChildren();
        this.#setEventListeners();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) return; // leave immediately if there are no changes!
        if (attrName == 'options') this.options = newVal;
        if (attrName == 'size') this.size = newVal;
        if (attrName == 'value') {
            debugger
            this.value = newVal;
        } 
    }

    #setEventListeners() {
        const input = this.shadowRoot.getElementById('inpCombo'),
              arrow = this.shadowRoot.getElementById('divArrow');
        input.addEventListener('input', (event) => this.onInput(event));
        input.addEventListener('keydown', (event) => this.onKeydown(event));
        arrow.addEventListener('click', (event) => this.onArrowClick(event));
    }

    onInput(event) {
        const searchFor = event.target.value.toLowerCase(), 
              arrMatches = [],
              wrapper = this.shadowRoot.getElementById('divCombo');
        this.closeDropdownList();
        wrapper.classList.remove('extended-list');
        if (searchFor.length == 0) return;
        for (let i = 0; i < this.options.length; i++) {
            const item = this.options[i];
            if (item.substring(0, searchFor.length).toLowerCase() === searchFor) {
                arrMatches.push(item);
            }
        }
        if (arrMatches.length == 0) {
            wrapper.classList.add('extended-list');
            this.#listindex = -1;
            return;
        }
        // wrapper.classList.remove('extended-list');
        this.openDropdownList(arrMatches);
    }

    onArrowClick(event) {
        if (this.isDropped) {
            this.closeDropdownList();            
        } else {
            this.openDropdownList(this.#options);            
        }
    }

    onKeydown(event) {    
        const key = event.key, 
              wrapper = this.shadowRoot.getElementById('divCombo');
        if (key == 'Enter') {
            if (!this.isDropped) {
                if (this.newEntryAutoAdd) {
                    if (!this.#options.includes(this.value)) {
                        this.#options.push(this.value);
                        wrapper.classList.remove('extended-list');
                    }
                }
            } else if (this.selectedItem) {
                this.shadowRoot.getElementById('inpCombo').value = this.selectedItem.innerText;
                this.closeDropdownList();
            }
        } 
        if (this.isDropped) {
            if (key == 'Escape') this.closeDropdownList();          
            // if (key == 'ArrowDown') this.#scrollDown(list);           
            // if (key == 'ArrowUp')  this.#scrollUp(list);
            if (key.includes('Arrow')) this.#scroll(key);            
        }        
    }

    onItemClick(evt) {
        this.shadowRoot.getElementById('inpCombo').value = evt.target.innerText;
        this.closeDropdownList();
    }


    onMouseHover(evt) {
        if (this.selectedItem) this.selectedItem.removeAttribute('selected');
        evt.target.setAttribute('selected','');
        const list = this.shadowRoot.querySelectorAll('li.jom-list-item');
        this.#listindex = -1;        
        do {
            this.#listindex++;
        } while (!list[this.#listindex].hasAttribute('selected'));
    }

    openDropdownList(options) {
        this.closeDropdownList();
        this.isDropped = (options.length > 0);
        for (let i = 0; i < options.length; i++) {
            const item = document.createElement('li');
            item.className = 'jom-list-item';
            item.innerText = options[i];
            item.addEventListener('click', (evt) => this.onItemClick(evt));
            item.addEventListener('mousemove', (evt) => this.onMouseHover(evt));
            this.list.appendChild(item);            
            if (i >= this.size - 1 && !this.list.classList.contains('scroll')) {
                const height = item.offsetHeight * this.size;
                this.list.classList.add('scroll');
                this.setAttributes(this.list, {style: `max-height: ${height}px;`});
            }
        }
    }

    closeDropdownList() {
        this.list.innerHTML = '';
        this.list.classList.remove('scroll');
        this.isDropped = false;
    }

    importStyleSheet(selector = 'link[data-control]') {
        const link = document.querySelector(selector);
        if (link) this.shadowRoot.innerHTML += link.outerHTML;
    }

    #createChildren() {
        const wrapper = document.createElement('div'),
              arrow = document.createElement('div'),
              input = document.createElement('input'),
              list = document.createElement('ul');
        this.setAttributes(wrapper, {id: 'divCombo', class: 'jom-combo'});
        this.setAttributes(arrow, {id: 'divArrow', class: 'jom-arrow-down'});
        this.setAttributes(input, {type: 'text', id: 'inpCombo', class: 'jom-input'});
        wrapper.append(input, arrow, list);
        this.shadowRoot.append(wrapper, TMP_COMBOSTYLE.content.cloneNode(true));
    }

    #scroll(key) {
        const list = this.shadowRoot.querySelectorAll('li.jom-list-item'),
              step = (key === 'ArrowDown') ? 1 : -1,
              bound = (key === 'ArrowDown') ? 0 : list.length - 1,
              flag = (key === 'ArrowDown') ? false : true;
        this.#listindex += step;
        if (this.selectedItem) {
            this.selectedItem.removeAttribute('selected');
            if (this.#listindex < 0 || this.#listindex >= list.length) this.#listindex = bound;
        } else {
            this.#listindex = bound;
        }
        list[this.#listindex].setAttribute('selected','');
        list[this.#listindex].scrollIntoView(flag);
    }


    setAttributes(element, attributes) {
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
    }
}

customElements.define('jom-combo', Combobox);