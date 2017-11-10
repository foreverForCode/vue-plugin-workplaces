// 制作 tab组件
var tab = Vue.extend({
    data: function () {
        return {
            optsClass: 'm-tab',
            navList: [],
            activeIndex: 0,
            tmpIndex: 0
        }
    },
    props: {
        change: Function,
        callback: Function,
    },
    template: `
        <div :class="optsClass">
            <ul v-show="navList.length>0">
                <li v-for="item, key in navList" 
                :key = "key" 
                :class="item._uid == activeIndex?'active':''"
                @click="changeHandler(item._uid, item.label, item.tabkey)"
                >
                <a>{{item.label}}</a>
                </li>
            </ul>
            <div class="yd-tab-panel">
                <slot></slot>
            </div>
        </div>
    `,
    methods: {
        init(update, status) {
            const tabPanels = this.$children.filter(item => item.$options.name === 'yd-tab-panel');
            console.log(tabPanels)
            let num = 0;

            if (!update) {
                this.navList = [];
            }

            tabPanels.forEach((panel, index) => {
                if (status === 'label') {
                    return this.navList[index] = panel;
                }

                if (!update) {
                    this.navList.push({
                        _uid: panel._uid,
                        label: panel.label,
                        tabkey: panel.tabkey
                    });
                }

                if (panel.active) {
                    this.activeIndex = this.tmpIndex = panel._uid;
                    this.emitChange(panel.label, panel.tabkey);
                } else {
                    ++num;
                    if (num >= tabPanels.length) {
                        this.activeIndex = this.tmpIndex = tabPanels[0]._uid;
                        this.emitChange(tabPanels[0].label, tabPanels[0].tabkey);
                    }
                }
            });
        },
        emitChange(label, tabkey) {
            // TODO 参数更名，即将删除
            if (this.change) {
                this.change(label, tabkey);
                console.warn('From VUE-YDUI: The parameter "change" is destroyed, please use "callback".');
            }
            this.callback && this.callback(label, tabkey);
        },
        changeHandler(uid, label, tabkey) {
            if (this.tmpIndex != uid) {
                this.activeIndex = this.tmpIndex = uid;
                this.emitChange(label, tabkey);
            }
        }
    }
})

Vue.component('tab', tab);

// 制作 tab-panel组件
var tabPanel = Vue.extend({
    data: function () {
        return {
            active: ''
        }
    },
    props: {
        label: String,
        active: Boolean,
        tabkey: [String, Number]
    },
    template: `
        <div class="yd-tab-panel-item" :class="classes">
            <slot></slot>
        </div>
    `,
    computed: {
        classes() {
            return this.$parent.activeIndex == this._uid ? 'yd-tab-active' : '';
        }
    },
    watch: {
        active() {
            this.$parent.init(true);
        },
        label() {
            this.$parent.init(false, 'label');
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$parent.init(false);
        });
    }
})

Vue.component('tab-panel', tabPanel);