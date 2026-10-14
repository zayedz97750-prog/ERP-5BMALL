/* ═══ 5B Mall — Services & Service Prices ═══ */
/* ══════════════════════ SERVICES DATA ══════════════════════ */
function loadServices(){try{const s=localStorage.getItem(SK_SERVICES);if(s)return JSON.parse(s);}catch(e){}return[];}
function saveServicesLocal(){try{localStorage.setItem(SK_SERVICES,JSON.stringify(services));}catch(e){}fbSet('services',services);}


let services=loadServices();


/* ══════════════════════ METER READINGS DATA ══════════════════════ */
function loadMeterReadings(){try{const s=localStorage.getItem(SK_METER_READINGS);if(s)return JSON.parse(s);}catch(e){}return[];}
function saveMeterReadings(arr){try{localStorage.setItem(SK_METER_READINGS,JSON.stringify(arr));}catch(e){}fbSet('meterReadings',arr);}


let meterReadings=loadMeterReadings();


/* ══════════════════════ SERVICES FUNCTIONS ══════════════════════ */
const MONTH_NAMES_AR=['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function switchServicesTab(tabId){
  if(!erpCan('services','view'))return;
  const target=document.getElementById(tabId);
  if(!target||!target.matches('#page-services .report-panel'))return;
  document.querySelectorAll('#page-services .report-panel').forEach(panel=>{
    const selected=panel===target;
    panel.classList.toggle('active',selected);
    panel.hidden=!selected;
    panel.inert=!selected;
    panel.setAttribute('aria-hidden',String(!selected));
  });
  if(tabId==='srv-list')renderServicesLogTable();
}


/* ══════════════════════ SERVICE PRICES ══════════════════════ */
const SK_SERVICE_PRICES='lms_service_prices_v1';
function loadServicePrices(){try{const s=localStorage.getItem(SK_SERVICE_PRICES);if(s)return JSON.parse(s);}catch(e){}return{water:0,electricity:0};}
function saveServicePricesLocal(p){try{localStorage.setItem(SK_SERVICE_PRICES,JSON.stringify(p));}catch(e){}fbSet('servicePrices',p);}
let servicePrices=loadServicePrices();


/* ═══ SHORT-TERM CATEGORIES ═══ */
const SHORT_CATEGORY_TYPES = [
  { id: 'billboard', label: 'لوحات اعلانية' },
  { id: 'screen-ad', label: 'إعلانات شاشة' },
  { id: 'event-sponsor', label: 'راعية فعاليات' },
];
// Item 4: custom classifications added by an admin are saved here so every
// short-term contract (current and future) can reuse them, instead of the
// classification only living inside the one contract it was typed into.
const SK_SHORT_CATEGORIES='lms_short_categories_v1';
function loadCustomShortCategories(){try{const s=localStorage.getItem(SK_SHORT_CATEGORIES);if(s){const p=JSON.parse(s);if(Array.isArray(p))return p;}}catch(e){}return [];}
function saveCustomShortCategories(arr){try{localStorage.setItem(SK_SHORT_CATEGORIES,JSON.stringify(arr));}catch(e){}fbSet('shortCategories',arr);}
function getAllShortCategoryTypes(){return [...SHORT_CATEGORY_TYPES, ...loadCustomShortCategories()];}
let shortCategoriesData = [];


function initShortCategories() {
  shortCategoriesData = getAllShortCategoryTypes().map(c => ({
    ...c,
    selected: false,
    space: '',
    isCustom: false
  }));
  renderShortCategories();
}


function renderShortCategories() {
  const container = document.getElementById('short-categories-list');
  if (!container) return;
  container.innerHTML = shortCategoriesData.map((cat, idx) => `
    <div class="short-category-item">
      <input type="checkbox" class="cat-checkbox" ${cat.selected ? 'checked' : ''} onchange="toggleShortCategory(${idx}, this.checked)" />
      <span class="cat-label">${cat.label}</span>
      ${cat.isCustom ? `<button class="cat-remove" onclick="removeShortCategory(${idx})" title="حذف">✕</button>` : ''}
    </div>
  `).join('');
}


