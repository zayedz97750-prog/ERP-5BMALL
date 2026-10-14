/* ═══ 5B Mall — Meter Readings ═══ */
/* ══════════════════════ METER READINGS FUNCTIONS ══════════════════════ */
let meterSortField=null,meterSortDir=1; // 1=asc,-1=desc


function initMeterReadings(){
  meterReadings=loadMeterReadings();
  document.getElementById('srv-type').value='';
  document.getElementById('meter-table-section').style.display='none';
  document.querySelectorAll('#srv-form .type-card').forEach(c=>c.classList.remove('selected'));
  loadServicePricesInline();
}


// Loads the shared servicePrices object into the inline price inputs on the
// service entry page (item 1: prices now live on this page instead of only in
// the separate "تحديد الأسعار" modal / settings).
function loadServicePricesInline(){
  const w=document.getElementById('srv-priceWater');
  const e=document.getElementById('srv-priceElectric');
  if(w)w.value=servicePrices.water||'';
  if(e)e.value=servicePrices.electricity||'';
}
function saveServicePricesInline(){if(!erpRequire('services','prices'))return;
  const w=parseFloat(document.getElementById('srv-priceWater').value);
  const e=parseFloat(document.getElementById('srv-priceElectric').value);
  servicePrices={water:isNaN(w)?0:w,electricity:isNaN(e)?0:e};
  saveServicePricesLocal(servicePrices);
  // Keep the settings-modal fields (still used elsewhere) in sync
  const mw=document.getElementById('priceWater');if(mw)mw.value=servicePrices.water;
  const me=document.getElementById('priceElectric');if(me)me.value=servicePrices.electricity;
  showToast('✅ تم حفظ أسعار الوحدات بنجاح');
  if(document.getElementById('srv-type').value)loadMeterReadingsTable();
}


function selectMeterType(type,el){
  document.querySelectorAll('#srv-form .type-card').forEach(c=>c.classList.remove('selected'));
  if(el)el.classList.add('selected');
  document.getElementById('srv-type').value=type;
  meterSortField=null;meterSortDir=1;
  // Item 6: only the relevant meter (water OR electricity) is shown on its own page
  const colHeader=document.getElementById('meter-col-header');
  if(colHeader)colHeader.textContent=type==='water'?'رقم عداد الماء':'رقم عداد الكهرباء';
  loadMeterReadingsTable();
}


function getContractsByMeterType(type){
  return contracts.filter(c=>{
    const hasLandPlot=c.landPlot&&c.landPlot.trim()!=='';
    const hasMeter=type==='water'?(c.waterMeter&&c.waterMeter.trim()!==''):(c.electricMeter&&c.electricMeter.trim()!=='');
    return hasLandPlot&&hasMeter;
  });
}


function sortMeterTable(field){
  if(meterSortField===field){meterSortDir=-meterSortDir;}
  else{meterSortField=field;meterSortDir=1;}
  ['num','landPlot'].forEach(f=>{
    const icon=document.getElementById('sortIcon-'+f);
    if(!icon)return;
    icon.textContent=f!==meterSortField?'⇅':(meterSortDir===1?'▲':'▼');
  });
  loadMeterReadingsTable();
}


function loadMeterReadingsTable(){
  const type=document.getElementById('srv-type').value;
  const section=document.getElementById('meter-table-section');
  const loading=document.getElementById('meter-loading');
  const tbody=document.getElementById('meterTableBody');


  if(!type){
    section.style.display='none';
    return;
  }


  section.style.display='block';
  loading.style.display='block';
  tbody.innerHTML='';


  // Use setTimeout to show loading indicator
  setTimeout(()=>{
    let filtered=getContractsByMeterType(type);
    if(!filtered.length){
      loading.style.display='none';
      const hint=type==='water'?'رقم قطعة الأرض وعداد الماء':'رقم قطعة الأرض وعداد الكهرباء';
      tbody.innerHTML='<tr><td colspan="11" style="text-align:center;padding:24px;color:var(--text-m)">لا توجد عقود متاحة - يرجى التأكد من إدخال '+hint+'</td></tr>';
      return;
    }
    // Item 2: ascending/descending sort by land plot number or contract number
    if(meterSortField){
      filtered=[...filtered].sort((a,b)=>{
        let av,bv;
        if(meterSortField==='num'){av=(a.num||'');bv=(b.num||'');}
        else{av=(a.landPlot||'');bv=(b.landPlot||'');}
        const an=parseFloat(av),bn=parseFloat(bv);
        let cmp;
        if(!isNaN(an)&&!isNaN(bn))cmp=an-bn;
        else cmp=String(av).localeCompare(String(bv),'ar',{numeric:true});
        return cmp*meterSortDir;
      });
    }
    renderMeterTable(filtered,type);
    loading.style.display='none';
  },50);
}


