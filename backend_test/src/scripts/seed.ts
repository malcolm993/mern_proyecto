import "dotenv/config";
import mongoose from "mongoose";
import UserModel, { User as UserType } from "../models/user";
import Event from "../models/event";
import AgendaItem from "../models/agendaItem";

// =========================================================
// CREDENCIALES DE PRUEBA (recordatorio)
// Administradores -> password: "Admin123"
// Participantes   -> password: "User123"
// (Estas contraseñas se hashean automáticamente vía el hook
// pre('save') del modelo User, no se guardan en texto plano)
// =========================================================

const MONGODB_URI = process.env.MONGODB_URI as string;

const seed = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definida en el .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Conectado a MongoDB");

    // ---------------------------------------------------
    // Limpieza de la base de datos
    // ---------------------------------------------------
    await AgendaItem.deleteMany({});
    await Event.deleteMany({});
    await UserModel.deleteMany({});
    console.log("Colecciones limpiadas (users, events, agendaitems)");

    // ---------------------------------------------------
    // Usuarios administradores
    // ---------------------------------------------------
    const adminsData = [
      {
        email: "admin1@evento.com",
        password: "Admin123",
        name: "Carla Fernández",
        role: "admin" as const,
        company: "EventosTech",
        businessArea: "Organización de eventos",
        interests: ["tecnología", "negocios"],
        bio: "Administradora principal de la plataforma."
      },
      {
        email: "admin2@evento.com",
        password: "Admin123",
        name: "Martín Gómez",
        role: "admin" as const,
        company: "EventosTech",
        businessArea: "Operaciones",
        interests: ["networking", "educacion"],
        bio: "Encargado de operaciones y soporte de eventos."
      }
    ];

    const admins: UserType[] = [];
    for (const data of adminsData) {
      const admin = await UserModel.create(data);
      admins.push(admin);
    }

    const [admin1, admin2] = admins;
    if (!admin1 || !admin2) {
      throw new Error("No se pudieron crear los usuarios admin");
    }
    console.log(`Usuarios admin creados: ${admins.length}`);

    // ---------------------------------------------------
    // Usuarios participantes
    // ---------------------------------------------------
    const usersData = [
      {
        email: "user1@evento.com",
        password: "User123",
        name: "Lucía Pérez",
        role: "user" as const,
        company: "Innova S.A.",
        businessArea: "Marketing",
        interests: ["tecnología", "artes"],
        bio: "Apasionada por el marketing digital y el arte."
      },
      {
        email: "user2@evento.com",
        password: "User123",
        name: "Diego Sánchez",
        role: "user" as const,
        company: "Devsoft",
        businessArea: "Desarrollo de software",
        interests: ["tecnología", "educacion"],
        bio: "Desarrollador backend interesado en IA."
      },
      {
        email: "user3@evento.com",
        password: "User123",
        name: "Valentina Rojas",
        role: "user" as const,
        company: "Rojas Consulting",
        businessArea: "Consultoría",
        interests: ["negocios", "networking"],
        bio: "Consultora de negocios y networking."
      },
      {
        email: "user4@evento.com",
        password: "User123",
        name: "Tomás Acosta",
        role: "user" as const,
        company: "DeporteMax",
        businessArea: "Deportes",
        interests: ["deportes", "educacion"],
        bio: "Entrenador y entusiasta del deporte."
      },
      {
        email: "user5@evento.com",
        password: "User123",
        name: "Sofía Méndez",
        role: "user" as const,
        company: "ArteVivo",
        businessArea: "Artes visuales",
        interests: ["artes", "tecnología"],
        bio: "Artista digital y diseñadora gráfica."
      },
      {
        email: "user6@evento.com",
        password: "User123",
        name: "Nicolás Torres",
        role: "user" as const,
        company: "Torres & Asociados",
        businessArea: "Finanzas",
        interests: ["negocios", "tecnología"],
        bio: "Analista financiero interesado en fintech."
      },
      {
        email: "user7@evento.com",
        password: "User123",
        name: "Camila Díaz",
        role: "user" as const,
        company: "EduPlus",
        businessArea: "Educación",
        interests: ["educacion", "networking"],
        bio: "Docente interesada en tecnología educativa."
      },
      {
        email: "user8@evento.com",
        password: "User123",
        name: "Federico López",
        role: "user" as const,
        company: "Independiente",
        businessArea: "Deportes",
        interests: ["deportes", "negocios"],
        bio: "Organizador de eventos deportivos."
      }
    ];

    const users: UserType[] = [];
    for (const data of usersData) {
      const user = await UserModel.create(data);
      users.push(user);
    }
    console.log(`Usuarios participantes creados: ${users.length}`);

    // ---------------------------------------------------
    // Eventos
    // ---------------------------------------------------
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const eventsData = [
      {
        title: "Conferencia de Innovación Tecnológica",
        description: "Charlas y talleres sobre las últimas tendencias en tecnología, inteligencia artificial y transformación digital para empresas.",
        location: "Centro de Convenciones, Buenos Aires",
        startDateTime: new Date(now + 7 * day),
        endDateTime: new Date(now + 7 * day + 6 * 60 * 60 * 1000),
        maxParticipants: 5,
        currentParticipants: 0,
        status: "activo" as const,
        interestCategory: "tecnología" as const,
        createdBy: admin1._id

      },
      {
        title: "Foro de Negocios y Emprendimiento",
        description: "Espacio de encuentro para emprendedores, inversores y profesionales del mundo de los negocios, con paneles y rondas de networking.",
        location: "Hotel Plaza, Córdoba",
        startDateTime: new Date(now + 14 * day),
        endDateTime: new Date(now + 14 * day + 8 * 60 * 60 * 1000),
        maxParticipants: 5,
        currentParticipants: 0,
        status: "activo" as const,
        interestCategory: "negocios" as const,
        createdBy: admin2._id
      },
      {
        title: "Festival de Artes Visuales",
        description: "Exposiciones, talleres y charlas con artistas locales e internacionales enfocados en artes visuales y diseño digital.",
        location: "Centro Cultural, Rosario",
        startDateTime: new Date(now + 21 * day),
        endDateTime: new Date(now + 21 * day + 5 * 60 * 60 * 1000),
        maxParticipants: 5,
        currentParticipants: 0,
        status: "activo" as const,
        interestCategory: "artes" as const,
        createdBy: admin1._id
      },
      {
        title: "Jornada de Educación y Networking",
        description: "Evento orientado a docentes y profesionales de la educación, con espacios de networking y presentación de proyectos educativos.",
        location: "Universidad Nacional, La Plata",
        startDateTime: new Date(now + 10 * day),
        endDateTime: new Date(now + 10 * day + 4 * 60 * 60 * 1000),
        maxParticipants: 5,
        currentParticipants: 5,
        status: "agotado" as const,
        interestCategory: "educacion" as const,
        createdBy: admin2._id
      },
      {
        title: "Encuentro Deportivo Empresarial (finalizado)",
        description: "Evento deportivo de prueba con fecha pasada, utilizado para testear el comportamiento de eventos finalizados o vencidos.",
        location: "Club Atlético, Mendoza",
        startDateTime: new Date(now - 14 * day),
        endDateTime: new Date(now - 14 * day + 4 * 60 * 60 * 1000),
        maxParticipants: 5,
        currentParticipants: 0,
        status: "finalizado" as const,
        interestCategory: "deportes" as const,
        createdBy: admin1._id
      }

    ];

    // El evento con fecha pasada no cumple el validador de Event
    // (startDateTime > new Date()), por lo que se inserta con
    // validators desactivados (solo para datos de prueba/seed).
    const events = [];
    const pastEvent = eventsData[eventsData.length - 1];
    const futureEvents = eventsData.slice(0, -1);

    for (const data of futureEvents) {
      const event = await Event.create(data);
      events.push(event);
    }

    if (pastEvent) {
      const result = await Event.collection.insertMany([pastEvent]);
      const created = await Event.findById(result.insertedIds[0]);
      events.push(created);
    }
    console.log(`Eventos creados: ${events.length}`);

    // ---------------------------------------------------
    // Agenda por evento (3 items cada uno)
    // ---------------------------------------------------
    let agendaCount = 0;

    for (const event of events) {
      if (!event) continue;

      const baseStart = new Date(event.startDateTime);

      const agendaData = [
        {
          event: event._id,
          title: "Acreditación y bienvenida",
          description: "Registro de asistentes y entrega de materiales del evento.",
          speaker: "Equipo organizador",
          startTime: new Date(baseStart.getTime()),
          endTime: new Date(baseStart.getTime() + 30 * 60 * 1000),
          order: 0
        },
        {
          event: event._id,
          title: "Charla principal",
          description: "Presentación central del evento a cargo del orador invitado.",
          speaker: "Orador invitado",
          startTime: new Date(baseStart.getTime() + 30 * 60 * 1000),
          endTime: new Date(baseStart.getTime() + 120 * 60 * 1000),
          order: 1
        },
        {
          event: event._id,
          title: "Cierre y networking",
          description: "Espacio de cierre, preguntas y networking entre los asistentes.",
          speaker: "Equipo organizador",
          startTime: new Date(baseStart.getTime() + 120 * 60 * 1000),
          endTime: new Date(baseStart.getTime() + 150 * 60 * 1000),
          order: 2
        }
      ];

      await AgendaItem.insertMany(agendaData);
      agendaCount += agendaData.length;
    }
    console.log(`Items de agenda creados: ${agendaCount}`);

    console.log("\nSeed completado exitosamente.");
    console.log("Credenciales de prueba:");
    console.log("  Admins -> admin1@evento.com / admin2@evento.com | password: Admin123");
    console.log("  Users  -> user1@evento.com ... user8@evento.com | password: User123");

  } catch (error) {
    console.error("Error ejecutando el seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Conexión a MongoDB cerrada");
  }
};

seed();