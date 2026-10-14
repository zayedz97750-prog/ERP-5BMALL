/* ═══ 5B Mall — Attachments (PDF / Images) ═══ */
/* ══════════════════════ FILE UPLOAD (Site Image + PDF) ══════════════════════ */
let siteImageBase64 = '';
let siteImageName_ = '';
let pdfBase64 = '';
let pdfFileName_ = '';
let editRemovedImage = false;
let editRemovedPdf = false;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB


function handleImgSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('يُسمح بملفات الصور فقط', true); return; }
  if (file.size > MAX_FILE_SIZE) { showToast('حجم الصورة يتجاوز 20 ميجابايت', true); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    siteImageBase64 = ev.target.result;
    siteImageName_ = file.name;
    const area = document.getElementById('imgDropArea');
    area.classList.add('has-file');
    // Add preview image
    let preview = area.querySelector('.img-preview');
    if (!preview) { preview = document.createElement('img'); preview.className = 'img-preview'; area.appendChild(preview); }
    preview.src = siteImageBase64;
    const fn = document.getElementById('imgFileName');
    fn.textContent = '✓ ' + file.name;
    fn.style.display = 'block';
    document.getElementById('imgRemoveBtn').style.display = 'inline-block';
    document.getElementById('imgUploadIcon')?.style && (document.getElementById('imgUploadIcon').style.display = 'none');
    document.querySelector('#imgDropArea .img-upload-text').style.display = 'none';
  };
  reader.readAsDataURL(file);
}


function handleImgDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  document.getElementById('siteImageInput').files = dt.files;
  handleImgSelect({ target: { files: dt.files } });
}


function removeSiteImage() {
  siteImageBase64 = '';
  siteImageName_ = '';
  editRemovedImage = true;
  document.getElementById('siteImageInput').value = '';
  const area = document.getElementById('imgDropArea');
  area.classList.remove('has-file');
  const preview = area.querySelector('.img-preview');
  if (preview) preview.remove();
  document.getElementById('imgFileName').style.display = 'none';
  document.getElementById('imgRemoveBtn').style.display = 'none';
  document.querySelector('#imgDropArea .img-upload-icon').style.display = '';
  document.querySelector('#imgDropArea .img-upload-text').style.display = '';
}


function handlePdfSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') { showToast('يُسمح بملفات PDF فقط', true); return; }
  if (file.size > MAX_FILE_SIZE) { showToast('حجم الملف يتجاوز 20 ميجابايت', true); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    pdfBase64 = ev.target.result;
    pdfFileName_ = file.name;
    document.getElementById('pdfDropArea').classList.add('has-file');
    const fn = document.getElementById('pdfFileName');
    fn.textContent = '✓ ' + file.name;
    fn.style.display = 'block';
    document.getElementById('pdfRemoveBtn').style.display = 'inline-block';
    document.querySelector('#pdfDropArea .pdf-upload-icon').style.display = 'none';
    document.querySelector('#pdfDropArea .pdf-upload-text').style.display = 'none';
  };
  reader.readAsDataURL(file);
}


function handleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  document.getElementById('pdfInput').files = dt.files;
  handlePdfSelect({ target: { files: dt.files } });
}


function removePdf() {
  pdfBase64 = '';
  pdfFileName_ = '';
  editRemovedPdf = true;
  document.getElementById('pdfInput').value = '';
  document.getElementById('pdfDropArea').classList.remove('has-file');
  document.getElementById('pdfFileName').style.display = 'none';
  document.getElementById('pdfRemoveBtn').style.display = 'none';
  document.querySelector('#pdfDropArea .pdf-upload-icon').style.display = '';
  document.querySelector('#pdfDropArea .pdf-upload-text').style.display = '';
}


async function openPdf(id) {if(!erpRequire('contracts','attachments'))return;
  showToast('جاري تحميل الملف...');
  const att=await getAttachment(id,'pdfData');
  if(!att||!att.data){showToast('لا يوجد PDF مرفق',true);return;}
  try{
    let base64=att.data;
    if(base64.indexOf(',')>=0)base64=base64.split(',')[1];
    const byteStr=atob(base64);
    const arr=new Uint8Array(byteStr.length);
    for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);
    const blob=new Blob([arr],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.target='_blank';
    link.rel='noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){
    console.error('openPdf error',e);
    showToast('فشل فتح الملف: '+e.message,true);
  }
}


async function openSiteImage(id) {if(!erpRequire('contracts','attachments'))return;
  showToast('جاري تحميل الصورة...');
  const att=await getAttachment(id,'siteImage');
  if(!att||!att.data){showToast('لا توجد صورة مرفقة',true);return;}
  try{
    let base64=att.data;
    let mimeType='image/jpeg';
    if(base64.indexOf(',')>=0){
      const match=base64.match(/^data:([^;]+);base64,/);
      if(match)mimeType=match[1];
      base64=base64.split(',')[1];
    }
    const byteStr=atob(base64);
    const arr=new Uint8Array(byteStr.length);
    for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);
    const blob=new Blob([arr],{type:mimeType});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.target='_blank';
    link.rel='noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){
    console.error('openSiteImage error',e);
    showToast('فشل فتح الصورة: '+e.message,true);
  }
}


