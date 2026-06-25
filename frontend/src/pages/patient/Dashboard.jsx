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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart, LogOut, Activity, Calendar, Pill,
  Bell, MessageCircle, Plus, Stethoscope,
  ClipboardList, TrendingUp
} from 'lucide-react';
import axios from 'axios';

export default function PatientDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symptomForm, setSymptomForm] = useState({ description: '', severity: '' });
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [consultRes, treatRes, reminderRes] = await Promise.all([
          axios.get('http://localhost:5000/api/patients/consultations', { headers }),
          axios.get('http://localhost:5000/api/patients/treatments', { headers }),
          axios.get('http://localhost:5000/api/patients/reminders', { headers }),
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

  const handleSymptomSubmit = async () => {
    setSymptomLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/patients/symptoms',
        symptomForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSymptomResult(res.data.symptom);
    } catch (error) {
      console.error(error);
    } finally {
      setSymptomLoading(false);
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
            { icon: TrendingUp, label: 'Mon espace santé', active: true },
            { icon: Activity, label: 'Mes symptômes' },
            { icon: Calendar, label: 'Consultations' },
            { icon: Pill, label: 'Traitements' },
            { icon: Bell, label: 'Rappels' },
            { icon: MessageCircle, label: 'Messages' },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.name} 👋</h1>
            <p className="text-slate-500 mt-1">Comment vous sentez-vous aujourd'hui ?</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Décrire mes symptômes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Décrivez vos symptômes</DialogTitle>
              </DialogHeader>
              {!symptomResult ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Description des symptômes</Label>
                    <Textarea
                      placeholder="Décrivez vos symptômes en détail..."
                      value={symptomForm.description}
                      onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                      className="min-h-24 border-slate-200"
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
                    {symptomLoading ? 'Analyse en cours...' : 'Soumettre'}
                  </Button>
                </div>
              ) : (
                <div className="pt-2 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <Stethoscope className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Spécialiste recommandé</p>
                    <p className="text-2xl font-bold text-emerald-500 mt-1">
                      {symptomResult.suggestedSpecialty}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    Vos symptômes ont été enregistrés. Un médecin spécialiste va prendre en charge votre dossier.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSymptomResult(null)}
                    className="w-full"
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Consultations</span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{consultations.length}</div>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </Card>

          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Traitements</span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{treatments.length}</div>
            <p className="text-xs text-slate-400 mt-1">En cours</p>
          </Card>

          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Rappels</span>
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{reminders.length}</div>
            <p className="text-xs text-slate-400 mt-1">À venir</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="consultations">
          <TabsList className="mb-6 bg-white border border-slate-100">
            <TabsTrigger value="consultations" className="gap-2">
              <Calendar className="w-4 h-4" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="treatments" className="gap-2">
              <Pill className="w-4 h-4" />
              Traitements
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Bell className="w-4 h-4" />
              Rappels
            </TabsTrigger>
          </TabsList>

          {/* Consultations */}
          <TabsContent value="consultations">
            <Card className="border-slate-100 shadow-none">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Mes consultations</h2>
              </div>
              {consultations.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucune consultation</p>
                  <p className="text-slate-400 text-sm mt-1">Décrivez vos symptômes pour commencer</p>
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
                          <p className="text-sm font-medium text-slate-800">
                            Dr. {c.Doctor?.name}
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

          {/* Traitements */}
          <TabsContent value="treatments">
            <Card className="border-slate-100 shadow-none">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Mes traitements</h2>
              </div>
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
                        <p className="text-sm font-medium text-slate-800">
                          Ordonnance #{t.id}
                        </p>
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200">
                          {t.duration} jours
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {t.medications?.map((med, i) => (
                          <p key={i} className="text-xs text-slate-500">
                            💊 {med.name} — {med.dose} — {med.frequency}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Rappels */}
          <TabsContent value="reminders">
            <Card className="border-slate-100 shadow-none">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Mes rappels</h2>
              </div>
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
                          <p className="text-xs text-slate-400">
                            {new Date(r.scheduledAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge className={r.sent
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-orange-50 text-orange-600 border-orange-200'
                      }>
                        {r.sent ? 'Envoyé' : 'À venir'}
                      </Badge>
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