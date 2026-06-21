/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * strings/hu.js — Hungarian UI-chrome strings (the SOURCE OF TRUTH for keys).
 * en.js / es.js mirror every key here. A few values carry trusted inline markup
 * (<b>, <span>) and {param} placeholders; see js/i18n.js t(key, params).
 *
 * NOTE: keep this the canonical key set. The parity test fails the build if any
 * key here is missing/empty in en.js or es.js (or vice-versa).
 */
(function (root) {
  'use strict';
  var HU = {
    meta: {
      title: 'Rovásírás — Attila üzenete',
      description: 'Rovásírás — oktatójáték, amely Attila korában tanítja meg a magyar ábécé mind a 40 rovásjelét. Magyar nyelven, 8 éves kortól.',
      skip: 'Ugrás a játékhoz'
    },
    common: {
      back: 'Vissza',
      backVillage: 'Vissza a faluba',
      backVillageHome: 'Vissza a faluba 🏕️',
      gotIt: 'Értem! 👍',
      errGeneric: 'Hiba.'
    },
    hud: {
      scores: 'Pontszámok',
      wisdom: 'Bölcsesség',
      heart: 'Szív',
      runes: 'Megtanult rovások',
      home: 'Vissza a faluba',
      profile: 'Profil váltása',
      help: 'Hogyan játssz? Súgó'
    },
    rtl: {
      aria: 'A rovást jobbról balra írjuk',
      caption: 'jobbról<br>balra'
    },
    a11y: {
      runeSign: '{letter} rovásjel',
      signOf: '{letter} rovás',
      wordInRunes: '{word} rovással'
    },
    version: { badge: 'Verzió {version}, build {build}' },
    lang: {
      label: 'Nyelv',
      groupAria: 'Nyelv választása',
      optionAria: 'Nyelv: {lang}',
      hu: 'Magyar',
      en: 'English',
      es: 'Español',
      de: 'Deutsch',
      tr: 'Türkçe',
      az: 'Azərbaycanca',
      fi: 'Suomi',
      sv: 'Svenska',
      no: 'Norsk',
      is: 'Íslenska',
      et: 'Eesti',
      ru: 'Русский',
      kk: 'Қазақша',
      ky: 'Кыргызча',
      uz: 'Oʻzbekcha',
      zh: '中文',
      ja: '日本語',
      ko: '한국어',
      mn: 'Монгол'
    },
    intro: {
      begin: 'Kezdjük! ✨',
      chooseProfile: 'Profil választása',
      help: 'Hogyan játssz?'
    },
    profiles: {
      title: 'Ki játszik?',
      subtitle: 'Válaszd ki a profilodat, vagy hozz létre újat.',
      loginAria: 'Belépés: {name}',
      deleteAria: '{name} törlése',
      newProfile: '＋ Új profil'
    },
    create: {
      title: 'Új profil',
      nameLabel: 'A neved',
      namePlaceholder: 'pl. Csaba',
      chooseHero: 'Válassz hőst',
      passLabel: 'Titkos jelszó — nem kötelező',
      passPlaceholder: 'üresen hagyhatod',
      passNote: 'Ha üresen hagyod, jelszó nélkül lépsz be. A jelszót nem lehet visszaállítani.',
      submit: 'Indulhat! ✨'
    },
    password: {
      label: 'Jelszó',
      placeholder: 'A titkos jelszavad',
      login: 'Belépés 🔓'
    },
    village: {
      title: 'A falu',
      progress: '{learned} / 40 rovás megtanulva · {unlocked} lecke elérhető',
      lessonNum: '{num}. lecke · {game}',
      lessonAria: '{num}. lecke: {title}, tanító {teacher}',
      completedSuffix: ', teljesítve',
      lockedSuffix: ', zárolva — előbb teljesítsd a többi leckét',
      practice: 'Gyakorlás',
      exam: 'Vizsga',
      numbers: 'Számrovás',
      alphabets: 'Rovás ábécék',
      decodeTitle: 'Mind a 40 rovás a tiéd! ✨',
      decodeSub: 'Most megfejtheted Attila üzenetét.',
      decodeBtn: 'Attila üzenetének megfejtése 📜'
    },
    style: {
      title: '🅰️ Jelek stílusa a játékban',
      note: 'Válaszd ki, melyik formával jelenjenek meg a rovásjelek. Rajzolásnál a játék mindkettőt elfogadja.',
      groupAria: 'Jelstílus',
      forrai: 'Hiteles (Forrai)',
      balanced: 'Kiegyenesített'
    },
    difficulty: {
      title: '🎚️ Nehézségi szint',
      note: 'Mennyire legyen szigorú a rajzfelismerés? Bármikor módosíthatod.',
      groupAria: 'Nehézségi szint',
      optionAria: 'Nehézségi szint: {level}',
      prompt: 'Válassz nehézségi szintet',
      promptSub: 'Később bármikor módosíthatod a faluban.',
      beginner: 'Kezdő',
      intermediate: 'Haladó',
      master: 'Mester',
      beginnerDesc: 'A legelnézőbb — szinte minden rajzot elfogad, a vizsgákon is.',
      intermediateDesc: 'Kiegyensúlyozott — elfogadja a jó rajzokat, a vizsga kicsit szigorúbb.',
      masterDesc: 'Szigorú — a pontatlan jeleket nem fogadja el, a vizsgán sem.',
      saved: 'Nehézségi szint: {level}'
    },
    alphabets: {
      title: '📖 Rovás ábécék',
      whyTitle: 'Miért különböznek?'
    },
    lessonIntro: {
      heading: '{num}. lecke — {title}',
      minigame: 'Minijáték: {name}',
      start: 'Kezdés ✍️'
    },
    beat: {
      thisRune: 'Ez a(z) <b style="color:var(--gold)">{letter}</b> rovásjele.',
      trace: 'Húzd át a halvány mintát ujjal vagy egérrel!',
      memory: 'Most fejből! Rajzold le a(z) <b style="color:var(--gold)">{letter}</b> jelét.',
      connect: 'Kösd össze a képet a rovással — így könnyű megjegyezni.'
    },
    fact: { tag: 'Érdekesség' },
    draw: {
      clear: 'Törlés',
      undo: 'Vissza',
      peek: '👁 Kukucs',
      check: 'Ellenőrzés ✓',
      skipNext: 'Tovább (kihagyom) →',
      skip: 'Kihagyom →',
      fromMemory: 'Rajzold le fejből: <b style="color:var(--gold)">{letter}</b>',
      almostAccepted: 'Majdnem tökéletes — elfogadva! ✓',
      nice: 'Szép vonás! ✓',
      bigger: 'Rajzolj egy kicsit nagyobbat. ✍️',
      notQuite: 'Hmm, ez még nem egészen. Próbáld újra, vagy lépj tovább.',
      exact: 'Pontos! ✓',
      mirrored: 'Tükrözve rajzoltad — a másik írásirány, elfogadva! ✓',
      notQuiteSkip: 'Nem egészen. Próbáld újra, vagy hagyd ki.'
    },
    nav: {
      next: 'Tovább →',
      nextLetter: 'Következő betű →',
      toPractice: 'Gyakorlás! 🎯',
      back: '← Vissza'
    },
    emo: { gotHeart: 'Szívet kaptál!' },
    complete: {
      title: 'Lecke teljesítve!',
      learned: 'Megtanultál {n} rovást a 40-ből.'
    },
    exam: {
      title: '🎓 Vizsga',
      subtitle: 'Tedd próbára a tudásod! A rajzos részek átugorhatók.',
      final: '🏆 Záróvizsga',
      finalTitle: 'Záróvizsga',
      rankLabel: 'Vizsgarang',
      correctOf: '{c} / {t} helyes',
      passed: 'Szép munka! ⭐',
      failed: 'Jó úton vagy — gyakorolj még egy kicsit!',
      backToExams: 'Vissza a vizsgákhoz',
      tests: {
        letters:    { title: 'Betűfelismerés',     desc: 'Rovás ↔ betű' },
        words:      { title: 'Szavak oda-vissza',   desc: 'Rovásszó ↔ magyar szó' },
        letterdraw: { title: 'Betűrajzolás',        desc: 'Rajzold le fejből' },
        worddraw:   { title: 'Szórajzolás',         desc: 'Szó cellákba' }
      }
    },
    examRank: { master: 'Rovásmester', scribe: 'Rovásírnok', apprentice: 'Rovástanonc' },
    practice: {
      title: '🎯 Gyakorlás',
      subtitle: 'Válaszd ki, mit gyakorolnál! Minden betű és minden mód elérhető — a rajzos részek átugorhatók.',
      fallbackTitle: 'Gyakorlás',
      modes: {
        smart:      { title: 'Okos ismétlés',     desc: 'A soron lévő betűid (vegyes)' },
        r2w:        { title: 'Rovás → szó',        desc: 'Melyik szóhoz tartozik a jel?' },
        w2r:        { title: 'Szó → rovás',        desc: 'Melyik jel tartozik a szóhoz?' },
        clue:       { title: 'Találós jelek',      desc: 'Találd ki a jelet a leírásból' },
        wordfwd:    { title: 'Rovásszó → magyar',  desc: 'Olvasd el a rovással írt szót' },
        wordback:   { title: 'Magyar → rovásszó',  desc: 'Melyik rovás írja le a szót?' },
        letterdraw: { title: 'Betűrajzolás',       desc: 'Rajzold le a betűt fejből' },
        worddraw:   { title: 'Szórajzolás',        desc: 'Írd le a szót cellánként' }
      }
    },
    quiz: {
      r2w: 'Melyik szóhoz tartozik ez a rovás?',
      clue: 'Melyik rovásjelre gondolok?',
      w2r: 'Melyik rovás tartozik ehhez?',
      wordfwd: 'Melyik magyar szó ez a rovással?',
      wordback: 'Melyik rovás írja le: <b>{word}</b>?'
    },
    worddraw: {
      perCell: 'Rajzold le cellánként: <b>{word}</b>',
      targetAria: '{letter} rovásjel ide',
      cellClearAria: '{letter} cella törlése',
      score: '{ok} / {total} jó'
    },
    review: {
      title: 'Gyakorlás kész!',
      recall: 'helyes felidézés',
      due: 'Még {n} betű vár ismétlésre.',
      allFresh: 'Most minden betűd friss! 🌟',
      keepGoing: 'Tovább gyakorlok'
    },
    decode: {
      title: 'A megfejtés',
      rtl: 'A rovás jobbról balra íródik — ahogy a hun írnok tette.'
    },
    ending: {
      title: 'A rovásírás a tiéd ✨',
      rankLabel: 'A megszerzett rangod',
      goodToKnow: 'Jó tudni',
      allRunes: 'Mind a 40 megtanult rovásod',
      examBtn: '🎓 Vizsgázz le!'
    },
    relic: {
      tag: '📜 Valós rovásemlék',
      imgAlt: '{name} — valós rovásemlék'
    },
    numbers: {
      title: '🔢 Számrovás',
      examples: 'Példák'
    },
    help: {
      title: 'Hogyan játssz?',
      items: [
        ['📜', '<b>Cél:</b> tanuld meg a 40 rovásjelet, és fejtsd meg Attila üzenetét. A leckéket bármilyen sorrendben elvégezheted — semmi sincs lezárva.'],
        ['✍️', '<b>Rajzolás:</b> minden új betűnél előbb átrajzolod a mintát, majd fejből is megpróbálod. Ujjal vagy egérrel.'],
        ['🎯', '<b>Gyakorlás:</b> a falu „Gyakorlás" gombja egy egész gyakorlótár — minden betű és minden játékmód: felismerés, párosítás, találós jelek, szóolvasás és -írás, rajzolás, és okos ismétlés.'],
        ['🎓', '<b>Vizsga:</b> betű- és szófelismerés oda-vissza, betű- és szórajzolás. Bármikor megnyitható, a rajzos részek átugorhatók.'],
        ['❤️', '<b>Szív:</b> a kedves döntések ❤️-et adnak, és ez dönti el a záró rangodat.'],
        ['👤', '<b>Profilok:</b> többen játszhattok egy gépen, mindenkinek saját jelszó és haladás. (Jelszó-visszaállítás nincs.)']
      ]
    },
    music: {
      tipTitle: '🎵 Háttérzene',
      tipBody: 'Halk zene szól játék közben. A <b>bal alsó sarokban</b> ↙ kapcsolhatod ki vagy be, és a <span aria-hidden="true">⋯</span> gombbal válthatsz a számok között.',
      open: 'Zenelejátszó megnyitása',
      close: 'Zenelejátszó bezárása',
      closeTitle: 'Bezárás',
      panelTitle: 'Zenelejátszó',
      prev: 'Előző szám',
      next: 'Következő szám',
      play: 'Háttérzene lejátszása',
      pause: 'Zene szüneteltetése'
    },
    err: {
      enterName: 'Írj be egy nevet.',
      chooseHero: 'Válassz egy hőst.',
      wrongPassword: 'Hibás jelszó. Próbáld újra.'
    },
    toast: {
      locked: '🔒 Előbb teljesítsd az előző leckét!',
      examLocked: '🔒 Ehhez még tanulnod kell néhány betűt.',
      noMaterial: 'Ehhez még nincs elég anyag.'
    },
    confirm: {
      deleteProfile: 'Biztosan törlöd ezt a profilt: {name}? A haladása elvész, és nincs visszaállítás.'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = HU;
  root.ROVAS_STRINGS_HU = HU;
})(typeof window !== 'undefined' ? window : globalThis);
