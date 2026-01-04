import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  TrendingUp, Users, ShoppingCart, FileText, 
  CheckCircle2, Clock, Send, Trophy, Filter, 
  RefreshCw, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, LineChart, DollarSign, Calendar, 
  AlertCircle, Eye, X, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, 
  Pie, Cell, Area, AreaChart
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { logger } from '@/utils/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { DashboardFilters } from '@/components/admin/dashboard/DashboardFilters';

// ============================================
// TYPES & INTERFACES (JSDoc comments)
// ============================================

/**
 * @typedef {Object} Lead
 * @property {string} id
 * @property {string} created_at
 * @property {string} [nom]
 * @property {string} [societe]
 * @property {string} [email]
 * @property {string} [telephone]
 * @property {string} statut
 * @property {string} [source]
 * @property {number} [montant_cee_estime]
 * @property {string} [responsable_id]
 */

/**
 * @typedef {Object} Commande
 * @property {string} id
 * @property {string} date_creation
 * @property {string} [reference]
 * @property {string} [nom_client]
 * @property {string} [email]
 * @property {number} [total_ttc]
 * @property {number} [total_ht]
 * @property {string} [paiement_statut]
 * @property {string} [mode_suivi]
 * @property {string} [source]
 */

/**
 * @typedef {Object} SourceStats
 * @property {string} source
 * @property {number} leads
 * @property {number} orders
 * @property {number} conversion
 * @property {number} revenue
 */

// ============================================
// CONSTANTS
// ============================================

const STATUS_COLORS = {
  'nouveau': '#3B82F6',
  'devis_a_preparer': '#F59E0B',
  'devis_envoye': '#8B5CF6',
  'en_negociation': '#EC4899',
  'gagne': '#10B981',
  'perdu': '#EF4444',
};

const QUALIFIED_STATUSES = ['devis_a_preparer', 'devis_envoye', 'en_negociation', 'gagne'];

const COMMANDE_STATUS_COLORS = {
  'payee': '#10B981',
  'en_attente': '#F59E0B',
  'refusee': '#EF4444',
  'annulee': '#6B7280',
};

// ============================================
// COMPONENTS
// ============================================

