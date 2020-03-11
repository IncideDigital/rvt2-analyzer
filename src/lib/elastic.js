import Console from "@/lib/Console.js";

/** @todo This module uses old JavaScript and must be refactored */
export class ESClient {
  /** Constructor of an elasticsearch server.

    @param url: the URL to the ES server.
    @param indice: the name of the indice to query.
    */
  constructor(url, indice) {
    this._url = url;
    this._listeners = {};
    this._indice = indice;
  }

  /** Makes a request to an ELK server.

    If an error occurs, an 'error' event is fired.

    @param path: the path for the request.
    @param type: the type of request, such as GET, POST... Default: GET.
    @param data: a dictionary of data to pass to the server. It will be stringified. Set to undefined for an empty body.
    @param  nolog: if present, do not log the request
    @return A dictionary with the response. If the request produced an error, it will be emited.
    @todo Add authentication
    */
  lowlevel_request(path, type = "GET", data = undefined, nolog = false) {
    let url = this._url + "/" + path;
    let params = {
      method: type,
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      headers: { "Content-Type": "application/json" }
    };
    if (data) {
      params.body = JSON.stringify(data);
    }

    if (!nolog) {
      this.emit("debug", {
        path: path,
        type: type,
        data: data,
        esserver: this._url
      });
    }

    // Manage the request using the fetch() API
    return fetch(url, params)
      .catch(error => {
        // fetch only fails after a network error
        this.emit("error", "Rejected. Wrong server?: " + error);
      })
      .then(response => {
        // Manage HTTP errora
        if (!response.ok) {
          response.json().then(data => {
            try {
              // Elastic erros are formated like this
              this.emit("error", data.error.root_cause[0].reason);
            } catch {
              // It is not an Elastic error
              this.emit("error", data);
            }
          });
        } else {
          // everything went ok: return the data
          return response.json();
        }
      });
  }

  /*
    - document_id: the id of the document
    - type: search, update
    - data: the data to sent
    */
  request(document_id, type, data, doc_type = "_doc") {
    if (this._indice === undefined) {
      this.emit("error", "The indice's name is null.");
      return;
    }
    // let esurl = '';
    let verb = "";
    let esurl = "";
    if (type === "search") {
      esurl = this._indice + "/_search";
      verb = "POST";
    } else if (type === "update") {
      esurl = `${this._indice}/${doc_type}/${document_id}/_update`;
      verb = "POST";
    } else if (type === "index") {
      esurl = `${this._indice}/${doc_type}/${document_id}`;
      verb = "PUT";
    } else {
      this.emit("error", "Type of request not registered: " + type);
      return;
    }
    return this.lowlevel_request(esurl, verb, data);
  }

  /** Emits an event, if there is a registered listener */
  emit(eventName, data) {
    "use strict";

    if (eventName in this._listeners) {
      this._listeners[eventName](data);
    }
  }

  /** Registers a listener for an event.

    @param eventName: the name of the event.
    @param listener: the listener function.
    */
  on(eventName, listener) {
    "use strict";
    this._listeners[eventName] = listener;
  }

  /** Removes a listener for an event.

    @param eventName: removes the listener for this event. If undefined, removes all listeners
    */
  off(eventName) {
    "use strict";

    if (eventName === undefined) {
      this._listeners = {};
    } else {
      if (eventName in this._listeners) {
        delete this._listeners[eventName];
      }
    }
  }
}
