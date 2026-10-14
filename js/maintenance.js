/* ═══ 5B Mall — Maintenance Module ═══ */
/* ══════════════════════ MAINTENANCE MODULE ══════════════════════ */
const SK_MAINT='lms_maintenance_v1';
let maintRecords=[];
let maintSaving=false;
function maintArray(value){return (Array.isArray(value)?value:Object.values(value||{})).filter(r=>r&&typeof r==='object');}
function loadMaintRecords(){try{return maintArray(JSON.parse(localStorage.getItem(SK_MAINT)||'[]'));}catch(_){return [];}}
function cacheMaintRecords(){try{localStorage.setItem(SK_MAINT,JSON.stringify(maintRecords));}catch(e){console.warn('تعذر التخزين المحلي للصيانة',e);}}
maintRecords=loadMaintRecords();
function maintEsc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function initMaintPage(){
  const date=document.getElementById('maint-date');
  if(date&&!date.value){const d=new Date();date.value=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  renderMaintLog();
}
function switchMaintTab(tab){
  const home=tab==='home';
  const log=tab==='log';
  document.getElementById('maint-home').hidden=!home;
  document.getElementById('maint-entry').hidden=tab!=='entry';
  document.getElementById('maint-log').hidden=!log;
  if(log)renderMaintLog();
}
function renderMaintLog(){
  const body=document.getElementById('maint-log-body');if(!body)return;
  const term=(document.getElementById('maint-search')?.value||'').trim().toLocaleLowerCase();
  const entries=maintRecords.filter(r=>[r.type||r.specialties?.join('، ')||r.reqtype,r.description||r.desc,r.executedBy,r.paymentMethod].some(v=>String(v||'').toLocaleLowerCase().includes(term)))
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const money=new Intl.NumberFormat('ar-JO',{minimumFractionDigits:3,maximumFractionDigits:3});
  body.innerHTML=entries.length?entries.map(r=>{const amount=Number(r.amount??r.total);return '<tr><td>'+maintEsc(r.date||'—')+'</td><td>'+maintEsc(r.type||r.specialties?.join('، ')||r.reqtype||'—')+'</td><td style="min-width:200px;white-space:pre-wrap;overflow-wrap:anywhere">'+maintEsc(r.description||r.desc||'—')+'</td><td>'+ (Number.isFinite(amount)?money.format(amount)+' د.أ':'—')+'</td><td>'+maintEsc(r.paymentMethod||'غير مسجل')+'</td><td>'+maintEsc(r.executedBy||'غير مسجل')+'</td><td class="maint-actions-cell"><button type="button" class="btn btn-outline" data-maint-print="'+maintEsc(r.id||'')+'">طباعة</button></td></tr>';}).join(''):'<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text-m)">لا توجد أعمال صيانة مطابقة.</td></tr>';
  document.getElementById('maint-count').textContent='('+entries.length+')';
  document.getElementById('maint-sum').textContent='إجمالي المعروض: '+money.format(entries.reduce((n,r)=>n+(Number(r.amount??r.total)||0),0))+' د.أ';
}
async function submitMaintEntry(event){event.preventDefault();if(!erpRequire('maintenance','add'))return;
  event.preventDefault();if(maintSaving)return;
  const form=event.currentTarget;if(!form.reportValidity())return;
  const value=id=>document.getElementById(id).value.trim();
  const amount=Number(value('maint-amount'));
  if(!Number.isFinite(amount)||amount<0){document.getElementById('maint-status').textContent='أدخل قيمة صحيحة.';return;}
  const record={id:'MAINT-'+(window.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),type:value('maint-type'),date:value('maint-date'),amount,description:value('maint-description'),paymentMethod:value('maint-payment'),executedBy:value('maint-executor'),supervisor:session?.name||session?.username||'',createdAt:new Date().toISOString()};
  const status=document.getElementById('maint-status'),button=document.getElementById('maint-submit');
  maintSaving=true;button.disabled=true;status.textContent='جارٍ الحفظ…';
  try{
    if(fbReady&&fbDB){
      await fbDB.ref('maintenance').push(record);
      if(!maintRecords.some(r=>r.id===record.id))maintRecords=[...maintRecords,record];
    }else{maintRecords=[...maintRecords,record];}
    cacheMaintRecords();form.reset();initMaintPage();switchMaintTab('log');status.textContent='';showToast('تم حفظ الصيانة في السجل');
    const printButton=document.getElementById('maint-print-saved');
    printButton.hidden=false;printButton.dataset.maintPrint=record.id;
  }catch(e){status.textContent='تعذر حفظ الصيانة. '+(e?.message||'تحقق من الاتصال والصلاحيات.');showToast('تعذر حفظ الصيانة',true);}
  finally{maintSaving=false;button.disabled=false;}
}
document.getElementById('maint-log-body').addEventListener('click',event=>{
  const button=event.target.closest('[data-maint-print]');
  if(button)printMaintRecord(button.dataset.maintPrint);
});
function printMaintRecord(id){if(!erpRequire('maintenance','print'))return;
  const r=maintRecords.find(item=>item.id===id);
  if(!r){showToast('لم يُعثر على سجل الصيانة',true);return;}
  const esc=maintEsc,amount=Number(r.amount??r.total),money=new Intl.NumberFormat('ar-JO',{minimumFractionDigits:3,maximumFractionDigits:3});
  const date=r.date?new Date(r.date+'T12:00:00').toLocaleDateString('ar-JO',{year:'numeric',month:'long',day:'numeric'}):'—';
  const info=(label,val)=>'<div class="field"><span>'+label+'</span><strong>'+esc(val||'—')+'</strong></div>';
  const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>أمر صيانة ${esc(r.id||'')}</title><style>
  @page{size:A4 portrait;margin:13mm}*{box-sizing:border-box}body{margin:0;font:14px/1.8 Tahoma,Arial,sans-serif;color:#17233c;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{position:relative;min-height:265mm;border:1px solid #dce5f2;padding:16mm 14mm 34mm;background:radial-gradient(circle at 50% 45%,rgba(32,73,132,.035),transparent 50%),#fff}
  .sheet:before{content:'5B';position:absolute;inset:37% 0 auto;text-align:center;font:bold 120px Arial;color:rgba(32,73,132,.045);pointer-events:none}
  header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #173b75;padding-bottom:14px}header b{color:#173b75;font-size:26px;letter-spacing:2px}header small{display:block;color:#66748b;font-size:13px}h1{text-align:center;font-size:23px;margin:28px 0 4px}h1:after{content:'';display:block;width:100px;height:2px;background:#173b75;margin:7px auto 0}.ref{text-align:center;color:#63748c;font-size:13px;margin-bottom:24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{border:1px solid #dce5f2;background:#f8fafd;border-radius:6px;padding:8px 12px;min-height:61px}.field span{display:block;color:#64748b;font-size:13px}.field strong{display:block;overflow-wrap:anywhere}.block{margin-top:18px}.block h2{font-size:15px;color:#173b75;margin:0 0 6px}.description{border:1px solid #dce5f2;border-radius:6px;min-height:105px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere}.total{margin-top:20px;padding:10px 14px;border:1px solid #173b75;display:flex;justify-content:space-between;font-weight:bold}.signatures{position:absolute;bottom:14mm;left:14mm;right:14mm;display:grid;grid-template-columns:1fr 1fr;gap:16px}.signature{border:1px solid #aebdd2;border-radius:6px;padding:8px 12px;min-height:80px}.signature b{display:block;color:#173b75}.signature small{display:block;color:#65758d}.signature .line{border-bottom:1px dotted #70809a;height:24px}footer{text-align:center;color:#8490a2;font-size:12px;margin-top:20px}@media screen{body{background:#e7ecf3;padding:18px}.sheet{width:210mm;margin:auto;box-shadow:0 10px 32px #0002}.toolbar{display:flex;justify-content:center;gap:10px;margin:12px}.toolbar button{padding:8px 22px;cursor:pointer}}@media print{.toolbar{display:none}.sheet{border:none;min-height:267mm}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">طباعة</button><button onclick="window.close()">إغلاق</button></div><article class="sheet"><header><div><b>5B MALL</b><small>إدارة العقود والصيانة</small></div><div>أمر صيانة / مطالبة مالية</div></header><h1>أمر صيانة / مطالبة مالية</h1><div class="ref">رقم الطلب: ${esc(r.id||'—')}</div>
  <div class="grid">${info('تاريخ الطلب',date)}${info('نوع الصيانة',r.type||r.specialties?.join('، ')||r.reqtype)}${info('طريقة الدفع',r.paymentMethod||'غير مسجلة')}${info('نُفذت بواسطة',r.executedBy||'غير مسجل')}</div>
  <section class="block"><h2>وصف العطل والعمل المنفّذ</h2><div class="description">${esc(r.description||r.desc||'—')}</div></section>
  <div class="total"><span>قيمة الصيانة</span><span>${Number.isFinite(amount)?money.format(amount):'—'} د.أ</span></div>
  <div class="signatures"><div class="signature"><b>المشرف</b><small>${esc(r.supervisor||'غير مسجل')}</small><div class="line"></div><small>التوقيع</small></div><div class="signature"><b>المدير</b><div class="line"></div><small>الاسم والتوقيع</small></div></div></article></body></html>`;
  const win=window.open('','_blank');
  if(!win){showToast('اسمح بفتح نافذة الطباعة ثم اضغط طباعة مجدداً',true);return;}
  win.document.open();win.document.write(html);win.document.close();
  win.setTimeout(()=>win.print(),350);
}
/* ══════════════════════ END MAINTENANCE MODULE ══════════════════════ */


