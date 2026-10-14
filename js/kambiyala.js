/* ═══ 5B Mall — Kambiyala (كمبيالات) ═══ */
/* ══════════════════════ KAMBIYALA REPORT ══════════════════════ */
function renderKambiyalaReport(){return; // retired report

  const now=new Date();now.setHours(0,0,0,0);
  const sortBy=document.getElementById('kb-rep-sort')?.value||'date';
  const typeFilter=document.getElementById('kb-rep-type-filter')?.value||'';


  // Partition records
  let allActive=kambiyalaRecords.filter(r=>r.status==='due'||(r.status!=='paid'&&r.status!=='returned'));
  if(typeFilter)allActive=allActive.filter(r=>r.type===typeFilter);


  const overdue=allActive.filter(r=>r.dueDate&&new Date(r.dueDate)<now);
  const due=allActive.filter(r=>!r.dueDate||new Date(r.dueDate)>=now);


  // Sort helpers
  const sortFn=(a,b)=>{
    if(sortBy==='num')return (a.num||'').localeCompare(b.num||'',undefined,{numeric:true});
    if(sortBy==='amount')return (parseFloat(b.amount)||0)-(parseFloat(a.amount)||0);
    return (a.dueDate||'').localeCompare(b.dueDate||'');
  };
  due.sort(sortFn);
  overdue.sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||'')); // always by date for overdue


  // KPIs
  const paid=kambiyalaRecords.filter(r=>r.status==='paid').length;
  const dueAmt=allActive.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
  const setEl=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  setEl('kb-rep-total',kambiyalaRecords.length);
  setEl('kb-rep-due',due.length);
  setEl('kb-rep-overdue',overdue.length);
  setEl('kb-rep-paid',paid);
  setEl('kb-rep-due-amount',dueAmt.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ');


  // Location label helper
  const locLabel=loc=>loc==='safe'?'🗄 الصندوق':loc==='bank'?'🏦 البنك':loc==='other'?'👤 الغير':'—';
  const typeLabel=t=>t==='insurance'
    ?`<span style="padding:2px 7px;background:#f3e8ff;color:#9333ea;border-radius:5px;font-size:13px;font-weight:700">شيك تأمين</span>`
    :`<span style="padding:2px 7px;background:#dbeafe;color:#1d4ed8;border-radius:5px;font-size:13px;font-weight:700">دفع</span>`;


  // ─── Alerts section ───
  const alertsEl=document.getElementById('kb-rep-alerts');
  if(alertsEl){
    const critical=due.filter(r=>{if(!r.dueDate)return false;const d=new Date(r.dueDate);d.setHours(0,0,0,0);return Math.ceil((d-now)/86400000)<=3;});
    const warn=due.filter(r=>{if(!r.dueDate)return false;const d=new Date(r.dueDate);d.setHours(0,0,0,0);const diff=Math.ceil((d-now)/86400000);return diff>3&&diff<=7;});
    let html='';
    if(overdue.length){
      html+=`<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:var(--radius-lg);padding:12px 16px;margin-bottom:10px">
        <div style="font-weight:800;color:#b91c1c;font-size:15px;margin-bottom:8px">🔴 كمبيالات متأخرة — تجاوزت تاريخ الاستحقاق (${overdue.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${overdue.map(r=>{
            const days=Math.abs(Math.ceil((new Date(r.dueDate)-now)/86400000));
            return`<div style="padding:5px 10px;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;font-size:13px">
              <strong style="color:#991b1b">${r.num}</strong>
              <span style="color:#374151;margin:0 4px">${r.clientName||'—'}</span>
              <span style="color:#dc2626;font-weight:700">متأخر ${days} يوم</span>
              <span style="color:#6b7280;margin-right:4px">${(parseFloat(r.amount)||0).toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }
    if(critical.length){
      html+=`<div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:var(--radius-lg);padding:12px 16px;margin-bottom:10px">
        <div style="font-weight:800;color:#c2410c;font-size:15px;margin-bottom:8px">🟠 تنبيه عاجل — تستحق خلال 3 أيام (${critical.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${critical.map(r=>{
            const diff=Math.ceil((new Date(r.dueDate)-now)/86400000);
            return`<div style="padding:5px 10px;background:#ffedd5;border:1px solid #fed7aa;border-radius:6px;font-size:13px">
              <strong style="color:#9a3412">${r.num}</strong>
              <span style="color:#374151;margin:0 4px">${r.clientName||'—'}</span>
              <span style="color:#ea580c;font-weight:700">${diff===0?'اليوم!':diff+' يوم'}</span>
              <span style="color:#6b7280;margin-right:4px">${(parseFloat(r.amount)||0).toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }
    if(warn.length){
      html+=`<div style="background:#fefce8;border:1.5px solid #fde047;border-radius:var(--radius-lg);padding:12px 16px;margin-bottom:10px">
        <div style="font-weight:800;color:#a16207;font-size:15px;margin-bottom:8px">🟡 تنبيه — تستحق خلال 7 أيام (${warn.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${warn.map(r=>{
            const diff=Math.ceil((new Date(r.dueDate)-now)/86400000);
            return`<div style="padding:5px 10px;background:#fef9c3;border:1px solid #fde047;border-radius:6px;font-size:13px">
              <strong style="color:#713f12">${r.num}</strong>
              <span style="color:#374151;margin:0 4px">${r.clientName||'—'}</span>
              <span style="color:#ca8a04;font-weight:700">${diff} يوم</span>
              <span style="color:#6b7280;margin-right:4px">${(parseFloat(r.amount)||0).toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }
    if(!html&&!overdue.length&&!critical.length&&!warn.length){
      html='<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:var(--radius-lg);padding:10px 16px;font-size:14px;color:#15803d;font-weight:700">✅ لا توجد تنبيهات — جميع الكمبيالات ضمن المهل الزمنية</div>';
    }
    alertsEl.innerHTML=html;
  }


  // ─── Due table ───
  const dueBody=document.getElementById('kb-rep-due-body');
  const dueEmpty=document.getElementById('kb-rep-due-empty');
  const dueCount=document.getElementById('kb-rep-due-count');
  const dueTotalEl=document.getElementById('kb-rep-due-total');
  if(dueCount)dueCount.textContent=due.length+' كمبيالة';
  let dueTotal=0;
  if(!due.length){
    if(dueBody)dueBody.innerHTML='';
    if(dueEmpty)dueEmpty.style.display='flex';
  }else{
    if(dueEmpty)dueEmpty.style.display='none';
    if(dueBody)dueBody.innerHTML=due.map((r,i)=>{
      const amt=parseFloat(r.amount)||0;dueTotal+=amt;
      const d=r.dueDate?new Date(r.dueDate):null;
      let daysCell='—';
      if(d){
        d.setHours(0,0,0,0);
        const diff=Math.ceil((d-now)/86400000);
        if(diff===0)daysCell=`<span style="color:#dc2626;font-weight:800;animation:badgePulse 1.5s infinite">اليوم!</span>`;
        else if(diff<=3)daysCell=`<span style="color:#dc2626;font-weight:800">${diff} يوم 🔴</span>`;
        else if(diff<=7)daysCell=`<span style="color:#d97706;font-weight:700">${diff} يوم 🟡</span>`;
        else daysCell=`<span style="color:var(--text-m)">${diff} يوم</span>`;
      }
      return`<tr style="background:${i%2===0?'#fff':'#f8fafc'}">
        <td style="color:var(--text-l);font-size:13px">${i+1}</td>
        <td style="font-weight:800;color:var(--blue-700)">${r.num||'—'}</td>
        <td>${typeLabel(r.type)}</td>
        <td style="font-size:14px;color:var(--text-m)">${r.issueDate||'—'}</td>
        <td style="font-size:14px;font-weight:700">${r.dueDate||'—'}</td>
        <td style="text-align:center">${daysCell}</td>
        <td style="font-weight:800;color:var(--blue-700);font-size:15px">${amt.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})}</td>
        <td style="font-size:14px">${r.bankName||'—'}</td>
        <td style="font-size:14px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.clientName||'—'}</td>
        <td style="font-size:14px;color:var(--text-m)">${r.clientPhone||'—'}</td>
        <td style="font-size:14px">${locLabel(r.location)}</td>
        <td style="font-size:14px;color:var(--text-m)">${r.receiptNum||'—'}</td>
      </tr>`;
    }).join('')+'<tr style="background:#eff6ff;font-weight:900;border-top:2px solid #bfdbfe"><td colspan="6" style="padding:8px 12px;text-align:left;color:#1e3a8a">المجموع</td><td style="padding:8px 12px;color:#1e3a8a;font-size:16px">'+dueTotal.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ</td><td colspan="5"></td></tr>';
  }
  if(dueTotalEl)dueTotalEl.textContent=dueTotal.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ';


  // ─── Overdue table ───
  const ovBody=document.getElementById('kb-rep-overdue-body');
  const ovEmpty=document.getElementById('kb-rep-overdue-empty');
  const ovCount=document.getElementById('kb-rep-overdue-count');
  const ovTotalEl=document.getElementById('kb-rep-overdue-total');
  if(ovCount)ovCount.textContent=overdue.length+' كمبيالة';
  let ovTotal=0;
  if(!overdue.length){
    if(ovBody)ovBody.innerHTML='';
    if(ovEmpty)ovEmpty.style.display='flex';
  }else{
    if(ovEmpty)ovEmpty.style.display='none';
    if(ovBody)ovBody.innerHTML=overdue.map((r,i)=>{
      const amt=parseFloat(r.amount)||0;ovTotal+=amt;
      const days=r.dueDate?Math.abs(Math.ceil((new Date(r.dueDate)-now)/86400000)):0;
      return`<tr style="background:${i%2===0?'#fff':'#fff5f5'}">
        <td style="color:var(--text-l);font-size:13px">${i+1}</td>
        <td style="font-weight:800;color:#dc2626">${r.num||'—'}</td>
        <td>${typeLabel(r.type)}</td>
        <td style="font-size:14px;font-weight:700;color:#dc2626">${r.dueDate||'—'}</td>
        <td style="font-weight:800;color:#dc2626;font-size:15px">${days} يوم ⚠️</td>
        <td style="font-weight:800;color:#991b1b;font-size:15px">${amt.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})}</td>
        <td style="font-size:14px">${r.bankName||'—'}</td>
        <td style="font-size:14px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.clientName||'—'}</td>
        <td style="font-size:14px;color:var(--text-m)">${r.clientPhone||'—'}</td>
        <td style="font-size:14px">${locLabel(r.location)}</td>
      </tr>`;
    }).join('')+'<tr style="background:#fef2f2;font-weight:900;border-top:2px solid #fca5a5"><td colspan="5" style="padding:8px 12px;text-align:left;color:#991b1b">المجموع المتأخر</td><td style="padding:8px 12px;color:#991b1b;font-size:16px">'+ovTotal.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ</td><td colspan="4"></td></tr>';
  }
  if(ovTotalEl)ovTotalEl.textContent=ovTotal.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ';
}


/* ─── Print full kambiyala report ─── */
function printKambiyalaFullReport(){
  const now=new Date();now.setHours(0,0,0,0);
  const sortBy=document.getElementById('kb-rep-sort')?.value||'date';
  const typeFilter=document.getElementById('kb-rep-type-filter')?.value||'';
  let allActive=kambiyalaRecords.filter(r=>r.status==='due'||(r.status!=='paid'&&r.status!=='returned'));
  if(typeFilter)allActive=allActive.filter(r=>r.type===typeFilter);
  const overdue=allActive.filter(r=>r.dueDate&&new Date(r.dueDate)<now);
  const due=allActive.filter(r=>!r.dueDate||new Date(r.dueDate)>=now);
  const sortFn=(a,b)=>{
    if(sortBy==='num')return (a.num||'').localeCompare(b.num||'',undefined,{numeric:true});
    if(sortBy==='amount')return (parseFloat(b.amount)||0)-(parseFloat(a.amount)||0);
    return (a.dueDate||'').localeCompare(b.dueDate||'');
  };
  due.sort(sortFn);
  overdue.sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));


  const locLabel=loc=>loc==='safe'?'الصندوق':loc==='bank'?'البنك':loc==='other'?'عند الغير':'—';
  const typeL=t=>t==='insurance'?'شيك تأمين':'كمبيالة دفع';


  const dueRows=due.map((r,i)=>{
    const amt=parseFloat(r.amount)||0;
    const d=r.dueDate?new Date(r.dueDate):null;let daysText='—';
    if(d){d.setHours(0,0,0,0);const diff=Math.ceil((d-now)/86400000);daysText=diff===0?'اليوم!':diff+' يوم';}
    return`<tr style="background:${i%2===0?'#fff':'#f8fafc'}"><td>${i+1}</td><td style="font-weight:700;color:#1e3a8a">${r.num||'—'}</td><td>${typeL(r.type)}</td><td>${r.issueDate||'—'}</td><td style="font-weight:700">${r.dueDate||'—'}</td><td style="font-weight:700;color:#1e40af">${daysText}</td><td style="font-weight:700">${amt.toLocaleString('en',{minimumFractionDigits:3})}</td><td>${r.bankName||'—'}</td><td>${r.clientName||'—'}</td><td>${r.clientPhone||'—'}</td><td>${locLabel(r.location)}</td></tr>`;
  }).join('');
  const dueTotal=due.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);


  const ovRows=overdue.map((r,i)=>{
    const amt=parseFloat(r.amount)||0;
    const days=r.dueDate?Math.abs(Math.ceil((new Date(r.dueDate)-now)/86400000)):0;
    return`<tr style="background:${i%2===0?'#fff':'#fff5f5'}"><td>${i+1}</td><td style="font-weight:700;color:#dc2626">${r.num||'—'}</td><td>${typeL(r.type)}</td><td style="font-weight:700;color:#dc2626">${r.dueDate||'—'}</td><td style="font-weight:700;color:#dc2626">${days} يوم</td><td style="font-weight:700">${amt.toLocaleString('en',{minimumFractionDigits:3})}</td><td>${r.bankName||'—'}</td><td>${r.clientName||'—'}</td><td>${r.clientPhone||'—'}</td><td>${locLabel(r.location)}</td></tr>`;
  }).join('');
  const ovTotal=overdue.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);


  const html=`
    <h2 style="margin-bottom:4px">صندوق الشيكات — كشف الكمبيالات المستحقة</h2>
    <p style="font-size:13px;color:#64748b;margin-bottom:16px">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-JO',{year:'numeric',month:'long',day:'numeric'})}</p>


    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px"><div style="font-size:13px;color:#64748b">إجمالي الكمبيالات</div><div style="font-size:22px;font-weight:800;color:#1e3a8a">${kambiyalaRecords.length}</div></div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px"><div style="font-size:13px;color:#64748b">مستحقة</div><div style="font-size:22px;font-weight:800;color:#b45309">${due.length}</div></div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px"><div style="font-size:13px;color:#64748b">متأخرة</div><div style="font-size:22px;font-weight:800;color:#dc2626">${overdue.length}</div></div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px"><div style="font-size:13px;color:#64748b">إجمالي المبالغ</div><div style="font-size:16px;font-weight:800;color:#1e40af">${(dueTotal+ovTotal).toLocaleString('en',{minimumFractionDigits:3})} د.أ</div></div>
    </div>


    <h3 style="font-size:16px;font-weight:700;color:#1e3a8a;margin:0 0 8px;border-right:4px solid #2563eb;padding-right:10px">الكمبيالات المستحقة (${due.length})</h3>
    <table>
      <thead><tr><th>#</th><th>رقم</th><th>النوع</th><th>تحرير</th><th>استحقاق</th><th>الأيام</th><th>المبلغ</th><th>البنك</th><th>العميل</th><th>تلفون</th><th>الموقع</th></tr></thead>
      <tbody>${dueRows||'<tr><td colspan="11" style="text-align:center;color:#64748b">لا توجد كمبيالات مستحقة</td></tr>'}</tbody>
    </table>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;margin-bottom:20px">
      <span style="font-weight:700;color:#1e3a8a">إجمالي الكمبيالات المستحقة</span>
      <span style="font-size:18px;font-weight:900;color:#1e40af">${dueTotal.toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
    </div>


    <h3 style="font-size:16px;font-weight:700;color:#dc2626;margin:0 0 8px;border-right:4px solid #dc2626;padding-right:10px">الكمبيالات المتأخرة — تجاوزت الاستحقاق (${overdue.length})</h3>
    <table>
      <thead style="background:#dc2626"><tr><th>#</th><th>رقم</th><th>النوع</th><th>الاستحقاق</th><th>أيام التأخير</th><th>المبلغ</th><th>البنك</th><th>العميل</th><th>تلفون</th><th>الموقع</th></tr></thead>
      <tbody>${ovRows||'<tr><td colspan="10" style="text-align:center;color:#16a34a;font-weight:700">✅ لا توجد كمبيالات متأخرة</td></tr>'}</tbody>
    </table>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between">
      <span style="font-weight:700;color:#991b1b">إجمالي مبالغ الكمبيالات المتأخرة</span>
      <span style="font-size:18px;font-weight:900;color:#991b1b">${ovTotal.toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
    </div>`;


  if(typeof openPrintWindow==='function'){openPrintWindow('صندوق الشيكات — كشف الكمبيالات المستحقة',html);}
  else{const w=window.open('','_blank');w.document.write('<html dir="rtl"><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;padding:20px;direction:rtl}table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:14px}th{background:#1e3a8a;color:#fff;padding:7px 10px;text-align:right}td{padding:6px 10px;border-bottom:1px solid #e2e8f0}h2{color:#1e3a8a;font-size:20px}h3{margin-top:16px}</style></head><body>'+html+'</body></html>');w.print();}
}


