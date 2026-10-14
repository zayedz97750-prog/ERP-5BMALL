/* ═══ 5B Mall — All Reports ═══ */
/* ═══ Report 1: Financial ═══ */
let repAllTableBodyRendered=false;
function renderFinancialReport(){
  if(!repAllTableBodyRendered){repAllTableBodyRendered=true;populateRepYearFilter();}
  renderRepFilteredTable();
  // Update top tenants chart data
  if(topTenantsChart){
    const top8=[...contracts].filter(c=>c.status!=='cancelled').sort((a,b)=>getTotalRent(b)-getTotalRent(a)).slice(0,8);
    topTenantsChart.data.labels=top8.map(c=>c.brand.length>13?c.brand.slice(0,13)+'…':c.brand);
    topTenantsChart.data.datasets[0].data=top8.map(c=>getTotalRent(c));
    topTenantsChart.update();
  }
}
function populateRepYearFilter(){
  const sel=document.getElementById('repFilterYear');
  if(!sel||sel.options.length>1)return;
  const years=new Set();
  contracts.forEach(c=>{if(c.start){const y=new Date(c.start).getFullYear();years.add(y);}if(c.expiry){const y=new Date(c.expiry).getFullYear();years.add(y);}});
  const cur=new Date().getFullYear();
  [cur-1,cur,cur+1,cur+2].forEach(y=>years.add(y));
  [...years].sort((a,b)=>b-a).forEach(y=>{const o=document.createElement('option');o.value=y.toString();o.textContent=y;sel.appendChild(o);});
}
// Shared source for the financial report and dashboard monthly chart.
function selectFinancialContracts(records,{year='',type='',month=''}={}){
 return records.filter(c=>(!type||c.type===type)&&(!month||c.month===month)&&(!year||(c.rentYears&&Number(c.rentYears[year])>0)));
}
function financialContractAmounts(c,year=''){
 const rent=year?Number(c.rentYears?.[year]||0):Number(getTotalRent(c)||0);
 const svc=rent>0?Math.round(rent*(c.svcRate??10)/100):0;
 const knw=rent>0?Math.round(rent*(c.knwRate??2)/100):0;
 const tax=svc>0?Math.round(svc*(c.taxRate??16)/100):0;
 return {rent,svc,knw,tax,grand:rent+svc+knw+tax};
}
function getRepFilteredContracts(){
  const year=document.getElementById('repFilterYear')?.value||'';
  const type=document.getElementById('repFilterType')?.value||'';
  const month=document.getElementById('repFilterMonth')?.value||'';
  let filtered=selectFinancialContracts(contracts,{year,type,month});
  // ترتيب من A إلى Z حسب رقم العقد
  filtered.sort((a,b)=>(a.num||'').localeCompare(b.num||'','ar'));
  return filtered;
}
function renderRepFilteredTable(){
  const filtered=getRepFilteredContracts();
  const tb=document.getElementById('repAllTableBody');
  const empty=document.getElementById('repFilterEmpty');
  const cnt=document.getElementById('repFilteredCount');
  const selYear=document.getElementById('repFilterYear')?.value||'';
  if(cnt)cnt.textContent=filtered.length+' عقد';
  if(!tb)return;
  if(!filtered.length){tb.innerHTML='';if(empty)empty.style.display='flex';
    // تحديث الـ KPIs بصفر عند لا توجد عقود
    ['rep-rent','rep-svc-only','rep-knw','rep-tax','rep-total'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='0 د.أ';});
    return;
  }
  if(empty)empty.style.display='none';
  let totalRent=0,totalSvc=0,totalKnw=0,totalTax=0;
  const rows=filtered.map((c,i)=>{
    let rent=0;
    let displayYear='';
    if(selYear){
      // عند اختيار سنة محددة: نعرض قيمة تلك السنة فقط
      rent=(c.rentYears&&c.rentYears[selYear])?Number(c.rentYears[selYear]):0;
      displayYear=selYear;
    }else{
      // كل السنوات: نعرض القيمة الكلية
      rent=getTotalRent(c);
      const yrKeys=c.rentYears?Object.keys(c.rentYears).sort():[];
      if(yrKeys.length){
        const sy=yrKeys[0],ey=yrKeys[yrKeys.length-1];
        displayYear=sy===ey?sy:sy+'—'+ey;
      }else{
        displayYear=c.start?new Date(c.start).getFullYear().toString():'—';
      }
    }
    const {svc,knw,tax,grand}=financialContractAmounts(c,selYear);
    totalRent+=rent;totalSvc+=svc;totalKnw+=knw;totalTax+=tax;
    return`<tr><td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num||'—'}</td>
      <td style="font-size:14px;color:var(--text-m)">${c.acct||'—'}</td>
      <td>${typeH(c.type)}</td>
      <td class="td-name" title="${c.inv}">${c.inv||'—'}</td>
      <td class="td-brand">${c.brand||'—'}</td>
      <td style="font-size:14px">${displayYear}</td>
      <td class="td-rent">${rent.toLocaleString('en')} د.أ</td>
      <td>${svc.toLocaleString('en')} د.أ</td>
      <td>${knw.toLocaleString('en')} د.أ</td>
      <td>${tax.toLocaleString('en')} د.أ</td>
      <td style="font-weight:800;color:var(--blue)">${grand.toLocaleString('en')} د.أ</td></tr>`;
  });
  tb.innerHTML=rows.join('');
  // تحديث مربعات الـ KPIs حسب الفلتر
  const repRentEl=document.getElementById('rep-rent');
  const repSvcEl=document.getElementById('rep-svc-only');
  const repKnwEl=document.getElementById('rep-knw');
  const repTaxEl=document.getElementById('rep-tax');
  const repTotalEl=document.getElementById('rep-total');
  if(repRentEl)repRentEl.textContent=Math.round(totalRent).toLocaleString('en')+' د.أ';
  if(repSvcEl)repSvcEl.textContent=Math.round(totalSvc).toLocaleString('en')+' د.أ';
  if(repKnwEl)repKnwEl.textContent=Math.round(totalKnw).toLocaleString('en')+' د.أ';
  if(repTaxEl)repTaxEl.textContent=Math.round(totalTax).toLocaleString('en')+' د.أ';
  if(repTotalEl)repTotalEl.textContent=Math.round(totalRent+totalSvc+totalKnw+totalTax).toLocaleString('en')+' د.أ';
}
function renderPartiesList(){
  const el=document.getElementById('repPartyContent');
  if(!el)return;
  const rows=contracts.filter(c=>c.inv&&c.inv.trim()).map(c=>[
    c.inv.trim(),
    c.num,
    c.brand||'—',
    c.brand||'—',
    c.delPhone||'—',
    c.finPhone||'—'
  ]);
  if(!rows.length){el.innerHTML='<div style="font-size:15px;color:var(--text-m);text-align:center;padding:16px">لا توجد بيانات</div>';return;}
  el.innerHTML='<div class="table-wrap"><table><thead><tr><th>اسم العميل</th><th>رقم العقد</th><th>الاسم التجاري</th><th>العلامة التجارية</th><th>رقم هاتف المفوض</th><th>رقم هاتف الجهة المالية</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td style="font-weight:600">'+r[0]+'</td><td class="td-num">'+r[1]+'</td><td>'+r[2]+'</td><td class="td-brand">'+r[3]+'</td><td>'+r[4]+'</td><td>'+r[5]+'</td></tr>').join('')+
    '</tbody></table></div>';
}


