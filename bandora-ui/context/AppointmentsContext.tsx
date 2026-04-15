import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';

export type Appointment = {
  id: string;          // slotId as string
  slotId: number;
  deptName: string;
  doctorName: string;
  storeName: string;
  date: string;        // YYYY-MM-DD
  time: string;        // e.g. "10:30 AM"
  fee: number;
  bookedAt: string;
};

type AppointmentsContextType = {
  appointments: Appointment[];
  loading: boolean;
  addAppointment: (a: Omit<Appointment, 'id' | 'bookedAt'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  refreshAppointments: () => Promise<void>;
};

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user?.email || !token) {
      console.log('[Appointments] No user/token, clearing list');
      setAppointments([]);
      return;
    }
    setLoading(true);
    try {
      const url = `${API_BASE}/api/clinics/bookings?email=${encodeURIComponent(user.email)}`;
      console.log('[Appointments] Fetching:', url);
      const res = await fetch(url);
      console.log('[Appointments] Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[Appointments] Data:', JSON.stringify(data));
        setAppointments(
          (data as any[]).map(b => ({
            id: b.slotId.toString(),
            slotId: b.slotId,
            deptName: b.deptName,
            doctorName: b.doctorName,
            storeName: b.storeName,
            date: b.date,
            time: b.time,
            fee: b.consultationFee,
            bookedAt: '',
          }))
        );
      } else {
        console.log('[Appointments] Error body:', await res.text());
      }
    } catch (e) {
      console.error('[Appointments] Fetch error:', e);
    }
    finally { setLoading(false); }
  }, [user?.email, token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Called after a successful booking — just refreshes from API
  const addAppointment = async (_: Omit<Appointment, 'id' | 'bookedAt'>) => {
    await fetchAppointments();
  };

  const cancelAppointment = useCallback(async (id: string) => {
    const slotId = parseInt(id, 10);
    // Optimistically remove from UI immediately so the user sees instant feedback
    setAppointments(curr => curr.filter(a => a.id !== id));
    try {
      const res = await fetch(`${API_BASE}/api/clinics/slots/${slotId}/cancel`, { method: 'POST' });
      console.log('[Appointments] Cancel status:', res.status);
      if (!res.ok) {
        console.log('[Appointments] Cancel failed, restoring...');
        await fetchAppointments();
      }
    } catch (e) {
      console.error('[Appointments] Cancel error:', e);
      await fetchAppointments();
    }
  }, [fetchAppointments]);

  return (
    <AppointmentsContext.Provider value={{
      appointments,
      loading,
      addAppointment,
      cancelAppointment,
      refreshAppointments: fetchAppointments,
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider');
  return ctx;
}
