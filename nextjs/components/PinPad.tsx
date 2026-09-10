'use client';

import { Delete, KeyRound, LockKeyhole } from 'lucide-react';

export function PinPad({ pin, length, onChange }: { pin: string; length: number; onChange: (pin: string) => void }) {
  const press = (key: string) => {
    if (key === 'del') onChange(pin.slice(0, -1));
    else if (pin.length < length) onChange(pin + key);
  };
  return <div className="pinbox">
    <div className="pinbox-head"><div className="iconbox"><KeyRound size={18}/></div><div><span className="label">MEMBER ACCESS</span><h2>Welcome back.</h2></div></div>
    <p className="muted">Enter your {length}-digit Secret PIN to enter the community.</p>
    <div className="pin-dots">{Array.from({length}, (_, i) => <span key={i} className={pin.length > i ? 'filled' : ''}/>)}</div>
    <div className="keypad">{['1','2','3','4','5','6','7','8','9','','0','del'].map((key, i) => key === '' ? <span key={i}/> : <button key={i} onClick={() => press(key)}>{key === 'del' ? <Delete size={16}/> : key}</button>)}</div>
    <div className="privacy-line"><LockKeyhole size={13}/> PIN protected · nickname first</div>
  </div>;
}