function toggleShortCategory(idx, checked) {
  if (checked) {
    // Item: only one classification may be selected per short-term contract —
    // selecting a new one automatically deselects any previously selected one.
    shortCategoriesData.forEach((c, i) => { c.selected = (i === idx); });
  } else if (shortCategoriesData[idx]) {
    shortCategoriesData[idx].selected = false;
  }
  renderShortCategories();
}


function updateShortCategorySpace(idx, val) {
  if (shortCategoriesData[idx]) shortCategoriesData[idx].space = val;
}


// Item 4: only an admin may create a brand-new classification (it then gets
// saved permanently so every future short-term contract can reuse it).
// Regular users can still tick/untick the existing saved classifications.
function canAddShortCategory(){return !!(session&&session.role==='admin');}
function refreshShortCategoryAddBtn(){
  const btn=document.getElementById('addShortCategoryBtn');
  if(btn)btn.style.display=canAddShortCategory()?'':'none';
}
function addShortCategory() {
  if(!canAddShortCategory()){showToast('إضافة تصنيف جديد متاحة للمشرف (الأدمن) فقط',true);return;}
  // A single prompt only ever returns one value, so this naturally adds
  // exactly one classification per click — never more than one at a time.
  const label = prompt('أدخل اسم التصنيف الجديد:');
  if (!label || !label.trim()) return;
  const trimmed = label.trim();
  const existing = getAllShortCategoryTypes().find(t => t.label.trim().toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    if (!shortCategoriesData.some(c => c.id === existing.id)) {
      shortCategoriesData.forEach(c => { c.selected = false; });
      shortCategoriesData.push({ ...existing, selected: true, space: '', isCustom: false });
      renderShortCategories();
    } else {
      showToast('هذا التصنيف موجود مسبقاً', true);
    }
    return;
  }
  const newCat = { id: 'custom_' + Date.now(), label: trimmed };
  // Persist it so it appears as a reusable, saved classification in every
  // short-term contract from now on (not just this one).
  const custom = loadCustomShortCategories();
  custom.push(newCat);
  saveCustomShortCategories(custom);
  shortCategoriesData.forEach(c => { c.selected = false; });
  shortCategoriesData.push({
    ...newCat,
    selected: true,
    space: '',
    isCustom: false
  });
  renderShortCategories();
  showToast('تم إضافة التصنيف "' + trimmed + '" وحفظه للاستخدام لاحقاً ✓');
}


function removeShortCategory(idx) {
  if (idx >= 0 && idx < shortCategoriesData.length) {
    shortCategoriesData.splice(idx, 1);
    renderShortCategories();
  }
}


function getSelectedShortCategories() {
  return shortCategoriesData.filter(c => c.selected).map(c => ({
    type: c.id,
    label: c.label,
    space: c.space,
    isCustom: c.isCustom || false
  }));
}


function loadShortCategoriesFromContract(c) {
  if (c.shortCategories && Array.isArray(c.shortCategories)) {
    const allTypes = getAllShortCategoryTypes();
    // A contract saved before the single-selection rule may have more than one
    // stored classification — keep only the first as selected when editing it,
    // consistent with the new "one classification per contract" rule.
    const loaded = c.shortCategories.map((sc, i) => {
      const found = allTypes.find(t => t.id === sc.type);
      return {
        id: sc.type,
        label: sc.label || (found ? found.label : sc.type),
        selected: i === 0,
        space: sc.space || '',
        isCustom: sc.isCustom || false
      };
    });
    const unselected = allTypes.filter(t => !loaded.some(l => l.id === t.id)).map(t => ({
      ...t,
      selected: false,
      space: '',
      isCustom: false
    }));
    shortCategoriesData = [...loaded, ...unselected];
  } else {
    initShortCategories();
  }
  renderShortCategories();
}


