# API Functions

The JS functions to query the API are declared explicitly in [api.js &#187;](scripts/api.js) like this

```js
/** @type APIV2Call */
api.getAlbum = api.createV2API("album/{albumID}", "GET");
```

`api.createV2API` creates dynamic functions to request the corresponding API.

You can then call this to invoke the API:

```js
api.getAlbum({ albumID: albumID }, successHandler, null, errorHandler);
```

The URL parameter `albumID` will be replaced with the value given in the parameters, parameters that are not in the URL are added as query params or as JSON in the body. Route parameters given as arrays are automatically converted so the request is correct.
