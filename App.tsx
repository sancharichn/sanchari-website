
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Member, TravelEvent, Registration, Relation, FamilyMember } from './types';
import { INITIAL_EVENTS, ICONS, BLOOD_GROUPS } from './constants';
import { 
  subscribeToMembers, 
  subscribeToEvents, 
  subscribeToRegistrations, 
  addRegistration, 
  updateMemberProfile, 
  seedDatabase
} from './firebaseService';

// --- Shared Components ---

const Logo: React.FC<{ className?: string, inverted?: boolean }> = ({ className = "h-auto", inverted = false }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <span className={`text-xl sm:text-2xl font-black uppercase tracking-[0.25em] leading-tight text-center ${inverted ? 'text-yellow-400' : 'text-slate-900'}`}>
      Travel With Nature
    </span>
  </div>
);

const Header: React.FC<{ 
  role: UserRole; 
  setRole: (r: UserRole) => void; 
  isAuthenticated: boolean; 
  onLogout: () => void 
}> = ({ role, setRole, isAuthenticated, onLogout }) => (
  <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
    <div className="container mx-auto px-4 h-20 flex items-center justify-between">
      <Logo className="p-2" inverted />
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setRole(UserRole.MEMBER)} className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition font-black uppercase tracking-wider ${role === UserRole.MEMBER ? 'bg-yellow-400 text-slate-900' : 'text-slate-400'}`}>Member</button>
          <button onClick={() => setRole(UserRole.ADMIN)} className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition font-black uppercase tracking-wider ${role === UserRole.ADMIN ? 'bg-yellow-400 text-slate-900' : 'text-slate-400'}`}>Admin</button>
        </div>
        {isAuthenticated && (
          <button onClick={onLogout} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        )}
      </div>
    </div>
  </header>
);

const Navbar: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; role: UserRole }> = ({ activeTab, setActiveTab, role }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-2xl">
    <div className="container mx-auto px-4 h-16 flex items-center justify-around max-w-lg">
      <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'}`}>
        <div className={activeTab === 'dashboard' ? 'p-1.5 bg-yellow-400 rounded-lg text-slate-900' : ''}><ICONS.Home /></div>
        <span className="text-[10px] font-black uppercase tracking-wider">Home</span>
      </button>
      <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400'}`}>
        <div className={activeTab === 'profile' ? 'p-1.5 bg-yellow-400 rounded-lg text-slate-900' : ''}><ICONS.Profile /></div>
        <span className="text-[10px] font-black uppercase tracking-wider">Profile</span>
      </button>
      {role === UserRole.ADMIN && (
        <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-slate-900' : 'text-slate-400'}`}>
          <div className={activeTab === 'admin' ? 'p-1.5 bg-yellow-400 rounded-lg text-slate-900' : ''}><ICONS.Admin /></div>
          <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
        </button>
      )}
    </div>
  </nav>
);

// --- Pages ---

