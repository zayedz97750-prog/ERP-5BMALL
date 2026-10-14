/* ═══ 5B Mall — Navigation ═══ */
/* ══════════════════════ TERMINATE CONTRACT ══════════════════════ */
let _termFiltered=[];
function openTerminateModal(contractId){if(!erpRequire('contracts','terminate'))return;
  _termFiltered=[...contracts].sort((a,b)=>(a.num||'').localeCompare(b.num||'',undefined,{numeric:true}));
  document.getElementById('term-search').value='';
  document.getElementById('term-end-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('term-reason').value='';
  populateTerminateContractOptions();
  document.getElementById('term-contract').value=contractId||'';
  onTerminateContractChange();
  document.getElementById('terminateModalBackdrop').classList.add('open');
}
function closeTerminateModal(){
  document.getElementById('terminateModalBackdrop').classList.remove('open');
}
function populateTerminateContractOptions(list){
  const sel=document.getElementById('term-contract');
  const cur=sel.value;
  const data=list||_termFiltered;
  sel.innerHTML='<option value="">-- اختر العقد --</option>'+data.map(c=>
    `<option value="${c.id}">${c.num} — ${c.inv||''} — ${c.brand||''}${c.status==='ended'||c.status==='cancelled'?' ('+(STATUS_CFG[c.status]?.ar||'')+')':''}</option>`
  ).join('');
  if(cur&&data.some(c=>c.id===cur))sel.value=cur;
}
function filterTerminateContracts(){
  const q=(document.getElementById('term-search').value||'').trim().toLowerCase();
  const list=!q?_termFiltered:_termFiltered.filter(c=>(c.num||'').toLowerCase().includes(q)||(c.inv||'').toLowerCase().includes(q)||(c.brand||'').toLowerCase().includes(q));
  populateTerminateContractOptions(list);
}
function onTerminateContractChange(){
  const id=document.getElementById('term-contract').value;
  const info=document.getElementById('term-contract-info');
  const c=contracts.find(x=>x.id===id);
  if(!c){info.style.display='none';info.innerHTML='';return;}
  info.style.display='block';
  info.innerHTML=`المستأجر: <b>${c.inv||'—'}</b> · العلامة: <b>${c.brand||'—'}</b> · الحالة الحالية: ${badgeH(c.status)}${c.expiry?' · تاريخ الانتهاء الحالي: '+c.expiry:''}`;
  const endDateEl=document.getElementById('term-end-date');
  if(endDateEl&&!endDateEl.value)endDateEl.value=c.expiry||new Date().toISOString().slice(0,10);
}
function saveTermination(){if(!erpRequire('contracts','terminate'))return;
  const id=document.getElementById('term-contract').value;
  const endDate=document.getElementById('term-end-date').value;
  const reason=document.getElementById('term-reason').value.trim();
  if(!id){showToast('الرجاء اختيار العقد',true);return;}
  if(!endDate){showToast('الرجاء تحديد تاريخ انتهاء العقد',true);return;}
  if(!reason){showToast('الرجاء كتابة سبب الانتهاء',true);return;}
  const idx=contracts.findIndex(c=>c.id===id);
  if(idx<0){showToast('تعذر إيجاد العقد',true);return;}
  contracts[idx].status='ended';
  contracts[idx].expiry=endDate;
  contracts[idx].terminationReason=reason;
  contracts[idx].terminationDate=endDate;
  contracts[idx].terminatedBy=session?session.name:'';
  contracts[idx].terminatedAt=Date.now();
  contracts[idx].updatedAt=Date.now();
  contracts[idx].editHistory=[...(contracts[idx].editHistory||[]),{at:Date.now(),by:String(session?.id||'')}];
  saveContractsLocal();
  updateKPIs();renderContractTable(applyFilters());renderExpiryList();
  try{updateBuildingOverview();}catch(e){}
  try{renderFloorBreakdown(document.getElementById('proc-building-overview')?.value||'');}catch(e){}
  closeTerminateModal();
  showToast('✅ تم إنهاء العقد '+(contracts[idx].num||'')+' بنجاح — تم إرجاع المساحة إلى فارغة');
}


const STATUS_CFG={active:{ar:'نشط',cls:'badge-active'},soon:{ar:'ينتهي قريباً',cls:'badge-soon'},ended:{ar:'منتهي',cls:'badge-ended'},cancelled:{ar:'ملغي',cls:'badge-cancelled'}};
const TYPE_CFG={commercial:{ar:'تجاري',cls:'type-comm'},warehouse:{ar:'مستودع',cls:'type-ware'},short:{ar:'قصير الأجل',cls:'type-short'},investment:{ar:'استثمار',cls:'type-inv'}};


function badgeH(s){const c=STATUS_CFG[s]||STATUS_CFG.active;return`<span class="badge ${c.cls}">${c.ar}</span>`;}
function typeH(t){const c=TYPE_CFG[t]||TYPE_CFG.commercial;return`<span class="type-badge ${c.cls}">${c.ar}</span>`;}


function getTotalRent(c){
  if(c.rentYears&&typeof c.rentYears==='object'){return Object.values(c.rentYears).reduce((s,v)=>s+(parseFloat(v)||0),0);}
  return c.rent2526||0;
}


/* ══════════════════════ NAVIGATION ══════════════════════ */
const PAGE_INFO={overview:{title:'لوحة التحكم',sub:'نظرة شاملة على العقود'},contracts:{title:'إدارة العقود',sub:'عرض وإدارة جميع عقود الإيجار'},
procedures:{title:'تعريف المباني',sub:'إدارة بيانات المواقع (المبنى، الطابق، المحل، المساحة)'},reports:{title:'التقارير المالية',sub:'إحصائيات وتحليلات العقود'},services:{title:'إدارة الخدمات',sub:'إدخال وعرض بيانات الخدمات (ماء - كهرباء)'},admin:{title:'إدارة المستخدمين',sub:'الموظفون وصلاحياتهم'},settings:{title:'الإعدادات',sub:'تخصيص المظهر والسلوك العام'},maintenance:{title:'إدارة الصيانة',sub:'إدخال أعمال الصيانة وعرض السجل'},kambiyala:{title:'الكمبيالات',sub:'إدارة الكمبيالات وشيكات التأمين والمستحقات'}};


let currentPageName='overview';
function showPage(name,btn){
  if(name==='reports'&&session&&!getAllowedReports(session).length){
    showToast('لا توجد تقارير مصرّح لك بالاطلاع عليها',true);
    name='overview';
  }
  currentPageName=name;
  document.getElementById('fabAddContract')?.classList.toggle('show',name==='contracts'&&hasContractPerm('add'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  const pg=document.getElementById('page-'+name);if(pg)pg.classList.add('active');
  if(btn)btn.classList.add('active');
  const info=PAGE_INFO[name]||PAGE_INFO.overview;
  document.getElementById('topbarTitle').textContent=info.title;
  document.getElementById('topbarSub').textContent=info.sub;
  if(name==='reports'){repAllTableBodyRendered=false;renderAllReports();}
  if(name==='services'){initMeterReadings();renderServicesLogTable();switchServicesTab(document.querySelector('#page-services .report-panel.active')?.id||'srv-form');}
  if(name==='procedures'){initProceduresPage();}
  if(name==='admin')renderUsers();
  if(name==='maintenance'){switchMaintTab('home');initMaintPage();}
  if(name==='kambiyala'){setTimeout(initKambiyalaPage,50);}
  // Show report action buttons only on reports page
  const isReports=(name==='reports');
  ['topbarPrintBtn','topbarExcelBtn','topbarPdfBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=isReports?'':'none';});
}


