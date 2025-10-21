// ===== DATOS DEL PLAN DE 10 SEMANAS =====

const PLAN_DATA = {
  raceDate: '2025-12-31',
  raceTime: '10:00',
  targetTime: '38:00',
  targetPace: '3:48',
  
  weeks: [
    {
      number: 1,
      mesociclo: 1,
      dateStart: '2025-10-21',
      dateEnd: '2025-10-27',
      type: 'Carga Ligera',
      totalKm: 28,
      focus: 'Adaptación - Base aeróbica. Enfoque en técnica de carrera y prevención de lesiones. No buscar velocidad.',
      workouts: [
        { day: 'Domingo', date: '2025-10-19', type: 'Test', km: 5, pace: '4:00', details: 'Test 5K - Confirma marca actual. Esfuerzo 95%', completed: false },
        { day: 'Lunes', date: '2025-10-20', type: 'Descanso', km: 0, pace: '-', details: 'Recuperación del test', completed: false },
        { day: 'Martes', date: '2025-10-21', type: 'Suave', km: 4, pace: '5:30-6:00', details: 'Ritmo conversacional. Técnica de carrera.', completed: false },
        { day: 'Miércoles', date: '2025-10-22', type: 'Medio', km: 6, pace: '5:00-5:15', details: 'Sentir ritmo cómodo', completed: false },
        { day: 'Jueves', date: '2025-10-23', type: 'Core', km: 0, pace: '-', details: 'Core + estiramientos 30 min', completed: false },
        { day: 'Viernes', date: '2025-10-24', type: 'Suave', km: 4, pace: '5:30-6:00', details: 'Relajado', completed: false },
        { day: 'Sábado', date: '2025-10-25', type: 'Largo', km: 8, pace: '5:15-5:30', details: 'Construir base aeróbica', completed: false }
      ]
    },
    {
      number: 2,
      mesociclo: 1,
      dateStart: '2025-10-28',
      dateEnd: '2025-11-03',
      type: 'Carga Media',
      totalKm: 35,
      focus: 'Construcción - Aumento gradual de volumen. Introducir trabajo de umbral (tempo). Monitorear respuesta del cuerpo.',
      workouts: [
        { day: 'Domingo', date: '2025-10-26', type: 'Suave', km: 5, pace: '5:30', details: 'Recuperación del largo', completed: false },
        { day: 'Lunes', date: '2025-10-27', type: 'Técnica', km: 4, pace: '5:00', details: 'Drills: skipping, tobillos, zancadas', completed: false },
        { day: 'Martes', date: '2025-10-28', type: 'Tempo', km: 7, pace: '4:30', details: '2K calent + 4K a 4:30/km + 1K enfriamiento', completed: false },
        { day: 'Miércoles', date: '2025-10-29', type: 'Core', km: 0, pace: '-', details: 'Core + movilidad 30 min', completed: false },
        { day: 'Jueves', date: '2025-10-30', type: 'Medio', km: 5, pace: '4:50-5:00', details: 'Ritmo controlado', completed: false },
        { day: 'Viernes', date: '2025-10-31', type: 'Descanso', km: 0, pace: '-', details: 'Adaptación activa - estiramientos', completed: false },
        { day: 'Sábado', date: '2025-11-01', type: 'Largo', km: 13, pace: '5:15-5:30', details: 'Progresivo últimos 3K', completed: false }
      ]
    },
    {
      number: 3,
      mesociclo: 1,
      dateStart: '2025-11-04',
      dateEnd: '2025-11-10',
      type: 'Carga Fuerte',
      totalKm: 42,
      focus: 'Volumen pico - Semana más dura del mesociclo. Aquí construyes resistencia específica. Monitorear lesiones.',
      workouts: [
        { day: 'Domingo', date: '2025-11-02', type: 'Recuperación', km: 6, pace: '5:45', details: 'Muy suave', completed: false },
        { day: 'Lunes', date: '2025-11-03', type: 'Tempo', km: 8, pace: '4:20-4:30', details: '2K calent + 5K a 4:20-4:30/km + 1K enfriamiento', completed: false },
        { day: 'Martes', date: '2025-11-04', type: 'Suave', km: 5, pace: '5:15', details: 'Técnica de carrera', completed: false },
        { day: 'Miércoles', date: '2025-11-05', type: 'Core', km: 0, pace: '-', details: 'Core + fuerza 40 min. Incluye trabajo excéntrico tendones', completed: false },
        { day: 'Jueves', date: '2025-11-06', type: 'Intervalos', km: 9, pace: '4:00', details: '6×1K a 4:00/km, rec 2min trote', completed: false },
        { day: 'Viernes', date: '2025-11-07', type: 'Descanso', km: 0, pace: '-', details: 'Solo estiramientos y rodillo', completed: false },
        { day: 'Sábado', date: '2025-11-08', type: 'Largo', km: 15, pace: '5:15/4:45', details: 'Primeros 10K a 5:15/km, últimos 5K a 4:45/km', completed: false }
      ]
    },
    {
      number: 4,
      mesociclo: 1,
      dateStart: '2025-11-11',
      dateEnd: '2025-11-17',
      type: 'Descarga',
      totalKm: 24,
      focus: 'Supercompensación - Recuperación activa. El cuerpo absorbe entrenamiento y mejora. CRUCIAL.',
      workouts: [
        { day: 'Domingo', date: '2025-11-09', type: 'Descanso', km: 0, pace: '-', details: 'El cuerpo se repara', completed: false },
        { day: 'Lunes', date: '2025-11-10', type: 'Suave', km: 5, pace: '6:00', details: 'Casi caminar-trotar', completed: false },
        { day: 'Martes', date: '2025-11-11', type: 'Técnica', km: 4, pace: '-', details: 'Drills + zancadas sueltas', completed: false },
        { day: 'Miércoles', date: '2025-11-12', type: 'Core', km: 0, pace: '-', details: 'Core ligero 20 min - Sin fatiga', completed: false },
        { day: 'Jueves', date: '2025-11-13', type: 'Medio', km: 5, pace: '4:45', details: 'Sentirte fresco', completed: false },
        { day: 'Viernes', date: '2025-11-14', type: 'Descanso', km: 0, pace: '-', details: 'Estiramientos', completed: false },
        { day: 'Sábado', date: '2025-11-15', type: 'Test', km: 10, pace: '-', details: 'Simular carrera - Objetivo sub-40:00', completed: false }
      ]
    },
    {
      number: 5,
      mesociclo: 2,
      dateStart: '2025-11-18',
      dateEnd: '2025-11-24',
      type: 'Carga Media',
      totalKm: 38,
      focus: 'Trabajo de umbral - Mejorar umbral anaeróbico. Entrenar al ritmo objetivo de carrera.',
      workouts: [
        { day: 'Domingo', date: '2025-11-16', type: 'Suave', km: 6, pace: '-', details: 'Post-prueba recuperación', completed: false },
        { day: 'Lunes', date: '2025-11-17', type: 'Tempo', km: 10, pace: '4:15-4:20', details: '2K calent + 7K a 4:15-4:20/km + 1K enfriamiento', completed: false },
        { day: 'Martes', date: '2025-11-18', type: 'Técnica', km: 5, pace: '-', details: 'Enfoque en cadencia alta (180+ pasos/min)', completed: false },
        { day: 'Miércoles', date: '2025-11-19', type: 'Core', km: 0, pace: '-', details: 'Core + fuerza 35 min', completed: false },
        { day: 'Jueves', date: '2025-11-20', type: 'Intervalos', km: 9, pace: '4:15-4:20', details: '5×1200m a 4:15-4:20/km, rec 90seg', completed: false },
        { day: 'Viernes', date: '2025-11-21', type: 'Descanso', km: 0, pace: '-', details: 'Rodillo de espuma 15 min', completed: false },
        { day: 'Sábado', date: '2025-11-22', type: 'Largo', km: 12, pace: '5:00', details: 'Cómodo pero sostenido', completed: false }
      ]
    },
    {
      number: 6,
      mesociclo: 2,
      dateStart: '2025-11-25',
      dateEnd: '2025-12-01',
      type: 'Carga Fuerte',
      totalKm: 44,
      focus: 'Velocidad + Volumen - Semana más dura del plan. Combinas velocidad específica con volumen.',
      workouts: [
        { day: 'Domingo', date: '2025-11-23', type: 'Suave', km: 7, pace: '5:30', details: 'Recuperación', completed: false },
        { day: 'Lunes', date: '2025-11-24', type: 'Intervalos', km: 11, pace: '4:00-4:05', details: '4×2K a 4:00-4:05/km (más rápido que ritmo carrera), rec 3min', completed: false },
        { day: 'Martes', date: '2025-11-25', type: 'Medio', km: 6, pace: '4:40', details: 'Ritmo controlado', completed: false },
        { day: 'Miércoles', date: '2025-11-26', type: 'Core', km: 0, pace: '-', details: 'Core + movilidad 30 min', completed: false },
        { day: 'Jueves', date: '2025-11-27', type: 'Tempo', km: 8, pace: '4:30-3:55', details: 'Progresivo: empieza 4:30/km → termina 3:55/km', completed: false },
        { day: 'Viernes', date: '2025-11-28', type: 'Descanso', km: 0, pace: '-', details: 'Estiramientos profundos', completed: false },
        { day: 'Sábado', date: '2025-11-29', type: 'Largo', km: 16, pace: '5:15/4:30', details: 'Primeros 12K a 5:15/km, últimos 4K a 4:30/km', completed: false }
      ]
    },
    {
      number: 7,
      mesociclo: 2,
      dateStart: '2025-12-02',
      dateEnd: '2025-12-08',
      type: 'Carga Muy Fuerte',
      totalKm: 46,
      focus: 'Pico de forma - Última semana fuerte. Simulas esfuerzo de carrera en contexto de fatiga.',
      workouts: [
        { day: 'Domingo', date: '2025-11-30', type: 'Recuperación', km: 6, pace: '5:45', details: 'Muy suave', completed: false },
        { day: 'Lunes', date: '2025-12-01', type: 'Tempo', km: 12, pace: '4:10-4:15', details: '2K calent + 9K a 4:10-4:15/km + 1K enfriamiento', completed: false },
        { day: 'Martes', date: '2025-12-02', type: 'Técnica', km: 5, pace: '-', details: 'Zancadas explosivas 6×100m al final', completed: false },
        { day: 'Miércoles', date: '2025-12-03', type: 'Core', km: 0, pace: '-', details: 'Core + fuerza 40 min', completed: false },
        { day: 'Jueves', date: '2025-12-04', type: 'Intervalos', km: 12, pace: '3:58-4:04', details: '10×800m a 3:10-3:15 (ritmo 3:58-4:04/km), rec 90seg', completed: false },
        { day: 'Viernes', date: '2025-12-05', type: 'Descanso', km: 0, pace: '-', details: 'Solo movilidad', completed: false },
        { day: 'Sábado', date: '2025-12-06', type: 'Largo', km: 14, pace: '5:15/3:48', details: 'Últimos 5K a ritmo objetivo 3:48/km', completed: false }
      ]
    },
    {
      number: 8,
      mesociclo: 2,
      dateStart: '2025-12-09',
      dateEnd: '2025-12-15',
      type: 'Descarga',
      totalKm: 28,
      focus: 'Recuperación - Absorber entrenamiento. Cuerpo se fortalece en descanso.',
      workouts: [
        { day: 'Domingo', date: '2025-12-07', type: 'Descanso', km: 0, pace: '-', details: 'Descanso total', completed: false },
        { day: 'Lunes', date: '2025-12-08', type: 'Suave', km: 6, pace: '5:45-6:00', details: 'Muy suave', completed: false },
        { day: 'Martes', date: '2025-12-09', type: 'Técnica', km: 5, pace: '-', details: 'Técnica ligera - Sin forzar', completed: false },
        { day: 'Miércoles', date: '2025-12-10', type: 'Core', km: 0, pace: '-', details: 'Core suave 20 min', completed: false },
        { day: 'Jueves', date: '2025-12-11', type: 'Tempo', km: 5, pace: '4:15', details: 'Sentir piernas frescas', completed: false },
        { day: 'Viernes', date: '2025-12-12', type: 'Descanso', km: 0, pace: '-', details: 'Estiramientos', completed: false },
        { day: 'Sábado', date: '2025-12-13', type: 'Medio', km: 8, pace: '4:30', details: 'Control mental', completed: false }
      ]
    },
    {
      number: 9,
      mesociclo: 3,
      dateStart: '2025-12-16',
      dateEnd: '2025-12-22',
      type: 'Calidad',
      totalKm: 36,
      focus: 'Afinar velocidad - Entrenar más rápido que ritmo de carrera para que se sienta "fácil".',
      workouts: [
        { day: 'Domingo', date: '2025-12-14', type: 'Suave', km: 6, pace: '5:30', details: 'Recuperación', completed: false },
        { day: 'Lunes', date: '2025-12-15', type: 'Tempo', km: 8, pace: '3:55-4:00', details: '2K + 5K a 3:55-4:00/km + 1K - MÁS RÁPIDO que objetivo', completed: false },
        { day: 'Martes', date: '2025-12-16', type: 'Técnica', km: 5, pace: '-', details: 'Drills de velocidad', completed: false },
        { day: 'Miércoles', date: '2025-12-17', type: 'Core', km: 0, pace: '-', details: 'Core + explosividad 30 min - Saltos pliométricos suaves', completed: false },
        { day: 'Jueves', date: '2025-12-18', type: 'Intervalos', km: 9, pace: '3:45-3:50', details: '6×1K a 3:45-3:50/km (súper rápido), rec 3min', completed: false },
        { day: 'Viernes', date: '2025-12-19', type: 'Descanso', km: 0, pace: '-', details: 'Masaje o rodillo profundo', completed: false },
        { day: 'Sábado', date: '2025-12-20', type: 'Test', km: 10, pace: '3:48', details: 'Simulacro: Primeros 5K a 3:52/km, segundos 5K a 3:44/km - Objetivo 38:00 EXACTO', completed: false }
      ]
    },
    {
      number: 10,
      mesociclo: 3,
      dateStart: '2025-12-23',
      dateEnd: '2025-12-29',
      type: 'Pre-competencia',
      totalKm: 24,
      focus: 'Frescura máxima - Glucógeno cargado. Mente afilada.',
      workouts: [
        { day: 'Domingo', date: '2025-12-21', type: 'Descanso', km: 0, pace: '-', details: 'Cero actividad física', completed: false },
        { day: 'Lunes', date: '2025-12-22', type: 'Suave', km: 5, pace: '5:45', details: 'Solo activación', completed: false },
        { day: 'Martes', date: '2025-12-23', type: 'Tempo', km: 4, pace: '3:50', details: '1K + 2K a 3:50/km + 1K - Sentir piernas reactivas', completed: false },
        { day: 'Miércoles', date: '2025-12-24', type: 'Core', km: 0, pace: '-', details: 'Core ligero + movilidad 15 min', completed: false },
        { day: 'Jueves', date: '2025-12-25', type: 'Intervalos', km: 6, pace: '3:30', details: '6×400m a 3:30/km (85seg), rec 2min - Activación neuromuscular', completed: false },
        { day: 'Viernes', date: '2025-12-26', type: 'Suave', km: 4, pace: '6:00', details: 'Suavísimo - Solo soltar piernas', completed: false },
        { day: 'Sábado', date: '2025-12-27', type: 'Descanso', km: 0, pace: '-', details: 'Visualización mental de la carrera', completed: false }
      ]
    },
    {
      number: 11,
      mesociclo: 3,
      dateStart: '2025-12-30',
      dateEnd: '2025-12-31',
      type: 'Taper Final',
      totalKm: 7,
      focus: 'CARRERA - San Silvestre 10K',
      workouts: [
        { day: 'Domingo', date: '2025-12-28', type: 'Suave', km: 3, pace: '6:00', details: 'Activación ligera', completed: false },
        { day: 'Lunes', date: '2025-12-29', type: 'Intervalos', km: 4, pace: '3:20', details: '4×200m a 3:20/km (40seg), rec 3min - Sentir velocidad', completed: false },
        { day: 'Martes', date: '2025-12-30', type: 'Descanso', km: 0, pace: '-', details: 'Hidratación máxima, carbs loading', completed: false },
        { day: 'Miércoles', date: '2025-12-31', type: 'Competencia', km: 10, pace: '3:48', details: '🏁 SAN SILVESTRE 10K - OBJETIVO: 38:00', completed: false }
      ]
    }
  ]
};

