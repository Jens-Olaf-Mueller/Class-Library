/**
 * This class is a collection class in order to manage differents intervals.
 * A registered interval can be addressed in 3 ways:
 *      > by the ID assigned by setInterval-function,
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
 * - find()     --> searches an interval by ID, name or key, 
 *                  returns it's index or 'null' if not found
 * - list()     --> lists all intervals in the browser's console
 */

export default class IntervalListener {
    arrIntervals = []; // JSON array!
    name = 'interval';
    get count() {return this.arrIntervals.length};

    constructor (name) {
        if (typeof name == 'string') this.name = name;
    }

    /**
     * registers an interval to the collection
     * @param {function} fnc function to be executed in the interval
     * @param {number} timeout for interval
     * @param {object} object parent class
     * @returns the id of the started interval
     * @example classvariable.add (
     *              function myFunctionName() {
     *                  // interval code here...
     *              }, 1000, $this
     *          );
     */ 
    add (fnc, timeout, object) {        
        let id = setInterval(fnc, timeout, object),
            key = object.name + '_' + fnc.name || this.name + '_' + fnc.name;
        const interval = {
            ID: id,
            handler: fnc,                    // setInterval-function
            timeout: timeout,
            context: object,                 // parent class
            name: object.name || this.name,  // name for the interval (or default)
            key: key                         // class- | default name + fnc-name
        };
        this.arrIntervals.push(interval);
        return id;
    }


    /**
     * restarts a registered (existing!) interval
     * @param {number | string | undefined} interval id, key or name of the interval to be re-started  
     */
    start (interval) {
        if (interval !== undefined) {
            let index = this.find(interval);
            if (index !== null) {
                const objInt = this.arrIntervals[index];
                objInt.ID = setInterval(objInt.handler, objInt.timeout, objInt.context);
            }
        } else { // start all(!) intervals
            for (let i = 0; i < this.arrIntervals.length; i++) {
                const int = this.arrIntervals[i];
                this.start(int.key);
            }
        }
    }

    /**
     * stops an existing interval
     * @param {number | string | undefined} interval ID, key or name of the interval to be stopped.
     * If interval is 'undefined', ALL intervals will be stopped.
     */
    stop (interval) {
        if (interval !== undefined) {
            let index = this.find(interval);        
            // loop through the array in order to find all intervals of the context!
            while (index !== null) {
                // clearInterval-method sets ID to undefined!
                this.arrIntervals[index].ID = clearInterval(this.arrIntervals[index].ID);
                index = this.find(interval);
            }
        } else { // param interval not provided, so stop all(!) intervals by recursive call
            for (let i = 0; i < this.arrIntervals.length; i++) {
                const int = this.arrIntervals[i];
                if (int.ID !== undefined) this.stop(int.ID);
            }
        }        
    }

    /**
     * removes all saved intervals from memory
     */
    clear () {
        this.arrIntervals.forEach(interval => {
            this.remove(interval.ID);
        });
        this.arrIntervals = [];
    }

    /**
     * removes either a single interval or ALL intervals of a given context from memory.
     * if interval is submitted by key, the method loops through all intervals,
     * in order to remove ALL intervals belonging to that context.
     * @param {number | string} interval numeric or string key to determine the specific interval
     */
    remove (interval) {
        if (interval) {
            let index = this.find(interval);           
            // since there can be multiple intervals per context, 
            // we loop through the array!
            while (index !== null) {
                clearInterval(this.arrIntervals[index].ID);
                this.arrIntervals.splice(index, 1);
                index = this.find(interval);
            }
        }
    }

    /**
     * searches for a given interval
     * @param {number | string} interval either a numeric value (represents the ID)
     * or a string as key, that has been saved in the add-method
     * @returns index of the interval in array or null, if interval was not found
     */
    find (interval) {
        for (let i = 0; i < this.arrIntervals.length; i++) {
            const int = this.arrIntervals[i]; 
            if (int.ID === interval || int.key === interval || int.name === interval) return i;
        }
        return null;
    }

    /**
     * for debugging purposes: logs out all intervals on console
     */
    list () {
        for (let i = 0; i < this.arrIntervals.length; i++) {
            const int = this.arrIntervals[i]; 
            console.log('Interval ' + int.name, int); 
        }
        console.log(this.count + ' intervals registered...');
    }
}