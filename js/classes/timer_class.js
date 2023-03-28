import Library from "./library_class.js";

const EVT_TIMEOUT = 'timeout',
      EVT_EXPIRED = 'timerexpired';

class Timer extends Library {
    #timerID = undefined;
    #countDownID = undefined;
    #canResume = false;
    #display = null;
    #start_sec = 0;
    #start_min = 0;
    #start_hrs = 0;
    #secRemaining = 0; // for countdown!
    #sound = null;
    #soundOn = false;
    #playTime = Infinity;

    /**
     * Returns the timer's interval id.
     * @readonly
     */
    get id() { return this.#timerID };
    

    /**
     * Returns the interval id of the countdown.
     * @readonly
     */
    get countDownId() { return this.#countDownID };


    /**
     * Tells us, wether the timer is running or not.
     * @readonly
     */
    get timerIsRunning() { return this.#timerID !== undefined; }


    /**
     * Sets or returns the HTML element where the running time can be displayed.<br>
     * If not set, the timer runs without display but still may be accessed and shown by the
     * "timeString" or "timeObject" property.
     * @see #{@link timeString}
     * @see #{@link timeObject}
     */
    get displayElement() {return this.#display};
    set displayElement(expression) {
        this.#display = this.getElement(expression);
    }

    /**
     * Tells us, if a sound is provided.
     * @readonly
     */
    get hasSound() { return this.#sound instanceof Audio; }


    /**
     * Creates a new Audio object by passing the path to an audio file.
     * @param {string} newURL The URL to an audio file. (i.e. a ticking clock etc.)
     */
    set sound(newURL) {
        this.#sound = (typeof newURL == 'string') ? new Audio(newURL) : null;
        if (this.#sound) {
            this.#sound.loop = (this.#playTime === Infinity);
            this.#sound.muted = !this.soundEnabled;
        }
    }


    /**
     * Enables or disables the sound.
     */
    get soundEnabled() { return this.#soundOn; }
    set soundEnabled(value) {
        if (typeof value == 'boolean') {
            this.#soundOn = value;
            this.#sound.muted = !value;
        }
    }

    
    /**
     * Sets or returns the playtime of the sound.
     * @param {number | Infinity} newTime If a number is passed, 
     * the playtime is set to this value in seconds. <br>
     * If the value "Infinity" is passed, the sound is played as a loop.
     */
    set soundPlayTime(newTime) {
        this.#playTime = (newTime === Infinity || typeof newTime == 'number') ? newTime : this.#sound.duration;
        this.#sound.loop = (newTime === Infinity);
    }
    get soundPlayTime() { return this.#playTime; }

    /**
     * Returns the running time as a string in format: <strong>hh:nn:ss</strong>
     * @readonly
     */
    get timeString() { return this.#formatTime(this.hrs, this.min, this.sec); }
    

    /**
     * Returns the running time as an object: <br>
     * <strong>{hours: hh, minutes: nn, seconds: ss}</strong>
     * @readonly
     */
    get timeObject() { return {hours: this.hrs, minutes: this.min, seconds: this.sec}; }


    /**
     * Returns the remainig time of the countdown in format: <strong>hh:nn:ss</strong>
     * @readonly
     */
    get countDownRemaining() {
        const hours = parseInt(this.#secRemaining / 3660),
              minutes = parseInt((this.#secRemaining - hours * 3600) / 60),
              seconds = parseInt(this.#secRemaining - (hours * 3600 + minutes * 60));
        return this.#formatTime(hours, minutes, seconds);
    }

    alertTime = null;
    sec = 0;
    min = 0;
    hrs = 0;
    
    showMinutes = true;
    showHours = true;
    
    /**
     * Creates a new timer class with following features: <br>
     * <strong>METHODS:     9 </strong> <br>
     * <strong>PROPERTIES:  14 </strong> <br>
     * <strong>EVENTS:      2 </strong> <br>
     *              - timeout       --> fired when countdown reaches zero <br>
     *              - timerexpired  --> fired when defined alert time is reached <br>
     * <strong> EXAMPLE: let myTimer = new Timer (12, 30, 0, 'divClock', true); </strong> <br>
     *              Will assign the timer to 'myTimer' at "12:30:00" and starts it immediately. <br>
     *              Running time will be displayed on a &ltdiv&gt-Element with ID 'divClock'. <br>
     * <strong> USAGE: </strong> All params while creating a new instance of the timer are optional! <br>
     *              If no time is submitted, the timer starts with 00:00:00. <br>
     *              If no HTML-element is submitted, it can be set later by the displayElement property. <br> <br>
     * @param {number | string} hours Either the hours to be set as a number or 
     * the whole time to be set as a valid time string like: "18:45:30"
     * @param {number} minutes [Optional]
     * @param {number} seconds [Optional]
     * @param {HTMLElement | string} display HTML element or it's id to display the time.
     * @param {boolean} run Determines wether the new timer starts immediately or not (default).
     */
    constructor(hours = 0, minutes = 0, seconds = 0, display, run = false) {
        super();
        this.displayElement = display;
        this.setTime(hours, minutes, seconds);
        if (run == true) this.start();
    }


    /**
     * Starts a defined timer or continues a stopped one,
     * if the internal flag "canResume" is set to true.
     * The method raises an alert-event, if a previous set alert time is reached.
     * It also displays the current time to a possibly defined HTML element.
     */
    start() {
        if (this.#canResume) {
            if (this.timerIsRunning) clearInterval(this.#timerID);
        } else {
            if (this.timerIsRunning) return; // avoid conflict with a running timer!
            this.reset();
        }
        // now start the interval timer
        this.#timerID = setInterval(() => {
            this.sec++;
            if (this.sec == 60) {
                this.sec = 0;
                this.min++;
                if (this.min == 60) {
                    this.min = 0;
                    this.hrs++;
                    if (this.hrs == 24) this.hrs = 0;
                }
            }
            const currTime = this.#formatTime(this.hrs, this.min, this.sec);
            if (this.displayElement) this.displayElement.innerText = currTime;
            if (this.alertTime == currTime) document.dispatchEvent(new Event(EVT_EXPIRED)); // raise event            
        }, 1000);
    }


    /**
     * Stops the timer. A possible running count down will be continue!
     * @param {boolean} resume If set to 'true' the current timer can be resumed later.
     * Any other value causes a final stop of the timer.
     */
    stop(resume = false) {
        this.#canResume = (typeof resume == 'boolean') ? resume : false;
        this.#timerID = clearInterval(this.#timerID);
    }


    /**
     * Resumes a stopped timer (or starts it when not done before).
     */
    resume() {
        this.start();
    }

    
    /**
     * Sets the time parameters.<br>  
     * Either seperately or as a valid time string such as: "17:55:30".<br>
     * If a time string is passed, the minutes and seconds will be ignored!
     * If hours are submitted but minutes or seconds are omitted they will be set to 0!
     * If no parameters are passed, the time is set to the current time.<br>
     * An invalid time causes an error.
     * @param {number | string} hours hours of the time to be set or whole time string.
     * @param {number} minutes ignored if hours is a string
     * @param {number} seconds ignored if hours is a string
     */
    setTime(hours, minutes = 0, seconds = 0) {
        if (hours == undefined) {
            const time = new Date();
            this.setTime(time.getHours(), time.getMinutes(), time.getSeconds()); // recursive call!
            return;
        }
        if (typeof hours == 'string') {
            const arrTime = this.#parseTimeString(hours);
            this.setTime(arrTime[0], arrTime[1], arrTime[2]);
            return;
        }
        if (this.validateTime(hours, minutes, seconds) == false) 
            return new Error('Could not set alert due to invalid parameter(s)');
        
        this.#start_sec = seconds;
        this.#start_min = minutes;
        this.#start_hrs = hours;
        this.reset();
    }


    /**
     * Sets an alert time.<br>
     * Params can be provided seperately or as a single valid time string such as: "17:55:30".<br>
     * If minutes or seconds are omitted they will be set to 0.<br>
     * An invalid time causes an error.
     * @param {number | string} hours Hours of the time to be set or valid time string
     * @param {number} minutes Ignored if hours is a time string
     * @param {number} seconds Ignored if hours is a time string
     */
    setAlert(hours = 0, minutes = 0, seconds = 0) {
        if (typeof hours == 'string') {
            const arrTime = this.#parseTimeString(hours);
            this.setAlert(arrTime[0], arrTime[1], arrTime[2]); // recursive call!
            return;
        }
        if (this.validateTime(hours, minutes, seconds) == false) {
            this.alertTime = undefined;
            return new Error('Could not set alert due to invalid parameter(s)');
        }
        this.alertTime = `${('0'+hours).slice(-2)}:${('0'+minutes).slice(-2)}:${('0'+seconds).slice(-2)}`;
    }


   /**
     * Clears all timer intervals and sets the time to the start settings.<br>
     * These can be either the time that has been passed when creating the class,
     * or the time set by the setTime method.
     * @see #{@link setTime }
     */ 
    clear() {
        this.#timerID = clearInterval(this.#timerID);
        this.#countDownID = clearInterval(this.#countDownID);
        this.reset();
    }


    /**
     * Resets the time to it's initial time values.
     */
    reset() {
        this.sec = this.#start_sec;
        this.min = this.#start_min;
        this.hrs = this.#start_hrs;      
    }


    /**
     * Starts or stops a countdown depending on the submitted parameter "seconds". <br>
     * If seconds are decreased to zero, a timeout-event is fired and the countdown timer stops.
     * It is possible to play a sound (i.e. a ticking clock) while the countdown runs.
     * @param {number | boolean | string} seconds 
     * If numeric and > 0, the count down starts with the submitted seconds,
     * If boolean = 'false' or string = 'stop' or number = 0, the countdown stops
     */
    countDown(seconds) {  
        if (typeof seconds == 'number' && seconds > 0) {
            if (this.#countDownID) this.#stopCountDown(); // allow only ONE countdown!
            this.#secRemaining = seconds;
            this.#countDownID = setInterval(() => {
                this.#secRemaining--;
                if (!this.timerIsRunning && this.displayElement) this.displayElement.innerText = this.countDownRemaining;
                if (this.hasSound && this.soundEnabled && this.#secRemaining > 0 && 
                    this.#secRemaining <= this.soundPlayTime && !this.sound.ended) this.sound.play();
                if (this.#secRemaining <= 0) {                     
                    this.#stopCountDown();
                    document.dispatchEvent(new Event(EVT_TIMEOUT)); // raise timeout event
                }
            }, 1000);
        } else if (seconds === false || seconds === 'stop' || seconds == 0) {
            this.#stopCountDown();
        } else {
            return new Error('Could not set count down due to invalid parameter');
        }
    }


    /**
     * PRIVATE method: stops a countdown (when expired)
     */
    #stopCountDown() {
        if (this.hasSound) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
        this.#countDownID = clearInterval(this.#countDownID);
    }


    /**
     * private method: formats and returns the timer's value in format hh:nn:ss
     * @returns time string
     */
    #formatTime(hours, minutes, seconds) {
        if (this.showMinutes == false) this.showHours = false; // ensure correct format
        let time = `${('0'+seconds).slice(-2)}`;
        if (this.showMinutes) time = `${('0'+minutes).slice(-2)}:` + time;        
        if (this.showHours) time = `${('0'+hours).slice(-2)}:` + time;
        return time;
    }


    /**
     * parses a given time string and returns it as array
     * @param {string} time a valid time string like: '17:55:30'
     * @returns array, containing [hours, minutes, seconds]
     */
    #parseTimeString(time) {        
        let arrTime = time.split(':').map(Number);
        while (arrTime.length < 3) {
            arrTime.push(0);
        }
        return arrTime;
    }


    /**
     * Checks if a given time is valid.
     * @param {number} hours Must be equal or larger than 0, but smaller than 24.
     * @param {number} minutes Must be in the range of 0-59.
     * @param {number} seconds Must be in the range of 0-59.
     * @returns {boolean} true | false
     */
    validateTime(hours, minutes, seconds) {
        return (seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 24);
    }
}

export default Timer;