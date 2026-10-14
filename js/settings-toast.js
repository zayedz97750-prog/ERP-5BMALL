/* ═══ 5B Mall — Toast, Settings & Theme ═══ */
/* ══════════════════════ TOAST ══════════════════════ */
/* Site-wide date format: يوم/شهر/سنة (day/month/year) */
function updateDateHint(inp,hintId){
  const el=document.getElementById(hintId);if(!el)return;
  if(!inp||!inp.value){el.textContent='';return;}
  const parts=inp.value.split('-');
  if(parts.length!==3){el.textContent='';return;}
  const[y,m,d]=parts;
  el.textContent='التاريخ: '+d+'/'+m+'/'+y;
}
const MONTH_NAMES=['','January','February','March','April','May','June','July','August','September','October','November','December'];
function autoFillMonthFromStart(inp){
  if(!inp||!inp.value)return;
  const parts=inp.value.split('-');
  if(parts.length!==3)return;
  const m=parseInt(parts[1],10);
  const monthSel=document.getElementById('f-month');
  if(monthSel&&m>=1&&m<=12){
    monthSel.value=MONTH_NAMES[m];
    monthSel.disabled=true;
    monthSel.style.opacity='0.7';
  }
}
function fmtDMY(dateStr){
  if(!dateStr)return '—';
  const parts=String(dateStr).split('-');
  if(parts.length!==3)return dateStr;
  const[y,m,d]=parts;
  return d+'/'+m+'/'+y;
}
function showToast(msg,type='success'){
  if(type===true)type='err';
  const t=document.getElementById('toast');
  const m=document.getElementById('toastMsg');
  const ico=t.querySelector('.toast-ico');
  const types={
    success:{cls:'',icon:'<polyline points="20,6 9,17 4,12"/>'},
    err:{cls:' err',icon:'<path d="M18 6L6 18"/><path d="M6 6l12 12"/>'},
    warn:{cls:' warn',icon:'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'},
    info:{cls:' info',icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
  };
  const cfg=types[type]||types.success;
  t.className='toast'+cfg.cls;
  m.textContent=msg;
  ico.innerHTML=cfg.icon;
  void t.offsetWidth;
  t.classList.add('show');
  if(type==='success')playSound('ok');
  if(type==='err')playSound('err');
  clearTimeout(window.__toastT);
  window.__toastT=setTimeout(()=>t.classList.remove('show'),3200);
}
function playSound(kind){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    if(!window.__actx)window.__actx=new AC();
    const ctx=window.__actx;
    const now=ctx.currentTime;
    if(kind==='ok'){
      [[660,0,.12],[880,.11,.15]].forEach(([f,t0,dur])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='sine';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
        g.gain.setValueAtTime(0,now+t0);g.gain.linearRampToValueAtTime(.18,now+t0+.02);
        g.gain.exponentialRampToValueAtTime(.001,now+t0+dur);
        o.start(now+t0);o.stop(now+t0+dur+.05);
      });
    }else if(kind==='err'){
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='triangle';o.frequency.value=220;o.connect(g);g.connect(ctx.destination);
      g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.25);
      o.start(now);o.stop(now+.3);
    }else if(kind==='warn'){
      [[520,0,.09],[520,.14,.09]].forEach(([f,t0,dur])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type='square';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
        g.gain.setValueAtTime(0,now+t0);g.gain.linearRampToValueAtTime(.08,now+t0+.01);
        g.gain.exponentialRampToValueAtTime(.001,now+t0+dur);
        o.start(now+t0);o.stop(now+t0+dur+.05);
      });
    }
  }catch(e){}
}
function showWelcomeGreeting(){
  const b=document.getElementById('welcomeBanner');
  if(!b||!session)return;
  const h=new Date().getHours();
  let greet,emoji;
  if(h>=5&&h<12){greet='صباح الخير';emoji='🌤️';}
  else if(h>=12&&h<17){greet='نهارك سعيد';emoji='☀️';}
  else if(h>=17&&h<21){greet='مساء الخير';emoji='🌇';}
  else{greet='مساء الخير';emoji='🌙';}
  document.getElementById('welcomeGreet').textContent=greet;
  document.getElementById('welcomeEmoji').textContent=emoji;
  document.getElementById('welcomeName').textContent=session.name;
  void b.offsetWidth;b.classList.add('show');
  setTimeout(()=>b.classList.remove('show'),4200);
}
function skeletonFill(containerId,rows){
  const el=document.getElementById(containerId);
  if(!el||el.children.length)return;
  let html='';
  for(let i=0;i<rows;i++){
    html+='<div class="sk-row"><div class="sk-ico skeleton"></div><div><div class="sk-line skeleton" style="margin-bottom:6px"></div><div class="sk-line short skeleton"></div></div></div>';
  }
  el.innerHTML=html;
}
function initLoginParticles(){const c=document.getElementById('loginParticles');if(c)c.replaceChildren();}
function fireConfetti(){
  const c=document.getElementById('confettiLayer');
  if(!c)return;
  const colors=['#2563eb','#22c55e','#f59e0b','#ef4444','#9333ea','#0d9488','#f43f5e'];
  let html='';
  const n=90;
  for(let i=0;i<n;i++){
    const left=(Math.random()*100).toFixed(1);
    const dur=(2+Math.random()*2.4).toFixed(1);
    const delay=(Math.random()*0.8).toFixed(1);
    const col=colors[Math.floor(Math.random()*colors.length)];
    const w=(6+Math.random()*6).toFixed(0);
    const h=(10+Math.random()*8).toFixed(0);
    const rot=(Math.random()*360).toFixed(0);
    html+=`<span class="cf" style="left:${left}%;width:${w}px;height:${h}px;background:${col};animation-duration:${dur}s;animation-delay:${delay}s;transform:rotate(${rot}deg)"></span>`;
  }
  c.innerHTML=html;
  setTimeout(()=>{c.innerHTML='';},5000);
}
function animateKPICounter(elId,target,opts){
  const el=document.getElementById(elId);
  if(!el)return;
  opts=opts||{};
  const dur=opts.duration||900;
  const suffix=opts.suffix||'';
  const prefix=opts.prefix||'';
  const decimals=opts.decimals||0;
  const from=0;
  const t0=performance.now();
  function step(now){
    const p=Math.min(1,(now-t0)/dur);
    const eased=1-Math.pow(1-p,3);
    const val=from+(target-from)*eased;
    el.textContent=prefix+val.toFixed(decimals)+suffix;
    if(p<1)requestAnimationFrame(step);
    else el.textContent=prefix+target.toFixed(decimals)+suffix;
  }
  requestAnimationFrame(step);
}
function animateKPIValues(){
  const prev=window.__prevKPI||{};
  const getNum=id=>{const el=document.getElementById(id);if(!el)return 0;const v=parseFloat((el.textContent||'0').replace(/[^\d.\-]/g,''));return isNaN(v)?0:v;};
  const total=getNum('kpi-total');
  const active=getNum('kpi-active');
  const soon=getNum('kpi-soon');
  const revTxt=document.getElementById('kpi-revenue');
  const revRaw=revTxt?(revTxt.textContent||''):'0';
  if(JSON.stringify(prev)===JSON.stringify({total,active,soon,revRaw}))return;
  window.__prevKPI={total,active,soon,revRaw};
  animateKPICounter('kpi-total',total);
  animateKPICounter('kpi-active',active);
  animateKPICounter('kpi-soon',soon);
  const revMatch=revRaw.match(/^([\d.]+)(M|K)$/);
  if(revMatch&&revTxt){
    const base=parseFloat(revMatch[1]);const unit=revMatch[2];
    animateKPICounter('kpi-revenue',base,{suffix:unit,decimals:base%1?2:0});
  }
}
function showFarewell(){
  const fs=document.getElementById('farewellScreen');
  if(!fs)return;
  document.getElementById('farewellTitle').textContent='إلى اللقاء';
  document.getElementById('farewellSub').textContent='شكراً لاستخدامك النظام';
  document.getElementById('farewellEmoji').textContent='👋';
  fs.classList.add('show');
}


