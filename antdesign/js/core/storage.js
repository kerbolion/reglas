// ==========================================
// SISTEMA DE ALMACENAMIENTO - ANT DESIGN
// ==========================================

class StorageManager {
  constructor() {
    this.prefix = 'autoresponder_';
    this.version = '2.1';
    this.compressionEnabled = true;
    this.encryptionEnabled = false; // Para futuras versiones
    
    // Verificar disponibilidad de localStorage
    this.available = this.checkAvailability();
    
    // Configurar limpieza automática
    this.setupCleanup();
  }
  
  // ==========================================
  // VERIFICACIÓN DE DISPONIBILIDAD
  // ==========================================
  
  checkAvailability() {
    try {
      const test = 'storage_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage no está disponible:', e);
      return false;
    }
  }
  
  // ==========================================
  // MÉTODOS PRINCIPALES
  // ==========================================
  
  set(key, value, options = {}) {
    if (!this.available) {
      console.warn('Storage no disponible, datos no guardados');
      return false;
    }
    
    try {
      const {
        compress = this.compressionEnabled,
        encrypt = this.encryptionEnabled,
        ttl = null, // Time to live en milisegundos
        backup = true
      } = options;
      
      const data = {
        value,
        timestamp: Date.now(),
        version: this.version,
        compressed: compress,
        encrypted: encrypt,
        ttl
      };
      
      // Comprimir si está habilitado
      if (compress && this.shouldCompress(value)) {
        data.value = this.compress(JSON.stringify(value));
        data.compressed = true;
      }
      
      // Encriptar si está habilitado (futuro)
      if (encrypt) {
        data.value = this.encrypt(data.value);
        data.encrypted = true;
      }
      
      const serialized = JSON.stringify(data);
      const fullKey = this.prefix + key;
      
      // Crear backup si es necesario
      if (backup && localStorage.getItem(fullKey)) {
        this.createBackup(fullKey);
      }
      
      localStorage.setItem(fullKey, serialized);
      
      // Registrar en índice
      this.updateIndex(key, {
        size: serialized.length,
        lastModified: Date.now(),
        ttl
      });
      
      return true;
      
    } catch (error) {
      console.error('Error guardando en storage:', error);
      state.showNotification('error', 'Error al guardar datos: ' + error.message);
      return false;
    }
  }
  
  get(key, defaultValue = null) {
    if (!this.available) {
      return defaultValue;
    }
    
    try {
      const fullKey = this.prefix + key;
      const stored = localStorage.getItem(fullKey);
      
      if (!stored) {
        return defaultValue;
      }
      
      const data = JSON.parse(stored);
      
      // Verificar TTL
      if (data.ttl && Date.now() > data.timestamp + data.ttl) {
        this.remove(key);
        return defaultValue;
      }
      
      let value = data.value;
      
      // Descomprimir si es necesario
      if (data.compressed) {
        try {
          value = JSON.parse(this.decompress(value));
        } catch (e) {
          console.warn('Error descomprimiendo datos:', e);
          return defaultValue;
        }
      }
      
      // Desencriptar si es necesario (futuro)
      if (data.encrypted) {
        value = this.decrypt(value);
      }
      
      return value;
      
    } catch (error) {
      console.error('Error leyendo del storage:', error);
      return defaultValue;
    }
  }
  
  remove(key) {
    if (!this.available) return false;
    
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      this.removeFromIndex(key);
      return true;
    } catch (error) {
      console.error('Error eliminando del storage:', error);
      return false;
    }
  }
  
  clear() {
    if (!this.available) return false;
    
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => localStorage.removeItem(this.prefix + key));
      this.clearIndex();
      return true;
    } catch (error) {
      console.error('Error limpiando storage:', error);
      return false;
    }
  }
  
  exists(key) {
    if (!this.available) return false;
    return localStorage.getItem(this.prefix + key) !== null;
  }
  
  // ==========================================
  // MÉTODOS DE COMPRESIÓN
  // ==========================================
  
  shouldCompress(value) {
    const serialized = JSON.stringify(value);
    return serialized.length > 1024; // Comprimir si es mayor a 1KB
  }
  
  compress(str) {
    // Implementación simple de compresión LZW
    if (!str) return '';
    
    const dict = {};
    const data = (str + "").split("");
    const out = [];
    let currChar;
    let phrase = data[0];
    let code = 256;
    
    for (let i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    
    return JSON.stringify(out);
  }
  
  decompress(str) {
    // Descompresión LZW
    if (!str) return '';
    
    const data = JSON.parse(str);
    const dict = {};
    let currChar = String.fromCharCode(data[0]);
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    
    for (let i = 1; i < data.length; i++) {
      const currCode = data[i];
      if (currCode < 256) {
        phrase = String.fromCharCode(data[i]);
      } else {
        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    
    return out.join("");
  }
  
  // ==========================================
  // MÉTODOS DE ENCRIPTACIÓN (FUTURO)
  // ==========================================
  
  encrypt(data) {
    // Placeholder para futura implementación
    return data;
  }
  
  decrypt(data) {
    // Placeholder para futura implementación
    return data;
  }
  
  // ==========================================
  // GESTIÓN DE ÍNDICE
  // ==========================================
  
  updateIndex(key, metadata) {
    try {
      const index = this.getIndex();
      index[key] = {
        ...metadata,
        lastAccessed: Date.now()
      };
      localStorage.setItem(this.prefix + '_index', JSON.stringify(index));
    } catch (error) {
      console.warn('Error actualizando índice:', error);
    }
  }
  
  getIndex() {
    try {
      const stored = localStorage.getItem(this.prefix + '_index');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error leyendo índice:', error);
      return {};
    }
  }
  
  removeFromIndex(key) {
    try {
      const index = this.getIndex();
      delete index[key];
      localStorage.setItem(this.prefix + '_index', JSON.stringify(index));
    } catch (error) {
      console.warn('Error eliminando del índice:', error);
    }
  }
  
  clearIndex() {
    localStorage.removeItem(this.prefix + '_index');
  }
  
  // ==========================================
  // UTILIDADES
  // ==========================================
  
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix) && !key.endsWith('_index') && !key.endsWith('_backup')) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
  
  getStorageInfo() {
    const info = {
      available: this.available,
      totalKeys: 0,
      totalSize: 0,
      compressedItems: 0,
      encryptedItems: 0,
      expiredItems: 0,
      items: {}
    };
    
    if (!this.available) return info;
    
    const keys = this.getAllKeys();
    info.totalKeys = keys.length;
    
    keys.forEach(key => {
      try {
        const fullKey = this.prefix + key;
        const stored = localStorage.getItem(fullKey);
        if (stored) {
          const data = JSON.parse(stored);
          const size = stored.length;
          
          info.totalSize += size;
          info.items[key] = {
            size,
            timestamp: data.timestamp,
            compressed: data.compressed || false,
            encrypted: data.encrypted || false,
            expired: data.ttl && Date.now() > data.timestamp + data.ttl
          };
          
          if (data.compressed) info.compressedItems++;
          if (data.encrypted) info.encryptedItems++;
          if (info.items[key].expired) info.expiredItems++;
        }
      } catch (e) {
        console.warn(`Error procesando clave ${key}:`, e);
      }
    });
    
    return info;
  }
  
  // ==========================================
  // SISTEMA DE BACKUP
  // ==========================================
  
  createBackup(key) {
    try {
      const current = localStorage.getItem(key);
      if (current) {
        const backupKey = key + '_backup_' + Date.now();
        localStorage.setItem(backupKey, current);
        
        // Mantener solo los últimos 3 backups
        this.cleanupBackups(key);
      }
    } catch (error) {
      console.warn('Error creando backup:', error);
    }
  }
  
  cleanupBackups(baseKey) {
    try {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(baseKey + '_backup_')) {
          const timestamp = parseInt(key.split('_backup_')[1]);
          backups.push({ key, timestamp });
        }
      }
      
      // Ordenar por timestamp y mantener solo los últimos 3
      backups.sort((a, b) => b.timestamp - a.timestamp);
      backups.slice(3).forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    } catch (error) {
      console.warn('Error limpiando backups:', error);
    }
  }
  
  restoreFromBackup(key) {
    try {
      const backups = [];
      const baseKey = this.prefix + key;
      
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(baseKey + '_backup_')) {
          const timestamp = parseInt(storageKey.split('_backup_')[1]);
          backups.push({ key: storageKey, timestamp });
        }
      }
      
      if (backups.length === 0) {
        return false;
      }
      
      // Usar el backup más reciente
      backups.sort((a, b) => b.timestamp - a.timestamp);
      const latestBackup = localStorage.getItem(backups[0].key);
      
      if (latestBackup) {
        localStorage.setItem(baseKey, latestBackup);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return false;
    }
  }
  
  // ==========================================
  // LIMPIEZA AUTOMÁTICA
  // ==========================================
  
  setupCleanup() {
    // Ejecutar limpieza al cargar
    this.cleanup();
    
    // Programar limpieza periódica
    setInterval(() => {
      this.cleanup();
    }, 300000); // Cada 5 minutos
  }
  
  cleanup() {
    if (!this.available) return;
    
    try {
      let cleaned = 0;
      const keys = this.getAllKeys();
      
      keys.forEach(key => {
        const fullKey = this.prefix + key;
        const stored = localStorage.getItem(fullKey);
        
        if (stored) {
          try {
            const data = JSON.parse(stored);
            
            // Eliminar elementos expirados
            if (data.ttl && Date.now() > data.timestamp + data.ttl) {
              localStorage.removeItem(fullKey);
              this.removeFromIndex(key);
              cleaned++;
            }
          } catch (e) {
            // Eliminar elementos corruptos
            localStorage.removeItem(fullKey);
            this.removeFromIndex(key);
            cleaned++;
          }
        }
      });
      
      // Limpiar backups antiguos (más de 7 días)
      this.cleanupOldBackups();
      
      if (cleaned > 0) {
        console.log(`Storage cleanup: ${cleaned} elementos eliminados`);
      }
      
    } catch (error) {
      console.warn('Error en limpieza automática:', error);
    }
  }
  
  cleanupOldBackups() {
    try {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes('_backup_')) {
          const timestampStr = key.split('_backup_')[1];
          const timestamp = parseInt(timestampStr);
          
          if (timestamp < oneWeekAgo) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Error limpiando backups antiguos:', error);
    }
  }
  
  // ==========================================
  // MÉTODOS DE MIGRACIÓN
  // ==========================================
  
  migrate() {
    try {
      const currentVersion = this.get('_version', '1.0');
      
      if (currentVersion !== this.version) {
        console.log(`Migrando storage de v${currentVersion} a v${this.version}`);
        
        // Aplicar migraciones según la versión
        if (currentVersion === '1.0') {
          this.migrateFrom1_0();
        }
        
        if (currentVersion < '2.0') {
          this.migrateFrom2_0();
        }
        
        // Actualizar versión
        this.set('_version', this.version);
        
        state.showNotification('success', 'Datos migrados correctamente');
      }
    } catch (error) {
      console.error('Error en migración:', error);
      state.showNotification('error', 'Error en migración de datos');
    }
  }
  
  migrateFrom1_0() {
    // Migrar estructura de datos antigua
    console.log('Aplicando migración desde v1.0...');
    
    const oldData = localStorage.getItem('autoresponder-data');
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        this.set('main_data', parsed);
        localStorage.removeItem('autoresponder-data');
      } catch (e) {
        console.warn('Error migrando datos v1.0:', e);
      }
    }
  }
  
  migrateFrom2_0() {
    // Aplicar compresión a datos existentes
    console.log('Aplicando migración desde v2.0...');
    
    const keys = this.getAllKeys();
    keys.forEach(key => {
      if (key !== '_version' && key !== '_index') {
        const value = this.get(key);
        if (value) {
          this.set(key, value, { compress: true });
        }
      }
    });
  }
}

