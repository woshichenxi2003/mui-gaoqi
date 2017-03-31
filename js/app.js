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
        /*验证手机号不为空                             */
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
        mui.ajax('https://api.gaoqi.cespc.com:9378/user/login', {
            data: loginInfo,
            dataType: 'json', //服务器返回json格式数据
            type: 'post', //HTTP请求类型
            timeout: 10000, //超时时间设置为10秒；
            success: function(data) {
                if (data.ret == 1) {
                    var obj = {};
                    obj.ticket = data.ticket;
                    obj.expire_timestamp = data.expire_timestamp;
                    obj.user = data.user;
                    console.log(JSON.stringify(obj));
                    owner.setState(obj);//存入注册信息到本地
                    owner.setAllReginfo(obj); //将信息存贮到本地 防止未完善信息的用户进入 需完善信息时使用
                    // owner.setReginfo('ticket', obj.ticket); 
                    // owner.setReginfo('expire_timestamp', obj.expire_timestamp);
                    // owner.setReginfo('user', obj.user);
                    console.log('与后台交互了');
                    //这里需要添加如果用户的返回值是未完善跳转到完善信息页面
                    return callback();

                } else {
                    callback(data.err);
                }
            },
            error: function(xhr, type, errorThrown) {
                //异常处理；
                if (type == 'timeout') {
                    plus.nativeUI.toast('请求超时，请你检查您的网络');
                } else if (type == 'abort') {
                    plus.nativeUI.toast('请检查您的网络是否链接');
                } else if (type == 'timeout') {
                    plus.nativeUI.toast('服务器错误');
                }
                console.log(type);
            }
        });

    };




    /**
     * 新用户注册
     **/
    owner.reg = function(regInfo, callback) {
        callback = callback || $.noop;
        regInfo = regInfo || {};
        regInfo.mobile = regInfo.mobile || '';
        regInfo.password = regInfo.password || '';
        /************************************************************************/
        /*加入手机信息                                                           */
        /************************************************************************/
        regInfo.device = plus.device.vendor || ''; //生产厂家
        regInfo.model = plus.device.model || ''; //设备名称
        regInfo.screen = plus.screen.resolutionWidth + ',' + plus.screen.resolutionHeight || ''; //分辨率
        regInfo.sys = plus.os.name || ''; //系统类型
        regInfo.version = plus.os.version || ''; //系统版本
        regInfo.no = plus.device.uuid || ''; //设备id
        /************************************************************************/
        /*验证手机号不为空                              */
        /************************************************************************/
        var noNull = /^$/;
        if (noNull.test(regInfo.mobile)) {
            return callback('请输入手机号码');
        }
        /************************************************************************/
        /*验证密码不为空                              */
        /************************************************************************/
        if (noNull.test(regInfo.password)) {
            return callback('密码不能为空');
        }
        /************************************************************************/
        /*验证验证码不为空                              */
        /************************************************************************/
        if (noNull.test(regInfo.code)) {
            return callback('请输入验证码');
        }


        mui.ajax('https://api.gaoqi.cespc.com:9378/user/register', {
            data: regInfo,
            dataType: 'json', //服务器返回json格式数据
            type: 'post', //HTTP请求类型
            timeout: 10000, //超时时间设置为10秒；
            success: function(data) {
                if (data.ret == 1) {
                    console.log('注册提交成功');
                    // var obj = {}; 注册时不将用户信息存储在本地用户信息中 用户下次登录不会直接登录上次的信息
                    // obj.ticket = data.ticket;
                    // obj.expire_timestamp = data.expire_timestamp;
                    // obj.user = data.user;
                    // owner.setState(obj);
                    console.log(JSON.stringify(data));
                    owner.setReginfo('ticket', data.ticket);//将用户信息存贮到本地 下一步注册只用
                    owner.setReginfo('expire_timestamp', data.expire_timestamp);
                    owner.setReginfo('user', data.user);
                    console.log(JSON.stringify(owner.getReginfo()));
                    console.log('ticket user expire_timestamp 已经添加');
                    return callback();
                } else {
                    /*如果用户已经注册 用户返回登录页面*/
                    if (data.ret == '20204' || data.ret == 20204) {
                        return callback(data.ret);
                    }
                    callback(data.err);
                }
            },
            error: function(xhr, type, errorThrown) {
                //异常处理；
                if (type == 'timeout') {
                    plus.nativeUI.toast('请求超时，请你检查您的网络');
                } else if (type == 'abort') {
                    plus.nativeUI.toast('请检查您的网络是否链接');
                } else if (type == 'timeout') {
                    plus.nativeUI.toast('服务器错误');
                }
                console.log(type);
            }
        });
        //注册后如果返回值是20204 用户已经登录过 清空本地用户数据（避免进入登录页面后用户自动登录） 跳转登录页面 登录页面再判断用户是不是完善了喜欢游戏等个人的信息
    };

    /**
     * 验证用户个人信息
     **/
    owner.info = function(loginInfo, callback) {
        callback = callback || $.noop;
        loginInfo = loginInfo || {};
        /************************************************************************/
        /*验证昵称不能为空                                                        */
        /************************************************************************/
        var phonereg = /^$/;
        if (phonereg.test(loginInfo.nickname)) {
            return callback('请输入昵称');
        }

        /************************************************************************/
        /*验证性别不为空                            */
        /************************************************************************/
        var passwordreg = /^$/;
        if (passwordreg.test(loginInfo.gender)) {
            return callback('请选择性别');
        }
        /************************************************************************/
        /*验证所在地不为空                            */
        /************************************************************************/
        var passwordreg = /^$/;
        if (passwordreg.test(loginInfo.provinceid)) {
            return callback('请选择所在地域');
        }
        //存储用个人信息在本地，不发送ajax请求，待选择完游戏后一起发送
        owner.setAllReginfolin(loginInfo);//临时存贮信息，下一个选择游戏表单合并数据后后台提交信息之用
        return callback();
    };
    /************************************************************************/
    /*用户选择游戏项目完成注册                              */
    /************************************************************************/
    owner.selectgame = function(loginInfo, callback) {
            callback = callback || $.noop;
            loginInfo = loginInfo || {};
            /*验证用户至少选择了一个游戏项目*/
            if (loginInfo.games == '') {
                return callback('请选择您喜欢的游戏项目');
            };
            mui.ajax('https://api.gaoqi.cespc.com:9378/user/info/edit', {
                data: loginInfo,
                dataType: 'json', //服务器返回json格式数据
                type: 'post', //HTTP请求类型
                timeout: 10000, //超时时间设置为10秒；
                success: function(data) {
                    if (data.ret == 1) {                  
                        console.log('用户已经完善了用户信息，并提交信息成功');
                        var obj = owner.getReginfo();
                        obj.user = data.user;
                        console.log(JSON.stringify(data.user));
                        owner.setState(obj); //设置将用户信息存储在本地
                        console.log(JSON.stringify(owner.getReginfo()));
                        owner.setAllReginfo(null);//清空本地用户注册信息
                        console.log(JSON.stringify(owner.getState()));
                        return callback();
                    } else { 
                        callback(data.err);
                    }
                },
                error: function(xhr, type, errorThrown) {
                    //异常处理；
                    if (type == 'timeout') {
                        plus.nativeUI.toast('请求超时，请你检查您的网络');
                    } else if (type == 'abort') {
                        plus.nativeUI.toast('请检查您的网络是否链接');
                    } else if (type == 'timeout') {
                        plus.nativeUI.toast('服务器错误');
                    }
                    console.log(type);
                }
            })


        }
        /**
         * 获取当前登录信息
         **/
    owner.getState = function() {
        //var stateText = localStorage.getItem('$state') || "{}";
        var stateText = plus.storage.getItem('$state') || "{}";
        return JSON.parse(stateText);
    };


    /**
     * 存储当前的登录信息
     **/
    owner.setState = function(state) {
        var state = state || {};
        //localStorage.setItem('$state', JSON.stringify(state));
        plus.storage.setItem('$state', JSON.stringify(state));
    };

    /**
     * 获得注册信息
     **/

    owner.getReginfo = function() {
        var stateText = plus.storage.getItem('$reginfo') || "{}";
        return JSON.parse(stateText);
        //除了用户头像单独存储 其余都是存储在注册信息中 头像最后加入到注册信息中 发送给服务器。
    };


    /**
     * 逐条添加注册信息到本地
     **/
    owner.setReginfo = function(name, value) {
        var reginfo = owner.getReginfo() || {};
        reginfo[name] = value;
        plus.storage.setItem('$reginfo', JSON.stringify(reginfo));
    };
    /**
     * 一次性添加注册信息到本地
     **/
    owner.setAllReginfo = function(value) {
        var reginfo = value || {};
        plus.storage.setItem('$reginfo', JSON.stringify(reginfo));
    };



    /**
     * 获得info临时位置的值
     **/
    owner.getReginfolin = function() {
        var stateText = plus.storage.getItem('$reginfolin') || "{}";
        return JSON.parse(stateText);
        //除了用户头像单独存储 其余都是存储在注册信息中 头像最后加入到注册信息中 发送给服务器。
    };

    /**
     * 逐条添加注册信息到本地
     **/
    owner.setReginfolin = function(name, value) {
        var reginfo = owner.getReginfolin() || {};
        reginfo[name] = value;
        plus.storage.setItem('$reginfolin', JSON.stringify(reginfo));
    };
    /**
     * 将info的信息存贮到临时位置
     **/
    owner.setAllReginfolin = function(value) {
        var reginfo = value || {};
        plus.storage.setItem('$reginfolin', JSON.stringify(reginfo));
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
    owner.getverificationCode = function(phonenum, callback) {
        console.log('进入验证码发送程序');
        console.log(phonenum);
        mui.ajax('https://api.gaoqi.cespc.com:9378/user/register/sendsms', {
            data: {
                'mobile': phonenum
            },
            dataType: 'json', //服务器返回json格式数据
            type: 'post', //HTTP请求类型
            timeout: 10000, //超时时间设置为10秒；
            success: function(data) {
                if (data.ret == 1) {
                    console.log('验证码已发送到后台');
                    return callback();
                } else {
                    return callback(data.err);
                }
            },
            error: function(xhr, type, errorThrown) {
                //异常处理；
                if (type === 'timeout') {
                    plus.nativeUI.toast('请求超时，请你检查您的网络');
                } else if (type === 'abort') {
                    plus.nativeUI.toast('请检查您的网络是否链接');
                } else if (type === 'timeout') {
                    plus.nativeUI.toast('服务器错误');
                }
                console.log(type);
            }
        })
    }
}(mui, window.app = {}));



