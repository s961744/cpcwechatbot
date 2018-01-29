'use strict' // 嚴謹模式

const http = require('./../http');

/**
 * 回復文字訊息
 * @param {String} toUser 接收端
 * @param {String} fromUser 發送端
 * @param {String}  content 訊息內容
 */
exports.txtMsg = function(toUser,fromUser,content){
    var xmlContent =  "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
        xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
        xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
        xmlContent += "<MsgType><![CDATA[text]]></MsgType>";
        xmlContent += "<Content><![CDATA["+ content +"]]></Content></xml>";
    return xmlContent;
}

/**
 * 回復圖文訊息
 * @param {String} toUser 接收端
 * @param {String} fromUser 發送端
 * @param {Array}  contentArr 訊息內容
 */
exports.graphicMsg = function(toUser,fromUser,contentArr){
     var xmlContent =  "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
        xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
        xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
        xmlContent += "<MsgType><![CDATA[news]]></MsgType>";
        xmlContent += "<ArticleCount>"+contentArr.length+"</ArticleCount>";
        xmlContent += "<Articles>";
        contentArr.map(function(item,index){
            xmlContent+="<item>";
            xmlContent+="<Title><![CDATA["+ item.Title +"]]></Title>";
            xmlContent+="<Description><![CDATA["+ item.Description +"]]></Description>";
            xmlContent+="<PicUrl><![CDATA["+ item.PicUrl +"]]></PicUrl>";
            xmlContent+="<Url><![CDATA["+ item.Url +"]]></Url>";
            xmlContent+="</item>";
        });
        xmlContent += "</Articles></xml>";
    return xmlContent;
}

/**
* 取得待發消息
* @param {String} access_token
* @param {JSON} data 
*/
exports.getMsg = function (access_token, msg_data) {
    return new Promise(function (resolve, reject) {
        var url = process.env.API_weChatRestful;
        //console.log("url=" + url);
        http.requestHttpGet(url).then(function (data) {
            //console.log("requestGetdata=" + data);
            var result = JSON.parse(data);
            //
            if (result.errcode == "0") {
                console.log(JSON.stringify(result));
                resolve(result);
            } else {
                // return error msg
                console.log("Get message error:" + result);
                resolve(result);
            }
        });
    });
}

/**
* 消息發送
* @param {String} access_token
* @param {JSON} data 
*/
exports.postMsg = function (access_token, msg_data) {
    return new Promise(function (resolve, reject) {
        var url = util.format(process.env.API_postMessage, accessToken);
        //console.log("url=" + url);
        http.requestHttpsPost(url, msg_data).then(function (data) {
            //console.log("requestGetdata=" + data);
            var result = JSON.parse(data);
            //
            if (result.errcode == "0") {
                console.log(JSON.stringify(result));
                resolve(result);
            } else {
                // return error msg
                console.log("Post message error, errcode=" + result.errcode);
                resolve(result);
            }
        });
    });
}

