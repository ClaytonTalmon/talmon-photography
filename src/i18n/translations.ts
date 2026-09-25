// Central translation dictionary.
//
// To add a new language:
//   1. Add its locale code to `locales` in astro.config.mjs
//   2. Add a key + full object below (copy the "en" block as a starting point)
//   3. Add it to `localeNames` so the language switcher shows a nice label
//
// Every page pulls its strings from here via `getTranslations(locale)`,
// so there is exactly one place to edit copy per language.

export const locales = ['en', 'fr', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  ja: '日本語',
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
      requestSubmit: 'Demander une visite',
      requestNote: 'Je confirmerai l’heure de la visite par e-mail.',
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
