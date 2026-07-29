import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart, LogOut, Activity, Calendar, Pill,
  Bell, MessageCircle, Plus, Stethoscope,
  TrendingUp, Send
} from 'lucide-react';
import axios from 'axios';
import MessagesSection from './MessagesSection';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
});

export default function PatientDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [consultations, setConsultations] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symptomForm, setSymptomForm] = useState({ description: '', severity: '' });
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [consultationBooked, setConsultationBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const http = api(token);
        const [consultRes, treatRes, reminderRes] = await Promise.all([
          http.get('/patients/consultations'),
          http.get('/patients/treatments'),
          http.get('/patients/reminders'),
        ]);
        setConsultations(consultRes.data.consultations);
        setTreatments(treatRes.data.prescriptions);
        setReminders(reminderRes.data.reminders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const fetchMessages = async (dId) => {
    try {
      const res = await api(token).get(`/patients/messages/${dId}`);
      setMessages(res.data.messages);
    } catch (error) { console.error(error); }
  };

  const fetchDoctors = async (specialty) => {
    try {
      const res = await api(token).get(`/patients/doctors?specialty=${specialty}`);
      setDoctors(res.data.doctors);
    } catch (error) { console.error(error); }
  };

  const handleSymptomSubmit = async () => {
    setSymptomLoading(true);
    try {
      const res = await api(token).post('/patients/symptoms', symptomForm);
      setSymptomResult(res.data.symptom);
      fetchDoctors(res.data.symptom.suggestedSpecialty);
    } catch (error) { console.error(error); }
    finally { setSymptomLoading(false); }
  };

  const handleBookConsultation = async () => {
    setBookingLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/patients/consultations',
        { doctorId: bookingDoctorId, symptomId: symptomResult.id, date: bookingDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConsultationBooked(true);
      const res = await axios.get(
        'http://localhost:5000/api/patients/consultations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConsultations(res.data.consultations);
    } catch (error) {
      console.error(error);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput || !doctorId) return;
    try {
      await api(token).post(`/patients/messages/${doctorId}`, { content: messageInput });
      setMessageInput('');
      fetchMessages(doctorId);
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      active: 'bg-blue-50 text-blue-600 border-blue-200',
      done: 'bg-green-50 text-green-600 border-green-200',
    };
    const labels = { pending: 'En attente', active: 'En cours', done: 'Terminée' };
    return <Badge className={`${styles[status]} hover:${styles[status]}`}>{labels[status]}</Badge>;
  };

  const navItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Mon espace santé' },
    { id: 'symptoms', icon: Activity, label: 'Mes symptômes' },
    { id: 'consultations', icon: Calendar, label: 'Consultations' },
    { id: 'treatments', icon: Pill, label: 'Traitements' },
    { id: 'reminders', icon: Bell, label: 'Rappels' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-40">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">HealthBridge</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                activeSection === item.id
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Patient</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}
            className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 p-8">

        {/* SECTION: Dashboard */}
        {activeSection === 'dashboard' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.name} 👋</h1>
                <p className="text-slate-500 mt-1">Comment vous sentez-vous aujourd'hui ?</p>
              </div>
              <Button
                onClick={() => setActiveSection('symptoms')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Décrire mes symptômes
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Consultations', value: consultations.length, icon: Calendar, color: 'bg-blue-50 text-blue-500', section: 'consultations' },
                { label: 'Traitements', value: treatments.length, icon: Pill, color: 'bg-purple-50 text-purple-500', section: 'treatments' },
                { label: 'Rappels', value: reminders.length, icon: Bell, color: 'bg-orange-50 text-orange-500', section: 'reminders' },
              ].map((stat, i) => (
                <Card key={i} className="p-5 border-slate-100 shadow-none cursor-pointer hover:border-emerald-200 transition-colors"
                  onClick={() => setActiveSection(stat.section)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* SECTION: Symptômes */}
        {activeSection === 'symptoms' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes symptômes</h1>
              <p className="text-slate-500 mt-1">Décrivez vos symptômes pour trouver le bon spécialiste</p>
            </div>
            <Card className="border-slate-100 shadow-none max-w-xl">
              <div className="p-6">
                {!symptomResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description des symptômes</Label>
                      <Textarea
                        placeholder="Décrivez vos symptômes en détail..."
                        value={symptomForm.description}
                        onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                        className="min-h-32 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Niveau de gravité</Label>
                      <Select onValueChange={(v) => setSymptomForm({ ...symptomForm, severity: v })}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Sélectionner la gravité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Léger</SelectItem>
                          <SelectItem value="medium">🟡 Modéré</SelectItem>
                          <SelectItem value="high">🔴 Grave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleSymptomSubmit}
                      disabled={symptomLoading || !symptomForm.description || !symptomForm.severity}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {symptomLoading ? 'Analyse en cours...' : 'Soumettre mes symptômes'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <Stethoscope className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Spécialiste recommandé</p>
                      <p className="text-2xl font-bold text-emerald-500 mt-1">{symptomResult.suggestedSpecialty}</p>
                    </div>
                    <p className="text-sm text-slate-500">Vos symptômes ont été enregistrés.</p>

                    {!consultationBooked ? (
                      <div className="text-left space-y-3 pt-3 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Réserver une consultation</p>
                        <div className="space-y-2">
                          <Label>Choisir un médecin</Label>
                          <Select onValueChange={setBookingDoctorId}>
                            <SelectTrigger className="border-slate-200">
                              <SelectValue placeholder="Sélectionner un médecin" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-slate-400">Aucun médecin disponible</div>
                                ) : (
                                  doctors.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                      Dr. {d.name} — {d.specialty}
                                    </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date souhaitée</Label>
                          <Input
                            type="datetime-local"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="border-slate-200"
                          />
                        </div>
                        <Button
                          onClick={handleBookConsultation}
                          disabled={bookingLoading || !bookingDoctorId || !bookingDate}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          {bookingLoading ? 'Réservation...' : 'Réserver la consultation'}
                        </Button>
                      </div>
                      ) : (
                        <div className="pt-2">
                          <p className="text-sm text-emerald-600 font-medium mb-3">✅ Consultation réservée !</p>
                          <Button variant="outline" onClick={() => {
                            setSymptomResult(null);
                            setConsultationBooked(false);
                            setBookingDoctorId('');
                            setBookingDate('');
                          }} className="w-full">
                            Décrire de nouveaux symptômes
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* SECTION: Consultations */}
        {activeSection === 'consultations' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes consultations</h1>
              <p className="text-slate-500 mt-1">{consultations.length} consultation(s) au total</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {consultations.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucune consultation</p>
                  <p className="text-slate-400 text-sm mt-1">Décrivez vos symptômes pour commencer</p>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setActiveSection('symptoms')}>
                    Décrire mes symptômes
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {consultations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Dr. {c.Doctor?.name}</p>
                          <p className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Traitements */}
        {activeSection === 'treatments' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes traitements</h1>
              <p className="text-slate-500 mt-1">{treatments.length} ordonnance(s) reçue(s)</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {treatments.length === 0 ? (
                <div className="p-12 text-center">
                  <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun traitement en cours</p>
                  <p className="text-slate-400 text-sm mt-1">Vos ordonnances apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {treatments.map((t) => (
                    <div key={t.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-800">Ordonnance #{t.id}</p>
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200">{t.duration} jours</Badge>
                      </div>
                      <div className="space-y-1">
                        {t.medications?.map((med, i) => (
                          <p key={i} className="text-xs text-slate-500">💊 {med.name} — {med.dose} — {med.frequency}</p>
                        ))}
                      </div>
                      {t.instructions && <p className="text-xs text-slate-400 mt-2 italic">{t.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Rappels */}
        {activeSection === 'reminders' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes rappels</h1>
              <p className="text-slate-500 mt-1">{reminders.length} rappel(s) programmé(s)</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {reminders.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun rappel</p>
                  <p className="text-slate-400 text-sm mt-1">Vos rappels de médicaments apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {reminders.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Bell className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{r.message}</p>
                          <p className="text-xs text-slate-400">{new Date(r.scheduledAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <Badge className={r.sent ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}>
                        {r.sent ? 'Envoyé' : 'À venir'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Messages */}
        {activeSection === 'messages' && (
          <MessagesSection user={user} token={token} consultations={consultations} />
        )}

      </div>
    </div>
  );
}