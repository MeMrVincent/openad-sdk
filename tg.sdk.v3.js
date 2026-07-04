/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(doc, win) {
  win.openADJsSDK = {
    version: '3.6.1',
    build: '202503261746',
    hostURL: 'https://bf2055756e.api.openad.network',
    staticURL: 'https://protocol.openad.network/sdk/v3',
    resources: {},
    bridge: {
      init: async function(data){
        let { userInfo, adParams, adInfo } = data;
        if(!userInfo){
          userInfo = {};
        }
        if(!adParams){
          adParams = {};
        }
        let { zoneId, publisherId } = adInfo;
        let dom = doc.querySelector(`.openADJsSDKBanner[zoneId="${zoneId}"][publisherId="${publisherId}"]`);
        if(!dom){
          console.log('error', `can not find render dom .openADJsSDKBanner[zoneId="${zoneId}"][publisherId="${publisherId}"]`);
          return false;
        }
        let res = await this.get({ adParams, userInfo, adInfo }), RES;
        if(res.code === 0){
          RES = res.data;
          dom.innerHTML = `<a href="javascript:void(0);" style="display: block;" onclick="window.openADJsSDK.bridge.click({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })"><img src="${RES['resource_url']}" style="max-width: 100%;max-height: 100%;display: block;"></a>`;
        }else{
          console.log('error', res.msg);
          return false;
        }
        res = await this.log(adInfo);
        if(res.code === 0){
          console.log(res.msg);
        }else{
          console.log(res.msg);
        }
      },
      get: async function(data){
        return await win.openADJsSDK.functionSent.get(data);
      },
      log: async function(adInfo){
        return await win.openADJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.openADJsSDK.functionSent.click(adInfo);
      },
    },
    interactive: {
      dom: 'OpenAd_Protocol_Interactive_Ad',
      init: async function(data){
        let res = await win.openADJsSDK.functionSent.get({ ...data });
        return { code: res.code };
      },
      getRender: function(data){
        const { adInfo, cb } = data;
        const { zoneId, publisherId } = adInfo;
        let dom = doc.querySelector(`.${this.dom}[zoneId="${zoneId}"][publisherId="${publisherId}"]`);
        if(dom){
          dom.remove();
        }
        dom = document.createElement('div');
        dom.className = this.dom;
        dom.setAttribute('zoneId', zoneId);
        dom.setAttribute('publisherId', publisherId);
        document.body.appendChild(dom);
        let RES = win.openADJsSDK.resources[`${publisherId}_${zoneId}`], lan = RES.params.language, OS = RES.params.platform, isFullscreen = win.openADJsSDK.TG.isFullscreen;
        RES = RES ? RES.resource : null;
        if(RES){
          win.openADJsSDK.resources[`${publisherId}_${zoneId}`].cb = cb;
          cb.adResourceLoad && cb.adResourceLoad(true);
        }else{
          return false;
        }
        cb.adOpening && cb.adOpening(true);
        dom.innerHTML =
            `<div class="InteractiveAdActions ${ OS === 'IOS' && isFullscreen ? 'FullScreen': 'MainScreen' }">
                <div class="left clock">00:15</div>
                <div class="right close" onclick="window.openADJsSDK.interactive.cbClose({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })">
                    <img src="${window.openADJsSDK.staticURL}/close.png" alt="" />
                </div>`+
            '</div>'+
            `<div class="InteractiveAdContent" onclick="window.openADJsSDK.interactive.cbLog('click', { 'zoneId':${zoneId}, 'publisherId':${publisherId} })">`+
                '<div class="photo">'+
                    `<img src="${RES['resource_url']}" />`+
                '</div>'+
                '<div class="title">'+
                    `${RES['resource_text']}`+
                '</div>'+
                '<div class="desc">'+
                    `${RES['resource_desc']}`+
                '</div>'+
                '<div class="btn">GO</div>'+
            '</div>'+
            '<div class="InteractiveAdNotice">'+
                 '<div class="logo" onclick="window.openADJsSDK.functionSent.open({})">'+
                     `<img src="${window.openADJsSDK.staticURL}/logo.png" alt="" />`+
                 '</div>'+
                 `<div class="note">
                      ${lan === 'zh' ? '本頁麵爲廣告內容，請您跳转后谨慎甄別。' : 'This page contains advertising content. Please verify carefully after being redirected.'}
                 </div>`+
            '</div>';
        cb.adOpened && cb.adOpened(true);
        this.countDown(adInfo, cb);
      },
      log: async function (adInfo) {
        return await win.openADJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.openADJsSDK.functionSent.click(adInfo);
      },
      countDown: function (adInfo, cb){
        let countdownTime = 15;
        let countdownInterval = setInterval(async () => {
          let dom = doc.querySelector(`.${this.dom}[zoneId="${adInfo.zoneId}"][publisherId="${adInfo.publisherId}"]`), ele;
          if(dom){
            ele = dom.querySelector(`.${this.dom} .InteractiveAdActions .clock`);
          }
          if(ele && dom){
            ele.innerHTML = '00:'+(countdownTime < 10 ? '0': '')+countdownTime;
            if (countdownTime === 0) {
              clearInterval(countdownInterval);
              ele.innerHTML = '';
              await this.cbLog('viewAD', adInfo, cb);
            } else {
              countdownTime--;
            }
          }else{
            clearInterval(countdownInterval);
          }
        }, 1000);
      },
      cbLog: async function (type, adInfo, cb) {
        cb = cb || win.openADJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
        let res = await this.log(adInfo);
        if(res.code === 0){
          cb.adTaskFinished && cb.adTaskFinished(true);
        }else{
          cb.adTaskFinished && cb.adTaskFinished(false);
        }
        cb.adClosing && cb.adClosing(true);
        this.destroy(adInfo, cb, type);
        if(type === 'click'){
          cb.adClick && cb.adClick(true);
          await this.click(adInfo);
        }
      },
      cbClose: function (adInfo){
        let cb = win.openADJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {}, type = 'close';
        cb.adTaskFinished && cb.adTaskFinished(false);
        cb.adClosing && cb.adClosing(true);
        this.destroy(adInfo, cb, type);
      },
      destroy: function (dom, cb, type){
        dom = doc.querySelector( `.${this.dom}[zoneId="${dom.zoneId}"][publisherId="${dom.publisherId}"]`);
        document.body.removeChild(dom);
        cb.adClosed && cb.adClosed(type);
      },
    },
    advertiser: {
      cb: async function(){
        let _this = win.openADJsSDK, user = _this.TG.initDataUnsafe.user || {};
        if(typeof user === 'string'){
          user = JSON.parse(user);
        }
        let url = win.location.href, t = 0, params = {};
        if(url.includes('?tgWebAppStartParam')){
          t = url.indexOf('#tgWebAppData');
          if(t > 0){
            url = url.substring(0, t);
          }
          t = url.indexOf('_26zoneId_3D');
          if(t > 0){
            params = this.getURLParams(decodeURIComponent(url.substring(t).replace(/_/g, '%')));
          }
        }
        if(!url.includes('?tgWebAppStartParam') && !url.includes('#tgWebAppData')){
          t = url.indexOf('&zoneId=');
          if(t > 0){
            params = this.getURLParams(url.substring(t));
          }
        }
        let { cb, eventId, hash, publisherId, signature, traceId, userId, zoneId } = params;
        let result = { code: -1, msg: 'invalid parameters' };
        if(cb && eventId && hash && publisherId && signature && traceId && userId && zoneId){
          let env = _this.functionSent.getBrowserInfo({}, _this);
          params = {
            cb, eventId, hash, publisherId, signature, traceId, zoneId,
            'language': (user.id ? (user['language_code'] || user['languageCode']) : env.language).split('_')[0].split('-')[0].toLocaleLowerCase(),
            'version': _this.version,
            'channel': user.id ? 'TG' : env.channel,
            'platform': env.platform,
            'fromType': 'script',
            'userId': userId || user.id || env.platformOS,
            'firstName': user.id ? (user['first_name'] || 'FN'+user.id) : env.platformOS,
            'lastName': user.id ? (user['last_name'] || 'LN'+user.id) : env.platformOS,
            'userName': user.id ? (user['username'] || 'UN'+user.id) : env.platformOS,
            'isPremium': user['is_premium'] ? 1 : 0,
            'location': win.location.origin+win.location.pathname,
          }
          let res = await _this.functionSent.AJAX('get', _this.hostURL+'/v3/api/callback', params, 'json');
          if(res && res.errcode === 0){
            result = { code: 0, msg: 'send callback info successfully' }
          }else{
            result = { code: -2, msg: 'send callback info failed' }
          }
        }
        return result;
      },
      getURLParams: function (params){
        let list = params.split('&'), item;
        params = {};
        for(let i=0;i<list.length;i++){
          item = list[i].split('=');
          if(item.length > 1){
            params[item[0]] = item[1];
          }
        }
        return params;
      },
    },
    functionSent: {
      get: async function(data){
        let { adParams, userInfo, adInfo } = data, _this = win.openADJsSDK;
        let TG = adParams.TG, env = this.getBrowserInfo({}, _this), user = userInfo || {}, _t = env._t;
        let location = win.location.href.substring(0, win.location.href.indexOf('?')) || win.location.href;
        let error = { code: -2, msg: 'get openAD ads error!' };
        location = location.includes('tgWebAppData') ? location.split('#')[0] : location;
        let params = {
          'sid': _t,
          'language': env.language.split('-')[0].split('_')[0],
          'version': adParams.version || env.osVersion+' '+env.browser+ ' '+env.browserVersion,
          'channel': env.channel,
          'platform': env.platform,
          'fromType': 'script',
          location,
          'userId': user.userId || env.platformOS,
          'firstName': user.firstName ||env.platformOS,
          'lastName': user.lastName || env.platformOS,
          'userName': user.username || user.userName || env.platformOS,
          'walletType': user.walletType || 'null',
          'walletAddress': user.walletAddress || 'null',
          'isPremium': 0,
        }
        if(TG){
          user = _this.TG.initDataUnsafe.user || {};
          if(typeof user === 'string'){
            user = JSON.parse(user);
          }
          userInfo = JSON.parse(JSON.stringify(user));
          if(!user.id || user.id.toString().length > 12){
            return error;
          }
          user = {
            'userId': user.id || params.userId,
            'firstName': user.id ? (user['first_name'] || 'FN'+user.id) : params.firstName,
            'lastName': user.id ? (user['last_name'] || 'LN'+user.id) : params.lastName,
            'userName': user.id ? (user['username'] || 'UN'+user.id) : params.userName,
            'isPremium': user['is_premium'] ? 1 : 0,
          };
          params = {
            ...params,
            ...user,
            channel: 'TG',
            language: (user.id ? (user['language_code'] || user['languageCode']) : params.language).split('_')[0].split('-')[0].toLocaleLowerCase(),
            version: user.id ? _this.TG.version : params.version,
            platform: params.platform,
          }
        }
        if(userInfo && Object.prototype.hasOwnProperty.call(userInfo, 'is_bot') && userInfo['is_bot']){
          return error;
        }
        let traceId = '', openADStore = {};
        // how to get traceId and openADStore._t, code omitted
        params.traceId = adInfo.publisherId+(new Date(openADStore._t).getDate()+1)+''+(new Date(openADStore._t).getDay()+1+adInfo.zoneId)+win.shortHash(traceId+'+'+openADStore._t);
        params = { ...adInfo, ...user, ...params };
        try {
          let res = await this.AJAX('get', _this.hostURL+'/v3/api/getAd', params, 'json');
          if(res && res.errcode === 0 && res.data && res.data.eventId){
            const RES = res.data;
            const data = {
              'width': RES.width,
              'type': RES['type'],
              'height': RES.height,
              'resource_id': RES['resource_id'] || RES.id,
              'resource_url': RES['resource_url'] || RES['banner_url'],
              'resource_text': RES['resource_text'] || '',
              'resource_desc': RES['resource_desc'] || '',
              'hasCb': RES['metadata'] === 'hasCb',
            }
            _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`] = {
              hasLog: false,
              hasClick: false,
              params: { ...params, eventId: res.data.eventId, cb: RES.cb, 'hash': RES.hash, 'signature': RES.signature },
              resource: { ...data, 'click_url': RES['jumpURL'] || RES['click_url'] },
            };
            return { code: 0, data };
          }else{
            return error;
          }
        } catch (e) {
          return e;
        }
      },
      log: async function(adInfo){
        let _this = win.openADJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
        if(!resource){
          return { code: -1, msg: 'can not find resource' };
        }
        let ok = { code: 0, msg: 'send log info successfully' }, error = { code: -2, msg: 'send log info failed' };
        if(resource.hasLog){
          return error;
        }
        resource.hasLog = true;
        try {
          let res = await this.AJAX('get', _this.hostURL+'/v3/api/logInfo', { ...resource.params, requestType: 'loginfo' }, 'json');
          if(res.errcode === 0){
            return ok;
          }else{
            return error;
          }
        } catch (e) {
          return e;
        }
      },
      click: async function(adInfo, cb){
        let _this = win.openADJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
        if(!resource){
          console.log('error', 'can not find resource');
          this.open({});
          return false;
        }
        if(resource.hasClick){
          this.open(resource);
          return false;
        }
        resource.hasClick = true;
        try {
          let res = await this.AJAX('get', _this.hostURL+'/v3/api/clickInfo', { ...resource.params, requestType: 'clickinfo' }, 'json');
          if(res.errcode === 0){
            console.log('success', 'send click info successfully');
          }else{
            console.log('error', 'send click info failed');
          }
        } catch (e) {
          console.log('error', 'send click info failed');
        }
        this.open(resource, cb);
      },
      open: function(resource, cb){
        let _this = win.openADJsSDK,
          hasCb = resource.resource?.hasCb || false,
          url = resource.resource?.click_url || 'https://t.me/OpenAD_protocol',
          params = resource.params || {};
        params = {
          zoneId: params.zoneId || '',
          publisherId: params.publisherId || '',
          eventId: params.eventId || '',
          traceId: params.traceId || '',
          cb: params.cb || '',
          hash: params.hash || '',
          signature: params.signature || '',
          userId: params.userId || '',
        };
        try {
          if(url.includes('t.me') || url.includes('tg//')){
            if(hasCb){
              params = this.Obj2String(params, 'TG');
              if(url.includes('startapp')){
                url += params;
              }else{
                url += '?startapp=OpenAD_Protocol'+params;
              }
            }
            _this.TG.openTelegramLink(url);
          }else{
            if(hasCb){
              params = this.Obj2String(params, 'webApp');
              if(url.includes('?')){
                url += params;
              }else{
                url += '?startapp=OpenAD_Protocol'+params;
              }
            }
            _this.TG.openLink(url);
          }
          return cb && cb();
        } catch {
          return cb && cb();
        }
      },
      AJAX: function(method, url, data, dataType){
        return new Promise((resolve, reject) => {
          data = { rt: new Date().valueOf() , ...data };
          win.J$.ajax({
            method,
            url,
            dataType,
            data: method === 'get' ? data : JSON.stringify(data),
            contentType: 'application/json',
            async: true,
            timeout: 5000,
            success: (res) => {
              return resolve(res);
            },
            error: (xhr, status, error) => {
              if (xhr.status === 404) {
                return reject({ code: -3, msg: 'Ajax Request 404 !' });
              } else if (status === 'timeout') {
                return reject({ code: -4, msg: 'Ajax Request Timeout !' });
              } else {
                console.log('Ajax request error:', error);
                return reject({ code: -5, msg: 'Ajax Request Error !' });
              }
            },
          });
        });
      },
      getBrowserInfo: function (obj) {
        /** https://github.com/MeMrVincent/get-user-device-info **/
      },
      Obj2String: function(obj, type) {
        let string = '';
        for(let key in obj){
          if(obj[key]){
            string+= '&'+key+'='+obj[key];
          }
        }
        if(type === 'TG'){
          string = encodeURIComponent(string).replace(/%/g, '_');
        }
        return string;
      },
    },
    TG: {
      eventHandlers: {},
      initParams: {},
      isFullscreen: false,
      isIframe: false,
      version: '6.0',
      initData: '',
      initDataUnsafe: {},
      platform: 'unknown',
      init: function(){
        this.loadCss();
        this.initParams = this.storeParams();
        this.getFullScreen();
        this.initIsIframe();
        this.resetParams();
        this.tmaReg();
        this.onEvent('fullscreen_changed', this.onFullscreenChanged);
        this.onEvent('fullscreen_failed', this.onFullscreenFailed);
      },
      loadCss: function() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${window.openADJsSDK.staticURL}/css.css?v=`+new Date().valueOf();
        link.type = 'text/css';
        document.head.appendChild(link);
      },
      storeParams: function(){
        let locationHash = '';
        try {
          locationHash = location.hash.toString();
        } catch (e) {}
        let initParams = this.urlParseHashParams(locationHash);
        let storedParams = this.sessionStorageGet('initParams');
        if (storedParams) {
          for (let key in storedParams) {
            if (typeof initParams[key] === 'undefined') {
              initParams[key] = storedParams[key];
            }
          }
        }
        this.sessionStorageSet('initParams', initParams);
        return initParams;
      },
      urlParseHashParams(locationHash) {
        locationHash = locationHash.replace(/^#/, '');
        let params = {};
        if (!locationHash.length) {
          return params;
        }
        if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
          params._path = this.urlSafeDecode(locationHash);
          return params;
        }
        let qIndex = locationHash.indexOf('?');
        if (qIndex >= 0) {
          let pathParam = locationHash.substring(0, qIndex);
          params._path = this.urlSafeDecode(pathParam);
          locationHash = locationHash.substring(qIndex + 1);
        }
        let query_params = this.urlParseQueryString(locationHash);
        for (let k in query_params) {
          params[k] = query_params[k];
        }
        return params;
      },
      initIsIframe: function(){
        let isIframe = this.isIframe, iFrameStyle, dataParsed;
        try {
          isIframe = (window.parent !== null && window !== window.parent);
          if (isIframe) {
            window.addEventListener('message', function (event) {
              if (event.source !== window.parent) {
                return;
              }
              try {
                dataParsed = JSON.parse(event.data);
              } catch (e) {
                return;
              }
              if (!dataParsed || !dataParsed.eventType) {
                return;
              }
              if (dataParsed.eventType === 'set_custom_style') {
                if (event.origin === 'https://web.telegram.org') {
                  iFrameStyle.innerHTML = dataParsed.eventData;
                }
              } else if (dataParsed.eventType === 'reload_iframe') {
                try {
                  window.parent.postMessage(JSON.stringify({ eventType: 'iframe_will_reload' }), '*');
                } catch (e) {
                  //
                }
                location.reload();
              } else {
                this.receiveEvent(dataParsed.eventType, dataParsed.eventData);
              }
            });
            iFrameStyle = document.createElement('style');
            document.head.appendChild(iFrameStyle);
            try {
              window.parent.postMessage(JSON.stringify({ eventType: 'iframe_ready', eventData: { 'reload_supported': true } }), '*');
            } catch (e) {
              //
            }
          }
          this.isIframe = isIframe;
        } catch (e) {
          //
        }
      },
      resetParams: function(){
        let initParams = this.initParams;
        if (initParams.tgWebAppData && initParams.tgWebAppData.length) {
          this.initData = initParams.tgWebAppData;
          this.initDataUnsafe = this.urlParseQueryString(this.initData);
          for (let key in this.initDataUnsafe) {
            let val = this.initDataUnsafe[key];
            try {
              if (val.substring(0, 1) === '{' && val.substring(-1) === '}' || val.substring(0, 1) === '[' && val.substring(-1) === ']') {
                this.initDataUnsafe[key] = JSON.parse(val);
              }
            } catch (e) {
              //
            }
          }
        }
        if (initParams.tgWebAppVersion) {
          this.version = initParams.tgWebAppVersion;
        }
        if (initParams.tgWebAppPlatform) {
          this.platform = initParams.tgWebAppPlatform;
        }
      },
      getFullScreen: function (){
        let stored_fullscreen = this.sessionStorageGet('isFullscreen');
        if (this.isFullscreen || this.initParams.tgWebAppFullscreen) {
          this.setFullscreen(true);
        }
        if (stored_fullscreen) {
          this.setFullscreen(stored_fullscreen === 'yes');
        }
      },
      setFullscreen: function(is_fullscreen) {
        let b = !!is_fullscreen;
        this.isFullscreen = b;
        this.sessionStorageSet('isFullscreen', b ? 'yes' : 'no');
      },
      onFullscreenChanged: function(eventType, eventData) {
        this.setFullscreen(eventData.is_fullscreen);
      },
      onFullscreenFailed: function(eventType, eventData) {
        if (eventData.error === 'ALREADY_FULLSCREEN' && !this.isFullscreen) {
          this.setFullscreen(true);
        }
      },
      postEvent: function(eventType, callback, eventData) {
        if (!callback) {
          callback = function () {};
        }
        if (eventData === undefined) {
          eventData = '';
        }
        console.log('[Telegram.WebView] > postEvent', eventType, eventData);
        if (window['TelegramWebviewProxy'] !== undefined) {
          window['TelegramWebviewProxy'].postEvent(eventType, JSON.stringify(eventData));
          callback();
        } else if (window.external && 'notify' in window.external) {
          window.external.notify(JSON.stringify({ eventType: eventType, eventData: eventData }));
          callback();
        } else if (this.isIframe) {
          try {
            let trustedTarget = 'https://web.telegram.org';
            trustedTarget = '*';
            window.parent.postMessage(JSON.stringify({ eventType: eventType, eventData: eventData }), trustedTarget);
            callback();
          } catch (e) {
            callback(e);
          }
        } else {
          callback({ notAvailable: true });
        }
      },
      receiveEvent: function(eventType, eventData) {
        console.log('[Telegram.WebView] < receiveEvent', eventType, eventData);
        this.callEventCallbacks(eventType, function(callback) {
          callback(eventType, eventData);
        });
      },
      callEventCallbacks(eventType, cb) {
        let curEventHandlers = this.eventHandlers[eventType];
        if (curEventHandlers === undefined ||
            !curEventHandlers.length) {
          return;
        }
        for (let i = 0; i < curEventHandlers.length; i++) {
          try {
            cb(curEventHandlers[i]);
          } catch (e) {
            //
          }
        }
      },
      urlParseQueryString: function(queryString) {
        let params = {};
        if (!queryString.length) {
          return params;
        }
        let queryStringParams = queryString.split('&');
        let i, param, paramName, paramValue;
        for (i = 0; i < queryStringParams.length; i++) {
          param = queryStringParams[i].split('=');
          paramName = this.urlSafeDecode(param[0]);
          paramValue = param[1] === null ? null : this.urlSafeDecode(param[1]);
          params[paramName] = paramValue;
        }
        return params;
      },
      urlSafeDecode: function(urlencoded) {
        try {
          urlencoded = urlencoded.replace(/\+/g, '%20');
          return decodeURIComponent(urlencoded);
        } catch (e) {
          return urlencoded;
        }
      },
      sessionStorageSet: function(key, value) {
        try {
          window.sessionStorage.setItem('__OpenAD__' + key, JSON.stringify(value));
          window.sessionStorage.setItem('__telegram__' + key, JSON.stringify(value));
          return true;
        } catch(e) {
          //
        }
        return false;
      },
      sessionStorageGet: function(key) {
        try {
          return JSON.parse(window.sessionStorage.getItem('__OpenAD__' + key) || window.sessionStorage.getItem('__telegram__' + key));
        } catch(e) {
          //
        }
        return null;
      },
      ready: function () {
        //this.postEvent('web_app_ready');
        //this.onEvent('fullscreen_changed', onFullscreenChanged);
        //this.onEvent('fullscreen_failed', onFullscreenFailed);
      },
      versionCompare: function(v1, v2) {
        if (typeof v1 !== 'string') {
          v1 = '';
        }
        if (typeof v2 !== 'string') {
          v2 = '';
        }
        v1 = v1.replace(/^\s+|\s+$/g, '').split('.');
        v2 = v2.replace(/^\s+|\s+$/g, '').split('.');
        let a = Math.max(v1.length, v2.length), i, p1, p2;
        for (i = 0; i < a; i++) {
          p1 = parseInt(v1[i]) || 0;
          p2 = parseInt(v2[i]) || 0;
          if (p1 === p2) {
            continue;
          }
          if (p1 > p2) {
            return 1;
          }
          return -1;
        }
        return 0;
      },
      versionAtLeast: function(ver) {
        return this.versionCompare(this.version, ver) >= 0;
      },
      openTelegramLink: function (url, options) {
        let a = document.createElement('A');
        a.href = url;
        if (a.protocol !== 'http:' && a.protocol !== 'https:') {
          console.error('[Telegram.WebApp] Url protocol is not supported', url);
          throw Error('WebAppTgUrlInvalid');
        }
        if (a.hostname !== 't.me') {
          console.error('[Telegram.WebApp] Url host is not supported', url);
          throw Error('WebAppTgUrlInvalid');
        }
        let path_full = a.pathname + a.search;
        options = options || {};
        if (this.isIframe || this.versionAtLeast('6.1')) {
          let req_params = { 'path_full': path_full };
          if (options.force_request) {
            req_params.force_request = true;
          }
          this.postEvent('web_app_open_tg_link', false, req_params);
        } else {
          location.href = 'https://t.me' + path_full;
        }
      },
      openLink: function (url, options) {
        let a = document.createElement('A');
        a.href = url;
        if (a.protocol !== 'http:' && a.protocol !== 'https:') {
          console.error('[Telegram.WebApp] Url protocol is not supported', url);
          throw Error('WebAppTgUrlInvalid');
        }
        options = options || {};
        if (this.versionAtLeast('6.1')) {
          let req_params = { url };
          if (this.versionAtLeast('6.4') && options.try_instant_view) {
            req_params.try_instant_view = true;
          }
          if (this.versionAtLeast('7.6') && options.try_browser) {
            req_params.try_browser = options.try_browser;
          }
          this.postEvent('web_app_open_link', false, req_params);
        } else {
          window.open(url, '_blank');
        }
      },
      onEvent: function(eventType, callback) {
        if (this.eventHandlers[eventType] === undefined) {
          this.eventHandlers[eventType] = [];
        }
        let index = this.eventHandlers[eventType].indexOf(callback);
        if (index === -1) {
          this.eventHandlers[eventType].push(callback);
        }
      },
      tmaReg: function (){
        let openADTmaRegUsers = [];
        if(localStorage.openADTmaRegUsers){
          openADTmaRegUsers = JSON.parse(localStorage.openADTmaRegUsers);
        }
        let user = this.initDataUnsafe.user || {}, Funcs = win.openADJsSDK.functionSent;
        if(typeof user === 'string'){
          user = JSON.parse(user);
        }
        if(user && user.id && user.id.toString().length < 13 && !openADTmaRegUsers.includes(user.id)){
          const env = Funcs.getBrowserInfo({});
          let params = {
            'user_id': user.id,
            'first_name': user['first_name'] || user.id,
            'last_name': user['last_name'] || user.id,
            'user_name': user['username'] || user.id,
            'is_bot': user['is_bot'] ? 1 : 0,
            'from_type': 'SDK',
            'platform': env.platform,
            'version': win.openADJsSDK.version,
            'channel': env.channel,
            'language': (user['language_code'] || user['languageCode'] || env.language).split('_')[0].split('-')[0].toLocaleLowerCase(),
            'is_premium': user['is_premium'] ? 1 : 0,
            'location': win.location.origin + win.location.pathname,
          };
          Funcs.AJAX('get', 'https://tmaapi.openad.network/api/regTwa', params, 'json').then((res) => {
            if(res && (res.errcode === 0 || res.errcode === 400)){
              openADTmaRegUsers.push(user.id);
              localStorage.openADTmaRegUsers = JSON.stringify(openADTmaRegUsers);
            }
          });
        }
      },
    },
  };
  win.openADJsSDK.TG.init();
})(document, window);