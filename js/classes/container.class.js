import Library from "./library_class.js";

class Container extends Library {
    #divContainer = null;
    #displayStyle = 'block';
    #fadeTime = 250;

    get thisContainer() { return this.#divContainer };


    get fadeTime () { return this.#fadeTime; }
    set fadeTime (newDelay) {
        if (typeof newDelay == 'number') this.#fadeTime = newDelay;
    }
    
    
    get display() { return this.#displayStyle; }
    set display(newStyle) {
        if (typeof newStyle == 'string') {
            this.#displayStyle = newStyle;
            this.show();
        }
    }
    #arrEvents = []; 

    get events() { return this.#arrEvents; }


    /**
     * Creates a new Container class for simple handling.
     * The connected HTML element can be displayed, hidden or faded in and out in an easy way.
     * It's also possible to add event listeners to the container.
     * @param {string | HTMLElement} element The HTML-div element or it's id, if the parameter is a string.
     * @param {string} display Any CSS display style like 'block', 'flex', 'inline' etc.
     * @param {string?} stylesheet [Optional] The path to a stylesheet in order to style the container.
     */
    constructor (element, display, stylesheet) {
        super(stylesheet);
        this.#divContainer = this.getElement(element); 
        if (this.thisContainer != null) {
            // save the current display style!
            this.#displayStyle = display == undefined ? window.getComputedStyle(this.thisContainer).display : display; 
        } else {
            console.error('HTML container could not be assigned.');
        }
    }


    /**
     * Displays the container with it's previously set display style ('flex', 'block' etc.)
     */
    show() {
        this.cssAddStyle(this.thisContainer, `display: ${this.display};`);
    }


    /**
     * Hides the container by setting it's display to "none".
     */
    hide() {
        this.cssAddStyle(this.thisContainer, 'display: none;');
    }


    /**
     * Fades the container in within the passed time of ms. Opacity is 100%.
     * @param {number} time Time in milliseconds the transition shall last.
     */
    fadeIn(time) {
        if (typeof time !== 'number') time = this.fadeTime;
        this.cssAddStyle(this.thisContainer, `transition: opacity ${time}ms linear 0ms;`);
        this.cssAddStyle(this.thisContainer, 'opacity: 1;');
    }


    /**
     * Fades the the container out.  Opacity is 0.
     * @param {number} time Time in milliseconds the transition shall last.
     */
    fadeOut(time) {
        if (typeof time !== 'number') time = this.fadeTime;
        this.cssAddStyle(this.thisContainer, `transition: opacity ${time}ms linear 0ms;`);
        this.cssAddStyle(this.thisContainer, 'opacity: 0;');
    }


    /**
     * Adds an event handler to the container.
     * @param {string} name Event name like 'click', 'input' etc.
     * @param {function} handler Function that handles the event.
     */
    addEventListener(name, handler) {
        this.#arrEvents.push({ event: name, function: handler.name });
        this.thisContainer.addEventListener(name, handler);
    }


    /** TODO filter out the correct event...
     * Removes a given event handler ftom the container.
     * @param {string} name Name of the event handler function to be removed.
     */
    removeEventListener(name, handler) {
        const index = this.#arrEvents.indexOf(name);
        if (index == -1) return;
        this.thisContainer.removeEventListener(name);
        this.#arrEvents.slice(index, 1);
    }


    /**
     * Adds a CSS class to the container.
     * @param {string} classname The class to be added.
     */
    addClass(classname) {
        this.thisContainer.classList.add(classname);
    }


    /**
     * Removes a CSS class from the container.
     * @param {string} classname The class to be removed.
     */
    removeClass(classname) {
        this.thisContainer.classList.remove(classname);
    }


    /**
     * Toggles a CSS class of the container.
     * Syntax is exactly the same like in the .classList.toggle()-method.
     * @param {string} classname The class to be toggled.
     */
    toggleClass(classname, force) {
        this.thisContainer.classList.toggle(classname, force);
    }
}

export default Container;