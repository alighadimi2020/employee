const USERS={
  m5069:{password:"m5069",role:"manager"},
  poor:{password:"poor",role:"employee",employeeId:"poor"},
  ghadimi:{password:"ghadimi",role:"employee",employeeId:"ghadimi"},
  chegini:{password:"chegini",role:"employee",employeeId:"chegini"}
};
const SESSION_KEY="arioTjaratSession";
function setSession(user){localStorage.setItem(SESSION_KEY,JSON.stringify(user))}
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY)||"null")}catch{return null}}
function logout(){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);location.href="../index.html"}
const form=document.getElementById("loginForm");
if(form){
  const existing=getSession();
  if(existing)location.href=existing.role==="manager"?"manager/index.html":"employee/index.html";
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const username=document.getElementById("username").value.trim().toLowerCase();
    const password=document.getElementById("password").value;
    const user=USERS[username],error=document.getElementById("loginError");
    if(!user||user.password!==password){error.textContent="نام کاربری یا رمز عبور صحیح نیست.";return}
    setSession({username,role:user.role,employeeId:user.employeeId||null,loginAt:new Date().toISOString()});
    location.href=user.role==="manager"?"manager/index.html":"employee/index.html";
  });
}
function requireRole(role){
  const s=getSession();
  if(!s){location.replace("../index.html");return null}
  if(s.role!==role){location.replace(s.role==="manager"?"../manager/index.html":"../employee/index.html");return null}
  return s
}