/* ══════════════════════ END KAMBIYALA REPORT ══════════════════════ */


const SK_KAMBIYALA = 'lms_kambiyala_v1';
const SK_KAMBIYALA_PDF = 'lms_kambiyala_pdf_v1';
let kambiyalaRecords = [];
let editingKambiyala = null;


/* Attached PDFs are stored in their own bucket with Firebase RTDB chunked sync
   so large PDFs never blow localStorage quota — localStorage is cache, Firebase is source of truth. */
function loadKbPdfStore(){
  try{const s=localStorage.getItem(SK_KAMBIYALA_PDF);const o=s?JSON.parse(s):null;if(o&&typeof o==='object'&&!Array.isArray(o))return o;}catch(e){}
  return {};
}
function kbSetPdf(id,data,name){
  if(!id)return true;
  const store=loadKbPdfStore();
  if(data){store[id]={data,name:name||''};}
  else{delete store[id];}
  try{localStorage.setItem(SK_KAMBIYALA_PDF,JSON.stringify(store));}catch(e){
    // localStorage quota exceeded: keep minimal cache, Firebase will hold the full data
    try{
      const slim={}; Object.keys(store).slice(-3).forEach(k=>slim[k]=store[k]);
      localStorage.setItem(SK_KAMBIYALA_PDF,JSON.stringify(slim));
    }catch(e2){}
    console.warn('localStorage ممتلئ — سيتم حفظ PDF في Firebase فقط',e);
  }
  // Sync to Firebase RTDB chunked (fire-and-forget, non-blocking)
  if(typeof fbReady!=='undefined'&&fbReady&&typeof fbDB!=='undefined'&&fbDB){
    const CHUNK=900000;
    const path='kambiyalaPdfs/'+id;
    if(!data){
      fbDB.ref(path).remove().catch(()=>{});
    }else{
      if(data.length<=CHUNK){
        fbDB.ref(path).set({data,name:name||'',chunks:1}).catch(e=>console.warn('فشل حفظ PDF الكمبيالة في Firebase',e));
      }else{
        const total=Math.ceil(data.length/CHUNK);
        const obj={name:name||'',chunks:total};
        for(let i=0;i<total;i++) obj['c'+i]=data.substring(i*CHUNK,(i+1)*CHUNK);
        fbDB.ref(path).set(obj).catch(e=>console.warn('فشل حفظ PDF الكمبيالة في Firebase',e));
      }
    }
  }
  return true;
}
function kbGetPdf(id){
  if(!id)return null;
  const p=loadKbPdfStore()[id];
  return p&&p.data?p:null;
}
async function kbGetPdfAsync(id){
  let cached=kbGetPdf(id);
  if(cached) return cached;
  if(typeof fbReady==='undefined'||!fbReady||typeof fbDB==='undefined'||!fbDB) return null;
  try{
    const snap=await fbDB.ref('kambiyalaPdfs/'+id).once('value');
    if(!snap.exists()) return null;
    const d=snap.val();
    let full='';
    if(d.chunks&&d.chunks>1){ for(let i=0;i<d.chunks;i++) full+=d['c'+i]||''; } else { full=d.data||''; }
    if(full){
      // warm cache
      const store=loadKbPdfStore(); store[id]={data:full,name:d.name||''};
      try{localStorage.setItem(SK_KAMBIYALA_PDF,JSON.stringify(store));}catch(e){}
      return {data:full,name:d.name||''};
    }
  }catch(e){ console.warn('فشل تحميل PDF الكمبيالة من Firebase',e); }
  return null;
}


