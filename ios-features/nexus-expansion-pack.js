(() => {
  'use strict';
  const hub = window.IOSUpgradeHub;
  if (!hub) return;
  const safeKey = key => !/(password|passwd|secret|token|auth|session|credential|cookie|api.?key)/i.test(key);
  const safeSnapshot = () => {
    const data = {};
    for (let i=0;i<localStorage.length;i++) {
      const key=localStorage.key(i);
      if (!key || !safeKey(key)) continue;
      try { data[key]=JSON.parse(localStorage.getItem(key)); }
      catch (_) { data[key]=localStorage.getItem(key); }
    }
    return data;
  };
  const bytes = value => new Blob([JSON.stringify(value)]).size;
  const pretty = n => n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';

  hub.register({
    id:'device-backup', icon:'☁️', title:'Device Backup', short:'Export and restore simulator data',
    description:'Create a portable backup of safe simulator preferences and app data. Authentication, tokens, passwords and API keys are deliberately excluded.',
    content:`<div class="ix-stat"><small>SAFE LOCAL DATA</small><br><strong id="nx-backup-count">—</strong><p id="nx-backup-size">Calculating stored data…</p></div><div class="ix-toolbar"><button type="button" id="nx-export">Export backup</button><button type="button" id="nx-import-trigger">Choose backup</button><input id="nx-import-file" type="file" accept="application/json,.json" hidden></div><div class="ix-note" id="nx-backup-status" role="status">Backups stay on this device unless you choose to export a file.</div><div class="ix-stat"><b>Included</b><p class="ix-note">App preferences, notes, reminders, saved simulator settings and other non-sensitive local data.</p><b>Excluded</b><p class="ix-note">Passwords, authentication/session data, API keys, tokens and credentials.</p></div>`,
    mount(root,api){
      const count=root.querySelector('#nx-backup-count'),size=root.querySelector('#nx-backup-size'),status=root.querySelector('#nx-backup-status'),file=root.querySelector('#nx-import-file');
      const refresh=()=>{const data=safeSnapshot();count.textContent=Object.keys(data).length+' items';size.textContent=pretty(bytes(data))+' estimated backup size';};
      refresh();
      root.querySelector('#nx-export').onclick=()=>{const backup={format:'ios-simulator-backup',version:1,createdAt:new Date().toISOString(),data:safeSnapshot()};const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ios-simulator-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Backup exported successfully.';api.toast('Backup exported');};
      root.querySelector('#nx-import-trigger').onclick=()=>file.click();
      file.onchange=async()=>{const selected=file.files&&file.files[0];if(!selected)return;if(selected.size>5*1024*1024){status.textContent='File is too large. Maximum size is 5 MB.';file.value='';return;}try{const parsed=JSON.parse(await selected.text());if(!parsed||parsed.format!=='ios-simulator-backup'||parsed.version!==1||!parsed.data||typeof parsed.data!=='object'||Array.isArray(parsed.data))throw new Error('Unsupported backup format.');const entries=Object.entries(parsed.data).filter(([k])=>typeof k==='string'&&safeKey(k));if(!entries.length)throw new Error('No restorable safe data was found.');const preview=entries.length+' safe items will be restored. Existing values with matching keys will be replaced. Continue?';if(!window.confirm(preview))return;for(const [key,value] of entries){const raw=typeof value==='string'?value:JSON.stringify(value);localStorage.setItem(key,raw);}status.textContent='Restored '+entries.length+' items. Reload the simulator to apply all settings.';api.toast('Backup restored');refresh();}catch(error){status.textContent='Import failed: '+error.message;}finally{file.value='';}};
    }
  });

  hub.register({
    id:'device-diagnostics', icon:'🩺', title:'Device Diagnostics', short:'Run a local simulator health check',
    description:'Inspect browser capabilities and simulator storage locally. This diagnostic does not access hardware sensors or send data anywhere.',
    content:`<div class="ix-stat"><small>DIAGNOSTIC REPORT</small><div id="nx-diagnostics" class="ix-list"><div class="ix-row">Ready to run <span>—</span></div></div></div><div class="ix-toolbar"><button type="button" id="nx-run-diagnostics">Run diagnostics</button></div><p class="ix-note">Results describe browser support, not the physical iPhone or iPad hardware.</p>`,
    mount(root,api){
      const output=root.querySelector('#nx-diagnostics');
      root.querySelector('#nx-run-diagnostics').onclick=async()=>{
        const checks=[['Browser storage',!!window.localStorage],['Online connection',navigator.onLine],['Touch input','ontouchstart'in window||navigator.maxTouchPoints>0],['Camera API',!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)],['Microphone API',!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)],['Notifications API','Notification'in window],['Service workers','serviceWorker'in navigator]];
        let storage='Unavailable';try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();storage=e.usage==null?'Available':pretty(e.usage)+' used';}}catch(_){}
        checks.push(['Storage estimate',storage]);
        output.innerHTML=checks.map(([label,value])=>'<div class="ix-row"><span>'+label+'</span><b>'+ (typeof value==='boolean'?(value?'Available':'Unavailable'):String(value))+'</b></div>').join('');
        api.toast('Diagnostics complete');
      };
    }
  });

  hub.register({
    id:'network-lab', icon:'📡', title:'Network Lab', short:'Test simulated connection profiles',
    description:'Switch between local demo network profiles and run a simulated latency test. These controls do not change your real Wi-Fi, carrier or router.',
    content:`<div class="ix-stat"><small>ACTIVE PROFILE</small><strong id="nx-network-profile">Balanced</strong><p id="nx-network-detail" class="ix-note">Standard simulator connection profile.</p></div><div class="ix-toolbar"><select id="nx-network-mode" aria-label="Network profile"><option value="balanced">Balanced</option><option value="low-latency">Low latency</option><option value="saving">Data saver</option><option value="offline">Offline simulation</option></select><button type="button" id="nx-network-test">Run test</button></div><div class="ix-stat"><small>SIMULATED LATENCY</small><strong id="nx-network-ping">—</strong><p id="nx-network-state" class="ix-note">Choose a profile and run a test.</p></div>`,
    mount(root,api){
      const mode=root.querySelector('#nx-network-mode'),title=root.querySelector('#nx-network-profile'),detail=root.querySelector('#nx-network-detail'),ping=root.querySelector('#nx-network-ping'),state=root.querySelector('#nx-network-state');
      const profiles={balanced:['Balanced','Standard simulator connection profile.'], 'low-latency':['Low latency','Prioritizes responsiveness in this demo.'],saving:['Data saver','Simulates reduced background data usage.'],offline:['Offline simulation','Simulates a disconnected state; your real connection is unchanged.']};
      mode.value=api.get('profile','balanced');const apply=()=>{const p=profiles[mode.value];title.textContent=p[0];detail.textContent=p[1];api.set('profile',mode.value);ping.textContent='—';state.textContent='Profile selected. Run the test to see simulated results.';};mode.onchange=apply;apply();
      root.querySelector('#nx-network-test').onclick=()=>{const values={balanced:42,'low-latency':18,saving:76,offline:null};const v=values[mode.value];ping.textContent=v===null?'Offline':v+' ms';state.textContent=v===null?'No simulated connection.':'Demo test complete · '+(v<30?'Excellent':v<60?'Good':'Limited')+' response';api.toast('Simulation test complete');};
    }
  });

  hub.register({
    id:'wallpaper-studio', icon:'🎨', title:'Wallpaper Studio', short:'Create a custom simulator wallpaper',
    description:'Build a gradient wallpaper, preview it and save your design locally. This changes the simulator page background only.',
    content:`<div class="ix-stat"><div id="nx-wallpaper-preview" style="height:150px;border-radius:18px;background:linear-gradient(135deg,#172554,#7c3aed);border:1px solid #ffffff30"></div><p class="ix-note">Live wallpaper preview</p></div><div class="ix-control"><span><b>First color</b></span><input id="nx-color-a" type="color" value="#172554"></div><div class="ix-control"><span><b>Second color</b></span><input id="nx-color-b" type="color" value="#7c3aed"></div><div class="ix-control"><span><b>Angle</b></span><input id="nx-wallpaper-angle" type="range" min="0" max="360" value="135"></div><div class="ix-toolbar"><button type="button" id="nx-wallpaper-apply">Apply wallpaper</button><button type="button" id="nx-wallpaper-reset">Reset preview</button></div><p class="ix-note" id="nx-wallpaper-status">Your custom gradient is stored in this browser.</p>`,
    mount(root,api){
      const a=root.querySelector('#nx-color-a'),b=root.querySelector('#nx-color-b'),angle=root.querySelector('#nx-wallpaper-angle'),preview=root.querySelector('#nx-wallpaper-preview'),status=root.querySelector('#nx-wallpaper-status');
      const css=()=> 'linear-gradient('+angle.value+'deg,'+a.value+','+b.value+')';
      const update=()=>{preview.style.background=css();};[a,b,angle].forEach(el=>el.addEventListener('input',update));
      root.querySelector('#nx-wallpaper-apply').onclick=()=>{const value={a:a.value,b:b.value,angle:Number(angle.value)};localStorage.setItem('nexus-custom-wallpaper',JSON.stringify(value));document.body.style.background=css();status.textContent='Wallpaper applied to this page. Saved locally.';api.toast('Wallpaper applied');};
      root.querySelector('#nx-wallpaper-reset').onclick=()=>{a.value='#172554';b.value='#7c3aed';angle.value=135;update();status.textContent='Preview reset. Your saved wallpaper was not changed.';};
      try{const saved=JSON.parse(localStorage.getItem('nexus-custom-wallpaper')||'null');if(saved&&/^#[0-9a-f]{6}$/i.test(saved.a)&&/^#[0-9a-f]{6}$/i.test(saved.b)){a.value=saved.a;b.value=saved.b;angle.value=Math.max(0,Math.min(360,Number(saved.angle)||135));update();}}catch(_){}
    }
  });
})();