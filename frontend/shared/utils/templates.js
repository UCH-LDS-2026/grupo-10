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
  },
  argentina: {
    id: "argentina",
    nombre: "Descubrí Argentina",
    destino_principal: "Buenos Aires, Argentina",
    duracion_dias: 14,
    foto_url: "https://images.unsplash.com/photo-1589909202802-8f4aadce3b5c?q=80&w=1000&auto=format&fit=crop",
    destinos: [
      { city: "Buenos Aires", country: "Argentina", nights: 4, photo_url: "https://images.unsplash.com/photo-1589909202802-8f4aadce3b5c?q=80&w=1000&auto=format&fit=crop" },
      { city: "Puerto Iguazú", country: "Argentina", nights: 3, photo_url: "https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?q=80&w=1000&auto=format&fit=crop" },
      { city: "Córdoba", country: "Argentina", nights: 3, photo_url: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=1000&auto=format&fit=crop" },
      { city: "Mendoza", country: "Argentina", nights: 4, photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop" }
    ],
    itinerario: [
      // ── BUENOS AIRES: Días 1-4 (diaOffset 0-3) ──
      // DÍA 1: Centro Histórico
      { diaOffset: 0, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Plaza de Mayo", descripcion: "El corazón histórico de Buenos Aires, rodeada de edificios fundacionales de la nación." },
      { diaOffset: 0, hora_inicio: "10:45", hora_fin: "12:00", nombre: "Casa Rosada", descripcion: "Sede del Gobierno argentino, icónica por su fachada rosa y el famoso balcón histórico." },
      { diaOffset: 0, hora_inicio: "12:30", hora_fin: "14:00", nombre: "Caminito, La Boca", descripcion: "El colorido pasaje a cielo abierto donde nació el tango, lleno de arte y murales." },
      { diaOffset: 0, hora_inicio: "14:30", hora_fin: "16:00", nombre: "El Obrero", descripcion: "Almuerzo en la cantina favorita de los porteños con cocina tradicional argentina." },
      { diaOffset: 0, hora_inicio: "16:30", hora_fin: "18:30", nombre: "San Telmo Market", descripcion: "El mercado más antiguo de Buenos Aires, con antigüedades, arte y gastronomía." },
      { diaOffset: 0, hora_inicio: "21:00", hora_fin: "23:00", nombre: "Show de Tango en El Viejo Almacén", descripcion: "Espectáculo de tango auténtico en uno de los cabarets históricos más famosos." },

      // DÍA 2: Palermo y Recoleta
      { diaOffset: 1, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Cementerio de la Recoleta", descripcion: "Impresionante necrópolis donde descansan los personajes más ilustres de Argentina, incluida Evita Perón." },
      { diaOffset: 1, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Museo Nacional de Bellas Artes", descripcion: "La colección de arte más importante del país, con obras de Rodin, Monet y maestros latinoamericanos." },
      { diaOffset: 1, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Don Julio", descripcion: "Almuerzo en la parrilla argentina más premiada del mundo, en el corazón de Palermo." },
      { diaOffset: 1, hora_inicio: "15:00", hora_fin: "17:00", nombre: "Jardín Japonés de Buenos Aires", descripcion: "Oasis de paz en Palermo con jardines, puentes y carpas centenarias." },
      { diaOffset: 1, hora_inicio: "17:30", hora_fin: "19:00", nombre: "Palermo Soho", descripcion: "Recorrido por las calles de diseño, moda y gastronomía del barrio más trendy." },
      { diaOffset: 1, hora_inicio: "20:00", hora_fin: "22:00", nombre: "Florería Atlántico", descripcion: "Cena y cócteles en el bar que ingresó a la lista de los 50 mejores bares del mundo." },

      // DÍA 3: Puerto Madero y Arte
      { diaOffset: 2, hora_inicio: "09:30", hora_fin: "11:00", nombre: "Puerto Madero", descripcion: "Paseo por el exclusivo barrio portuario recuperado, con los diques históricos y la Reserva Ecológica." },
      { diaOffset: 2, hora_inicio: "11:30", hora_fin: "13:00", nombre: "Puente de la Mujer", descripcion: "La obra de ingeniería de Santiago Calatrava que es símbolo del nuevo Buenos Aires." },
      { diaOffset: 2, hora_inicio: "13:30", hora_fin: "15:00", nombre: "Cabana Las Lilas", descripcion: "Almuerzo en la mejor parrilla de Puerto Madero con vista al río." },
      { diaOffset: 2, hora_inicio: "16:00", hora_fin: "18:00", nombre: "MALBA - Museo de Arte Latinoamericano", descripcion: "La colección de arte latinoamericano moderno más importante de la región." },
      { diaOffset: 2, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Bosques de Palermo", descripcion: "Paseo por los lagos y rosedal del gran pulmón verde porteño." },
      { diaOffset: 2, hora_inicio: "21:00", hora_fin: "23:00", nombre: "La Cabrera", descripcion: "Cena en una de las parrillas más reconocidas de Buenos Aires." },

      // DÍA 4: Congreso y Monserrat
      { diaOffset: 3, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Congreso de la Nación Argentina", descripcion: "El majestuoso Parlamento argentino, uno de los más grandes del mundo." },
      { diaOffset: 3, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Avenida de Mayo", descripcion: "La gran avenida de estilo europeo que une los dos poderes del Estado." },
      { diaOffset: 3, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Café Tortoni", descripcion: "Almuerzo y café en el bar más antiguo de Buenos Aires (fundado en 1858)." },
      { diaOffset: 3, hora_inicio: "15:00", hora_fin: "17:00", nombre: "Teatro Colón", descripcion: "Una de las salas de ópera más importantes del mundo, joya del eclecticismo arquitectónico." },
      { diaOffset: 3, hora_inicio: "18:00", hora_fin: "19:30", nombre: "Obelisco de Buenos Aires", descripcion: "El monumento más icónico de la ciudad en la intersección de Corrientes y 9 de Julio." },

      // ── MISIONES / IGUAZÚ: Días 5-7 (diaOffset 4-6) ──
      // DÍA 5: Llegada e introducción
      { diaOffset: 4, hora_inicio: "10:00", hora_fin: "12:00", nombre: "Parque Nacional Iguazú - Circuito Inferior", descripcion: "Primer contacto con las Cataratas del Iguazú desde el nivel del río, vistas frontales a las caídas." },
      { diaOffset: 4, hora_inicio: "12:30", hora_fin: "14:00", nombre: "Almuerzo en La Selva Restaurant", descripcion: "Gastronomía regional en el corazón de la selva misionera." },
      { diaOffset: 4, hora_inicio: "15:00", hora_fin: "17:30", nombre: "Parque Nacional Iguazú - Circuito Superior", descripcion: "Vista desde arriba de las cataratas, con pasarelas que te llevan al borde de las caídas." },
      { diaOffset: 4, hora_inicio: "18:00", hora_fin: "19:30", nombre: "Puerto Canoas - Garganta del Diablo", descripcion: "El cañón más espectacular del complejo, donde 14 cataratas confluyen en un solo punto." },

      // DÍA 6: Selva y fauna
      { diaOffset: 5, hora_inicio: "08:00", hora_fin: "10:30", nombre: "Sendero Macuco - Safari Ecológico", descripcion: "Travesía en jeep por la selva misionera, observación de flora y fauna nativa." },
      { diaOffset: 5, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Aventura Náutica Gran Aventura", descripcion: "Paseo en lancha bajo las cataratas para mojarse en la experiencia más emocionante." },
      { diaOffset: 5, hora_inicio: "13:00", hora_fin: "14:30", nombre: "El Almacén de Iguazú", descripcion: "Almuerzo con especialidades regionales: mbejú, chipá y sopa paraguaya." },
      { diaOffset: 5, hora_inicio: "15:30", hora_fin: "18:00", nombre: "Güirá Oga - Centro de Rescate de Animales", descripcion: "Centro de rehabilitación de fauna selvática, hogar de tucanes, tapires y coatíes." },
      { diaOffset: 5, hora_inicio: "19:00", hora_fin: "21:00", nombre: "Hito de las Tres Fronteras", descripcion: "El punto donde se encuentran Argentina, Brasil y Paraguay al atardecer sobre el río." },

      // DÍA 7: Ruinas jesuíticas
      { diaOffset: 6, hora_inicio: "09:00", hora_fin: "12:30", nombre: "Ruinas Jesuíticas de San Ignacio Miní", descripcion: "Las ruinas de la reducción jesuita más conservada de Argentina, Patrimonio de la Humanidad." },
      { diaOffset: 6, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Almuerzo en el pueblo de San Ignacio", descripcion: "Experiencia gastronómica en el corazón de las misiones." },
      { diaOffset: 6, hora_inicio: "15:30", hora_fin: "17:30", nombre: "Parque Provincial Teyú Cuaré", descripcion: "Reserva natural con acantilados sobre el Paraná, flora y monos caí en estado salvaje." },

      // ── CÓRDOBA: Días 8-10 (diaOffset 7-9) ──
      // DÍA 8: Centro histórico de Córdoba
      { diaOffset: 7, hora_inicio: "09:00", hora_fin: "10:30", nombre: "Manzana Jesuítica de Córdoba", descripcion: "Conjunto histórico Patrimonio de la Humanidad: Iglesia, Colegio y Universidad fundados en 1599." },
      { diaOffset: 7, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Catedral de Córdoba", descripcion: "La catedral más antigua de Argentina, mezcla de estilos barroco, churrigueresco y neoclásico." },
      { diaOffset: 7, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Mercado Norte de Córdoba", descripcion: "El mercado gastronómico más importante de la ciudad, con embutidos, quesos y vinos locales." },
      { diaOffset: 7, hora_inicio: "15:30", hora_fin: "17:30", nombre: "Cabildo de la Ciudad de Córdoba", descripcion: "El edificio colonial que fue sede del primer gobierno patrio del interior argentino." },
      { diaOffset: 7, hora_inicio: "18:00", hora_fin: "20:00", nombre: "Paseo del Buen Pastor", descripcion: "Complejo cultural en el corazón de Córdoba, con galerías de arte y espacios al aire libre." },
      { diaOffset: 7, hora_inicio: "21:00", hora_fin: "23:00", nombre: "La Nieta de la Parrilla", descripcion: "Asado cordobés con los famosos chorizos y morcillas de la región." },

      // DÍA 9: Sierras Chicas
      { diaOffset: 8, hora_inicio: "09:00", hora_fin: "11:30", nombre: "Villa Carlos Paz", descripcion: "El destino turístico serrano más popular de Argentina, junto al Lago San Roque." },
      { diaOffset: 8, hora_inicio: "12:00", hora_fin: "13:30", nombre: "Lago San Roque", descripcion: "Almuerzo frente al espejo de agua con opciones náuticas y playas de río." },
      { diaOffset: 8, hora_inicio: "14:30", hora_fin: "16:30", nombre: "Los Gigantes - Pampa de Achala", descripcion: "Formaciones rocosas únicas y el Parque Nacional Quebrada del Condorito, hábitat del cóndor." },
      { diaOffset: 8, hora_inicio: "17:00", hora_fin: "19:00", nombre: "Villa General Belgrano", descripcion: "Pintoresco pueblo con arquitectura alemana, famoso por su Oktoberfest y chocolate artesanal." },
      { diaOffset: 8, hora_inicio: "20:00", hora_fin: "22:00", nombre: "La Guarida del Oso", descripcion: "Fondue y gastronomía centroeuropea en el corazón de la aldea bávara argentina." },

      // DÍA 10: Traslasierra
      { diaOffset: 9, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Mina Clavero", descripcion: "El pueblo de río más famoso de Córdoba, con aguas cristalinas y pozones naturales." },
      { diaOffset: 9, hora_inicio: "11:30", hora_fin: "13:30", nombre: "Nono y el Museo Rocsen", descripcion: "El museo más completo de Argentina con más de 50.000 piezas de historia universal." },
      { diaOffset: 9, hora_inicio: "14:00", hora_fin: "15:30", nombre: "Almuerzo cordobés en Mina Clavero", descripcion: "Cochinillo, cabrito y locro en los bodegones locales." },
      { diaOffset: 9, hora_inicio: "16:30", hora_fin: "18:30", nombre: "San Javier y Yacanto", descripcion: "Pueblos de montaña con vistas panorámicas de la Pampa desde las cumbres." },

      // ── MENDOZA: Días 11-14 (diaOffset 10-13) ──
      // DÍA 11: Bodegas y vinos
      { diaOffset: 10, hora_inicio: "09:30", hora_fin: "11:30", nombre: "Bodega Catena Zapata", descripcion: "La bodega más premiada de Argentina, con arquitectura inspirada en las pirámides mayas." },
      { diaOffset: 10, hora_inicio: "12:00", hora_fin: "14:00", nombre: "Almuerzo en Bodega Zuccardi Valle de Uco", descripcion: "Restaurante de alta cocina entre viñedos con maridaje de vinos locales." },
      { diaOffset: 10, hora_inicio: "15:00", hora_fin: "17:00", nombre: "Bodega Luigi Bosca", descripcion: "Una de las bodegas más antiguas de Luján de Cuyo, con cava histórica y tour en profundidad." },
      { diaOffset: 10, hora_inicio: "17:30", hora_fin: "19:00", nombre: "Chacras de Coria", descripcion: "Pintoresco pueblo rodeado de viñedos, galerías de arte y tiendas gourmet." },
      { diaOffset: 10, hora_inicio: "20:30", hora_fin: "22:30", nombre: "1884 Restaurante Francis Mallmann", descripcion: "Cena en el restaurante del chef más famoso del mundo, en el interior de una bodega histórica." },

      // DÍA 12: Alta Montaña
      { diaOffset: 11, hora_inicio: "08:00", hora_fin: "11:00", nombre: "Cerro Aconcagua - Base del Horcones", descripcion: "Excursión hasta la laguna al pie del pico más alto del mundo fuera de Asia (6.962 m)." },
      { diaOffset: 11, hora_inicio: "11:30", hora_fin: "13:00", nombre: "Puente del Inca", descripcion: "Formación natural de piedra amarilla de origen volcánico sobre el río Las Cuevas." },
      { diaOffset: 11, hora_inicio: "13:30", hora_fin: "15:00", nombre: "Cristo Redentor", descripcion: "El monumento fronterizo que marca el límite entre Argentina y Chile en la Cordillera." },
      { diaOffset: 11, hora_inicio: "15:30", hora_fin: "17:00", nombre: "Los Penitentes", descripcion: "Estación de ski con formaciones de nieve únicas en el mundo que parecen monjes orando." },
      { diaOffset: 11, hora_inicio: "20:00", hora_fin: "22:00", nombre: "La Marchigiana", descripcion: "Cena de fonduta italiana en la trattoria más tradicional de Mendoza." },

      // DÍA 13: Ciudad de Mendoza y spa del vino
      { diaOffset: 12, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Plaza Independencia de Mendoza", descripcion: "La plaza central de la ciudad y el Museo Municipal de Arte Moderno bajo ella." },
      { diaOffset: 12, hora_inicio: "11:30", hora_fin: "13:00", nombre: "Parque General San Martín", descripcion: "El parque más hermoso de Argentina, con el Cerro de la Gloria y el Estadio Malvinas Argentinas." },
      { diaOffset: 12, hora_inicio: "13:30", hora_fin: "15:00", nombre: "Casa Vigil - El Enemigo Winery", descripcion: "Almuerzo y visita a una de las bodegas más artísticas e innovadoras del país." },
      { diaOffset: 12, hora_inicio: "15:30", hora_fin: "18:00", nombre: "Cavas Wine Lodge - Spa del Vino", descripcion: "Experiencia de vinomassage y tratamientos con uvas y vinos en el wine spa más exclusivo de Argentina." },
      { diaOffset: 12, hora_inicio: "20:00", hora_fin: "22:30", nombre: "Azafrán", descripcion: "Cena final con maridaje de vinos cuyana en el mejor restaurante del centro mendocino." },

      // DÍA 14: Regreso y Valle de Uco
      { diaOffset: 13, hora_inicio: "09:30", hora_fin: "11:30", nombre: "Valle de Uco - Ruta del Vino", descripcion: "Último recorrido por los viñedos de altura del valle más espectacular de Mendoza." },
      { diaOffset: 13, hora_inicio: "12:00", hora_fin: "14:00", nombre: "Bodega Achaval Ferrer - Almuerzo de Despedida", descripcion: "Comida de despedida entre malbecs premiados internacionalmente." },
      { diaOffset: 13, hora_inicio: "15:00", hora_fin: "17:00", nombre: "Carrodilla - Museo del Vino y la Vid", descripcion: "Historia vitivinícola argentina en la basílica y museo más antiguos de Mendoza." }
    ]
  },
  caribe: {
    id: "caribe",
    nombre: "Paraíso Caribeño",
    destino_principal: "Cancún, México",
    duracion_dias: 5,
    foto_url: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?q=80&w=1000&auto=format&fit=crop",
    destinos: [
      { city: "Cancún", country: "México", nights: 5, photo_url: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?q=80&w=1000&auto=format&fit=crop" }
    ],
    itinerario: [
      // DÍA 1: Zona Hotelera y Playa
      { diaOffset: 0, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Playa Delfines", descripcion: "La playa más fotogénica de Cancún, con el famoso cartel de letras y aguas turquesas sin edificios de fondo." },
      { diaOffset: 0, hora_inicio: "11:30", hora_fin: "13:00", nombre: "Museo Subacuático de Arte (MUSA)", descripcion: "El mayor museo subacuático del mundo con más de 500 esculturas sumergidas en el Mar Caribe." },
      { diaOffset: 0, hora_inicio: "13:30", hora_fin: "15:00", nombre: "La Fishería", descripcion: "Almuerzo de mariscos frescos del Caribe frente al mar en la Zona Hotelera." },
      { diaOffset: 0, hora_inicio: "16:00", hora_fin: "18:30", nombre: "Laguna Nichupté", descripcion: "Paseo en kayak o jetski por la laguna que bordea la Zona Hotelera, con manglares y aguas calmas." },
      { diaOffset: 0, hora_inicio: "19:00", hora_fin: "20:30", nombre: "El Rey Zona Arqueológica", descripcion: "Ruinas mayas al atardecer dentro de la Zona Hotelera, con iguanas caminando entre las pirámides." },
      { diaOffset: 0, hora_inicio: "21:00", hora_fin: "23:00", nombre: "Lorenzillo's", descripcion: "Cena de langosta y mariscos en el restaurante sobre el mar más famoso de Cancún." },

      // DÍA 2: Isla Mujeres
      { diaOffset: 1, hora_inicio: "08:00", hora_fin: "09:30", nombre: "Ferry a Isla Mujeres", descripcion: "Travesía en catamarán desde Puerto Juárez hasta la isla más encantadora del Caribe mexicano." },
      { diaOffset: 1, hora_inicio: "09:45", hora_fin: "11:30", nombre: "Playa Norte - Isla Mujeres", descripcion: "Clasificada entre las playas más bellas del mundo: aguas turquesas con fondo de arena blanca como talco." },
      { diaOffset: 1, hora_inicio: "12:00", hora_fin: "13:30", nombre: "El Patio - Isla Mujeres", descripcion: "Almuerzo de pescado al limón y ceviche local en una terraza con vista al mar." },
      { diaOffset: 1, hora_inicio: "14:00", hora_fin: "16:00", nombre: "Garrafón Natural Reef Park", descripcion: "Snorkel en el arrecife de coral al sur de la isla, con peces tropicales y tortugas marinas." },
      { diaOffset: 1, hora_inicio: "16:30", hora_fin: "18:00", nombre: "Santuario de las Tortugas Marinas", descripcion: "Centro de conservación donde nacer tortugas y se pueden observar en su hábitat protegido." },
      { diaOffset: 1, hora_inicio: "18:30", hora_fin: "20:00", nombre: "Paseo por el pueblo de Isla Mujeres", descripcion: "Recorrido en golf cart por las coloridas calles de la isla al atardecer caribeño." },

      // DÍA 3: Playa del Carmen y Tulum
      { diaOffset: 2, hora_inicio: "08:30", hora_fin: "10:30", nombre: "Zona Arqueológica de Tulum", descripcion: "Las únicas ruinas mayas con vista al mar Caribe, el amanecer más espectacular de la Riviera Maya." },
      { diaOffset: 2, hora_inicio: "11:00", hora_fin: "12:30", nombre: "Playa Paraíso - Tulum", descripcion: "La playa bajo las ruinas mayas, considerada una de las más bellas de toda la Riviera Maya." },
      { diaOffset: 2, hora_inicio: "13:00", hora_fin: "14:30", nombre: "Hartwood Restaurant", descripcion: "Almuerzo en el restaurante más exclusivo de Tulum, con cocina de leña y ingredientes locales." },
      { diaOffset: 2, hora_inicio: "15:30", hora_fin: "17:30", nombre: "Cenote Gran Cenote - Tulum", descripcion: "Uno de los cenotes más hermosos del mundo, con aguas cristalinas, estalactitas y peces tropicales." },
      { diaOffset: 2, hora_inicio: "18:00", hora_fin: "19:30", nombre: "Quinta Avenida - Playa del Carmen", descripcion: "Paseo por la calle peatonal más animada de la Riviera Maya, llena de tiendas, restaurantes y vida local." },
      { diaOffset: 2, hora_inicio: "20:00", hora_fin: "22:00", nombre: "La Tagliatella Playa del Carmen", descripcion: "Cena italiana mediterránea frente al mar en la famosa Quinta Avenida." },

      // DÍA 4: Chichén Itzá y Cenote
      { diaOffset: 3, hora_inicio: "07:00", hora_fin: "10:30", nombre: "Chichén Itzá - Pirámide de Kukulcán", descripcion: "Una de las Siete Maravillas del Mundo Moderno, la pirámide más impresionante de la civilización maya." },
      { diaOffset: 3, hora_inicio: "10:45", hora_fin: "12:00", nombre: "El Caracol y Templo de los Guerreros", descripcion: "El observatorio astronómico maya y el templo de las 1.000 columnas dentro del sitio arqueológico." },
      { diaOffset: 3, hora_inicio: "12:30", hora_fin: "14:00", nombre: "Yaxunah Lodge", descripcion: "Almuerzo de cocina maya auténtica: cochinita pibil, sopa de lima y marquesitas en el pueblo cercano." },
      { diaOffset: 3, hora_inicio: "15:00", hora_fin: "17:00", nombre: "Cenote Ik Kil", descripcion: "El cenote más famoso de Yucatán, con 26 metros de profundidad y raíces de ceiba colgando hasta el agua." },
      { diaOffset: 3, hora_inicio: "17:30", hora_fin: "19:00", nombre: "Valladolid - Zócalo Colonial", descripcion: "La ciudad colonial más bella de Yucatán, con su catedral y el mercado de artesanías maya." },
      { diaOffset: 3, hora_inicio: "20:30", hora_fin: "22:30", nombre: "Puerto Madero Cancún", descripcion: "Cena de celebración con mariscos y carnes en el restaurante más animado de la Zona Hotelera." },

      // DÍA 5: Snorkel, Xcaret y despedida
      { diaOffset: 4, hora_inicio: "09:00", hora_fin: "11:00", nombre: "Xcaret Eco Archaeological Park", descripcion: "El parque temático maya más completo de México, con ríos subterráneos, arrecifes y shows culturales." },
      { diaOffset: 4, hora_inicio: "11:30", hora_fin: "13:00", nombre: "Río subterráneo de Xcaret", descripcion: "Experiencia única de natación por los ríos bajo la tierra entre formaciones naturales de caliza." },
      { diaOffset: 4, hora_inicio: "13:30", hora_fin: "15:00", nombre: "Buffet Internacional de Xcaret", descripcion: "Almuerzo con cocina mexicana, caribeña e internacional dentro del parque." },
      { diaOffset: 4, hora_inicio: "15:30", hora_fin: "17:30", nombre: "Snorkel en el Arrecife Mesoamericano", descripcion: "El segundo arrecife de coral más grande del mundo, con mantarrayas, tortugas y miles de peces de colores." },
      { diaOffset: 4, hora_inicio: "18:00", hora_fin: "20:00", nombre: "Atardecer en Punta Cancún", descripcion: "Brindis caribeño al atardecer desde la terraza más alta de la Zona Hotelera con vista al Golfo." },
      { diaOffset: 4, hora_inicio: "20:30", hora_fin: "23:00", nombre: "Cena de Despedida en La Destilería", descripcion: "Noche final con cocina mexicana gourmet, mezcales artesanales y música en vivo en la Zona Hotelera." }
    ]
  }
};
