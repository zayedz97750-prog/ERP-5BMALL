/* ══════════════════════════════════════════════════════
   5B Mall — Firebase Sync
   ملف: js/firebase.js
   ══════════════════════════════════════════════════════ */

/* ══════════════════════ FIREBASE SYNC ══════════════════════ */
// Realtime Database sync: every save also pushes to Firebase, and on load/boot
// the latest cloud copy is pulled down so all devices/users share the same data.
const firebaseConfig = {
  apiKey: "AIzaSyDhxvT87RF_ASU1WjFv4a68xtjPa0L9Ts8",
  authDomain: "bmalls-contract-managemen.firebaseapp.com",
  databaseURL: "https://bmalls-contract-managemen-default-rtdb.firebaseio.com",
  projectId: "bmalls-contract-managemen",
  storageBucket: "bmalls-contract-managemen.firebasestorage.app",
  messagingSenderId: "539225926334",
  appId: "1:539225926334:web:bae7f2a96397277d494cef",
  measurementId: "G-TVVQ4NKBCE"
};
let fbReady=false, fbDB=null, fbStorage=null;
try{
  if(window.firebase && firebase.initializeApp){
    firebase.initializeApp(firebaseConfig);
    try{firebase.analytics && firebase.analytics();}catch(e){/* analytics optional */}
    fbDB=firebase.database();
    fbStorage=firebase.storage();
    fbReady=true;
  }
}catch(e){console.warn('تعذر تهيئة Firebase، سيتم الاعتماد على التخزين المحلي فقط.',e);fbReady=false;}


