// 制作 tab组件
var tab = Vue.extend({
    data: function () {
        return {
            optsClass: 'm-tab',
            mNavList: [
            ],
            activeIndex: 0,
            tempIndex: 0
        }
    },
    props:{
        change: Function,
        callback: Function,
    },
    template: `
        <div :class="optsClass">
            <ul v-if="mNavList.length>0">
                <li v-for="item, key in mNavList" :key = "key" :class="item._uid == activeIndex?'active':''"
                @click="changeHandler(item._uid)"
                >
                    <a>{{item.label}}</a>
                </li>
            </ul>
            <div class="tab-panel-items">
                <slot></slot>
            </div>
        </div>
    `,
    methods: {
        init:function(){
            

        },
        changeHandler: function (key) {
            this.activeIndex = key;
        }
    }
})

Vue.component('tab', tab);

// 制作 tab-panel组件
var tabPanel = Vue.extend({
    data: function () {
        return {
            active:''
        }
    },
    template: `
        <div>
            <div class="yd-tab-panel-item">
                 <slot></slot>
            </div>
        </div>
    `,
    methods: {

    },
    mounted:function(){
        this.$nextTick(()=>{
            this.$parent.init()
        })
    }
})

Vue.component('tab-panel', tabPanel);


