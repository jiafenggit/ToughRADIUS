if (!window.toughradius.admin.subscribe)
    toughradius.admin.subscribe={};


toughradius.admin.subscribe.dataViewID = "toughradius.admin.subscribe.dataViewID";
toughradius.admin.subscribe.detailFormID = "toughradius.admin.subscribe.detailFormID";
toughradius.admin.subscribe.loadPage = function(session,keyword){
    toughradius.admin.methods.setToolbar("user-o","客户业务受理","subscribe");
    var tableid = webix.uid();
    var queryid = webix.uid();
    toughradius.admin.subscribe.reloadData = function(){
        $$(toughradius.admin.subscribe.detailFormID).hide();
        $$(toughradius.admin.subscribe.dataViewID).show();
        $$(tableid).define("url", $$(tableid));
        $$(tableid).refresh();
        $$(tableid).clearAll();
        var params = $$(queryid).getValues();
        var args = [];
        for(var k in params){
            args.push(k+"="+params[k]);
        }
        $$(tableid).load('/admin/subscribe/query?'+args.join("&"));
    }

    var releaseData = function(){
        var params = $$(queryid).getValues();
        toughradius.admin.subscribe.subscribeReleaseByquery(params,function(){
            reloadData();
        })
    }
    var reloadData = toughradius.admin.subscribe.reloadData;

    webix.ui({
        id: toughradius.admin.panelId,
        css:"main-panel",padding:2,
        rows:[
            {
                id:toughradius.admin.subscribe.dataViewID,
                rows:[
                    {
                        view: "toolbar",
                        height:40,
                        css: "page-toolbar",
                        cols: [
                            {
                                view: "button", type: "form", width: 70, icon: "plus", label: "创建用户", click: function () {
                                    toughradius.admin.subscribe.OpenSubscribeForm(session);
                                }
                            },
                            {
                                view: "button", type: "form", width: 55, icon: "key", label: "改密码", click: function () {
                                    var item = $$(tableid).getSelectedItem();
                                    if (item) {
                                        toughradius.admin.subscribe.subscribeUppwd(session, item, function () {
                                            reloadData();
                                        });
                                    } else {
                                        webix.message({ type: 'error', text: "请选择一项", expire: 1500 });
                                    }
                                }
                            },
                            {
                                view: "button", type: "danger", width: 45, icon: "times", label: "删除",  click: function () {
                                    var rows = [];
                                    $$(tableid).eachRow(
                                        function (row) {
                                            var item = $$(tableid).getItem(row);
                                            if (item && item.state === 1) {
                                                rows.push(item.id)
                                            }
                                        }
                                    );
                                    if (rows.length === 0) {
                                        webix.message({ type: 'error', text: "请至少勾选一项", expire: 1500 });
                                    } else {
                                        toughradius.admin.subscribe.subscribeDelete(rows.join(","), function () {
                                            reloadData();
                                        });
                                    }
                                }
                            },
                            {
                                view: "button", type: "danger", width: 45, icon: "times", label: "解绑", click: function () {
                                    var rows = [];
                                    $$(tableid).eachRow(
                                        function (row) {
                                            var item = $$(tableid).getItem(row);
                                            if (item && item.state === 1) {
                                                rows.push(item.id)
                                            }
                                        }
                                    );
                                    if (rows.length === 0) {
                                        webix.message({ type: 'error', text: "请至少勾选一项", expire: 1500 });
                                    } else {
                                        toughradius.admin.subscribe.subscribeRelease(rows.join(","), id,function () {
                                            reloadData();
                                        });
                                    }
                                }
                            },
                            {}
                        ]
                    },
                    {
                        rows: [
                            {
                                id: queryid,
                                css:"query-form",
                                view: "form",
                                hidden: false,
                                paddingX: 10,
                                paddingY: 5,
                                elementsConfig: {minWidth:180},
                                elements: [
                                    {
                                       type:"space", id:"a1", paddingY:0, rows:[{
                                         type:"space", padding:0,responsive:"a1", cols:[
                                                { view: "datepicker", name: "createTime", label: "创建时间不超过", labelWidth:100, stringResult: true,timepicker: true, format: "%Y-%m-%d" },
                                                { view: "datepicker", name: "expireTime", label: "到期时间不超过", labelWidth:100,stringResult: true, format: "%Y-%m-%d" },
                                                {
                                                    view: "richselect", css:"nborder-input2", name: "status", value:"enabled", label: "用户状态", icon: "caret-down",
                                                    options: [
                                                        { id: 'enabled', value: "正常" },
                                                        { id: 'disabled', value: "停用" },
                                                        { id: 'expire', value: "已到期" }
                                                    ]
                                                },
                                                {view: "text", css:"nborder-input2",  name: "keyword", label: "关键字",  value: keyword || "", placeholder: "姓名/帐号/手机/邮箱/地址...", width:240},

                                            {
                                                cols:[
                                                    {view: "button", label: "查询", type: "icon", icon: "search", borderless: true, width: 64, click: function () {
                                                        reloadData();
                                                    }},
                                                    {
                                                        view: "button", label: "重置", type: "icon", icon: "refresh", borderless: true, width: 64, click: function () {
                                                            $$(queryid).setValues({
                                                                createTime: "",
                                                                expireTime: "",
                                                                keyword: "",
                                                                status: ""
                                                            });
                                                        }
                                                    },{}
                                                ]
                                            }
                                         ]}
                                       ]
                                    }
                                ]
                            },
                            {
                                id: tableid,
                                view: "datatable",
                                rightSplit: 2,
                                columns: [
                                    { id: "state", header: { content: "masterCheckbox", css: "center" }, width: 35, css: "center", template: "{common.checkbox()}" },
                                    { id: "id", header: ["ID"], hidden:true},
                                    { id: "subscriber", header: ["帐号"],width:110},
                                    { id: "realname", header: ["姓名"],width:110},
                                    {
                                        id: "status", header: ["状态"], sort: "string",  width:60, template: function (obj) {
                                            if (obj.status === 'enabled' && new Date(obj.expireTime) < new Date()) {
                                                return "<span style='color:orange;'>过期</span>";
                                            } else if (obj.status === 'enabled') {
                                                return "<span style='color:green;'>正常</span>";
                                            } else if (obj.status === 'disabled') {
                                                return "<span style='color:red;'>禁用</span>";
                                            }
                                        }
                                    },
                                    { id: "expireTime", header: ["过期时间"],sort:"date", width:155},
                                    { id: "addrPool", header: ["地址池"] ,width:80},
                                    { id: "activeNum", header: ["最大在线"],width:100},
                                    { id: "ipAddr", header: ["ip 地址"],width:120},
                                    { id: "macAddr", header: ["MAC 地址"],width:140},
                                    { id: "inVlan", header: ["内层VLAN"]},
                                    { id: "outVlan", header: ["外层VLAN"]},
                                    { id: "remark", header: ["备注"],fillspace:true},
                                    { id: "opt", header: '操作',  width: 155, template: function(obj){
                                           var actions = [];
                                           actions.push("<span title='测试' class='table-btn do_tester'><i class='fa fa-tty'></i></span> ");
                                           actions.push("<span title='详情' class='table-btn do_detail'><i class='fa fa-eye'></i></span> ");
                                            actions.push("<span title='修改' class='table-btn do_update'><i class='fa fa-edit'></i></span> ");
                                            // actions.push("<span title='删除账号' class='table-btn do_delete'><i class='fa fa-times'></i></span> ");
                                           return actions.join(" ");
                                    }},
                                    { header: { content: "headerMenu" }, headermenu: false, width: 32 }
                                ],
                                select: true,
                                tooltip:true,
                                hover:"tab-hover",
                                autoConfig:true,
                                clipboard:true,
                                resizeColumn: true,
                                autoWidth: true,
                                autoHeight: true,
                                url: "/admin/subscribe/query",
                                pager: "dataPager",
                                datafetch: 40,
                                loadahead: 15,
                                ready: function () {
                                    if (keyword) {
                                        reloadData();
                                    }
                                },
                                on: {
                                    onItemDblClick: function(id, e, node){
                                        var item = this.getSelectedItem();
                                        toughradius.admin.subscribe.subscribeDetail(session, item.id, function () {
                                            reloadData();
                                        });
                                    }
                                },
                                onClick: {
                                    do_detail: function (e, id) {
                                        toughradius.admin.subscribe.subscribeDetail(session, this.getItem(id).id, function () {
                                            reloadData();
                                        });
                                    },
                                    do_update: function(e, id){
                                        toughradius.admin.subscribe.subscribeUpdate(session, this.getItem(id), function () {
                                            reloadData();
                                        });
                                    },
                                    do_delete: function(e, id){
                                        toughradius.admin.subscribe.subscribeDelete(this.getItem(id).id, function () {
                                            reloadData();
                                        });
                                    },
                                    do_tester: function(e, id){
                                        toughradius.admin.subscribe.subscribeRadiusTest(session,this.getItem(id).id);
                                    }
                                }
                            },
                            {
                                paddingY: 3,
                                cols: [
                                    {
                                        view: "richselect", name: "page_num", label: "每页显示", value: 20,width:130,labelWidth:60,
                                        options: [{ id: 20, value: "20" },
                                            { id: 50, value: "50" },
                                            { id: 100, value: "100" },
                                            { id: 500, value: "500" },
                                            { id: 1000, value: "1000" }],on: {
                                            onChange: function (newv, oldv) {
                                                $$("dataPager").define("size",parseInt(newv));
                                                $$(tableid).refresh();
                                                reloadData();
                                            }
                                        }
                                    },
                                    {
                                        id: "dataPager", view: 'pager', master: false, size: 20, group: 5,
                                        template: '{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()} total:#count#'
                                    },{},

                                ]
                            }
                        ]
                    },
                ]
            },
            {
                id: toughradius.admin.subscribe.detailFormID,
                hidden:true
            }
        ]
    },$$(toughradius.admin.pageId),$$(toughradius.admin.panelId));
    webix.extend($$(tableid), webix.ProgressBar);
};


