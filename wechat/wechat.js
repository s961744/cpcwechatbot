'use strict' // 嚴謹模式

const
    crypto = require('crypto'), // 加密模組
    WXBizMsgCrypt = require('wechat-crypto'), // 微信Token解密
    http = require('./../http'),
    util = require('util'), // util 工具模組
    fs = require('fs'), // file system
    parseString = require('xml2js').parseString, // xml轉js模組
    accessTokenJson = require('./access_token'), // access_token.json
    menus = require('./menus'), // 微信選單
    msg = require('./msg'),// 訊息處理
    user = require('./user'),// 成員處理
    media = require('./media'),// 影像處理
    token = require('./token'),//Token處理
    CryptoGraphy = require('./cryptoGraphy'); // 微信消息加解密模組

/**
 * 构建 WeChat 对象 即 js中 函数就是对象
 */
var WeChat = function(){
    //token
    this.token = process.env.token;
    //corpId
    this.corpId = process.env.corpId;
    //應用Serret
    this.agentSecret = process.env.agentSecret;
    //通訊錄Secret
    this.directorySecret = process.env.directorySecret;
    //管理員UserId
    this.adminId = process.env.adminId;
}

/**
 * 微信接口驗證
 * @param {Request} req Request 對象
 * @param {Response} res Response 對象
 */
WeChat.prototype.auth = function(req,res){
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var cryptor = new WXBizMsgCrypt(process.env.token, process.env.encodingAESKey, process.env.corpId)
    var s = cryptor.decrypt(echostr);
    res.send(s.message);
    console.log("s.message=" + s.message);
}

/**
 * 取得access_token
 * @param {String} secretType secret類型
 * @param {String} secret secret
 */
WeChat.prototype.getAccessToken = function (secretType,secret){
    return new Promise(function(resolve,reject){
        // 目前時間
        var currentTime = new Date().getTime();
        // 格式化URL
        var url = util.format(process.env.API_getAccessToken, process.env.corpId, secret);
        // 判斷accessToken是否還有效
        // 已過期時重取
        //console.log("url=" + url + ",secretType=" + secretType);
        switch (secretType) {
            case 'directory':
                if (accessTokenJson.directory.access_token === "" || accessTokenJson.directory.expires_time < currentTime) {
                    http.requestGet(url).then(function (data) {
                        var result = JSON.parse(data);
                        if (result.errcode == "0") {
                            accessTokenJson.directory.access_token = result.access_token;
                            accessTokenJson.directory.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                            // 更新 accessToken.json
                            fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));
                            console.log("update " + secretType + " accessToken:" + JSON.stringify(accessTokenJson.directory));
                            // return access_token 
                            resolve(accessTokenJson.directory.access_token);
                        } else {
                            // return error msg
                            resolve(result);
                        }
                    });
                    //尚未過期，直接返回    
                } else {
                    resolve(accessTokenJson.directory.access_token);
                }
                break;
            case 'agent':
                if (accessTokenJson.agent.access_token === "" || accessTokenJson.agent.expires_time < currentTime) {
                    that.requestGet(url).then(function (data) {
                        var result = JSON.parse(data);
                        if (result.errcode == "0") {
                            accessTokenJson.agent.access_token = result.access_token;
                            accessTokenJson.agent.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                            // 更新 accessToken.json
                            fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));
                            console.log("update " + secretType + " accessToken:" + JSON.stringify(accessTokenJson.agent));
                            // return access_token 
                            resolve(accessTokenJson.agent.access_token);
                        } else {
                            // return error msg
                            resolve(result);
                        }
                    });
                //尚未過期，直接返回    
                } else {
                    resolve(accessTokenJson.agent.access_token);
                }
                break;
            default:
                
                break;
        }
    });
}

/**
 * 微信訊息接收處理
 * @param {Request} req Request
 * @param {Response} res Response
 */
