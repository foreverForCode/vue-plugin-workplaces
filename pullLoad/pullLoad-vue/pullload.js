/**
 * Created by onion on 2017/11/7.
 */
;
!(function (window, undefined) {

    function extend(obj1, obj2) {
        return Object.assign(JSON.parse(JSON.stringify(obj1)), obj2)
    }

    function addEvent(obj, type, fn) {
        if (obj.attachEvent) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () {
                obj['e' + type + fn](window.event);
            }
            obj.attachEvent('on' + type, obj[type + fn]);
        } else
            obj.addEventListener(type, fn, false);
    }

    function removeEvent(obj, type, fn) {
        if (obj.detachEvent) {
            obj.detachEvent('on' + type, obj[type + fn]);
            obj[type + fn] = null;
        } else
            obj.removeEventListener(type, fn, false);
    }

    // 数组copy部分
    function asArray(quasiArray, start) {
        var result = [],
            i = (start || 0);
        for (; i < quasiArray.length; i++) {
            result.push(quasiArray[i]);
        }
        return result;
    }

    function bind(func, context) {
        if (arguments.length < 2 && typeof arguments[0] === "undefined") {
            return func;
        }

        var __method = func;
        var args = asArray(arguments, 2);

        return function () {
            var array = args.concat(asArray(arguments, 0));
            return __method.apply(context, array);
        };
    }
    /* bindAll 批量绑定
     * @param fns 待绑定的函数名称
     * @param obj 待绑定的实例对象
     * @param context 用于绑定的上下文对象
     * @describe 如果 context 为 undefined 则context = obj
     */
    function bindAll(fns, obj, context) {
        var index = 0,
            len = fns.length;
        if (context === undefined) {
            context = obj;
        }

        for (; index < len; index++) {
            var key = fns[index];
            if (typeof obj[key] === 'function') {
                obj[key] = b(obj[key], context);
            }
        }

        function b(func, context) {
            return function () {
                return func.apply(context, asArray(arguments, 0));
            }
        }
    }

    var Pullload = {};
    Pullload.install = function (Vue, options) {

        extendFns = ["onPullDownMove", "onPullDownRefresh", "clearPullDownMove", "onPullUpMove", "onPullUpLoad"];
        extendProps = ["offsetScrollTop", "offsetY", "distanceBottom"];

        // 这里是为了className拼接
        var STATS = {
            init: '',
            pulling: 'pulling',
            enough: 'pulling enough',
            refreshing: 'refreshing',
            refreshed: 'refreshed',
            reset: 'reset',
            loading: 'loading', // loading more
            nomore:'nomore'
        };
        Vue.prototype.$pullloads = function (options) {

            var pullload = function (opts) {
                // 添加全局资源
                var defaultConfig = {
                    tipText: {},
                    offsetScrollTop: 2, //与顶部的距离
                    distanceBottom: 100, // 距离底部距离触发加载更多

                    container: null, //具有scroll的容器 eg:document.body
                    wrapper: null, //结构外包围元素      eg:.test-div
                    downEnough: 100, //下拉满足刷新的距离
                    onRefresh: function () {}, // 更新触发
                    onLoadMore: function () {}, // 加载更多触发

                }
                this.opts = extend(defaultConfig, opts);
                this.container = null; //具有scroll的容器
                this.startX = 0; // touchStart  clientX
                this.startY = 0; // touchStart  clientY
                this.wrapper = null; //结构外包围元素
                this.loaderBody = null; //DOM 对象
                this.loaderSymbol = null; //DOM 对象
                this.loaderBtn = null; //DOM 对象

                this.loaderState = STATS.init;
                this.hasMore = true; //是否有加载更多
                this.init();
            }

            pullload.prototype = {
                init: function () {
                    var opts = this.opts;
                    this.container = opts.container;
                    this.wrapper = opts.wrapper;

                    this.loaderBody = opts.wrapper.querySelector(".tloader-body");
                    this.loaderSymbol = opts.wrapper.querySelector(".tloader-symbol");
                    this.loaderBtn = opts.wrapper.querySelector(".tloader-btn");

                    //将 extendFns 数组所列函数 及 'onTouchStart','onTouchMove','onTouchEnd' 进行 this 绑定。
                    bindAll(extendFns.concat(['onTouchStart', 'onTouchMove', 'onTouchEnd']), this);
                    //创建参数对象把 extendFns 设置成参数，同时把 opts 传递进来的参数整合上。

                    addEvent(opts.wrapper, "touchstart", this.onTouchStart);
                    addEvent(opts.wrapper, "touchmove", this.onTouchMove);
                    addEvent(opts.wrapper, "touchend", this.onTouchEnd);
                },
                /* onMove onEnd 触发在移动 or 停止
                 * @param x          onTouchMove  ---->clientX
                 * @param y          onTouchMove  ---->clentY
                 * @param scrollTop  document.body.scrollTop(隐藏部分的高度，下拉的时候是负值 上拉是正值但不断减少)
                 * @param scrollH    document.body.scrollHeight 整个页面的高度
                 * @param conH       document.documentElement.clientHeight : this.container.offsetHeight  可视区的高度
                 * @describe 判断移动方向 是pullup or pulldown 
                 */
                onMove: function (x, y, scrollTop, scrollH, conH) {
                    var diffX = x - this.startX,
                        diffY = y - this.startY;

                    //判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离 （绝对值小于5判断为误操作，不影响）
                    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
                        //滚动距离小于设定值 &&回调onPullDownMove 函数，并且回传位置值
                        if (diffY > 5 && scrollTop < this.opts.offsetScrollTop) { //offsetScrollTop:2 
                            // //阻止执行浏览器默认动作
                            // event.preventDefault();
                            this.onPullDownMove(this.startY, y);
                        } //滚动距离距离底部小于设定值
                        else if (diffY < 0 && (scrollH - scrollTop - conH) < this.opts.distanceBottom) {
                            //阻止执行浏览器默认动作
                            // event.preventDefault();
                            this.onPullUpMove(this.startY, y);
                        }
                    }
                },
                onEnd: function (x, y, scrollTop, scrollH, conH) {
                    var diffX = x - this.startX,
                        diffY = y - this.startY;

                    //判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
                    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
                        if (diffY > 5 && scrollTop < this.opts.offsetScrollTop) { // offsetScrollTop:2
                            //回调onPullDownRefresh 函数，即满足刷新条件
                            this.onPullDownRefresh();
                        } else if (diffY < 0 && (scrollH - scrollTop - conH) < this.opts.distanceBottom) {
                            //回调onPullUpLoad 函数，即满足刷新条件
                            this.onPullUpLoad();
                        } else {
                            //回调clearPullDownMove 函数，取消刷新动作
                            this.clearPullDownMove();
                        }
                    }
                },
                /**
                 * destory  销毁 但没有被任何调用
                 * */
                destory: function () {
                    removeEvent(this.wrapper, "touchstart", this.onTouchStart);
                    removeEvent(this.wrapper, "touchmove", this.onTouchMove);
                    removeEvent(this.wrapper, "touchend", this.onTouchEnd);
                    this.opts = {};
                    this.container = null; //具有scroll的容器
                    this.wrapper = null; //结构外包围元素
                    this.loaderBody = null; //DOM 对象
                    this.loaderSymbol = null; //DOM 对象
                    this.loaderBtn = null; //DOM 对象
                    this.loaderState = STATS.init;
                    this.hasMore = true; //是否有加载更多
                },
                /**
                 * onTouchStart 移动开始的时候
                 * @param event 绑定到对应的元素上，获取当前移动的元素的clientX clientY
                 * description 给this.startX and startY 赋值
                 * */
                onTouchStart: function (event) {
                    var targetEvent = event.changedTouches[0],
                        startX = targetEvent.clientX,
                        startY = targetEvent.clientY;
                    this.startX = startX;
                    this.startY = startY;
                },
                /**
                 * onTouchStart 移动中的时候
                 * @param event 绑定到对应的元素上，获取当前移动的元素的clientX clientY
                 * description 调用this.onMove(startX, startY, scrollTop, scrollH, conH)
                 * */
                onTouchMove: function (event) {
                    var targetEvent = event.changedTouches[0],
                        startX = targetEvent.clientX,
                        startY = targetEvent.clientY,
                        scrollTop = this.container.scrollTop,
                        scrollH = this.container.scrollHeight,
                        conH = this.container === document.body ? document.documentElement.clientHeight : this.container.offsetHeight;

                    this.onMove(startX, startY, scrollTop, scrollH, conH);
                },
                /**
                 * onTouchStart 移动结束的时候
                 * @param event 绑定到对应的元素上，获取当前移动的元素的clientX clientY
                 * description 调用this.onEnd(startX, startY, scrollTop, scrollH, conH)
                 * */
                onTouchEnd: function (event) {
                    var targetEvent = event.changedTouches[0],
                        startX = targetEvent.clientX,
                        startY = targetEvent.clientY,
                        scrollTop = this.container.scrollTop,
                        scrollH = this.container.scrollHeight,
                        conH = this.container === document.body ? document.documentElement.clientHeight : this.container.offsetHeight;

                    this.onEnd(startX, startY, scrollTop, scrollH, conH);
                },

                /* easing 拖拽的缓动公式
                 * @param distance   移动距离
                 * @description 缓动
                 */
                easing: function (distance) {
                    // t: current time, b: begInnIng value, c: change In value, d: duration
                    var t = distance;
                    var b = 0;
                    var d = screen.availHeight; // 允许拖拽的最大距离 ===  可视区的高度
                    var c = d / 2.5; // 提示标签最大有效拖拽距离

                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                /* setChange 添加动画类名
                 * @param pullHeight  移动距离
                 * @param state       当前的状态
                 * description 通过translate3d 最终回弹到50px
                 */
                setChange: function (pullHeight, state) {
                    var lbodyTop = pullHeight !== 0 ? 'translate3d(0, ' + pullHeight + 'px, 0)' : "",
                        symbolTop = pullHeight - 50 > 0 ? pullHeight - 50 : 0,
                        lSymbol = symbolTop !== 0 ? 'translate3d(0, ' + symbolTop + 'px, 0)' : "";

                    this.setClassName(state);
                    this.loaderBody.style.WebkitTransform = lbodyTop; //loaderBody ------>  .tloader-body
                    this.loaderBody.style.transform = lbodyTop;
                    this.loaderSymbol.style.WebkitTransform = lSymbol; //loaderSymbol------>  .tloader-symbol
                    this.loaderSymbol.style.transform = lSymbol;
                },
                /* setClassName 设置 wrapper DOM class 值
                 * @param  state  当前状态钩子
                 * description  给 '.test-div' 重写类名     
                 */
                setClassName: function (state) {
                    this.loaderState = state;
                    this.wrapper.className = 'tloader state-' + state;    // '.test-div'
                },
                /**
                 * setEndState  设置动作结束状态 height:0
                 * */
                setEndState: function () {
                    this.setChange(0, STATS.reset);
                },
                /**
                 * setNoMoreState 设置没有再多的状态
                 * */
                setNoMoreState: function () {
                    this.loaderBtn.style.display = "block";
                    this.hasMore = false;
                },
                /**
                 * resetLoadMore 关闭底部状态
                 * 
                 * */
                resetLoadMore: function () {
                    this.loaderBtn.style.display = "none";
                    this.hasMore = true;
                },
                /* onPullDownMove 下拉移动
                 * @param startY     onTouchStart ---->clientX
                 * @param y          onTouchMove  ---->clentY
                 * @describe 执行下拉动作 
                 */
                onPullDownMove: function (startY, y) {
                    if (this.loaderState === STATS.refreshing) {
                        return false;
                    }
                    event.preventDefault();

                    var diff = y - startY,
                        loaderState;
                    if (diff < 0) {
                        diff = 0;
                    }

                    diff = this.easing(diff);
                    if (diff > this.opts.downEnough) {
                        loaderState = STATS.enough;
                    } else {
                        loaderState = STATS.pulling;
                    }
                    this.setChange(diff, loaderState);
                },
                /**
                 * onPullDownRefresh 触发下拉刷新
                 * 
                 * */
                onPullDownRefresh: function () {
                    var that = this;
                    if (this.loaderState === STATS.refreshing) {
                        return false;
                    } else if (this.loaderState === STATS.pulling) {
                        this.setEndState();
                    } else {
                        this.setChange(0, STATS.refreshing);
                        this.resetLoadMore();
                        if (typeof this.opts.onRefresh === "function") {
                            this.opts.onRefresh(
                                bind(function (status) {                  //status------> true 刷新成功... || false -----> 没有更新数据

                                    if(status == true){
                                        this.setChange(0, STATS.refreshed);
                                        setTimeout(function () {
                                            that.setChange(0, STATS.init);
                                        }, 1000);
                                    }else{
                                        this.setChange(0, STATS.nomore);
                                        setTimeout(function () {
                                            that.setChange(0, STATS.init);
                                        }, 1000);
                                    }
                                    
                                    
                                }, this)
                            )
                        }
                    }
                },
                /**
                 * clearPullDownMove  清除下拉移动动作
                 * */ 
                clearPullDownMove: function () {},
                /**
                 * onPullUpMove   上拉移动
                 * @param startY  touchMove   ---> clientY
                 * @param y       touchStart  ---> clientY
                 * */ 
                onPullUpMove: function (startY, y) {
                    if (!this.hasMore || this.loaderState === STATS.loading) {
                        return false;
                    }
                    if (typeof this.opts.onLoadMore === "function") {
                        this.setChange(0, STATS.loading);
                        // console.info(this.state);
                        this.opts.onLoadMore(bind(function (isNoMore) {   //传一个参数
                            this.setEndState();
                            if (isNoMore) {
                                this.setNoMoreState();
                            }
                        }, this));
                    }
                },
                /**
                 * onPullUpLoad  上拉加载中
                 * */ 
                onPullUpLoad: function () {}
            }
            return new pullload(options)
        }
    }


    if (typeof exports == "object") {
        module.exports = Pullload;
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return Pullload
        });
    } else if (window.Vue) {
        Vue.use(Pullload);
    }
})(window);