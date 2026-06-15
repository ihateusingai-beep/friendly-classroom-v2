(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const Rn="modulepreload",Ln=function(t,e){return new URL(t,e).href},pe={},Y=function(e,n,a){let o=Promise.resolve();if(n&&n.length>0){let s=function(c){return Promise.all(c.map(u=>Promise.resolve(u).then(v=>({status:"fulfilled",value:v}),v=>({status:"rejected",reason:v}))))};const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=s(n.map(c=>{if(c=Ln(c,a),c in pe)return;pe[c]=!0;const u=c.endsWith(".css"),v=u?'[rel="stylesheet"]':"";if(!!a)for(let x=r.length-1;x>=0;x--){const M=r[x];if(M.href===c&&(!u||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${v}`))return;const g=document.createElement("link");if(g.rel=u?"stylesheet":Rn,u||(g.as="script"),g.crossOrigin="",g.href=c,d&&g.setAttribute("nonce",d),document.head.appendChild(g),u)return new Promise((x,M)=>{g.addEventListener("load",x),g.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${c}`)))})}))}function i(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return o.then(s=>{for(const r of s||[])r.status==="rejected"&&i(r.reason);return e().catch(i)})};let U=null;window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),U=t,jn()});function jn(){const t=document.getElementById("pwa-install-banner");t&&t.remove();const e=document.createElement("div");e.id="pwa-install-banner",e.style.cssText=`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #7B2FBE, #5B1F9E);
    color: white;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    font-size: 15px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
  `,e.innerHTML=`
    <span style="font-size:1.4em">📱</span>
    <span style="flex:1">將應用加入主畫面，離線都能用！</span>
    <button id="pwa-install-btn" style="
      background: white;
      color: #7B2FBE;
      border: none;
      border-radius: 20px;
      padding: 8px 18px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">安裝</button>
    <button id="pwa-install-close" style="
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    ">✕</button>
  `,document.body.appendChild(e),e.querySelector("#pwa-install-btn").addEventListener("click",async()=>{if(!U)return;U.prompt();const{outcome:n}=await U.userChoice;if(U=null,e.remove(),n==="accepted"){const a=document.getElementById("pwa-update-banner");a&&a.remove()}}),e.querySelector("#pwa-install-close").addEventListener("click",()=>{e.remove(),sessionStorage.setItem("fc_install_dismissed","1")})}window.addEventListener("DOMContentLoaded",()=>{sessionStorage.getItem("fc_install_dismissed")||window.matchMedia("(display-mode: standalone)").matches});"serviceWorker"in navigator&&Y(async()=>{const{registerSW:t}=await import("./virtual_pwa-register-BxWx_BzH.js");return{registerSW:t}},[],import.meta.url).then(({registerSW:t})=>{t({onNeedRefresh(){Pn()},onOfflineReady(){Fn()}})}).catch(()=>{});function Pn(){if(document.getElementById("pwa-update-banner"))return;const e=document.createElement("div");e.id="pwa-update-banner",e.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #faad14, #e67e00);
    color: white;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    font-size: 15px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease-out;
  `,e.innerHTML=`
    <span style="font-size:1.2em">🔄</span>
    <span style="flex:1">有新版本可用</span>
    <button id="pwa-reload-btn" style="
      background: white;
      color: #e67e00;
      border: none;
      border-radius: 20px;
      padding: 7px 16px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">重新載入</button>
    <button id="pwa-update-close" style="
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    ">✕</button>
  `,document.body.appendChild(e),e.querySelector("#pwa-reload-btn").addEventListener("click",()=>{window.location.reload()}),e.querySelector("#pwa-update-close").addEventListener("click",()=>{e.remove()})}function Fn(){const t=document.getElementById("pwa-toast");t&&t.remove();const e=document.createElement("div");e.id="pwa-toast",e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.style.cssText=`
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #15803d;
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    animation: fadeInUp 0.3s ease-out;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  `,e.textContent="✅ 已準備好離線使用",document.body.appendChild(e),setTimeout(()=>e.remove(),3500)}const Ce=document.createElement("style");Ce.textContent=`
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes fadeInUp {
  from { transform: translateX(-50%) translateY(20px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);      opacity: 1; }
}
`;document.head.appendChild(Ce);const Te=[{id:"value",title:"價值觀教育",emoji:"🎯",color:"#7C3AED",bgColor:"#F3E8FF",icon:"品格"}];function Nt(t){return Te.find(e=>e.id===t)}function pt(t){var e;return((e=Nt(t))==null?void 0:e.color)||"#7C3AED"}function Vt(t){var e;return((e=Nt(t))==null?void 0:e.title)||"價值觀教育"}function Ht(t){var e;return((e=Nt(t))==null?void 0:e.emoji)||"🎯"}function Mn(){return Te}const mt=[{id:"perseverance",title:"堅毅",emoji:"🌱",domain:"value",description:"遇到困難不放棄，堅持到底",creedIds:[1],color:"#10B981"},{id:"respect",title:"尊重他人",emoji:"🤝",domain:"value",description:"尊重每個人，唔嘲笑唔排擠",creedIds:[2],color:"#4ECDC4"},{id:"responsibility",title:"責任感",emoji:"📋",domain:"value",description:"自己嘅嘢自己打理（routine 責任）",creedIds:[3],color:"#F59E0B"},{id:"national-identity",title:"國民身份認同",emoji:"🇭🇰",domain:"value",description:"愛護香港，認識國家",creedIds:[4],color:"#EF4444"},{id:"commitment",title:"承擔精神",emoji:"🛡️",domain:"value",description:"自己嘅選擇自己承擔（consequence 責任）",creedIds:[5],color:"#DC2626"},{id:"integrity",title:"誠信",emoji:"⚖️",domain:"value",description:"講真話，做個可信嘅人",creedIds:[6],color:"#3B82F6"},{id:"benevolence",title:"仁愛",emoji:"💗",domain:"value",description:"關心別人，主動幫忙",creedIds:[7],color:"#EC4899"},{id:"law-abiding",title:"守法",emoji:"📜",domain:"value",description:"遵守規則，奉公守法",creedIds:[8],color:"#6366F1"},{id:"empathy",title:"同理心",emoji:"🫂",domain:"value",description:"易地而處，感受他人嘅情緒",creedIds:[9],color:"#F97316"},{id:"diligence",title:"勤勞",emoji:"💪",domain:"value",description:"努力練習，唔怕辛苦",creedIds:[10],color:"#84CC16"},{id:"solidarity",title:"團結",emoji:"🤲",domain:"value",description:"與人合作，一齊努力",creedIds:[11],color:"#06B6D4"},{id:"filial-piety",title:"孝親",emoji:"🏠",domain:"value",description:"尊敬父母，孝順家人",creedIds:[12],color:"#A855F7"}],ft=[{id:"body-autonomy",title:"身體自主",emoji:"🛡️",domain:"caring",description:"認識身體界線，保護自己",creedIds:[8],color:"#BE185D"},{id:"stranger-safety",title:"陌生人危險",emoji:"⚠️",domain:"caring",description:"應對陌生情境，保護自己",creedIds:[8],color:"#B91C1C"},{id:"help-seeking",title:"求助技巧",emoji:"📞",domain:"caring",description:"識得搵人幫手",creedIds:[9],color:"#0EA5E9"},{id:"social-boundary",title:"社交界線",emoji:"🚧",domain:"caring",description:"同人保持合適嘅距離",creedIds:[9],color:"#7C3AED"},{id:"conflict-resolution",title:"衝突解決",emoji:"💬",domain:"caring",description:"化解爭執，搵共識",creedIds:[11,9],color:"#059669"}],j=[...mt,...ft],Dn={emotions:"empathy",respect:"respect",honesty:"integrity",integrity:"integrity",conflict:"conflict-resolution",perseverance:"perseverance","self-protection":"body-autonomy","social-distance":"social-boundary","stranger-danger":"stranger-safety","help-seeking":"help-seeking",cooperation:"solidarity","classroom-rules":"law-abiding","filial-piety":"filial-piety","gift-gratitude":"benevolence",responsibility:"responsibility",diligence:"diligence",commitment:"commitment","national-identity":"national-identity"},Bn={"s-self-58":"diligence","s-self-32":"filial-piety","s-self-35":"empathy","s-self-36":"empathy"};function Ut(t){return j.find(e=>e.id===t)}function On(){return mt}function zn(){return ft}function Nn(t){return mt.some(e=>e.id===t)}function Vn(t){return ft.some(e=>e.id===t)}const Hn=Object.freeze(Object.defineProperty({__proto__:null,CARING:ft,SCENARIO_TOPIC_OVERRIDE:Bn,TOPICS:j,TOPIC_MIGRATION:Dn,VALUES:mt,getCaringTopics:zn,getTopic:Ut,getValueTopics:On,isCaringTopic:Vn,isValueTopic:Nn},Symbol.toStringTag,{value:"Module"})),Un="audio/";let $t=null;function qn(){return $t||($t=new(window.AudioContext||window.webkitAudioContext)),$t}function ot(t){try{const e=qn(),n=e.currentTime,a=e.createOscillator(),o=e.createGain();a.connect(o),o.connect(e.destination);const i=o.gain;switch(t){case"click":a.frequency.value=800,a.type="sine",i.setValueAtTime(.15,n),i.exponentialRampToValueAtTime(.001,n+.08),a.start(n),a.stop(n+.08);break;case"hover":a.frequency.value=600,a.type="sine",i.setValueAtTime(.06,n),i.exponentialRampToValueAtTime(.001,n+.05),a.start(n),a.stop(n+.05);break;case"success":a.frequency.value=523,a.type="sine",i.setValueAtTime(.18,n),a.start(n),a.frequency.setValueAtTime(659,n+.1),a.frequency.setValueAtTime(784,n+.2),i.exponentialRampToValueAtTime(.001,n+.45),a.stop(n+.45);break;case"fail":a.frequency.value=400,a.type="sine",i.setValueAtTime(.12,n),a.frequency.exponentialRampToValueAtTime(200,n+.3),i.exponentialRampToValueAtTime(.001,n+.3),a.start(n),a.stop(n+.3);break;case"celebrate":[523,659,784].forEach((s,r)=>{const l=e.createOscillator(),d=e.createGain();l.connect(d),d.connect(e.destination),l.frequency.value=s,l.type="sine",d.gain.setValueAtTime(.12,n+r*.08),d.gain.exponentialRampToValueAtTime(.001,n+.6+r*.08),l.start(n+r*.08),l.stop(n+.65+r*.08)});break;case"complete":[523,659,784,1047].forEach((s,r)=>{const l=e.createOscillator(),d=e.createGain();l.connect(d),d.connect(e.destination),l.frequency.value=s,l.type="triangle",d.gain.setValueAtTime(.14,n+r*.07),d.gain.exponentialRampToValueAtTime(.001,n+.5+r*.07),l.start(n+r*.07),l.stop(n+.55+r*.07)});break}}catch(e){console.warn("[FC SFX] Error:",e.message)}}function Ee(){document.addEventListener("click",t=>{t.target.closest(".btn")&&ot("click")}),document.addEventListener("mouseover",t=>{t.target.closest(".btn")&&ot("hover")})}let K=!0,S=!1,A=null;const Ie=[{id:"auto",label:"自動（按系統預設）",hint:"跟 OS 第一個中文 voice"},{id:"zh-HK",label:"🇭🇰 粵語（香港）",hint:"需要 OS/browser 裝咗粵語 voice"},{id:"zh-TW",label:"🇹🇼 國語（台灣 / 普通話通用）",hint:"zh-TW 中文 voice, 兩岸都聽得明"},{id:"zh-CN",label:"🇨🇳 普通話（中國大陸）",hint:"zh-CN 中文 voice"}],Ae=localStorage.getItem("fc_tts_lang");let P=Ae||"zh-HK";if(!Ae)try{localStorage.setItem("fc_tts_lang",P)}catch{}let q=null;function Gn(){return q||(q=new Promise(t=>{const e=window.speechSynthesis;if(!e)return t([]);let n=e.getVoices();if(n.length>0)return t(n);const a=()=>{n=e.getVoices(),n.length>0&&(e.removeEventListener("voiceschanged",a),t(n))};e.addEventListener("voiceschanged",a),setTimeout(()=>t(e.getVoices()||[]),5e3)}),q)}async function Kn(){const t=await Gn();if(!t.length)return null;if(P!=="auto"){const e=t.find(o=>o.lang===P);if(e)return e;const n=P.split("-")[0];return t.find(o=>o.lang.startsWith(n))||null}return t.find(e=>e.lang==="zh-HK")||t.find(e=>e.lang==="zh-TW")||t.find(e=>e.lang==="zh-CN")||t.find(e=>e.lang.includes("zh"))||t[0]||null}function Re(){return{speed:parseFloat(localStorage.getItem("fc_tts_speed")||"0.85"),fontSize:parseInt(localStorage.getItem("fc_font_size")||"18"),lineHeight:parseFloat(localStorage.getItem("fc_line_height")||"1.5"),spacing:localStorage.getItem("fc_spacing")||"medium",highContrast:localStorage.getItem("fc_hc_mode")==="1",reducedMotion:localStorage.getItem("fc_rm_mode")==="1"}}function Le(){const t=Re(),e={narrow:"8px",medium:"16px",wide:"28px"},n=document.documentElement;n.style.setProperty("--fc-font-size",t.fontSize+"px"),n.style.setProperty("--fc-line-height",t.lineHeight),n.style.setProperty("--fc-spacing",e[t.spacing]||"16px"),t.highContrast?n.setAttribute("data-hc","true"):n.removeAttribute("data-hc"),t.reducedMotion?n.setAttribute("data-rm","true"):n.removeAttribute("data-rm")}function Yn(t){K=t}function je(){return K}function Pe(){S=!1,A&&(A.pause(),A=null)}function Xn(t){Pe();const e=Un+t;console.log("[FC Audio] Playing:",e),A=new Audio(e),A.onended=()=>{S=!1,A=null,console.log("[FC Audio] Done")},A.onerror=n=>{console.error("[FC Audio] Error:",n),S=!1,A=null},A.play().catch(n=>{console.error("[FC Audio] Play failed:",n.message),S=!1,A=null}),S=!0}function Jn(t){if(console.log("[FC Audio] speakScenario called, enabled:",K,"speaking:",S,"scenario:",t),!K){console.log("[FC Audio] Blocked: voice not enabled");return}if(S){console.log("[FC Audio] Blocked: already speaking");return}const e=(t==null?void 0:t.id)||t,n=(t==null?void 0:t.description)||"";console.log("[FC Audio] Playing scenario:",e),Fe(n)}function Wn(t){if(!K||S||!t||t.length===0)return;const e=t[0].id||t[0];Xn(`creeds/creed-${e}.mp3`)}async function Fe(t){var a,o;if(!t)return;S&&((a=window.speechSynthesis)==null||a.cancel());const e=new SpeechSynthesisUtterance(t);e.lang=P==="auto"?"zh-HK":P,e.rate=Re().speed||.85,e.pitch=1;const n=await Kn();n?(e.voice=n,console.log("[FC TTS] Voice:",n.name,"("+n.lang+")")):console.warn("[FC TTS] No matching voice found for",P),e.onstart=()=>{S=!0,console.log("[FC TTS] Speaking:",t.slice(0,30))},e.onend=()=>{S=!1,console.log("[FC TTS] Done")},e.onerror=i=>{S=!1,console.error("[FC TTS] Error:",i.error),i.error==="not-allowed"&&console.log("[FC TTS] Autoplay blocked — user must interact first. Suggest enabling TTS in settings.")},(o=window.speechSynthesis)==null||o.speak(e)}function Qn(t){if(!Ie.find(e=>e.id===t)){console.warn("[FC TTS] Unknown lang:",t);return}P=t,q=null,localStorage.setItem("fc_tts_lang",t),console.log("[FC TTS] Lang set to",t)}function Zn(){return P}window._fcAudio={speakScenario:Jn,speakCreeds:Wn,speak:Fe,setEnabled:Yn,isEnabled:je,applyCSS:Le,playSFX:ot,initSFX:Ee};window.addEventListener("beforeunload",()=>{Pe()});const At=[{id:1,value:"perseverance",title:"堅毅的",text:"我們是堅毅的：遇到困難不放棄，堅持到底"},{id:2,value:"respect",title:"尊重他人的",text:"我們是尊重他人的：尊重每個人，唔嘲笑唔排擠"},{id:3,value:"responsibility",title:"負責任的",text:"我們是負責任的：自己嘅嘢自己打理"},{id:4,value:"national-identity",title:"愛國的",text:"我們是愛護香港、認識國家的"},{id:5,value:"commitment",title:"勇於承擔的",text:"我們是勇於承擔的：自己嘅選擇自己承擔"},{id:6,value:"integrity",title:"誠信的",text:"我們是誠信的：講真話，做個可信嘅人"},{id:7,value:"benevolence",title:"仁愛的",text:"我們是仁愛的：關心別人，主動幫忙"},{id:8,value:"law-abiding",title:"守法的",text:"我們是守法的：遵守校規，奉公守法"},{id:9,value:"empathy",title:"同理心的",text:"我們是同理心的：易地而處，感受他人嘅情緒"},{id:10,value:"diligence",title:"勤勞的",text:"我們是勤勞的：努力練習，唔怕辛苦"},{id:11,value:"solidarity",title:"團結的",text:"我們是團結的：與人合作，一齊努力"},{id:12,value:"filial-piety",title:"孝親的",text:"我們是孝親的：尊敬父母，孝順家人"}],ta=[{id:13,title:"信實的",text:"我們是信實的：誠實負責，不欺騙人"},{id:14,title:"整潔的",text:"我們是整潔的：校服整潔，儀容端正"},{id:15,title:"友愛的",text:"我們是友愛的：關心別人，互相幫助"},{id:16,title:"禮讓的",text:"我們是禮讓的：待人有禮，不易發怒"},{id:17,title:"勤力的",text:"我們是勤力的：上課專心，努力學習"},{id:18,title:"合作的",text:"我們是合作的：遵守規則，積極參與"},{id:19,title:"獨立的",text:"我們是獨立的：自己的事，自己去做"},{id:20,title:"愛護學校的",text:"我們是愛護學校的：愛護公物，保護環境"},{id:21,title:"感恩的",text:"我們是感恩的：尊敬師長，孝順父母"},{id:22,title:"守法的",text:"我們是守法的：遵守校規，奉公守法"}],ea=[...At,...ta],na=[2,4,7,9,11,12],aa=[1,3,5,6,8,10],oa=na,St=aa;function Me(t){return ea.filter(e=>t.includes(e.id))}function ia(t){return Me(t).map(e=>`${e.title}：${e.text}`)}function sa(){const t=new Date().toISOString().split("T")[0],e=ra(t)%At.length;return At[e]}function ra(t){let e=5381;for(let n=0;n<t.length;n++)e=(e<<5)+e+t.charCodeAt(n),e|=0;return Math.abs(e)}function la(t,e){if(e===0)return t||[];const n=t||[],a=e>0?oa:St,o=n.filter(i=>a.includes(i));if(o.length>0)return o;if(e<0&&n.length>0){const i=St.find(s=>!n.includes(s))||St[0];return[...n.slice(0,1),i]}return[a[0]]}function ca(t){return t>=70?"good":t>=30?"warning":"danger"}function da(t){return Math.max(0,Math.min(100,Math.round((t+50)/1.5)))}function De(t){const e=da(t),n=ca(t);return{percent:e,color:n==="good"?"#22c55e":n==="warning"?"#eab308":"#ef4444",level:n,score:t}}function Be(t,e,n){const a=t.options.find(l=>l.id===e);if(!a)return null;let o=0,i="";a.effects.forEach(l=>{o+=l.moralChange||0,l.comment&&(i=l.comment)});const s=Me(la(t.creedIds||[],o)),r=o>=0;return{moralChange:o,newScore:null,triggeredCreeds:s,isPositive:r,mainComment:i||(r?"你做出了好的選擇！":"你做出了選擇！"),option:a,scenario:t}}class ua{constructor(){this._handlers=new Map}on(e,n){return this._handlers.has(e)||this._handlers.set(e,new Set),this._handlers.get(e).add(n),()=>this.off(e,n)}off(e,n){this._handlers.has(e)&&this._handlers.get(e).delete(n)}emit(e,n){this._handlers.has(e)&&this._handlers.get(e).forEach(a=>{try{a(n)}catch(o){console.error(`[EventBus] handler error on "${e}":`,o)}})}}const h=new ua,qt="fc_progress_",Gt=1;function _(t){try{const e=localStorage.getItem(qt+t);if(!e)return fe(t);const n=JSON.parse(e);return xa(n)}catch{return fe(t)}}function bt(t){t.lastPlayed=Kt(),t.schemaVersion=Gt;const e=qt+t.name,n=JSON.stringify(t);try{return localStorage.setItem(e,n),!0}catch(a){return a&&a.name==="QuotaExceededError"?(h.emit("progress:save-failed",{name:t.name,error:"quota"}),console.warn("[Progress] quota exceeded for",t.name)):(h.emit("progress:save-failed",{name:t.name,error:(a==null?void 0:a.message)||"unknown"}),console.warn("[Progress] save failed:",a)),!1}}function me(t,e,n,a,o){const i=_(t);return i.completedScenarios.includes(e)||(i.completedScenarios.push(e),i.totalMoralScore=Math.max(0,(i.totalMoralScore||0)+a),i.topicProgress[n]||(i.topicProgress[n]={completed:0,total:0}),i.topicProgress[n].completed++,o&&(i.subjectProgress[o]||(i.subjectProgress[o]={completed:0,total:0}),i.subjectProgress[o].completed++),i.streak=$a(i.streak),bt(i),h.emit("progress:updated",{studentId:t,scenarioId:e,topicId:n,moralChange:a}),h.emit("moral:updated",{studentId:t,score:i.totalMoralScore,change:a}),h.emit("scenario:completed",{studentId:t,scenarioId:e,result:{moralChange:a,newScore:i.totalMoralScore}})),i}function ga(t,e,n){const a=_(t);a.topicProgress[e]?a.topicProgress[e].total=n:a.topicProgress[e]={completed:0,total:n},bt(a)}function pa(t,e,n){const a=_(t);a.subjectProgress[e]?a.subjectProgress[e].total=n:a.subjectProgress[e]={completed:0,total:n},bt(a)}function Oe(){const t=[];for(let e=0;e<localStorage.length;e++){const n=localStorage.key(e);if(n.startsWith(qt))try{t.push(JSON.parse(localStorage.getItem(n)))}catch{}}return t}function ma(t){try{const e=JSON.parse(t),n=_(e.name);return e.completedScenarios.forEach(a=>{n.completedScenarios.includes(a)||n.completedScenarios.push(a)}),n.totalMoralScore=Math.max(n.totalMoralScore||0,e.totalMoralScore||0),e.topicProgress&&Object.keys(e.topicProgress).forEach(a=>{n.topicProgress[a]||(n.topicProgress[a]={completed:0,total:0}),n.topicProgress[a].completed=Math.max(n.topicProgress[a].completed||0,e.topicProgress[a].completed||0),e.topicProgress[a].total&&(n.topicProgress[a].total=Math.max(n.topicProgress[a].total||0,e.topicProgress[a].total))}),e.subjectProgress&&Object.keys(e.subjectProgress).forEach(a=>{n.subjectProgress[a]||(n.subjectProgress[a]={completed:0,total:0}),n.subjectProgress[a].completed=Math.max(n.subjectProgress[a].completed||0,e.subjectProgress[a].completed||0),e.subjectProgress[a].total&&(n.subjectProgress[a].total=Math.max(n.subjectProgress[a].total||0,e.subjectProgress[a].total))}),bt(n),{ok:!0}}catch(e){return{ok:!1,error:e.message}}}function fa(t){const e=_(t);return JSON.stringify(e,null,2)}function ba(t,e){return _(t).completedScenarios.includes(e)}function va(t){var n,a,o;const e=_(t);return{name:t,score:e.totalMoralScore||0,completedCount:((n=e.completedScenarios)==null?void 0:n.length)||0,topicCount:Object.keys(e.topicProgress||{}).length,lastPlayed:e.lastPlayed||null,streak:((a=e.streak)==null?void 0:a.current)||0,streakLongest:((o=e.streak)==null?void 0:o.longest)||0}}const ha=["emotions","honesty","conflict"],ya={emotions:"empathy",honesty:"integrity",conflict:"conflict-resolution"};function fe(t){return{schemaVersion:Gt,name:t,completedScenarios:[],topicProgress:{},subjectProgress:{value:{completed:0,total:0}},totalMoralScore:0,lastPlayed:null,streak:{current:0,longest:0,lastDay:null}}}function xa(t){if(!t||typeof t!="object")return t;if(t.schemaVersion==null&&(t.schemaVersion=Gt),t.topicProgress&&typeof t.topicProgress=="object"){for(const e of ha)if(t.topicProgress[e]){const n=ya[e],a=t.topicProgress[e],o=t.topicProgress[n]||{completed:0,total:0};o.completed=Math.max(o.completed||0,a.completed||0),o.total=Math.max(o.total||0,a.total||0),t.topicProgress[n]=o,delete t.topicProgress[e]}}return t}function Kt(){try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date)}catch{return new Date().toISOString().split("T")[0]}}function wa(){const t=Kt(),[e,n,a]=t.split("-").map(Number),o=new Date(Date.UTC(e,n-1,a));return o.setUTCDate(o.getUTCDate()-1),o.toISOString().split("T")[0]}function $a(t){const e=t||{current:0,longest:0,lastDay:null},n=Kt();if(e.lastDay===n)return e;const a=wa();return e.lastDay===a?e.current+=1:e.current=1,e.current>(e.longest||0)&&(e.longest=e.current),e.lastDay=n,e}function b(t){return t==null?"":String(t).replace(/&/g,"&amp;").replace(/'/g,"&#39;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\)/g,"&#41;").replace(/\(/g,"&#40;")}function E({marginTop:t="auto"}={}){return`<div class="footer" style="margin-top:${t}">© Ken Cheng 製作</div>`}function X({emoji:t="🫥",title:e,hint:n="",actionLabel:a="",onAction:o=""}={}){return`
    <div class="container fade-in">
      <div class="card" style="text-align:center;padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">${t}</div>
        <h2 style="margin-bottom:8px">${e}</h2>
        ${n?`<p style="color:var(--text-light);margin-bottom:16px">${n}</p>`:""}
        ${a&&o?`<button type="button" class="btn btn-primary" onclick="${o}">${a}</button>`:""}
      </div>
    </div>
  `}function be(t="載入中…"){return`<div class="container"><p>${t}</p></div>`}function R({emoji:t,title:e,titleHTML:n,back:a,backLabel:o="返回",backArg:i,rightButton:s,noHeader:r=!1}){let l="";if(a){const d=i!==void 0?` data-arg2="${b(i)}"`:"";l+=`<button type="button" class="back-btn" data-action="navigate" data-arg="${b(a)}"${d} aria-label="${b(o)}">←</button>`}return l+=n!==void 0?n:`<h1>${t?t+" ":""}${e}</h1>`,s&&(l+=s),r?l:`<div class="page-header">${l}</div>`}const ze=["A","B","C","D"];function Sa({scenarioId:t,opt:e,index:n,isBank:a=!1,showMoral:o=!1}){const i=ze[n]||String(n+1),s=a?"bankChoose":"choose",r=`assets/images/outcomes/${t}_opt${n+1}.png`,l=(e.effects||[])[0],d=e.moralChange!==void 0?Number(e.moralChange):l?Number(l.moralChange||0):0;let c="";if(o){const u=d>0?`＋${d} 道德`:d<0?`${d} 道德`:"中性";c=`<span class="opt-value opt-value-${d>0?"good":d<0?"bad":"neutral"}" aria-hidden="true">${u}</span>`}return`
    <button type="button" class="option-card" data-action="${s}" data-arg="${b(e.id)}"
      aria-label="選項 ${i}：${b(e.text)}">
      <img src="${r}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${i}</span>
      <span class="opt-text">${e.text}</span>
      ${c}
      <button type="button" class="opt-read"
        data-action="speakOpt" data-arg="${b(e.id)}"
        title="朗讀呢個選項"
        aria-label="朗讀選項 ${i}">🔊</button>
    </button>
  `}function ka({scenarioId:t,opt:e,index:n}){const a=ze[n]||String(n+1),o=`assets/images/outcomes/${t}_opt${n+1}.png`;return`
    <button type="button" class="option-card" data-action="bankChoose" data-arg="${b(e.id)}"
      aria-label="選項 ${a}：${b(e.text)}">
      <img src="${o}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${a}</span>
      <span class="opt-text">${e.text}</span>
    </button>
  `}const k=Object.freeze({VALUES_ONLY:0,MILD:1,MEDIUM:2,ALL:3}),ve=Object.freeze({[k.VALUES_ONLY]:"只 value",[k.MILD]:"≤1（低）",[k.MEDIUM]:"≤2（中）",[k.ALL]:"全開"}),_a=new Set([0,1,2,3]);function Yt(t){if(t==null||t==="")return k.MILD;const e=Number(t);return Number.isFinite(e)&&_a.has(e)?e:k.MILD}function it(t){return ve[Yt(t)]||ve[k.MILD]}const Ca=Object.freeze({PROGRESS_PREFIX:"fc_progress_",TEACHER_CONFIG:"fc_teacher_config",TEACHER_PIN:"fc_teacher_pin",TEACHER_TOKEN:"fc_teacher_token",TEACHER_EXPIRY:"fc_teacher_expiry",DEVICE_ID:"fc_device_id",LAST_SYNC_PREFIX:"fc_last_sync_",SYNC_QUEUE:"fc_sync_queue",TTS_SPEED:"fc_tts_speed",TTS_LANG:"fc_tts_lang",FONT_SIZE:"fc_font_size",LINE_HEIGHT:"fc_line_height",SPACING:"fc_spacing",HC_MODE:"fc_hc_mode",RM_MODE:"fc_rm_mode",VOICE_SEEN:"fc_voice_seen",GAME_MODE:"fc_game_mode",HOME_FILTER:"fc_home_filter",INTERACTIONS:"fc_interactions_v1"}),Ta={hintEnabled:!0,timerEnabled:!1,timerSeconds:30,comboEnabled:!1,bankMaxRiskLevel:1,buttonSize:"normal",assignedTopics:[]};let et=null,he=0;const Ea=5e3;function Ia(){if(et&&Date.now()-he<Ea)return et;const t=localStorage.getItem(Ca.TEACHER_CONFIG);let e={};try{e=t?JSON.parse(t):{}}catch(n){console.warn("[storage] corrupt fc_teacher_config:",n)}return et={...Ta,...e},he=Date.now(),et}let y=null,st=null,J=[];const Rt=new Set,Lt=new Set;function Aa(t){y=t,Rt.clear(),Lt.clear()}function $(){return y}function Ra(t){J=t}function Xt(){return J}function W(t){return J.filter(e=>e.topicId===t)}function Ne(t){return st=J.find(e=>e.id===t)||null,st}function nt(){return st}function La(t,e,n){var i;const a=J.find(s=>s.id===t)||st;if(!a)return null;const o=Be(a,e);return o?(y&&n?me(y,a.id,a.topicId,o.moralChange,n):y&&!n&&me(y,a.id,a.topicId,o.moralChange,null),{option:o.option,moralChange:o.moralChange,mainComment:o.mainComment,creeds:o.triggeredCreeds,creedText:ia(o.triggeredCreeds.map(s=>s.id)),scenarioImage:a.image||null,scenarioTitle:a.title||"",outcomeImage:`assets/images/outcomes/${a.id}_opt${a.options.findIndex(s=>s.id===e)+1}.png`,nextScenario:((i=o.option)==null?void 0:i.next_scenario)||null}):null}function Ve(t){if(!y)return;const e=`${y}|${t}`;if(Rt.has(e))return;Rt.add(e);const n=W(t);ga(y,t,n.length)}function ja(t){if(!y||!t)return;const e=`${y}|${t}`;if(Lt.has(e))return;Lt.add(e);const n=Xt();pa(y,t,n.length)}function ye(t){const e=W(t);if(!y)return e[0]||null;const n=_(y);return e.find(a=>!n.completedScenarios.includes(a.id))||null}const He=100,Pa=-50,Ue=8;function Fa(t,e){return e>=k.ALL?t:t.filter(n=>Number(n.riskLevel??0)<=e)}function Ma(t,e=1){const n=Xt();if(!n.length)return[];const a=Fa(n,e),i=(a.length>=t?a:n).slice();for(let s=i.length-1;s>0;s--){const r=Math.floor(Math.random()*(s+1));[i[s],i[r]]=[i[r],i[s]]}return i.slice(0,t)}function Da(){try{const t=JSON.parse(localStorage.getItem("fc_teacher_config")||"{}");return Yt(t.bankMaxRiskLevel)}catch{return 1}}let f=null;function Ba(t={}){const e=t.maxRisk!==void 0?Yt(t.maxRisk):Da();return f={balance:0,stamps:[],history:[],questions:Ma(Ue,e),currentIdx:0,status:"playing",maxRisk:e},f}function at(){return f}function Oa(){f=null}function za(t,e){if(!f)return;const n=t||0,a=f.balance;return f.balance+=n,f.stamps.push({delta:n,label:e||"",ts:Date.now()}),f.history.push({moralChange:n,scenarioTitle:e}),f.currentIdx>=f.questions.length-1&&(f.status="finished"),f.balance>=He&&f.status==="playing"&&(f.status="finished"),f.balance<=Pa&&(f.status="bankrupt"),{oldBalance:a,newBalance:f.balance,status:f.status}}function Na(){return f?(f.currentIdx=Math.min(f.currentIdx+1,f.questions.length),f):null}const N={TARGET_BALANCE:He,QUESTIONS_PER_RUN:Ue,DEFAULT_MAX_RISK:k.MILD};function Va(){return`
    <div class="role-screen">
      <div class="logo" aria-hidden="true">🎓</div>
      <h1>友愛教室</h1>
      <p class="tagline">選擇你的身份，開始學習！</p>

      <div class="role-cards">
        <button type="button" class="role-card student" data-action="chooseRole" data-arg="student" aria-label="選擇學生模式：揀遊戲、學習社交禮貌，自由探索">
          <div class="rc-icon" aria-hidden="true">🧒</div>
          <div class="rc-body">
            <h2>學生模式</h2>
            <p>揀遊戲、學習社交禮貌，自由探索</p>
          </div>
          <div class="rc-arrow" aria-hidden="true">→</div>
        </button>

        <button type="button" class="role-card teacher" data-action="chooseRole" data-arg="teacher" aria-label="選擇老師或家長模式：設定功課範圍、控制功能開關、查看學習報告">
          <div class="rc-icon" aria-hidden="true">👨‍🏫</div>
          <div class="rc-body">
            <h2>老師 / 家長模式</h2>
            <p>設定功課範圍、控制功能開關、查看學習報告</p>
          </div>
          <div class="rc-arrow" aria-hidden="true">→</div>
        </button>
      </div>

      <div style="margin-top:32px;text-align:center">
        <p style="font-size:0.8em;color:var(--text-light)">© Ken Cheng 製作</p>
      </div>
    </div>
  `}function Ha(){const e=Ia().bankMaxRiskLevel??k.MILD,n=`<div class="gc-meta" style="font-size:0.78em;color:var(--text-light);margin-top:6px">🎯 題目難度：${it(e)}</div>`;return`
    <div class="hub-screen fade-in">
      ${R({emoji:"🎮",title:"揀個遊戲開始",back:"role-select",backLabel:"返回主選單"})}

      <div class="hub-grid">
        <button type="button" class="game-card available" data-action="playGoodDeedBank" style="background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#eab308" aria-label="好人好事銀行（pilot）：做好事存款，衰嘢扣款，目標存到 $100 變品格富翁">
          <div class="gc-icon" aria-hidden="true">🏦</div>
          <div class="gc-title">好人好事銀行</div>
          <div class="gc-desc">做好事存款，衰嘢扣款，目標存到 $100 變品格富翁！</div>
          ${n}
          <div class="gc-tag" aria-label="pilot 試玩版">pilot</div>
        </button>

        <button type="button" class="game-card available" data-action="navigate" data-arg="subject-select" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);border-color:#7C3AED" aria-label="情境答題：17 個品格課題自由探索">
          <div class="gc-icon" aria-hidden="true">📖</div>
          <div class="gc-title">情境答題</div>
          <div class="gc-desc">17 個品格課題自由探索：12 個 EDB 價值觀 + 5 個友愛校園範疇</div>
        </button>

        <div class="game-card locked" style="background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#ef4444;cursor:not-allowed;opacity:0.6" role="img" aria-label="關係花園（暫未推出）">
          <div class="gc-icon" aria-hidden="true">🌷</div>
          <div class="gc-title">關係花園</div>
          <div class="gc-desc">（即將推出）</div>
          <div class="gc-tag" aria-hidden="true">coming soon</div>
        </div>

        <div class="game-card locked" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);border-color:#a855f7;cursor:not-allowed;opacity:0.6" role="img" aria-label="道德大富翁（暫未推出）">
          <div class="gc-icon" aria-hidden="true">🎲</div>
          <div class="gc-title">道德大富翁</div>
          <div class="gc-desc">（即將推出）</div>
          <div class="gc-tag" aria-hidden="true">coming soon</div>
        </div>
      </div>

      <div class="fc-center-20">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回</button>
      </div>
      ${E()}
    </div>
  `}function Ua(t,e){if(!t)return X({emoji:"⚠️",title:"題目載入失敗",actionLabel:"← 返 Game Hub",onAction:"FC.exitBank()"});const n=N.QUESTIONS_PER_RUN,a=e.currentIdx+1,o=e.balance,i=N.TARGET_BALANCE,s=Math.min(100,Math.max(0,o/i*100)),r=o>0?"positive":o<0?"negative":"neutral",l=e.maxRisk??k.MILD;return`
    <div class="container fade-in" style="max-width:560px">
      <div class="page-header">
        <button class="back-btn" data-action="confirmExitBank">←</button>
        <h2>🏦 好人好事銀行</h2>
        ${`<div class="bank-risk-tag" style="font-size:0.78em;color:var(--text-light);text-align:center;margin-top:4px" aria-label="本局題目難度上限 ${it(l)}">🎯 題目難度：${it(l)}</div>`}
      </div>

      <div class="bank-ledger">
        <div class="bl-row">
          <span class="bl-label">題目</span>
          <span class="bl-val">${a} / ${n}</span>
        </div>
        <div class="bl-row">
          <span class="bl-label">💰 結餘</span>
          <span class="bl-val ${r}">$${o}</span>
        </div>
        <div class="bank-progress" title="目標 $${i}">
          <div class="bank-fill" style="width:${s}%"></div>
          <span class="bank-target">目標 $${i}</span>
        </div>
      </div>

      <div class="scenario-desc" class="fc-mt-16">
        <strong>${t.title}</strong>
        <div style="color:var(--text-light);font-size:0.92em;margin-top:6px">📍 ${t.background||""}</div>
        <div class="fc-mt-8">${t.description}</div>
      </div>

      <div class="scenario-image-wrap">
        <img src="assets/images/scenarios/${t.id}.png" alt="${t.title}" class="scenario-image"
             loading="eager" fetchpriority="high"
 />
      </div>

      <div class="options" style="margin-top:14px" role="radiogroup" aria-label="銀行題目選項">
        ${t.options.map((c,u)=>ka({scenarioId:t.id,opt:c,index:u})).join("")}
      </div>
    </div>
  `}function qa(t,e,n){if(!e)return X({emoji:"⚠️",title:"結果載入失敗",actionLabel:"← 返 Game Hub",onAction:"FC.exitBank()"});const a=e.moralChange||0,o=a>0,i=a===0,s=n.balance,r=n.status==="finished"&&s>=N.TARGET_BALANCE,l=n.status==="bankrupt",d=n.status==="finished",c=N.TARGET_BALANCE,u=o?`存款 ${a} 元，目前結餘 ${s} 元`:i?"無變化":`扣款 ${Math.abs(a)} 元，目前結餘 ${s} 元`;return`
    <div class="container fade-in" style="max-width:560px">
      ${R({emoji:"🏦",title:"銀行結算"})}
      <h2 class="sr-only" aria-live="polite" aria-atomic="true">${u}</h2>

      <div class="bank-stamp ${o?"green":i?"gray":"red"}" id="bank-stamp" role="status" aria-label="${u}">
        <div class="stamp-emoji" aria-hidden="true">${o?"💰":i?"➖":"💸"}</div>
        <div class="stamp-delta">${o?"+":""}${a} 元</div>
        <div class="stamp-label">${o?"存款":i?"無變化":"扣款"}</div>
      </div>

      ${e.outcomeImage?`
        <div class="outcome-image-wrap" style="margin:14px auto;max-width:340px;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          <img src="${e.outcomeImage}" alt="結果插圖" style="width:100%;display:block"
               loading="lazy" decoding="async"
 />
        </div>
      `:""}

      <div class="result-card ${o?"good":"bad"}" id="result-card">
        <div class="result-emoji" aria-hidden="true">${o?"🌟":"💪"}</div>
        <div class="comment">${e.mainComment||""}</div>
      </div>

      <div class="bank-balance-big" style="text-align:center;margin:18px 0">
        <div style="font-size:0.9em;color:var(--text-light)">目前結餘</div>
        <div class="${a>0?"positive":a<0?"negative":"neutral"}" style="font-size:2.4em;font-weight:800" aria-label="目前結餘 ${s} 元">$${s}</div>
        <div class="fc-muted-sm">目標 $${c}</div>
      </div>

      ${r?`
        <div class="bank-end-banner win" role="status">
          🎉 恭喜！你已經存到 $${s}，係個「品格富翁」！
        </div>
      `:l?`
        <div class="bank-end-banner lose" role="status">
          💔 結餘太低，破產喇。今次再嚟過！
        </div>
      `:d?`
        <div class="bank-end-banner end" role="status">
          🏁 全部 ${N.QUESTIONS_PER_RUN} 題做完喇！結餘：$${s}
        </div>
      `:""}

      <div class="action-row" style="margin-top:18px">
        <button type="button" class="btn btn-primary" data-action="bankNext">${d||l?"✓ 結算":"➡ 下一題"}</button>
        <button type="button" class="btn btn-outline" data-action="exitBank">← 返 Game Hub</button>
      </div>
    </div>
  `}function Ga(t){if(!t)return X({emoji:"🫥",title:"冇紀錄"});const e=t.status==="finished"&&t.balance>=N.TARGET_BALANCE,n=t.status==="bankrupt",a=t.stamps.filter(c=>c.delta>0).reduce((c,u)=>c+u.delta,0),o=t.stamps.filter(c=>c.delta<0).reduce((c,u)=>c+u.delta,0),i=t.stamps.filter(c=>c.delta>0).length,s=t.stamps.filter(c=>c.delta<0).length,r=t.questions.filter(c=>c.domain==="caring"||c.riskLevel!=null&&c.riskLevel>0).length,l=t.questions.length-r,d=`<div class="bank-summary-filter" style="font-size:0.85em;color:var(--text-light);text-align:center;margin:8px 0 14px 0">
    🎯 難度設定：${it(t.maxRisk)} · 本局 ${l} 個 value + ${r} 個 caring
  </div>`;return`
    <div class="container fade-in" style="max-width:560px">
      ${R({emoji:"🏦",title:"結算單"})}
      ${d}

      <div class="bank-end-banner ${e?"win":n?"lose":"end"}" style="font-size:1.1em" role="status">
        ${e?"🎉 品格富翁達陣！":n?"💔 今次破產喇":"🏁 旅程結束"}
      </div>

      <div class="progress-grid" style="margin:18px 0" role="list" aria-label="銀行結算統計">
        <div class="progress-cell" role="listitem">
          <div class="num" style="color:${t.balance>=0?"#22c55e":"#ef4444"}" aria-label="最終結餘 ${t.balance} 元">$${t.balance}</div>
          <div class="label">最終結餘</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="總存款 ${a} 元">+${a}</div>
          <div class="label">總存款</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="總扣款 ${o} 元">${o}</div>
          <div class="label">總扣款</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="好事 ${i} 個，衰事 ${s} 個">${i}✓ ${s}✗</div>
          <div class="label">好事 / 衰事</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:10px">📒 存摺紀錄</div>
        ${t.stamps.length===0?'<div style="color:var(--text-light);font-size:0.9em;text-align:center;padding:12px">冇交易紀錄</div>':`
          <div class="ledger-scroll" role="list" aria-label="存摺交易紀錄">
            ${t.stamps.map((c,u)=>`
              <div class="ledger-row" role="listitem">
                <span class="ledger-num" aria-hidden="true">#${u+1}</span>
                <span class="ledger-label">${c.label||"—"}</span>
                <span class="ledger-delta ${c.delta>0?"positive":c.delta<0?"negative":"neutral"}" aria-label="${c.delta>0?"存款":c.delta<0?"扣款":"無變化"} ${Math.abs(c.delta)} 元">${c.delta>0?"+":""}${c.delta} 元</span>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <div class="action-row">
        <button type="button" class="btn btn-primary" data-action="playGoodDeedBank">🔄 再玩一次</button>
        <button type="button" class="btn btn-outline" data-action="exitBank">← 返 Game Hub</button>
      </div>
      ${E()}
    </div>
  `}const Ka=[{id:"relaxed",icon:"🧘",title:"輕鬆學習",desc:"無計時、無限提示，慢慢做，慢慢學",color:"#eab308",bg:"linear-gradient(135deg, #fef9c3, #fef08a)"},{id:"timed",icon:"⚡",title:"計時挑戰",desc:"限時答題，計分，訓練答題速度",color:"#3b82f6",bg:"linear-gradient(135deg, #dbeafe, #bfdbfe)"},{id:"combo",icon:"🔥",title:"Combo 衝刺",desc:"連續答啱分數倍增，挑戰最高 Combo 數",color:"#ef4444",bg:"linear-gradient(135deg, #fee2e2, #fecaca)"},{id:"challenge",icon:"🎯",title:"挑戰模式",desc:"計時 + Combo 混合，最強挑戰",color:"#a855f7",bg:"linear-gradient(135deg, #f3e8ff, #e9d5ff)"}];function Ya(t,e){const n=t||localStorage.getItem("fc_game_mode")||"relaxed";return`
    <div class="mode-screen fade-in">
      ${R({emoji:"🎮",title:"選擇遊戲模式",back:"role-select",backLabel:"返回主選單"})}

      <div class="mode-header">
        <p>你鍾意點玩？揀一個模式開始！</p>
      </div>

      <div class="mode-grid" role="radiogroup" aria-label="遊戲模式">
        ${Ka.map(a=>`
          <button type="button" class="mode-card ${a.id} ${n===a.id?"selected":""}"
               style="background:${a.bg};border-color:${a.color}"
               data-action="selectMode" data-arg="${b(a.id)}"
               role="radio" aria-checked="${n===a.id}"
               aria-label="${a.title}：${a.desc}${n===a.id?"（已選）":""}">
            <div class="mc-icon" aria-hidden="true">${a.icon}</div>
            <div class="mc-title">${a.title}</div>
            <div class="mc-desc">${a.desc}</div>
          </button>
        `).join("")}
      </div>

      <div class="fc-center-20 fc-mb-20">
        <p class="fc-muted-sm">
          💡 模式可以在設定頁隨時更改
        </p>
      </div>

      ${e?`
        <div class="fc-center">
          <button type="button" class="btn btn-primary" style="min-width:220px;font-size:1.1em"
            data-action="navigate" data-arg="home">
            ✅ 確定，開始學習 →
          </button>
        </div>
      `:`
        <div class="fc-center">
          <button type="button" class="btn btn-primary" style="min-width:220px;font-size:1.1em"
            data-action="navigate" data-arg="subject-select">
            📚 選擇課題 →
          </button>
        </div>
      `}

      <div class="fc-center-top">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回</button>
      </div>

      ${E()}
    </div>
  `}function Xa(){const t=j.map(a=>{var o;return{...a,sub:((o=a.description)==null?void 0:o.split(/[，。,。]/)[0])||""}});let e={};try{e=JSON.parse(localStorage.getItem("fc_teacher_config")||"{}")}catch{e={}}const n={hintEnabled:e.hintEnabled!==!1,timerEnabled:e.timerEnabled??!1,timerSeconds:e.timerSeconds||30,comboEnabled:e.comboEnabled??!1,bankMaxRiskLevel:e.bankMaxRiskLevel??1,buttonSize:e.buttonSize||"normal",assignedTopics:e.assignedTopics||[]};return`
    <div class="container fade-in">
      ${R({emoji:"⚙️",title:"功能設定",back:"teacher",backLabel:"返回老師主控台"})}

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:14px">🔘 功能開關</div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">💡 提示功能</div>
            <div class="ft-desc">學生可以睇提示</div>
          </div>
          <button type="button" class="toggle-switch ${n.hintEnabled?"on":""}"
            data-action="toggleTeacherFeature" data-arg2="hintEnabled"
            role="switch" aria-checked="${n.hintEnabled}" aria-label="提示功能開關"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">⏱️ 計時功能</div>
            <div class="ft-desc">開啟後每題限時答題</div>
          </div>
          <button type="button" class="toggle-switch ${n.timerEnabled?"on":""}"
            data-action="toggleTeacherFeature" data-arg2="timerEnabled"
            role="switch" aria-checked="${n.timerEnabled}" aria-label="計時功能開關"></button>
        </div>

        ${n.timerEnabled?`
        <div style="padding:10px 0 14px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>答題時限</strong>
            <span style="color:var(--primary);font-weight:600">${n.timerSeconds} 秒</span>
          </div>
          <input type="range" min="10" max="60" step="5" value="${n.timerSeconds}"
            oninput="FC.setTeacherTimer(this.value)"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)">
            <span>10秒</span><span>30秒</span><span>60秒</span>
          </div>
        </div>
        `:""}

        <div class="feature-toggle">
          <div>
            <div class="ft-label">🔥 Combo 系統</div>
            <div class="ft-desc">開啟連續答啱加分</div>
          </div>
          <button type="button" class="toggle-switch ${n.comboEnabled?"on":""}"
            data-action="toggleTeacherFeature" data-arg2="comboEnabled"
            role="switch" aria-checked="${n.comboEnabled}" aria-label="Combo 系統開關"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">🏦 銀行題目難度</div>
            <div class="ft-desc">限制好人好事銀行抽題嘅 risk level 上限</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap" role="radiogroup" aria-label="銀行題目難度">
            ${[{v:0,label:"只 value"},{v:1,label:"≤1（低）"},{v:2,label:"≤2（中）"},{v:3,label:"全開"}].map(a=>`
              <button type="button"
                class="btn ${n.bankMaxRiskLevel===a.v?"btn-primary":"btn-outline"}"
                style="padding:6px 10px;font-size:0.82em;min-height:36px"
                data-action="setBankMaxRisk" data-arg="${a.v}"
                role="radio" aria-checked="${n.bankMaxRiskLevel===a.v}">${a.label}</button>
            `).join("")}
          </div>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">👆 按鈕大小</div>
            <div class="ft-desc">控制答題按鈕尺寸</div>
          </div>
          <div style="display:flex;gap:6px" role="radiogroup" aria-label="按鈕大小">
            <button type="button" class="btn ${n.buttonSize==="large"?"btn-primary":"btn-outline"}"
              style="padding:6px 12px;font-size:0.85em;min-height:36px"
              data-action="setButtonSize" data-arg="large"
              role="radio" aria-checked="${n.buttonSize==="large"}">大</button>
            <button type="button" class="btn ${n.buttonSize==="normal"?"btn-primary":"btn-outline"}"
              style="padding:6px 12px;font-size:0.85em;min-height:36px"
              data-action="setButtonSize" data-arg="normal"
              role="radio" aria-checked="${n.buttonSize==="normal"}">中</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:12px">📋 課題範圍</div>
        <p style="font-size:0.88em;color:var(--text-light);margin-bottom:12px">
          勾選要考核的主題，留空 = 全部開放
        </p>
        ${t.map(a=>`
          <label style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer">
            <input type="checkbox" value="${a.id}"
              ${n.assignedTopics.includes(a.id)||n.assignedTopics.length===0?"checked":""}
              onchange="FC.toggleAssignedTopic('${a.id}', this.checked)"
              style="width:22px;height:22px;accent-color:var(--primary)" />
            <span style="font-size:1.2em">${a.emoji}</span>
            <span style="font-weight:600">${a.title}</span>
            <span style="margin-left:auto;font-size:0.82em;color:var(--text-light)">${a.sub}</span>
          </label>
        `).join("")}
      </div>

      <div class="card">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:10px">🔐 PIN 安全</div>
        <p style="font-size:0.88em;color:var(--text-light);margin-bottom:12px">
          老師模式 PIN（預設：admin）
        </p>
        <label for="teacher-pin-input" style="position:absolute;left:-9999px">老師模式 PIN</label>
        <input type="password" id="teacher-pin-input" value="admin" maxlength="6" autocomplete="current-password"
          placeholder="輸入新 PIN"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:12px;font-size:1em;box-sizing:border-box;margin-bottom:10px" />
        <button type="button" class="btn btn-outline" style="width:100%;font-size:0.95em"
          data-action="saveTeacherPIN">💾 儲存 PIN</button>
      </div>

      <div class="fc-mt-16">
        <button type="button" class="btn btn-primary" class="fc-w-100"
          data-action="saveTeacherConfig">✅ 儲存所有設定</button>
      </div>

      ${E({marginTop:"24px"})}
    </div>
  `}function Ja(t){if(!t)return"";const n=_(t).totalMoralScore||0,{percent:a,color:o}=De(n);return`
    <div class="moral-bar-fixed" id="moral-bar">
      <div class="moral-bar-inner">
        <span class="moral-emoji">⭐</span>
        <span class="moral-label">道德值</span>
        <div class="moral-track">
          <div class="moral-fill" style="width:${a}%;background:${o}"></div>
        </div>
        <span class="moral-num">${n}</span>
        <span id="sync-badge" title="已連線" style="font-size:0.95em;opacity:0.85">☁️</span>
      </div>
    </div>
  `}function Wa(t,e){var d;const n=e.total||0,a=e.completed||0,o=n?Math.round(a/n*100):0,i=((d=t.description)==null?void 0:d.split(/[，。,。]/)[0])||t.description||"";let s="",r="",l="";return n===0?(r="topic-status--new",s='<div class="topic-status" aria-hidden="true">未開始</div>',l="未開始"):o>=100?(r="topic-status--done",s='<div class="topic-status" aria-hidden="true">🏆 已精通</div>',l="已精通"):(r="topic-status--progress",s=`<div class="topic-status" aria-hidden="true">${a}/${n} · ${o}%</div>`,l=`完成 ${a} 題，共 ${n} 題，${o}%`),`
              <button type="button" class="topic-card ${r}" style="background:${t.color}" data-action="goTopic" data-arg="${b(t.id)}"
      aria-label="${t.title}，${i}，${l}">
      <span class="emoji" aria-hidden="true">${t.emoji}</span>
      <div class="title">${t.title}</div>
      <div class="sub">${i}</div>
      ${n>0?`
        <div class="progress-bar" role="progressbar" aria-valuenow="${o}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.title} 進度">
          <div class="progress-fill" style="width:${o}%"></div>
        </div>
      `:""}
      ${s}
    </button>
  `}function Qa(t){var le,ce;const e=$()||"同學",n=$()?_($()):null,a=((le=n==null?void 0:n.streak)==null?void 0:le.current)||0,o=((ce=n==null?void 0:n.streak)==null?void 0:ce.longest)||0,i=(n==null?void 0:n.topicProgress)||{},s=sa(),r=a>=7?"🔥":a>=3?"✨":a>=1?"🌱":"💤",l=a>=7?"flame--hot":a>=1?"flame--warm":"flame--cold",d=["value","caring","all"],c=typeof localStorage<"u"&&localStorage.getItem("fc_home_filter")||"";let u=d.includes(c)?c:"";u||(t==="value"?u="value":t==="caring"?u="caring":u="all");const v=u==="all"?j:j.filter(C=>C.domain===u),I=(C,de,ue)=>{const ge=u===C;return`<button type="button" class="home-filter-tab ${ge?"active":""}"
        data-action="setHomeFilter" data-arg="${C}"
        aria-pressed="${ge}" aria-label="顯示${de}，共 ${ue} 個">${de} <span class="home-filter-count">${ue}</span></button>`},g=j.filter(C=>C.domain==="value").length,x=j.filter(C=>C.domain==="caring").length,M=u==="all"?"🪷🌈 全部 17 個品格課題":u==="value"?"🪷 12 個 EDB 官方價值觀":"🌈 5 個友愛校園範疇（SEL / 安全）";return`
    <div class="container fade-in">
      ${R({emoji:"🌟",title:"友愛教室",back:"hub",backLabel:"返回 Game Hub",rightButton:'<button type="button" class="back-btn" data-action="switchStudent" title="切換學生" aria-label="切換學生">🔄</button>'})}

      ${$()?Ja($()):""}

      <div class="home-hero">
        <div class="hero-greeting">
          <div class="hero-emoji" aria-hidden="true">👋</div>
          <div class="hero-text">
            <div class="hero-line">你好，<span class="hero-name">${e}</span>！</div>
            <div class="hero-sub">揀個品格課題開始 🎯</div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat streak-stat ${l}" title="${o>0?`最長紀錄 ${o} 日`:"今日開始你嘅 streak！"}" role="status" aria-label="連續學習 ${a} 日${o>0?`，最長紀錄 ${o} 日`:""}">
            <span class="flame" aria-hidden="true">${r}</span>
            <span class="stat-num">${a}</span>
            <span class="stat-label">日 streak</span>
          </div>
        </div>
      </div>

      <div class="daily-creed" role="region" aria-label="今日信條">
        <span class="creed-badge">🌟 今日信條</span>
        <div class="creed-body">
          <div class="creed-title">${s.title}</div>
          <div class="creed-text">${s.text}</div>
        </div>
      </div>

      <div class="home-filter-row" role="tablist" aria-label="課題分類過濾">
        ${I("value","🪷 價值觀",g)}
        ${I("caring","🌈 友愛校園",x)}
        ${I("all","📚 全部",j.length)}
      </div>

      <div class="topic-section">
        <h2 class="section-title">${M}</h2>
        <div class="topic-grid" role="list" aria-label="${M}">
          ${v.map(C=>Wa(C,i[C.id]||{})).join("")}
        </div>
      </div>

      <div class="home-footer-grid">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="progress">📊 我的進度</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="settings">⚙️ 設定</button>
        <button type="button" class="btn btn-outline" data-action="switchStudent">🔄 切換學生</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="hub">🎮 返回 Game Hub</button>
      </div>
      ${E()}
    </div>
  `}function Za(t,e){const n=Ut(t),a=W(t),o=pt(e);return Ve(t),`
    <div class="container fade-in">
      ${R({title:`${n.emoji} ${n.title}`,back:"home",backLabel:"返回主頁",backArg:void 0,rightButton:e?`<span class="topic-badge" style="background:${o}">${Ht(e)} ${Vt(e)}</span>`:""})}
      <p style="color:var(--text-light);margin-bottom:16px">${n.description}</p>

      <ul class="scenario-list" role="list" aria-label="${n.title} 嘅 ${a.length} 個情境">
        ${a.map(i=>{const s=$()&&ba($(),i.id);return`
            <li role="listitem">
              <button type="button" class="scenario-item ${s?"completed":""}" data-action="play" data-arg="${b(i.id)}"
                aria-label="${i.title}，${i.background||""}${s?"，已完成":""}">
                <span class="check" aria-hidden="true">${s?"✓":""}</span>
                <span class="info">
                  <span class="title">${i.title}</span>
                  <span class="sub">${i.background||""}</span>
                </span>
                <span aria-hidden="true" style="font-size:1.2em">→</span>
              </button>
            </li>
          `}).join("")}
      </ul>
      ${E()}
    </div>
  `}function to(t,e){const n=Ne(t);if(!n)return X({emoji:"🫥",title:"場景不存在",actionLabel:"← 返首頁",onAction:"FC.goHome()"});const a=Ut(n.topicId);pt(e);const o=W(n.topicId),i=o.findIndex(r=>r.id===n.id)+1,s=o.length;return`
    <div class="container fade-in">
      ${R({titleHTML:`<h1 style="flex:1;text-align:center">${b((a==null?void 0:a.emoji)||"")} ${b((a==null?void 0:a.title)||"")}</h1>`,back:"topic",backLabel:`返回 ${(a==null?void 0:a.title)||"主題"}`,backArg:n.topicId,rightButton:`<span class="play-progress" aria-label="第 ${i} 題，共 ${s} 題">第 ${i} / ${s} 題</span>`})}

      <div class="play-top">
        <div class="scenario-title">${n.title}</div>
        <div class="scenario-bg">📍 ${n.background||""}</div>
      </div>

      <div class="scenario-desc">
        <button type="button" class="inline-voice-btn" data-action="speak" title="朗讀題目" aria-label="朗讀題目">🔊</button>
        ${n.description}
      </div>

      ${n.hints&&n.hints.length?`
      <div class="hints-panel" id="hints-panel">
        <button type="button" class="hints-toggle" data-action="toggleHints" aria-expanded="false" aria-controls="hints-list" id="hints-toggle">
          <span class="hints-icon" aria-hidden="true">💡</span>
          <span>提示</span>
          <span class="hints-count" aria-label="${n.hints.length} 個提示">${n.hints.length}</span>
          <span class="hints-chev" id="hints-chev" aria-hidden="true">▾</span>
        </button>
        <div class="hints-list" id="hints-list" hidden>
          ${n.hints.map((r,l)=>`
            <div class="hint-item" data-hint-idx="${l}" hidden>
              <span class="hint-num" aria-hidden="true">${l+1}</span>
              <span class="hint-text">${r}</span>
            </div>
          `).join("")}
          <button type="button" class="hint-next" id="hint-next" data-action="revealNextHint">
            睇下一個提示 →
          </button>
        </div>
      </div>`:""}

      <div class="scenario-image-wrap">
        <img src="assets/images/scenarios/${n.id}.png" alt="${n.title}" class="scenario-image"
             loading="eager" fetchpriority="high"
 />
      </div>

      <div class="options-divider" aria-hidden="true">— 揀你嘅選擇 —</div>

      <div class="options" role="radiogroup" aria-label="${n.title} 嘅選擇題">
        ${n.options.map((r,l)=>Sa({scenarioId:n.id,opt:r,index:l,isBank:!1,showMoral:!0})).join("")}
      </div>

      <button type="button" class="voice-fab" data-action="speak" title="朗讀題目" aria-label="朗讀題目">🔊</button>
      ${E()}
    </div>
  `}function eo(t,e){var v,I;if(!t)return X({emoji:"⚠️",title:"結果載入失敗，請重試。",actionLabel:"← 返首頁",onAction:"FC.goHome()"});const{option:n,moralChange:a,mainComment:o,creeds:i,creedText:s,scenarioImage:r,scenarioTitle:l}=t,d=a>=0,c=pt(e),u=`${d?"加咗 ":"減咗 "}${Math.abs(a)} 道德分${d?"，做得好好！":"，下次再努力。"}`;return`
    <div class="container fade-in" id="result-root">
      <h1 class="sr-only" aria-live="polite" aria-atomic="true">${l}嘅結果：${u}</h1>
      ${e?`<div style="text-align:center;margin-bottom:8px">
        <span class="topic-badge" style="background:${c}">${Ht(e)} ${Vt(e)}</span>
      </div>`:""}
      ${r?`
      <div class="scenario-image-wrap" style="max-height:180px;margin-bottom:16px;border-radius:16px;overflow:hidden">
        <img src="${r}" alt="${l}" style="width:100%;max-height:180px;object-fit:cover"
             loading="lazy" decoding="async" />
      </div>`:""}
      <div class="result-card ${d?"good":"bad"}" id="result-card" role="status" aria-label="${u}">
        <div class="result-emoji" aria-hidden="true">${d?"🌟":"💪"}</div>
        <div class="comment">${o||"你做出了選擇！"}</div>
        <div class="moral-score" aria-label="${u}">${d?"＋":""}${a} 道德分</div>
      </div>

      <div class="creed-show" role="region" aria-label="學校信條">
        <div class="creed-header">
          <div class="label">🌟 學校信條</div>
          <button type="button" class="inline-voice-btn" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
        </div>
        <div class="items">
          ${(s||[]).map(g=>`<div class="item">${g}</div>`).join("")}
        </div>
      </div>

      ${t.outcomeImage?`
      <div class="outcome-image-wrap" style="margin-top:16px;border-radius:16px;overflow:hidden">
        <img src="${t.outcomeImage}" alt="結果圖" style="width:100%;border-radius:16px"
             loading="lazy" decoding="async"
 />
      </div>`:""}

      <div class="action-row" id="result-actions">
        <button type="button" class="btn btn-primary" data-action="retry">🔄 再做一次</button>
        ${(function(){var x;const g=ye((x=nt())==null?void 0:x.topicId);return g?`<button type="button" class="btn btn-primary" data-action="play" data-arg="${b(g.id)}">下一題 →</button>`:""})()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${b(((v=nt())==null?void 0:v.topicId)||"")}">← 返回主題</button>
      </div>

      <div class="action-cta-fab" id="result-cta-fab" hidden>
        <button type="button" class="btn btn-primary" data-action="retry">🔄 再做一次</button>
        ${(function(){var x;const g=ye((x=nt())==null?void 0:x.topicId);return g?`<button type="button" class="btn btn-primary" data-action="play" data-arg="${b(g.id)}">下一題 →</button>`:""})()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${b(((I=nt())==null?void 0:I.topicId)||"")}">← 返回主題</button>
      </div>

      <button type="button" class="voice-fab" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
      ${E()}
    </div>
  `}function no(t){const e=va($()),n=e.score,a=e.completedCount,o=pt(t),i=[{id:"value",title:"🎯 價值觀教育",color:"#7C3AED"}];return`
    <div class="container fade-in">
${R({emoji:"📊",title:"我的進度",back:"home",backLabel:"返回主頁",rightButton:t?`<span class="topic-badge" style="background:${o}">${Ht(t)} ${Vt(t)}</span>`:""})}

      <div class="progress-grid" role="list" aria-label="學習統計">
        <div class="progress-cell big" role="listitem">
          <div class="num" aria-label="總道德分 ${n}">${n}</div>
          <div class="label">🎯 總道德分</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="已完成 ${a} 個場景">${a}</div>
          <div class="label">📝 已完成場景</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="最近遊玩 ${p.lastPlayed||"從未"}">${p.lastPlayed?new Date(p.lastPlayed).toLocaleDateString("zh-HK",{month:"short",day:"numeric"}):"—"}</div>
          <div class="label">🗓️ 最近遊玩</div>
        </div>
      </div>

      ${t?`<div class="card" style="margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:10px">📚 科目進度</div>
        ${i.map(s=>{var d;const r=((d=p.subjectProgress)==null?void 0:d[s.id])||{},l=r.total?Math.round(r.completed/r.total*100):0;return`
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:${s.color};font-weight:600">${s.title}</span>
                <span style="color:var(--text-light)">${r.completed||0}/${r.total||0}</span>
              </div>
              <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${l}%;background:${s.color};border-radius:4px;transition:width 0.4s"></div>
              </div>
            </div>`}).join("")}
      </div>`:""}

      ${j.map(s=>{const r=p.topicProgress[s.id]||{},l=r.total?Math.round(r.completed/r.total*100):0;return`
          <div class="card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:1.2em">${s.emoji}</span>
              <strong>${s.title}</strong>
              <span style="margin-left:auto;color:var(--text-light)">${r.completed||0}/${r.total||0}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${l}%;background:${s.color};border-radius:4px;transition:width 0.4s"></div>
            </div>
          </div>
        `}).join("")}

      <div class="action-row">
        <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出進度</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回首頁</button>
      </div>
      ${E()}
    </div>
  `}function ao(){var v,I;const t=localStorage.getItem("fc_tts_speed")||"0.85",e=localStorage.getItem("fc_font_size")||"18",n=localStorage.getItem("fc_line_height")||"1.5",a=localStorage.getItem("fc_spacing")||"medium",o=localStorage.getItem("fc_tts_lang")||"auto",i=localStorage.getItem("fc_hc_mode")==="1",s=localStorage.getItem("fc_rm_mode")==="1";let r=!1;try{r=((v=window.matchMedia)==null?void 0:v.call(window,"(prefers-reduced-motion: reduce)").matches)||!1}catch{}const l=e<=18?"小":e<=22?"中":"大",d=je(),c=(()=>{try{return window._fcSyncStatus||{status:"idle",isOnline:navigator.onLine,lastSyncTime:null}}catch{return{status:"idle",isOnline:!0}}})(),u=c.lastSyncTime?new Date(c.lastSyncTime).toLocaleString("zh-HK",{dateStyle:"short",timeStyle:"short"}):"從未同步";return`
    <div class="container fade-in">
${R({emoji:"⚙️",title:"個人化設定",back:"role-select",backLabel:"返回主選單"})}

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:8px">📊 學習記錄</div>
        <div style="font-size:0.9em;color:var(--text-light);margin-bottom:10px">
          揀過嘅每個選項都會記低喺本地，包括 category 同答得啱唔啱。
          匯出 CSV 畀老師，就可以分析邊個 category 答錯率最高。
        </div>
        <div id="analytics-summary" style="font-size:0.88em;color:var(--text-light);margin-bottom:10px;padding:8px 10px;background:var(--bg-soft, #f7f7fa);border-radius:8px" aria-live="polite" aria-atomic="true">
          載入中…
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-primary" data-action="exportAnalyticsCSV" style="flex:1">📤 匯出學習記錄 (CSV)</button>
          <button type="button" class="btn btn-outline" data-action="clearAnalytics" style="font-size:0.85em">🗑️ 清除</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">🔊 語音朗讀</div>
        <div class="setting-row" style="margin-bottom:12px">
          <div>
            <strong id="voice-toggle-label">開 / 關</strong>
            <div class="fc-muted-sm">自動朗讀題目和信條</div>
          </div>
          <button type="button" class="toggle ${d?"on":""}" data-key="voice" data-action="toggleVoice"
            role="switch" aria-checked="${d}" aria-labelledby="voice-toggle-label"
            aria-label="語音朗讀開關"></button>
        </div>
        <div style="margin-bottom:12px">
          <div style="margin-bottom:6px">
            <strong>發音語言</strong>
            <div style="font-size:0.82em;color:var(--text-light);margin-top:2px">揀錯會 load 國語而唔係粵語</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" role="radiogroup" aria-label="發音語言">
            ${(((I=window.FC)==null?void 0:I.TTS_LANGS)||[]).map(g=>`
              <button type="button" class="btn"
                data-active="${o===g.id}"
                style="flex:1;min-width:0;font-size:0.88em;padding:8px 6px;${o===g.id?"background:var(--primary);color:#fff;border:3px solid var(--primary);":"background:transparent;border:3px solid var(--primary);color:var(--primary);"}"
                data-action="setTTSLang" data-arg="${b(g.id)}"
                title="${g.hint}"
                role="radio" aria-checked="${o===g.id}">${g.label}</button>
            `).join("")}
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="speed-range"><strong>朗讀速度</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="speed">${parseFloat(t).toFixed(2)}x</span>
          </div>
          <input id="speed-range" type="range" min="0.5" max="1.5" step="0.05" value="${t}"
            oninput="FC.setSpeed(this.value)"
            aria-label="朗讀速度，目前 ${parseFloat(t).toFixed(2)}x"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)" aria-hidden="true">
            <span>慢</span><span>正常</span><span>快</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">🌓 顯示模式</div>
        <div class="setting-row">
          <div>
            <strong id="hc-toggle-label">高對比模式</strong>
            <div class="fc-muted-sm">純黑/白、3px 強制 border、無漸變，適合光線不足或在戶外使用</div>
          </div>
          <button type="button" class="toggle ${i?"on":""}" data-key="hc" data-action="toggleHC"
            role="switch" aria-checked="${i}" aria-labelledby="hc-toggle-label"
            aria-label="高對比模式開關"></button>
        </div>
        <div class="setting-row" class="fc-mt-12">
          <div>
            <strong id="rm-toggle-label">減少動畫</strong>
            <div class="fc-muted-sm">停掉過場動畫同慶祝效果${r&&!s?"（系統已偵測到偏好）":""}</div>
          </div>
          <button type="button" class="toggle ${s?"on":""}" data-key="rm" data-action="toggleReducedMotion"
            role="switch" aria-checked="${s}" aria-labelledby="rm-toggle-label"
            aria-label="減少動畫開關"></button>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">📝 文字顯示</div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="fs-range"><strong>字體大小</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="fs">${l}</span>
          </div>
          <input id="fs-range" type="range" min="16" max="32" step="2" value="${e}"
            oninput="FC.setFontSize(this.value)"
            aria-label="字體大小，目前 ${e} 像素（${l}）"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)" aria-hidden="true">
            <span>Aa</span><span style="font-size:1.2em">Aa</span><span style="font-size:1.5em">Aa</span>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="lh-range"><strong>行距</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="lh">${n}</span>
          </div>
          <input id="lh-range" type="range" min="1.2" max="2.2" step="0.1" value="${n}"
            oninput="FC.setLineHeight(this.value)"
            aria-label="行距，目前 ${n}"
            style="width:100%;accent-color:var(--primary)" />
        </div>
        <div>
          <div style="margin-bottom:6px"><strong>間格</strong></div>
          <div style="display:flex;gap:8px" role="radiogroup" aria-label="間距">
            <button type="button" class="btn ${a==="narrow"?"btn-primary":"btn-outline"}" data-action="setSpacing" data-arg="narrow" id="sp-narrow" role="radio" aria-checked="${a==="narrow"}" style="flex:1;padding:8px;font-size:0.9em">窄</button>
            <button type="button" class="btn ${a==="medium"?"btn-primary":"btn-outline"}" data-action="setSpacing" data-arg="medium" id="sp-medium" role="radio" aria-checked="${a==="medium"}" style="flex:1;padding:8px;font-size:0.9em">中</button>
            <button type="button" class="btn ${a==="wide"?"btn-primary":"btn-outline"}" data-action="setSpacing" data-arg="wide" id="sp-wide" role="radio" aria-checked="${a==="wide"}" style="flex:1;padding:8px;font-size:0.9em">闊</button>
          </div>
        </div>
        <div style="margin-top:12px;text-align:center">
          <button type="button" class="btn btn-outline" data-action="resetSettings" style="color:var(--text-light);font-size:0.85em">🔄 重置所有設定</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">☁️ 雲端同步</div>
        <div style="font-size:0.9em;color:var(--text-light);margin-bottom:10px">
          連線狀態：<span id="settings-sync-status">${c.isOnline?"在線":"📴 離線"}</span>
          &nbsp;·&nbsp;上次同步：<span id="settings-last-sync">${u}</span>
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-outline" data-action="forceSync">🔄 立即同步</button>
          <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出</button>
          <button type="button" class="btn btn-outline" data-action="importMyData">📥 匯入</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">👥 資料管理</div>
        <div class="action-row">
          <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出我的進度</button>
          <button type="button" class="btn btn-outline" data-action="importMyData">📥 匯入進度</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">🔐 老師模式</div>
        <button type="button" class="btn btn-primary" data-action="goTeacher">進入老師模式</button>
      </div>

      <div class="privacy-notice" role="region" aria-label="資料收集說明" style="background:#fffbe6;border:1px solid #faad14;border-radius:12px;padding:16px;margin-top:24px;font-size:14px;color:#8a6d3b">
        <h2 style="margin-bottom:8px;font-size:1em">🔒 資料收集說明</h2>
        <p>本應用使用瀏覽器本地儲存（localStorage）保存以下資料：</p>
        <ul style="margin:8px 0 0 20px">
          <li>個人化設定（字體大小、行距、朗讀速度）</li>
          <li>學習進度及題目記錄</li>
          <li>每題作答記錄（category、選項、答得啱唔啱、用咗幾耐）</li>
        </ul>
        <p class="fc-mt-8">📌 學生名字會以 hash 儲存，唔會明文。離線使用時，進度仍保存在本地。恢復連線後自動同步。</p>
        <p style="margin-top:4px">🚫 <strong>唔會上傳去任何 server</strong>，純本地儲存。可隨時喺「📊 學習記錄」清除。</p>
      </div>

      ${E()}
    </div>
  `}const oo=(window.location.hostname==="localhost"&&window.location.port==="5173","http://localhost:8000");let rt=localStorage.getItem("fc_teacher_token")||null,qe=parseInt(localStorage.getItem("fc_teacher_expiry")||"0",10),V=navigator.onLine,z="idle",G=null;const xe="fc_device_id";function io(){let t=localStorage.getItem(xe);return t||(t="device_"+Math.random().toString(36).slice(2)+"_"+Date.now(),localStorage.setItem(xe,t)),t}window.addEventListener("online",()=>{V=!0,h.emit("sync:status",{status:"online"}),co()});window.addEventListener("offline",()=>{V=!1,z="offline",h.emit("sync:status",{status:"offline"})});async function so(t,e,n,a={}){const o=oo+e,i={"Content-Type":"application/json",...a.headers};rt&&(i["X-Teacher-Token"]=rt);const s=await fetch(o,{method:t,headers:i,body:n?JSON.stringify(n):void 0,signal:AbortSignal.timeout(8e3)});if(!s.ok){const r=await s.json().catch(()=>({message:s.statusText}));throw new Error(r.message||`HTTP ${s.status}`)}return s.json()}async function Jt(t,e){if(!V)return z="offline",h.emit("sync:status",{status:"offline"}),{ok:!1,reason:"offline"};z="syncing",h.emit("sync:status",{status:"syncing",student:t});try{const n=await so("POST","/api/sync",{name:t,completedScenarios:e.completedScenarios||[],topicProgress:e.topicProgress||{},subjectProgress:e.subjectProgress||{},totalMoralScore:e.totalMoralScore||0,lastPlayed:e.lastPlayed,deviceId:io()});return z="ok",G=new Date().toISOString(),h.emit("sync:status",{status:"ok",student:t,lastSynced:G}),localStorage.setItem(`fc_last_sync_${t}`,G),{ok:!0,lastSynced:G}}catch(n){return z="error",h.emit("sync:status",{status:"error",student:t,error:n.message}),console.warn("[Sync] Failed:",n.message),{ok:!1,reason:n.message}}}const Ge="fc_sync_queue";function we(){try{const t=localStorage.getItem(Ge),e=JSON.parse(t);return Array.isArray(e)?e:[]}catch(t){return console.warn("[sync] queue load failed:",t),[]}}function ro(t){try{localStorage.setItem(Ge,JSON.stringify(t))}catch(e){console.warn("[sync] queue persist failed:",e)}}let kt=!1;async function lo(){if(!(kt||!V||we().length===0)){kt=!0;try{for(;;){const e=we();if(e.length===0)break;const n=e[0];if(!(await Jt(n.name,n.progress)).ok)break;ro(e.slice(1))}}finally{kt=!1}}}function co(){lo()}function uo(){return rt?Date.now()>qe?(go(),!1):!0:!1}function go(){rt=null,qe=0,localStorage.removeItem("fc_teacher_token"),localStorage.removeItem("fc_teacher_expiry")}function po(){return{status:z,isOnline:V,lastSyncTime:G,teacherLoggedIn:uo()}}function mo(t,e){V&&t&&e&&setTimeout(()=>Jt(t,e),500)}const lt="fc_interactions_v1",Ke="fc_current_scenario_played_at",$e=1e4;async function fo(t){if(!t)return"anon";try{const e=new TextEncoder().encode(t),n=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("").slice(0,8)}catch{return"h_"+bo(t)}}function bo(t){let e=0;for(let n=0;n<t.length;n++)e=(e<<5)-e+t.charCodeAt(n),e=e&e;return Math.abs(e).toString(36).slice(0,8)}function ct(){try{const t=localStorage.getItem(lt);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch(t){return console.warn("[Analytics] load failed:",t.message),[]}}function Se(t){try{const e=t.length>$e?t.slice(t.length-$e):t;localStorage.setItem(lt,JSON.stringify(e))}catch(e){if(e.name==="QuotaExceededError"||/quota/i.test(e.message)){const n=t.slice(Math.floor(t.length/2));try{localStorage.setItem(lt,JSON.stringify(n)),console.warn("[Analytics] quota hit, trimmed to",n.length)}catch(a){console.error("[Analytics] save failed after trim:",a.message)}}else console.error("[Analytics] save failed:",e.message)}}function vo(){try{sessionStorage.setItem(Ke,String(performance.now()))}catch{}}function Ye(t,e,n){if(!t||!t.scenarioId||!t.optionId){console.warn("[Analytics] logInteraction missing fields:",t);return}const a=Date.now(),o=Number(t.moralChange)||0;let i=null;try{const l=parseFloat(sessionStorage.getItem(Ke)||"0");l>0&&(i=Math.max(0,Math.round(performance.now()-l)))}catch{}const s={timestamp:new Date(a).toISOString(),studentHash:"",scenarioId:t.scenarioId,topicId:t.topicId||"",category:t.category||"",optionId:t.optionId,optionIndex:t.optionIndex||0,isCorrect:o>=0,moralChange:o,responseTimeMs:i,gameMode:n||"relaxed",playedAt:new Date(a-(i||0)).toISOString()};fo(e).then(l=>{const d=ct();for(let c=d.length-1;c>=0;c--)if(!d[c].studentHash){d[c].studentHash=l;break}Se(d)});const r=ct();r.push(s),Se(r)}function ho(){try{localStorage.removeItem(lt)}catch{}}function yo(){const t=ct();if(!t.length)return{totalRows:0,byCategory:{},correctRate:null,avgResponseTimeMs:null};const e={};for(const o of t){const i=o.category||"(uncategorized)";e[i]||(e[i]={total:0,correct:0,wrong:0}),e[i].total++,o.isCorrect?e[i].correct++:e[i].wrong++}for(const o of Object.keys(e)){const i=e[o];i.wrongRate=i.total>0?+(i.wrong/i.total).toFixed(3):0}const n=t.filter(o=>o.isCorrect).length,a=t.map(o=>o.responseTimeMs).filter(o=>typeof o=="number");return{totalRows:t.length,byCategory:e,correctRate:+(n/t.length).toFixed(3),avgResponseTimeMs:a.length?Math.round(a.reduce((o,i)=>o+i,0)/a.length):null}}function xo(){const t=ct(),e=["timestamp","studentHash","scenarioId","topicId","category","optionId","optionIndex","isCorrect","moralChange","responseTimeMs","gameMode","playedAt"],n=d=>{if(d==null)return"";const c=String(d);return/[",\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c},a=[e.join(",")];for(const d of t)a.push(e.map(c=>n(d[c])).join(","));const o="\uFEFF"+a.join(`
`),i=`friendly_classroom_log_${new Date().toISOString().slice(0,10)}.csv`,s=new Blob([o],{type:"text/csv;charset=utf-8"}),r=URL.createObjectURL(s),l=document.createElement("a");return l.href=r,l.download=i,l.click(),setTimeout(()=>URL.revokeObjectURL(r),1e3),{count:t.length,filename:i}}const wo=new Set(["home","topic","progress","hub","settings","subject-select","role-select","mode-select","teacher-assign","login","teacher","bank-play","bank-result","bank-summary"]),$o={topic:"topicId"};let jt=null,Pt=null;function So({setView:t,navRender:e,render:n}){t&&(jt=t),e&&(Pt=e)}function vt(t,e){if(!wo.has(t)){console.warn(`[nav] unknown view: ${t}`);return}const n={},a=$o[t];a&&e!==void 0&&(n[a]=e),jt&&jt(t,n),Pt&&Pt()}let _t=null,Ct=null;function ko(){return Ct||(Ct=document.getElementById("sr-announcer")),Ct}let w=null,Tt=null;function _o(){return w||(w=document.createElement("div"),w.id="fc-announce-toast",w.setAttribute("role","status"),w.setAttribute("aria-live","polite"),w.setAttribute("aria-atomic","true"),w.style.cssText=["position: fixed","bottom: 24px","left: 50%","transform: translateX(-50%)","max-width: 90vw","padding: 12px 20px","background: rgba(15, 23, 42, 0.95)","color: #ffffff","border-radius: 12px","box-shadow: 0 8px 24px rgba(0,0,0,0.25)","font-size: 15px","font-weight: 500","line-height: 1.4","text-align: center","z-index: 9999","pointer-events: none","opacity: 0","transition: opacity 0.25s ease-out, transform 0.25s ease-out"].join(";"),document.body.appendChild(w),w)}function Co(t){w&&!w.isConnected&&(w=null);const e=document.documentElement.hasAttribute("data-rm"),n=_o();n.textContent=t,n.style.opacity="1",n.style.transform=e?"translateX(-50%)":"translateX(-50%) translateY(0)",Tt&&clearTimeout(Tt),Tt=setTimeout(()=>{n.style.opacity="0",n.style.transform=e?"translateX(-50%)":"translateX(-50%) translateY(8px)",setTimeout(()=>{n.style.opacity==="0"&&(n.textContent="")},300)},2500)}function To(t){const e=ko();e&&(e.textContent="",requestAnimationFrame(()=>{e.textContent=t})),Co(t)}async function Xe(t,e={}){if(!t)return;_t||(_t=(await Y(()=>Promise.resolve().then(()=>Hn),void 0,import.meta.url)).getTopic);const n=t.topicId?_t(t.topicId):null,a=(n==null?void 0:n.title)||"",o=e.index,i=e.total,s=e.gameName||"",r=[];o&&i&&r.push(`題目 ${o}，共 ${i} 題`),s&&r.push(s),a&&r.push(`主題：${a}`),r.push(`題目：${t.title}`),To(r.join("，"))}let Wt=null,Qt=null,Ft=null;function Eo({setView:t,render:e,renderFooter:n}){Wt=t,Qt=e,Ft=n}function Io(){Wt("student-select"),Qt()}function Ao(t){t!=="其他"&&(Aa(t),Wt("home",{student:t}),Qt())}function Ro(){return`
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h1 style="text-align:center;margin-bottom:24px">👤 選擇學生</h1>
      <div class="fc-flex-col-gap fc-mb-20" role="list" aria-label="已登記嘅學生">
        ${Oe().map(e=>`
          <button type="button" class="student-card" data-action="selectStudent" data-arg="${b(e.name)}" role="listitem"
            aria-label="選擇學生 ${b(e.name)}，按此開始學習">
            <span class="avatar" aria-hidden="true">${e.emoji||"👤"}</span>
            <span class="info">
              <span class="name">${e.name}</span>
              <span class="sub">按此開始學習</span>
            </span>
            <span class="arrow" aria-hidden="true">→</span>
          </button>
        `).join("")}
      </div>
      <div style="text-align:center;color:var(--text-light);margin-bottom:16px;font-size:0.9em">— 或新增學生 —</div>
      <div style="background:var(--card);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <label for="new-student-name" class="sr-only">新學生名字</label>
        <input id="new-student-name" type="text" inputmode="none" autocomplete="off" placeholder="輸入新學生名字"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:10px;font-size:1em;margin-bottom:10px;box-sizing:border-box" />
        <button type="button" class="btn btn-success" class="fc-w-100" data-action="addStudent">➕ 新增學生</button>
      </div>
      <div style="margin-top:16px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回首頁</button>
      </div>
      ${Ft?Ft():""}
    </div>
  `}let dt=null,ht=null,Lo=null,Je=null,We=null,Zt=null,te=null;function jo({setView:t,render:e,_loadTeacher:n,getAllSubjects:a,initSubjectProgress:o,getState:i,setState:s}){dt=t,ht=e,n=n,Je=a,We=o,Zt=i,te=s}function Po(t){We(t),dt("home",{subjectId:t}),ht()}async function Fo(t){const e=Zt();te({...e,role:t,teacherMode:t==="teacher"}),t==="teacher"?(await Lo(),dt("login")):dt("hub"),ht()}function Mo(t){localStorage.setItem("fc_game_mode",t);const e=Zt();te({...e,gameMode:t}),ht(),setTimeout(()=>{document.querySelectorAll(".mode-card").forEach(o=>o.classList.remove("selected"));const a=document.querySelector(`.mode-card.${t}`);a&&(a.classList.add("selected"),a.style.transform="scale(1.05)",setTimeout(()=>{a.style.transform=""},300))},50)}function Do(){return`
    <div class="container fade-in" style="max-width:500px">
      <h1 style="text-align:center;margin-bottom:20px">📚 選擇科目</h1>
      <div class="subject-grid" role="list" aria-label="科目清單">
        ${Je().map(t=>`
          <button type="button" class="subject-btn" style="background:${t.bgColor};border-color:${t.color}"
            data-action="selectSubject" data-arg="${b(t.id)}" role="listitem"
            aria-label="選擇科目 ${t.title}">
            <span style="font-size:2em" aria-hidden="true">${t.emoji}</span>
            <span style="font-weight:600;color:${t.color}">${t.title}</span>
          </button>
        `).join("")}
      </div>
      <div style="margin-top:12px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回</button>
      </div>
    </div>
  `}let Qe=null,Ze=null,tn=null,ee=null,en=null,nn=null,an=null,on=null,Mt=null,ke=null;function sn({setView:t,render:e,_navigate:n,getState:a,loadScenarios:o,_scenariosLoaded:i,playScenario:s,getScenariosByTopic:r,chooseOption:l,markScenarioShown:d,logInteraction:c,playSFX:u,_isReducedMotion:v}){Qe=t,Ze=e,n=n,ee=a,en=o,i=i,nn=s,an=l,on=c,Mt=u,v=v}function yt(t){return en().then(()=>yt())}function rn(t){const e=ee(),n=an(e.scenarioId,t,e.subjectId);if(!n){console.error("[Play] chooseOption returned null, scenarioId=",e.scenarioId,"optionId=",t),tn("home");return}try{const a=nn(e.scenarioId);if(a){const o=a.options.findIndex(i=>i.id===t);on({scenarioId:a.id,topicId:a.topicId,category:a.valueCategory||"",optionId:t,optionIndex:o>=0?o+1:0,moralChange:n.moralChange},e.student,e.gameMode)}}catch(a){console.warn("[Play] analytics log failed:",a.message)}Qe("result",{resultData:n}),Ze(),setTimeout(()=>{n.moralChange>=0?(Mt("success"),ke()||(Bo(),Oo())):(Mt("fail"),ke()||zo())},100)}function ln(){const t=ee();t.scenarioId?yt(t.scenarioId):tn("home")}function ut(){const t=document.getElementById("result-actions"),e=document.getElementById("result-cta-fab");if(!t||!e)return;const n=t.getBoundingClientRect();n.top>window.innerHeight||n.bottom<0?e.removeAttribute("hidden"):e.setAttribute("hidden","")}typeof window<"u"&&(window.addEventListener("scroll",()=>{document.getElementById("result-cta-fab")&&ut()},{passive:!0}),window.addEventListener("resize",ut));function Bo(){const t=["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFE66D"];for(let e=0;e<20;e++){const n=document.createElement("div");n.className="confetti-piece",n.style.left=Math.random()*90+5+"vw",n.style.top=Math.random()*30+10+"vh",n.style.background=t[Math.floor(Math.random()*t.length)],n.style.animationDelay=Math.random()*.5+"s",n.style.borderRadius=Math.random()>.5?"50%":"2px",document.body.appendChild(n),setTimeout(()=>n.remove(),2e3)}}function Oo(){const t=["🌟","✨","💫","⭐"];for(let e=0;e<6;e++){const n=document.createElement("div");n.className="star-float",n.textContent=t[Math.floor(Math.random()*t.length)],n.style.left=Math.random()*80+10+"vw",n.style.top=50+Math.random()*30+"vh",n.style.animationDelay=Math.random()*.8+"s",document.body.appendChild(n),setTimeout(()=>n.remove(),2e3)}}function zo(){const t=document.createElement("div");t.className="star-float",t.textContent="💪",t.style.left="50%",t.style.top="50%",t.style.transform="translate(-50%,-50%)",t.style.fontSize="4em",t.style.animation="bounceIn 0.8s ease-out forwards",document.body.appendChild(t),setTimeout(()=>t.remove(),1500)}const No=Object.freeze(Object.defineProperty({__proto__:null,choose:rn,play:yt,retry:ln,updateResultCtaFab:ut,wirePlay:sn},Symbol.toStringTag,{value:"Module"}));let F=null,cn=null,O=null,Dt=null,dn=null,xt=null,wt=!1,un=null,gn=null,pn=null,Bt=null,ne=null,mn=null,fn=null,bn=null,vn=null,hn=null;function Vo(t){F=t.setView,cn=t.navRender,O=t.render,Dt=t._navigate,dn=t.getState,xt=t.loadScenarios,wt=t._scenariosLoaded,un=t.getScenarios,gn=t.initTopicProgress,pn=t.applyScenarioResult,Bt=t.getStudent,ne=t.getBankRun,mn=t.startBankRun,fn=t.endBankRun,bn=t.advanceToNextQuestion,vn=t.recordBankTransaction,hn=t.logInteraction}function yn(t){if(!wt)return xt().then(()=>{yn(t)});gn(t),F("topic",{topicId:t}),cn()}async function Ho(){if(!dn().subjectId){Dt("subject-select");return}wt||await xt();const e=un();if(!e.length){Dt("home");return}const n=e[Math.floor(Math.random()*e.length)],{play:a}=await Y(async()=>{const{play:o}=await Promise.resolve().then(()=>No);return{play:o}},void 0,import.meta.url);a(n.id)}async function Uo(t){await t(),F("login"),O()}async function qo(){var n;wt||await xt();const t=mn();if(!t||!((n=t.questions)!=null&&n.length)){alert("銀行題目載入失敗，請重試。");return}F("bank-play"),O();const e=t.questions[t.currentIdx];e&&Xe(e,{index:t.currentIdx+1,total:t.questions.length,gameName:"好人好事銀行"})}function Go(t){const e=ne();if(!e)return;const n=e.questions[e.currentIdx];if(!n)return;const a=pn(n,t,Bt());if(!a){console.error("[Bank] applyScenarioResult null");return}const o=n.options.findIndex(i=>i.id===t);a.outcomeImage=`assets/images/outcomes/${n.id}_opt${o+1}.png`,vn(a.moralChange,n.title);try{hn({scenarioId:n.id,topicId:n.topicId,category:n.valueCategory||"",optionId:t,optionIndex:o>=0?o+1:0,moralChange:a.moralChange},Bt(),"bank")}catch(i){console.warn("[Bank] analytics log failed:",i.message)}F("bank-result",{bankScenario:n,bankResult:a}),O()}function Ko(){const t=ne();if(!t){ae();return}if(t.status==="finished"||t.status==="bankrupt"){F("bank-summary"),O();return}bn(),F("bank-play"),O();const e=t.questions[t.currentIdx];e&&Xe(e,{index:t.currentIdx+1,total:t.questions.length,gameName:"好人好事銀行"})}function ae(){fn(),F("hub"),O()}function Yo(){confirm("中途離開？今次遊戲進度會唔儲。")&&ae()}let H=null,oe=null,xn=null,ie=null,wn=null,$n=null,Sn=null,se=null,kn=null,_n=null,re=null;function Xo(t){H=t.render,oe=t.getStudent,xn=t.getAllStudents,ie=t.importProgress,wn=t.exportProgress,$n=t.syncNow,Sn=t.getProgress,se=t.getStats,kn=t.exportInteractionsCSV,_n=t.clearInteractions,re=t._navigate}window.FC.handleImport=function(t){var a;const e=(a=t.target.files)==null?void 0:a[0];if(!e)return;const n=new FileReader;n.onload=o=>{const i=ie(o.target.result);i.ok?(alert("匯入成功！"),re("teacher")):alert("匯入失敗："+i.error)},n.readAsText(e)};window.FC.exportAll=function(){const t=xn(),e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download="全班進度.json",a.click(),URL.revokeObjectURL(n)};window.FC.exportMyData=function(){const t=oe();if(!t)return;const e=wn(t),n=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download=`${t}-進度.json`,o.click(),URL.revokeObjectURL(a)};window.FC.importMyData=function(t){var a;const e=(a=t.target.files)==null?void 0:a[0];if(!e)return;const n=new FileReader;n.onload=o=>{const i=ie(o.target.result);i.ok?(alert("匯入成功！"),H()):alert("匯入失敗："+i.error)},n.readAsText(e)};window.FC.exportAnalyticsCSV=function(){const t=se();if(!t||!t.totalRows){alert("暫時未有學習記錄可以匯出。");return}const e=kn(),n=new Blob([e],{type:"text/csv"}),a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download="學習記錄.csv",o.click(),URL.revokeObjectURL(a)};window.FC.clearAnalytics=function(){confirm("確定清除所有學習記錄？此操作無法復原。")&&(_n(),H())};function Cn(){const t=document.getElementById("analytics-summary");if(t)try{const e=se();if(!e||!e.totalRows){t.textContent="📊 暫未有學習記錄 — 玩幾個 scenario 就會見到。";return}const n=e.wrongRateByCategory||[],a=[`📝 總作答：${e.totalRows} 題 · ✅ 答啱率：${(e.correctRate*100).toFixed(0)}%`+(e.avgResponseTimeMs?` · ⏱️ 平均 ${(e.avgResponseTimeMs/1e3).toFixed(1)}s`:"")];n.length&&(a.push("📊 答錯率最高："),n.forEach(([o,i],s)=>{a.push(`  ${s+1}. ${o} — ${(i.wrongRate*100).toFixed(0)}% (${i.wrong}/${i.total})`)})),t.innerHTML=a.map(o=>o.replace(/\n/g,"<br>")).join("<br>").replace(/(答錯率最高：)/g,"<strong>$1</strong>")}catch(e){t.textContent="⚠️ 載入失敗："+e.message}}function Tn(){const t=document.getElementById("settings-sync-status"),e=document.getElementById("settings-last-sync");t&&(t.innerHTML='<span class="skeleton skeleton-text-sm" style="width:80px"></span>'),e&&(e.innerHTML='<span class="skeleton skeleton-text-sm" style="width:120px"></span>')}window.FC.forceSync=async function(){const t=oe();if(!t)return;const e=Sn(t);if(Tn(),(await $n(t,e)).ok){const a=document.getElementById("settings-sync-status"),o=document.getElementById("settings-last-sync");a&&(a.textContent="✅ 已同步"),o&&(o.textContent=new Date().toLocaleString("zh-HK",{dateStyle:"short",timeStyle:"short"}))}else{const a=document.getElementById("settings-sync-status");a&&(a.textContent="❌ 同步失敗")}};function Q(){try{return JSON.parse(localStorage.getItem("fc_teacher_config")||"{}")}catch{return console.warn("[IO] teacher_config corrupt, resetting"),{}}}function Z(t){try{localStorage.setItem("fc_teacher_config",JSON.stringify(t))}catch(e){console.error("[IO] saveTeacherConfig failed:",e.message)}}window.FC.toggleTeacherFeature=function(t,e){t.classList.toggle("on");const n=t.classList.contains("on"),a=Q();a[e]=n,Z(a),e==="timerEnabled"&&H()};window.FC.setTeacherTimer=function(t){const e=Q();e.timerSeconds=parseInt(t),Z(e)};window.FC.setButtonSize=function(t){const e=Q();e.buttonSize=t,Z(e),H()};window.FC.setBankMaxRisk=function(t){const e=Q();e.bankMaxRiskLevel=t,Z(e),H()};window.FC.toggleAssignedTopic=function(t,e){const n=Q();n.assignedTopics||(n.assignedTopics=[]),e?n.assignedTopics.includes(t)||n.assignedTopics.push(t):n.assignedTopics=n.assignedTopics.filter(a=>a!==t),Z(n)};window.FC.saveTeacherPIN=function(){var e,n;const t=((n=(e=document.getElementById("teacher-pin-input"))==null?void 0:e.value)==null?void 0:n.trim())||"admin";localStorage.setItem("fc_teacher_pin",t),alert("✅ PIN 已更新為："+t)};window.FC.saveTeacherConfig=function(){alert("✅ 老師設定已儲存！"),re("teacher")};const Jo={"footer.copyright":"© Ken Cheng 製作","action.back":"← 返回","action.backHome":"← 返回主頁","action.retry":"🔄 再做一次","action.next":"下一題 →","action.start":"開始","action.save":"💾 儲存","action.cancel":"取消","action.confirm":"確認","action.close":"✕ 關閉","status.loading":"載入中…","status.empty":"冇資料","status.error":"出咗問題","error.fallbackTitle":"哎呀，呢頁載入出咗問題","error.fallbackHint":"我哋已經記錄咗呢個錯誤。你可以返主頁重試，<br>或者重新整理整個瀏覽器。","error.fallbackReload":"🔄 重新整理","settings.title":"設定","settings.voice":"語音朗讀","settings.font":"文字顯示","settings.sync":"雲端同步","settings.data":"資料管理","settings.teacher":"老師模式","home.title":"友愛教室","home.greeting":"你好，{name}！","home.subtitle":"揀個品格課題開始","home.flame.cold":"今日開始你嘅 streak！","hub.bankTitle":"好人好事銀行","hub.bankDesc":"做好事存款，衰嘢扣款，目標存到 $100 變品格富翁！","hub.subjectTitle":"情境答題","hub.subjectDesc":"17 個品格課題自由探索","bank.riskTag":"🎯 題目難度：{label}","bank.summaryFilter":"🎯 難度設定：{label} · 本局 {valueCount} 個 value + {caringCount} 個 caring","bank.empty":"🫥 銀行題目載入失敗，請重試。","bank.exit":"← 返 Game Hub","bank.again":"🔄 再玩一次","bank.settle":"✓ 結算","bank.next":"➡ 下一題","scenario.empty":"場景不存在","scenario.loadFailed":"題目載入失敗","scenario.resultFailed":"結果載入失敗，請重試。","teacher.emptyTitle":"暫時沒有學生數據","teacher.emptyHint":"學生完成學習後會自動顯示在這裡"};function Et(t,e={}){let n=Jo[t];if(n==null)return t;for(const[a,o]of Object.entries(e))n=n.replace(new RegExp(`\\{${a}\\}`,"g"),String(o));return n}window.FC=window.FC||{};let D=null;async function En(){if(D)return D;const t=await Y(()=>import("./scenarios-CZhaYheh.js"),[],import.meta.url);return D=t.default||t,Ra(D),D}const Wo=document.getElementById("app"),gt=document.getElementById("fc-view");Le();Ee();var _e;(_e=document.querySelector(".skip-link"))==null||_e.addEventListener("click",()=>{setTimeout(()=>Wo.focus({preventScroll:!0}),50)});h.on("moral:updated",t=>{const e=$();if(t.studentId!==e)return;const n=document.getElementById("moral-bar");if(!n)return;const{percent:a,color:o}=De(t.score),i=n.querySelector(".moral-fill"),s=n.querySelector(".moral-num");i&&(i.style.width=a+"%",i.style.background=o),s&&(s.textContent=t.score)});h.on("sync:status",t=>{window._fcSyncStatus={...po(),...t};const e=document.getElementById("sync-badge");if(!e)return;const{status:n}=t;n==="syncing"?(e.textContent="🔄",e.title="同步中…",e.style.opacity="1"):n==="ok"?(e.textContent="✅",e.title="已同步",setTimeout(()=>{e.textContent="☁️",e.title="已連線"},2500)):n==="error"?(e.textContent="⚠️",e.title="同步失敗 — "+(t.error||""),e.style.opacity="1"):n==="offline"&&(e.textContent="📴",e.title="離線模式",e.style.opacity="1")});let T=null;h.on("sync:status",t=>{if(t.status==="offline"){if(T)return;T=document.createElement("div"),T.id="offline-banner",T.setAttribute("role","status"),T.setAttribute("aria-live","polite"),T.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #b91c1c;
      color: #ffffff;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      z-index: 9998;
      font-weight: 600;
    `,T.textContent="📴 離線模式 — 進度將在恢復連線後自動同步",document.body.appendChild(T)}else t.status==="online"&&T&&(T.remove(),T=null)});const It=$();if(It){const t=_(It);mo(It,t)}const Qo=Object.freeze({"role-select":()=>({subjectId:null,topicId:null,scenarioId:null,resultData:null}),"mode-select":t=>({subjectId:null,topicId:null,scenarioId:null,resultData:null,gameMode:t==null?void 0:t.gameMode}),"student-select":()=>({subjectId:null,topicId:null,scenarioId:null,resultData:null}),"subject-select":()=>({topicId:null,scenarioId:null,resultData:null}),home:t=>({topicId:null,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??m.subjectId}),topic:t=>({topicId:t==null?void 0:t.topicId,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??m.subjectId}),play:t=>({topicId:null,scenarioId:t==null?void 0:t.scenarioId,resultData:null}),result:t=>({resultData:t==null?void 0:t.resultData,subjectId:(t==null?void 0:t.subjectId)??m.subjectId}),progress:t=>({topicId:null,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??m.subjectId}),settings:()=>({}),login:()=>({}),teacher:()=>({topicId:null,scenarioId:null,resultData:null}),"teacher-assign":()=>({}),hub:()=>({}),"bank-play":()=>({}),"bank-result":t=>({bankScenario:t==null?void 0:t.bankScenario,bankResult:t==null?void 0:t.bankResult}),"bank-summary":()=>({})});let m={view:"role-select",student:null,subjectId:null,topicId:null,scenarioId:null,resultData:null,teacherMode:!1,role:null,gameMode:localStorage.getItem("fc_game_mode")||"relaxed",bankScenario:null,bankResult:null};function tt(t,e={}){const n=Qo[t];if(!n){console.warn(`[state] unknown view: ${t}`);return}m={...m,view:t,...n(e),...e}}let B=null;async function Zo(){if(!B){const t=await Y(()=>import("./teacher-oofEsE2X.js"),[],import.meta.url);B={renderLogin:t.renderLogin,renderTeacher:t.renderTeacher}}return B}window.FC.reload=function(){location.reload()};function ti(t){if(!["value","caring","all"].includes(t)){console.warn("[FC] setHomeFilter: invalid filter",t);return}localStorage.setItem("fc_home_filter",t),L()}window.FC.setHomeFilter=ti;window.FC._stopEvt=function(t){t&&(typeof t.stopPropagation=="function"&&t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault())};window.FC.setTTSLang=function(t){Qn(t);const{speak:e}=window._fcAudio||{};e&&e("語言切換測試，你聽到嘅係新嘅發音。"),m.view==="settings"&&L()};window.FC.getTTSLang=function(){return Zn()};window.FC.TTS_LANGS=Ie;const ei=typeof document<"u"&&"startViewTransition"in document;function ni(t){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){t();return}ei?document.startViewTransition(t):t()}function In(){ni(L)}function Ot(t){const e=document.createElement("template");e.innerHTML=t.trim(),gt.replaceChildren(e.content)}const ai=["click","error"];function zt(t){if(!(!t||t.__fcDelegated)){t.__fcDelegated=!0,t.addEventListener("error",e=>{const n=e.target;n&&n.tagName==="IMG"&&(n.style.opacity="0.3",n.alt="（插圖暫不可用）")},!0);for(const e of ai.filter(n=>n!=="error"))t.addEventListener(e,n=>{var o;let a=n.target;for(;a&&a!==t;){const i=a.dataset&&a.dataset.action;if(i){if(i==="navigate"){n.preventDefault(),vt(a.dataset.arg,a.dataset.arg2);return}const s=(o=window.FC)==null?void 0:o[i];if(typeof s=="function"){n.preventDefault();const r=a.dataset.arg,l=a.dataset.arg2;l!==void 0?s.call(a,r,l):r!==void 0?s.call(a,r):s.call(a,n);return}}a=a.parentElement}})}}function An(t){return`
    <div class="container fade-in" role="alert" aria-live="assertive">
      <div class="card fc-center" style="padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">⚠️</div>
        <h2 style="margin-bottom:8px">${Et("error.fallbackTitle")}</h2>
        <p class="fc-muted fc-mb-16">
          ${Et("error.fallbackHint")}
        </p>
        <details style="text-align:left;background:var(--bg);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.85em">
          <summary style="cursor:pointer;font-weight:600">🔍 技術細節</summary>
          <pre style="white-space:pre-wrap;margin-top:8px;color:var(--danger)">${t.message}</pre>
        </details>
        <div class="action-row" style="justify-content:center">
          <button type="button" class="btn btn-primary" data-action="navigate" data-arg="home">← 返主頁</button>
          <button type="button" class="btn btn-outline" data-action="reload">${Et("error.fallbackReload")}</button>
        </div>
      </div>
    </div>
  `}function L(){var e;let t="";try{switch(m.view){case"role-select":t=Va();break;case"hub":t=Ha();break;case"mode-select":t=Ya(m.gameMode,m.subjectId);break;case"student-select":t=Ro();break;case"subject-select":t=Do();break;case"login":t=B?B.renderLogin():be("載入中...");break;case"teacher":t=B?B.renderTeacher():be("載入中...");break;case"teacher-assign":t=Xa();break;case"home":t=Qa(m.subjectId);break;case"topic":t=Za(m.topicId,m.subjectId);break;case"play":t=to(m.scenarioId,m.subjectId);break;case"result":t=eo(m.resultData,m.subjectId);break;case"progress":t=no(m.subjectId);break;case"settings":t=ao();break;case"bank-play":{const n=at(),a=((e=n==null?void 0:n.questions)==null?void 0:e[n==null?void 0:n.currentIdx])||null;t=Ua(a,n);break}case"bank-result":t=qa(m.bankScenario,m.bankResult,at());break;case"bank-summary":t=Ga(at());break;default:t='<div class="container"><p>頁面不存在</p></div>'}Ot(t),zt(gt),m.view==="settings"&&Cn()}catch(n){console.error("[FC] RENDER ERROR:",n.message,n.stack),Ot(An(n)),zt(gt)}}So({setView:tt,navRender:In,render:L});Eo({setView:tt,render:L,renderFooter:()=>E()});jo({setView:tt,render:L,_loadTeacher:Zo,getAllSubjects:Mn,initSubjectProgress:ja,getState:()=>m,setState:t=>{m=t}});sn({setView:tt,render:L,_navigate:vt,getState:()=>m,loadScenarios:En,_scenariosLoaded:D,playScenario:Ne,getScenariosByTopic:W,chooseOption:La,markScenarioShown:vo,logInteraction:Ye,playSFX:ot,_isReducedMotion});Vo({setView:tt,navRender:In,render:L,_navigate:vt,getState:()=>m,loadScenarios:En,_scenariosLoaded:D,getScenarios:Xt,initTopicProgress:Ve,applyScenarioResult:Be,getStudent:$,getBankRun:at,startBankRun:Ba,endBankRun:Oa,advanceToNextQuestion:Na,recordBankTransaction:za,logInteraction:Ye});Xo({render:L,getStudent:$,getAllStudents:Oe,importProgress:ma,exportProgress:fa,syncNow:Jt,getProgress:_,getStats:yo,exportInteractionsCSV:xo,clearInteractions:ho,_navigate:vt});window.FC.goTopic=yn;window.FC.goTeacher=Uo;window.FC.goRandom=Ho;window.FC.playGoodDeedBank=qo;window.FC.bankChoose=Go;window.FC.bankNext=Ko;window.FC.exitBank=ae;window.FC.confirmExitBank=Yo;window.FC.play=yt;window.FC.choose=rn;window.FC.retry=ln;window.FC.switchStudent=Io;window.FC.selectStudent=Ao;window.FC.selectSubject=Po;window.FC.selectMode=Mo;window.FC.chooseRole=Fo;window.FC.updateResultCtaFab=ut;window.FC.updateAnalyticsSummary=Cn;window.FC.setSyncStatusLoading=Tn;try{L()}catch(t){console.error("[FC] RENDER ERROR:",t.message,t.stack),Ot(An(t)),zt(gt)}export{Y as _,Mn as a,va as b,E as c,b as e,Oe as g,X as r};
