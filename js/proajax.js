//模拟JQ的微选择器
;!(function( window, undefined ) {
    "use strict";
    var je = function (selector, context) {
        return new je.fn.jeDOM(selector, context);
    };
    var querySel = function (element, selector){
        var found, myID = selector[0] == '#', myCls = !myID && selector[0] == '.',
            nameOnly = myID || myCls ? selector.slice(1) : selector, elnode = element.nodeType,
            isSimple = /^[\w-]*$/.test(nameOnly);
        return (element.getElementById && isSimple && myID) ?
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (elnode !== 1 && elnode !== 9 && elnode !== 11) ? [] :
                Array.prototype.slice.call(
                    isSimple && !myID && element.getElementsByClassName ?
                        myCls ? element.getElementsByClassName(nameOnly) :
                            element.getElementsByTagName(selector) : element.querySelectorAll(selector)
                )
    };
    //DOM构造器
    je.fn = je.prototype = {
        jeDOM:function (selector, context) {
            context = context || document;
            var dom = [];
            this.length = 0;
            if (!selector) {
                return this;
            } else if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (selector === "body" && !context && document.body) {
                this.context = document;
                this[0] = document.body;
                this.selector = selector;
                this.length = 1;
                return this;
            } else if (typeof selector === "string") {
                selector = je.trim(selector);
                if ( selector[0] == '<' && /^\s*<(\w+|!)[^>]*>/.test(selector)){
                    dom = je.fragment(selector, RegExp.$1, context), selector = null;
                }else {
                    dom = querySel(context, selector);
                }
                return je(this).pushStack(dom,selector);
            }
        }
    };

    je.fn.jeDOM.prototype = je.fn;
    //Object to merge
    je.extend = je.fn.extend = function () {
        var options, name, src, copy,
            target = arguments[0], i = 1,
            length = arguments.length,
            deep = false;
        //Handle deep copy
        if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2;
        //When processing, the target is a string or (a deep copy of the possible case)
        if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
        //If there is only one parameter passing
        if (length === i) target = this, --i;
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name], copy = options[name];
                    if (target === copy) continue;
                    if (copy !== undefined) target[name] = copy;
                }
            }
        }
        return target;
    };

    je.extend({
        isFunction:function(obj) {
            return typeof (obj) === "function";
        },
        trim : function (text) {
            return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
        },
        fragment : function (html, name, prop) {
            var fragmentRE = /^\s*<(\w+|!)[^>]*>/, singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
                tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
                containers = {'*': document.createElement('div')};
            var dom, container, args = [], props = prop || {},
                methodAttr = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];
            if (singleTagRE.test(html)) dom = je(document.createElement(RegExp.$1));
            if (!dom) {
                if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
                if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
                if (!(name in containers)) name = "*";
                container = containers[name];
                container.innerHTML = "" + html;
                je.each(container.childNodes, function(i,child) {
                    args[i] = child;
                });
                dom = je.each(args, function() {
                    container.removeChild(this);
                });
            }
            if (typeof (props) === "object") {
                je.each(props, function(key, value) {
                    (methodAttr.indexOf(key) > -1) ? dom[key](value) : dom.attr(key, value);
                });
            }
            return dom;
        },
        retMap: function( elems, callback, arg ) {
            var ret = [], value;
            for ( var i = 0, length = elems.length; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );
                if ( value != null ) ret[ ret.length ] = value;
            }
            return ret.concat.apply( [], ret );
        },
        unique : function (data) {
            var as = {}, datas = data || [], len = datas.length;
            for (var i = 0; i < len; i++) {
                var v = datas[i];
                if (typeof(as[v]) == 'undefined') as[v] = 1;
            };
            datas.length = 0;
            for (var i in as) {
                datas[datas.length] = i;
            }
            return datas;
        },
        //中止冒泡
        stopPropagation : function (e) {
            e = e || win.event;
            e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        },
        //对象遍历
        each : function (obj, callback, args) {
            var name, i = 0, length = obj.length, iselem = (length === undefined || obj === "function");
            if (args) {
                if (iselem) {
                    for (name in obj) { if (callback.apply(obj[name], args) === false) { break } }
                } else {
                    for (; i < length;) { if (callback.apply(obj[i++], args) === false) { break } }
                }
            } else {
                if (iselem) {
                    for (name in obj) { if (callback.call(obj[name], name, obj[name]) === false) { break } }
                } else {
                    for (; i < length;) { if (callback.call(obj[i], i, obj[i++]) === false) { break } }
                }
            };
            return obj;
        }
    });
    je.fn.extend({
        slice : function (argument) {
            return je(this).pushStack(Array.prototype.slice.apply(this, arguments));
        },
        eq : function (i) {
            i = +i;
            return  i === -1 ? this.slice(i) : this.slice(i, i + 1);
        },
        pushStack : function (elems,selector) {
            var obj = this, i = 0, len = elems.length;
            for (; i < len; i++) obj[i] = elems[i];
            obj.length = len;
            obj.selector = selector || '';
            return obj;
        },
        //查找子元素
        find : function (selector) {
            var result;
            if (!selector){
                result = je()
            } else if (this.length == 1){
                result = je(selector,this[0])
            } else{
                result = this.map(function(){ return querySel(this, selector) })
            }
            return result
        },
        //DOM遍历
        each : function (callback) {
            return je.each(this, callback);
        },
        // 获取元素父节点
        parents:function(elem) {
            var ancestors = [], nodes = elem == undefined ? this : je(elem);
            while (nodes.length > 0) {
                nodes = je.retMap(nodes, function (node) {
                    if ((node = node.parentNode) && !(node != null && node.nodeType == node.DOCUMENT_NODE) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            }
            return this.pushStack(ancestors);
        },
        parent:function (elem) {
            var nodes = elem == undefined ? this : je(elem);
            var ret = je.retMap(nodes, function(el){ return el.parentNode });
            return this.pushStack(ret);
        },
        // 获取指定子元素
        children:function(elem) {
            var getChilds=function(ele){
                var ArrTem=[];
                ele.each(function (i, el) {
                    var childArr=el.children || el.childNodes;
                    for (var i = 0, len = childArr.length; i < len; i++) {
                        if (childArr[i].nodeType == 1) ArrTem.push(childArr[i]);
                    }
                });
                return ArrTem;
            };
            var ret = getChilds(elem == undefined ? this : je(elem));
            return this.pushStack(ret);
        },
        map: function( callback ) {
            return this.pushStack( je.retMap(this, function( elem, i ) {
                return callback.call( elem, i, elem );
            }));
        },
        //是否包含css类
        hasClass : function (cls) {
            var i = 0, len = this.length;
            for (; i < len; i++) {
                var elemnode = this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(" " + cls + " ") >= 0;
                if (elemnode) return true;
            }
            return false;
        },
        //添加css类
        addClass : function (cls) {
            return je.each(this, function () {
                if (this.nodeType === 1 && !je(this).hasClass(cls)) this.className = je.trim(this.className + " " + cls + " ");
            });
        },
        //移除css类
        removeClass : function (cls) {
            return je.each(this, function () {
                if (this.nodeType === 1) this.className = je.trim((" " + this.className + " ").replace(" " + cls + " ", " "));
            });
        },
        //添加或获取属性
        attr : function (key, value) {
            var that = this;
            return value === undefined ? function () {
                if (that.length > 0) return that[0].getAttribute(key);
            }() : that.each(function (index, item) {
                item.setAttribute(key, value);
            });
        },
        css : function (name, value) {
            var cssNumber = {'column-count': 1, 'columns': 1, 'box-flex': 1, 'line-clamp': 1, 'font-weight': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1},
                toLower = function (str) {
                    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase()
                },
                addPx = function (name, value) {
                    return (typeof value == "number" && !cssNumber[toLower(name)]) ? value + "px" : value
                };
            if (typeof name == "string" && typeof value == "string") {
                return je.each(this, function () {
                    this.style[toLower(name)] = addPx(name, value);
                });
            } else if (typeof (name) === "string" && typeof (value) === "undefined") {
                if (this.length == 0) return null;
                var ele = this[0], computedStyle = function () {
                    var def = document.defaultView;
                    return new Function("el", "style", ["style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));", "style=='float' && (style='", def ? "cssFloat" : "styleFloat", "');return el.style[style] || ", def ? "window.getComputedStyle(el, null)[style]" : "el.currentStyle[style]", " || null;"].join(""));
                }();
                return computedStyle(ele, toLower(name));
            } else {
                return je.each(this, function () {
                    for (var x in name) this.style[toLower(x)] = addPx(x, name[x]);
                });
            }
        },
        // 显示元素
        show : function (value) {
            return je.each(this, function () {
                var val = value == undefined ? "block" : value;
                je(this).css("display", val);
            });
        },
        // 隐藏元素
        hide : function () {
            return je.each(this, function () {
                je(this).css("display", "none");
            });
        },
        //设置HTML内容
        html : function (html) {
            return typeof html === "undefined" ? this[0] && this[0].nodeType === 1 ? this[0].innerHTML :undefined :typeof html !== "undefined" && html == true ? this[0] && this[0].nodeType === 1 ? this[0].outerHTML :undefined :
                this.each(function (index, item) {
                    item.innerHTML = html;
                });
        },
        // 读取设置节点文本内容
        text : function(value) {
            var innText = document.all ? "innerText" :"textContent";
            return typeof value === "undefined" ? this[0] && this[0].nodeType === 1 ? this[0][innText] :undefined :
                this.each(function(index, item) {
                    item[innText] = value;
                });
        },
        //设置值
        val : function (value) {
            if (typeof value === "undefined") {
                return this[0] && this[0].nodeType === 1 && typeof this[0].value !== "undefined" ? this[0].value :undefined;
            }
            // 将value转化为string
            value = value == null ? "" :value + "";
            return this.each(function (index, item) {
                item.value = value;
            });
        },
        //追加内容
        append : function (elem) {
            var appendDiv = function (sele, frag) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = frag;
                var childs = tempDiv.childNodes, temparr = [];
                for (var i = 0; i < childs.length; i++) temparr.push(childs[i]);
                for (var a = 0; a < temparr.length; a++) sele.appendChild(temparr[a]);
            };
            return this.each(function (i, item) {
                typeof elem === 'string' ? appendDiv(item,elem) : item.appendChild(elem[0]);
            });
        },
        // 在元素之后插入内容
        after:function(elem) {
            var appendDiv = function (sele, frag) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = frag;
                var childs = tempDiv.childNodes, temparr = [];
                for (var i = 0; i < childs.length; i++) temparr.push(childs[i]);
                for (var a = 0; a < temparr.length; a++) sele.parentNode.insertBefore(temparr[a], sele.nextSibling);
            };
            return this.each(function (i, item) {
                typeof elem === 'string' ? appendDiv(item,elem) : item.parentNode.insertBefore(elem[0], item.nextSibling);

            });
        },
        //移除内容
        remove : function (elem) {
            return this.each(function (index, item) {
                elem ? item.removeChild(elem) : item.parentNode.removeChild(item);
            });
        },
        //事件绑定
        on : function (event, selector, callback) {
            var selcall = typeof (selector) !== "function" ? true : false;
            var fun = selcall ? callback : selector;
            return this.each(function (i, item) {
                var elem = selcall ? je(selector,item)[i] : item;
                elem.attachEvent ? elem.attachEvent('on' + event, function (e) {
                    e.target = e.srcElement;
                    fun.call(elem, e);
                }) : elem.addEventListener(event, fun, false);
            });
        },
        //解除事件
        off : function (event, callback) {
            return this.each(function (index, item) {
                item.detachEvent
                    ? item.detachEvent('on' + event, callback)
                    : item.removeEventListener(event, callback, false);
            });
        }
    });
    // 支持amd和cmd
    if (typeof exports == "object") {
        module.exports = je;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return je });
    } else{
        window.je = je;
    }
})( window );
/**
 * Created Promise.
 */
