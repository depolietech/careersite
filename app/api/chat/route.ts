import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Lang = "en" | "fr" | "es" | "other";

interface ChatResponse {
  reply: string;
  suggestions: string[];
  links?: { label: string; href: string }[];
}

function detectLanguage(msg: string): Lang {
  const m = msg.toLowerCase();
  if (
    /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|du|est|sont|bonjour|salut|merci|comment|pourquoi|quand|où|cherche|emploi|poste|candidature|profil|entrevue|postuler|trouver|offres?|emplois)\b/.test(m)
  )
    return "fr";
  if (
    /\b(yo|tú|él|ella|nosotros|ellos|hola|gracias|cómo|cuándo|dónde|quién|busco|trabajo|empleo|solicitud|perfil|entrevista|buscar|encontrar|ofertas?|empleos)\b/.test(m)
  )
    return "es";
  return "en";
}

function detectIntent(msg: string): string {
  const m = msg.toLowerCase().trim();

  if (
    /\b(hi|hello|hey|howdy|greetings|good morning|good afternoon|good evening|bonjour|salut|bonsoir|allô|hola|buenos días|buenas tardes|buenas noches)\b/.test(m)
  )
    return "greeting";

  if (
    /\b(bias|anonymous|masked|masking|privacy|hidden|reveal|identity|fair|discrimination|diverse|diversity|unconscious|biais|anonyme|masqué|identité|équitable|diversité|sesgo|anónimo|enmascarado|identidad|justo|discriminación|diversidad)\b/.test(m)
  )
    return "bias";

  if (
    /\b(how.*(work|start|begin|use)|get started|new here|first time|what is this|tell me about|explain|overview|comment.*(fonctionn|commencer|démarrer|utiliser)|qu'est.ce|expliquer|cómo.*(funciona|empezar|comenzar|usar)|qué es|explicar)\b/.test(m)
  )
    return "onboarding";

  if (
    /\b(find job|search job|browse job|look.*job|job listing|open position|available job|job opening|show.*job|see.*job|what job|all job|trouver.*emploi|chercher.*emploi|offres?.*(emploi|poste)|postes? disponible|buscar.*trabajo|encontrar.*trabajo|ofertas?.*(trabajo|empleo)|puestos? disponible)\b/.test(m)
  )
    return "jobs_search";

  if (
    /\b(jobs?|emplois?|trabajos?)\b/.test(m) &&
    !/apply|application|track|status|my|postuler|candidature|suivre|solicitar|solicitud|seguir/.test(m)
  )
    return "jobs_search";

  if (
    /\b(how.*apply|how do i apply|applying|submit application|send application|comment.*postuler|soumettre.*candidature|envoyer.*candidature|cómo.*solicitar|cómo.*postular|enviar.*solicitud)\b/.test(m)
  )
    return "apply";

  if (/\b(apply|postuler|solicitar|postular)\b/.test(m) && !/how|comment|cómo/.test(m))
    return "apply";

  if (
    /\b(track|status|check.*application|my application|where.*application|application.*status|applied|what.*application|suivre|statut|mes? candidatures?|état.*candidature|mis? solicitudes?|estado.*solicitud)\b/.test(m)
  )
    return "track";

  if (
    /\b(reschedule|cancel.*interview|reject.*interview|decline.*interview|accept.*interview|interview.*action|reporter.*entrevue|annuler.*entrevue|accepter.*entrevue|reagendar|cancelar.*entrevista|aceptar.*entrevista)\b/.test(m)
  )
    return "interview_action";

  if (/\b(interview|entrevue|entretien|entrevista)\b/.test(m)) return "interview";

  if (
    /\b(snapshot|submission|submitted.*profile|what.*submitted|view.*application|application.*record|what.*recruiter.*see|instantané|soumission|profil.*soumis|instantánea|perfil.*enviado)\b/.test(m)
  )
    return "snapshot";

  if (
    /\b(resume|cv|curriculum vitae|upload.*resume|my resume|pdf|curriculum|mon cv|télécharger.*cv|subir.*curriculum)\b/.test(m)
  )
    return "resume";

  if (
    /\b(certification|certificate|cert|aws|pmp|google cert|add.*cert|certif|certificat|ajouter.*certif|certificación|agregar.*certif)\b/.test(m)
  )
    return "certifications";

  if (
    /\b(profile|complete.*profile|edit.*profile|update.*profile|my profile|strengthen|profil|compléter.*profil|modifier.*profil|mon profil|perfil|completar.*perfil|editar.*perfil|mi perfil)\b/.test(m)
  )
    return "profile";

  if (
    /\b(notification|alert|bell|unread|update.*me|notifications?|alertes?|non lues?|notificaciones?)\b/.test(m)
  )
    return "notifications";

  if (
    /\b(salary|pay|compensation|wage|range|minimum.*salary|maximum.*salary|salaire|rémunération|salario|compensación|rango salarial)\b/.test(m)
  )
    return "salary";

  if (
    /\b(talent|talent pool|browse.*candidate|find.*candidate|search.*candidate|bassin.*candidats?|trouver.*candidats?|grupo.*candidatos?|buscar.*candidatos?)\b/.test(m)
  )
    return "talent";

  if (
    /\b(employer|post.*job|hire|recruiter|hiring manager|candidate|i.*hiring|company|employeur|publier.*emploi|embaucher|recruteur|entreprise|empleador|publicar.*trabajo|contratar|reclutador|empresa)\b/.test(m)
  )
    return "employer";

  if (
    /\b(where|how.*get|navigate|navigation|go to|find.*page|settings|menu|dashboard|home page|où|comment.*accéder|naviguer|paramètres|tableau de bord|dónde|cómo.*ir|configuración|inicio)\b/.test(m)
  )
    return "navigation";

  if (
    /\b(help|support|assist|problem|issue|trouble|contact|stuck|faq|aide|soutien|problème|contactez|ayuda|soporte|problema|contacto)\b/.test(m)
  )
    return "help";

  if (
    /\b(login|log in|sign in|account|password|forgot password|sign up|register|create account|log out|sign out|connexion|se connecter|compte|mot de passe|créer.*compte|iniciar sesión|cuenta|contraseña|crear.*cuenta)\b/.test(m)
  )
    return "account";

  if (
    /\b(location|country|state|province|canada|usa|mexico|remote|lieu|pays|état|télétravail|trabajo remoto|país|estado|remoto)\b/.test(m)
  )
    return "location";

  return "fallback";
}

function L(lang: Lang, en: string, fr: string, es: string): string {
  if (lang === "fr") return fr;
  if (lang === "es") return es;
  return en;
}

function LA(lang: Lang, en: string[], fr: string[], es: string[]): string[] {
  if (lang === "fr") return fr;
  if (lang === "es") return es;
  return en;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json<ChatResponse>({
        reply: "Please type a message so I can help you.",
        suggestions: ["How does it work?", "Find jobs", "Track my applications"],
      });
    }

    const lang = detectLanguage(message);

    if (lang === "other") {
      return NextResponse.json<ChatResponse>({
        reply:
          "I'm sorry, I can only assist in English, French, or Spanish. Please contact our support team at admin@equalhires.com for help in your language.\n\nJe suis désolé, je ne peux aider qu'en anglais, français ou espagnol. Contactez-nous à admin@equalhires.com.\n\nLo siento, solo puedo ayudar en inglés, francés o español. Contáctenos en admin@equalhires.com.",
        suggestions: ["How does it work?", "Comment ça fonctionne?", "¿Cómo funciona?"],
        links: [{ label: "Contact Support", href: "/contact" }],
      });
    }

    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string } | undefined)?.role ?? null;

    const intent = detectIntent(message);
    let response: ChatResponse;

    switch (intent) {
      case "greeting": {
        if (userId && userRole === "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "Hello! I'm your Equalhires assistant. How can I help you today?",
              "Bonjour ! Je suis votre assistant Equalhires. Comment puis-je vous aider aujourd'hui ?",
              "¡Hola! Soy tu asistente de Equalhires. ¿Cómo puedo ayudarte hoy?"
            ),
            suggestions: LA(
              lang,
              ["Show my applications", "Find jobs", "How does anonymous hiring work?", "Update my profile"],
              ["Voir mes candidatures", "Trouver des emplois", "Comment fonctionne le recrutement anonyme ?", "Mettre à jour mon profil"],
              ["Ver mis solicitudes", "Buscar empleos", "¿Cómo funciona la contratación anónima?", "Actualizar mi perfil"]
            ),
          };
        } else if (userId && userRole === "EMPLOYER") {
          response = {
            reply: L(
              lang,
              "Hello! How can I help you with your hiring today?",
              "Bonjour ! Comment puis-je vous aider avec votre recrutement aujourd'hui ?",
              "¡Hola! ¿Cómo puedo ayudarte con tu proceso de contratación hoy?"
            ),
            suggestions: LA(
              lang,
              ["How do I post a job?", "View my applicants", "How does bias-free screening work?"],
              ["Comment publier un emploi ?", "Voir mes candidats", "Comment fonctionne la présélection équitable ?"],
              ["¿Cómo publicar un empleo?", "Ver mis candidatos", "¿Cómo funciona la selección imparcial?"]
            ),
          };
        } else {
          response = {
            reply: L(
              lang,
              "Hello! Welcome to Equalhires — where hiring is based on skills, not identity. How can I help you today?",
              "Bonjour ! Bienvenue sur Equalhires — où le recrutement est basé sur les compétences, pas sur l'identité. Comment puis-je vous aider ?",
              "¡Hola! Bienvenido a Equalhires — donde la contratación se basa en habilidades, no en identidad. ¿Cómo puedo ayudarte?"
            ),
            suggestions: LA(
              lang,
              ["How does it work?", "Find jobs", "I'm an employer", "Create an account"],
              ["Comment ça fonctionne ?", "Trouver des emplois", "Je suis un employeur", "Créer un compte"],
              ["¿Cómo funciona?", "Buscar empleos", "Soy empleador", "Crear cuenta"]
            ),
          };
        }
        break;
      }

      case "onboarding": {
        if (userId && userRole === "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "Here's how to get started as a job seeker:\n\n1. **Complete your profile** — add skills (use auto-suggest!), work experience, and education\n2. **Upload a resume** — required to apply; you can store up to 3 resumes\n3. **Browse jobs** — filter by type, location, or keyword; click any listing for details\n4. **Apply** — select your resume, add an optional cover letter; your identity stays masked\n5. **Track progress** — dashboard shows real-time status; use **View Submission** to see your exact snapshot",
              "Voici comment commencer en tant que chercheur d'emploi :\n\n1. **Complétez votre profil** — ajoutez vos compétences (utilisez la suggestion automatique !), votre expérience et votre formation\n2. **Téléchargez un CV** — requis pour postuler ; vous pouvez en stocker jusqu'à 3\n3. **Parcourez les emplois** — filtrez par type, lieu ou mot-clé\n4. **Postulez** — sélectionnez votre CV, ajoutez une lettre de motivation optionnelle ; votre identité reste masquée\n5. **Suivez votre progression** — le tableau de bord affiche le statut en temps réel",
              "Así es como empezar como candidato:\n\n1. **Completa tu perfil** — agrega habilidades (¡usa el autocompletado!), experiencia laboral y educación\n2. **Sube tu CV** — requerido para postular; puedes guardar hasta 3\n3. **Explora empleos** — filtra por tipo, ubicación o palabra clave\n4. **Postula** — selecciona tu CV, agrega una carta de presentación opcional; tu identidad permanece enmascarada\n5. **Sigue tu progreso** — el panel muestra el estado en tiempo real"
            ),
            suggestions: LA(
              lang,
              ["Update my profile", "Browse jobs", "Track my applications", "How does masking work?"],
              ["Mettre à jour mon profil", "Parcourir les emplois", "Suivre mes candidatures", "Comment fonctionne le masquage ?"],
              ["Actualizar mi perfil", "Explorar empleos", "Seguir mis solicitudes", "¿Cómo funciona el enmascaramiento?"]
            ),
            links: [
              { label: L(lang, "Complete Profile", "Compléter mon profil", "Completar perfil"), href: "/profile" },
              { label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" },
              { label: L(lang, "My Dashboard", "Mon tableau de bord", "Mi panel"), href: "/dashboard" },
            ],
          };
        } else if (userId && userRole === "EMPLOYER") {
          response = {
            reply: L(
              lang,
              "Here's how to get started as an employer:\n\n1. **Post a job** — describe the role, required skills, and requirements\n2. **Review applicants** — all profiles are anonymized (names, dates, and photos hidden)\n3. **Shortlist candidates** — evaluate based purely on skills\n4. **Schedule interviews** — identities are revealed only after scheduling\n5. **Hire fairly** — diverse shortlists, better outcomes for everyone",
              "Voici comment commencer en tant qu'employeur :\n\n1. **Publiez un emploi** — décrivez le poste, les compétences requises et les exigences\n2. **Examinez les candidats** — tous les profils sont anonymisés (noms, dates et photos cachés)\n3. **Présélectionnez des candidats** — évaluez uniquement sur les compétences\n4. **Planifiez des entrevues** — les identités ne sont révélées qu'après la planification\n5. **Recrutez équitablement** — des listes diversifiées, de meilleurs résultats pour tous",
              "Así es como empezar como empleador:\n\n1. **Publica un empleo** — describe el puesto, habilidades requeridas y requisitos\n2. **Revisa candidatos** — todos los perfiles son anónimos (nombres, fechas y fotos ocultos)\n3. **Preselecciona candidatos** — evalúa solo por habilidades\n4. **Programa entrevistas** — las identidades se revelan solo después de programar\n5. **Contrata justamente** — listas diversas, mejores resultados para todos"
            ),
            suggestions: LA(
              lang,
              ["Post a job", "View my applicants", "How does masking work?"],
              ["Publier un emploi", "Voir mes candidats", "Comment fonctionne le masquage ?"],
              ["Publicar empleo", "Ver mis candidatos", "¿Cómo funciona el enmascaramiento?"]
            ),
            links: [
              { label: L(lang, "Post a Job", "Publier un emploi", "Publicar empleo"), href: "/employer/post-job" },
              { label: L(lang, "View Applicants", "Voir les candidats", "Ver candidatos"), href: "/employer/applicants" },
            ],
          };
        } else {
          response = {
            reply: L(
              lang,
              "Equalhires works in 3 simple steps:\n\n🛡️ **Apply Anonymously** — Your name, photo, and personal details are hidden from employers\n\n⚡ **Get Evaluated Fairly** — Employers see only your skills and experience\n\n🔒 **Identity Revealed at Interview** — Your personal details are only shared once an interview is scheduled\n\nIt's completely free for job seekers!",
              "Equalhires fonctionne en 3 étapes simples :\n\n🛡️ **Postulez anonymement** — Votre nom, photo et coordonnées sont cachés des employeurs\n\n⚡ **Soyez évalué équitablement** — Les employeurs voient uniquement vos compétences et votre expérience\n\n🔒 **Identité révélée à l'entrevue** — Vos coordonnées ne sont partagées qu'une fois une entrevue planifiée\n\nC'est entièrement gratuit pour les chercheurs d'emploi !",
              "Equalhires funciona en 3 sencillos pasos:\n\n🛡️ **Postula de forma anónima** — Tu nombre, foto y datos personales están ocultos para los empleadores\n\n⚡ **Sé evaluado justamente** — Los empleadores solo ven tus habilidades y experiencia\n\n🔒 **Identidad revelada en la entrevista** — Tus datos personales solo se comparten cuando se programa una entrevista\n\n¡Es completamente gratis para los candidatos!"
            ),
            suggestions: LA(
              lang,
              ["Create a job seeker account", "I'm an employer", "How does profile masking work?", "Browse open jobs"],
              ["Créer un compte chercheur d'emploi", "Je suis un employeur", "Comment fonctionne le masquage ?", "Parcourir les emplois"],
              ["Crear cuenta de candidato", "Soy empleador", "¿Cómo funciona el enmascaramiento?", "Explorar empleos"]
            ),
            links: [
              { label: L(lang, "Get Started Free", "Commencer gratuitement", "Empezar gratis"), href: "/register?role=job-seeker" },
              { label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" },
            ],
          };
        }
        break;
      }

      case "jobs_search": {
        const jobCount = await db.job.count({ where: { status: "ACTIVE" } });
        if (jobCount > 0) {
          const browseFreeNote = L(
            lang,
            "\n\nBrowsing is free — you'll need an account to apply.",
            "\n\nParcourir est gratuit — vous aurez besoin d'un compte pour postuler.",
            "\n\nExplorar es gratis — necesitarás una cuenta para postular."
          );
          response = {
            reply: L(
              lang,
              `There are currently **${jobCount} active job${jobCount !== 1 ? "s" : ""}** on Equalhires. You can browse all listings and filter by job type, location, or required skills.${!userId ? browseFreeNote : ""}`,
              `Il y a actuellement **${jobCount} emploi${jobCount !== 1 ? "s" : ""}** actif${jobCount !== 1 ? "s" : ""} sur Equalhires. Vous pouvez parcourir toutes les offres et filtrer par type d'emploi, lieu ou compétences requises.${!userId ? browseFreeNote : ""}`,
              `Actualmente hay **${jobCount} empleo${jobCount !== 1 ? "s" : ""}** activo${jobCount !== 1 ? "s" : ""} en Equalhires. Puedes explorar todos los listados y filtrar por tipo de trabajo, ubicación o habilidades requeridas.${!userId ? browseFreeNote : ""}`
            ),
            suggestions: LA(
              lang,
              ["How do I apply?", "What types of jobs are listed?", "Update my profile", "Track my applications"],
              ["Comment postuler ?", "Quels types d'emplois sont listés ?", "Mettre à jour mon profil", "Suivre mes candidatures"],
              ["¿Cómo postular?", "¿Qué tipos de empleo hay?", "Actualizar mi perfil", "Seguir mis solicitudes"]
            ),
            links: [{ label: L(lang, "Browse All Jobs", "Parcourir tous les emplois", "Explorar todos los empleos"), href: "/jobs" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "No active jobs are listed right now, but new positions are posted regularly. Check back soon or set up your profile so you're ready to apply when listings go live.",
              "Aucun emploi actif n'est listé pour le moment, mais de nouveaux postes sont publiés régulièrement. Revenez bientôt ou configurez votre profil pour être prêt à postuler dès la mise en ligne des offres.",
              "No hay empleos activos listados en este momento, pero nuevos puestos se publican regularmente. Vuelve pronto o configura tu perfil para estar listo para postular cuando aparezcan las ofertas."
            ),
            suggestions: LA(
              lang,
              ["Create an account", "How does it work?", "I'm an employer"],
              ["Créer un compte", "Comment ça fonctionne ?", "Je suis un employeur"],
              ["Crear cuenta", "¿Cómo funciona?", "Soy empleador"]
            ),
            links: [
              { label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" },
              { label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" },
            ],
          };
        }
        break;
      }

      case "apply": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "To apply to jobs on Equalhires:\n\n1. **Create a free account** as a job seeker\n2. **Complete your profile** — add skills, at least one work experience, and one education entry (all required to apply)\n3. **Browse jobs** and click a listing to open the details panel\n4. Click **Apply** — optionally attach a resume and cover letter\n5. Submit — your identity stays masked until an interview is scheduled\n\n📸 A snapshot of your profile is stored at submission so you can see exactly what the recruiter received.",
              "Pour postuler à des emplois sur Equalhires :\n\n1. **Créez un compte gratuit** en tant que chercheur d'emploi\n2. **Complétez votre profil** — ajoutez des compétences, au moins une expérience professionnelle et une formation (tous requis pour postuler)\n3. **Parcourez les emplois** et cliquez sur une offre pour ouvrir le panneau de détails\n4. Cliquez sur **Postuler** — joignez optionnellement un CV et une lettre de motivation\n5. Soumettez — votre identité reste masquée jusqu'à ce qu'une entrevue soit planifiée\n\n📸 Un instantané de votre profil est enregistré à la soumission.",
              "Para postular a empleos en Equalhires:\n\n1. **Crea una cuenta gratuita** como candidato\n2. **Completa tu perfil** — agrega habilidades, al menos una experiencia laboral y una entrada de educación (todos requeridos)\n3. **Explora empleos** y haz clic en un listado para abrir el panel de detalles\n4. Haz clic en **Postular** — adjunta opcionalmente un CV y carta de presentación\n5. Envía — tu identidad permanece enmascarada hasta que se programe una entrevista\n\n📸 Se guarda un instantáneo de tu perfil al momento del envío."
            ),
            suggestions: LA(
              lang,
              ["Create an account", "How does masking work?", "Browse jobs"],
              ["Créer un compte", "Comment fonctionne le masquage ?", "Parcourir les emplois"],
              ["Crear cuenta", "¿Cómo funciona el enmascaramiento?", "Explorar empleos"]
            ),
            links: [
              { label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" },
              { label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" },
            ],
          };
        } else if (userRole !== "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "Applying to jobs is a feature for job seekers. As an employer, you can post jobs and review incoming applications from your dashboard.",
              "La candidature à des emplois est une fonctionnalité pour les chercheurs d'emploi. En tant qu'employeur, vous pouvez publier des emplois et examiner les candidatures entrantes depuis votre tableau de bord.",
              "Postular a empleos es una función para candidatos. Como empleador, puedes publicar empleos y revisar las solicitudes entrantes desde tu panel."
            ),
            suggestions: LA(
              lang,
              ["Post a job", "View my applicants"],
              ["Publier un emploi", "Voir mes candidats"],
              ["Publicar empleo", "Ver mis candidatos"]
            ),
            links: [{ label: L(lang, "Post a Job", "Publier un emploi", "Publicar empleo"), href: "/employer/post-job" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "To apply to a job:\n\n1. Go to **Browse Jobs** and click a listing\n2. Click **Apply** — the platform checks your profile is ready\n3. **Select a resume** (optional but recommended — upload up to 3 PDFs in your profile)\n4. Add an optional **cover letter** to personalize your application\n5. Submit — your identity stays hidden until an interview is scheduled\n\n⚠️ **Before you can apply** you need: at least one skill, one work experience entry, and one education entry. If anything is missing, you'll see a guided checklist with direct links to fix it.\n\n📸 A profile snapshot is captured at submission — view it anytime from your dashboard.",
              "Pour postuler à un emploi :\n\n1. Allez sur **Parcourir les emplois** et cliquez sur une offre\n2. Cliquez sur **Postuler** — la plateforme vérifie que votre profil est prêt\n3. **Sélectionnez un CV** (optionnel mais recommandé — téléchargez jusqu'à 3 PDFs dans votre profil)\n4. Ajoutez une **lettre de motivation** optionnelle pour personnaliser votre candidature\n5. Soumettez — votre identité reste cachée jusqu'à ce qu'une entrevue soit planifiée\n\n⚠️ **Avant de postuler** vous avez besoin de : au moins une compétence, une expérience professionnelle et une formation. Si quelque chose manque, vous verrez une liste de vérification guidée.\n\n📸 Un instantané du profil est capturé à la soumission.",
              "Para postular a un empleo:\n\n1. Ve a **Explorar empleos** y haz clic en un listado\n2. Haz clic en **Postular** — la plataforma verifica que tu perfil esté listo\n3. **Selecciona un CV** (opcional pero recomendado — sube hasta 3 PDFs en tu perfil)\n4. Agrega una **carta de presentación** opcional para personalizar tu solicitud\n5. Envía — tu identidad permanece oculta hasta que se programe una entrevista\n\n⚠️ **Antes de postular** necesitas: al menos una habilidad, una experiencia laboral y una entrada de educación. Si algo falta, verás una lista de verificación.\n\n📸 Se captura un instantáneo del perfil al enviar."
            ),
            suggestions: LA(
              lang,
              ["Browse jobs", "Update my profile", "Upload a resume", "View my submissions"],
              ["Parcourir les emplois", "Mettre à jour mon profil", "Télécharger un CV", "Voir mes soumissions"],
              ["Explorar empleos", "Actualizar mi perfil", "Subir CV", "Ver mis envíos"]
            ),
            links: [
              { label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" },
              { label: L(lang, "Edit Profile", "Modifier le profil", "Editar perfil"), href: "/profile" },
            ],
          };
        }
        break;
      }

      case "track": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "To track your applications you need to sign in. Once logged in, your dashboard shows all applications with real-time status updates — Applied, Under Review, Shortlisted, Interview Stage, and more.",
              "Pour suivre vos candidatures, vous devez vous connecter. Une fois connecté, votre tableau de bord affiche toutes les candidatures avec des mises à jour de statut en temps réel — Candidaté, En cours d'examen, Présélectionné, Étape d'entrevue, et plus encore.",
              "Para seguir tus solicitudes necesitas iniciar sesión. Una vez conectado, tu panel muestra todas las solicitudes con actualizaciones de estado en tiempo real — Postulado, En revisión, Preseleccionado, Etapa de entrevista, y más."
            ),
            suggestions: LA(
              lang,
              ["Sign in", "Create an account", "How does it work?"],
              ["Se connecter", "Créer un compte", "Comment ça fonctionne ?"],
              ["Iniciar sesión", "Crear cuenta", "¿Cómo funciona?"]
            ),
            links: [
              { label: L(lang, "Sign In", "Se connecter", "Iniciar sesión"), href: "/login" },
              { label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" },
            ],
          };
        } else if (userRole !== "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "As an employer, you can track your posted jobs and applicants from your dashboard.",
              "En tant qu'employeur, vous pouvez suivre vos emplois publiés et vos candidats depuis votre tableau de bord.",
              "Como empleador, puedes seguir tus empleos publicados y candidatos desde tu panel."
            ),
            suggestions: LA(
              lang,
              ["View my applicants", "View posted jobs"],
              ["Voir mes candidats", "Voir les emplois publiés"],
              ["Ver mis candidatos", "Ver empleos publicados"]
            ),
            links: [{ label: L(lang, "Employer Dashboard", "Tableau de bord employeur", "Panel de empleador"), href: "/employer/dashboard" }],
          };
        } else {
          const apps = await db.application.findMany({
            where: { userId },
            select: { status: true },
          });

          const total = apps.length;
          const interviews = apps.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
          const shortlisted = apps.filter(
            (a) => a.status === "SHORTLISTED" || a.status === "OFFER_MADE"
          ).length;
          const pending = apps.filter((a) => a.status === "PENDING").length;
          const reviewing = apps.filter((a) => a.status === "REVIEWING").length;

          if (total === 0) {
            response = {
              reply: L(
                lang,
                "You haven't applied to any jobs yet. Browse our active listings and start applying — it's completely free!",
                "Vous n'avez encore postulé à aucun emploi. Parcourez nos offres actives et commencez à postuler — c'est entièrement gratuit !",
                "Aún no has postulado a ningún empleo. Explora nuestras ofertas activas y comienza a postular — ¡es completamente gratis!"
              ),
              suggestions: LA(
                lang,
                ["Browse jobs", "How do I apply?", "Complete my profile"],
                ["Parcourir les emplois", "Comment postuler ?", "Compléter mon profil"],
                ["Explorar empleos", "¿Cómo postular?", "Completar mi perfil"]
              ),
              links: [{ label: L(lang, "Browse Jobs", "Parcourir les emplois", "Explorar empleos"), href: "/jobs" }],
            };
          } else {
            const header = L(
              lang,
              `You have **${total} application${total !== 1 ? "s" : ""}** in total:`,
              `Vous avez **${total} candidature${total !== 1 ? "s" : ""}** au total :`,
              `Tienes **${total} solicitud${total !== 1 ? "es" : ""}** en total:`
            );
            const lines = [header];
            if (pending > 0)
              lines.push(L(lang, `• ${pending} pending review`, `• ${pending} en attente d'examen`, `• ${pending} pendiente${pending !== 1 ? "s" : ""} de revisión`));
            if (reviewing > 0)
              lines.push(L(lang, `• ${reviewing} under review`, `• ${reviewing} en cours d'examen`, `• ${reviewing} en revisión`));
            if (shortlisted > 0)
              lines.push(L(lang, `• ${shortlisted} shortlisted`, `• ${shortlisted} présélectionné${shortlisted !== 1 ? "s" : ""}`, `• ${shortlisted} preseleccionado${shortlisted !== 1 ? "s" : ""}`));
            if (interviews > 0)
              lines.push(L(
                lang,
                `• ${interviews} interview${interviews !== 1 ? "s" : ""} scheduled 🎉`,
                `• ${interviews} entrevue${interviews !== 1 ? "s" : ""} planifiée${interviews !== 1 ? "s" : ""} 🎉`,
                `• ${interviews} entrevista${interviews !== 1 ? "s" : ""} programada${interviews !== 1 ? "s" : ""} 🎉`
              ));

            response = {
              reply: lines.join("\n"),
              suggestions: LA(
                lang,
                ["View my dashboard", "How does interview scheduling work?", "Browse more jobs"],
                ["Voir mon tableau de bord", "Comment fonctionne la planification ?", "Parcourir plus d'emplois"],
                ["Ver mi panel", "¿Cómo funciona la programación de entrevistas?", "Explorar más empleos"]
              ),
              links: [{ label: L(lang, "Go to Dashboard", "Aller au tableau de bord", "Ir al panel"), href: "/dashboard" }],
            };
          }
        }
        break;
      }

      case "interview_action": {
        if (!userId || userRole !== "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "Interview response actions are available to job seekers once an interview is scheduled.",
              "Les actions de réponse aux entrevues sont disponibles pour les chercheurs d'emploi une fois qu'une entrevue est planifiée.",
              "Las acciones de respuesta a entrevistas están disponibles para los candidatos una vez programada una entrevista."
            ),
            suggestions: LA(
              lang,
              ["How does it work?", "Browse jobs"],
              ["Comment ça fonctionne ?", "Parcourir les emplois"],
              ["¿Cómo funciona?", "Explorar empleos"]
            ),
          };
        } else {
          response = {
            reply: L(
              lang,
              "When a recruiter schedules an interview with you, you can respond directly from your **Calendar** page:\n\n✅ **Accept** — Confirm you're attending\n❌ **Decline** — Choose a reason (schedule conflict, accepted another offer, etc.)\n🔄 **Request Reschedule** — Propose a new date/time with a note to the recruiter\n\nYour response is sent instantly to the recruiter.",
              "Lorsqu'un recruteur planifie une entrevue avec vous, vous pouvez répondre directement depuis votre page **Calendrier** :\n\n✅ **Accepter** — Confirmez votre présence\n❌ **Refuser** — Choisissez une raison (conflit d'horaire, offre acceptée ailleurs, etc.)\n🔄 **Demander un report** — Proposez une nouvelle date/heure avec une note au recruteur\n\nVotre réponse est envoyée instantanément au recruteur.",
              "Cuando un reclutador programa una entrevista contigo, puedes responder directamente desde tu página de **Calendario**:\n\n✅ **Aceptar** — Confirma tu asistencia\n❌ **Rechazar** — Elige una razón (conflicto de horario, otra oferta aceptada, etc.)\n🔄 **Solicitar reprogramación** — Propón una nueva fecha/hora con una nota al reclutador\n\nTu respuesta se envía instantáneamente al reclutador."
            ),
            suggestions: LA(
              lang,
              ["View my calendar", "Track my applications", "How do interviews work?"],
              ["Voir mon calendrier", "Suivre mes candidatures", "Comment fonctionnent les entrevues ?"],
              ["Ver mi calendario", "Seguir mis solicitudes", "¿Cómo funcionan las entrevistas?"]
            ),
            links: [{ label: L(lang, "Go to Calendar", "Aller au calendrier", "Ir al calendario"), href: "/calendar" }],
          };
        }
        break;
      }

      case "interview": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "Interviews on Equalhires work differently:\n\n🔒 **Before interview:** Your identity is fully anonymous\n📅 **Interview scheduled:** The employer requests an interview with you\n✅ **Reveal:** Your name and personal details are shared with the employer\n📹 **Interview types:** Video call, phone, or in-person\n\nThis ensures you're evaluated on your skills first — not who you are.",
              "Les entrevues sur Equalhires fonctionnent différemment :\n\n🔒 **Avant l'entrevue :** Votre identité est entièrement anonyme\n📅 **Entrevue planifiée :** L'employeur demande une entrevue avec vous\n✅ **Révélation :** Votre nom et vos coordonnées sont partagés avec l'employeur\n📹 **Types d'entrevues :** Vidéoconférence, téléphone ou en personne\n\nCela garantit que vous êtes évalué sur vos compétences d'abord.",
              "Las entrevistas en Equalhires funcionan de manera diferente:\n\n🔒 **Antes de la entrevista:** Tu identidad es completamente anónima\n📅 **Entrevista programada:** El empleador solicita una entrevista contigo\n✅ **Revelación:** Tu nombre y datos personales se comparten con el empleador\n📹 **Tipos de entrevistas:** Videollamada, teléfono o en persona\n\nEsto garantiza que seas evaluado por tus habilidades primero."
            ),
            suggestions: LA(
              lang,
              ["Create an account", "How does masking work?", "Browse jobs"],
              ["Créer un compte", "Comment fonctionne le masquage ?", "Parcourir les emplois"],
              ["Crear cuenta", "¿Cómo funciona el enmascaramiento?", "Explorar empleos"]
            ),
            links: [{ label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          const interviewCount = await db.application.count({
            where: { userId, status: "INTERVIEW_SCHEDULED" },
          });

          if (interviewCount > 0) {
            response = {
              reply: L(
                lang,
                `You have **${interviewCount} interview${interviewCount !== 1 ? "s" : ""}** scheduled! 🎉\n\nYour identity has been revealed to the employer. Head to your dashboard to view meeting details and the joining link.`,
                `Vous avez **${interviewCount} entrevue${interviewCount !== 1 ? "s" : ""}** planifiée${interviewCount !== 1 ? "s" : ""} ! 🎉\n\nVotre identité a été révélée à l'employeur. Rendez-vous sur votre tableau de bord pour voir les détails de la réunion et le lien de connexion.`,
                `¡Tienes **${interviewCount} entrevista${interviewCount !== 1 ? "s" : ""}** programada${interviewCount !== 1 ? "s" : ""}! 🎉\n\nTu identidad ha sido revelada al empleador. Ve a tu panel para ver los detalles de la reunión y el enlace de acceso.`
              ),
              suggestions: LA(
                lang,
                ["Go to my dashboard", "Browse more jobs"],
                ["Aller à mon tableau de bord", "Parcourir plus d'emplois"],
                ["Ir a mi panel", "Explorar más empleos"]
              ),
              links: [{ label: L(lang, "View Dashboard", "Voir le tableau de bord", "Ver panel"), href: "/dashboard" }],
            };
          } else {
            response = {
              reply: L(
                lang,
                "You don't have any interviews scheduled yet.\n\nWhen an employer shortlists you and schedules an interview:\n• You'll receive a notification\n• Your identity is revealed to the employer\n• A meeting link will appear in your dashboard",
                "Vous n'avez pas encore d'entrevues planifiées.\n\nLorsqu'un employeur vous présélectionne et planifie une entrevue :\n• Vous recevrez une notification\n• Votre identité est révélée à l'employeur\n• Un lien de réunion apparaîtra dans votre tableau de bord",
                "Aún no tienes entrevistas programadas.\n\nCuando un empleador te preseleccione y programe una entrevista:\n• Recibirás una notificación\n• Tu identidad se revela al empleador\n• Un enlace de reunión aparecerá en tu panel"
              ),
              suggestions: LA(
                lang,
                ["Track my applications", "Browse jobs", "Update my profile"],
                ["Suivre mes candidatures", "Parcourir les emplois", "Mettre à jour mon profil"],
                ["Seguir mis solicitudes", "Explorar empleos", "Actualizar mi perfil"]
              ),
              links: [{ label: L(lang, "Go to Dashboard", "Aller au tableau de bord", "Ir al panel"), href: "/dashboard" }],
            };
          }
        } else {
          response = {
            reply: L(
              lang,
              "As an employer, you can schedule interviews from the applicant review page. When you schedule an interview, the candidate's full profile is automatically revealed to you.",
              "En tant qu'employeur, vous pouvez planifier des entrevues depuis la page d'examen des candidats. Lorsque vous planifiez une entrevue, le profil complet du candidat vous est automatiquement révélé.",
              "Como empleador, puedes programar entrevistas desde la página de revisión de candidatos. Cuando programas una entrevista, el perfil completo del candidato se te revela automáticamente."
            ),
            suggestions: LA(
              lang,
              ["View my applicants", "How does masking work?"],
              ["Voir mes candidats", "Comment fonctionne le masquage ?"],
              ["Ver mis candidatos", "¿Cómo funciona el enmascaramiento?"]
            ),
            links: [{ label: L(lang, "View Applicants", "Voir les candidats", "Ver candidatos"), href: "/employer/applicants" }],
          };
        }
        break;
      }

      case "resume": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "You can store up to **3 resumes** (PDF format, max 5 MB each) in your Equalhires account.\n\n📎 **Resume is required to apply** — without at least one resume uploaded you won't be able to submit an application.\n\nWhen applying, you choose which of your saved resumes to send. This lets you tailor your application for each role.",
              "Vous pouvez stocker jusqu'à **3 CVs** (format PDF, max 5 Mo chacun) dans votre compte Equalhires.\n\n📎 **Le CV est requis pour postuler** — sans au moins un CV téléchargé, vous ne pourrez pas soumettre de candidature.\n\nLors de la candidature, vous choisissez lequel de vos CVs envoyer.",
              "Puedes almacenar hasta **3 CVs** (formato PDF, máx. 5 MB cada uno) en tu cuenta de Equalhires.\n\n📎 **Se requiere un CV para postular** — sin al menos un CV subido no podrás enviar una solicitud.\n\nAl postular, eliges cuál de tus CVs enviar."
            ),
            suggestions: LA(
              lang,
              ["Create an account", "Browse jobs", "How does it work?"],
              ["Créer un compte", "Parcourir les emplois", "Comment ça fonctionne ?"],
              ["Crear cuenta", "Explorar empleos", "¿Cómo funciona?"]
            ),
            links: [{ label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          const resumeCount = await db.resume.count({ where: { userId } });
          response = {
            reply: resumeCount > 0
              ? L(
                  lang,
                  `You have **${resumeCount} resume${resumeCount !== 1 ? "s" : ""}** saved (max 3 allowed).\n\nWhen you apply to a job, you'll be prompted to **select which resume to send** from your saved list. The selected resume is recorded in your application snapshot and shared with the employer once your identity is revealed after an interview is scheduled.`,
                  `Vous avez **${resumeCount} CV${resumeCount !== 1 ? "s" : ""}** sauvegardé${resumeCount !== 1 ? "s" : ""} (max 3 autorisés).\n\nLorsque vous postulez à un emploi, vous serez invité à **sélectionner le CV à envoyer** depuis votre liste. Le CV sélectionné est enregistré dans l'instantané de votre candidature.`,
                  `Tienes **${resumeCount} CV${resumeCount !== 1 ? "s" : ""}** guardado${resumeCount !== 1 ? "s" : ""} (máx. 3 permitidos).\n\nCuando postulas a un empleo, se te pedirá que **selecciones el CV a enviar** de tu lista guardada. El CV seleccionado queda registrado en el instantáneo de tu solicitud.`
                )
              : L(
                  lang,
                  "You haven't uploaded any resumes yet. While a resume is not required to submit an application, it is strongly recommended — employers can review it once your identity is revealed.\n\nYou can upload up to 3 PDFs (max 5 MB each) from your profile page.",
                  "Vous n'avez pas encore téléchargé de CV. Bien qu'un CV ne soit pas obligatoire pour soumettre une candidature, il est fortement recommandé.\n\nVous pouvez télécharger jusqu'à 3 PDFs (max 5 Mo chacun) depuis votre page de profil.",
                  "Aún no has subido ningún CV. Aunque no es obligatorio para enviar una solicitud, se recomienda encarecidamente.\n\nPuedes subir hasta 3 PDFs (máx. 5 MB cada uno) desde tu página de perfil."
                ),
            suggestions: LA(
              lang,
              ["Edit my profile", "Browse jobs", "Track my applications"],
              ["Modifier mon profil", "Parcourir les emplois", "Suivre mes candidatures"],
              ["Editar mi perfil", "Explorar empleos", "Seguir mis solicitudes"]
            ),
            links: [{ label: L(lang, "Upload Resume", "Télécharger un CV", "Subir CV"), href: "/profile#resumes" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "Resume upload is a feature for job seekers. As an employer, you can view candidate resumes after an interview is scheduled.",
              "Le téléchargement de CV est une fonctionnalité pour les chercheurs d'emploi. En tant qu'employeur, vous pouvez consulter les CVs des candidats après la planification d'une entrevue.",
              "La subida de CVs es una función para candidatos. Como empleador, puedes ver los CVs de los candidatos después de programar una entrevista."
            ),
            suggestions: LA(
              lang,
              ["View my applicants", "Post a job"],
              ["Voir mes candidats", "Publier un emploi"],
              ["Ver mis candidatos", "Publicar empleo"]
            ),
          };
        }
        break;
      }

      case "profile": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "Your profile on Equalhires includes:\n\n• **Skills & experience** — always visible to employers\n• **Work history** — role duration shown, company names masked\n• **Education** — degree shown, institution masked\n• **Personal details** — hidden until an interview is scheduled\n\nA complete profile is required to apply — skills, work experience, and a resume must all be present.\n\n💡 **Skills auto-suggest**: as you type in the skills field, suggestions from a 100+ skill taxonomy appear to help you pick the right terms.",
              "Votre profil sur Equalhires comprend :\n\n• **Compétences et expérience** — toujours visibles pour les employeurs\n• **Historique professionnel** — durée du rôle affichée, noms d'entreprises masqués\n• **Formation** — diplôme affiché, établissement masqué\n• **Coordonnées** — cachées jusqu'à la planification d'une entrevue\n\nUn profil complet est requis pour postuler.\n\n💡 **Suggestion automatique de compétences** : en tapant dans le champ compétences, des suggestions apparaissent.",
              "Tu perfil en Equalhires incluye:\n\n• **Habilidades y experiencia** — siempre visibles para los empleadores\n• **Historial laboral** — duración del puesto visible, nombres de empresas enmascarados\n• **Educación** — tipo de título visible, institución enmascarada\n• **Datos personales** — ocultos hasta que se programe una entrevista\n\nSe requiere un perfil completo para postular.\n\n💡 **Autocompletado de habilidades**: al escribir en el campo de habilidades, aparecen sugerencias."
            ),
            suggestions: LA(
              lang,
              ["Create an account", "How does masking work?"],
              ["Créer un compte", "Comment fonctionne le masquage ?"],
              ["Crear cuenta", "¿Cómo funciona el enmascaramiento?"]
            ),
            links: [{ label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register?role=job-seeker" }],
          };
        } else if (userRole === "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "A strong profile is required before applying.\n\n**Required to apply:**\n✅ At least one skill added\n✅ At least one work experience entry\n✅ At least one education entry\n\n**Strongly recommended:**\n⭐ Resume uploaded (up to 3 PDFs stored)\n⭐ Professional headline\n⭐ Career summary\n⭐ Certifications\n\n💡 **Tip:** The skills field has **auto-suggest** — start typing any skill and a dropdown shows matching options from 100+ common skills.\n\n⚠️ If anything required is missing, you'll see a guided checklist with direct links when you click Apply.",
              "Un profil solide est requis avant de postuler.\n\n**Requis pour postuler :**\n✅ Au moins une compétence ajoutée\n✅ Au moins une expérience professionnelle\n✅ Au moins une formation\n\n**Fortement recommandé :**\n⭐ CV téléchargé (jusqu'à 3 PDFs stockés)\n⭐ Titre professionnel\n⭐ Résumé de carrière\n⭐ Certifications\n\n💡 **Conseil :** Le champ compétences a une **suggestion automatique**.\n\n⚠️ Si quelque chose est manquant, vous verrez une liste de vérification guidée lors du clic sur Postuler.",
              "Se requiere un perfil sólido antes de postular.\n\n**Requerido para postular:**\n✅ Al menos una habilidad agregada\n✅ Al menos una experiencia laboral\n✅ Al menos una entrada de educación\n\n**Muy recomendado:**\n⭐ CV subido (hasta 3 PDFs guardados)\n⭐ Título profesional\n⭐ Resumen de carrera\n⭐ Certificaciones\n\n💡 **Consejo:** El campo de habilidades tiene **autocompletado**.\n\n⚠️ Si algo requerido falta, verás una lista de verificación al hacer clic en Postular."
            ),
            suggestions: LA(
              lang,
              ["Edit my profile", "Upload a resume", "Browse jobs", "What is a profile snapshot?"],
              ["Modifier mon profil", "Télécharger un CV", "Parcourir les emplois", "Qu'est-ce qu'un instantané ?"],
              ["Editar mi perfil", "Subir CV", "Explorar empleos", "¿Qué es un instantáneo?"]
            ),
            links: [
              { label: L(lang, "Edit Profile", "Modifier le profil", "Editar perfil"), href: "/profile" },
              { label: L(lang, "Upload Resume", "Télécharger un CV", "Subir CV"), href: "/profile#resumes" },
            ],
          };
        } else {
          response = {
            reply: L(
              lang,
              "Your company profile helps job seekers understand who they're applying to. Keep it updated with your company description, industry, and location.",
              "Votre profil d'entreprise aide les chercheurs d'emploi à comprendre à qui ils postulent. Gardez-le à jour avec la description, l'industrie et l'emplacement de votre entreprise.",
              "Tu perfil de empresa ayuda a los candidatos a entender a quién están postulando. Mantenlo actualizado con la descripción, industria y ubicación de tu empresa."
            ),
            suggestions: LA(
              lang,
              ["Post a job", "View my applicants"],
              ["Publier un emploi", "Voir mes candidats"],
              ["Publicar empleo", "Ver mis candidatos"]
            ),
          };
        }
        break;
      }

      case "snapshot": {
        if (!userId || userRole !== "JOB_SEEKER") {
          response = {
            reply: L(
              lang,
              "📸 **Application Snapshots** are a transparency feature on Equalhires.\n\nWhen you submit an application, an immutable copy of your profile is captured — your skills, headline, work history, education, and which resume you selected. This never changes, even if you later update your profile.\n\nAs a job seeker, you can view the exact snapshot from your Dashboard using the **View Submission** link on each application.",
              "📸 **Les instantanés de candidature** sont une fonctionnalité de transparence sur Equalhires.\n\nLorsque vous soumettez une candidature, une copie immuable de votre profil est capturée — vos compétences, titre, historique professionnel, formation et le CV sélectionné. Cela ne change jamais.\n\nEn tant que chercheur d'emploi, vous pouvez consulter l'instantané exact depuis votre tableau de bord via le lien **Voir la soumission**.",
              "📸 **Los instantáneos de solicitud** son una función de transparencia en Equalhires.\n\nCuando envías una solicitud, se captura una copia inmutable de tu perfil — tus habilidades, título, historial laboral, educación y el CV seleccionado. Esto nunca cambia.\n\nComo candidato, puedes ver el instantáneo exacto desde tu panel usando el enlace **Ver envío**."
            ),
            suggestions: LA(
              lang,
              ["How do I apply?", "Create an account", "Browse jobs"],
              ["Comment postuler ?", "Créer un compte", "Parcourir les emplois"],
              ["¿Cómo postular?", "Crear cuenta", "Explorar empleos"]
            ),
            links: [{ label: L(lang, "Learn More", "En savoir plus", "Saber más"), href: "/register?role=job-seeker" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "📸 **Your application snapshots** show exactly what each employer received when you applied.\n\nEvery application captures:\n• Skills at time of submission\n• Professional headline & summary\n• Work experience and education\n• Which resume was selected\n• Timestamp of submission\n\nYour snapshot is **immutable** — it won't change if you later update your profile. This builds trust and transparency with employers.\n\nTo view any snapshot, go to your **Dashboard** and click **View Submission** next to an application.",
              "📸 **Vos instantanés de candidature** montrent exactement ce que chaque employeur a reçu lors de votre candidature.\n\nChaque candidature capture :\n• Compétences au moment de la soumission\n• Titre et résumé professionnel\n• Expérience professionnelle et formation\n• Le CV sélectionné\n• Horodatage de la soumission\n\nVotre instantané est **immuable**. Pour consulter un instantané, allez sur votre **Tableau de bord** et cliquez sur **Voir la soumission**.",
              "📸 **Tus instantáneos de solicitud** muestran exactamente lo que cada empleador recibió cuando postulaste.\n\nCada solicitud captura:\n• Habilidades al momento del envío\n• Título y resumen profesional\n• Experiencia laboral y educación\n• El CV seleccionado\n• Marca de tiempo del envío\n\nTu instantáneo es **inmutable**. Para ver cualquier instantáneo, ve a tu **Panel** y haz clic en **Ver envío**."
            ),
            suggestions: LA(
              lang,
              ["View my dashboard", "Browse jobs", "Update my profile"],
              ["Voir mon tableau de bord", "Parcourir les emplois", "Mettre à jour mon profil"],
              ["Ver mi panel", "Explorar empleos", "Actualizar mi perfil"]
            ),
            links: [{ label: L(lang, "Go to Dashboard", "Aller au tableau de bord", "Ir al panel"), href: "/dashboard" }],
          };
        }
        break;
      }

      case "notifications": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "Notifications keep you updated on your job applications and hiring activity. Sign in to see yours.",
              "Les notifications vous tiennent informé de vos candidatures et de l'activité de recrutement. Connectez-vous pour voir les vôtres.",
              "Las notificaciones te mantienen al día sobre tus solicitudes y la actividad de contratación. Inicia sesión para ver las tuyas."
            ),
            suggestions: LA(
              lang,
              ["Sign in", "Create an account"],
              ["Se connecter", "Créer un compte"],
              ["Iniciar sesión", "Crear cuenta"]
            ),
            links: [{ label: L(lang, "Sign In", "Se connecter", "Iniciar sesión"), href: "/login" }],
          };
        } else {
          const unread = await db.notification.count({ where: { userId, read: false } });
          const notificationsHref = userRole === "EMPLOYER" ? "/employer/notifications" : "/notifications";

          response = {
            reply: unread > 0
              ? L(
                  lang,
                  `You have **${unread} unread notification${unread !== 1 ? "s" : ""}**! Check your notifications for the latest updates on your applications and hiring activity.`,
                  `Vous avez **${unread} notification${unread !== 1 ? "s" : ""}** non lue${unread !== 1 ? "s" : ""} ! Consultez vos notifications pour les dernières mises à jour.`,
                  `¡Tienes **${unread} notificación${unread !== 1 ? "es" : ""}** sin leer! Revisa tus notificaciones para las últimas actualizaciones.`
                )
              : L(
                  lang,
                  "You have no unread notifications. Notifications appear when you apply to a job, your application status changes, or an interview is scheduled.",
                  "Vous n'avez aucune notification non lue. Les notifications apparaissent lorsque vous postulez à un emploi, que le statut de votre candidature change ou qu'une entrevue est planifiée.",
                  "No tienes notificaciones sin leer. Las notificaciones aparecen cuando postulas a un empleo, el estado de tu solicitud cambia o se programa una entrevista."
                ),
            suggestions: LA(
              lang,
              ["View notifications", "Track my applications", "Browse jobs"],
              ["Voir les notifications", "Suivre mes candidatures", "Parcourir les emplois"],
              ["Ver notificaciones", "Seguir mis solicitudes", "Explorar empleos"]
            ),
            links: [{ label: L(lang, "View Notifications", "Voir les notifications", "Ver notificaciones"), href: notificationsHref }],
          };
        }
        break;
      }

      case "bias": {
        response = {
          reply: L(
            lang,
            "**How anonymous hiring works on Equalhires:**\n\n🛡️ **Hidden from employers:**\n• Your name and photo\n• School and university names\n• Employment dates and company names\n• Phone number\n\n👀 **Visible to employers:**\n• Your skills and years of experience\n• Job title and role description\n• Duration of each role\n• Degree type and field\n\n🔓 **When your identity is revealed:**\nOnly when an employer schedules an interview with you — never before.",
            "**Comment fonctionne le recrutement anonyme sur Equalhires :**\n\n🛡️ **Caché aux employeurs :**\n• Votre nom et photo\n• Noms des écoles et universités\n• Dates d'emploi et noms d'entreprises\n• Numéro de téléphone\n\n👀 **Visible pour les employeurs :**\n• Vos compétences et années d'expérience\n• Titre et description du poste\n• Durée de chaque rôle\n• Type et domaine du diplôme\n\n🔓 **Quand votre identité est révélée :**\nUniquement lorsqu'un employeur planifie une entrevue avec vous — jamais avant.",
            "**Cómo funciona la contratación anónima en Equalhires:**\n\n🛡️ **Oculto para los empleadores:**\n• Tu nombre y foto\n• Nombres de escuelas y universidades\n• Fechas de empleo y nombres de empresas\n• Número de teléfono\n\n👀 **Visible para los empleadores:**\n• Tus habilidades y años de experiencia\n• Título y descripción del puesto\n• Duración de cada puesto\n• Tipo y campo del título universitario\n\n🔓 **Cuándo se revela tu identidad:**\nSolo cuando un empleador programa una entrevista contigo — nunca antes."
          ),
          suggestions: LA(
            lang,
            ["Create an account", "How does interview reveal work?", "Browse jobs", "How does it work?"],
            ["Créer un compte", "Comment fonctionne la révélation en entrevue ?", "Parcourir les emplois", "Comment ça fonctionne ?"],
            ["Crear cuenta", "¿Cómo funciona la revelación en entrevista?", "Explorar empleos", "¿Cómo funciona?"]
          ),
          links: [{ label: L(lang, "Learn More", "En savoir plus", "Saber más"), href: "/#how-it-works" }],
        };
        break;
      }

      case "certifications": {
        response = {
          reply: L(
            lang,
            "You can add **multiple certifications** to your profile — there's no limit!\n\nEach certification includes:\n• Certificate name (e.g. AWS Solutions Architect)\n• Issuing organization (e.g. Amazon Web Services)\n• Date obtained\n• Expiry date (if applicable)\n\nCertifications are **always visible** to recruiters — they're not masked. Use the **+ Add** button in the Certifications section of your profile.",
            "Vous pouvez ajouter **plusieurs certifications** à votre profil — il n'y a pas de limite !\n\nChaque certification comprend :\n• Nom du certificat (ex. AWS Solutions Architect)\n• Organisation émettrice (ex. Amazon Web Services)\n• Date d'obtention\n• Date d'expiration (si applicable)\n\nLes certifications sont **toujours visibles** pour les recruteurs — elles ne sont pas masquées.",
            "Puedes agregar **múltiples certificaciones** a tu perfil — ¡sin límite!\n\nCada certificación incluye:\n• Nombre del certificado (ej. AWS Solutions Architect)\n• Organización emisora (ej. Amazon Web Services)\n• Fecha obtenida\n• Fecha de vencimiento (si aplica)\n\nLas certificaciones son **siempre visibles** para los reclutadores — no están enmascaradas."
          ),
          suggestions: LA(
            lang,
            ["Edit my profile", "How does masking work?", "Track my applications"],
            ["Modifier mon profil", "Comment fonctionne le masquage ?", "Suivre mes candidatures"],
            ["Editar mi perfil", "¿Cómo funciona el enmascaramiento?", "Seguir mis solicitudes"]
          ),
          links: [{ label: L(lang, "Edit Profile", "Modifier le profil", "Editar perfil"), href: "/profile" }],
        };
        break;
      }

      case "salary": {
        if (userRole === "EMPLOYER") {
          response = {
            reply: L(
              lang,
              "When posting a job, you can set a salary range (min and max). The system validates that **minimum ≤ maximum** — if you enter an invalid range, you'll see an error before the job can be submitted.\n\nShowing a salary range improves application quality and reduces time-to-hire.",
              "Lors de la publication d'un emploi, vous pouvez définir une fourchette salariale (min et max). Le système valide que **minimum ≤ maximum**.\n\nAfficher une fourchette salariale améliore la qualité des candidatures et réduit le délai de recrutement.",
              "Al publicar un empleo, puedes establecer un rango salarial (mín y máx). El sistema valida que **mínimo ≤ máximo**.\n\nMostrar un rango salarial mejora la calidad de las solicitudes y reduce el tiempo de contratación."
            ),
            suggestions: LA(
              lang,
              ["Post a job", "View my applicants"],
              ["Publier un emploi", "Voir mes candidats"],
              ["Publicar empleo", "Ver mis candidatos"]
            ),
            links: [{ label: L(lang, "Post a Job", "Publier un emploi", "Publicar empleo"), href: "/employer/post-job" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "You can set your **salary expectations** in your profile under Job Preferences:\n• Minimum expected salary\n• Maximum expected salary\n\nThis is visible to recruiters (not masked) and helps match you to jobs within your range.",
              "Vous pouvez définir vos **attentes salariales** dans votre profil sous Préférences d'emploi :\n• Salaire minimum attendu\n• Salaire maximum attendu\n\nCela est visible pour les recruteurs (non masqué) et aide à vous associer à des emplois dans votre fourchette.",
              "Puedes establecer tus **expectativas salariales** en tu perfil bajo Preferencias de empleo:\n• Salario mínimo esperado\n• Salario máximo esperado\n\nEsto es visible para los reclutadores (no enmascarado) y ayuda a emparejarte con empleos dentro de tu rango."
            ),
            suggestions: LA(
              lang,
              ["Edit my profile", "Browse jobs"],
              ["Modifier mon profil", "Parcourir les emplois"],
              ["Editar mi perfil", "Explorar empleos"]
            ),
            links: [{ label: L(lang, "Edit Profile", "Modifier le profil", "Editar perfil"), href: "/profile" }],
          };
        }
        break;
      }

      case "talent": {
        if (!userId || userRole !== "EMPLOYER") {
          response = {
            reply: L(
              lang,
              "The Talent Pool is a feature for employers to browse anonymous candidate profiles and filter by skills, experience, and location.",
              "Le bassin de talents est une fonctionnalité pour les employeurs permettant de parcourir des profils de candidats anonymes et de filtrer par compétences, expérience et lieu.",
              "El grupo de talentos es una función para empleadores para explorar perfiles de candidatos anónimos y filtrar por habilidades, experiencia y ubicación."
            ),
            suggestions: LA(
              lang,
              ["I'm an employer", "How does it work?"],
              ["Je suis un employeur", "Comment ça fonctionne ?"],
              ["Soy empleador", "¿Cómo funciona?"]
            ),
            links: [{ label: L(lang, "Create Employer Account", "Créer un compte employeur", "Crear cuenta de empleador"), href: "/register?role=employer" }],
          };
        } else {
          const seekerCount = await db.jobSeekerProfile.count();
          response = {
            reply: L(
              lang,
              `The **Talent Pool** has **${seekerCount} anonymous candidate profile${seekerCount !== 1 ? "s" : ""}** you can browse and rank.\n\nFilter by:\n• **Skill** (e.g. React, Python)\n• **Location** (e.g. Ontario, Texas)\n• **Min. experience** (years)\n• **Certification** (e.g. AWS, PMP)\n• **Remote only**\n\n⭐ **Rank for a job** — select one of your posted jobs to score and sort every candidate by match percentage. Matched skills are highlighted green; missing skills shown as gaps.`,
              `Le **Bassin de talents** contient **${seekerCount} profil${seekerCount !== 1 ? "s" : ""} anonyme${seekerCount !== 1 ? "s" : ""}** que vous pouvez parcourir et classer.\n\nFiltrez par :\n• **Compétence** (ex. React, Python)\n• **Lieu** (ex. Ontario, Texas)\n• **Expérience min.** (années)\n• **Certification** (ex. AWS, PMP)\n• **Télétravail uniquement**\n\n⭐ **Classer pour un emploi** — sélectionnez un de vos postes pour noter et trier les candidats par pourcentage de correspondance.`,
              `El **Grupo de talentos** tiene **${seekerCount} perfil${seekerCount !== 1 ? "es" : ""}** anónimo${seekerCount !== 1 ? "s" : ""} que puedes explorar y clasificar.\n\nFiltra por:\n• **Habilidad** (ej. React, Python)\n• **Ubicación** (ej. Ontario, Texas)\n• **Experiencia mín.** (años)\n• **Certificación** (ej. AWS, PMP)\n• **Solo remoto**\n\n⭐ **Clasificar por empleo** — selecciona uno de tus puestos para puntuar y ordenar candidatos por porcentaje de coincidencia.`
            ),
            suggestions: LA(
              lang,
              ["Browse talent", "Post a job", "View my applicants"],
              ["Parcourir les talents", "Publier un emploi", "Voir mes candidats"],
              ["Explorar talentos", "Publicar empleo", "Ver mis candidatos"]
            ),
            links: [{ label: L(lang, "Browse Talent Pool", "Parcourir le bassin de talents", "Explorar grupo de talentos"), href: "/employer/talent" }],
          };
        }
        break;
      }

      case "location": {
        response = {
          reply: L(
            lang,
            "Location selection now supports **Country → State/Province**:\n\n🇨🇦 **Canada** → all provinces & territories\n🇺🇸 **United States** → all 50 states + D.C.\n🇲🇽 **Mexico** → all 31 states + CDMX\n🌐 **Remote** → no state required\n\nYou can set your preferred location in your **profile**, and recruiters set job locations when **posting a job**.",
            "La sélection de lieu prend désormais en charge **Pays → Province/État** :\n\n🇨🇦 **Canada** → toutes les provinces et territoires\n🇺🇸 **États-Unis** → les 50 États + D.C.\n🇲🇽 **Mexique** → les 31 États + CDMX\n🌐 **Télétravail** → aucun État requis\n\nVous pouvez définir votre lieu préféré dans votre **profil**, et les recruteurs définissent les lieux d'emploi lors de la **publication d'un emploi**.",
            "La selección de ubicación ahora admite **País → Estado/Provincia**:\n\n🇨🇦 **Canadá** → todas las provincias y territorios\n🇺🇸 **Estados Unidos** → los 50 estados + D.C.\n🇲🇽 **México** → los 31 estados + CDMX\n🌐 **Remoto** → no se requiere estado\n\nPuedes establecer tu ubicación preferida en tu **perfil**, y los reclutadores establecen las ubicaciones al **publicar un empleo**."
          ),
          suggestions: LA(
            lang,
            ["Edit my profile", "Browse jobs", "How does it work?"],
            ["Modifier mon profil", "Parcourir les emplois", "Comment ça fonctionne ?"],
            ["Editar mi perfil", "Explorar empleos", "¿Cómo funciona?"]
          ),
          links: [{ label: L(lang, "Edit Profile", "Modifier le profil", "Editar perfil"), href: "/profile" }],
        };
        break;
      }

      case "employer": {
        if (!userId) {
          response = {
            reply: L(
              lang,
              "As an employer on Equalhires, you can:\n\n• **Post jobs** — describe the role and required skills\n• **Review anonymous candidates** — evaluated on skills only\n• **Shortlist fairly** — no unconscious bias\n• **Schedule interviews** — candidate identity is revealed automatically\n\nCompanies using anonymous hiring report **3× more diverse shortlists**.",
              "En tant qu'employeur sur Equalhires, vous pouvez :\n\n• **Publier des emplois** — décrire le poste et les compétences requises\n• **Examiner des candidats anonymes** — évalués sur les compétences uniquement\n• **Présélectionner équitablement** — sans biais inconscient\n• **Planifier des entrevues** — l'identité du candidat est révélée automatiquement\n\nLes entreprises utilisant le recrutement anonyme rapportent **3× plus de listes diversifiées**.",
              "Como empleador en Equalhires, puedes:\n\n• **Publicar empleos** — describir el puesto y habilidades requeridas\n• **Revisar candidatos anónimos** — evaluados solo por habilidades\n• **Preseleccionar justamente** — sin sesgo inconsciente\n• **Programar entrevistas** — la identidad del candidato se revela automáticamente\n\nLas empresas que usan contratación anónima reportan **3× más listas diversas**."
            ),
            suggestions: LA(
              lang,
              ["Create employer account", "How does screening work?", "Browse open jobs"],
              ["Créer un compte employeur", "Comment fonctionne la présélection ?", "Parcourir les emplois ouverts"],
              ["Crear cuenta de empleador", "¿Cómo funciona la selección?", "Explorar empleos abiertos"]
            ),
            links: [{ label: L(lang, "Start Hiring", "Commencer à recruter", "Empezar a contratar"), href: "/register?role=employer" }],
          };
        } else if (userRole === "EMPLOYER") {
          response = {
            reply: L(
              lang,
              "You're logged in as an employer. Here's what you can do:\n\n• **Post a new job** to attract qualified candidates\n• **Review applicants** anonymously on your dashboard\n• **Schedule interviews** when you find a match\n• Check **notifications** for new applications",
              "Vous êtes connecté en tant qu'employeur. Voici ce que vous pouvez faire :\n\n• **Publier un nouvel emploi** pour attirer des candidats qualifiés\n• **Examiner les candidats** anonymement sur votre tableau de bord\n• **Planifier des entrevues** lorsque vous trouvez un match\n• Vérifier **les notifications** pour les nouvelles candidatures",
              "Estás conectado como empleador. Esto es lo que puedes hacer:\n\n• **Publicar un nuevo empleo** para atraer candidatos calificados\n• **Revisar candidatos** de forma anónima en tu panel\n• **Programar entrevistas** cuando encuentres una coincidencia\n• Revisar **notificaciones** para nuevas solicitudes"
            ),
            suggestions: LA(
              lang,
              ["Post a job", "View applicants", "View notifications"],
              ["Publier un emploi", "Voir les candidats", "Voir les notifications"],
              ["Publicar empleo", "Ver candidatos", "Ver notificaciones"]
            ),
            links: [
              { label: L(lang, "Post a Job", "Publier un emploi", "Publicar empleo"), href: "/employer/post-job" },
              { label: L(lang, "View Applicants", "Voir les candidats", "Ver candidatos"), href: "/employer/applicants" },
            ],
          };
        } else {
          response = {
            reply: L(
              lang,
              "Employer accounts are for companies and recruiters looking to hire. You're currently logged in as a job seeker. If you need an employer account, you can create a separate one.",
              "Les comptes employeur sont destinés aux entreprises et aux recruteurs. Vous êtes actuellement connecté en tant que chercheur d'emploi. Si vous avez besoin d'un compte employeur, vous pouvez en créer un séparément.",
              "Las cuentas de empleador son para empresas y reclutadores que buscan contratar. Actualmente estás conectado como candidato. Si necesitas una cuenta de empleador, puedes crear una por separado."
            ),
            suggestions: LA(
              lang,
              ["Browse jobs", "Track my applications", "How does it work?"],
              ["Parcourir les emplois", "Suivre mes candidatures", "Comment ça fonctionne ?"],
              ["Explorar empleos", "Seguir mis solicitudes", "¿Cómo funciona?"]
            ),
            links: [{ label: L(lang, "Create Employer Account", "Créer un compte employeur", "Crear cuenta de empleador"), href: "/register?role=employer" }],
          };
        }
        break;
      }

      case "navigation": {
        let navMap: string;
        if (userId && userRole === "JOB_SEEKER") {
          navMap = L(
            lang,
            "• **Dashboard** → /dashboard — track your applications + view submission links\n• **Browse Jobs** → /jobs — find and apply; click any card to open detail panel\n• **Profile** → /profile — manage skills (auto-suggest), experience, education, resumes\n• **Submission View** → /applications/[id] — immutable snapshot of each submitted application\n• **Company Reviews** → /reviews — read and write company reviews\n• **Notifications** → /notifications — application updates\n• **Settings** → /settings — account preferences",
            "• **Tableau de bord** → /dashboard — suivre vos candidatures + liens de soumission\n• **Parcourir les emplois** → /jobs — trouver et postuler\n• **Profil** → /profile — gérer les compétences (suggestion auto), expérience, formation, CVs\n• **Vue de soumission** → /applications/[id] — instantané immuable de chaque candidature\n• **Avis d'entreprises** → /reviews — lire et écrire des avis\n• **Notifications** → /notifications — mises à jour des candidatures\n• **Paramètres** → /settings — préférences du compte",
            "• **Panel** → /dashboard — seguir tus solicitudes + enlaces de envío\n• **Explorar empleos** → /jobs — encontrar y postular\n• **Perfil** → /profile — gestionar habilidades (autocompletado), experiencia, educación, CVs\n• **Vista de envío** → /applications/[id] — instantáneo inmutable de cada solicitud\n• **Reseñas de empresas** → /reviews — leer y escribir reseñas\n• **Notificaciones** → /notifications — actualizaciones de solicitudes\n• **Configuración** → /settings — preferencias de cuenta"
          );
        } else if (userId && userRole === "EMPLOYER") {
          navMap = L(
            lang,
            "• **Dashboard** → /employer/dashboard — your hiring overview\n• **Post a Job** → /employer/post-job — create a listing\n• **Applicants** → /employer/applicants — review candidates\n• **Company Reviews** → /reviews — see what candidates say about companies\n• **Notifications** → /employer/notifications — new application alerts",
            "• **Tableau de bord** → /employer/dashboard — aperçu du recrutement\n• **Publier un emploi** → /employer/post-job — créer une offre\n• **Candidats** → /employer/applicants — examiner les candidats\n• **Avis d'entreprises** → /reviews — voir ce que les candidats disent\n• **Notifications** → /employer/notifications — alertes de nouvelles candidatures",
            "• **Panel** → /employer/dashboard — resumen de contratación\n• **Publicar empleo** → /employer/post-job — crear una oferta\n• **Candidatos** → /employer/applicants — revisar candidatos\n• **Reseñas de empresas** → /reviews — ver lo que dicen los candidatos\n• **Notificaciones** → /employer/notifications — alertas de nuevas solicitudes"
          );
        } else {
          navMap = L(
            lang,
            "• **Home** → / — platform overview and latest jobs\n• **Browse Jobs** → /jobs — explore open positions\n• **Company Reviews** → /reviews — read reviews from job seekers\n• **Sign In** → /login — access your account\n• **Register** → /register — create a new account",
            "• **Accueil** → / — aperçu de la plateforme et derniers emplois\n• **Parcourir les emplois** → /jobs — explorer les postes ouverts\n• **Avis d'entreprises** → /reviews — lire les avis des chercheurs d'emploi\n• **Connexion** → /login — accéder à votre compte\n• **Inscription** → /register — créer un nouveau compte",
            "• **Inicio** → / — resumen de la plataforma y últimos empleos\n• **Explorar empleos** → /jobs — explorar puestos abiertos\n• **Reseñas de empresas** → /reviews — leer reseñas de candidatos\n• **Iniciar sesión** → /login — acceder a tu cuenta\n• **Registro** → /register — crear una nueva cuenta"
          );
        }

        response = {
          reply: `${L(lang, "Here's how to navigate the platform:", "Voici comment naviguer sur la plateforme :", "Así es cómo navegar por la plataforma:")}\n\n${navMap}`,
          suggestions: userId
            ? LA(
                lang,
                ["Track my applications", "Browse jobs", "View notifications"],
                ["Suivre mes candidatures", "Parcourir les emplois", "Voir les notifications"],
                ["Seguir mis solicitudes", "Explorar empleos", "Ver notificaciones"]
              )
            : LA(
                lang,
                ["Sign in", "Create an account", "Browse jobs"],
                ["Se connecter", "Créer un compte", "Parcourir les emplois"],
                ["Iniciar sesión", "Crear cuenta", "Explorar empleos"]
              ),
        };
        break;
      }

      case "help": {
        response = {
          reply: L(
            lang,
            "Need help? Here are some resources:\n\n• **FAQ section** — common questions on the homepage\n• **Contact us** — reach our team directly\n• **This assistant** — ask me anything about the platform!\n\nI can help with job searching, applications, your profile, resume uploads, and more.",
            "Besoin d'aide ? Voici quelques ressources :\n\n• **Section FAQ** — questions fréquentes\n• **Contactez-nous** — rejoignez notre équipe directement\n• **Cet assistant** — posez-moi n'importe quelle question sur la plateforme !\n\nJe peux vous aider avec la recherche d'emploi, les candidatures, votre profil, le téléchargement de CV, et plus encore.",
            "¿Necesitas ayuda? Aquí hay algunos recursos:\n\n• **Sección FAQ** — preguntas frecuentes\n• **Contáctanos** — comunícate directamente con nuestro equipo\n• **Este asistente** — ¡pregúntame cualquier cosa sobre la plataforma!\n\nPuedo ayudarte con búsqueda de empleo, solicitudes, tu perfil, subida de CV, y más."
          ),
          suggestions: LA(
            lang,
            ["How does it work?", "Track my applications", "Find jobs"],
            ["Comment ça fonctionne ?", "Suivre mes candidatures", "Trouver des emplois"],
            ["¿Cómo funciona?", "Seguir mis solicitudes", "Buscar empleos"]
          ),
          links: [
            { label: "FAQ", href: "/#faq" },
            { label: L(lang, "Contact Us", "Contactez-nous", "Contáctenos"), href: "/contact" },
          ],
        };
        break;
      }

      case "account": {
        if (userId) {
          response = {
            reply: L(
              lang,
              "You're already signed in! You can manage your account settings, change your password, and update preferences from the Settings page.",
              "Vous êtes déjà connecté ! Vous pouvez gérer les paramètres de votre compte, changer votre mot de passe et mettre à jour vos préférences depuis la page Paramètres.",
              "¡Ya estás conectado! Puedes gestionar la configuración de tu cuenta, cambiar tu contraseña y actualizar preferencias desde la página de Configuración."
            ),
            suggestions: LA(
              lang,
              ["Go to settings", "Edit my profile", "Track my applications"],
              ["Aller aux paramètres", "Modifier mon profil", "Suivre mes candidatures"],
              ["Ir a configuración", "Editar mi perfil", "Seguir mis solicitudes"]
            ),
            links: [{ label: L(lang, "Account Settings", "Paramètres du compte", "Configuración de cuenta"), href: "/settings" }],
          };
        } else {
          response = {
            reply: L(
              lang,
              "To get started on Equalhires:\n\n👤 **Job Seeker** — free account to apply to jobs anonymously\n🏢 **Employer** — post jobs and review bias-free applications\n\nAlready have an account? Sign in to continue.",
              "Pour commencer sur Equalhires :\n\n👤 **Chercheur d'emploi** — compte gratuit pour postuler anonymement\n🏢 **Employeur** — publier des emplois et examiner des candidatures sans biais\n\nVous avez déjà un compte ? Connectez-vous pour continuer.",
              "Para comenzar en Equalhires:\n\n👤 **Candidato** — cuenta gratuita para postular de forma anónima\n🏢 **Empleador** — publicar empleos y revisar solicitudes sin sesgo\n\n¿Ya tienes cuenta? Inicia sesión para continuar."
            ),
            suggestions: LA(
              lang,
              ["Create job seeker account", "Create employer account", "Sign in"],
              ["Créer un compte chercheur d'emploi", "Créer un compte employeur", "Se connecter"],
              ["Crear cuenta de candidato", "Crear cuenta de empleador", "Iniciar sesión"]
            ),
            links: [
              { label: L(lang, "Sign In", "Se connecter", "Iniciar sesión"), href: "/login" },
              { label: L(lang, "Create Account", "Créer un compte", "Crear cuenta"), href: "/register" },
            ],
          };
        }
        break;
      }

      default: {
        response = {
          reply: L(
            lang,
            "I'm not sure I understood that. I can help with:\n\n• Finding and applying to jobs\n• Tracking your applications\n• Understanding anonymous hiring\n• Profile and resume help\n• Navigation guidance\n• Interview information\n\nWhat would you like to know?",
            "Je ne suis pas sûr d'avoir compris. Je peux vous aider avec :\n\n• Trouver et postuler à des emplois\n• Suivre vos candidatures\n• Comprendre le recrutement anonyme\n• Aide pour le profil et le CV\n• Navigation sur la plateforme\n• Informations sur les entrevues\n\nQue souhaitez-vous savoir ?",
            "No estoy seguro de haber entendido. Puedo ayudarte con:\n\n• Encontrar y postular a empleos\n• Seguir tus solicitudes\n• Entender la contratación anónima\n• Ayuda con perfil y CV\n• Navegación por la plataforma\n• Información sobre entrevistas\n\n¿Qué te gustaría saber?"
          ),
          suggestions: LA(
            lang,
            ["Find jobs", "Track my applications", "How does it work?", "Update my profile"],
            ["Trouver des emplois", "Suivre mes candidatures", "Comment ça fonctionne ?", "Mettre à jour mon profil"],
            ["Buscar empleos", "Seguir mis solicitudes", "¿Cómo funciona?", "Actualizar mi perfil"]
          ),
        };
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json<ChatResponse>({
      reply: "Something went wrong. Please try again in a moment.",
      suggestions: ["How does it work?", "Find jobs", "Track my applications"],
    });
  }
}
