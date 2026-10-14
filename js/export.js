/* ═══ 5B Mall — Export (PDF + Excel) ═══ */
/* ══════════════════════ EXPORT REPORT (PDF + EXCEL) ══════════════════════ */
async function exportReportPDF(){if(!erpRequire('reports','export'))return;
  if(activeReportTabId==='rep-meter'){if(hasPerm('export')&&getAllowedReports(session).includes('rep-meter'))printCurrentPage();return;}
  if(session&&!(erpCan('reports','export'))){showToast('ليس لديك صلاحية التصدير',true);return;}
  try{
    const activePanel=document.querySelector('.report-panel.active');
    if(!activePanel){showToast('لا يوجد تقرير نشط',true);return;}
    const rid=activePanel.id;const now=new Date();
    const titles={rep1:'Financial Summary Report',rep2:'Ended Contracts Report',rep3:'Yearly Analysis Report',rep4:'Rented Locations Report',rep5:'Parties List Report',rep7:'Payments & Collections Report',rep8:'Soon to Expire Contracts Report',rep9:'Area Report','rep-water':'Water Consumption Report','rep-elec':'Electricity Consumption Report','rep-srv':'Services Report'};
    const title=titles[rid]||'Report';
    const fname=rid+'_report_'+new Date().toISOString().slice(0,10)+'.pdf';
    if(rid==='rep1'){
      const tR=contracts.reduce((s,c)=>s+getTotalRent(c),0),tS=contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0),tK=contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0),tT=contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
      const a=contracts.filter(c=>c.status==='active').length,so=contracts.filter(c=>c.status==='soon').length,en=contracts.filter(c=>c.status==='ended').length,ca=contracts.filter(c=>c.status==='cancelled').length;
      const filtered=getRepFilteredContracts();
      const headers=['#','رقم العقد','المستأجر','الإيجار','خدمات','معارف','ضريبة','الإجمالي'];
      const rows=filtered.map((c,i)=>{const r=getTotalRent(c),sv=c.svcAmt||Math.round(r*(c.svcRate??10)/100),kn=c.knwAmt||Math.round(r*(c.knwRate??2)/100),tx=c.taxAmt||Math.round(sv*(c.taxRate??16)/100);return[i+1,c.num,c.inv,r.toLocaleString(),sv.toLocaleString(),kn.toLocaleString(),tx.toLocaleString(),(r+sv+kn+tx).toLocaleString()];});
      const sumRows=[['إجمالي الإيجار',Math.round(tR).toLocaleString()+' د.أ'],['بدل الخدمات',Math.round(tS).toLocaleString()+' د.أ'],['بدل المعارف',Math.round(tK).toLocaleString()+' د.أ'],['ضريبة المبيعات',Math.round(tT).toLocaleString()+' د.أ'],['الإجمالي الكلي',Math.round(tR+tS+tK+tT).toLocaleString()+' د.أ'],['العقود النشطة',a],['تنتهي قريباً',so],['منتهية',en],['ملغية',ca]];
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:true,showSummary:true,summaryRows:sumRows});
    }else if(rid==='rep2'){
      const ended=contracts.filter(c=>c.status==='ended');
      const headers=['#','رقم العقد','المستأجر','العلامة','تاريخ البدء','تاريخ الانتهاء','المدة'];
      const rows=ended.map((c,i)=>[i+1,c.num,c.inv,c.brand,c.start||'',c.expiry||'',c.term+' سنة']);
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:false,showSummary:false});
    }else if(rid==='rep8'){
      const soon=contracts.filter(c=>c.status==='soon');
      const headers=['#','رقم العقد','المستأجر','العلامة','تاريخ الانتهاء','الأيام المتبقية','المدة'];
      const rows=soon.map((c,i)=>[i+1,c.num,c.inv,c.brand,c.expiry||'',c.expiry?Math.ceil((new Date(c.expiry)-now)/86400000)+' يوم':'—',c.term+' سنة']);
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:false,showSummary:false});
    }else if(rid==='rep3'){
      const ym={};
      contracts.filter(c=>c.status!=='cancelled').forEach(c=>{const sy=c.start?new Date(c.start).getFullYear():null;if(!sy)return;if(!ym[sy])ym[sy]={c:0,r:0,s:0,k:0,t:0};const r=getTotalRent(c);ym[sy].c++;ym[sy].r+=r;ym[sy].s+=c.svcAmt||Math.round(r*(c.svcRate??10)/100);ym[sy].k+=c.knwAmt||Math.round(r*(c.knwRate??2)/100);ym[sy].t+=c.taxAmt||Math.round(r*(c.taxRate??16)/100);});
      const yrs=Object.keys(ym).sort();
      const headers=['السنة','عدد العقود','الإيجار','خدمات','معارف','ضريبة','الإجمالي'];
      const rows=yrs.map(yr=>{const d=ym[yr];return[yr,d.c+' عقد',Math.round(d.r).toLocaleString(),Math.round(d.s).toLocaleString(),Math.round(d.k).toLocaleString(),Math.round(d.t).toLocaleString(),Math.round(d.r+d.s+d.k+d.t).toLocaleString()];});
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:true,showSummary:false});
    }else if(rid==='rep4'){
      const lr=contracts.filter(c=>c.locationCode);
      const headers=['#','كود الموقع','الطابق','المبنى/المحل','المستأجر','العلامة','الحالة'];
      const rows=lr.map((c,i)=>[i+1,c.locationCode,(c.locationCode||'').split('-')[0],(c.locationCode||'').split('-').slice(1).join('-'),c.inv,c.brand,STATUS_CFG[c.status]?.ar||'']);
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:false,showSummary:false});
    }else if(rid==='rep5'){
      const inv=[...new Set(contracts.map(c=>c.inv).filter(Boolean))].sort(),del=[...new Set(contracts.map(c=>c.delName+(c.delPhone?' ('+c.delPhone+')':'')).filter(Boolean))].sort(),fin=[...new Set(contracts.map(c=>c.finName+(c.finPhone?' ('+c.finPhone+')':'')).filter(Boolean))].sort();
      const max=Math.max(inv.length,del.length,fin.length);const rows=[];
      for(let i=0;i<max;i++)rows.push([inv[i]||'',del[i]||'',fin[i]||'']);
      await htmlTableToPDF({title,headers:['المستثمرين','الجهات المفوضة','الجهات المالية'],rows,filename:fname,landscape:true,showSummary:false});
    }else if(rid==='rep7'){
      const pmts=[];
      contracts.forEach(c=>{if(c.status==='cancelled'||c.status==='ended'||!c.payments)return;c.payments.forEach(p=>{const pd=new Date(p.date);if(pd<now)return;pmts.push([c.num,c.inv,c.brand,p.date,(p.amount||0).toLocaleString()+' د.أ',Math.ceil((pd-now)/86400000)+' يوم']);});});
      pmts.sort((a,b)=>parseInt(a[5])-parseInt(b[5]));
      await htmlTableToPDF({title,headers:['رقم العقد','المستأجر','العلامة','تاريخ الدفعة','المبلغ','الأيام المتبقية'],rows:pmts,filename:fname,landscape:false,showSummary:false});
    }else if(rid==='rep9'){
      const headers=['المبنى','الطابق','رقم المحل','مساحة المحل (م²)'];
      const rows=Array.from(document.querySelectorAll('#rep9TableBody tr')).map(tr=>Array.from(tr.cells).map(td=>td.textContent.trim()));
      const summaryRows=[['المبنى',document.getElementById('rep9BuildingFilter').value||'جميع المباني'],['الطابق',document.getElementById('rep9FloorFilter').value||'جميع الطوابق'],['مجموع المساحة الشاغرة',document.getElementById('rep9-avg-area').textContent],['عدد المحلات الشاغرة',document.getElementById('rep9-vacant-count').textContent]];
      const groups=Array.from(document.querySelectorAll('#rep9BuildingSummary tr')).filter(tr=>tr.cells.length===4).map(tr=>Array.from(tr.cells).map(td=>td.textContent.trim()));
      summaryRows.push(...groups.map(g=>['المبنى '+g[0]+'، '+g[1],g[2]+' محل، '+g[3]+' م²']));
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:true,summaryRows});
    }else if(rid==='rep-srv'){
      const svcContracts=getServiceContracts();
      const mfMonth=document.getElementById('srv-rep-month-filter')?.value||'';
      const mfYear=document.getElementById('srv-rep-year-filter')?.value||'';
      const monthLabel=(mfMonth||mfYear)?((mfMonth?'شهر '+mfMonth:'كل الأشهر')+(mfYear?' - '+mfYear:'')):'كل الأشهر (إجمالي)';
      const headers=['#','رقم العقد','المستأجر','العلامة','عداد الماء','قراءات الماء','عداد الكهرباء','قراءات الكهرباء','قيمة استهلاك الماء','قيمة استهلاك الكهرباء'];
      let sumWaterValue=0,sumElecValue=0;
      const rows=svcContracts.map((c,i)=>{
        const wCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='water').length;
        const eCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='electricity').length;
        const wCons=getContractConsumptionValue(c.id,'water',mfMonth,mfYear);
        const eCons=getContractConsumptionValue(c.id,'electricity',mfMonth,mfYear);
        sumWaterValue+=wCons.value;sumElecValue+=eCons.value;
        return[i+1,c.num||'',c.inv||'',c.brand||'',c.waterMeter||'—',wCnt,eCnt?c.electricMeter||'—':'—',eCnt,wCons.has?wCons.value.toLocaleString()+' د.أ':'—',eCons.has?eCons.value.toLocaleString()+' د.أ':'—'];
      });
      const totalReadings=meterReadings.length;
      const waterReadings=meterReadings.filter(r=>r.meterType==='water').length;
      const elecReadings=meterReadings.filter(r=>r.meterType==='electricity').length;
      const sumRows=[['إجمالي العقود',contracts.length],['عقود الخدمات',svcContracts.length],['إجمالي القراءات',totalReadings],['قراءات الماء',waterReadings],['قراءات الكهرباء',elecReadings],['الفترة',monthLabel],['قيمة استهلاك الماء',Math.round(sumWaterValue).toLocaleString()+' د.أ'],['قيمة استهلاك الكهرباء',Math.round(sumElecValue).toLocaleString()+' د.أ']];
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:true,showSummary:true,summaryRows:sumRows});
    }else if(rid==='rep-water'||rid==='rep-elec'){
      const type=rid==='rep-water'?'water':'electricity';
      const unit=type==='water'?'م³':'ك.و.س';
      const pfx=type==='water'?'wtr':'elc';
      const mfMonth=document.getElementById(pfx+'-rep-month')?.value||'';
      const mfYear=document.getElementById(pfx+'-rep-year')?.value||'';
      const periodLabel=(mfMonth||mfYear)?((mfMonth?'شهر '+mfMonth:'كل الأشهر')+(mfYear?' - '+mfYear:'')):'كل الأشهر (إجمالي)';
      const headers=['#','رقم العقد','رقم الحساب','رقم العداد','العلامة التجارية','كمية الاستهلاك الكلي ('+unit+')','قيمة الاستهلاك الكلي (د.أ)','عدد القراءات'];
      const list=contracts.filter(c=>{
        const meter=type==='water'?c.waterMeter:c.electricMeter;
        if(!meter||!meter.trim())return false;
        return meterReadings.some(r=>r.contractId===c.id&&r.meterType===type);
      });
      let totQty=0,totVal=0,totRead=0;
      const rows=list.map((c,i)=>{
        const meter=type==='water'?c.waterMeter:c.electricMeter;
        const rds=meterReadings.filter(r=>r.contractId===c.id&&r.meterType===type&&(mfMonth?parseInt(r.month)===parseInt(mfMonth):true)&&(mfYear?parseInt(r.year)===parseInt(mfYear):true));
        const cons=getContractConsumptionValue(c.id,type,mfMonth,mfYear);
        totQty+=cons.has?cons.diff:0;
        totVal+=cons.has?cons.value:0;
        totRead+=rds.length;
        return[i+1,c.num||'',c.acct||'',meter||'—',c.brand||'',cons.has?cons.diff.toLocaleString()+' '+unit:'—',cons.has?cons.value.toLocaleString()+' د.أ':'—',rds.length];
      });
      const sumRows=[['إجمالي العقود',list.length],['الفترة',periodLabel],['إجمالي كمية الاستهلاك',Math.round(totQty).toLocaleString()+' '+unit],['إجمالي قيمة الاستهلاك',Math.round(totVal).toLocaleString()+' د.أ'],['إجمالي عدد القراءات',totRead]];
      await htmlTableToPDF({title,headers,rows,filename:fname,landscape:true,showSummary:true,summaryRows:sumRows});
    }
    showToast('✅ تم تصدير تقرير PDF بنجاح');
  }catch(e){showToast('خطأ في تصدير التقرير PDF: '+e.message,true);}
}
function exportReportExcel(){if(!erpRequire('reports','export'))return;
  if(activeReportTabId==='rep-meter'){document.getElementById('meter-export')?.click();return;}
  if(session&&!(erpCan('reports','export'))){showToast('ليس لديك صلاحية التصدير',true);return;}
  try{
    const activePanel=document.querySelector('.report-panel.active');
    if(!activePanel){showToast('لا يوجد تقرير نشط',true);return;}
    const rid=activePanel.id;const wb=XLSX.utils.book_new();
    const names={rep1:'financial',rep2:'ended',rep3:'yearly',rep4:'locations',rep5:'parties',rep7:'payments',rep8:'soon_expire',rep9:'area','rep-water':'water_consumption','rep-elec':'electricity_consumption','rep-srv':'services_report'};
    if(rid==='rep1'){
      const tR=contracts.reduce((s,c)=>s+getTotalRent(c),0),tS=contracts.reduce((s,c)=>s+(c.svcAmt||Math.round(getTotalRent(c)*(c.svcRate??10)/100)),0),tK=contracts.reduce((s,c)=>s+(c.knwAmt||Math.round(getTotalRent(c)*(c.knwRate??2)/100)),0),tT=contracts.reduce((s,c)=>s+(c.taxAmt||Math.round(getTotalRent(c)*(c.taxRate??16)/100)),0);
      // Summary sheet with more KPIs
      const a=contracts.filter(c=>c.status==='active').length,sn=contracts.filter(c=>c.status==='soon').length,ed=contracts.filter(c=>c.status==='ended').length,ca=contracts.filter(c=>c.status==='cancelled').length;
      const tArea=contracts.reduce((s,c)=>s+(parseFloat(c.area)||0),0);
      const ws1=XLSX.utils.aoa_to_sheet([
        ['المؤشر','القيمة (د.أ)'],
        ['إجمالي العقود',contracts.length],
        ['عقود نشطة',a],['عقود تنتهي قريباً',sn],['عقود منتهية',ed],['عقود ملغية',ca],
        ['إجمالي المساحة (م²)',Math.round(tArea*100)/100],
        ['إجمالي الإيجار',Math.round(tR)],
        ['بدل الخدمات',Math.round(tS)],
        ['بدل المعارف',Math.round(tK)],
        ['ضريبة المبيعات',Math.round(tT)],
        ['الإجمالي الكلي',Math.round(tR+tS+tK+tT)],
        [],['--- التحليل حسب النوع ---'],
        ['النوع','العدد','إجمالي الإيجار','خدمات','معارف','ضريبة','الإجمالي'],
        ...['commercial','warehouse','investment','short','kiosk'].map(typ=>{
          const cc=contracts.filter(x=>x.type===typ);if(!cc.length)return null;
          const r=cc.reduce((s,x)=>s+getTotalRent(x),0),sv=cc.reduce((s,x)=>s+(x.svcAmt||Math.round(getTotalRent(x)*(x.svcRate??10)/100)),0),
              kn=cc.reduce((s,x)=>s+(x.knwAmt||Math.round(getTotalRent(x)*(x.knwRate??2)/100)),0),tx=cc.reduce((s,x)=>s+(x.taxAmt||Math.round(getTotalRent(x)*(x.taxRate??16)/100)),0);
          return[TYPE_CFG[typ]?.ar||typ,cc.length,Math.round(r),Math.round(sv),Math.round(kn),Math.round(tx),Math.round(r+sv+kn+tx)];
        }).filter(Boolean)
      ]);
      XLSX.utils.book_append_sheet(wb,ws1,'ملخص مالي');
      // Detailed contracts with yearly rent columns
      const filtered=getRepFilteredContracts(),selYear=document.getElementById('repFilterYear')?.value||'';
      const allYears=[...new Set(filtered.flatMap(c=>c.rentYears?Object.keys(c.rentYears):[]))].sort();
      const yrHeaders=allYears.map(y=>'إيجار '+y);
      const h1=['#','رقم العقد','رقم الحساب','النوع','المستأجر','العلامة','الموقع','المدة','البدء','الانتهاء','الحالة','عدد الدفعات','المساحة (م²)',...yrHeaders,'إجمالي الإيجار','خدمات','معارف','ضريبة','الإجمالي'];
      const rows=filtered.map((c,i)=>{
        const yrVals=allYears.map(y=>c.rentYears?.[y]||'');
        let r=0;if(selYear&&c.rentYears?.[selYear]){r=c.rentYears[selYear];}else{const k=Object.keys(c.rentYears||{}).sort();const yr=k[k.length-1]||'';r=c.rentYears?.[yr]||0;}
        const sv=Math.round(r*(c.svcRate??10)/100),kn=Math.round(r*(c.knwRate??2)/100),tx=Math.round(sv*(c.taxRate??16)/100);
        const totalRent=getTotalRent(c);
        return[i+1,c.num,c.acct||'',TYPE_CFG[c.type]?.ar||'',c.inv,c.brand,c.locationCode||'',c.term,c.start||'',c.expiry||'',STATUS_CFG[c.status]?.ar||'',c.numPayments||1,c.area||'',...yrVals,totalRent,sv,kn,tx,totalRent+sv+kn+tx];
      });
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h1,...rows]),'تفاصيل العقود');
    }else if(rid==='rep2'){
      const ended=contracts.filter(c=>c.status==='ended');
      const h2=['#','رقم العقد','رقم الحساب','النوع','المستأجر','العلامة','الموقع','المدة','تاريخ البدء','تاريخ الانتهاء','إجمالي الإيجار','المساحة (م²)','الجهة المفوضة','الجهة المالية','عنوان المستثمر كما هو في السجل التجاري'];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h2,...ended.map((c,i)=>[i+1,c.num,c.acct||'',TYPE_CFG[c.type]?.ar||'',c.inv,c.brand,c.locationCode||'',c.term,c.start||'',c.expiry||'',getTotalRent(c),c.area||'',c.delName||(c.delPhone?'☎ '+c.delPhone:'')||'',c.finName||(c.finPhone?'☎ '+c.finPhone:'')||'',c.notes||''])]),'العقود المنتهية');
    }else if(rid==='rep8'){
      const soon=contracts.filter(c=>c.status==='soon'),now=new Date();
      const h8=['#','رقم العقد','النوع','المستأجر','العلامة','الموقع','تاريخ الانتهاء','الأيام المتبقية','المدة','إجمالي الإيجار','المساحة (م²)','الجهة المفوضة'];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h8,...soon.map((c,i)=>[i+1,c.num,TYPE_CFG[c.type]?.ar||'',c.inv,c.brand,c.locationCode||'',c.expiry||'',c.expiry?Math.ceil((new Date(c.expiry)-now)/86400000):'—',c.term,getTotalRent(c),c.area||'',c.delName||''])]),'عقود وشيكة الانتهاء');
    }else if(rid==='rep3'){
      const ym={};
      contracts.filter(c=>c.status!=='cancelled').forEach(c=>{const sy=c.start?new Date(c.start).getFullYear():null;if(!sy)return;if(!ym[sy])ym[sy]={c:0,r:0,s:0,k:0,t:0,area:0};const rt=getTotalRent(c);ym[sy].c++;ym[sy].r+=rt;ym[sy].s+=c.svcAmt||Math.round(rt*(c.svcRate??10)/100);ym[sy].k+=c.knwAmt||Math.round(rt*(c.knwRate??2)/100);ym[sy].t+=c.taxAmt||Math.round(rt*(c.taxRate??16)/100);ym[sy].area+=parseFloat(c.area)||0;});
      const yrs=Object.keys(ym).sort();
      const h3=['السنة','عدد العقود الجديدة','إجمالي الإيجار','خدمات','معارف','ضريبة','الإجمالي الكلي','إجمالي المساحة (م²)'];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h3,...yrs.map(yr=>{const d=ym[yr];return[parseInt(yr),d.c,Math.round(d.r),Math.round(d.s),Math.round(d.k),Math.round(d.t),Math.round(d.r+d.s+d.k+d.t),Math.round(d.area*100)/100];})]),'تحليل سنوي');
    }else if(rid==='rep4'){
      const lr=contracts.filter(c=>c.locationCode);
      const locAreas={};lr.forEach(c=>{const lk=c.locationCode;if(!locAreas[lk])locAreas[lk]={inv:[],brand:[],area:0,rent:0};locAreas[lk].inv.push(c.inv);locAreas[lk].brand.push(c.brand);locAreas[lk].area+=parseFloat(c.area)||0;locAreas[lk].rent+=getTotalRent(c);});
      const h4=['كود الموقع','الطابق','المبنى/المحل','المستأجرون','العلامات','المساحة الإجمالية (م²)','إجمالي الإيجار','عدد العقود','الحالة'];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h4,...lr.map(c=>{
        const lk=c.locationCode||'';const la=locAreas[lk];
        return[lk,(lk).split('-')[0],(lk).split('-').slice(1).join('-'),c.inv,c.brand,Math.round((la?.area||0)*100)/100,Math.round(la?.rent||0),Object.keys(contracts.filter(x=>x.locationCode===lk)).length,STATUS_CFG[c.status]?.ar||''];
      })]),'الأماكن المستأجرة');
    }else if(rid==='rep5'){
      const inv=[...new Set(contracts.map(c=>c.inv).filter(Boolean))].sort();
      const del=[...new Set(contracts.map(c=>c.delName+(c.delPhone?' - ☎ '+c.delPhone:'')).filter(Boolean))].sort();
      const fin=[...new Set(contracts.map(c=>c.finName+(c.finPhone?' - ☎ '+c.finPhone:'')).filter(Boolean))].sort();
      const max=Math.max(inv.length,del.length,fin.length);
      const rows=[];
      for(let i=0;i<max;i++)rows.push([inv[i]||'',del[i]||'',fin[i]||'']);
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['المستثمرين','الجهات المفوضة','الجهات المالية'],...rows]),'قائمة الأطراف');
      // Second sheet: parties with their contracts
      const invContracts=inv.map(n=>{
        const cc=contracts.filter(c=>c.inv===n);
        return[n,cc.length,Math.round(cc.reduce((s,c)=>s+getTotalRent(c),0)),Math.round(cc.reduce((s,c)=>s+(parseFloat(c.area)||0),0)*100)/100];
      });
      const h5=['الطرف','عدد العقود','إجمالي الإيجار','إجمالي المساحة (م²)'];
      if(invContracts.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h5,...invContracts]),'تفاصيل المستثمرين');
    }else if(rid==='rep7'){
      const now=new Date(),pmts=[];
      contracts.forEach(c=>{
        if(c.status==='cancelled'||c.status==='ended'||!c.payments)return;
        c.payments.forEach(p=>{
          const pd=new Date(p.date);
          if(pd<now)return;
          pmts.push([c.num,c.inv,c.brand,c.locationCode||'',p.date,p.amount||0,Math.ceil((pd-now)/86400000),c.numPayments||1,STATUS_CFG[c.status]?.ar||'']);
        });
      });
      pmts.sort((a,b)=>a[5]-b[5]);
      const h7=['رقم العقد','المستأجر','العلامة','الموقع','تاريخ الدفعة','المبلغ (د.أ)','الأيام المتبقية','عدد الدفعات/سنة','حالة العقد'];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h7,...pmts]),'الدفعات القادمة');
      // Summary of total upcoming payments
      const totalUpcoming=pmts.reduce((s,p)=>s+p[5],0);
      const ws7s=XLSX.utils.aoa_to_sheet([['البيان','القيمة'],['إجمالي الدفعات القادمة',pmts.length],['القيمة الإجمالية',Math.round(totalUpcoming)],['متوسط الدفعة',pmts.length?Math.round(totalUpcoming/pmts.length):0]]);
      XLSX.utils.book_append_sheet(wb,ws7s,'ملخص الدفعات');
    }else if(rid==='rep9'){
      const headers=['المبنى','الطابق','رقم المحل','مساحة المحل (م²)'];
      const rows=Array.from(document.querySelectorAll('#rep9TableBody tr')).map(tr=>Array.from(tr.cells).map(td=>td.textContent.trim()));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([headers,...rows]),'تفاصيل المحلات الشاغرة');
      const groups=Array.from(document.querySelectorAll('#rep9BuildingSummary tr')).filter(tr=>tr.cells.length===4).map(tr=>Array.from(tr.cells).map(td=>td.textContent.trim()));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['المبنى','الطابق','عدد المحلات الشاغرة','مساحة المحلات الشاغرة (م²)'],...groups]),'المباني والطوابق');
      const summary=[['البيان','القيمة'],['المبنى',document.getElementById('rep9BuildingFilter').value||'جميع المباني'],['الطابق',document.getElementById('rep9FloorFilter').value||'جميع الطوابق'],['مجموع المساحة الشاغرة',document.getElementById('rep9-avg-area').textContent],['عدد المحلات الشاغرة',document.getElementById('rep9-vacant-count').textContent]];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),'ملخص الشواغر');
    }else if(rid==='rep-srv'){
      const svcContracts=getServiceContracts();
      const mfMonth=document.getElementById('srv-rep-month-filter')?.value||'';
      const mfYear=document.getElementById('srv-rep-year-filter')?.value||'';
      const monthLabel=(mfMonth||mfYear)?((mfMonth?'شهر '+mfMonth:'كل الأشهر')+(mfYear?' - '+mfYear:'')):'كل الأشهر (إجمالي)';
      const headers=['#','رقم العقد','المستأجر','العلامة','قطعة الأرض','عداد الماء','قراءات الماء','عداد الكهرباء','قراءات الكهرباء','قيمة استهلاك الماء (د.أ)','قيمة استهلاك الكهرباء (د.أ)'];
      let sumWaterValue=0,sumElecValue=0;
      const rows=svcContracts.map((c,i)=>{
        const wCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='water').length;
        const eCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='electricity').length;
        const wCons=getContractConsumptionValue(c.id,'water',mfMonth,mfYear);
        const eCons=getContractConsumptionValue(c.id,'electricity',mfMonth,mfYear);
        sumWaterValue+=wCons.value;sumElecValue+=eCons.value;
        return[i+1,c.num||'',c.inv||'',c.brand||'',c.landPlot||'',c.waterMeter||'—',wCnt,c.electricMeter||'—',eCnt,wCons.has?wCons.value:0,eCons.has?eCons.value:0];
      });
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([headers,...rows]),'عقود الخدمات');
      // Summary sheet
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['البيان','القيمة'],['إجمالي العقود',contracts.length],['عقود الخدمات',svcContracts.length],['إجمالي القراءات',meterReadings.length],['قراءات الماء',meterReadings.filter(r=>r.meterType==='water').length],['قراءات الكهرباء',meterReadings.filter(r=>r.meterType==='electricity').length],['الفترة',monthLabel],['قيمة استهلاك الماء (د.أ)',Math.round(sumWaterValue)],['قيمة استهلاك الكهرباء (د.أ)',Math.round(sumElecValue)]]),'ملخص الخدمات');
    }else if(rid==='rep-water'||rid==='rep-elec'){
      const type=rid==='rep-water'?'water':'electricity';
      const unit=type==='water'?'م³':'ك.و.س';
      const pfx=type==='water'?'wtr':'elc';
      const mfMonth=document.getElementById(pfx+'-rep-month')?.value||'';
      const mfYear=document.getElementById(pfx+'-rep-year')?.value||'';
      const periodLabel=(mfMonth||mfYear)?((mfMonth?'شهر '+mfMonth:'كل الأشهر')+(mfYear?' - '+mfYear:'')):'كل الأشهر (إجمالي)';
      const headers=['#','رقم العقد','رقم الحساب','رقم العداد','العلامة التجارية','كمية الاستهلاك الكلي ('+unit+')','قيمة الاستهلاك الكلي (د.أ)','عدد القراءات'];
      const list=contracts.filter(c=>{
        const meter=type==='water'?c.waterMeter:c.electricMeter;
        if(!meter||!meter.trim())return false;
        return meterReadings.some(r=>r.contractId===c.id&&r.meterType===type);
      });
      let totQty=0,totVal=0,totRead=0;
      const rows=list.map((c,i)=>{
        const meter=type==='water'?c.waterMeter:c.electricMeter;
        const rds=meterReadings.filter(r=>r.contractId===c.id&&r.meterType===type&&(mfMonth?parseInt(r.month)===parseInt(mfMonth):true)&&(mfYear?parseInt(r.year)===parseInt(mfYear):true));
        const cons=getContractConsumptionValue(c.id,type,mfMonth,mfYear);
        totQty+=cons.has?cons.diff:0;
        totVal+=cons.has?cons.value:0;
        totRead+=rds.length;
        return[i+1,c.num||'',c.acct||'',meter||'—',c.brand||'',cons.has?cons.diff:0,cons.has?cons.value:0,rds.length];
      });
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([headers,...rows]),type==='water'?'استهلاك المياه':'استهلاك الكهرباء');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['البيان','القيمة'],['إجمالي العقود',list.length],['الفترة',periodLabel],['إجمالي كمية الاستهلاك',Math.round(totQty)],['إجمالي قيمة الاستهلاك (د.أ)',Math.round(totVal)],['إجمالي عدد القراءات',totRead]]),'ملخص');
    }
    XLSX.writeFile(wb,(names[rid]||'report')+'_'+new Date().toISOString().slice(0,10)+'.xlsx');
    showToast('\u2705 '.toUpperCase()+'تم تصدير تقرير Excel بنجاح');
  }catch(e){showToast('خطأ في تصدير Excel: '+e.message,true);}
}


