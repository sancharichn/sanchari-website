
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  setDoc,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { Member, TravelEvent, Registration, SavedMOM } from "./types";

// NOTE: In a real production environment, you would replace these with your 
// specific Firebase project configuration from the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyAs-PLACEHOLDER",
  authDomain: "sanchari-chennai.firebaseapp.com",
  projectId: "sanchari-chennai",
  storageBucket: "sanchari-chennai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Real-time Listeners ---

export const subscribeToMembers = (callback: (members: Member[]) => void) => {
  return onSnapshot(collection(db, "members"), (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
    callback(members);
  });
};

export const subscribeToEvents = (callback: (events: TravelEvent[]) => void) => {
  return onSnapshot(collection(db, "events"), (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TravelEvent));
    callback(events);
  });
};

export const subscribeToRegistrations = (callback: (regs: Registration[]) => void) => {
  return onSnapshot(collection(db, "registrations"), (snapshot) => {
    const regs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    callback(regs);
  });
};

// --- CRUD Operations ---

export const addRegistration = async (reg: Partial<Registration>) => {
  const data = {
    ...reg,
    timestamp: new Date().toISOString()
  };
  return await addDoc(collection(db, "registrations"), data);
};

export const updateMemberProfile = async (memberId: string, updates: Partial<Member>) => {
  const memberRef = doc(db, "members", memberId);
  return await updateDoc(memberRef, updates);
};

export const createEvent = async (event: Partial<TravelEvent>) => {
  return await addDoc(collection(db, "events"), event);
};

export const registerNewMember = async (member: Member) => {
  // Use email or custom ID as doc ID to prevent duplicates
  const memberRef = doc(db, "members", member.id);
  return await setDoc(memberRef, member);
};

// --- Bootstrapping / Seeding ---

export const seedDatabase = async (initialMembers: Member[], initialEvents: TravelEvent[]) => {
  const membersSnap = await getDocs(collection(db, "members"));
  if (membersSnap.empty) {
    console.log("Seeding members...");
    for (const member of initialMembers) {
      await setDoc(doc(db, "members", member.id), member);
    }
  }

  const eventsSnap = await getDocs(collection(db, "events"));
  if (eventsSnap.empty) {
    console.log("Seeding events...");
    for (const event of initialEvents) {
      await setDoc(doc(db, "events", event.id), event);
    }
  }
};
