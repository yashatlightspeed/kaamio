import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '⚡', title: 'Kanban Boards', desc: 'Drag-and-drop task management with real-time updates across your team.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track team productivity, project progress, and deadlines at a glance.' },
  { icon: '🔔', title: 'Real-time Notifications', desc: 'Never miss an update. Get instant alerts for tasks, deadlines, and mentions.' },
  { icon: '🛡️', title: 'Role-based Access', desc: 'Admin and member roles with fine-grained permissions and controls.' },
  { icon: '📅', title: 'Deadline Tracking', desc: 'Visual deadline monitoring with overdue alerts and priority flags.' },
  { icon: '🤝', title: 'Team Collaboration', desc: 'Comments, subtasks, and activity logs for complete team transparency.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-900 bg-grid text-white overflow-hidden">
      {/* Glow orbs */}
      <div className="glow-orb w-[600px] h-[600px] bg-brand-700/20 -top-40 -left-20" />
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-600/15 top-80 right-0" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">Kaamio</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm px-3 py-1.5">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm px-4 py-1.5">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-600/15 border border-brand-500/25 rounded-full px-4 py-1.5 text-brand-300 text-sm font-medium mb-6">
            <span>🚀</span> Full-stack team task management
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Work Smart.<br />
            <span className="gradient-text">Build Faster.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kaamio is the all-in-one productivity platform for teams. Manage projects, assign tasks, track deadlines, and monitor performance — all in one beautiful workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-3 shadow-glow">
              Start for free →
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Dashboard preview mockup */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 px-6 pb-16 max-w-5xl mx-auto"
      >
        <div className="rounded-2xl border border-white/10 bg-surface-800/50 backdrop-blur-sm p-1 shadow-2xl">
          <div className="bg-surface-800 rounded-xl p-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Active Projects', value: '12', color: 'brand' },
              { label: 'Tasks Completed', value: '89%', color: 'emerald' },
              { label: 'Team Members', value: '24', color: 'blue' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-700 rounded-xl p-4 border border-white/5">
                <div className={`text-2xl font-black mb-1 ${stat.color === 'brand' ? 'gradient-text' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {stat.value}
                </div>
                <div className="text-slate-500 text-xs">{stat.label}</div>
              </div>
            ))}
            <div className="col-span-3 bg-surface-700 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-slate-500 mb-2">Project progress</div>
              <div className="space-y-2">
                {[
                  { name: 'AIHRT Platform', progress: 78 },
                  { name: 'Mobile App v2', progress: 45 },
                  { name: 'API Redesign', progress: 92 },
                ].map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{p.name}</span><span>{p.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Everything your team needs
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From Kanban boards to analytics dashboards — Kaamio has all the tools to keep your team aligned and productive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className="card-hover p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/25 flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-20 text-center">
        <div className="max-w-2xl mx-auto card p-10">
          <h2 className="text-3xl font-black mb-4">Ready to build faster?</h2>
          <p className="text-slate-400 mb-8">Join teams who use Kaamio to stay organized and deliver on time.</p>
          <Link to="/signup" className="btn-primary text-base px-8 py-3 shadow-glow inline-block">
            Get started for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} Kaamio — Work Smart. Build Faster.
      </footer>
    </div>
  );
};

export default Landing;
