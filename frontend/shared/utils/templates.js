window.iteraTemplates = {
  disney: {
    id: "disney",
    nombre: "Aventura en Disney",
    destino_principal: "Walt Disney World Resort, Orlando",
    duracion_dias: 5,
    foto_url: "https://images.unsplash.com/photo-1542364560-64696f0ba859?q=80&w=1000&auto=format&fit=crop",
    destinos: [
      { city: "Orlando", country: "EE.UU.", photo_url: "https://images.unsplash.com/photo-1542364560-64696f0ba859?q=80&w=1000&auto=format&fit=crop" }
    ],
    itinerario: [
      // DÍA 1: Magic Kingdom
      { diaOffset: 0, hora_inicio: "08:30", hora_fin: "09:30", nombre: "Magic Kingdom Park", descripcion: "Llegada al parque más icónico de Disney para el inicio del día." },
      { diaOffset: 0, hora_inicio: "10:00", hora_fin: "11:30", nombre: "Seven Dwarfs Mine Train", descripcion: "Montaña rusa familiar en Fantasyland." },
      { diaOffset: 0, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Space Mountain", descripcion: "Viaje espacial en la oscuridad." },
      { diaOffset: 0, hora_inicio: "14:00", hora_fin: "15:30", nombre: "Be Our Guest Restaurant", descripcion: "Almuerzo temático dentro del castillo de la Bestia." },
      { diaOffset: 0, hora_inicio: "16:00", hora_fin: "17:30", nombre: "Pirates of the Caribbean", descripcion: "Aventura clásica de piratas." },
      { diaOffset: 0, hora_inicio: "20:00", hora_fin: "21:00", nombre: "Happily Ever After Fireworks", descripcion: "Show nocturno de fuegos artificiales." },

      // DÍA 2: EPCOT
      { diaOffset: 1, hora_inicio: "08:30", hora_fin: "09:30", nombre: "EPCOT", descripcion: "Entrada por Spaceship Earth para un día de tecnología y cultura." },
      { diaOffset: 1, hora_inicio: "10:00", hora_fin: "11:30", nombre: "Guardians of the Galaxy: Cosmic Rewind", descripcion: "Montaña rusa épica con música ochentera." },
      { diaOffset: 1, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Remy's Ratatouille Adventure", descripcion: "Aventura 4D en Francia." },
      { diaOffset: 1, hora_inicio: "14:00", hora_fin: "15:30", nombre: "San Angel Inn Restaurante", descripcion: "Almuerzo mexicano bajo el cielo nocturno eterno." },
      { diaOffset: 1, hora_inicio: "16:00", hora_fin: "17:30", nombre: "Frozen Ever After", descripcion: "Viaje musical por Arendelle." },
      { diaOffset: 1, hora_inicio: "21:00", hora_fin: "21:30", nombre: "Luminous The Symphony of Us", descripcion: "Show nocturno en el lago." },

      // DÍA 3: Descanso y Shopping
      { diaOffset: 2, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Desayuno en el Hotel", descripcion: "Mañana relajada disfrutando de las instalaciones del resort." },
      { diaOffset: 2, hora_inicio: "11:00", hora_fin: "13:30", nombre: "Orlando International Premium Outlets", descripcion: "Compras de marcas internacionales a precios reducidos." },
      { diaOffset: 2, hora_inicio: "14:00", hora_fin: "15:30", nombre: "The Cheesecake Factory", descripcion: "Almuerzo legendario con postres increíbles." },
      { diaOffset: 2, hora_inicio: "16:00", hora_fin: "18:30", nombre: "Mall at Millenia", descripcion: "Shopping de lujo en el mall más exclusivo." },
      { diaOffset: 2, hora_inicio: "19:00", hora_fin: "21:00", nombre: "Disney Springs", descripcion: "Paseo nocturno y entretenimiento." },
      { diaOffset: 2, hora_inicio: "21:30", hora_fin: "23:00", nombre: "T-REX Cafe", descripcion: "Cena inmersiva en la era de los dinosaurios." },

      // DÍA 4: Hollywood Studios
      { diaOffset: 3, hora_inicio: "08:30", hora_fin: "09:30", nombre: "Disney's Hollywood Studios", descripcion: "Entrada al parque del cine y la acción." },
      { diaOffset: 3, hora_inicio: "10:00", hora_fin: "11:30", nombre: "Star Wars: Rise of the Resistance", descripcion: "La misión más avanzada de la Resistencia." },
      { diaOffset: 3, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Slinky Dog Dash", descripcion: "Montaña rusa divertida en Toy Story Land." },
      { diaOffset: 3, hora_inicio: "14:00", hora_fin: "15:30", nombre: "Sci-Fi Dine-In Theater Restaurant", descripcion: "Almuerzo estilo autocine clásico." },
      { diaOffset: 3, hora_inicio: "16:00", hora_fin: "17:30", nombre: "The Twilight Zone Tower of Terror", descripcion: "Caída libre en un ascensor embrujado." },
      { diaOffset: 3, hora_inicio: "20:00", hora_fin: "21:00", nombre: "Fantasmic!", descripcion: "Show nocturno de Mickey Mouse." },

      // DÍA 5: Animal Kingdom
      { diaOffset: 4, hora_inicio: "08:30", hora_fin: "09:30", nombre: "Disney's Animal Kingdom", descripcion: "Exploración del parque dedicado a la naturaleza y animales." },
      { diaOffset: 4, hora_inicio: "10:00", hora_fin: "11:30", nombre: "Avatar Flight of Passage", descripcion: "Vuelo increíble sobre un Banshee." },
      { diaOffset: 4, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Kilimanjaro Safaris", descripcion: "Safari real por la sabana africana." },
      { diaOffset: 4, hora_inicio: "14:00", hora_fin: "15:00", nombre: "Satu'li Canteen", descripcion: "Comida saludable en Pandora." },
      { diaOffset: 4, hora_inicio: "16:00", hora_fin: "17:30", nombre: "Expedition Everest", descripcion: "Escape del Yeti en alta velocidad." },
      { diaOffset: 4, hora_inicio: "18:00", hora_fin: "19:00", nombre: "Finding Nemo: The Big Blue... and Beyond!", descripcion: "Musical emocionante bajo el mar." }
    ]
  },
  paris: {
    id: "paris",
    nombre: "Romance en París",
    destino_principal: "Torre Eiffel, París",
    duracion_dias: 5,
    foto_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
    destinos: [
        { city: "París", country: "Francia", photo_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" }
    ],
    itinerario: [
      // DÍA 1: Clásico París
      { diaOffset: 0, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Torre Eiffel", descripcion: "Subida al ícono de París para las mejores vistas." },
      { diaOffset: 0, hora_inicio: "11:30", hora_fin: "12:30", nombre: "Campo de Marte", descripcion: "Paseo por los jardines bajo la torre." },
      { diaOffset: 0, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Le Jules Verne", descripcion: "Almuerzo gastronómico en la Torre Eiffel." },
      { diaOffset: 0, hora_inicio: "15:30", hora_fin: "17:00", nombre: "Crucero por el Sena", descripcion: "Paseo romántico en barco por el río." },
      { diaOffset: 0, hora_inicio: "17:30", hora_fin: "19:00", nombre: "Trocadéro", descripcion: "La mejor vista panorámica de la torre al atardecer." },
      { diaOffset: 0, hora_inicio: "20:30", hora_fin: "22:00", nombre: "Le Relais de l'Entrecôte", descripcion: "Cena clásica parisina." },

      // DÍA 2: Arte e Historia
      { diaOffset: 1, hora_inicio: "09:00", hora_fin: "12:00", nombre: "Museo del Louvre", descripcion: "Visita a las obras maestras del mundo." },
      { diaOffset: 1, hora_inicio: "12:30", hora_fin: "13:30", nombre: "Jardín de las Tullerías", descripcion: "Paseo por los jardines reales." },
      { diaOffset: 1, hora_inicio: "14:00", hora_fin: "15:00", nombre: "Angelina Paris", descripcion: "Famoso chocolate caliente y pastelería." },
      { diaOffset: 1, hora_inicio: "15:30", hora_fin: "16:30", nombre: "Place de la Concorde", descripcion: "La plaza más grande de París." },
      { diaOffset: 1, hora_inicio: "17:00", hora_fin: "18:00", nombre: "Puente Alejandro III", descripcion: "El puente más ornamentado de la ciudad." },
      { diaOffset: 1, hora_inicio: "20:00", hora_fin: "21:30", nombre: "Bouillon Chartier", descripcion: "Cena en un monumento histórico." },

      // DÍA 3: Montmartre Bohemio
      { diaOffset: 2, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Basílica del Sacré-Cœur", descripcion: "La basílica blanca en la cima de la colina." },
      { diaOffset: 2, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Place du Tertre", descripcion: "La plaza de los pintores y artistas." },
      { diaOffset: 2, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Le Consulat", descripcion: "Almuerzo en uno de los cafés más antiguos." },
      { diaOffset: 2, hora_inicio: "15:00", hora_fin: "16:00", nombre: "Muro de los Te Amo", descripcion: "Un rincón romántico con 'te amo' en todos los idiomas." },
      { diaOffset: 2, hora_inicio: "17:00", hora_fin: "18:30", nombre: "Moulin Rouge", descripcion: "Foto en el famoso molino rojo." },
      { diaOffset: 2, hora_inicio: "20:00", hora_fin: "22:00", nombre: "Pink Mamma", descripcion: "Cena en una trattoria con vistas increíbles." },

      // DÍA 4: Lujo y Arquitectura
      { diaOffset: 3, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Arco del Triunfo", descripcion: "Monumento a las victorias de Napoleón." },
      { diaOffset: 3, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Avenida de los Campos Elíseos", descripcion: "Caminata por la avenida más famosa." },
      { diaOffset: 3, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Ladurée", descripcion: "Almuerzo y macarons legendarios." },
      { diaOffset: 3, hora_inicio: "15:30", hora_fin: "17:00", nombre: "Ópera Garnier", descripcion: "Obra maestra de la arquitectura del siglo XIX." },
      { diaOffset: 3, hora_inicio: "17:30", hora_fin: "19:00", nombre: "Galeries Lafayette Haussmann", descripcion: "Shopping bajo la cúpula dorada." },
      { diaOffset: 3, hora_inicio: "20:30", hora_fin: "22:30", nombre: "Le Train Bleu", descripcion: "Cena de despedida en un palacio." },

      // DÍA 5: Versalles
      { diaOffset: 4, hora_inicio: "09:00", hora_fin: "12:00", nombre: "Palacio de Versalles", descripcion: "Visita al palacio más fastuoso de Francia." },
      { diaOffset: 4, hora_inicio: "12:30", hora_fin: "14:00", nombre: "Jardines de Versalles", descripcion: "Paseo por las fuentes y jardines reales." },
      { diaOffset: 4, hora_inicio: "14:30", hora_fin: "15:30", nombre: "La Flottille", descripcion: "Almuerzo junto al Gran Canal." },
      { diaOffset: 4, hora_inicio: "16:00", hora_fin: "17:30", nombre: "Gran Trianón", descripcion: "Palacio privado de mármol rosa." },
      { diaOffset: 4, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Barrio Latino", descripcion: "Regreso a París y paseo por sus calles históricas." },
      { diaOffset: 4, hora_inicio: "20:30", hora_fin: "22:00", nombre: "Le Procope", descripcion: "Cena final en el café más antiguo de París (1686)." }
    ]
  },
  miami: {
    id: "miami",
    nombre: "Escapada a Miami",
    destino_principal: "South Beach, Miami",
    duracion_dias: 5,
    foto_url: "https://images.unsplash.com/photo-1514364024475-47e27e852a65?q=80&w=1000&auto=format&fit=crop",
    destinos: [
        { city: "Miami", country: "EE.UU.", photo_url: "https://images.unsplash.com/photo-1514364024475-47e27e852a65?q=80&w=1000&auto=format&fit=crop" }
    ],
    itinerario: [
      // DÍA 1: South Beach
      { diaOffset: 0, hora_inicio: "09:00", hora_fin: "11:30", nombre: "South Beach", descripcion: "Día de sol y arena en la playa más famosa." },
      { diaOffset: 0, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Ocean Drive", descripcion: "Paseo por la avenida icónica con arquitectura Art Deco." },
      { diaOffset: 0, hora_inicio: "14:00", hora_fin: "15:30", nombre: "Joe's Stone Crab", descripcion: "Almuerzo legendario de cangrejos de piedra." },
      { diaOffset: 0, hora_inicio: "16:00", hora_fin: "18:00", nombre: "Distrito Art Deco", descripcion: "Tour por los edificios históricos de neón." },
      { diaOffset: 0, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Lincoln Road", descripcion: "Paseo de compras al aire libre." },
      { diaOffset: 0, hora_inicio: "21:00", hora_fin: "23:00", nombre: "Juvia", descripcion: "Cena con vistas espectaculares de South Beach." },

      // DÍA 2: Little Havana y Cultura
      { diaOffset: 1, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Calle Ocho, Little Havana", descripcion: "Sumergirte en la cultura cubana de Miami." },
      { diaOffset: 1, hora_inicio: "11:30", hora_fin: "12:30", nombre: "Domino Park", descripcion: "Ver a los locales jugar dominó en el parque histórico." },
      { diaOffset: 1, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Versailles Restaurant", descripcion: "El restaurante cubano más famoso del mundo." },
      { diaOffset: 1, hora_inicio: "15:30", hora_fin: "18:00", nombre: "Vizcaya Museum & Gardens", descripcion: "Villa histórica de estilo italiano frente al mar." },
      { diaOffset: 1, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Coconut Grove", descripcion: "Paseo por el barrio más bohemio y verde." },
      { diaOffset: 1, hora_inicio: "20:30", hora_fin: "22:30", nombre: "Ariete", descripcion: "Cena de autor con estrella Michelin." },

      // DÍA 3: Wynwood y Diseño
      { diaOffset: 2, hora_inicio: "10:00", hora_fin: "12:00", nombre: "Wynwood Walls", descripcion: "Museo al aire libre de arte callejero." },
      { diaOffset: 2, hora_inicio: "12:30", hora_fin: "14:00", nombre: "Miami Design District", descripcion: "Explorar la arquitectura y el diseño de lujo." },
      { diaOffset: 2, hora_inicio: "14:30", hora_fin: "16:00", nombre: "Michael's Genuine Food & Drink", descripcion: "Almuerzo relajado en el Design District." },
      { diaOffset: 2, hora_inicio: "16:30", hora_fin: "18:30", nombre: "Rubell Museum", descripcion: "Una de las mayores colecciones privadas de arte contemporáneo." },
      { diaOffset: 2, hora_inicio: "19:00", hora_fin: "20:30", nombre: "Midtown Miami", descripcion: "Caminata por el área urbana moderna." },
      { diaOffset: 2, hora_inicio: "21:00", hora_fin: "23:00", nombre: "KYU", descripcion: "Cena asiática a la leña en Wynwood." },

      // DÍA 4: Naturaleza y Key Biscayne
      { diaOffset: 3, hora_inicio: "09:00", hora_fin: "11:30", nombre: "Bill Baggs Cape Florida State Park", descripcion: "Parque natural con faro histórico." },
      { diaOffset: 3, hora_inicio: "12:00", hora_fin: "13:30", nombre: "The Rusty Pelican", descripcion: "Almuerzo con la mejor vista del skyline de Miami." },
      { diaOffset: 3, hora_inicio: "14:30", hora_fin: "16:30", nombre: "Miami Seaquarium", descripcion: "Acuario icónico de la ciudad." },
      { diaOffset: 3, hora_inicio: "17:00", hora_fin: "18:30", nombre: "Crandon Park", descripcion: "Playa tranquila y dunas naturales." },
      { diaOffset: 3, hora_inicio: "19:00", hora_fin: "20:30", nombre: "Brickell Key", descripcion: "Vistas panorámicas desde la isla privada." },
      { diaOffset: 3, hora_inicio: "21:00", hora_fin: "23:00", nombre: "Cantina La Veinte", descripcion: "Cena mexicana elegante en Brickell." },

      // DÍA 5: Shopping y Despedida
      { diaOffset: 4, hora_inicio: "10:00", hora_fin: "13:30", nombre: "Aventura Mall", descripcion: "Día de compras en uno de los malls más grandes." },
      { diaOffset: 4, hora_inicio: "14:30", hora_fin: "16:00", nombre: "Bal Harbour Shops", descripcion: "Centro comercial de ultra lujo al aire libre." },
      { diaOffset: 4, hora_inicio: "16:30", hora_fin: "18:00", nombre: "Sunny Isles Beach", descripcion: "Relajación final frente a los rascacielos." },
      { diaOffset: 4, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Haulover Park", descripcion: "Vistas del canal y el mar." },
      { diaOffset: 4, hora_inicio: "20:30", hora_fin: "22:30", nombre: "The Surf Club Restaurant", descripcion: "Cena final de gala en Surfside." },
      { diaOffset: 4, hora_inicio: "23:00", hora_fin: "23:59", nombre: "Fin del Viaje", descripcion: "Regreso al hotel y preparación de maletas." }
    ]
  }
};
