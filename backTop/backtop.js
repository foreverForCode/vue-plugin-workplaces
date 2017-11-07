/**
 * Created by onion on 2017/11/6.
 */
;!(function(window, undefined) {  
    var VueBack = {};
    //将backTop添加到Vue方法里面
    VueBack.install = function (Vue, options) {
        // 添加全局资源
        Vue.prototype.$backTop = function (params) {
            var config = {
                scrollView:window,
                direction:"right",		//定位方向
                distance : 0,           //滚动到多少距离时显示
                fixed:"fixed",          //定位类型
                posLeft:"20px",
                posRight:"20px",
                posBottom:"55px",       //浮层距离底部的高度
                duration: 1000,         //过渡动画时间
                zIndex:1000             //层级高度  
            }
            var opts = Object.assign(config, params);
            var isDirec = (opts.direction=="right") ? {right:opts.posRight}:{left:opts.posLeft};
            var BackTpl = Vue.extend({
                data:function(){
                    return {
                        backConf: opts,
                        backShow: false,
                        backCss:Object.assign({zIndex:opts.zIndex,position:opts.fixed,bottom:opts.posBottom},isDirec)
                    }
                },
                template: '<div class="backtop" v-show="backShow" :style="backCss" @click.stop="backtop"></div>',
                mounted:function(){
                    this.$nextTick(function () {
                        this.backConf.scrollView.addEventListener('scroll', this.scrollHandler, false);
                    })
                },
                methods:{
                    backtop:function() {
                        var top = 0, docElem = document.documentElement && document.documentElement.scrollTop;
                        if (this.backConf.scrollView === window) {
                            top = docElem ? document.documentElement.scrollTop : document.body.scrollTop;
                        } else {
                            top = this.backConf.scrollView.scrollTop
                        }
                        this.scrollTop(this.backConf.scrollView, top, 0,this.backConf.duration);
                    },
                    scrollHandler:function() {
                        var offsetTop = window.pageYOffset;
                        var offsetHeight = window.innerHeight;
                        if (this.backConf.scrollView !== window) {
                            offsetTop = this.backConf.scrollView.scrollTop;
                            offsetHeight = this.backConf.scrollView.offsetHeight;
                        }
                        var scrollHeight = this.backConf.distance == 0 ? offsetHeight/2 : this.backConf.distance;
                        this.backShow = offsetTop >= scrollHeight;
                    },
                    scrollTop:function(el, from, to, duration){
                        if (!window.requestAnimationFrame) {
                            window.requestAnimationFrame = (
                                window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
                                function (callback) {
                                    return window.setTimeout(callback, 1000 / 60);
                                }
                            );
                        }
                        var difference = Math.abs(from - to);
                        var step = Math.ceil(difference / duration * 50);
                        function scroll(start, end, step) {
                            if (start === end) return;
                            var d = (start + step > end) ? end : start + step;
                            if (start > end) {
                                d = (start - step < end) ? end : start - step;
                            }
                            if (el === window) {
                                window.scrollTo(d, d);
                            } else {
                                el.scrollTop = d;
                            }
                            window.requestAnimationFrame(function(){scroll(d, end, step)}); 
                        }
                        scroll(from, to, step);
                    }
                }
            });
            var tpl = new BackTpl().$mount(document.createElement('div'));
            document.body.appendChild(tpl.$el);
        }
    };
    
    if (typeof exports == "object") {
        module.exports = VueBack;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return VueBack });
    } else if(window.Vue){
        Vue.use(VueBack);
    }
})(window);