/**
 * 新用户报装
 * @param session
 * @constructor
 */
toughradius.admin.subscribe.OpenSubscribeForm = function(session){
    var winid = "toughradius.admin.subscribe.OpenSubscribeForm";
    if($$(winid))
        return;
    var formid = winid+"_form";
    webix.ui({
        id:winid,
        view: "window",
        css:"win-body",
        move:true,
        width:340,
        height:480,
        position: "center",
        head: {
            view: "toolbar",
            css:"win-toolbar",

            cols: [
                {view: "icon", icon: "laptop", css: "alter"},
                {view: "label", label: "创建用户"},
                {view: "icon", icon: "times-circle", css: "alter", click: function(){
                        $$(winid).close();
                    }}
            ]
        },
        body: {
            rows:[
                {
                    id: formid,
                    view: "form",
                    scroll: 'y',
                    elementsConfig: { labelWidth: 110 },
                    elements: [
                        { view: "text", name: "subscriber", label: "帐号" },
                        { view: "text", name: "password", label: "认证密码"},
                        { view: "datepicker", name: "expireTime", label: "过期时间", stringResult:true, timepicker: true, format: "%Y-%m-%d %h:%i" },
                        { view: "text", name: "addrPool", label: "地址池" },
                        { view: "text", name: "ipAddr", label: "固定IP地址" , placeholder: "可选，填写后则地址池无效"},
                        { view: "counter", name: "activeNum", label: "最大在线", placeholder: "最大在线", value: 1, min: 1, max: 99999},
                        { view: "radio", name: "bindMac", label: "绑定MAC", value: '0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                        { view: "radio", name: "bindVlan", label: "绑定VLAN", value: '0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                        { view: "text", name: "upRate", label: "上行速率(Mbps)"},
                        { view: "text", name: "downRate", label: "下行速率(Mbps)"}
                    ]
                },
                {
                    view: "toolbar",
                    height:42,
                    css: "page-toolbar",
                    cols: [
                        {},
                        {
                            view: "button", type: "form", width: 100, icon: "check-circle", label: "提交", click: function () {
                                if (!$$(formid).validate()) {
                                    webix.message({ type: "error", text: "请正确填写资料", expire: 1000 });
                                    return false;
                                }
                                var btn = this;
                                btn.disable();
                                var params = $$(formid).getValues();
                                webix.ajax().post('/admin/subscribe/create', params).then(function (result) {
                                    btn.enable();
                                    var resp = result.json();
                                    webix.message({ type: resp.msgtype, text: resp.msg, expire: 3000 });
                                    if (resp.code === 0) {
                                        toughradius.admin.subscribe.loadPage(session, params.subscriber);
                                        $$(winid).close();
                                    }
                                });
                            }
                        },
                        {
                            view: "button", type: "base", width: 100, icon: "times-circle", label: "取消", click: function () {
                                $$(winid).close();
                            }
                        }
                    ]
                }
            ]
        }

    }).show();
};


/**
 * 用户订阅详情
 * @param itemid
 * @param callback
 */
toughradius.admin.subscribe.subscribeDetail = function(session,itemid,callback){
    $$(toughradius.admin.subscribe.detailFormID).show();
    $$(toughradius.admin.subscribe.dataViewID).hide();
    var detailWinid = "toughradius.admin.subscribe.subscribeDetail";
    // if($$(detailWinid))
    //     return;
    var formid = detailWinid+"_form";
    var online_tabid = webix.uid();
    webix.ajax().get('/admin/subscribe/detail', {id:itemid}).then(function (result) {
        var resp = result.json();
        if(resp.code>0){
            webix.message({ type: "error", text: resp.msg, expire: 3000 });
            return;
        }
        var subs = resp.data;
        webix.ui({
            id:toughradius.admin.subscribe.detailFormID,
            borderless:true,
            padding:5,
            rows:[
                {
                    view: "toolbar",
                    css: "page-toolbar",
                    cols: [
                        {view:"icon", icon:"user"},
                        {view: "label", label: "用户详情"},
                        { },
                        {
                            view: "button", type: "icon", width: 80, icon: "reply", label: "返回", click: function () {
                                $$(toughradius.admin.subscribe.detailFormID).hide();
                                $$(toughradius.admin.subscribe.dataViewID).show();
                            }
                        }
                    ]
                },
                {
                    view: "tabview",
                    cells: [
                        {
                            header: "用户信息",
                            body: {
                                id: formid,
                                view: "form",
                                scroll: "auto",
                                elementsConfig: { labelWidth: 110 },
                                elements: [
                                    { view: "fieldset", label: "基本信息",  body: {
                                        rows:[
                                            {
                                                cols: [
                                                    { view: "text", name: "subscriber", label: "订阅帐号", css: "nborder-input", readonly: true, value: subs.subscriber },
                                                    { view: "text", name: "password", label: "认证密码", css: "nborder-input", readonly: true, value: subs.password },
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "expireime", label: "过期时间", css: "nborder-input", readonly: true, value: subs.expireTime },
                                                    { view: "text", name: "addrPool", label: "地址池", css: "nborder-input",  value: subs.addrPool,readonly:true },
                                                ]
                                            },
                                            {
                                              cols:[
                                                  { view: "text", name: "ipAddr", label: "固定IP地址", css: "nborder-input", value: subs.ipAddr ,readonly:true},
                                                  { view: "text", name: "macAddr", label: "MAc地址", css: "nborder-input", value: subs.macAddr ,readonly:true},
                                              ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "inVlan", label: "内层VLAN", css: "nborder-input", value: subs.in_vlan ,readonly:true},
                                                    { view: "text", name: "outVlan", label: "外层VLAN", css: "nborder-input", value: subs.out_vlan ,readonly:true},

                                                ]
                                            }
                                        ]

                                    }},
                                    { view: "fieldset", label: "授权策略",  body: {
                                        rows:[
                                            {
                                                cols: [
                                                    { view: "text", name: "activeNum", label: "最大在线", css: "nborder-input", value: subs.activeNum,readonly:true},
                                                    { view: "text", name: "flowAmount", label: "剩余流量", css: "nborder-input", value: bytesToSize(subs.flowAmount),readonly:true},
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "radio", name: "bindVlan", label: "绑定VLAN", disabled:true, value: subs.bind_vlan?'1':'0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                                                    { view: "radio", name: "bindMac", label: "绑定MAC", disabled:true,value: subs.bindMac?'1':'0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "upRate", label: "上行速率(Mbps)",  value: subs.upRate,css: "nborder-input", readonly:true},
                                                    { view: "text", name: "downRate", label: "下行速率(Mbps)",  value: subs.downRate,css: "nborder-input",readonly:true},
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "upPeakRate", label: "突发上行(Mbps)",  value: subs.upPeakRate,css: "nborder-input", readonly:true},
                                                    { view: "text", name: "downPeakRate", label: "突发下行(Mbps)",  value: subs.downPeakRate,css: "nborder-input",readonly:true},
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "upRateCode", label: "上行速率策略",  value: subs.upRateCode,css: "nborder-input",readonly:true},
                                                    { view: "text", name: "downRateCode", label: "下行速率策略",  value: subs.downRateCode,css: "nborder-input",readonly:true},
                                                ]
                                            },
                                            {
                                                cols:[
                                                    { view: "text", name: "domain", label: "认证域", css: "nborder-input", value: subs.domain,readonly:true},
                                                    { view: "text", name: "policy", label: "扩展策略", css: "nborder-input", value: subs.policy,readonly:true},
                                                ]
                                            }

                                        ]
                                    }}
                                ]
                            }
                        },
                         {
                            header: "在线信息",
                            body: {
                                id:online_tabid,
                                view: "datatable",
                                leftSplit: 1,
                                rightSplit: 2,
                                columns: [
                                    { id: "username", header: ["用户名"], sort: "string" },
                                    { id: "acctSessionId", header: ["会话ID"], sort: "string", hidden: true },
                                    { id: "nasId", header: ["BRAS 标识"], sort: "string" },
                                    { id: "acctStartTime", header: ["上线时间"], sort: "string" },
                                    { id: "nasAddr", header: ["BRAS IP"], sort: "string" },
                                    { id: "framedIpaddr", header: ["用户 IP"],  sort: "string" },
                                    { id: "macAddr", header: ["用户 Mac"],  sort: "string" },
                                    { id: "nasPortId", header: ["端口信息"], sort: "string" },
                                    {
                                        id: "acctInputTotal", header: ["上传"],  sort: "nt", template: function (obj) {
                                            return bytesToSize(obj.acctInputTotal);
                                        }
                                    },
                                    {
                                        id: "acctOutputTotal", header: ["下载"], sort: "int", template: function (obj) {
                                            return bytesToSize(obj.acctOutputTotal);
                                        }
                                    },
                                    { id: "acctInputPackets", header: ["上行数据包"], sort: "string" },
                                    { id: "acctOutputPackets", header: ["下行数据包"],  sort: "string"},
                                    { id: "opt", header: '操作', template: "<span class='table-btn do_clean'><i class='fa fa-unlock'></i> 清理</span> ", width: 100 },
                                    { header: { content: "headerMenu" }, headermenu: false, width: 35 }
                                ],
                                select: true,
                                resizeColumn: true,
                                autoWidth: true,
                                autoHeight: true,
                                url: "/admin/online/query?keyword=" + subs.subscriber,
                                onClick:{
                                    do_clean: function (e, id) {
                                        var sessionid = this.getItem(id).acctSessionId;
                                        webix.require("admin/online.js?rand="+new Date().getTime(), function () {
                                            toughradius.admin.online.onlineUnlock(sessionid,function(){
                                               $$(online_tabid).load("/admin/online/query?keyword=" + subs.subscriber);
                                               $$(online_tabid).refreash();
                                            });
                                        });
                                    }
                                }
                            }
                        },
                        {
                            header: "认证日志",
                            body: {
                                view:"treetable",
                                scroll:"y",
                                subview:{
                                    borderless:true,
                                    view:"template",
                                    height:180,
                                    template:"<div style='padding: 5px;'>#msg#</div>"
                                },
                                on:{
                                    onSubViewCreate:function(view, item){
                                        item.msg = item.msg.replace("\n","<br>");
                                        view.setValues(item);
                                    }
                                },
                                columns: [
                                    { id: "time", header: ["时间"], width: 180, template:"{common.subrow()} #time#"},
                                    { id: "msg", header: ["最近200条记录"], fillspace:true  }
                                ],
                                select: true,
                                resizeColumn: true,
                                autoWidth: true,
                                autoHeight: true,
                                url: "/admin/syslog/query?start=0&count=200&type=radiusd&username="+ subs.subscriber
                            }
                        },
                        {
                            header: "上网日志",
                            body: {
                                view: "datatable",
                                rightSplit: 1,
                                columns: [
                                    { id: "username", header: ["用户名"], sort: "string" },
                                    { id: "acctSessionId", header: ["会话ID"],sort: "string",  },
                                    { id: "nasId", header: ["BRAS 标识"],  sort: "string",  },
                                    { id: "nasAddr", header: ["BRAS IP"],  sort: "string" },
                                    { id: "framedIpaddr", header: ["用户 IP"],  sort: "string" },
                                    { id: "macAddr", header: ["用户 Mac"],  sort: "string" },
                                    { id: "nasPortId", header: ["端口信息"],  sort: "string", hidden: true },
                                    {
                                        id: "acctInputTotal", header: ["上传"], sort: "nt", template: function (obj) {
                                            return bytesToSize(obj.acctInputTotal);
                                        }
                                    },
                                    {
                                        id: "acctOutputTotal", header: ["下载"],  sort: "int", template: function (obj) {
                                            return bytesToSize(obj.acctOutputTotal);
                                        }
                                    },
                                    { id: "acctInputPackets", header: ["上行数据包"],  sort: "string", hidden: true },
                                    { id: "acctOutputPackets", header: ["下行数据包"],  sort: "string", hidden: true },
                                    { id: "acctStartTime", header: ["上线时间"],  sort: "string" },
                                    { id: "acctStopTime", header: ["下线时间"],  sort: "string" },
                                    { header: { content: "headerMenu" }, headermenu: false, width: 35 }
                                ],
                                select: true,
                                resizeColumn: true,
                                autoWidth: true,
                                autoHeight: true,
                                url: "/admin/ticket/query?username=" + subs.subscriber
                            }
                        }
                    ]
                }
            ]

        },$$(toughradius.admin.subscribe.detailFormID));
    })
};

