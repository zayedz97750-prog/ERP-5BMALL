/* ═══ 5B Mall — Filters, Year Filter & Sidebar ═══ */
/* ══════════════════════ YEAR FILTER ══════════════════════ */
function populateYearFilter(){
  const sel=document.getElementById('yearFilter');if(!sel)return;
  sel.innerHTML='<option value="">كل السنوات</option>';
  const years=new Set(); 
  contracts.forEach(c=>{
    if(c.start){
      const sy=new Date(c.start).getFullYear();
      const ey=c.expiry?new Date(c.expiry).getFullYear():sy+Math.ceil(c.term||1);
      for(let y=sy;y<=ey;y++)years.add(y);
    }
  });
  const cur=new Date().getFullYear();
  years.add(cur);years.add(cur+1);years.add(cur+2);
  [...years].sort((a,b)=>a-b).forEach(y=>{
    const opt=document.createElement('option');
    opt.value=y.toString();opt.textContent=y;sel.appendChild(opt);
  });
}


function toggleDropdown(id,btn){
  var dd=document.getElementById(id);var open=dd.classList.contains('open');
  closeAllDropdowns();if(!open){dd.classList.add('open');if(btn)btn.classList.add('active');}
}
function closeAllDropdowns(){
  document.querySelectorAll('.nav-dropdown.open').forEach(function(e){e.classList.remove('open');});
  document.querySelectorAll('.nav-item.has-dropdown.active').forEach(function(e){e.classList.remove('active');});
}


/* ══════════════════════ HAMBURGER SIDEBAR ══════════════════════ */
function toggleSidebar(){
  const sidebar=document.querySelector('.sidebar');
  const overlay=document.getElementById('sidebarOverlay');
  const btn=document.getElementById('hamburgerBtn');
  const main=document.querySelector('.main');
  const collapsed=sidebar.classList.toggle('collapsed');
  btn.classList.toggle('open',!collapsed);
  if(collapsed){
    overlay.classList.remove('show');
    main.style.marginRight='0';
    setTimeout(()=>{if(overlay.classList.contains('show')){}else{overlay.style.display='none';}},300);
  }else{
    overlay.style.display='block';
    requestAnimationFrame(()=>overlay.classList.add('show'));
    main.style.marginRight='var(--sidebar-w)';
  }
}
function initSidebar(){
  const sidebar=document.querySelector('.sidebar');
  const main=document.querySelector('.main');
  const btn=document.getElementById('hamburgerBtn');
  // Start collapsed on load
  sidebar.classList.add('collapsed');
  main.style.marginRight='0';
  if(btn) btn.classList.remove('open');
}


window.addEventListener('DOMContentLoaded',()=>{
  fbSyncPromise=syncAllFromFirebase();
  startFirebaseLiveSync();
  initSidebar();
  initLoginParticles();
  if(session){bootApp();}
  document.getElementById('loginUser').focus();
});


