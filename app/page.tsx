'use client';
import { useCallback, useState } from 'react';
import { AccessScreen } from '@/nextjs/components/AccessScreen';
import { AccountCreation } from '@/nextjs/components/AccountCreation';
import { ChatWorkspace } from '@/nextjs/components/ChatWorkspace';
import { WorkspaceSidebar } from '@/nextjs/components/WorkspaceSidebar';
import { User } from '@/lib/supabase';
export default function Home(){
 const [view,setView]=useState<'access'|'create'|'workspace'>('access');
 const [user,setUser]=useState<User|null>(null); const [privateOpen,setPrivateOpen]=useState(false);
 const access=useCallback((u:User)=>{setUser(u);setView('workspace')},[]);
 if(view==='create') return <AccountCreation onBack={()=>setView('access')} onCreated={()=>setView('access')}/>;
 if(view==='workspace'&&user) return <div className="app-frame"><WorkspaceSidebar privateOpen={privateOpen} onCommunity={()=>setPrivateOpen(false)} onPrivate={()=>setPrivateOpen(true)} onLock={()=>{setUser(null);setView('access')}} onDelete={()=>{setUser(null);setView('access')}}/><ChatWorkspace user={user} onLock={()=>{setUser(null);setView('access')}} onDelete={()=>{setUser(null);setView('access')}}/></div>;
 return <AccessScreen onCreate={()=>setView('create')} onAccess={access}/>;
}