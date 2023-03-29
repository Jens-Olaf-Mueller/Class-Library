const BASE_SERVER_URL = 'https://jens-olaf-mueller.developerakademie.net/smallest_backend_ever';

export default class Backend {
    jsonFromServer = {};
    #serverURL;
    get url() {return this.#serverURL;}
    set url(url) {this.#serverURL = url;}

    get now() {return new Date().getTime();}

    constructor(url = BASE_SERVER_URL) {
        this.#serverURL = url;
    }

    setItem(key, item) {
        this.jsonFromServer[key] = item;
        return this.saveJSONToServer();
    }

    async getItem(key) {
        if (this.jsonFromServer[key]) return this.jsonFromServer[key];
        // no item found... try to load!
        let response = await this.loadJSONFromServer();
        this.jsonFromServer = JSON.parse(response);
        if (this.jsonFromServer[key]) return this.jsonFromServer[key];
        return null;
    }

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

    #determineProxySettings() {
        return '';
    
        if (window.location.href.indexOf('.developerakademie.com') > -1) {
            return '';
        } else {
            return 'https://cors-anywhere.herokuapp.com/';
        }
    }
}