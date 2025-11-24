import React from 'react';
import StatusSettingsPage from '@/components/settings/statuses/StatusSettingsPage';

/**
 * Settings Operation Statuses Page
 * Gestion des statuts des opérations CEE
 */
const SettingsOperationStatusesPage = () => {
  return (
    <StatusSettingsPage
      table="operation_statuses"
      title="Statuts des opérations CEE"
      subtitle="Définissez le workflow complet d'une opération CEE."
    />
  );
};

export default SettingsOperationStatusesPage;

