// Central translation dictionary.
//
// To add a new language:
//   1. Add its locale code to `locales` in astro.config.mjs
//   2. Add a key + full object below (copy the "en" block as a starting point)
//   3. Add it to `localeNames` so the language switcher shows a nice label
//
// Every page pulls its strings from here via `getTranslations(locale)`,
// so there is exactly one place to edit copy per language.

export const locales = ['en', 'fr', 'ja', 'es', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  ja: '日本語',
  es: 'ES',
  zh: '中文',
};

export const localeHtmlLang: Record<Locale, string> = {
  en: 'en',
  fr: 'fr',
  ja: 'ja',
  es: 'es',
  zh: 'zh-Hans',
};

type Dictionary = {
  nav: {
    work: string;
    studio: string;
    about: string;
    privateView: string;
    contact: string;
  };
  footer: {
    tagline: string;
    inquiries: string;
    privateView: string;
    instagram: string;
    rights: string;
  };
  home: {
    exhibitionLabel: string;
    exhibitionTitle: string;
    exhibitionSubtitle: string;
    flowCta: string;
    formTitle: string;
    formSubtitle: string;
    formCta: string;
    flightTitle: string;
    flightSubtitle: string;
    flightCta: string;
    worldTitle: string;
    worldSubtitle: string;
    worldCta: string;
    scrollCue: string;
    workLabel: string;
    workTitle: string;
    workBody: string;
    studioLabel: string;
    studioTitle: string;
    studioBody: string;
    studioCta: string;
    collectorsLabel: string;
    collectorsTitle: string;
    collectorsBody: string;
    collectorsCta: string;
  };
  work: {
    title: string;
    titleLabel: string;
    intro: string;
    viewSeries: string;
    viewImage: string;
    backToSeries: string;
    dimensions: string;
    edition: string;
    printType: string;
    imageCount: string;
    notSpecified: string;
    close: string;
    previous: string;
    next: string;
  };
  studio: {
    title: string;
    intro: string;
    body: string;
    processIntro: string[];
    tonalCaption: string;
    archivalNote: string;
    mattingCaption: string;
    veniceCaption: string;
    scaleCaption: string;
  };
  about: {
    title: string;
    intro: string;
    body: string;
  };
  contact: {
    title: string;
    intro: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    note: string;
  };
  privateView: {
    title: string;
    intro: string;
    passwordLabel: string;
    submit: string;
    error: string;
    welcomeTitle: string;
    welcomeBody: string;
    requestNameLabel: string;
    requestEmailLabel: string;
    requestDateLabel: string;
    requestTimeLabel: string;
    requestMessageLabel: string;
    collectionLabel: string;
    collectionPlaceholder: string;
    requestSubmit: string;
    requestNote: string;
  };
};

