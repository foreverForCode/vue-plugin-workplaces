// 制作 tab组件
var tab = Vue.extend({
    data: function () {
        return {
            optsClass: 'm-tab',
            mNavList: [{
                    _uid: 0,
                    label: '选项一'
                },
                {
                    _uid: 1,
                    label: '选项二'
                },
                {
                    _uid: 2,
                    label: '选项三'
                },
                {
                    _uid: 3,
                    label: '选项四'
                },
            ],
            activeIndex: 0,
            tempIndex: 0,
            currentView: 'tab-panel0'
        }
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
            <component :is="currentView"></component>
        </div>
    `,
    methods: {
        changeHandler: function (key) {
            this.activeIndex = key
            this.currentView = 'tab-panel' + key
        }
    }
})

Vue.component('tab', tab);

// 制作 tab-panel组件
var tabPanel0 = Vue.extend({
    data: function () {
        return {

        }
    },
    template: `
        <div>
            <div class="yd-tab-panel-item">
                 这是panel第一项
            </div>
        </div>
    `,
    methods: {

    }
})

Vue.component('tab-panel0', tabPanel0);

// 制作 tab-panel组件
var tabPanel1 = Vue.extend({
    data: function () {
        return {

        }
    },
    template: `
        <div>
            <div class="yd-tab-panel-item">
            这是panel第二项
            </div>
        </div>
    `,
    methods: {

    }
})

Vue.component('tab-panel1', tabPanel1);
// 制作 tab-panel组件
var tabPanel2 = Vue.extend({
    data: function () {
        return {

        }
    },
    template: `
        <div>
            <div class="yd-tab-panel-item">
            这是panel第三项
            </div>
        </div>
    `,
    methods: {

    }
})

Vue.component('tab-panel2', tabPanel2);
// 制作 tab-panel组件
var tabPanel3 = Vue.extend({
    data: function () {
        return {

        }
    },
    template: `
        <div>
            <div class="yd-tab-panel-item">
            这是panel第四项
            </div>
        </div>
    `,
    methods: {

    }
})

Vue.component('tab-panel3', tabPanel3);