;!(function(window, undefined) {
    function Promise(fn) {
        var self=this;
        this.status = 'pending';
        this.thenCache = [];
        if(!(this instanceof Promise)) {
            throw 'Defer is a constructor and should be called width "new" keyword';
        }
        if(typeof fn !== 'function') {
            throw 'Defer params must be a function';
        }
        //为了让传进来的函数在then后执行
        setTimeout(function() {
            try {
                fn.call(this, self.resolve.bind(self), self.reject.bind(self))
            } catch(e) {
                self.reject(e);
            }
        }, 10);
    }
    Promise.prototype.resolve = function(value) {
        this.value = value;
        this.status = 'resolved';
        this.triggerThen();
    };
    Promise.prototype.reject = function(reason) {
        this.value = reason;
        this.status = 'rejected';
        this.triggerThen();
    };
    Promise.prototype.then = function(onResolve, onReject) {
        this.thenCache.push({ onResolve: onResolve, onReject: onReject });
        return this;
    };
    Promise.prototype.catch = function(fn) {
        if(typeof fn === 'function') {
            this.errorHandle = fn;
        }
    };
    Promise.prototype.triggerThen = function() {
        var current = this.thenCache.shift(),
            res;
        if(!current && this.status === 'resolved') {
            return this;
        } else if(!current && this.status === 'rejected') {
            if(this.errorHandle) {
                this.value = this.errorHandle.call(undefined, this.value);
                this.status = 'resolved';
            }
            return this;
        };
        if(this.status === 'resolved') {
            res = current.onResolve;
        } else if(this.status === 'rejected') {
            res = current.onReject;
        }
        if(typeof res === "function") {
            try {
                this.value = res.call(undefined, this.value);
                this.status = 'resolved';
                this.triggerThen();
            } catch(e) {
                this.status = 'rejected';
                this.value = e;
                return this.triggerThen();
            }
        } else {
            this.triggerThen();
        }
    };

    var type = function(obj) {
        return {}.toString.call(obj);
    };

    var jsonpID = 0,
        document = window.document,
        key,
        name,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        return true;//!event.defaultPrevented
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    function ajaxStart(settings) {
        if (settings.global && jeAjax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }
    function ajaxStop(settings) {
        if (settings.global && !(--jeAjax.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context;
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false;

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }
    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context, status = 'success';
        settings.success.call(context, data, status, xhr);
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
        ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
        var context = settings.context;
        settings.error.call(context, xhr, type, error);
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
        ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context;
        settings.complete.call(context, xhr, status);
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {}
    function createJsonp(options){
        if (!('type' in options)) return jeAjax(options);

        var callbackName = 'jsonp' + (++jsonpID),
            script = document.createElement('script'),
            abort = function(){
                if (callbackName in window) window[callbackName] = empty;
                ajaxComplete('abort', xhr, options)
            },
            xhr = { abort: abort }, abortTimeout,
            head = document.getElementsByTagName("head")[0] || document.documentElement;

        if (options.error) script.onerror = function() {
            xhr.abort();
            options.error()
        };

        window[callbackName] = function(data){
            clearTimeout(abortTimeout);
            delete window[callbackName];
            ajaxSuccess(data, xhr, options)
        };

        serializeData(options);
        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName);

        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (see jQuery bugs #2709 and #4378).
        head.insertBefore(script, head.firstChild);

        if (options.timeout > 0) abortTimeout = setTimeout(function(){
            xhr.abort();
            ajaxComplete('timeout', xhr, options)
        }, options.timeout);

        return xhr
    }

    function mimeToDataType(mime) {
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }
    function buildParams(obj) {
        var i, j, k, len, arr = [];
        if (typeof obj === "string") {
            return obj;
        } else if (typeof obj === "object") {
            for (i in obj) {
                // 处理数组 {arr:[1, 2, 3]} => arr[]=1&arr[]=2&arr[]=3
                if (typeof (obj[i]) === "array") {
                    k = i + i.substr(-2, 2) === "[]" ? "" :"[]";
                    for (j = 0, len = obj[i].length; j < len; j++) {
                        arr.push(k + "=" + obj[i][j]);
                    }
                } else {
                    arr.push(i + "=" + obj[i]);
                }
            }
        }
        return arr.join("&");
    }
    function appendQuery(opts,url, query) {
        query = query||{};
        query["jerandom"] = new Date() * 1;
        if (opts.dataType == "jsonp") query[opts.jsonp] = '?';
        url += (/\?/.test(url) ? "&" :"?") + buildParams(extend(query));
        return url.replace(/[&?]{1,2}/, "?");
    };
    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (type(options.data) === 'object') options.data = param(options.data);
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET')){
            options.url = appendQuery(options, options.url, options.data)
        }
    }

    function serialize(params, obj, traditional, scope){
        var array = type(obj) === 'array';
        for (var key in obj) {
            var value = obj[key];
            if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']';
            // handle data in serializeArray() format
            if (!scope && array){
                params.add(value.name, value.value);
            } else if (traditional ? (type(value) === 'array') : (type(value) === 'object')){
                serialize(params, value, traditional, key);
            } else{
                params.add(key, value);
            } 
        }
    }

    function param(obj, traditional){
        var params = [];
        params.add = function(k, v){ 
            this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)) 
        };
        serialize(params, obj, traditional)
        return params.join('&').replace('%20', '+')
    }

    function extend(target) {
        var slice = Array.prototype.slice;
        slice.call(arguments, 1).forEach(function(source) {
            for (key in source){
                if (source[key] !== undefined) target[key] = source[key]
            }
        });
        return target
    }
    var jeAjax = function(options){
        var settings = extend({}, options || {});
        for (key in jeAjax.settings) if (settings[key] === undefined) settings[key] = jeAjax.settings[key];
        var mime = settings.accepts[dataType],
            baseHeaders = { },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = jeAjax.settings.xhr(), abortTimeout;
        ajaxBeforeSend(xhr, settings);
        ajaxStart(settings);

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
            RegExp.$2 != window.location.host

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = appendQuery(settings, settings.url,{});
            return createJsonp(settings)
        }

        if (!settings.url) settings.url = window.location.toString();
        serializeData(settings);

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
        if (mime) {
            baseHeaders['Accept'] = mime;
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded');
        settings.headers = extend(baseHeaders, settings.headers || {});

        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;

                    try {
                        if (dataType == 'script')    (1,eval)(result);
                        else if (dataType == 'xml')  result = xhr.responseXML;
                        else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                    } catch (e) { error = e }

                    if (error) ajaxError(error, 'parsererror', xhr, settings)
                    else ajaxSuccess(result, xhr, settings)
                } else {
                    ajaxError(null, 'error', xhr, settings)
                }
            }
        };

        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort();
            return false;
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function(){
            xhr.onreadystatechange = empty;
            xhr.abort();
            ajaxError(null, 'timeout', xhr, settings)
        }, settings.timeout);

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null);
        return xhr
    };
    // Number of active Ajax requests
    jeAjax.active = 0;
    jeAjax.settings = {
        // Default type of request
        type: 'GET',
        jsonp:"callback",
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json:   jsonType,
            xml:    'application/xml, text/xml',
            html:   htmlType,
            text:   'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0
    };

    jeAjax.get = function(url, success){
        return jeAjax({ url: url, success: success });
    };

    jeAjax.post = function(url, data, success, dataType){
        if (type(data) === 'function') dataType = dataType || success, success = data, data = null;
        return jeAjax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
    };

    jeAjax.getJSON = function(url, success){
        return jeAjax({ url: url, success: success, dataType: 'json' });
    };

    jeAjax.JSONP = function(url, success){
        return jeAjax({ url: url,type:"GET", success: success, dataType: 'jsonp' });
    };

    //Install Vue Ajax
    function installAjax(Vue, options) {
        // 添加全局方法或属性
        Vue.myGlobalMethod ={};

        // 添加全局资源
        Vue.directive('my-directive', {});
        
        var resProAjax = function (urls,options) {
            return new Promise(function (resolve,reject) {
                jeAjax(extend({ 
                    url: urls, 
                    success: function (res) {resolve(res);},
                    error: function(err){reject(err)}
                    }, options || {})
                );
            });
        };
        Vue.prototype.get = function(url){
            return resProAjax(url, {});
        };

        Vue.prototype.post = function(url, data, dataType){
            if (typeof (data) === 'function') dataType = dataType, data = null;
            return resProAjax(url, {type: 'POST',data: data,dataType: dataType});
        };

        Vue.prototype.getJSON = function(url, data){
            data = data == undefined ? {} : data;
            return resProAjax(url, {data: data,dataType: 'json'});
        };

        Vue.prototype.JSONP = function(url, data){
            data = data == undefined ? {} : data;
            return resProAjax(url, {data: data,dataType: 'jsonp'});
        };
    }
    window.Promise = Promise;
    window.jeAjax = jeAjax;
    if (typeof exports == "object") {
        module.exports = installAjax;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return installAjax });
    } else if(window.Vue){
        Vue.use(installAjax);
    }
})(window);
