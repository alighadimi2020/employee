const SYSTEM_KEY="arioTjaratSystemData";
const ATTENDANCE_CHECKIN_URL="https://alighadimi2020.github.io/ariotejarat-employees/attendance/checkin.html";

const initialData={
  employees:[
    {id:"poor",name:"آقای پور مسعودی",role:"کارمند",username:"poor",score:null,activeSeconds:0,callSeconds:0,attendancePercent:null,optimization:null,status:"unknown",strengths:[],improvements:[]},
    {id:"ghadimi",name:"آقای قدیمی",role:"کارمند",username:"ghadimi",score:null,activeSeconds:0,callSeconds:0,attendancePercent:null,optimization:null,status:"unknown",strengths:[],improvements:[]},
    {id:"chegini",name:"خانم چگینی",role:"کارمند",username:"chegini",score:null,activeSeconds:0,callSeconds:0,attendancePercent:null,optimization:null,status:"unknown",strengths:[],improvements:[]}
  ],
  reports:[],
  attendance:[]
};

function cloneInitial(){return JSON.parse(JSON.stringify(initialData))}
function todayKey(date=new Date()){return date.toISOString().slice(0,10)}
function faDate(date=new Date()){return new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
function faTime(date=new Date()){return new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(date)}
function nowISO(date=new Date()){return date.toISOString()}
function makeId(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function formatDuration(sec=0){sec=Math.max(0,Number(sec)||0);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`}
function statusLabel(v){return v==="present"?"حاضر":v==="checked-out"?"خارج شده":"ثبت نشده"}

function normalizeAttendance(data){
  const rows=Array.isArray(data.attendance)?data.attendance:[];
  const grouped={};
  rows.forEach(row=>{
    if(row.checkIn||row.checkOut){
      const key=`${row.employeeId}|${row.dateKey||row.date||""}`;
      grouped[key]=row;
      return;
    }
    const key=`${row.employeeId}|${row.dateKey||row.date||""}`;
    const current=grouped[key]||{id:makeId(),employeeId:row.employeeId,employeeName:row.employeeName,dateKey:row.dateKey||null,date:row.date,checkIn:null,checkOut:null,source:"qr"};
    if(row.type==="in"&&!current.checkIn)current.checkIn={time:row.time,at:row.createdAt||null};
    if(row.type==="out"&&!current.checkOut)current.checkOut={time:row.time,at:row.createdAt||null};
    grouped[key]=current;
  });
  data.attendance=Object.values(grouped);
  return data;
}

function getSystemData(){
  const raw=localStorage.getItem(SYSTEM_KEY);
  if(!raw){const fresh=cloneInitial();localStorage.setItem(SYSTEM_KEY,JSON.stringify(fresh));return fresh}
  try{
    const data=normalizeAttendance(JSON.parse(raw));
    if(!Array.isArray(data.employees))data.employees=cloneInitial().employees;
    if(!Array.isArray(data.reports))data.reports=[];
    localStorage.setItem(SYSTEM_KEY,JSON.stringify(data));
    return data;
  }catch{
    const fresh=cloneInitial();localStorage.setItem(SYSTEM_KEY,JSON.stringify(fresh));return fresh;
  }
}
function saveSystemData(data){localStorage.setItem(SYSTEM_KEY,JSON.stringify(data))}
function getEmployee(id){return getSystemData().employees.find(e=>e.id===id)}
function getCurrentEmployee(){const s=getSession();return s?.role==="employee"?getEmployee(s.employeeId):null}
function getTodayAttendance(employeeId){return getSystemData().attendance.filter(x=>x.employeeId===employeeId&&x.dateKey===todayKey())}
function getTodayAttendanceRecord(employeeId){return getTodayAttendance(employeeId)[0]||null}

function processAttendance(employeeId){
  const data=getSystemData();
  const employee=data.employees.find(e=>e.id===employeeId);
  if(!employee)return {ok:false,action:"error",message:"کارمند پیدا نشد."};
  const now=new Date();
  const key=todayKey(now);
  const date=faDate(now);
  const time=faTime(now);
  let record=data.attendance.find(x=>x.employeeId===employeeId&&x.dateKey===key);

  if(!record){
    record={id:makeId(),employeeId,employeeName:employee.name,dateKey:key,date,checkIn:{time,at:nowISO(now)},checkOut:null,source:"printed-qr"};
    data.attendance.push(record);
    employee.status="present";
    saveSystemData(data);
    return {ok:true,action:"check-in",record,message:`ورود شما در ساعت ${time} با موفقیت ثبت شد.`};
  }

  if(!record.checkIn){
    record.checkIn={time,at:nowISO(now)};
    employee.status="present";
    saveSystemData(data);
    return {ok:true,action:"check-in",record,message:`ورود شما در ساعت ${time} با موفقیت ثبت شد.`};
  }

  if(!record.checkOut){
    record.checkOut={time,at:nowISO(now)};
    employee.status="checked-out";
    saveSystemData(data);
    return {ok:true,action:"check-out",record,message:`خروج شما در ساعت ${time} با موفقیت ثبت شد.`};
  }

  return {ok:false,action:"completed",duplicate:true,record,message:`حضور امروز شما کامل شده است. ورود: ${record.checkIn.time} — خروج: ${record.checkOut.time}`};
}
