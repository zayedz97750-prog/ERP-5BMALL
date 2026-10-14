/* ══════════════════════════════════════════════════════
   5B Mall — Users System & Permissions
   ملف: js/users.js
   ══════════════════════════════════════════════════════ */

/* ══════════════════════ USERS SYSTEM ══════════════════════ */
const ROLE_LABELS={admin:{ar:'مسؤول النظام',cls:'role-admin'},add:{ar:'موظف إدخال عقود',cls:'role-add'},audit:{ar:'موظف تدقيق',cls:'role-audit'},manage:{ar:'مدير عقود',cls:'role-manage'},custom:{ar:'صلاحيات مخصصة',cls:'role-audit'}};
const ROLE_PERMS={
  admin:{view:true,add:true,edit:true,delete:true,reports:true,export:true,services:true,srvView:true,srvAdd:true,srvEdit:true},
  add:{view:true,add:true,edit:false,delete:false,reports:false,export:false,services:true,srvView:true,srvAdd:true,srvEdit:false},
  audit:{view:true,add:false,edit:false,delete:false,reports:true,export:true,services:true,srvView:true,srvAdd:false,srvEdit:false},
  manage:{view:true,add:true,edit:true,delete:true,reports:true,export:true,services:true,srvView:true,srvAdd:true,srvEdit:true},
  custom:{view:false,add:false,edit:false,delete:false,reports:false,export:false,services:false,srvView:false,srvAdd:false,srvEdit:false}
};
const REPORT_CATALOG=[
  {id:'rep1',label:'التقرير المالي'},
  {id:'rep2',label:'العقود المنتهية'},
  {id:'rep8',label:'تنتهي قريباً'},
  {id:'rep3',label:'معدل التأجير'},
  
  {id:'rep5',label:'بيانات العملاء'},
  {id:'rep7',label:'الدفعات والتحصيل'},
  {id:'rep9',label:'تقرير المساحة الشاغرة'},
  {id:'rep-meter',label:'سعر المتر'},
  {id:'rep-water',label:'تقرير المياه'},
  {id:'rep-elec',label:'تقرير الكهرباء'},
  {id:'rep-srv',label:'تقرير الخدمات'},
  {id:'rep-tabligh',label:'كتاب تبليغ'},

];
const ALL_REPORT_IDS=REPORT_CATALOG.map(r=>r.id);
function hasPerm(key){return !!session&&(session.role==='admin'||!!(session.permissions&&session.permissions[key]));}
function getAllowedReports(u){
  if(!u)return[];
  if(u.role==='admin')return ALL_REPORT_IDS.slice();
  const perms=u.permissions||{};
  if(!perms.reports)return[];
  if(Array.isArray(perms.reportsList)){
    return perms.reportsList.filter(id=>ALL_REPORT_IDS.includes(id));
  }
  return [];
}
/* ─── Per-report selection helpers (shared by add-user & edit-perms modals) ─── */
function populateReportsGrid(containerId,selected){
  const c=document.getElementById(containerId);if(!c)return;
  c.innerHTML=REPORT_CATALOG.map(r=>`<label class="perm-check" style="padding:6px 8px"><input type="checkbox" class="rep-sel" data-rep="${r.id}" ${(selected||[]).includes(r.id)?'checked':''}/><div><div class="perm-check-label" style="font-size:14px">${r.label}</div></div></label>`).join('');
}
function getSelectedReports(containerId){
  return Array.from(document.querySelectorAll('#'+containerId+' .rep-sel')).filter(el=>el.checked).map(el=>el.dataset.rep);
}
function setSelectedReports(containerId,ids){
  document.querySelectorAll('#'+containerId+' .rep-sel').forEach(el=>{el.checked=!ids||ids.includes(el.dataset.rep);});
}
function toggleReportsBox(){
  const box=document.getElementById('u-reports-box');if(!box)return;
  const role=document.getElementById('u-role').value;
  const on=role==='custom'&&document.getElementById('p-reports').checked;
  box.style.display=on?'':'none';
  if(on&&!getSelectedReports('u-reports-list').length)setSelectedReports('u-reports-list',ALL_REPORT_IDS);
}
function toggleServicesBox(){
  const box=document.getElementById('u-services-box');if(!box)return;
  const role=document.getElementById('u-role').value;
  const on=document.getElementById('p-services').checked;
  // show granular services when custom OR when services is checked (always show like reports)
  box.style.display=on?'':'none';
  // sync legacy p-services master with sub-box view checkbox
  const viewEl=document.getElementById('p-srv-view');
  if(on && viewEl && !viewEl.checked && !document.getElementById('p-services').dataset._init){
    // default: if master checked first time, check view
    viewEl.checked=true;
  }
  if(box) box.dataset._init='1';
}
function toggleContractsBox(){
  const box=document.getElementById('u-contracts-box');if(!box)return;
  const on=document.getElementById('p-contracts').checked;
  box.style.display=on?'':'none';
}
function setContractsPerms(checked){
  ['p-contracts-view','p-contracts-add','p-contracts-edit','p-contracts-delete'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.checked=checked;
  });
}
function syncContractsGranular(){
  // kept for backward compat — no longer needed with single master
}
const AVATAR_COLORS=['#2563eb','#0d9488','#4f46e5','#d97706','#10b981','#ef4444'];


function loadUsers(){
  let arr;
  try{const s=localStorage.getItem(SK_USERS);if(s)arr=JSON.parse(s);}catch(e){}
  if(!arr||!Array.isArray(arr)) arr=[{id:'admin',username:'admin',password:'admin123',name:'مدير النظام',role:'admin',color:'#2563eb',permissions:ROLE_PERMS.admin,duty:''}];
  // migrate old permissions to include granular contracts/services like reports
  let migrated=false;
  arr.forEach(u=>{
    if(!u.permissions) u.permissions={...ROLE_PERMS[u.role]||ROLE_PERMS.add};
    if(u.permissions.srvView===undefined){
      u.permissions.srvView=!!u.permissions.services;
      u.permissions.srvAdd=!!u.permissions.services && !!u.permissions.add;
      u.permissions.srvEdit=!!u.permissions.services && !!u.permissions.edit;
      migrated=true;
    }
  });
  if(migrated) try{localStorage.setItem(SK_USERS,JSON.stringify(arr));}catch(e){}
  return arr;
}
function saveUsers(arr){try{localStorage.setItem(SK_USERS,JSON.stringify(arr));}catch(e){}fbSet('users',arr);}
function loadSession(){try{const s=localStorage.getItem(SK_SESSION);if(s)return JSON.parse(s);}catch(e){}return null;}
function saveSession(s){try{localStorage.setItem(SK_SESSION,JSON.stringify(s));}catch(e){}}


let users=loadUsers();
let session=loadSession();