/* ══════════════════════ SETTINGS & THEME ══════════════════════ */
const SK_SETTINGS='lms_settings_v1';
const DEFAULT_SETTINGS={theme:'blue',animations:true,glass:true,compact:false};
let appSettings={...DEFAULT_SETTINGS};
function loadSettings(){try{const s=localStorage.getItem(SK_SETTINGS);if(s){const p=JSON.parse(s);Object.assign(appSettings,p);}}catch(e){}}
function saveSettings(){try{localStorage.setItem(SK_SETTINGS,JSON.stringify(appSettings));}catch(e){}fbSet('settings',appSettings);}
function applySettings(){
  const html=document.documentElement;
  html.classList.remove('theme-bw','no-anim','no-glass','compact');
  if(appSettings.theme==='bw')html.classList.add('theme-bw');
  if(!appSettings.animations)html.classList.add('no-anim');
  if(!appSettings.glass)html.classList.add('no-glass');
  if(appSettings.compact)html.classList.add('compact');
  document.getElementById('theme-blue')?.classList.toggle('selected',appSettings.theme==='blue');
  document.getElementById('theme-bw')?.classList.toggle('selected',appSettings.theme==='bw');
  document.getElementById('setting-animations').checked=appSettings.animations;
  document.getElementById('setting-glass').checked=appSettings.glass;
  document.getElementById('setting-compact').checked=appSettings.compact;
}
function setTheme(t){if(!erpRequire('settings','edit'))return;
  appSettings.theme=t;saveSettings();applySettings();
  showToast('تم تغيير الثيم إلى '+(t==='bw'?'داكن':'أزرق افتراضي'));
}
function toggleAnimations(v){if(!erpRequire('settings','edit'))return;appSettings.animations=v;saveSettings();applySettings();}
function toggleGlassEffect(v){if(!erpRequire('settings','edit'))return;appSettings.glass=v;saveSettings();applySettings();}
function toggleCompactMode(v){if(!erpRequire('settings','edit'))return;appSettings.compact=v;saveSettings();applySettings();}
function resetTheme(){if(!erpRequire('settings','edit'))return;appSettings.theme='blue';appSettings.animations=true;appSettings.glass=true;appSettings.compact=false;saveSettings();applySettings();showToast('تم إعادة تعيين الثيت إلى الإعدادات الافتراضية');}
function resetAllSettings(){if(!erpRequire('settings','edit'))return;localStorage.removeItem(SK_SETTINGS);Object.assign(appSettings,DEFAULT_SETTINGS);applySettings();showToast('تم إعادة تعيين جميع الإعدادات');}


