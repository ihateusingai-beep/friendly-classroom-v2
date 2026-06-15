(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const ze="modulepreload",Be=function(t,e){return new URL(t,e).href},Xt={},At=function(e,n,a){let o=Promise.resolve();if(n&&n.length>0){let s=function(c){return Promise.all(c.map(g=>Promise.resolve(g).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=s(n.map(c=>{if(c=Be(c,a),c in Xt)return;Xt[c]=!0;const g=c.endsWith(".css"),h=g?'[rel="stylesheet"]':"";if(!!a)for(let $=r.length-1;$>=0;$--){const z=r[$];if(z.href===c&&(!g||z.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${h}`))return;const m=document.createElement("link");if(m.rel=g?"stylesheet":ze,g||(m.as="script"),m.crossOrigin="",m.href=c,d&&m.setAttribute("nonce",d),document.head.appendChild(m),g)return new Promise(($,z)=>{m.addEventListener("load",$),m.addEventListener("error",()=>z(new Error(`Unable to preload CSS for ${c}`)))})}))}function i(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return o.then(s=>{for(const r of s||[])r.status==="rejected"&&i(r.reason);return e().catch(i)})};let q=null;window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),q=t,Oe()});function Oe(){const t=document.getElementById("pwa-install-banner");t&&t.remove();const e=document.createElement("div");e.id="pwa-install-banner",e.style.cssText=`
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
  `,document.body.appendChild(e),e.querySelector("#pwa-install-btn").addEventListener("click",async()=>{if(!q)return;q.prompt();const{outcome:n}=await q.userChoice;if(q=null,e.remove(),n==="accepted"){const a=document.getElementById("pwa-update-banner");a&&a.remove()}}),e.querySelector("#pwa-install-close").addEventListener("click",()=>{e.remove(),sessionStorage.setItem("fc_install_dismissed","1")})}window.addEventListener("DOMContentLoaded",()=>{sessionStorage.getItem("fc_install_dismissed")||window.matchMedia("(display-mode: standalone)").matches});"serviceWorker"in navigator&&At(async()=>{const{registerSW:t}=await import("./virtual_pwa-register-Maw_SIjp.js");return{registerSW:t}},[],import.meta.url).then(({registerSW:t})=>{t({onNeedRefresh(){Ne()},onOfflineReady(){He()}})}).catch(()=>{});function Ne(){if(document.getElementById("pwa-update-banner"))return;const e=document.createElement("div");e.id="pwa-update-banner",e.style.cssText=`
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
  `,document.body.appendChild(e),e.querySelector("#pwa-reload-btn").addEventListener("click",()=>{window.location.reload()}),e.querySelector("#pwa-update-close").addEventListener("click",()=>{e.remove()})}function He(){const t=document.getElementById("pwa-toast");t&&t.remove();const e=document.createElement("div");e.id="pwa-toast",e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.style.cssText=`
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
  `,e.textContent="✅ 已準備好離線使用",document.body.appendChild(e),setTimeout(()=>e.remove(),3500)}const le=document.createElement("style");le.textContent=`
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
`;document.head.appendChild(le);const ce=[{id:"value",title:"價值觀教育",emoji:"🎯",color:"#7C3AED",bgColor:"#F3E8FF",icon:"品格"}];function Ft(t){return ce.find(e=>e.id===t)}function dt(t){var e;return((e=Ft(t))==null?void 0:e.color)||"#7C3AED"}function Lt(t){var e;return((e=Ft(t))==null?void 0:e.title)||"價值觀教育"}function Rt(t){var e;return((e=Ft(t))==null?void 0:e.emoji)||"🎯"}function Ve(){return ce}const qe=[{id:"perseverance",title:"堅毅",emoji:"🌱",domain:"value",description:"遇到困難不放棄，堅持到底",creedIds:[1],color:"#10B981"},{id:"respect",title:"尊重他人",emoji:"🤝",domain:"value",description:"尊重每個人，唔嘲笑唔排擠",creedIds:[2],color:"#4ECDC4"},{id:"responsibility",title:"責任感",emoji:"📋",domain:"value",description:"自己嘅嘢自己打理（routine 責任）",creedIds:[3],color:"#F59E0B"},{id:"national-identity",title:"國民身份認同",emoji:"🇭🇰",domain:"value",description:"愛護香港，認識國家",creedIds:[4],color:"#EF4444"},{id:"commitment",title:"承擔精神",emoji:"🛡️",domain:"value",description:"自己嘅選擇自己承擔（consequence 責任）",creedIds:[5],color:"#DC2626"},{id:"integrity",title:"誠信",emoji:"⚖️",domain:"value",description:"講真話，做個可信嘅人",creedIds:[6],color:"#3B82F6"},{id:"benevolence",title:"仁愛",emoji:"💗",domain:"value",description:"關心別人，主動幫忙",creedIds:[7],color:"#EC4899"},{id:"law-abiding",title:"守法",emoji:"📜",domain:"value",description:"遵守規則，奉公守法",creedIds:[8],color:"#6366F1"},{id:"empathy",title:"同理心",emoji:"🫂",domain:"value",description:"易地而處，感受他人嘅情緒",creedIds:[9],color:"#F97316"},{id:"diligence",title:"勤勞",emoji:"💪",domain:"value",description:"努力練習，唔怕辛苦",creedIds:[10],color:"#84CC16"},{id:"solidarity",title:"團結",emoji:"🤲",domain:"value",description:"與人合作，一齊努力",creedIds:[11],color:"#06B6D4"},{id:"filial-piety",title:"孝親",emoji:"🏠",domain:"value",description:"尊敬父母，孝順家人",creedIds:[12],color:"#A855F7"}],Ue=[{id:"body-autonomy",title:"身體自主",emoji:"🛡️",domain:"caring",description:"認識身體界線，保護自己",creedIds:[8],color:"#BE185D"},{id:"stranger-safety",title:"陌生人危險",emoji:"⚠️",domain:"caring",description:"應對陌生情境，保護自己",creedIds:[8],color:"#B91C1C"},{id:"help-seeking",title:"求助技巧",emoji:"📞",domain:"caring",description:"識得搵人幫手",creedIds:[9],color:"#0EA5E9"},{id:"social-boundary",title:"社交界線",emoji:"🚧",domain:"caring",description:"同人保持合適嘅距離",creedIds:[9],color:"#7C3AED"},{id:"conflict-resolution",title:"衝突解決",emoji:"💬",domain:"caring",description:"化解爭執，搵共識",creedIds:[11,9],color:"#059669"}],P=[...qe,...Ue];function jt(t){return P.find(e=>e.id===t)}const Ge="audio/";let mt=null;function Ke(){return mt||(mt=new(window.AudioContext||window.webkitAudioContext)),mt}function Y(t){try{const e=Ke(),n=e.currentTime,a=e.createOscillator(),o=e.createGain();a.connect(o),o.connect(e.destination);const i=o.gain;switch(t){case"click":a.frequency.value=800,a.type="sine",i.setValueAtTime(.15,n),i.exponentialRampToValueAtTime(.001,n+.08),a.start(n),a.stop(n+.08);break;case"hover":a.frequency.value=600,a.type="sine",i.setValueAtTime(.06,n),i.exponentialRampToValueAtTime(.001,n+.05),a.start(n),a.stop(n+.05);break;case"success":a.frequency.value=523,a.type="sine",i.setValueAtTime(.18,n),a.start(n),a.frequency.setValueAtTime(659,n+.1),a.frequency.setValueAtTime(784,n+.2),i.exponentialRampToValueAtTime(.001,n+.45),a.stop(n+.45);break;case"fail":a.frequency.value=400,a.type="sine",i.setValueAtTime(.12,n),a.frequency.exponentialRampToValueAtTime(200,n+.3),i.exponentialRampToValueAtTime(.001,n+.3),a.start(n),a.stop(n+.3);break;case"celebrate":[523,659,784].forEach((s,r)=>{const l=e.createOscillator(),d=e.createGain();l.connect(d),d.connect(e.destination),l.frequency.value=s,l.type="sine",d.gain.setValueAtTime(.12,n+r*.08),d.gain.exponentialRampToValueAtTime(.001,n+.6+r*.08),l.start(n+r*.08),l.stop(n+.65+r*.08)});break;case"complete":[523,659,784,1047].forEach((s,r)=>{const l=e.createOscillator(),d=e.createGain();l.connect(d),d.connect(e.destination),l.frequency.value=s,l.type="triangle",d.gain.setValueAtTime(.14,n+r*.07),d.gain.exponentialRampToValueAtTime(.001,n+.5+r*.07),l.start(n+r*.07),l.stop(n+.55+r*.07)});break}}catch(e){console.warn("[FC SFX] Error:",e.message)}}function de(){document.addEventListener("click",t=>{t.target.closest(".btn")&&Y("click")}),document.addEventListener("mouseover",t=>{t.target.closest(".btn")&&Y("hover")})}let X=!0,C=!1,L=null;const ue=[{id:"auto",label:"自動（按系統預設）",hint:"跟 OS 第一個中文 voice"},{id:"zh-HK",label:"🇭🇰 粵語（香港）",hint:"需要 OS/browser 裝咗粵語 voice"},{id:"zh-TW",label:"🇹🇼 國語（台灣 / 普通話通用）",hint:"zh-TW 中文 voice, 兩岸都聽得明"},{id:"zh-CN",label:"🇨🇳 普通話（中國大陸）",hint:"zh-CN 中文 voice"}],ge=localStorage.getItem("fc_tts_lang");let M=ge||"zh-HK";if(!ge)try{localStorage.setItem("fc_tts_lang",M)}catch{}let U=null;function Ye(){return U||(U=new Promise(t=>{const e=window.speechSynthesis;if(!e)return t([]);let n=e.getVoices();if(n.length>0)return t(n);const a=()=>{n=e.getVoices(),n.length>0&&(e.removeEventListener("voiceschanged",a),t(n))};e.addEventListener("voiceschanged",a),setTimeout(()=>t(e.getVoices()||[]),5e3)}),U)}async function Xe(){const t=await Ye();if(!t.length)return null;if(M!=="auto"){const e=t.find(o=>o.lang===M);if(e)return e;const n=M.split("-")[0];return t.find(o=>o.lang.startsWith(n))||null}return t.find(e=>e.lang==="zh-HK")||t.find(e=>e.lang==="zh-TW")||t.find(e=>e.lang==="zh-CN")||t.find(e=>e.lang.includes("zh"))||t[0]||null}function pe(){return{speed:parseFloat(localStorage.getItem("fc_tts_speed")||"0.85"),fontSize:parseInt(localStorage.getItem("fc_font_size")||"18"),lineHeight:parseFloat(localStorage.getItem("fc_line_height")||"1.5"),spacing:localStorage.getItem("fc_spacing")||"medium",highContrast:localStorage.getItem("fc_hc_mode")==="1",reducedMotion:localStorage.getItem("fc_rm_mode")==="1"}}function D(){const t=pe(),e={narrow:"8px",medium:"16px",wide:"28px"},n=document.documentElement;n.style.setProperty("--fc-font-size",t.fontSize+"px"),n.style.setProperty("--fc-line-height",t.lineHeight),n.style.setProperty("--fc-spacing",e[t.spacing]||"16px"),t.highContrast?n.setAttribute("data-hc","true"):n.removeAttribute("data-hc"),t.reducedMotion?n.setAttribute("data-rm","true"):n.removeAttribute("data-rm")}function me(t){X=t}function Mt(){return X}function fe(){C=!1,L&&(L.pause(),L=null)}function Je(t){fe();const e=Ge+t;console.log("[FC Audio] Playing:",e),L=new Audio(e),L.onended=()=>{C=!1,L=null,console.log("[FC Audio] Done")},L.onerror=n=>{console.error("[FC Audio] Error:",n),C=!1,L=null},L.play().catch(n=>{console.error("[FC Audio] Play failed:",n.message),C=!1,L=null}),C=!0}function be(t){if(console.log("[FC Audio] speakScenario called, enabled:",X,"speaking:",C,"scenario:",t),!X){console.log("[FC Audio] Blocked: voice not enabled");return}if(C){console.log("[FC Audio] Blocked: already speaking");return}const e=(t==null?void 0:t.id)||t,n=(t==null?void 0:t.description)||"";console.log("[FC Audio] Playing scenario:",e),he(n)}function ve(t){if(!X||C||!t||t.length===0)return;const e=t[0].id||t[0];Je(`creeds/creed-${e}.mp3`)}async function he(t){var a,o;if(!t)return;C&&((a=window.speechSynthesis)==null||a.cancel());const e=new SpeechSynthesisUtterance(t);e.lang=M==="auto"?"zh-HK":M,e.rate=pe().speed||.85,e.pitch=1;const n=await Xe();n?(e.voice=n,console.log("[FC TTS] Voice:",n.name,"("+n.lang+")")):console.warn("[FC TTS] No matching voice found for",M),e.onstart=()=>{C=!0,console.log("[FC TTS] Speaking:",t.slice(0,30))},e.onend=()=>{C=!1,console.log("[FC TTS] Done")},e.onerror=i=>{C=!1,console.error("[FC TTS] Error:",i.error),i.error==="not-allowed"&&console.log("[FC TTS] Autoplay blocked — user must interact first. Suggest enabling TTS in settings.")},(o=window.speechSynthesis)==null||o.speak(e)}function We(t){if(!ue.find(e=>e.id===t)){console.warn("[FC TTS] Unknown lang:",t);return}M=t,U=null,localStorage.setItem("fc_tts_lang",t),console.log("[FC TTS] Lang set to",t)}function Qe(){return M}function Ze(){localStorage.removeItem("fc_tts_speed"),localStorage.removeItem("fc_font_size"),localStorage.removeItem("fc_line_height"),localStorage.removeItem("fc_spacing"),localStorage.removeItem("fc_hc_mode"),localStorage.removeItem("fc_rm_mode"),D()}window._fcAudio={speakScenario:be,speakCreeds:ve,speak:he,setEnabled:me,isEnabled:Mt,applyCSS:D,playSFX:Y,initSFX:de};window.addEventListener("beforeunload",()=>{fe()});const wt=[{id:1,value:"perseverance",title:"堅毅的",text:"我們是堅毅的：遇到困難不放棄，堅持到底"},{id:2,value:"respect",title:"尊重他人的",text:"我們是尊重他人的：尊重每個人，唔嘲笑唔排擠"},{id:3,value:"responsibility",title:"負責任的",text:"我們是負責任的：自己嘅嘢自己打理"},{id:4,value:"national-identity",title:"愛國的",text:"我們是愛護香港、認識國家的"},{id:5,value:"commitment",title:"勇於承擔的",text:"我們是勇於承擔的：自己嘅選擇自己承擔"},{id:6,value:"integrity",title:"誠信的",text:"我們是誠信的：講真話，做個可信嘅人"},{id:7,value:"benevolence",title:"仁愛的",text:"我們是仁愛的：關心別人，主動幫忙"},{id:8,value:"law-abiding",title:"守法的",text:"我們是守法的：遵守校規，奉公守法"},{id:9,value:"empathy",title:"同理心的",text:"我們是同理心的：易地而處，感受他人嘅情緒"},{id:10,value:"diligence",title:"勤勞的",text:"我們是勤勞的：努力練習，唔怕辛苦"},{id:11,value:"solidarity",title:"團結的",text:"我們是團結的：與人合作，一齊努力"},{id:12,value:"filial-piety",title:"孝親的",text:"我們是孝親的：尊敬父母，孝順家人"}],tn=[{id:13,title:"信實的",text:"我們是信實的：誠實負責，不欺騙人"},{id:14,title:"整潔的",text:"我們是整潔的：校服整潔，儀容端正"},{id:15,title:"友愛的",text:"我們是友愛的：關心別人，互相幫助"},{id:16,title:"禮讓的",text:"我們是禮讓的：待人有禮，不易發怒"},{id:17,title:"勤力的",text:"我們是勤力的：上課專心，努力學習"},{id:18,title:"合作的",text:"我們是合作的：遵守規則，積極參與"},{id:19,title:"獨立的",text:"我們是獨立的：自己的事，自己去做"},{id:20,title:"愛護學校的",text:"我們是愛護學校的：愛護公物，保護環境"},{id:21,title:"感恩的",text:"我們是感恩的：尊敬師長，孝順父母"},{id:22,title:"守法的",text:"我們是守法的：遵守校規，奉公守法"}],en=[...wt,...tn],nn=[2,4,7,9,11,12],an=[1,3,5,6,8,10],on=nn,ft=an;function ye(t){return en.filter(e=>t.includes(e.id))}function sn(t){return ye(t).map(e=>`${e.title}：${e.text}`)}function rn(){const t=new Date().toISOString().split("T")[0],e=ln(t)%wt.length;return wt[e]}function ln(t){let e=5381;for(let n=0;n<t.length;n++)e=(e<<5)+e+t.charCodeAt(n),e|=0;return Math.abs(e)}function cn(t,e){if(e===0)return t||[];const n=t||[],a=e>0?on:ft,o=n.filter(i=>a.includes(i));if(o.length>0)return o;if(e<0&&n.length>0){const i=ft.find(s=>!n.includes(s))||ft[0];return[...n.slice(0,1),i]}return[a[0]]}function dn(t){return t>=70?"good":t>=30?"warning":"danger"}function un(t){return Math.max(0,Math.min(100,Math.round((t+50)/1.5)))}function xe(t){const e=un(t),n=dn(t);return{percent:e,color:n==="good"?"#22c55e":n==="warning"?"#eab308":"#ef4444",level:n,score:t}}function we(t,e,n){const a=t.options.find(l=>l.id===e);if(!a)return null;let o=0,i="";a.effects.forEach(l=>{o+=l.moralChange||0,l.comment&&(i=l.comment)});const s=ye(cn(t.creedIds||[],o)),r=o>=0;return{moralChange:o,newScore:null,triggeredCreeds:s,isPositive:r,mainComment:i||(r?"你做出了好的選擇！":"你做出了選擇！"),option:a,scenario:t}}class gn{constructor(){this._handlers=new Map}on(e,n){return this._handlers.has(e)||this._handlers.set(e,new Set),this._handlers.get(e).add(n),()=>this.off(e,n)}off(e,n){this._handlers.has(e)&&this._handlers.get(e).delete(n)}emit(e,n){this._handlers.has(e)&&this._handlers.get(e).forEach(a=>{try{a(n)}catch(o){console.error(`[EventBus] handler error on "${e}":`,o)}})}}const y=new gn,Pt="fc_progress_",Dt=1;function I(t){try{const e=localStorage.getItem(Pt+t);if(!e)return Wt(t);const n=JSON.parse(e);return xn(n)}catch{return Wt(t)}}function ut(t){t.lastPlayed=zt(),t.schemaVersion=Dt;const e=Pt+t.name,n=JSON.stringify(t);try{return localStorage.setItem(e,n),!0}catch(a){return a&&a.name==="QuotaExceededError"?(y.emit("progress:save-failed",{name:t.name,error:"quota"}),console.warn("[Progress] quota exceeded for",t.name)):(y.emit("progress:save-failed",{name:t.name,error:(a==null?void 0:a.message)||"unknown"}),console.warn("[Progress] save failed:",a)),!1}}function Jt(t,e,n,a,o){const i=I(t);return i.completedScenarios.includes(e)||(i.completedScenarios.push(e),i.totalMoralScore=Math.max(0,(i.totalMoralScore||0)+a),i.topicProgress[n]||(i.topicProgress[n]={completed:0,total:0}),i.topicProgress[n].completed++,o&&(i.subjectProgress[o]||(i.subjectProgress[o]={completed:0,total:0}),i.subjectProgress[o].completed++),i.streak=$n(i.streak),ut(i),y.emit("progress:updated",{studentId:t,scenarioId:e,topicId:n,moralChange:a}),y.emit("moral:updated",{studentId:t,score:i.totalMoralScore,change:a}),y.emit("scenario:completed",{studentId:t,scenarioId:e,result:{moralChange:a,newScore:i.totalMoralScore}})),i}function pn(t,e,n){const a=I(t);a.topicProgress[e]?a.topicProgress[e].total=n:a.topicProgress[e]={completed:0,total:n},ut(a)}function mn(t,e,n){const a=I(t);a.subjectProgress[e]?a.subjectProgress[e].total=n:a.subjectProgress[e]={completed:0,total:n},ut(a)}function $e(){const t=[];for(let e=0;e<localStorage.length;e++){const n=localStorage.key(e);if(n.startsWith(Pt))try{t.push(JSON.parse(localStorage.getItem(n)))}catch{}}return t}function Se(t){try{const e=JSON.parse(t),n=I(e.name);return e.completedScenarios.forEach(a=>{n.completedScenarios.includes(a)||n.completedScenarios.push(a)}),n.totalMoralScore=Math.max(n.totalMoralScore||0,e.totalMoralScore||0),e.topicProgress&&Object.keys(e.topicProgress).forEach(a=>{n.topicProgress[a]||(n.topicProgress[a]={completed:0,total:0}),n.topicProgress[a].completed=Math.max(n.topicProgress[a].completed||0,e.topicProgress[a].completed||0),e.topicProgress[a].total&&(n.topicProgress[a].total=Math.max(n.topicProgress[a].total||0,e.topicProgress[a].total))}),e.subjectProgress&&Object.keys(e.subjectProgress).forEach(a=>{n.subjectProgress[a]||(n.subjectProgress[a]={completed:0,total:0}),n.subjectProgress[a].completed=Math.max(n.subjectProgress[a].completed||0,e.subjectProgress[a].completed||0),e.subjectProgress[a].total&&(n.subjectProgress[a].total=Math.max(n.subjectProgress[a].total||0,e.subjectProgress[a].total))}),ut(n),{ok:!0}}catch(e){return{ok:!1,error:e.message}}}function fn(t){const e=I(t);return JSON.stringify(e,null,2)}function bn(t,e){return I(t).completedScenarios.includes(e)}function vn(t){var n,a,o;const e=I(t);return{name:t,score:e.totalMoralScore||0,completedCount:((n=e.completedScenarios)==null?void 0:n.length)||0,topicCount:Object.keys(e.topicProgress||{}).length,lastPlayed:e.lastPlayed||null,streak:((a=e.streak)==null?void 0:a.current)||0,streakLongest:((o=e.streak)==null?void 0:o.longest)||0}}const hn=["emotions","honesty","conflict"],yn={emotions:"empathy",honesty:"integrity",conflict:"conflict-resolution"};function Wt(t){return{schemaVersion:Dt,name:t,completedScenarios:[],topicProgress:{},subjectProgress:{value:{completed:0,total:0}},totalMoralScore:0,lastPlayed:null,streak:{current:0,longest:0,lastDay:null}}}function xn(t){if(!t||typeof t!="object")return t;if(t.schemaVersion==null&&(t.schemaVersion=Dt),t.topicProgress&&typeof t.topicProgress=="object"){for(const e of hn)if(t.topicProgress[e]){const n=yn[e],a=t.topicProgress[e],o=t.topicProgress[n]||{completed:0,total:0};o.completed=Math.max(o.completed||0,a.completed||0),o.total=Math.max(o.total||0,a.total||0),t.topicProgress[n]=o,delete t.topicProgress[e]}}return t}function zt(){try{return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date)}catch{return new Date().toISOString().split("T")[0]}}function wn(){const t=zt(),[e,n,a]=t.split("-").map(Number),o=new Date(Date.UTC(e,n-1,a));return o.setUTCDate(o.getUTCDate()-1),o.toISOString().split("T")[0]}function $n(t){const e=t||{current:0,longest:0,lastDay:null},n=zt();if(e.lastDay===n)return e;const a=wn();return e.lastDay===a?e.current+=1:e.current=1,e.current>(e.longest||0)&&(e.longest=e.current),e.lastDay=n,e}function v(t){return t==null?"":String(t).replace(/&/g,"&amp;").replace(/'/g,"&#39;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\)/g,"&#41;").replace(/\(/g,"&#40;")}function E({marginTop:t="auto"}={}){return`<div class="footer" style="margin-top:${t}">© Ken Cheng 製作</div>`}function J({emoji:t="🫥",title:e,hint:n="",actionLabel:a="",onAction:o=""}={}){return`
    <div class="container fade-in">
      <div class="card" style="text-align:center;padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">${t}</div>
        <h2 style="margin-bottom:8px">${e}</h2>
        ${n?`<p style="color:var(--text-light);margin-bottom:16px">${n}</p>`:""}
        ${a&&o?`<button type="button" class="btn btn-primary" onclick="${o}">${a}</button>`:""}
      </div>
    </div>
  `}function Qt(t="載入中…"){return`<div class="container"><p>${t}</p></div>`}function R({emoji:t,title:e,titleHTML:n,back:a,backLabel:o="返回",backArg:i,rightButton:s,noHeader:r=!1}){let l="";if(a){const d=i!==void 0?` data-arg2="${v(i)}"`:"";l+=`<button type="button" class="back-btn" data-action="navigate" data-arg="${v(a)}"${d} aria-label="${v(o)}">←</button>`}return l+=n!==void 0?n:`<h1>${t?t+" ":""}${e}</h1>`,s&&(l+=s),r?l:`<div class="page-header">${l}</div>`}const ke=["A","B","C","D"];function Sn({scenarioId:t,opt:e,index:n,isBank:a=!1,showMoral:o=!1}){const i=ke[n]||String(n+1),s=a?"bankChoose":"choose",r=`assets/images/outcomes/${t}_opt${n+1}.png`,l=(e.effects||[])[0],d=e.moralChange!==void 0?Number(e.moralChange):l?Number(l.moralChange||0):0;let c="";if(o){const g=d>0?`＋${d} 道德`:d<0?`${d} 道德`:"中性";c=`<span class="opt-value opt-value-${d>0?"good":d<0?"bad":"neutral"}" aria-hidden="true">${g}</span>`}return`
    <button type="button" class="option-card" data-action="${s}" data-arg="${v(e.id)}"
      aria-label="選項 ${i}：${v(e.text)}">
      <img src="${r}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${i}</span>
      <span class="opt-text">${e.text}</span>
      ${c}
      <button type="button" class="opt-read"
        data-action="speakOpt" data-arg="${v(e.id)}"
        title="朗讀呢個選項"
        aria-label="朗讀選項 ${i}">🔊</button>
    </button>
  `}function kn({scenarioId:t,opt:e,index:n}){const a=ke[n]||String(n+1),o=`assets/images/outcomes/${t}_opt${n+1}.png`;return`
    <button type="button" class="option-card" data-action="bankChoose" data-arg="${v(e.id)}"
      aria-label="選項 ${a}：${v(e.text)}">
      <img src="${o}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${a}</span>
      <span class="opt-text">${e.text}</span>
    </button>
  `}const _=Object.freeze({VALUES_ONLY:0,MILD:1,MEDIUM:2,ALL:3}),Zt=Object.freeze({[_.VALUES_ONLY]:"只 value",[_.MILD]:"≤1（低）",[_.MEDIUM]:"≤2（中）",[_.ALL]:"全開"}),Cn=new Set([0,1,2,3]);function Bt(t){if(t==null||t==="")return _.MILD;const e=Number(t);return Number.isFinite(e)&&Cn.has(e)?e:_.MILD}function ot(t){return Zt[Bt(t)]||Zt[_.MILD]}const _n=Object.freeze({PROGRESS_PREFIX:"fc_progress_",TEACHER_CONFIG:"fc_teacher_config",TEACHER_PIN:"fc_teacher_pin",TEACHER_TOKEN:"fc_teacher_token",TEACHER_EXPIRY:"fc_teacher_expiry",DEVICE_ID:"fc_device_id",LAST_SYNC_PREFIX:"fc_last_sync_",SYNC_QUEUE:"fc_sync_queue",TTS_SPEED:"fc_tts_speed",TTS_LANG:"fc_tts_lang",FONT_SIZE:"fc_font_size",LINE_HEIGHT:"fc_line_height",SPACING:"fc_spacing",HC_MODE:"fc_hc_mode",RM_MODE:"fc_rm_mode",VOICE_SEEN:"fc_voice_seen",GAME_MODE:"fc_game_mode",HOME_FILTER:"fc_home_filter",INTERACTIONS:"fc_interactions_v1"}),In={hintEnabled:!0,timerEnabled:!1,timerSeconds:30,comboEnabled:!1,bankMaxRiskLevel:1,buttonSize:"normal",assignedTopics:[]};let nt=null,te=0;const En=5e3;function Tn(){if(nt&&Date.now()-te<En)return nt;const t=localStorage.getItem(_n.TEACHER_CONFIG);let e={};try{e=t?JSON.parse(t):{}}catch(n){console.warn("[storage] corrupt fc_teacher_config:",n)}return nt={...In,...e},te=Date.now(),nt}let x=null,it=null,W=[];const $t=new Set,St=new Set;function An(t){x=t,$t.clear(),St.clear()}function k(){return x}function Fn(t){W=t}function Ot(){return W}function Q(t){return W.filter(e=>e.topicId===t)}function Z(t){return it=W.find(e=>e.id===t)||null,it}function at(){return it}function Ln(t,e,n){var i;const a=W.find(s=>s.id===t)||it;if(!a)return null;const o=we(a,e);return o?(x&&n?Jt(x,a.id,a.topicId,o.moralChange,n):x&&!n&&Jt(x,a.id,a.topicId,o.moralChange,null),{option:o.option,moralChange:o.moralChange,mainComment:o.mainComment,creeds:o.triggeredCreeds,creedText:sn(o.triggeredCreeds.map(s=>s.id)),scenarioImage:a.image||null,scenarioTitle:a.title||"",outcomeImage:`assets/images/outcomes/${a.id}_opt${a.options.findIndex(s=>s.id===e)+1}.png`,nextScenario:((i=o.option)==null?void 0:i.next_scenario)||null}):null}function Ce(t){if(!x)return;const e=`${x}|${t}`;if($t.has(e))return;$t.add(e);const n=Q(t);pn(x,t,n.length)}function Rn(t){if(!x||!t)return;const e=`${x}|${t}`;if(St.has(e))return;St.add(e);const n=Ot();mn(x,t,n.length)}function ee(t){const e=Q(t);if(!x)return e[0]||null;const n=I(x);return e.find(a=>!n.completedScenarios.includes(a.id))||null}const _e=100,jn=-50,Ie=8;function Mn(t,e){return e>=_.ALL?t:t.filter(n=>Number(n.riskLevel??0)<=e)}function Pn(t,e=1){const n=Ot();if(!n.length)return[];const a=Mn(n,e),i=(a.length>=t?a:n).slice();for(let s=i.length-1;s>0;s--){const r=Math.floor(Math.random()*(s+1));[i[s],i[r]]=[i[r],i[s]]}return i.slice(0,t)}function Dn(){try{const t=JSON.parse(localStorage.getItem("fc_teacher_config")||"{}");return Bt(t.bankMaxRiskLevel)}catch{return 1}}let b=null;function zn(t={}){const e=t.maxRisk!==void 0?Bt(t.maxRisk):Dn();return b={balance:0,stamps:[],history:[],questions:Pn(Ie,e),currentIdx:0,status:"playing",maxRisk:e},b}function K(){return b}function Bn(){b=null}function On(t,e){if(!b)return;const n=t||0,a=b.balance;return b.balance+=n,b.stamps.push({delta:n,label:e||"",ts:Date.now()}),b.history.push({moralChange:n,scenarioTitle:e}),b.currentIdx>=b.questions.length-1&&(b.status="finished"),b.balance>=_e&&b.status==="playing"&&(b.status="finished"),b.balance<=jn&&(b.status="bankrupt"),{oldBalance:a,newBalance:b.balance,status:b.status}}function Nn(){return b?(b.currentIdx=Math.min(b.currentIdx+1,b.questions.length),b):null}const H={TARGET_BALANCE:_e,QUESTIONS_PER_RUN:Ie,DEFAULT_MAX_RISK:_.MILD};function Hn(){return`
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
  `}function Vn(){const e=Tn().bankMaxRiskLevel??_.MILD,n=`<div class="gc-meta" style="font-size:0.78em;color:var(--text-light);margin-top:6px">🎯 題目難度：${ot(e)}</div>`;return`
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
  `}function qn(t,e){if(!t)return J({emoji:"⚠️",title:"題目載入失敗",actionLabel:"← 返 Game Hub",onAction:"FC.exitBank()"});const n=H.QUESTIONS_PER_RUN,a=e.currentIdx+1,o=e.balance,i=H.TARGET_BALANCE,s=Math.min(100,Math.max(0,o/i*100)),r=o>0?"positive":o<0?"negative":"neutral",l=e.maxRisk??_.MILD;return`
    <div class="container fade-in" style="max-width:560px">
      <div class="page-header">
        <button class="back-btn" data-action="confirmExitBank">←</button>
        <h2>🏦 好人好事銀行</h2>
        ${`<div class="bank-risk-tag" style="font-size:0.78em;color:var(--text-light);text-align:center;margin-top:4px" aria-label="本局題目難度上限 ${ot(l)}">🎯 題目難度：${ot(l)}</div>`}
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
        ${t.options.map((c,g)=>kn({scenarioId:t.id,opt:c,index:g})).join("")}
      </div>
    </div>
  `}function Un(t,e,n){if(!e)return J({emoji:"⚠️",title:"結果載入失敗",actionLabel:"← 返 Game Hub",onAction:"FC.exitBank()"});const a=e.moralChange||0,o=a>0,i=a===0,s=n.balance,r=n.status==="finished"&&s>=H.TARGET_BALANCE,l=n.status==="bankrupt",d=n.status==="finished",c=H.TARGET_BALANCE,g=o?`存款 ${a} 元，目前結餘 ${s} 元`:i?"無變化":`扣款 ${Math.abs(a)} 元，目前結餘 ${s} 元`;return`
    <div class="container fade-in" style="max-width:560px">
      ${R({emoji:"🏦",title:"銀行結算"})}
      <h2 class="sr-only" aria-live="polite" aria-atomic="true">${g}</h2>

      <div class="bank-stamp ${o?"green":i?"gray":"red"}" id="bank-stamp" role="status" aria-label="${g}">
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
          🏁 全部 ${H.QUESTIONS_PER_RUN} 題做完喇！結餘：$${s}
        </div>
      `:""}

      <div class="action-row" style="margin-top:18px">
        <button type="button" class="btn btn-primary" data-action="bankNext">${d||l?"✓ 結算":"➡ 下一題"}</button>
        <button type="button" class="btn btn-outline" data-action="exitBank">← 返 Game Hub</button>
      </div>
    </div>
  `}function Gn(t){if(!t)return J({emoji:"🫥",title:"冇紀錄"});const e=t.status==="finished"&&t.balance>=H.TARGET_BALANCE,n=t.status==="bankrupt",a=t.stamps.filter(c=>c.delta>0).reduce((c,g)=>c+g.delta,0),o=t.stamps.filter(c=>c.delta<0).reduce((c,g)=>c+g.delta,0),i=t.stamps.filter(c=>c.delta>0).length,s=t.stamps.filter(c=>c.delta<0).length,r=t.questions.filter(c=>c.domain==="caring"||c.riskLevel!=null&&c.riskLevel>0).length,l=t.questions.length-r,d=`<div class="bank-summary-filter" style="font-size:0.85em;color:var(--text-light);text-align:center;margin:8px 0 14px 0">
    🎯 難度設定：${ot(t.maxRisk)} · 本局 ${l} 個 value + ${r} 個 caring
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
            ${t.stamps.map((c,g)=>`
              <div class="ledger-row" role="listitem">
                <span class="ledger-num" aria-hidden="true">#${g+1}</span>
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
  `}const Kn=[{id:"relaxed",icon:"🧘",title:"輕鬆學習",desc:"無計時、無限提示，慢慢做，慢慢學",color:"#eab308",bg:"linear-gradient(135deg, #fef9c3, #fef08a)"},{id:"timed",icon:"⚡",title:"計時挑戰",desc:"限時答題，計分，訓練答題速度",color:"#3b82f6",bg:"linear-gradient(135deg, #dbeafe, #bfdbfe)"},{id:"combo",icon:"🔥",title:"Combo 衝刺",desc:"連續答啱分數倍增，挑戰最高 Combo 數",color:"#ef4444",bg:"linear-gradient(135deg, #fee2e2, #fecaca)"},{id:"challenge",icon:"🎯",title:"挑戰模式",desc:"計時 + Combo 混合，最強挑戰",color:"#a855f7",bg:"linear-gradient(135deg, #f3e8ff, #e9d5ff)"}];function Yn(t,e){const n=t||localStorage.getItem("fc_game_mode")||"relaxed";return`
    <div class="mode-screen fade-in">
      ${R({emoji:"🎮",title:"選擇遊戲模式",back:"role-select",backLabel:"返回主選單"})}

      <div class="mode-header">
        <p>你鍾意點玩？揀一個模式開始！</p>
      </div>

      <div class="mode-grid" role="radiogroup" aria-label="遊戲模式">
        ${Kn.map(a=>`
          <button type="button" class="mode-card ${a.id} ${n===a.id?"selected":""}"
               style="background:${a.bg};border-color:${a.color}"
               data-action="selectMode" data-arg="${v(a.id)}"
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
  `}function Xn(){const t=P.map(a=>{var o;return{...a,sub:((o=a.description)==null?void 0:o.split(/[，。,。]/)[0])||""}});let e={};try{e=JSON.parse(localStorage.getItem("fc_teacher_config")||"{}")}catch{e={}}const n={hintEnabled:e.hintEnabled!==!1,timerEnabled:e.timerEnabled??!1,timerSeconds:e.timerSeconds||30,comboEnabled:e.comboEnabled??!1,bankMaxRiskLevel:e.bankMaxRiskLevel??1,buttonSize:e.buttonSize||"normal",assignedTopics:e.assignedTopics||[]};return`
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
  `}function Jn(t){if(!t)return"";const n=I(t).totalMoralScore||0,{percent:a,color:o}=xe(n);return`
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
  `}function Wn(t,e){var d;const n=e.total||0,a=e.completed||0,o=n?Math.round(a/n*100):0,i=((d=t.description)==null?void 0:d.split(/[，。,。]/)[0])||t.description||"";let s="",r="",l="";return n===0?(r="topic-status--new",s='<div class="topic-status" aria-hidden="true">未開始</div>',l="未開始"):o>=100?(r="topic-status--done",s='<div class="topic-status" aria-hidden="true">🏆 已精通</div>',l="已精通"):(r="topic-status--progress",s=`<div class="topic-status" aria-hidden="true">${a}/${n} · ${o}%</div>`,l=`完成 ${a} 題，共 ${n} 題，${o}%`),`
              <button type="button" class="topic-card ${r}" style="background:${t.color}" data-action="goTopic" data-arg="${v(t.id)}"
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
  `}function Qn(t){var qt,Ut;const e=k()||"同學",n=k()?I(k()):null,a=((qt=n==null?void 0:n.streak)==null?void 0:qt.current)||0,o=((Ut=n==null?void 0:n.streak)==null?void 0:Ut.longest)||0,i=(n==null?void 0:n.topicProgress)||{},s=rn(),r=a>=7?"🔥":a>=3?"✨":a>=1?"🌱":"💤",l=a>=7?"flame--hot":a>=1?"flame--warm":"flame--cold",d=["value","caring","all"],c=typeof localStorage<"u"&&localStorage.getItem("fc_home_filter")||"";let g=d.includes(c)?c:"";g||(t==="value"?g="value":t==="caring"?g="caring":g="all");const h=g==="all"?P:P.filter(T=>T.domain===g),F=(T,Gt,Kt)=>{const Yt=g===T;return`<button type="button" class="home-filter-tab ${Yt?"active":""}"
        data-action="setHomeFilter" data-arg="${T}"
        aria-pressed="${Yt}" aria-label="顯示${Gt}，共 ${Kt} 個">${Gt} <span class="home-filter-count">${Kt}</span></button>`},m=P.filter(T=>T.domain==="value").length,$=P.filter(T=>T.domain==="caring").length,z=g==="all"?"🪷🌈 全部 17 個品格課題":g==="value"?"🪷 12 個 EDB 官方價值觀":"🌈 5 個友愛校園範疇（SEL / 安全）";return`
    <div class="container fade-in">
      ${R({emoji:"🌟",title:"友愛教室",back:"hub",backLabel:"返回 Game Hub",rightButton:'<button type="button" class="back-btn" data-action="switchStudent" title="切換學生" aria-label="切換學生">🔄</button>'})}

      ${k()?Jn(k()):""}

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
        ${F("value","🪷 價值觀",m)}
        ${F("caring","🌈 友愛校園",$)}
        ${F("all","📚 全部",P.length)}
      </div>

      <div class="topic-section">
        <h2 class="section-title">${z}</h2>
        <div class="topic-grid" role="list" aria-label="${z}">
          ${h.map(T=>Wn(T,i[T.id]||{})).join("")}
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
  `}function Zn(t,e){const n=jt(t),a=Q(t),o=dt(e);return Ce(t),`
    <div class="container fade-in">
      ${R({title:`${n.emoji} ${n.title}`,back:"home",backLabel:"返回主頁",backArg:void 0,rightButton:e?`<span class="topic-badge" style="background:${o}">${Rt(e)} ${Lt(e)}</span>`:""})}
      <p style="color:var(--text-light);margin-bottom:16px">${n.description}</p>

      <ul class="scenario-list" role="list" aria-label="${n.title} 嘅 ${a.length} 個情境">
        ${a.map(i=>{const s=k()&&bn(k(),i.id);return`
            <li role="listitem">
              <button type="button" class="scenario-item ${s?"completed":""}" data-action="play" data-arg="${v(i.id)}"
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
  `}function ta(t,e){const n=Z(t);if(!n)return J({emoji:"🫥",title:"場景不存在",actionLabel:"← 返首頁",onAction:"FC.goHome()"});const a=jt(n.topicId);dt(e);const o=Q(n.topicId),i=o.findIndex(r=>r.id===n.id)+1,s=o.length;return`
    <div class="container fade-in">
      ${R({titleHTML:`<h1 style="flex:1;text-align:center">${v((a==null?void 0:a.emoji)||"")} ${v((a==null?void 0:a.title)||"")}</h1>`,back:"topic",backLabel:`返回 ${(a==null?void 0:a.title)||"主題"}`,backArg:n.topicId,rightButton:`<span class="play-progress" aria-label="第 ${i} 題，共 ${s} 題">第 ${i} / ${s} 題</span>`})}

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
        ${n.options.map((r,l)=>Sn({scenarioId:n.id,opt:r,index:l,isBank:!1,showMoral:!0})).join("")}
      </div>

      <button type="button" class="voice-fab" data-action="speak" title="朗讀題目" aria-label="朗讀題目">🔊</button>
      ${E()}
    </div>
  `}function ea(t,e){var h,F;if(!t)return J({emoji:"⚠️",title:"結果載入失敗，請重試。",actionLabel:"← 返首頁",onAction:"FC.goHome()"});const{option:n,moralChange:a,mainComment:o,creeds:i,creedText:s,scenarioImage:r,scenarioTitle:l}=t,d=a>=0,c=dt(e),g=`${d?"加咗 ":"減咗 "}${Math.abs(a)} 道德分${d?"，做得好好！":"，下次再努力。"}`;return`
    <div class="container fade-in" id="result-root">
      <h1 class="sr-only" aria-live="polite" aria-atomic="true">${l}嘅結果：${g}</h1>
      ${e?`<div style="text-align:center;margin-bottom:8px">
        <span class="topic-badge" style="background:${c}">${Rt(e)} ${Lt(e)}</span>
      </div>`:""}
      ${r?`
      <div class="scenario-image-wrap" style="max-height:180px;margin-bottom:16px;border-radius:16px;overflow:hidden">
        <img src="${r}" alt="${l}" style="width:100%;max-height:180px;object-fit:cover"
             loading="lazy" decoding="async" />
      </div>`:""}
      <div class="result-card ${d?"good":"bad"}" id="result-card" role="status" aria-label="${g}">
        <div class="result-emoji" aria-hidden="true">${d?"🌟":"💪"}</div>
        <div class="comment">${o||"你做出了選擇！"}</div>
        <div class="moral-score" aria-label="${g}">${d?"＋":""}${a} 道德分</div>
      </div>

      <div class="creed-show" role="region" aria-label="學校信條">
        <div class="creed-header">
          <div class="label">🌟 學校信條</div>
          <button type="button" class="inline-voice-btn" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
        </div>
        <div class="items">
          ${(s||[]).map(m=>`<div class="item">${m}</div>`).join("")}
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
        ${(function(){var $;const m=ee(($=at())==null?void 0:$.topicId);return m?`<button type="button" class="btn btn-primary" data-action="play" data-arg="${v(m.id)}">下一題 →</button>`:""})()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${v(((h=at())==null?void 0:h.topicId)||"")}">← 返回主題</button>
      </div>

      <div class="action-cta-fab" id="result-cta-fab" hidden>
        <button type="button" class="btn btn-primary" data-action="retry">🔄 再做一次</button>
        ${(function(){var $;const m=ee(($=at())==null?void 0:$.topicId);return m?`<button type="button" class="btn btn-primary" data-action="play" data-arg="${v(m.id)}">下一題 →</button>`:""})()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${v(((F=at())==null?void 0:F.topicId)||"")}">← 返回主題</button>
      </div>

      <button type="button" class="voice-fab" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
      ${E()}
    </div>
  `}function na(t){const e=vn(k()),n=e.score,a=e.completedCount,o=dt(t),i=[{id:"value",title:"🎯 價值觀教育",color:"#7C3AED"}];return`
    <div class="container fade-in">
${R({emoji:"📊",title:"我的進度",back:"home",backLabel:"返回主頁",rightButton:t?`<span class="topic-badge" style="background:${o}">${Rt(t)} ${Lt(t)}</span>`:""})}

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

      ${P.map(s=>{const r=p.topicProgress[s.id]||{},l=r.total?Math.round(r.completed/r.total*100):0;return`
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
  `}function aa(){var h,F;const t=localStorage.getItem("fc_tts_speed")||"0.85",e=localStorage.getItem("fc_font_size")||"18",n=localStorage.getItem("fc_line_height")||"1.5",a=localStorage.getItem("fc_spacing")||"medium",o=localStorage.getItem("fc_tts_lang")||"auto",i=localStorage.getItem("fc_hc_mode")==="1",s=localStorage.getItem("fc_rm_mode")==="1";let r=!1;try{r=((h=window.matchMedia)==null?void 0:h.call(window,"(prefers-reduced-motion: reduce)").matches)||!1}catch{}const l=e<=18?"小":e<=22?"中":"大",d=Mt(),c=(()=>{try{return window._fcSyncStatus||{status:"idle",isOnline:navigator.onLine,lastSyncTime:null}}catch{return{status:"idle",isOnline:!0}}})(),g=c.lastSyncTime?new Date(c.lastSyncTime).toLocaleString("zh-HK",{dateStyle:"short",timeStyle:"short"}):"從未同步";return`
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
            ${(((F=window.FC)==null?void 0:F.TTS_LANGS)||[]).map(m=>`
              <button type="button" class="btn"
                data-active="${o===m.id}"
                style="flex:1;min-width:0;font-size:0.88em;padding:8px 6px;${o===m.id?"background:var(--primary);color:#fff;border:3px solid var(--primary);":"background:transparent;border:3px solid var(--primary);color:var(--primary);"}"
                data-action="setTTSLang" data-arg="${v(m.id)}"
                title="${m.hint}"
                role="radio" aria-checked="${o===m.id}">${m.label}</button>
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
          &nbsp;·&nbsp;上次同步：<span id="settings-last-sync">${g}</span>
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
  `}const oa=(window.location.hostname==="localhost"&&window.location.port==="5173","http://localhost:8000");let st=localStorage.getItem("fc_teacher_token")||null,Ee=parseInt(localStorage.getItem("fc_teacher_expiry")||"0",10),V=navigator.onLine,O="idle",G=null;const ne="fc_device_id";function ia(){let t=localStorage.getItem(ne);return t||(t="device_"+Math.random().toString(36).slice(2)+"_"+Date.now(),localStorage.setItem(ne,t)),t}window.addEventListener("online",()=>{V=!0,y.emit("sync:status",{status:"online"}),ca()});window.addEventListener("offline",()=>{V=!1,O="offline",y.emit("sync:status",{status:"offline"})});async function sa(t,e,n,a={}){const o=oa+e,i={"Content-Type":"application/json",...a.headers};st&&(i["X-Teacher-Token"]=st);const s=await fetch(o,{method:t,headers:i,body:n?JSON.stringify(n):void 0,signal:AbortSignal.timeout(8e3)});if(!s.ok){const r=await s.json().catch(()=>({message:s.statusText}));throw new Error(r.message||`HTTP ${s.status}`)}return s.json()}async function Nt(t,e){if(!V)return O="offline",y.emit("sync:status",{status:"offline"}),{ok:!1,reason:"offline"};O="syncing",y.emit("sync:status",{status:"syncing",student:t});try{const n=await sa("POST","/api/sync",{name:t,completedScenarios:e.completedScenarios||[],topicProgress:e.topicProgress||{},subjectProgress:e.subjectProgress||{},totalMoralScore:e.totalMoralScore||0,lastPlayed:e.lastPlayed,deviceId:ia()});return O="ok",G=new Date().toISOString(),y.emit("sync:status",{status:"ok",student:t,lastSynced:G}),localStorage.setItem(`fc_last_sync_${t}`,G),{ok:!0,lastSynced:G}}catch(n){return O="error",y.emit("sync:status",{status:"error",student:t,error:n.message}),console.warn("[Sync] Failed:",n.message),{ok:!1,reason:n.message}}}const Te="fc_sync_queue";function ae(){try{const t=localStorage.getItem(Te),e=JSON.parse(t);return Array.isArray(e)?e:[]}catch(t){return console.warn("[sync] queue load failed:",t),[]}}function ra(t){try{localStorage.setItem(Te,JSON.stringify(t))}catch(e){console.warn("[sync] queue persist failed:",e)}}let bt=!1;async function la(){if(!(bt||!V||ae().length===0)){bt=!0;try{for(;;){const e=ae();if(e.length===0)break;const n=e[0];if(!(await Nt(n.name,n.progress)).ok)break;ra(e.slice(1))}}finally{bt=!1}}}function ca(){la()}function da(){return st?Date.now()>Ee?(ua(),!1):!0:!1}function ua(){st=null,Ee=0,localStorage.removeItem("fc_teacher_token"),localStorage.removeItem("fc_teacher_expiry")}function ga(){return{status:O,isOnline:V,lastSyncTime:G,teacherLoggedIn:da()}}function pa(t,e){V&&t&&e&&setTimeout(()=>Nt(t,e),500)}const rt="fc_interactions_v1",Ae="fc_current_scenario_played_at",oe=1e4;async function ma(t){if(!t)return"anon";try{const e=new TextEncoder().encode(t),n=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("").slice(0,8)}catch{return"h_"+fa(t)}}function fa(t){let e=0;for(let n=0;n<t.length;n++)e=(e<<5)-e+t.charCodeAt(n),e=e&e;return Math.abs(e).toString(36).slice(0,8)}function lt(){try{const t=localStorage.getItem(rt);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch(t){return console.warn("[Analytics] load failed:",t.message),[]}}function ie(t){try{const e=t.length>oe?t.slice(t.length-oe):t;localStorage.setItem(rt,JSON.stringify(e))}catch(e){if(e.name==="QuotaExceededError"||/quota/i.test(e.message)){const n=t.slice(Math.floor(t.length/2));try{localStorage.setItem(rt,JSON.stringify(n)),console.warn("[Analytics] quota hit, trimmed to",n.length)}catch(a){console.error("[Analytics] save failed after trim:",a.message)}}else console.error("[Analytics] save failed:",e.message)}}function ba(){try{sessionStorage.setItem(Ae,String(performance.now()))}catch{}}function Fe(t,e,n){if(!t||!t.scenarioId||!t.optionId){console.warn("[Analytics] logInteraction missing fields:",t);return}const a=Date.now(),o=Number(t.moralChange)||0;let i=null;try{const l=parseFloat(sessionStorage.getItem(Ae)||"0");l>0&&(i=Math.max(0,Math.round(performance.now()-l)))}catch{}const s={timestamp:new Date(a).toISOString(),studentHash:"",scenarioId:t.scenarioId,topicId:t.topicId||"",category:t.category||"",optionId:t.optionId,optionIndex:t.optionIndex||0,isCorrect:o>=0,moralChange:o,responseTimeMs:i,gameMode:n||"relaxed",playedAt:new Date(a-(i||0)).toISOString()};ma(e).then(l=>{const d=lt();for(let c=d.length-1;c>=0;c--)if(!d[c].studentHash){d[c].studentHash=l;break}ie(d)});const r=lt();r.push(s),ie(r)}function va(){try{localStorage.removeItem(rt)}catch{}}function Le(){const t=lt();if(!t.length)return{totalRows:0,byCategory:{},correctRate:null,avgResponseTimeMs:null};const e={};for(const o of t){const i=o.category||"(uncategorized)";e[i]||(e[i]={total:0,correct:0,wrong:0}),e[i].total++,o.isCorrect?e[i].correct++:e[i].wrong++}for(const o of Object.keys(e)){const i=e[o];i.wrongRate=i.total>0?+(i.wrong/i.total).toFixed(3):0}const n=t.filter(o=>o.isCorrect).length,a=t.map(o=>o.responseTimeMs).filter(o=>typeof o=="number");return{totalRows:t.length,byCategory:e,correctRate:+(n/t.length).toFixed(3),avgResponseTimeMs:a.length?Math.round(a.reduce((o,i)=>o+i,0)/a.length):null}}function ha(){const t=lt(),e=["timestamp","studentHash","scenarioId","topicId","category","optionId","optionIndex","isCorrect","moralChange","responseTimeMs","gameMode","playedAt"],n=d=>{if(d==null)return"";const c=String(d);return/[",\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c},a=[e.join(",")];for(const d of t)a.push(e.map(c=>n(d[c])).join(","));const o="\uFEFF"+a.join(`
`),i=`friendly_classroom_log_${new Date().toISOString().slice(0,10)}.csv`,s=new Blob([o],{type:"text/csv;charset=utf-8"}),r=URL.createObjectURL(s),l=document.createElement("a");return l.href=r,l.download=i,l.click(),setTimeout(()=>URL.revokeObjectURL(r),1e3),{count:t.length,filename:i}}const ya=new Set(["home","topic","progress","hub","settings","subject-select","role-select","mode-select","teacher-assign","login","teacher","bank-play","bank-result","bank-summary"]),xa={topic:"topicId"};let kt=null,Ct=null;function wa({setView:t,navRender:e,render:n}){t&&(kt=t),e&&(Ct=e)}function _t(t,e){if(!ya.has(t)){console.warn(`[nav] unknown view: ${t}`);return}const n={},a=xa[t];a&&e!==void 0&&(n[a]=e),kt&&kt(t,n),Ct&&Ct()}const $a={"footer.copyright":"© Ken Cheng 製作","action.back":"← 返回","action.backHome":"← 返回主頁","action.retry":"🔄 再做一次","action.next":"下一題 →","action.start":"開始","action.save":"💾 儲存","action.cancel":"取消","action.confirm":"確認","action.close":"✕ 關閉","status.loading":"載入中…","status.empty":"冇資料","status.error":"出咗問題","error.fallbackTitle":"哎呀，呢頁載入出咗問題","error.fallbackHint":"我哋已經記錄咗呢個錯誤。你可以返主頁重試，<br>或者重新整理整個瀏覽器。","error.fallbackReload":"🔄 重新整理","settings.title":"設定","settings.voice":"語音朗讀","settings.font":"文字顯示","settings.sync":"雲端同步","settings.data":"資料管理","settings.teacher":"老師模式","home.title":"友愛教室","home.greeting":"你好，{name}！","home.subtitle":"揀個品格課題開始","home.flame.cold":"今日開始你嘅 streak！","hub.bankTitle":"好人好事銀行","hub.bankDesc":"做好事存款，衰嘢扣款，目標存到 $100 變品格富翁！","hub.subjectTitle":"情境答題","hub.subjectDesc":"17 個品格課題自由探索","bank.riskTag":"🎯 題目難度：{label}","bank.summaryFilter":"🎯 難度設定：{label} · 本局 {valueCount} 個 value + {caringCount} 個 caring","bank.empty":"🫥 銀行題目載入失敗，請重試。","bank.exit":"← 返 Game Hub","bank.again":"🔄 再玩一次","bank.settle":"✓ 結算","bank.next":"➡ 下一題","scenario.empty":"場景不存在","scenario.loadFailed":"題目載入失敗","scenario.resultFailed":"結果載入失敗，請重試。","teacher.emptyTitle":"暫時沒有學生數據","teacher.emptyHint":"學生完成學習後會自動顯示在這裡"};function vt(t,e={}){let n=$a[t];if(n==null)return t;for(const[a,o]of Object.entries(e))n=n.replace(new RegExp(`\\{${a}\\}`,"g"),String(o));return n}let j=null;async function gt(){if(j)return j;const t=await At(()=>import("./scenarios-CZhaYheh.js"),[],import.meta.url);return j=t.default||t,Fn(j),j}const Sa=document.getElementById("app"),ct=document.getElementById("fc-view");D();de();var re;(re=document.querySelector(".skip-link"))==null||re.addEventListener("click",()=>{setTimeout(()=>Sa.focus({preventScroll:!0}),50)});let ht=null;function ka(){return ht||(ht=document.getElementById("sr-announcer")),ht}let S=null,yt=null;function Ca(){return S||(S=document.createElement("div"),S.id="fc-announce-toast",S.setAttribute("role","status"),S.setAttribute("aria-live","polite"),S.setAttribute("aria-atomic","true"),S.style.cssText=["position: fixed","bottom: 24px","left: 50%","transform: translateX(-50%)","max-width: 90vw","padding: 12px 20px","background: rgba(15, 23, 42, 0.95)","color: #ffffff","border-radius: 12px","box-shadow: 0 8px 24px rgba(0,0,0,0.25)","font-size: 15px","font-weight: 500","line-height: 1.4","text-align: center","z-index: 9999","pointer-events: none","opacity: 0","transition: opacity 0.25s ease-out, transform 0.25s ease-out"].join(";"),document.body.appendChild(S),S)}function _a(t){S&&!S.isConnected&&(S=null);const e=document.documentElement.hasAttribute("data-rm"),n=Ca();n.textContent=t,n.style.opacity="1",n.style.transform=e?"translateX(-50%)":"translateX(-50%) translateY(0)",yt&&clearTimeout(yt),yt=setTimeout(()=>{n.style.opacity="0",n.style.transform=e?"translateX(-50%)":"translateX(-50%) translateY(8px)",setTimeout(()=>{n.style.opacity==="0"&&(n.textContent="")},300)},2500)}function Ht(t){const e=ka();e&&(e.textContent="",requestAnimationFrame(()=>{e.textContent=t})),_a(t)}function Vt(t,e={}){if(!t)return;const n=t.topicId?jt(t.topicId):null,a=(n==null?void 0:n.title)||"",o=e.index,i=e.total,s=e.gameName||"",r=[];o&&i&&r.push(`題目 ${o}，共 ${i} 題`),s&&r.push(s),a&&r.push(`主題：${a}`),r.push(`題目：${t.title}`),Ht(r.join("，"))}y.on("moral:updated",t=>{const e=k();if(t.studentId!==e)return;const n=document.getElementById("moral-bar");if(!n)return;const{percent:a,color:o}=xe(t.score),i=n.querySelector(".moral-fill"),s=n.querySelector(".moral-num");i&&(i.style.width=a+"%",i.style.background=o),s&&(s.textContent=t.score)});y.on("sync:status",t=>{window._fcSyncStatus={...ga(),...t};const e=document.getElementById("sync-badge");if(!e)return;const{status:n}=t;n==="syncing"?(e.textContent="🔄",e.title="同步中…",e.style.opacity="1"):n==="ok"?(e.textContent="✅",e.title="已同步",setTimeout(()=>{e.textContent="☁️",e.title="已連線"},2500)):n==="error"?(e.textContent="⚠️",e.title="同步失敗 — "+(t.error||""),e.style.opacity="1"):n==="offline"&&(e.textContent="📴",e.title="離線模式",e.style.opacity="1")});let A=null;y.on("sync:status",t=>{if(t.status==="offline"){if(A)return;A=document.createElement("div"),A.id="offline-banner",A.setAttribute("role","status"),A.setAttribute("aria-live","polite"),A.style.cssText=`
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
    `,A.textContent="📴 離線模式 — 進度將在恢復連線後自動同步",document.body.appendChild(A)}else t.status==="online"&&A&&(A.remove(),A=null)});const xt=k();if(xt){const t=I(xt);pa(xt,t)}window.FC=window.FC||{};const Ia=Object.freeze({"role-select":()=>({subjectId:null,topicId:null,scenarioId:null,resultData:null}),"mode-select":t=>({subjectId:null,topicId:null,scenarioId:null,resultData:null,gameMode:t==null?void 0:t.gameMode}),"student-select":()=>({subjectId:null,topicId:null,scenarioId:null,resultData:null}),"subject-select":()=>({topicId:null,scenarioId:null,resultData:null}),home:t=>({topicId:null,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??u.subjectId}),topic:t=>({topicId:t==null?void 0:t.topicId,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??u.subjectId}),play:t=>({topicId:null,scenarioId:t==null?void 0:t.scenarioId,resultData:null}),result:t=>({resultData:t==null?void 0:t.resultData,subjectId:(t==null?void 0:t.subjectId)??u.subjectId}),progress:t=>({topicId:null,scenarioId:null,resultData:null,subjectId:(t==null?void 0:t.subjectId)??u.subjectId}),settings:()=>({}),login:()=>({}),teacher:()=>({topicId:null,scenarioId:null,resultData:null}),"teacher-assign":()=>({}),hub:()=>({}),"bank-play":()=>({}),"bank-result":t=>({bankScenario:t==null?void 0:t.bankScenario,bankResult:t==null?void 0:t.bankResult}),"bank-summary":()=>({})});let u={view:"role-select",student:null,subjectId:null,topicId:null,scenarioId:null,resultData:null,teacherMode:!1,role:null,gameMode:localStorage.getItem("fc_game_mode")||"relaxed",bankScenario:null,bankResult:null};function w(t,e={}){const n=Ia[t];if(!n){console.warn(`[state] unknown view: ${t}`);return}u={...u,view:t,...n(e),...e}}let B=null;async function Re(){if(!B){const t=await At(()=>import("./teacher-4-K3dMmW.js"),[],import.meta.url);B={renderLogin:t.renderLogin,renderTeacher:t.renderTeacher}}return B}window.FC.reload=function(){location.reload()};function je(t){if(!j)return gt().then(()=>{je(t)});Ce(t),w("topic",{topicId:t}),Pe()}window.FC.goTopic=je;function pt(t){if(!j)return gt().then(()=>pt(t));localStorage.setItem("fc_last_scenario",t),ba(),w("play",{scenarioId:t}),f();const e=Z(t);if(e){const n=Q(e.topicId),a=n.findIndex(o=>o.id===t)+1;Vt(e,{index:a,total:n.length,gameName:"自由探索"})}}window.FC.play=pt;function Ea(t){const e=Ln(u.scenarioId,t,u.subjectId);if(!e){console.error("[FC] chooseOption returned null, scenarioId=",u.scenarioId,"optionId=",t),goHome();return}try{const n=Z(u.scenarioId);if(n){const a=n.options.findIndex(o=>o.id===t);Fe({scenarioId:n.id,topicId:n.topicId,category:n.valueCategory||"",optionId:t,optionIndex:a>=0?a+1:0,moralChange:e.moralChange},u.student,u.gameMode)}}catch(n){console.warn("[FC] analytics log failed:",n.message)}w("result",{resultData:e}),f(),setTimeout(()=>{e.moralChange>=0?(Y("success"),se()||(Ta(),Aa())):(Y("fail"),se()||Fa())},100)}window.FC.choose=Ea;function Ta(){const t=["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFE66D"];for(let e=0;e<20;e++){const n=document.createElement("div");n.className="confetti-piece",n.style.left=Math.random()*90+5+"vw",n.style.top=Math.random()*30+10+"vh",n.style.background=t[Math.floor(Math.random()*t.length)],n.style.animationDelay=Math.random()*.5+"s",n.style.borderRadius=Math.random()>.5?"50%":"2px",document.body.appendChild(n),setTimeout(()=>n.remove(),2e3)}}function Aa(){const t=["🌟","✨","💫","⭐"];for(let e=0;e<6;e++){const n=document.createElement("div");n.className="star-float",n.textContent=t[Math.floor(Math.random()*t.length)],n.style.left=Math.random()*80+10+"vw",n.style.top=50+Math.random()*30+"vh",n.style.animationDelay=Math.random()*.8+"s",document.body.appendChild(n),setTimeout(()=>n.remove(),2e3)}}function Fa(){const t=document.createElement("div");t.className="star-float",t.textContent="💪",t.style.left="50%",t.style.top="50%",t.style.transform="translate(-50%,-50%)",t.style.fontSize="4em",t.style.animation="bounceIn 0.8s ease-out forwards",document.body.appendChild(t),setTimeout(()=>t.remove(),1500)}function La(){u.scenarioId?pt(u.scenarioId):goHome()}window.FC.retry=La;function Ra(t){if(!["value","caring","all"].includes(t)){console.warn("[FC] setHomeFilter: invalid filter",t);return}localStorage.setItem("fc_home_filter",t),f()}window.FC.setHomeFilter=Ra;async function Me(){await Re(),w("login"),f()}window.FC.goTeacher=Me;async function ja(){if(!u.subjectId){_t("subject-select");return}j||await gt();const t=Ot();if(!t.length){_t("home");return}const e=t[Math.floor(Math.random()*t.length)];pt(e.id)}window.FC.goRandom=ja;window.FC.testTTS=function(){const{speak:t}=window._fcAudio||{};t&&t("呢個係發音測試，請確認可以聽到聲音。如果聽到呢段說話，代表語音功能正常運作。")};window.FC.playGoodDeedBank=async function(){var n;j||await gt();const t=zn();if(!t||!((n=t.questions)!=null&&n.length)){alert("銀行題目載入失敗，請重試。");return}w("bank-play"),f();const e=t.questions[t.currentIdx];e&&Vt(e,{index:t.currentIdx+1,total:t.questions.length,gameName:"好人好事銀行"})};window.FC.bankChoose=function(t){const e=K();if(!e)return;const n=e.questions[e.currentIdx];if(!n)return;const a=we(n,t);if(!a){console.error("[Bank] applyScenarioResult null");return}const o=n.options.findIndex(i=>i.id===t);a.outcomeImage=`assets/images/outcomes/${n.id}_opt${o+1}.png`,On(a.moralChange,n.title);try{Fe({scenarioId:n.id,topicId:n.topicId,category:n.valueCategory||"",optionId:t,optionIndex:o>=0?o+1:0,moralChange:a.moralChange},k(),"bank")}catch(i){console.warn("[FC] bank analytics log failed:",i.message)}u={...u,view:"bank-result",bankScenario:n,bankResult:a},f()};window.FC.bankNext=function(){const t=K();if(!t){FC.exitBank();return}if(t.status==="finished"||t.status==="bankrupt"){w("bank-summary"),f();return}Nn(),w("bank-play"),f();const e=t.questions[t.currentIdx];e&&Vt(e,{index:t.currentIdx+1,total:t.questions.length,gameName:"好人好事銀行"})};window.FC.exitBank=function(){Bn(),w("hub"),f()};window.FC.confirmExitBank=function(){confirm("中途離開？今次遊戲進度會唔儲。")&&FC.exitBank()};window.FC._stopEvt=function(t){t&&(typeof t.stopPropagation=="function"&&t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault())};window.FC.setTTSLang=function(t){We(t);const{speak:e}=window._fcAudio||{};e&&e("語言切換測試，你聽到嘅係新嘅發音。"),u.view==="settings"&&f()};window.FC.getTTSLang=function(){return Qe()};window.FC.TTS_LANGS=ue;function Ma(t){Rn(t),w("home",{subjectId:t}),f()}window.FC.selectSubject=Ma;async function Pa(t){u={...u,role:t,teacherMode:t==="teacher"},t==="teacher"?(await Re(),w("login")):w("hub"),f()}window.FC.chooseRole=Pa;function tt(){try{return JSON.parse(localStorage.getItem("fc_teacher_config")||"{}")}catch{return console.warn("[FC] teacher_config corrupt, resetting"),{}}}function et(t){try{localStorage.setItem("fc_teacher_config",JSON.stringify(t))}catch(e){console.error("[FC] saveTeacherConfig failed:",e.message)}}window.FC.toggleTeacherFeature=function(t,e){t.classList.toggle("on");const n=t.classList.contains("on"),a=tt();a[e]=n,et(a),e==="timerEnabled"&&f()};window.FC.setTeacherTimer=function(t){const e=tt();e.timerSeconds=parseInt(t),et(e)};window.FC.setButtonSize=function(t){const e=tt();e.buttonSize=t,et(e),f()};window.FC.setBankMaxRisk=function(t){const e=tt();e.bankMaxRiskLevel=t,et(e),f()};window.FC.toggleAssignedTopic=function(t,e){const n=tt();n.assignedTopics||(n.assignedTopics=[]),e?n.assignedTopics.includes(t)||n.assignedTopics.push(t):n.assignedTopics=n.assignedTopics.filter(a=>a!==t),et(n)};window.FC.saveTeacherPIN=function(){var e,n;const t=((n=(e=document.getElementById("teacher-pin-input"))==null?void 0:e.value)==null?void 0:n.trim())||"admin";localStorage.setItem("fc_teacher_pin",t),alert("✅ PIN 已更新為："+t)};window.FC.saveTeacherConfig=function(){alert("✅ 老師設定已儲存！"),Me()};function Da(){w("student-select"),f()}window.FC.switchStudent=Da;function za(){return`
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h1 style="text-align:center;margin-bottom:24px">👤 選擇學生</h1>
      <div class="fc-flex-col-gap fc-mb-20" role="list" aria-label="已登記嘅學生">
        ${$e().map(e=>`
          <button type="button" class="student-card" data-action="selectStudent" data-arg="${v(e.name)}" role="listitem"
            aria-label="選擇學生 ${v(e.name)}，按此開始學習">
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
      ${E()}
    </div>
  `}window.FC.selectStudent=function(t){t!=="其他"&&(An(t),w("home",{student:t}),f())};function Ba(){return`
    <div class="container fade-in" style="max-width:500px">
      <h1 style="text-align:center;margin-bottom:20px">📚 選擇科目</h1>
      <div class="subject-grid" role="list" aria-label="科目清單">
        ${Ve().map(t=>`
          <button type="button" class="subject-btn" style="background:${t.bgColor};border-color:${t.color}"
            data-action="selectSubject" data-arg="${v(t.id)}" role="listitem"
            aria-label="選擇科目 ${t.title}">
            <span style="font-size:2em" aria-hidden="true">${t.emoji}</span>
            <span style="font-weight:600;color:${t.color}">${t.title}</span>
          </button>
        `).join("")}
      </div>
      <div style="margin-top:12px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回</button>
      </div>
      ${E()}
    </div>
  `}window.FC.handleImport=function(t){var a;const e=(a=t.target.files)==null?void 0:a[0];if(!e)return;const n=new FileReader;n.onload=o=>{const i=Se(o.target.result);i.ok?(alert("匯入成功！"),window.FC.goTeacher()):alert("匯入失敗："+i.error)},n.readAsText(e)};window.FC.exportAll=function(){const t=$e(),e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download="全班進度.json",a.click(),URL.revokeObjectURL(n)};window.FC.speak=function(){const t=Z(u.scenarioId);t&&be(t)};window.FC.speakOpt=function(t){const e=Z(u.scenarioId);if(!e)return;const n=e.options.find(a=>a.id===t);if(n){const{speak:a}=window._fcAudio||{};a&&a(n.text)}};window.FC.speakCreeds=function(){var t;(t=u.resultData)!=null&&t.creeds&&ve(u.resultData.creeds)};let N=0;window.FC.toggleHints=function(){const t=document.getElementById("hints-list"),e=document.getElementById("hints-chev"),n=document.getElementById("hints-toggle");if(!t)return;!t.hasAttribute("hidden")?(t.setAttribute("hidden",""),e&&(e.textContent="▾"),n&&n.setAttribute("aria-expanded","false")):(t.removeAttribute("hidden"),e&&(e.textContent="▴"),n&&n.setAttribute("aria-expanded","true"),N===0&&FC.revealNextHint())};window.FC.revealNextHint=function(){const t=document.querySelectorAll(".hint-item"),e=document.getElementById("hint-next");N>=t.length||(t[N].removeAttribute("hidden"),N++,N>=t.length&&e&&e.setAttribute("hidden",""))};const Oa=f;f=function(){N=0,Oa(),requestAnimationFrame(It)};function It(){const t=document.getElementById("result-actions"),e=document.getElementById("result-cta-fab");if(!t||!e)return;const n=t.getBoundingClientRect();n.top>window.innerHeight||n.bottom<0?e.removeAttribute("hidden"):e.setAttribute("hidden","")}typeof window<"u"&&(window.addEventListener("scroll",()=>{document.getElementById("result-cta-fab")&&It()},{passive:!0}),window.addEventListener("resize",It));window.FC.toggleVoice=function(t){const e=!Mt();me(e),t&&t.classList.toggle("on",e),e&&!localStorage.getItem("fc_voice_seen")&&localStorage.setItem("fc_voice_seen","1")};window.FC.setFontSize=function(t){localStorage.setItem("fc_font_size",t),D();const e=document.querySelector('[data-for="fs"]');e&&(e.textContent=t<=18?"小":t<=22?"中":"大")};window.FC.setLineHeight=function(t){localStorage.setItem("fc_line_height",t),D();const e=document.querySelector('[data-for="lh"]');e&&(e.textContent=parseFloat(t).toFixed(1))};window.FC.setSpacing=function(t){localStorage.setItem("fc_spacing",t),D(),["narrow","medium","wide"].forEach(e=>{const n=document.getElementById("sp-"+e);n&&(n.className="btn "+(e===t?"btn-primary":"btn-outline"))})};window.FC.toggleHC=function(t){const e=localStorage.getItem("fc_hc_mode")!=="1";localStorage.setItem("fc_hc_mode",e?"1":"0"),t&&t.classList.toggle("on",e),D(),Ht(e?"高對比模式開咗":"高對比模式關咗")};window.FC.toggleReducedMotion=function(t){const e=localStorage.getItem("fc_rm_mode")!=="1";localStorage.setItem("fc_rm_mode",e?"1":"0"),t&&t.classList.toggle("on",e),D(),Ht(e?"減少動畫開咗":"減少動畫關咗")};function se(){return document.documentElement.hasAttribute("data-rm")}window.FC.setSpeed=function(t){localStorage.setItem("fc_tts_speed",t);const e=document.querySelector('[data-for="speed"]');e&&(e.textContent=parseFloat(t).toFixed(2)+"x")};window.FC.resetSettings=function(){Ze(),f()};window.FC.exportAnalyticsCSV=function(){try{const t=ha();if(t.count===0){alert(`📊 仲未有學習記錄

先玩幾個 scenario 先有 log 喺 localStorage。`);return}alert(`✅ 已匯出 ${t.count} 條學習記錄

檔案：${t.filename}

可以分享畀老師 / 拖入 Excel / Google Sheet 開。`)}catch(t){console.error("[FC] exportAnalyticsCSV failed:",t.message),alert("❌ 匯出失敗："+t.message)}};window.FC.clearAnalytics=function(){confirm(`⚠️ 確定清除所有學習記錄？

清除後將無法復原。`)&&(va(),f())};window.FC.getAnalyticsStats=Le;function Na(){const t=document.getElementById("analytics-summary");if(t)try{const e=Le();if(e.totalRows===0){t.textContent="📭 仲未有學習記錄 — 玩幾個 scenario 就會見到。";return}const n=Object.entries(e.byCategory).filter(([o])=>o&&o!=="(uncategorized)").sort((o,i)=>i[1].wrongRate-o[1].wrongRate).slice(0,3),a=[`📝 總作答：${e.totalRows} 題 · ✅ 答啱率：${(e.correctRate*100).toFixed(0)}%`+(e.avgResponseTimeMs?` · ⏱️ 平均 ${(e.avgResponseTimeMs/1e3).toFixed(1)}s`:"")];n.length&&(a.push("📊 答錯率最高："),n.forEach(([o,i],s)=>{a.push(`  ${s+1}. ${o} — ${(i.wrongRate*100).toFixed(0)}% (${i.wrong}/${i.total})`)})),t.innerHTML=a.map(o=>o.replace(/\n/g,"<br>")).join("<br>").replace(/(答錯率最高：)/g,"<strong>$1</strong>")}catch(e){t.textContent="⚠️ 載入失敗："+e.message}}function Ha(){const t=document.getElementById("settings-sync-status"),e=document.getElementById("settings-last-sync");t&&(t.innerHTML='<span class="skeleton skeleton-text-sm" style="width:80px"></span>'),e&&(e.innerHTML='<span class="skeleton skeleton-text-sm" style="width:120px"></span>')}window.FC.forceSync=async function(){const t=k();if(!t)return;const e=I(t);if(Ha(),(await Nt(t,e)).ok){const a=document.getElementById("settings-sync-status"),o=document.getElementById("settings-last-sync");a&&(a.textContent="✅ 已同步"),o&&(o.textContent=new Date().toLocaleString("zh-HK",{dateStyle:"short",timeStyle:"short"}))}else{const a=document.getElementById("settings-sync-status");a&&(a.textContent="❌ 同步失敗")}};window.FC.exportMyData=function(){const t=k();if(!t)return;const e=fn(t),n=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download=`progress_${t}.json`,o.click(),URL.revokeObjectURL(a)};window.FC.importMyData=function(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=e=>{var o;const n=(o=e.target.files)==null?void 0:o[0];if(!n)return;const a=new FileReader;a.onload=i=>{const s=Se(i.target.result);alert(s.ok?"匯入成功！":"匯入失敗："+s.error),s.ok&&f()},a.readAsText(n)},t.click()};const Va=typeof document<"u"&&"startViewTransition"in document;function qa(t){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){t();return}Va?document.startViewTransition(t):t()}function Pe(){qa(f)}function Et(t){const e=document.createElement("template");e.innerHTML=t.trim(),ct.replaceChildren(e.content)}const Ua=["click","error"];function Tt(t){if(!(!t||t.__fcDelegated)){t.__fcDelegated=!0,t.addEventListener("error",e=>{const n=e.target;n&&n.tagName==="IMG"&&(n.style.opacity="0.3",n.alt="（插圖暫不可用）")},!0);for(const e of Ua.filter(n=>n!=="error"))t.addEventListener(e,n=>{var o;let a=n.target;for(;a&&a!==t;){const i=a.dataset&&a.dataset.action;if(i){if(i==="navigate"){n.preventDefault(),_t(a.dataset.arg,a.dataset.arg2);return}const s=(o=window.FC)==null?void 0:o[i];if(typeof s=="function"){n.preventDefault();const r=a.dataset.arg,l=a.dataset.arg2;l!==void 0?s.call(a,r,l):r!==void 0?s.call(a,r):s.call(a,n);return}}a=a.parentElement}})}}function De(t){return`
    <div class="container fade-in" role="alert" aria-live="assertive">
      <div class="card fc-center" style="padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">⚠️</div>
        <h2 style="margin-bottom:8px">${vt("error.fallbackTitle")}</h2>
        <p class="fc-muted fc-mb-16">
          ${vt("error.fallbackHint")}
        </p>
        <details style="text-align:left;background:var(--bg);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.85em">
          <summary style="cursor:pointer;font-weight:600">🔍 技術細節</summary>
          <pre style="white-space:pre-wrap;margin-top:8px;color:var(--danger)">${t.message}</pre>
        </details>
        <div class="action-row" style="justify-content:center">
          <button type="button" class="btn btn-primary" data-action="navigate" data-arg="home">← 返主頁</button>
          <button type="button" class="btn btn-outline" data-action="reload">${vt("error.fallbackReload")}</button>
        </div>
      </div>
    </div>
  `}function f(){var e;let t="";try{switch(u.view){case"role-select":t=Hn();break;case"hub":t=Vn();break;case"mode-select":t=Yn(u.gameMode,u.subjectId);break;case"student-select":t=za();break;case"subject-select":t=Ba();break;case"login":t=B?B.renderLogin():Qt("載入中...");break;case"teacher":t=B?B.renderTeacher():Qt("載入中...");break;case"teacher-assign":t=Xn();break;case"home":t=Qn(u.subjectId);break;case"topic":t=Zn(u.topicId,u.subjectId);break;case"play":t=ta(u.scenarioId,u.subjectId);break;case"result":t=ea(u.resultData,u.subjectId);break;case"progress":t=na(u.subjectId);break;case"settings":t=aa();break;case"bank-play":{const n=K(),a=((e=n==null?void 0:n.questions)==null?void 0:e[n==null?void 0:n.currentIdx])||null;t=qn(a,n);break}case"bank-result":t=Un(u.bankScenario,u.bankResult,K());break;case"bank-summary":t=Gn(K());break;default:t='<div class="container"><p>頁面不存在</p></div>'}Et(t),Tt(ct),u.view==="settings"&&Na()}catch(n){console.error("[FC] RENDER ERROR:",n.message,n.stack),Et(De(n)),Tt(ct)}}wa({setView:w,navRender:Pe,render:f});try{f()}catch(t){console.error("[FC] RENDER ERROR:",t.message,t.stack),Et(De(t)),Tt(ct)}export{At as _,Ve as a,vn as b,E as c,v as e,$e as g,J as r};
