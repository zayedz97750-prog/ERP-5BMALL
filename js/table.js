/* ═══ 5B Mall — Table, Sorting & Delete ═══ */
/* ══════════════════════ SORTING ══════════════════════ */
let contractSortField=null, contractSortDir=1;
function sortContracts(field){
  if(contractSortField===field){contractSortDir=-contractSortDir;}
  else{contractSortField=field;contractSortDir=1;}
  document.querySelectorAll('#page-contracts .sort-th').forEach(th=>{
    const icon=th.querySelector('.sort-icon');
    if(th.getAttribute('data-field')===field){
      th.classList.add('sort-active');
      if(icon)icon.textContent=contractSortDir===1?'↑':'↓';
    }else{
      th.classList.remove('sort-active');
      if(icon)icon.textContent='⇅';
    }
  });
  filterContracts();
}
function compareContractsBy(field,a,b){
  if(field==='num')return (a.num||'').localeCompare((b.num||''),undefined,{numeric:true,sensitivity:'base'});
  if(field==='acct')return (a.acct||'').localeCompare((b.acct||''),undefined,{numeric:true,sensitivity:'base'});
  if(field==='start')return (a.start?new Date(a.start).getTime():0)-(b.start?new Date(b.start).getTime():0);
  if(field==='value')return getTotalRent(a)-getTotalRent(b);
  return 0;
}


/* ══════════════════════ TABLE ══════════════════════ */
function applyFilters(){
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const sf=document.getElementById('statusFilter')?.value||'';
  const tf=document.getElementById('typeFilter')?.value||'';
  const yf=document.getElementById('yearFilter')?.value||'';
  return contracts.filter(c=>{
    const mq=!q||c.inv.toLowerCase().includes(q)||c.num.toLowerCase().includes(q)||c.brand.toLowerCase().includes(q);
    if(!mq)return false;
    if(sf&&c.status!==sf)return false;
    if(tf&&c.type!==tf)return false;
    const mf=document.getElementById('contractMonthFilter')?.value;
    if(mf&&Number(String(c.start||'').slice(5,7))!==Number(mf))return false;
    if(yf){
      const year=parseInt(yf);
      const sy=c.start?new Date(c.start).getFullYear():null;
      const ey=c.expiry?new Date(c.expiry).getFullYear():sy;
      if(sy===null||year<sy)return false;
      if(ey!==null&&year>ey)return false;
    }
    return true;
  }).sort((a,b)=>{
    if(contractSortField)return contractSortDir*compareContractsBy(contractSortField,a,b);
    return (a.num||'').localeCompare((b.num||''),undefined,{numeric:true,sensitivity:'base'});
  });
}
function filterContracts(){renderContractTable(applyFilters());}


function formatTermDisplay(c){
  if(c.type!=='short')return c.term||'—';
  const t=parseFloat(c.term)||0;
  if(t<=0)return'—';
  const days=Math.round(t*365);
  const months=Math.round(t*12);
  let termStr='';
  if(days>=1&&Math.abs(days-t*365)<0.05)termStr=days+' يوم';
  else if(months>=1&&Math.abs(months-t*12)<0.05)termStr=months+' شهر';
  else termStr=c.term+' سنة';
  const cats=(c.shortCategories||[]).map(sc=>sc.label).filter(Boolean);
  return termStr+(cats.length?' · '+cats.join(' / '):'');
}


function contractLocationSummary(c){
  const locations=contractLocationsList(c);
  const label=l=>[l.building,l.floor,l.shop,l.division].filter(v=>v!==undefined&&v!==null&&String(v)!=='').join(' - ');
  const labels=locations.map(label).filter(Boolean);
  if(!labels.length&&c.locationCode)labels.push(String(c.locationCode));
  if(!labels.length)return '<span class="contract-location-empty">—</span>';
  const title=escapeHtml(labels.join('، '));
  return '<span class="contract-location-summary" title="'+title+'"><span class="contract-location-first" dir="auto">'+escapeHtml(labels[0])+'</span>'+(labels.length>1?'<span class="contract-location-more" aria-label="مواقع إضافية؛ افتح العقد لعرضها">…</span>':'')+'</span>';
}

