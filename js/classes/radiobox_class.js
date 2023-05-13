const TMP_RADIOSTYLE = document.createElement('template');
TMP_RADIOSTYLE.innerHTML = `
    <style>
        :host {
            display: flex;
        }
    </style>
`;

class Radiobox extends HTMLElement {
    #value;
    get value() { return this.#value; }
    set value(newVal) {
        this.#value = newVal;
    }

    static get obseverdAttributes() {
        return ['value'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open', delegatesFocus: true});
        this.#createChildren();
    }

    connectedCallback() {
        debugger
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) return;
        debugger
    }

    disconnectedCallback() {
        debugger
    }

    #createChildren() {
        debugger
        //
    }
}
window.customElements.define('jom-radio', Radiobox);