/* ═══ Overview Charts (moved from Charts Gallery) ═══ */
let chartsYearlyInst=null,chartsTopTenantsInst=null,chartsTypeDistInst=null,chartsRevenueDistInst=null;
function renderOverviewCharts(){
  // Yearly chart
  const cy=document.getElementById('chartsYearly');
  if(cy){
    if(chartsYearlyInst)chartsYearlyInst.destroy();
    const yearMap={};
    contracts.filter(c=>c.status!=='cancelled').forEach(c=>{
      const sy=c.start?new Date(c.start).getFullYear():null;
      if(!sy)return;
      if(!yearMap[sy])yearMap[sy]={rent:0,fees:0};
      const rent=getTotalRent(c);
      const svc=c.svcAmt||Math.round(rent*(c.svcRate??10)/100);
      const knw=c.knwAmt||Math.round(rent*(c.knwRate??2)/100);
      const tax=c.taxAmt||Math.round(svc*(c.taxRate??16)/100);
      yearMap[sy].rent+=rent;yearMap[sy].fees+=svc+knw+tax;
    });
    const ylabels=Object.keys(yearMap).sort();
    if(ylabels.length){
      chartsYearlyInst=new Chart(cy,{type:'bar',data:{labels:ylabels,datasets:[
        {label:'الإيجار',data:ylabels.map(y=>Math.round(yearMap[y].rent/1000)),backgroundColor:'#2563eb',borderRadius:4},
        {label:'الرسوم',data:ylabels.map(y=>Math.round(yearMap[y].fees/1000)),backgroundColor:'#4f46e5',borderRadius:4}
      ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:9},boxWidth:10}},title:{display:true,text:'الإيجار السنوي والرسوم (ألف د.أ)',font:{size:12}}},scales:{y:{ticks:{callback:v=>v+'K',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}});
    }
  }
  // Top tenants
  const ct=document.getElementById('chartsTopTenants');
  if(ct){
    if(chartsTopTenantsInst)chartsTopTenantsInst.destroy();
    const top8=[...contracts].filter(c=>c.status!=='cancelled').sort((a,b)=>getTotalRent(b)-getTotalRent(a)).slice(0,8);
    chartsTopTenantsInst=new Chart(ct,{type:'bar',data:{labels:top8.map(c=>c.brand.length>13?c.brand.slice(0,13)+'…':c.brand),datasets:[{data:top8.map(c=>getTotalRent(c)),backgroundColor:'#2563eb',borderRadius:4,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'أعلى 8 مستأجرين (د.أ)',font:{size:12}}},scales:{x:{ticks:{callback:v=>(v/1000)+'K',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}},y:{ticks:{font:{size:10}},grid:{display:false}}}}});
  }
  // Type distribution
  const ctd=document.getElementById('chartsTypeDist');
  const ctl=document.getElementById('chartsTypeLegend');
  if(ctd){
    if(chartsTypeDistInst)chartsTypeDistInst.destroy();
    const tMap={commercial:0,warehouse:0,short:0,investment:0};
    contracts.forEach(c=>{if(tMap[c.type]!==undefined)tMap[c.type]++;});
    const tLabels=['تجاري','مستودع','قصير الأجل','استثمار'];
    const tData=[tMap.commercial,tMap.warehouse,tMap.short,tMap.investment];
    const tColors=['#2563eb','#f59e0b','#10b981','#4f46e5'];
    chartsTypeDistInst=new Chart(ctd,{type:'doughnut',data:{labels:tLabels,datasets:[{data:tData,backgroundColor:tColors,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{display:false}}}});
    if(ctl)ctl.innerHTML=tLabels.map((l,i)=>`<div class="donut-item"><div class="donut-dot" style="background:${tColors[i]}"></div><span class="donut-label">${l}</span><span class="donut-val">${tData[i]}</span></div>`).join('');
  }
  // Revenue distribution
  const crd=document.getElementById('chartsRevenueDist');
  const crl=document.getElementById('chartsRevenueLegend');
  if(crd){
    if(chartsRevenueDistInst)chartsRevenueDistInst.destroy();
    const totalRent=contracts.reduce((s,c)=>s+getTotalRent(c),0);
    const totalSvc=contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0);
    const totalKnw=contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0);
    const totalTax=contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
    const rLabels=['إجمالي الإيجار','بدل خدمات','بدل معارف','ضريبة'];
    const rData=[Math.round(totalRent),Math.round(totalSvc),Math.round(totalKnw),Math.round(totalTax)];
    const rColors=['#2563eb','#0d9488','#f59e0b','#ef4444'];
    chartsRevenueDistInst=new Chart(crd,{type:'doughnut',data:{labels:rLabels,datasets:[{data:rData,backgroundColor:rColors,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{display:false}}}});
    if(crl)crl.innerHTML=rLabels.map((l,i)=>`<div class="donut-item"><div class="donut-dot" style="background:${rColors[i]}"></div><span class="donut-label">${l}</span><span class="donut-val">${(rData[i]||0).toLocaleString('en')} د.أ</span></div>`).join('');
  }
}


/* ═══ Report 2: Ended Contracts ═══ */
function renderEndedReport(){
  const ended=contracts.filter(c=>c.status==='ended');
  const et=document.getElementById('repEndedTable');
  const empty=document.getElementById('repEndedEmpty');
  if(et){
    if(ended.length){
      if(empty)empty.style.display='none';
      et.innerHTML=ended.map(c=>`<tr><td class="td-num">${c.num}</td><td class="td-name">${c.inv}</td><td class="td-brand">${c.brand}</td><td style="font-size:14px;color:var(--red)">${c.expiry||'—'}</td><td style="font-size:14px">${c.start||'—'}</td><td style="text-align:center;font-size:13px">${formatTermDisplay(c)}</td><td>${badgeH('ended')}</td></tr>`).join('');
    }else{
      if(empty)empty.style.display='flex';
      et.innerHTML='';
    }
  }
}


/* ═══ Report 8: Soon to Expire ═══ */
function renderSoonReport(){
  const now=new Date();
  // نعتبر "تنتهي قريباً" كل العقود التي تنتهي خلال 12 شهر (بغض النظر عن الـ status)
  const allActive=contracts.filter(c=>c.status==='active'||c.status==='soon');
  const soon=allActive.filter(c=>{
    if(!c.expiry)return false;
    const d=new Date(c.expiry);
    const days=Math.ceil((d-now)/86400000);
    return days>=0&&days<=365;
  }).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry));


  // تحديث الـ KPIs
  const cnt12=soon.length;
  const cnt30=soon.filter(c=>Math.ceil((new Date(c.expiry)-now)/86400000)<=30).length;
  const cnt90=soon.filter(c=>{const d=Math.ceil((new Date(c.expiry)-now)/86400000);return d>30&&d<=90;}).length;
  const cnt365=soon.filter(c=>{const d=Math.ceil((new Date(c.expiry)-now)/86400000);return d>90&&d<=365;}).length;
  const r8soon=document.getElementById('rep8-soon-count');
  const r8urg=document.getElementById('rep8-urgent-count');
  const r8mid=document.getElementById('rep8-mid-count');
  const r8later=document.getElementById('rep8-later-count');
  if(r8soon)r8soon.textContent=cnt12;
  if(r8urg)r8urg.textContent=cnt30;
  if(r8mid)r8mid.textContent=cnt90;
  if(r8later)r8later.textContent=cnt365;


  const st=document.getElementById('repSoonTable');
  const empty=document.getElementById('repSoonEmpty');
  const wl=document.getElementById('repSoonWarnings');
  if(st){
    if(soon.length){
      if(empty)empty.style.display='none';
      st.innerHTML=soon.map(c=>{
        const expiry=c.expiry?new Date(c.expiry):null;
        const days=expiry?Math.ceil((expiry-now)/86400000):'—';
        let urgClass='badge-active';
        if(days!=='—'&&days<=30)urgClass='badge-soon';
        else if(days!=='—'&&days<=90)urgClass='badge-amber';
        return`<tr>
          <td class="td-num">${c.num||'—'}</td>
          <td class="td-name">${c.inv||'—'}</td>
          <td class="td-brand">${c.brand||'—'}</td>
          <td style="font-size:14px;color:var(--red)">${c.expiry||'—'}</td>
          <td><span class="badge ${urgClass}" style="font-size:14px">${days!=='—'?days+' يوم':'—'}</span></td>
          <td style="font-size:14px">${c.start||'—'}</td>
          <td style="text-align:center;font-size:13px">${formatTermDisplay(c)}</td></tr>`;
      }).join('');
    }else{
      if(empty)empty.style.display='flex';
      st.innerHTML='';
    }
  }
  // Warnings
  if(wl){
    const urgent=soon.filter(c=>{const d=Math.ceil((new Date(c.expiry)-now)/86400000);return d<=90;});
    if(urgent.length){
      wl.innerHTML=urgent.map(c=>{
        const days=Math.ceil((new Date(c.expiry)-now)/86400000);
        return`<div class="warning-item amber">
          <div><div class="wi-title">${c.num||'—'} — ${c.inv||'—'}</div><div class="wi-sub">${c.brand||'—'} · ${c.expiry||'—'}</div></div>
          <div><span class="wi-badge ${days<=30?'red':'amber'}">${days} يوم متبقي</span></div>
        </div>`;
      }).join('');
    }else{
      wl.innerHTML='<div style="font-size:15px;color:var(--text-m);text-align:center;padding:20px">✅ لا توجد عقود وشيكة الانتهاء خلال 90 يوم</div>';
    }
  }
}


