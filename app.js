const
    express = require('express'),
    http = require('./http'),
    schedule = require('node-schedule'),
    wechat = require('./wechat/wechat'),
    user = require('./wechat/user'),
    token = require('./wechat/token'),
    msg = require('./wechat/msg');
       
var app = express();

var wechatApp = new wechat();

//用于处理所有进入 3000 端口 get 的连接请求
app.get('/',function(req,res){
    wechatApp.auth(req,res);
});

//用于处理所有进入 3000 端口 post 的连接请求
app.post('/',function(req,res){
    wechatApp.handleMsg(req,res);
});

// 維持Heroku不Sleep
setInterval(function () {
    http.requestHttpGet("http://cpcwechatbot.herokuapp.com");
    var msg_data = JSON.parse(JSON.stringify('{"touser": "' + process.env.adminId + '", "msgtype": "text", "agentid": ' + process.env.agentId + ', "text" : { "content": "APP alive" }, "safe": 0}'));
    token.getAccessToken("agent", process.env.agentSecret).then(function (data) {
        msg.postMsg(data, msg_data);
    });
}, 1500000); // every 25 minutes (1500000)

// 因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 443, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

// 發訊息排程 1次/30sec (每分鐘的5秒及35秒)
var job = schedule.scheduleJob('5,35 * * * * *', function ()
{
    var urlGetMsg = process.env.API_weChatRestful;
    http.requestHttpGet(urlGetMsg).then(function (data)
    {
        if (data.length < 3)
        {
            console.log('No messages need to be sent.');
        }
        else
        {
            try
            {
                var jdata = JSON.parse(data);
                jdata.forEach(function (row)
                {
                    var message_id = row.message_id;
                    var user_id = row.user_id;
                    var message = row.message;
                    try
                    {
                        var msg_data = JSON.parse(JSON.stringify('{"touser": "' + user_id + '", "msgtype": "text", "agentid": ' + process.env.agentId + ', "text" : { "content": "' + message + '" }, "safe": 0}'));
                        console.log("msg_data=" + JSON.stringify(msg_data));
                        token.getAccessToken("agent", process.env.agentSecret).then(function (data)
                        {
                            msg.postMsg(data, msg_data).then(function (result)
                            {
                                if (result.errcode == "0")
                                {
                                    var url = process.env.API_weChatRestful + '?strMessageId=' + message_id;
                                    http.requestHttpPut(url, "").then(function (data)
                                    {
                                        console.log(data);
                                    });
                                }
                                else
                                {
                                    console.log("Send message error, errcode=" + result.errcode);
                                }
                            });
                        });
                    }
                    catch (e)
                    {
                        return console.log(e);
                    }
                });
            }
            catch (e)
            {
                return console.log(e);
            }
        }
    });

});

// 建立成員排程 1次/10min
var job = schedule.scheduleJob('0 0,10,20,30,40,50 * * * *', function ()
{
    var url = process.env.API_weChatRestful + '/WechatUserAuth'
    http.requestHttpGet(url).then(function (data)
    {
        if (data.length < 3)
        {
            console.log('No user need to be created.');
        }
        else
        {
            try
            {
                var jdata = JSON.parse(data);
                jdata.forEach(function (row)
                {
                    var user_id = row.user_id;
                    var user_info = row.user_info;
                    console.log('Creating user ' + user_id);
                    try
                    {
                        token.getAccessToken("directory", process.env.directorySecret).then(function (data)
                        {
                            user.createUser(data, user_info).then(function (result)
                            {
                                var result = JSON.parse(data);
                                if (result.errcode == "0") {
                                    var userAuth = JSON.parse(JSON.stringify('{"user_id": "' + user_id + '", "status": "ES"}'));
                                    user.updateUserStatus(userAuth).then(function (data) {
                                        console.log("Create user success:" + user_id);
                                    });
                                }
                                else
                                {
                                    console.log("Create user error, user_id = " + user_id + ",errcode=" + result.errcode);
                                }
                            });
                        });
                    }
                    catch (e) {
                        return console.log(e);
                    }
                });
            }
            catch (e) {
                return console.log(e);
            }
        }
    });
});

