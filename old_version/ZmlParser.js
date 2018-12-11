mod.loadCpt(function (){
  let atrSimpleMap={
    'text': 'textContent',
    'class': 'className',
    'for': 'htmlFor',
  }
  let symSimpleMap={
    '.': 'className',
    '#': 'id',
    '~': 'textContent',
    '@': 'href',
    '-': 'src',
    '*': 'charset',
    '^': 'charset',
  }
  let keyWord={
    'for': true,
    'if': true,
  }
  let ZmlParser=function (){
    let key='',keyType='';
    // 当前原子组的性质
    let atomGroupProperty='';
    let prvChar='',curChar='',ltChar='';
    let prvAtom='',curAtom='',ltAtom='';
    let isNormal=false;
    let isNum=false;
    let quot='';
    let tree={};
    let curObj=null;
    let scope=[];
    let SPACE={
      ' ': true,
      '\t': true,
      '\n': true,
      '\0': true,
    }
    let QUOT={
      '\'': true,
      '"': true,
    }
    let ZMLTYPE={
      'string': true,
      'boolean': true,
      'number': true,
    }
    let funcSymbol={
      '{': true,
      '}': true,
      ':': true,
      '\'': true,
      '=': true,
      '*=': true,
      '"': true,
      ',': true,
      '$': true,
    }
    let propertySymbol={
      ':': true,
      '=': true,
      '*=': true,
    }
    let simpleSymbol={
      '^': true,
      '~': true,
      '`': true,
      '!': true,
      '@': true,
      '#': true,
      '$': true,
      '%': true,
      '&': true,
      '*': true,
      '(': true,
      ')': true,
      '_': true,
      '+': true,
      '-': true,
      '=': true,
      '[': true,
      ']': true,
      '{': true,
      '}': true,
      ';': true,
      '\\': true,
      ':': true,
      '|': true,
      ',': true,
      '.': true,
      '/': true,
      '<': true,
      '>': true,
      '?': true,
    }
    let isType=function (t){
      return ZMLTYPE[t];
    }
    let isS=function (c){
      return SPACE[c]||false;
    }
    let isQ=function (c){
      return QUOT[c]||false;
    }
    let setAttr=function (DOM,key,value){
      if(Reflect.has(DOM,key)){
        DOM[key]=value;
      }else{
        DOM.setAttribute(key,value);
      }
    }
    // 使用原子上下文构建DOM
    // 需要分别指定前一个原子，当前原子和下一个原子
    let build=function (pA,cA,lA){
      if(cA.type==='funcSymbol'&&cA.value===':'){
        let d=document.createElement(lA.value);
        tree[pA.value]=d;
        curObj=d;
        if(scope.length>0){
          scope[scope.length-1].appendChild(d);
        }
      }else if(pA.type==='space'&&cA.type==='string'&&lA.type==='space'){
        // _div_
        let d=document.createElement(cA.value);
        curObj=d;
        if(scope.length>0){
          scope[scope.length-1].appendChild(d);
        }
      }else if(pA.type==='space'&&cA.type==='simpleSymbol'&&isType(lA.type)){
        let key=symSimpleMap[cA.value];
        if(curObj&&key){
          setAttr(curObj,key,lA.value);
        }
      }else if(pA.type==='string'&&cA.type==='funcSymbol'&&isType(lA.type)){
        let value,key=pA.value;
        if(lA.type==='number'){
          value=lA.value*1;
        }else if(lA.type==='boolean'){
          if(lA.value==='t'){
            value=true;
          }else{
            value=false;
          }
        }else{
          value=lA.value;
        }
        if(cA.value==='='){
          let _=atrSimpleMap[pA.value];
          if(typeof _!=='undefined'){
            key=_;
          }
        }
        if(curObj){
          setAttr(curObj,key,value);
        }
      }else if(pA.type==='space'&&cA.type==='funcSymbol'&&cA.value==='{'&&lA.type==='space'){
        scope.push(curObj);
      }else if(pA.type==='space'&&cA.type==='funcSymbol'&&cA.value==='}'&&lA.type==='space'){
        scope.pop();
      }
    }
    // 原子组合器，构建原子，将分散的字符组合成原子
    // 需要指定类型和字符
    let atomCombiner=function (type,char){
      if(type!==keyType){
        if(atomGroupProperty===''&&(propertySymbol[char]||simpleSymbol[char])){
          atomGroupProperty=char;
        }else if(type===' '){
          atomGroupProperty='';
        }

        // 类型判断
        if(isNum){
          key.type='number';
        }else if(key.value==='false'||key.value==='true'){
          key.type='boolean';
          key.value=key.value[0];
        }else if(key.value===' '){
          key.type='space';
        }else if(keyType[0]==='_'){
          key.type='simpleSymbol';
        }else if(funcSymbol[key.value]){
          key.type='funcSymbol';
        }else{
          key.type='string';
        }

        ltAtom=key;
        build(prvAtom,curAtom,ltAtom);
        prvAtom=curAtom;
        curAtom=ltAtom;
        key={
          type: 'unknow',
          value: '',
        }
        isNum=true;
        isAtomGProStrStart=false;
        keyType=type;
      }
      let chCode=char.charCodeAt(0);
      if(chCode<48||chCode>57){
        isNum=false;
      }
      key.value+=char;
    }
    // 根据上下文收集构成原子的字符序列
    // 需要分别指定前一个字符，当前字符和下一个字符
    let collection=function (pC,cC,lC){
      if(cC==='\0'){
        // 结束标识
        atomCombiner('end','');
      }else if(isQ(cC)){
        if((atomGroupProperty===''||isAtomGProStrStart)&&quot===''){
          // 开口
          quot=cC;
        }else if(isNormal){
          atomCombiner('key',cC);
        }else if(quot===cC){
          // 封口
          quot='';
        }else{
          atomCombiner('key',cC);
        }
      }else if(isQ(quot)){
        if(cC==='^'&&!isNormal){
          isNormal=true;
        }else{
          atomCombiner('key',cC);
          isNormal=false;
        }
      }else if(isS(pC)&&simpleSymbol[cC]&&(!isS(lC))&&atomGroupProperty===''){
        atomCombiner('_'+cC,cC);
        if(isQ(lC)){
          isAtomGProStrStart=true;
        }
      }else if(funcSymbol[cC]&&atomGroupProperty===''){
        if(pC==='*'&&cC==='='){
          atomCombiner('*=','*=');
        }else{
          atomCombiner(cC,cC);
        }
        if(isQ(lC)){
          isAtomGProStrStart=true;
        }
      }else if(isS(cC)){
        // 连续空白字符视为一个空格字符
        if(!isS(pC)){
          atomCombiner(' ',' ');
        }
      }else if(!(cC==='*'&&lC==='=')){
        atomCombiner('key',cC);
      }
    }
    // 是否提前结束了
    let isBeforeOver=false;
    this.parse=function (zmlSrc){
      for(let i=0;i<zmlSrc.length;i++){
        let c=zmlSrc[i];
        ltChar=c;
        collection(prvChar,curChar,ltChar);
        prvChar=curChar;
        curChar=ltChar;
        // 结束符号
        if(c==='\0'){
          collection(prvChar,curChar,'\0');
          collection(curChar,'\0','');
          isBeforeOver=true;
          break;
        }
      }
      if(!isBeforeOver){
        collection(prvChar,curChar,'\0');
        collection(curChar,'\0','');
      }
      return this;
    }
    this.getTree=function (){
      return tree;
    }
  }
  ZmlParser.prototype.configSymbol=function (){
    if(config){
      symSimpleMap=config;
    }
    return this;
  }
  ZmlParser.prototype.configShorthand=function (config){
    if(config){
      atrSimpleMap=config;
    }
    return this;
  }
  mod.ZmlParser=ZmlParser;
});

