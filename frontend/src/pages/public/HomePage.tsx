import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, ArrowRight, GraduationCap, Users, BookOpen } from 'lucide-react';
import { usePublicAnnouncements, type PublicAnnouncement } from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/public/AnnouncementCard';

export default function HomePage() {
  const { data: announcementsData, isLoading } = usePublicAnnouncements({ per_page: 3 });

  const announcements: PublicAnnouncement[] = announcementsData?.items ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1B4F72] to-[#0D2B3E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F39C12] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F39C12] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <GraduationCap className="w-12 h-12 text-[#F39C12]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Don Bosco Connect
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto leading-relaxed">
              Plateforme numérique scolaire — Connexion, apprentissage, réussite.
            </p>
            <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              Notre portail public vous informe des actualités et événements de l'établissement.
              Connectez-vous pour accéder à votre espace personnel.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Se connecter à l'espace scolaire
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              À propos de notre établissement
            </h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              L'institut Don Bosco forme les leaders de demain depuis plus de 60 ans.
              Notre mission : offrir une éducation d'excellence dans un environnement bienveillant.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                value: '1 200+',
                label: 'Élèves inscrits',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: BookOpen,
                value: '85',
                label: 'Enseignants qualifiés',
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                icon: GraduationCap,
                value: '60+',
                label: "Années d'existence",
                color: 'from-amber-500 to-amber-600',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-[#1E293B] mb-2">{stat.value}</div>
                <div className="text-[#64748B]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Announcements Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2">
                Dernières annonces
              </h2>
              <p className="text-[#64748B] text-lg">
                Restez informé des actualités de l'établissement
              </p>
            </div>
            <Link
              to="/annonces"
              className="hidden sm:inline-flex items-center gap-2 text-[#1B4F72] hover:text-[#F39C12] font-semibold transition-colors"
            >
              <Megaphone className="w-5 h-5" />
              Voir toutes les annonces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <AnnouncementCard {...ann} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#64748B]">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Aucune annonce pour le moment</p>
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 text-[#1B4F72] hover:text-[#F39C12] font-semibold transition-colors"
            >
              Voir toutes les annonces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D2B3E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-8 h-8 text-[#F39C12]" />
                <span className="text-xl font-bold">Don Bosco Connect</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Plateforme numérique scolaire pour la communauté Don Bosco.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/80">Contact</h3>
              <ul className="space-y-2 text-white/60">
                <li>📍 Avenue de la République, Tunis</li>
                <li>📞 +216 71 123 456</li>
                <li>✉️ contact@donbosco.tn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/80">Liens utiles</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique RGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
            © 2026 Don Bosco Connect. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
