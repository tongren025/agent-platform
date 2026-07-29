import{bB as C,aA as M}from"./index-jeUxIGHq.js";var _={exports:{}},w={},g={exports:{}},R={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var V;function U(){if(V)return R;V=1;var r=C();function i(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var f=typeof Object.is=="function"?Object.is:i,v=r.useState,S=r.useEffect,b=r.useLayoutEffect,p=r.useDebugValue;function h(t,e){var n=e(),c=v({inst:{value:n,getSnapshot:e}}),o=c[0].inst,d=c[1];return b(function(){o.value=n,o.getSnapshot=e,l(o)&&d({inst:o})},[t,n,e]),S(function(){return l(o)&&d({inst:o}),t(function(){l(o)&&d({inst:o})})},[t]),p(n),n}function l(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!f(t,n)}catch{return!0}}function s(t,e){return e()}var u=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?s:h;return R.useSyncExternalStore=r.useSyncExternalStore!==void 0?r.useSyncExternalStore:u,R}var O;function A(){return O||(O=1,g.exports=U()),g.exports}/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var q;function G(){if(q)return w;q=1;var r=C(),i=A();function f(s,u){return s===u&&(s!==0||1/s===1/u)||s!==s&&u!==u}var v=typeof Object.is=="function"?Object.is:f,S=i.useSyncExternalStore,b=r.useRef,p=r.useEffect,h=r.useMemo,l=r.useDebugValue;return w.useSyncExternalStoreWithSelector=function(s,u,t,e,n){var c=b(null);if(c.current===null){var o={hasValue:!1,value:null};c.current=o}else o=c.current;c=h(function(){function j(a){if(!x){if(x=!0,E=a,a=e(a),n!==void 0&&o.hasValue){var m=o.value;if(n(m,a))return y=m}return y=a}if(m=y,v(E,a))return m;var I=e(a);return n!==void 0&&n(m,I)?(E=a,m):(E=a,y=I)}var x=!1,E,y,D=t===void 0?null:t;return[function(){return j(u())},D===null?void 0:function(){return j(D())}]},[u,t,e,n]);var d=S(s,c[0],c[1]);return p(function(){o.hasValue=!0,o.value=d},[d]),l(d),d},w}var W;function L(){return W||(W=1,_.exports=G()),_.exports}var T=L();const B=M(T),$={},z=r=>{let i;const f=new Set,v=(u,t)=>{const e=typeof u=="function"?u(i):u;if(!Object.is(e,i)){const n=i;i=t??(typeof e!="object"||e===null)?e:Object.assign({},i,e),f.forEach(c=>c(i,n))}},S=()=>i,l={setState:v,getState:S,getInitialState:()=>s,subscribe:u=>(f.add(u),()=>f.delete(u)),destroy:()=>{($?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),f.clear()}},s=i=r(v,S,l);return l},F=r=>r?z(r):z;export{F as c,B as u};
