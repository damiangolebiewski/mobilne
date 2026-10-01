import {session} from './session.js';
import {CONFIG} from './config.js';
import {api,setCredential,setDemoUser} from './api.js';
export async function loginDemo(id){setDemoUser(id);return api('auth',{bootstrap:true});}
export function logout(){session.logout();setCredential('');globalThis.google?.accounts.id.disableAutoSelect();}
export function mountGoogle(target,onSuccess,onError){
  if(!CONFIG.googleClientId){target.textContent='Logowanie wymaga Client ID w pliku js/config.js.';return;}
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
  script.onload=()=>{google.accounts.id.initialize({client_id:CONFIG.googleClientId,callback:async r=>{try{setCredential(r.credential);const profile=await api('auth',{bootstrap:true});session.remember(r.credential);await onSuccess(profile);}catch(e){session.clear();setCredential('');onError(e);}},auto_select:false});google.accounts.id.renderButton(target,{theme:'outline',size:'large',text:'signin_with',locale:'pl'});};
  script.onerror=()=>onError(Error('Nie można załadować logowania Google. Sprawdź połączenie.'));document.head.append(script);
}

export async function restoreLogin(){const token=await session.restore();if(!token)return null;setCredential(token);try{return await api('auth',{bootstrap:true});}catch(e){setCredential('');if(['UNAUTHORIZED','FORBIDDEN'].includes(e.code)){session.clear();return null;}throw e;}}