function loadKambiyalaRecords(){
  let list=[];
  try{const s=localStorage.getItem(SK_KAMBIYALA);if(s)list=JSON.parse(s)||[];}catch(e){}
  if(!Array.isArray(list))list=[];
  // One-time migration: pull legacy embedded PDFs out of the records list
  let migrated=false;
  list.forEach(r=>{
    if(r&&(r.pdfData||r.pdfName)){kbSetPdf(r.id,r.pdfData||'',r.pdfName||'');delete r.pdfData;delete r.pdfName;migrated=true;}
  });
  if(migrated){try{localStorage.setItem(SK_KAMBIYALA,JSON.stringify(list));}catch(e){}}
  return list;
}
function saveKambiyalaRecords(){
  const slim=kambiyalaRecords.map(r=>{const c={...r};delete c.pdfData;delete c.pdfName;return c;});
  try{localStorage.setItem(SK_KAMBIYALA,JSON.stringify(slim));}
  catch(e){console.warn('تعذر حفظ الكمبيالات محلياً',e);showToast('تعذر الحفظ المحلي — مساحة التخزين ممتلئة',true);}
  if(typeof fbReady!=='undefined'&&fbReady&&fbDB){
    fbDB.ref('kambiyala').set(slim).catch(()=>{});
  }
}
kambiyalaRecords = loadKambiyalaRecords();


