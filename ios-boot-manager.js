(() => {
'use strict';
const STATE_KEY='iosSystemState',OVERLAY_ID='ios-system-recovery';let overlay=null,booting=false;
const style=document.createElement('style');
style.textContent=
'#'+OVERLAY_ID+'{position:fixed;inset:0;z-index:100500;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.78);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#f5f5f7;opacity:1;transition:opacity .35s ease}'+
'#'+OVERLAY_ID+'.is-leaving{opacity:0;pointer-events:none}'+
'#'+OVERLAY_ID+' .ios-recovery-card{width:min(360px,100%);padding:28px 24px 24px;border:1px solid rgba(255,255,255,.15);border-radius:28px;background:linear-gradient(160deg,rgba(48,48,52,.98),rgba(22,22,25,.98));box-shadow:0 28px 100px rgba(0,0,0,.55);text-align:center}'+
'#'+OVERLAY_ID+' .ios-recovery-icon{width:66px;height:66px;margin:0 auto 15px;border-radius:21px;display:grid;place-items:center;background:linear-gradient(145deg,#39393d,#161619);border:1px solid #ffffff20;font-size:32px}'+
'#'+OVERLAY_ID+' .ios-recovery-version{font-size:10px;font-weight:800;letter-spacing:1.6px;color:#a1a1aa;text-transform:uppercase;margin-bottom:10px}'+
'#'+OVERLAY_ID+' h2{font-size:22px;line-height:1.18;letter-spacing:-.55px;margin:0 0 10px;font-weight:750}'+
'#'+OVERLAY_ID+' p{font-size:13px;line-height:1.55;color:#b8b8bd;margin:0 auto 20px;max-width:290px}'+
'#'+OVERLAY_ID+' .ios-run-button{width:100%;border:0;border-radius:14px;padding:14px 18px;background:linear-gradient(180deg,#168cff,#0066df);color:white;font-size:15px;font-weight:750;box-shadow:0 8px 24px #007aff44;cursor:pointer}'+
'#'+OVERLAY_ID+' .ios-run-button:disabled{opacity:.72;cursor:default}'+
'#'+OVERLAY_ID+' .ios-boot-progress{height:5px;margin-top:18px;border-radius:99px;background:#ffffff18;overflow:hidden}'+
'#'+OVERLAY_ID+' .ios-boot-progress span{display:block;width:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#5ac8fa,#0a84ff);transition:width .45s ease}'+
'#'+OVERLAY_ID+' .ios-boot-status{min-height:18px;margin-top:12px;font-size:11px;color:#8f8f95}'+
'#'+OVERLAY_ID+' .ios-boot-spinner{display:inline-block;width:13px;height:13px;margin-right:7px;vertical-align:-2px;border:2px solid #ffffff45;border-top-color:white;border-radius:50%;animation:ios-boot-spin .7s linear infinite}'+
'@keyframes ios-boot-spin{to{transform:rotate(360deg)}}'+
'@media(prefers-reduced-motion:reduce){#'+OVERLAY_ID+',#'+OVERLAY_ID+' *{animation-duration:.01ms!important;transition-duration:.01ms!important}}';
document.head.appendChild(style);
function closeOverlay(){if(!overlay)return;overlay.classList.add('is-leaving');const old=overlay;setTimeout(()=>old.remove(),380);overlay=null;booting=false;}
function mountOverlay(){
 if(overlay||document.getElementById(OVERLAY_ID)){overlay=document.getElementById(OVERLAY_ID);return;}
 overlay=document.createElement('div');overlay.id=OVERLAY_ID;overlay.setAttribute('role','alertdialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','ios-recovery-title');
 overlay.innerHTML='<section class="ios-recovery-card"><div class="ios-recovery-icon">📱</div><div class="ios-recovery-version">iOS 17.4 · System Recovery</div><h2 id="ios-recovery-title">System iOS is not running…</h2><p id="ios-recovery-message">The system interface stopped after a system process was terminated. Run iOS to restart SpringBoard and restore your Home Screen.</p><button class="ios-run-button" type="button" id="ios-run-system">Run iOS</button><div class="ios-boot-progress"><span id="ios-boot-fill"></span></div><p class="ios-boot-status" id="ios-boot-status" aria-live="polite">System services are stopped.</p></section>';
 document.body.appendChild(overlay);overlay.querySelector('#ios-run-system').addEventListener('click',startBoot);
}
function startBoot(){
 if(booting||!overlay)return;booting=true;try{localStorage.setItem(STATE_KEY,'starting');}catch(_){}
 const button=overlay.querySelector('#ios-run-system'),title=overlay.querySelector('#ios-recovery-title'),message=overlay.querySelector('#ios-recovery-message'),status=overlay.querySelector('#ios-boot-status'),fill=overlay.querySelector('#ios-boot-fill');
 button.disabled=true;button.innerHTML='<span class="ios-boot-spinner"></span>Starting phone…';title.textContent='Starting phone…';message.textContent='Please wait while the iPhone system services start and the Home Screen is restored.';
 const stages=[[14,'Checking system files…'],[32,'Mounting system services…'],[53,'Starting SpringBoard…'],[76,'Loading iPhone interface…'],[94,'Restoring your Home Screen…']];let index=0;
 function advance(){if(index<stages.length){fill.style.width=stages[index][0]+'%';status.textContent=stages[index][1];index+=1;setTimeout(advance,620);return;}
  fill.style.width='100%';title.textContent='iPhone is ready';message.textContent='System services are running again. Welcome back.';status.textContent='Startup complete';button.textContent='Done';
  try{localStorage.setItem(STATE_KEY,'running');localStorage.removeItem('iosSystemCrashProcess');localStorage.removeItem('iosKilledSystemProcesses');}catch(_){}
  setTimeout(closeOverlay,700);
 }
 advance();
}
function syncState(){let state='running';try{state=localStorage.getItem(STATE_KEY)||'running';}catch(_){}if(state==='stopped'||state==='starting')mountOverlay();else if(overlay)closeOverlay();}
function init(){syncState();window.addEventListener('pageshow',syncState);window.addEventListener('storage',event=>{if(event.key===STATE_KEY)syncState();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.IOSBootManager={sync:syncState};
})();