function fbSet(path,data){
  if(!fbReady||!fbDB)return Promise.resolve(false);
  // Firebase rejects any value containing `undefined` — strip it via a JSON round-trip
  // so a missing/blank field (e.g. area, phone) never breaks the whole save.
  let clean=data;
  try{clean=data===undefined?null:JSON.parse(JSON.stringify(data));}catch(e){/* fall back to raw data */}
  return fbDB.ref(path).set(clean).then(()=>true).catch(e=>{console.warn('فشل حفظ البيانات على Firebase: '+path,e);return false;});
}
function fbDel(path){
  if(!fbReady||!fbDB)return Promise.resolve(false);
  return fbDB.ref(path).remove().then(()=>true).catch(e=>{console.warn('فشل حذف البيانات من Firebase: '+path,e);return false;});
}
function fbGetAll(path){
  if(!fbReady||!fbDB)return Promise.resolve(null);
  return fbDB.ref(path).once('value').then(snap=>snap.exists()?snap.val():null).catch(e=>{console.warn('فشل قراءة البيانات من Firebase: '+path,e);return null;});
}
// Pull the latest copy of each dataset from Firebase (if reachable) and overwrite
// the local cache, then refresh the UI if the app is already running.
let fbSyncPromise=Promise.resolve();
function syncAllFromFirebase(){
  if(!fbReady)return Promise.resolve(false);
  const paths=[
    ['contracts',SK_CONTRACTS],
    ['users',SK_USERS],
    ['services',SK_SERVICES],
    ['meterReadings',SK_METER_READINGS],
    ['servicePrices',SK_SERVICE_PRICES],
    ['floors',SK_FLOORS],
    ['zones',SK_ZONES],
    ['activities',SK_ACTIVITIES],
    ['siteLocations',SK_LOCATIONS],
    ['kambiyala',SK_KAMBIYALA],
    ['maintenance',SK_MAINT],
    ['buildings',SK_BUILDINGS]
  ];
  return Promise.all(paths.map(([p,key])=>fbGetAll(p).then(data=>{
    if(data==null)return;
    if(key===SK_KAMBIYALA){
      // Merge (union) local + cloud records by id so records created offline
      // or on another device are never lost during sync. Embedded legacy PDFs
      // are moved into the separate PDF bucket, never written back inline.
      let local=[];
      try{const s=localStorage.getItem(SK_KAMBIYALA);if(s)local=JSON.parse(s)||[];}catch(e){}
      if(!Array.isArray(local))local=[];
      if(!Array.isArray(data))data=Object.values(data||{});
      const map={};
      data.forEach(r=>{if(r&&r.id)map[r.id]={...r};});
      local.forEach(r=>{
        if(!r||!r.id)return;
        if(map[r.id]){Object.assign(map[r.id],r);}
        else{map[r.id]=r;}
      });
      const merged=Object.values(map);
      let dirtyPdf=false;
      merged.forEach(r=>{
        if(r&&(r.pdfData||r.pdfName)){kbSetPdf(r.id,r.pdfData||'',r.pdfName||'');delete r.pdfData;delete r.pdfName;dirtyPdf=true;}
      });
      try{localStorage.setItem(key,JSON.stringify(merged));}catch(e){}
      if(dirtyPdf)fbSet('kambiyala',merged);
    }else if(key===SK_BUILDINGS){
      // Merge buildings: union to prevent losing locally added building when offline
      let local=[];
      try{const s=localStorage.getItem(SK_BUILDINGS); if(s) local=JSON.parse(s)||[];}catch(e){}
      if(!Array.isArray(local)) local=[];
      if(!Array.isArray(data)) data=Object.values(data||{});
      const merged=[...new Set([...local, ...data].map(v=>String(v).trim()).filter(Boolean))];
      // keep original case as stored (uppercased) but deduplicate case-insensitively
      const seen=new Set(); const deduped=[];
      merged.forEach(v=>{
        const k=String(v).toUpperCase().trim();
        if(!seen.has(k)){ seen.add(k); deduped.push(String(v).trim().toUpperCase()); }
      });
      try{localStorage.setItem(key,JSON.stringify(deduped));}catch(e){}
      if(deduped.length!==data.length) fbSet('buildings', deduped);
    }else{
      try{localStorage.setItem(key,JSON.stringify(data));}catch(e){}
    }
  }))).then(()=>{
    contracts=loadContracts();users=loadUsers();services=loadServices();
    meterReadings=loadMeterReadings();
    locationsData=loadLocationsData();
    kambiyalaRecords=loadKambiyalaRecords();
    maintRecords=loadMaintRecords();
    if(typeof session!=='undefined'&&session&&document.getElementById('appShell')?.classList.contains('visible')){
      initApp();
    }
    return true;
  }).catch(e=>{console.warn('تعذرت مزامنة البيانات مع Firebase',e);return false;});
}
// Live sync: reflect changes made from other devices/users automatically
function startFirebaseLiveSync(){
  if(!fbReady||!fbDB)return;
  fbDB.ref('contracts').on('value',snap=>{
    if(!snap.exists())return;
    try{localStorage.setItem(SK_CONTRACTS,JSON.stringify(snap.val()));}catch(e){}
    contracts=loadContracts();
    if(document.getElementById('appShell')?.classList.contains('visible'))initApp();
  });
  fbDB.ref('users').on('value',snap=>{
    if(!snap.exists())return;
    try{localStorage.setItem(SK_USERS,JSON.stringify(snap.val()));}catch(e){}
    users=loadUsers();
    erpRefreshSession();
    renderDutyBanner();
    if(document.getElementById('page-admin')?.classList.contains('active'))renderUsers();
  });
  fbDB.ref('maintenance').on('value',snap=>{
    maintRecords=maintArray(snap.val());cacheMaintRecords();
    if(document.getElementById('page-maintenance')?.classList.contains('active'))renderMaintLog();
  },err=>console.warn('تعذرت مزامنة سجل الصيانة',err));
  fbDB.ref('kambiyala').on('value',snap=>{
    if(!snap.exists())return;
    const val=snap.val();
    const fbArr=(Array.isArray(val)?val:Object.values(val||{})).filter(Boolean).map(r=>{
      // Attached PDFs stay in the local PDF bucket — never inline in records
      if(r&&(r.pdfData||r.pdfName)){kbSetPdf(r.id,r.pdfData,r.pdfName);delete r.pdfData;delete r.pdfName;}
      return r;
    });
    kambiyalaRecords=fbArr;
    try{localStorage.setItem(SK_KAMBIYALA,JSON.stringify(kambiyalaRecords));}catch(e){}
    if(document.getElementById('page-kambiyala')?.classList.contains('active'))initKambiyalaPage();
    try{renderKambiyalaDashCard();}catch(e){}
    refreshKambiyalaAlerts();
  });
  fbDB.ref('buildings').on('value',snap=>{
    if(!snap.exists())return;
    const val=snap.val();
    const arr=Array.isArray(val)?val:Object.values(val||{});
    if(!arr.length) return;
    try{localStorage.setItem(SK_BUILDINGS,JSON.stringify(arr));}catch(e){}
    // refresh UI if on relevant pages
    try{renderBuildingsList();}catch(e){}
    try{refreshBuildingDropdowns();}catch(e){}
    // if contract modal is open, re-render location groups to show new building
    try{
      const modal=document.getElementById('modalBackdrop');
      if(modal&&modal.classList.contains('open')){
        // preserve current selections before re-render
        renderLocationGroups();
      }
    }catch(e){}
  });
}






