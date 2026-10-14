/* ═══ 5B Mall — KPIs, Charts & Dashboard ═══ */
/* ══════════════════════ EXPIRY LIST ══════════════════════ */
function renderExpiryList(){
  const list=document.getElementById('expiryList');if(!list)return;
  const soon=contracts.filter(c=>c.status==='soon').slice(0,6);
  list.innerHTML=soon.length?soon.map(c=>`<div class="expiry-item"><div><div class="expiry-name">${c.num}</div><div class="expiry-brand">${c.inv} · ${c.brand}</div></div><div class="expiry-date">${c.expiry||'—'}</div></div>`).join(''):'<p style="font-size:15px;color:var(--text-m);text-align:center;padding:20px">لا توجد عقود تنتهي قريباً</p>';
}


/* ══════════════════════ CHARTS ══════════════════════ */
let monthlyChart,statusChart,topTenantsChart;
const MD={labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],values:[478,58,395,121,178,96,243,48,23,245,36,0]};
function initCharts(){
  const mc=document.getElementById('monthlyChart');
  if(mc){
    const existing=Chart.getChart(mc);if(existing)existing.destroy();
    if(monthlyChart){try{monthlyChart.destroy();}catch(e){}}
    monthlyChart=new Chart(mc,{type:'bar',data:{labels:MD.labels,datasets:[{data:MD.values,backgroundColor:'#2563eb',borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>v+'K',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}});
  }
  const sc=document.getElementById('statusChart');
  const a=contracts.filter(c=>c.status==='active').length,s=contracts.filter(c=>c.status==='soon').length,e=contracts.filter(c=>c.status==='ended').length,ca=contracts.filter(c=>c.status==='cancelled').length;
  if(sc){
    const existing=Chart.getChart(sc);if(existing)existing.destroy();
    if(statusChart){try{statusChart.destroy();}catch(e){}}
    statusChart=new Chart(sc,{type:'doughnut',data:{labels:['نشط','ينتهي','منتهي','ملغي'],datasets:[{data:[a,s,e,ca],backgroundColor:['#2563eb','#d97706','#94a3b8','#dc2626'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false}}}});
  }
  const top8=[...contracts].filter(c=>c.status!=='cancelled').sort((a,b)=>getTotalRent(b)-getTotalRent(a)).slice(0,8);
  const tc=document.getElementById('topTenantsChart');
  if(tc){
    const existing=Chart.getChart(tc);if(existing)existing.destroy();
    if(topTenantsChart){try{topTenantsChart.destroy();}catch(e){}}
    topTenantsChart=new Chart(tc,{type:'bar',data:{labels:top8.map(c=>c.brand.length>13?c.brand.slice(0,13)+'…':c.brand),datasets:[{data:top8.map(c=>getTotalRent(c)),backgroundColor:'#2563eb',borderRadius:4,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{callback:v=>(v/1000)+'K',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}},y:{ticks:{font:{size:10}},grid:{display:false}}}}});
  }
}
function renderMonthBarsRep(){const el=document.getElementById('monthBarsRep');if(!el)return;const max=Math.max(...MD.values);el.innerHTML=MD.labels.map((m,i)=>`<div class="month-row"><span class="month-name">${m}</span><div class="month-track"><div class="month-fill" style="width:${Math.round((MD.values[i]/max)*100)}%"></div></div><span class="month-amt">${MD.values[i]}K</span></div>`).join('');}


/* ══════════════════════ REPORT TABS ══════════════════════ */
let activeReportTabId='rep1';
function switchReportTab(tabId){
  if(session&&!getAllowedReports(session).includes(tabId)){showToast('ليست لديك صلاحية لعرض هذا التقرير',true);return;}
  activeReportTabId=tabId;
  document.querySelectorAll('#page-reports .report-panel').forEach(p=>p.classList.remove('active'));
  const panel=document.getElementById(tabId);
  if(panel){panel.classList.add('active');renderReportTab(tabId);}
}


/* ══════════════════════ PRINT CURRENT PAGE ══════════════════════ */
function stripEmojiAndIcons(html){
  html=html.replace(/<svg[\s\S]*?<\/svg>/gi,'');
  html=html.replace(/<img[^>]*>/gi,'');
  html=html.replace(/<canvas[\s\S]*?<\/canvas>/gi,'');
  html=html.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,'');
  return html;
}
function printCurrentPage(){if(!erpRequire(currentPageName,'print'))return;
  if(currentPageName!=='reports'){window.print();return;}
  const panel=document.getElementById(activeReportTabId);
  if(!panel)return;
  const rawTitle=activeReportTabId==='rep-meter'?'سعر المتر':document.getElementById('topbarTitle').textContent||'تقرير';
  const title=rawTitle.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,'').trim();
  const content=stripEmojiAndIcons(panel.innerHTML);
  const win=window.open('','_blank','width=1000,height=700');
  const css='*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#fff;color:#0f172a;font-size:15px;direction:rtl;padding:20px}h2{font-size:20px;font-weight:800;margin-bottom:16px;color:#1e3a8a;border-bottom:2px solid #2563eb;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#1e3a8a;color:#fff;padding:8px 10px;font-size:14px;text-align:right}td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:14px}tr:nth-child(even){background:#f8fafc}.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}.kpi-card{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px}.kpi-label{font-size:13px;color:#64748b;margin-bottom:4px}.kpi-value{font-size:20px;font-weight:800;color:#1e3a8a}.card{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px}.card-header{background:#f8fafc;padding:10px 14px;border-bottom:1px solid #e2e8f0}.card-title{font-size:16px;font-weight:700;color:#0f172a}svg,img,canvas,.btn,.btn-sm,.btn-primary,.btn-outline,.btn-danger,.btn-success,.btn-purple,.table-toolbar,.report-tabs,.no-print,.fsel,.kpi-icon{display:none!important}@media print{body{padding:10px}@page{margin:15mm;size:A4 landscape}}';
  const doc=win.document;
  doc.open();
  doc.write('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>');
  doc.write('\u0637\u0628\u0627\u0639\u0629 - '+title);
  doc.write('</title><style>'+css+'</style></head><body><h2>'+title+'</h2>'+content+'</body></html>');
  doc.close();
  win.addEventListener('load',function(){
    win.document.querySelectorAll('button,select,input,svg,img,canvas').forEach(function(el){el.style.display='none';});
    setTimeout(function(){win.print();},350);
  });
}
function renderReportTab(tabId){
  if(tabId==='rep1'){repAllTableBodyRendered=false;renderFinancialReport();}
  else if(tabId==='rep2')renderEndedReport();
  else if(tabId==='rep3')renderYearlyAnalysis();
  else if(tabId==='rep5')renderPartiesList();
  else if(tabId==='rep7')renderPaymentReport();
  else if(tabId==='rep8')renderSoonReport();
  else if(tabId==='rep9')renderAreaReport();
  else if(tabId==='rep-meter')window.renderMeterPriceReport();
  else if(tabId==='rep-water')renderMeterConsumptionReport('water');
  else if(tabId==='rep-elec')renderMeterConsumptionReport('electricity');
  else if(tabId==='rep-srv')renderServicesReport();
  else if(tabId==='rep-tabligh')renderTablighReport();

}
function renderAllReports(){
  renderFinancialReport();
  renderEndedReport();
  renderSoonReport();
  renderYearlyAnalysis();
  renderPartiesList();
  renderPaymentReport();
  renderAreaReport();
  renderMeterConsumptionReport('water');
  renderMeterConsumptionReport('electricity');
  renderServicesReport();
  renderTablighReport();

}


/* ═══ Report: كتاب تبليغ ═══ */
function populateTablighYearFilter(){
  const sel=document.getElementById('tabligh-year-filter');
  if(!sel||sel.options.length>1)return;
  const years=new Set();
  contracts.forEach(c=>{
    if(c.rentYears&&typeof c.rentYears==='object'){
      Object.keys(c.rentYears).forEach(y=>years.add(y));
    }else{
      if(c.start)years.add(String(new Date(c.start).getFullYear()));
      if(c.expiry)years.add(String(new Date(c.expiry).getFullYear()));
    }
  });
  const cur=new Date().getFullYear();
  [cur-1,cur,cur+1].forEach(y=>years.add(String(y)));
  [...years].sort((a,b)=>parseInt(b)-parseInt(a)).forEach(y=>{
    const o=document.createElement('option');
    o.value=y;o.textContent=y;
    sel.appendChild(o);
  });
  // Default to current year
  sel.value=String(cur);
}


function getRentForYear(c, year){
  if(!year)return getTotalRent(c);
  if(c.rentYears&&typeof c.rentYears==='object'&&c.rentYears[year]!==undefined){
    return parseFloat(c.rentYears[year])||0;
  }
  // fallback: if no per-year data, return total rent
  return getTotalRent(c);
}


function renderTablighReport(){
  populateTablighYearFilter();
  const yearF=document.getElementById('tabligh-year-filter')?.value||'';
  const monthF=document.getElementById('tabligh-month-filter')?.value||'';
  const statusF=document.getElementById('tabligh-status-filter')?.value||'';
  const typeF=document.getElementById('tabligh-type-filter')?.value||'';
  const banner=document.getElementById('tabligh-year-banner');
  const bannerText=document.getElementById('tabligh-year-banner-text');
  const thRent=document.getElementById('tabligh-th-rent');
  if(thRent)thRent.textContent=yearF?'إيجار '+yearF:'إجمالي الإيجار';


  let data=contracts.filter(c=>{
    // status filter
    if(statusF){if(c.status!==statusF)return false;}
    else{if(c.status!=='active'&&c.status!=='soon')return false;}
    // type filter
    if(typeF&&c.type!==typeF)return false;
    // month filter: filter by استحقاق month (c.month stored as English: "January" etc)
    if(monthF&&(c.month||'').trim()!==monthF.trim())return false;
    // year filter: only include contracts that have an entry for this year
    if(yearF){
      if(c.rentYears&&typeof c.rentYears==='object'){
        if(c.rentYears[yearF]===undefined||c.rentYears[yearF]===null)return false;
      }else{
        // no rentYears object: check if the year falls within contract period
        const sy=c.start?new Date(c.start).getFullYear():null;
        const ey=c.expiry?new Date(c.expiry).getFullYear():null;
        const yr=parseInt(yearF);
        if(sy===null||yr<sy)return false;
        if(ey!==null&&yr>ey)return false;
      }
    }
    return true;
  }).sort((a,b)=>(a.num||'').localeCompare(b.num||'',undefined,{numeric:true,sensitivity:'base'}));


  // banner
  if(banner){
    if(yearF){
      banner.style.display='flex';
      if(bannerText)bannerText.textContent='عرض عقود سنة '+yearF+' — أرقام التبليغ ستعكس إيجار هذه السنة فقط';
    }else{
      banner.style.display='none';
    }
  }


  const tb=document.getElementById('tabligh-tbody');
  const empty=document.getElementById('tabligh-empty');
  const cnt=document.getElementById('tabligh-count');
  if(cnt)cnt.textContent=data.length+' عقد';
  if(!tb)return;
  if(!data.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  tb.innerHTML=data.map((c,i)=>{
    const yearRent=getRentForYear(c,yearF);
    const svcAmt=c.svcAmt!=null?Math.round(yearRent*(c.svcRate??10)/100):Math.round(yearRent*(c.svcRate??10)/100);
    const knwAmt=Math.round(yearRent*(c.knwRate??2)/100);
    const taxAmt=Math.round(svcAmt*(c.taxRate??16)/100);
    const grandTotal=yearRent+svcAmt+knwAmt+taxAmt;
    const statusBadge=badgeH(c.status);
    return`<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td style="font-weight:700;color:var(--blue)">${c.num||'—'}</td>
      <td style="font-size:14px;color:var(--text-m)">${c.acct||'—'}</td>
      <td>${typeH(c.type)}</td>
      <td style="font-weight:600">${c.inv||'—'}</td>
      <td>${c.brand||'—'}</td>
      <td style="font-weight:700;color:var(--green)">${yearRent.toLocaleString('en')} <span style="font-size:12px;color:var(--text-m)">د.أ</span></td>
      <td style="font-size:14px">${c.expiry||'—'}</td>
      <td>${statusBadge}</td>
      <td><button class="btn btn-ghost btn-xs" title="فتح كتاب تبليغ" onclick="openTabligh('${c.id}','${yearF}')" style="color:var(--amber);border:1px solid var(--amber);border-radius:6px;padding:4px 10px;font-weight:600">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        ${yearF?yearF:'تبليغ'}
      </button></td>
    </tr>`;
  }).join('');
}


/* ══════════════════════ DASHBOARD V2 (sparklines / activity / recent / topbar) ══════════════════════ */
function renderKPISparks(){
  const colors={total:'#2563eb',active:'#16a34a',soon:'#d97706',revenue:'#0d9488'};
  const data={
    total:MD.values.slice(-12),
    active:[40,44,48,45,50,52,55,53,58,60,61,63],
    soon:[22,20,18,19,17,16,15,16,15,14,15,15],
    revenue:[1100,1150,1200,1180,1250,1300,1350,1400,1450,1500,1600,1650]
  };
  Object.keys(colors).forEach(key=>{
    const cv=document.getElementById('kpiSpark'+key.charAt(0).toUpperCase()+key.slice(1));
    if(!cv)return;
    const ctx=cv.getContext('2d');
    const w=cv.width,h=cv.height;
    const vals=data[key];
    const max=Math.max(...vals),min=Math.min(...vals);
    const pad=4;
    const stepX=(w-pad*2)/(vals.length-1);
    const rng=(max-min)||1;
    const pts=vals.map((v,i)=>[pad+i*stepX,h-pad-((v-min)/rng)*(h-pad*2)]);
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();
    ctx.strokeStyle=colors[key]+'30';
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle=colors[key];
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.stroke();
    const last=pts[pts.length-1];
    ctx.beginPath();ctx.fillStyle=colors[key];
    ctx.arc(last[0],last[1],3,0,Math.PI*2);ctx.fill();
  });
}


function renderRecentActivity(){
  const el=document.getElementById('activityList');if(!el)return;
  const items=[];
  const now=new Date();
  contracts.filter(c=>c.status==='soon'&&c.expiry).slice(0,2).forEach(c=>{
    const d=Math.ceil((new Date(c.expiry)-now)/86400000);
    items.push({icon:'⏰',bg:'var(--amber-100)',title:c.num+' سينتهي قريباً',sub:c.inv+' · '+c.brand,time:d<=30?'عاجل':d+' يوم',cls:'amber'});
  });
  contracts.filter(c=>c.status==='active').sort((a,b)=>(b.start||'').localeCompare(a.start||'')).slice(0,3).forEach(c=>{
    items.push({icon:'✅',bg:'var(--green-100)',title:'عقد جديد نشط · '+c.num,sub:c.inv+' · '+c.brand,time:(c.start||'').slice(0,10),cls:'green'});
  });
  contracts.filter(c=>c.status==='ended').slice(0,1).forEach(c=>{
    items.push({icon:'🔚',bg:'var(--red-100)',title:c.num+' انتهى العقد',sub:c.inv+' · '+c.brand,time:(c.expiry||'').slice(0,10),cls:'red'});
  });
  if(!items.length){el.innerHTML='<p style="font-size:15px;color:var(--text-m);text-align:center;padding:20px">لا يوجد نشاط حديث</p>';return;}
  el.innerHTML=items.map(a=>`<div class="activity-item">
    <div class="act-icon" style="background:${a.bg}">${a.icon}</div>
    <div class="act-txt"><div class="act-title">${a.title}</div><div class="act-sub">${a.sub}</div></div>
    <div class="act-time">${a.time}</div>
  </div>`).join('');
}


function renderRecentContracts(){
  const tb=document.getElementById('recentContractsBody');if(!tb)return;
  const rec=[...contracts].sort((a,b)=>(b.start||'').localeCompare(a.start||'')).slice(0,6);
  if(!rec.length){tb.innerHTML='<tr><td colspan="9" class="table-empty">لا توجد عقود</td></tr>';return;}
  tb.innerHTML=rec.map((c,i)=>`<tr style="cursor:pointer" onclick="openDetailModal('${c.id}')">
    <td class="td-num" style="color:var(--text-l)">${i+1}</td>
    <td style="font-weight:700;color:var(--blue-600)">${c.num||'—'}</td>
    <td class="td-name">${c.inv||'—'}</td>
    <td class="td-brand">${c.brand||'—'}</td>
    <td>${typeH(c.type)}</td>
    <td style="font-size:14px">${formatTermDisplay(c)}</td>
    <td style="font-size:14px">${c.start||'—'}</td>
    <td style="font-size:14px">${c.expiry||'—'}</td>
    <td>${badgeH(c.status)}</td>
  </tr>`).join('');
}


function topbarSearch(inp){
  const q=(inp.value||'').trim().toLowerCase();
  let resultsEl=document.getElementById('topbarSearchResults');
  if(!resultsEl){
    resultsEl=document.createElement('div');
    resultsEl.className='topbar-search-results';
    resultsEl.id='topbarSearchResults';
    inp.parentNode.appendChild(resultsEl);
  }
  if(!q){resultsEl.innerHTML='';resultsEl.style.display='none';return;}
  const hits=contracts.filter(c=>{
    return (c.num||'').toLowerCase().includes(q)||(c.inv||'').toLowerCase().includes(q)||(c.brand||'').toLowerCase().includes(q)||(c.acct||'').toLowerCase().includes(q);
  }).slice(0,7);
  if(!hits.length){resultsEl.innerHTML='<div style="padding:10px;font-size:14px;color:var(--text-m);text-align:center">لا توجد نتائج</div>';resultsEl.style.display='block';return;}
  resultsEl.innerHTML=hits.map(c=>`<div class="tsearch-item" onclick="showPage('contracts',document.getElementById('nav-contracts'));document.getElementById('searchInput').value='${(c.num||'').replace(/'/g,"\\'")}';filterContracts();document.getElementById('topbarSearchResults').style.display='none'">
    <span class="ts-num">${c.num||'—'}</span>
    <span class="ts-name">${c.inv||''}</span>
    <span class="ts-sub">${c.brand||''}</span>
  </div>`).join('');
  resultsEl.style.display='block';
}


function toggleNotifPanel(){
  const p=document.getElementById('notifPanel');
  if(!p)return;
  const willOpen=!p.classList.contains('open');
  document.querySelectorAll('.notif-panel.open').forEach(e=>e.classList.remove('open'));
  if(willOpen){p.classList.add('open');renderNotifs();}
}
function renderNotifs(){
  const list=document.getElementById('notifList');const dot=document.getElementById('notifDot');
  if(!list)return;
  const now=new Date();
  const nowDay=new Date();nowDay.setHours(0,0,0,0);


  // Contract expiry notifications
  const soon=contracts.filter(c=>c.status==='soon'&&c.expiry).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).slice(0,4);


  // Kambiyala urgent alerts (overdue + ≤7 days)
  const kbUrgent=kambiyalaRecords.filter(r=>{
    if(r.status!=='due')return false;
    if(!r.dueDate)return false;
    const d=new Date(r.dueDate);d.setHours(0,0,0,0);
    return Math.ceil((d-nowDay)/86400000)<=7;
  }).sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||'')).slice(0,4);


  const hasNotifs=soon.length||kbUrgent.length;
  if(dot)dot.style.display=hasNotifs?'block':'none';


  if(!hasNotifs){list.innerHTML='<div style="padding:16px;font-size:14px;color:var(--text-m);text-align:center">لا توجد تنبيهات</div>';return;}


  let html='';


  // Kambiyala items first (more urgent)
  if(kbUrgent.length){
    html+='<div style="padding:6px 12px;font-size:12px;font-weight:800;color:var(--blue-600);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border)">🏦 كمبيالات مستحقة</div>';
    html+=kbUrgent.map(r=>{
      const d=new Date(r.dueDate);d.setHours(0,0,0,0);
      const diff=Math.ceil((d-nowDay)/86400000);
      const isOverdue=diff<0;
      const color=isOverdue?'var(--red-500)':(diff<=3?'var(--red-400)':'var(--amber-500)');
      const label=isOverdue?`متأخر ${Math.abs(diff)}د`:(diff===0?'اليوم!':diff+' يوم');
      return`<div class="notif-item" onclick="showPage('kambiyala');closeAllDropdowns();document.getElementById('notifPanel').classList.remove('open')">
        <span class="ni-dot" style="background:${color}"></span>
        <span class="ni-txt" style="color:${isOverdue?'var(--red-600)':'inherit'}">${r.num} · ${r.clientName||'—'}</span>
        <span class="ni-date" style="color:${color};font-weight:700">${label}</span>
      </div>`;
    }).join('');
  }


  // Contract expiry items
  if(soon.length){
    html+='<div style="padding:6px 12px;font-size:12px;font-weight:800;color:var(--amber-600);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border);margin-top:4px">📋 عقود تنتهي قريباً</div>';
    html+=soon.map(c=>{
      const d=Math.ceil((new Date(c.expiry)-now)/86400000);
      const color=d<=30?'var(--red-500)':(d<=90?'var(--amber-500)':'var(--blue-500)');
      return`<div class="notif-item" onclick="showPage('reports');switchReportTab('rep8',null);closeAllDropdowns();document.getElementById('notifPanel').classList.remove('open')">
        <span class="ni-dot" style="background:${color}"></span>
        <span class="ni-txt">${c.num} · ${c.brand||c.inv}</span>
        <span class="ni-date">${d} يوم</span>
      </div>`;
    }).join('');
  }


  list.innerHTML=html;
}
function refreshNotifBadge(){
  const dot=document.getElementById('notifDot');if(!dot)return;
  const soon=contracts.filter(c=>c.status==='soon').length;
  const nowDay=new Date();nowDay.setHours(0,0,0,0);
  const kbUrgent=kambiyalaRecords.filter(r=>{
    if(r.status!=='due'||!r.dueDate)return false;
    const d=new Date(r.dueDate);d.setHours(0,0,0,0);
    return Math.ceil((d-nowDay)/86400000)<=7;
  }).length;
  dot.style.display=(soon||kbUrgent)?'block':'none';
}


