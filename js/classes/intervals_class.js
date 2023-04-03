/**
 * @description
 * This class is a collection class in order to manage differents intervals.
 * A registered interval can be addressed in 3 ways:
 *      > by the id assigned by setInterval-function,
 *      > by it's name, assigned during registration with add-method,
 *      > by it's key, alike the name-selector
 * 
 * It has got 2 properties: .name   --> default name of the class (used to create unique interval key)
 *                          .count  --> number of registered intervals
 * 
 * and 7 methods:
 * - add()      --> registers an interval and starts it
 * - start()    --> (re)starts ONE or ALL registered intervals
 * - stop()     --> stops ONE or ALL registered intervals
 * - clear()    --> removes ALL intervals
 * - remove()   --> removes a SINGLE interval
 * - find()     --> searches an interval by id, name or key, 
 *                  returns it's index or 'null' if not found
 * - list()     --> lists all intervals in the browser's console
 */

import Library from "./library_class.js";

/**
 * @typedef {(number | string)} IntervalKey 
 * A valid interval type is either a numeric integer value that represents the interval-id.
 * If the parameter is passed as a string, it represents the assigned key for that interval.
 * If the parameter is omitted (undefined) it refers to ALL intervals!
 */

class IntervalCollection extends Library {
    #arrIntervals = []; // JSON array!
    #name = 'Interval';

    get intervals() { return this.#arrIntervals; }

    get count() { return this.#arrIntervals.length };

    get name() { return this.#name; } 

    
    /**
     * Creates a new Interval collection.
     * @param {string} name Name of this class instance, used as identifyer.
     */
    constructor(name) {
        super();
        if (typeof name == 'string') this.#name = name;
    }

    /**
     * Registers an interval to the collection.
     * @param {function} fnc function to be executed in the interval
     * @param {number} timeout for interval
     * @param {class} objContext parent class
     * @returns the id of the started interval
     * @example classvariable.add ( myFunctionName, 1000, 'keyForInterval');
     * @example classvariable.add (
     *              function myFunctionName() {
     *                  // interval code here...
     *              }, 1000, $this
     *          );
     */ 
    add(fnc, timeout, objContext) {
        const ID = setInterval(fnc, timeout, objContext),
              name = this.#createKey(objContext),
              key = (name === objContext) ? objContext : name + '_' + fnc.name;
        // debugger    
        const interval = {
            id: ID,
            handler: fnc,           // setInterval-function
            timeout: timeout,
            context: objContext,    // parent class
            name: name,             // name for the interval (or default)
            key: key,               // class- | default name + fnc-name
            get isRunning() {return this.id !== undefined}
        };
        this.intervals.push(interval);
        return ID;
    }


    #createKey(objContext, fncName) {
        if (this.isClass(objContext)) return objContext.name || this.name;
        if (objContext === undefined) return this.name;
        if (typeof objContext == 'string') return objContext;
        return undefined;
    }


    /**
     * Restarts a registered (existing!) interval.
     * @param {IntervalKey?} interval [Optional]
     * The id, key or the name of the interval to be re-started.  
     * If "interval" is omitted, the method restarts ALL(!) registered intervals.
     */
    start(interval) {
        if (interval !== undefined) {
            let index = this.find(interval);
            if (index !== null) {
                const objInt = this.intervals[index];
                objInt.id = setInterval(objInt.handler, objInt.timeout, objInt.context);
            }
        } else { // start all(!) intervals
            for (let i = 0; i < this.count; i++) {
                const int = this.intervals[i];
                this.start(int.key);
            }
        }
    }

    /**
     * Stops an existing interval.
     * @param {IntervalKey?} interval [Optional]
     * The id, key or the name of the interval to be stopped. 
     * If interval is omitted, ALL intervals will be stopped.
     */
    stop(interval) {
        if (interval !== undefined) {
            let index = this.find(interval);  
            debugger      
            // loop through the array in order to find all intervals of the context!
            while (index !== null) {
                // clearInterval-method sets id to undefined!
                this.intervals[index].id = clearInterval(this.intervals[index].id);
                index = this.find(interval);
            }
        } else { // param interval not provided, so stop all(!) intervals by recursive call
            for (let i = 0; i < this.count; i++) {
                const int = this.intervals[i];
                if (int.id !== undefined) this.stop(int.id);
            }
        }        
    }

    /**
     * Removes all stored intervals from memory.
     */
    clear() {
        this.intervals.forEach(interval => {
            this.remove(interval.id);
        });
        this.#arrIntervals = [];
    }

    /**
     * Removes either a single interval or ALL intervals of a given context from memory.<br>
     * 
     * If interval is submitted by key, the method loops through all intervals,
     * in order to remove ALL intervals belonging to that context.
     * @param {IntervalKey} interval Numeric or string key to determine the specific interval.
     */
    remove(interval) {
        if (interval) {
            let index = this.find(interval);           
            // since there can be multiple intervals per context, 
            // we loop through the whole array!
            while (index !== null) {
                clearInterval(this.intervals[index].id);
                this.intervals.splice(index, 1);
                index = this.find(interval);
            }
        }
    }

    /**
     * Searches for a given interval.
     * @param {IntervalKey?} interval Either a numeric value (represents the id)
     * or a string as key, that has been saved in the add-method.
     * @returns {number | null} Index of the interval or null, if interval was not found.
     */
    find(interval) {
        for (let i = 0; i < this.count; i++) {
            const int = this.intervals[i];
            // if (int.id === undefined) return null; // interval is already stopped!!!
            if (!int.isRunning) return null; // interval is already stopped!!!
            if (int.id === interval || int.key === interval || int.name === interval) return i;
        }
        return null;
    }

    /**
     * For debugging purposes: logs out all intervals on console
     */
    list() {
        for (let i = 0; i < this.count; i++) {
            const int = this.intervals[i]; 
            console.log('Interval ' + int.name, int); 
        }
        console.log(this.count + ' intervals registered...');
    }
}

export default IntervalCollection; 