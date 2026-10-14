/* ═══ 5B Mall — Admin: Users Management ═══ */
/* ══════════════════════ USERS ══════════════════════ */
function openUserModal(){document.getElementById('u-name').value='';document.getElementById('u-user').value='';document.getElementById('u-pass').value='';document.getElementById('u-role').value='add';populateReportsGrid('u-reports-list',ALL_REPORT_IDS);document.getElementById('u-reports-box').style.display='none';updatePermCheckboxes();document.getElementById('userModalBackdrop').classList.add('open');}
function closeUserModal(){document.getElementById('userModalBackdrop').classList.remove('open');}
function updatePermCheckboxes(){
  const role=document.getElementById('u-role').value;
  const perms=ROLE_PERMS[role]||ROLE_PERMS.add;
  // masters: العقود / التقارير / الخدمات / التصدير
  const hasContracts = !!(perms.view||perms.add||perms.edit||perms.delete);
  const masters={ 'p-contracts': hasContracts, 'p-reports': !!perms.reports, 'p-services': !!perms.services, 'p-export': !!perms.export };
  Object.keys(masters).forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.checked=masters[id]; el.disabled=role!=='custom'; }
  });
  const box=document.getElementById('u-reports-box');
  if(box)box.style.display=(role==='custom'&&masters['p-reports'])?'':'none';
  // Contracts granular — مثل التقارير: كبسة العقود تظهر القائمة
  const cBox=document.getElementById('u-contracts-box');
  if(cBox){
    const on = document.getElementById('p-contracts')?.checked||false;
    cBox.style.display=(role==='custom'&&on)?'':'none';
    ['view','add','edit','delete'].forEach(k=>{
      const el=document.getElementById('p-contracts-'+k);
      if(el){ el.checked=perms[k]||false; el.disabled=role!=='custom'; }
    });
  }
  const sBox=document.getElementById('u-services-box');
  if(sBox){
    const on=document.getElementById('p-services')?.checked||false;
    sBox.style.display=(role==='custom'&&on)?'':'none';
    ['view','add','edit'].forEach(k=>{
      const el=document.getElementById('p-srv-'+k);
      const key=k==='view'?'srvView':k==='add'?'srvAdd':'srvEdit';
      if(el){ el.checked=perms[key]||false; el.disabled=role!=='custom'; }
    });
  }
}
async function saveUser(){
  const name=document.getElementById('u-name').value.trim(),uname=document.getElementById('u-user').value.trim(),pass=document.getElementById('u-pass').value,role=document.getElementById('u-role').value;
  if(!name||!uname||!pass){showToast('الرجاء ملء جميع الحقول',true);return;}
  if(users.find(u=>u.username===uname)){showToast('اسم المستخدم موجود مسبقاً',true);return;}
  const perms={};
  // masters: العقود / التقارير / الخدمات — مثل التقارير تماماً
  const mContracts=document.getElementById('p-contracts')?.checked||false;
  const mReports=document.getElementById('p-reports')?.checked||false;
  const mServices=document.getElementById('p-services')?.checked||false;
  const mExport=document.getElementById('p-export')?.checked||false;
  perms.reports=mReports; perms.services=mServices; perms.export=mExport;
  // Contracts granular — كبسة العقود تظهر هذه القائمة (مثل التقارير)
  if(role==='custom' && mContracts){
    ['view','add','edit','delete'].forEach(k=>{
      const el=document.getElementById('p-contracts-'+k);
      perms[k]=el?el.checked:false;
    });
  } else if(role==='custom' && !mContracts){
    perms.view=false; perms.add=false; perms.edit=false; perms.delete=false;
  } else {
    const rp=ROLE_PERMS[role]||{};
    perms.view=!!rp.view; perms.add=!!rp.add; perms.edit=!!rp.edit; perms.delete=!!rp.delete;
  }
  // Services granular — كبسة الخدمات تظهر القائمة
  if(role==='custom' && mServices){
    perms.srvView=document.getElementById('p-srv-view')?.checked||false;
    perms.srvAdd=document.getElementById('p-srv-add')?.checked||false;
    perms.srvEdit=document.getElementById('p-srv-edit')?.checked||false;
    perms.services=perms.srvView;
  } else if(role==='custom' && !mServices){
    perms.srvView=false; perms.srvAdd=false; perms.srvEdit=false; perms.services=false;
  } else {
    const rp=ROLE_PERMS[role]||{};
    perms.srvView=!!rp.srvView; perms.srvAdd=!!rp.srvAdd; perms.srvEdit=!!rp.srvEdit; perms.services=!!rp.services;
  }
  if(perms.reports){
    perms.reportsList=role==='custom'?getSelectedReports('u-reports-list'):ALL_REPORT_IDS.slice();
    if(role==='custom'&&!perms.reportsList.length){showToast('اختر تقريباً واحداً على الأقل من قائمة التقارير',true);return;}
  }else{
    perms.reportsList=[];
  }
  const color=AVATAR_COLORS[users.length%AVATAR_COLORS.length];
  const newUser={id:'u_'+Date.now(),username:uname,password:pass,name,role,color,permissions:perms,duty:''};
  users.push(newUser);saveUsers(users);closeUserModal();
  showToast(`تم إضافة الموظف ${name} ✓`);
  const ucEl=document.getElementById('usersCount');if(ucEl)ucEl.textContent=users.filter(u=>u.role!=='admin').length;
  renderUsers();
}
function escapeHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderUsers(){
  const el=document.getElementById('usersList');if(!el)return;
  const isSessionAdmin=erpCan('admin','view');
  el.innerHTML=users.map(u=>{
    const rl=ROLE_LABELS[u.role]||ROLE_LABELS.add;
    const isAdmin=u.role==='admin';
    const credRow=isSessionAdmin?`<div style="margin-top:8px;font-size:14px;color:var(--text-m);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span>🔑</span><span>${escapeHtml(u.username)}</span><span>/</span>
        <span id="pass-mask-${u.id}">••••••••</span>
        <span id="pass-real-${u.id}" style="display:none;direction:ltr">${escapeHtml(u.password)}</span>
        <button type="button" class="btn btn-ghost btn-xs" onclick="togglePasswordVisibility('${u.id}')" title="إظهار/إخفاء كلمة المرور">👁 عرض</button>
      </div>`:'';
    const dutyRow=u.duty?`<div style="margin-top:6px;font-size:14px;background:var(--amber-l);color:#92400e;padding:4px 8px;border-radius:6px;display:inline-block">📌 مهمة اليوم: ${escapeHtml(u.duty)}</div>`:'';
    const actions=isSessionAdmin?`<div class="uc-actions" style="flex:0 0 100%;margin-top:10px;justify-content:flex-end">
        <button class="btn btn-ghost btn-xs" onclick="openCredModal('${u.id}')" title="تعديل اسم المستخدم وكلمة المرور">✏️ بيانات الدخول</button>
        ${!isAdmin?`<button class="btn btn-ghost btn-xs" onclick="openPermModal('${u.id}')" title="تعديل الدور والصلاحيات والتقارير">🛡️ الصلاحيات</button>`:''}
        ${!isAdmin?`<button class="btn btn-ghost btn-xs" onclick="openDutyModal('${u.id}')" title="تحديد وظيفة اليوم">📌 تحديد وظيفة</button>`:''}
        ${!isAdmin?`<button class="btn btn-ghost btn-xs" onclick="confirmDelUser('${u.id}','${u.name}')" style="color:var(--red)"><svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>حذف</button>`:''}
      </div>`:'';
    return `<div class="user-card" style="align-items:flex-start;flex-wrap:wrap">
        <div class="ua" style="background:${u.color||'#2563eb'}">${u.name.charAt(0)}</div>
        <div style="flex:1;min-width:160px">
          <div class="uc-name">${escapeHtml(u.name)}</div>
          <div class="uc-user">@${escapeHtml(u.username)}</div>
          <span class="uc-role ${rl.cls}">${rl.ar}</span>
          ${credRow}
          ${dutyRow}
        </div>
        ${isAdmin&&!isSessionAdmin?'<span style="font-size:13px;color:var(--text-l)">حساب النظام</span>':''}
        ${actions}
      </div>`;
  }).join('');
}
function togglePasswordVisibility(id){if(!erpRequire('admin','edit'))return;
  const mask=document.getElementById('pass-mask-'+id);
  const real=document.getElementById('pass-real-'+id);
  if(!mask||!real)return;
  const showing=real.style.display!=='none';
  mask.style.display=showing?'':'none';
  real.style.display=showing?'none':'';
}
/* ══ Edit login credentials (username/password) ══ */
let credTargetId=null;function openCredModal(id){if(!erpRequire('admin','edit'))return;
  const u=users.find(x=>x.id===id);if(!u)return;
  credTargetId=id;
  document.getElementById('cred-name').textContent=u.name;
  document.getElementById('cred-user').value=u.username;
  document.getElementById('cred-pass').value=u.password;
  document.getElementById('credModalBackdrop').classList.add('open');
}
function closeCredModal(){document.getElementById('credModalBackdrop').classList.remove('open');credTargetId=null;}
function saveCred(){if(!erpRequire('admin','edit'))return;
  if(!credTargetId)return;
  const uname=document.getElementById('cred-user').value.trim();
  const pass=document.getElementById('cred-pass').value;
  if(!uname||!pass){showToast('الرجاء إدخال اسم المستخدم وكلمة المرور',true);return;}
  if(users.find(x=>x.username===uname&&x.id!==credTargetId)){showToast('اسم المستخدم موجود مسبقاً',true);return;}
  const u=users.find(x=>x.id===credTargetId);if(!u)return;
  u.username=uname;u.password=pass;
  saveUsers(users);
  if(session&&session.id===u.id){session.username=uname;saveSession(session);}
  closeCredModal();
  showToast('تم تحديث بيانات الدخول ✓');
  renderUsers();
}
/* ══ Edit employee permissions (role + perms + allowed reports) ══ */
let permTargetId=null;
function openPermModal(id){
  const u=users.find(x=>x.id===id);if(!u)return;
  permTargetId=id;
  document.getElementById('perm-name').textContent=u.name;
  document.getElementById('m-role').value=(u.role&&u.role!=='admin')?u.role:'custom';
  const p=u.permissions||{};
  // masters: العقود / التقارير / الخدمات
  const hasContracts=!!(p.view||p.add||p.edit||p.delete);
  const mContracts=document.getElementById('m-contracts'); if(mContracts) mContracts.checked=hasContracts;
  const mReports=document.getElementById('m-reports'); if(mReports) mReports.checked=!!p.reports;
  const mServices=document.getElementById('m-services'); if(mServices) mServices.checked=!!p.services;
  const mExport=document.getElementById('m-export'); if(mExport) mExport.checked=!!p.export;
  // Contracts granular — مثل التقارير: كبسة العقود تظهر هذه القائمة
  ['view','add','edit','delete'].forEach(k=>{
    const el=document.getElementById('m-contracts-'+k);
    if(el) el.checked=!!p[k];
  });
  // Services granular
  const srvViewEl=document.getElementById('m-srv-view');
  const srvAddEl=document.getElementById('m-srv-add');
  const srvEditEl=document.getElementById('m-srv-edit');
  if(srvViewEl) srvViewEl.checked=!!(p.srvView||p.services);
  if(srvAddEl) srvAddEl.checked=!!p.srvAdd;
  if(srvEditEl) srvEditEl.checked=!!p.srvEdit;
  populateReportsGrid('m-reports-list',Array.isArray(p.reportsList)?p.reportsList:ALL_REPORT_IDS);
  updatePermModalUI();
  document.getElementById('permModalBackdrop').classList.add('open');
}
function updatePermModalUI(){
  const role=document.getElementById('m-role')?.value||'custom';
  const isCustom=role==='custom';
  const rBox=document.getElementById('m-reports-box');
  const cBox=document.getElementById('m-contracts-box');
  const sBox=document.getElementById('m-services-box');
  if(rBox){
    const on=document.getElementById('m-reports')?.checked||false;
    rBox.style.display=on?'':'none';
    if(on&&!getSelectedReports('m-reports-list').length)setSelectedReports('m-reports-list',ALL_REPORT_IDS);
  }
  if(cBox){
    const on=document.getElementById('m-contracts')?.checked||false;
    cBox.style.display=on?'':'none';
    ['m-contracts-view','m-contracts-add','m-contracts-edit','m-contracts-delete'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.disabled=!isCustom;
    });
  }
  if(sBox){
    const on=document.getElementById('m-services')?.checked||false;
    sBox.style.display=on?'':'none';
    ['m-srv-view','m-srv-add','m-srv-edit'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.disabled=!isCustom;
    });
  }
  // disable masters when not custom
  ['m-contracts','m-reports','m-services','m-export'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.disabled=!isCustom;
  });
}
function setContractsPermsEdit(checked){
  ['m-contracts-view','m-contracts-add','m-contracts-edit','m-contracts-delete'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.checked=checked;
  });
}
function closePermModal(){document.getElementById('permModalBackdrop').classList.remove('open');permTargetId=null;}
function savePerm(){
  if(!permTargetId)return;
  const u=users.find(x=>x.id===permTargetId);if(!u)return;
  const role=document.getElementById('m-role').value;
  const perms={};
  // masters
  const mContracts=document.getElementById('m-contracts')?.checked||false;
  const mReports=document.getElementById('m-reports')?.checked||false;
  const mServices=document.getElementById('m-services')?.checked||false;
  const mExport=document.getElementById('m-export')?.checked||false;
  perms.reports=mReports; perms.services=mServices; perms.export=mExport;
  // Contracts granular — مثل التقارير: إذا كبسة العقود غير مفعلة، كل صلاحيات العقود false
  if(mContracts){
    ['view','add','edit','delete'].forEach(k=>{
      const el=document.getElementById('m-contracts-'+k);
      perms[k]=el?el.checked:false;
    });
  } else {
    perms.view=false; perms.add=false; perms.edit=false; perms.delete=false;
  }
  // Services granular — كبسة الخدمات تظهر القائمة
  if(mServices){
    perms.srvView=document.getElementById('m-srv-view')?.checked||false;
    perms.srvAdd=document.getElementById('m-srv-add')?.checked||false;
    perms.srvEdit=document.getElementById('m-srv-edit')?.checked||false;
    perms.services=perms.srvView;
  } else {
    perms.srvView=false; perms.srvAdd=false; perms.srvEdit=false; perms.services=false;
  }
  if(perms.reports){
    perms.reportsList=role==='custom'?getSelectedReports('m-reports-list'):ALL_REPORT_IDS.slice();
    if(role==='custom'&&!perms.reportsList.length){showToast('اختر تقريباً واحداً على الأقل من قائمة التقارير',true);return;}
  }else{
    perms.reportsList=[];
  }
  u.role=role;u.permissions=perms;
  saveUsers(users);
  if(session&&session.id===u.id){session.role=role;session.permissions=perms;saveSession(session);applyPermUI();}
  closePermModal();
  showToast('تم تحديث الصلاحيات ✓');
  renderUsers();
}
/* ══ Assign today's duty/task to an employee ══ */
let dutyTargetId=null;
function openDutyModal(id){if(!erpRequire('admin','tasks'))return;
  const u=users.find(x=>x.id===id);if(!u)return;
  dutyTargetId=id;
  document.getElementById('duty-name').textContent=u.name;
  document.getElementById('duty-text').value=u.duty||'';
  document.getElementById('dutyModalBackdrop').classList.add('open');
}
function closeDutyModal(){document.getElementById('dutyModalBackdrop').classList.remove('open');dutyTargetId=null;}
function saveDuty(){if(!erpRequire('admin','tasks'))return;
  if(!dutyTargetId)return;
  const u=users.find(x=>x.id===dutyTargetId);if(!u)return;
  u.duty=document.getElementById('duty-text').value.trim();
  saveUsers(users);
  closeDutyModal();
  showToast('تم تحديد وظيفة اليوم ✓');
  renderUsers();
  renderDutyBanner();
}
/* ══ Show the logged-in user's assigned duty across the main app ══ */
function renderDutyBanner(){
  const banner=document.getElementById('dutyBanner');if(!banner||!session)return;
  const me=users.find(u=>u.id===session.id);
  const duty=me?me.duty:'';
  if(duty){
    banner.style.display='flex';
    document.getElementById('dutyBannerText').textContent=duty;
  }else{
    banner.style.display='none';
  }
}
function confirmDelUser(id,name){if(!erpRequire('admin','delete'))return;
  deleteTarget=id;document.getElementById('confirmTitle').textContent='حذف الموظف';document.getElementById('confirmMsg').textContent=`هل تريد حذف الموظف "${name}"؟ سيُحذف نهائياً ولا يمكن استعادته.`;document.getElementById('confirmBtn').textContent='حذف';playSound('warn');
  deleteCallback=()=>{users=users.filter(u=>u.id!==id);saveUsers(users);closeConfirm();showToast(`تم حذف الموظف ${name}`);const ucEl=document.getElementById('usersCount');if(ucEl)ucEl.textContent=users.filter(u=>u.role!=='admin').length;renderUsers();};
  document.getElementById('confirmBackdrop').classList.add('open');
}