/* ═══ Report 3: Yearly Analysis ═══ */
let yearlyChartInstance=null;
function renderYearlyAnalysis(){
  const yearMap={};
  contracts.filter(c=>c.status!=='cancelled').forEach(c=>{
    const sy=c.start?new Date(c.start).getFullYear():null;
    if(!sy)return;
    if(!yearMap[sy])yearMap[sy]={count:0,rent:0,svc:0,knw:0,tax:0,grand:0};
    const rent=getTotalRent(c);
    const svc=c.svcAmt||Math.round(rent*(c.svcRate??10)/100);
    const knw=c.knwAmt||Math.round(rent*(c.knwRate??2)/100);
    const tax=c.taxAmt||Math.round(svc*(c.taxRate??16)/100);
    const grand=rent+svc+knw+tax;
    yearMap[sy].count++;
    yearMap[sy].rent+=rent;
    yearMap[sy].svc+=svc;
    yearMap[sy].knw+=knw;
    yearMap[sy].tax+=tax;
    yearMap[sy].grand+=grand;
  });
  const years=Object.keys(yearMap).sort();
  // KPIs
  const kg=document.getElementById('yearKpiGrid');
  if(kg&&years.length){
    const totalY=yearMap[years[years.length-1]];
    const prevY=years.length>1?yearMap[years[years.length-2]]:null;
    const pct=prevY&&prevY.rent?Math.round((totalY.rent-prevY.rent)/prevY.rent*100):0;
    kg.innerHTML=`
      <div class="kpi-card"><div class="kpi-label">آخر سنة</div><div class="kpi-value" style="font-size:22px">${years[years.length-1]||'—'}</div></div>
      <div class="kpi-card"><div class="kpi-label">عدد العقود</div><div class="kpi-value" style="font-size:22px">${totalY.count}</div></div>
      <div class="kpi-card"><div class="kpi-label">إجمالي الإيجار</div><div class="kpi-value" style="font-size:18px">${Math.round(totalY.rent).toLocaleString('en')} د.أ</div></div>
      <div class="kpi-card"><div class="kpi-label">التغير عن السابق</div><div class="kpi-value" style="font-size:20px;color:${pct>=0?'var(--green)':'var(--red)'}">${pct>=0?'↑':'↓'} ${Math.abs(pct)}%</div></div>
    `;
  }
  // Yearly breakdown table
  const yt=document.getElementById('yearlyBreakdownTable');
  if(yt){
    yt.innerHTML=years.length?years.map(yr=>{
      const d=yearMap[yr];
      return`<tr><td style="font-weight:700;color:var(--blue);font-size:16px">${yr}</td>
        <td>${d.count} عقد</td>
        <td class="td-rent">${Math.round(d.rent).toLocaleString('en')} د.أ</td>
        <td>${Math.round(d.svc).toLocaleString('en')} د.أ</td>
        <td>${Math.round(d.knw).toLocaleString('en')} د.أ</td>
        <td>${Math.round(d.tax).toLocaleString('en')} د.أ</td>
        <td style="font-weight:800;color:var(--blue)">${Math.round(d.grand).toLocaleString('en')} د.أ</td></tr>`;
    }).join(''):'<tr><td colspan="7" style="text-align:center;color:var(--text-m);padding:20px">لا توجد بيانات</td></tr>';
  }
  // Yearly chart
  const yc=document.getElementById('yearlyChart');
  if(yc){
    if(yearlyChartInstance)yearlyChartInstance.destroy();
    if(years.length){
      yearlyChartInstance=new Chart(yc,{type:'bar',data:{labels:years,datasets:[
        {label:'الإيجار',data:years.map(y=>Math.round(yearMap[y].rent/1000)),backgroundColor:'#2563eb',borderRadius:4},
        {label:'الرسوم',data:years.map(y=>Math.round((yearMap[y].svc+yearMap[y].knw+yearMap[y].tax)/1000)),backgroundColor:'#4f46e5',borderRadius:4}
      ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:10},boxWidth:12}}},scales:{y:{ticks:{callback:v=>v+'K',font:{size:10}},grid:{color:'rgba(0,0,0,0.05)'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}});
    }
  }
}


/* ═══ Report 4: Locations (المساحات المستأجرة) ═══ */
function renderLocationsReport(){
  const q=(document.getElementById('locSearch')?.value||'').toLowerCase();
  const ff=document.getElementById('locFloorFilter')?.value||'';


  // بناء قائمة من العقود التي لها بيانات موقع (مبنى + طابق + محل)
  // نحاول استخراج: المبنى، الطابق، المحل من locationCode أو من حقول مستقلة
  const locRows=[];
  contracts.forEach(c=>{
    if(c.status==='cancelled'||c.status==='ended')return;
    // نحاول استخراج معلومات الموقع من locationCode أو الحقول المباشرة
    const building=c.building||c.buildingName||'';
    const floor=c.floor||c.floorName||'';
    const shop=c.shopNum||c.shop||'';
    const area=c.area||'';
    const code=c.locationCode||'';


    // نستخرج من locationCode إذا لم توجد حقول مستقلة
    let bld=building,flr=floor,shp=shop;
    if(code&&(!bld||!flr)){
      const parts=code.split('-');
      if(!flr&&parts[0])flr=parts[0];
      if(!shp&&parts[1])shp=parts.slice(1).join('-');
    }


    // فلتر الطابق
    if(ff&&flr!==ff)return;
    // فلتر البحث
    if(q){
      const searchStr=(c.num+c.brand+c.inv+bld+flr+shp+code).toLowerCase();
      if(!searchStr.includes(q))return;
    }
    locRows.push({building:bld,floor:flr,shop:shp,area,code,contract:c});
  });


  const tb=document.getElementById('locTableBody');
  const empty=document.getElementById('locEmpty');
  const cnt=document.getElementById('locCount');
  if(cnt)cnt.textContent=locRows.length+' موقع';


  // ملء فلتر الطوابق
  const ffSel=document.getElementById('locFloorFilter');
  if(ffSel&&ffSel.options.length<=1){
    const floors=new Set();
    contracts.forEach(c=>{
      const f=c.floor||c.floorName||(c.locationCode?c.locationCode.split('-')[0]:'');
      if(f)floors.add(f);
    });
    [...floors].sort().forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;ffSel.appendChild(o);});
  }


  // KPIs
  const withLoc=contracts.filter(c=>c.locationCode||(c.building&&c.floor));
  const uniqueFloors=new Set(contracts.map(c=>c.floor||c.floorName||(c.locationCode?c.locationCode.split('-')[0]:'')).filter(Boolean));
  document.getElementById('loc-total').textContent=locRows.length;
  document.getElementById('loc-floors').textContent=uniqueFloors.size;
  document.getElementById('loc-with-location').textContent=withLoc.length;


  if(!locRows.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';


  tb.innerHTML=locRows.map((r,i)=>{
    const c=r.contract;
    const detailBtn=`<button class="btn btn-ghost btn-xs" onclick="openDetailModal('${c.id}')" title="عرض التفاصيل"><svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:var(--teal);stroke-width:2;fill:none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>`;
    return `<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num||'—'}</td>
      <td class="td-brand">${c.brand||'—'}</td>
      <td style="font-size:14px">${r.building||'—'}</td>
      <td style="font-size:14px">${r.floor||'—'}</td>
      <td style="font-size:14px">${r.shop||'—'}</td>
      <td style="font-weight:700;color:var(--teal)">${r.area?r.area+' م²':'—'}</td>
      <td>${badgeH(c.status)}</td>
      <td>${detailBtn}</td>
    </tr>`;
  }).join('');
}


/* ═══ Report 7: Payments & Collections ═══ */
let paymentFilterDays=30;


function renderPaymentReport(){
  filterPayments(paymentFilterDays,document.querySelector('#rep7 .report-tab.active'));
}


