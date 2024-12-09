// TypeIt by Alex MacArthur - https://typeitjs.com
(function(E,w){typeof exports=="object"&&typeof module<"u"?module.exports=w():typeof define=="function"&&define.amd?define(w):(E=typeof globalThis<"u"?globalThis:E||self,E.TypeIt=w())})(this,function(){"use strict";var E=e=>Array.isArray(e),w=e=>E(e)?e:[e];let se=function(e){let r=function(c){return w(c).forEach(g=>m.set(Symbol(g.char?.innerText),{...g})),this},l=()=>f().filter(c=>c.typeable),s=function(c,g){let O=[...m.keys()];m.set(O[c],g)},o=function(){m.forEach(c=>delete c.done)},d=function(){m=new Map,r(e)},T=()=>m,f=()=>Array.from(m.values()),p=c=>m.delete(c),b=(c=!1)=>c?f():f().filter(g=>!g.done),x=(c,g=!1)=>g?m.delete(c):m.get(c).done=!0,m=new Map;return r(e),{add:r,set:s,wipe:d,reset:o,destroy:p,done:x,getItems:b,getQueue:T,getTypeable:l}};var W=e=>Array.from(e),R=e=>document.createTextNode(e);let B=e=>([...e.childNodes].forEach(r=>{if(r.nodeValue){[...r.nodeValue].forEach(l=>{r.parentNode.insertBefore(R(l),r)}),r.remove();return}B(r)}),e);var J=e=>{let r=document.implementation.createHTMLDocument();return r.body.innerHTML=e,B(r.body)};const K="data-typeit-id",k="ti-cursor",oe="END",ae={started:!1,completed:!1,frozen:!1,destroyed:!1},ue={breakLines:!0,cursor:!0,cursorChar:"|",cursorSpeed:1e3,deleteSpeed:null,html:!0,lifeLike:!0,loop:!1,loopDelay:750,nextStringDelay:750,speed:100,startDelay:250,startDelete:!1,strings:[],waitUntilVisible:!1,beforeString:()=>{},afterString:()=>{},beforeStep:()=>{},afterStep:()=>{},afterComplete:()=>{}},de=`[${K}]:before {content: '.'; display: inline-block; width: 0; visibility: hidden;}`;function X(e,r=!1){let l=document.createTreeWalker(e,NodeFilter.SHOW_ALL,{acceptNode:d=>d.classList?.contains(k)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),s,o=[];for(;s=l.nextNode();)s.originalParent=s.parentNode,o.push(s);return r?o.reverse():o}function fe(e){return X(J(e))}function ce(e,r=!0){return r?fe(e):W(e).map(R)}var P=e=>document.createElement(e),Y=(e,r="")=>{let l=P("style");l.id=r,l.appendChild(R(e)),document.head.appendChild(l)},G=e=>(E(e)||(e=[e/2,e/2]),e),Z=(e,r)=>Math.abs(Math.random()*(e+r-(e-r))+(e-r));let ee=e=>e/2;function ye(e){let{speed:r,deleteSpeed:l,lifeLike:s}=e;return l=l!==null?l:r/3,s?[Z(r,ee(r)),Z(l,ee(l))]:[r,l]}var pe=e=>(e.forEach(clearTimeout),[]),he=()=>Math.random().toString().substring(2,9),Q=e=>"value"in e;let me=e=>Q(e)?W(e.value):X(e,!0).filter(r=>!(r.childNodes.length>0));var be=(e,r)=>{new IntersectionObserver((s,o)=>{s.forEach(d=>{d.isIntersecting&&(r(),o.unobserve(e))})},{threshold:1}).observe(e)};let C=e=>typeof e=="function"?e():e;var te=e=>Number.isInteger(e);let z=(e,r=document,l=!1)=>r[`querySelector${l?"All":""}`](e),ge=e=>e?.tagName==="BODY",Se=(e,r)=>{if(Q(e)){e.value=`${e.value}${r.textContent}`;return}r.innerHTML="";let l=ge(r.originalParent)?e:r.originalParent||e;l.insertBefore(r,z("."+k,l)||null)},Te=(e,r,l)=>Math.min(Math.max(r+e,0),l.length);var D=(e,r)=>Object.assign({},e,r),F=e=>{if(!e)return;let r=e.parentNode;(r.childNodes.length>1?e:r).remove()},ve=(e,r,l)=>{let s=r[l-1],o=z(`.${k}`,e);e=s?.parentNode||e,e.insertBefore(o,s||null)};function _e(e){return typeof e=="string"?z(e):e}var Ee=e=>/<(.+)>(.*?)<\/(.+)>/.test(e.outerHTML);let we=async(e,r,l)=>new Promise(s=>{let o=async()=>{await e(),s()};l.push(setTimeout(o,r||0))}),Ce={"font-family":"","font-weight":"","font-size":"","font-style":"","line-height":"",color:"","margin-left":"-.125em","margin-right":".125em"},Ne=(e,r,l)=>{let o=`${`[${K}='${e}']`} .${k}`,d=getComputedStyle(l),T=Object.entries(Ce).reduce((f,[p,b])=>`${f} ${p}: var(--ti-cursor-${p}, ${b||d[p]});`,"");Y(`@keyframes blink-${e} { 0% {opacity: 0} 49% {opacity: 0} 50% {opacity: 1} } ${o} { display: inline; letter-spacing: -1em; ${T} animation: blink-${e} ${r.cursorSpeed/1e3}s infinite; } ${o}.with-delay { animation-delay: 500ms; } ${o}.disabled { animation: none; }`,e)};var U=(e,r)=>new Array(r).fill(e);const re=({queueItems:e,selector:r,cursorPosition:l,to:s})=>{if(te(r))return r*-1;let o=new RegExp(oe,"i").test(s),d=r?[...e].reverse().findIndex(({char:f})=>{let p=f.parentElement,b=p.matches(r);return o&&b?!0:b&&p.firstChild.isSameNode(f)}):-1;d<0&&(d=o?0:e.length-1);let T=o?0:1;return d-l+T};let Ie=async(e,r)=>{let l=async()=>e.func?.call(globalThis);e.delay?await r(async()=>{await l()},e.delay):await l()};return function(e,r={}){let l=async(t,n,a=!1)=>{S.frozen&&await new Promise(u=>{this.unfreeze=()=>{S.frozen=!1,u()}}),a||await i.beforeStep(this),await we(t,n,q),a||await i.afterStep(this)},s=()=>Q(y),o=(t=0)=>ye(i)[t],d=()=>me(y),T=(t={})=>{let n=t.delay;n&&h.add({delay:n})},f=(t,n)=>(h.add(t),T(n),this),p=()=>le??N,b=(t={})=>[{func:()=>A(t)},{func:()=>A(i)}],x=t=>{let n=i.nextStringDelay;h.add([{delay:n[0]},...t,{delay:n[1]}])},m=()=>{if(s())return;let t=P("span");return t.className=k,j?(t.innerHTML=J(i.cursorChar).innerHTML,t):(t.style.visibility="hidden",t)},c=async()=>{!s()&&v&&y.appendChild(v),j&&Ne(ie,i,y)},g=t=>{j&&v&&(v.classList.toggle("disabled",t),v.classList.toggle("with-delay",!t))},O=()=>{let t=i.strings.filter(n=>!!n);t.forEach((n,a)=>{if(this.type(n),a+1===t.length)return;let u=i.breakLines?[{func:()=>V(P("BR")),typeable:!0}]:U({func:$,delay:o(1)},h.getTypeable().length);x(u)})},Le=async t=>{let n=p();n&&await ne({value:n});for(let a of d())await l($,o(1));h.reset(),h.set(0,{delay:t})},ke=t=>{let n=y.innerHTML;return n?(y.innerHTML="",i.startDelete?(y.innerHTML=n,B(y),x([{func:$}]),t):n.replace(/<!--(.+?)-->/g,"").trim().split(/<br(?:\s*?)(?:\/)?>/).concat(t)):t},M=async(t=!0)=>{S.started=!0;try{for(let[a,u]of h.getQueue())u.done||(u.typeable&&!S.frozen&&g(!0),(!u.deletable||u.deletable&&d().length)&&await Ie(u,l),g(!1),h.done(a,!t));if(!t)return this;if(S.completed=!0,await i.afterComplete(this),!i.loop)throw"";let n=i.loopDelay;l(async()=>{await Le(n[0]),M()},n[1])}catch{}return this},ne=async t=>{N=Te(t,N,d()),ve(y,d(),N)},V=t=>Se(y,t),A=async t=>i=D(i,t),Pe=async()=>{if(s()){y.value="";return}d().forEach(F)},$=()=>{let t=d();!t.length||(s()?y.value=y.value.slice(0,-1):F(t[N]))};this.break=function(t){return f({func:()=>V(P("BR")),typeable:!0},t)},this.delete=function(t=null,n={}){t=C(t);let a=b(n),u=t,{instant:H,to:_}=n,I=h.getTypeable(),L=(()=>u===null?I.length:te(u)?u:re({queueItems:I,selector:u,cursorPosition:p(),to:_}))();return f([a[0],...U({func:$,delay:H?0:o(1),deletable:!0},L),a[1]],n)},this.empty=function(t={}){return f({func:Pe},t)},this.exec=function(t,n={}){let a=b(n);return f([a[0],{func:()=>t(this)},a[1]],n)},this.move=function(t,n={}){t=C(t);let a=b(n),{instant:u,to:H}=n,_=re({queueItems:h.getTypeable(),selector:t===null?"":t,to:H,cursorPosition:p()}),I=_<0?-1:1;return le=p()+_,f([a[0],...U({func:()=>ne(I),delay:u?0:o()},Math.abs(_)),a[1]],n)},this.options=function(t,n={}){return t=C(t),A(t),f({},n)},this.pause=function(t,n={}){return f({delay:C(t)},n)},this.type=function(t,n={}){t=C(t);let{instant:a}=n,u=b(n),_=ce(t,i.html).map(L=>({func:()=>V(L),char:L,delay:a||Ee(L)?0:o(),typeable:L.nodeType===Node.TEXT_NODE})),I=[u[0],{func:async()=>await i.beforeString(t,this)},..._,{func:async()=>await i.afterString(t,this)},u[1]];return f(I,n)},this.is=function(t){return S[t]},this.destroy=function(t=!0){q=pe(q),C(t)&&v&&F(v),S.destroyed=!0},this.freeze=function(){S.frozen=!0},this.unfreeze=()=>{},this.reset=function(t){!this.is("destroyed")&&this.destroy(),t?(h.wipe(),t(this)):h.reset(),N=0;for(let n in S)S[n]=!1;return y[s()?"value":"innerHTML"]="",this},this.go=function(){return S.started?this:(c(),i.waitUntilVisible?(be(y,M.bind(this)),this):(M(),this))},this.flush=function(t=()=>{}){return c(),M(!1).then(t),this},this.getQueue=()=>h,this.getOptions=()=>i,this.updateOptions=t=>A(t),this.getElement=()=>y;let y=_e(e),q=[],N=0,le=null,S=D({},ae),i=D(ue,r);i=D(i,{html:!s()&&i.html,nextStringDelay:G(i.nextStringDelay),loopDelay:G(i.loopDelay)});let ie=he(),h=se([{func:()=>{},delay:i.startDelay}]);y.dataset.typeitId=ie,Y(de);let j=i.cursor&&!s(),v=m();i.strings=ke(w(i.strings)),i.strings.length&&O()}});