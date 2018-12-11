mod={};
let cpts=[];
let allCptLoadFns=[];
mod.loadCpt=function (fn){
  cpts.push(fn);
}
mod.addCptLoad=function (fn){
  allCptLoadFns.push(fn);
}
mod.runCpt=function (){
  for(let i=0;i<cpts.length;i++){
    let cptFn=cpts[i];
    cptFn();
  }
  for(let i=0;i<allCptLoadFns.length;i++){
    let fn=allCptLoadFns[i];
    fn();
  }
}

// 自定义事件
let MEventItem=function (type){
  this.type=type;
  // flag: fn
  this.list=[];
  this.mFC={};
}
MEventItem.prototype.triggle=function (thisObj,data){
  let el=this.list;
  for(let i=0;i<el.length;i++){
    let fn=el[i];
    fn&&fn.call(thisObj,data);
  }
}
MEventItem.prototype.addFn=function (flag,fn){
  let el=this.list;
  if(!el[flag]&&fn){
    this.mFC[flag]=el.length;
    el.push(fn);
    return true;
  }
  return false;
}
MEventItem.prototype.rmFn=function (flag){
  let el=this.list;
  let idx=this.mFC[flag];
  if(typeof idx==='number'){
    Reflect.deleteProperty(this.mFC,flag);
    el.splice(idx,1);
    return true;
  }
  return false;
}
let MEvent=function (){
  // type: MEventItem
  let list={};
  this.addFn=function (type,flag,fn){
    let eI=list[type];
    if(!eI){
      list[type]=new MEventItem(type);
      eI=list[type];
    }
    eI.addFn(flag,fn);
  }
  this.rmFn=function (type,flag){
    let eI=list[type];
    if(eI){
      eI.rmFn(flag);
      if(eI.list.length===0){
        Reflect.deleteProperty(list,type);
      }
      return true;
    }
    return false;
  }
  this.triggle=function (type,data){
    let eI=list[type];
    if(eI){
      eI.triggle(this,data);
      return true;
    }
    return false;
  }
}
mod.MEvent=MEvent;
let mEvent=new MEvent();

// 定义get和set方法
let $define=function (thisObj,_getProps,_setProps){
  let prop={};
  let getProps=_getProps||{};
  let setProps=_setProps||{};
  for(let key in getProps){
    let prop={};
    if(getProps[key]){
      prop.get=getProps[key];
    }
    if(setProps[key]){
      prop.set=setProps[key];
      delete setProps[key];
    }
    Reflect.defineProperty(thisObj,key,prop);
  }
  for(let key in setProps){
    Reflect.defineProperty(thisObj,key,{
      set: setProps[key],
    });
  }
}
Object.defineProperty(window,'$define',{
  get: function (){
    return $define;
  },
});

$define(window,{
  $isPC: function (){
    return function () {
      var sUserAgent = navigator.userAgent.toLowerCase();
      var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
      var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
      var bIsMidp = sUserAgent.match(/midp/i) == "midp";
      var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
      var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
      var bIsAndroid = sUserAgent.match(/android/i) == "android";
      var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
      var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
      if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        return false;
      } else {
        return true;
      }
    }
  },
});

