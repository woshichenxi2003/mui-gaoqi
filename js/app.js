/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
    /**
     * 用户登录
     **/
    owner.login = function(loginInfo, callback) {
        callback = callback || $.noop;
        loginInfo = loginInfo || {};
        loginInfo.mobile = loginInfo.mobile || '';
        loginInfo.password = loginInfo.password || '';
        /************************************************************************/
        /*加入手机信息                                                           */
        /************************************************************************/
        loginInfo.device = plus.device.vendor || ''; //生产厂家
        loginInfo.model = plus.device.model || ''; //设备名称
        loginInfo.screen = plus.screen.resolutionWidth + ',' + plus.screen.resolutionHeight || ''; //分辨率
        loginInfo.sys = plus.os.name || ''; //系统类型
        loginInfo.version = plus.os.version || ''; //系统版本
        loginInfo.no = plus.device.uuid || ''; //设备id
        /************************************************************************/
        /*验证否为手机号为空                             */
        /************************************************************************/
        var phonereg = /^$/;
        if (phonereg.test(loginInfo.mobile)) {
            return callback('请输入手机号码');
        }
        /************************************************************************/
        /*验证密码不为空                            */
        /************************************************************************/
        var passwordreg = /^$/;
        if (passwordreg.test(loginInfo.password)) {
            return callback('请输入密码');
        }
        /************************************************************************/
        /*验证完成后发送ajax请求                              */
        /************************************************************************/
        //用户已经登录过如token没有过期直接进入首页，不在向服务器发送信息验证	
        mui.post('https://api.gaoqi.cespc.com:9378/user/login', loginInfo, function(data) {
            if (data.ret == 1) {
                loginInfo.ticket = data.ticket;
                loginInfo.expire_timestamp = data.expire_timestamp;
                loginInfo.user = data.user;
                owner.setState(loginInfo);
                console.log(JSON.stringify(owner.getState()));
                console.log('与后台交互了');
                return callback();
            } else {
                callback(data.err)
            }
        }, 'json');

    };

    // owner.createState = function(obj, callback) {
    //     var state = owner.getState();
    //     state.account = name;
    //     state.token = "token123456789";
    //     owner.setState(state);
    //     return callback();
    // };

    /**
     * 新用户注册
     **/
    owner.reg = function(regInfo, callback) {
        callback = callback || $.noop;
        regInfo = regInfo || {};
        regInfo.account = regInfo.account || '';
        regInfo.password = regInfo.password || '';
        if (regInfo.account.length < 5) {
            return callback('用户名最短需要 5 个字符');
        }
        if (regInfo.password.length < 6) {
            return callback('密码最短需要 6 个字符');
        }
        if (!checkEmail(regInfo.email)) {
            return callback('邮箱地址不合法');
        }
        var users = JSON.parse(localStorage.getItem('$users') || '[]');
        users.push(regInfo);
        localStorage.setItem('$users', JSON.stringify(users));
        return callback();
    };

    /**
     * 获取当前状态获得用户名
     **/
    owner.getState = function() {
        var stateText = localStorage.getItem('$state') || "{}";
        return JSON.parse(stateText);
    };


    /**
     * 设置当前状态
     **/
    owner.setState = function(state) {
        var state = state || {};
        localStorage.setItem('$state', JSON.stringify(state));
        //var settings = owner.getSettings();
        //settings.gestures = '';
        //owner.setSettings(settings);
    };

    var checkEmail = function(email) {
        email = email || '';
        return (email.length > 3 && email.indexOf('@') > -1);
    };

    /**
     * 找回密码
     **/
    owner.forgetPassword = function(email, callback) {
        callback = callback || $.noop;
        if (!checkEmail(email)) {
            return callback('邮箱地址不合法');
        }
        return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
    };

    /**
     * 设置应用本地配置
     **/
    owner.setSettings = function(settings) {
        settings = settings || {};
        localStorage.setItem('$settings', JSON.stringify(settings));
    }

    /**
     * 获得应用本地配置
     **/
    owner.getSettings = function() {
            var settingsText = localStorage.getItem('$settings') || "{}";
            return JSON.parse(settingsText);
        }
        /**
         * 获取本地是否安装客户端
         **/
    owner.isInstalled = function(id) {
            if (id === 'qihoo' && mui.os.plus) {
                return true;
            }
            if (mui.os.android) {
                var main = plus.android.runtimeMainActivity();
                var packageManager = main.getPackageManager();
                var PackageManager = plus.android.importClass(packageManager)
                var packageName = {
                    "qq": "com.tencent.mobileqq",
                    "weixin": "com.tencent.mm",
                    "sinaweibo": "com.sina.weibo"
                }
                try {
                    return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
                } catch (e) {}
            } else {
                switch (id) {
                    case "qq":
                        var TencentOAuth = plus.ios.import("TencentOAuth");
                        return TencentOAuth.iphoneQQInstalled();
                    case "weixin":
                        var WXApi = plus.ios.import("WXApi");
                        return WXApi.isWXAppInstalled()
                    case "sinaweibo":
                        var SinaAPI = plus.ios.import("WeiboSDK");
                        return SinaAPI.isWeiboAppInstalled()
                    default:
                        break;
                }
            }
        }
        /************************************************************************/
        /*生成验证码                                                             */
        /************************************************************************/
    owner.getCode = function(phonenum, callback) {
        var url = "http://api.gaoqi.cespc.com:9378/user/register/sendsms";
        mui.post(url, {
            "mobile": phonenum
        }, function(data) {
            console.log(JSON.stringify(data));
        }, 'json');
    }
}(mui, window.app = {}));
