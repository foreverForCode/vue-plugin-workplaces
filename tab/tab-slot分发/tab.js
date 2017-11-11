// 制作 tab组件
var tab = Vue.extend({
    data: function () {
        return {
            optsClass: 'm-tab',
            activeIndex: 0,
            tmpIndex: 0
        }
    },
    props:["datas"],
    computed:{
        navList: function(){
            return this.datas
        },
    },
    template: `
        <div :class="optsClass">
            <ul v-show="navList.length>0">
                <li v-for="item, key in navList" 
                :key = "key" 
                :class="item._uid == activeIndex?'active':''"
                @click="changeHandler(item._uid, item.title)"
                >
                <a>{{item.title}}</a>
                </li>
            </ul>
            <div>
                <div class="tab-panel" v-for="item,key in navList" :class="key == activeIndex?'tab-panel-active':''" >{{item.panelContent}}</div>
            </div>
        </div>
    `,
    methods: {
        changeHandler:function(id,title){
            this.activeIndex = id;
            this.$emit('currentIndex',id);
            
        }
    },
    mounted:function(){
        
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
    props: ["uid"],
    template: `
        <div class="yd-tab-panel-item">
            <slot></slot>
        </div>
    `,
    methods:{
        getCurrentIndex:function(id){
            console.log(id);
        }
    },
    watch:{
        uid:function(newValue){
            console.log(newValue)
        } 
    }
    
})

Vue.component('tab-panel', tabPanel);