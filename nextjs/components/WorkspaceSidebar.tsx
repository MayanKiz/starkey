'use client';

import { Hash, LockKeyhole, LogOut, MessageCircle, ShieldCheck, Trash2 } from 'lucide-react';

export function WorkspaceSidebar({ privateOpen, onCommunity, onPrivate, onLock, onDelete }: { privateOpen: boolean; onCommunity: () => void; onPrivate: () => void; onLock: () => void; onDelete: () => void }) {
 return <aside className="sidebar"><div className="workspace-brand"><span><ShieldCheck size={16}/></span> VEILROOM</div><div className="identity-status"><i/> identity online</div><nav><button className={!privateOpen ? 'active' : ''} onClick={onCommunity}><Hash/> Community room <b>01</b></button><button className={privateOpen ? 'active' : ''} onClick={onPrivate} disabled={!privateOpen}><MessageCircle/> Private channel <b>{privateOpen ? '01' : '—'}</b></button></nav><div className="sidebar-note"><LockKeyhole size={15}/><p>No directories.<br/>No public profiles.<br/>Only intentional access.</p></div><div className="sidebar-bottom"><button onClick={onLock}><LogOut/> Lock session</button><button className="danger" onClick={onDelete}><Trash2/> Delete identity</button></div></aside>;
}