function filterPayments(days,btn){
  if(btn){
    document.querySelectorAll('#rep7 .report-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
  paymentFilterDays=days;
  const now=new Date();
  const endDate=days>0?new Date(now.getTime()+days*86400000):null;
  // Collect upcoming payments
  let allPayments=[];
  contracts.forEach(c=>{
    if(c.status==='cancelled'||c.status==='ended')return;
    if(!c.payments||!c.payments.length)return;
    c.payments.forEach(p=>{
      const pd=new Date(p.date);
      if(pd<now)return;
      if(endDate&&pd>endDate)return;
      allPayments.push({contractNum:c.num,inv:c.inv,brand:c.brand,date:p.date,amount:p.amount,remaining:Math.ceil((pd-now)/86400000),contractId:c.id});
    });
  });
  allPayments.sort((a,b)=>new Date(a.date)-new Date(b.date));
  // KPIs
  const sum=(arr)=>arr.reduce((s,p)=>s+(p.amount||0),0);
  const kpi30=allPayments.filter(p=>p.remaining<=30);
  const kpi60=allPayments.filter(p=>p.remaining<=60);
  const kpi90=allPayments.filter(p=>p.remaining<=90);
  document.getElementById('pmt-30').textContent=kpi30.length;
  document.getElementById('pmt-30-amt').textContent=sum(kpi30).toLocaleString('en')+' د.أ';
  document.getElementById('pmt-60').textContent=kpi60.length;
  document.getElementById('pmt-60-amt').textContent=sum(kpi60).toLocaleString('en')+' د.أ';
  document.getElementById('pmt-90').textContent=kpi90.length;
  document.getElementById('pmt-90-amt').textContent=sum(kpi90).toLocaleString('en')+' د.أ';
  document.getElementById('pmt-total').textContent=allPayments.length;
  document.getElementById('pmt-total-amt').textContent=sum(allPayments).toLocaleString('en')+' د.أ';
  // Table
  const tb=document.getElementById('pmtTableBody');
  const empty=document.getElementById('pmtEmpty');
  const cnt=document.getElementById('pmtCount');
  if(cnt)cnt.textContent=allPayments.length+' دفعة';
  if(!allPayments.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  tb.innerHTML=allPayments.map((p,i)=>{
    const urg=p.remaining<=10?'badge-soon':p.remaining<=30?'badge-active':'badge-ended';
    return `<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num"><a href="javascript:void(0)" onclick="openDetailModal('${p.contractId}')" style="color:var(--blue);text-decoration:none">${p.contractNum}</a></td>
      <td class="td-name">${p.inv}</td>
      <td class="td-brand">${p.brand}</td>
      <td style="font-size:14px">${p.date}</td>
      <td class="td-rent">${(p.amount||0).toLocaleString('en')} د.أ</td>
      <td><span class="badge ${urg}">${p.remaining} يوم</span></td>
      <td>${p.remaining<=0?'<span style="color:var(--red);font-weight:600">مستحقة</span>':'<span style="color:var(--green);font-weight:600">قادمة</span>'}</td>
    </tr>`;
  }).join('');
}


/* ══════════════════════ AREA REPORT ══════════════════════ */
function areaReportData(){
  const key=l=>[l.building,l.floor,l.shop,l.division].map(x=>String(x??'').trim().toLowerCase()).join('|');
  const listed=Array.isArray(locationsData)?locationsData:[];
  const occupied=contracts.filter(isContractOccupying);
  const byLocation=new Map(),unmatched=[];
  const known=new Set(listed.map(key));
  occupied.forEach(c=>{
    const slots=contractLocationsList(c);
    if(!slots.length){unmatched.push({l:{},c,reason:'موقع العقد غير مسجل'});return;}
    slots.forEach(l=>{
      const k=key(l);
      if(!known.has(k))unmatched.push({l,c,reason:'المحل غير معرّف في المباني'});
      else{
        if(!byLocation.has(k))byLocation.set(k,[]);
        byLocation.get(k).push(c);
      }
    });
  });
  const rows=listed.flatMap(l=>{
    const matches=byLocation.get(key(l))||[];
    return matches.length?matches.map(c=>({l,c,state:'leased',area:Number(l.area)||0})): [{l,c:null,state:'vacant',area:Number(l.area)||0}];
  }).concat(unmatched.map(({l,c,reason})=>({l,c,state:'unmatched',reason,area:Number(l.area)||Number(c.area)||0})));
  const sum=arr=>arr.reduce((n,x)=>n+(Number(x.area)||0),0);
  const leased=listed.filter(l=>byLocation.has(key(l))),vacant=listed.filter(l=>!byLocation.has(key(l)));
  return {rows,listed,occupied,leased,vacant,total:sum(listed),leasedArea:sum(leased),vacantArea:sum(vacant),unknown:unmatched};
}
function areaReportAnnualRent(c){
  const years=Object.entries(c.rentYears||{}).filter(([year,value])=>/^\d{4}$/.test(year)&&value!==''&&value!=null&&Number.isFinite(Number(value)));
  if(years.length){
    const current=String(new Date().getFullYear());
    return Number((years.find(([year])=>year===current)||years.sort((a,b)=>Number(b[0])-Number(a[0]))[0])[1]);
  }
  const fallback=Number(c.rent2526);
  return Number.isFinite(fallback)&&fallback>0?fallback:null;
}
function renderAreaReport(){
  const d=areaReportData();
  const buildingFilter=document.getElementById('rep9BuildingFilter'),floorFilter=document.getElementById('rep9FloorFilter');
  const fill=(select,values,label)=>{const old=select.value;select.replaceChildren(new Option(label,''),...[...new Set(values.filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b,'ar',{numeric:true})).map(v=>new Option(v,v)));select.value=old;};
  fill(buildingFilter,d.listed.map(l=>l.building),'جميع المباني');
  const building=buildingFilter.value;
  fill(floorFilter,d.listed.filter(l=>!building||String(l.building)===building).map(l=>l.floor),'جميع الطوابق');
  const floor=floorFilter.value,q=document.getElementById('rep9Search').value.trim().toLowerCase();
  const rows=d.vacant.filter(l=>(!building||String(l.building)===building)&&(!floor||String(l.floor)===floor)&&(!q||[l.building,l.floor,l.shop,l.division].join(' ').toLowerCase().includes(q)));
  const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
  const safe=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const total=rows.reduce((sum,l)=>sum+(Number(l.area)||0),0);
  document.getElementById('rep9-avg-area').textContent=fmt(total)+' م²';
  document.getElementById('rep9-vacant-count').textContent=String(rows.length);
  document.getElementById('rep9Count').textContent=rows.length+' محل شاغر';
  const groups=new Map();
  rows.forEach(l=>{const key=JSON.stringify([l.building,l.floor]);if(!groups.has(key))groups.set(key,{building:l.building,floor:l.floor,count:0,area:0});const group=groups.get(key);group.count++;group.area+=Number(l.area)||0;});
  document.getElementById('rep9BuildingSummary').innerHTML=[...groups.values()].map(g=>`<tr><td>${safe(g.building||'—')}</td><td>${safe(g.floor||'—')}</td><td>${g.count}</td><td>${fmt(g.area)}</td></tr>`).join('')||'<tr><td colspan="4">لا توجد محلات شاغرة ضمن التصفية</td></tr>';
  document.getElementById('rep9TableBody').innerHTML=rows.map(l=>`<tr><td>${safe(l.building||'—')}</td><td>${safe(l.floor||'—')}</td><td>${safe(l.shop||'—')}${l.division?' / '+safe(l.division):''}</td><td>${Number(l.area)>0?fmt(l.area):'غير مسجلة'}</td></tr>`).join('');
  document.getElementById('rep9Empty').style.display=rows.length?'none':'flex';
  document.getElementById('rep9-note').textContent=!d.listed.length?'لا توجد محلات معرّفة. أضفها ومساحاتها في صفحة «تعريف المباني».':d.unknown.length?`يوجد ${d.unknown.length} موقع عقد نشط لا يطابق محلاً معرّفاً؛ راجع بيانات المواقع قبل اعتماد مجموع الشواغر.`:'الشاغر هو المحل المعرّف الذي لا يشغله عقد نشط. المساحة مأخوذة من تعريف المباني.';
}

/* ═══ Services Report ═══ */
let srvChartInst=null;
function getContractConsumptionValue(contractId,type,monthFilter,yearFilter){
  const readings=meterReadings.filter(r=>r.contractId===contractId&&r.meterType===type).sort((a,b)=>new Date(a.readingDate)-new Date(b.readingDate));
  const price=servicePrices[type]||0;
  if(monthFilter||yearFilter){
    const targetReadings=readings.filter(r=>{
      const monthMatch=monthFilter?parseInt(r.month)===parseInt(monthFilter):true;
      const yearMatch=yearFilter?parseInt(r.year)===parseInt(yearFilter):true;
      return monthMatch&&yearMatch;
    });
    if(!targetReadings.length)return{diff:0,value:0,has:false};
    const target=targetReadings[targetReadings.length-1];
    const priorList=readings.filter(r=>new Date(r.readingDate)<new Date(target.readingDate));
    if(!priorList.length)return{diff:0,value:0,has:false};
    const prior=priorList[priorList.length-1];
    const diff=target.reading-prior.reading;
    return{diff,value:diff*price,has:true};
  }
  if(readings.length<2)return{diff:0,value:0,has:false};
  const first=readings[0],last=readings[readings.length-1];
  const diff=last.reading-first.reading;
  return{diff,value:diff*price,has:true};
}
function renderServicesReport(){
  const q=(document.getElementById('srv-rep-search')?.value||'').toLowerCase();
  const tf=document.getElementById('srv-rep-type-filter')?.value||'';
  const svcContracts=getServiceContracts();
  const filtered=svcContracts.filter(c=>{
    if(q&&!c.num.toLowerCase().includes(q)&&!c.inv.toLowerCase().includes(q)&&!c.brand.toLowerCase().includes(q)&&!(c.landPlot||'').toLowerCase().includes(q))return false;
    return true;
  });


  // Populate year filter with distinct years found in readings
  const yfSel=document.getElementById('srv-rep-year-filter');
  if(yfSel){
    const years=[...new Set(meterReadings.map(r=>parseInt(r.year)))].filter(y=>!isNaN(y)).sort((a,b)=>b-a);
    const prevVal=yfSel.value;
    yfSel.innerHTML='<option value="">كل السنوات</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
    if(years.map(String).includes(prevVal))yfSel.value=prevVal;
  }
  const mfMonth=document.getElementById('srv-rep-month-filter')?.value||'';
  const mfYear=yfSel?.value||'';


  const waterReadings=meterReadings.filter(r=>r.meterType==='water');
  const elecReadings=meterReadings.filter(r=>r.meterType==='electricity');
  const totalReadings=meterReadings.length;
  const totalWater=waterReadings.length;
  const totalElec=elecReadings.length;
  const totalSvc=svcContracts.length;
  const totalContracts=contracts.length;
  document.getElementById('srv-rep-total').textContent=totalContracts;
  document.getElementById('srv-rep-svc-contracts').textContent=totalSvc;
  document.getElementById('srv-rep-total-readings').textContent=totalReadings;
  document.getElementById('srv-rep-water-readings').textContent=totalWater;
  document.getElementById('srv-rep-elec-readings').textContent=totalElec;
  const waterPct=totalReadings?Math.round(totalWater/totalReadings*100):0;
  const elecPct=totalReadings?Math.round(totalElec/totalReadings*100):0;
  document.getElementById('srv-rep-water-pct').textContent=waterPct+'%';
  document.getElementById('srv-rep-elec-pct').textContent=elecPct+'%';
  document.getElementById('srv-rep-water-bar').style.width=waterPct+'%';
  document.getElementById('srv-rep-elec-bar').style.width=elecPct+'%';
  document.getElementById('srv-rep-total-readings-big').textContent=totalReadings.toLocaleString('en');


  let sumWaterValue=0,sumElecValue=0;
  svcContracts.forEach(c=>{
    sumWaterValue+=getContractConsumptionValue(c.id,'water',mfMonth,mfYear).value;
    sumElecValue+=getContractConsumptionValue(c.id,'electricity',mfMonth,mfYear).value;
  });
  const waterValueEl=document.getElementById('srv-rep-water-value');
  const elecValueEl=document.getElementById('srv-rep-elec-value');
  if(waterValueEl)waterValueEl.textContent=sumWaterValue.toLocaleString('en')+' د.أ';
  if(elecValueEl)elecValueEl.textContent=sumElecValue.toLocaleString('en')+' د.أ';


  const tb=document.getElementById('srv-rep-body');
  const empty=document.getElementById('srv-rep-empty');
  const cnt=document.getElementById('srv-rep-count');
  if(cnt)cnt.textContent=filtered.length+' عقد';
  if(!filtered.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  tb.innerHTML=filtered.map((c,i)=>{
    const wCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='water').length;
    const eCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='electricity').length;
    const lastW=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='water').sort((a,b)=>new Date(b.readingDate)-new Date(a.readingDate))[0];
    const lastE=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='electricity').sort((a,b)=>new Date(b.readingDate)-new Date(a.readingDate))[0];
    if(tf==='water'&&!wCnt)return '';
    if(tf==='electricity'&&!eCnt)return '';
    const wCons=getContractConsumptionValue(c.id,'water',mfMonth,mfYear);
    const eCons=getContractConsumptionValue(c.id,'electricity',mfMonth,mfYear);
    const wValTxt=wCons.has?wCons.value.toLocaleString('en')+' د.أ':'—';
    const eValTxt=eCons.has?eCons.value.toLocaleString('en')+' د.أ':'—';
    return `<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num||'—'}</td>
      <td class="td-name">${c.inv||'—'}</td>
      <td class="td-brand">${c.brand||'—'}</td>
      <td>${c.landPlot||'—'}</td>
      <td>${c.waterMeter||'—'}</td>
      <td style="font-weight:700;color:var(--blue);font-size:15px">${wCnt}</td>
      <td>${c.electricMeter||'—'}</td>
      <td style="font-weight:700;color:var(--amber);font-size:15px">${eCnt}</td>
      <td style="font-size:13px">${lastW?new Date(lastW.readingDate).toLocaleDateString('ar-SA')+' ('+lastW.reading+')':'—'}</td>
      <td style="font-size:13px">${lastE?new Date(lastE.readingDate).toLocaleDateString('ar-SA')+' ('+lastE.reading+')':'—'}</td>
      <td style="font-weight:700;color:var(--blue);font-size:15px">${wValTxt}</td>
      <td style="font-weight:700;color:var(--amber);font-size:15px">${eValTxt}</td>
    </tr>`;
  }).filter(Boolean).join('');


  // Chart: readings per month (last 12 months)
  const months=[];const now=new Date();
  for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({m:d.getMonth()+1,y:d.getFullYear(),l:d.toLocaleDateString('ar-SA',{month:'short',year:'2-digit'})});}
  const waterData=months.map(m=>meterReadings.filter(r=>r.meterType==='water'&&parseInt(r.month)===m.m&&parseInt(r.year)===m.y).length);
  const elecData=months.map(m=>meterReadings.filter(r=>r.meterType==='electricity'&&parseInt(r.month)===m.m&&parseInt(r.year)===m.y).length);
  const labels=months.map(m=>m.l);
  const canvas=document.getElementById('srvChart');
  if(canvas&&typeof Chart!=='undefined'){
    if(srvChartInst){srvChartInst.destroy();srvChartInst=null;}
    srvChartInst=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:'ماء',data:waterData,borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,.1)',fill:true,tension:.3,pointRadius:3,pointBackgroundColor:'#2563eb'},{label:'كهرباء',data:elecData,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.1)',fill:true,tension:.3,pointRadius:3,pointBackgroundColor:'#f59e0b'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:10},boxWidth:12,usePointStyle:true}},title:{display:false}},scales:{y:{beginAtZero:true,ticks:{font:{size:10},stepSize:1},grid:{color:'rgba(0,0,0,.05)'}},x:{ticks:{font:{size:9}},grid:{display:false}}}}});
  }
}