toughradius.admin.subscribe.subscribeUpdate = function(session,item,callback){
    var updateWinid = "toughradius.admin.subscribe.subscribeUpdate";
    if($$(updateWinid))
        return;
    var formid = updateWinid+"_form";
    webix.ajax().get('/admin/subscribe/detail', {id:item.id}).then(function (result) {
        var resp = result.json();
        if(resp.code>0){
            webix.message({ type: "error", text: resp.msg, expire: 3000 });
            return;
        }
        var subs = resp.data;
        webix.ui({
            id:updateWinid,
            view: "window",
            css:"win-body",
            move:true,
            resize:true,
            width:360,
            height:480,
            position: "center",
            head: {
                view: "toolbar",
                css:"win-toolbar",

                cols: [
                    {view: "icon", icon: "laptop", css: "alter"},
                    {view: "label", label: "帐号修改"},
                    {view: "icon", icon: "times-circle", css: "alter", click: function(){
                        $$(updateWinid).close();
                    }}
                ]
            },
            body: {
                borderless: true,
                padding:5,
                rows:[
                {
                    id: formid,
                    view: "form",
                    scroll: "y",
                    elementsConfig: { labelWidth: 120 },
                    paddingX:10,
                    elements: [
                        { view: "text", name: "id",  hidden: true, value: subs.id },
                        { view: "text", name: "subscriber", label: "帐号", css: "nborder-input", readonly: true, value: subs.subscriber },
                        { view: "text", name: "realname", label: "帐号",value: subs.realname },
                        { view: "radio", name: "status", label: "状态", value: subs.status, options: [{ id: 'enabled', value: "正常" }, { id: 'disabled', value: "停用" }] },
                        {
                            view: "datepicker", name: "expireTime", timepicker: true, value:subs.expireTime,
                            label: "过期时间", stringResult: true,  format: "%Y-%m-%d %h:%i", validate: webix.rules.isNotEmpty
                        },
                        { view: "text", name: "addrPool", label: "地址池",  value: subs.addrPool },
                        { view: "radio", name: "bindMac", label: "绑定MAC", value: subs.bindMac?'1':'0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                        { view: "radio", name: "bindVlan", label: "绑定VLAN", value: subs.bindVlan?'1':'0', options: [{ id: '1', value: "是" }, { id: '0', value: "否" }] },
                        { view: "text", name: "macAddr", label: "MAc地址",  value: subs.macAddr },
                        { view: "text", name: "ipAddr", label: "固定IP地址",  value: subs.ipAddr },
                        { view: "text", name: "inVlan", label: "内层VLAN",  value: subs.inVlan },
                        { view: "text", name: "outVlan", label: "外层VLAN",  value: subs.outVlan },
                        { view: "text", name: "upRate", label: "上行速率(Mbps)",  value: subs.upRate},
                        { view: "text", name: "downRate", label: "下行速率(Mbps)",  value: subs.downRate},
                        { view: "text", name: "upPeakRate", label: "突发上行速率(Mbps)",  value: subs.upPeakRate},
                        { view: "text", name: "downPeakRate", label: "突发下行速率(Mbps)",  value: subs.downPeakRate},
                        { view: "counter", name: "activeNum", label: "最大在线", placeholder: "最大在线", value: subs.activeNum, min: 1, max: 99999},
                        { view: "text", name: "upRateCode", label: "上行速率策略",  value: subs.upRateCode},
                        { view: "text", name: "downRateCode", label: "下行速率策略",  value: subs.downRateCode},
                        { view: "text", name: "domain", label: "认证域", value: subs.domain},
                        { view: "text", name: "policy", label: "自定义策略", value:subs.policy},
                        {
                            cols:[
                                { view: "textarea", name: "remark", label: "备注",value: subs.remark, height: 80 }
                            ]
                        }
                    ]
                },
                {
                    height:36,
                    css: "panel-toolbar",
                    cols: [{},
                        {
                            view: "button", type: "form", width: 70, icon: "check-circle", label: "提交", click: function () {
                                if (!$$(formid).validate()) {
                                    webix.message({ type: "error", text: "请正确填写资料", expire: 1000 });
                                    return false;
                                }
                                var btn = this;
                                btn.disable();
                                var params = $$(formid).getValues();
                                params.subs_id = item.id;
                                webix.ajax().post('/admin/subscribe/update', params).then(function (result) {
                                    btn.enable();
                                    var resp = result.json();
                                    webix.message({ type: resp.msgtype, text: resp.msg, expire: 3000 });
                                    if (resp.code === 0) {
                                        toughradius.admin.subscribe.reloadData();
                                         $$(updateWinid).close();
                                    }
                                });
                            }
                        },
                        {view: "button", type: "base", width: 70, icon: "check-circle", label: "取消", click: function(){$$(updateWinid).close()}}

                    ]
                }
            ]}
        }).show();
    })
};

toughradius.admin.subscribe.subscribeUppwd = function(session,item,callback){
    var winid = "toughradius.admin.subscribe.subscribeUppwd";
    if($$(winid))
        return;
    var formid = winid+"_form";
    webix.ajax().get('/admin/subscribe/detail', {id:item.id}).then(function (result) {
        var subs = result.json();
        webix.ui({
            id:winid,
            view: "window",
            css:"win-body",
            move:true,
            width:680,
            height:500,
            position: "center",
            head: {
                view: "toolbar",
                css:"win-toolbar",

                cols: [
                    {view: "icon", icon: "laptop", css: "alter"},
                    {view: "label", label: "帐号密码修改"},
                    {view: "icon", icon: "times-circle", css: "alter", click: function(){
                        $$(winid).close();
                    }}
                ]
            },
            body:{
                borderless: true,
                padding:5,
                rows:[
                {
                    id: formid,
                    view: "form",
                    scroll: "auto",
                    maxWidth: 2000,
                    maxHeight: 2000,
                    elementsConfig: { labelWidth: 120 },
                    elements: [
                        {
                            view: "fieldset", label: "授权信息", paddingX: 20, body: {
                            paddingX: 20,
                            rows: [
                                {
                                    cols: [
                                        { view: "text", name: "subscriber", label: "订阅帐号", css: "nborder-input", readonly: true, value: subs.subscriber },
                                        { view: "text", name: "product_name", label: "订阅商品", css: "nborder-input", readonly: true, value: subs.product.name }
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "text", name: "password", label: "当前密码", css: "nborder-input", readonly: true, value: subs.password },
                                        { view: "text", name: "expire_time", label: "过期时间", css: "nborder-input", readonly: true, value: subs.expire_time }
                                    ]
                                }
                            ]
                        }
                        },
                        {
                            view: "fieldset", label: "修改密码", paddingX: 20, body: {
                            paddingX: 20,
                            cols: [
                                { view: "text", name: "new_password", type: "password", label: "新密码(*)", placeholder: "新密码", validate: webix.rules.isNotEmpty },
                                { view: "text", name: "new_cpassword", type: "password", label: "确认新密码(*)", placeholder: "确认新密码", validate: webix.rules.isNotEmpty }
                            ]
                        }
                        }
                    ]
                },
                {
                    height:36,
                    cols: [{},
                        {
                            view: "button", type: "form", width: 70, icon: "check-circle", label: "提交", click: function () {
                                if (!$$(formid).validate()) {
                                    webix.message({ type: "error", text: "请正确填写资料", expire: 1000 });
                                    return false;
                                }
                                var btn = this;
                                btn.disable();
                                var params = $$(formid).getValues();
                                params.subs_id = item.id;
                                webix.ajax().post('/admin/subscribe/uppwd', params).then(function (result) {
                                    btn.enable();
                                    var resp = result.json();
                                    webix.message({ type: resp.msgtype, text: resp.msg, expire: 3000 });
                                    if (resp.code === 0) {
                                        toughradius.admin.subscribe.reloadData();
                                         $$(winid).close();
                                    }
                                });
                            }
                        },
                        {
                            view: "button", type: "base", icon: "times-circle", width: 70, css: "alter", label: "关闭", click: function () {
                                 $$(winid).close();
                            }
                        }
                    ]
                }
            ]
            }
        }).show(0)
    })
};



