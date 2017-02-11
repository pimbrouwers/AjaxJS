/*
	Ajax JS 0.0.1
    Author: Pim Brouwers
	License: MIT	
*/
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = (root.AjaxJS = factory());
    } else {
        root.AjaxJS = factory();
    }
}(this, function () {
    function Ajax() {
        var self = this;

        self._deferredCache = {};

        self.Post = self.post;
        self.PostMultiple = self.postMultiple;
    };

    ///
    //Object to String (for Post cacheKey generation)
    ///
    Ajax.prototype.ObjToString = function (obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + '::' + obj[p] + '\n';
            }
        }
        return str;
    };

    ///
    //Build Promise w/ CORS
    ///
    Ajax.prototype.BuildPromise = function (cacheKey, url, headers, data, callback, errorCallback, alwaysCallback) {
        var self = this,
            cache = self._deferredCache,
            promise = null;

        // Return a promise from the cache (if available)
        // or create a new one (a jqXHR object) and store it in the cache.
        if (cacheKey) promise = cache[cacheKey];
        if (!promise) {

            var headers = headers || {};

            promise = $.ajax(url, {
                data: data,
                dataType: 'json',
                method: 'POST',
                headers: headers,
                crossDomain: true,
                timeout: 30000
            })

            if(callback || errorCallback || alwaysCallback) {
                promise.done(function (result, textStatus, jqXHR) {
                    if (callback != undefined && $.isFunction(callback)) {
                        callback(result, textStatus, jqXHR);
                    }

                })
                .fail(function (err, status, errorMessage) {
                    console.warn(err, errorMessage);

                    if (errorCallback != undefined && $.isFunction(errorCallback)) {
                        errorCallback(err, status, errorMessage);
                    }
                })
                .always(function () {
                    if (alwaysCallback != undefined && $.isFunction(alwaysCallback)) {
                        alwaysCallback();
                    }
                });
            }
            

            if (cacheKey) cache[cacheKey] = promise;
        }

        return promise;
    };

    ///
    //XHR Post Wrapper
    ///
    Ajax.prototype.post = function (cacheKey, url, data, callback, errorCallback, alwaysCallback) {
        var self = this,
            promise = self.BuildPromise(cacheKey, url, data);

        $.when(promise)
            .then(function (result, textStatus, jqXHR) {
                if (callback != undefined && $.isFunction(callback)) {
                    callback();
                }
            })
            .fail(function (err, status, errorMessage) {
                console.warn(err, errorMessage);

                if (errorCallback != undefined && $.isFunction(errorCallback)) {
                    errorCallback(err, status, errorMessage);
                }
            })
            .always(function () {
                if (alwaysCallback != undefined && $.isFunction(alwaysCallback)) {
                    alwaysCallback();
                }
            });
    };

    ///
    //XHR Post Multiple Wrapper
    ///
    Ajax.prototype.postMultiple = function (requestArray, callback, errorCallback, alwaysCallback) {
        var self = this,
            cache = self._deferredCache,
            promises = [];

        for (var i = 0; i < requestArray.length; i++) {
            var req = requestArray[i];

            promises.push(self.BuildPromise(req.cacheKey, req.url, req.data, req.callback, req.errorCallback, req.alwaysCallback));
        }
        
        $.when.apply($, promises)
            .then(function (result, textStatus, jqXHR) {
                if (callback != undefined && $.isFunction(callback)) {
                    callback();
                }
            })
            .fail(function (err, status, errorMessage) {
                console.warn(err, errorMessage);

                if (errorCallback != undefined && $.isFunction(errorCallback)) {
                    errorCallback(err, status, errorMessage);
                }
            })
            .always(function () {
                if (alwaysCallback != undefined && $.isFunction(alwaysCallback)) {
                    alwaysCallback();
                }
            });
    };

    return new Ajax()
}));

