// ==========================================
// GESTIÓN DE ESTADÍSTICAS
// ==========================================

function updateStats() {
  // Esta función se mantiene para compatibilidad pero ahora usa updateInstanceStats
  updateInstanceStats();
}

function updateInstanceStats() {
  const instance = getCurrentInstance();
  if (!instance) {
    document.getElementById('instance-total-rules').textContent = '0';
    document.getElementById('instance-responses-today').textContent = '0';
    return;
  }
  
  const activeRules = instance.rules.filter(rule => rule.active).length;
  document.getElementById('instance-total-rules').textContent = activeRules;
  // Las respuestas de hoy serían obtenidas de un backend real
  document.getElementById('instance-responses-today').textContent = '0';
}

function getInstanceStatsData() {
  const instance = getCurrentInstance();
  if (!instance) {
    return {
      totalRules: 0,
      activeRules: 0,
      inactiveRules: 0,
      totalActions: 0,
      responsesToday: 0
    };
  }
  
  return {
    totalRules: instance.rules.length,
    activeRules: instance.rules.filter(rule => rule.active).length,
    inactiveRules: instance.rules.filter(rule => !rule.active).length,
    totalActions: instance.rules.reduce((total, rule) => total + (rule.actions || []).length, 0),
    responsesToday: 0 // Esto vendría de un backend
  };
}

function renderAnalytics() {
  const container = document.getElementById('analytics-container');
  const instance = getCurrentInstance();
  
  if (!instance) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📱</div>
        <h3>Selecciona una instancia</h3>
        <p>Crea o selecciona una instancia para ver sus analíticas</p>
      </div>
    `;
    return;
  }
  
  const stats = getInstanceStatsData();
  
  if (stats.totalRules === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📈</div>
        <h3>Datos insuficientes</h3>
        <p>Activa el AutoResponder para comenzar a generar estadísticas</p>
      </div>
    `;
    return;
  }

  // Aquí se renderizarían las analíticas cuando estén implementadas
  container.innerHTML = `
    <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Reglas Totales</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--text-accent);">${stats.totalRules}</span>
      </div>
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Reglas Activas</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--success);">${stats.activeRules}</span>
      </div>
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Acciones Configuradas</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--text-primary);">${stats.totalActions}</span>
      </div>
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Respuestas Hoy</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--warning);">${stats.responsesToday}</span>
      </div>
    </div>
  `;
}