toughradius.admin.subscribe.subscribeDelete = function (ids,callback) {
    webix.confirm({
        title: "操作确认",
        ok: "是", cancel: "否",
        text: "删除帐号会同时删除相关所有数据，此操作不可逆，确认要删除吗？",
        width:360,
        callback: function (ev) {
            if (ev) {
                webix.ajax().get('/admin/subscribe/delete', {ids:ids}).then(function (result) {
                    var resp = result.json();
                    webix.message({type: resp.msgtype, text: resp.msg, expire: 1500});
                    if(callback)
                        callback()
                });
            }
        }
    });
};

toughradius.admin.subscribe.subscribeReleaseByquery = function (params,callback) {
    webix.confirm({
        title: "操作确认",
        ok: "是", cancel: "否",
        text: "将根据查询条件批量解除帐号的MAC，VLAN绑定，确认要这么做吗？",
        width:270,
        callback: function (ev) {
            if (ev) {
                webix.ajax().get('/admin/subscribe/release_by_query', params).then(function (result) {
                    var resp = result.json();
                    webix.message({type: resp.msgtype, text: resp.msg, expire: 1500});
                    if(callback)
                        callback()
                });
            }
        }
    });
};


toughradius.admin.subscribe.subscribeRelease = function (ids,rtype,callback) {
    console.log(rtype);
    if(['subscribe_release_mac','subscribe_release_invlan','subscribe_release_outvlan'].indexOf(rtype)==-1){
        return;
    }
    webix.confirm({
        title: "操作确认",
        ok: "是", cancel: "否",
        text: "确认要释放绑定吗？",
        width:270,
        callback: function (ev) {
            if (ev) {
                webix.ajax().get('/admin/subscribe/release', {ids:ids,rtype:rtype}).then(function (result) {
                    var resp = result.json();
                    webix.message({type: resp.msgtype, text: resp.msg, expire: 1500});
                    if(callback)
                        callback()
                });
            }
        }
    });
};