function openPriceSettings(){if(!erpRequire('services','prices'))return;
  document.getElementById('priceWater').value=servicePrices.water||0;
  document.getElementById('priceElectric').value=servicePrices.electricity||0;
  document.getElementById('priceSettingsBackdrop').classList.add('open');
}
function closePriceSettings(){document.getElementById('priceSettingsBackdrop').classList.remove('open');}
function savePriceSettings(){if(!erpRequire('services','prices'))return;
  if(!erpCan('services','prices')){showToast('ليس لديك صلاحية تعديل الأسعار',true);return;}
  const w=parseFloat(document.getElementById('priceWater').value);
  const e=parseFloat(document.getElementById('priceElectric').value);
  servicePrices={water:isNaN(w)?0:w,electricity:isNaN(e)?0:e};
  saveServicePricesLocal(servicePrices);
  closePriceSettings();
  showToast('✅ تم حفظ الأسعار بنجاح');
  if(_clContractId){renderContractLogSection('water');renderContractLogSection('electricity');}
}


/* ══════════════════════ SERVICES LOG (per-contract) ══════════════════════ */
function getServiceContracts(){
  return contracts.filter(c=>{
    const hasLandPlot=c.landPlot&&c.landPlot.trim()!=='';
    const hasWater=c.waterMeter&&c.waterMeter.trim()!=='';
    const hasElectric=c.electricMeter&&c.electricMeter.trim()!=='';
    return hasLandPlot&&(hasWater||hasElectric);
  });
}


function renderServicesLogTable(){
  const q=(document.getElementById('srvLogSearch')?.value||'').trim().toLowerCase();
  let list=getServiceContracts();
  if(q){
    list=list.filter(c=>(c.num||'').toLowerCase().includes(q)||(c.inv||'').toLowerCase().includes(q)||(c.landPlot||'').toLowerCase().includes(q)||(c.brand||'').toLowerCase().includes(q));
  }
  const tb=document.getElementById('srvLogTableBody');
  const empty=document.getElementById('srvLogEmpty');
  const cnt=document.getElementById('srvLogCount');
  if(cnt)cnt.textContent=list.length+' عقد';
  var stc=document.getElementById('srv-tab-count');if(stc)stc.textContent=getServiceContracts().length;
  if(!tb)return;
  if(!list.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  tb.innerHTML=list.map((c,i)=>{
    const waterCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='water').length;
    const elecCnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType==='electricity').length;
    return `<tr>
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num||'—'}</td>
      <td class="td-name" title="${c.inv||''}">${c.inv||'—'}</td>
      <td class="td-brand">${c.brand||'—'}</td>
      <td>${c.landPlot||'—'}</td>
      <td>${c.waterMeter||'—'}</td>
      <td style="font-weight:700;color:var(--blue);font-size:15px">${waterCnt}</td>
      <td>${c.electricMeter||'—'}</td>
      <td style="font-weight:700;color:var(--blue);font-size:15px">${elecCnt}</td>
      <td><button class="btn btn-ghost btn-xs" onclick="openContractLog('${c.id}')" title="عرض سجل القراءات" style="color:var(--blue)"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:2;fill:none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> عرض</button></td>
    </tr>`;
  }).join('');
}


