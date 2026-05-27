window.mockViaje = {
  id: 1,
  destino: 'Roma, Italia',
  fechas: '15 Oct 2026 - 18 Oct 2026',
  dias: 3,
  imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  eventos: [
    {
      id: 101,
      titulo: 'Coliseo Romano',
      dia: 'Dia 1',
      horaInicio: '09:00',
      horaFin: '11:00',
      categoria: 'Cultura'
    },
    {
      id: 102,
      titulo: 'Almuerzo en Trastevere',
      dia: 'Dia 1',
      horaInicio: '13:00',
      horaFin: '14:30',
      categoria: 'Comida'
    },
    {
      id: 103,
      titulo: 'Fuente de Trevi',
      dia: 'Dia 2',
      horaInicio: '10:00',
      horaFin: '11:30',
      categoria: 'Atraccion'
    }
  ]
};

window.mockMisViajes = [
  {
    id: 1,
    destino: 'Roma, Italia',
    fechas: '15 Oct - 18 Oct 2026',
    estado: 'Planificación',
    imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    destino: 'París, Francia',
    fechas: '05 Nov - 12 Nov 2026',
    estado: 'Cerrado',
    imagen: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
];

window.mockAtracciones = [
  {
    id: 1,
    nombre: 'Museo del Louvre',
    ubicacion: 'París, Francia',
    puntuacion: 4.8,
    precio: '€17',
    imagen: 'https://images.unsplash.com/photo-1533591380344-9f44dbfb6d76?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    nombre: 'Vaticano y Capilla Sixtina',
    ubicacion: 'Roma, Italia',
    puntuacion: 4.9,
    precio: '€30',
    imagen: 'https://images.unsplash.com/photo-1531572753322-ad063cefc5b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    nombre: 'Central Park',
    ubicacion: 'Nueva York, USA',
    puntuacion: 4.7,
    precio: 'Gratis',
    imagen: 'https://images.unsplash.com/photo-1444723121867-7a241cb0bbcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
];

window.mockDestinos = [
  {
    id: 1,
    nombre: 'Roma',
    pais: 'Italia',
    descripcion: 'La ciudad eterna, llena de historia y pasta.',
    imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    nombre: 'París',
    pais: 'Francia',
    descripcion: 'La ciudad del amor y la luz.',
    imagen: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    nombre: 'Tokio',
    pais: 'Japón',
    descripcion: 'Metrópolis vibrante donde lo tradicional choca con el futuro.',
    imagen: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    nombre: 'Nueva York',
    pais: 'Estados Unidos',
    descripcion: 'La ciudad que nunca duerme.',
    imagen: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
];
