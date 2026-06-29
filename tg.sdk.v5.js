/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(doc, win) {
  win.OpenADTGJsSDK = {
    version: '5.0.0',
    build: '202507200938',
    hostURL: 'https://bf2055756e.api.openad.network',
    staticURL: './static/prod/tg/v4',
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
        let dom = doc.querySelector(`div[zoneId="${zoneId}"][publisherId="${publisherId}"]`);
        if(!dom){
          return { code: -32, msg: `can not find render div[zoneId="${zoneId}"][publisherId="${publisherId}"]` };
        }
        let res = await this.get({ adParams, userInfo, adInfo }), RES;
        if(res.code !== 0){
          return res;
        }
        if(!res.GPT){
          RES = res.data;
          dom.innerHTML = `<a href="javascript:void(0);" style="display: block;" onclick="window.OpenADTGJsSDK.banner.click({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })"><img src="${RES['resource_url']}" style="max-width: 100%;max-height: 100%;display: block;"></a>`;
          res = await this.log(adInfo);
          if(res.code === 0){
            console.log(JSON.stringify(res));
          }else{
            console.log(JSON.stringify(res));
          }
        }
        return { code: 0, msg: 'Banner Render success' };
      },
      get: async function(data){
        return await win.OpenADTGJsSDK.functionSent.get(data);
      },
      log: async function(adInfo){
        return await win.OpenADTGJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.OpenADTGJsSDK.functionSent.click(adInfo);
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
        reward: '#S 後獲得獎勵',
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
      current: {},
      init: async function(data){
        return await win.OpenADTGJsSDK.functionSent.get({ ...data });
      },
      getRender: function(data){
        const { adInfo, cb } = data;
        const { zoneId, publisherId } = adInfo;
        let RES = win.OpenADTGJsSDK.resources[`${publisherId}_${zoneId}`], lan = RES.params.language, OS = RES.params.platform, isFullscreen = RES.params.isFullscreen || win.OpenADTGJsSDK.TG.isFullscreen;
        if(!RES){
          return { code: -401, msg: 'can not get render resources!' };
        }
        this.current = { lan, OS, isFullscreen, cb, zoneId, publisherId, RES, adInfo };
        return this.render();
      },
      render: function (){
        let { lan, OS, isFullscreen, cb, zoneId, publisherId, RES, adInfo } = this.current, resource, renderType = RES.type;
        if(renderType === 'system'){
          resource = RES.resource || {};
        }
        this.times.count = this.times.default;
        this.times.status = true;
        this.lan = lan === 'zh' ? 'zh':'en';
        win.OpenADTGJsSDK.resources[`${publisherId}_${zoneId}`].cb = cb;
        cb.onAdResourceLoad && cb.onAdResourceLoad(true);
        let dom = doc.querySelector(`.${this.dom}[zoneId="${zoneId}"][publisherId="${publisherId}"]`);
        if(dom){
          dom.remove();
        }
        dom = document.createElement('div');
        dom.className = this.dom;
        dom.setAttribute('zoneId', zoneId);
        dom.setAttribute('publisherId', publisherId);
        document.body.appendChild(dom);
        this.DOM = dom;
        cb.onAdOpening && cb.onAdOpening(true);
        let dynamicHtml = this.hasInterrupt ?
          `<div class="left clock">${this[this.lan].reward.replace('#', this.times.count)}</div>
           <div class="right close" onclick="window.OpenADTGJsSDK.interactive.interrupt()">` :
          `<div class="left clock">${'00:'+this.times.count}</div>
           <div class="right close" onclick="window.OpenADTGJsSDK.interactive.cbClose()">`;
        dom.innerHTML = '';
        dom.innerHTML +=
            `<div class="InteractiveAdActions ${OS === 'IOS' && isFullscreen ? 'FullScreen' : 'MainScreen'}">
                ${dynamicHtml}
                   <img src="${window.OpenADTGJsSDK.staticURL}/close.png" alt="" />
                </div>
            </div>`;
        if(renderType === 'GPT'){
          dom.innerHTML +=
              '<div class="InteractiveAdContent">'+
                  `<div class="photo" id="${this.dom}"></div>`+
              '</div>';
        }
        if(renderType === 'system'){
          dom.innerHTML +=
              '<div class="InteractiveAdContent" onclick="window.OpenADTGJsSDK.interactive.cbLog(\'click\')">'+
                  '<div class="photo">'+
                      `<img src="${resource['resource_url']}" />`+
                  '</div>'+
                  '<div class="title">'+
                       `${resource['resource_text']}`+
                  '</div>'+
                  '<div class="desc">'+
                       `${resource['resource_desc']}`+
                  '</div>'+
                  '<div class="btn">GO</div>'+
              '</div>';
        }
        dom.innerHTML +=
            '<div class="InteractiveAdNotice">'+
                '<div class="logo" onclick="window.OpenADTGJsSDK.functionSent.open({})">'+
                    `<img src="${window.OpenADTGJsSDK.staticURL}/logo.png" alt="" />`+
                '</div>'+
                `<div class="note">${this[this.lan].risk}</div>`+
            '</div>';
        if(this.hasInterrupt){
          dom.innerHTML +=
              `<div class="InteractiveInterrupt">
                  <div class="note">
                    <img src="${window.OpenADTGJsSDK.staticURL}/reward.png" alt="" />
                    <p>${this[this.lan].notice}</p>
                  </div>
                  <div class="action Flex">
                      <i class="Flex" onclick="window.OpenADTGJsSDK.interactive.cbClose()">
                         ${this[this.lan].cancel}
                      </i>
                      <i class="Flex" onclick="window.OpenADTGJsSDK.interactive.continue({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })">
                         ${this[this.lan].confirm}
                      </i>
                  </div>
              </div>`;
        }
        cb.onAdOpened && cb.onAdOpened(true);
        if(renderType === 'system'){
          this.countDown(adInfo, cb);
          return { code: 0, msg: 'render interactive ad success!' };
        }
        if(renderType === 'GPT'){
          return win.OpenADTGJsSDK.GPT.init();
        }
      },
      log: async function (adInfo) {
        return await win.OpenADTGJsSDK.functionSent.log(adInfo);
      },
      click: async function(adInfo){
        return await win.OpenADTGJsSDK.functionSent.click(adInfo);
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
      countDown: function (adInfo){
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
            ele.innerHTML = this.hasInterrupt ? this[this.lan].reward.replace('#', countdownTime): '00:'+(countdownTime < 10 ? '0': '')+countdownTime;
            if (countdownTime === 0 || !this.times.status) {
              clearInterval(countdownInterval);
              if(countdownTime === 0){
                ele.innerHTML = '';
                await this.cbLog('view');
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
      cbLog: async function (type) {
        let { adInfo, cb, RES } = this.current;
        if(RES.type === 'GPT'){
          this.cbClose();
          return false;
        }
        cb = cb || win.OpenADTGJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
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
      cbClose: function (){
        let { adInfo, cb, RES } = this.current, type = RES.type === 'system' ? 'close' : 'view';
        cb = cb || win.OpenADTGJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
        if(RES.type === 'system'){
          cb.onAdTaskFinished && cb.onAdTaskFinished(false);
        }
        cb.onAdClosing && cb.onAdClosing(true);
        this.destroy(adInfo, cb, type);
      },
      destroy: function (dom, cb, type){
        dom = doc.querySelector( `.${this.dom}[zoneId="${dom.zoneId}"][publisherId="${dom.publisherId}"]`);
        document.body.removeChild(dom);
        cb.onAdClosed && cb.onAdClosed(type);
      },
      GPT: function (){
        let { adInfo, cb } = this.current;
        cb = cb || win.OpenADTGJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
        cb.onAdTaskFinished && cb.onAdTaskFinished(true);
        this.countDown(adInfo);
      },
    },
    advertiser: {
      cb: async function(){
        let _this = win.OpenADTGJsSDK, user = _this.TG.initDataUnsafe.user || {};
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
        let { adParams, userInfo, adInfo } = data, _this = win.OpenADTGJsSDK;
        let { TG, wallet, web } = adParams, env = this.getBrowserInfo({}, _this), user = userInfo || {}, _t = env._t, walletAddress, res;
        _this.wallet = { ..._this.wallet, ...(wallet || {}) };
        _this.web = { ..._this.web, ...(web || {}) };
        let location = win.location.href.substring(0, win.location.href.indexOf('?')) || win.location.href;
        location = location.includes('tgWebAppData') ? location.split('#')[0] : location;
        let params = {
          'sid': _t,
          'language': env.language.split('-')[0].split('_')[0],
          'version': _this.version,
          'channel': env.channel,
          'platform': env.platform,
          'fromType': 'script',
          location,
          'userId': user.userId || env.platformOS,
          'firstName': user.firstName ||env.platformOS,
          'lastName': user.lastName || env.platformOS,
          'userName': user.username || user.userName || env.platformOS,
          'walletType': _this.wallet.type || 'null',
          'walletAddress': 'null',
          'isPremium': 0,
        }
        if(typeof TG === 'boolean' && !!TG){
          TG = { type: 'TMA' };
        }
        if(!TG || (typeof TG === 'boolean' && TG === false)){
          TG = { type: 'WEB' };
        }
        if(!_this.TG.list.includes(TG.type)){
          return { code: -51, msg: 'adParams TG type should be includes one of '+ _this.TG.list.join(' / ')+'!' };
        }
        if(adParams.isFullscreen){
          TG.isFullscreen = true;
        }
        _this.TG = { ..._this.TG, ...TG };
        /** TMA, verification user data **/
        if(_this.TG.type === 'TMA'){
          // code omitted
        }
        /** WEB, WEB3, verification user data **/
        if(_this.TG.type.includes('WEB')){
          // code omitted
        }
        /** WEB3, to get wallet address and verification address **/
        if(_this.TG.type === 'WEB3'){
          // code omitted
        }
        /** WEB, to get user token and user info **/
        if (_this.TG.type === 'WEB') {
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
              params: { ...params, eventId: res.data.eventId, cb: RES.cb, 'hash': RES.hash, 'signature': RES.signature, isFullscreen: _this.TG.isFullscreen || false },
              resource: { ...data, 'click_url': RES['jumpURL'] || RES['click_url'] },
              type: 'system',
            };
            return { code: 0, data };
          }else{
            if(
              res.errcode === 10002
              && res.data && res.data.ZoneConfig
              && res.data.ZoneConfig.googleEnable
              && res.data.ZoneConfig.adUnitName
              && Number(res.data.ZoneConfig.zoneType) >= 0){
              _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`] = {
                params: { ...params, isFullscreen: _this.TG.isFullscreen || false },
                type: 'GPT',
              };
              _this.GPT.adInfo = JSON.parse(JSON.stringify(adInfo));
              _this.GPT.slot.id = res.data.ZoneConfig.adUnitName;
              _this.GPT.slot.type = Number(res.data.ZoneConfig.zoneType);
              return await _this.GPT.loader();
            }else{
              return { code: -30, msg: 'No Ads Available!' };
            }
          }
        } catch (e) {
          return { code: -31, msg: 'No Ads Available!' };
        }
      },
      log: async function(adInfo){
        let _this = win.OpenADTGJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
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
        let _this = win.OpenADTGJsSDK, resource = _this.resources[`${adInfo.publisherId}_${adInfo.zoneId}`];
        if(!resource){
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
        let _this = win.OpenADTGJsSDK,
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
              if(url.includes(win.OpenADTGJsSDK.hostURL)){
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
        /** https://github.com/JPMrVincent/get-user-device-info **/
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
      loadJs: function (obj){
        /** https://github.com/JPMrVincent/async-load-script **/
      }
    },
    GPT: {
      adInfo: {
        publisherId: '',
        zoneId: '',
      },
      slot: {
        id: '',
        type: 0,
        list: [ { w: 468, h: 60, type: 0, dom: 'OpenAd_Protocol_Banner_Ad' }, { w: 600, h: 600, type: 1 }, { h: 1024, w: 768, type: 2, dom: 'OpenAd_Protocol_Interactive_Ad' } ],
      },
      loader: async function(){
        let _this = win.OpenADTGJsSDK, obj = {
          name: 'GPTAD',
          version: '1.0.0',
          url: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
          noCache: false,
        };
        let res = await _this.functionSent.loadJs(obj);
        if(res && typeof res === 'boolean'){
          if(this.slot.type === 2){
            return { code: 0, GPT: 'Get GPT Ad Success!' };
          }
          if(this.slot.type === 0){
            return await this.init();
          }
        }else{
          return { code: -301, msg: `Failed to load script ${obj.url}` };
        }
      },
      init: async function(){
        const _this = this, current = _this.slot.list[_this.slot.type], $AD = { id: _this.slot.id, w: current.w, h: current.h, dom: current.dom };
        let dom, $scale = 1;
        if(_this.slot.type === 0){
          let dom = document.querySelector(`#${$AD.dom}`);
          if(dom){
            dom.remove();
          }
          dom = doc.querySelector(`div[zoneId="${_this.adInfo.zoneId}"][publisherId="${_this.adInfo.publisherId}"]`);
          if(!dom){
            return { code: -310, msg: 'Please use the standard mode to integrate OpenAD TG Js SDK!' };
          }
          dom.id = $AD.dom;
          $scale = dom.offsetWidth / $AD.w;
          console.log('scale', $scale);
        }
        if(_this.slot.type === 2){
          dom = document.querySelector(`#${$AD.dom}`);
          $scale = dom.offsetWidth / $AD.w;
          console.log('scale', $scale);
          dom.style.height = $AD.h * $scale + 'px';
        }
        return new Promise((resolve, reject) => {
          window.googletag = window.googletag || { cmd: [] };

          try {
            window.googletag.cmd.push(function () {
              try {
                window.googletag.defineSlot($AD.id, [$AD.w, $AD.h], $AD.dom).addService(window.googletag.pubads());
                window.googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                  if (event.slot.getSlotElementId() !== $AD.dom) {
                    return { code: -302, msg: `Failed To Find Html Element ${$AD.dom}` };
                  }
                  if(!event.isEmpty){
                    if (typeof $scale === 'number') {
                      try {
                        const div = dom.querySelector('div');
                        if (div) {
                          div.style.transform = `scale(${$scale})`;
                        } else {
                          return reject({ code: -304, msg: 'Can Not Find GPT Ad Html Element !' });
                        }
                      } catch (scaleError) {
                        return reject({ code: -305, msg: 'GPT Ad Html Element Can Not Scale!' });
                      }
                    }else{
                      return reject({ code: -311, msg: 'GPT Ad Failed To Load Content !' });
                    }
                    resolve({ code: 0, GPT: 'Render GPT Ad Success!' });
                    win.OpenADTGJsSDK.interactive.GPT();
                  }
                  if (event.isEmpty) {
                    return reject({ code: -303, msg: 'No GPT Ads Available !' }); // 广告为空，Promise 解析为 false
                  }
                });
                window.googletag.pubads().addEventListener('slotOnload', function (event) {
                  if (event.slot.getSlotElementId() !== $AD.dom) {
                    return { code: -302, msg: `Failed To Find Html Element ${$AD.dom}` }; // 确保是当前广告位
                  }
                  if (!event.slot.getResponseInformation()) {
                    return reject({ code: -306, msg: 'GPT Ad Failed To Load Content !' });
                  } else {
                    console.log('GPT Content Load Success', event);
                  }
                });
                window.googletag.pubads().enableSingleRequest();
                window.googletag.enableServices();
              } catch (innerError) {
                console.error('GPT Init Error:', innerError);
                return reject({ code: -307, msg: innerError });
              }
            });
            window.googletag.cmd.push(function() {
              try {
                window.googletag.display($AD.dom);
              } catch (displayError) {
                console.error('Call Google Tag Display Error', displayError);
                return reject({ code: -308, msg: displayError });
              }
            });

          } catch (outerError) {
            console.error('Create GPT Promise Error', outerError);
            return reject({ code: -309, msg: outerError });
          }
        });
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
    TG: {
      type: '',
      list: ['TMA', 'WEB3', 'WEB'],
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
        link.href = `${window.OpenADTGJsSDK.staticURL}/css.css?v=`+new Date().valueOf();
        link.type = 'text/css';
        document.head.appendChild(link);
      },
      storeParams: function(){
        let locationHash = '';
        try {
          locationHash = location.hash.toString();
        } catch (e) {
          
        }
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
      urlParseHashParams: function(locationHash) {
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
      callEventCallbacks: function(eventType, cb) {
        let curEventHandlers = this.eventHandlers[eventType];
        if (curEventHandlers === undefined || !curEventHandlers.length) {
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
        let user = this.initDataUnsafe.user || {}, Funcs = win.OpenADTGJsSDK.functionSent;
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
            'version': win.OpenADTGJsSDK.version,
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
  win.OpenADTGJsSDK.TG.init();
})(document, window);
