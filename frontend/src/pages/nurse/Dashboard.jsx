import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart, LogOut, Users, ClipboardList,
  AlertTriangle, TrendingUp, Bell, Activity
} from 'lucide-react';
import axios from 'axios';

export default function NurseDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertForm, setAlertForm] = useState({ doctorId: '', patientId: '', message: '' });
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('http://localhost:5000/api/nurses/patients', { headers });
        setPatients(res.data.patients);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleAlert = async () => {
    setAlertLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/nurses/alerts',
        alertForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setAlertLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
            { icon: ClipboardList, label: 'Dossiers médicaux' },
            { icon: Activity, label: 'Traitements' },
            { icon: AlertTriangle, label: 'Alertes' },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.name} 🩺</h1>
            <p className="text-slate-500 mt-1">Suivi des patients assignés</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-600 text-white gap-2">
                <AlertTriangle className="w-4 h-4" />
                Envoyer une alerte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Alerter le médecin</DialogTitle>
              </DialogHeader>
              {!alertSuccess ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>ID Médecin</Label>
                    <Input
                      placeholder="ex: 1"
                      value={alertForm.doctorId}
                      onChange={(e) => setAlertForm({ ...alertForm, doctorId: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Patient</Label>
                    <Input
                      placeholder="ex: 3"
                      value={alertForm.patientId}
                      onChange={(e) => setAlertForm({ ...alertForm, patientId: e.target.value })}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message d'alerte</Label>
                    <Textarea
                      placeholder="Décrivez le changement inquiétant observé..."
                      value={alertForm.message}
                      onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                      className="border-slate-200 min-h-24"
                    />
                  </div>
                  <Button
                    onClick={handleAlert}
                    disabled={alertLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {alertLoading ? 'Envoi...' : 'Envoyer l\'alerte'}
                  </Button>
                </div>
              ) : (
                <div className="pt-2 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Alerte envoyée !</p>
                    <p className="text-sm text-slate-500 mt-1">Le médecin a été notifié.</p>
                  </div>
                  <Button variant="outline" onClick={() => setAlertSuccess(false)} className="w-full">
                    Nouvelle alerte
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
              <span className="text-sm text-slate-500">Patients assignés</span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{patients.length}</div>
          </Card>
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Dossiers actifs</span>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{patients.length}</div>
          </Card>
          <Card className="p-5 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">Alertes envoyées</span>
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
          </Card>
        </div>

        {/* Patients */}
        <Card className="border-slate-100 shadow-none">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Patients assignés</h2>
            <p className="text-sm text-slate-500 mt-1">{patients.length} patients à surveiller</p>
          </div>
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
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-50 text-purple-600 border-purple-200">Patient</Badge>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-slate-200">
                      <ClipboardList className="w-3 h-3 mr-1" />
                      Dossier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}