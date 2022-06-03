# API Functions

The current API is described in details [here](https://lycheeorg.github.io/docs/api.html)

## v3

The JS functions to query the v2 API are declared explicitly in [api.js &#187;](scripts/api.js) like this

```js
api.v2 = {
	/** @type APIV2Call */
	getAlbum: api.createV2API("album/{albumID}", "GET"),
};
```

`api.createV2API` creates dynamic functions to request the corresponding API.

You can then call this to invoke the API:

```js
api.v2.getAlbum({ albumID: albumID }, successHandler, null, errorHandler);
```