// ==========================================
// WRAPPER FUNCTIONS PARA COMPATIBILIDAD
// ==========================================

// Crear instancia global del storage manager
const storage = new StorageManager();

// Funciones de conveniencia
function saveToStorage(key, value, options = {}) {
  return storage.set(key, value, options);
}

function loadFromStorage(key, defaultValue = null) {
  return storage.get(key, defaultValue);
}

function removeFromStorage(key) {
  return storage.remove(key);
}

function clearStorage() {
  return storage.clear();
}

function getStorageInfo() {
  return storage.getStorageInfo();
}

// ==========================================
// FUNCIONES ESPECÍFICAS PARA AUTORESPONDER
// ==========================================

function saveAppData() {
  const data = {
    instances: state.instances,
    currentInstance: state.currentInstance,
    currentRulesGroup: state.currentRulesGroup,
    sessionConfig: state.sessionConfig,
    lastSaved: new Date().toISOString()
  };
  
  return saveToStorage('main_data', data, {
    compress: true,
    backup: true
  });
}

function loadAppData() {
  const data = loadFromStorage('main_data');
  
  if (data) {
    state.instances = data.instances || [];
    state.currentInstance = data.currentInstance || null;
    state.currentRulesGroup = data.currentRulesGroup || null;
    
    if (data.sessionConfig) {
      state.sessionConfig = { ...state.sessionConfig, ...data.sessionConfig };
    }
    
    return true;
  }
  
  return false;
}

