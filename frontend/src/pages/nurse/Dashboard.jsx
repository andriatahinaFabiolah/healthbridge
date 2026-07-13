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
  Heart, LogOut, Users, ClipboardList,
  AlertTriangle, TrendingUp, Bell, Activity,
  Pill, FileText
} from 'lucide-react';
import axios from 'axios';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
});

export default function NurseDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [patientTreatment, setPatientTreatment] = useState(null);
  const [alertForm, setAlertForm] = useState({ doctorId: '', patientId: '', message: '' });
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api(token).get('/nurses/patients');
        setPatients(res.data.patients);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const fetchPatientRecord = async (patientId) => {
    try {
      const res = await api(token).get(`/nurses/patients/${patientId}/record`);
      setPatientRecord(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchPatientTreatment = async (patientId) => {
    try {
      const res = await api(token).get(`/nurses/patients/${patientId}/treatment`);
      setPatientTreatment(res.data.prescriptions);
    } catch (error) { console.error(error); }
  };

  const handleAlert = async () => {
    setAlertLoading(true);
    try {
      await api(token).post('/nurses/alerts', alertForm);
      setAlertSuccess(true);
      setAlertsCount(prev => prev + 1);
    } catch (error) { console.error(error); }
    finally { setAlertLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
    { id: 'records', icon: ClipboardList, label: 'Dossiers médicaux' },
    { id: 'treatments', icon: Pill, label: 'Traitements' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alertes' },
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
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Aide-soignant</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.name} 🩺</h1>
              <p className="text-slate-500 mt-1">Suivi des patients assignés</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Patients assignés', value: patients.length, icon: Users, color: 'bg-purple-50 text-purple-500', section: 'patients' },
                { label: 'Dossiers actifs', value: patients.length, icon: ClipboardList, color: 'bg-emerald-50 text-emerald-500', section: 'records' },
                { label: 'Alertes envoyées', value: alertsCount, icon: AlertTriangle, color: 'bg-red-50 text-red-500', section: 'alerts' },
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
              <p className="text-slate-500 mt-1">{patients.length} patient(s) à surveiller</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {patients.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun patient assigné</p>
                  <p className="text-slate-400 text-sm mt-1">Les patients actifs apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {patients.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                            {p.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedPatient(p); fetchPatientRecord(p.id); setActiveSection('records'); }}
                          className="text-xs h-7 border-slate-200">
                          <ClipboardList className="w-3 h-3 mr-1" />
                          Dossier
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedPatient(p); fetchPatientTreatment(p.id); setActiveSection('treatments'); }}
                          className="text-xs h-7 border-slate-200">
                          <Pill className="w-3 h-3 mr-1" />
                          Traitement
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Dossiers médicaux */}
        {activeSection === 'records' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Dossiers médicaux</h1>
              <p className="text-slate-500 mt-1">
                {selectedPatient ? `Dossier de ${selectedPatient.name}` : 'Sélectionnez un patient'}
              </p>
            </div>
            {!patientRecord ? (
              <Card className="border-slate-100 shadow-none">
                <div className="p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun dossier sélectionné</p>
                  <p className="text-slate-400 text-sm mt-1">Allez dans "Mes patients" et cliquez sur "Dossier"</p>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setActiveSection('patients')}>
                    Voir mes patients
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-slate-100 shadow-none">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Symptômes</h2>
                  </div>
                  {patientRecord.symptoms?.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-slate-400 text-sm">Aucun symptôme enregistré</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {patientRecord.symptoms?.map((s) => (
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

                <Card className="border-slate-100 shadow-none">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Consultations</h2>
                  </div>
                  {patientRecord.consultations?.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-slate-400 text-sm">Aucune consultation</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {patientRecord.consultations?.map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">Dr. {c.Doctor?.name}</p>
                            <p className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">{c.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}

        {/* SECTION: Traitements */}
        {activeSection === 'treatments' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Traitements</h1>
              <p className="text-slate-500 mt-1">
                {selectedPatient ? `Traitement de ${selectedPatient.name}` : 'Sélectionnez un patient'}
              </p>
            </div>
            {!patientTreatment ? (
              <Card className="border-slate-100 shadow-none">
                <div className="p-12 text-center">
                  <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun traitement sélectionné</p>
                  <p className="text-slate-400 text-sm mt-1">Allez dans "Mes patients" et cliquez sur "Traitement"</p>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setActiveSection('patients')}>
                    Voir mes patients
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border-slate-100 shadow-none">
                {patientTreatment.length === 0 ? (
                  <div className="p-12 text-center">
                    <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aucun traitement en cours</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {patientTreatment.map((t) => (
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
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {/* SECTION: Alertes */}
        {activeSection === 'alerts' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Envoyer une alerte</h1>
              <p className="text-slate-500 mt-1">Signalez un changement inquiétant au médecin</p>
            </div>
            <Card className="border-slate-100 shadow-none max-w-xl">
              <div className="p-6">
                {!alertSuccess ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID Médecin</Label>
                      <Input placeholder="ex: 1"
                        value={alertForm.doctorId}
                        onChange={(e) => setAlertForm({ ...alertForm, doctorId: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label>ID Patient</Label>
                      <Input placeholder="ex: 3"
                        value={alertForm.patientId}
                        onChange={(e) => setAlertForm({ ...alertForm, patientId: e.target.value })}
                        className="border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label>Message d'alerte</Label>
                      <Textarea
                        placeholder="Décrivez le changement inquiétant observé..."
                        value={alertForm.message}
                        onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                        className="border-slate-200 min-h-32" />
                    </div>
                    <Button onClick={handleAlert} disabled={alertLoading}
                      className="w-full bg-red-500 hover:bg-red-600 text-white">
                      {alertLoading ? 'Envoi...' : 'Envoyer l\'alerte'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="font-medium text-slate-800">Alerte envoyée !</p>
                    <p className="text-sm text-slate-500">Le médecin a été notifié.</p>
                    <Button variant="outline" onClick={() => setAlertSuccess(false)} className="w-full">
                      Nouvelle alerte
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </>
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
                <p className="text-slate-400 text-sm mt-1">Vos notifications apparaîtront ici</p>
              </div>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}