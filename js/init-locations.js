/* ═══ 5B Mall — Init, Multi-Location & Location Codes ═══ */
/* ══════════════════════ MULTI-LOCATION GROUPS (new contract form) ══════════════════════ */
// Each location group: { building, floor, shops: [{shop, division}] }
let locationGroups=[];
let _lgIdCounter=0;


function getFloorsForBuildingForm(building){
  if(building==='G'||building==='H')return GH_FLOORS;
  return loadFloors();
}


function addLocationGroup(preload){
  const id='lg_'+(++_lgIdCounter);
  const g={id,building:'',floor:'',division:'',shops:[],shopCheckStates:{}};
  locationGroups.push(g);
  renderLocationGroups();
  if(preload){
    const el=document.getElementById('lg-building-'+id);
    if(el&&preload.building){el.value=preload.building;onLGBuildingChange(id);}
    setTimeout(()=>{
      const fEl=document.getElementById('lg-floor-'+id);
      if(fEl&&preload.floor){fEl.value=preload.floor;onLGFloorChange(id);}
      setTimeout(()=>{
        if(preload.shops&&preload.shops.length){
          const dEl=document.getElementById('lg-division-'+id);
          if(dEl){dEl.value=preload.shops[0].division||'';onLGDivisionChange(id);}
          preload.shops.forEach(s=>{
            const chk=document.getElementById('lgshop-'+id+'-'+s.shop+'-'+(s.division||''));
            if(chk){chk.checked=true;onLGShopCheck(id,s.shop,s.division||'',chk);}
          });
        }
      },50);
    },50);
  }
}


function removeLocationGroup(id){
  locationGroups=locationGroups.filter(g=>g.id!==id);
  renderLocationGroups();
  syncLegacyLocationFields();
}


