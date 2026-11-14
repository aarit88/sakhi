'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'DOCTOR'>('USER');
  const [specialty, setSpecialty] = useState('Obstetrics & Gynecology');
  const [clinicName, setClinicName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        specialty: role === 'DOCTOR' ? specialty : undefined,
        clinicName: role === 'DOCTOR' ? clinicName : undefined,
        registrationNumber: role === 'DOCTOR' ? registrationNumber : undefined,
      });
      await refreshUser();
      toast.success('Account created! Welcome to SAKHI');
      router.push(role === 'DOCTOR' ? '/doctor-portal' : '/profile');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow">
            <Heart className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Join <span className="text-rose-600">SAKHI</span>
          </h1>
          <p className="text-sm text-slate-600">Personalize your cycle, clinical lab, and wellness journey</p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          className="w-full border-slate-300 text-slate-800 hover:bg-slate-50 font-medium py-5"
        >
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
          Continue with Google
        </Button>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 ${
              role === 'USER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient / Member
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 ${
              role === 'DOCTOR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Clinician
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
              placeholder={role === 'DOCTOR' ? 'Dr. Ananya Rao' : 'Your full name'}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Min 6 characters"
            />
          </div>

          {role === 'DOCTOR' && (
            <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  placeholder="Clinic / Hospital"
                />
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  placeholder="Medical Reg #"
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
            {loading ? 'Creating account...' : role === 'DOCTOR' ? 'Register as Clinician' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button type="button" onClick={() => router.push('/login')} className="text-rose-600 font-medium hover:underline">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