/* ══════════════════════ METER CONSUMPTION REPORT (ماء / كهرباء) ══════════════════════ */
function renderMeterConsumptionReport(type){
  const pfx=type==='water'?'wtr':'elc';
  const unit=type==='water'?'م³':'ك.و.س';
  const yfSel=document.getElementById(pfx+'-rep-year');
  if(yfSel){
    const years=[...new Set(meterReadings.filter(r=>r.meterType===type).map(r=>parseInt(r.year)))].filter(y=>!isNaN(y)).sort((a,b)=>b-a);
    const prevVal=yfSel.value;
    yfSel.innerHTML='<option value="">كل السنوات</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
    if(years.map(String).includes(prevVal))yfSel.value=prevVal;
  }
  const mfMonth=document.getElementById(pfx+'-rep-month')?.value||'';
  const mfYear=yfSel?.value||'';
  const list=contracts.filter(c=>{
    const meter=type==='water'?c.waterMeter:c.electricMeter;
    if(!meter||!meter.trim())return false;
    return meterReadings.some(r=>r.contractId===c.id&&r.meterType===type);
  });
  let totQty=0,totVal=0,totRead=0;
  const rows=list.map(c=>{
    const readings=meterReadings.filter(r=>r.contractId===c.id&&r.meterType===type&&(mfMonth?parseInt(r.month)===parseInt(mfMonth):true)&&(mfYear?parseInt(r.year)===parseInt(mfYear):true));
    const cons=getContractConsumptionValue(c.id,type,mfMonth,mfYear);
    totQty+=cons.has?cons.diff:0;
    totVal+=cons.has?cons.value:0;
    totRead+=readings.length;
    return{c,readings:readings.length,cons};
  });
  const cntEl=document.getElementById(pfx+'-rep-count');
  if(cntEl)cntEl.textContent=list.length+' عقد';
  const kEls={contracts:document.getElementById(pfx+'-rep-contracts'),qty:document.getElementById(pfx+'-rep-qty'),value:document.getElementById(pfx+'-rep-value'),readings:document.getElementById(pfx+'-rep-readings')};
  if(kEls.contracts)kEls.contracts.textContent=list.length.toLocaleString('en');
  if(kEls.qty)kEls.qty.textContent=totQty.toLocaleString('en')+' '+unit;
  if(kEls.value)kEls.value.textContent=totVal.toLocaleString('en')+' د.أ';
  if(kEls.readings)kEls.readings.textContent=totRead.toLocaleString('en');
  const tb=document.getElementById(pfx+'-rep-body');
  const empty=document.getElementById(pfx+'-rep-empty');
  if(!list.length){if(tb)tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  if(!tb)return;
  tb.innerHTML=rows.map((x,i)=>{
    const meter=type==='water'?x.c.waterMeter:x.c.electricMeter;
    const qtyTxt=x.cons.has?x.cons.diff.toLocaleString('en')+' '+unit:'—';
    const valTxt=x.cons.has?x.cons.value.toLocaleString('en')+' د.أ':'—';
    const accent=type==='water'?'var(--blue)':'var(--amber)';
    return `<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${x.c.num||'—'}</td>
      <td>${x.c.acct||'—'}</td>
      <td style="font-weight:700;color:${accent};font-size:15px">${meter||'—'}</td>
      <td class="td-brand">${x.c.brand||'—'}</td>
      <td style="font-weight:700">${qtyTxt}</td>
      <td style="font-weight:700;color:var(--green)">${valTxt}</td>
      <td style="font-weight:700;color:var(--blue);font-size:15px">${x.readings.toLocaleString('en')}</td>
    </tr>`;
  }).join('');
}


/* ══════════════════════ HTML-TO-PDF HELPER (يدعم العربية) ══════════════════════ */
async function htmlTableToPDF({title,headers,rows,filename,landscape=true,showSummary=true,summaryRows=null}){
  if(typeof html2canvas==='undefined'){showToast('مكتبة html2canvas غير متوفرة',true);return;}
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF(landscape?'l':'p','mm','a4');
  const pdfW=landscape?297:210,pdfH=landscape?210:297;
  const m=10,mw=pdfW-m*2,mh=pdfH-m*2;
  const rw=landscape?1300:900;
  const rh=28;const hr=60;
  const availR=mw>0?((rw/mw)*mh-hr)/rh:30;
  const rpp=Math.max(5,Math.floor(availR));
  const chunks=[];
  for(let i=0;i<rows.length;i+=rpp)chunks.push(rows.slice(i,i+rpp));
  // Summary page first (if requested)
  let pageNum=0;
  if(showSummary&&summaryRows&&summaryRows.length){
    const sc=document.createElement('div');
    sc.style.cssText='position:fixed;left:-9999px;top:0;direction:rtl;font-family:system-ui,-apple-system,sans-serif;background:white;padding:15px;width:'+rw+'px';
    let sh='<div style="text-align:center;margin-bottom:10px;font-size:18px;font-weight:bold;color:#2563eb">'+title+' - Summary</div>';
    sh+='<table style="width:100%;border-collapse:collapse;direction:rtl;font-size:14px">';
    sh+='<thead><tr>'+summaryRows[0].map((h,i)=>{
      const cols=['المؤشر','القيمة','العدد','المبلغ','الحالة','البيان'];
      return'<th style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:5px 10px;border:1px solid #cbd5e1;text-align:right;font-weight:600;font-size:13px">'+(cols[i]||h)+'</th>';
    }).join('')+'</tr></thead>';
    sh+='<tbody>'+summaryRows.map((row,i)=>'<tr'+(i%2===1?' style="background:#f8fafc"':'')+'>'+row.map(c=>'<td style="padding:4px 10px;border:1px solid #e2e8f0;text-align:right;font-size:13px;color:#0f172a">'+(c??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
    sh+='<div style="text-align:left;font-size:11px;color:#94a3b8;margin-top:6px">Page 1 of '+(chunks.length+1)+' | '+new Date().toLocaleDateString('en-GB')+'</div>';
    sc.innerHTML=sh;document.body.appendChild(sc);
    await new Promise(r=>setTimeout(r,60));
    const sCan=await html2canvas(sc,{scale:3,useCORS:true,backgroundColor:'#ffffff',width:rw,height:sc.scrollHeight});
    document.body.removeChild(sc);
    const sD=sCan.toDataURL('image/png');
    const sS=mw/sCan.width;
    pdf.addImage(sD,'JPEG',m,m,mw,Math.min(sCan.height*sS,mh));
    pageNum=1;
  }
  for(let p=0;p<chunks.length;p++){
    if(p>0||pageNum>0)pdf.addPage();
    const ctr=document.createElement('div');
    ctr.style.cssText='position:fixed;left:-9999px;top:0;direction:rtl;font-family:system-ui,-apple-system,sans-serif;background:white;padding:10px;width:'+rw+'px';
    let html='<div style="text-align:center;margin-bottom:6px;font-size:16px;font-weight:bold;color:#2563eb">'+title+'</div>';
    html+='<table style="width:100%;border-collapse:collapse;direction:rtl;font-size:14px">';
    html+='<thead><tr>'+headers.map(h=>'<th style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:5px 7px;border:1px solid #cbd5e1;text-align:right;font-weight:600;font-size:13px">'+h+'</th>').join('')+'</tr></thead>';
    html+='<tbody>'+chunks[p].map((row,i)=>'<tr'+(i%2===1?' style="background:#f8fafc"':'')+'>'+row.map(c=>'<td style="padding:3px 7px;border:1px solid #e2e8f0;text-align:right;font-size:13px;color:#0f172a">'+(c??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
    html+='<div style="text-align:left;font-size:11px;color:#94a3b8;margin-top:5px">Page '+(pageNum+p+1)+' of '+(pageNum+chunks.length)+' | '+new Date().toLocaleDateString('en-GB')+'</div>';
    ctr.innerHTML=html;document.body.appendChild(ctr);
    await new Promise(r=>setTimeout(r,50));
    const can=await html2canvas(ctr,{scale:3,useCORS:true,backgroundColor:'#ffffff',width:rw,height:ctr.scrollHeight});
    document.body.removeChild(ctr);
    const iD=can.toDataURL('image/png');
    const s=mw/can.width;
    pdf.addImage(iD,'JPEG',m,m,mw,Math.min(can.height*s,mh));
  }
  pdf.save(filename);
}


/* ══════════════════════ EXPORT PDF (مع دعم العربية) ══════════════════════ */
async function exportPDF(){if(!erpRequire('contracts','export'))return;
  if(session&&!(session.role==='admin'||(session.permissions&&session.permissions.export))){showToast('ليس لديك صلاحية التصدير',true);return;}
  try{
    const filtered=applyFilters();
    const a=contracts.filter(c=>c.status==='active').length,so=contracts.filter(c=>c.status==='soon').length,
          en=contracts.filter(c=>c.status==='ended').length,ca=contracts.filter(c=>c.status==='cancelled').length;
    const tR=contracts.reduce((s,c)=>s+getTotalRent(c),0),tS=contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0),
          tK=contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0),tT=contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
    const G=tR+tS+tK+tT;
    const headers=['#','رقم العقد','النوع','المستأجر','العلامة','الموقع','المدة','البدء','الانتهاء','الإيجار','خدمات','معارف','ضريبة','الإجمالي','الحالة'];
    const rows=filtered.map((c,i)=>{const r=getTotalRent(c);const sv=c.svcAmt||Math.round(r*(c.svcRate??10)/100);const kn=c.knwAmt||Math.round(r*(c.knwRate??2)/100);const tx=c.taxAmt||Math.round(sv*(c.taxRate??16)/100);return[i+1,c.num,TYPE_CFG[c.type]?.ar||'',c.inv,c.brand,c.locationCode||'',c.term,c.start||'',c.expiry||'',r.toLocaleString(),sv.toLocaleString(),kn.toLocaleString(),tx.toLocaleString(),(r+sv+kn+tx).toLocaleString(),STATUS_CFG[c.status]?.ar||''];});
    const sumRows=[['إجمالي العقود',contracts.length],['عقود نشطة',a],['عقود تنتهي قريباً',so],['عقود منتهية',en],['عقود ملغية',ca],['إجمالي الإيجار',Math.round(tR).toLocaleString()+' د.أ'],['بدل الخدمات',Math.round(tS).toLocaleString()+' د.أ'],['بدل المعارف',Math.round(tK).toLocaleString()+' د.أ'],['ضريبة المبيعات',Math.round(tT).toLocaleString()+' د.أ'],['الإجمالي الكلي',Math.round(G).toLocaleString()+' د.أ']];
    await htmlTableToPDF({title:'Lease Contracts Report - '+new Date().toLocaleDateString('en-GB'),headers,rows,filename:'contracts_report_'+new Date().toISOString().slice(0,10)+'.pdf',landscape:true,showSummary:true,summaryRows:sumRows});
    showToast('✅ تم تصدير PDF بنجاح');
  }catch(e){showToast('خطأ في تصدير PDF: '+e.message,true);}
}


/* ══════════════════════ EXPORT EXCEL (محسّن) ══════════════════════ */
/* ══════════════════════ IMPORT CONTRACTS FROM EXCEL ══════════════════════ */
// Tailored for the "جميع العقود" sheet layout: header row 14, data starts row 16.
// Columns (0-based, matching sheet columns A=0,B=1,...):
//  C(2)=رقم العقد  D(3)=رقم الحساب  E(4)=المستأجر  F(5)=العلامة التجارية
//  H(7)=الشهر  I(8)=مدة العقد  J(9)=تاريخ البدء  K(10)=تاريخ الانتهاء  L(11)=المساحة
//  M..AC(12..28) = قيمة الإيجار لكل سنة بالتسلسل بدءاً من سنة البدء
//  AD(29)=عدد الدفعات  AF(31)=هاتف المفوض  AG(32)=هاتف المحاسب/المالي
function triggerImportExcel(){if(!erpRequire('contracts','import'))return;
  if(!erpRequire('contracts','import'))return;
  document.getElementById('importExcelInput').click();
}
function handleImportExcelFile(e){if(!erpRequire('contracts','import'))return;
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const data=new Uint8Array(ev.target.result);
      const wbIn=XLSX.read(data,{type:'array',cellDates:true});
      const sheetName=wbIn.SheetNames.find(n=>n.indexOf('جميع العقود')>=0)||wbIn.SheetNames[0];
      const ws=wbIn.Sheets[sheetName];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null});
      let added=0,updated=0,skipped=0;
      const toDateStr=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+dd;};
      for(let r=15;r<rows.length;r++){
        const row=rows[r];if(!row||!row[2]){continue;}
        const num=String(row[2]).trim();if(!num){continue;}
        const start=row[9],expiry=row[10];
        if(!(start instanceof Date)||!(expiry instanceof Date)||isNaN(start)||isNaN(expiry)){skipped++;continue;}
        const acct=row[3]!=null?String(row[3]).trim():'';
        const inv=row[4]!=null?String(row[4]).trim():'';
        const brand=row[5]!=null?String(row[5]).trim():'';
        const month=row[7]||'';
        const term=parseFloat(row[8])||1;
        const areaVal=parseFloat(row[11]);
        const area=isNaN(areaVal)?'':areaVal;
        const numPayments=parseInt(row[29])||2;
        const phone1=row[31]!=null?String(row[31]).trim():'';
        const phone2=row[32]!=null?String(row[32]).trim():'';
        const startYear=start.getFullYear();
        const rentYears={};
        for(let ci=12,yi=0;ci<=28;ci++,yi++){
          const val=row[ci];
          if(typeof val==='number'&&val>0)rentYears[String(startYear+yi)]=Math.round(val);
        }
        const type=acct.endsWith('620')?'warehouse':'commercial';
        const daysLeft=Math.ceil((expiry-new Date())/86400000);
        const status=daysLeft<0?'ended':(daysLeft<=90?'soon':'active');
        const obj={num,acct,inv,brand,month,term,start:toDateStr(start),expiry:toDateStr(expiry),area,rentYears,taxRate:16,numPayments,status,type,delPhone:phone1,finPhone:phone2};
        const idx=contracts.findIndex(c=>c.num===num);
        if(idx>=0){
          contracts[idx]={...contracts[idx],...obj};
          updated++;
        }else{
          contracts.push({id:'imp_'+Date.now()+'_'+added+'_'+Math.floor(Math.random()*1000),delName:'',finName:'',notes:'',payments:[],...obj});
          added++;
        }
      }
      if(added||updated){
        saveContractsLocal();
        showToast('✅ تم الاستيراد: '+added+' عقد جديد، '+updated+' عقد محدّث'+(skipped?('، '+skipped+' صف تم تجاوزه'):''));
        try{if(typeof initApp==='function')initApp();}catch(renderErr){console.warn('تم حفظ البيانات بنجاح، لكن صار خطأ بسيط بتحديث الشاشة — أعيدي تحميل الصفحة (F5) لعرضها.',renderErr);}
      }else{
        showToast('لم يتم استيراد أي عقد — تأكدي من صيغة الملف'+(skipped?(' ('+skipped+' صف تم تجاوزه)'):''),true);
      }
    }catch(err){
      showToast('خطأ في استيراد الملف: '+err.message,true);
    }finally{
      e.target.value='';
    }
  };
  reader.readAsArrayBuffer(file);
}