function renderContractTable(data){
  const tbody=document.getElementById('contractTbody');
  const empty=document.getElementById('emptyState');
  if(!tbody)return;
  document.getElementById('tableCount').textContent=data.length+' عقد';
  const canDelete=hasContractPerm('delete');
  const canEdit=hasContractPerm('edit');
  const canView=hasContractPerm('view');
  if(!data.length){tbody.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  tbody.innerHTML=data.map((c,i)=>{
    const isN=c.id===newRowId;
    const totalRent=getTotalRent(c);
    const editBtn=canEdit?`<button class="btn btn-ghost btn-xs" title="تعديل" onclick="event.stopPropagation();openModal('${c.id}')"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:var(--blue);stroke-width:2;fill:none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:'';
    const delBtn=canDelete?`<button class="btn btn-ghost btn-xs" title="حذف" onclick="event.stopPropagation();confirmDel('${c.id}')" style="color:var(--red)"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>`:'';
    const pdfBtn=c.hasPdf?`<button class="pdf-btn" onclick="event.stopPropagation();openPdf('${c.id}')" title="فتح العقد PDF"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>PDF</button>`:'<span style="font-size:13px;color:var(--text-l)">—</span>';
    const imgBtn=c.hasSiteImage?`<button class="img-btn" onclick="event.stopPropagation();openSiteImage('${c.id}')" title="عرض صورة الموقع"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--teal)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg></button>`:'<span style="font-size:13px;color:var(--text-l)">—</span>';
    return`<tr class="${isN?'new-row':''}" onclick="openDetailModal('${c.id}')" style="cursor:pointer" title="اضغط لعرض التفاصيل">
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num}${isN?'<span class="badge badge-new" style="font-size:11px;padding:1px 6px;margin-right:4px">جديد</span>':''}</td>
      <td style="font-size:14px;color:var(--text-m)">${c.acct||'—'}</td>
      <td>${typeH(c.type)}</td>
      <td class="td-name" title="${c.inv}">${c.inv}</td>
      <td class="td-brand">${c.brand}</td>
      <td class="td-location">${contractLocationSummary(c)}</td>
      <td style="text-align:center;font-size:13px">${formatTermDisplay(c)}</td>
      <td style="font-size:14px">${c.start||'—'}</td>
      <td style="font-size:14px">${c.expiry||'—'}</td>
      <td class="td-rent">${totalRent.toLocaleString('en')} د.أ</td>
      <td>${badgeH(c.status)}</td>
      <td onclick="event.stopPropagation()">${imgBtn}</td>
      <td onclick="event.stopPropagation()">${pdfBtn}</td>
      <td><div class="td-actions">${editBtn}${delBtn}</div></td>
    </tr>`;
  }).join('');
}


/* ══════════════════════ DELETE ══════════════════════ */
let deleteTarget=null,deleteCallback=null;
function confirmDel(id){if(!erpRequire('contracts','delete'))return;
  deleteTarget=id;
  const c=contracts.find(x=>x.id===id);
  document.getElementById('confirmTitle').textContent='حذف العقد';
  document.getElementById('confirmMsg').textContent=`هل تريد حذف العقد "${c?c.num:''}"؟ سيُحذف نهائياً ولا يمكن استعادته.`;
  document.getElementById('confirmBtn').textContent='حذف';
  playSound('warn');
  deleteCallback=()=>{
    deleteAllAttachments(deleteTarget);
    contracts=contracts.filter(x=>x.id!==deleteTarget);
    saveContractsLocal();
    repAllTableBodyRendered = false;
    closeConfirm();
    showToast('تم حذف العقد — تم إرجاع المساحة إلى فارغة');
    updateKPIs();renderContractTable(applyFilters());renderExpiryList();
    try{updateBuildingOverview();}catch(e){}
    try{renderFloorBreakdown(document.getElementById('proc-building-overview')?.value||'');}catch(e){}
    updateContractTypeCounts();


  };
  document.getElementById('confirmBackdrop').classList.add('open');
}
document.getElementById('confirmBtn').onclick=()=>{if(deleteCallback)deleteCallback();};
function closeConfirm(){document.getElementById('confirmBackdrop').classList.remove('open');deleteTarget=null;deleteCallback=null;}
/* ══════════════════════ KPIs ══════════════════════ */
function updateKPIs(){
  const active=contracts.filter(c=>c.status==='active').length;
  const soon=contracts.filter(c=>c.status==='soon').length;
  const ended=contracts.filter(c=>c.status==='ended').length;
  const cancelled=contracts.filter(c=>c.status==='cancelled').length;
  const totalRent=contracts.reduce((s,c)=>s+getTotalRent(c),0);
  document.getElementById('kpi-total').textContent=contracts.length;
  document.getElementById('kpi-active').textContent=active;
  document.getElementById('kpi-soon').textContent=soon;
  document.getElementById('kpi-active-sub').textContent=(contracts.length?Math.round(active/contracts.length*100):0)+'% من الإجمالي';
  document.getElementById('kpi-revenue').textContent=totalRent>=1e6?(totalRent/1e6).toFixed(2)+'M':Math.round(totalRent/1000)+'K';
  document.getElementById('d-active').textContent=active;document.getElementById('d-soon').textContent=soon;
  document.getElementById('d-ended').textContent=ended;document.getElementById('d-cancelled').textContent=cancelled;
  const totalTaxAll = contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
  const totalSvcAll = contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0);
  const totalKnwAll = contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0);
  const grandAll = totalRent+totalSvcAll+totalKnwAll+totalTaxAll;
  const rr=document.getElementById('rep-rent'),rs=document.getElementById('rep-svc'),rt=document.getElementById('rep-total'),rso=document.getElementById('rep-svc-only'),rknw=document.getElementById('rep-knw'),rtax=document.getElementById('rep-tax');
  if(rr)rr.textContent=Math.round(totalRent).toLocaleString('en')+' د.أ';
  if(rs)rs.textContent=Math.round(totalSvcAll+totalKnwAll+totalTaxAll).toLocaleString('en')+' د.أ';
  if(rt)rt.textContent=Math.round(grandAll).toLocaleString('en')+' د.أ';
  if(rso)rso.textContent=Math.round(totalSvcAll).toLocaleString('en')+' د.أ';
  if(rknw)rknw.textContent=Math.round(totalKnwAll).toLocaleString('en')+' د.أ';
  if(rtax)rtax.textContent=Math.round(totalTaxAll).toLocaleString('en')+' د.أ';
  // Report badges
  document.getElementById('rep2-badge')&&(document.getElementById('rep2-badge').textContent=ended);
  document.getElementById('rep8-badge')&&(document.getElementById('rep8-badge').textContent=soon);
  document.getElementById('rep-ended-count')&&(document.getElementById('rep-ended-count').textContent=ended);
  document.getElementById('rep-soon-count')&&(document.getElementById('rep-soon-count').textContent=soon);
  document.getElementById('rep-active-count')&&(document.getElementById('rep-active-count').textContent=active);
  document.getElementById('rep-cancelled-count')&&(document.getElementById('rep-cancelled-count').textContent=cancelled);
  document.getElementById('rep8-soon-count')&&(document.getElementById('rep8-soon-count').textContent=soon);
  // Urgency breakdown for rep8
  const nowR8=new Date();
  let urg=0,mid=0,lat=0;
  contracts.filter(c=>c.status==='soon').forEach(c=>{
    if(!c.expiry)return;
    const d=Math.ceil((new Date(c.expiry)-nowR8)/86400000);
    if(d<=30)urg++;else if(d<=90)mid++;else lat++;
  });
  document.getElementById('rep8-urgent-count')&&(document.getElementById('rep8-urgent-count').textContent=urg);
  document.getElementById('rep8-mid-count')&&(document.getElementById('rep8-mid-count').textContent=mid);
  document.getElementById('rep8-later-count')&&(document.getElementById('rep8-later-count').textContent=lat);
  if(statusChart){statusChart.data.datasets[0].data=[active,soon,ended,cancelled];statusChart.update();}
  renderOverviewCharts();
  renderKPISparks();
  animateKPIValues();
  renderRecentActivity();
  renderRecentContracts();
  refreshNotifBadge();
}


