import {CONFIG} from './config.js';
import './core.js';
let credential='', demoUser='student-a';
const KEY='inf03-demo-v1';
export const isDemo=CONFIG.DEMO_MODE;
export function setCredential(value){credential=value;sessionVersion++;readCache.clear();pendingReads.clear();}
export function setDemoUser(value){demoUser=value;sessionVersion++;clearReadCache();}
export function resetDemoData(){if(!isDemo)throw Error('Reset jest dostępny tylko w demo.');localStorage.removeItem(KEY);}
let content;
export function setContent(value){content=value;}
function initial(){const s=AcademyCore.blank(),date=new Date().toISOString();s.CLASSES=[{classId:'class-demo',name:'3 TI · demo',teacher:'teacher@example.test',schoolYear:'2026/2027',active:true}];s.USERS=[['student-a','Aleksandra','STUDENT'],['student-b','Michał','STUDENT'],['teacher','Nauczyciel','TEACHER'],['admin','Administrator','ADMIN']].map(([id,name,role])=>({userId:id,email:id==='teacher'?'teacher@example.test':id+'@example.test',name,role,class:role==='STUDENT'?'class-demo':'',active:true,createdAt:date,lastLogin:''}));return s;}
// Serialize requests from this tab. BUSY is emitted before the backend runs
// the action, so only that error can safely trigger automatic write retries.
export function createRequestQueue(wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))) {
  let tail=Promise.resolve();
  return task=>{
    const result=tail.then(async()=>{
      for(let attempt=0;;attempt++){
        try{return await task();}
        catch(e){if(e.code!=='BUSY'||attempt>=2)throw e;await wait(1000*(attempt+1));}
      }
    });
    tail=result.catch(()=>{});
    return result;
  };
}
const enqueue=createRequestQueue();
let sessionVersion=0;
const readCache=new Map(),pendingReads=new Map();
let cacheVersion=0;
export function clearReadCache(){cacheVersion++;readCache.clear();pendingReads.clear();}
const cachedActions=new Set(['getStudentDashboard','getTests','getTestsPage','getTeacherDashboard','getStudentStats','getChecklist']);
export function seedDashboard(value){if(value)readCache.set('getStudentDashboard:{}',{value,until:Date.now()+60000});}
export function api(action,payload={}) {
  const key=action+':'+JSON.stringify(payload),read=action.startsWith('get')||action==='resumeTest';
  if(cachedActions.has(action)&&readCache.get(key)?.until>Date.now())return Promise.resolve(structuredClone(readCache.get(key).value));
  if(read&&pendingReads.has(key))return pendingReads.get(key);
  if(!read)clearReadCache();
  const session=sessionVersion,cache=cacheVersion,requestCredential=credential;
  const execute=()=>{
    if(session!==sessionVersion){const e=Error('Sesja zmieniła się. Ponów operację po zalogowaniu.');e.code='UNAUTHORIZED';throw e;}
    return sendRequest(action,payload,requestCredential);
  };
  const result=(isDemo?execute():enqueue(execute)).then(value=>{
    if(session!==sessionVersion){const e=Error('Sesja zmieniła się. Zaloguj się ponownie.');e.code='UNAUTHORIZED';throw e;}
    if(session===sessionVersion){if(!read)clearReadCache();else if(cache===cacheVersion&&cachedActions.has(action))readCache.set(key,{value:structuredClone(value),until:Date.now()+60000});}
    return value;
  }).finally(()=>{if(pendingReads.get(key)===result)pendingReads.delete(key);});
  if(read)pendingReads.set(key,result);
  return result;
}
async function sendRequest(action,payload={},requestCredential=credential) {
  if(isDemo){const state=JSON.parse(localStorage.getItem(KEY)||'null')||initial();const actor=state.USERS.find(u=>u.userId===demoUser);const result=AcademyCore.run(state,actor,action,payload,content,{now:Date.now,uuid:()=>crypto.randomUUID(),random:Math.random});localStorage.setItem(KEY,JSON.stringify(state));return structuredClone(result);}
  if(!CONFIG.apiUrl||!CONFIG.googleClientId)throw Error('Brak konfiguracji. Uzupełnij js/config.js zgodnie z instrukcją instalacji.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),CONFIG.requestTimeout);
  try {const response=await fetch(CONFIG.apiUrl,{method:'POST',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,payload,credential:requestCredential}),signal:controller.signal});const result=await response.json();if(!result.success){const e=Error(result.error.message);e.code=result.error.code;throw e;}return result.data;}
  catch(e){if(e.code)throw e;throw Error('Postęp nie został jeszcze zsynchronizowany. Sprawdź sieć i ponów operację.');}finally{clearTimeout(timer);}
}
