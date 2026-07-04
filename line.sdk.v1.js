/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(doc, win) {
  win.OpenADLineJsSDK = {
    version: '1.2.0',
    build: '202506081723',
    hostURL: 'https://6bf9546ea5.api.openad.network',
    staticURL: './static/prod/line/v1',
    resources: {},
    banner: {
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
          dom.innerHTML = `<a href="javascript:void(0);" style="display: block;" onclick="window.OpenADLineJsSDK.banner.click({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })"><img src="${RES['resource_url']}" style="max-width: 100%;max-height: 100%;display: block;"></a>`;
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
        return await win.OpenADLineJsSDK.functionSent.get(data);
      },
      log: async function(adInfo){
        return await win.OpenADLineJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.OpenADLineJsSDK.functionSent.click(adInfo);
      },
    },
    interactive: {
      hasInterrupt: false,
      times: {
        default: 15,
        count: null,
        status: null,
      },
      DOM: null,
      lan: 'en',
      zh: {
        reward: '#S 后获得奖励',
        risk: '本頁麵爲廣告內容，請您跳转后谨慎甄別。',
        notice: '暫未獲得獎勵，是否繼續觀看廣告',
        cancel: '放棄',
        confirm: '繼續',
      },
      en: {
        reward: 'reward in # seconds',
        risk: 'This page contains advertising content. Please verify carefully after being redirected.',
        notice: 'No rewards have been obtained yet. Do you want to continue watching ads?',
        cancel: 'Cancel',
        confirm: 'Continue',
      },
      dom: 'OpenAd_Protocol_Interactive_Ad',
      init: async function(data){
        return await win.OpenADLineJsSDK.functionSent.get({ ...data });
      },
      getRender: function(data){
        const { adInfo, cb, clickReward } = data, _this = win.OpenADLineJsSDK;
        _this.Line.clickReward = null;
        if(!clickReward && !_this.Line.type.includes('WEB')){
          return `click reward method is required when ${_this.Line.type} mode in getRender parameters !`;
        }
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
        let RES = win.OpenADLineJsSDK.resources[`${publisherId}_${zoneId}`], lan = RES.params.language, OS = RES.params.platform, isFullscreen = RES.params.isFullscreen;
        RES = RES ? RES.resource : null;
        this.times.count = this.times.default;
        this.times.status = true;
        this.DOM = dom;
        this.lan = lan === 'zh' ? 'zh':'en';
        if(RES){
          win.OpenADLineJsSDK.resources[`${publisherId}_${zoneId}`].cb = cb;
          cb.onAdResourceLoad && cb.onAdResourceLoad(true);
        }else{
          return `can not find publisherId: ${publisherId} and zoneId: ${zoneId} resource !`;
        }
        cb.onAdOpening && cb.onAdOpening(true);
        let dynamicHtml = this.hasInterrupt ?
          '<div class="right close" onclick="window.OpenADLineJsSDK.interactive.interrupt()">' :
          `<div class="right close" onclick="window.OpenADLineJsSDK.interactive.cbClose({ zoneId: ${zoneId}, publisherId: ${publisherId} })">`;
        dom.innerHTML = '';
        dom.innerHTML +=
            `<div class="InteractiveAdActions ${OS === 'IOS' && isFullscreen ? 'FullScreen' : 'MainScreen'}">
                <div class="left clock">${this[this.lan].reward.replace('#', this.times.count)}</div>
                ${dynamicHtml}
                    <img src="${window.OpenADLineJsSDK.staticURL}/close.png" alt="" />
                </div>
            </div>`+
            `<div class="InteractiveAdContent" onclick="window.OpenADLineJsSDK.interactive.cbLog('click', { 'zoneId':${zoneId}, 'publisherId':${publisherId} })">`+
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
                '<div class="logo" onclick="window.OpenADLineJsSDK.functionSent.open({})">'+
                    `<img src="${window.OpenADLineJsSDK.staticURL}/logo.png" alt="" />`+
                '</div>'+
                `<div class="note">${this[this.lan].risk}</div>`+
            '</div>';
        if(this.hasInterrupt){
          dom.innerHTML +=
              `<div class="InteractiveInterrupt">
                <div class="note">
                  <img src="${window.OpenADLineJsSDK.staticURL}/reward.png" alt="" />
                  <p>${this[this.lan].notice}</p>
                </div>
                <div class="action Flex">
                  <i class="Flex" onclick="window.OpenADLineJsSDK.interactive.cbClose({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })">
                     ${this[this.lan].cancel}
                  </i>
                  <i class="Flex" onclick="window.OpenADLineJsSDK.interactive.continue({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })">
                     ${this[this.lan].confirm}
                  </i>
                </div>
              </div>`;
        }
        cb.onAdOpened && cb.onAdOpened(true);
        _this.Line.clickReward = clickReward || null;
        this.countDown(adInfo, cb);
      },
      log: async function (adInfo) {
        return await win.OpenADLineJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.OpenADLineJsSDK.functionSent.click(adInfo);
      },
      interrupt: function(){
        this.times.status = false;
        this.DOM.classList.add('hasInterrupt');
      },
      continue: function(adInfo){
        this.DOM.classList.remove('hasInterrupt');
        this.times.status = true;
        this.countDown(adInfo);
      },
      countDown: function (adInfo, cb){
        if(this.times.count !== this.times.default){
          this.times.count--;
        }
        let countdownTime = this.times.count;
        let countdownInterval = setInterval(async () => {
          let dom = doc.querySelector(`.${this.dom}[zoneId="${adInfo.zoneId}"][publisherId="${adInfo.publisherId}"]`), ele;
          if(dom){
            ele = dom.querySelector(`.${this.dom} .InteractiveAdActions .clock`);
          }
          if(ele && dom){
            ele.innerHTML = this[this.lan].reward.replace('#', countdownTime);
            if (countdownTime === 0 || !this.times.status) {
              clearInterval(countdownInterval);
              if(countdownTime === 0){
                ele.innerHTML = '';
                await this.cbLog('view', adInfo, cb);
              }
            } else {
              this.times.count--;
              countdownTime--;
            }
          }else{
            clearInterval(countdownInterval);
          }
        }, 1000);
      },
      cbLog: async function (type, adInfo, cb) {
        cb = cb || win.OpenADLineJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
        let res = await this.log(adInfo);
        if(res.code === 0){
          cb.onAdTaskFinished && cb.onAdTaskFinished(true);
        }else{
          cb.onAdTaskFinished && cb.onAdTaskFinished(false);
        }
        cb.onAdClosing && cb.onAdClosing(true);
        this.destroy(adInfo, cb, type);
        if(type === 'click'){
          cb.onAdClick && cb.onAdClick(true);
          await this.click(adInfo);
        }
      },
      cbClose: function (adInfo){
        let cb = win.OpenADLineJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {}, type = 'close';
        cb.onAdTaskFinished && cb.onAdTaskFinished(false);
        cb.onAdClosing && cb.onAdClosing(true);
        this.destroy(adInfo, cb, type);
      },
      destroy: function (dom, cb, type){
        dom = doc.querySelector( `.${this.dom}[zoneId="${dom.zoneId}"][publisherId="${dom.publisherId}"]`);
        document.body.removeChild(dom);
        cb.onAdClosed && cb.onAdClosed(type);
      },
    },
    advertiser: {
      cb: async function(){
        let _this = win.OpenADLineJsSDK, user = _this.Line.user || {}, params = this.getURLParams(win.location.href);
        let { cb, eventId, hash, publisherId, signature, traceId, userId, zoneId } = params;
        let result = { code: -1, msg: 'invalid parameters' };
        if(cb && eventId && hash && publisherId && signature && traceId && userId && zoneId){
          let env = _this.functionSent.getBrowserInfo({}, _this);
          params = {
            cb, eventId, hash, publisherId, signature, traceId, zoneId,
            'language': env.language.split('_')[0].split('-')[0].toLocaleLowerCase(),
            'version': _this.version,
            'channel': user.userId ? 'line' : env.channel,
            'platform': env.platform,
            'fromType': 'script',
            'userId': user.userId || env.platformOS,
            'displayName': user.displayName,
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
        let list = params.replace(/\?/g, '&').split('&'), item;
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
        let { adParams, userInfo, adInfo } = data, _this = win.OpenADLineJsSDK;
        let { line, wallet, web } = adParams, env = this.getBrowserInfo({}, _this), _t = env._t, walletAddress, res;
        userInfo = userInfo || {};
        _this.Line = { ..._this.Line, ...line };
        _this.wallet = { ..._this.wallet, ...(wallet || {}) };
        _this.web = { ..._this.web, ...(web || {}) };
        let params = {
          'sid': _t,
          'language': env.language.split('-')[0].split('_')[0],
          'version': _this.version,
          'channel': env.channel,
          'platform': env.platform,
          'fromType': 'script',
          'location': win.location.origin + win.location.pathname,
          'userId': userInfo.userId || env.platformOS,
          'displayName': userInfo.displayName,
          'channelId': !_this.Line.type.includes('WEB') ? _this.Line.liffId.split('-')[0] : _this.Line.type,
          'liffId': !_this.Line.type.includes('WEB') ? _this.Line.liffId.split('-')[1] : _this.Line.type,
          'walletType': _this.wallet.type || 'null',
          'walletAddress': 'null',
          'isPremium': 0,
        }
        /** LMA / LWA , verification user data **/
        if(!_this.Line.type.includes('WEB')){
          // code omitted
        }
        /** WEB, WEB3, verification user data **/
        if(_this.Line.type.includes('WEB')){
          // code omitted
        }
        /** WEB3, to get wallet address and verification address **/
        if (_this.Line.type === 'WEB3') {
          // code omitted
        }
        /** WEB, to get user token and user info **/
        if (_this.Line.type === 'WEB') {
          // code omitted
        }
        let traceId = '', openADStore = {};
        // how to get traceId and openADStore._t, code omitted
        params.traceId = adInfo.publisherId+(new Date(openADStore._t).getDate()+1)+''+(new Date(openADStore._t).getDay()+1+adInfo.zoneId)+win.shortHash(traceId+'+'+openADStore._t);
        params = { ...adInfo, ...params };
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
              'cb': RES['cb'] || '',
              'hash': RES['hash'] || '',
              'signature': RES['signature'] || '',
              'eventId': RES['eventId'],
            }
            _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`] = {
              hasLog: false,
              hasClick: false,
              params: { ...params, eventId: res.data.eventId, cb: RES.cb, 'hash': RES.hash, 'signature': RES.signature, isFullscreen: _this.Line.isFullscreen },
              resource: { ...data, 'click_url': RES['jumpURL'] || RES['click_url'] },
            };
            return { code: 0, data };
          }else{
            return { code: -31, msg: 'Get OpenAD Ads Error!' };
          }
        } catch (e) {
          return e;
        }
      },
      log: async function(adInfo){
        let _this = win.OpenADLineJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
        if(!resource){
          return { code: -41, msg: 'can not find resource' };
        }
        let ok = { code: 0, msg: 'send log info successfully' }, error = { code: -42, msg: 'send log info failed' };
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
        let _this = win.OpenADLineJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
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
        let _this = win.OpenADLineJsSDK,
          hasCb = resource.resource?.hasCb || false,
          url = resource.resource?.click_url || 'https://t.me/OpenAD_protocol',
          params = resource.params || {},
          type = resource.resource.type;
        if(!_this.Line.type.includes('WEB') && _this.Line.clickReward && type === 'interactive'){
          _this.Line.clickReward();
        }
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
          if(hasCb){
            params = this.Obj2String(params);
            if(url.includes('?')){
              url += params;
            }else{
              url += '?PromotionChannel=OpenAD_Protocol'+params;
            }
          }
          _this.Line.openWindow(url);
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
              if(url.includes(win.OpenADLineJsSDK.hostURL)){
                if (xhr.status === 404) {
                  return reject({ code: -11, msg: 'Ajax Request 404 !' });
                } else if (status === 'timeout') {
                  return reject({ code: -12, msg: 'Ajax Request Timeout !' });
                } else {
                  console.log('Ajax request error:', error);
                  return reject({ code: -13, msg: 'Ajax Request Error !' });
                }
              }else{
                if (xhr.status === 404) {
                  return reject({ code: -21, msg: `Api Request 404: ${url}  !` });
                } else if (status === 'timeout') {
                  return reject({ code: -22, msg: `Api Request Timeout: ${url} !` });
                } else {
                  console.log('Ajax request error:', error);
                  return reject({ code: -23, msg: `Api Request Error: ${url} !` });
                }
              }
            },
          });
        });
      },
      getBrowserInfo: function (obj) {
        /** https://github.com/MeMrVincent/get-user-device-info **/
      },
      Obj2String: function(obj) {
        let string = '';
        for(let key in obj){
          if(obj[key]){
            string+= '&'+key+'='+obj[key];
          }
        }
        return string;
      },
    },
    web: {
      api: '', // here is the required API. We will call this API to retrieve the token.
      method: '', // GET / POST, method is required
      token: '', // call the API to perform token verification. token is required
      valid: 0, // token length.  valid is required
    },
    wallet: {
      type: '',
      provider: null,
      components: '',
      chainType: '',
      api: '',
      method: '',
      list: ['eth', 'kaia', 'ton', 'api'],
      isEVMAddress: function(address) {
        return true;
      },
    },
    Line: {
      type: '',
      liffId: '',
      prototype: null,
      isFullscreen: false,
      clickReward: null,
      init: function(){
        this.loadCss();
        //this.LineReg();
      },
      loadCss: function() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${window.OpenADLineJsSDK.staticURL}/css.css?v=`+new Date().valueOf();
        link.type = 'text/css';
        document.head.appendChild(link);
      },
      LineReg: function(){
        let openADTmaRegUsers = [];
        if(localStorage.openADTmaRegUsers){
          openADTmaRegUsers = JSON.parse(localStorage.openADTmaRegUsers);
        }
        let user = {}, Funcs = win.OpenADLineJsSDK.functionSent;
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
            'version': win.OpenADLineJsSDK.version,
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
      getAccessToken: function() {
        return sessionStorage.getItem('LIFF_STORE:'+this.liffId+':accessToken') || localStorage.getItem('LIFF_STORE:'+this.liffId+':accessToken') || this.getCookie('access_token') || this.getCookie('accessToken');
      },
      getCookie: function(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      },
      isLoggedIn: function(){
        return !!this.getAccessToken();
      },
      isInClient: function () {
        return /line/i.test(navigator.userAgent.toLowerCase());
      },
      openWindow: function (url) {
        if(this.type.includes('WEB')){
          win.open(url);
        }
        if(!this.type.includes('WEB')){
          this.prototype?.openWindow({ url });
        }
      },
      getProfile: function (){
        return new Promise((resolve, reject) => {
          win.J$.ajax({
            url: 'https://api.line.me/v2/profile',
            type: 'GET',
            headers: { Authorization: `Bearer ${this.getAccessToken()}` },
            success: function (data) {
              return resolve(data);
            },
            error: function () {
              return reject({ code: -3, msg: 'invalid LWA access token!' });
            },
          });
        });
      },
    },
  };
  win.OpenADLineJsSDK.Line.init();
})(document, window);