/* ══════════════════════ FAVORITES (reports) ══════════════════════ */
const SK_FAVORITES='lms_favorites_v1';
const REPORT_FAVS={
  rep1:{label:'التقرير المالي',icon:'<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'},
  rep2:{label:'العقود المنتهية',icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'},
  rep8:{label:'تنتهي قريباً',icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'},
  rep3:{label:'معدل التأجير',icon:'<svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>'},

  rep5:{label:'بيانات العملاء',icon:'<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>'},
  rep7:{label:'الدفعات والتحصيل',icon:'<svg viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>'},
  'rep-meter':{label:'سعر المتر',icon:''},
  rep9:{label:'تقرير المساحة الشاغرة',icon:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'},
  'rep-water':{label:'💧 تقرير المياه',icon:''},
  'rep-elec':{label:'⚡ تقرير الكهرباء',icon:''},
  'rep-srv':{label:'📊 تقرير الخدمات',icon:''},
  'rep-tabligh':{label:'📋 كتاب تبليغ',icon:''},

};
function getFavKey(){return SK_FAVORITES+'_'+(session?session.id:'guest');}
function loadFavReports(){
  try{
    const s=localStorage.getItem(getFavKey());
    if(s){const a=JSON.parse(s);if(Array.isArray(a))return a.filter(id=>REPORT_FAVS[id]);}
  }catch(e){}
  return ['rep1','rep8'];
}
function saveFavReports(arr){try{localStorage.setItem(getFavKey(),JSON.stringify(arr));}catch(e){}}
function toggleFavReport(id,btn){
  let favs=loadFavReports();
  const i=favs.indexOf(id);
  if(i>=0)favs.splice(i,1);else favs.push(id);
  saveFavReports(favs);
  renderFavReports();
  updateFavStars();
  showToast(i>=0?'تمت إزالة التقرير من المفضلة':'تمت إضافة التقرير إلى المفضلة');
}
function renderFavReports(){
  const c=document.getElementById('favReportsList');if(!c)return;
  const allowed=session?getAllowedReports(session):ALL_REPORT_IDS;
  const favs=loadFavReports().filter(id=>allowed.includes(id));
  if(!favs.length){
    c.innerHTML='<div style="font-size:13px;color:var(--text-l);padding:4px 8px 8px">لا توجد تقارير مفضلة — اضغط ☆ بجانب أي تقرير</div>';
    return;
  }
  c.innerHTML=favs.map(id=>{
    const r=REPORT_FAVS[id];
    return `<button class="nav-item" onclick="showPage('reports');switchReportTab('${id}',null);closeAllDropdowns()">
      ${r.icon}
      <span style="flex:1;text-align:right">${r.label}</span>
    </button>`;
  }).join('');
}
function updateFavStars(){
  const favs=loadFavReports();
  document.querySelectorAll('.fav-star').forEach(b=>{
    const id=b.getAttribute('data-fav');
    if(!id)return;
    const on=favs.includes(id);
    b.classList.toggle('fav-active',on);
    b.textContent=on?'★':'☆';
    b.title=on?'إزالة من المفضلة':'إضافة إلى المفضلة';
  });
}
function toggleAvatarMenu(){
  const m=document.getElementById('avatarMenu');
  if(!m)return;
  document.querySelectorAll('.notif-panel.open').forEach(p=>p.classList.remove('open'));
  m.classList.toggle('open');
}


document.addEventListener('click',function(e){
  if(e.target.closest('.topbar-icon-btn-wrap'))return;
  if(e.target.closest('.topbar-avatar-wrap'))return;
  document.querySelectorAll('.notif-panel.open').forEach(p=>p.classList.remove('open'));
  const am=document.getElementById('avatarMenu');
  if(am)am.classList.remove('open');
  const res=document.getElementById('topbarSearchResults');
  if(res&&!e.target.closest('.topbar-search')){res.style.display='none';}
});