/* ══════════════════════ INIT ══════════════════════ */
function initApp(){
  // Show skeleton placeholders in the dashboard lists while data loads
  skeletonFill('recentContractsBody',6);
  skeletonFill('activityList',4);
  skeletonFill('expiryList',5);
  // Load from localStorage and render immediately
  contracts = loadContracts();
  services = loadServices();
  loadSettings();applySettings(); // load theme/settings
  renderContractTable(contracts);
  renderExpiryList();
  updateKPIs();
  initCharts();
  renderMonthBarsRep();
  renderKPISparks();
  renderRecentActivity();
  renderRecentContracts();
  refreshNotifBadge();
  renderAllReports();
  populateYearFilter();
  initServices();
  updateContractTypeCounts();
  const ucEl=document.getElementById('usersCount');if(ucEl)ucEl.textContent = users.filter(u=>u.role!=='admin').length;
  // Update settings page stats
  document.getElementById('stg-total-contracts')&&(document.getElementById('stg-total-contracts').textContent=contracts.length);
  document.getElementById('stg-total-readings')&&(document.getElementById('stg-total-readings').textContent=meterReadings.length);
  document.getElementById('stg-total-users')&&(document.getElementById('stg-total-users').textContent=users.length);
  refreshKambiyalaAlerts();
  renderKambiyalaDashCard();
}


