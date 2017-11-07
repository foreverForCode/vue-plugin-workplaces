/**
 * Created by onion on 2017/11/6.
 */
;!(function(window, undefined) {  
    var VueLazy = {};
    //将Ajax添加到Vue方法里面
    VueLazy.install = function (Vue, options) {
        // 2. 添加全局资源
        Vue.prototype.$lazyload = function (params) {
            var events = ['resize', 'scroll'];
            var config = {
                attr:"lazysrc",  //给img标签加的属性为图片的地址
                threshold:0,	//提前加载距离
                offset:0
            }
            var opts = Object.assign(config, params);
            var direc = document.querySelectorAll("["+opts.attr+"]");
            Vue.nextTick(function () {
                direc.forEach(function(el){
                    lazyExec(el, opts);
                })
            })
            events.forEach(function (event) {
                window.addEventListener(event, function () {
                    direc.forEach(function (node) { 
                        lazyExec(node, opts); 
                    })
                });
            })
        }
    };
    function scrollPositon(node,opts) { 
        var offsetTop = node.getBoundingClientRect().top;
        var clientHeight = window.clientHeight || document.documentElement.clientHeight || document.body.clientHeight; //可视区域
        var scrollTop = opts.threshold > 0 ? opts.threshold : (document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop)
        if (offsetTop + opts.offset <= clientHeight + opts.threshold) {
            return true;
        }
        return false;
    }
    function lazyExec (node, opts) {
        var unavailableSrc = ['false', 'undefined', 'null', ''];
        // node: HTML Element Object.
        if (!node.hasAttribute(opts.attr)) return;
        // Attach image link or not.
        if (scrollPositon(node, opts)) {
            var imgLink = node.attributes[opts.attr].value, isImg = node.tagName;
            // If unavailable src was given, just go return.
            if (unavailableSrc.filter(function (value) { return imgLink === value }).length) { return }
            if (isImg == "IMG"){
                node.src = imgLink;
            }else {
                setTimeout(function() {
                    node.style.backgroundImage = 'url(' + imgLink + ')';
                }, Math.floor(Math.random() * 100));
            }
            node.removeAttribute(opts.attr)
        }
    }
    
    if (typeof exports == "object") {
        module.exports = VueLazy;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return VueLazy });
    } else if(window.Vue){
        Vue.use(VueLazy);
    }
})(window);