// https://web.dev/custom-elements-v1/#attrchanges
// https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements

class Control extends HTMLElement {

    // A getter/setter for a disabled property.
    get disabled() { return this.hasAttribute('disabled'); }

    // Reflect the value of the disabled property as an HTML attribute.
    set disabled(val) {        
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    get caption() {
        if (this.hasAttribute('caption')) return this.getAttribute('caption');
    }

    /**
     * Elements can react to attribute changes by defining a attributeChangedCallback. 
     * The browser will call this method for every change to attributes 
     * listed in the observedAttributes array:
     * @see #{@link attributeChangedCallback}
     */
    static get observedAttributes() {
        return ['disabled', 'checked', 'visible'];
    }

    constructor() {
        // debugger
        super();
        console.log(this.getAttributeNode('id'))
        this.innerHTML =`<label>${this.caption}</label>
        <input type="${this.getAttribute('type')}">`;
        console.log(this)
        // this.disabled = 'disabled';
    }

    /**
     * Will be called, when an attribute has been changed!
     * @param {string} attrName 
     * @param {*} oldVal 
     * @param {*} newVal 
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        // ...
        console.log('Attribute ' + attrName + ' changed from ' + oldVal + ' to: ' + newVal);
    }
}

customElements.define('jom-control', Control);