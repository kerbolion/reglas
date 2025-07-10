// Funciones de renderizado de la interfaz de usuario

// Esta funcionalidad ya está distribuida en los otros módulos:
// - renderSections() y renderSectionContent() están en sections.js
// - renderFlows() y renderSteps() están en flows.js  
// - renderFAQs() está en faqs.js
// - renderAll() está en utils.js

// Este archivo puede ser usado para funciones de renderizado adicionales
// o para centralizar elementos comunes de renderizado en el futuro

// ==========================================
// FUNCIONES DE RENDERIZADO CENTRALIZADAS
// ==========================================

const renderer = {
  // ==========================================
  // RENDERIZADO DE ELEMENTOS COMUNES
  // ==========================================
  
  // Renderizar mensaje de estado vacío
  renderEmptyState(options = {}) {
    const {
      icon = '📝',
      title = 'No hay elementos',
      description = 'Comienza agregando el primer elemento',
      actionText = 'Agregar',
      actionHandler = null,
      small = false
    } = options;

    return `
      <div class="empty-state ${small ? 'small' : ''}">
        <div class="icon ${small ? 'small' : ''}">${icon}</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${actionHandler ? `<button onclick="${actionHandler}" style="margin-top: 16px;">${escapeHtml(actionText)}</button>` : ''}
      </div>
    `;
  },

  // Renderizar indicador de carga
  renderLoadingSpinner(text = 'Cargando...') {
    return `
      <div class="loading-spinner" style="text-align: center; padding: 40px;">
        <div style="
          width: 40px; 
          height: 40px; 
          border: 3px solid var(--border-secondary); 
          border-top: 3px solid var(--text-accent); 
          border-radius: 50%; 
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="color: var(--text-secondary);">${escapeHtml(text)}</p>
      </div>
    `;
  },

  // Renderizar breadcrumb de navegación
  renderBreadcrumb(items) {
    if (!items || items.length === 0) return '';

    return `
      <nav class="breadcrumb" style="margin-bottom: 16px;">
        <ol style="display: flex; list-style: none; padding: 0; margin: 0; font-size: 14px; color: var(--text-secondary);">
          ${items.map((item, index) => `
            <li style="display: flex; align-items: center;">
              ${index > 0 ? '<span style="margin: 0 8px;">›</span>' : ''}
              ${item.href ? 
                `<a href="${item.href}" style="color: var(--text-accent); text-decoration: none;">${escapeHtml(item.text)}</a>` : 
                `<span style="${index === items.length - 1 ? 'color: var(--text-primary); font-weight: 600;' : ''}">${escapeHtml(item.text)}</span>`
              }
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  },

  // Renderizar barra de progreso
  renderProgressBar(progress, options = {}) {
    const {
      showPercentage = true,
      color = 'var(--text-accent)',
      height = '8px',
      animated = false
    } = options;

    const percentage = Math.min(100, Math.max(0, progress));

    return `
      <div class="progress-container" style="margin: 16px 0;">
        ${showPercentage ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; color: var(--text-secondary);">
          <span>Progreso</span>
          <span>${percentage}%</span>
        </div>` : ''}
        <div style="
          width: 100%; 
          height: ${height}; 
          background: var(--bg-tertiary); 
          border-radius: ${parseInt(height) / 2}px; 
          overflow: hidden;
        ">
          <div style="
            width: ${percentage}%; 
            height: 100%; 
            background: ${color}; 
            transition: width 0.3s ease;
            ${animated ? 'animation: progressPulse 2s ease-in-out infinite;' : ''}
          "></div>
        </div>
      </div>
    `;
  },

  // Renderizar tarjeta de estadística
  renderStatCard(options = {}) {
    const {
      title,
      value,
      icon,
      trend = null,
      color = 'var(--text-accent)',
      size = 'normal'
    } = options;

    const cardClass = size === 'small' ? 'stat-card-small' : 'stat-card';
    const fontSize = size === 'small' ? '1.2rem' : '1.5rem';

    return `
      <div class="${cardClass}" style="
        text-align: center; 
        padding: 16px; 
        background: var(--bg-tertiary); 
        border-radius: 6px; 
        border: 1px solid var(--border-secondary);
      ">
        ${icon ? `<div style="font-size: 1.5rem; margin-bottom: 8px;">${icon}</div>` : ''}
        <div style="font-size: ${fontSize}; font-weight: bold; color: ${color}; margin-bottom: 4px;">
          ${escapeHtml(value)}
        </div>
        <div style="font-size: 12px; color: var(--text-secondary);">
          ${escapeHtml(title)}
        </div>
        ${trend ? `<div style="font-size: 11px; margin-top: 4px; color: ${trend > 0 ? 'var(--success)' : 'var(--danger)'};">
          ${trend > 0 ? '↗' : '↘'} ${Math.abs(trend)}%
        </div>` : ''}
      </div>
    `;
  },

  // ==========================================
  // FUNCIONES DE ACTUALIZACIÓN
  // ==========================================
  
  // Actualizar contadores y estadísticas
  updateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
      const target = counter.dataset.counter;
      const currentValue = parseInt(counter.textContent) || 0;
      let targetValue = 0;

      // Calcular valor objetivo basado en el tipo
      switch (target) {
        case 'total-rules':
          targetValue = state.rules.length;
          break;
        case 'active-rules':
          targetValue = state.rules.filter(r => r.active).length;
          break;
        case 'total-actions':
          targetValue = state.rules.reduce((sum, rule) => sum + (rule.actions?.length || 0), 0);
          break;
      }

      // Animar el cambio si es diferente
      if (currentValue !== targetValue) {
        this.animateCounter(counter, currentValue, targetValue);
      }
    });
  },

  // Animar contador
  animateCounter(element, from, to, duration = 1000) {
    const startTime = Date.now();
    const difference = to - from;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Usar easing para suavizar la animación
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (difference * eased));
      
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  },

  // ==========================================
  // UTILIDADES DE RENDERIZADO
  // ==========================================
  
  // Crear elemento con atributos
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.textContent = content;
    }
    
    return element;
  },

  // Limpiar y renderizar contenedor
  renderInto(containerId, content) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = content;
      return true;
    }
    return false;
  },

  // Agregar estilos dinámicos
  addStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  }
};

// Agregar estilos para animaciones si no existen
if (!document.querySelector('#renderer-styles')) {
  renderer.addStyles(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes progressPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .loading-spinner {
      user-select: none;
    }
  `).id = 'renderer-styles';
}