function getNextKambiyalaNum(){
  // Auto sequential number
  let max=0;
  kambiyalaRecords.forEach(r=>{
    const n=parseInt((r.num||'').replace(/\D/g,''));
    if(!isNaN(n)&&n>max)max=n;
  });
  return 'KB-'+String(max+1).padStart(4,'0');
}


function initKambiyalaPage(){
  updateKambiyalaKPIs();
  renderKambiyalaTable();
  renderKambiyalaAlerts();
}


/* ─── KPIs ─── */
function updateKambiyalaKPIs(){
  const now=new Date();now.setHours(0,0,0,0);
  const all=kambiyalaRecords;
  const overdue=all.filter(r=>r.status==='due'&&r.dueDate&&new Date(r.dueDate)<now);
  const due=all.filter(r=>r.status==='due');
  const paid=all.filter(r=>r.status==='paid');
  const totalAmt=due.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
  const setEl=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  setEl('kb-kpi-total',all.length);
  setEl('kb-kpi-due',due.length);
  setEl('kb-kpi-overdue',overdue.length);
  setEl('kb-kpi-paid',paid.length);
  setEl('kb-kpi-amount',totalAmt.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ');
}


/* ─── Alerts ─── */
function renderKambiyalaAlerts(){
  const sec=document.getElementById('kb-alerts-section');if(!sec)return;
  const now=new Date();now.setHours(0,0,0,0);
  const alerts=[];
  kambiyalaRecords.filter(r=>r.status==='due'&&r.dueDate).forEach(r=>{
    const d=new Date(r.dueDate);d.setHours(0,0,0,0);
    const diff=Math.ceil((d-now)/(1000*60*60*24));
    if(diff<0)alerts.push({r,diff,cls:'red',msg:'متأخرة بـ '+Math.abs(diff)+' يوم'});
    else if(diff<=3)alerts.push({r,diff,cls:'red',msg:'تستحق خلال '+diff+' يوم'});
    else if(diff<=7)alerts.push({r,diff,cls:'amber',msg:'تستحق خلال '+diff+' يوم'});
  });
  if(!alerts.length){sec.style.display='none';return;}
  alerts.sort((a,b)=>a.diff-b.diff);
  sec.style.display='block';
  sec.innerHTML=`<div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:12px 16px;box-shadow:var(--shadow-sm)">
    <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:8px">⚠️ تنبيهات الاستحقاق</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${alerts.map(a=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--${a.cls==='red'?'red':'amber'}-100,#fee2e2);border:1px solid var(--${a.cls==='red'?'red':'amber'}-200,#fca5a5);border-radius:var(--radius);font-size:14px">
        <span style="font-weight:700;color:var(--${a.cls}-600,#dc2626)">${a.r.num}</span>
        <span style="color:var(--text)">${a.r.clientName||'—'}</span>
        <span style="color:var(--${a.cls}-500,#ef4444)">${a.msg}</span>
        <span style="font-weight:700;color:var(--text)">${(parseFloat(a.r.amount)||0).toLocaleString('en',{minimumFractionDigits:3})}</span>
      </div>`).join('')}
    </div>
  </div>`;
}


function refreshKambiyalaAlerts(){
  // Update sidebar badge
  const badge=document.getElementById('kambiyala-alert-badge');if(!badge)return;
  const now=new Date();now.setHours(0,0,0,0);
  const urgent=kambiyalaRecords.filter(r=>r.status==='due'&&r.dueDate&&Math.ceil((new Date(r.dueDate)-now)/(1000*60*60*24))<=7);
  if(urgent.length){badge.style.display='';badge.textContent=urgent.length;}
  else{badge.style.display='none';}
}


/* ─── Table ─── */
function getKambiyalaStatus(r){
  const now=new Date();now.setHours(0,0,0,0);
  if(r.status==='paid')return{label:'مسددة',cls:'badge-active',color:'var(--green-600)'};
  if(r.status==='returned')return{label:'مرتجعة',cls:'badge-soon',color:'var(--red-600)'};
  if(r.dueDate){
    const d=new Date(r.dueDate);d.setHours(0,0,0,0);
    const diff=Math.ceil((d-now)/(1000*60*60*24));
    if(diff<0)return{label:'متأخرة ('+Math.abs(diff)+' يوم)',cls:'badge-ended',color:'var(--red-600)'};
  }
  return{label:'مستحقة',cls:'badge-amber',color:'var(--amber-600)'};
}


function getKambiyalaLocationLabel(loc){
  if(loc==='safe')return'🗄️ الصندوق';
  if(loc==='bank')return'🏦 البنك';
  if(loc==='other')return'👤 عند الغير';
  return loc||'—';
}


function renderKambiyalaTable(){
  const tbody=document.getElementById('kb-table-body');if(!tbody)return;
  const fStatus=document.getElementById('kb-filter-status')?.value||'';
  const fType=document.getElementById('kb-filter-type')?.value||'';
  const fLocation=document.getElementById('kb-filter-location')?.value||'';
  const fSearch=(document.getElementById('kb-search')?.value||'').trim().toLowerCase();


  let data=[...kambiyalaRecords];


  // Apply filters
  if(fStatus){
    const now=new Date();now.setHours(0,0,0,0);
    data=data.filter(r=>{
      if(fStatus==='overdue') return r.status==='due'&&r.dueDate&&new Date(r.dueDate)<now;
      if(fStatus==='due') return r.status==='due';
      return r.status===fStatus;
    });
  }
  if(fType)data=data.filter(r=>r.type===fType);
  if(fLocation)data=data.filter(r=>r.location===fLocation);
  if(fSearch)data=data.filter(r=>{
    return (r.num||'').toLowerCase().includes(fSearch)||
           (r.clientName||'').toLowerCase().includes(fSearch)||
           (r.bankName||'').toLowerCase().includes(fSearch);
  });


  // Sort by due date
  data.sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));


  const count=document.getElementById('kb-table-count');
  if(count)count.textContent=data.length+' كمبيالة';


  const totalAmt=data.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
  const totalEl=document.getElementById('kb-table-total');
  if(totalEl)totalEl.textContent=totalAmt.toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3})+' د.أ';


  updateKambiyalaKPIs();


  if(!data.length){tbody.innerHTML='<tr><td colspan="13" style="text-align:center;padding:30px;color:var(--text-m)">لا توجد نتائج</td></tr>';return;}


  const now=new Date();now.setHours(0,0,0,0);
  tbody.innerHTML=data.map((r,i)=>{
    const st=getKambiyalaStatus(r);
    const typeLabel=r.type==='insurance'
      ?`<span style="display:inline-block;padding:2px 7px;background:var(--purple-100,#f3e8ff);color:var(--purple-600,#9333ea);border-radius:5px;font-size:13px;font-weight:700">شيك تأمين</span>`
      :`<span style="display:inline-block;padding:2px 7px;background:var(--blue-100,#dbeafe);color:var(--blue-700);border-radius:5px;font-size:13px;font-weight:700">دفع</span>`;
    const daysCell=()=>{
      if(!r.dueDate)return'—';
      const d=new Date(r.dueDate);d.setHours(0,0,0,0);
      const diff=Math.ceil((d-now)/(1000*60*60*24));
      if(diff<0)return`<span style="color:var(--red-600);font-weight:700">متأخر ${Math.abs(diff)}د</span>`;
      if(diff===0)return`<span style="color:var(--red-500);font-weight:700">اليوم!</span>`;
      if(diff<=7)return`<span style="color:var(--amber-600);font-weight:700">${diff}د</span>`;
      return`<span style="color:var(--text-m)">${diff}د</span>`;
    };
    const amtFmt=(parseFloat(r.amount)||0).toLocaleString('en',{minimumFractionDigits:3,maximumFractionDigits:3});
    const pdfBtn=kbGetPdf(r.id)?`<button class="btn btn-ghost btn-xs" title="عرض PDF" onclick="viewKambiyalaPdf('${r.id}')"><svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:var(--red-500);stroke-width:2;fill:none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></button>`:'';
    return`<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td style="font-weight:700;color:var(--blue-600);font-size:14px">${r.num||'—'}</td>
      <td>${typeLabel}</td>
      <td style="font-size:14px;color:var(--text-m)">${r.issueDate||'—'}</td>
      <td style="font-size:14px;font-weight:600">${r.dueDate||'—'}</td>
      <td style="text-align:center">${daysCell()}</td>
      <td style="font-weight:700;color:var(--text)">${amtFmt} د.أ</td>
      <td style="font-size:14px">${r.bankName||'—'}</td>
      <td style="font-size:14px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.clientName||''}">${r.clientName||'—'}</td>
      <td><span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:13px;font-weight:700;color:${st.color};background:${st.color}18">${st.label}</span></td>
      <td style="font-size:14px">${getKambiyalaLocationLabel(r.location)}</td>
      <td style="font-size:14px;color:var(--text-m)">${r.receiptNum||'—'}</td>
      <td><div class="td-actions" style="gap:4px">
        ${pdfBtn}
        <button class="btn btn-ghost btn-xs" title="تعديل" onclick="editKambiyalaRecord('${r.id}')"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:var(--blue);stroke-width:2;fill:none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn btn-ghost btn-xs" title="حذف" style="color:var(--red)" onclick="deleteKambiyalaRecord('${r.id}')"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
}


