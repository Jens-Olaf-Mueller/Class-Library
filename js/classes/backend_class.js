const BASE_SERVER_URL = 'https://jens-olaf-mueller.developerakademie.net/smallest_backend_ever';

class Backend {
    jsonFromServer = {};

    #serverURL = BASE_SERVER_URL;
    get url() {return this.#serverURL;}
    set url(newURL) {
        if (typeof newURL == 'string') this.#serverURL = newURL;
    }

    get now() { return new Date().getTime(); }


    /**
     * Creates a new Backend class in order to store, fetch or to delete any datas 
     * (JSON objects!)
     * @param {string} url [Optional] The URL to the server we want to talk to.
     * If omitted we use the default URL stored as constant in the class header.
     */
    constructor(url) {
        this.url = url;
    }

    setItem(key, item) {
        this.jsonFromServer[key] = item;
        return this.saveJSONToServer();
    }


    /**
     * Fetches an item with the given key from server.
     * @param {string} key A unique key to identify the item we're looking for. 
     * @returns {object | null} A JSON-object, coming from server if succeeded, otherwise null.
     */
    async getItem(key) {
        if (this.jsonFromServer[key]) return this.jsonFromServer[key];
        // no item found... try to load!
        let response = await this.loadJSONFromServer();
        this.jsonFromServer = JSON.parse(response);
        if (this.jsonFromServer[key]) return this.jsonFromServer[key];
        return null;
    }


    /**
     * Deletes the item with the passed key from server.
     * @param {string} key A valid key to specify the item to be deleted.
     * @returns {any} The status from the server operation.
     */
    deleteItem(key) {
        delete this.jsonFromServer[key];
        return this.saveJSONToServer();
    }

    /**
     * Loads a JSON or JSON array from server
     * payload {JSON | Array} - The payload you want to store
     */
    async loadJSONFromServer() {
        let response = await fetch(this.#serverURL + '/nocors.php?json=database&nocache=' + (this.now));
        return await response.text();
    }


    /**
     * Stores a JSON object to the server.
     * @returns {promise} Status from server.
     */
    saveJSONToServer() {
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest(),
                proxy = this.#determineProxySettings(),
                serverURL = proxy + this.#serverURL + '/save_json.php';
            xhttp.open('POST', serverURL);
            xhttp.onreadystatechange = function(oEvent) {
                if (xhttp.readyState === 4) {
                    if (xhttp.status >= 200 && xhttp.status <= 399) {
                        resolve(xhttp.responseText);
                    } else {
                        reject(xhttp.statusText);
                    }
                }
            };    
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify(this.jsonFromServer));    
        });
    }


    /**
     * PRIVATE helper function that determines the Proxy-settings.
     * @returns {string} CORS-string or empty string
     */
    #determineProxySettings() {
        // return '';    
        if (window.location.href.indexOf('.developerakademie.com') > -1) {
            return '';
        } else {
            return 'https://cors-anywhere.herokuapp.com/';
        }
    }
}

export default Backend;