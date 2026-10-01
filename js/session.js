// Credentials stay in tab-scoped storage; never in localStorage or URLs.
// Client expiry checks are only for UX. The backend verifies every credential.
const KEY='inf03-tab-session-v1';
export function tokenExpiry(token){try{const p=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return typeof p.exp==='number'?p.exp*1000:0;}catch{return 0;}}
export function createSessionBridge({storage,channel,now=Date.now,onLogout=()=>{},waitMs=700}){
 let current='',generation=0;
 const pending=new Map();
 const valid=t=>typeof t==='string'&&tokenExpiry(t)>now()+15000;
 function read(){try{return storage?.getItem(KEY)||'';}catch{return '';}}
 function write(t){try{if(t)storage?.setItem(KEY,t);else storage?.removeItem(KEY);}catch{}}
 function post(message){try{channel?.postMessage(message);}catch{}}
 function clear(){generation++;current='';write('');for(const p of pending.values())p.finish('');pending.clear();}
 function remember(token){if(valid(token)){current=token;write(token);}else{current='';write('');}}
 if(channel)channel.onmessage=({data:m})=>{
  if(!m||typeof m!=='object')return;
  if(m.type==='logout'){clear();onLogout();}
  if(m.type==='request'&&typeof m.id==='string'&&valid(current))post({type:'reply',id:m.id,token:current});
  if(m.type==='reply'&&valid(m.token))pending.get(m.id)?.tokens.add(m.token);
 };
 async function restore(){
  const stored=read();if(valid(stored)){current=stored;return stored;}
  write('');current='';if(!channel)return '';
  const version=generation,id=crypto.randomUUID();
  return new Promise(resolve=>{
   let timer;const tokens=new Set();
   const finish=value=>{clearTimeout(timer);pending.delete(id);resolve(version===generation?value:'');};
   pending.set(id,{tokens,finish});
   timer=setTimeout(()=>{
    // If different accounts are open, let the user choose instead of guessing.
    const bySubject=new Map();
    for(const token of tokens){try{const p=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));bySubject.set(p.sub,token);}catch{}}
    const token=bySubject.size===1?[...bySubject.values()][0]:'';
    if(version===generation&&token)remember(token);
    finish(token);
   },waitMs);
   post({type:'request',id});
  });
 }
 return {remember,restore,clear,logout(){clear();post({type:'logout'});},close(){clear();channel?.close();}};
}
let storage,channel;
try{storage=globalThis.sessionStorage;}catch{}
try{if(typeof window!=='undefined'&&typeof BroadcastChannel!=='undefined')channel=new BroadcastChannel('inf03-session-v1');}catch{}
export const session=createSessionBridge({storage,channel,onLogout:()=>globalThis.dispatchEvent?.(new Event('inf03-session-ended'))});
