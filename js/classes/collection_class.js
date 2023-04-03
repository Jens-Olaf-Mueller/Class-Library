/**
 * Collection class
 * @module ./js/collection_class.js
 * @classdesc
 * 
 * @author Jens-Olaf Müller <jens.olaf.mueller@gmail.com>
 * @version 0.1.0
 * @description Creates a collection to store and handle different types of data.
 * You can work with these different data types in several ways. 
 * Each item of the collection is accessable over it's numerical index or over an
 * assigned unique string key. You can filter and access the whole list by the different types,
 * and add new items or change and remove existing items.
 * Besides the common data types, you can determine whether a stored item is an array or not. 
 */

/**
 * A string with pre-defined values, similarly to the typeof keyword.
 * The value "array" is a special case. If passed, the method returns any type of array.
 * @typedef {('string' | 'number' | 'bigint' | 'boolean' | 'object' | 'symbol' | 'function' | 'undefined' | 'html' | 'array' )} typeString 
 */

const typeNames = ['string','number','bigint','boolean','object','symbol','function','undefined','html','array'];

/**
 * @const {string} ERR_IndexOutOfRange Error text that is shown, 
 * if a passed index is out of the collection's range. Means either
 * smaller than zero or larger than the last index of the collection list.
 * @const {string} ERR_InvalidType Error text that is shown, if the type-
 * parameter for the 'getItemsByType'-method is not a string.
 */
const ERR_IndexOutOfRange = 'Index out of range',
      ERR_InvalidType = 'Invalid item type',
      ERR_KeyExists = 'Key already exists',
      ERR_KeyInvalid = 'Invalid key. (Key must be a string)';

