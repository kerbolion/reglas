// ==========================================
// GESTIÓN DE ESTADÍSTICAS PARA GRUPOS DE REGLAS
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
  
  // Usar las nuevas funciones de utilidades para obtener estadísticas
  const stats = getInstanceStats(instance);
  
  document.getElementById('instance-total-rules').textContent = stats.activeRules;
  // Las respuestas de hoy serían obtenidas de un backend real
  document.getElementById('instance-responses-today').textContent = getResponsesToday(instance);
}

function getInstanceStatsData() {
  const instance = getCurrentInstance();
  if (!instance) {
    return {
      totalGroups: 0,
      totalRules: 0,
      activeRules: 0,
      inactiveRules: 0,
      totalActions: 0,
      responsesToday: 0,
      responsesByGroup: {},
      topKeywords: [],
      rulesByStatus: {
        active: 0,
        inactive: 0,
        draft: 0
      }
    };
  }
  
  // Usar función de utils.js para obtener estadísticas básicas
  const basicStats = getInstanceStats(instance);
  
  // Agregar estadísticas adicionales específicas
  const advancedStats = {
    ...basicStats,
    responsesToday: getResponsesToday(instance),
    responsesByGroup: getResponsesByGroup(instance),
    topKeywords: getTopKeywords(instance),
    rulesByStatus: getRulesByStatus(instance),
    averageActionsPerRule: basicStats.totalRules > 0 ? 
      Math.round((basicStats.totalActions / basicStats.totalRules) * 100) / 100 : 0,
    groupsWithActiveRules: getGroupsWithActiveRules(instance),
    lastActivity: getLastActivity(instance)
  };
  
  return advancedStats;
}

// ==========================================
// ESTADÍSTICAS ESPECÍFICAS POR GRUPOS
// ==========================================
function getResponsesByGroup(instance) {
  if (!instance || !instance.rulesGroups) return {};
  
  const responsesByGroup = {};
  
  Object.entries(instance.rulesGroups).forEach(([groupKey, group]) => {
    const activeRules = group.rules ? group.rules.filter(rule => rule.active) : [];
    responsesByGroup[group.name] = {
      activeRules: activeRules.length,
      totalRules: group.rules ? group.rules.length : 0,
      responsesToday: 0, // Esto vendría de analytics reales
      responseThisWeek: 0,
      responseThisMonth: 0
    };
  });
  
  return responsesByGroup;
}

