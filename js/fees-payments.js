/* ═══ 5B Mall — Rent Years, Fees & Payments ═══ */
/* ══════════════════════ RENT YEARS ══════════════════════ */
function updateRentYearsGrid(){
  const sv=document.getElementById('f-start').value;
  const tv=getTermInYears();
  const container=document.getElementById('rentYearsContainer');
  if(!sv||!tv){container.innerHTML='<div style="font-size:14px;color:var(--text-m);text-align:center;padding:12px;background:var(--bg);border-radius:var(--radius)">حدد تاريخ البدء والمدة أولاً</div>';return;}
  const sy=new Date(sv).getFullYear();
  const ty=Math.max(1,Math.ceil(tv));
  const years=[];for(let i=0;i<ty;i++)years.push(sy+i);
  container.innerHTML=years.map(yr=>{
    const ex=(editingContract?.rentYears?.[yr]!==undefined&&editingContract.rentYears[yr]!==null)?editingContract.rentYears[yr]:'';
    return`<div class="rent-year-row"><div class="rent-year-lbl">${yr}</div><div class="form-group"><input type="number" id="rent-yr-${yr}" class="finput" placeholder="قيمة الإيجار" min="0" value="${ex}" oninput="calcFees()" /><div class="fhint" id="rent-yr-${yr}-tax" style="margin-top:3px">ضريبة المبيعات: 0 د.أ</div><div class="fhint" id="rent-yr-${yr}-knw" style="margin-top:1px">بدل المعارف: 0 د.أ</div></div></div>`;
  }).join('');
  calcFees();
}
// Item 2: refreshes the read-only "ضريبة المبيعات" line shown under each
// year's rent field. This is always computed automatically from the rate
// defined for the contract — the user never types it in directly.
function updateRentYearTaxDisplays(){
  const rentYears=getRentYearsData();
  const isShort=selectedType==='short';
  const svcRate=isShort?0:getRate('f-svc-rate', 10);
  const knwRate=isShort?0:getRate('f-knw-rate', 2);
  const taxRate=getEffectiveTaxRate();
  Object.keys(rentYears).forEach(yr=>{
    const taxEl=document.getElementById('rent-yr-'+yr+'-tax');
    const knwEl=document.getElementById('rent-yr-'+yr+'-knw');
    if(!taxEl&&!knwEl)return;
    const annualRent=rentYears[yr]||0;
    const aSvc=isShort?0:Math.round(annualRent*svcRate/100);
    const aKnw=isShort?0:Math.round(annualRent*knwRate/100);
    const aTax=isShort?Math.round(annualRent*taxRate/100):Math.round(aSvc*taxRate/100);
    if(taxEl)taxEl.textContent='ضريبة المبيعات: '+aTax.toLocaleString('en')+' د.أ';
    if(knwEl){
      knwEl.style.display=isShort?'none':'';
      knwEl.textContent='بدل المعارف: '+aKnw.toLocaleString('en')+' د.أ';
    }
  });
}


function getRentYearsData(){
  const sv=document.getElementById('f-start').value;
  const tv=getTermInYears();
  if(!sv||!tv)return{};
  const sy=new Date(sv).getFullYear();
  const ty=Math.max(1,Math.ceil(tv));
  const r={};
  for(let i=0;i<ty;i++){const yr=sy+i;const el=document.getElementById('rent-yr-'+yr);if(el){const v=parseFloat(el.value);r[yr]=isNaN(v)?0:v;}}
  return r;
}


function sumRentYears(){return Object.values(getRentYearsData()).reduce((s,v)=>s+v,0);}


/* ══════════════════════ CALC FEES ══════════════════════ */
function getEffectiveTaxRate(){
  if(selectedType==='short'){
    const sel=document.getElementById('f-tax-rate-short');
    if(sel)return parseFloat(sel.value)||0;
  }
  return getRate('f-tax-rate', 16);
}
function calcFees(){
  const total = sumRentYears();
  const isShort=selectedType==='short';
  const svcRate = isShort?0:getRate('f-svc-rate', 10);
  const knwRate = isShort?0:getRate('f-knw-rate', 2);
  const taxRate = getEffectiveTaxRate();


  const svc  = isShort?0:(total>0?Math.round(total * svcRate / 100):0);
  const knw  = isShort?0:(total>0?Math.round(total * knwRate / 100):0);
  const tax  = total>0?(isShort?Math.round(total * taxRate / 100):Math.round(svc * taxRate / 100)):0;
  const grand = total + svc + knw + tax;


  const set = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  set('fee-rent', total.toLocaleString('en')+' د.أ');
  set('fee-svc',  svc.toLocaleString('en')+' د.أ');
  set('fee-knw',  knw.toLocaleString('en')+' د.أ');
  set('fee-tax',  tax.toLocaleString('en')+' د.أ');
  set('fee-total', grand.toLocaleString('en')+' د.أ');
  set('fee-svc-rate-lbl', svcRate);
  set('fee-knw-rate-lbl', knwRate);
  set('fee-tax-rate-lbl', taxRate);
  set('review-total', grand.toLocaleString('en')+' د.أ');
  const taxRow=document.getElementById('fee-tax-row');
  const svcEl=document.getElementById('fee-svc-row');
  const knwEl=document.getElementById('fee-knw-row');
  if(taxRow) taxRow.style.display=taxRate<=0?'none':'';
  if(svcEl) svcEl.style.display=svcRate<=0?'none':'';
  if(knwEl) knwEl.style.display=knwRate<=0?'none':'';
  updateRentYearTaxDisplays();
  updatePaymentsPreview();
}


/* ══════════════════════ PAYMENTS PREVIEW ══════════════════════ */
function updatePaymentsPreview(){
  const numP=Math.min(10,Math.max(1,parseInt(document.getElementById('f-num-payments').value)||1));
  const sv=document.getElementById('f-start').value;
  const rentData=getRentYearsData();
  const prev=document.getElementById('paymentsPreview');
  const grid=document.getElementById('paymentsGrid');
  if(!sv||Object.keys(rentData).length===0||numP<=0){prev.style.display='none';return;}
  prev.style.display='block';
  const svcRate = selectedType==='short'?0:getRate('f-svc-rate', 10);
  const knwRate = selectedType==='short'?0:getRate('f-knw-rate', 2);
  const taxRate = getEffectiveTaxRate();
  const sd=new Date(sv);
  const years=Object.keys(rentData).sort();
  let html='';let totalPayments=0;
  years.forEach((yr,yrIdx)=>{
    const annualRent=rentData[yr]||0;
    if(annualRent<=0)return;
    const aSvc=selectedType==='short'?0:Math.round(annualRent*svcRate/100);
    const aKnw=selectedType==='short'?0:Math.round(annualRent*knwRate/100);
    const aTax=selectedType==='short'?Math.round(annualRent*taxRate/100):Math.round(aSvc*taxRate/100);
    const annualTotal=annualRent+aSvc+aKnw+aTax;
    const perP=Math.round(annualTotal/numP);
    if(perP<=0)return;
    const yrStart=new Date(parseInt(yr),sd.getMonth(),sd.getDate());
    html+=`<div style="font-size:14px;color:var(--text-m);margin-bottom:4px;margin-top:${yrIdx>0?'10px':'0'}">📅 ${yr} (${numP} دفعة):</div>`;
    for(let i=0;i<numP;i++){
      totalPayments++;
      const dayOffset=Math.round(365*i/numP);
      const d=new Date(yrStart.getTime()+dayOffset*86400000);
      html+=`<div class="payment-item"><span class="payment-num">${totalPayments}</span><span class="payment-date">${d.toLocaleDateString('ar-JO')}</span><span class="payment-amt">${perP.toLocaleString('en')} د.أ</span></div>`;
    }
  });
  if(totalPayments===0){prev.style.display='none';return;}
  html+=`<div style="font-size:13px;color:var(--text-m);margin-top:8px">إجمالي الدفعات: ${totalPayments} دفعة</div>`;
  grid.innerHTML=html;
}


