import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart, LogOut, Users, Calendar,
  FileText, MessageCircle, TrendingUp,
  Stethoscope, Plus, Bell
} from 'lucide-react';
import axios from 'axios';

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    consultationId: '', patientId: '', medications: '', duration: '', instructions: ''
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [patientsRes, consultRes] = await Promise.all([
          axios.get('http://localhost:5000/api/doctors/patients', { headers }),
          axios.get('http://localhost:5000/api/doctors/consultations', { headers }),
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

  const handlePrescription = async () => {
    setPrescriptionLoading(true);
    try {
      const medications = prescriptionForm.medications.split(',').map(m => {
        const parts = m.trim().split(' ');
        return { name: parts[0] || m.trim(), dose: parts[1] || '1cp', frequency: parts[2] || '3x/jour' };
      });
      await axios.post(
        'http://localhost:5000/api/doctors/prescriptions',
        { ...prescriptionForm, medications, duration: parseInt(prescriptionForm.duration) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptionSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setPrescriptionLoading(false);
    }
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
          {[
            { icon: TrendingUp, label: 'Tableau de bord', active: true },
            { icon: Users, label: 'Mes patients' },
            { icon: Calendar, label: 'Consultations' },
            { icon: FileText, label: 'Ordonnances' },
            { icon: MessageCircle, label: 'Messages' },
            { icon: Bell, label: 'Notifications' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dr. {user?.name} 👨‍⚕️</h1>
            <p className="text-slate-500 mt-1">{user?.specialty || 'Médecin généraliste'}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle ordonnance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Rédiger une ordonnance</DialogTitle>
              </DialogHeader>
              {!prescriptionSuccess ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>ID Consultation</Label>
                    <Input
                      placeholder="ex: 1"
                      value={prescriptionForm.consultationId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, consultationId: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Patient</Label>
                    <Input
                      placeholder="ex: 3"
                      value={prescriptionForm.patientId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Médicaments</Label>
                    <Textarea
                      placeholder="Paracetamol 500mg 3x/jour, Ibuprofène 400mg 2x/jour"
                      value={prescriptionForm.medications}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medications: e.target.value })}
                      className="border-slate-200"
                    />
                    <p className="text-xs text-slate-400">Séparez les médicaments par des virgules</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Durée (jours)</Label>
                    <Input
                      type="number"
                      placeholder="ex: 7"
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      placeholder="Instructions supplémentaires..."
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <Button
                    onClick={handlePrescription}
                    disabled={prescriptionLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {prescriptionLoading ? 'Envoi en cours...' : 'Enregistrer l\'ordonnance'}
                  </Button>
                </div>
              ) : (
                <div className="pt-2 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Ordonnance enregistrée !</p>
                    <p className="text-sm text-slate-500 mt-1">Le patient peut maintenant consulter son traitement.</p>
                  </div>
                  <Button variant="outline" onClick={() => setPrescriptionSuccess(false)} className="w-full">
                    Nouvelle ordonnance
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Mes patients</span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{patients.length}</div>
          </Card>
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Consultations</span>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{consultations.length}</div>
          </Card>
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">En attente</span>
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {consultations.filter(c => c.status === 'pending').length}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="patients">
          <TabsList className="mb-6 bg-white border border-slate-100">
            <TabsTrigger value="patients" className="gap-2">
              <Users className="w-4 h-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="consultations" className="gap-2">
              <Calendar className="w-4 h-4" />
              Consultations
            </TabsTrigger>
          </TabsList>

          {/* Patients */}
          <TabsContent value="patients">
            <Card className="border-slate-100 shadow-none">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Mes patients</h2>
                <p className="text-sm text-slate-500 mt-1">{patients.length} patients suivis</p>
              </div>
              {patients.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun patient pour l'instant</p>
                  <p className="text-slate-400 text-sm mt-1">Les patients apparaîtront après leurs consultations</p>
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
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-600 border-blue-200">Patient</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPatient(p)}
                          className="text-xs h-7 border-slate-200"
                        >
                          <Stethoscope className="w-3 h-3 mr-1" />
                          Voir dossier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Consultations */}
          <TabsContent value="consultations">
            <Card className="border-slate-100 shadow-none">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Mes consultations</h2>
              </div>
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
                          <p className="text-sm font-medium text-slate-800">
                            {c.Patient?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(c.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}