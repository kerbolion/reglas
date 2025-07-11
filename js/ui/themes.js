// ==========================================
// GESTIÓN DE TEMAS
// ==========================================

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('autoresponder-theme', newTheme);
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function applyTheme(themeName) {
  if (themeName === 'light' || themeName === 'dark') {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('autoresponder-theme', themeName);
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('autoresponder-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Detectar preferencia del sistema
function detectSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Auto-aplicar tema del sistema si no hay preferencia guardada
function autoApplySystemTheme() {
  if (!localStorage.getItem('autoresponder-theme')) {
    const systemTheme = detectSystemTheme();
    applyTheme(systemTheme);
  }
}

// Escuchar cambios en la preferencia del sistema
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('autoresponder-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}