class Collection {
    #items;
    #keys;
    /**
     * @property {number} count
     * Returns the number of stored items.
     */
    get count() { return this.#items.length; }


    /**
     * @property {array} items
     * Returns all items stored in the list.
     */
    get items() { return this.#items; }


    /**
     *  @property {array} keys
     * Returns all keys related to the items.
     */
    get keys() { return this.#keys; }

    /**
     * Creates a new instance of a collection.
     * A collection serves to store and handle different types of data.
     * You can work with these different data types in several ways. 
     * Each item of the collection is accessable over it's numerical index or over an
     * assigned unique string key. You can filter and access the whole list by the different data types,
     * and add new items or change and remove existing items.
     * Besides the common data types, you can determine whether a stored item is an array or not
     * or if an item is an HTML-element. 
     * 
     * An optional passed list of items will be immediately added.
     * @param  {...any?} items [optional] list of items to be stored.
     */
    constructor(...items) {
        this.clear();
        if (items.length) {
            for (let i = 0; i < items.length; i++) {
                this.add(items[i], `${i}`);                
            }
        }
    }
    

    /**
     * Adds an item and stores it at end of the collection.
     * @param {any} item Any type of data.
     * @param {string?} key An optional unique string key for identification 
     * of the item beside the index. If omitted the index will be 
     * converted into a string and used as the key.
     * Returns an error, if the passed key already exists.
     */
     add(item, key) {
        if (this.keyExists(key)) return new Error(ERR_KeyExists);
        this.#items.push(item);
        if (key === undefined) key = this.count.toString();
        this.#keys.push(key);
    }


    /**
     * Removes the item with the specified key or index.
     * @param {number | string} key A numeric index or a string key.
     * Must be valid, otherwise an error is returned.
     * @returns {boolean} true | false 
     */
    remove(key) {
        if (!this.keyIsValid(key)) return new Error(ERR_IndexOutOfRange, {cause: {key: key}});
        const index = (typeof key === 'number') ? key : this.#keys.indexOf(key);
        try {
            this.#items.splice(index, 1);
            this.#keys.splice(index, 1);
            return true;
        } catch (error) {
            return false;
        }
    }


    /**
     * Clears the whole collection.
     */
    clear() {
        this.#items = [];
        this.#keys = [];
    }


    /**
     * Returns the item with the passed index or key.
     * If the index or key is invalid, an error occures.
     * @param {number | string} key A numeric index or a string key.
     * @returns {any} The wanted item. 
     */
    getItem(key) {
        if (!this.keyIsValid(key)) return new Error(ERR_IndexOutOfRange, {cause: {key: key}});
        const index = (typeof key === 'number') ? key : this.#keys.indexOf(key);
        return this.#items[index];
    }


    /**
     * Assigns a new value to the item with the specified key or index.
     * @param {number | string} key A numeric index or a string key.
     * Must be valid, otherwise an error is returned.
     * @param {any} value Any type of data.
     * @returns {boolean} true | false 
     */
    setItem(key, value) {
        if (!this.keyIsValid(key)) return new Error(ERR_IndexOutOfRange, {cause: {key: key}});
        const index = (typeof key === 'number') ? key : this.#keys.indexOf(key);
        try {
            this.#items[index] = value;
            return true;
        } catch (error) {
            return false;
        }
    }


    /**
     * Returns an array of objects containing all items and the corresponding indexe's 
     * and keys that match to the passed type.
     * This way you can filter the collection by any data-types 
     * (strings, objects, numeric values and so on).
     * @param {typeString} typeName The type of the wanted items to be returned.
     * The passed param must be a string with following values, 
     * similarly to the typeof keyword:
     * > "string" | "number" | "bigint" | "boolean" | "object" | "symbol" | "function" | undefined | "array" 
     * 
     * The value "array" is a special case. If passed, the method returns any type of array.
     * @returns {object[]} an array of objects {index: ..., item: ...} that match to the type.
     */
    getItemsByType(typeName) {        
        if (typeof typeName !== 'string' || !typeNames.includes(typeName)) 
            return new Error(ERR_InvalidType, {cause: {type: typeName}});
        let arr = [];
        for (let i = 0; i < this.#items.length; i++) {
            const item = this.#items[i], key = this.#keys[i];
            if (typeof item === typeName || 
                (item instanceof Array && typeName === 'array') ||
                (item instanceof HTMLElement && typeName === 'html')) {
                arr.push({index: i, key: key, item: item})
            };
        }
        return arr;
    }


    /**
     * Returns the type name (string) for the specified item.
     * If the key is out of range of the items, an error is returned. <br>
     * If 'key' is omitted, an array with all items and their types is returned.
     * @param {number | string} key [Optional] a numeric index or a string key.
     * @returns {string | string[]} If key or index is omitted, the method returns an array 
     * with the type for all items according to it's indexes.
     */
    getItemType(key) {
        let arr = [];
        if (key === undefined) {
            this.#items.forEach(item => {
                const type = (item instanceof Array) ? 'array' : (item instanceof HTMLElement) ? 'html' : typeof item;
                arr.push(type);
            });
            return arr;
        }        
        if (!this.keyIsValid(key)) return new Error(ERR_IndexOutOfRange, {cause: {key: key}});
        const index = (typeof key === 'number') ? key : this.#keys.indexOf(key);
        if (this.#items[index] instanceof Array) return 'array';
        return (typeof this.#items[index]);
    }


    /**
     * Assignes a new key to an item. The key must be a string and must not exist yet!
     * Otherwise an error will be returned.
     * @param {number} index The numeric index of the item, whom's key is supposed to be changed.
     * @param {string} key The new key to be assigned.
     */
    setKey(index, key) {
        if (typeof index !== 'number' || !this.keyIsValid(index)) 
            return new Error(ERR_IndexOutOfRange, {cause: {index: index}});
        if (typeof key !== 'string') return new Error(ERR_KeyInvalid, {cause: {key: key}});
        if (this.keyExists(key)) return new Error(ERR_KeyExists, {cause: {key: key}});
        this.#keys[index] = key;
    }


    /**
     * Checks whether the specified key or index is in the range of the collection list.
     * @param {number | string} key A numeric value if the index is checked.
     * A string if we look for the item's key.
     * @returns {boolean} true | false.
     */
    keyIsValid(key) {
        if (typeof key === 'number') return (key >= 0 && key < this.count);
        if (typeof key === 'string') return (this.#keys.includes(key));
    }


    /**
     * Checks, if the passed key already exists.
     * @param {string} key The key to be checked if it exists.
     * @returns {boolean} true | false 
     */
    keyExists(key) {
        return (this.#keys.includes(key));
    }
}

export default Collection;