/* ─── Modal ─── */
function openKambiyalaModal(id){if(!erpRequire('kambiyala',id?'edit':'add'))return;
  editingKambiyala=id||null;
  const r=id?kambiyalaRecords.find(x=>x.id===id):null;
  // Set default values
  document.getElementById('kb-modal-title').textContent=r?'تعديل كمبيالة':'إضافة كمبيالة / شيك تأمين';
  document.getElementById('kb-num').value=r?r.num:getNextKambiyalaNum();
  document.getElementById('kb-num').readOnly=!r;
  document.getElementById('kb-type').value=r?r.type:'payment';
  document.getElementById('kb-issue-date').value=r?r.issueDate:new Date().toISOString().slice(0,10);
  document.getElementById('kb-due-date').value=r?r.dueDate:'';
  document.getElementById('kb-amount').value=r?r.amount:'';
  document.getElementById('kb-bank-name').value=r?r.bankName:'';
  document.getElementById('kb-client-name').value=r?r.clientName:'';
  document.getElementById('kb-client-address').value=r?r.clientAddress:'';
  document.getElementById('kb-client-phone').value=r?r.clientPhone:'';
  document.getElementById('kb-status').value=r?r.status:'due';
  document.getElementById('kb-location').value=r?r.location:'safe';
  document.getElementById('kb-receipt-num').value=r?r.receiptNum:'';
  // Insurance check fields
  document.getElementById('kb-check-num').value=r?r.checkNum||'':'';
  document.getElementById('kb-check-bank').value=r?r.checkBank||'':'';
  onKambiyalaTypeChange();
  // PDF
  kambiyalaTempPdf='';
  kambiyalaTempPdfName='';
  kambiyalaPdfRemoved=false;
  const pdfArea=document.getElementById('kb-pdf-area');
  const pdfFn=document.getElementById('kb-pdf-filename');
  if(pdfArea)pdfArea.classList.remove('has-file');
  if(pdfFn){pdfFn.textContent='';pdfFn.style.display='none';}
  document.getElementById('kb-pdf-remove').style.display='none';
  document.querySelector('#kb-pdf-area .pdf-upload-icon').style.display='';
  document.querySelector('#kb-pdf-area .pdf-upload-text').style.display='';
  const prevPdf=r?kbGetPdf(r.id):null;
  if(prevPdf){
    if(pdfFn){pdfFn.textContent='✓ '+(prevPdf.name||'مرفق PDF');pdfFn.style.display='block';}
    if(pdfArea)pdfArea.classList.add('has-file');
    document.getElementById('kb-pdf-remove').style.display='inline-block';
    document.querySelector('#kb-pdf-area .pdf-upload-icon').style.display='none';
    document.querySelector('#kb-pdf-area .pdf-upload-text').style.display='none';
  }
  // Populate clients datalist from contracts
  const dl=document.getElementById('kb-clients-list');
  if(dl){
    const names=[...new Set(contracts.map(c=>c.inv).filter(Boolean))];
    dl.innerHTML=names.map(n=>`<option value="${n}">`).join('');
  }
  document.getElementById('kb-modal-backdrop').classList.add('open');
}


