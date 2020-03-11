# RVT2 Analyzer

Welcome to RVT2 analyzer, an interface for a DFIR analysis of documents indexed in ElasticSearch.

This code is under the GPL3 license. Check LICENSE.txt for details.

## Development environment

``` bash
# install yarn and node >6 (if not already in your distribution)
# Check: https://github.com/nodesource/distributions/blob/master/README.md
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
# Check: https://yarnpkg.com/lang/en/docs/install/#debian-stable
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# If you get a conflict problem: sudo apt-get purge cmdtest
sudo apt-get install nodejs yarn

# install dependencies
yarn install

# serve with hot reload from localhost:8080
yarn run serve
```

Please, do not commit your code if it does not pass all eslint checks!

## Production

### Your own server

Change the name of the root in the http server in `vue.config.js`, if needed. Then:

```
yarn run build
```

Then, copy `index.html`, `favicon.png` and directory `dist` to your web server.

### Docker

```
docker build -t incide/rvt2-analyzer .
docker run -it -p 8080:80 --rm --name rvt2-analyzer incide/rvt2-analyzer
```

The webpage will be available at <http://localhost:8080>

## Configuration

You can provide some configuration for a specific, to configure styles or the default ElasticSearch server without rebuilding the application.

- `dist/local/local.css`: use this file to configure the local style.
- `dist/local/local.js`: use this file to configure some local variables, such as:
  - `window.ESSERVER`: the URL to the default ElasticSearch server.
  - `window.RVT2SERVER`: the URL to the RVT2 server, if any.
  - `window.RVT2FILES`: the URL to the server of files produced by the RVT2, if any.

In addition, you can configure many parameters in `src/config.js`. You must rebuild the application if you change this file.

Some indices must exist before running the interface. These are the default names, but you can change them in the configuration file:

- `rvtindexer` is used to identify sources. The analyzer only shows sources listed in this index.
- `rvtindexer-queries` is used to log queries.

### Index **rvtindexer**

It is used to identify evidences. The fields are:

- `_id`: the name of the index that holds the documents in the source. It is usually the same than the `name` parameter.
- `name`: the name of the source.
- `casename`: the name of the case.
- `source`: the name of the source.
- `path`: the list of paths the parser indexed.
- `description`: a description of the evidence.
- `server`: the server to download files. Files will be downloaded `server + file.path`
- `status`: the status of the parsing: started, ended, error.
- `started`: the date when the indexing started.
- `ended`: the date when the indexing ended. Check status to know if the indexing ended successfully or after an error.

Keep in mind subsequent runnings of the parser will have update an entries in **rvtindexer**.

The index must exist before running the interface for the first time. It can be
automatically created by the RVT2 **ElasticSearchHelper** module.
In case you want to create manually this index, run:

```
curl -XPUT ESSERVER/rvtindexer
```

### Index **rvtindexer-queries**

Indexes the the queries run with this interface. It is managed entirely by the interface.

Each document in this index has the next fields:

- `query`: the query, as entered in the input box.
- `query_type`: the query type.
- `offset`: the offset of the query.
- `results`: the number of results.
- `timestamp`: when the query finished.
- `analyst`: the name of the user that run the query.

This index must exist before running the interface for the first time.

```
curl -XPUT ESSERVER/rvtindexer-queries
```

## Technologies

The analyzer uses these technologies:

- **vuejs** is the JavaScript framework.
- **vuetify** is the UI components framework, based on Google’s material design.
- **vue-router** to work as a single page.
- **vuex** is the state manager (i.e.: a centralized model in the traditional MVC paradigm)

## Folders

- `App.vue`: the skeleton of the page. It has the Jumbotron, footer, alert messages and debug messages.
- `main.js`: the main JavaScript, holding the Vue object.

Inside the `src` folder, these are the main files and directories:

- `lib`: utility files without an interface.
- `plugins`: configuration of the VueJS plugins, such as vuetify.
- `store`: the store of the application.
    - `index.js`: the main store. It holds the modules `searches`, `sources` and `messages`.
    - `modules/sources`: manages information about the sources and cases that are available in ElasticSearch.
    - `modules/searches`: runs queries on a source and manages its results.
    - `modules/messages`: manages application messages: info, log, warning and error messages.
- `analyst`: The "home page". It shows a login screen.
	- `TheAnalyst`: the container of the home section.
- `sources`: shows a table with the available souces in the database.
  - `TheSources`: the main container of the sources section.
  - `TheSourcesAdmin`: allows removing source metadata from ElasticSearch. Data is not removed, only the medata data in the `rvtindexer` indice.
- `search`: the search page.
	- `TheSearch`: the main container of the search section.
- `management`: pages to manage the RVT2.
  - `TheJob`: lists and created jobs on the RVT2. It needs a running RVT2 server.
- `components`: common VueJS components for all pages.

# Background

Background in the top bar is Tarragona from "El Llorito". (c) 2010-2019 Juan Vera del Campo, CC0.

You can set your own styles in _local/local.css_ without rebuilding the application.

(C) 2018-2019, Incide Digital Data S.L.
