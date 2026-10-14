/* ═══ 5B Mall — Detail Modal & Reading History ═══ */
/* ══════════════════════ READING HISTORY ══════════════════════ */
let _rhContext=null; // {contractId,meterType,contractNum,investorName} — kept to refresh the modal after admin edit/delete
function showReadingHistory(contractId,meterType,contractNum,investorName){
  _rhContext={contractId,meterType,contractNum,investorName};
  const readings=meterReadings.filter(r=>r.contractId===contractId&&r.meterType===meterType);
  document.getElementById('rhTitle').textContent='سجل قراءات العقد - '+contractNum;
  document.getElementById('rhSub').textContent=investorName+' ('+(meterType==='water'?'ماء':'كهرباء')+')';
  const tb=document.getElementById('rhTableBody');
  const empty=document.getElementById('rhEmpty');
  // Item 5: admin can edit/delete a reading directly from this history view
  const isAdmin=erpCan('services','edit')||erpCan('services','delete');
  const actionsHeader=document.getElementById('rhActionsHeader');
  if(actionsHeader)actionsHeader.style.display=isAdmin?'':'none';
  if(!readings.length){
    tb.innerHTML='';
    empty.style.display='flex';
  }else{
    empty.style.display='none';
    const monthNames=['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const price=servicePrices[meterType]||0;
    const unit=meterType==='water'?'م³':'ك.و.س';
    const consMap=buildConsumptionMap(readings,price);
    tb.innerHTML=readings.sort((a,b)=>b.year-a.year||b.month-a.month).map((r,i)=>{
      const rd=r.readingDate?new Date(r.readingDate).toLocaleDateString('ar-JO'):'—';
      const ad=r.createdAt?new Date(r.createdAt).toLocaleDateString('ar-JO')+' '+new Date(r.createdAt).toLocaleTimeString('ar-JO',{hour:'2-digit',minute:'2-digit'}):'—';
      const cons=consMap[r.id]||{qty:null,val:null};
      const qtyCell=cons.qty===null?'<span style="color:var(--text-l)">—</span>':`<span style="font-weight:700;color:${cons.qty<0?'var(--red)':'var(--teal)'}">${cons.qty.toLocaleString('en')} ${unit}</span>`;
      const valCell=cons.val===null?'<span style="color:var(--text-l)">—</span>':`<span style="font-weight:700;color:var(--green)">${cons.val.toLocaleString('en')} د.أ</span>`;
      const actionsCell=isAdmin?`<td><div class="td-actions">
        <button class="btn btn-ghost btn-xs" title="تعديل" onclick="editReadingEntry('${r.id}')"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:var(--blue);stroke-width:2;fill:none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn btn-ghost btn-xs" title="حذف" onclick="deleteReadingEntry('${r.id}')" style="color:var(--red)"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
      </div></td>`:'';
      return `<tr>
        <td style="color:var(--text-l);font-size:13px">${i+1}</td>
        <td>${meterType==='water'?'💧 ماء':'⚡ كهرباء'}</td>
        <td style="font-weight:700">${r.meterNumber||'—'}</td>
        <td>${r.year}</td>
        <td>${monthNames[parseInt(r.month)]||r.month}</td>
        <td>${rd}</td>
        <td style="font-weight:700;color:var(--blue);font-size:16px">${r.reading.toLocaleString('en')}</td>
        <td>${qtyCell}</td>
        <td>${valCell}</td>
        <td style="font-size:13px;color:var(--text-m)">${ad}</td>
        ${actionsCell}
      </tr>`;
    }).join('');
  }
  document.getElementById('readingHistoryBackdrop').classList.add('open');
}
function closeReadingHistory(){document.getElementById('readingHistoryBackdrop').classList.remove('open');}
function printReadingHistory(){if(!erpRequire('services','print'))return;
  if(!_rhContext){showToast('لا يوجد سياق للطباعة',true);return;}
  const {contractId,meterType,contractNum,investorName}=_rhContext;
  const readings=meterReadings.filter(r=>r.contractId===contractId&&r.meterType===meterType);
  const monthNames=['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const price=servicePrices[meterType]||0;
  const unit=meterType==='water'?'م³':'ك.و.س';
  const consMap=buildConsumptionMap(readings,price);
  let totalVal=0;
  let rows=readings.sort((a,b)=>b.year-a.year||b.month-a.month).map((r,i)=>{
    const rd=r.readingDate?new Date(r.readingDate).toLocaleDateString('ar-JO'):'—';
    const cons=consMap[r.id]||{qty:null,val:null};
    if(cons.qty!==null)totalVal+=cons.val;
    const qtyCell=cons.qty===null?'—':cons.qty.toLocaleString('en')+' '+unit;
    const valCell=cons.val===null?'—':cons.val.toLocaleString('en')+' د.أ';
    return '<tr><td style="text-align:center">'+(i+1)+'</td><td>'+(meterType==='water'?'💧 ماء':'⚡ كهرباء')+'</td><td>'+(r.meterNumber||'—')+'</td><td>'+r.year+'</td><td>'+(monthNames[parseInt(r.month)]||r.month)+'</td><td>'+rd+'</td><td style="font-weight:700;color:#1e3a8a">'+r.reading.toLocaleString('en')+'</td><td>'+qtyCell+'</td><td>'+valCell+'</td></tr>';
  }).join('');
  if(!rows)rows='<tr><td colspan="9" style="text-align:center;color:#64748b">لا توجد قراءات مسجلة</td></tr>';
  const html='<table><tr><th>#</th><th>النوع</th><th>رقم العداد</th><th>السنة</th><th>الشهر</th><th>تاريخ القراءة</th><th>القراءة</th><th>كمية الاستهلاك</th><th>قيمة الاستهلاك</th></tr>'+rows+'</table>'+
    '<div style="margin-top:10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:#1e3a8a">إجمالي قيمة الاستهلاك</span><span style="font-size:20px;font-weight:900;color:#1e3a8a">'+totalVal.toLocaleString('en')+' د.أ</span></div>';
  openPrintWindow('سجل قراءات العقد - '+contractNum+' ('+investorName+')',html);
}


// Item 5: allow an admin to correct or remove a previously-saved reading.
function editReadingEntry(readingId){if(!erpRequire('services','edit'))return;
  if(!erpRequire('services','edit'))return;
  const r=meterReadings.find(x=>x.id===readingId);
  if(!r)return;
  const newVal=prompt('تعديل قيمة القراءة:',r.reading);
  if(newVal===null)return;
  const num=parseFloat(newVal);
  if(isNaN(num)||num<0){showToast('قيمة قراءة غير صحيحة',true);return;}
  const newDate=prompt('تعديل تاريخ القراءة (YYYY-MM-DD):',r.readingDate||'');
  if(newDate===null)return;
  const dt=new Date(newDate);
  if(isNaN(dt.getTime())){showToast('تاريخ غير صحيح',true);return;}
  const month=String(dt.getMonth()+1),year=String(dt.getFullYear());
  const conflict=findMonthConflict(r.contractId,r.meterType,month,year,newDate);
  if(conflict&&conflict.id!==r.id){showToast('⚠ يوجد بالفعل قراءة أخرى لنفس العقد في نفس الشهر',true);return;}
  r.reading=num;r.readingDate=newDate;r.month=month;r.year=year;r.updatedAt=Date.now();
  saveMeterReadings(meterReadings);
  showToast('✅ تم تعديل القراءة بنجاح');
  if(_rhContext)showReadingHistory(_rhContext.contractId,_rhContext.meterType,_rhContext.contractNum,_rhContext.investorName);
  if(document.getElementById('srv-type').value)loadMeterReadingsTable();
  const srvListPanel=document.getElementById('srv-list');
  if(srvListPanel&&srvListPanel.classList.contains('active'))renderServicesLogTable();
}
function deleteReadingEntry(readingId){if(!erpRequire('services','delete'))return;
  if(!erpRequire('services','delete'))return;
  if(!confirm('هل أنت متأكد من حذف هذه القراءة؟ لا يمكن التراجع عن هذا الإجراء.'))return;
  meterReadings=meterReadings.filter(r=>r.id!==readingId);
  saveMeterReadings(meterReadings);
  showToast('تم حذف القراءة');
  if(_rhContext)showReadingHistory(_rhContext.contractId,_rhContext.meterType,_rhContext.contractNum,_rhContext.investorName);
  if(document.getElementById('srv-type').value)loadMeterReadingsTable();
  const srvListPanel=document.getElementById('srv-list');
  if(srvListPanel&&srvListPanel.classList.contains('active'))renderServicesLogTable();
}


/* ══════════════════════ VACANT SPACES TOGGLE (✓/✗) ══════════════════════ */
function toggleVacantSpaces(){
  const inp=document.getElementById('f-vacant-spaces');
  setVacantSpaces(inp.value!=='true');
}
function setVacantSpaces(val){
  const inp=document.getElementById('f-vacant-spaces');
  inp.value=val?'true':'false';
  const btn=document.getElementById('f-vacant-spaces-toggle');
  const icon=document.getElementById('f-vacant-spaces-icon');
  if(btn&&icon){
    if(val){
      btn.classList.add('is-yes');btn.classList.remove('is-no');
      icon.textContent='✓';
    }else{
      btn.classList.add('is-no');btn.classList.remove('is-yes');
      icon.textContent='✗';
    }
  }
  // The legacy floor/building/shop row is replaced by the location-groups picker
  // and must never be shown.
  const fbsRow=document.getElementById('location-fbs-row');
  if(fbsRow)fbsRow.style.display='none';
  // When "مساحات فارغة" is checked the location picker is not applicable
  const locTitle=document.getElementById('locationPickerTitle');
  const locContainer=document.getElementById('location-groups-container');
  if(locTitle)locTitle.style.display=val?'none':'';
  if(locContainer)locContainer.style.display=val?'none':'';
}


// Moves the "تحديد الموقع" block between its normal position (after the notes
// field, marked by #locationPickerAnchor) and inside the short-term
// classifications section (#short-categories-section), depending on contract type.
function moveLocationPickerBlock(isShort){
  const block=document.getElementById('locationPickerBlock');
  if(!block)return;
  if(isShort){
    block.style.display='none';
  }else{
    block.style.display='';
    const anchor=document.getElementById('locationPickerAnchor');
    if(anchor&&block.previousElementSibling!==anchor){
      anchor.parentElement.insertBefore(block,anchor.nextSibling);
    }
  }
}


/* ══════════════════════ SERVICE TYPE BUTTONS ══════════════════════ */
let svcSelection={water:false,electric:false};
function toggleServiceBtn(type){
  svcSelection[type]=!svcSelection[type];
  updateServiceBtnUI();
}
function updateServiceBtnUI(){
  const wb=document.getElementById('svcBtnWater');
  const eb=document.getElementById('svcBtnElectric');
  if(wb){wb.style.borderColor=svcSelection.water?'var(--blue)':'var(--border)';wb.style.background=svcSelection.water?'var(--blue-l)':'';wb.style.color=svcSelection.water?'var(--blue)':'';}
  if(eb){eb.style.borderColor=svcSelection.electric?'var(--blue)':'var(--border)';eb.style.background=svcSelection.electric?'var(--blue-l)':'';eb.style.color=svcSelection.electric?'var(--blue)':'';}
  document.getElementById('f-svc-water').value=svcSelection.water?'1':'';
  document.getElementById('f-svc-electric').value=svcSelection.electric?'1':'';
}
function setServiceBtns(water,electric){
  svcSelection={water:!!water,electric:!!electric};
  updateServiceBtnUI();
}
let hasServicesSelection=null;
function toggleHasServices(val){
  hasServicesSelection=val;
  document.getElementById('f-has-services').value=val?'yes':'no';
  document.getElementById('svcFieldsSection').style.display=val?'':'none';
  const yBtn=document.getElementById('svcHasYes');
  const nBtn=document.getElementById('svcHasNo');
  if(yBtn){yBtn.style.borderColor=val?'var(--green)':'var(--border)';yBtn.style.background=val?'var(--green-l)':'';yBtn.style.color=val?'var(--green)':'';}
  if(nBtn){nBtn.style.borderColor=!val?'var(--red)':'var(--border)';nBtn.style.background=!val?'var(--red-l)':'';nBtn.style.color=!val?'var(--red)':'';}
}
function setHasServices(val){
  hasServicesSelection=val;
  document.getElementById('f-has-services').value=val===null?'':val?'yes':'no';
  const section=document.getElementById('svcFieldsSection');
  if(section)section.style.display=val?'':'none';
  const yBtn=document.getElementById('svcHasYes');
  const nBtn=document.getElementById('svcHasNo');
  if(val===null){
    if(yBtn){yBtn.style.borderColor='var(--border)';yBtn.style.background='';yBtn.style.color='';}
    if(nBtn){nBtn.style.borderColor='var(--border)';nBtn.style.background='';nBtn.style.color='';}
  } else {
    if(yBtn){yBtn.style.borderColor=val?'var(--green)':'var(--border)';yBtn.style.background=val?'var(--green-l)':'';yBtn.style.color=val?'var(--green)':'';}
    if(nBtn){nBtn.style.borderColor=!val?'var(--red)':'var(--border)';nBtn.style.background=!val?'var(--red-l)':'';nBtn.style.color=!val?'var(--red)':'';}
  }
}
/* ══════════════════════ LAND PLOT SELECT ══════════════════════ */
let landPlots=['846','856'];
function initLandPlotOptions(){
  const sel=document.getElementById('f-land-plot');
  if(!sel)return;
  const current=sel.value;
  sel.innerHTML='<option value="">-- اختر قطعة الأرض --</option>';
  landPlots.forEach(p=>{
    const opt=document.createElement('option');
    opt.value=p;opt.textContent=p;
    sel.appendChild(opt);
  });
  if(current&&landPlots.includes(current))sel.value=current;
}
function showAddLandPlot(){
  const wrap=document.getElementById('addLandPlotWrap');
  if(wrap)wrap.style.display=wrap.style.display==='none'?'flex':'none';
}
function addLandPlot(){
  const inp=document.getElementById('f-land-plot-new');
  if(!inp)return;
  const val=inp.value.trim();
  if(!val){showToast('أدخل رقم القطعة',true);return;}
  if(landPlots.includes(val)){showToast('هذه القطعة موجودة مسبقاً',true);return;}
  landPlots.push(val);
  inp.value='';
  initLandPlotOptions();
  const sel=document.getElementById('f-land-plot');
  if(sel)sel.value=val;
  showToast('تمت إضافة قطعة الأرض '+val+' ✓');
}




