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
import { Link } from 'react-router-dom';

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

const KPICard = ({ title, value, trend, trendValue, icon: Icon, iconColor = 'bg-[#10B981]', loading = false, subtitle }) => {
  const isPositive = trendValue >= 0;
  
  if (loading) {
    return (
      <Card className="rounded-lg border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-600 mb-1 truncate">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
            {trend !== null && trend !== undefined && !isNaN(trendValue) && trendValue !== 0 && (
              <div className={`flex items-center gap-1 text-xs mt-2 ${isPositive ? 'text-[#10B981]' : 'text-red-600'}`}>
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span className="font-medium">{Math.abs(trendValue).toFixed(1)}%</span>
                <span className="text-slate-400">vs précédent</span>
              </div>
            )}
          </div>
          <div className={`${iconColor}/10 p-2 rounded-lg flex-shrink-0 ml-2`}>
            <Icon className={`h-5 w-5 ${iconColor.replace('bg-', 'text-')}`} />
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

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Effinor Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
              <p className="text-slate-600 mt-1">Vue d'ensemble Leads & Commandes</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>Période sélectionnée : <span className="font-semibold text-slate-900">{periodLabel}</span></p>
              <p>Dernière mise à jour : <span className="font-semibold text-slate-900">
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span></p>
            </div>
          </div>

          {/* Filters Bar */}
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Filtres :</span>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="7d">7 derniers jours</SelectItem>
                      <SelectItem value="30d">30 derniers jours</SelectItem>
                      <SelectItem value="month">Mois en cours</SelectItem>
                      <SelectItem value="12m">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tout</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="commandes">Commandes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sources</SelectItem>
                      <SelectItem value="Formulaire site">Formulaire site</SelectItem>
                      <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Téléphone">Téléphone</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart - 2/3 width */}
          <Card className="lg:col-span-2 rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Évolution Leads & Commandes</CardTitle>
                  <CardDescription className="text-sm text-slate-600">Évolution sur la période sélectionnée</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={chartView === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('daily')}
                    className={chartView === 'daily' ? 'bg-[#10B981] hover:bg-[#10B981]/90' : ''}
                  >
                    Quotidien
                  </Button>
                  <Button
                    variant={chartView === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('weekly')}
                    className={chartView === 'weekly' ? 'bg-[#10B981] hover:bg-[#10B981]/90' : ''}
                  >
                    Hebdomadaire
                  </Button>
                  <Button
                    variant={chartView === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('monthly')}
                    className={chartView === 'monthly' ? 'bg-[#10B981] hover:bg-[#10B981]/90' : ''}
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
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis yAxisId="left" stroke="#6B7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="commandes" 
                        fill="#3B82F6" 
                        name="Commandes"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        name="Leads"
                        activeDot={{ r: 8 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown - 1/3 width */}
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Répartition par Statut</CardTitle>
              <CardDescription className="text-sm text-slate-600">Distribution Leads & Commandes</CardDescription>
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

        {/* Recent Leads & Orders Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Leads */}
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Leads récents</CardTitle>
                  <CardDescription className="text-sm text-slate-600">10 derniers leads</CardDescription>
                </div>
                <Link to="/admin/leads">
                  <Button variant="ghost" size="sm">
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Date</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Nom</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Source</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Statut</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 10).map((lead) => (
                        <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 text-xs text-slate-600">{formatDate(lead.created_at)}</td>
                          <td className="py-2 px-3 text-xs text-slate-900">{lead.nom || lead.societe || '—'}</td>
                          <td className="py-2 px-3 text-xs text-slate-600">{lead.source || '—'}</td>
                          <td className="py-2 px-3">
                            <StatusBadge status={lead.statut} type="lead" />
                          </td>
                          <td className="py-2 px-3 text-xs font-semibold text-slate-900 text-right">
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
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Commandes récentes</CardTitle>
                  <CardDescription className="text-sm text-slate-600">10 dernières commandes</CardDescription>
                </div>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm">
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Date</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Réf.</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Client</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Statut</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 text-xs text-slate-600">{formatDate(order.date_creation)}</td>
                          <td className="py-2 px-3 text-xs text-slate-900 font-mono">{order.reference || order.id.substring(0, 8)}</td>
                          <td className="py-2 px-3 text-xs text-slate-900">{order.nom_client || order.email || '—'}</td>
                          <td className="py-2 px-3">
                            <StatusBadge status={order.paiement_statut || 'en_attente'} type="commande" />
                          </td>
                          <td className="py-2 px-3 text-xs font-semibold text-slate-900 text-right">
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

        {/* Top Sources & Top Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sources */}
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Top Sources</CardTitle>
              <CardDescription className="text-sm text-slate-600">5 meilleures sources de leads</CardDescription>
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
                    <div key={source.source} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#10B981]">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{source.source}</p>
                          <p className="text-xs text-slate-500">{source.leads} leads • {source.orders} commandes</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <Badge variant="secondary" className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 text-xs">
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
          <Card className="rounded-lg border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Top Clients</CardTitle>
              <CardDescription className="text-sm text-slate-600">5 clients avec le plus de CA</CardDescription>
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
                    <div key={client.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{client.name}</p>
                          <p className="text-xs text-slate-500">{client.orders} commande{client.orders > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-semibold text-slate-900 text-sm">{formatCurrency(client.revenue)}</p>
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
    </>
  );
};

export default AdminDashboard;
