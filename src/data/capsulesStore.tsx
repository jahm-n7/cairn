import React, { createContext, useContext, useState } from 'react';
import { myCapsules as SEED, MyCapsule, profile } from './profile';

// Shared, in-session store for the user's own capsules. Seeded with the mock
// list; the Deposit flow appends to it so newly buried capsules show up on the
// profile "Mes capsules" slide (and bump the "capsules laissées" count).
type Ctx = {
  myCapsules: MyCapsule[];
  addMyCapsule: (c: MyCapsule) => void;
  capsulesLeft: number;
};

const CapsulesContext = createContext<Ctx | null>(null);

export function CapsulesProvider({ children }: { children: React.ReactNode }) {
  const [caps, setCaps] = useState<MyCapsule[]>(SEED);
  const addMyCapsule = (c: MyCapsule) => setCaps((prev) => [c, ...prev]);
  const capsulesLeft = profile.capsulesLeft + (caps.length - SEED.length);

  return (
    <CapsulesContext.Provider value={{ myCapsules: caps, addMyCapsule, capsulesLeft }}>
      {children}
    </CapsulesContext.Provider>
  );
}

export function useCapsules(): Ctx {
  const ctx = useContext(CapsulesContext);
  if (!ctx) throw new Error('useCapsules must be used within a CapsulesProvider');
  return ctx;
}
