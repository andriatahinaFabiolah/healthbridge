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
import axios from 'axios';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', { headers }),
          axios.get('http://localhost:5000/api/admin/users', { headers }),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">HealthBridge</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: TrendingUp, label: 'Dashboard', active: true },
            { icon: Users, label: 'Utilisateurs' },
            { icon: Calendar, label: 'Consultations' },
            { icon: Shield, label: 'Modération' },
            { icon: Bell, label: 'Notifications' },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">Voici un aperçu de la plateforme HealthBridge</p>
        </div>

        {/* Stats */}
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

        {/* Users table */}
        <Card className="border-slate-100 shadow-none">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Gestion des utilisateurs</h2>
            <p className="text-sm text-slate-500 mt-1">{users.length} utilisateurs enregistrés</p>
          </div>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(u.id, u.isActive)}
                    className="text-xs h-7 border-slate-200"
                  >
                    {u.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}