let _clContractId=null;
function openContractLog(contractId){
  _clContractId=contractId;
  const c=contracts.find(x=>x.id===contractId);
  if(!c)return;
  document.getElementById('clTitle').textContent='سجل خدمات العقد - '+(c.num||'');
  document.getElementById('clSub').textContent=(c.inv||'—')+' · '+(c.brand||'—')+' · قطعة '+(c.landPlot||'—');
  renderContractLogSection('water');
  renderContractLogSection('electricity');
  document.getElementById('contractLogBackdrop').classList.add('open');
}
function closeContractLog(){document.getElementById('contractLogBackdrop').classList.remove('open');_clContractId=null;}
function printContractLog(){if(!erpRequire('services','print'))return;
  if(!_clContractId){showToast('لا يوجد عقد للطباعة',true);return;}
  const c=contracts.find(x=>x.id===_clContractId);if(!c){showToast('لم يتم العثور على العقد',true);return;}
  const monthNames=['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const buildTable=(type)=>{
    const label=type==='water'?'💧 قراءات الماء':'⚡ قراءات الكهرباء';
    const unit=type==='water'?'م³':'ك.و.س';
    const readings=meterReadings.filter(r=>r.contractId===_clContractId&&r.meterType===type);
    const price=servicePrices[type]||0;
    const consMap=buildConsumptionMap(readings,price);
    if(!readings.length)return '<h3 style="font-size:16px;font-weight:700;color:#1e3a8a;margin:14px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">'+label+'</h3><div style="font-size:14px;color:#64748b">لا توجد قراءات مسجلة</div>';
    const rows=readings.sort((a,b)=>b.year-a.year||b.month-a.month).map((r,i)=>{
      const rd=r.readingDate?new Date(r.readingDate).toLocaleDateString('ar-JO'):'—';
      const cons=consMap[r.id]||{qty:null,val:null};
      const qtyCell=cons.qty===null?'—':cons.qty.toLocaleString('en')+' '+unit;
      const valCell=cons.val===null?'—':cons.val.toLocaleString('en')+' د.أ';
      return '<tr><td style="text-align:center">'+(i+1)+'</td><td>'+rd+'</td><td style="font-weight:700;color:#1e3a8a">'+r.reading.toLocaleString('en')+'</td><td>'+qtyCell+'</td><td>'+valCell+'</td></tr>';
    }).join('');
    return '<h3 style="font-size:16px;font-weight:700;color:#1e3a8a;margin:14px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">'+label+'</h3><table><tr><th>#</th><th>تاريخ القراءة</th><th>القراءة</th><th>كمية الاستهلاك</th><th>قيمة الاستهلاك</th></tr>'+rows+'</table>';
  };
  const html=buildTable('water')+buildTable('electricity');
  openPrintWindow('سجل خدمات العقد - '+(c.num||'')+' ('+(c.inv||'')+')',html);
}


// Builds a map of readingId -> {qty, val} representing consumption since the
// previous chronological reading (qty = current reading - previous reading;
// val = qty * unit price). The first reading in time has no previous reading,
// so its consumption is null. Input array order doesn't matter; it's sorted
// internally by reading date.
function buildConsumptionMap(readings,price){
  const asc=[...readings].sort((a,b)=>new Date(a.readingDate)-new Date(b.readingDate));
  const map={};
  asc.forEach((r,i)=>{
    if(i===0){map[r.id]={qty:null,val:null};}
    else{
      const qty=r.reading-asc[i-1].reading;
      map[r.id]={qty:qty,val:qty*(price||0)};
    }
  });
  return map;
}


function renderContractLogSection(type){
  const c=contracts.find(x=>x.id===_clContractId);
  if(!c)return;
  const hasMeter=type==='water'?(c.waterMeter&&c.waterMeter.trim()!==''):(c.electricMeter&&c.electricMeter.trim()!=='');
  const section=document.getElementById(type==='water'?'clWaterSection':'clElectricSection');
  if(!hasMeter){if(section)section.style.display='none';return;}
  if(section)section.style.display='block';


  const readings=meterReadings.filter(r=>r.contractId===_clContractId&&r.meterType===type).sort((a,b)=>new Date(a.readingDate)-new Date(b.readingDate));
  const tb=document.getElementById(type==='water'?'clWaterBody':'clElectricBody');
  const empty=document.getElementById(type==='water'?'clWaterEmpty':'clElectricEmpty');
  if(!readings.length){
    tb.innerHTML='';
    if(empty)empty.style.display='block';
  }else{
    if(empty)empty.style.display='none';
    const price=servicePrices[type]||0;
    const unit=type==='water'?'م³':'ك.و.س';
    const consMap=buildConsumptionMap(readings,price);
    tb.innerHTML=readings.map((r,i)=>{
      const rd=r.readingDate?new Date(r.readingDate).toLocaleDateString('ar-JO'):'—';
      const ad=r.createdAt?new Date(r.createdAt).toLocaleDateString('ar-JO'):'—';
      const cons=consMap[r.id]||{qty:null,val:null};
      const qtyCell=cons.qty===null?'<span style="color:var(--text-l)">—</span>':`<span style="font-weight:700;color:${cons.qty<0?'var(--red)':'var(--teal)'}">${cons.qty.toLocaleString('en')} ${unit}</span>`;
      const valCell=cons.val===null?'<span style="color:var(--text-l)">—</span>':`<span style="font-weight:700;color:var(--green)">${cons.val.toLocaleString('en')} د.أ</span>`;
      return `<tr><td style="color:var(--text-l);font-size:13px">${i+1}</td><td>${rd}</td><td style="font-weight:700;color:var(--blue);font-size:16px">${r.reading.toLocaleString('en')}</td><td>${qtyCell}</td><td>${valCell}</td><td style="font-size:13px;color:var(--text-m)">${ad}</td></tr>`;
    }).join('');
  }


  const fromSel=document.getElementById(type==='water'?'clWaterFrom':'clElectricFrom');
  const toSel=document.getElementById(type==='water'?'clWaterTo':'clElectricTo');
  const opts=readings.map(r=>{
    const rd=r.readingDate?new Date(r.readingDate).toLocaleDateString('ar-JO'):'—';
    return `<option value="${r.id}">${rd} — ${r.reading.toLocaleString('en')}</option>`;
  }).join('');
  if(fromSel)fromSel.innerHTML='<option value="">-- اختر --</option>'+opts;
  if(toSel)toSel.innerHTML='<option value="">-- اختر --</option>'+opts;


  const res=document.getElementById(type==='water'?'clWaterResult':'clElectricResult');
  if(res){res.style.display='none';res.innerHTML='';}
  const calcBtn=document.getElementById(type==='water'?'clWaterCalcBtn':'clElectricCalcBtn');
  if(calcBtn)calcBtn.disabled=readings.length<2;
}


