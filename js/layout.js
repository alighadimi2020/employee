function renderLayout(active,role){
  const side=document.getElementById("sidebar");
  if(!side)return;
  const manager=role==="manager";
  const session=getSession();
  const employeeName=session?.role==="employee"?getEmployee(session.employeeId)?.name:"مدیر کل";
  side.innerHTML=`
    <div class="side-brand">Ario <span>Tjarat</span></div>
    <div class="user-mini">
      <div class="avatar">${manager?"M":"پ"}</div>
      <div><strong>${employeeName}</strong><span>${manager?"مدیریت سازمان":"کارمند"}</span></div>
    </div>
    <nav>
      ${manager?`
      <a class="${active==="dashboard"?"active":""}" href="index.html">⌂ <span>داشبورد</span></a>
      <a class="${active==="employees"?"active":""}" href="employees.html">◉ <span>کارکنان</span></a>
      <a class="${active==="reports"?"active":""}" href="reports.html">▤ <span>گزارش‌های کاری</span></a>
      <a class="${active==="attendance"?"active":""}" href="attendance.html">◷ <span>حضور و غیاب</span></a>
      <a class="${active==="attendance-qr"?"active":""}" href="attendance-qr.html">▣ <span>QR حضور</span></a>`:`
      <a class="${active==="dashboard"?"active":""}" href="index.html">⌂ <span>داشبورد من</span></a>
      <a class="${active==="reports"?"active":""}" href="reports.html">▤ <span>گزارش‌های من</span></a>
      <a class="${active==="attendance"?"active":""}" href="attendance.html">◷ <span>حضور و غیاب</span></a>
      <a class="${active==="ranking"?"active":""}" href="ranking.html">↗ <span>رتبه‌بندی</span></a>
      <a class="${active==="profile"?"active":""}" href="profile.html">○ <span>پروفایل من</span></a>`}
    </nav>
    <div class="side-bottom"><button onclick="logout()">خروج از حساب</button><small>Ario Tjarat</small></div>`;
  document.getElementById("menuBtn")?.addEventListener("click",()=>side.classList.toggle("open"));
  document.getElementById("dateNow")?.replaceChildren(document.createTextNode(faDate()));
  document.getElementById("timeNow")?.replaceChildren(document.createTextNode(faTime()));
}
