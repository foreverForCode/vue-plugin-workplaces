// 常用公共方法
function extend(obj1, obj2) {
    return Object.assign(JSON.parse(JSON.stringify(obj1)), obj2)
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
/* easing 拖拽的缓动公式
 * @param distance   移动距离
 * @description 缓动
 */
function easing(distance) {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    var t = distance;
    var b = 0;
    var d = screen.availHeight; // 允许拖拽的最大距离 ===  可视区的高度
    var c = d / 2.5; // 提示标签最大有效拖拽距离

    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}
// 这里是为了className拼接
var STATS = {
        init: '',
        pulling: 'pulling',
        enough: 'pulling enough',
        refreshing: 'refreshing',
        refreshed: 'refreshed',
        reset: 'reset',
        loading: 'loading', // loading more
        nomore: 'nomore'
    },
    extendFns = ["onPullDownMove", "onPullDownRefresh", "clearPullDownMove", "onPullUpMove", "onPullUpLoad"],
    extendProps = ["offsetScrollTop", "offsetY", "distanceBottom"],
    defaultConfig = {
        tipText: {},
        offsetScrollTop: 2, //与顶部的距离
        distanceBottom: 100, // 距离底部距离触发加载更多
        container: null, //具有scroll的容器 eg:document.body
        wrapper: null, //结构外包围元素      eg:.test-div
        loaderBody: null,
        loaderSymbol: null,
        loaderBtn: null,
        downEnough: 100, // 下拉满足刷新的距离
        startX: 0, // touchStart  clientX
        startY: 0, // touchStart  clientY
        loaderState: STATS.init, // 加载状态
        hasMore: true, // 是否有加载更多
        dataList: null // 父组件传递的数据
    }
var pullLoad = Vue.extend({
    props: ["options"],
    data: function () {
        return {
            pullupstyle: null,

        }
    },
    computed: {
        opts: function () {
            return extend(defaultConfig, this.options)
        },

    },
    template: `
    <div>
        <div class="tloader-symbol">
            <p class="tloader-msg"><i></i></p>
            <p class="tloader-loading">
            <i class="ui-loading"></i>
            </p>
        </div>
        <div class="tloader-body" @touchstart="touchstartEvent" @touchmove="touchmoveEvent" @touchend="touchendEvent">
            <ul class="test-ul">
                <slot name="item" v-for="item in opts.dataList" :text="item">               
                </slot>                       
            </ul>
        </div>
        <div class="tloader-footer">
            <p class="tloader-btn" :style="pullupstyle"></p>
            <p class="tloader-loading">
            <i class="ui-loading"></i>
            </p>
        </div>
    </div>
            `,
    methods: {
        touchstartEvent: function (event) {
            this.onTouchStart(event);
        },
        touchmoveEvent: function () {

            this.onTouchMove(event)
        },
        touchendEvent: function () {

            this.onTouchEnd(event);
        },

        init: function () {
            var opts = this.opts;
            this.container = opts.container;
            this.wrapper = opts.wrapper;
            //将 extendFns 数组所列函数 及 'onTouchStart','onTouchMove','onTouchEnd' 进行 this 绑定。
            bindAll(extendFns.concat(['onTouchStart', 'onTouchMove', 'onTouchEnd']), this);
            //创建参数对象把 extendFns 设置成参数，同时把 opts 传递进来的参数整合上。

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
                    console.log('是否执行下拉动作。。。。')
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
                    console.log("是否执行上拉刷新动作")
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
            this.loaderBody = document.querySelectorAll(".tloader-body")[0];

            this.loaderSymbol = document.querySelectorAll(".tloader-symbol")[0];

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
            this.wrapper.className = 'tloader state-' + state; // '.test-div'
            this.$emit('classchange', this.wrapper.className);
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
            this.pullupstyle = {
                display: 'block'
            }
            // this.loaderBtn.style.display = "block";
            this.opts.hasMore = false;
        },
        /**
         * resetLoadMore 关闭底部状态
         * 
         * */
        resetLoadMore: function () {
            this.pullupstyle = {
                display: 'none'
            }
            // this.loaderBtn.style.display = "none";
            this.opts.hasMore = true;
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

            diff = easing(diff);
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

                this.$emit('onpulldownrefresh', function (status) { //status------> true 刷新成功... || false -----> 没有更新数据
                    if (status == true) {
                        that.setChange(0, STATS.refreshed);
                        setTimeout(function () {
                            that.setChange(0, STATS.init);
                        }, 1000);
                    } else {
                        that.setChange(0, STATS.nomore);
                        setTimeout(function () {
                            that.setChange(0, STATS.init);
                        }, 1000);
                    }
                });
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
            let that = this;
            if (!this.opts.hasMore || this.loaderState === STATS.loading) {
                return false;
            }

            this.setChange(0, STATS.loading);
            this.$emit('onloadmore', function (status) { // status -->  true  还有更多的数据   false  没有更多的数据
                that.setEndState();
                if (status) {
                    that.setNoMoreState();
                    setTimeout(function () {
                        that.pullupstyle = {
                            display: 'none'
                        }
                    }, 2000)
                }
            });
        },
        /**
         * onPullUpLoad  上拉加载中
         * */
        onPullUpLoad: function () {

        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init()
        });
    },
})
Vue.component('pull-load', pullLoad);
