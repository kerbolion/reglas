// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const state = {
  // Pestañas y navegación
  currentTab: 0,
  currentDataSubTab: 0,
  
  // Instancias
  currentInstance: null,
  instances: [],
  
  // Grupos de reglas y reglas
  currentRulesGroup: null,
  currentEditingRule: null,
  currentEditingActions: [],
  
  // Filtros y vistas
  rulesFilter: 'all', // 'all', 'active', 'inactive'
  
  // Datos temporales para edición
  tempRuleData: null,
  tempActionData: null,
  
  // Estados de UI
  showAdvancedOptions: false,
  isEditingGroupName: false,
  
  // Cache para optimización
  cachedStats: null,
  lastStatsUpdate: null,
  
  // Configuración de sesión
  sessionConfig: {
    autoSave: true,
    saveInterval: 5000,
    debugMode: false
  }
};