addEventListener('load',function (){
  let customSty=document.querySelector('style.custom');
  let head=document.querySelector('head');
  if(!customSty){
    customSty=document.createElement('style');
    customSty.className='custom';
    head.appendChild(customSty);
  }
  let sheet=customSty.sheet;
  let sty={};
  let insertRules=function (rules){
    let cssT="";
    for(let stor in rules){
      cssT+=stor+"{";
      for(let key in rules[stor]){
        cssT+=key+":"+rules[stor][key]+";";
      }
      cssT+="}";
      sheet.insertRule(cssT,0);
      sty[stor]=sheet.cssRules[0];
      cssT='';
    }
  }
  let stor=function (selector){
    if(!sty[selector]){
      let o={};
      o[selector]={};
      insertRules(o);
    }
    return sty[selector];
  }

  // cookie设置
  let setCookie=function (cname, cvalue, exdays){
    var d=new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires="expires="+d.toUTCString();
    document.cookie=cname+"="+cvalue+"; "+expires;
  }
  // 格式别名对应的格式头标识
  let headerFlagMap={
    json: "application/json",
    form: "application/x-www-form-urlencoded",
  };
  // 格式转换的对应方法
  let methodOfChangeDataMap={
    json: function (d){
      return JSON.stringify(d);
    },
    form: function (d){
      let ret='';
      let quot='';
      for(let i in d){
        ret+=quot+i+"="+d[i];
        quot='&';
      }
      return ret;
    },
  };

  let $ajax=function (method,url,_param){
    let xhr=new XMLHttpRequest();
    let param=_param||{};
    let format='form';
    xhr.onreadystatechange=function (){
      if(xhr.readyState===4&&xhr.status===200){
        param.after&&param.after(xhr.responseText);
      }
    }
    xhr.open(method,url);
    if(headerFlagMap[param.format]){
      format=param.format;
    }
    xhr.setRequestHeader("Content-Type",headerFlagMap[format]);
    param.before&&param.before(xhr)
    xhr.send(param.data&&methodOfChangeDataMap[format](param.data));
  }

  // 获取匹配的第一个节点
  let g=function (obj,stor){
    return obj.querySelector(stor);
  }
  // 获取所有节点
  let gall=function (obj,stor){
    return obj.querySelectorAll(stor);
  }
  const Cls=function (flag){
    if(!this.extChan){
      let extChan={};
      let evFlag={};

      let $addEvF=function (f){
        if(typeof evFlag[f]==='undefined'){
          evFlag[f]=f;
        }
      }
      let $rmEvF=function (f){
        if(typeof evFlag[f]!=='undefined'){
          delete evFlag[f];
        }
      }
      let $cEvF=function (f){
        return evFlag[f];
      }

      $define(this.constructor.prototype,{
        $sa: function (){
          return function (data){
            let o={};
            for(let i in data){
              o[i]=function (){
                return o[i];
              }
            }
            return o;
          }
        },
        $gs: function(){
          return function (gprops,sprops){
            return $define(this,gprops,sprops);
          }
        },
      });
    }
    let name=this.constructor.name;
    this.extChan[name]=name;
    this.extChan[flag]=flag;
  }
  let add=function (pN,n){
    pN.appendChild(n);
  }
  let addBefore=function (pN,n,bN){
    pN.insertBefore(n,bN);
  }
  let replace=function (pN,oN,nN){
    pN.replaceChild(nN,oN);
  }
  // 移除节点
  let rm=function (pN,n){
    pN.removeChild(n);
  }
  $define(HTMLElement.prototype,{
    $: function (){
      return function (stor){
        return g(this,stor);
      }
    },
    $all: function (){
      return function (stor){
        return gall(this,stor);
      }
    },
    $rm: function (){
      return function (cN){
        return rm(this,cN);
      }
    },
    $add: function (){
      return function (cN){
        return add(this,cN);
      }
    },
    $addBefore: function (){
      return function (cN,bN){
        return addBefore(this,cN,bN);
      }
    },
    $replace: function (){
      return function (nN){
        return replace(this.parentNode,this,nN);
      }
    },
    $addEvt: function (){
      return function (et,fn,b){
        return this.addEventListener(et,fn,b);
      }
    },
    $rmEvt: function (){
      return function (et,fn,b){
        return this.removeEventListener(et,fn,b);
      }
    },
    $addEvtC: function (){
      if(!this.mEvent){
        this.mEvent=new MEvent();
      }
      return this.mEvent.addFn;
    },
    $rmEvtC: function (){
      if(!this.mEvent){
        this.mEvent=new MEvent();
      }
      return this.mEvent.rmFn;
    },
    $triggle: function (){
      if(!this.mEvent){
        this.mEvent=new MEvent();
      }
      return this.mEvent.triggle;
    },
  });
  $define(window,{
    $: function (){
      return function (stor){
        return g(document,stor);
      }
    },
    $all: function (){
      return function (stor){
        return gall(document,stor);
      }
    },
    $cd: function (){
      return function (dt,clsName){
        let d=document.createElement(dt);
        clsName&&(d.className=clsName);
        return d;
      }
    },
    $rm: function (){
      return function (pN,n){
        return rm(pN,n);
      }
    },
    $add: function (){
      return function (pN,n){
        return add(pN,n);
      }
    },
    $addBefore: function (){
      return function (pN,n,bN){
        return addBefore(pN,n,bN);
      }
    },
    $replace: function (){
      return function (oN,nN){
        return replace(oN.parentNode,oN,nN);
      }
    },
    $addEvt: function (){
      return function (et,fn,b){
        return addEventListener(et,fn,b);
      }
    },
    $rmEvt: function (){
      return function (et,fn,b){
        return removeEventListener(et,fn,b);
      }
    },
    $addEvtC: function (){
      return mEvent.addFn;
    },
    $rmEvtC: function (){
      return mEvent.rmFn;
    },
    $triggle: function (){
      return mEvent.triggle;
    },
    $stor: function (){
      return function (selector){
        return stor(selector);
      }
    },
    // 颜色
    $rgba: function (){
      return function (r,g,b,a){
        return 'rgba('+[r,g,b,a].join(',')+')';
      }
    },
    $ajax: function (){
      return $ajax;
    },
    $setCookie: function (){
      return setCookie;
    },
  });


  mod.runCpt();
});

