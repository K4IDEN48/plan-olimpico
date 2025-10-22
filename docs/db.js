// ===== SISTEMA DE BASE DE DATOS IndexedDB =====
// Gestión robusta de datos para Plan Olímpico

class PlanOlimpicoDB {
  constructor() {
    this.dbName = 'PlanOlimpicoDatabase';
    this.version = 1;
    this.db = null;
  }

  // ===== INICIALIZACIÓN =====
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ Error abriendo IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB iniciada correctamente');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🔄 Actualizando estructura de base de datos...');

        // Object Store: Entrenamientos completados
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'date' });
          workoutStore.createIndex('weekNumber', 'weekNumber', { unique: false });
          workoutStore.createIndex('completed', 'completed', { unique: false });
          console.log('✅ Store "workouts" creado');
        }

        // Object Store: Monitoreo diario
        if (!db.objectStoreNames.contains('monitoring')) {
          const monitoringStore = db.createObjectStore('monitoring', { keyPath: 'date' });
          monitoringStore.createIndex('fcReposo', 'fcReposo', { unique: false });
          console.log('✅ Store "monitoring" creado');
        }

        // Object Store: Tests y competencias
        if (!db.objectStoreNames.contains('tests')) {
          const testStore = db.createObjectStore('tests', { keyPath: 'id', autoIncrement: true });
          testStore.createIndex('date', 'date', { unique: false });
          testStore.createIndex('distance', 'distance', { unique: false });
          console.log('✅ Store "tests" creado');
        }

        // Object Store: Hábitos diarios
        if (!db.objectStoreNames.contains('habits')) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'date' });
          console.log('✅ Store "habits" creado');
        }

        // Object Store: Hidratación (agua)
        if (!db.objectStoreNames.contains('water')) {
          const waterStore = db.createObjectStore('water', { keyPath: 'date' });
          console.log('✅ Store "water" creado');
        }

        // Object Store: Configuración de usuario
        if (!db.objectStoreNames.contains('config')) {
          const configStore = db.createObjectStore('config', { keyPath: 'key' });
          console.log('✅ Store "config" creado');
        }
      };
    });
  }

  // ===== OPERACIONES GENÉRICAS =====
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByKey(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== ENTRENAMIENTOS =====
  async saveWorkout(workoutData) {
    try {
      await this.put('workouts', {
        date: workoutData.date,
        weekNumber: workoutData.weekNumber,
        type: workoutData.type,
        km: workoutData.km,
        pace: workoutData.pace,
        completed: workoutData.completed || false,
        realKm: workoutData.realKm || null,
        totalTime: workoutData.totalTime || null,
        avgPace: workoutData.avgPace || null,
        feeling: workoutData.feeling || null,
        rpe: workoutData.rpe || null,
        splits: workoutData.splits || null,
        notes: workoutData.notes || '',
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Entrenamiento guardado: ${workoutData.date}`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando entrenamiento:', error);
      return false;
    }
  }

  async getWorkout(date) {
    try {
      return await this.getByKey('workouts', date);
    } catch (error) {
      console.error('❌ Error obteniendo entrenamiento:', error);
      return null;
    }
  }

  async getAllWorkouts() {
    try {
      return await this.getAll('workouts');
    } catch (error) {
      console.error('❌ Error obteniendo entrenamientos:', error);
      return [];
    }
  }

  async getCompletedWorkouts() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('workouts', 'readonly');
      const store = transaction.objectStore('workouts');
      const index = store.index('completed');
      const request = index.getAll(true);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markWorkoutComplete(date, completedData = {}) {
    try {
      const existing = await this.getWorkout(date);
      if (existing) {
        existing.completed = true;
        existing.realKm = completedData.realKm || existing.km;
        existing.totalTime = completedData.totalTime || null;
        existing.avgPace = completedData.avgPace || null;
        existing.feeling = completedData.feeling || null;
        existing.rpe = completedData.rpe || null;
        existing.splits = completedData.splits || null;
        existing.notes = completedData.notes || '';
        existing.completedAt = new Date().toISOString();
        
        await this.put('workouts', existing);
        console.log(`✅ Entrenamiento marcado completo: ${date}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error marcando entrenamiento completo:', error);
      return false;
    }
  }

  async markWorkoutIncomplete(date) {
    try {
      const existing = await this.getWorkout(date);
      if (existing) {
        existing.completed = false;
        existing.completedAt = null;
        await this.put('workouts', existing);
        console.log(`✅ Entrenamiento desmarcado: ${date}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error desmarcando entrenamiento:', error);
      return false;
    }
  }

  // ===== MONITOREO DIARIO =====
  async saveMonitoring(monitoringData) {
    try {
      await this.put('monitoring', {
        date: monitoringData.date,
        fcReposo: monitoringData.fcReposo,
        peso: monitoringData.peso,
        horasSueno: monitoringData.horasSueno,
        calidadSueno: monitoringData.calidadSueno,
        nivelDolor: monitoringData.nivelDolor,
        estadoAnimo: monitoringData.estadoAnimo,
        molestias: monitoringData.molestias || [],
        notas: monitoringData.notas || '',
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Monitoreo guardado: ${monitoringData.date}`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando monitoreo:', error);
      return false;
    }
  }

  async getMonitoring(date) {
    try {
      return await this.getByKey('monitoring', date);
    } catch (error) {
      console.error('❌ Error obteniendo monitoreo:', error);
      return null;
    }
  }

  async getAllMonitoring() {
    try {
      return await this.getAll('monitoring');
    } catch (error) {
      console.error('❌ Error obteniendo monitoreos:', error);
      return [];
    }
  }

  async getRecentMonitoring(days = 7) {
    try {
      const all = await this.getAllMonitoring();
      return all
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, days);
    } catch (error) {
      console.error('❌ Error obteniendo monitoreos recientes:', error);
      return [];
    }
  }

  // ===== TESTS Y COMPETENCIAS =====
  async saveTest(testData) {
    try {
      const result = await this.put('tests', {
        date: testData.date,
        distance: testData.distance,
        time: testData.time,
        notes: testData.notes || '',
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Test guardado: ${testData.distance}K - ${testData.date}`);
      return result;
    } catch (error) {
      console.error('❌ Error guardando test:', error);
      return null;
    }
  }

  async getAllTests() {
    try {
      const tests = await this.getAll('tests');
      return tests.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('❌ Error obteniendo tests:', error);
      return [];
    }
  }

  // ===== HÁBITOS DIARIOS =====
  async saveHabits(date, habitsData) {
    try {
      await this.put('habits', {
        date: date,
        habits: habitsData,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('❌ Error guardando hábitos:', error);
      return false;
    }
  }

  async getHabits(date) {
    try {
      const result = await this.getByKey('habits', date);
      return result ? result.habits : {};
    } catch (error) {
      console.error('❌ Error obteniendo hábitos:', error);
      return {};
    }
  }

  // ===== HIDRATACIÓN =====
  async saveWater(date, waterData) {
    try {
      await this.put('water', {
        date: date,
        glasses: waterData,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('❌ Error guardando hidratación:', error);
      return false;
    }
  }

  async getWater(date) {
    try {
      const result = await this.getByKey('water', date);
      return result ? result.glasses : [];
    } catch (error) {
      console.error('❌ Error obteniendo hidratación:', error);
      return [];
    }
  }

  // ===== CONFIGURACIÓN =====
  async saveConfig(key, value) {
    try {
      await this.put('config', { key: key, value: value });
      return true;
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      return false;
    }
  }

  async getConfig(key) {
    try {
      const result = await this.getByKey('config', key);
      return result ? result.value : null;
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return null;
    }
  }

  // ===== ESTADÍSTICAS =====
  async getStats() {
    try {
      const workouts = await this.getAllWorkouts();
      const completed = workouts.filter(w => w.completed);
      const totalKm = completed.reduce((sum, w) => sum + (w.realKm || w.km), 0);
      
      const monitoring = await this.getAllMonitoring();
      const avgFC = monitoring.length > 0
        ? monitoring.reduce((sum, m) => sum + m.fcReposo, 0) / monitoring.length
        : 0;

      return {
        totalWorkouts: workouts.length,
        completedWorkouts: completed.length,
        totalKm: Math.round(totalKm * 10) / 10,
        avgFC: Math.round(avgFC),
        adherencia: workouts.length > 0 
          ? Math.round((completed.length / workouts.length) * 100) 
          : 0
      };
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      return {
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalKm: 0,
        avgFC: 0,
        adherencia: 0
      };
    }
  }

  // ===== BACKUP Y RESTORE =====
  async exportAllData() {
    try {
      const data = {
        workouts: await this.getAll('workouts'),
        monitoring: await this.getAll('monitoring'),
        tests: await this.getAll('tests'),
        habits: await this.getAll('habits'),
        water: await this.getAll('water'),
        config: await this.getAll('config'),
        exportDate: new Date().toISOString(),
        version: this.version
      };
      console.log('✅ Datos exportados correctamente');
      return data;
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      return null;
    }
  }

  async importAllData(data) {
    try {
      // Limpiar datos existentes
      await this.clear('workouts');
      await this.clear('monitoring');
      await this.clear('tests');
      await this.clear('habits');
      await this.clear('water');
      await this.clear('config');

      // Importar nuevos datos
      for (const workout of (data.workouts || [])) {
        await this.put('workouts', workout);
      }
      for (const monitoring of (data.monitoring || [])) {
        await this.put('monitoring', monitoring);
      }
      for (const test of (data.tests || [])) {
        await this.put('tests', test);
      }
      for (const habit of (data.habits || [])) {
        await this.put('habits', habit);
      }
      for (const water of (data.water || [])) {
        await this.put('water', water);
      }
      for (const config of (data.config || [])) {
        await this.put('config', config);
      }

      console.log('✅ Datos importados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error importando datos:', error);
      return false;
    }
  }

  // ===== MIGRACIÓN DESDE LOCALSTORAGE =====
  async migrateFromLocalStorage() {
    try {
      const oldData = localStorage.getItem('planOlimpicoData');
      if (!oldData) {
        console.log('ℹ️ No hay datos en localStorage para migrar');
        return false;
      }

      const parsed = JSON.parse(oldData);
      console.log('🔄 Migrando datos desde localStorage...');

      // Migrar monitoreo
      if (parsed.monitoringData && parsed.monitoringData.length > 0) {
        for (const item of parsed.monitoringData) {
          await this.saveMonitoring(item);
        }
        console.log(`✅ ${parsed.monitoringData.length} registros de monitoreo migrados`);
      }

      // Migrar tests
      if (parsed.testResults && parsed.testResults.length > 0) {
        for (const test of parsed.testResults) {
          await this.saveTest(test);
        }
        console.log(`✅ ${parsed.testResults.length} tests migrados`);
      }

      // Migrar hábitos
      if (parsed.habits) {
        for (const [date, habits] of Object.entries(parsed.habits)) {
          await this.saveHabits(date, habits);
        }
        console.log(`✅ Hábitos migrados`);
      }

      // Migrar hidratación
      if (parsed.waterIntake) {
        for (const [date, water] of Object.entries(parsed.waterIntake)) {
          await this.saveWater(date, water);
        }
        console.log(`✅ Hidratación migrada`);
      }

      // Migrar configuración
      if (parsed.theme) {
        await this.saveConfig('theme', parsed.theme);
      }
      if (parsed.weight) {
        await this.saveConfig('weight', parsed.weight);
      }

      console.log('✅ Migración completada exitosamente');
      
      // Opcional: Eliminar localStorage viejo
      // localStorage.removeItem('planOlimpicoData');
      
      return true;
    } catch (error) {
      console.error('❌ Error en migración:', error);
      return false;
    }
  }

  // ===== LIMPIEZA Y MANTENIMIENTO =====
  async deleteOldData(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const monitoring = await this.getAllMonitoring();
      let deleted = 0;

      for (const item of monitoring) {
        if (item.date < cutoffStr) {
          await this.delete('monitoring', item.date);
          deleted++;
        }
      }

      console.log(`✅ ${deleted} registros antiguos eliminados`);
      return deleted;
    } catch (error) {
      console.error('❌ Error eliminando datos antiguos:', error);
      return 0;
    }
  }
}

// ===== INSTANCIA GLOBAL =====
const db = new PlanOlimpicoDB();

// ===== INICIALIZACIÓN AUTOMÁTICA =====
(async () => {
  try {
    await db.init();
    
    // Migrar datos de localStorage si existen
    await db.migrateFromLocalStorage();
    
    // Exportar instancia globalmente
    window.planDB = db;
    
    console.log('✅ Sistema de base de datos listo');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    alert('Error al inicializar la base de datos. Por favor recarga la página.');
  }
})();