let kambiyalaTempPdf='';
let kambiyalaTempPdfName='';
let kambiyalaPdfRemoved=false;


function onKambiyalaTypeChange(){
  const type=document.getElementById('kb-type').value;
  const insuranceFields=document.getElementById('kb-insurance-fields');
  if(insuranceFields)insuranceFields.style.display=type==='insurance'?'':'none';
}


function closeKambiyalaModal(){
  document.getElementById('kb-modal-backdrop').classList.remove('open');
  editingKambiyala=null;
}


function handleKambiyalaPdfDrop(e){
  e.preventDefault();
  const file=e.dataTransfer?.files[0]||e.target.files[0];
  if(file)processKambiyalaPdf(file);
}


function processKambiyalaPdf(file){
  if(!file||!file.name.toLowerCase().endsWith('.pdf')){showToast('يرجى اختيار ملف PDF فقط',true);return;}
  if(file.size>10*1024*1024){showToast('حجم الملف يتجاوز 10 ميجابايت',true);return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    kambiyalaTempPdf=ev.target.result;
    kambiyalaTempPdfName=file.name;
    const pdfArea=document.getElementById('kb-pdf-area');
    const pdfFn=document.getElementById('kb-pdf-filename');
    if(pdfArea)pdfArea.classList.add('has-file');
    if(pdfFn){pdfFn.textContent='✓ '+file.name;pdfFn.style.display='block';}
    document.getElementById('kb-pdf-remove').style.display='inline-block';
    document.querySelector('#kb-pdf-area .pdf-upload-icon').style.display='none';
    document.querySelector('#kb-pdf-area .pdf-upload-text').style.display='none';
  };
  reader.readAsDataURL(file);
}


