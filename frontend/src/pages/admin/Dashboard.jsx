import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users, Stethoscope, Calendar, FileText,
  Heart, LogOut, TrendingUp, Shield,
  Activity, Bell
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
});

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const http = api(token);
        const [statsRes, usersRes, reportsRes] = await Promise.all([
          http.get('/admin/stats'),
          http.get('/admin/users'),
          http.get('/admin/reports'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        setReports(reportsRes.data.reports);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api(token).patch(`/admin/users/${userId}/status`, { isActive: !isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    } catch (error) {
      console.error(error);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      patient: 'bg-blue-50 text-blue-600 border-blue-200',
      doctor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      nurse: 'bg-purple-50 text-purple-600 border-purple-200',
      admin: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    const labels = { patient: 'Patient', doctor: 'Médecin', nurse: 'Aide-soignant', admin: 'Admin' };
    return <Badge className={`${styles[role]} hover:${styles[role]}`}>{labels[role]}</Badge>;
  };

  const getRoleIcon = (role) => {
    const icons = { patient: '🧑‍⚕️', doctor: '👨‍⚕️', nurse: '🩺', admin: '⚙️' };
    return icons[role] || '👤';
  };

  const navItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'consultations', icon: Calendar, label: 'Consultations' },
    { id: 'moderation', icon: Shield, label: 'Modération' },
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

  const statCards = [
    { label: 'Utilisateurs total', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-500' },
    { label: 'Patients', value: stats?.totalPatients || 0, icon: Heart, color: 'bg-red-50 text-red-500' },
    { label: 'Médecins', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Consultations', value: stats?.totalConsultations || 0, icon: Calendar, color: 'bg-purple-50 text-purple-500' },
    { label: 'Ordonnances', value: stats?.totalPrescriptions || 0, icon: FileText, color: 'bg-orange-50 text-orange-500' },
    { label: 'En attente', value: stats?.pendingConsultations || 0, icon: Activity, color: 'bg-yellow-50 text-yellow-500' },
  ];

  const roleData = [
    { name: 'Patients', value: stats?.totalPatients || 0, color: '#3b82f6' },
    { name: 'Médecins', value: stats?.totalDoctors || 0, color: '#10b981' },
    { name: 'Aide-soignants', value: stats?.totalNurses || 0, color: '#a855f7' },
    { name: 'Admins', value: stats?.totalAdmins || 0, color: '#f97316' },
  ];

  const statusData = [
    { name: 'En attente', value: stats?.pendingConsultations || 0, color: '#eab308' },
    { name: 'En cours', value: stats?.activeConsultations || 0, color: '#3b82f6' },
    { name: 'Terminées', value: stats?.doneConsultations || 0, color: '#22c55e' },
  ];

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
              <p className="text-xs text-slate-400">Administrateur</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.name} 👋</h1>
              <p className="text-slate-500 mt-1">Voici un aperçu de la plateforme HealthBridge</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <Card key={i} className="p-5 border-slate-100 shadow-none">
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

            <Card className="border-slate-100 shadow-none p-6">
              <h2 className="font-semibold text-slate-800 mb-1">Répartition des utilisateurs par rôle</h2>
              <p className="text-sm text-slate-500 mb-4">Vue d'ensemble de la communauté HealthBridge</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}

        {/* SECTION: Utilisateurs */}
        {activeSection === 'users' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
              <p className="text-slate-500 mt-1">{users.length} utilisateurs enregistrés</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              <div className="divide-y divide-slate-50">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                          {getRoleIcon(u.role)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(u.role)}
                      <Badge className={u.isActive
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-50'
                        : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-50'
                      }>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Button size="sm" variant="outline"
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className="text-xs h-7 border-slate-200">
                        {u.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* SECTION: Consultations */}
        {activeSection === 'consultations' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
              <p className="text-slate-500 mt-1">Vue d'ensemble des statuts de consultation</p>
            </div>
            <Card className="border-slate-100 shadow-none p-6 max-w-2xl">
              <h2 className="font-semibold text-slate-800 mb-1">Statut des consultations</h2>
              <p className="text-sm text-slate-500 mb-4">{stats?.totalConsultations || 0} consultations au total</p>
              {stats?.totalConsultations === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucune consultation pour l'instant</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Modération */}
        {activeSection === 'moderation' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Modération</h1>
              <p className="text-slate-500 mt-1">Signalements et problèmes à traiter</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              {reports.length === 0 ? (
                <div className="p-12 text-center">
                  <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Aucun signalement</p>
                  <p className="text-slate-400 text-sm mt-1">La plateforme fonctionne normalement ✅</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {reports.map((r, i) => (
                    <div key={i} className="px-6 py-4">{r.message}</div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SECTION: Notifications */}
        {activeSection === 'notifications' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500 mt-1">Alertes système de la plateforme</p>
            </div>
            <Card className="border-slate-100 shadow-none">
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucune notification</p>
              </div>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}