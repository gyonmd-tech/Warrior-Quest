import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ActivityDayRecord, Quest, UserProfile } from '../types';
import { playClickSound, playHoverSound } from '../utils/audio';

interface CalendarAnalyticsViewProps {
  user: UserProfile;
  quests: Quest[];
  activityLogs: ActivityDayRecord[];
  onSelectQuest?: (quest: Quest) => void;
}

export const CalendarAnalyticsView: React.FC<CalendarAnalyticsViewProps> = ({
  user,
  quests,
  activityLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'charts' | 'attributes'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Generate calendar grid days
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    playClickSound();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    playClickSound();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Build a lookup map for activity logs
  const activityMap: Record<string, ActivityDayRecord> = {};
  activityLogs.forEach((log) => {
    activityMap[log.date] = log;
  });

  // Calculate statistics metrics
  const totalCompletedQuests = quests.filter((q) => q.completed).length;
  const legendaryCount = quests.filter((q) => q.category === 'legendary' && q.completed).length;
  const dailyCount = quests.filter((q) => q.category === 'daily' && q.completed).length;
  const sideCount = quests.filter((q) => q.category === 'side' && q.completed).length;

  const categoryPieData = [
    { name: 'Legendary', value: legendaryCount || 1, color: '#ff0055' },
    { name: 'Harian', value: dailyCount || 3, color: '#b537f2' },
    { name: 'Side Quest', value: sideCount || 2, color: '#ff6b00' },
  ];

  const attributeStatsData = [
    { name: 'STR (Strength)', value: user.stats.strength, fill: '#ff0055' },
    { name: 'AGI (Agility)', value: user.stats.agility, fill: '#ff6b00' },
    { name: 'INT (Intelligence)', value: user.stats.intelligence, fill: '#00f5ff' },
    { name: 'VIT (Vitality)', value: user.stats.vitality, fill: '#39ff14' },
  ];

  // Daily XP chart data from activity logs
  const chartData = activityLogs.map((log) => ({
    date: log.date.slice(5), // MM-DD
    fullDate: log.date,
    xp: log.xpEarned,
    quests: log.questsCompleted,
    focus: log.focusMinutes,
  }));

  const totalFocusMinutes = activityLogs.reduce((acc, curr) => acc + curr.focusMinutes, 0);
  const totalXpLogged = activityLogs.reduce((acc, curr) => acc + curr.xpEarned, 0);

  // Selected Day Details
  const selectedDayActivity = activityMap[selectedDate];
  const selectedDayQuests = quests.filter((q) => {
    if (q.completedAt && q.completedAt.startsWith(selectedDate)) return true;
    if (q.createdAt && q.createdAt.startsWith(selectedDate)) return true;
    return false;
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Banner with Stats Overview */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-4 sm:p-5 chunky-border chunky-shadow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-pixel text-[8px] bg-[#ff0055] text-white px-2 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214]">
                LOG REALM & ANALITIK
              </span>
              <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
                🔥 {user.streakDays} HARI DISIPLIN
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#1b1214] mt-1">
              Kalender & Statistik Produktivitas
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#4a3034] mt-0.5">
              Pantau jadwal misi, rekaman duel fokus, riwayat XP harian, dan evaluasi matriks atribut hero Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-white p-2.5 chunky-border text-center flex-1 sm:flex-none shadow-[2px_2px_0px_#1b1214]">
              <span className="font-pixel text-[7px] text-[#805b60] uppercase block font-bold">TOTAL FOKUS</span>
              <span className="font-headline font-bold text-base text-[#007d7a]">{totalFocusMinutes} m</span>
            </div>
            <div className="bg-white p-2.5 chunky-border text-center flex-1 sm:flex-none shadow-[2px_2px_0px_#1b1214]">
              <span className="font-pixel text-[7px] text-[#805b60] uppercase block font-bold">XP TERKUMPUL</span>
              <span className="font-headline font-bold text-base text-[#ff0055]">+{totalXpLogged}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { id: 'calendar' as const, label: 'Kalender Misi', icon: 'calendar_month', bg: 'bg-[#ffea79]' },
          { id: 'charts' as const, label: 'Tren XP & Fokus', icon: 'monitoring', bg: 'bg-[#00f5ff]' },
          { id: 'attributes' as const, label: 'Matriks & Kategori', icon: 'pie_chart', bg: 'bg-[#39ff14]' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
              }}
              onMouseEnter={() => playHoverSound()}
              className={`py-2 px-1 text-center chunky-border font-pixel text-[7.5px] sm:text-[8px] transition-all cursor-pointer flex items-center justify-center gap-1 font-bold ${
                isActive
                  ? `${tab.bg} text-[#1b1214] shadow-[2.5px_2.5px_0px_#1b1214] -translate-y-0.5`
                  : 'bg-white text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE CALENDAR (Desktop: Side-by-side Calendar & Day Drawer) */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Calendar Grid Box */}
          <div className="lg:col-span-7 xl:col-span-7 bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-4">
            {/* Month Header Controller */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#ff0055]">
                  calendar_today
                </span>
                <h3 className="font-headline font-bold text-lg sm:text-xl text-[#1b1214]">
                  {monthNames[month]} {year}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  onMouseEnter={() => playHoverSound()}
                  className="w-8 h-8 bg-[#fff6f8] hover:bg-[#ffea79] chunky-border flex items-center justify-center cursor-pointer arcade-btn font-bold text-[#1b1214]"
                >
                  &lt;
                </button>
                <button
                  onClick={() => setCurrentMonthDate(new Date())}
                  className="px-2 py-1 bg-[#fff6f8] hover:bg-[#39ff14] chunky-border font-pixel text-[7px] text-[#1b1214] font-bold cursor-pointer"
                >
                  HARI INI
                </button>
                <button
                  onClick={handleNextMonth}
                  onMouseEnter={() => playHoverSound()}
                  className="w-8 h-8 bg-[#fff6f8] hover:bg-[#ffea79] chunky-border flex items-center justify-center cursor-pointer arcade-btn font-bold text-[#1b1214]"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-pixel text-[7.5px] text-[#805b60] font-bold uppercase pb-1 border-b border-[#ffe2e6]">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <div key={i} className={i === 0 ? 'text-[#ff0055]' : ''}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[64px] bg-[#fff6f8]/40 border border-dashed border-[#ffd0d7]" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const activity = activityMap[dateStr];
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      playClickSound();
                      setSelectedDate(dateStr);
                    }}
                    onMouseEnter={() => playHoverSound()}
                    className={`min-h-[50px] sm:min-h-[64px] p-1 sm:p-1.5 chunky-border flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#ffea79] border-[#1b1214] shadow-[2px_2px_0px_#1b1214] -translate-y-0.5 z-10'
                        : activity
                        ? 'bg-[#ebfff4] hover:bg-[#d6fce5]'
                        : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                    } ${isToday ? 'ring-2 ring-[#ff0055]' : ''}`}
                  >
                    {/* Day Number and Today Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-pixel text-[7.5px] sm:text-[8px] font-bold ${
                          isToday ? 'text-[#ff0055]' : 'text-[#1b1214]'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 bg-[#ff0055] rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Activity Indicator Dots & XP Tag */}
                    {activity ? (
                      <div className="space-y-0.5">
                        <div className="font-pixel text-[6px] sm:text-[6.5px] text-[#007d7a] font-bold truncate">
                          +{activity.xpEarned} XP
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px] sm:text-[12px] text-[#ff6b00]">
                            local_fire_department
                          </span>
                          <span className="font-body text-[9px] text-[#1b1214] font-bold">
                            {activity.questsCompleted}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-transparent text-[6px]">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          <div className="lg:col-span-5 xl:col-span-5 bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#ffe2e6] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#007d7a]">
                  event_available
                </span>
                <h4 className="font-headline font-bold text-base sm:text-lg text-[#1b1214]">
                  Log Tanggal: <span className="text-[#ff0055]">{selectedDate}</span>
                </h4>
              </div>

              {selectedDayActivity && (
                <span className="font-pixel text-[7.5px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold">
                  +{selectedDayActivity.xpEarned} XP
                </span>
              )}
            </div>

            {selectedDayActivity && (
              <div className="grid grid-cols-2 gap-2 py-1">
                <div className="p-2 bg-[#fff6f8] chunky-border text-center">
                  <span className="font-pixel text-[7px] text-[#805b60] block uppercase font-bold">DURASI FOKUS</span>
                  <span className="font-headline font-bold text-base text-[#007d7a]">
                    {selectedDayActivity.focusMinutes} Menit
                  </span>
                </div>
                <div className="p-2 bg-[#fff6f8] chunky-border text-center">
                  <span className="font-pixel text-[7px] text-[#805b60] block uppercase font-bold">QUEST TUNTAS</span>
                  <span className="font-headline font-bold text-base text-[#ff0055]">
                    {selectedDayActivity.questsCompleted} Misi
                  </span>
                </div>
              </div>
            )}

            {selectedDayQuests.length === 0 ? (
              <p className="font-body text-xs text-[#805b60] italic py-2">
                Tidak ada riwayat quest yang tercatat pada tanggal ini. Pilih tanggal lain dengan indikator hijau untuk melihat catatan petualangan!
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayQuests.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 bg-[#fff6f8] chunky-border flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 chunky-border flex items-center justify-center shrink-0 ${
                          q.completed ? 'bg-[#39ff14]' : 'bg-white'
                        }`}
                      >
                        {q.completed && <span className="material-symbols-outlined text-[10px]">check</span>}
                      </div>
                      <span
                        className={`font-headline font-bold text-xs sm:text-sm truncate ${
                          q.completed ? 'line-through text-[#805b60]' : 'text-[#1b1214]'
                        }`}
                      >
                        {q.title}
                      </span>
                    </div>
                    <span className="font-pixel text-[7px] bg-[#ffea79] px-1.5 py-0.5 chunky-border font-bold shrink-0">
                      +{q.xpReward} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADVANCED RECHARTS GRAPHS (Desktop: Side-by-side XP & Focus charts) */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* XP Trend Chart */}
          <div className="bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base sm:text-lg text-[#ff0055] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                Grafik Perolehan XP Harian
              </h3>
              <span className="font-pixel text-[7.5px] bg-[#ffea79] px-2 py-0.5 chunky-border font-bold">
                7 HARI TERAKHIR
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0055" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ff0055" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fcc2ca" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a3034' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a3034' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1b1214',
                      borderColor: '#39ff14',
                      borderWidth: '2px',
                      color: '#ffffff',
                      fontFamily: 'Quicksand, sans-serif',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#ff0055"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#xpGradient)"
                    name="XP Didapat"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Focus Minutes Bar Chart */}
          <div className="bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base sm:text-lg text-[#007d7a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                Durasi Fokus Pomodoro (Menit)
              </h3>
              <span className="font-pixel text-[7.5px] bg-[#00f5ff] px-2 py-0.5 chunky-border font-bold">
                DEEP WORK
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffd0d7" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a3034' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a3034' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1b1214',
                      borderColor: '#00f5ff',
                      borderWidth: '2px',
                      color: '#ffffff',
                      fontFamily: 'Quicksand, sans-serif',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Bar dataKey="focus" fill="#00f5ff" stroke="#1b1214" strokeWidth={2} name="Menit Fokus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTRIBUTES & CATEGORIES MATRIX */}
      {activeTab === 'attributes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category Pie Breakdown */}
          <div className="bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-3">
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#1b1214] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#b537f2]">donut_large</span>
              Distribusi Kategori Quest
            </h3>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1b1214" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Quicksand, sans-serif' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#ffe2e6] text-center font-pixel text-[7px]">
              <div className="bg-[#fff0f3] p-1.5 chunky-border">
                <span className="block text-[#ff0055] font-bold">LEGENDARY</span>
                <span className="font-headline font-bold text-xs">{legendaryCount} Quest</span>
              </div>
              <div className="bg-[#fff0f3] p-1.5 chunky-border">
                <span className="block text-[#b537f2] font-bold">HARIAN</span>
                <span className="font-headline font-bold text-xs">{dailyCount} Quest</span>
              </div>
              <div className="bg-[#fff0f3] p-1.5 chunky-border">
                <span className="block text-[#ff6b00] font-bold">SIDE QUEST</span>
                <span className="font-headline font-bold text-xs">{sideCount} Quest</span>
              </div>
            </div>
          </div>

          {/* Attribute Power Stats Matrix */}
          <div className="bg-white p-4 sm:p-5 chunky-border chunky-shadow space-y-3">
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#1b1214] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#39ff14]">military_tech</span>
              Keseimbangan Atribut Hero
            </h3>

            <div className="space-y-2.5 pt-1">
              {attributeStatsData.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-headline font-bold text-xs text-[#1b1214]">
                    <span>{stat.name}</span>
                    <span className="font-pixel text-[8px]">{stat.value} PTS</span>
                  </div>
                  <div className="w-full h-3 bg-[#fff6f8] chunky-border overflow-hidden p-0.5">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, stat.value * 2.5)}%`,
                        backgroundColor: stat.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-[#fff6f8] chunky-border text-xs text-[#4a3034] space-y-1">
              <div className="font-bold text-[#1b1214]">💡 Insight Produktivitas:</div>
              <p>
                Atribut tertinggi Anda saat ini mencerminkan fokus disiplin harian. Selesaikan quest dengan atribut pelengkap untuk menyeimbangkan performa hero Anda!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
