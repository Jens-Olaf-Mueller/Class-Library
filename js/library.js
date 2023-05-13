/**
 * Universal 'all-in-one' function that unites the DOM-functions
 * => document.getElementById
 * => document.getElementsByTagName
 * => document.getElementsByClassName
 * => document.getElementsByName
 * => document.querySelectorAll
 *  
 * prepend 'export' if you wanna import the function in a module!
 * 
 * @param {string} selector any valid CSS selector
 * @param {number | string} child optional,
 * determines which child of the found nodelist or HTML-collection
 * is supposed to be returned. A number returns the child of the given index. A tilde '~' or the
 * string expression ':last-child' returns the last child of the list / collection.
 * @returns a single element (if selector is a valid ID or child is specified)
 * in all other cases a zero-based nodelist or HTML-collection, matching the selector-parameter
 * If the list contains ONLY ONE element, this element is returned only!
 * @usage   $('main-content')     -   returns an element with ID 'main-content'
 *          $('div','~')          -   returns the last div-container of the document
 *          $('a',0)              -   returns the first link (<a>-element)
 *          $('div.myClass')      -   returns a list with all div's containing class 'myClass'
 *          $('div.myClass','~')  -   returns last div containing class 'myClass'
 *          $('.clsNames',3)      -   returns the 4th(!) child of the wanted class list
 *          $('input[type=text]') -   returns a list with all input elements, being text fields
 *          $('[name]')           -   returns a list with all elements, having a 'name' attribute
 */
 function $(selector, child) {
    // is the last child wanted?
    const getLastChild = (child == '~' || child == ':last-child') ? true : false;
    // check, if 'child' is numeric!
    if (!isNumeric(child, true) || child < 0) child = false;

    // query-selector provided?
    const querySelector = ['[', '.', '#', ':', '>', '*'].some(char => {
        return selector.includes(char);
    });
    if (querySelector) {
        const elements = getElements(document.querySelectorAll(selector), child, getLastChild);
        if (elements) return elements;
    }
    
    const element = document.getElementById(selector); // now search for ID...
    if (element) return element; // ID was found!    
    const htmlTags = document.getElementsByTagName(selector);
    if (htmlTags.length > 0) return getElements(htmlTags, child, getLastChild); // no ID! continue in HTML-tags...     
    const classNames = document.getElementsByClassName(selector);// is the selector a class...? 
    if (classNames.length > 0) return getElements(classNames, child, getLastChild);
    const names = document.getElementsByName(selector); // ...or is it a name finally?
    if (names.length > 0) return getElements(names, child, getLastChild);
    return null;
}

function getElements(nodeList, child, getLastChild) {
    // don't return a node list, with only ONE child! 
    // but this single child-element instead 
    if (nodeList.length == 1) return nodeList[0];
    if (getLastChild) child = nodeList.length - 1;
    return (child === false) ? nodeList : nodeList[child];
}

/**
 * Checks properly (!), if the given expression is numeric.
 * recognizes: undefined, NaN, Null, infinity etc.
 * @param {number | numeric string} expression 
 * @param {boolean} allowStringNumbers optional, tells if string literals are allowed or not (default)
 * @returns true | false
 */
 function isNumeric(expression, allowStringNumbers) {
    if (allowStringNumbers == true) return Number.isFinite(parseFloat(expression));
    return Number.isFinite(expression);
}

function addWatermark(element, text, center, top, left, bottom, right) {
    let cssStyle = 'position: absolute;';
    if (center) {
        top = '50%';
        right = '50%';
    }
    cssStyle += top ? `top: ${top};` : '';
    cssStyle += left ? `left: ${left};` : '';
    cssStyle += bottom ? `bottom: ${bottom};` : '';
    cssStyle += right ? `right: ${right};` : '';
    cssStyle += center ? `transform: translate(50%,-50%);` : '';
    element.innerHTML += `<h2 id="h2-${element.id}" class="watermark">${text}</h2>`;
    $(`h2-${element.id}`).style.cssText += cssStyle;
}

export { $, addWatermark };