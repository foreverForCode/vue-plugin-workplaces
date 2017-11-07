/**
 * @Name：Vue Ajax
 * @Author：chen guojun
 * @官网：http://www.jemui.com/jeajax/
 */
;!(function(window, undefined){
    var jsonpID = 0;
    var jeAjax = function (options) {
        var that = this;
        var url = options.url || "", //请求的链接
            type = options.type || "get", //请求的方法,默认为get
            data = options.data || null, //请求的数据
            contentType = options.contentType || "", //请求头
            dataType = options.dataType || "text", //请求的类型
            jsonp = options.jsonp || "callback",
            async = options.async === undefined ? true : options.async, //是否异步，默认为true.
            timeout = options.timeout; //超时时间。 
        var timeBool = false, //是否请求超时
            timeFlag = null, //超时标识
            xhr = null; //xhr对角
        //编码数据
        function setAjaxData() {
            //发送之前执行的函数
            that.before = function (beforeSend) {
                beforeSend && beforeSend();
                return that;
            };
            //设置对象的遍码
            function setObjData(data, parentName) {
                var encodeData = function (name, value, parentName) {
                    var items = [];
                    name = parentName === undefined ? name : parentName + "[" + name + "]";
                    if (typeof value === "object" && value !== null) {
                        items = items.concat(setObjData(value, name));
                    } else {
                        name = encodeURIComponent(name);
                        value = encodeURIComponent(value);
                        items.push(name + "=" + value);
                    }
                    return items;
                }
                var arr = [],value;
                if (Object.prototype.toString.call(data) == '[object Array]') {
                    for (var i = 0, len = data.length; i < len; i++) {
                        value = data[i];
                        arr = arr.concat(encodeData( typeof value == "object"?i:"", value, parentName));
                    }
                } else if (Object.prototype.toString.call(data) == '[object Object]') {
                    for (var key in data) {
                        value = data[key];
                        arr = arr.concat(encodeData(key, value, parentName));
                    }
                }
                return arr;
            };
            //设置字符串的遍码，字符串的格式为：a=1&b=2;
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
            if (data) {
                data = data || {};
                data["jeajaxs"] = "je"+new Date() * 1;
                if (dataType == "jsonp") data[jsonp] = '?';
                //若是使用get方法或JSONP，则手动添加到URL中
                if (type === "get" || type === "GET" || dataType === "jsonp") {
                    url += (/\?/.test(url) ? "&" :"?") + buildParams(data);
                }
                url.replace(/[&?]{1,2}/, "?").replace('%20', '+');
            }
        }
        // JSONP
        function createJsonp(fun) {
            var script = document.createElement("script"),
            callback = 'jsonp' + (++jsonpID);
            script.src = url.replace(/\?(.+)=\?/, '?$1=' + callback);  
            script.type = "text/javascript";
            document.body.appendChild(script);
            requesTimeout(callback, script);
            window[callback] = function(data) {
                clearTimeout(timeFlag);
                document.body.removeChild(script);
                fun && fun(data);
            }
        }
        //设置请求超时
        function requesTimeout(callback, script) {
            if (timeout !== undefined) {
                timeFlag = setTimeout(function() {
                    if (dataType === "jsonp") {
                        delete window[callback];
                        document.body.removeChild(script);
                    } else {
                        timeBool = true;
                        xhr && xhr.abort();
                    }
                    console.log("timeout");
                }, timeout);
            }
        }
        // XHR
        function createXHR(fun) {
            //由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
            //所以创建XHR对象，需要在这里做兼容处理。
            var getXHR = function () {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();
                } else {
                    //遍历IE中不同版本的ActiveX对象
                    var versions = ["Microsoft", "msxm3", "msxml2", "msxml1"];
                    for (var i = 0; i < versions.length; i++) {
                        try {
                            var XMLHttp = versions[i] + ".XMLHTTP";
                            return new ActiveXObject(XMLHttp);
                        } catch (e) {
                            window.alert("Your browser does not support ajax, please replace it!");
                        }
                    }
                }
            }
            //创建对象。
            xhr = getXHR();
            xhr.open(type, url, async);
            //设置请求头
            if ((type === "post" || type === "POST") && !contentType) {
                //若是post提交，则设置content-Type 为application/x-www-four-urlencoded
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            } else if (contentType) {
                xhr.setRequestHeader("Content-Type", contentType);
            }
            //添加监听
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (timeout !== undefined) {
                        //由于执行abort()方法后，有可能触发onreadystatechange事件，
                        //所以设置一个timeBool标识，来忽略中止触发的事件。
                        if (timeBool) return;
                        clearTimeout(timeFlag);
                    }
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        if (dataType == "text" || dataType == "TEXT") {
                            fun && fun(xhr.responseText,xhr);
                        } else if (dataType == "xml" || dataType == "XML") {
                            fun && fun(xhr.responseXML,xhr);
                        } else if (dataType == "json" || dataType == "JSON") {
                            fun && fun(/^\s*$/.test(xhr.responseText) ? null : JSON.parse(xhr.responseText),xhr);
                        }
                    } else {
                        fun && fun(xhr.status, xhr.statusText);
                    }
                }
            };
            //发送请求
            xhr.send((type === "get" || type === "GET") ? null : data);
            requesTimeout(); //请求超时
        }
        setAjaxData();
        //获取数据成功后的函数
        that.success = function (fun) {
            if (dataType === "jsonp") {
                createJsonp(fun);
            } else {
                createXHR(fun);
            }
            return that;
        };
        //获取数据失败后的函数
        that.error = function (fun) {
            createXHR(fun);
            return that;
        };
    }
    //将Ajax添加到Vue方法里面
    function VueAjax(Vue, options) {
        // 1. 添加全局方法或属性
        Vue.myGlobalMethod ={};
        // 2. 添加全局资源
        Vue.directive('my-directive', {});
        // 3. 添加实例方法
        var VuePro = Vue.prototype;
        VuePro.$jeAjax = function (opts) {
            return new jeAjax(opts);
        };
        VuePro.$jeAjax.get = function (url,data) {
            data = data == undefined ? {} : data;
            return new jeAjax({url:url,data: data});
        };
        VuePro.$jeAjax.post = function (url, data, dataType) {
            if (typeof (data) === 'function') dataType = dataType, data = null;
            return new jeAjax({url:url,type: 'POST',data: data,dataType: dataType});
        };
        VuePro.$jeAjax.getjson = function (url,data) {
            data = data == undefined ? {} : data;
            return new jeAjax({url:url,type: 'POST',data: data,dataType: 'json'});
        };
        VuePro.$jeAjax.jsonp = function (url,data) {
            data = data == undefined ? {} : data;
            return new jeAjax({url:url,data: data,dataType: 'jsonp'});
        };
    }
    window.jeAjax = $ajax = jeAjax;
    if (typeof exports == "object") {
        module.exports = VueAjax
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return VueAjax })
    } else if (window.Vue) {
        Vue.use(VueAjax)
    }
})(window);
