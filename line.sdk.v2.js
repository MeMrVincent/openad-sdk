/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(doc, win) {
  win.OpenADLineJsSDK = {
    version: '2.0.0',
    build: '202507200938',
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
          dom.innerHTML = `<a href="javascript:void(0);" style="display: block;" onclick="window.OpenADLineJsSDK.banner.click({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })"><img src="${RES['resource_url']}" style="max-width: 100%;max-height: 100%;display: block;"></a>`;
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
        return await win.OpenADLineJsSDK.functionSent.get({ ...data });
      },
      getRender: function(data){
        const { adInfo, cb, clickReward } = data, _this = win.OpenADLineJsSDK;
        _this.Line.clickReward = null;
        if(!clickReward && !_this.Line.type.includes('WEB')){
          return { code: -402, msg: `click reward method is required when ${_this.Line.type} mode in getRender parameters !` };
        }
        const { zoneId, publisherId } = adInfo;
        let RES = win.OpenADLineJsSDK.resources[`${publisherId}_${zoneId}`], lan = RES.params.language, OS = RES.params.platform, isFullscreen = RES.params.isFullscreen || win.OpenADLineJsSDK.Line.isFullscreen;
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
        win.OpenADLineJsSDK.resources[`${publisherId}_${zoneId}`].cb = cb;
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
           <div class="right close" onclick="window.OpenADLineJsSDK.interactive.interrupt()">` :
          `<div class="left clock">${'00:'+this.times.count}</div>
           <div class="right close" onclick="window.OpenADLineJsSDK.interactive.cbClose()">`;
        dom.innerHTML = '';
        dom.innerHTML +=
            `<div class="InteractiveAdActions ${OS === 'IOS' && isFullscreen ? 'FullScreen' : 'MainScreen'}">
                ${dynamicHtml}
                   <img src="${window.OpenADLineJsSDK.staticURL}/close.png" alt="" />
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
              '<div class="InteractiveAdContent" onclick="window.OpenADLineJsSDK.interactive.cbLog(\'click\')">'+
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
                      <i class="Flex" onclick="window.OpenADLineJsSDK.interactive.cbClose()">
                         ${this[this.lan].cancel}
                      </i>
                      <i class="Flex" onclick="window.OpenADLineJsSDK.interactive.continue({ 'zoneId':${zoneId}, 'publisherId':${publisherId} })">
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
          return win.OpenADLineJsSDK.GPT.init();
        }
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
      cbClose: function (){
        let { adInfo, cb, RES } = this.current, type = RES.type === 'system' ? 'close' : 'view';
        cb = cb || win.OpenADLineJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
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
        cb = cb || win.OpenADLineJsSDK.resources[`${adInfo.publisherId}_${adInfo.zoneId}`].cb || {};
        cb.onAdTaskFinished && cb.onAdTaskFinished(true);
        this.countDown(adInfo);
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
                params: { ...params, isFullscreen: _this.Line.isFullscreen || false },
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
      loadJs: function (obj){
        /** https://github.com/MeMrVincent/async-load-script **/
      },
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
        let _this = win.OpenADLineJsSDK, obj = {
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
            return { code: -310, msg: 'Please use the standard mode to integrate OpenAD Line Js SDK!' };
          }
          dom.id = $AD.dom;
          $scale = dom.offsetWidth / $AD.w;
        }
        if(_this.slot.type === 2){
          dom = document.querySelector(`#${$AD.dom}`);
          $scale = dom.offsetWidth / $AD.w;
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
                    win.OpenADLineJsSDK.interactive.GPT();
                  }
                  if (event.isEmpty) {
                    return reject({ code: -303, msg: 'No GPT Ads Available !' }); // Ad is empty, Promise resolves to false
                  }
                });
                window.googletag.pubads().addEventListener('slotOnload', function (event) {
                  if (event.slot.getSlotElementId() !== $AD.dom) {
                    return { code: -302, msg: `Failed To Find Html Element ${$AD.dom}` }; // Ensure it is the current ad slot
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