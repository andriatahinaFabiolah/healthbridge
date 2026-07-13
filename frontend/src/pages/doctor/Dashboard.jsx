import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart, LogOut, Users, Calendar,
  FileText, MessageCircle, TrendingUp,
  Stethoscope, Bell, Send, Plus, Activity
} from 'lucide-react';
import axios from 'axios';
import MessagesSection from './MessagesSection';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
});

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    consultationId: '', patientId: '', medications: '', duration: '', instructions: ''
  });
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [selectedPatientSymptoms, setSelectedPatientSymptoms] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const http = api(token);
        const [patientsRes, consultRes] = await Promise.all([
          http.get('/doctors/patients'),
          http.get('/doctors/consultations'),
        ]);
        setPatients(patientsRes.data.patients);
        setConsultations(consultRes.data.consultations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const fetchMessages = async (pId) => {
    try {
      const res = await api(token).get(`/doctors/messages/${pId}`);
      setMessages(res.data.messages);
    } catch (error) { console.error(error); }
  };

  const fetchPatientSymptoms = async (pId) => {
    try {
      const res = await api(token).get(`/doctors/patients/${pId}/symptoms`);
      setSelectedPatientSymptoms(res.data.symptoms);
      setSelectedPatientId(pId);
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async () => {
    if (!messageInput || !patientId) return;
    try {
      await api(token).post(`/doctors/messages/${patientId}`, { content: messageInput });
      setMessageInput('');
      fetchMessages(patientId);
    } catch (error) { console.error(error); }
  };

  const handlePrescription = async () => {
    setPrescriptionLoading(true);
    try {
      const medications = prescriptionForm.medications.split(',').map(m => {
        const parts = m.trim().split(' ');
        return { name: parts[0] || m.trim(), dose: parts[1] || '1cp', frequency: parts[2] || '3x/jour' };
      });
      await api(token).post('/doctors/prescriptions', {
        ...prescriptionForm,
        medications,
        duration: parseInt(prescriptionForm.duration)
      });
      setPrescriptionSuccess(true);
    } catch (error) { console.error(error); }
    finally { setPrescriptionLoading(false); }
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

  const getSeverityBadge = (severity) => {
    const styles = {
      low: 'bg-green-50 text-green-600 border-green-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      high: 'bg-red-50 text-red-600 border-red-200',
    };
    const labels = { low: '🟢 Léger', medium: '🟡 Modéré', high: '🔴 Grave' };
    return <Badge className={`${styles[severity]} hover:${styles[severity]}`}>{labels[severity]}</Badge>;
  };

  const navItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Tableau de bord' },
    { id: 'patients', icon: Users, label: 'Mes patients' },
    { id: 'consultations', icon: Calendar, label: 'Consultations' },
    { id: 'prescriptions', icon: FileText, label: 'Ordonnances' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
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
              <p className="text-xs text-slate-400">{user?.specialty || 'Médecin'}</p>
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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Dr. {user?.name} 👨‍⚕️</h1>
              <p className="text-slate-500 mt-1">{user?.specialty || 'Médecin généraliste'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Mes patients', value: patients.length, icon: Users, color: 'bg-blue-50 text-blue-500', section: 'patients' },
                { label: 'Consultations', value: consultations.length, icon: Calendar, color: 'bg-emerald-50 text-emerald-500', section: 'consultations' },
                { label: 'En attente', value: consultations.filter(c => c.status === 'pending').length, icon: Bell, color: 'bg-yellow-50 text-yellow-500', section: 'consultations' },
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

        {/* SECTION: Patients */}
        {activeSection === 'patients' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes patients</h1>
              <p className="text-slate-500 mt-1">{patients.length} patient(s) suivi(s)</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-slate-100 shadow-none">
                {patients.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aucun patient pour l'instant</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {patients.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                              {p.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.email}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline"
                          onClick={() => fetchPatientSymptoms(p.id)}
                          className="text-xs h-7 border-slate-200">
                          <Stethoscope className="w-3 h-3 mr-1" />
                          Symptômes
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Symptômes du patient sélectionné */}
              <Card className="border-slate-100 shadow-none">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">
                    {selectedPatientId ? `Symptômes du patient #${selectedPatientId}` : 'Sélectionnez un patient'}
                  </h3>
                </div>
                {selectedPatientSymptoms.length === 0 ? (
                  <div className="p-12 text-center">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Cliquez sur "Symptômes" pour voir le dossier</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {selectedPatientSymptoms.map((s) => (
                      <div key={s.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-800">Symptôme #{s.id}</p>
                          {getSeverityBadge(s.severity)}
                        </div>
                        <p className="text-sm text-slate-500">{s.description}</p>
                        <p className="text-xs text-emerald-600 mt-1">→ {s.suggestedSpecialty}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* SECTION: Consultations */}
        {activeSection === 'consultations' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Mes consultations</h1>
              <p className="text-slate-500 mt-1">{consultations.length} consultation(s)</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {consultations.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucune consultation planifiée</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {consultations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.Patient?.name}</p>
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

        {/* SECTION: Ordonnances */}
        {activeSection === 'prescriptions' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Rédiger une ordonnance</h1>
              <p className="text-slate-500 mt-1">Prescrivez un traitement à un patient</p>
            </div>
            <Card className="border-slate-100 shadow-none max-w-xl">
              <div className="p-6">
                {!prescriptionSuccess ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID Consultation</Label>
                      <Input placeholder="ex: 1"
                        value={prescriptionForm.consultationId}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, consultationId: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label>ID Patient</Label>
                      <Input placeholder="ex: 3"
                        value={prescriptionForm.patientId}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label>Médicaments</Label>
                      <Textarea
                        placeholder="Paracetamol 500mg 3x/jour, Ibuprofène 400mg 2x/jour"
                        value={prescriptionForm.medications}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medications: e.target.value })}
                        className="border-slate-200" />
                      <p className="text-xs text-slate-400">Séparez les médicaments par des virgules</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Durée (jours)</Label>
                      <Input type="number" placeholder="ex: 7"
                        value={prescriptionForm.duration}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Textarea placeholder="Instructions supplémentaires..."
                        value={prescriptionForm.instructions}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <Button onClick={handlePrescription} disabled={prescriptionLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                      {prescriptionLoading ? 'Envoi...' : 'Enregistrer l\'ordonnance'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-medium text-slate-800">Ordonnance enregistrée !</p>
                    <p className="text-sm text-slate-500">Le patient peut consulter son traitement.</p>
                    <Button variant="outline" onClick={() => setPrescriptionSuccess(false)} className="w-full">
                      Nouvelle ordonnance
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* SECTION: Messages */}
        {activeSection === 'messages' && (
          <MessagesSection user={user} token={token} />
        )}
        
        {/* SECTION: Notifications */}
        {activeSection === 'notifications' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500 mt-1">Vos alertes et notifications</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucune notification</p>
                <p className="text-slate-400 text-sm mt-1">Les alertes des aide-soignants apparaîtront ici</p>
              </div>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}