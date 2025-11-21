export const calculateCEEPotential = (formData) => {
  let ledPotential = 0;
  let heatingPotential = 0;

  // Calculate LED potential from buildings
  if (formData.buildings && Array.isArray(formData.buildings)) {
    formData.buildings.forEach(building => {
      if (building.interiorLighting) {
        Object.keys(building.interiorLighting).forEach(lightType => {
          const light = building.interiorLighting[lightType];
          if (light.enabled && light.quantity && light.powerPerUnit && light.operatingHours) {
            const annualConsumption = light.quantity * light.powerPerUnit * light.operatingHours;
            ledPotential += annualConsumption * 0.4; // 40% savings factor
          }
        });
      }

      // Calculate heating potential
      if (building.heating && building.surface) {
        const isolationFactor = building.ceilingHeight > 6 ? 1.2 : 1.0;
        heatingPotential += building.surface * isolationFactor * 15; // €15/m² average
      }
    });
  }

  const totalPotential = ledPotential + heatingPotential;

  let classification = 'low';
  if (totalPotential > 50000) {
    classification = 'high';
  } else if (totalPotential > 10000) {
    classification = 'medium';
  }

  return {
    ledPotential: Math.round(ledPotential),
    heatingPotential: Math.round(heatingPotential),
    totalPotential: Math.round(totalPotential),
    classification
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};