function saveUserPreferences(preferences) {
  return saveToStorage('user_preferences', preferences, {
    ttl: 30 * 24 * 60 * 60 * 1000 // 30 días
  });
}

function loadUserPreferences() {
  return loadFromStorage('user_preferences', {
    theme: 'light',
    language: 'es',
    compactMode: false,
    showTooltips: true
  });
}

function saveRecentFiles(files) {
  return saveToStorage('recent_files', files.slice(0, 10), { // Máximo 10 archivos recientes
    ttl: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
}

function loadRecentFiles() {
  return loadFromStorage('recent_files', []);
}

// ==========================================
// EVENTOS DE STORAGE
// ==========================================

// Escuchar cambios en localStorage de otras pestañas
window.addEventListener('storage', function(e) {
  if (e.key && e.key.startsWith(storage.prefix)) {
    const key = e.key.substring(storage.prefix.length);
    
    // Recargar datos si cambió la información principal
    if (key === 'main_data') {
      const confirmReload = confirm(
        'Los datos han sido modificados en otra pestaña. ¿Desea recargar para ver los cambios?'
      );
      
      if (confirmReload) {
        location.reload();
      }
    }
    
    // Notificar cambios en preferencias
    if (key === 'user_preferences') {
      state.showNotification('info', 'Preferencias actualizadas desde otra pestaña');
    }
  }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Ejecutar migración si es necesario
  storage.migrate();
  
  // Verificar integridad de datos
  if (storage.available) {
    const info = getStorageInfo();
    console.log('Storage Info:', info);
    
    if (info.expiredItems > 0) {
      console.log(`${info.expiredItems} elementos expirados serán limpiados`);
    }
    
    // Alertar si el storage está casi lleno (más de 8MB)
    if (info.totalSize > 8 * 1024 * 1024) {
      state.showNotification('warning', 
        'El almacenamiento local está casi lleno. Considere exportar y limpiar datos antiguos.');
    }
  } else {
    state.showNotification('warning', 
      'Almacenamiento local no disponible. Los datos no se guardarán automáticamente.');
  }
});

// ==========================================
// EXPORTAR PARA USO GLOBAL
// ==========================================

window.StorageManager = storage;
window.AutoResponderStorage = {
  save: saveToStorage,
  load: loadFromStorage,
  remove: removeFromStorage,
  clear: clearStorage,
  info: getStorageInfo,
  
  // Funciones específicas
  saveAppData,
  loadAppData,
  saveUserPreferences,
  loadUserPreferences,
  saveRecentFiles,
  loadRecentFiles,
  
  // Utilidades
  backup: (key) => storage.createBackup(storage.prefix + key),
  restore: (key) => storage.restoreFromBackup(key),
  cleanup: () => storage.cleanup()
};