function renderLocationGroups(){
  const container=document.getElementById('location-groups-container');
  if(!container)return;
  container.innerHTML='';
  locationGroups.forEach((g,idx)=>{
    const div=document.createElement('div');
    div.id='lgblock-'+g.id;
    div.style.cssText='margin-bottom:14px;'+(idx>0?'border-top:1px solid var(--border-s);padding-top:12px;':'');
    div.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-weight:700;font-size:15px;color:var(--text)">الموقع ${idx+1}</span>
        ${locationGroups.length>1?`<button type="button" class="btn btn-ghost btn-xs" style="color:var(--red)" onclick="removeLocationGroup('${g.id}')">إزالة</button>`:''}
      </div>
      <div class="form-row" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:10px">
        <div class="form-group">
          <label class="flbl" for="lg-building-${g.id}">المبنى <span class="req">*</span></label>
          <select id="lg-building-${g.id}" class="finput" onchange="onLGBuildingChange('${g.id}')">
            ${loadBuildings().map(b=>`<option value="${b}"${g.building===b?' selected':''}>${b}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="flbl" for="lg-floor-${g.id}">الطابق <span class="req">*</span></label>
          <select id="lg-floor-${g.id}" class="finput" onchange="onLGFloorChange('${g.id}')">
            ${(g.building?getFloorsForBuildingForm(g.building):loadFloors()).map(f=>`<option value="${f}"${g.floor===f?' selected':''}>${f}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="flbl" for="lg-division-${g.id}">التقسيم</label>
          <select id="lg-division-${g.id}" class="finput" onchange="onLGDivisionChange('${g.id}')">
            ${g.building&&g.floor?divisionOptionsFor(g):'<option value="">بدون تقسيم</option>'}
          </select>
        </div>
      </div>
      <div id="lg-shops-container-${g.id}">
        ${renderLGShops(g)}
      </div>
      <div id="lg-area-summary-${g.id}" style="margin-top:8px;font-size:14px;color:var(--text-m)"></div>
    `;
    container.appendChild(div);
  });
  // Auto-select first building/floor for new groups (no placeholder options)
  locationGroups.forEach(g=>{
    if(!g.building){
      const bSel=document.getElementById('lg-building-'+g.id);
      if(bSel&&bSel.options.length){g.building=bSel.options[0].value;onLGBuildingChange(g.id);}
    }
  });
  syncLegacyLocationFields();
}


function renderLGShops(g){
  if(!g.building||!g.floor)return '<div class="fhint" style="margin-bottom:8px">اختر المبنى والطابق أولاً لعرض المحلات المتاحة</div>';
  const shops=locationsData.filter(l=>l.building===g.building&&l.floor===g.floor&&(l.division||'')===(g.division||''));
  if(!shops.length)return '<div class="fhint" style="margin-bottom:8px;color:var(--amber)">⚠ لا توجد محلات معرّفة لهذا المبنى والطابق'+(g.division?' بتقسيم '+g.division:'')+' — عرّف المحلات أولاً في صفحة "تعريف المباني"</div>';
  let html='<label class="flbl" style="display:block;margin-bottom:6px">اختر المحل/المحلات <span class="req">*</span></label>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:4px 18px;">';
  shops.forEach(loc=>{
    const key=loc.shop+'-'+(loc.division||'');
    const checked=g.shopCheckStates[key]?'checked':'';
    const label='محل '+loc.shop+' — '+loc.area+'م²';
    html+=`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:15px;font-weight:600;color:var(--text)" id="lgshop-label-${g.id}-${key}">
      <input type="checkbox" id="lgshop-${g.id}-${key}" ${checked} onchange="onLGShopCheck('${g.id}','${loc.shop}','${loc.division||''}',this)" style="accent-color:var(--blue);width:15px;height:15px;cursor:pointer" />
      ${label}
    </label>`;
  });
  html+='</div>';
  return html;
}


function divisionOptionsFor(g){
  const divs=[...new Set(locationsData.filter(l=>l.building===g.building&&l.floor===g.floor&&(l.division||'')!=='').map(l=>l.division))];
  return '<option value=""'+(g.division===''?' selected':'')+'>بدون تقسيم</option>'+divs.map(d=>`<option value="${d}"${g.division===d?' selected':''}>${d}</option>`).join('');
}


function onLGBuildingChange(id){
  const g=locationGroups.find(x=>x.id===id);if(!g)return;
  g.building=document.getElementById('lg-building-'+id).value;
  g.floor='';g.division='';g.shops=[];g.shopCheckStates={};
  // Repopulate floor dropdown (no placeholder; first floor is auto-selected)
  const fSel=document.getElementById('lg-floor-'+id);
  if(fSel){
    const floors=g.building?getFloorsForBuildingForm(g.building):loadFloors();
    fSel.innerHTML=floors.map(f=>`<option value="${f}">${f}</option>`).join('');
    if(floors.length)g.floor=fSel.options[0].value;
  }
  const dSel=document.getElementById('lg-division-'+id);
  if(dSel)dSel.innerHTML='<option value="">بدون تقسيم</option>';
  onLGFloorChange(id);
  syncLegacyLocationFields();
}


function onLGFloorChange(id){
  const g=locationGroups.find(x=>x.id===id);if(!g)return;
  g.floor=document.getElementById('lg-floor-'+id).value;
  g.division='';g.shops=[];g.shopCheckStates={};
  const dSel=document.getElementById('lg-division-'+id);
  if(dSel)dSel.innerHTML=divisionOptionsFor(g);
  const sc=document.getElementById('lg-shops-container-'+id);
  if(sc)sc.innerHTML=renderLGShops(g);
  syncLegacyLocationFields();
}


function onLGDivisionChange(id){
  const g=locationGroups.find(x=>x.id===id);if(!g)return;
  g.division=document.getElementById('lg-division-'+id).value;
  g.shops=[];g.shopCheckStates={};
  const sc=document.getElementById('lg-shops-container-'+id);
  if(sc)sc.innerHTML=renderLGShops(g);
  const summary=document.getElementById('lg-area-summary-'+id);
  if(summary)summary.innerHTML='';
  syncLegacyLocationFields();
}


function onLGShopCheck(id,shop,division,checkbox){
  const g=locationGroups.find(x=>x.id===id);if(!g)return;
  const key=shop+'-'+division;
  if(checkbox.checked){
    g.shopCheckStates[key]=true;
    if(!g.shops.find(s=>s.shop===shop&&s.division===division)){
      g.shops.push({shop,division});
    }
  }else{
    delete g.shopCheckStates[key];
    g.shops=g.shops.filter(s=>!(s.shop===shop&&s.division===division));
  }
  // Update area summary
  const summary=document.getElementById('lg-area-summary-'+id);
  if(summary&&g.shops.length){
    let total=0;
    g.shops.forEach(s=>{
      const area=findLocationArea(g.building,g.floor,s.shop,s.division);
      if(area)total+=area;
    });
    summary.innerHTML='<strong>إجمالي المساحة المختارة:</strong> '+total.toLocaleString('en')+' م²';
  }else if(summary){summary.innerHTML='';}
  syncLegacyLocationFields();
}


function syncLegacyLocationFields(){
  // Sync legacy fields from first location group for backward compatibility
  const g=locationGroups[0];
  if(!g){
    document.getElementById('f-loc-floor').value='';
    document.getElementById('f-loc-building').value='';
    document.getElementById('f-loc-shop').value='';
    document.getElementById('f-loc-division').value='';
    document.getElementById('f-loc-zone').value='';
    document.getElementById('f-location-code').value='';
    return;
  }
  const mainShop=g.shops[0]||{shop:'',division:''};
  document.getElementById('f-loc-floor').value=g.floor||'';
  document.getElementById('f-loc-building').value=g.building||'';
  document.getElementById('f-loc-shop').value=mainShop.shop||'';
  document.getElementById('f-loc-division').value=mainShop.division||'';
  const zone=g.building&&mainShop.shop?g.building+'-'+mainShop.shop+(mainShop.division?'-'+mainShop.division:''):'';
  document.getElementById('f-loc-zone').value=zone;
  const code=g.floor&&zone?g.floor+'-'+zone:'';
  document.getElementById('f-location-code').value=code;
  // area - sum of all selected shops
  const areaEl=document.getElementById('f-area');
  const hintEl=document.getElementById('f-area-hint');
  if(areaEl){
    if(g.building&&g.floor&&g.shops.length>0){
      let totalArea=0;
      g.shops.forEach(s=>{
        const area=findLocationArea(g.building,g.floor,s.shop,s.division||'');
        if(area)totalArea+=area;
      });
      if(totalArea>0){areaEl.value=totalArea;if(hintEl)hintEl.textContent='';}
      else{areaEl.value='';if(hintEl)hintEl.textContent='⚠ لا توجد مساحة محفوظة لهذا الموقع';}
    }else{areaEl.value='';if(hintEl&&hintEl.textContent)hintEl.textContent='';}
  }
}


function initLocationGroups(){
  locationGroups=[];_lgIdCounter=0;
  addLocationGroup();
}


function getAllSelectedLocations(){
  // Returns array of {building, floor, shop, division, area, locationCode}
  const result=[];
  locationGroups.forEach(g=>{
    if(!g.building||!g.floor)return;
    g.shops.forEach(s=>{
      const area=findLocationArea(g.building,g.floor,s.shop,s.division)||0;
      const zone=g.building+'-'+s.shop+(s.division?'-'+s.division:'');
      result.push({building:g.building,floor:g.floor,shop:s.shop,division:s.division||'',area,locationCode:g.floor+'-'+zone});
    });
  });
  return result;
}


function validateLocationGroups(){
  if(locationGroups.length===0)return false;
  for(const g of locationGroups){
    if(!g.building||!g.floor){showToast('الرجاء اختيار المبنى والطابق لجميع المواقع',true);return false;}
    if(g.shops.length===0){showToast('الرجاء اختيار محل واحد على الأقل في كل موقع',true);return false;}
    // Validate divisions: if a shop definition has a division field, it must be selected
    // (any checked shop is already a full definition so this is satisfied by checkbox selection)
  }
  return true;
}


/* ══════════════════════ LOCATION CODES (Floor + Zone) ══════════════════════ */
const SK_FLOORS='lms_floors_v2'; const SK_ZONES='lms_zones_v1'; const SK_BUILDINGS='lms_buildings_v1';
const DEFAULT_FLOORS=['قبو','أرضي','الطابق الأول'];
const DEFAULT_BUILDINGS=['A','B','C','D','E','F','G','H'];
const SHOP_NUMBERS=Array.from({length:30},(_,i)=>String(i+1));
const SK_ACTIVITIES='lms_activities_v1';
const DEFAULT_ACTIVITIES=['مطعم','كافيه','حلويات','عصير','سوبرماركت','ملابس','أحذية','اكسسوارات','عطور','مركز تدريب','عيادة','صيدلية','مختبر طبي','بنك'];
function loadBusinessActivities(){try{const s=localStorage.getItem(SK_ACTIVITIES);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p;}}catch(e){}localStorage.setItem(SK_ACTIVITIES,JSON.stringify(DEFAULT_ACTIVITIES));return[...DEFAULT_ACTIVITIES];}
function saveBusinessActivities(arr){try{localStorage.setItem(SK_ACTIVITIES,JSON.stringify(arr));}catch(e){}fbSet('activities',arr);}
function populateBusinessActivities(){
  const sel=document.getElementById('f-activity');if(!sel)return;
  const cur=sel.value;const acts=loadBusinessActivities();
  sel.innerHTML='<option value="">-- اختر النشاط التجاري --</option>';
  acts.forEach(a=>{const o=document.createElement('option');o.value=a;o.textContent=a;sel.appendChild(o);});
  if(cur)sel.value=cur;
}
function addBusinessActivity(){
  const v=prompt('أدخل اسم النشاط التجاري الجديد:');if(!v||!v.trim())return;
  const acts=loadBusinessActivities();const a=v.trim();
  if(acts.includes(a)){showToast('النشاط التجاري موجود مسبقاً',true);populateBusinessActivities();document.getElementById('f-activity').value=a;return;}
  acts.push(a);saveBusinessActivities(acts);populateBusinessActivities();
  document.getElementById('f-activity').value=a;
  showToast('تم إضافة النشاط التجاري '+a+' ✓');
}
const DEFAULT_ZONES=['A01','A02','A03','B01','B02','B03','C01','C02','D01','D02','E01'];
function loadFloors(){try{const s=localStorage.getItem(SK_FLOORS);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p;}}catch(e){}localStorage.setItem(SK_FLOORS,JSON.stringify(DEFAULT_FLOORS));return[...DEFAULT_FLOORS];}
function saveFloors(arr){try{localStorage.setItem(SK_FLOORS,JSON.stringify(arr));}catch(e){}fbSet('floors',arr);}
function loadBuildings(){try{const s=localStorage.getItem(SK_BUILDINGS);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p;}}catch(e){}localStorage.setItem(SK_BUILDINGS,JSON.stringify(DEFAULT_BUILDINGS));return[...DEFAULT_BUILDINGS];}
function saveBuildings(arr){try{localStorage.setItem(SK_BUILDINGS,JSON.stringify(arr));}catch(e){}fbSet('buildings',arr);}
function addBuilding(name){if(!erpRequire('procedures','add'))return;
  if(!name||!name.trim())return false;
  const buildings=loadBuildings();
  const trimmed=name.trim().toUpperCase();
  if(buildings.includes(trimmed)){showToast('المبنى موجود مسبقاً',true);return false;}
  buildings.push(trimmed);
  saveBuildings(buildings);
  showToast('تم إضافة المبنى '+trimmed+' ✓');
  return true;
}
function removeBuilding(name){if(!erpRequire('procedures','delete'))return;
  const buildings=loadBuildings();
  const idx=buildings.indexOf(name);
  if(idx===-1)return false;
  buildings.splice(idx,1);
  saveBuildings(buildings);
  showToast('تم حذف المبنى '+name);
  return true;
}
function loadZones(){try{const s=localStorage.getItem(SK_ZONES);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p;}}catch(e){}localStorage.setItem(SK_ZONES,JSON.stringify(DEFAULT_ZONES));return[...DEFAULT_ZONES];}
function saveZones(arr){try{localStorage.setItem(SK_ZONES,JSON.stringify(arr));}catch(e){}fbSet('zones',arr);}
function populateFloors(){
  const sel=document.getElementById('f-loc-floor');if(!sel)return;
  const cur=sel.value;const floors=loadFloors();
  sel.innerHTML='<option value="">-- اختر الطابق --</option>';
  floors.forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;sel.appendChild(o);});
  if(cur)sel.value=cur;
}
function populateBuildings(){
  const sel=document.getElementById('f-loc-building');if(!sel)return;
  const cur=sel.value;const buildings=loadBuildings();
  sel.innerHTML='<option value="">-- اختر المبنى --</option>';
  buildings.forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent='مبنى '+b;sel.appendChild(o);});
  if(cur)sel.value=cur;
}
function populateShopNumbers(max){
  const sel=document.getElementById('f-loc-shop');if(!sel)return;
  const cur=sel.value;
  const count=max||30;
  sel.innerHTML='<option value="">-- اختر رقم المحل --</option>';
  for(let i=1;i<=count;i++){const o=document.createElement('option');o.value=String(i);o.textContent=String(i);sel.appendChild(o);}
  if(cur)sel.value=cur;
}
function populateDivisions(){
  const sel=document.getElementById('f-loc-division');if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">-- بدون تقسيم --</option>'+SHOP_DIVISIONS.map(d=>`<option value="${d}">${d}</option>`).join('');
  if(cur)sel.value=cur;
}
function populateDivisions2(){
  const sel=document.getElementById('f-loc2-division');if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">-- بدون تقسيم --</option>'+SHOP_DIVISIONS.map(d=>`<option value="${d}">${d}</option>`).join('');
  if(cur)sel.value=cur;
}
// Backward-compatible alias (previously populated a free-text "zone" select)
function populateZones(){populateBuildings();populateShopNumbers();populateDivisions();}
function updateLocationCode(){
  const floor=document.getElementById('f-loc-floor')?.value||'';
  const building=document.getElementById('f-loc-building')?.value||'';
  const shop=document.getElementById('f-loc-shop')?.value||'';
  const division=document.getElementById('f-loc-division')?.value||'';
  const zone=building&&shop?building+'-'+shop+(division?'-'+division:''):'';
  const zEl=document.getElementById('f-loc-zone');if(zEl)zEl.value=zone;
  const code=floor&&zone?floor+'-'+zone:'';
  document.getElementById('f-location-code').value=code;
}
// Looks up the saved location data (Procedures page) for the currently selected
// floor+building+shop(+division) and fills the read-only area field. If no matching
// location has been saved yet, the field is cleared and a hint is shown
// pointing the user to the Procedures page instead of allowing manual entry.
function autofillAreaFromLocation(){
  const areaEl=document.getElementById('f-area');
  const hintEl=document.getElementById('f-area-hint');
  if(!areaEl)return;
  const floor=document.getElementById('f-loc-floor')?.value||'';
  const building=document.getElementById('f-loc-building')?.value||'';
  const shop=document.getElementById('f-loc-shop')?.value||'';
  const division=document.getElementById('f-loc-division')?.value||'';
  if(!floor||!building||!shop){areaEl.value='';if(hintEl)hintEl.textContent='';return;}
  const area=findLocationArea(building,floor,shop,division);
  if(area!=null){
    areaEl.value=area;
    if(hintEl)hintEl.textContent='';
  }else{
    areaEl.value='';
    if(hintEl)hintEl.textContent='⚠ لا توجد مساحة محفوظة لهذا الموقع — أضيفيها أولاً من صفحة "تعريف المباني"';
  }
}
function getLocationLabel(code){return code||'غير محدد';}


/* ══════════════════════ DUPLICATE LOCATION PREVENTION ══════════════════════ */
// Returns every {building,floor,shop,division} slot a contract occupies (its
// main shop, plus a second shop if it has one). Falls back to parsing the
// legacy locationCode string for contracts saved before the explicit
// locBuilding/locFloor/locShop fields existed.
function contractLocationsList(c){
  if(c.allLocations&&c.allLocations.length){
    return c.allLocations.map(l=>({building:l.building,floor:l.floor,shop:String(l.shop),division:l.division||''}));
  }
  const list=[];
  if(c.locBuilding&&c.locFloor&&c.locShop){
    list.push({building:c.locBuilding,floor:c.locFloor,shop:String(c.locShop),division:c.locDivision||''});
  }else if(c.locationCode&&c.locationCode.includes('-')){
    const parts=c.locationCode.split('-');
    if(parts[1]&&parts[2])list.push({building:parts[1],floor:parts[0],shop:String(parts[2]),division:parts[3]||''});
  }
  if(c.secondShop&&c.secondShop.building&&c.secondShop.shop){
    list.push({building:c.secondShop.building,floor:c.secondShop.floor||'',shop:String(c.secondShop.shop),division:c.secondShop.division||''});
  }
  return list;
}
// Helper: does this contract currently occupy its space? (not cancelled/ended and not expired)
function isContractOccupying(c){
  if(!c) return false;
  if(c.status==='cancelled'||c.status==='ended') return false;
  if(c.expiry){
    const exp=new Date(c.expiry); exp.setHours(23,59,59,999);
    if(!isNaN(exp) && exp < new Date()) return false;
  }
  return true;
}
// Checks whether building+floor+shop(+division) is already occupied by another
// occupying contract. excludeId lets an edit-in-progress ignore itself.
function isLocationTaken(building,floor,shop,division,excludeId){
  if(!building||!floor||!shop)return false;
  division=division||'';
  shop=String(shop);
  return contracts.some(c=>{
    if(excludeId&&c.id===excludeId)return false;
    if(!isContractOccupying(c))return false;
    return contractLocationsList(c).some(l=>l.building===building&&l.floor===floor&&l.shop===shop&&(l.division||'')===division);
  });
}
function describeLocation(building,floor,shop,division){
  return 'مبنى '+building+' - '+floor+' - محل '+shop+(division?' - تقسيم '+division:'');
}


/* ══════════════════════ SECOND SHOP (commercial contracts: add a 2nd shop on the same contract) ══════════════════════ */
function populateFloors2(){
  const sel=document.getElementById('f-loc2-floor');if(!sel)return;
  const cur=sel.value;const floors=loadFloors();
  sel.innerHTML='<option value="">-- اختر الطابق --</option>';
  floors.forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;sel.appendChild(o);});
  if(cur)sel.value=cur;
}
function populateBuildings2(){
  const sel=document.getElementById('f-loc2-building');if(!sel)return;
  const cur=sel.value;const buildings=loadBuildings();
  sel.innerHTML='<option value="">-- اختر المبنى --</option>';
  buildings.forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent='مبنى '+b;sel.appendChild(o);});
  if(cur)sel.value=cur;
}
function populateShopNumbers2(max){
  const sel=document.getElementById('f-loc2-shop');if(!sel)return;
  const cur=sel.value;
  const count=max||30;
  sel.innerHTML='<option value="">-- اختر رقم المحل --</option>';
  for(let i=1;i<=count;i++){const o=document.createElement('option');o.value=String(i);o.textContent=String(i);sel.appendChild(o);}
  if(cur)sel.value=cur;
}
function updateSecondShopCode(){
  const floor=document.getElementById('f-loc2-floor')?.value||'';
  const building=document.getElementById('f-loc2-building')?.value||'';
  const shop=document.getElementById('f-loc2-shop')?.value||'';
  const division=document.getElementById('f-loc2-division')?.value||'';
  const zone=building&&shop?building+'-'+shop+(division?'-'+division:''):'';
  const zEl=document.getElementById('f-loc2-zone');if(zEl)zEl.value=zone;
  const code=floor&&zone?floor+'-'+zone:'';
  const hc=document.getElementById('f-location-code2');if(hc)hc.value=code;
}
function autofillAreaFromLocation2(){
  const areaEl=document.getElementById('f-area2');
  const hintEl=document.getElementById('f-area2-hint');
  if(!areaEl)return;
  const floor=document.getElementById('f-loc2-floor')?.value||'';
  const building=document.getElementById('f-loc2-building')?.value||'';
  const shop=document.getElementById('f-loc2-shop')?.value||'';
  const division=document.getElementById('f-loc2-division')?.value||'';
  if(!floor||!building||!shop){areaEl.value='';if(hintEl)hintEl.textContent='';return;}
  const area=findLocationArea(building,floor,shop,division);
  if(area!=null){
    areaEl.value=area;
    if(hintEl)hintEl.textContent='';
  }else{
    areaEl.value='';
    if(hintEl)hintEl.textContent='⚠ لا توجد مساحة محفوظة لهذا الموقع — أضيفيها أولاً من صفحة "تعريف المباني"';
  }
}
// Shows the second-shop block, ready for the user to fill in. Used both when
// the "إضافة محل ثاني لنفس العقد" (+) button is pressed and when opening the
// edit form for a contract that already has a second shop saved.
function addSecondShop(){
  populateFloors2();populateBuildings2();populateShopNumbers2();populateDivisions2();
  document.getElementById('secondShopBlock').style.display='';
  const addBtn2=document.getElementById('addSecondShopBtn');if(addBtn2)addBtn2.style.display='none';
  updateSecondShopCode();
}
function removeSecondShop(){
  document.getElementById('secondShopBlock').style.display='none';
  const addBtn2=document.getElementById('addSecondShopBtn');if(addBtn2)addBtn2.style.display='';
  const floorEl=document.getElementById('f-loc2-floor');if(floorEl)floorEl.value='';
  const bEl=document.getElementById('f-loc2-building');if(bEl)bEl.value='';
  const sEl=document.getElementById('f-loc2-shop');if(sEl)sEl.value='';
  const dEl=document.getElementById('f-loc2-division');if(dEl)dEl.value='';
  const areaEl=document.getElementById('f-area2');if(areaEl)areaEl.value='';
  const hintEl=document.getElementById('f-area2-hint');if(hintEl)hintEl.textContent='';
  const zEl=document.getElementById('f-loc2-zone');if(zEl)zEl.value='';
  const hc=document.getElementById('f-location-code2');if(hc)hc.value='';
}
// Fully resets the second-shop UI to a clean, hidden state. Called whenever the
// form is reset for a NEW contract, and at the start of populateForEdit() so
// that state left over from adding a second shop on a *different* contract
// (or from a fresh "add new" session) never leaks into an edit session —
// this is the fix for contracts being edited getting the "add" behaviour
// applied to them incorrectly.
function resetSecondShopUI(){
  document.getElementById('secondShopBlock').style.display='none';
  const addBtn2=document.getElementById('addSecondShopBtn');if(addBtn2)addBtn2.style.display='';
  document.getElementById('addSecondShopWrap').style.display='none';
  const floorEl=document.getElementById('f-loc2-floor');if(floorEl)floorEl.value='';
  const bEl=document.getElementById('f-loc2-building');if(bEl)bEl.value='';
  const sEl=document.getElementById('f-loc2-shop');if(sEl)sEl.value='';
  const dEl=document.getElementById('f-loc2-division');if(dEl)dEl.value='';
  const areaEl=document.getElementById('f-area2');if(areaEl)areaEl.value='';
  const hintEl=document.getElementById('f-area2-hint');if(hintEl)hintEl.textContent='';
  const zEl=document.getElementById('f-loc2-zone');if(zEl)zEl.value='';
  const hc=document.getElementById('f-location-code2');if(hc)hc.value='';
}


/* ══════════════════════ SITE LOCATIONS (Procedures page: building+floor+shop → area) ══════════════════════ */
const SK_LOCATIONS='lms_site_locations_v1';
function loadLocationsData(){try{const s=localStorage.getItem(SK_LOCATIONS);if(s)return JSON.parse(s);}catch(e){}return [];}
function saveLocationsDataLocal(arr){try{localStorage.setItem(SK_LOCATIONS,JSON.stringify(arr));}catch(e){}fbSet('siteLocations',arr);}
let locationsData=loadLocationsData();


const SHOP_DIVISIONS=['A','B','C','D','E','F','G','H'];
function locationKey(building,floor,shop,division){return building+'|'+floor+'|'+shop+'|'+(division||'');}
function findLocationArea(building,floor,shop,division){
  if(!building||!floor||!shop)return null;
  division=division||'';
  const exact=locationsData.find(l=>l.building===building&&l.floor===floor&&l.shop===String(shop)&&(l.division||'')===division);
  if(exact)return exact.area;
  // Fallback for locations saved before divisions existed (no division recorded)
  if(!division){
    const found=locationsData.find(l=>l.building===building&&l.floor===floor&&l.shop===String(shop));
    return found?found.area:null;
  }
  return null;
}


// Buildings G and H have 5 floors
const GH_FLOORS=['الطابق الأول','الطابق الثاني','الطابق الثالث','الطابق الرابع','الطابق الخامس'];
function getFloorsForBuilding(building){
  if(building==='G'||building==='H')return GH_FLOORS;
  return loadFloors();
}


function onProcBuildingChange(){
  const building=document.getElementById('proc-building').value;
  const fSel=document.getElementById('proc-floor');
  if(fSel){
    fSel.innerHTML=getFloorsForBuilding(building).map(f=>`<option value="${f}">${f}</option>`).join('');
  }
}


function onProcOverviewBuildingChange(){
  const building=document.getElementById('proc-building-overview').value;
  const fSel=document.getElementById('proc-floor-overview');
  if(fSel){
    const floors=getFloorsForBuilding(building);
    fSel.innerHTML='<option value="">-- كل الطوابق --</option>'+floors.map(f=>`<option value="${f}">${f}</option>`).join('');
  }
  updateBuildingOverview();
}


function updateBuildingOverview(){
  const building=document.getElementById('proc-building-overview').value;
  const floorSel=document.getElementById('proc-floor-overview');
  const floor=floorSel?floorSel.value:'';
  const cardsDiv=document.getElementById('proc-building-overview-cards');
  if(!building){cardsDiv.style.display='none';return;}
  cardsDiv.style.display='block';
  const locsOfBuilding=locationsData.filter(l=>l.building===building);
  const locsOfScope=floor?locsOfBuilding.filter(l=>l.floor===floor):locsOfBuilding;
  // Total area = sum of all defined locations for this building/floor
  const totalArea=locsOfScope.reduce((s,l)=>s+(l.area||0),0);
  // Used area = sum of areas of currently occupying contracts (excludes cancelled/ended/expired — space returns to vacant)
  let usedArea=0;
  contracts.forEach(c=>{
    if(!isContractOccupying(c))return;
    const locs=contractLocationsList(c);
    locs.forEach(loc=>{
      if(loc.building===building&&(!floor||loc.floor===floor)){
        const area=findLocationArea(loc.building,loc.floor,loc.shop,loc.division);
        if(area)usedArea+=area;
      }
    });
  });
  const emptyArea=Math.max(0,totalArea-usedArea);
  const scopeLabel=floor?('مبنى '+building+' — '+floor):('مبنى '+building);
  document.getElementById('proc-total-area').textContent=totalArea.toLocaleString('en');
  document.getElementById('proc-used-area').textContent=usedArea.toLocaleString('en');
  document.getElementById('proc-empty-area').textContent=emptyArea.toLocaleString('en');
  document.getElementById('proc-total-area-sub').textContent='إجمالي مساحات المحلات المعرّفة في '+scopeLabel+' (م²)';
  document.getElementById('proc-used-area-sub').textContent='مساحة العقود النشطة في '+scopeLabel+' (م²)';
  document.getElementById('proc-empty-area-sub').textContent='المساحة الفارغة في '+scopeLabel+' (م²)';
  renderFloorBreakdown(building);
}


function renderFloorBreakdown(building){
  const wrap=document.getElementById('proc-floor-breakdown');
  const body=document.getElementById('proc-floor-breakdown-body');
  const bName=document.getElementById('proc-breakdown-building');
  if(!wrap||!body)return;
  const floorSel=document.getElementById('proc-floor-overview');
  const currentFloor=floorSel?floorSel.value:'';
  // Breakdown is only shown when viewing the whole building
  if(!building||currentFloor){wrap.style.display='none';return;}
  wrap.style.display='block';
  if(bName)bName.textContent=building;
  const floors=getFloorsForBuilding(building);
  const rows=floors.map(f=>{
    const total=locationsData.filter(l=>l.building===building&&l.floor===f).reduce((s,l)=>s+(l.area||0),0);
    let used=0;
    contracts.forEach(c=>{
      if(!isContractOccupying(c))return;
      contractLocationsList(c).forEach(loc=>{
        if(loc.building===building&&loc.floor===f){
          const area=findLocationArea(loc.building,loc.floor,loc.shop,loc.division);
          if(area)used+=area;
        }
      });
    });
    const empty=Math.max(0,total-used);
    return `<tr>
      <td style="font-weight:700">${f}</td>
      <td>${total.toLocaleString('en')}</td>
      <td style="color:var(--green);font-weight:600">${used.toLocaleString('en')}</td>
      <td style="color:${empty>0?'var(--orange)':'var(--text-l)'};font-weight:600">${empty.toLocaleString('en')}</td>
    </tr>`;
  });
  body.innerHTML=rows.join('');
}


function initProceduresPage(){
  const bSel=document.getElementById('proc-building');
  if(bSel&&!bSel.options.length){
    const buildings=loadBuildings();
    bSel.innerHTML=buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
  }
  const bOv=document.getElementById('proc-building-overview');
  if(bOv&&bOv.options.length<=1){
    const buildings=loadBuildings();
    bOv.innerHTML='<option value="">-- اختر مبنى --</option>'+buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
  }
  const fOv=document.getElementById('proc-floor-overview');
  if(fOv&&fOv.options.length<=1){
    fOv.innerHTML='<option value="">-- كل الطوابق --</option>'+loadFloors().map(f=>`<option value="${f}">${f}</option>`).join('');
  }
  updateBuildingOverview();
  const fSel=document.getElementById('proc-floor');
  if(fSel&&!fSel.options.length){
    fSel.innerHTML=getFloorsForBuilding(bSel&&bSel.value?bSel.value:'').map(f=>`<option value="${f}">${f}</option>`).join('');
  }
  const sSel=document.getElementById('proc-shop');
  if(sSel&&!sSel.options.length){
    sSel.innerHTML=SHOP_NUMBERS.map(n=>`<option value="${n}">${n}</option>`).join('');
  }
  const dSel=document.getElementById('proc-division');
  if(dSel&&!dSel.options.length){
    dSel.innerHTML='<option value="">بدون تقسيم</option>'+SHOP_DIVISIONS.map(d=>`<option value="${d}">${d}</option>`).join('');
  }
  renderProceduresTable();
  renderBuildingsList();
}


function addNewBuilding(){if(!erpRequire('procedures','add'))return;
  const input=document.getElementById('newBuildingInput');
  const name=input.value.trim();
  if(!name){showToast('أدخل اسم المبنى',true);return;}
  if(addBuilding(name)){
    input.value='';
    renderBuildingsList();
    refreshBuildingDropdowns();
  }
}


function removeBuildingByName(name){if(!erpRequire('procedures','delete'))return;
  if(!confirm('هل أنت متأكد من حذف المبنى "'+name+'"؟'))return;
  removeBuilding(name);
  renderBuildingsList();
  refreshBuildingDropdowns();
}


function renderBuildingsList(){
  const container=document.getElementById('buildingsList');
  if(!container)return;
  const buildings=loadBuildings();
  container.innerHTML=buildings.map(b=>`
    <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:15px;font-weight:600;color:var(--text)">
      <span style="color:var(--blue)">🏢</span>
      <span>${b}</span>
      <button onclick="removeBuildingByName('${b}')" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:18px;line-height:1;padding:0 2px" title="حذف المبنى">×</button>
    </div>
  `).join('');
}


function refreshBuildingDropdowns(){
  const buildings=loadBuildings();
  // Update contract form building dropdown
  const bSel=document.getElementById('f-loc-building');
  if(bSel){
    const cur=bSel.value;
    bSel.innerHTML='<option value="">-- اختر المبنى --</option>'+buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
    if(cur)bSel.value=cur;
  }
  // Update procedures page building dropdown
  const procSel=document.getElementById('proc-building');
  if(procSel){
    const cur=procSel.value;
    procSel.innerHTML=buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
    if(cur)procSel.value=cur;
  }
  // Update procedures page overview dropdown
  const procOv=document.getElementById('proc-building-overview');
  if(procOv){
    const cur=procOv.value;
    procOv.innerHTML='<option value="">-- اختر مبنى --</option>'+buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
    if(cur)procOv.value=cur;
  }
  // Update location groups building dropdowns
  document.querySelectorAll('[id^="lg-building-"]').forEach(sel=>{
    const cur=sel.value;
    sel.innerHTML=buildings.map(b=>`<option value="${b}">مبنى ${b}</option>`).join('');
    if(cur)sel.value=cur;
  });
}


let editingLocationKey=null;
function saveProcedureLocation(){if(!erpRequire('procedures',editingLocationKey?'edit':'add'))return;
  const building=document.getElementById('proc-building').value;
  const floor=document.getElementById('proc-floor').value;
  const shop=document.getElementById('proc-shop').value;
  const division=document.getElementById('proc-division').value;
  const area=parseFloat(document.getElementById('proc-area').value);
  if(!building||!floor||!shop){showToast('الرجاء اختيار المبنى والطابق ورقم المحل',true);return;}
  if(isNaN(area)||area<=0){showToast('الرجاء إدخال مساحة صحيحة',true);return;}
  const idx=locationsData.findIndex(l=>l.building===building&&l.floor===floor&&l.shop===shop&&(l.division||'')===division);
  if(idx>=0&&!erpRequire('procedures','edit'))return;
  if(editingLocationKey&&editingLocationKey!==locationKey(building,floor,shop,division)){
    // Being re-saved under a different key while editing: remove the old entry first
    const [ob,of,os,od]=editingLocationKey.split('|');
    const oldIdx=locationsData.findIndex(l=>l.building===ob&&l.floor===of&&l.shop===os&&(l.division||'')===od);
    if(oldIdx>=0)locationsData.splice(oldIdx,1);
  }
  if(idx>=0){
    locationsData[idx].area=area;
  }else{
    locationsData.push({building,floor,shop,division,area});
  }
  saveLocationsDataLocal(locationsData);
  showToast('✅ تم حفظ بيانات الموقع بنجاح');
  resetProcedureForm();
  renderProceduresTable();
  updateBuildingOverview();
}
function resetProcedureForm(){
  editingLocationKey=null;
  document.getElementById('proc-building').value='';
  document.getElementById('proc-floor').value='';
  document.getElementById('proc-shop').value='';
  document.getElementById('proc-division').value='';
  document.getElementById('proc-area').value='';
}
function editProcedureLocation(building,floor,shop,division){if(!erpRequire('procedures','edit'))return;
  division=division||'';
  const loc=locationsData.find(l=>l.building===building&&l.floor===floor&&l.shop===shop&&(l.division||'')===division);
  if(!loc)return;
  editingLocationKey=locationKey(building,floor,shop,division);
  document.getElementById('proc-building').value=building;
  document.getElementById('proc-floor').value=floor;
  document.getElementById('proc-shop').value=shop;
  document.getElementById('proc-division').value=division;
  document.getElementById('proc-area').value=loc.area;
  document.getElementById('page-procedures').scrollIntoView({behavior:'smooth',block:'start'});
}
function deleteProcedureLocation(building,floor,shop,division){if(!erpRequire('procedures','delete'))return;
  division=division||'';
  locationsData=locationsData.filter(l=>!(l.building===building&&l.floor===floor&&l.shop===shop&&(l.division||'')===division));
  saveLocationsDataLocal(locationsData);
  renderProceduresTable();
  updateBuildingOverview();
  showToast('تم حذف بيانات الموقع');
}
function renderProceduresTable(){
  const q=(document.getElementById('procSearch')?.value||'').trim().toLowerCase();
  let list=[...locationsData];
  if(q)list=list.filter(l=>l.building.toLowerCase().includes(q)||l.floor.toLowerCase().includes(q)||l.shop.toLowerCase().includes(q));
  list.sort((a,b)=>a.building.localeCompare(b.building)||a.floor.localeCompare(b.floor)||parseInt(a.shop)-parseInt(b.shop)||(a.division||'').localeCompare(b.division||''));
  const tb=document.getElementById('procTableBody');
  const empty=document.getElementById('procEmpty');
  const cnt=document.getElementById('procCount');
  if(cnt)cnt.textContent=list.length+' موقع';
  if(!tb)return;
  if(!list.length){tb.innerHTML='';if(empty)empty.style.display='flex';return;}
  if(empty)empty.style.display='none';
  tb.innerHTML=list.map((l,i)=>`<tr>
    <td style="color:var(--text-l);font-size:13px">${i+1}</td>
    <td><span style="display:inline-block;padding:2px 7px;background:var(--purple-l);color:var(--blue);border-radius:5px;font-size:13px;font-weight:700">مبنى ${l.building}</span></td>
    <td>${l.floor}</td>
    <td>${l.shop}</td>
    <td>${l.division?`<span style="display:inline-block;padding:2px 7px;background:var(--teal-l);color:var(--teal-d);border-radius:5px;font-size:13px;font-weight:700">${l.division}</span>`:'<span style="color:var(--text-l)">—</span>'}</td>
    <td style="font-weight:700">${l.area.toLocaleString('en')} م²</td>
    <td><div class="td-actions">
      <button class="btn btn-ghost btn-xs" title="تعديل" onclick="editProcedureLocation('${l.building}','${l.floor}','${l.shop}','${l.division||''}')"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:var(--blue);stroke-width:2;fill:none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="btn btn-ghost btn-xs" title="حذف" onclick="deleteProcedureLocation('${l.building}','${l.floor}','${l.shop}','${l.division||''}')" style="color:var(--red)"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2;fill:none"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
    </div></td>
  </tr>`).join('');
}


/* ══════════════════════ CONTRACT NUMBER AUTO-FORMAT ══════════════════════ */
let numMode='auto';


function populateContractYearSelect(){
  const sel=document.getElementById('f-num-year');
  if(!sel||sel.options.length)return;
  const curYear=new Date().getFullYear();
  for(let y=curYear-3;y<=curYear+5;y++){
    const opt=document.createElement('option');
    opt.value=y;opt.textContent=y;
    if(y===curYear)opt.selected=true;
    sel.appendChild(opt);
  }
}


// Returns the type-specific prefix (e.g. "5B-2026-", "B-WH3-2026-", "B-ST-2026-")
// and a matching regex used to compute the next sequence number for that combination.
function getContractNumPrefixParts(){
  const yearSel=document.getElementById('f-num-year');
  const year=yearSel&&yearSel.value?yearSel.value:new Date().getFullYear();
  if(selectedType==='warehouse'){
    const wh=document.getElementById('f-num-warehouse')?.value||'1';
    return {prefix:'B-WH'+wh+'-'+year+'-',regex:new RegExp('^B-WH'+wh+'-'+year+'-(\\d{3})$')};
  }else if(selectedType==='short'){
    return {prefix:'B-ST-'+year+'-',regex:new RegExp('^B-ST-'+year+'-(\\d{3})$')};
  }else{
    return {prefix:'5B-'+year+'-',regex:new RegExp('^5B-'+year+'-(\\d{3})$')};
  }
}


function getNextContractNum(){
  const {prefix,regex}=getContractNumPrefixParts();
  let maxSeq=0;
  contracts.forEach(c=>{
    const m=c.num?.match(regex);
    if(m){const seq=parseInt(m[1]);if(seq>maxSeq)maxSeq=seq;}
  });
  const nextSeq=String(maxSeq+1).padStart(3,'0');
  return {full:prefix+nextSeq,prefix,seq:nextSeq};
}


// Combines the prefix (type+warehouse+year) with the digits the user entered
// in auto mode, or returns the freely-typed value in manual mode.
function getContractNumFull(){
  const inp=document.getElementById('f-num');
  if(numMode==='manual')return (inp?.value||'').trim();
  const {prefix}=getContractNumPrefixParts();
  const digits=(inp?.value||'').trim().replace(/\D/g,'').padStart(3,'0');
  return prefix+digits;
}


// Refreshes the prefix badge, shows/hides the warehouse selector, updates the
// hint text, and (in auto mode) re-suggests the next available sequence number.
function updateContractNumPrefix(){
  const whSel=document.getElementById('f-num-warehouse');
  if(whSel)whSel.style.display=(selectedType==='warehouse'&&numMode==='auto')?'':'none';
  const yearSel=document.getElementById('f-num-year');
  if(yearSel)yearSel.style.display=numMode==='auto'?'':'none';
  const pre=document.getElementById('f-num-prefix');
  const hint=document.getElementById('f-num-hint');
  if(numMode!=='auto'){
    if(pre)pre.style.display='none';
    if(hint)hint.textContent='اكتب رقم العقد كاملاً';
    return;
  }
  const {prefix}=getContractNumPrefixParts();
  if(pre){pre.style.display='';pre.textContent=prefix;}
  if(hint){
    if(selectedType==='warehouse')hint.textContent='التنسيق: B-WH(رقم المستودع)-السنة-آخر 3 أرقام';
    else if(selectedType==='short')hint.textContent='التنسيق: B-ST-السنة-آخر 3 أرقام';
    else hint.textContent='التنسيق: 5B-السنة-آخر 3 أرقام';
  }
  if(!editingContract){
    const inp=document.getElementById('f-num');
    if(inp){const next=getNextContractNum();inp.value=next.seq;}
  }
}


function onNumModeChange(){
  const auto=document.querySelector('input[name="numMode"]:checked');
  numMode=auto?auto.value:'auto';
  const inp=document.getElementById('f-num');
  if(numMode==='auto'){
    inp.readOnly=true;
    inp.style.background='var(--bg)';
    inp.style.cursor='default';
    inp.maxLength=3;
    inp.placeholder='086';
    inp.style.width='80px';
    updateContractNumPrefix();
  }else{
    // Manual mode: let the user type the full contract number freely
    inp.readOnly=false;
    inp.style.background='var(--surface)';
    inp.style.cursor='text';
    inp.removeAttribute('maxlength');
    inp.value='';
    inp.placeholder='اكتب رقم العقد كاملاً';
    inp.style.width='220px';
    updateContractNumPrefix();
    inp.focus();
  }
}


function initContractNum(){
  if(editingContract)return;
  const inp=document.getElementById('f-num');
  if(!inp||inp.value)return;
  if(numMode==='auto'){
    inp.readOnly=true;
    inp.style.background='var(--bg)';
    inp.style.cursor='default';
    updateContractNumPrefix();
  }else{
    inp.readOnly=false;
    inp.style.background='var(--surface)';
    inp.style.cursor='text';
    inp.placeholder='اكتب رقم العقد كاملاً';
    updateContractNumPrefix();
  }
}
function onContractNumInput(inp){
  if(numMode==='auto'){
    // Auto mode: the field only holds the last 3 digits, chosen by the user
    inp.value=inp.value.replace(/\D/g,'').slice(0,3);
  }
  // Manual mode: no formatting/prefix restriction — the user may type the full contract number as-is
}