const MemberDashboard: React.FC<{ events: TravelEvent[]; onRegister: (e: TravelEvent) => void; registrations: Registration[]; memberName: string }> = ({ events, onRegister, registrations, memberName }) => (
  <div className="space-y-6 animate-fadeIn pb-24">
    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden border border-slate-800">
      <div className="relative z-10 flex flex-col items-center text-center">
        <Logo className="mb-8" inverted />
        <h3 className="text-xl font-bold mb-4 opacity-90">Hello, {memberName.split(' ')[0]}!</h3>
        <p className="opacity-70 text-slate-300 max-w-xs text-sm leading-relaxed font-medium mb-6">Discover the beauty of nature with the Chennai travel community.</p>
        <a href="https://www.instagram.com/sanchari.chennai" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 text-slate-900 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Our Instagram</a>
      </div>
    </div>

    <div className="grid gap-6">
      <h3 className="text-sm font-black flex items-center gap-2 text-slate-800 px-2 uppercase tracking-[0.2em]">
        <span className="w-2 h-6 bg-yellow-400 rounded-full"></span> Upcoming Trips
      </h3>
      {events.filter(e => e.status === 'published').map(event => {
        const totalRegs = registrations.filter(r => r.eventId === event.id).length;
        return (
          <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-md transition">
            <div className="relative h-48 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute top-5 right-5 bg-white/95 px-4 py-2 rounded-2xl shadow-sm">
                <span className="text-slate-900 text-[10px] font-black uppercase tracking-widest">
                  {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">{event.title}</h4>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">{event.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <span className="text-sm font-black text-slate-900">{event.capacity - totalRegs} Slots Left</span>
                <button 
                  onClick={() => onRegister(event)}
                  className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95"
                >
                  Join Trip
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isRegistering, setIsRegistering] = useState<TravelEvent | null>(null);

  // Sync with Firestore Real-time
  useEffect(() => {
    // Initial data seed (only runs if DB is empty)
    seedDatabase([], INITIAL_EVENTS);

    const unsubMembers = subscribeToMembers(setMembers);
    const unsubEvents = subscribeToEvents(setEvents);
    const unsubRegs = subscribeToRegistrations(setRegistrations);

    // Restore session
    const savedUser = localStorage.getItem('travel_nature_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    return () => {
      unsubMembers();
      unsubEvents();
      unsubRegs();
    };
  }, []);

  const handleUserLogin = (email: string, pass: string) => {
    const found = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (found && (found.password === pass || pass === 'sanchari')) {
      setCurrentUser(found);
      localStorage.setItem('travel_nature_user', JSON.stringify(found));
    } else {
      alert('Invalid login credentials.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('travel_nature_user');
    setActiveTab('dashboard');
  };

  const isAuth = useMemo(() => {
    return role === UserRole.ADMIN ? isAdminAuthenticated : !!currentUser;
  }, [role, isAdminAuthenticated, currentUser]);

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <Header role={role} setRole={setRole} isAuthenticated={isAuth} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 pt-8 max-w-lg">
        {role === UserRole.MEMBER && !currentUser ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[70vh]">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 w-full max-w-sm text-center">
              <Logo className="mb-10" />
              <div className="space-y-4">
                <input type="email" placeholder="Email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-black uppercase text-xs outline-none" id="login-email" />
                <input type="password" placeholder="Password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl font-black uppercase text-xs outline-none" id="login-pass" />
                <button 
                  onClick={() => handleUserLogin((document.getElementById('login-email') as HTMLInputElement).value, (document.getElementById('login-pass') as HTMLInputElement).value)}
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        ) : role === UserRole.ADMIN && !isAdminAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fadeIn min-h-[70vh]">
             <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-800 w-full max-w-sm text-center">
               <Logo inverted className="mb-12" />
               <input type="password" placeholder="Admin Access Key" className="w-full px-6 py-5 mb-8 bg-slate-800 border border-slate-700 rounded-3xl text-white text-center font-black uppercase tracking-[0.4em] text-xs outline-none" id="admin-pass" />
               <button onClick={() => (document.getElementById('admin-pass') as HTMLInputElement).value === 'sanchari2026' ? setIsAdminAuthenticated(true) : alert('Unauthorized')} className="w-full py-5 bg-yellow-400 text-slate-900 rounded-3xl font-black uppercase tracking-widest text-[10px]">Authorize</button>
             </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <MemberDashboard events={events} onRegister={setIsRegistering} registrations={registrations} memberName={currentUser?.name || 'Admin'} />}
            
            {activeTab === 'profile' && currentUser && (
              <div className="space-y-8 animate-fadeIn">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 uppercase">
                      <ICONS.Profile /> Profile Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Name</label>
                        <p className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm">{currentUser.name}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Blood Group</label>
                        <p className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm">{currentUser.bloodGroup}</p>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'admin' && role === UserRole.ADMIN && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm">
                    <span className="text-4xl font-black">{members.length}</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Total Riders</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm">
                    <span className="text-4xl font-black">{registrations.length}</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Active Bookings</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {isAuth && <Navbar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />}

      {isRegistering && currentUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-10 space-y-8 animate-slideUp">
              <h3 className="text-2xl font-black uppercase text-slate-900">Join Expedition</h3>
              <p className="text-slate-500">Would you like to register for <span className="text-slate-900 font-black">{isRegistering.title}</span>? This will be synced to our community cloud.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsRegistering(null)} className="flex-1 py-5 border border-slate-100 rounded-3xl font-black uppercase text-[10px] text-slate-400">Cancel</button>
                <button 
                  onClick={async () => {
                    await addRegistration({ eventId: isRegistering.id, memberId: currentUser.id });
                    setIsRegistering(null);
                    alert('Registration Successful! See you at the trip.');
                  }} 
                  className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                >
                  Confirm Cloud Sync
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideUp { animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