/* ══════════════════════ CONTRACT MODAL ══════════════════════ */
let currentStep=0,selectedType='',newRowId=null,editingContract=null;


function openModal(contractId=null){
  const isEdit=!!contractId;
  if(isEdit){
    if(!hasContractPerm('edit')){showToast('ليس لديك صلاحية تعديل العقود',true);return;}
  } else {
    if(!hasContractPerm('add')){showToast('ليس لديك صلاحية إضافة عقود',true);return;}
  }
  editingContract=contractId?contracts.find(c=>c.id===contractId):null;
  currentStep=0;selectedType='';
  const titleEl=document.getElementById('modalMainTitle');
  if(titleEl)titleEl.textContent=editingContract?'تعديل العقد':'إضافة عقد إيجار';
  resetModal();
  initLandPlotOptions();
  populateFloors();populateZones();
  if(editingContract){populateForEdit(editingContract);}else{
    const autoRadio=document.querySelector('input[name="numMode"][value="auto"]');
    if(autoRadio)autoRadio.checked=true;
    numMode='auto';
    initLocationGroups();
  }
  document.getElementById('modalBackdrop').classList.add('open');
  document.body.style.overflow='hidden';
  updateStepUI();
}


function populateForEdit(c){
  selectedType=c.type||'commercial';
  document.getElementById('tc-'+selectedType)?.classList.add('selected');
  // Always start from a clean second-shop state when opening the edit form,
  // so that UI state left over from a previous "add new contract" session (or
  // from editing a different contract) never bleeds into this one.
  resetSecondShopUI();
  const secondShopWrapEdit=document.getElementById('addSecondShopWrap');
  if(selectedType==='commercial'){
    if(secondShopWrapEdit)secondShopWrapEdit.style.display='';
    if(c.secondShop&&(c.secondShop.building||c.secondShop.shop)){
      addSecondShop();
      const s2=c.secondShop;
      const f2=document.getElementById('f-loc2-floor');if(f2)f2.value=s2.floor||'';
      const b2=document.getElementById('f-loc2-building');if(b2)b2.value=s2.building||'';
      populateShopNumbers2();
      const sh2=document.getElementById('f-loc2-shop');if(sh2)sh2.value=s2.shop||'';
      const d2=document.getElementById('f-loc2-division');if(d2)d2.value=s2.division||'';
      updateSecondShopCode();
      autofillAreaFromLocation2();
    }
  }
  ['f-num','f-acct','f-inv','f-brand','f-area','f-notes','f-del-name','f-del-phone','f-fin-name','f-fin-phone'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=c[id.replace('f-','').replace(/-([a-z])/g,(_,l)=>l.toUpperCase())]||'';});
  document.getElementById('f-electric').value=c.electricMeter||'';
  document.getElementById('f-water').value=c.waterMeter||'';
  // New service fields
  // Service type buttons
  setServiceBtns(c.serviceType==='water'||c.serviceType==='both'||!c.serviceType, c.serviceType==='electricity'||c.serviceType==='both');
  setHasServices(c.hasServices===true?true:c.hasServices===false?false:null);
  if(c.landPlot&&!landPlots.includes(c.landPlot)){landPlots.push(c.landPlot);initLandPlotOptions();}
  if(document.getElementById('f-land-plot'))document.getElementById('f-land-plot').value=c.landPlot||'';
  // Meter date removed - no longer needed
  // manual mapping
  document.getElementById('f-num').value=c.num||'';
  // Editing always shows the full manual number, no separate prefix badge
  const pre=document.getElementById('f-num-prefix');
  if(pre)pre.style.display='none';
  const whEditHide=document.getElementById('f-num-warehouse');if(whEditHide)whEditHide.style.display='none';
  const yearEditHide=document.getElementById('f-num-year');if(yearEditHide)yearEditHide.style.display='none';
  // Load location groups
  locationGroups=[];_lgIdCounter=0;
  if(c.allLocations&&c.allLocations.length){
    // Group allLocations by building+floor
    const groupMap={};
    c.allLocations.forEach(loc=>{
      const key=loc.building+'|'+loc.floor;
      if(!groupMap[key])groupMap[key]={building:loc.building,floor:loc.floor,shops:[]};
      groupMap[key].shops.push({shop:loc.shop,division:loc.division||''});
    });
    Object.values(groupMap).forEach(gd=>addLocationGroup(gd));
  }else{
    // Legacy: load from locationCode
    const lc=c.locationCode||'';
    if(lc&&lc.includes('-')){
      const parts=lc.split('-');
      addLocationGroup({building:parts[1]||'',floor:parts[0]||'',shops:[{shop:parts[2]||'',division:parts[3]||''}]});
    }else{addLocationGroup();}
    // legacy second shop
    if(c.secondShop&&c.secondShop.building&&c.secondShop.shop){
      addLocationGroup({building:c.secondShop.building,floor:c.secondShop.floor||'',shops:[{shop:c.secondShop.shop,division:c.secondShop.division||''}]});
    }
  }
  if(locationGroups.length===0)addLocationGroup();
  const hc=document.getElementById('f-location-code');if(hc)hc.value=c.locationCode||'';
  if(selectedType==='warehouse'){
    const lblBrand=document.getElementById('lbl-brand');
    if(lblBrand)lblBrand.innerHTML='العلامة التجارية <span class="req">*</span>';
    const lblShop=document.getElementById('lbl-f-loc-shop');
    if(lblShop)lblShop.textContent='رقم المستودع';
    const fSel=document.getElementById('f-loc-floor');
    if(fSel){fSel.innerHTML='<option value="قبو">قبو</option>';fSel.value='قبو';fSel.disabled=true;fSel.style.opacity='0.7';}
    populateShopNumbers(9);
  }else if(selectedType==='short'){
    const lblBrand=document.getElementById('lbl-brand');
    if(lblBrand)lblBrand.innerHTML='علامة تجارية <span class="req">*</span>';
    const lblShop=document.getElementById('lbl-f-loc-shop');
    if(lblShop)lblShop.textContent='رقم المحل';
  }else{
    const lblShop=document.getElementById('lbl-f-loc-shop');
    if(lblShop)lblShop.textContent='رقم المحل';
  }
  const isShortEdit=selectedType==='short';
  // Hide activity field for short-term (use brand instead)
  const actGrpEdit=document.getElementById('f-activity')?.closest('.form-group');
  if(actGrpEdit)actGrpEdit.style.display=isShortEdit?'none':'';
  const catSec=document.getElementById('short-categories-section');
  if(catSec)catSec.style.display=isShortEdit?'':'none';
  if(isShortEdit)refreshShortCategoryAddBtn();
  const vacSecEdit=document.getElementById('vacant-spaces-group');
  if(vacSecEdit)vacSecEdit.style.display=isShortEdit?'':'none';
  moveLocationPickerBlock(isShortEdit);
  setVacantSpaces(isShortEdit&&(c.vacantSpaces===true||c.vacantSpaces==='true'));
  const np=document.getElementById('f-num-payments');
  if(np){np.disabled=isShortEdit;np.style.opacity=isShortEdit?'0.5':'1';}
  if(isShortEdit){
    if(c.shortCategories&&Array.isArray(c.shortCategories)){
      loadShortCategoriesFromContract(c);
    } else {
      initShortCategories();
    }
  }
  document.getElementById('f-acct').value=c.acct||'';
  document.getElementById('f-inv').value=c.inv||'';
  document.getElementById('f-brand').value=c.brand||'';
  populateBusinessActivities();
  document.getElementById('f-activity').value=c.activity||'';
  document.getElementById('f-area').value=c.area||'';
  document.getElementById('f-notes').value=c.notes||'';
  document.getElementById('f-del-name').value=c.delName||'';
  document.getElementById('f-del-phone').value=c.delPhone||'';
  document.getElementById('f-fin-name').value=c.finName||'';
  document.getElementById('f-fin-phone').value=c.finPhone||'';
  document.getElementById('f-month').value=c.month||'';
  const mSelEdit=document.getElementById('f-month');
  if(mSelEdit){mSelEdit.disabled=true;mSelEdit.style.opacity='0.7';}
  document.getElementById('f-start').value=c.start||'';
  document.getElementById('f-sign-date')&&(document.getElementById('f-sign-date').value=c.signDate||'');
  if(selectedType==='short'){
    document.getElementById('termNormal').style.display='none';
    document.getElementById('termCustom').style.display='';
    const days=Math.round((c.term||0)*365);
    const months=Math.round((c.term||0)*12);
    if(months>=1&&months<=11&&days%30===0){
      document.getElementById('f-term-custom-val').value=months;
      document.getElementById('f-term-custom-unit').value='month';
    } else if((c.term||0)>=1){
      document.getElementById('f-term-custom-val').value=Math.floor(c.term||1);
      document.getElementById('f-term-custom-unit').value='year';
    } else {
      document.getElementById('f-term-custom-val').value=Math.max(1,days);
      document.getElementById('f-term-custom-unit').value='day';
    }
    document.getElementById('f-term').value=(c.term||0.5).toString();
    setTimeout(()=>onCustomTermChange(),50);
  } else {
    const presetTerms=['0.25','0.5','1','2','3','5','7','10','15','20'];
    const termStr=(c.term||'').toString();
    const customDiv=document.getElementById('termNormalCustom');
    if(c.term&&!presetTerms.includes(termStr)){
      document.getElementById('f-term').value='custom';
      if(customDiv)customDiv.style.display='';
      document.getElementById('f-term-normal-val').value=c.term;
      document.getElementById('f-term-normal-unit').value='year';
      onCustomTermNormalChange();
    }else{
      document.getElementById('f-term').value=termStr;
      if(customDiv)customDiv.style.display='none';
    }
  }
  document.getElementById('f-status').value=c.status||'active';
  const stWrapEdit=document.getElementById('statusFieldWrap');if(stWrapEdit)stWrapEdit.style.display='';
  document.getElementById('f-svc-rate') && (document.getElementById('f-svc-rate').value=c.svcRate??10);
  document.getElementById('f-knw-rate') && (document.getElementById('f-knw-rate').value=c.knwRate??2);
  document.getElementById('f-tax-rate').value=c.taxRate??16;
  const taxSelShort=document.getElementById('f-tax-rate-short');
  if(taxSelShort)taxSelShort.value=c.taxRate??16;
  document.getElementById('f-num-payments').value=c.numPayments||1;
  // Set contract number mode to manual when editing
  numMode='manual';
  const manualRadio=document.querySelector('input[name="numMode"][value="manual"]');
  if(manualRadio)manualRadio.checked=true;
  const numInput=document.getElementById('f-num');
  if(numInput){numInput.readOnly=false;numInput.style.background='var(--surface)';numInput.style.cursor='text';numInput.removeAttribute('maxlength');numInput.style.width='220px';}
  // Populate attachments from Firebase Storage (async)
  loadEditAttachments(c);
  setTimeout(()=>updateRentYearsGrid(),150);
}
async function loadEditAttachments(c){
  const imgAtt=await getAttachment(c.id,'siteImage');
  if(imgAtt){
    siteImageBase64=imgAtt.data;
    siteImageName_=imgAtt.name||'';
    const area=document.getElementById('imgDropArea');
    area.classList.add('has-file');
    let preview=area.querySelector('.img-preview');
    if(!preview){preview=document.createElement('img');preview.className='img-preview';area.appendChild(preview);}
    preview.src=imgAtt.data;
    const fn=document.getElementById('imgFileName');
    fn.textContent='✓ '+imgAtt.name;
    fn.style.display='block';
    document.getElementById('imgRemoveBtn').style.display='inline-block';
    document.querySelector('#imgDropArea .img-upload-icon').style.display='none';
    document.querySelector('#imgDropArea .img-upload-text').style.display='none';
  }
  const pdfAtt=await getAttachment(c.id,'pdfData');
  if(pdfAtt){
    pdfBase64=pdfAtt.data;
    pdfFileName_=pdfAtt.name||'';
    document.getElementById('pdfDropArea').classList.add('has-file');
    const fn=document.getElementById('pdfFileName');
    fn.textContent='✓ '+pdfAtt.name;
    fn.style.display='block';
    document.getElementById('pdfRemoveBtn').style.display='inline-block';
    document.querySelector('#pdfDropArea .pdf-upload-icon').style.display='none';
    document.querySelector('#pdfDropArea .pdf-upload-text').style.display='none';
  }
}


