import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Package, ShoppingCart, AlertTriangle, FileText, User } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const { toast } = useToast();
  const { user, profile } = useAuth(); // Use auth context

  const currentUser = profile || user; // Fallback to user if profile is not yet loaded

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: productsCount, error: productsError } = await supabase.from('products').select('*', { count: 'exact' });
        if (productsError) throw productsError;
        setProductCount(productsCount);

        const { count: ordersCount, error: ordersError } = await supabase.from('commandes').select('*', { count: 'exact' });
        if (ordersError) throw ordersError;
        setOrderCount(ordersCount);

        const { count: leadsCount, error: leadsError } = await supabase.from('leads').select('*', { count: 'exact' });
        if (leadsError) throw leadsError;
        setLeadCount(leadsCount);

        const { count: pendingCount, error: pendingError } = await supabase.from('commandes').select('*', { count: 'exact' }).eq('statut', 'Nouvelle demande');
        if (pendingError) throw pendingError;
        setPendingOrderCount(pendingCount);

        // Fetch last 12 months of data
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const { data: allOrders, error: allOrdersError } = await supabase.from('commandes').select('date_creation').gte('date_creation', twelveMonthsAgo.toISOString());
        if (allOrdersError) throw allOrdersError;

        const { data: allLeads, error: allLeadsError } = await supabase.from('leads').select('created_at').gte('created_at', twelveMonthsAgo.toISOString());
        if (allLeadsError) throw allLeadsError;

        // Create a map for the last 12 months
        const monthMap = new Map();
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
            monthMap.set(key, { name: key, demandes: 0, leads: 0 });
        }

        allOrders.forEach(order => {
            const date = new Date(order.date_creation);
            const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
            if (monthMap.has(key)) {
                monthMap.get(key).demandes++;
            }
        });

        allLeads.forEach(lead => {
            const date = new Date(lead.created_at);
            const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
            if (monthMap.has(key)) {
                monthMap.get(key).leads++;
            }
        });
        
        setChartData(Array.from(monthMap.values()));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Erreur de chargement",
          description: `Impossible de charger les données du tableau de bord : ${error.message}`,
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Effinor Admin</title>
      </Helmet>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex justify-between items-start">
            <div>
                 <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                 {currentUser && (
                    <p className="text-gray-600 mt-1">
                        Bienvenue, <span className="font-semibold">{currentUser.full_name || currentUser.email}</span> !
                    </p>
                 )}
            </div>
            {currentUser && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                    <User size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{currentUser.role || 'N/A'}</span>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Produits" value={productCount} icon={<Package className="h-6 w-6 text-white" />} color="bg-blue-500" />
          <StatCard title="Total Commandes" value={orderCount} icon={<ShoppingCart className="h-6 w-6 text-white" />} color="bg-green-500" />
          <StatCard title="Total Leads" value={leadCount} icon={<FileText className="h-6 w-6 text-white" />} color="bg-indigo-500" />
          <StatCard title="Demandes en attente" value={pendingOrderCount} icon={<AlertTriangle className="h-6 w-6 text-white" />} color="bg-yellow-500" />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution sur les 12 derniers mois</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="demandes" fill="#4ade80" name="Demandes de devis" />
                <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#818cf8" strokeWidth={2} name="Leads" activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;