function calcContractConsumption(type){
  const fromSel=document.getElementById(type==='water'?'clWaterFrom':'clElectricFrom');
  const toSel=document.getElementById(type==='water'?'clWaterTo':'clElectricTo');
  const resEl=document.getElementById(type==='water'?'clWaterResult':'clElectricResult');
  const fromId=fromSel.value,toId=toSel.value;
  if(!fromId||!toId){showToast('الرجاء اختيار القراءتين',true);return;}
  if(fromId===toId){showToast('الرجاء اختيار قراءتين مختلفتين',true);return;}
  const from=meterReadings.find(r=>r.id===fromId);
  const to=meterReadings.find(r=>r.id===toId);
  if(!from||!to)return;
  // Always subtract the earlier date's reading from the later date's reading
  const ordered=new Date(from.readingDate)<=new Date(to.readingDate)?[from,to]:[to,from];
  const diff=ordered[1].reading-ordered[0].reading;
  const price=servicePrices[type]||0;
  const total=diff*price;
  const unit=type==='water'?'م³':'ك.و.س';
  const fromDate=ordered[0].readingDate?new Date(ordered[0].readingDate).toLocaleDateString('ar-JO'):'—';
  const toDate=ordered[1].readingDate?new Date(ordered[1].readingDate).toLocaleDateString('ar-JO'):'—';
  const negWarn=diff<0?'<div style="color:var(--red);font-size:13px;margin-top:6px">⚠ القراءة الأحدث أقل من الأقدم، يرجى التحقق من القراءتين</div>':'';
  const priceWarn=price===0?'<div style="color:var(--amber);font-size:13px;margin-top:6px">⚠ لم يتم تحديد سعر الوحدة بعد — اضغط "تحديد الأسعار"</div>':'';
  resEl.style.display='block';
  resEl.innerHTML=`
    <div style="font-size:13px;color:var(--text-m);margin-bottom:8px">من ${fromDate} إلى ${toDate}</div>
    <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:15px">
      <span><strong>الفرق (الاستهلاك):</strong> ${diff.toLocaleString('en')} ${unit}</span>
      <span><strong>سعر الوحدة:</strong> ${price.toLocaleString('en')}</span>
      <span style="color:var(--green);font-weight:700"><strong>الإجمالي:</strong> ${total.toLocaleString('en')}</span>
    </div>${negWarn}${priceWarn}`;
}


function selectServiceType(type,el){
  document.querySelectorAll('#srv-form .type-card').forEach(c=>c.classList.remove('selected'));
  if(el)el.classList.add('selected');
  document.getElementById('srv-type').value=type;
  populateContractSelect();
  resetServiceContractFields();
}


