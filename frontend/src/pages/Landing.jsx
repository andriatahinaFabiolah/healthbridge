import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Shield, Clock, Users, 
  Stethoscope, MessageCircle, Bell, ChartBar 
} from 'lucide-react';

const features = [
  { icon: Stethoscope, title: 'Consultation en ligne', desc: 'Consultez un médecin spécialiste depuis chez vous en quelques minutes.' },
  { icon: MessageCircle, title: 'Chat en temps réel', desc: 'Discutez avec votre médecin et obtenez des réponses instantanées.' },
  { icon: Bell, title: 'Rappels intelligents', desc: 'Ne manquez plus jamais un médicament ou une consultation.' },
  { icon: Shield, title: 'Données sécurisées', desc: 'Vos données médicales sont chiffrées et protégées.' },
  { icon: Clock, title: 'Disponible 24h/24', desc: 'Accédez à votre espace santé à tout moment.' },
  { icon: Users, title: 'Équipe médicale complète', desc: 'Médecins, aide-soignants et administrateurs connectés.' },
];

const stats = [
  { value: '500+', label: 'Médecins spécialistes' },
  { value: '10k+', label: 'Patients satisfaits' },
  { value: '98%', label: 'Taux de satisfaction' },
  { value: '24/7', label: 'Disponibilité' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-lg">HealthBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Se connecter
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => navigate('/register')}
            >
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            🏥 Télémédecine nouvelle génération
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Votre santé,{' '}
            <span className="text-emerald-500">simplifiée</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connectez-vous avec les meilleurs spécialistes, suivez votre traitement 
            et consultez depuis n'importe où — tout en un seul endroit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base"
              onClick={() => navigate('/register')}
            >
              Créer mon espace santé
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 h-12 text-base border-slate-200"
              onClick={() => navigate('/login')}
            >
              J'ai déjà un compte
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Une plateforme complète pour gérer votre santé au quotidien.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-emerald-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à prendre soin de votre santé ?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Rejoignez des milliers de patients qui font confiance à HealthBridge.
          </p>
          <Button 
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 h-12 text-base font-semibold"
            onClick={() => navigate('/register')}
          >
            Commencer gratuitement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-700">HealthBridge</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 HealthBridge. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}