function getTopKeywords(instance) {
  if (!instance) return [];
  
  const keywordCount = {};
  const allRules = getAllRulesFromInstance(instance);
  
  allRules.forEach(rule => {
    if (rule.keywords && rule.active) {
      rule.keywords.forEach(keyword => {
        const normalizedKeyword = keyword.toLowerCase().trim();
        keywordCount[normalizedKeyword] = (keywordCount[normalizedKeyword] || 0) + 1;
      });
    }
  });
  
  return Object.entries(keywordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
}

function getRulesByStatus(instance) {
  if (!instance) return { active: 0, inactive: 0, draft: 0 };
  
  const allRules = getAllRulesFromInstance(instance);
  
  return {
    active: allRules.filter(rule => rule.active).length,
    inactive: allRules.filter(rule => !rule.active).length,
    draft: allRules.filter(rule => !rule.actions || rule.actions.length === 0).length
  };
}

function getGroupsWithActiveRules(instance) {
  if (!instance || !instance.rulesGroups) return 0;
  
  return Object.values(instance.rulesGroups).filter(group => {
    return group.rules && group.rules.some(rule => rule.active);
  }).length;
}

function getLastActivity(instance) {
  if (!instance) return null;
  
  const allRules = getAllRulesFromInstance(instance);
  let latestDate = null;
  
  allRules.forEach(rule => {
    if (rule.created) {
      const ruleDate = new Date(rule.created);
      if (!latestDate || ruleDate > latestDate) {
        latestDate = ruleDate;
      }
    }
  });
  
  return latestDate;
}

function getResponsesToday(instance) {
  // En una implementación real, esto vendría de un backend
  // Por ahora retornamos un valor simulado basado en reglas activas
  if (!instance) return 0;
  
  const activeRules = getActiveRulesCount(instance);
  // Simular respuestas basadas en reglas activas (esto sería real data)
  return Math.floor(activeRules * Math.random() * 5);
}

// ==========================================
// ESTADÍSTICAS COMPARATIVAS
// ==========================================
function compareGroupsPerformance(instance) {
  if (!instance || !instance.rulesGroups) return [];
  
  return Object.entries(instance.rulesGroups).map(([groupKey, group]) => {
    const rules = group.rules || [];
    const activeRules = rules.filter(rule => rule.active);
    const totalActions = rules.reduce((sum, rule) => sum + (rule.actions?.length || 0), 0);
    
    return {
      groupKey,
      groupName: group.name,
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalActions,
      averageActionsPerRule: rules.length > 0 ? 
        Math.round((totalActions / rules.length) * 100) / 100 : 0,
      efficiency: activeRules.length / Math.max(rules.length, 1), // Porcentaje de reglas activas
      responsesToday: 0 // Esto vendría de analytics reales
    };
  }).sort((a, b) => b.efficiency - a.efficiency);
}

function getWeeklyTrend(instance) {
  // Simular datos de tendencia semanal
  // En implementación real, esto vendría de un backend
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const activeRules = getActiveRulesCount(instance);
  
  return days.map(day => ({
    day,
    responses: Math.floor(Math.random() * activeRules * 3),
    avgResponseTime: Math.round((Math.random() * 2 + 0.5) * 100) / 100
  }));
}

// ==========================================
// RENDERIZADO DE ANALÍTICAS
// ==========================================
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
        <p>Crea algunas reglas para comenzar a generar estadísticas</p>
        <button onclick="showTab(0)" style="margin-top: 16px;">Ir a Reglas</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Grupos de Reglas</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--text-accent);">${stats.totalGroups}</span>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          ${stats.groupsWithActiveRules} con reglas activas
        </div>
      </div>
      
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Reglas Totales</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--text-primary);">${stats.totalRules}</span>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          ${stats.activeRules} activas, ${stats.inactiveRules} inactivas
        </div>
      </div>
      
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Acciones Configuradas</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--success);">${stats.totalActions}</span>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          ${stats.averageActionsPerRule} promedio por regla
        </div>
      </div>
      
      <div class="stat-card" style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; text-align: center;">
        <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Respuestas Hoy</h4>
        <span class="stat-number" style="font-size: 2rem; font-weight: bold; color: var(--warning);">${stats.responsesToday}</span>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          Basado en reglas activas
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      ${renderGroupsPerformanceChart(instance)}
      ${renderTopKeywordsChart(stats.topKeywords)}
    </div>

    ${renderResponsesByGroupTable(stats.responsesByGroup)}
  `;
}

function renderGroupsPerformanceChart(instance) {
  const groupsData = compareGroupsPerformance(instance);
  
  if (groupsData.length === 0) {
    return `
      <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
        <h4 style="margin-bottom: 16px;">Rendimiento por Grupos</h4>
        <p style="color: var(--text-secondary);">No hay datos disponibles</p>
      </div>
    `;
  }
  
  return `
    <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
      <h4 style="margin-bottom: 16px;">Rendimiento por Grupos</h4>
      <div style="max-height: 300px; overflow-y: auto;">
        ${groupsData.map(group => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-secondary);">
            <div>
              <div style="font-weight: 600; font-size: 14px;">${escapeHtml(group.groupName)}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                ${group.activeRules}/${group.totalRules} reglas activas
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; color: var(--text-accent);">
                ${Math.round(group.efficiency * 100)}%
              </div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                ${group.averageActionsPerRule} acc/regla
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTopKeywordsChart(topKeywords) {
  if (topKeywords.length === 0) {
    return `
      <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
        <h4 style="margin-bottom: 16px;">Palabras Clave Principales</h4>
        <p style="color: var(--text-secondary);">No hay palabras clave configuradas</p>
      </div>
    `;
  }
  
  const maxCount = Math.max(...topKeywords.map(k => k.count));
  
  return `
    <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
      <h4 style="margin-bottom: 16px;">Palabras Clave Principales</h4>
      <div style="max-height: 300px; overflow-y: auto;">
        ${topKeywords.map(keyword => {
          const percentage = (keyword.count / maxCount) * 100;
          return `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 14px; font-weight: 600;">${escapeHtml(keyword.keyword)}</span>
                <span style="font-size: 12px; color: var(--text-secondary);">${keyword.count} reglas</span>
              </div>
              <div style="background: var(--bg-secondary); border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="background: var(--text-accent); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderResponsesByGroupTable(responsesByGroup) {
  const groups = Object.entries(responsesByGroup);
  
  if (groups.length === 0) {
    return '';
  }
  
  return `
    <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
      <h4 style="margin-bottom: 16px;">Actividad por Grupo</h4>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-secondary);">
              <th style="text-align: left; padding: 8px; color: var(--text-secondary);">Grupo</th>
              <th style="text-align: center; padding: 8px; color: var(--text-secondary);">Reglas</th>
              <th style="text-align: center; padding: 8px; color: var(--text-secondary);">Activas</th>
              <th style="text-align: center; padding: 8px; color: var(--text-secondary);">Respuestas Hoy</th>
            </tr>
          </thead>
          <tbody>
            ${groups.map(([groupName, data]) => `
              <tr style="border-bottom: 1px solid var(--border-secondary);">
                <td style="padding: 12px 8px; font-weight: 600;">${escapeHtml(groupName)}</td>
                <td style="padding: 12px 8px; text-align: center;">${data.totalRules}</td>
                <td style="padding: 12px 8px; text-align: center;">
                  <span style="color: var(--success); font-weight: 600;">${data.activeRules}</span>
                </td>
                <td style="padding: 12px 8px; text-align: center;">${data.responsesToday}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// EXPORTACIÓN DE ESTADÍSTICAS
// ==========================================
function exportStatsReport() {
  const instance = getCurrentInstance();
  if (!instance) {
    alert('Selecciona una instancia primero');
    return;
  }
  
  const stats = getInstanceStatsData();
  const groupsPerformance = compareGroupsPerformance(instance);
  
  const report = {
    instance: {
      name: instance.name,
      id: instance.instanceId,
      status: instance.status
    },
    reportDate: new Date().toISOString(),
    summary: stats,
    groupsPerformance,
    topKeywords: stats.topKeywords,
    responsesByGroup: stats.responsesByGroup
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `estadisticas-${instance.name}-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}