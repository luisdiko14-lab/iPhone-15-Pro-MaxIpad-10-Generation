(() => {
'use strict';
const host=String(location.hostname||'').toLowerCase(),forced=document.querySelector('meta[name="ios-static-host"]');
const isGitHubPages=host==='github.io'||host.endsWith('.github.io'),isStaticHost=isGitHubPages||!!(forced&&forced.content==='true');
const nativeFetch=window.fetch?window.fetch.bind(window):null;
function toUrl(input){try{const raw=input&&typeof input==='object'&&'url' in input?input.url:String(input);return new URL(raw,location.href);}catch(_){return null;}}
if(isStaticHost&&nativeFetch)window.fetch=function(input,init){
 const url=toUrl(input);
 if(url&&url.origin===location.origin&&/^\/api(?:\/|$)/i.test(url.pathname)){
  const body=JSON.stringify({error:'backend_unavailable',message:'This feature needs the live simulator server. GitHub Pages only hosts static files.'});
  return Promise.resolve(new Response(body,{status:503,statusText:'Service Unavailable',headers:{'Content-Type':'application/json'}}));
 }
 return nativeFetch(input,init);
};
function escapeHtml(v){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function loadSafariFrame(frame,targetUrl){
 if(!frame)return;let target;try{target=new URL(targetUrl,location.href);}catch(_){target=new URL('https://www.google.com');}
 if(!isStaticHost){frame.removeAttribute('srcdoc');frame.src='/api/proxy?url='+encodeURIComponent(target.href);return;}
 frame.removeAttribute('src');const href=escapeHtml(target.href),domain=escapeHtml(target.hostname);
 frame.srcdoc='<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open website</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:28px;background:linear-gradient(150deg,#111827,#09090b);color:#f5f5f7;font:15px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;text-align:center}.card{max-width:340px;padding:26px;border:1px solid #ffffff20;border-radius:24px;background:#ffffff0d;box-shadow:0 20px 60px #0008}h2{font-size:20px;margin:0 0 10px}p{color:#a1a1aa;line-height:1.5;font-size:13px}a{display:inline-block;margin-top:12px;padding:12px 18px;border-radius:999px;background:#0a84ff;color:white;text-decoration:none;font-weight:650}.host{font-size:12px;color:#a1a1aa;word-break:break-all}</style><body><main class="card"><div style="font-size:38px">🌐</div><h2>Open in a new tab</h2><p>GitHub Pages cannot run the simulator web proxy. Open the website directly to continue browsing.</p><div class="host">'+domain+'</div><a href="'+href+'" target="_blank" rel="noopener noreferrer">Open website ↗</a></main></body></html>';
}
window.IOSRuntime={isStaticHost:isStaticHost,isGitHubPages:isGitHubPages,apiAvailable:!isStaticHost,loadSafariFrame:loadSafariFrame};
if(isStaticHost)console.info('[iOS Simulator] Static hosting detected. Backend-only features use local or preview mode.');
})();