const KPICard = ({ title, value, trend, trendValue, icon: Icon, iconColor = 'bg-gradient-to-br from-green-400 to-emerald-500', loading = false, subtitle, gradientFrom, gradientTo }) => {
  const isPositive = trendValue >= 0;
  
  // Couleurs par défaut basées sur iconColor
  const colorMap = {
    'bg-blue-500': { from: 'from-blue-400', to: 'to-cyan-500', shadow: 'shadow-blue-500/20', text: 'text-blue-600' },
    'bg-green-500': { from: 'from-green-400', to: 'to-emerald-500', shadow: 'shadow-green-500/20', text: 'text-green-600' },
    'bg-purple-500': { from: 'from-purple-400', to: 'to-pink-500', shadow: 'shadow-purple-500/20', text: 'text-purple-600' },
    'bg-emerald-500': { from: 'from-emerald-400', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600' },
    'bg-amber-500': { from: 'from-amber-400', to: 'to-orange-500', shadow: 'shadow-amber-500/20', text: 'text-amber-600' },
    'bg-orange-500': { from: 'from-orange-400', to: 'to-red-500', shadow: 'shadow-orange-500/20', text: 'text-orange-600' },
  };
  
  const colors = colorMap[iconColor] || { from: 'from-indigo-400', to: 'to-purple-500', shadow: 'shadow-indigo-500/20', text: 'text-indigo-600' };
  
  if (loading) {
    return (
      <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`rounded-xl border-0 shadow-lg ${colors.shadow} hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-${colors.from.split('-')[1]}-50/30 h-full`}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 truncate">{title}</p>
            <p className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent mb-2`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-600 font-medium truncate mb-2">{subtitle}</p>
            )}
            {trend !== null && trend !== undefined && !isNaN(trendValue) && trendValue !== 0 && (
              <div className={`flex items-center gap-1.5 text-xs mt-2 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span>{Math.abs(trendValue).toFixed(1)}%</span>
                <span className="text-gray-400 font-normal">vs précédent</span>
              </div>
            )}
          </div>
          <div className={`h-12 w-12 lg:h-14 lg:w-14 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shadow-lg ${colors.shadow} flex-shrink-0 ml-2 lg:ml-3`}>
            <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status, type = 'lead' }) => {
  if (type === 'lead') {
    const color = STATUS_COLORS[status] || '#6B7280';
    return (
      <Badge 
        variant="outline" 
        className="text-xs"
        style={{ borderColor: color, color: color, backgroundColor: `${color}10` }}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  } else {
    const color = COMMANDE_STATUS_COLORS[status] || '#6B7280';
    return (
      <Badge 
        variant="outline" 
        className="text-xs"
        style={{ borderColor: color, color: color, backgroundColor: `${color}10` }}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUser();
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Filters
  const [period, setPeriod] = useState('30d');
  const [dataType, setDataType] = useState('all'); // 'all', 'leads', 'commandes'
  const [source, setSource] = useState('all');
  const [chartView, setChartView] = useState('daily'); // 'daily', 'weekly', 'monthly'
  
  // Data
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [leadsStatusBreakdown, setLeadsStatusBreakdown] = useState([]);
  const [ordersStatusBreakdown, setOrdersStatusBreakdown] = useState([]);
  const [topSources, setTopSources] = useState([]);
  const [topClients, setTopClients] = useState([]);
  
  // KPIs
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsTrend, setLeadsTrend] = useState(0);
  const [qualifiedLeads, setQualifiedLeads] = useState(0);
  const [qualifiedPercentage, setQualifiedPercentage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersTrend, setOrdersTrend] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgBasket, setAvgBasket] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '12m') {
      startDate.setMonth(startDate.getMonth() - 12);
      startDate.setHours(0, 0, 0, 0);
    }
    
    return { startDate, endDate };
  };

  // Get previous period for comparison
  const getPreviousPeriod = () => {
    const { startDate, endDate } = getDateRange();
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate);
    prevEndDate.setTime(prevEndDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setTime(prevStartDate.getTime() - periodLength);
    return { prevStartDate, prevEndDate };
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch leads
      let leadsQuery = supabase
        .from('leads')
        .select('id, created_at, nom, societe, email, telephone, statut, source, montant_cee_estime, responsable_id, commercial_assigne_id')
        .gte('created_at', startISO)
        .lte('created_at', endISO);
      
      // Filter by assigned commercial if user is a commercial
      if (profile?.role?.slug === 'commercial' && profile?.id) {
        leadsQuery = leadsQuery.eq('commercial_assigne_id', profile.id);
      }
      
      if (source !== 'all') {
        leadsQuery = leadsQuery.eq('source', source);
      }
      
      const { data: allLeads, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      // Fetch orders
      let ordersQuery = supabase
        .from('commandes')
        .select('id, date_creation, reference, nom_client, email, total_ttc, total_ht, paiement_statut, mode_suivi, source, commercial_assigne_id')
        .gte('date_creation', startISO)
        .lte('date_creation', endISO);
      
      // Filter by assigned commercial if user is a commercial
      // Note: commandes table might not have commercial_assigne_id yet, so we check if it exists
      if (profile?.role?.slug === 'commercial' && profile?.id) {
        // Try to filter by commercial_assigne_id if column exists
        // If column doesn't exist, this will be ignored (no error)
        try {
          ordersQuery = ordersQuery.eq('commercial_assigne_id', profile.id);
        } catch (e) {
          // Column might not exist, ignore
        }
      }
      
      if (source !== 'all') {
        ordersQuery = ordersQuery.eq('source', source);
      }
      
      const { data: allOrders, error: ordersError } = await ordersQuery;
      if (ordersError) {
        // Fallback if columns don't exist
        logger.warn('Error fetching orders, trying fallback');
        const { data: fallbackOrders } = await supabase
          .from('commandes')
          .select('id, date_creation, reference, nom_client, email')
          .gte('date_creation', startISO)
          .lte('date_creation', endISO);
        setOrders((fallbackOrders || []).map(o => ({ ...o, total_ttc: 0, paiement_statut: 'en_attente' })));
      } else {
        setOrders(allOrders || []);
      }

      // Filter by data type
      const filteredLeads = dataType === 'commandes' ? [] : (allLeads || []);
      const filteredOrders = dataType === 'leads' ? [] : (allOrders || []);

      setLeads(filteredLeads);
      if (!ordersError) {
        setOrders(filteredOrders);
      }

      // Calculate KPIs
      setTotalLeads(filteredLeads.length);
      
      // Qualified leads
      const qualified = filteredLeads.filter(l => QUALIFIED_STATUSES.includes(l.statut));
      setQualifiedLeads(qualified.length);
      setQualifiedPercentage(filteredLeads.length > 0 ? (qualified.length / filteredLeads.length * 100) : 0);
      
      // Orders
      setTotalOrders(filteredOrders.length);
      
      // Revenue
      const revenue = (filteredOrders || []).reduce((sum, o) => sum + (o.total_ttc || o.total_ht || 0), 0);
      setTotalRevenue(revenue);
      setAvgBasket(filteredOrders.length > 0 ? revenue / filteredOrders.length : 0);
      
      // Conversion rate
      const conversion = filteredLeads.length > 0 ? (filteredOrders.length / filteredLeads.length * 100) : 0;
      setConversionRate(conversion);
      
      // Pending orders
      const pending = filteredOrders.filter(o => 
        o.paiement_statut === 'en_attente' || o.paiement_statut === 'en_cours'
      ).length;
      setPendingOrders(pending);

      // Trends (compare with previous period)
      const { prevStartDate, prevEndDate } = getPreviousPeriod();
      const { count: prevLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevStartDate.toISOString())
        .lte('created_at', prevEndDate.toISOString());
      
      const { count: prevOrdersCount } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .gte('date_creation', prevStartDate.toISOString())
        .lte('date_creation', prevEndDate.toISOString());

      const leadsTrendValue = (prevLeadsCount || 0) > 0 
        ? ((filteredLeads.length - (prevLeadsCount || 0)) / (prevLeadsCount || 0) * 100)
        : 0;
      setLeadsTrend(leadsTrendValue);

      const ordersTrendValue = (prevOrdersCount || 0) > 0
        ? ((filteredOrders.length - (prevOrdersCount || 0)) / (prevOrdersCount || 0) * 100)
        : 0;
      setOrdersTrend(ordersTrendValue);

      // Chart data
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const periodMap = new Map();
      
      if (chartView === 'daily' && daysDiff <= 90) {
        for (let i = 0; i < daysDiff; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          periodMap.set(key, { name: key, leads: 0, commandes: 0, date: d });
        }
      } else if (chartView === 'weekly') {
        const weeks = Math.ceil(daysDiff / 7);
        for (let i = 0; i < weeks; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + (i * 7));
          const weekNum = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          const key = `Sem. ${weekNum}`;
          periodMap.set(key, { name: key, leads: 0, commandes: 0, date: d });
        }
      } else {
        const months = Math.ceil(daysDiff / 30);
        for (let i = 0; i < months; i++) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + i);
          const key = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
          periodMap.set(key, { name: key, leads: 0, commandes: 0, date: d });
        }
      }

      // Populate chart data
      filteredLeads.forEach(lead => {
        const date = new Date(lead.created_at);
        let key = '';
        if (chartView === 'daily') {
          key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        } else if (chartView === 'weekly') {
          const weekNum = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          key = `Sem. ${weekNum}`;
        } else {
          key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        }
        if (periodMap.has(key)) {
          periodMap.get(key).leads++;
        }
      });

      filteredOrders.forEach(order => {
        const date = new Date(order.date_creation);
        let key = '';
        if (chartView === 'daily') {
          key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        } else if (chartView === 'weekly') {
          const weekNum = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          key = `Sem. ${weekNum}`;
        } else {
          key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        }
        if (periodMap.has(key)) {
          periodMap.get(key).commandes++;
        }
      });

      setChartData(Array.from(periodMap.values()));

      // Status breakdowns
      const leadsStatusCount = {};
      filteredLeads.forEach(lead => {
        const status = lead.statut || 'nouveau';
        leadsStatusCount[status] = (leadsStatusCount[status] || 0) + 1;
      });
      setLeadsStatusBreakdown(Object.entries(leadsStatusCount).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#6B7280'
      })));

      const ordersStatusCount = {};
      filteredOrders.forEach(order => {
        const status = order.paiement_statut || 'en_attente';
        ordersStatusCount[status] = (ordersStatusCount[status] || 0) + 1;
      });
      setOrdersStatusBreakdown(Object.entries(ordersStatusCount).map(([name, value]) => ({
        name,
        value,
        color: COMMANDE_STATUS_COLORS[name] || '#6B7280'
      })));

      // Top sources
      const sourceMap = new Map();
      filteredLeads.forEach(lead => {
        const src = lead.source || 'Autre';
        if (!sourceMap.has(src)) {
          sourceMap.set(src, { source: src, leads: 0, orders: 0, conversion: 0, revenue: 0 });
        }
        const leadStats = sourceMap.get(src);
        if (leadStats) {
          leadStats.leads++;
        }
      });
      filteredOrders.forEach(order => {
        const src = order.source || 'Autre';
        if (!sourceMap.has(src)) {
          sourceMap.set(src, { source: src, leads: 0, orders: 0, conversion: 0, revenue: 0 });
        }
        const stats = sourceMap.get(src);
        if (stats) {
          stats.orders++;
          stats.revenue += (order.total_ttc || order.total_ht || 0);
        }
      });
      sourceMap.forEach((stats, src) => {
        stats.conversion = stats.leads > 0 ? (stats.orders / stats.leads * 100) : 0;
      });
      setTopSources(Array.from(sourceMap.values()).sort((a, b) => b.leads - a.leads).slice(0, 5));

      // Top clients
      const clientMap = new Map();
      filteredOrders.forEach(order => {
        const clientName = order.nom_client || order.email || 'Client inconnu';
        if (!clientMap.has(clientName)) {
          clientMap.set(clientName, { name: clientName, orders: 0, revenue: 0 });
        }
        const client = clientMap.get(clientName);
        if (client) {
          client.orders++;
          client.revenue += (order.total_ttc || order.total_ht || 0);
        }
      });
      setTopClients(Array.from(clientMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

      setLastUpdate(new Date());
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur de chargement",
        description: error.message?.includes('column') 
          ? "Certaines colonnes sont manquantes dans la base de données."
          : "Impossible de charger les données. Vérifiez votre connexion.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, dataType, source, chartView]);

  const resetFilters = () => {
    setPeriod('30d');
    setDataType('all');
    setSource('all');
    setChartView('daily');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2 text-slate-900">{payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const periodLabel = useMemo(() => {
    const labels = {
      'today': 'Aujourd\'hui',
      '7d': '7 derniers jours',
      '30d': '30 derniers jours',
      'month': 'Mois en cours',
      '12m': '12 derniers mois'
    };
    return labels[period] || period;
  }, [period]);

  const activeFiltersCount = [
    period !== '30d',
    dataType !== 'all',
    source !== 'all',
    chartView !== 'daily',
  ].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Effinor Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 pl-0 pr-4 pt-4 pb-4 sm:pr-5 sm:pt-5 sm:pb-5 lg:pr-6 lg:pt-6 lg:pb-6 xl:pr-8 xl:pt-8 xl:pb-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 lg:pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-2 font-medium">
                Vue d'ensemble Leads & Commandes
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <DashboardFilters
            period={period}
            onPeriodChange={setPeriod}
            dataType={dataType}
            onDataTypeChange={setDataType}
            source={source}
            onSourceChange={setSource}
            chartView={chartView}
            onChartViewChange={setChartView}
            onResetFilters={resetFilters}
            periodLabel={periodLabel}
            lastUpdate={lastUpdate}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* KPI Cards */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
            Indicateurs clés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-6">
          <KPICard
            title="Total Leads"
            value={totalLeads.toLocaleString()}
            trend={leadsTrend}
            trendValue={leadsTrend}
            icon={Users}
            iconColor="bg-blue-500"
            loading={loading}
            subtitle={`Période sélectionnée`}
          />
          <KPICard
            title="Leads qualifiés"
            value={qualifiedLeads.toLocaleString()}
            trend={null}
            trendValue={0}
            icon={CheckCircle2}
            iconColor="bg-green-500"
            loading={loading}
            subtitle={`${qualifiedPercentage.toFixed(1)}% des leads`}
          />
          <KPICard
            title="Total Commandes"
            value={totalOrders.toLocaleString()}
            trend={ordersTrend}
            trendValue={ordersTrend}
            icon={ShoppingCart}
            iconColor="bg-purple-500"
            loading={loading}
            subtitle={`Période sélectionnée`}
          />
          <KPICard
            title="CA Commandes (TTC)"
            value={formatCurrency(totalRevenue)}
            trend={null}
            trendValue={0}
            icon={DollarSign}
            iconColor="bg-emerald-500"
            loading={loading}
            subtitle={`Panier moyen : ${formatCurrency(avgBasket)}`}
          />
          <KPICard
            title="Taux de conversion"
            value={conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '—'}
            trend={null}
            trendValue={0}
            icon={TrendingUp}
            iconColor="bg-amber-500"
            loading={loading}
            subtitle={`Lead → Commande`}
          />
          <KPICard
            title="Commandes en attente"
            value={pendingOrders.toLocaleString()}
            trend={null}
            trendValue={0}
            icon={Clock}
            iconColor="bg-orange-500"
            loading={loading}
            subtitle={`En attente de paiement`}
          />
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
            Analyses et graphiques
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          {/* Main Chart - 2/3 width */}
          <Card className="lg:col-span-2 rounded-2xl border-0 shadow-xl shadow-indigo-500/10 bg-gradient-to-br from-white to-indigo-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100/50 rounded-t-2xl">
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <LineChart className="h-5 w-5 text-white" />
                    </div>
                    Évolution Leads & Commandes
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-2 font-medium">Évolution sur la période sélectionnée</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={chartView === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('daily')}
                    className={`rounded-lg font-semibold transition-all ${
                      chartView === 'daily' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30' 
                        : 'border-2 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Quotidien
                  </Button>
                  <Button
                    variant={chartView === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('weekly')}
                    className={`rounded-lg font-semibold transition-all ${
                      chartView === 'weekly' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30' 
                        : 'border-2 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Hebdomadaire
                  </Button>
                  <Button
                    variant={chartView === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('monthly')}
                    className={`rounded-lg font-semibold transition-all ${
                      chartView === 'monthly' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30' 
                        : 'border-2 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Mensuel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
                  <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-center font-medium">Aucune donnée disponible</p>
                </div>
              ) : (
                <div className="w-full sm:h-[450px] lg:h-[500px]" style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      // Calculer les maximums pour chaque série
                      const maxCommandes = Math.max(...chartData.map(d => d.commandes || 0), 0);
                      const maxLeads = Math.max(...chartData.map(d => d.leads || 0), 0);
                      
                      // Calculer les domaines avec une marge de 20% minimum
                      const domainCommandes = maxCommandes === 0 
                        ? [0, 1] 
                        : [0, Math.ceil(maxCommandes * 1.2)];
                      
                      const domainLeads = maxLeads === 0 
                        ? [0, 1] 
                        : [0, Math.ceil(maxLeads * 1.2)];
                      
                      return (
                        <ComposedChart 
                          data={chartData} 
                          margin={{ top: 20, right: 15, bottom: chartData.length > 7 ? 60 : 40, left: -15 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#6B7280"
                            angle={chartData.length > 7 ? -45 : 0}
                            textAnchor={chartData.length > 7 ? "end" : "middle"}
                            height={chartData.length > 7 ? 60 : 40}
                            interval={0}
                            tick={{ fontSize: 11 }}
                            dy={chartData.length > 7 ? 10 : 5}
                          />
                          <YAxis 
                            yAxisId="left" 
                            stroke="#6B7280"
                            domain={domainCommandes}
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            width={30}
                            tickMargin={3}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            stroke="#6B7280"
                            domain={domainLeads}
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            width={30}
                            tickMargin={3}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                            formatter={(value) => (
                              <span style={{ color: value === 'Leads' ? '#10B981' : '#3B82F6', fontWeight: 500 }}>
                                {value}
                              </span>
                            )}
                          />
                          <Bar 
                            yAxisId="left" 
                            dataKey="commandes" 
                            fill="#3B82F6" 
                            name="Commandes"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={chartData.length > 15 ? 50 : 80}
                          />
                          <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="leads" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            name="Leads"
                            activeDot={{ r: 6 }}
                            dot={{ r: 3, fill: '#10B981' }}
                            connectNulls={false}
                          />
                        </ComposedChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown - 1/3 width */}
          <Card className="rounded-2xl border-0 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100/50 rounded-t-2xl">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Répartition par Statut
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2 font-medium">Distribution Leads & Commandes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-8">
                  <div className="h-[180px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#10B981]"></div>
                  </div>
                  <div className="h-[180px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#10B981]"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Leads Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Leads</h4>
                    {leadsStatusBreakdown.length > 0 ? (
                      <>
                        <div style={{ width: '100%', height: 150 }}>
                          <ResponsiveContainer>
                            <RechartsPieChart>
                              <Pie
                                data={leadsStatusBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {leadsStatusBreakdown.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-1">
                          {leadsStatusBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 capitalize">{item.name.replace('_', ' ')}</span>
                              </div>
                              <span className="font-semibold text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-slate-400 text-sm py-8">Aucun lead</p>
                    )}
                  </div>

                  {/* Orders Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Commandes</h4>
                    {ordersStatusBreakdown.length > 0 ? (
                      <>
                        <div style={{ width: '100%', height: 150 }}>
                          <ResponsiveContainer>
                            <RechartsPieChart>
                              <Pie
                                data={ordersStatusBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {ordersStatusBreakdown.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-1">
                          {ordersStatusBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-600 capitalize">{item.name.replace('_', ' ')}</span>
                              </div>
                              <span className="font-semibold text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-slate-400 text-sm py-8">Aucune commande</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Recent Leads & Orders Tables */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
            Activité récente
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {/* Recent Leads */}
          <Card className="rounded-2xl border-0 shadow-xl shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Leads récents
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-2 font-medium">10 derniers leads</CardDescription>
                </div>
                <Link to="/leads">
                  <Button variant="ghost" size="sm" className="rounded-lg font-semibold hover:bg-blue-50">
                    Voir tous <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : leads.slice(0, 10).length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Nom</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 10).map((lead) => (
                        <tr key={lead.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-colors">
                          <td className="py-3 px-4 text-xs text-gray-600 font-medium">{formatDate(lead.created_at)}</td>
                          <td className="py-3 px-4 text-xs text-gray-900 font-semibold">{lead.nom || lead.societe || '—'}</td>
                          <td className="py-3 px-4 text-xs text-gray-600">{lead.source || '—'}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={lead.statut} type="lead" />
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-gray-900 text-right">
                            {lead.montant_cee_estime ? formatCurrency(lead.montant_cee_estime) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-400 text-sm py-8">Aucun lead récent</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="rounded-2xl border-0 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    Commandes récentes
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-2 font-medium">10 dernières commandes</CardDescription>
                </div>
                <Link to="/commandes">
                  <Button variant="ghost" size="sm" className="rounded-lg font-semibold hover:bg-purple-50">
                    Voir toutes <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : orders.slice(0, 10).length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Réf.</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-colors">
                          <td className="py-3 px-4 text-xs text-gray-600 font-medium">{formatDate(order.date_creation)}</td>
                          <td className="py-3 px-4 text-xs text-gray-900 font-mono font-semibold bg-gray-50 px-2 py-1 rounded">{order.reference || order.id.substring(0, 8)}</td>
                          <td className="py-3 px-4 text-xs text-gray-900 font-semibold">{order.nom_client || order.email || '—'}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={order.paiement_statut || 'en_attente'} type="commande" />
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-gray-900 text-right">
                            {order.total_ttc || order.total_ht ? formatCurrency(order.total_ttc || order.total_ht) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-400 text-sm py-8">Aucune commande récente</p>
              )}
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Top Sources & Top Clients */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
            Performances
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {/* Top Sources */}
          <Card className="rounded-2xl border-0 shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100/50 rounded-t-2xl">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                Top Sources
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2 font-medium">5 meilleures sources de leads</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : topSources.length > 0 ? (
                <div className="space-y-3">
                  {topSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/50 to-transparent rounded-xl border-2 border-transparent hover:border-emerald-200 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                          'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700'
                        }`}>
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{source.source}</p>
                          <p className="text-xs text-gray-600 font-medium">{source.leads} leads • {source.orders} commandes</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 text-xs font-bold px-3 py-1 shadow-sm">
                          {source.conversion.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 text-sm py-8">Aucune source disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card className="rounded-2xl border-0 shadow-xl shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100/50 rounded-t-2xl">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Top Clients
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2 font-medium">5 clients avec le plus de CA</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : topClients.length > 0 ? (
                <div className="space-y-3">
                  {topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl border-2 border-transparent hover:border-blue-200 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                          'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700'
                        }`}>
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{client.name}</p>
                          <p className="text-xs text-gray-600 font-medium">{client.orders} commande{client.orders > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-gray-900 text-base bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatCurrency(client.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 text-sm py-8">Aucun client disponible</p>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