toughradius.admin.subscribe.subscribeRadiusTest = function(session,itemid){
    var winid = "toughradius.admin.subscribe.subscribeRadiusTest";
    var logvid = webix.uid();
    if($$(winid))
        return;
    var formid = winid+"_form";
    var updateLog = function(iresult){
        var rst = iresult.json();
        console.log(rst);
        $$(logvid).define("template",rst.msg.replace("\n","<br>"))
        $$(logvid).refresh();
    }
    webix.ajax().get('/admin/subscribe/detail', {id:itemid}).then(function (result) {
        var subs = result.json();
        webix.ui({
            id:winid,
            view: "window",
            css:"win-body",
            move:true,
            width:680,
            height:500,
            position: "center",
            head: {
                view: "toolbar",
                css:"win-toolbar",

                cols: [
                    {view: "icon", icon: "laptop", css: "alter"},
                    {view: "label", label: "用户拨号测试"},
                    {view: "icon", icon: "times-circle", css: "alter", click: function(){
                        $$(winid).close();
                    }}
                ]
            },
            body:{
                borderless: true,
                padding:5,
                rows:[
                {
                    id: formid,
                    view: "form",
                    scroll: "auto",
                    maxWidth: 2000,
                    maxHeight: 2000,
                    elementsConfig: { labelWidth: 120 },
                    elements: [
                        {
                            view: "fieldset", label: "测试帐号", paddingX: 20, body: {
                                paddingX: 20,
                                rows: [
                                    {
                                        cols: [
                                            { view: "text", name: "subscriber", label: "订阅帐号", css: "nborder-input", readonly: true, value: subs.subscriber },
                                            { view: "text", name: "product_name", label: "订阅商品", css: "nborder-input", readonly: true, value: subs.product.name }
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "password", label: "当前密码", css: "nborder-input", readonly: true, value: subs.password },
                                            { view: "text", name: "expire_time", label: "过期时间", css: "nborder-input", readonly: true, value: subs.expire_time }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            id: logvid,
                            maxHeight: 2000,
                            view:"template",
                            css:"web-console",
                            borderless: true,
                            scroll:"y",
                            template:""
                        }
                    ]
                },
                {
                    height:36,
                    cols: [{},
                        {
                            view: "button", type: "form", width: 80, icon: "check-circle", label: "PAP 认证", click: function () {
                                var btn = this;
                                btn.disable();
                                var params = {username:subs.subscriber,papchap:"pap"}
                                webix.ajax().get('/admin/radius/auth/test', params).then(function (iresult) {
                                    btn.enable();
                                    updateLog(iresult);
                                });
                            }
                        },
                        {
                            view: "button", type: "form", width: 80, icon: "check-circle", label: "CHAP 认证", click: function () {
                                var btn = this;
                                btn.disable();
                                var params = {username:subs.subscriber,papchap:"pap"}
                                webix.ajax().get('/admin/radius/auth/test', params).then(function (iresult) {
                                    btn.enable();
                                    updateLog(iresult);
                                });
                            }
                        },
                        {
                            view: "button", type: "form", width: 80, icon: "check-circle", label: "上线", click: function () {
                                var btn = this;
                                btn.disable();
                                var params = {username:subs.subscriber,type:"1"}
                                webix.ajax().get('/admin/radius/acct/test', params).then(function (iresult) {
                                    btn.enable();
                                    updateLog(iresult);
                                });
                            }
                        },
                        {
                            view: "button", type: "form", width: 80, icon: "check-circle", label: "更新", click: function () {
                                var btn = this;
                                btn.disable();
                                var params = {username:subs.subscriber,type:"3"}
                                webix.ajax().get('/admin/radius/acct/test', params).then(function (iresult) {
                                    btn.enable();
                                    updateLog(iresult);
                                });
                            }
                        },
                        {
                            view: "button", type: "form", width: 80, icon: "check-circle", label: "下线", click: function () {
                                var btn = this;
                                btn.disable();
                                var params = {username:subs.subscriber,type:"2"}
                                webix.ajax().get('/admin/radius/acct/test', params).then(function (iresult) {
                                    btn.enable();
                                    updateLog(iresult);
                                });
                            }
                        },
                        {
                            view: "button", type: "base", icon: "times-circle", width: 70, css: "alter", label: "关闭", click: function () {
                                 $$(winid).close();
                            }
                        }
                    ]
                }
            ]
            }
        }).show(0)
    })
};