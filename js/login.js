/* ══════════════════════════════════════════════════════
   5B Mall — Login & Auth
   ملف: js/login.js
   ══════════════════════════════════════════════════════ */

/* ══════════════════════ LOGIN ══════════════════════ */
async function doLogin(){
  const u=document.getElementById('loginUser').value.trim();
  const p=document.getElementById('loginPass').value;
  const err=document.getElementById('loginErr');
  if(!u||!p){err.textContent='الرجاء إدخال اسم المستخدم وكلمة المرور';err.classList.add('show');return;}
  const btn=document.getElementById('loginBtn');
  if(btn){btn.disabled=true;btn.dataset.origText=btn.dataset.origText||btn.textContent;btn.classList.add('loading');btn.textContent='جاري التحقق...';}
  // Always pull the latest user list from Firebase first, so a user added
  // on another device can log in immediately without waiting for the
  // background sync/live-listener to catch up.
  try{
    const remoteUsers=await fbGetAll('users');
    if(remoteUsers){
      try{localStorage.setItem(SK_USERS,JSON.stringify(remoteUsers));}catch(e){}
      users=loadUsers();
    }
  }catch(e){/* offline or blocked — fall back to local cache */}
  if(btn){btn.disabled=false;btn.classList.remove('loading');btn.textContent=btn.dataset.origText;}
  const user=users.find(x=>x.username===u&&x.password===p);
  if(!user){err.textContent='اسم المستخدم أو كلمة المرور غير صحيحة';err.classList.add('show');document.getElementById('loginPass').value='';return;}
  err.classList.remove('show');
  session={id:user.id,username:user.username,name:user.name,role:user.role,color:user.color,permissions:user.permissions};
  saveSession(session);bootApp();
}
document.getElementById('loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('loginUser').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginPass').focus();});


function doLogout(){
  const fab=document.getElementById('fabAddContract');
  if(fab)fab.classList.remove('show');
  showFarewell();
  setTimeout(()=>{
    const fs=document.getElementById('farewellScreen');
    if(fs)fs.classList.remove('show');
    session=null;try{localStorage.removeItem(SK_SESSION);}catch(e){}
    document.getElementById('appShell').classList.remove('visible');
    document.getElementById('loginScreen').style.display='flex';
    document.getElementById('loginUser').value='';document.getElementById('loginPass').value='';
    initLoginParticles();
  },1300);
}


async function bootApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appShell').classList.add('visible');




  const topAv=document.getElementById('topbarAvatar');
  if(topAv){topAv.textContent=session.name.charAt(0);topAv.title=session.name;}
  const amn=document.getElementById('avatarMenuName');
  const amr=document.getElementById('avatarMenuRole');
  const ama=document.getElementById('avatarMenuAvatar');
  if(amn)amn.textContent=session.name;
  if(amr)amr.textContent=ROLE_LABELS[session.role]?.ar||session.role;
  if(ama){ama.textContent=session.name.charAt(0);ama.style.background=session.color||'#2563eb';}
  renderFavReports();
  updateFavStars();
  const heroSub=document.getElementById('dashHeroSub');
  if(heroSub)heroSub.textContent='مرحباً '+session.name+'، هذه نظرة شاملة على عقودك، إيراداتك، والمستحقات القادمة.';
  const isAdmin=session.role==='admin';
  const navAdminEl=document.getElementById('nav-admin');if(navAdminEl)navAdminEl.style.display=isAdmin?'flex':'none';
  const navProcEl=document.getElementById('nav-procedures');if(navProcEl)navProcEl.style.display=isAdmin?'flex':'none';
  const navTermEl=document.getElementById('nav-terminate');if(navTermEl)navTermEl.style.display=isAdmin?'flex':'none';
  const navSecAdminEl=document.getElementById('nav-section-admin');if(navSecAdminEl)navSecAdminEl.style.display=isAdmin?'block':'none';
  const adminSettingsSec=document.getElementById('settings-admin-section');
  if(adminSettingsSec)adminSettingsSec.style.display=isAdmin?'block':'none';
  applyPermUI(); initApp(); renderDutyBanner();
  showWelcomeGreeting();
  // Open sidebar after login
  const sidebar=document.querySelector('.sidebar');
  const main=document.querySelector('.main');
  const btn=document.getElementById('hamburgerBtn');
  const overlay=document.getElementById('sidebarOverlay');
  if(sidebar&&sidebar.classList.contains('collapsed')){
    sidebar.classList.remove('collapsed');
    if(btn) btn.classList.add('open');
    if(main) main.style.marginRight='var(--sidebar-w)';
    if(overlay){overlay.style.display='none';overlay.classList.remove('show');}
  }
}
function hasContractPerm(action){
  if(!session) return false;
  if(session.role==='admin') return true;
  const p=session.permissions||{};
  if(action==='view') return !!p.view;
  if(action==='add') return !!p.add;
  if(action==='edit') return !!p.edit;
  if(action==='delete') return !!p.delete;
  if(action==='export') return !!p.export;
  return false;
}
function hasServicePerm(action){
  if(!session) return false;
  if(session.role==='admin') return true;
  const p=session.permissions||{};
  if(action==='view') return !!(p.srvView||p.services);
  if(action==='add') return !!p.srvAdd || (!!p.services && !!p.add);
  if(action==='edit') return !!p.srvEdit || (!!p.services && !!p.edit);
  return false;
}
function applyPermUI(){
  const canAdd=hasContractPerm('add');
  const canView=hasContractPerm('view');
  const addBtn=document.getElementById('nav-addContract');
  if(addBtn)addBtn.style.display=canAdd?'':'none';
  const fab=document.getElementById('fabAddContract');
  if(fab)fab.classList.toggle('show',!!canAdd&&currentPageName==='contracts');
  const contractsNav=document.getElementById('nav-contracts');
  if(contractsNav) contractsNav.style.display=canView?'':'none';
  const canViewServices=hasServicePerm('view');
  const servicesNav=document.getElementById('nav-services');
  if(servicesNav) servicesNav.style.display=canViewServices?'':'none';
  // Update contracts table action buttons visibility will be handled in renderContractTable
  // Update services form buttons
  const srvFormAddBtn=document.querySelector('#srv-form .btn-primary');
  if(srvFormAddBtn) srvFormAddBtn.style.display=hasServicePerm('add')?'':'none';
  applyReportsVisibility();
}
/* Hide report entries the current user is not allowed to see */
function applyReportsVisibility(){
  const allowed=session?getAllowedReports(session):[];
  document.querySelectorAll('#reports-dropdown .nd-row').forEach(row=>{
    const star=row.querySelector('.fav-star');
    const id=star?star.getAttribute('data-fav'):null;
    row.style.display=(id&&allowed.includes(id))?'':'none';
  });
  const navRep=document.getElementById('nav-reports');
  if(navRep)navRep.style.display=allowed.length?'':'none';
}