WeChat.prototype.handleMsg = function (req, res) {
    var buffer = [];
    var cryptoGraphy = new CryptoGraphy(req);

    //接收資料
    req.on('data', function (data) {
        buffer.push(data);
    });
    //處理接收完成的資料
    req.on('end', function () {
        var msgXml = Buffer.concat(buffer).toString('utf-8');

        //解析xml
        parseString(msgXml, { explicitArray: false }, function (err, result) {
            //console.log("result=" + JSON.stringify(result));
            if (!err) {
                result = result.xml;
                //消息解密
                result = cryptoGraphy.decryptMsg(result.Encrypt);
                var toUser = result.ToUserName; //接收方
                var fromUser = result.FromUserName;//發送方
                var reportMsg = "";

                //判斷訊息類型
                //事件
                if (result.MsgType.toLowerCase() === "event") {
                    //判斷事件類型
                    switch (result.Event.toLowerCase()) {
                        //成員加入
                        case 'subscribe':
                            var content = "您好，敬鵬微信推播Bot歡迎您";
                            reportMsg = msg.txtMsg(fromUser, toUser, content);
                            //回復訊息加密
                            reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                            //返回给微信伺服器
                            res.send(reportMsg);
                            break;
                        //選單按鈕
                        case 'click':
                            var contentArr = [
                                { Title: "Node.js 微信自定义菜单", Description: "使用Node.js实现自定义微信菜单", PicUrl: "http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72868520" },
                                { Title: "Node.js access_token的获取、存储及更新", Description: "Node.js access_token的获取、存储及更新", PicUrl: "http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72783631" },
                                { Title: "Node.js 接入微信公众平台开发", Description: "Node.js 接入微信公众平台开发", PicUrl: "http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72765279" }
                            ];
                            reportMsg = msg.graphicMsg(fromUser, toUser, contentArr);
                            //回復訊息加密
                            reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                            //返回给微信伺服器
                            //res.send(reportMsg);
                            break;
                        
                    }
                }
                //文字
                else if (result.MsgType.toLowerCase() === "text") {
                    //根據使用者輸入訊息回傳值
                    switch (result.Content) {
                        case '文字':
                            var content = "Echo:" + result.Content;
                            reportMsg = msg.txtMsg(fromUser, toUser, content);
                            //回復訊息加密
                            reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                            //返回给微信伺服器
                            res.send(reportMsg);
                            break;
                        case '管理員':
                            token.getAccessToken("directory", process.env.directorySecret).then(function (data) {
                                user.getUser(data, "A0012272").then(function (content) {
                                    console.log(content);
                                    reportMsg = msg.txtMsg(fromUser, toUser, content);
                                    //回復訊息加密
                                    reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                                    //返回给微信伺服器
                                    res.send(reportMsg);
                                });
                            });
                            break;
                        case '圖文選單':
                            var contentArr = [
                                { Title: "Node.js 微信自定义菜单", Description: "使用Node.js实现自定义微信菜单", PicUrl: "http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72868520" },
                                { Title: "Node.js access_token的获取、存储及更新", Description: "Node.js access_token的获取、存储及更新", PicUrl: "http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72783631" },
                                { Title: "Node.js 接入微信公众平台开发", Description: "Node.js 接入微信公众平台开发", PicUrl: "http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast", Url: "http://blog.csdn.net/hvkcoder/article/details/72765279" }
                            ];
                            reportMsg = msg.graphicMsg(fromUser, toUser, contentArr);
                            //回復訊息加密
                            reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                            //返回给微信伺服器
                            res.send(reportMsg);
                            break;
                        default:
                            var content = "無此指令!\n";
                            content += "請輸入正確指令或洽台灣資訊處(#1409)";;
                            reportMsg = msg.txtMsg(fromUser, toUser, content);
                            //回復訊息加密
                            reportMsg = cryptoGraphy.encryptMsg(reportMsg);
                            //返回给微信伺服器
                            res.send(reportMsg);
                            break;
                    }
                }
                //圖片
                else if (result.MsgType.toLowerCase() === "image") {
                    //圖片上傳歸檔
                    var mediaId = result.MediaId;
                    console.log("mediaId=" + mediaId);
                    media.getMediaContent(mediaId).then(function (data) {
                        media.uploadMediaContent(data);
                    });
                }
            } else {
                //打印错误
                console.log(err);
            }
        });
    });
}

//暴露可供外部访问的接口
module.exports = WeChat;