let _srvFiltered=[];


function populateContractSelect(){
  const type=document.getElementById('srv-type').value;
  if(!type){_srvFiltered=[];renderSrvDropdown();return;}
  _srvFiltered=contracts.filter(c=>{
    if(!c.serviceType||c.serviceType==='both')return true;
    return c.serviceType===type;
  });
  renderSrvDropdown();
  document.getElementById('srv-contract-search').value='';
  document.getElementById('srv-contract').value='';
  const info=document.getElementById('srv-contract-info');
  if(info)info.textContent=_srvFiltered.length?'✅ اختر العقد من القائمة — سيتم تعبئة البيانات تلقائياً':'❌ لا توجد عقود متاحة لهذا النوع من الخدمة';
}


function renderSrvDropdown(filter){
  const dd=document.getElementById('srv-combo-dropdown');
  if(!dd)return;
  const list=filter? _srvFiltered.filter(c=>(c.num+' '+(c.inv||'')+' '+(c.landPlot||'')).includes(filter)) : _srvFiltered;
  if(!list.length){dd.innerHTML='<div style="padding:14px;text-align:center;font-size:14px;color:var(--text-m)">لا توجد عقود</div>';return;}
  const sel=document.getElementById('srv-contract').value;
  dd.innerHTML=list.map(c=>`
    <div class="srv-combo-item${c.id===sel?' selected':''}" data-id="${c.id}" onclick="selectSrvContract('${c.id}')">
      <div class="srv-combo-item-num">${c.num}</div>
      <div class="srv-combo-item-sub">${c.inv||'—'} · ${c.landPlot||'—'}</div>
    </div>
  `).join('');
}


function openSrvDropdown(){
  const wrap=document.getElementById('srv-combo-wrap');
  if(wrap)wrap.classList.add('open');
  renderSrvDropdown(document.getElementById('srv-contract-search').value);
}


function closeSrvDropdown(){
  document.getElementById('srv-combo-wrap')?.classList.remove('open');
}


function filterSrvDropdown(val){
  renderSrvDropdown(val.trim());
}


function selectSrvContract(id){
  document.getElementById('srv-contract').value=id;
  document.getElementById('srv-contract-search').value=contracts.find(c=>c.id===id)?.num||'';
  closeSrvDropdown();
  applySrvContract(id);
}


function applySrvContract(id){
  const c=contracts.find(cc=>cc.id===id);
  const details=document.getElementById('srv-contract-details');
  const info=document.getElementById('srv-contract-info');
  const hid=document.getElementById('srv-contract-id');
  if(!c){
    if(hid)hid.value='';
    resetServiceContractFields();
    return;
  }
  if(hid)hid.value=c.id;
  document.getElementById('srv-inv').value=c.inv||'';
  document.getElementById('srv-brand').value=c.brand||'';
  document.getElementById('srv-del-name').value=c.delName||'';
  document.getElementById('srv-fin-name').value=c.finName||'';
  document.getElementById('srv-plot').value=c.landPlot||'';
  const svcType=document.getElementById('srv-type').value;
  if(svcType==='water'){
    document.getElementById('srv-meter').value=c.waterMeter||'';
  }else if(svcType==='electricity'){
    document.getElementById('srv-meter').value=c.electricMeter||'';
  }else{
    document.getElementById('srv-meter').value='';
  }
  const meterVal=svcType==='water'?(c.waterMeter||'—'):(c.electricMeter||'—');
  if(details){
    details.style.display='block';
    details.innerHTML='<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:15px">'
      +'<span><strong>المستثمر:</strong> '+(c.inv||'—')+'</span>'
      +'<span><strong>العلامة:</strong> '+(c.brand||'—')+'</span>'
      +'<span><strong>الموقع:</strong> '+(c.locationCode||'—')+'</span>'
      +'</div><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:14px;color:var(--text-m);margin-top:4px">'
      +'<span>قطعة الأرض: '+(c.landPlot||'—')+'</span>'
      +'<span>العداد: '+meterVal+'</span>'
      +'<span style="color:var(--green)">✅ تم تعبئة البيانات</span></div>';
  }
  if(info)info.innerHTML='✅ تم اختيار العقد — تم تعبئة بيانات المستثمر والعلامة والعداد';
}