function exportExcel(){if(!erpRequire('contracts','export'))return;
  if(session&&!(session.role==='admin'||(session.permissions&&session.permissions.export))){showToast('ليس لديك صلاحية التصدير',true);return;}
  try{
    const filtered=applyFilters();
    const allYears=[...new Set(contracts.flatMap(c=>c.rentYears?Object.keys(c.rentYears):[]))].sort();
    const yrHeaders=allYears.map(y=>'إيجار '+y);
    const headers=['#','رقم العقد','رقم الحساب','النوع','المستأجر','العلامة التجارية','الموقع','المدة (سنوات)','تاريخ البدء','تاريخ الانتهاء','عدد الدفعات','المساحة (م²)','عداد الكهرباء','عداد الماء','الحالة','الجهة المفوضة','رقم الجهة المفوضة','الجهة المالية','رقم الجهة المالية','عنوان المستثمر كما هو في السجل التجاري',...yrHeaders,'إجمالي الإيجار','بدل الخدمات','بدل المعارف','ضريبة المبيعات','الإجمالي الكلي'];
    const rows=filtered.map((c,i)=>{
      const rent=getTotalRent(c);
      const svc=c.svcAmt||Math.round(rent*(c.svcRate??10)/100);
      const knw=c.knwAmt||Math.round(rent*(c.knwRate??2)/100);
      const tax=c.taxAmt||Math.round(svc*(c.taxRate??16)/100);
      const grand=rent+svc+knw+tax;
      const yrVals=allYears.map(y=>c.rentYears?.[y]||'');
      return[i+1,c.num,c.acct||'',TYPE_CFG[c.type]?.ar||'',c.inv,c.brand,c.locationCode||'',c.term,c.start||'',c.expiry||'',c.numPayments||1,c.area||'',c.electricMeter||'',c.waterMeter||'',STATUS_CFG[c.status]?.ar||'',c.delName||'',c.delPhone||'',c.finName||'',c.finPhone||'',c.notes||'',...yrVals,rent,svc,knw,tax,grand];
    });
    const wb=XLSX.utils.book_new();
    // Sheet 1: Contracts (detailed)
    const ws=XLSX.utils.aoa_to_sheet([headers,...rows]);
    ws['!cols']=headers.map((_,i)=>({wch:i<2?5:i<4?18:14}));
    XLSX.utils.book_append_sheet(wb,ws,'العقود');
    // Sheet 2: Summary
    const a=contracts.filter(c=>c.status==='active').length,s=contracts.filter(c=>c.status==='soon').length,e=contracts.filter(c=>c.status==='ended').length,ca=contracts.filter(c=>c.status==='cancelled').length;
    const tR=contracts.reduce((s,c)=>s+getTotalRent(c),0),tS=contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0),
        tK=contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0),tT=contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
    const tArea=contracts.reduce((s,c)=>s+(parseFloat(c.area)||0),0);
    const ws2=XLSX.utils.aoa_to_sheet([
      ['المؤشر','القيمة'],
      ['إجمالي العقود',contracts.length],
      ['عقود نشطة',a],['عقود تنتهي قريباً',s],['عقود منتهية',e],['عقود ملغية',ca],
      ['إجمالي المساحة (م²)',Math.round(tArea*100)/100],
      ['إجمالي الإيجار',Math.round(tR)],
      ['إجمالي بدل الخدمات',Math.round(tS)],
      ['إجمالي بدل المعارف',Math.round(tK)],
      ['إجمالي ضريبة المبيعات',Math.round(tT)],
      ['الإجمالي الكلي',Math.round(tR+tS+tK+tT)],
      [],['--- التحليل حسب النوع ---'],
      ['النوع','العدد','الإيجار الإجمالي','خدمات','معارف','ضريبة','الإجمالي الكلي'],
      ...['commercial','warehouse','investment','short','kiosk'].map(typ=>{
        const cc=contracts.filter(x=>x.type===typ);if(!cc.length)return null;
        const r=cc.reduce((s,x)=>s+getTotalRent(x),0),sv=cc.reduce((s,x)=>s+(x.svcAmt||Math.round(getTotalRent(x)*(x.svcRate??10)/100)),0),
            kn=cc.reduce((s,x)=>s+(x.knwAmt||Math.round(getTotalRent(x)*(x.knwRate??2)/100)),0),tx=cc.reduce((s,x)=>s+(x.taxAmt||Math.round(getTotalRent(x)*(x.taxRate??16)/100)),0);
        return[TYPE_CFG[typ]?.ar||typ,cc.length,Math.round(r),Math.round(sv),Math.round(kn),Math.round(tx),Math.round(r+sv+kn+tx)];
      }).filter(Boolean),
      [],['--- التحليل حسب الحالة ---'],
      ['الحالة','العدد','الإيجار الإجمالي','خدمات','معارف','ضريبة','الإجمالي الكلي'],
      ...['active','soon','ended','cancelled'].map(st=>{
        const cc=contracts.filter(x=>x.status===st);if(!cc.length)return null;
        const r=cc.reduce((s,x)=>s+getTotalRent(x),0),sv=cc.reduce((s,x)=>s+(x.svcAmt||Math.round(getTotalRent(x)*(x.svcRate??10)/100)),0),
            kn=cc.reduce((s,x)=>s+(x.knwAmt||Math.round(getTotalRent(x)*(x.knwRate??2)/100)),0),tx=cc.reduce((s,x)=>s+(x.taxAmt||Math.round(getTotalRent(x)*(x.taxRate??16)/100)),0);
        return[STATUS_CFG[st]?.ar||st,cc.length,Math.round(r),Math.round(sv),Math.round(kn),Math.round(tx),Math.round(r+sv+kn+tx)];
      }).filter(Boolean)
    ]);
    ws2['!cols']=[{wch:25},{wch:20}];
    XLSX.utils.book_append_sheet(wb,ws2,'ملخص شامل');
    // Sheet 3: Yearly rent breakdown
    const yrH=['#','رقم العقد','المستأجر','العلامة','السنة','الإيجار السنوي','بدل الخدمات','بدل المعارف','ضريبة','الإجمالي'];
    const yrRows=[];
    filtered.forEach((c,i)=>{
      if(!c.rentYears)return;
      Object.keys(c.rentYears).sort().forEach(yr=>{
        const r=c.rentYears[yr];if(!r)return;
        const sv=Math.round(r*(c.svcRate??10)/100),kn=Math.round(r*(c.knwRate??2)/100),tx=Math.round(sv*(c.taxRate??16)/100);
        yrRows.push([i+1,c.num,c.inv,c.brand,parseInt(yr),r,sv,kn,tx,r+sv+kn+tx]);
      });
    });
    const ws3=XLSX.utils.aoa_to_sheet([yrH,...yrRows]);
    ws3['!cols']=[{wch:5},{wch:15},{wch:22},{wch:18},{wch:8},{wch:14},{wch:12},{wch:12},{wch:12},{wch:14}];
    XLSX.utils.book_append_sheet(wb,ws3,'الإيجار السنوي');
    // Sheet 4: Payment schedule
    const now4=new Date();
    const allPmts=[];
    filtered.forEach(c=>{
      if(c.status==='cancelled'||c.status==='ended'||!c.payments)return;
      c.payments.forEach(p=>{
        const pd=new Date(p.date);
        allPmts.push([c.num,c.inv,c.brand,c.locationCode||'',p.date,p.amount||0,Math.ceil((pd-now4)/86400000),STATUS_CFG[c.status]?.ar||'']);
      });
    });
    allPmts.sort((a,b)=>a[5]-b[5]||a[4].localeCompare(b[4]));
    const ws4=XLSX.utils.aoa_to_sheet([['رقم العقد','المستأجر','العلامة','الموقع','تاريخ الدفعة','المبلغ (د.أ)','الأيام المتبقية','حالة العقد'],...allPmts]);
    ws4['!cols']=[{wch:16},{wch:22},{wch:18},{wch:14},{wch:14},{wch:14},{wch:12},{wch:12}];
    XLSX.utils.book_append_sheet(wb,ws4,'الدفعات');
    // Sheet 5: Timeline (contracts by year)
    const years=[...new Set(contracts.map(c=>c.start?new Date(c.start).getFullYear():null).filter(Boolean))].sort();
    const tlH=['السنة','عقود جديدة','إجمالي الإيجار'];
    const tlRows=years.map(yr=>{
      const cc=contracts.filter(c=>c.start&&new Date(c.start).getFullYear()===yr);
      return[yr,cc.length,Math.round(cc.reduce((s,c)=>s+getTotalRent(c),0))];
    });
    const ws5=XLSX.utils.aoa_to_sheet([tlH,...tlRows]);
    XLSX.utils.book_append_sheet(wb,ws5,'الجدول الزمني');
    // Sheet 6: Location analysis
    const locs=[];
    contracts.filter(c=>c.locationCode).forEach(c=>{
      const floor=(c.locationCode||'').split('-')[0];
      const zone=(c.locationCode||'').split('-').slice(1).join('-');
      locs.push([c.locationCode,floor,zone,c.inv,c.brand,parseFloat(c.area)||'',getTotalRent(c),STATUS_CFG[c.status]?.ar||'']);
    });
    const ws6=XLSX.utils.aoa_to_sheet([['كود الموقع','الطابق','المبنى/المحل','المستأجر','العلامة','المساحة (م²)','إجمالي الإيجار','الحالة'],...locs]);
    ws6['!cols']=[{wch:14},{wch:8},{wch:16},{wch:22},{wch:18},{wch:12},{wch:14},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws6,'المواقع');
    XLSX.writeFile(wb,'contracts_'+new Date().toISOString().slice(0,10)+'.xlsx');
    showToast('\u2705 '.toUpperCase()+'تم تصدير Excel بنجاح');
  }catch(e){showToast('خطأ في تصدير Excel: '+e.message,true);}
}


