/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(doc, win) {
  const openADSDK = {
    version: '2.9',
    build: '202410272132',
    APP: null,
    etag: '6fced4eee9927b57847cf8dce447ceac',
    env: {
      hasTelegramJs: false,
      hasThirdPartySDK: false,
      openAdExtend: false,
    },
    userInfo: {},
    params: {
      timeStamp: null,
      referer: win.location.origin+win.location.pathname,
      loc: win.location.href.substring(0, win.location.href.indexOf('?')) || win.location.href,
    },
    init: async function(adInfo){
      adInfo = {
        zones: adInfo.zoneId,
        prefix: 'revive-' + adInfo.zoneId + '-'+adInfo.reviveId,
      };
      this.params.timeStamp = new Date().valueOf();
      let key = 'openAdExtend';
      if(this.APP){
        return await this.getAD.cb(this, adInfo);
      }
      if(win.Telegram){
        if(win.Telegram.WebApp){
          this.env.hasTelegramJs = true;
          win.Telegram.WebApp.ready();
          this.APP = win.Telegram.WebApp;
        }else{
          this.env.hasThirdPartySDK = true;
        }
      }
      if(win[key]){
        this.env[key] = true;
        this.APP = win[key].WebApp;
      }
      if(!this.APP){
        let d = await this.loadExtendJS(key);
        if(d === true){
          this.env[key] = true;
          win[key].WebApp.ready();
          this.APP = win[key].WebApp;
        }else{
          return d;
        }
      }
      return await this.getAD.cb(this, adInfo);
    },
    getAD: {
      url: "https://alpha.openad.network/www/delivery/asyncspc.php",
      cb: function(_this, adInfo){
        _this.userInfo = _this.getUserInfo();
        return this.ajax(_this, adInfo);
      },
      ajax: async function (_this, adInfo){
        let error = { code: -2, msg: 'get openAD ads error!' };
        try {
          let res = await _this.ajax(_this.getAD.url+_this.Obj2String({ ...adInfo, ..._this.userInfo, ..._this.params }), 'json');
          if(res && Array.isArray(res)){
            return error;
          }
          let d = res[adInfo.prefix+'0'] || {};
          let img = {
            width: d.width,
            height: d.height,
          }
          d = _this.extractLinks(d.html);
          img.src = d.srcs[0];
          _this.click.url = d.hrefs[0];
          _this.log.url = d.srcs[1];
          if(!img.src || !img.width || !img.height || !_this.click.url || !_this.log.url){
            return { code: -3, msg: 'No openAD Ads available yet!' };
          }
          let l = _this.getURLParam({}, _this.log.url);
          let c = _this.getURLParam({}, _this.click.url);
          img = { ...img, ...l, ...c };
          _this.click.link[adInfo.zones] = _this.click.url.substring(_this.click.url.indexOf('dest=')+5);
          delete img.dest;
          _this.log.url = _this.log.url.substring(0, _this.log.url.indexOf('?'));
          _this.click.url = _this.click.url.substring(0, _this.click.url.indexOf('?'));
          _this.log.cb(_this, img);
          return { code: 0, data: img };
        } catch (e) {
          return error;
        }
      },
    },
    log: {
      url: '',
      cb: function(_this, img){
        let params = {
          bannerid: img.bannerid, campaignid: img.campaignid, zoneid: img.zoneid, cb: img.cb,
          ..._this.userInfo,
          ..._this.params,
        }, info = 'send log msg to server success!';
        _this.ajax(this.url+_this.Obj2String(params), 'json').then(res => {
          console.log('log', res);
        }).catch(e => {
          console.log('log', e);
        }).finally(() => {
          console.log(info);
        });
      },
    },
    click: {
      url: '',
      link: { },
      cb: function(params, openFn){
        let _this = openADSDK;
        params = { ...params, ..._this.userInfo, ..._this.params };
        _this.ajax(this.url+_this.Obj2String(params), 'html').then(() => {
          console.log('click', true);
        }).catch(() => {
          console.log('click', false);
        }).finally(() => {
          console.log('send click msg to sever success!');
        });
        this.open(_this, openFn, params.zoneid);
      },
      open: function(_this, openFn, zoneId){
        openFn = openFn || _this.APP;
        let url = this.link[zoneId], isTgURL = url.includes('t.me') || url.includes('tg//');
        if(isTgURL){
          openFn.openTelegramLink(url);
        }else{
          openFn.openLink(url);
        }
      },
    },
    getUserInfo: function(){
      let user = this.APP.initDataUnsafe?.user || {};
      let UA = this.getBrowserInfo();
      return {
        Cid: user.id || 'browser',
        FirstName: user.id ? (user['first_name'] || 'FN'+user.id) : 'browser',
        LastName: user.id ? (user['last_name'] || 'LN'+user.id) : 'browser',
        UserName: user.id ? (user['username'] || 'UN'+user.id) : 'browser',
        lan: user.id ? user['language_code'] : win.navigator.language,
        V: user.id ? this.APP.version : UA.fullVersion,
        platform: user.id ? this.APP.platform : UA.browserName,
        fromType: 'script',
      }
    },
    loadExtendJS: async function(key){
      let error = { code: -1, msg: 'load extend js error!' };
      try {
        let res = await this.ajax('https://corsproxy.io/?'+encodeURIComponent('https://telegram.org/js/telegram-web-app.js'), 'text');
        if(res.includes('404')){
          return error;
        }
        res = res.replace(/window.Telegram/g, 'window.'+key);
        let body = document.querySelector('body');
        let script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('name', key);
        script.async = true;
        script.text = res;
        body.appendChild(script);
        return true;
      } catch (e) {
        return error;
      }
    },
    ajax: function(url, dataType){
      return new Promise((resolve, reject) => {
        window.J$.ajax({
          method: 'get',
          url: url,
          dataType,
          async: true,
          success: (res) => {
            return resolve(res);
          },
          error: () => {
            return reject(false);
          },
        });
      });
    },
    extractLinks: function(html){
      let hrefs = [];
      let hrefRegex = /href=['"]([^'"]*)['"]/g;
      let hrefMatch;
      while ((hrefMatch = hrefRegex.exec(html)) !== null) {
        hrefs.push(decodeURIComponent(hrefMatch[1]).replaceAll('&amp;', '&'));
      }

      let srcs = [];
      let srcRegex = /<img[^>]+src=['"]([^'"]*)['"]/g;
      let srcMatch;
      while ((srcMatch = srcRegex.exec(html)) !== null) {
        srcs.push(decodeURIComponent(srcMatch[1]).replaceAll('&amp;', '&'));
      }

      return {
        hrefs: hrefs,
        srcs: srcs,
      };
    },
    getBrowserInfo: function () {
      let UA = win.navigator.userAgent;
      let browserName = 'Unknown';
      let fullVersion = 'Unknown';

      // Chrome
      if (/Chrome/.test(UA) && /Google Inc/.test(navigator.vendor)) {
        browserName = 'Chrome';
        fullVersion = UA.match(/Chrome\/([\d.]+)/)[1];
        // eslint-disable-next-line brace-style
      }
      // Safari
      else if (/Safari/.test(UA) && /Apple Computer/.test(navigator.vendor)) {
        browserName = 'Safari';
        fullVersion = UA.match(/Version\/([\d.]+)/)[1];
        // eslint-disable-next-line brace-style
      }
      // Firefox
      else if (/Firefox/.test(UA)) {
        browserName = 'Firefox';
        fullVersion = UA.match(/Firefox\/([\d.]+)/)[1];
        // eslint-disable-next-line brace-style
      }
      // Edge
      else if (/Edg/.test(UA)) {
        browserName = 'Edge';
        fullVersion = UA.match(/Edg\/([\d.]+)/)[1];
        // eslint-disable-next-line brace-style
      }
      // IE
      else if (/Trident/.test(UA)) {
        browserName = 'Internet Explorer';
        fullVersion = UA.match(/rv:([\d.]+)/)[1];
        // eslint-disable-next-line brace-style
      }
      // Opera
      else if (/OPR/.test(UA)) {
        browserName = 'Opera';
        fullVersion = UA.match(/OPR\/([\d.]+)/)[1];
      }

      return {
        browserName: browserName,
        fullVersion: fullVersion,
      };
    },
    Obj2String: function (Obj) {
      let string = '', t = 0, NewObj = JSON.parse(JSON.stringify(Obj));
      for (let p in NewObj) {
        if (NewObj[p].toString() === '0' || NewObj[p].toString() === 'false' || !!NewObj[p]) {
          t++;
          if (t === 1) {
            string += '?'
          } else {
            string += '&'
          }
          string += p + '=' + NewObj[p];
        }
      }
      return string;
    },
    getURLParam: function (parameter, String) {
      let url = decodeURIComponent(String), params = {}, t, t1, t2, t3;
      t1 = url.indexOf('?');
      t2 = url.indexOf('#/');
      if(t2 > t1){
        let s = url.slice(t1+1, t2);
        url = url.slice(t2);
        t3 = url.indexOf('?');
        if(t3 > -1){
          s += '&'+url.slice(t3+1);
        }
        url = s;
      }else{
        url = url.slice(t1+1);
      }
      url = url.split('&');
      for(let i=0;i<url.length;i++){
        if(url[i].length > 0 && url[i].indexOf('=') > 0){
          t = url[i].indexOf('=');
          params[url[i].slice(0,t)] = url[i].slice(t+1);
        }
      }
      if(typeof parameter === 'string'){
        for(let key in params){
          if(key === parameter){
            return params[key];
          }
        }
      }else if(parameter instanceof Object){
        return params;
      }
    },
  };
  win.openADSDK = openADSDK;
})(document, window);