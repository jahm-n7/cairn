import React, { createContext, useContext, useState } from 'react';
import {
  friends as SEED_FRIENDS,
  circles as SEED_CIRCLES,
  pending as SEED_PENDING,
  Friend,
  Circle as CircleT,
  Pending,
} from './profile';

// Shared, in-session store for friends / pending requests / circles so the
// inline panel on the profile "Amis" slide and the friend/circle detail
// overlays stay in sync.
type Ctx = {
  friends: Friend[];
  pending: Pending[];
  circles: CircleT[];
  acceptPending: (id: string) => void;
  declinePending: (id: string) => void;
  removeFriend: (id: string) => void;
  toggleBlock: (id: string) => void;
  saveCircle: (input: { id: string | null; name: string; color: string; members: string[] }) => void;
  deleteCircle: (id: string) => void;
};

const FriendsContext = createContext<Ctx | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>(SEED_FRIENDS);
  const [pending, setPending] = useState<Pending[]>(SEED_PENDING);
  const [circles, setCircles] = useState<CircleT[]>(SEED_CIRCLES);

  const acceptPending = (id: string) => {
    const p = pending.find((x) => x.id === id);
    if (!p) return;
    setPending((prev) => prev.filter((x) => x.id !== id));
    setFriends((prev) =>
      prev.concat([{ id: 'f' + Date.now(), name: p.name, initials: p.initials, color: p.color, since: '2026', shared: 0, received: 0, circles: [] }])
    );
  };
  const declinePending = (id: string) => setPending((prev) => prev.filter((x) => x.id !== id));
  const removeFriend = (id: string) => setFriends((prev) => prev.filter((x) => x.id !== id));
  const toggleBlock = (id: string) => setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, blocked: !f.blocked } : f)));

  const saveCircle = ({ id, name, color, members }: { id: string | null; name: string; color: string; members: string[] }) => {
    let cid = id;
    if (cid) {
      setCircles((prev) => prev.map((c) => (c.id === cid ? { ...c, name, color } : c)));
    } else {
      cid = 'cir' + Date.now();
      setCircles((prev) => prev.concat([{ id: cid!, name, color, desc: '' }]));
    }
    setFriends((prev) =>
      prev.map((f) => {
        const should = members.includes(f.id);
        const has = f.circles.includes(cid!);
        if (should && !has) return { ...f, circles: f.circles.concat([cid!]) };
        if (!should && has) return { ...f, circles: f.circles.filter((x) => x !== cid) };
        return f;
      })
    );
  };

  const deleteCircle = (id: string) => {
    setCircles((prev) => prev.filter((c) => c.id !== id));
    setFriends((prev) => prev.map((f) => ({ ...f, circles: f.circles.filter((x) => x !== id) })));
  };

  return (
    <FriendsContext.Provider value={{ friends, pending, circles, acceptPending, declinePending, removeFriend, toggleBlock, saveCircle, deleteCircle }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends(): Ctx {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within a FriendsProvider');
  return ctx;
}
