/**
 * i18n Utility for Backend
 * Simple translation system for automated messages and emails.
 */

type Translations = {
  [locale: string]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  ca: {
    // Requests
    'request_status_title': 'Sol·licitud {status}',
    'request_status_msg': 'La teva sol·licitud pel taller "{title}" ha estat {status_low}.',
    'workshop_assigned_title': 'Taller Assignat!',
    'workshop_assigned_msg': 'S\'ha generat l\'assignació pel taller "{title}".',
    
    // Phases
    'phase_start_title': 'Nova Fase: {name}',
    'phase_start_msg': 'La fase "{name}" ha començat. Consulta el calendari per a més detalls.',
    
    // Reminders
    'session_reminder_title': 'Recordatori: Sessió de Taller',
    'session_reminder_msg': 'Tens una sessió pel taller "{title}" programada per avui a les {time}.',
    'milestone_reminder_title': 'Pròxim Hito: {title}',
    'milestone_reminder_msg': 'Recordatori: L\'hito "{title}" està programat per a les pròximes 24 hores.',
    'calendar_sync_title': 'Sincronització de Calendari (Sistema)',
    'calendar_sync_msg': 'Verificació de calendari en segon pla executada',
    
    // Operations & Assignments
    'registration_confirmed_title': 'Matrícula Confirmada: Taller en Curs',
    'registration_confirmed_msg': 'La matrícula pel taller "{title}" s\'ha completat correctament.',
    'incorrect_doc_title': 'Documentació Incorrecta',
    'incorrect_doc_msg': 'Hola, el document {doc} del taller {title} és incorrecte. {comment}',
    
    // Parameter translations (Internal)
    'Approved': 'Aprovada',
    'Rejected': 'Rebutjada',
    'aprobada': 'aprovada',
    'rechazada': 'rebutjada',
    'agreement': 'Acord Pedagògic',
    'mobility': 'Autorització de Mobilitat',
    'rights': 'Drets d\'Imatge'
  },
  es: {
    // Requests
    'request_status_title': 'Solicitud {status}',
    'request_status_msg': 'Tu solicitud para el taller "{title}" ha sido {status_low}.',
    'workshop_assigned_title': '¡Taller Asignado!',
    'workshop_assigned_msg': 'Se ha generado la asignación para el taller "{title}".',
    
    // Phases
    'phase_start_title': 'Nueva Fase: {name}',
    'phase_start_msg': 'La fase "{name}" ha comenzado. Consulta el calendario para más detalles.',
    
    // Reminders
    'session_reminder_title': 'Recordatorio: Sesión de Taller',
    'session_reminder_msg': 'Tienes una sesión para el taller "{title}" programada para hoy a las {time}.',
    'milestone_reminder_title': 'Próximo Hito: {title}',
    'milestone_reminder_msg': 'Recordatorio: El hito "{title}" está programado para las próximas 24 horas.',
    'calendar_sync_title': 'Sincronización de Calendario (Sistema)',
    'calendar_sync_msg': 'Verificación de calendario en segundo plano ejecutada',
    
    // Operations & Assignments
    'registration_confirmed_title': 'Matrícula Confirmada: Taller en Curso',
    'registration_confirmed_msg': 'La matrícula para el taller "{title}" se ha completado correctamente.',
    'incorrect_doc_title': 'Documentación Incorrecta',
    'incorrect_doc_msg': 'Hola, el documento {doc} del taller {title} es incorrecto. {comment}',

    // Parameter translations (Internal)
    'Approved': 'Aprobada',
    'Rejected': 'Rechazada',
    'aprobada': 'aprobada',
    'rechazada': 'rechazada',
    'agreement': 'Acuerdo Pedagógico',
    'mobility': 'Autorización de Movilidad',
    'rights': 'Derechos de Imagen'
  }
};

/**
 * Translates a key with parameters
 * @param key The translation key
 * @param params Object with parameter values
 * @param locale Preferred locale (default: ca)
 */
export const t = (key: string, params: Record<string, any> = {}, locale: string = 'ca'): string => {
  const dict = translations[locale] || translations['ca'];
  let text = dict[key] || key;

  // Replace placeholders {key}
  Object.entries(params).forEach(([k, v]) => {
    // If the value itself is a translation key (common for status strings or doc names), try to translate it
    const translatedValue = dict[v] || v;
    text = text.replace(new RegExp(`{${k}}`, 'g'), String(translatedValue));
  });

  return text;
};

/**
 * Helper to process the JSON message field from notifications
 */
export const formatNotificationMessage = (rawMessage: string, locale: string = 'ca'): string => {
  try {
    // If it's pure text, return it
    if (!rawMessage.startsWith('{')) return rawMessage;

    const data = JSON.parse(rawMessage);
    if (data.key) {
      return t(data.key, data.params || {}, locale);
    }
    return rawMessage;
  } catch (e) {
    return rawMessage;
  }
};
