/* ═══ 5B Mall — Tabligh (كتاب تبليغ) ═══ */
/* ══════════════════════ TABLIGH (NOTIFICATION) PAGE ══════════════════════ */
function openTabligh(id, year){
  const c=contracts.find(x=>x.id===id);
  if(!c){showToast('العقد غير موجود',true);return;}
  
  // Use year-specific rent if year provided and rentYears has that entry
  const totalRent=year&&c.rentYears&&c.rentYears[year]!==undefined
    ? parseFloat(c.rentYears[year])||0
    : getTotalRent(c);
  const notifyYear=year||(c.expiry?c.expiry.split('-')[0]:'');
  
  const today=new Date();
  const dateStr=today.getDate().toString().padStart(2,'0')+'/'+(today.getMonth()+1).toString().padStart(2,'0')+'/'+today.getFullYear();
  const svcAmt=Math.round(totalRent*(c.svcRate??10)/100);
  const knwAmt=Math.round(totalRent*(c.knwRate??2)/100);
  const taxAmt=Math.round(svcAmt*(c.taxRate??16)/100);
  const grandTotal=totalRent+svcAmt+knwAmt+taxAmt;
  
  const allPayments=c.payments||[];
  // Filter payments by notifyYear if available
  const payments=notifyYear
    ? allPayments.filter(p=>p.date&&p.date.includes(notifyYear))
    : allPayments;
  let paymentRows='';
  if(payments.length){
    const labels=['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة'];
    payments.forEach((p,i)=>{
      const label=labels[i]||('الدفعة '+(i+1));
      paymentRows+=`<tr><td>${label}</td><td>${(p.amount||0).toLocaleString()}</td><td>${p.date||'—'}</td></tr>`;
    });
  }else{
    // Auto-generate payments based on year-specific grandTotal
    const numPay=c.numPayments||4;
    const payAmt=Math.round(grandTotal/numPay);
    const yearStart=notifyYear?new Date(notifyYear+'-01-01'):today;
    const labels=['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة'];
    for(let i=0;i<numPay;i++){
      const d=new Date(yearStart);
      d.setMonth(d.getMonth()+Math.round((i/numPay)*12));
      const dStr=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
      paymentRows+=`<tr><td>${labels[i]||'الدفعة '+(i+1)}</td><td>${payAmt.toLocaleString()}</td><td>${dStr}</td></tr>`;
    }
  }
  
  const investor=c.inv||'المستأجر';
  const locationCode=c.locationCode||'—';
  const contractNum=c.num||'—';
  
  const tablighHTML=`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تبليغ ${notifyYear?notifyYear+' - ':''}- ${contractNum}</title>
<style>
  @page{size:A4;margin:15mm;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;padding:40px;line-height:1.8;color:#000;background:#fff;}
  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a5276;padding-bottom:20px;margin-bottom:30px;}
  .company-name{font-size:24px;font-weight:bold;color:#1a5276;}
  .company-en{font-size:16px;color:#666;}
  .mall-name{font-size:18px;color:#2980b9;}
  .logo-placeholder{width:100px;height:80px;background:#f0f0f0;border:2px solid #1a5276;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:bold;color:#1a5276;}
  .info-row{display:flex;justify-content:space-between;margin-bottom:15px;font-size:16px;}
  .info-row .label{font-weight:bold;color:#333;}
  .recipient{margin:20px 0;font-size:16px;}
  .recipient .title{font-weight:bold;}
  .greeting{margin:25px 0;font-size:16px;font-weight:bold;}
  .body-text{margin:20px 0;font-size:16px;line-height:2;}
  .body-text strong{color:#1a5276;}
  table{width:100%;border-collapse:collapse;margin:20px 0;font-size:15px;}
  table th,table td{border:1px solid #333;padding:10px 12px;text-align:center;}
  table th{background:#1a5276;color:white;font-weight:bold;}
  table tr:nth-child(even){background:#f5f5f5;}
  .closing{margin-top:40px;font-size:16px;line-height:2;}
  .signature{margin-top:60px;font-size:16px;}
  .footer{margin-top:60px;padding-top:15px;border-top:2px solid #1a5276;font-size:13px;color:#666;text-align:center;}
  @media print{
    body{padding:20px;}
    .no-print{display:none;}
  }
</style>
</head>
<body>
<div class="no-print" style="text-align:center;margin-bottom:20px;">
  <button onclick="window.print()" style="padding:10px 30px;background:#1a5276;color:white;border:none;cursor:pointer;font-size:16px;border-radius:5px;">طباعة</button>
  <button onclick="window.close()" style="padding:10px 30px;background:#c0392b;color:white;border:none;cursor:pointer;font-size:16px;border-radius:5px;margin-right:10px;">إغلاق</button>
</div>


<div class="header">
  <div>
    <div class="company-name">شركة فارنا للاستيراد والتصدير</div>
    <div class="company-en">Varna Co. Import & Export</div>
    <div class="mall-name">5B MALL</div>
  </div>
  <div class="logo-placeholder">5B</div>
</div>


<div class="info-row">
  <div><span class="label">التاريخ:</span> ${dateStr}</div>
  <div><span class="label">رقم العقد:</span> ${contractNum}</div>


</div>
${c.month?`<div class="info-row"><div><span class="label">شهر الاستحقاق:</span> <strong style="color:#1a5276">${['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][parseInt(c.month)]||c.month} ${notifyYear||''}</strong></div></div>`:''}


<div class="recipient">
  <span class="title">إلى السيد:</span> ${investor} - المستأجر
</div>


<div class="greeting">تحية طيبة وبعد،</div>


<div class="body-text">
  نود إعلامكم بأن تاريخ استحقاق العقد المذكور أعلاه هو ${c.month?`<strong style="color:#1a5276">${['','يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][parseInt(c.month)]||c.month} ${notifyYear||''}</strong>`:(notifyYear||'—')}، وقيمته الإجمالية كما هو موضح أدناه:
</div>


<table>
  <thead>
    <tr>
      <th>قيمة الإيجار</th>
      <th>2% ضرائب المعارف</th>
      <th>${(c.svcRate??10)}% خدمات</th>
      <th>16% ضريبة مبيعات</th>
      <th>الإجمالي</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${totalRent.toLocaleString()}</td>
      <td>${knwAmt.toLocaleString()}</td>
      <td>${svcAmt.toLocaleString()}</td>
      <td>${taxAmt.toLocaleString()}</td>
      <td><strong>${grandTotal.toLocaleString()}</strong></td>
    </tr>
  </tbody>
</table>


<div class="body-text">
  سيتم تزويدكم بفواتير المبيعات في تاريخ الاستحقاق، على أن المبلغ الإجمالي للإيجار لمفم مقدرًا بواقع ${payments.length||(c.numPayments||4)} دفعات حسب المخطط عليه نقدًا بموجب:
</div>


<table>
  <thead>
    <tr>
      <th>الدفعة</th>
      <th>المبلغ</th>
      <th>تاريخ الاستحقاق</th>
    </tr>
  </thead>
  <tbody>
    ${paymentRows}
  </tbody>
</table>


<div class="closing">
  إجراءاتكم، لطفاً<br>
  وتفضلوا بقبول فائق الاحترام،
</div>


<div class="signature">
  شركة فارنا للاستيراد والتصدير
</div>


<div class="footer">
  5B Mall - Al Quds St - Amman - Jordan<br>
  www.5bmalls.com - info@5bmalls.com<br>
  +962 642 022 25 - +962 796 016 688
</div>
</body>
</html>`;
  
  const newWindow=window.open('','_blank','width=800,height=1000');
  if(newWindow){
    newWindow.document.write(tablighHTML);
    newWindow.document.close();
  }else{
    showToast('يرجى السماح بفتح النوافذ المنبثقة',true);
  }
}


function resetAttachments() {
  siteImageBase64 = '';
  siteImageName_ = '';
  pdfBase64 = '';
  pdfFileName_ = '';
  editRemovedImage = false;
  editRemovedPdf = false;
  removeSiteImage();
  removePdf();
}