export const translations: Record<Locale, Dictionary> = {
  en: {
    nav: {
      work: 'Work',
      studio: 'Studio',
      about: 'About',
      privateView: 'Private View',
      contact: 'Contact',
    },
    footer: {
      tagline: 'Monochrome works shaped by light, form, and the forces of nature.',
      inquiries: 'Inquiries',
      privateView: 'Private View',
      instagram: 'Instagram',
      rights: 'Talmon de l’Armée',
    },
    home: {
      exhibitionLabel: 'New Exhibition',
      exhibitionTitle: 'FLOW',
      exhibitionSubtitle: 'Studies of the Ancient Sea',
      flowCta: 'View the FLOW Collection',
      formTitle: 'FORM',
      formSubtitle: 'Human figure and the elemental forces of the desert.',
      formCta: 'View the FORM Collection',
      flightTitle: 'FLIGHT',
      flightSubtitle: 'Distance simplifies. Altitude edits.',
      flightCta: 'View the FLIGHT Collection',
      worldTitle: 'WORLD',
      worldSubtitle: 'Infinite space. Improbable life. One fleeting moment.',
      worldCta: 'View the WORLD Collection',
      scrollCue: 'Scroll to Explore',
      workLabel: 'The Work',
      workTitle: 'Monochrome works shaped\nby light, form, and the forces\nof nature.',
      workBody:
        'Talmon de l’Armée’s photographs require time.\nAcross his body of work, human presence is often implied rather than asserted, set within expansive environments that emphasize duration, distance, and restraint. The images resist immediacy, inviting slow looking and repeated engagement, qualities central to the tradition of fine-art black-and-white photography.',
      studioLabel: 'Inside the Studio',
      studioTitle: 'The image is the idea the print is the performance.',
      studioBody:
        'Enter the darkroom, see test prints on the wall, and follow the decisions that bring an image into its final form.',
      studioCta: 'Visit the Studio',
      collectorsLabel: 'For Collectors',
      collectorsTitle: 'A private viewing,\nin your own time.',
      collectorsBody:
        'Invited collectors may enter a quiet viewing room for advance work, edition details, price reveals, and artist Q&A invitations.',
      collectorsCta: 'Enter Private View',
    },
    work: {
      title: 'The Work',
      titleLabel: 'Title',
      intro: 'Collections, presented in full.',
      viewSeries: 'View Series',
      viewImage: 'View larger',
      backToSeries: 'Back to series',
      dimensions: 'Image Size(s)',
      edition: 'Edition Size(s)',
      printType: 'Print Type',
      imageCount: 'Image {current} of {total}',
      notSpecified: 'Not specified',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
    },
    studio: {
      title: 'Inside the Studio',
      intro: 'The image is the idea the print is the performance.',
      body: 'From exposure to final print, every image passes through a deliberate, hands-on process—test strips, dodge and burn, and a final signature on the mount.',
      processIntro: [
        'My process begins with questions about the life we are living. Why are we here? What am I looking at? Am I truly seeing?',
        'I search for the fraction of time when those questions become visible, when a human figure, a landscape, light, and time briefly come into alignment. The moment passes, but the photograph allows us to remain inside it.',
        'My work is for people who look deeply into that fraction of time, not for an immediate answer, but for what it might reveal about our relationship with nature, the Earth, and the universe we inhabit. Are we the universe trying to understand itself? Perhaps. These collections are an invitation to slow down and observe the moment.',
        'With that said, let’s tour the studio and my process of getting from idea to the print.',
      ],
      tonalCaption: 'Working out the tonal values.',
      archivalNote: 'Each photograph is produced as a museum-grade, fibre-based silver-gelatin print, chosen for its deep blacks, luminous highlights, and exceptional tonal range. Archival processing, conservation mounting, and museum-quality framing preserve the print’s tonal integrity and physical presence for generations.',
      mattingCaption: 'Archival matting, backing and framing.',
      veniceCaption: 'FLOW — Venice, Italy.',
      scaleCaption: 'Testing scale variations.',
    },
    about: {
      title: 'About',
      intro: 'Talmon de l’Armée',
      body: 'A photographer working exclusively in black and white, drawn to the point where landscape, weather, and the human figure meet. Prints are made and finished by hand in a dedicated studio.',
    },
    contact: {
      title: 'Contact',
      intro: 'For inquiries regarding limited edition prints, commissions, or press.',
      nameLabel: 'Name',
      emailLabel: 'Email',
      messageLabel: 'Message',
      submit: 'Send Inquiry',
      sending: 'Sending…',
      success: 'Thank you. Your inquiry has been sent.',
      error: 'Your message could not be sent. Please try again.',
      note: 'Replies typically arrive within two to three business days.',
    },
    privateView: {
      title: 'Private View',
      intro: 'To arrange a private viewing, suggest a time in the form.',
      passwordLabel: 'Password',
      submit: 'Enter',
      error: 'That password wasn’t recognized. Please check your invitation and try again.',
      welcomeTitle: 'Welcome',
      welcomeBody: 'Advance work, edition details, and price reveals for invited collectors will appear here.',
      requestNameLabel: 'Name',
      requestEmailLabel: 'Email',
      requestDateLabel: 'Preferred date',
      requestTimeLabel: 'Preferred time',
      requestMessageLabel: 'Message',
      collectionLabel: 'Interested Collection',
      collectionPlaceholder: 'Select a collection',
      requestSubmit: 'Request viewing',
      requestNote: 'I will confirm the viewing time by email.',
    },
  },
  fr: {
    nav: {
      work: 'Œuvres',
      studio: 'Atelier',
      about: 'À propos',
      privateView: 'Visite privée',
      contact: 'Contact',
    },
    footer: {
      tagline: 'Œuvres monochromes façonnées par la lumière, la forme et les forces de la nature.',
      inquiries: 'Demandes',
      privateView: 'Visite privée',
      instagram: 'Instagram',
      rights: 'Talmon de l’Armée',
    },
    home: {
      exhibitionLabel: 'Nouvelle exposition',
      exhibitionTitle: 'FLOW',
      exhibitionSubtitle: 'Figures de vent, de volonté et de devenir.',
      flowCta: 'Voir la collection FLOW',
      formTitle: 'FORM',
      formSubtitle: 'Human figure and the elemental forces of the desert.',
      formCta: 'Voir la collection FORM',
      flightTitle: 'FLIGHT',
      flightSubtitle: 'Distance simplifies. Altitude edits.',
      flightCta: 'Voir la collection FLIGHT',
      worldTitle: 'WORLD',
      worldSubtitle: 'Espace infini. Vie improbable. Un instant fugace.',
      worldCta: 'Voir la collection WORLD',
      scrollCue: 'Faire défiler pour explorer',
      workLabel: 'L’œuvre',
      workTitle: 'Des œuvres monochromes façonnées\npar la lumière, la forme et les\nforces de la nature.',
      workBody:
        'Les photographies de Talmon de l’Armée demandent du temps. La présence humaine entre dans le paysage discrètement—parfois dissimulée, parfois transformée—tandis que le geste, le tissu et le temps maîtrisent le cadre.',
      studioLabel: 'Dans l’atelier',
      studioTitle: 'La photographie n’est achevée\nque lorsque le tirage l’est.',
      studioBody:
        'Entrez dans la chambre noire, découvrez les essais de tirage sur le mur et suivez les décisions qui donnent à une image sa forme finale.',
      studioCta: 'Visiter l’atelier',
      collectorsLabel: 'Pour les collectionneurs',
      collectorsTitle: 'Une visite privée,\nà votre rythme.',
      collectorsBody:
        'Les collectionneurs invités peuvent accéder à un espace de visite privé pour découvrir en avant-première les œuvres, les détails d’édition, les prix et les invitations aux questions-réponses avec l’artiste.',
      collectorsCta: 'Accéder à la visite privée',
    },
    work: {
      title: 'L’œuvre',
      titleLabel: 'Titre',
      intro: 'Collections, présentées intégralement.',
      viewSeries: 'Voir la série',
      viewImage: 'Agrandir',
      backToSeries: 'Retour à la série',
      dimensions: 'Taille(s) de l’image',
      edition: 'Taille(s) de l’édition',
      printType: 'Type de tirage',
      imageCount: 'Image {current} sur {total}',
      notSpecified: 'Non précisé',
      close: 'Fermer',
      previous: 'Précédent',
      next: 'Suivant',
    },
    studio: {
      title: 'Dans l’atelier',
      intro: 'La photographie n’est achevée que lorsque le tirage l’est.',
      body: 'De la prise de vue au tirage final, chaque image traverse un processus artisanal et délibéré—bandes d’essai, masquage et une signature finale sur le support.',
      processIntro: [
        'Mon processus commence par des questions sur la vie que nous menons. Pourquoi sommes-nous ici ? Qu’est-ce que je regarde ? Est-ce que je vois vraiment ?',
        'Je recherche cette fraction de seconde où ces questions deviennent visibles, lorsque la figure humaine, le paysage, la lumière et le temps s’alignent brièvement. L’instant passe, mais la photographie nous permet d’y demeurer.',
        'Mon travail s’adresse à celles et ceux qui regardent profondément cette fraction de temps, non pour obtenir une réponse immédiate, mais pour découvrir ce qu’elle peut révéler de notre relation à la nature, à la Terre et à l’univers que nous habitons. Sommes-nous l’univers tentant de se comprendre lui-même ? Peut-être. Ces collections invitent à ralentir et à observer l’instant.',
        'Entrons maintenant dans l’atelier pour suivre le chemin qui mène de l’idée au tirage.',
      ],
      tonalCaption: 'Recherche des valeurs tonales.',
      archivalNote: 'Chaque photographie est réalisée sous la forme d’un tirage argentique sur papier baryté de qualité muséale, choisi pour la profondeur de ses noirs, la luminosité de ses hautes lumières et l’étendue exceptionnelle de ses nuances. Le traitement d’archives, le montage de conservation et l’encadrement de qualité muséale préservent l’intégrité tonale et la présence physique du tirage pour les générations futures.',
      mattingCaption: 'Passe-partout, support et encadrement de conservation.',
      veniceCaption: 'FLOW — Venise, Italie.',
      scaleCaption: 'Essais de variations d’échelle.',
    },
    about: {
      title: 'À propos',
      intro: 'Talmon de l’Armée',
      body: 'Un photographe travaillant exclusivement en noir et blanc, attiré par le point de rencontre entre le paysage, le climat et la figure humaine. Les tirages sont réalisés et finis à la main dans un atelier dédié.',
    },
    contact: {
      title: 'Contact',
      intro: 'Pour toute demande concernant les œuvres disponibles, les commandes ou la presse.',
      nameLabel: 'Nom',
      emailLabel: 'E-mail',
      messageLabel: 'Message',
      submit: 'Envoyer',
      sending: 'Envoi en cours…',
      success: 'Merci. Votre message a bien été envoyé.',
      error: 'Votre message n’a pas pu être envoyé. Veuillez réessayer.',
      note: 'Les réponses arrivent généralement sous deux à trois jours ouvrés.',
    },
    privateView: {
      title: 'Visite privée',
      intro: 'Une visite privée, à votre rythme. Saisissez le mot de passe communiqué lors de votre invitation.',
      passwordLabel: 'Mot de passe',
      submit: 'Entrer',
      error: 'Ce mot de passe n’est pas reconnu. Vérifiez votre invitation et réessayez.',
      welcomeTitle: 'Bienvenue',
      welcomeBody: 'Les œuvres en avant-première, les détails d’édition et les prix réservés aux collectionneurs invités apparaîtront ici.',
      requestNameLabel: 'Nom',
      requestEmailLabel: 'E-mail',
      requestDateLabel: 'Date souhaitée',
      requestTimeLabel: 'Heure souhaitée',
      requestMessageLabel: 'Message',
      collectionLabel: 'Collection souhaitée',
      collectionPlaceholder: 'Choisir une collection',
      requestSubmit: 'Demander une visite',
      requestNote: 'Je confirmerai l’heure de la visite par e-mail.',
    },
  },
  es: {
    nav: {
      work: 'Obra',
      studio: 'Estudio',
      about: 'Acerca de',
      privateView: 'Visita privada',
      contact: 'Contacto',
    },
    footer: {
      tagline: 'Obras monocromas modeladas por la luz, la forma y las fuerzas de la naturaleza.',
      inquiries: 'Consultas',
      privateView: 'Visita privada',
      instagram: 'Instagram',
      rights: 'Talmon de l’Armée',
    },
    home: {
      exhibitionLabel: 'Nueva exposición',
      exhibitionTitle: 'FLOW',
      exhibitionSubtitle: 'Estudios del mar ancestral',
      flowCta: 'Ver la colección FLOW',
      formTitle: 'FORM',
      formSubtitle: 'La figura humana y las fuerzas elementales del desierto.',
      formCta: 'Ver la colección FORM',
      flightTitle: 'FLIGHT',
      flightSubtitle: 'La distancia simplifica. La altitud edita.',
      flightCta: 'Ver la colección FLIGHT',
      worldTitle: 'WORLD',
      worldSubtitle: 'Espacio infinito. Vida improbable. Un instante fugaz.',
      worldCta: 'Ver la colección WORLD',
      scrollCue: 'Desplázate para explorar',
      workLabel: 'La obra',
      workTitle: 'Obras monocromas modeladas\npor la luz, la forma y las fuerzas\nde la naturaleza.',
      workBody:
        'Las fotografías de Talmon de l’Armée exigen tiempo. En el conjunto de su obra, la presencia humana suele insinuarse más que afirmarse, situada en espacios abiertos que subrayan la duración, la distancia y la contención. Las imágenes rehúyen la inmediatez e invitan a una mirada lenta y repetida, cualidades esenciales en la tradición de la fotografía artística en blanco y negro.',
      studioLabel: 'Dentro del estudio',
      studioTitle: 'La imagen es la idea;\nla copia es la interpretación.',
      studioBody:
        'Entra en el cuarto oscuro, observa las pruebas en la pared y sigue las decisiones que conducen una imagen hasta su forma definitiva.',
      studioCta: 'Visitar el estudio',
      collectorsLabel: 'Para coleccionistas',
      collectorsTitle: 'Una visita privada,\na tu propio ritmo.',
      collectorsBody:
        'Los coleccionistas invitados pueden acceder a una sala de visita discreta con obras en primicia, información sobre ediciones, precios e invitaciones a encuentros con el artista.',
      collectorsCta: 'Acceder a la visita privada',
    },
    work: {
      title: 'La obra',
      titleLabel: 'Título',
      intro: 'Las colecciones, presentadas en su totalidad.',
      viewSeries: 'Ver la serie',
      viewImage: 'Ampliar',
      backToSeries: 'Volver a la serie',
      dimensions: 'Tamaño(s) de imagen',
      edition: 'Tamaño(s) de edición',
      printType: 'Tipo de copia',
      imageCount: 'Imagen {current} de {total}',
      notSpecified: 'No especificado',
      close: 'Cerrar',
      previous: 'Anterior',
      next: 'Siguiente',
    },
    studio: {
      title: 'Dentro del estudio',
      intro: 'La imagen es la idea; la copia es la interpretación.',
      body: 'Desde la exposición hasta la copia final, cada imagen atraviesa un proceso deliberado y manual: tiras de prueba, reservas y quemados, y una firma final sobre el soporte.',
      processIntro: [
        'Mi proceso comienza con preguntas sobre la vida que estamos viviendo. ¿Por qué estamos aquí? ¿Qué estoy mirando? ¿Estoy viendo de verdad?',
        'Busco esa fracción de tiempo en la que esas preguntas se hacen visibles, cuando una figura humana, un paisaje, la luz y el tiempo se alinean brevemente. El instante pasa, pero la fotografía nos permite permanecer dentro de él.',
        'Mi obra está dirigida a quienes observan profundamente esa fracción de tiempo, no en busca de una respuesta inmediata, sino de lo que puede revelar sobre nuestra relación con la naturaleza, la Tierra y el universo que habitamos. ¿Somos el universo intentando comprenderse a sí mismo? Quizá. Estas colecciones son una invitación a detenerse y observar el momento.',
        'Dicho esto, recorramos el estudio y el proceso que lleva de la idea a la copia final.',
      ],
      tonalCaption: 'Definiendo los valores tonales.',
      archivalNote: 'Cada fotografía se produce como una copia de gelatina de plata sobre papel de fibra de calidad museística, elegida por sus negros profundos, sus altas luces luminosas y su excepcional gama tonal. El procesado de archivo, el montaje de conservación y el enmarcado de calidad museística preservan la integridad tonal y la presencia física de la copia durante generaciones.',
      mattingCaption: 'Paspartú, soporte y enmarcado de conservación.',
      veniceCaption: 'FLOW — Venecia, Italia.',
      scaleCaption: 'Pruebas de variaciones de escala.',
    },
    about: {
      title: 'Acerca de',
      intro: 'Talmon de l’Armée',
      body: 'Fotógrafo dedicado exclusivamente al blanco y negro, atraído por el punto en el que se encuentran el paisaje, el clima y la figura humana. Las copias se realizan y terminan a mano en un estudio especializado.',
    },
    contact: {
      title: 'Contacto',
      intro: 'Para consultas sobre copias de edición limitada, encargos o prensa.',
      nameLabel: 'Nombre',
      emailLabel: 'Correo electrónico',
      messageLabel: 'Mensaje',
      submit: 'Enviar consulta',
      sending: 'Enviando…',
      success: 'Gracias. Tu consulta ha sido enviada.',
      error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      note: 'Las respuestas suelen llegar en un plazo de dos a tres días laborables.',
    },
    privateView: {
      title: 'Visita privada',
      intro: 'Una visita privada, a tu propio ritmo. Introduce la contraseña facilitada con tu invitación.',
      passwordLabel: 'Contraseña',
      submit: 'Entrar',
      error: 'No se reconoce la contraseña. Revisa tu invitación e inténtalo de nuevo.',
      welcomeTitle: 'Bienvenido',
      welcomeBody: 'Aquí aparecerán obras en primicia, información sobre ediciones y precios para coleccionistas invitados.',
      requestNameLabel: 'Nombre',
      requestEmailLabel: 'Correo electrónico',
      requestDateLabel: 'Fecha preferida',
      requestTimeLabel: 'Hora preferida',
      requestMessageLabel: 'Mensaje',
      collectionLabel: 'Colección de interés',
      collectionPlaceholder: 'Selecciona una colección',
      requestSubmit: 'Solicitar una visita',
      requestNote: 'Confirmaré la hora de la visita por correo electrónico.',
    },
  },
  zh: {
    nav: {
      work: '作品',
      studio: '工作室',
      about: '关于',
      privateView: '私人预览',
      contact: '联系',
    },
    footer: {
      tagline: '由光、形态与自然力量塑造的黑白摄影作品。',
      inquiries: '咨询',
      privateView: '私人预览',
      instagram: 'Instagram',
      rights: 'Talmon de l’Armée',
    },
    home: {
      exhibitionLabel: '最新展览',
      exhibitionTitle: 'FLOW',
      exhibitionSubtitle: '远古之海研究',
      flowCta: '查看 FLOW 系列',
      formTitle: 'FORM',
      formSubtitle: '人体与沙漠的自然力量。',
      formCta: '查看 FORM 系列',
      flightTitle: 'FLIGHT',
      flightSubtitle: '距离化繁为简，高度重新剪裁。',
      flightCta: '查看 FLIGHT 系列',
      worldTitle: 'WORLD',
      worldSubtitle: '无垠空间。不可思议的生命。转瞬即逝的一刻。',
      worldCta: '查看 WORLD 系列',
      scrollCue: '向下探索',
      workLabel: '作品',
      workTitle: '由光、形态与自然力量\n塑造的黑白摄影作品。',
      workBody:
        'Talmon de l’Armée 的摄影需要时间去观看。在他的作品中，人的存在往往不是被直接宣告，而是若隐若现地置于广阔环境之中，强调时间、距离与克制。图像拒绝即时消费，邀请观者放慢目光、反复观看——这正是黑白艺术摄影传统的核心品质。',
      studioLabel: '走进工作室',
      studioTitle: '图像是构想，\n成品照片是演绎。',
      studioBody:
        '走进暗房，观看墙上的试印，并了解一幅图像最终成形之前所经历的每一次取舍。',
      studioCta: '参观工作室',
      collectorsLabel: '致收藏家',
      collectorsTitle: '一场属于您的私人预览，\n按自己的节奏欣赏。',
      collectorsBody:
        '受邀收藏家可进入安静的私人预览空间，提前欣赏作品，了解版数与价格，并获得艺术家问答活动邀请。',
      collectorsCta: '进入私人预览',
    },
    work: {
      title: '作品',
      titleLabel: '作品名',
      intro: '完整呈现各个系列。',
      viewSeries: '查看系列',
      viewImage: '放大查看',
      backToSeries: '返回系列',
      dimensions: '图像尺寸',
      edition: '限量版数',
      printType: '印制工艺',
      imageCount: '第 {current} 幅，共 {total} 幅',
      notSpecified: '未注明',
      close: '关闭',
      previous: '上一幅',
      next: '下一幅',
    },
    studio: {
      title: '走进工作室',
      intro: '图像是构想，成品照片是演绎。',
      body: '从曝光到最终成品，每幅图像都经历严谨的手工流程：试条、局部遮挡与加光，以及最后在装裱板上的签名。',
      processIntro: [
        '我的创作过程始于对我们所处生活的追问：我们为何在这里？我正在看什么？我是否真正看见？',
        '我寻找这些问题变得可见的短暂瞬间——人体、风景、光线与时间在那一刻短暂对齐。瞬间会过去，但摄影让我们得以停留其中。',
        '我的作品献给那些愿意凝视这一瞬间的人。它不提供即时答案，而是试图揭示我们与自然、地球以及所处宇宙之间的关系。我们是否是宇宙理解自身的一种方式？也许。这些系列邀请观者慢下来，观察此刻。',
        '现在，让我们走进工作室，看看一幅作品如何从构想走向最终成品。',
      ],
      tonalCaption: '调整影调层次。',
      archivalNote: '每幅作品均采用博物馆级纤维基纸制作银盐照片，以呈现深邃的黑色、明亮的高光与卓越的影调范围。档案级处理、保护性装裱与博物馆级画框可让作品的影调完整性与实体质感世代留存。',
      mattingCaption: '档案级卡纸、背板与装框。',
      veniceCaption: 'FLOW — 意大利威尼斯。',
      scaleCaption: '测试不同的作品尺寸。',
    },
    about: {
      title: '关于',
      intro: 'Talmon de l’Armée',
      body: '一位专注于黑白摄影的艺术家，关注风景、气候与人体相遇的瞬间。每幅作品均在专属工作室中手工印制与完成。',
    },
    contact: {
      title: '联系',
      intro: '如需咨询限量版作品、委托创作或媒体事宜，请在此留言。',
      nameLabel: '姓名',
      emailLabel: '电子邮箱',
      messageLabel: '留言',
      submit: '发送咨询',
      sending: '正在发送…',
      success: '谢谢，您的咨询已发送。',
      error: '消息未能发送，请重试。',
      note: '通常会在两至三个工作日内回复。',
    },
    privateView: {
      title: '私人预览',
      intro: '按自己的节奏进行私人预览。请输入邀请函中提供的密码。',
      passwordLabel: '密码',
      submit: '进入',
      error: '密码无法识别，请核对邀请函后重试。',
      welcomeTitle: '欢迎',
      welcomeBody: '这里将展示面向受邀收藏家的最新作品、版数信息与价格。',
      requestNameLabel: '姓名',
      requestEmailLabel: '电子邮箱',
      requestDateLabel: '首选日期',
      requestTimeLabel: '首选时间',
      requestMessageLabel: '留言',
      collectionLabel: '感兴趣的系列',
      collectionPlaceholder: '请选择一个系列',
      requestSubmit: '预约预览',
      requestNote: '我会通过电子邮件确认预览时间。',
    },
  },
  ja: {
    nav: {
      work: '作品',
      studio: 'スタジオ',
      about: 'プロフィール',
      privateView: 'プライベートビュー',
      contact: 'お問い合わせ',
    },
    footer: {
      tagline: '光、形、自然の力によって形作られたモノクローム作品。',
      inquiries: 'お問い合わせ',
      privateView: 'プライベートビュー',
      instagram: 'Instagram',
      rights: 'Talmon de l’Armée',
    },
    home: {
      exhibitionLabel: '新作展',
      exhibitionTitle: 'FLOW',
      exhibitionSubtitle: '風、意志、して生成の図形。',
      flowCta: 'FLOWコレクションを見る',
      formTitle: 'FORM',
      formSubtitle: 'Human figure and the elemental forces of the desert.',
      formCta: 'FORMコレクションを見る',
      flightTitle: 'FLIGHT',
      flightSubtitle: 'Distance simplifies. Altitude edits.',
      flightCta: 'FLIGHTコレクションを見る',
      worldTitle: 'WORLD',
      worldSubtitle: '無限の空間。ありえない生命。一瞬の時。',
      worldCta: 'WORLDコレクションを見る',
      scrollCue: 'スクロールして見る',
      workLabel: '作品',
      workTitle: '光、形、自然の力によって\n形作られたモノクローム作品。',
      workBody:
        'Talmon de l’Arméeの写真は、見る人に時間を求めます。人間の存在は静かに風景に入り込み—時には隠され、時には変容しながら—所作、布、天候がフレームを支えます。',
      studioLabel: 'スタジオの中',
      studioTitle: '写真は、プリントが\n完成するまで完成しない。',
      studioBody:
        '暗室に入り、壁に貼られたテストプリントをご覧いただき、一枚の画像が最終形態に至るまでの判断をたどってください。',
      studioCta: 'スタジオを見る',
      collectorsLabel: 'コレクターの方へ',
      collectorsTitle: 'ご自身のペースで、\nプライベートな観覧を。',
      collectorsBody:
        '招待されたコレクターの方は、先行公開作品やエディション情報、価格発表、作家とのQ&A招待などを静かなビューイングルームでご覧いただけます。',
      collectorsCta: 'プライベートビューへ',
    },
    work: {
      title: '作品',
      titleLabel: 'タイトル',
      intro: 'コレクションを全体ご覧いただけます。',
      viewSeries: 'シリーズを見る',
      viewImage: '拡大表示',
      backToSeries: 'シリーズに戻る',
      dimensions: '画像サイズ',
      edition: 'エディションサイズ',
      printType: 'プリントタイプ',
      imageCount: '{total}点中{current}点',
      notSpecified: '未指定',
      close: '閉じる',
      previous: '前へ',
      next: '次へ',
    },
    studio: {
      title: 'スタジオの中',
      intro: '写真は、プリントが完成するまで完成しない。',
      body: '露光から最終プリントまで、すべての画像は丁寧な手作業の工程を経ます—テストストリップ、部分露光、そしてマウントへの最終サイン。',
      processIntro: [
        '私の制作は、私たちが生きている世界への問いから始まります。なぜ私たちはここにいるのか。私は何を見ているのか。本当に見えているのか。',
        '人の姿、風景、光、時間が束の間ひとつに重なり、それらの問いが目に見える形となる瞬間を探します。その瞬間は過ぎ去りますが、写真は私たちをそこに留めてくれます。',
        '私の作品は、そのわずかな時間を深く見つめる人のためのものです。すぐに答えを求めるのではなく、自然や地球、そして私たちが生きる宇宙との関係について、何が見えてくるのかを考えるために。私たちは、自らを理解しようとする宇宙なのでしょうか。おそらく。これらのシリーズは、歩みを緩め、その瞬間を見つめるための招待です。',
        'それでは、アイデアがプリントになるまでの工程をスタジオでご覧ください。',
      ],
      tonalCaption: '階調を追い込む。',
      archivalNote: '各作品は、深い黒、輝くハイライト、卓越した階調表現を備えた美術館品質のバライタ印画紙による銀塩プリントとして制作されます。アーカイバル処理、保存仕様のマウント、美術館品質の額装により、プリントの階調と物質的な存在感を世代を超えて守ります。',
      mattingCaption: '保存仕様のマット、裏打ち、額装。',
      veniceCaption: 'FLOW — イタリア、ヴェネツィア。',
      scaleCaption: 'サイズ違いのテスト。',
    },
    about: {
      title: 'プロフィール',
      intro: 'Talmon de l’Armée',
      body: '白黒写真のみを手がける写真家。風景、天候、人間の姿が交差する瞬間に惹かれています。プリントは専用スタジオで手作業により仕上げられます。',
    },
    contact: {
      title: 'お問い合わせ',
      intro: '作品、コミッション、取材に関するご連絡はこちらから。',
      nameLabel: 'お名前',
      emailLabel: 'メールアドレス',
      messageLabel: 'メッセージ',
      submit: '送信',
      sending: '送信中…',
      success: 'ありがとうございます。お問い合わせを送信しました。',
      error: 'メッセージを送信できませんでした。もう一度お試しください。',
      note: '通常2～3営業日以内にご返信いたします。',
    },
    privateView: {
      title: 'プライベートビュー',
      intro: 'ご自身のペースで、プライベートな観覧を。招待時に共有されたパスワードを入力してください。',
      passwordLabel: 'パスワード',
      submit: '入る',
      error: 'パスワードが確認できませんでした。招待状をご確認の上、もう一度お試しください。',
      welcomeTitle: 'ようこそ',
      welcomeBody: '招待されたコレクターの方向けの先行公開作品、エディション情報、価格発表はここに表示されます。',
      requestNameLabel: 'お名前',
      requestEmailLabel: 'メールアドレス',
      requestDateLabel: '希望日',
      requestTimeLabel: '希望時間',
      requestMessageLabel: 'メッセージ',
      collectionLabel: 'ご希望のコレクション',
      collectionPlaceholder: 'コレクションを選択',
      requestSubmit: '観覧を申し込む',
      requestNote: '観覧時間をメールで確認いたします。',
    },
  },
};

export function getTranslations(locale: string): Dictionary {
  return translations[(locale as Locale) in translations ? (locale as Locale) : defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