// Biblioteca de ejercicios
const EXERCISE_LIBRARY = {
  calentamiento: [
    {
      name: 'Marcha en sitio',
      duration: '2 minutos',
      description: 'Marcha elevando rodillas progresivamente. Aumenta ritmo cardíaco gradualmente.',
      muscles: 'General',
      instructions: [
        'Mantén postura erguida',
        'Eleva rodillas a 90 grados',
        'Brazos balancean naturalmente',
        'Aumenta velocidad progresivamente'
      ]
    },
    {
      name: 'Círculos de tobillos',
      duration: '20 cada pie',
      description: 'Movilidad de tobillos para prevenir lesiones.',
      muscles: 'Tobillos',
      instructions: [
        'De pie o sentado',
        'Levanta un pie del suelo',
        'Realiza círculos amplios',
        '10 hacia un lado, 10 hacia el otro'
      ]
    },
    {
      name: 'Balanceo de piernas',
      duration: '10 cada dirección',
      description: 'Moviliza articulación de cadera.',
      muscles: 'Cadera, Flexores',
      instructions: [
        'Apóyate en pared o compañero',
        'Balancea pierna adelante/atrás con control',
        'Luego lateral (izquierda/derecha)',
        'No forzar el rango de movimiento'
      ]
    },
    {
      name: 'Skipping bajo',
      duration: '30 segundos',
      description: 'Activación muscular pre-entreno.',
      muscles: 'Gemelos, Cuádriceps',
      instructions: [
        'Trote en sitio elevando rodillas ligeramente',
        'Contacto rápido con el suelo',
        'Mantén cadencia alta (180+ pasos/min)',
        'Brazos en 90 grados'
      ]
    },
    {
      name: 'Talones a glúteos',
      duration: '30 segundos',
      description: 'Activación isquiotibiales.',
      muscles: 'Isquiotibiales',
      instructions: [
        'Trote llevando talones hacia glúteos',
        'Contacto rápido con suelo',
        'Tronco erguido',
        'No inclinarse hacia adelante'
      ]
    },
    {
      name: 'Zancadas caminando',
      duration: '10 cada pierna',
      description: 'Activación de glúteos y movilidad.',
      muscles: 'Glúteos, Cuádriceps, Flexores',
      instructions: [
        'Paso largo hacia adelante',
        'Baja rodilla trasera casi al suelo',
        'Mantén tronco erguido',
        'Rodilla delantera sobre tobillo'
      ]
    },
    {
      name: 'Trote suave',
      duration: '3 minutos',
      description: 'Transición al entreno.',
      muscles: 'General',
      instructions: [
        'Ritmo muy suave (~6:30/km)',
        'Respiración controlada',
        'Relajado, sin esfuerzo',
        'Prepara cuerpo para intensidad'
      ]
    }
  ],
  
  drills: [
    {
      name: 'Skipping alto',
      duration: '2×30m',
      description: 'Mejora potencia y técnica de elevación de rodilla.',
      muscles: 'Hip Flexors, Core',
      instructions: [
        'Eleva rodillas hasta 90 grados o más',
        'Contacto rápido con suelo',
        'Brazos activos en 90 grados',
        'Mantén tronco erguido'
      ]
    },
    {
      name: 'Skipping bajo rápido',
      duration: '2×30m',
      description: 'Mejora cadencia y contacto con suelo.',
      muscles: 'Gemelos, Pies',
      instructions: [
        'Contacto mínimo con suelo',
        'Cadencia muy alta',
        'Rodillas apenas se elevan',
        'Simula correr sobre brasas'
      ]
    },
    {
      name: 'Elevación de tobillos',
      duration: '2×30m',
      description: 'Fortalece gemelos y mejora técnica de despegue.',
      muscles: 'Gemelos, Sóleo',
      instructions: [
        'Avanza usando solo extensión de tobillos',
        'Rodillas casi rectas',
        'Contacto con antepié',
        'Simula caminar en puntas'
      ]
    },
    {
      name: 'Zancadas amplias',
      duration: '2×40m',
      description: 'Mejora longitud de zancada y potencia.',
      muscles: 'Glúteos, Isquiotibiales',
      instructions: [
        'Zancadas exageradas manteniendo control',
        'Extensión completa pierna trasera',
        'Aterriza suave',
        'Brazos balancean activamente'
      ]
    }
  ],
  
  estiramientos: [
    {
      name: 'Gemelos (gastrocnemio)',
      duration: '30 seg cada pierna',
      description: 'Estiramiento gastrocnemio.',
      muscles: 'Gemelo superior',
      instructions: [
        'Pierna trasera extendida, talón en suelo',
        'Pierna delantera flexionada',
        'Inclínate hacia adelante',
        'Mantén rodilla trasera recta'
      ]
    },
    {
      name: 'Sóleo',
      duration: '30 seg cada pierna',
      description: 'Estiramiento gemelo inferior.',
      muscles: 'Gemelo inferior',
      instructions: [
        'Similar a gemelo pero...',
        'Flexiona rodilla trasera',
        'Talón sigue en suelo',
        'Sentirás más abajo en pierna'
      ]
    },
    {
      name: 'Cuádriceps',
      duration: '30 seg cada pierna',
      description: 'Estiramiento frontal del muslo.',
      muscles: 'Cuádriceps',
      instructions: [
        'De pie, lleva talón a glúteo',
        'Rodilla apunta al suelo',
        'Mantén caderas alineadas',
        'Usa apoyo si necesario'
      ]
    },
    {
      name: 'Isquiotibiales',
      duration: '30 seg cada pierna',
      description: 'Estiramiento posterior del muslo.',
      muscles: 'Isquiotibiales',
      instructions: [
        'Sentado, pierna extendida',
        'Inclínate desde cadera (no espalda)',
        'Lleva manos hacia pie',
        'Mantén espalda recta'
      ]
    },
    {
      name: 'Flexores de cadera',
      duration: '30 seg cada lado',
      description: 'Estiramiento frontal de cadera.',
      muscles: 'Psoas, Flexores',
      instructions: [
        'Posición de caballero (rodilla en suelo)',
        'Empuja cadera hacia adelante',
        'Mantén tronco erguido',
        'No arquear espalda baja'
      ]
    },
    {
      name: 'Banda iliotibial',
      duration: '30 seg cada lado',
      description: 'Estiramiento lateral de pierna.',
      muscles: 'Banda IT, TFL',
      instructions: [
        'De pie, cruza pierna a estirar detrás',
        'Inclínate lateralmente hacia lado contrario',
        'Brazo sobre cabeza aumenta estiramiento',
        'Sentirás lateral de muslo/cadera'
      ]
    },
    {
      name: 'Glúteos',
      duration: '30 seg cada lado',
      description: 'Estiramiento glúteos.',
      muscles: 'Glúteos',
      instructions: [
        'Sentado, tobillo sobre rodilla contraria',
        'Abraza pierna y lleva hacia pecho',
        'Mantén espalda recta',
        'Sentirás en glúteo'
      ]
    },
    {
      name: 'Piriformis',
      duration: '30 seg cada lado',
      description: 'Estiramiento profundo de glúteo.',
      muscles: 'Piriformis',
      instructions: [
        'Acostado, rodilla al pecho',
        'Gira rodilla hacia hombro contrario',
        'Figura de "4"',
        'Previene ciática'
      ]
    }
  ],
  
  core: [
    {
      name: 'Plancha frontal',
      duration: '60 segundos',
      description: 'Fortalecimiento core completo.',
      muscles: 'Core, Abdominales',
      instructions: [
        'Antebrazos y pies en suelo',
        'Cuerpo en línea recta',
        'No dejar caer cadera',
        'Respiración controlada'
      ]
    },
    {
      name: 'Plancha lateral',
      duration: '45 seg cada lado',
      description: 'Fortalecimiento oblicuos.',
      muscles: 'Oblicuos, Core lateral',
      instructions: [
        'Antebrazo y lateral del pie en suelo',
        'Cuerpo recto de cabeza a pies',
        'Cadera elevada',
        'Brazo libre hacia arriba'
      ]
    },
    {
      name: 'Puente de glúteos',
      duration: '20 reps',
      description: 'Fortalece glúteos y espalda baja.',
      muscles: 'Glúteos, Espalda baja',
      instructions: [
        'Acostado, rodillas flexionadas',
        'Eleva cadera al cielo',
        'Aprieta glúteos arriba 3 seg',
        'Baja controlado'
      ]
    },
    {
      name: 'Bird dog',
      duration: '15 reps cada lado',
      description: 'Estabilidad core y espalda.',
      muscles: 'Core, Espalda, Glúteos',
      instructions: [
        'Cuatro apoyos (manos y rodillas)',
        'Extiende brazo y pierna opuestos',
        'Mantén espalda neutra',
        'No rotar cadera'
      ]
    },
    {
      name: 'Dead bug',
      duration: '20 reps',
      description: 'Control core y coordinación.',
      muscles: 'Core, Abdominales',
      instructions: [
        'Acostado, brazos al cielo',
        'Piernas en mesa (90 grados)',
        'Baja brazo y pierna opuestos',
        'Espalda pegada al suelo'
      ]
    },
    {
      name: 'Sentadillas a una pierna',
      duration: '10 cada lado',
      description: 'Fortalecimiento y balance.',
      muscles: 'Cuádriceps, Glúteos, Balance',
      instructions: [
        'Con apoyo si necesario',
        'Baja controlado',
        'Rodilla sobre tobillo',
        'Sube con control'
      ]
    },
    {
      name: 'Elevación de pantorrillas',
      duration: '25 reps',
      description: 'Fortalece gemelos.',
      muscles: 'Gemelos',
      instructions: [
        'De pie, sube en puntas',
        'Pausa 1 seg arriba',
        'Baja LENTO (3 seg excéntrico)',
        'Control total'
      ]
    },
    {
      name: 'Eccentric calf raises',
      duration: '15 reps cada pierna',
      description: 'Fortalecimiento excéntrico Aquiles.',
      muscles: 'Aquiles, Gemelos',
      instructions: [
        'CRÍTICO para Aquiles',
        'Sube con AMBAS piernas',
        'Baja con UNA pierna en 5 segundos',
        'Repite'
      ]
    }
  ],
  
  rodillo: [
    {
      name: 'Gemelos',
      duration: '1 min cada pierna',
      description: 'Liberación miofascial gemelos.',
      muscles: 'Gemelos',
      instructions: [
        'Sentado, pierna sobre rodillo',
        'Usa brazos para rodar',
        'Rodar LENTO (2-3 cm/seg)',
        'Para en puntos dolorosos 20-30 seg'
      ]
    },
    {
      name: 'Banda iliotibial',
      duration: '1 min cada pierna',
      description: 'Liberación banda IT (DOLOROSO).',
      muscles: 'Banda IT',
      instructions: [
        'Lateral de pierna sobre rodillo',
        'De cadera a rodilla',
        'MUY DOLOROSO = normal',
        'Respira profundo, relaja'
      ]
    },
    {
      name: 'Cuádriceps',
      duration: '1 min cada pierna',
      description: 'Liberación frontal de muslo.',
      muscles: 'Cuádriceps',
      instructions: [
        'Boca abajo, rodillo bajo muslos',
        'Rueda de cadera a rodilla',
        'Puedes rodar ambas piernas juntas',
        'Para en puntos sensibles'
      ]
    },
    {
      name: 'Glúteos',
      duration: '1 min cada lado',
      description: 'Liberación glúteos.',
      muscles: 'Glúteos',
      instructions: [
        'Sentado sobre rodillo',
        'Cruza tobillo sobre rodilla',
        'Rueda hacia lado cruzado',
        'Busca puntos tensos'
      ]
    }
  ]
};

// Configuración inicial
const APP_CONFIG = {
  version: '1.0.0',
  lastUpdated: '2025-10-19',
  userWeight: 65, // kg - se puede modificar
  theme: 'light' // light o dark
};