function removeKambiyalaPdf(){
  kambiyalaTempPdf='';kambiyalaTempPdfName='';
  kambiyalaPdfRemoved=true;
  const pdfArea=document.getElementById('kb-pdf-area');
  const pdfFn=document.getElementById('kb-pdf-filename');
  if(pdfArea)pdfArea.classList.remove('has-file');
  if(pdfFn){pdfFn.textContent='';pdfFn.style.display='none';}
  document.getElementById('kb-pdf-remove').style.display='none';
  document.querySelector('#kb-pdf-area .pdf-upload-icon').style.display='';
  document.querySelector('#kb-pdf-area .pdf-upload-text').style.display='';
  document.getElementById('kb-pdf-input').value='';
}


async function viewKambiyalaPdf(id){if(!erpRequire('kambiyala','view'))return;
  showToast('جاري تحميل الملف...');
  let p=kbGetPdf(id);
  if(!p) p=await kbGetPdfAsync(id);
  if(!p){showToast('لا يوجد PDF مرفق',true);return;}
  try{
    let base64=p.data;
    if(base64.indexOf(',')>=0) base64=base64.split(',')[1];
    const bin=atob(base64);
    const arr=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
    const blob=new Blob([arr],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){
    // fallback: direct embed
    const win=window.open('','_blank');
    if(win) win.document.write('<html><body style="margin:0"><embed src="'+p.data+'" width="100%" height="100%" type="application/pdf"/></body></html>');
    else showToast('فشل فتح الملف: '+e.message,true);
  }
}


function saveKambiyalaRecord(){if(!erpRequire('kambiyala',editingKambiyala?'edit':'add'))return;
  const num=document.getElementById('kb-num').value.trim();
  const type=document.getElementById('kb-type').value;
  const issueDate=document.getElementById('kb-issue-date').value;
  const dueDate=document.getElementById('kb-due-date').value;
  const amount=document.getElementById('kb-amount').value;
  const bankName=document.getElementById('kb-bank-name').value.trim();
  const clientName=document.getElementById('kb-client-name').value.trim();
  const clientAddress=document.getElementById('kb-client-address').value.trim();
  const clientPhone=document.getElementById('kb-client-phone').value.trim();
  const status=document.getElementById('kb-status').value;
  const location=document.getElementById('kb-location').value;
  const receiptNum=document.getElementById('kb-receipt-num').value.trim();
  const checkNum=document.getElementById('kb-check-num').value.trim();
  const checkBank=document.getElementById('kb-check-bank').value.trim();


  if(!num){showToast('رقم الكمبيالة مطلوب',true);return;}
  if(!dueDate){showToast('تاريخ الاستحقاق مطلوب',true);return;}
  if(!amount||parseFloat(amount)<=0){showToast('يرجى إدخال المبلغ',true);return;}
  // Check duplicate num
  const dupCheck=kambiyalaRecords.find(r=>r.num===num&&r.id!==editingKambiyala);
  if(dupCheck){showToast('رقم الكمبيالة موجود مسبقاً',true);return;}


  const existing=editingKambiyala?kambiyalaRecords.find(x=>x.id===editingKambiyala):null;
  const prevPdf=existing?kbGetPdf(existing.id):null;
  const finalPdf=kambiyalaTempPdf||(kambiyalaPdfRemoved?'':(prevPdf?prevPdf.data:''));
  const finalName=kambiyalaTempPdfName||(kambiyalaPdfRemoved?'':(prevPdf?prevPdf.name:''));
  const record={
    id:existing?existing.id:('kb_'+Date.now()+'_'+Math.floor(Math.random()*9999)),
    num,type,issueDate,dueDate,amount:parseFloat(amount)||0,bankName,clientName,clientAddress,clientPhone,
    status,location,receiptNum,checkNum,checkBank,
    createdAt:existing?existing.createdAt:new Date().toISOString()
  };
  if(existing){
    const idx=kambiyalaRecords.findIndex(x=>x.id===editingKambiyala);
    if(idx>=0)kambiyalaRecords[idx]=record;
  }else{
    kambiyalaRecords.push(record);
  }
  if(!kbSetPdf(record.id,finalPdf,finalName)&&finalPdf){
    showToast('تم حفظ الكمبيالة لكن تعذر حفظ المرفق (مساحة التخزين ممتلئة)',true);
  }
  // Persist first so a UI glitch can never make the record appear "unsaved"
  saveKambiyalaRecords();
  closeKambiyalaModal();
  showToast(existing?'تم تحديث الكمبيالة ✓':'تم إضافة الكمبيالة ✓');
  try{renderKambiyalaTable();}catch(e){console.warn(e);}
  try{renderKambiyalaAlerts();}catch(e){}
  try{refreshKambiyalaAlerts();}catch(e){}
  try{updateKambiyalaKPIs();}catch(e){}
  try{renderKambiyalaDashCard();}catch(e){}
}


function editKambiyalaRecord(id){openKambiyalaModal(id);}


function deleteKambiyalaRecord(id){if(!erpRequire('kambiyala','delete'))return;
  const r=kambiyalaRecords.find(x=>x.id===id);
  if(!r)return;
  document.getElementById('confirmTitle').textContent='حذف الكمبيالة';
  document.getElementById('confirmMsg').textContent=`هل تريد حذف الكمبيالة "${r.num}"؟`;
  document.getElementById('confirmBtn').textContent='حذف';
  deleteCallback=()=>{
    kambiyalaRecords=kambiyalaRecords.filter(x=>x.id!==id);
    kbSetPdf(id,'','');
    saveKambiyalaRecords();
    closeConfirm();
    showToast('تم حذف الكمبيالة');
    renderKambiyalaTable();
    renderKambiyalaAlerts();
    refreshKambiyalaAlerts();
    updateKambiyalaKPIs();
    renderKambiyalaDashCard();
  };
  document.getElementById('confirmBackdrop').classList.add('open');
}


/* ─── Dashboard Card ─── */
function renderKambiyalaDashCard(){
  const card=document.getElementById('kb-dash-widget');if(!card)return;
  const now=new Date();now.setHours(0,0,0,0);
  const due=kambiyalaRecords.filter(r=>r.status==='due');
  const overdue=due.filter(r=>r.dueDate&&new Date(r.dueDate)<now);
  const soon7=due.filter(r=>r.dueDate&&(()=>{const d=new Date(r.dueDate);d.setHours(0,0,0,0);const diff=Math.ceil((d-now)/(86400000));return diff>=0&&diff<=7;})());
  card.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:15px;font-weight:700;color:var(--text)">🏦 الكمبيالات</span>
      <button class="btn btn-ghost btn-xs" onclick="showPage('kambiyala',document.getElementById('nav-kambiyala'))">عرض الكل</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div style="text-align:center;padding:8px;background:var(--amber-100,#fef3c7);border-radius:8px">
        <div style="font-size:22px;font-weight:800;color:var(--amber-700,#b45309)">${due.length}</div>
        <div style="font-size:12px;color:var(--amber-600,#d97706)">مستحقة</div>
      </div>
      <div style="text-align:center;padding:8px;background:var(--red-100,#fee2e2);border-radius:8px">
        <div style="font-size:22px;font-weight:800;color:var(--red-700,#b91c1c)">${overdue.length}</div>
        <div style="font-size:12px;color:var(--red-600,#dc2626)">متأخرة</div>
      </div>
      <div style="text-align:center;padding:8px;background:var(--blue-50,#eff6ff);border-radius:8px">
        <div style="font-size:22px;font-weight:800;color:var(--blue-700)">${soon7.length}</div>
        <div style="font-size:12px;color:var(--blue-600)">خلال 7 أيام</div>
      </div>
    </div>
    ${overdue.length>0?`<div style="margin-top:8px;padding:6px 10px;background:var(--red-50,#fef2f2);border:1px solid var(--red-200,#fecaca);border-radius:6px;font-size:13px;color:var(--red-600,#dc2626)">⚠️ ${overdue.length} كمبيالة تجاوزت تاريخ استحقاقها</div>`:''}
  `;
}


/* ─── Print Report ─── */
function printKambiyalaReport(){if(!erpRequire('kambiyala','print'))return;
  const now=new Date();now.setHours(0,0,0,0);
  const data=[...kambiyalaRecords].filter(r=>r.status==='due'||r.status==='returned').sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));
  const rows=data.map((r,i)=>{
    const d=r.dueDate?new Date(r.dueDate):null;
    let daysLabel='—';
    if(d){const diff=Math.ceil((d-now)/(1000*60*60*24));daysLabel=(diff<0?'متأخر '+Math.abs(diff):diff)+' يوم';}
    return`<tr style="border-bottom:1px solid #e2e8f0;background:${i%2===0?'#fff':'#f8fafc'}">
      <td style="padding:6px 10px;text-align:center">${i+1}</td>
      <td style="padding:6px 10px;font-weight:700;color:#1e3a8a">${r.num}</td>
      <td style="padding:6px 10px">${r.type==='insurance'?'شيك تأمين':'كمبيالة دفع'}</td>
      <td style="padding:6px 10px">${r.issueDate||'—'}</td>
      <td style="padding:6px 10px;font-weight:700">${r.dueDate||'—'}</td>
      <td style="padding:6px 10px">${daysLabel}</td>
      <td style="padding:6px 10px;font-weight:700">${(parseFloat(r.amount)||0).toLocaleString('en',{minimumFractionDigits:3})} د.أ</td>
      <td style="padding:6px 10px">${r.bankName||'—'}</td>
      <td style="padding:6px 10px">${r.clientName||'—'}</td>
      <td style="padding:6px 10px">${r.status==='paid'?'مسددة':r.status==='returned'?'مرتجعة':'مستحقة'}</td>
      <td style="padding:6px 10px">${getKambiyalaLocationLabel(r.location)}</td>
    </tr>`;
  }).join('');
  const totalAmt=data.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
  const html=`
    <table style="width:100%;border-collapse:collapse;direction:rtl;font-size:14px">
      <thead>
        <tr style="background:linear-gradient(135deg,#2563eb,#4f46e5)">
          ${['#','رقم','النوع','تحرير','استحقاق','الأيام','المبلغ','البنك','العميل','الحالة','مكان الوجود'].map(h=>`<th style="color:white;padding:8px 10px;text-align:right;font-weight:600">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows||'<tr><td colspan="11" style="text-align:center;padding:20px;color:#94a3b8">لا توجد بيانات</td></tr>'}</tbody>
    </table>
    <div style="margin-top:14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;color:#1e3a8a">إجمالي المبالغ المستحقة</span>
      <span style="font-size:20px;font-weight:900;color:#1e3a8a">${totalAmt.toLocaleString('en',{minimumFractionDigits:3})} د.أ</span>
    </div>`;
  if(typeof openPrintWindow==='function')openPrintWindow('صندوق الشيكات - كشف الكمبيالات المستحقة',html);
  else{const w=window.open('','_blank');w.document.write('<html dir="rtl"><body>'+html+'</body></html>');w.print();}
}


/* ══════════════════════ END KAMBIYALA MODULE ══════════════════════ */
