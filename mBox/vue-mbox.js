/**
 * Created by onion on 2017/11/3.
 */
;!(function(window, undefined) {    
    var mBox = {}, isType = function (obj,type) {
        type = type.replace(/(\w)/,function(v){return v.toUpperCase()});
        return Object.prototype.toString.call(obj) === '[object '+type+']';
    };
    mBox.install = function (Vue, vueConfig) {
        var VuePro = Vue.prototype;
        VuePro.$mBox = function (option) {
            var config = {
                width:"auto",  // 弹层的宽度，可用是百分比，可用是如（320px）
                height:"auto",  // 弹层的高度，可用是百分比，可用是如（320px）
                radius:"4px",  //弹层的类型
                title:[],  // 标题可以有2个参数，例如 ["标题",{"background-color":"#fff","color":"#fff"}]，如果title:[]参数为空，不显示标题
                content:"请稍等,暂无内容！",  // 内容	
                conStyle:{}, //内容框的css样式，你可以写更多样式，例如{"background-color":"#fff"}
                skin:"scale",  //弹出风格
                yesCall:{},  // 确定按钮回调函数，例如{name:"确定",css:{"background-color":"#fff"},fun:function (){}}
                noCall:{},  // 取消按钮回调函数，例如{name:"取消",css:{"background-color":"#fff"},fun:function (){}}
                closeCall:null,  // 右上角关闭取消按钮回调函数
                closeBtn:[ true, 1 ],  // 参数一是否显示右上角关闭取消按钮，默认false，参数二按钮颜色 1是黑色，2是白色
                time:0,  // 自动关闭时间(毫秒)
                mask:true,  //是否显示遮罩层
                maskClose:true,  // 点击遮罩层是否关闭，默认true
                maskColor:"rgba(0,0,0,0.5)",  // 遮罩层颜色可以是rgba也可以是rgb
                padding:"10px 10px",
                zIndex:1e4,  // 层级关系
                success:null,  //层成功弹出层的回调函数，返回一个参数为当前层元素对象
                endCall:null   //层彻底销毁后的回调函数
            };
            var opts = Object.assign(JSON.parse(JSON.stringify(config)), vueConfig);
            var BoxTpl = Vue.extend({
                data: function () {
                    return {ModleConf:opts}
                },
                template: '<div class="jemboxer" :class="ModleConf.boxanim" vuemBox>' +
                '<div class="jemboxmask" :style="{backgroundColor: ModleConf.maskColor, zIndex: ModleConf.zIndex-5}" @click="maskCloseTap" v-if="ModleConf.mask"></div>' +
                '<div class="jemboxchild" :class="ModleConf.childanim" :style="ModleConf.conStyle">' +
                '<div class="jemboxhead" v-if="ModleConf.isTitle" v-html="ModleConf.title[0]" :style="ModleConf.title[1]"></div><span class="jemboxclose01" v-if="ModleConf.closeBtn[0]" @click="maskCloseTap"></span>'+
                '<div class="jemboxmcont" :style="{ padding: ModleConf.padding}" v-html="ModleConf.content"></div>' +
                '<div class="jemboxfoot" v-if="ModleConf.yesBtnName || ModleConf.noBtnName"><span type="no" v-if="ModleConf.noBtnName == true" :style="ModleConf.noCall.css" @click="noModalTap" v-text="ModleConf.noCall.name"></span><span type="yes" v-if="ModleConf.yesBtnName" :style="ModleConf.yesCall.css" @click="yesModalTap" v-text="ModleConf.yesCall.name"></span></div>' +
                '</div></div>',
                methods:{
                    maskCloseTap:function () {
                        VuePro.$mBox.close(tpl.$el);
                    },
                    yesModalTap:function () {
                        if(isType(opts.yesCall.fun,"function")) opts.yesCall.fun && opts.yesCall.fun(tpl.$el);
                    },
                    noModalTap:function () {
                        if(isType(opts.noCall.fun,"function")) opts.noCall.fun && opts.noCall.fun(tpl.$el);
                        VuePro.$mBox.close(tpl.$el);
                    }
                },
            });
            var tpl = new BoxTpl().$mount(document.createElement('div'));
            if(typeof option == 'object'){
                for (var key in option) opts[key] = option[key];
            }
            opts.isTitle = (opts.title == false || opts.title.length == 0) ? false : true;
            opts.conStyle = Object.assign({zIndex: opts.zIndex,width:opts.width,height:opts.height,borderRadius:opts.radius },opts.conStyle);
            opts.boxanim = "jemboxmain-"+ opts.skin;
            opts.childanim = "jemanim-" + opts.skin;
            opts.yesBtnName = opts.yesCall.name == undefined ? false:true;
            opts.noBtnName = opts.noCall.name == undefined ? false:true;
            document.body.appendChild(tpl.$el);
            if (opts.time > 0){
                setTimeout(function () {
                    document.body.removeChild(tpl.$el);
                }, 1000*opts.time)
            }
            setTimeout(function() {
                //弹出成功后的回调
                opts.success && opts.success(tpl.$el);
            }, 30);    console.log(VuePro)
        };
        //弹出式提示
        VuePro.$mBox.toast = function (options) {
            var conHtml = "", asscon = {"backgroundColor":"rgba(0,0,0,0.80)","color":"#fff"},
                mConf = Object.assign({width:'',padding:"20px 10px", closeBtn:[ false, 1 ],content:"",conStyle:{},type:"",time:0,success:null}, options);
            //判断类型
            switch (mConf.type){
                case "none"   : conHtml = "<div class='jemtc'>"+mConf.content+"</div>"; break;
                case "success": conHtml = "<div class='success'></div><div class='jemtc'>"+mConf.content+"</div>"; break;
                case "error"  : conHtml = "<div class='error'></div><div class='jemtc'>"+mConf.content+"</div>"; break;
                case "loading": conHtml = "<div class='loading'><span></span></div><div class='jemtc'>"+mConf.content+"</div>"; break;
            }
            VuePro.$mBox({
                width:mConf.width, padding:mConf.padding,
                mask:false,  time:mConf.time, content:conHtml,
                conStyle:Object.assign(asscon,mConf.conStyle),
                closeBtn:mConf.closeBtn,success:mConf.success
            })
        };
        //警告提示
        VuePro.$mBox.alert = function (text) {
            VuePro.$mBox({
                width:'86%', padding:"20px 10px",
                content:text, yesCall:{
                    name:"确定",
                    fun:function(idx){
                        VuePro.$mBox.close(idx);
                    }
                }
            });
        };
        //通知提示
        VuePro.$mBox.notice = function (options) {
            var mConf = Object.assign({content:"",time:5,conStyle:{}}, options),
                asscon = {position: "fixed",top: 0, left: 0, "backgroundColor":"rgba(0,0,0,0.80)","color":"#fff"};
            VuePro.$mBox({
                width:'100%', padding:"8px 10px", time:mConf.time,radius:"0px",
                content:"<div class='jemtc'>"+mConf.content+"</div>",mask:false,
                conStyle:Object.assign(asscon,mConf.conStyle)
            });
        };
        //弹出式菜单
        VuePro.$mBox.actionSheet = function (options) {
            //合并默认的API
            var mConf = Object.assign({title:"",closeBtn:[ false, 1 ],content:"",skins:"",time:0,conStyle:{},success:null,yesCall:null,noCall:{name:"取消"}}, options);
            //判断向上弹出层的效果类型
            if(mConf.skins == "websheet"){
                var childWidth = '100%', bgColor = {"backgroundColor":"#fff"};
            }else if(mConf.skins == "itemsheet"){
                var childWidth = '95%',  bgColor = {"backgroundColor":"rgba(255,255,255,0)"};
            }
            VuePro.$mBox({
                width:childWidth, padding:"0px", time:mConf.time,title:mConf.title,
                closeBtn:mConf.closeBtn,skin:mConf.skins, radius:"", content:mConf.content,
                conStyle:Object.assign(bgColor,mConf.conStyle), success:mConf.success,
                yesCall:mConf.yesCall,noCall:mConf.noCall
            });
        };
        VuePro.$mBox.close = function (el) {
            document.body.removeChild(el);
        }
        VuePro.$mBox.closeAll = function () {
            var vuemBox = document.querySelectorAll("[vuemBox]");
            vuemBox.forEach(function (elem) {
                document.body.removeChild(elem);
            })
        }
    };
    if (typeof exports == "object") {
        module.exports = mBox;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return mBox });
    } else if(window.Vue){
        Vue.use(mBox);
    }
})(window);