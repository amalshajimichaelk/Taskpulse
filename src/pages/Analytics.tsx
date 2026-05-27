import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, CheckCircle2, Clock, Download, ArrowUpRight } from "lucide-react";
import { SkeletonChart } from "../components/ui/SkeletonLoader";
import { Avatar } from "../components/ui/Avatar";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const weeklyData = [
  { day: "Mon", completed: 8, created: 12 },
  { day: "Tue", completed: 14, created: 10 },
  { day: "Wed", completed: 11, created: 15 },
  { day: "Thu", completed: 18, created: 13 },
  { day: "Fri", completed: 22, created: 9 },
  { day: "Sat", completed: 6, created: 4 },
  { day: "Sun", completed: 3, created: 2 },
];

const teamPerf = [
  { name: "Elena", rate: 87, tasks: 24, color: "#6366F1" },
  { name: "Marcus", rate: 73, tasks: 18, color: "#06B6D4" },
  { name: "Sarah", rate: 95, tasks: 31, color: "#10B981" },
  { name: "Alex", rate: 64, tasks: 14, color: "#F59E0B" },
];

const statusDist = [
  { name: "Completed", value: 65, color: "#10B981" },
  { name: "In Progress", value: 20, color: "#06B6D4" },
  { name: "Review", value: 10, color: "#F59E0B" },
  { name: "Todo", value: 5, color: "#6366F1" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color || p.fill }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 128, completed: 84, productivityScore: 92, teamSize: 8 });
  const { success } = useToast();

  useEffect(() => {
    api.get("/analytics/dashboard")
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setTimeout(() => setLoading(false), 500));
  }, []);

  const handleExportPDF = async () => {
    try {
      success("Export Started", "Generating charts for PDF... Please wait.");
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("TaskPulse Analytics Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Overview metrics", 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Tasks', stats.total.toString()],
          ['Tasks Completed', stats.completed.toString()],
          ['Productivity Score', `${stats.productivityScore}%`],
          ['Active Members', stats.teamSize.toString()],
        ],
      });
      
      let finalY = (doc as any).lastAutoTable.finalY || 50;

      // Capture charts
      const chartsEl = document.getElementById("analytics-charts-row");
      if (chartsEl) {
        const canvas = await html2canvas(chartsEl, { 
          scale: 2, 
          backgroundColor: "#1E293B" // Match dark mode background for visibility
        });
        const imgData = canvas.toDataURL("image/png");
        
        const pdfWidth = 210; 
        const margin = 14;
        const availableWidth = pdfWidth - margin * 2;
        const imgProps = doc.getImageProperties(imgData);
        const imgHeight = (imgProps.height * availableWidth) / imgProps.width;
        
        if (finalY + 15 + imgHeight > 280) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY += 15;
        }

        doc.text("Visual Analytics", margin, finalY);
        doc.addImage(imgData, "PNG", margin, finalY + 5, availableWidth, imgHeight);
        finalY = finalY + imgHeight + 15;
      }
      
      if (finalY > 260) { doc.addPage(); finalY = 20; }
      
      doc.text("Team Performance", 14, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Member', 'Tasks', 'Completion Rate']],
        body: teamPerf.map(m => [m.name, m.tasks.toString(), `${m.rate}%`]),
      });
      
      doc.save(`TaskPulse_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
      success("Export Complete", "PDF with charts downloaded successfully.");
    } catch (err) {
      console.error(err);
      success("Export Failed", "There was an error generating the PDF.");
    }
  };

  const kpiCards = [
    { label: "Tasks Completed", value: stats.completed, sub: `of ${stats.total} total`, icon: CheckCircle2, color: "text-success", gradient: "from-success/20 to-transparent" },
    { label: "Productivity Score", value: `${stats.productivityScore}%`, sub: "+5pts this week", icon: TrendingUp, color: "text-accent-primary", gradient: "from-accent-primary/20 to-transparent" },
    { label: "Avg Completion Time", value: "2.4d", sub: "-0.3d vs last month", icon: Clock, color: "text-accent-secondary", gradient: "from-accent-secondary/20 to-transparent" },
    { label: "Active Members", value: stats.teamSize, sub: "3 online now", icon: Users, color: "text-warning", gradient: "from-warning/20 to-transparent" },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart /><SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Analytics</h2>
          <p className="text-sm text-text-secondary">Performance insights & team metrics</p>
        </div>
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <Download size={15} /> Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel rounded-2xl p-5 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`} />
              <div className="relative z-10">
                <Icon size={20} className={`${card.color} mb-3`} />
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-3xl font-bold font-display text-text-primary">{card.value}</p>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div id="analytics-charts-row" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title">Task Activity</h3>
              <p className="text-xs text-text-secondary mt-0.5">Created vs Completed this week</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-primary" /> Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Completed</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="created" name="Created" fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="section-title mb-6">Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusDist.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {statusDist.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="font-bold text-text-primary">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Team Performance</h3>
            <p className="text-xs text-text-secondary mt-0.5">Individual completion rates</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-accent-primary hover:underline"><ArrowUpRight size={13} /> View All</button>
        </div>
        <div className="space-y-4">
          {teamPerf.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-center gap-4">
              <Avatar name={member.name} size="sm" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-text-primary">{member.name}</span>
                  <span className="font-bold" style={{ color: member.color }}>{member.rate}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    style={{ background: member.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${member.rate}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                  />
                </div>
              </div>
              <span className="text-xs text-text-secondary flex-none">{member.tasks} tasks</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