function renderMeterTable(contractsList,type){
  const tbody=document.getElementById('meterTableBody');
  const today=new Date().toISOString().slice(0,10);
  tbody.innerHTML=contractsList.map((c,i)=>{
    const meterNum=type==='water'?(c.waterMeter||'—'):(c.electricMeter||'—');
    const readingVal='';
    const readDateVal=today;
    // Count all readings for this contract+type
    const cnt=meterReadings.filter(r=>r.contractId===c.id&&r.meterType===type).length;
    const historyBtn=cnt>1
      ? `<button class="btn btn-ghost btn-xs" onclick="showReadingHistory('${c.id}','${type}','${c.num}','${c.inv}')" title="عرض كل القراءات" style="color:var(--blue)"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;stroke-width:2;fill:none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><polyline points="8,11 11,14 16,9"/></svg> ${cnt}</button>`
      : cnt===1
        ? `<span style="color:var(--text-l);font-size:13px">${cnt}</span>`
        : `<span style="color:var(--text-l);font-size:13px">0</span>`;
    return `<tr id="meter-row-${c.id}">
      <td style="color:var(--text-l);font-size:13px">${i+1}</td>
      <td class="td-num">${c.num||'—'}</td>
      <td class="td-name" title="${c.inv||''}">${c.inv||'—'}</td>
      <td class="td-brand">${c.brand||'—'}</td>
      <td>${c.landPlot||'—'}</td>
      <td style="font-weight:700">${meterNum}</td>
      <td style="font-size:14px">${c.meterDate||'—'}</td>
      <td><input type="date" class="finput" id="meter-date-${c.id}" value="${readDateVal}" style="width:130px" /></td>
      <td><input type="number" class="finput" id="meter-reading-${c.id}" value="${readingVal}" placeholder="القراءة" min="0" style="width:100px" /></td>
      <td>${historyBtn}</td>
      <td>
        <button class="btn btn-outline btn-xs" onclick="saveSingleMeterReading('${c.id}')" title="حفظ هذه القراءة فقط">
          <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="20,6 9,17 4,12"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}


function validateMeterReading(val,contractNum){
  if(val===''||val===null||val===undefined)return false;
  const num=parseFloat(val);
  if(isNaN(num)||num<0)return false;
  return true;
}


// Item 3: a contract may only have ONE reading per calendar month for a given
// meter type. Returns the conflicting reading (if any) that isn't the one
// currently being edited (matched by exact date).
function findMonthConflict(contractId,type,month,year,readingDate){
  return meterReadings.find(r=>r.contractId===contractId&&r.meterType===type&&r.month===month&&r.year===year&&r.readingDate!==readingDate);
}


// Shared save routine used by both "حفظ الكل" and the per-row "حفظ" button.
// Returns {ok:boolean, reason?:string}
function commitMeterReading(c,type){
  const input=document.getElementById('meter-reading-'+c.id);
  if(!input)return{ok:false,reason:'skip'};
  const val=input.value.trim();
  if(!validateMeterReading(val,c.num))return{ok:false,reason:'invalid'};


  const reading=parseFloat(val);
  const meterNum=type==='water'?(c.waterMeter||''):(c.electricMeter||'');
  const dateInput=document.getElementById('meter-date-'+c.id);
  const readingDate=dateInput&&dateInput.value?dateInput.value:new Date().toISOString().slice(0,10);
  const dt=new Date(readingDate);
  const month=String(dt.getMonth()+1);
  const year=String(dt.getFullYear());


  const existingIdx=meterReadings.findIndex(r=>r.contractId===c.id&&r.meterType===type&&r.readingDate===readingDate);


  if(existingIdx<0&&findMonthConflict(c.id,type,month,year,readingDate)){
    return{ok:false,reason:'month-taken'};
  }


  let mrId='';
  if(existingIdx>=0){
    mrId=meterReadings[existingIdx].id;
    meterReadings[existingIdx].reading=reading;
    meterReadings[existingIdx].updatedAt=Date.now();
  }else{
    mrId='mr_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
    meterReadings.push({
      id:mrId,
      contractId:c.id,
      contractNum:c.num,
      investorName:c.inv||'',
      brand:c.brand||'',
      meterType:type,
      meterNumber:meterNum,
      reading:reading,
      month:month,
      year:year,
      readingDate:readingDate,
      createdAt:Date.now(),
      updatedAt:Date.now(),
      addedBy:session?session.name:''
    });
  }


  const srvExistingIdx=services.findIndex(s=>s.contractId===c.id&&s.type===type&&s.meterDate===readingDate);
  if(srvExistingIdx>=0){
    services[srvExistingIdx].reading=reading;
    services[srvExistingIdx].updatedAt=Date.now();
  }else{
    services.unshift({
      id:'srv_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      type:type,
      contractId:c.id,
      investorName:c.inv||'',
      contractSerial:c.num,
      brand:c.brand||'',
      delegatedEntity:c.delName||'',
      financialEntityName:c.finName||'',
      financialEntityNumber:c.finPhone||'',
      landPlotNumber:c.landPlot||'',
      meterNumber:meterNum,
      meterDate:readingDate,
      reading:reading,
      notes:'قراءة عداد',
      month:month,
      year:year,
      createdAt:Date.now(),
      updatedAt:Date.now(),
      addedBy:session?session.name:''
    });
  }
  return{ok:true};
}


function afterMeterSave(){
  saveMeterReadings(meterReadings);
  saveServicesLocal();
  document.getElementById('nav-srv-count').textContent=getServiceContracts().length;
  const srvListPanel=document.getElementById('srv-list');
  if(srvListPanel&&srvListPanel.classList.contains('active'))renderServicesLogTable();
  else {var stc2=document.getElementById('srv-tab-count');if(stc2)stc2.textContent=getServiceContracts().length;}
}


// Item 4: a dedicated save button for a single meter/contract row.
function saveSingleMeterReading(contractId){if(!erpRequire('services','add'))return;
  if(!hasServicePerm('add')){showToast('ليس لديك صلاحية إضافة قراءات الخدمات',true);return;}
  const type=document.getElementById('srv-type').value;
  const c=contracts.find(x=>x.id===contractId);
  if(!c||!type)return;
  const result=commitMeterReading(c,type);
  if(!result.ok){
    if(result.reason==='month-taken')showToast('⚠ تم إدخال قراءة لهذا العقد خلال نفس الشهر مسبقاً — لا يمكن إدخال أكثر من قراءة واحدة للشهر',true);
    else if(result.reason==='invalid')showToast('الرجاء إدخال قراءة صحيحة',true);
    return;
  }
  afterMeterSave();
  loadMeterReadingsTable();
  showToast('✅ تم حفظ القراءة بنجاح');
}


function saveAllMeterReadings(){if(!erpRequire('services','add'))return;
  if(!hasServicePerm('add')){showToast('ليس لديك صلاحية إضافة قراءات الخدمات',true);return;}
  const type=document.getElementById('srv-type').value;


  if(!type){
    showToast('الرجاء اختيار نوع العداد (ماء أو كهرباء)',true);
    return;
  }


  const filtered=getContractsByMeterType(type);
  let saved=0,monthBlocked=0;


  filtered.forEach(c=>{
    const input=document.getElementById('meter-reading-'+c.id);
    if(!input||!input.value.trim())return;
    const result=commitMeterReading(c,type);
    if(result.ok)saved++;
    else if(result.reason==='month-taken')monthBlocked++;
  });


  if(saved===0){
    showToast(monthBlocked>0?'⚠ لم يتم الحفظ: يوجد قراءة مسجلة مسبقاً لنفس الشهر لكل العقود المدخلة':'لم يتم إدخال أي قراءات جديدة',true);
    return;
  }


  afterMeterSave();
  loadMeterReadingsTable();
  const blockedMsg=monthBlocked>0?(' — تم تجاهل '+monthBlocked+' قراءة لوجود قراءة سابقة لنفس الشهر'):'';
  showToast('✅ تم حفظ '+saved+' قراءة بنجاح'+blockedMsg);
}


