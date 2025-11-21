import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
  TrendingUp, Users, ShoppingCart, FileText, 
  CheckCircle2, Clock, Send, Trophy, Filter, 
  RefreshCw, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, LineChart
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, 
  Pie, Cell
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { logger } from '@/utils/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Status colors mapping
const STATUS_COLORS = {
  'nouveau': '#3B82F6', // blue
  'devis_a_preparer': '#F59E0B', // amber
  'devis_envoye': '#8B5CF6', // purple
  'en_negociation': '#EC4899', // pink
  'gagne': '#10B981', // green
  'perdu': '#EF4444', // red
};

// KPI Card Component
const KPICard = ({ title, value, trend, trendValue, icon: Icon, iconColor = 'bg-secondary-500', loading = false }) => {
  const isPositive = trendValue >= 0;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value?.toLocaleString() || 0}</p>
            {trend !== null && trend !== undefined && !isNaN(trendValue) && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-secondary-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="font-medium">{Math.abs(trendValue).toFixed(1)}%</span>
                <span className="text-gray-500">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={`${iconColor}/10 p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Status Card Component
const StatusCard = ({ title, value, status, icon: Icon, loading = false }) => {
  const statusColor = STATUS_COLORS[status] || '#6B7280';
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() || 0}</p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${statusColor}15` }}>
            <Icon className="h-5 w-5" style={{ color: statusColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const currentUser = profile || user;

  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Chart data
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('composed'); // 'composed', 'line'
  
  // Filters
  const [dateRange, setDateRange] = useState('12'); // months
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  
  // Main KPIs
  const [totalLeadsThisMonth, setTotalLeadsThisMonth] = useState(0);
  const [totalLeadsLastMonth, setTotalLeadsLastMonth] = useState(0);
  const [totalOrdersThisMonth, setTotalOrdersThisMonth] = useState(0);
  const [totalOrdersLastMonth, setTotalOrdersLastMonth] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  
  // Status breakdown
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [statusStats, setStatusStats] = useState({});
  
  // Top sources
  const [topSources, setTopSources] = useState([]);
  const [uniqueSourcesList, setUniqueSourcesList] = useState([]);
  
  // Recent activity
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    
    if (dateRange === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setMonth(startDate.getMonth() - parseInt(dateRange) || 12);
    }
    
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
  };

  // Fetch all dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch leads with filters
      let leadsQuery = supabase
        .from('leads')
        .select('id, created_at, statut, source, montant_cee_estime, nom')
        .gte('created_at', startISO)
        .lte('created_at', endISO);
      
      if (selectedStatus && selectedStatus !== 'all') {
        leadsQuery = leadsQuery.eq('statut', selectedStatus);
      }
      
      if (selectedSource && selectedSource !== 'all') {
        leadsQuery = leadsQuery.eq('source', selectedSource);
      }
      
      const { data: allLeads, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      // Fetch orders (total column may not exist, so we don't select it)
      const { data: allOrders, error: ordersError } = await supabase
        .from('commandes')
        .select('id, date_creation')
        .gte('date_creation', startISO)
        .lte('date_creation', endISO);
      
      if (ordersError) throw ordersError;

      // Calculate chart data
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const periodMap = new Map();
      const isDaily = daysDiff <= 90;
      
      if (isDaily) {
        // Daily data
        for (let i = 0; i < daysDiff; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          periodMap.set(key, { name: key, leads: 0, commandes: 0 });
        }
      } else {
        // Monthly data
        const monthsToShow = parseInt(dateRange) || 12;
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
          periodMap.set(key, { name: key, leads: 0, commandes: 0 });
        }
      }

      // Populate period map with data
      (allLeads || []).forEach(lead => {
        const date = new Date(lead.created_at);
        const key = isDaily
          ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          : date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        if (periodMap.has(key)) {
          periodMap.get(key).leads++;
        }
      });

      (allOrders || []).forEach(order => {
        const date = new Date(order.date_creation);
        const key = isDaily
          ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          : date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        if (periodMap.has(key)) {
          periodMap.get(key).commandes++;
        }
      });

      setChartData(Array.from(periodMap.values()));

      // Calculate this month vs last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const { count: leadsThisMonth } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString());
      
      const { count: leadsLastMonth } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      const { count: ordersThisMonth } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .gte('date_creation', thisMonthStart.toISOString());

      const { count: ordersLastMonth } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .gte('date_creation', lastMonthStart.toISOString())
        .lte('date_creation', lastMonthEnd.toISOString());

      setTotalLeadsThisMonth(leadsThisMonth || 0);
      setTotalLeadsLastMonth(leadsLastMonth || 0);
      setTotalOrdersThisMonth(ordersThisMonth || 0);
      setTotalOrdersLastMonth(ordersLastMonth || 0);

      // Calculate conversion rate
      const conversion = leadsLastMonth > 0 
        ? ((ordersLastMonth || 0) / leadsLastMonth * 100)
        : 0;
      setConversionRate(parseFloat(conversion.toFixed(1)));

      // Calculate average order value (if total column exists in commandes_lignes)
      // For now, we'll calculate it from commandes_lignes if needed
      // Since total doesn't exist in commandes, we'll set to 0 or fetch from lignes
      setAvgOrderValue(0); // TODO: Calculate from commandes_lignes if needed

      // Status breakdown
      const statusCount = {};
      (allLeads || []).forEach(lead => {
        const status = lead.statut || 'nouveau';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      const breakdown = Object.entries(statusCount).map(([status, count]) => ({
        name: status,
        value: count,
        color: STATUS_COLORS[status] || '#6B7280'
      }));
      setStatusBreakdown(breakdown);
      setStatusStats(statusCount);

      // Top sources
      const sourceCount = {};
      (allLeads || []).forEach(lead => {
        const source = lead.source || 'Autre';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });

      const topSourcesData = Object.entries(sourceCount)
        .map(([source, count]) => ({
          source,
          count,
          conversion: 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setTopSources(topSourcesData);
      
      // Unique sources for filter
      const sources = Array.from(new Set(topSourcesData.map(s => s.source))).sort();
      setUniqueSourcesList(sources);

      // Recent leads (last 5)
      const { data: recentLeadsData } = await supabase
        .from('leads')
        .select('id, nom, created_at, statut')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentLeads(recentLeadsData || []);

      // Recent activity
      const activity = (recentLeadsData || []).map(lead => ({
        type: 'lead_created',
        title: `Nouveau lead: ${lead.nom || 'Sans nom'}`,
        time: new Date(lead.created_at).toLocaleString('fr-FR'),
        status: lead.statut
      }));
      setRecentActivity(activity);

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast({
        title: "Impossible de charger les données",
        description: "Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez le support technique.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedStatus, selectedSource]);

  // Calculate trends
  const leadsTrend = useMemo(() => {
    if (totalLeadsLastMonth === 0 || isNaN(totalLeadsLastMonth)) return 0;
    return ((totalLeadsThisMonth - totalLeadsLastMonth) / totalLeadsLastMonth * 100);
  }, [totalLeadsThisMonth, totalLeadsLastMonth]);
  
  const ordersTrend = useMemo(() => {
    if (totalOrdersLastMonth === 0 || isNaN(totalOrdersLastMonth)) return 0;
    return ((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth * 100);
  }, [totalOrdersThisMonth, totalOrdersLastMonth]);

  const resetFilters = () => {
    setDateRange('12');
    setSelectedStatus('all');
    setSelectedSource('all');
  };

  // Custom Tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
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

  return (
    <>
      <Helmet>
        <title>Dashboard | Effinor Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            {currentUser && (
              <p className="text-gray-600 mt-1">
                Bienvenue, <span className="font-semibold text-secondary-600">{currentUser.full_name || currentUser.email}</span>
              </p>
            )}
          </div>
          {currentUser && (
            <Badge variant="outline" className="text-sm">
              {currentUser.role || 'Admin'}
            </Badge>
          )}
        </div>

        {/* Main KPIs - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Total Leads"
            value={totalLeadsThisMonth}
            trend={leadsTrend}
            trendValue={leadsTrend}
            icon={Users}
            iconColor="bg-secondary-500"
            loading={loading}
          />
          <KPICard
            title="Total Commandes"
            value={totalOrdersThisMonth}
            trend={ordersTrend}
            trendValue={ordersTrend}
            icon={ShoppingCart}
            iconColor="bg-blue-500"
            loading={loading}
          />
          <KPICard
            title="Taux de Conversion"
            value={`${conversionRate}%`}
            trend={null}
            trendValue={0}
            icon={TrendingUp}
            iconColor="bg-purple-500"
            loading={loading}
          />
          <KPICard
            title="Panier Moyen"
            value={`${avgOrderValue.toFixed(0)}€`}
            trend={null}
            trendValue={0}
            icon={Trophy}
            iconColor="bg-amber-500"
            loading={loading}
          />
        </div>

        {/* Status Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatusCard
            title="Leads Nouveaux"
            value={statusStats['nouveau'] || 0}
            status="nouveau"
            icon={FileText}
            loading={loading}
          />
          <StatusCard
            title="Devis En Attente"
            value={statusStats['devis_a_preparer'] || 0}
            status="devis_a_preparer"
            icon={Clock}
            loading={loading}
          />
          <StatusCard
            title="Devis Envoyés"
            value={statusStats['devis_envoye'] || 0}
            status="devis_envoye"
            icon={Send}
            loading={loading}
          />
          <StatusCard
            title="Projets Gagnés"
            value={statusStats['gagne'] || 0}
            status="gagne"
            icon={CheckCircle2}
            loading={loading}
          />
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Filtres</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Période</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 derniers jours</SelectItem>
                    <SelectItem value="30d">30 derniers jours</SelectItem>
                    <SelectItem value="3">3 derniers mois</SelectItem>
                    <SelectItem value="6">6 derniers mois</SelectItem>
                    <SelectItem value="12">12 derniers mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut Lead</label>
                <Select value={selectedStatus || 'all'} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="devis_a_preparer">Devis à préparer</SelectItem>
                    <SelectItem value="devis_envoye">Devis envoyé</SelectItem>
                    <SelectItem value="en_negociation">En négociation</SelectItem>
                    <SelectItem value="gagne">Gagné</SelectItem>
                    <SelectItem value="perdu">Perdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Source</label>
                <Select value={selectedSource || 'all'} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sources</SelectItem>
                    {uniqueSourcesList.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart and Status Breakdown - Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Évolution Leads & Commandes</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === 'composed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('composed')}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('line')}
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
                </div>
              ) : (
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    {chartType === 'line' ? (
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis yAxisId="left" stroke="#6B7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="leads" 
                          stroke="#10B981" 
                          strokeWidth={3} 
                          name="Leads"
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="commandes" 
                          stroke="#3B82F6" 
                          strokeWidth={3} 
                          name="Commandes"
                          activeDot={{ r: 8 }}
                        />
                      </ComposedChart>
                    ) : (
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
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Statut</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
                </div>
              ) : statusBreakdown.length > 0 ? (
                <>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <RechartsPieChart>
                        <Pie
                          data={statusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {statusBreakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 capitalize">{item.name.replace('_', ' ')}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Sources and Recent Activity - Row 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Top Sources</CardTitle>
              <CardDescription>Les 5 principales sources de leads</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : topSources.length > 0 ? (
                <div className="space-y-4">
                  {topSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-secondary-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{source.source}</p>
                          <p className="text-xs text-gray-500">{source.count} leads</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{source.conversion || 0}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-secondary-500 bg-gray-50 rounded-r-lg">
                      <Activity className="h-5 w-5 text-secondary-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      {activity.status && (
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: STATUS_COLORS[activity.status] || '#6B7280',
                            color: STATUS_COLORS[activity.status] || '#6B7280'
                          }}
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune activité récente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