function closeModal(){document.getElementById('modalBackdrop').classList.remove('open');document.body.style.overflow='';editingContract=null;}


function resetModal(){
  ['f-num','f-acct','f-inv','f-brand','f-area','f-electric','f-water','f-notes','f-del-name','f-del-phone','f-fin-name','f-fin-phone'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const areaHintReset=document.getElementById('f-area-hint');if(areaHintReset)areaHintReset.textContent='';
  ['f-month'].forEach(id=>{const el=document.getElementById(id);if(el){el.selectedIndex=0;el.disabled=false;el.style.opacity='1';}});
  populateBusinessActivities();
  const actEl=document.getElementById('f-activity');if(actEl)actEl.value='';
  document.getElementById('f-start').value='';
  document.getElementById('f-sign-date')&&(document.getElementById('f-sign-date').value='');
  document.getElementById('f-term').value='';
  document.getElementById('f-term-custom-val') && (document.getElementById('f-term-custom-val').value='');
  document.getElementById('f-term-custom-unit') && (document.getElementById('f-term-custom-unit').value='month');
  document.getElementById('f-term-normal-val') && (document.getElementById('f-term-normal-val').value='');
  document.getElementById('f-term-normal-unit') && (document.getElementById('f-term-normal-unit').value='year');
  document.getElementById('termNormal').style.display='';
  document.getElementById('termCustom').style.display='none';
  document.getElementById('termNormalCustom') && (document.getElementById('termNormalCustom').style.display='none');
  document.getElementById('f-status').value='active';
  const stWrapReset=document.getElementById('statusFieldWrap');if(stWrapReset)stWrapReset.style.display='none';
  if(document.getElementById('f-svc-water'))document.getElementById('f-svc-water').value='';
  if(document.getElementById('f-svc-electric'))document.getElementById('f-svc-electric').value='';
  setServiceBtns(true,false);
  setHasServices(null);
  if(document.getElementById('f-land-plot'))document.getElementById('f-land-plot').value='';
  const alpWrap=document.getElementById('addLandPlotWrap');if(alpWrap)alpWrap.style.display='none';
  // Meter date removed
  if(document.getElementById('f-svc-rate')) document.getElementById('f-svc-rate').value='10';
  if(document.getElementById('f-knw-rate')) document.getElementById('f-knw-rate').value='2';
  document.getElementById('f-tax-rate').value='16';
  const taxSelShortReset=document.getElementById('f-tax-rate-short');
  if(taxSelShortReset){taxSelShortReset.value='16';taxSelShortReset.style.display='none';}
  document.getElementById('f-num-payments').value='1';
  document.getElementById('f-num-payments').disabled=false;
  document.getElementById('f-num-payments').style.opacity='1';
  // Reset financial field visibility (show svc/knw for non-short)
  const svcGrpReset=document.getElementById('svc-rate-group');
  const knwGrpReset=document.getElementById('knw-rate-group');
  const taxNumReset=document.getElementById('f-tax-rate');
  if(svcGrpReset)svcGrpReset.style.display='';
  if(knwGrpReset)knwGrpReset.style.display='';
  if(taxNumReset)taxNumReset.style.display='';
  document.getElementById('rentYearsContainer').innerHTML='<div style="font-size:14px;color:var(--text-m);text-align:center;padding:12px;background:var(--bg);border-radius:var(--radius)">حدد تاريخ البدء والمدة أولاً</div>';
  // Reset short categories
  const catSec=document.getElementById('short-categories-section');
  if(catSec)catSec.style.display='none';
  initShortCategories();
  moveLocationPickerBlock(false);
  resetSecondShopUI();
  const fbsRowReset=document.getElementById('location-fbs-row');
  if(fbsRowReset)fbsRowReset.style.display='none';
  // Reset vacant spaces
  const vacSecReset=document.getElementById('vacant-spaces-group');
  if(vacSecReset)vacSecReset.style.display='none';
  setVacantSpaces(false);
  document.getElementById('paymentsPreview').style.display='none';
  document.querySelectorAll('.type-card').forEach(c=>c.classList.remove('selected'));
  // Reset location
  document.getElementById('f-location-code').value='';
  document.getElementById('f-loc-floor').value='';
  document.getElementById('f-loc-floor').disabled=false;
  document.getElementById('f-loc-floor').style.opacity='1';
  document.getElementById('f-loc-zone').value='';
  const bResetEl=document.getElementById('f-loc-building');if(bResetEl)bResetEl.value='';
  const shResetEl=document.getElementById('f-loc-shop');if(shResetEl)shResetEl.value='';
  const dResetEl=document.getElementById('f-loc-division');if(dResetEl)dResetEl.value='';
  populateFloors();
  populateShopNumbers(30);
  populateDivisions();
  initLocationGroups();
  // Reset prefix display
  populateContractYearSelect();
  const yearResetEl=document.getElementById('f-num-year');
  if(yearResetEl)yearResetEl.value=new Date().getFullYear();
  const whResetEl=document.getElementById('f-num-warehouse');
  if(whResetEl)whResetEl.value='1';
  const pre=document.getElementById('f-num-prefix');
  if(pre)pre.style.display='';
  calcFees();
  // Reset attachments
  resetAttachments();
  // Reset num mode
  if(!editingContract){
    numMode='auto';
    const autoRadio=document.querySelector('input[name="numMode"][value="auto"]');
    if(autoRadio)autoRadio.checked=true;
  }
  updateContractNumPrefix();
}


function selectType(t){
  selectedType=t;
  document.querySelectorAll('.type-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('tc-'+t).classList.add('selected');
  const isShort=t==='short';
  // Update modal title based on type
  if(!editingContract){
    const titles={commercial:'إضافة عقد إيجار تجاري',short:'إضافة عقد إيجار قصير المدة',warehouse:'إضافة عقد إيجار مستودع',investment:'إضافة عقد إيجار استثماري'};
    const titleEl=document.getElementById('modalMainTitle');
    if(titleEl)titleEl.textContent=titles[t]||'إضافة عقد إيجار جديد';
  }
  if(t==='warehouse'){
    document.getElementById('lbl-brand').innerHTML='العلامة التجارية <span class="req">*</span>';
    document.getElementById('lbl-area').innerHTML='مساحة المستودع (م²)';
    const lblShopW=document.getElementById('lbl-f-loc-shop');if(lblShopW)lblShopW.textContent='رقم المستودع';
    const lblFloorW=document.getElementById('lbl-f-loc-floor');if(lblFloorW)lblFloorW.textContent='الموقع';
    const flSel=document.getElementById('f-loc-floor');
    if(flSel){flSel.innerHTML='<option value="قبو">قبو</option>';flSel.disabled=true;flSel.style.opacity='0.7';}
    populateShopNumbers(9);
  }else{
    const lblShopC=document.getElementById('lbl-f-loc-shop');if(lblShopC)lblShopC.textContent='رقم المحل';
    const lblFloorC=document.getElementById('lbl-f-loc-floor');if(lblFloorC)lblFloorC.textContent='الطابق';
    const flSel=document.getElementById('f-loc-floor');
    if(flSel){flSel.disabled=false;flSel.style.opacity='1';populateFloors();}
    populateShopNumbers(30);
  }
  if(isShort){document.getElementById('lbl-brand').innerHTML='علامة تجارية <span class="req">*</span>';document.getElementById('lbl-area').innerHTML='المساحة (م²)';}
  else if(t==='investment'){document.getElementById('lbl-brand').innerHTML='العلامة التجارية <span class="req">*</span>';document.getElementById('lbl-area').innerHTML='مساحة المشروع (م²)';}
  else if(t!=='warehouse'){document.getElementById('lbl-brand').innerHTML='العلامة التجارية <span class="req">*</span>';document.getElementById('lbl-area').innerHTML='المساحة (م²)';}
  // "تقسيم المحل" is handled per-location-group inside the new location picker;
  // the legacy division row is never shown.
  const divRow=document.getElementById('location-division-row');
  if(divRow)divRow.style.display='none';
  // Toggle custom term for short-term contracts
  document.getElementById('termNormal').style.display=isShort?'none':'';
  document.getElementById('termCustom').style.display=isShort?'':'none';
  if(isShort){const ntc=document.getElementById('termNormalCustom');if(ntc)ntc.style.display='none';}
  // Hide activity field for short-term (use brand instead)
  const actGrp=document.getElementById('f-activity')?.closest('.form-group');
  if(actGrp)actGrp.style.display=isShort?'none':'';
  // Toggle categories section for short-term
  const catSection=document.getElementById('short-categories-section');
  if(catSection)catSection.style.display=isShort?'':'none';
  // Toggle vacant spaces field for short-term
  const vacSection=document.getElementById('vacant-spaces-group');
  if(vacSection)vacSection.style.display=isShort?'':'none';
  if(isShort){initShortCategories();refreshShortCategoryAddBtn();}else{document.getElementById('f-term-custom-val').value='';setVacantSpaces(false);}
  // Item 7: "إضافة محل ثاني لنفس العقد" is only offered for commercial contracts.
  // When switching away from commercial (or when starting a fresh "new contract"
  // session for a different type) the second-shop UI is cleared so it can never
  // leak into a contract type/edit session it doesn't belong to.
  const secondShopWrap=document.getElementById('addSecondShopWrap');
  if(t==='commercial'){
    if(secondShopWrap)secondShopWrap.style.display='';
  }else{
    resetSecondShopUI();
  }
  // Move the "تحديد الموقع" (location picker) block: for short-term contracts it lives
  // inside the "تصنيفات العقد قصير الأجل" section; otherwise it stays in its normal spot.
  moveLocationPickerBlock(isShort);
  updateContractNumPrefix();
  // Force single payment for short-term
  const np=document.getElementById('f-num-payments');
  if(np){np.value='1';np.disabled=isShort;np.style.opacity=isShort?'0.5':'1';}
  // Toggle financial fields for short-term: no svc/knw, tax as select 0% or 16%
  const svcGrp=document.getElementById('svc-rate-group');
  const knwGrp=document.getElementById('knw-rate-group');
  const taxNumInput=document.getElementById('f-tax-rate');
  const taxSelInput=document.getElementById('f-tax-rate-short');
  if(svcGrp)svcGrp.style.display=isShort?'none':'';
  if(knwGrp)knwGrp.style.display=isShort?'none':'';
  if(taxNumInput)taxNumInput.style.display=isShort?'none':'';
  if(taxSelInput){
    taxSelInput.style.display=isShort?'':'none';
    if(isShort)taxSelInput.value='16';
  }
  // Toggle status field visibility for investment type
  const statusEl=document.getElementById('f-status');
  if(statusEl){
    const statusRow=statusEl.closest('.form-row');
    if(statusRow){
      statusRow.style.display=t==='investment'?'none':'';
    }
  }
  updateRentYearsGrid();
}
function getTermInYears(){
  if(selectedType==='short'){
    const val=parseFloat(document.getElementById('f-term-custom-val')?.value);
    const unit=document.getElementById('f-term-custom-unit')?.value||'month';
    if(!val||val<=0)return 0;
    if(unit==='day')return val/365;
    if(unit==='month')return val/12;
    return val;
  }
  if(document.getElementById('f-term')?.value==='custom'){
    const val=parseFloat(document.getElementById('f-term-normal-val')?.value);
    const unit=document.getElementById('f-term-normal-unit')?.value||'year';
    if(!val||val<=0)return 0;
    if(unit==='day')return val/365;
    if(unit==='month')return val/12;
    return val;
  }
  return parseFloat(document.getElementById('f-term')?.value)||0;
}
function onTermSelectChange(){
  const sel=document.getElementById('f-term');
  const customDiv=document.getElementById('termNormalCustom');
  if(sel&&sel.value==='custom'){
    if(customDiv)customDiv.style.display='';
    onCustomTermNormalChange();
  }else{
    if(customDiv)customDiv.style.display='none';
    updateRentYearsGrid();
  }
}
function onCustomTermNormalChange(){
  const val=parseFloat(document.getElementById('f-term-normal-val')?.value);
  const unit=document.getElementById('f-term-normal-unit')?.value||'year';
  const hint=document.getElementById('termNormalCustomHint');
  if(!val||val<=0){if(hint)hint.textContent='الرجاء إدخال قيمة صحيحة';updateRentYearsGrid();return;}
  let years=0;
  if(unit==='day'){years=val/365;if(hint)hint.textContent=`المدة: ${val} يوم ≈ ${years.toFixed(2)} سنة`;}
  else if(unit==='month'){years=val/12;if(hint)hint.textContent=`المدة: ${val} شهر = ${years.toFixed(2)} سنة`;}
  else{years=val;if(hint)hint.textContent=`المدة: ${val} سنة`;}
  updateRentYearsGrid();
}
function onCustomTermChange(){
  const val=parseFloat(document.getElementById('f-term-custom-val')?.value);
  const unit=document.getElementById('f-term-custom-unit')?.value||'month';
  const hint=document.getElementById('termCustomHint');
  if(!val||val<=0){hint.textContent='الرجاء إدخال قيمة صحيحة';updateRentYearsGrid();return;}
  let years=0;
  if(unit==='day'){years=val/365;hint.textContent=`المدة: ${val} يوم ≈ ${years<1?(val)+' يوم':years.toFixed(2)+' سنة'}`;}
  else if(unit==='month'){years=val/12;hint.textContent=`المدة: ${val} شهر = ${years.toFixed(2)} سنة`;}
  else{years=val;hint.textContent=`المدة: ${val} سنة`;}
  document.getElementById('f-term').value=years.toString();
  updateRentYearsGrid();
}


const TOTAL_STEPS=4;


function updateStepUI(){
  for(let i=0;i<4;i++){
    const fs=document.getElementById('form-step-'+i);if(fs)fs.className='form-step'+(i===currentStep?' active':'');
    const sc=document.getElementById('sc'+i),sl=document.getElementById('sl'+i);if(!sc||!sl)continue;
    if(i<currentStep){sc.className='step-circle done';sc.innerHTML='<svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:white;stroke-width:3;fill:none"><polyline points="20,6 9,17 4,12"/></svg>';sl.className='step-label done';}
    else if(i===currentStep){sc.className='step-circle active';sc.textContent=i;sl.className='step-label active';}
    else{sc.className='step-circle';sc.textContent=i;sl.className='step-label';}
    if(i<3){const ln=document.getElementById('sln'+i);if(ln)ln.className='step-line'+(i<currentStep?' done':'');}
  }
  document.getElementById('btn-back').style.display=currentStep>0?'flex':'none';
  document.getElementById('step-indicator').textContent=`الخطوة ${currentStep+1} من ${TOTAL_STEPS}`;
  if(currentStep===1)setTimeout(initContractNum,50);
  const nb=document.getElementById('btn-next');
  nb.disabled=false;nb.style.opacity='';nb.style.pointerEvents='';
  nb.innerHTML=currentStep===3?'<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="20,6 9,17 4,12"/></svg> حفظ العقد':'التالي <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="9,18 15,12 9,6"/></svg>';
  if(currentStep===3)buildReview();
}


function validatePhone(inp, errId){
  const err=document.getElementById(errId);
  if(!err)return;
  const val=inp.value.replace(/\s/g,'');
  if(val.length>0&&val.length<10){err.classList.add('show');inp.style.borderColor='var(--red)';}else{err.classList.remove('show');inp.style.borderColor='';}
}
function validateStep(){
  if(currentStep===0){if(!selectedType){showToast('الرجاء اختيار نوع العقد',true);return false;}return true;}
  if(currentStep===1){
    const reqFields={
      short:['f-num','f-inv','f-brand','f-month','f-start'],
      commercial:['f-num','f-inv','f-brand','f-activity','f-month','f-start','f-term'],
      warehouse:['f-num','f-inv','f-brand','f-activity','f-month','f-start','f-term'],
      investment:['f-num','f-inv','f-brand','f-activity','f-month','f-start','f-term']
    };
    const fieldLabels={      short:{'f-num':'رقم العقد','f-inv':'اسم المستأجر','f-brand':'علامة تجارية','f-month':'شهر الاستحقاق','f-start':'تاريخ البدء'},commercial:{'f-num':'رقم العقد','f-inv':'اسم المستأجر','f-brand':'العلامة التجارية','f-activity':'النشاط التجاري','f-month':'شهر الاستحقاق','f-start':'تاريخ البدء','f-term':'المدة'},      warehouse:{'f-num':'رقم العقد','f-inv':'اسم المستأجر','f-brand':'العلامة التجارية','f-activity':'النشاط التجاري','f-month':'شهر الاستحقاق','f-start':'تاريخ البدء','f-term':'المدة'},investment:{'f-num':'رقم العقد','f-inv':'اسم المستأجر','f-brand':'العلامة التجارية','f-activity':'النشاط التجاري','f-month':'شهر الاستحقاق','f-start':'تاريخ البدء','f-term':'المدة'}};
    const labels=fieldLabels[selectedType]||fieldLabels.commercial;
    const req=reqFields[selectedType]||reqFields.commercial;
    for(const id of req){const el=document.getElementById(id);if(!el.value.trim()){el.focus();el.style.borderColor='var(--red)';setTimeout(()=>el.style.borderColor='',2500);showToast('الرجاء ملء حقل: '+(labels[id]||''),true);return false;}}
    if(selectedType==='short'){
      const tv=parseFloat(document.getElementById('f-term-custom-val')?.value);
      if(!tv||tv<=0){const el=document.getElementById('f-term-custom-val');el.focus();el.style.borderColor='var(--red)';setTimeout(()=>el.style.borderColor='',2500);showToast('الرجاء إدخال المدة بالأيام أو الأشهر أو السنوات',true);return false;}
    }else if(document.getElementById('f-term')?.value==='custom'){
      const tv=parseFloat(document.getElementById('f-term-normal-val')?.value);
      if(!tv||tv<=0){const el=document.getElementById('f-term-normal-val');el.focus();el.style.borderColor='var(--red)';setTimeout(()=>el.style.borderColor='',2500);showToast('الرجاء إدخال المدة (سنوات/أشهر/أيام)',true);return false;}
    }
    const num=getContractNumFull();
    if(!num){showToast('الرجاء إدخال رقم العقد',true);return false;}
    if(!editingContract&&contracts.some(c=>c.num===num)){showToast('رقم العقد موجود مسبقاً',true);return false;}
    const delPhone=document.getElementById('f-del-phone').value.replace(/\s/g,'');
    const finPhone=document.getElementById('f-fin-phone').value.replace(/\s/g,'');
    if(delPhone.length>0&&delPhone.length<10){showToast('رقم تواصل الجهة المفوضة يجب أن يكون 10 أرقام على الأقل',true);document.getElementById('f-del-phone').focus();return false;}
    if(finPhone.length>0&&finPhone.length<10){showToast('رقم تواصل الجهة المالية يجب أن يكون 10 أرقام على الأقل',true);document.getElementById('f-fin-phone').focus();return false;}
    if(selectedType!=='short'){
      if(!editingContract&&!validateLocationGroups())return false;
    }
    return true;
  }
  if(currentStep===2){
    const total=sumRentYears();
    if(total<=0){showToast('الرجاء إدخال قيمة الإيجار لسنة واحدة على الأقل',true);return false;}
    const numP=parseInt(document.getElementById('f-num-payments').value)||1;
    if(numP<1||numP>10){showToast('عدد الدفعات يجب أن يكون بين 1 و 10',true);return false;}
    return true;
  }
  return true;
}


function nextStep(){if(currentStep===3){const nb=document.getElementById('btn-next');if(nb)nb.classList.add('loading');saveContract().catch(e=>{const nb2=document.getElementById('btn-next');if(nb2)nb2.classList.remove('loading');console.error('saveContract failed:',e);showToast('حدث خطأ أثناء حفظ العقد: '+e.message,true);});return;}if(!validateStep())return;currentStep++;updateStepUI();}
function prevStep(){if(currentStep>0){currentStep--;updateStepUI();}}


function buildReview(){
  const tC=TYPE_CFG[selectedType]||TYPE_CFG.commercial;
  const rd=getRentYearsData();
  const rentLines=Object.entries(rd).map(([yr,v])=>`${yr}: ${v.toLocaleString('en')} د.أ`).join(' | ');
  const fields=[
    {l:'رقم العقد',v:getContractNumFull()},
    {l:'نوع العقد',v:tC.ar},
    {l:'المستأجر',v:document.getElementById('f-inv').value},
    {l:'العلامة التجارية',v:document.getElementById('f-brand').value},
    {l:'النشاط التجاري',v:document.getElementById('f-activity').selectedOptions[0]?.textContent||'—'},
    {l:'تاريخ بدء العقد الفعلي',v:fmtDMY(document.getElementById('f-start').value)},
    {l:'تاريخ توقيع العقد',v:fmtDMY(document.getElementById('f-sign-date')?.value||'')||'—'},
    {l:'المدة',v:selectedType==='short'?(function(){const v=document.getElementById('f-term-custom-val')?.value;const u=document.getElementById('f-term-custom-unit')?.value;if(!v||!u)return'—';const labels={day:'يوم',month:'شهر',year:'سنة'};return v+' '+labels[u]})():(document.getElementById('f-term').value==='custom'?(function(){const v=document.getElementById('f-term-normal-val')?.value;const u=document.getElementById('f-term-normal-unit')?.value;if(!v||!u)return'—';const labels={day:'يوم',month:'شهر',year:'سنة'};return v+' '+labels[u]})():document.getElementById('f-term').value+' سنة')},
    {l:'نوع الخدمة',v:hasServicesSelection===false?'لا يوجد خدمات':(svcSelection.water?'ماء ':'')+(svcSelection.electric?'كهرباء ':'')||'—'},
    {l:'رقم قطعة الأرض',v:document.getElementById('f-land-plot')?.value||'—'},
    {l:'رقم عداد الكهرباء',v:document.getElementById('f-electric').value||'—'},
    {l:'رقم عداد الماء',v:document.getElementById('f-water').value||'—'},
    {l:'الجهة المفوضة',v:document.getElementById('f-del-name').value||'—'},
    {l:'الجهة المالية',v:document.getElementById('f-fin-name').value||'—'},
    {l:'بدل الخدمات',v:selectedType==='short'?'—':(document.getElementById('f-svc-rate')?.value||'10')+'%'},
    {l:'بدل المعارف',v:selectedType==='short'?'—':(document.getElementById('f-knw-rate')?.value||'2')+'%'},
    {l:'ضريبة المبيعات',v:getEffectiveTaxRate()+'%'},
    {l:'عدد الدفعات سنوياً',v:document.getElementById('f-num-payments').value},
    {l:'كود الموقع',v:document.getElementById('f-location-code')?.value||'—'},
    {l:'التصنيفات',v:selectedType==='short'?(function(){const sel=getSelectedShortCategories();return sel.length?sel.map(s=>s.label).join('، '):'—';})():'—'},
    {l:'مساحات فارغة',v:selectedType==='short'?(document.getElementById('f-vacant-spaces')?.value==='true'?'✓':'✗'):'—'},
    {l:'قيم الإيجار',v:rentLines||'—'},
  ];
  document.getElementById('reviewGrid').innerHTML=fields.map(f=>`<div class="review-item"><div class="review-lbl">${f.l}</div><div class="review-val">${f.v||'—'}</div></div>`).join('');
  calcFees();
}


async function saveContract(){if(!erpRequire('contracts',editingContract?'edit':'add'))return;
try{
  const nb=document.getElementById('btn-next');
  if(nb){nb.disabled=true;nb.style.opacity='0.5';nb.style.pointerEvents='none';}
  const wasEditing=!!editingContract;
  const editId=editingContract?editingContract.id:null;
  const editOldSiteImage=editingContract?.hasSiteImage||false;
  const editOldPdf=editingContract?.hasPdf||false;
  // Item 3: block saving if the chosen location(s) are already used by another contract
  {
    const chkBuilding=document.getElementById('f-loc-building')?.value||'';
    const chkFloor=document.getElementById('f-loc-floor')?.value||'';
    const chkShop=document.getElementById('f-loc-shop')?.value||'';
    const chkDivision=document.getElementById('f-loc-division')?.value||'';
    if(chkBuilding&&chkFloor&&chkShop&&isLocationTaken(chkBuilding,chkFloor,chkShop,chkDivision,editId)){
      showToast('⚠ الموقع '+describeLocation(chkBuilding,chkFloor,chkShop,chkDivision)+' مستخدم بالفعل في عقد آخر — لا يمكن تكرار إدخال نفس الموقع',true);
      if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.pointerEvents='';}
      return;
    }
    if(selectedType==='commercial'&&document.getElementById('secondShopBlock')?.style.display!=='none'){
      const s2b=document.getElementById('f-loc2-building')?.value||'';
      const s2f=document.getElementById('f-loc2-floor')?.value||'';
      const s2s=document.getElementById('f-loc2-shop')?.value||'';
      const s2d=document.getElementById('f-loc2-division')?.value||'';
      if(s2b&&s2f&&s2s&&isLocationTaken(s2b,s2f,s2s,s2d,editId)){
        showToast('⚠ موقع المحل الثاني '+describeLocation(s2b,s2f,s2s,s2d)+' مستخدم بالفعل في عقد آخر — لا يمكن تكرار إدخال نفس الموقع',true);
        if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.pointerEvents='';}
        return;
      }
      if(s2b&&s2f&&s2s&&s2b===chkBuilding&&s2f===chkFloor&&s2s===chkShop&&(s2d||'')===(chkDivision||'')){
        showToast('⚠ لا يمكن اختيار نفس الموقع للمحل الأول والمحل الثاني',true);
        if(nb){nb.disabled=false;nb.style.opacity='1';nb.style.pointerEvents='';}
        return;
      }
    }
  }
  closeModal();
  const term=getTermInYears()||1;
  const start=document.getElementById('f-start').value;
  let expiry='';
  if(start){
    const d=new Date(start);
    if(selectedType==='short'){
      const val=parseFloat(document.getElementById('f-term-custom-val')?.value);
      const unit=document.getElementById('f-term-custom-unit')?.value||'month';
      if(val&&val>0){
        if(unit==='day')d.setDate(d.getDate()+val);
        else if(unit==='month')d.setMonth(d.getMonth()+val);
        else d.setFullYear(d.getFullYear()+val);
      }
    } else {
      d.setFullYear(d.getFullYear()+Math.floor(term));
    }
    expiry=d.toISOString().split('T')[0];
  }
  const rentYears=getRentYearsData();
  const isShortSave=selectedType==='short';
  const svcRate = isShortSave?0:getRate('f-svc-rate', 10);
  const knwRate = isShortSave?0:getRate('f-knw-rate', 2);
  const taxRate = getEffectiveTaxRate();
  const totalRent=Object.values(rentYears).reduce((s,v)=>s+v,0);
  const svcAmt=isShortSave?0:Math.round(totalRent*svcRate/100);
  const knwAmt=isShortSave?0:Math.round(totalRent*knwRate/100);
  const taxAmt=isShortSave?Math.round(totalRent*taxRate/100):Math.round(svcAmt*taxRate/100);
  const totalWithTax=totalRent+svcAmt+knwAmt+taxAmt;
  const numPayments=selectedType==='short'?1:Math.min(10,Math.max(1,parseInt(document.getElementById('f-num-payments').value)||1));
  // Build payments per year
  const payments=[];
  const sd=new Date(start||Date.now());
  const sortedYears=Object.keys(rentYears).sort();
  sortedYears.forEach(yr=>{
    const annualRent=rentYears[yr]||0;
    if(annualRent<=0)return;
    const aSvc=isShortSave?0:Math.round(annualRent*svcRate/100);
    const aKnw=isShortSave?0:Math.round(annualRent*knwRate/100);
    const aTax=isShortSave?Math.round(annualRent*taxRate/100):Math.round(aSvc*taxRate/100);
    const annualTotal=annualRent+aSvc+aKnw+aTax;
    const yrStart=new Date(parseInt(yr),sd.getMonth(),sd.getDate());
    for(let p=0;p<numPayments;p++){
      const dayOffset=Math.round(365*p/numPayments);
      const d=new Date(yrStart.getTime()+dayOffset*86400000);
      payments.push({num:payments.length+1,date:d.toISOString().split('T')[0],amount:Math.round(annualTotal/numPayments)});
    }
  });
  const id=wasEditing?editId:'c_'+Date.now();
  // Item 7: capture the optional second shop (commercial contracts only) —
  // only stored if the block is actually visible and a shop was chosen.
  let secondShop=null;
  if(selectedType==='commercial'&&document.getElementById('secondShopBlock')?.style.display!=='none'){
    const s2floor=document.getElementById('f-loc2-floor')?.value||'';
    const s2building=document.getElementById('f-loc2-building')?.value||'';
    const s2shop=document.getElementById('f-loc2-shop')?.value||'';
    const s2division=document.getElementById('f-loc2-division')?.value||'';
    if(s2building&&s2shop){
      secondShop={
        floor:s2floor,building:s2building,shop:s2shop,division:s2division,
        zone:document.getElementById('f-loc2-zone')?.value||'',
        locationCode:document.getElementById('f-location-code2')?.value||'',
        area:document.getElementById('f-area2')?.value||''
      };
    }
  }
  const C={
    id,num:getContractNumFull(),
    acct:document.getElementById('f-acct').value.trim(),
    inv:document.getElementById('f-inv').value.trim(),
    brand:document.getElementById('f-brand').value.trim(),
    activity:document.getElementById('f-activity').value||'',
    month:document.getElementById('f-month').value,
    term,start,expiry,rentYears,svcRate,knwRate,taxRate,numPayments,payments,
    shortTermVal:selectedType==='short'?(parseFloat(document.getElementById('f-term-custom-val')?.value)||null):null,
    shortTermUnit:selectedType==='short'?(document.getElementById('f-term-custom-unit')?.value||'month'):null,
    totalRent,svcAmt,knwAmt,taxAmt,totalWithTax,
    status:document.getElementById('f-status').value,
    type:selectedType||'commercial',
    area:document.getElementById('f-area').value||'',
    serviceType: svcSelection.water&&svcSelection.electric?'both':svcSelection.water?'water':svcSelection.electric?'electricity':'water',
    hasServices:hasServicesSelection,
    landPlot:document.getElementById('f-land-plot')?.value.trim()||'',
    electricMeter:document.getElementById('f-electric').value.trim(),
    waterMeter:document.getElementById('f-water').value.trim(),
    signDate:document.getElementById('f-sign-date')?.value||'',
    delName:document.getElementById('f-del-name').value.trim(),
    delPhone:document.getElementById('f-del-phone').value.trim(),
    finName:document.getElementById('f-fin-name').value.trim(),
    finPhone:document.getElementById('f-fin-phone').value.trim(),
    notes:document.getElementById('f-notes').value.trim(),
    shortCategories:selectedType==='short'?getSelectedShortCategories():[],
    vacantSpaces:selectedType==='short'?(document.getElementById('f-vacant-spaces')?.value==='true'):false,
    locationCode:document.getElementById('f-location-code')?.value||'',
    locBuilding:document.getElementById('f-loc-building')?.value||'',
    locFloor:document.getElementById('f-loc-floor')?.value||'',
    locShop:document.getElementById('f-loc-shop')?.value||'',
    locDivision:document.getElementById('f-loc-division')?.value||'',
    secondShop,
    allLocations:getAllSelectedLocations(),
    hasSiteImage:siteImageBase64?true:(wasEditing&&!editRemovedImage&&!!editOldSiteImage),
    hasPdf:pdfBase64?true:(wasEditing&&!editRemovedPdf&&!!editOldPdf),
    addedBy:session?session.name:'',updatedAt:Date.now(),
    rent2526:rentYears[2026]||rentYears[Object.keys(rentYears).sort().pop()]||0,
  };
  const previousContract=wasEditing?contracts.find(c=>c.id===id):null;
  C.createdAt=previousContract?.createdAt||(!wasEditing?Date.now():null);
  C.editHistory=[...(previousContract?.editHistory||[]),...(wasEditing?[{at:Date.now(),by:String(session?.id||'')}]:[])];
  if(wasEditing){const idx=contracts.findIndex(c=>c.id===id);if(idx>=0)contracts[idx]=C;else contracts.unshift(C);}
  else{contracts.unshift(C);newRowId=id;}
  saveContractsLocal();
  showToast('تم ' + (wasEditing?'تحديث':'حفظ') + ' العقد ' + C.num + ' ✓');
  if(!wasEditing)fireConfetti();
  repAllTableBodyRendered = false;
  updateKPIs();renderContractTable(applyFilters());renderExpiryList();
  updateContractTypeCounts();
  showPage('contracts',document.getElementById('nav-contracts'));
  // Upload attachments in background (non-blocking)
  (async()=>{
    try{
      if(siteImageBase64){
        const ok=await saveAttachment(id,'siteImage',siteImageBase64,siteImageName_);
        if(ok){
          const c=contracts.find(x=>x.id===id);
          if(c){c.hasSiteImage=true;saveContractsLocal();renderContractTable(applyFilters());}
        }
      }else if(editRemovedImage&&wasEditing){
        removeAttachment(id,'siteImage');
      }
    }catch(e){console.warn('Attachment save error',e);}
    try{
      if(pdfBase64){
        const ok=await saveAttachment(id,'pdfData',pdfBase64,pdfFileName_);
        if(ok){
          const c=contracts.find(x=>x.id===id);
          if(c){c.hasPdf=true;saveContractsLocal();renderContractTable(applyFilters());}
        }
      }else if(editRemovedPdf&&wasEditing){
        removeAttachment(id,'pdfData');
      }
    }catch(e){console.warn('Attachment save error',e);}
  })();
  setTimeout(()=>{newRowId=null;},3000);
}catch(e){console.error('saveContract error:',e);showToast('حدث خطأ أثناء حفظ العقد: '+e.message,true);}
}


