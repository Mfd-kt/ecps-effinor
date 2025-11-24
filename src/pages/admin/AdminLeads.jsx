import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Filter, Download, Mail, 
  TrendingUp, Users, Target, Euro, X
} from 'lucide-react';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadsTableFilters from '@/components/leads/LeadsTableFilters';
import { getLeadStats, getLeadById } from '@/lib/api/leads';
import { useLeadFilters } from '@/hooks/useLeadFilters';
import { cn } from '@/lib/utils';

/**
 * World-Class CRM Lead Management System for ECPS
 * Modern 3-column layout inspired by HubSpot, Linear, Salesforce
 */
const AdminLeads = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use filter hook
  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    getActiveFilters,
    activeFiltersCount
  } = useLeadFilters();

  // Load stats
  const loadStats = async () => {
    try {
      const result = await getLeadStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Leads | CRM Effinor</title>
      </Helmet>

      <div className="admin-page h-screen flex flex-col overflow-hidden">
        {/* Header avec Stats */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="p-4 md:p-6">
            {/* Title and Actions */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-gray-600 mt-1 text-sm">Gérez vos prospects et convertissez-les en clients</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Lead
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-3 border border-sky-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-sky-700 font-medium">Total Leads</p>
                      <p className="text-xl font-bold text-sky-900 mt-1">{stats.total || 0}</p>
                    </div>
                    <Users className="h-6 w-6 text-sky-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Nouveaux (mois)</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">{stats.nouveaux_ce_mois || 0}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Qualifiés</p>
                      <p className="text-xl font-bold text-yellow-900 mt-1">{stats.qualifies || 0}</p>
                    </div>
                    <Target className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Taux conversion</p>
                      <p className="text-xl font-bold text-green-900 mt-1">{stats.conversion_rate || 0}%</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-700 font-medium">CA Potentiel</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">
                        {formatAmount(stats.ca_potentiel).replace('€', 'k€')}
                      </p>
                    </div>
                    <Euro className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-700 font-medium">Leads Chauds</p>
                      <p className="text-xl font-bold text-red-900 mt-1">{stats.leads_chauds || 0}</p>
                    </div>
                    <Target className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Search + Filters Bar */}
            <div className="mt-4">
              <LeadsTableFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onResetFilters={resetFilters}
                activeFiltersCount={activeFiltersCount}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          <LeadsTable
            filters={getActiveFilters()}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </>
  );
};

export default AdminLeads;