function resetServiceContractFields(){
  ['srv-inv','srv-brand','srv-del-name','srv-fin-name','srv-plot','srv-meter'].forEach(id=>{
    const e=document.getElementById(id);if(e)e.value='';
  });
  const det=document.getElementById('srv-contract-details');
  if(det){det.style.display='none';det.innerHTML='';}
}


// Close dropdown on outside click
document.addEventListener('click',function(e){
  const wrap=document.getElementById('srv-combo-wrap');
  if(wrap&&!wrap.contains(e.target))closeSrvDropdown();
});


function resetServiceForm(){
  document.getElementById('srv-contract').value='';
  document.getElementById('srv-contract-search').value='';
  ['srv-inv','srv-brand','srv-del-name','srv-fin-name','srv-plot','srv-meter','srv-reading','srv-notes'].forEach(id=>{
    const e=document.getElementById(id);if(e)e.value='';
  });
  document.getElementById('srv-date').value='';
  document.getElementById('srv-type').value='';
  if(document.getElementById('srv-contract-id'))document.getElementById('srv-contract-id').value='';
  const cdet=document.getElementById('srv-contract-details');
  if(cdet){cdet.style.display='none';cdet.innerHTML='';}
  const info=document.getElementById('srv-contract-info');
  if(info)info.textContent='✏️ اختر نوع الخدمة أولاً (ماء/كهرباء) ثم اختر العقد من القائمة';
  document.querySelectorAll('#srv-form .type-card').forEach(c=>c.classList.remove('selected'));
  _srvFiltered=[];
  renderSrvDropdown();
}


function validateServiceForm(){
  const type=document.getElementById('srv-type').value;
  if(!type){showToast('الرجاء اختيار نوع الخدمة (ماء أو كهرباء)',true);return false;}
  const contractId=document.getElementById('srv-contract-id')?.value;
  if(!contractId){showToast('الرجاء اختيار العقد من القائمة',true);return false;}
  const date=document.getElementById('srv-date').value;
  if(!date){document.getElementById('srv-date').focus();showToast('الرجاء إدخال تاريخ القراءة',true);return false;}
  const reading=document.getElementById('srv-reading').value;
  if(reading===''||parseFloat(reading)<0){document.getElementById('srv-reading').focus();showToast('الرجاء إدخال قراءة صحيحة',true);return false;}
  return true;
}


function saveService(){if(!erpRequire('services','add'))return;
  if(!validateServiceForm())return;
  const type=document.getElementById('srv-type').value;
  const contractId=document.getElementById('srv-contract')?.value||document.getElementById('srv-contract-id')?.value||'';
  const c=contracts.find(cc=>cc.id===contractId);
  const srv={
    id:'srv_'+Date.now(),
    type,
    contractId,
    investorName:document.getElementById('srv-inv').value||(c?c.inv:''),
    contractSerial:c?c.num:'',
    brand:document.getElementById('srv-brand').value||(c?c.brand:''),
    delegatedEntity:document.getElementById('srv-del-name').value||(c?c.delName:''),
    financialEntityName:document.getElementById('srv-fin-name').value||(c?c.finName:''),
    financialEntityNumber:c?c.finPhone||c.finNumber||'':'',
    landPlotNumber:document.getElementById('srv-plot').value||(c?c.landPlot:''),
    meterNumber:document.getElementById('srv-meter').value||'',
    meterDate:document.getElementById('srv-date').value,
    reading:parseFloat(document.getElementById('srv-reading').value)||0,
    notes:document.getElementById('srv-notes').value.trim(),
    createdAt:Date.now(),
    addedBy:session?session.name:''
  };
  services.unshift(srv);
  saveServicesLocal();
  resetServiceForm();
  showToast('✅ تم حفظ الخدمة بنجاح');
  document.getElementById('nav-srv-count').textContent=services.length;
}


function initServices(){
  document.getElementById('nav-srv-count').textContent=getServiceContracts().length;
}




