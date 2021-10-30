/*
京东双11 环球旅行 分20亿
cron 23 2-23/2 * * * jd_worldtravel2.js
需要自行抓包 https://api.m.jd.com/client.action?functionId=travel_collectScore 中的ss
参数 填入 wt_ss.json
author SkyJohn233
 */

const $ = new Env('环球旅行');
const notify = $.isNode() ? require('./sendNotify') : '';
const fs = $.isNode() ? require('fs'):'';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '';
let shareCodesArr = [], shareCode = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
//cookiesArr=cookiesArr.slice(0,1);//not completed 暂时只运行qh jdcookie
let jdnodify = true;
let mes = '', subtitle = '';
let logs;
const JD_API_HOST = 'https://api.m.jd.com';
let secretp;
let wt_ss =``;
let wt_body_ss = ``;
let wt_body_com = ``;
let wt_collectscore_ss = ``;
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n');
        return;
    }
    //logs=JSON.parse(fs.readFileSync('wt_ss.json','utf-8'));
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            await TotalBean();
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            mes = '';
            subtitle = '';
            $.log(`---第${$.index}个京东帐号----${$.UserName}---开始`);
            await WTconfig();
            await WorldTravel();
            $.log(`---第${$.index}个京东帐号----${$.UserName}---结束`);
        }
    }
    await WThelp();
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '');
    })
    .finally(() => {
        $.done();
    })
function randomString(e) {
    e = e || 32;
    let t = "0123456789",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}


