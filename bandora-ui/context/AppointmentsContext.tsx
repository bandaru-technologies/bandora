import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appointment = {
  id: string;          // UUID generated at booking time
  slotId: number;
  deptName: string;
  doctorName: string;
  storeName: string;
  date: string;        // YYYY-MM-DD
  time: string;        // e.g. "10:30 AM"
  fee: number;
  bookedAt: string;    // ISO timestamp
};

type AppointmentsContextType = {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, 'id' | 'bookedAt'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
};

const STORAGE_KEY = 'my_appointments';

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setAppointments(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const addAppointment = async (a: Omit<Appointment, 'id' | 'bookedAt'>) => {
    const newEntry: Appointment = {
      ...a,
      id: Math.random().toString(36).slice(2),
      bookedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...appointments];
    setAppointments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const cancelAppointment = async (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, cancelAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider');
  return ctx;
}
