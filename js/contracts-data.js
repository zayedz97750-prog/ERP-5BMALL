/* ═══ 5B Mall — Contracts Data & Storage ═══ */
/* ══════════════════════ CONTRACTS DATA ══════════════════════ */
const SEED=[
  {id:'c1',num:'5B-2022-001',acct:'07-11600',inv:'شركة الحلم الكبير لتجارة الألبسة',brand:'One Minute',month:'January',term:15,start:'2023-01-01',expiry:'2038-05-26',rentYears:{'2023':150000,'2024':155000,'2025':160000,'2026':165000},taxRate:16,numPayments:2,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c2',num:'5B-2023-013',acct:'04-11600',inv:'مؤسسة رشاد محمد رشاد صدر',brand:'روان كيك',month:'January',term:9,start:'2024-01-01',expiry:'2032-12-31',rentYears:{'2024':75000,'2025':77000,'2026':80000},taxRate:16,numPayments:2,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c3',num:'5B-2023-004',acct:'27-11600',inv:'شركة اللور للتجارة العامة',brand:'Pizza Pai',month:'January',term:5,start:'2024-01-01',expiry:'2028-12-31',rentYears:{'2024':12000,'2025':12500,'2026':13000},taxRate:16,numPayments:4,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c4',num:'5B-2023-016',acct:'19-11600',inv:'شركة معروف للصناعات الغذائية',brand:'معروف كافيه',month:'January',term:5,start:'2024-01-01',expiry:'2028-12-31',rentYears:{'2024':40000,'2025':42000,'2026':44000},taxRate:16,numPayments:4,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c5',num:'5B-2023-019',acct:'26-11600',inv:'شركة الخماسية للاستثمارات السياحية',brand:'Hakouna Matata',month:'January',term:5,start:'2024-01-01',expiry:'2028-12-31',rentYears:{'2024':12000,'2025':12000,'2026':12000},taxRate:16,numPayments:2,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c10',num:'5B-2022-003',acct:'09-11600',inv:'الشركة العربية لتجهيزات الغذائية',brand:'Popeyes',month:'March',term:20,start:'2023-03-01',expiry:'2043-03-01',rentYears:{'2023':58000,'2024':60000,'2025':62000,'2026':64000},taxRate:16,numPayments:4,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c17',num:'5B-2025-053',acct:'53-11600',inv:'شركة سانجر للمطاعم السياحية',brand:'Charly',month:'May',term:10,start:'2025-05-01',expiry:'2035-05-01',rentYears:{'2025':88000,'2026':90000,'2027':92000},taxRate:16,numPayments:4,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c21',num:'5B-2023-014',acct:'17-11600',inv:'شركة فريتاون لتجارة الألبسة',brand:'T Mart',month:'July',term:15,start:'2023-07-01',expiry:'2038-06-30',rentYears:{'2023':95000,'2024':100000,'2025':105000,'2026':110000},taxRate:16,numPayments:4,status:'active',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c29',num:'5B-2023-004-M',acct:'08-11620',inv:'شركة اللور - مستودع',brand:'Pizza Pai WH',month:'August',term:1,start:'2025-08-01',expiry:'2026-08-01',rentYears:{'2025':1200,'2026':1200},taxRate:16,numPayments:1,status:'soon',type:'warehouse',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c33',num:'5B-2024-WH-01',acct:'90-11620',inv:'شركة الأمين للمواد الغذائية',brand:'Al Amin Warehouse',month:'March',term:3,start:'2024-03-01',expiry:'2027-03-01',rentYears:{'2024':18000,'2025':18000,'2026':18000},taxRate:16,numPayments:2,status:'active',type:'warehouse',delName:'',delPhone:'',finName:'',finPhone:'',notes:'',payments:[]},
  {id:'c31',num:'5B-2025-060-C',acct:'',inv:'السيد محمد صفوح عجاج',brand:'Smart Avenue',month:'February',term:5,start:'2025-02-01',expiry:'2030-02-01',rentYears:{'2025':12324,'2026':12500},taxRate:16,numPayments:2,status:'cancelled',type:'commercial',delName:'',delPhone:'',finName:'',finPhone:'',notes:'ملغي',payments:[]},
];


function loadContracts(){try{const s=localStorage.getItem(SK_CONTRACTS);if(s)return JSON.parse(s);}catch(e){}return[...SEED];}


/* ══════════════════════ ATTACHMENTS STORAGE (Firebase RTDB chunked) ══════════════════════ */
const _attCache={};
const MAX_ATT_SIZE=20*1024*1024;
const CHUNK_SIZE=9000000;


function saveAttachment(contractId,type,dataUrl,name){
  return new Promise(async(resolve)=>{
    if(!fbReady||!fbDB){resolve(false);return;}
    try{
      if(!dataUrl){resolve(false);return;}
      if(dataUrl.length>MAX_ATT_SIZE){showToast('حجم المرفق يتجاوز 20 ميجابايت',true);resolve(false);return;}
      const baseRef=fbDB.ref(`attachments/${contractId}/${type}`);
      if(dataUrl.length<=CHUNK_SIZE){
        await baseRef.set({data:dataUrl,name:name||'',chunks:1});
      }else{
        const totalChunks=Math.ceil(dataUrl.length/CHUNK_SIZE);
        const updates={name:name||'',chunks:totalChunks};
        for(let i=0;i<totalChunks;i++){
          updates['c'+i]=dataUrl.substring(i*CHUNK_SIZE,(i+1)*CHUNK_SIZE);
        }
        await baseRef.set(updates);
      }
      _attCache[contractId]=_attCache[contractId]||{};
      _attCache[contractId][type]={data:dataUrl,name};
      resolve(true);
    }catch(e){
      console.warn('saveAttachment error',e);
      showToast('فشل حفظ المرفق: '+e.message,true);
      resolve(false);
    }
  });
}


async function getAttachment(contractId,type){
  if(_attCache[contractId]?.[type])return _attCache[contractId][type];
  try{
    const snap=await fbDB.ref(`attachments/${contractId}/${type}`).once('value');
    if(snap.exists()){
      const d=snap.val();
      let fullData='';
      if(d.chunks&&d.chunks>1){
        for(let i=0;i<d.chunks;i++){fullData+=d['c'+i]||'';}
      }else{
        fullData=d.data||'';
      }
      if(fullData){
        _attCache[contractId]=_attCache[contractId]||{};
        _attCache[contractId][type]={data:fullData,name:d.name};
        return _attCache[contractId][type];
      }
    }
  }catch(e){console.warn('فشل تحميل المرفق',e);}
  return null;
}


function removeAttachment(contractId,type){
  if(fbReady&&fbDB)fbDB.ref(`attachments/${contractId}/${type}`).remove().catch(()=>{});
  if(_attCache[contractId])delete _attCache[contractId][type];
}


function deleteAllAttachments(contractId){
  if(fbReady&&fbDB)fbDB.ref(`attachments/${contractId}`).remove().catch(()=>{});
  delete _attCache[contractId];
}


function saveContractsLocal(){
  // Strip large attachment data before saving contracts
  const slim=contracts.map(c=>{const{siteImage,siteImageName,pdfData,pdfName,...rest}=c;return rest;});
  try{
    localStorage.setItem(SK_CONTRACTS,JSON.stringify(slim));
  }catch(e){
    console.warn('فشل حفظ العقود محلياً',e);
    showToast('تعذّر حفظ البيانات محلياً.',true);
  }
  fbSet('contracts',slim).then(ok=>{
    if(!ok)showToast('تعذّر مزامنة العقد مع السحابة (Firebase). تحقق من اتصال الإنترنت.',true);
  });
}
let contracts=loadContracts();


