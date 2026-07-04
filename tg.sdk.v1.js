/**Jquery.1.11.1.ajax.min.js  https://github.com/MeMrVincent/jq-ajax**/
(function(d, c) {
  let a = '6fced4eee9927b57847cf8dce447ceac';
  c.reviveAsync = c.reviveAsync || {};
  (function(e) {
    if (typeof e.CustomEvent === 'function') {
      return false
    }

    function g(i, j) {
      j = j || {
        bubbles: false,
        cancelable: false,
        detail: undefined,
      };
      let h = document.createEvent('CustomEvent');
      h.initCustomEvent(i, j.bubbles, j.cancelable, j.detail);
      return h
    }
    g.prototype = e.Event.prototype;
    e.CustomEvent = g
  })(c);
  try {
    if (!Object.prototype.hasOwnProperty.call(c.reviveAsync, a)) {
      const f = c.reviveAsync[a] = {
        id: Object.keys(c.reviveAsync).length,
        name: 'revive',
        seq: 0,
        main: function () {
          let e = function () {
            let g = false;
            try {
              if (!g) {
                g = true;
                d.removeEventListener('DOMContentLoaded', e, false);
                c.removeEventListener('load', e, false);
                f.addEventListener('start', f.start);
                f.addEventListener('refresh', f.refresh);
                f.dispatchEvent('start', { start: true });
              }
            } catch (h) {
              console.log('main err', h);
            }
          };
          f.dispatchEvent('init');
          if (d.readyState === 'complete') {
            setTimeout(e)
          } else {
            d.addEventListener('DOMContentLoaded', e, false);
            c.addEventListener('load', e, false);
          }
        },
        APP: {},
        openAdExtend: {
          isIframe: window.parent !== null && window !== window.parent,
          key: 'openADSDK',
          dom: null,
          img: {
            width: '',
            height: '',
            src: '',
            href: '',
            cb: '',
          },
          userInfo: {},
          adInfo: {},
          params: {
            timeStamp: null,
            referer: window.location.origin+window.location.pathname,
            loc: window.location.href.substring(0, window.location.href.indexOf('?')) || window.location.href,
          },
          log: function(){
            let urlParams = {}, openAdExtend = f.openAdExtend, img = openAdExtend.img;
            let parser = new URL(img.cb);
            let queryString = new URLSearchParams(parser.search);
            queryString.forEach((value, key) => {
              urlParams[key] = value;
            });
            const { bannerid, campaignid, zoneid, cb } = urlParams;
            let url = img.cb.substring(0, img.cb.indexOf('?'))+f.Obj2String({ bannerid, campaignid, zoneid, cb, ...openAdExtend.userInfo, ...openAdExtend.params });
            window.J$.ajax({
              method: 'get',
              url: url,
              async: true,
              dataType: 'json',
              success: () => {},
              error: () => {},
            });
          },
          click: function (){
            let openAdExtend = f.openAdExtend, img = openAdExtend.img;
            let t = img.href.indexOf('&dest='), cbUrl = img.href.substring(0, t), href = img.href.substring(t+6);
            window.J$.ajax({
              method: 'get',
              url: cbUrl+(f.Obj2String({ ...openAdExtend.userInfo, ...openAdExtend.params }).replace('?', '&')),
              async: true,
              dataType: 'html',
              success: () => { },
              error: () => { },
            });
            openAdExtend.open(href);
          },
          open: function(url){
            let openAdExtend = f.openAdExtend, isTgURL = url.startsWith('https://t.me/'), isInTg = openAdExtend.userInfo.Cid !== 'browser';
            if(isInTg){ /** In Telegram environment **/
              if(isTgURL){ /** TG URL, open with internal method **/
                f.APP.openTelegramLink(url);
              }else{ /** Non-TG URL, open with external browser **/
                f.APP.openLink(url);
              }
            }
            if(!isInTg){ /** Non-Telegram environment, open with native method **/
              window.open(url);
            }
          },
        },
        start: function (g) {
          if (g.detail && Object.prototype.hasOwnProperty.call(g.detail, 'start') && !g.detail.start) {
            return
          }
          f.removeEventListener('start', f.start);
          f.dispatchEvent('refresh');
        },
        refresh: function (g) {
          if(g){
            let key = f.openAdExtend.key;
            if(window.Telegram && window.Telegram.WebApp){
              window[key] = window.Telegram;
              f.initSDK(key);
            }else if(window[key]){
              f.initSDK(key);
            } else {
              window.J$.ajax({
                method: 'get',
                url: 'https://corsproxy.io/?'+encodeURIComponent('https://telegram.org/js/telegram-web-app.js'),
                async: true,
                dataType: 'text',
                jsonp: 'callback',
                success: (res) => {
                  res = res.replace(/window.Telegram/g, 'window.'+key);
                  let body = document.querySelector('body');
                  let script = document.createElement('script');
                  script.setAttribute('type', 'text/javascript');
                  script.setAttribute('name', key);
                  script.text = res;
                  body.appendChild(script);
                  f.initSDK(key);
                },
                error: () => {
                  console.log('request telegram js error');
                  f.apply(f.getZones());
                },
              });
            }
          }else{
            console.log('no telegram apply');
            f.apply(f.getZones());
          }
        },
        initSDK: function(key){
          window[key].WebApp.ready();
          f.APP = window[key].WebApp || {};
          f.apply(f.getZones());
        },
        getZones: function(){
          if(f.openAdExtend.adInfo.zones) {
            return false;
          }
          let e = d.querySelector('ins[' + f.getDataAttr('id') + '=\'' + a + '\']');
          f.openAdExtend.dom = e;
          f.openAdExtend.params.timeStamp = new Date().valueOf();
          return {
            zones: e?.getAttribute(f.getDataAttr('zoneid')),
            prefix: f.name + '-' + f.id + '-'+a,
          };
        },
        apply: function (g) {
          if (g.zones) {
            f.openAdExtend.adInfo = g;
            let e = 'http:' === d.location.protocol ? 'http://alpha.openad.network/www/delivery/asyncspc.php' : 'https://alpha.openad.network/www/delivery/asyncspc.php';
            let user = f.APP.initDataUnsafe.user || {};
            let UA = f.getBrowserInfo();
            f.openAdExtend.userInfo = {
              Cid: user.id || 'browser',
              FirstName: user.id ? (user['first_name'] || 'FN'+user.id) : 'browser',
              LastName: user.id ? (user['last_name'] || 'LN'+user.id) : 'browser',
              UserName: user.id ? (user['username'] || 'UN'+user.id) : 'browser',
              lan: user.id ? user['language_code'] : c.navigator.language,
              V: user.id ? f.APP.version : UA.fullVersion,
              platform: user.id ? f.APP.platform : UA.browserName,
              fromType: 'script',
            };
            f.getAdContent(e);
          }
        },
        getAdContent: function (e) {
          window.J$.ajax({
            method: 'get',
            url: e+f.Obj2String({ ...f.openAdExtend.adInfo, ...f.openAdExtend.userInfo, ...f.openAdExtend.params }),
            async: true,
            dataType: 'json',
            success: (res) => {
              let d = res[f.openAdExtend.adInfo.prefix+'0'];
              let img = {
                width: d.width,
                height: d.height,
              }
              d = f.extractLinks(d.html);
              img = {
                ...img,
                src: d.srcs[0],
                href: d.hrefs[0],
                cb: d.srcs[1],
              }
              if(!img.src || !img.href || !img.cb || !img.width || !img.height){
                return false;
              }
              f.openAdExtend.img = img;
              f.insertHtml();
            },
            error: () => {
              console.log('request ad content error');
            },
          });
        },
        insertHtml: function() {
          let openADNode = f.openAdExtend.dom,
            img = f.openAdExtend.img;
          openADNode.innerHTML = `
            <a href="javascript:void(0);" onclick="openAdClickCallBack()">
              <img src="${img.src}" width="${img.width}" height="${img.height}" style="max-width: 100%;max-height: 100%;object-fit: contain;">
            </a>
          `;
          window.openAdClickCallBack = f.openAdExtend.click;
          f.openAdExtend.log();
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
        getDataAttr: function (e) {
          return 'data-' + f.name + '-' + e;
        },
        getEventName: function (e) {
          return this.name + '-' + a + '-' + e;
        },
        addEventListener: function (e, g) {
          d.addEventListener(this.getEventName(e), g)
        },
        removeEventListener: function (e, g) {
          d.removeEventListener(this.getEventName(e), g, true)
        },
        dispatchEvent: function (e, g) {
          d.dispatchEvent(new CustomEvent(this.getEventName(e), {
            detail: g || {},
          }))
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
        getBrowserInfo: function () {
          let UA = c.navigator.userAgent;
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
      };
      f.main();
    }
  } catch (b) {
    if (console.log) {
      console.log(b)
    }
  }
})(document, window);