async function WTconfig(){
    await WT_homedata();
    //let slog = logs[$.UserName] ? logs[$.UserName]: '';
}
function taskPostUrl(func_name, ck, body) {
    body = JSON.stringify(body);
    let post_body = `functionId=${func_name}&body=${body}&client=wh5&clientVersion=1.0.0`
    return {
        'url': `${JD_API_HOST}/client.action?functionId=${func_name}`,
        'headers': {
            "Accept-Language": "en-us",
            "Accept": "application/json,text/plain, */*",
            "Origin": "https://wbbny.m.jd.com",
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Length': post_body.length,
            'Cookie': ck,
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&from=home&lng=120.086264&lat=30.336458&sid=a6f666be46f1b6c3354e103b7e2fe3dw&un_area=15_1213_1214_52672'
        },
        'body': post_body
    }
}
function taskPostUrl2(func_name, ck, body) {
    body = JSON.stringify(body);
    let post_body = `body=${body}`
    return {
        'url': `${JD_API_HOST}/client.action?functionId=${func_name}&client=wh5`,
        'headers': {
            "Accept-Language": "en-us",
            "Accept": "application/json,text/plain, */*",
            "Origin": "https://wbbny.m.jd.com",
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Length': post_body.length,
            'Cookie': ck,
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&from=home&lng=120.086264&lat=30.336458&sid=a6f666be46f1b6c3354e103b7e2fe3dw&un_area=15_1213_1214_52672'
        },
        'body': post_body
    }
}
function taskGetUrl(func_name,ck,vendorid){
    return {
        "url": `${JD_API_HOST}/client.action?appid=jd_shop_member&functionId=${func_name}&body={"venderId":${vendorid},"shopId":${vendorid},"bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":4202}&client=H5&clientVersion=9.2.0`,
        "headers": {
            "Accept": "*/*",
            "Content-Type": "text/plain; Charset=UTF-8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-us",
            "Origin": "https://api.m.jd.com",
            "Cookie": ck,
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
        },
    };
}
async function WThelp(){
    for(let i=0;i<cookiesArr.length;i++){
        if(cookiesArr[i]){
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            await TotalBean();
            if(!$.isLogin) continue;
            $.log(`---第${$.index}个京东帐号----${$.UserName}---开始助力`);
            await WTconfig();
            for(let j=0;j<shareCodesArr.length;j++){
                if(shareCodesArr[j]){
                    shareCode=shareCodesArr[j];
                    $.log(`${$.UserName}去助力${shareCode}`);
                    let data = await WT_collectScore_help(shareCode);
                    $.log(data.data.bizMsg);
                }
            }
        }
    }
}
function WT_collectScore_help(invitecode) {
    return new Promise((resolve) => {
        let ssbody = {
            'extraData':{
                'log':'',
                'sceneid':'HYGJZYh5',
            },
            'secretp':secretp,
            'random':randomString(8)
        }
        let body = {
            'inviteId':invitecode,
            'ss':JSON.stringify(ssbody)
        }
        $.post(taskPostUrl('travel_collectScore',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
async function WorldTravel() {
    await WT_homedata();
    let ishuobao = await WT_sign();
    if(ishuobao){
        $.log(`---第${$.index}个京东帐号----${$.UserName}---疑似火爆 跳出`);
        return ;
    }
    await WT_autoscore();
    await WT_tasklist();
    let isc;
    do{
        isc = await WT_raise();
    }while(isc)
}

function WT_collectScore(tk, taskid) {
    return new Promise((resolve) => {
        let ssbody = {
            'extraData':{
                'log':'',
                'sceneid':'HYGJZYh5',
            },
            'secretp':secretp,
            'random':randomString(8)
        }
        let body = {
            'actionType':1,
            'taskId':taskid.toString(),
            'taskToken':tk,
            'ss':JSON.stringify(ssbody)
        }
        $.post(taskPostUrl('travel_collectScore',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function WT_getFeedDetail(tid) {
    return new Promise(((resolve, reject) => {
        let body = {
            'taskId':tid.toString(),
        }
        $.post(taskPostUrl('travel_getFeedDetail',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    }))
}


async function watchstore(shop, wait_duration, taskid,tasktype,taskToken) { // wait_duration second
    if (shop.status !== 1) return;
    console.log('去做任务 ', shop.title||shop.shopName);
    let tk = shop.taskToken;
    let tdata = await WT_collectScore(tk, taskid);
    let time_require = [7,9];
    if (tdata.data.bizCode === 0) {
        if(time_require.includes(tasktype)){
        await $.wait(wait_duration * 1000);
        await new Promise((resolve) => {
            let body = {
                dataSource: 'newshortAward',
                method: 'getTaskAward',
                reqParams: `{"taskToken":"${taskToken}"`,
                sdkVersion: '1.0.0',
                clientLanguage: 'zh',
                onlyTimeId: Date.now(),
                riskParam: {
                    platform: '3',
                    orgType: '2',
                    openId: '-1',
                    pageClickKey: 'Babel_VKCoupon',
                    eid: 'eidI0119812268s7lQgdgky6Q6SwDzeNuQc/fZUIHu3IyGLzhl97To2P8uFl1Olh0BBiLGpwQ6J6b3Bgve2kQlZitxGWrPVaWXi8uEG1JzBbEar57RBh',
                    fp: '-1',
                    shshshfp: '4be7fae3fdf170486576893e49774fbc',
                    shshshfpa: 'f7393e21-e63d-85dd-bb61-b0aab597934a-1564803139',
                    shshshfpb: 'xODpmL9k2PRyMPt2/OUNIfQ==',
                    childActivityUrl: 'https%3A%2F%2Fprodev.m.jd.com%2Fmall%2Factive%2F24fcnjmXen4Tj9NPwV57vYwu9Lia%2Findex.html%3FcomponentId%3De623ae1275ae4d1da40329ba4868761f%26tttparams%3DiTAIieyJncHNfYXJlYSI6IjE1XzEyMTNfMTIxNF81MDE0MiIsInByc3RhdGUiOiIwIiwidW5fYXJlYSI6IjE1XzEyMTNfMTIxNF81MjY3MiIsIm1vZGVsIjoiaVBob25lOSwxIiwiZ0xhdCI6IjMwLjMzNjgyNiIsImdMbmciOiIxMjAuMDg2MTEzIiwibG5nIjoiMTIwLjA4NjMwNiIsImxhdCI6IjMwLjMzNjQ1Ni5J9%26taskParam%3D%257B%2522biz%2522%253A%2522babel%2522%252C%2522taskToken%2522%253A%2522P225KkcRRcd9FOGdUj0k_UKdQFjRWn6u7yx4LC2D52HpOlnhNw8c%2522%257D%26lng%3D120.086306%26lat%3D30.336456%26sid%3Db47968e6e1741eb84c22f1b250e94d8w%26un_area%3D15_1213_1214_52672',
                    userArea: '-1',
                    client: '',
                    clientVersion: '',
                    uuid: '',
                    osVersion: '',
                    brand: '',
                    model: '',
                    networkType: '',
                    jda: '-1'
                }
            }

            $.post(taskPostUrl2('qryViewkitCallbackResult',cookie,body), (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        data = JSON.parse(data);
                        if (data.code === "0") {
                            console.log(data.refreshKey[0].value, '\n');
                        } else {
                            $.log('watchstore call fail\n', data.msg);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve();
                }
            })
        })}
        else{
            $.log(tdata.data.bizMsg);
        }
    }
    else {
        $.log(tdata.data.bizMsg);
    }
}

function bindWithVendor(vendorid) {
    return new Promise(((resolve, reject) => {
        $.get(taskGetUrl('bindWithVendor',cookie,vendorid), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    }))
}

function followShop(shopid){
    return new Promise(((resolve, reject) => {

        let body = {
            'shopId':shopid.toString(),
            'follow':true,
            'type':'0'
        }
        $.post(taskPostUrl('followShop',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    }))
}
function WT_getBAdgeAward(tk){
    return new Promise(((resolve, reject) => {
        let body = {
            'awardToken':tk
        }
        $.post(taskPostUrl('travel_getBadgeAward',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                }
                data = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    }))
}
function WT_tasklist() {
    return new Promise((resolve) => {
        let body ={};
        $.post(taskPostUrl('travel_getTaskDetail',cookie,body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0 && data.data.bizCode === 0) {
                        shareCode = data.data.result.inviteId;
                        $.log($.UserName, '邀请码是', shareCode);
                        shareCodesArr.push(shareCode);
                        let tasklist = data.data.result.taskVos;
                        for (let i = 0; i < tasklist.length; i++) {
                            await WT_autoscore();
                            let task = tasklist[i];
                            if (task.status === 2) continue;
                            $.log(`${task.subTitleName} 开始 ; TaskType: ${task.taskType}`);
                            if (task.taskType === 14) {

                            }
                            else if([0].includes(task.taskType) ){
                                let simple = task.simpleRecordInfoVo;
                                let wait_d = task.waitDuration;
                                let tid = task.taskId.toString();
                                let tk = simple.taskToken;
                                let max_times = task.maxTimes?task.maxTimes:1,times = task.times?task.times:0;
                                let try_times = (max_times-times)*3;
                                for(let k=0;k<try_times;k++) {
                                    let res = await WT_collectScore(tk, tid);
                                    if (res.data.bizCode === 0) times++;
                                    else $.log(res.data.bizMsg);
                                    await $.wait(10000);
                                    if(times===max_times) break;
                                }
                                if(times===max_times) $.log(`${task.subTitleName}成功`);
                                else $.log(`${task.subTitleName}失败`);
                            }
                            else if (task.taskType === 7) {
                                let brs = task.browseShopVo;
                                let wait_d = task.waitDuration;
                                let tid = task.taskId.toString();
                                for (let i = 0; i < brs.length; i++) {
                                    let br = brs[i];
                                    if (br.status !== 1) continue;
                                    let shopid=br.shopId;
                                    let res = await followShop(shopid);
                                    if(res.code!=='0') continue;
                                    //$.log(res.msg);
                                    watchstore(br, wait_d, tid,task.taskType,br.taskToken).then(r => {
                                    });
                                    await $.wait(10000);
                                }
                            } else if ([9,26].includes(task.taskType) ) {
                                let shops = task.shoppingActivityVos;
                                let wait_d = task.waitDuration;
                                let tid = task.taskId.toString();
                                for (let i = 0; i < shops.length; i++) {
                                    let shop = shops[i];
                                    if (shop.status !== 1) continue;
                                    watchstore(shop, wait_d, tid,task.taskType,shop.taskToken).then(r => {
                                    });
                                    await $.wait(10000);
                                }
                            } else if (task.taskType === 2) {
                                let tid = task.taskId.toString();
                                let res = await WT_getFeedDetail(tid);
                                if (res.code === 0) {
                                    res = res.data.result.addProductVos[0];
                                    let max_times = res.maxTimes, times = res.times;
                                    let try_times = (max_times - times) * 3;
                                    for (let k = 0; k < try_times; ++k) {
                                        if(k>=res.productInfoVos.length) continue;
                                        if (res.productInfoVos[k].status !== 1) continue;
                                        let tk = res.productInfoVos[k].taskToken;
                                        let tdata = await WT_collectScore(tk, tid);
                                        if (tdata.data.bizCode === 0) times++;
                                        if (times === max_times) break;
                                        await $.wait(4000);
                                    }
                                    console.log(task.subTitleName, `加购成功${times}次`);
                                }
                            }else if (task.taskType === 5) {
                                    let tid = task.taskId.toString();
                                    let res = await WT_getFeedDetail(tid);
                                    if (res.code === 0) {
                                        res = res.data.result.taskVos[0];
                                        let max_times = res.maxTimes, times = res.times;
                                        let try_times = (max_times - times) * 3;
                                        for (let k = 0; k < try_times; ++k) {
                                            if(k>=res.browseShopVo.length) continue;
                                            if (res.browseShopVo[k].status !== 1) continue;
                                            let tk = res.browseShopVo[k].taskToken;
                                            let tdata = await WT_collectScore(tk, tid);
                                            if (tdata.data.bizCode === 0) times++;
                                            if (times === max_times) break;
                                            await $.wait(10000);
                                        }
                                        console.log(task.subTitleName, `浏览成功${times}次`);
                                    }
                                } else if (task.taskType === 21) {
                                let tid = task.taskId.toString();
                                for (let k = 0; k < task.brandMemberVos.length; k++) {
                                    if(task.brandMemberVos[k].status!==1) continue;
                                    await $.wait(10000);
                                    let vendorid = task.brandMemberVos[k].vendorIds,
                                        tk = task.brandMemberVos[k].taskToken;
                                    let resp = await bindWithVendor(vendorid);
                                    if (resp.code !== 0) continue;
                                    console.log(task.brandMemberVos[k].title);
                                    let res = await WT_collectScore(tk, tid);
                                    console.log(res.data.bizMsg);
                                }
                            }else if(task.taskType===3){
                                let shops = task.shoppingActivityVos;
                                let tid = task.taskId.toString();
                                for (let i = 0; i < shops.length; i++) {
                                    let shop = shops[i];
                                    if (shop.status !== 1) continue;
                                    let res = await WT_collectScore(shop.taskToken,tid);
                                    if(res.data.bizCode===0)
                                        $.log(res.data.result.successToast||res.data.bizMsg);
                                    else $.log(res.data.bizMsg);
                                    await $.wait(10000);
                                }
                            }
                        }
                        let lotterylist = data.data.result.lotteryTaskVos[0].badgeAwardVos;
                        for(let i=0;i<lotterylist.length;i++){
                            let lottery = lotterylist[i];
                            if(lottery.status!==3) continue;
                            let tk = lottery.awardToken;
                            let resp = await WT_getBAdgeAward(tk);
                            if(data.data.bizCode===0){
                                $.log(lottery.awardName);
                                $.log(`获取宝箱成功!`);
                            }else $.log(data.data.bizMsg);
                        }
                    } else {
                        if (data.code === 0) $.log(data.data.bizMsg);
                        else $.log(data.msg);
                        $.log('WT_tasklist call fail\n');
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

// ---------
function WT_autoscore() {
    return new Promise((resolve => {
        let ssbody = {
            'extraData':{
                'log':'',
                'sceneid':'HYGJZYh5',
            },
            'secretp':secretp,
            'random':randomString(8)
        }
        let body = {
            'ss':JSON.stringify(ssbody)
        }
        $.post(taskPostUrl('travel_collectAtuoScore',cookie,body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        if(data.data.bizCode===0)
                            $.log($.UserName, `收集${data.data.result.produceScore}汪汪币`);
                        else $.log(data.data.bizMsg);
                    } else {
                        //$.log(data);
                        $.log('WT_autoscore call fail\n', data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                await $.wait(5000);
                resolve();
            }
        })
    }))
}
function WT_raise(){
    return new Promise((resolve, reject) => {
        let ssbody = {
            'extraData':{
                'log':'',
                'sceneid':'HYGJZYh5',
            },
            'secretp':secretp,
            'random':randomString(8)
        }
        let body = {
            'ss':JSON.stringify(ssbody)
        }
        $.post(taskPostUrl('travel_raise',cookie,body),(err,resp,data)=>{
            let suc=false;
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);

                    if (data.code === 0) {
                        $.log("开始前往下一站");
                        if(data.data.bizCode===0){
                            $.log("前往成功 ");
                            $.log(`奖励${data.data.result.levelUpAward.awardCoins}汪汪币`);
                            suc=true;
                        }else{
                            $.log("前往失败");
                        }
                    } else {
                        $.log('WT_raise call fail\n', data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(suc);
            }
        })
    })

}
function WT_sign(){
    return new Promise((resolve, reject) => {
        let ishuobao=false;
        let ssbody = {
            'extraData':{
                'log':'',
                'sceneid':'HYGJZYh5',
            },
            'secretp':secretp,
            'random':randomString(8)
        }
        let body = {
            'ss':JSON.stringify(ssbody)
        }
        $.post(taskPostUrl('travel_sign',cookie,body),(err,resp,data)=>{
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);

                    if (data.code === 0) {
                        $.log("开始前往下一站");
                        if(data.data.bizCode===0){
                            $.log("签到成功 ");
                        }else{
                            if(data.data.bizCode===-1002) ishuobao=true;
                            $.log("签到失败",data.data.bizMsg);
                        }
                    } else {
                        $.log('WT_sign call fail\n', data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(ishuobao);
            }
        })
    })
}
function WT_homedata() {
    return new Promise((resolve) => {
        let body={};
        $.post(taskPostUrl('travel_getHomeData',cookie,body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);

                    if (data.code === 0 && data.data && data.data.bizCode ===0) {
                        secretp = data.data.result.homeMainInfo.secretp;
                        console.log($.UserName, `位于第${data.data.result.homeMainInfo.curCity}个城市`);
                        console.log($.UserName, `剩余${data.data.result.homeMainInfo.raiseInfo.remainScore}汪汪币`);

                    } else {
                        $.log('WT_homedata call fail\n', data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}




function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}