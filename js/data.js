/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * data.js — The game's complete Hungarian content.
 *
 * The teacher stories, historical facts, and emotional moments come VERBATIM
 * from the concept document (rovasiras_jatek_leiras.md). New Hungarian text was
 * only written where the minigame needed a short "clue" — these are the `clue` fields.
 *
 * The module is DOM-free and loadable from Node (for tests).
 */
(function (root) {
  'use strict';

  var DATA = {

    characters: [
      { id: 'batu', name: 'Csaba', emoji: '🧒', role: 'A lovászmester fia',
        desc: 'Gyors, kíváncsi, mindig egy kérdéssel többet tesz fel a kelleténél. Mozgás közben tanul a leggyorsabban.' },
      { id: 'reka', name: 'Réka', emoji: '👧', role: 'A gyógyító lánya',
        desc: 'Türelmes és pontos. Észreveszi, amit mások átugranak. Anyja keze, saját erős akarata.' }
    ],

    teachers: {
      arany: { name: 'Ilona', emoji: '👵', role: 'a falu véne' },
      voros: { name: 'Göncöl', emoji: '🔮', role: 'a táltos' },
      vas:   { name: 'Levente', emoji: '⚒️', role: 'a kovács' },
      csilla:{ name: 'Ildikó', emoji: '⚔️', role: 'a harcos hadnagy' },
      hirnok:{ name: 'Királyi Hírnök', emoji: '📯', role: 'Attila követe' }
    },

    // The three minigame types.
    minigames: {
      recognition: { name: 'Rovásfelismerés', instr: 'Melyik szó tartozik ehhez a rováshoz?' },
      matching:    { name: 'Rovás-párosítás', instr: 'Melyik rovás tartozik ehhez a szóhoz?' },
      clues:       { name: 'Történeti nyomok', instr: 'A nyom egy fogalmat ír le. Melyik rovás az?' }
    },

    lessons: [
      { num: 1,  title: 'Az első rovások',     teacher: 'arany',  minigame: 'recognition',
        place: 'Meleg sátor. Tűzfény a szőtt kárpitokon. Kint egy ló dobbant a sötétben.',
        intro: 'Ilona a legegyszerűbb alakokkal kezd. Menj a sátrához alkonyatkor.',
        letters: ['A', 'Á', 'B'] },
      { num: 2,  title: 'A tábor jelei',        teacher: 'arany',  minigame: 'matching',
        place: 'Reggeli fény. Kancatej és fafüst illata.',
        intro: 'Nyilak, csillagok, dobok. A tábor minden tárgya rovást kapott.',
        letters: ['C', 'Cs', 'D'] },
      { num: 3,  title: 'Az összetett hangok',  teacher: 'arany',  minigame: 'clues',
        place: 'Késő este. A tűz leégett, a lecke elcsendesül.',
        intro: 'A legnehezebb betűk. Ilona a végére hagyja őket — a figyelmes fület jutalmazzák.',
        letters: ['Dz', 'Dzs', 'E'] },
      { num: 4,  title: 'Éjszakai iskola',      teacher: 'voros',  minigame: 'recognition',
        place: 'Nagy tábortűz a nyílt sztyeppén. Dobok szólnak valahol a messzi sötétben.',
        intro: 'A táltos csak sötétedés után tanít. Hozd a kérdéseidet és a türelmedet.',
        letters: ['É', 'F', 'G'] },
      { num: 5,  title: 'A természet rovásai',  teacher: 'voros',  minigame: 'matching',
        place: 'A tűz pattog. Szikrák szállnak a csillagokkal teli ég felé.',
        intro: 'Három rovás a természet testéből — mély, ragyogó és feszes.',
        letters: ['Gy', 'H', 'I'] },
      { num: 6,  title: 'Íj, jég és kő',        teacher: 'voros',  minigame: 'clues',
        place: 'Hideg éjszaka. A lélegzet párás a tűz fényében.',
        intro: 'Íj, jég és kő. A táltos azt kérdezi, mi tartja össze a dolgokat.',
        letters: ['Í', 'J', 'K'] },
      { num: 7,  title: 'A műhely leckéi',      teacher: 'vas',    minigame: 'recognition',
        place: 'A kohó izzik. Vas csendül a vason, egyenletes ritmusban.',
        intro: 'A kovács a kalapácsütések között tanít. Figyelj a szünetekre.',
        letters: ['L', 'Ly', 'M'] },
      { num: 8,  title: 'Nap, nyúl, oroszlán',  teacher: 'vas',    minigame: 'matching',
        place: 'Dél a kohónál. A hőség remeg az üllő fölött.',
        intro: 'Három rovás a nagy körforgásokból — ég, föld és emlékezet.',
        letters: ['N', 'Ny', 'O'] },
      { num: 9,  title: 'Az ősök rovásai',      teacher: 'vas',    minigame: 'clues',
        place: 'A tűz lefojtva. A kovács lassabban beszél.',
        intro: 'Óriás, ökör, ős. A kohó kihűl, ahogy a kovács ezeken töpreng.',
        letters: ['Ó', 'Ö', 'Ő'] },
      { num: 10, title: 'A harcos írása',       teacher: 'csilla', minigame: 'recognition',
        place: 'A gyakorlótér hajnalban. Dárdák rendezett sorokban.',
        intro: 'Pajzs, rét, sátor. Ildikó katonás pontossággal tanít.',
        letters: ['P', 'R', 'S'] },
      { num: 11, title: 'Szál, tűz, tyúk',      teacher: 'csilla', minigame: 'matching',
        place: 'Szeles délután. Zászlók csattognak a póznáikon.',
        intro: 'Három nagyon eltérő súlyú rovás. Ildikó pontos arányokat követel.',
        letters: ['Sz', 'T', 'Ty'] },
      { num: 12, title: 'Az út és az edény',    teacher: 'csilla', minigame: 'clues',
        place: 'Alkony. Egy lovast láttak feltűnni a keleti horizonton.',
        intro: 'Utca, útvesztő, üst. Az utolsó formális lecke Attila üzenete előtt.',
        letters: ['U', 'Ú', 'Ü'] },
      { num: 13, title: 'Az utolsó rovások',    teacher: 'hirnok', minigame: 'recognition',
        place: 'A falu tere. A hírnök leszáll, tekerccsel a kezében, ahogy feltűnnek az első csillagok.',
        intro: 'A négy rovás, amely teljessé teszi a rovásírást. Megérkezett egy királyi hírnök.',
        letters: ['Ű', 'V', 'Z', 'Zs'] }
    ],

    letters: {
      'A': { word: 'Anya', emoji: '👩', meaning: 'Anya', clue: 'Az ábécé első jele — mint az első ember az életünkben. A csúcsa feléd mutat, ahogy anya is mindig feléd fordul.',
        story: ['Ilona a porba rajzolja az első jelet: egy szárat, és balról egy hegyes csúcsot, amely feléd mutat.',
          '„Minden ábécé valahol kezdődik. A miénk itt: A, mint anya. A legtöbb gyermek ezt a szót mondja ki először.”',
          '„Az A-rovás mindig mutat valamerre — és feléd mutat, ahogy anya is mindig feléd fordul.”'],
        fact: 'Az „anya” szó a világ legtöbb, egymástól távoli nyelvében is lágy, ajakkal formált hanggal kezdődik — ez a legelső hang, amit a csecsemő ki tud mondani. Talán ezért hasonlít annyi nyelvben.',
        emotional: { prompt: 'Ilona elejti a rajzolópálcáját, és nehezen hajol le érte. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Felveszed és visszaadod neki', result: 'Csendes mosollyal elveszi. „Először a kicsi dolgokat vedd észre. A rovások is ezt tanítják.”' },
            { kind: 'neutral', label: 'Vársz — nem kért segítséget', result: 'Maga veszi fel. A lecke folytatódik.' }
          ] } },

      'Á': { word: 'Áldott', emoji: '🤰', meaning: 'Áldott állapot', clue: 'Az A, gömbölyű hassal — áldott állapotban (várandósan). Egy új élet vár benne.',
        story: ['„Az Á az A nagyobb testvére” — mondja Ilona. Megrajzolja az A-t, de a csúcsát kerek, zárt háromszöggé teljesíti ki — mint egy gömbölyödő has.',
          '„Áldott állapot. Az A-rovás hasat növesztett: új élet van benne. A hosszabb hanghoz nagyobb, kerekebb jel illik.”'],
        fact: 'A hosszú magánhangzók — á, é, ó — külön rovásjelet kaptak a magyarban. Magyar Adorján néprajzkutatónak köszönhető, hogy az Á és É általánossá vált; nélküle ábécénk rövidebb lenne.' },

      'B': { word: 'Bak', emoji: '🪚', meaning: 'Bak', clue: 'Két keresztezett láb — a fűrészbak, amire a fát fektetik vágáshoz. Tiszta X.',
        story: ['„Ezt nem felejted el” — mondja Ilona, és két, saroktól sarokig keresztező vonalat húz. Egy tiszta X.',
          '„Bak. A fűrészbak, amin a fát elfűrészeljük — a két lába keresztben áll, hogy megtartsa. Ahány X-et látsz, annyi bakon dolgozhatsz.”'],
        fact: 'A rovásjelek azért ilyen szögletesek, mert az írást eredetileg éles szerszámmal fába és csontba vésték — az egyenes vágás gyorsabb és tisztább volt, mint az ív. A bak két egyenes vonala tökéletes vésnivaló.' },

      'C': { word: 'Cél', emoji: '🎯', meaning: 'Cél', clue: 'Minden nyílnak kell egy. Minden tanulónak is.',
        story: ['Ilona egy felfelé mutató nyilat rajzol — egy magas vonalat, a tetején két rövid, kifelé álló vonással, mint egy nyílhegy.',
          '„Cél. Minden nyílnak kell egy.” A nyílt sztyeppére mutat. „Minden tanulónak is. A tiéd mi?”'],
        fact: 'A magyar C-t „cé”-nek ejtjük — mint a „cica” elején. Ez a hang a legtöbb európai nyelvben nem létezik önállóan; a latin írás két betűvel — t és s — körülírja, amit a rovó egyetlen jelbe sűrített.',
        emotional: { prompt: 'Egy másik gyerek a porba rovásokat rajzol, és láthatóan elveszett. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Megmutatod a nyíl-trükköt', result: '„Mint egy íj!” — mondja, nem egészen pontosan, de közel. A tanítás a te emlékezetedet is élesíti.' },
            { kind: 'neutral', label: 'A saját gyakorlásodra figyelsz', result: 'Rendben. Üres edényből nem lehet tölteni.' }
          ] } },

      'Cs': { word: 'Csúszda', emoji: '🛝', meaning: 'Csúszda', clue: 'Két oldalsó szár, közöttük egy ferde pálya — ahogy a tetejéről lecsúszol.',
        story: ['Ilona két párhuzamos szárat rajzol, majd a tetejükhöz egy ferde vonalat húz, amely átszeli őket.',
          '„Csúszda. A két szár a korlát, a ferde vonal a pálya — fent felmész, és sziszegve lecsúszol. A Cs-rovás maga a lecsúszás.”'],
        fact: 'A magyar „cs” hangot egyetlen rovásjel jelöli, pedig a latin írás két betűvel — c és s — írja le. A rovó keze egy mozdulattal megvolt azzal, amihez a tollnak kettő kellett.' },

      'D': { word: 'Dárda', emoji: '🗡️', meaning: 'Dárda', clue: 'Egy hosszú nyél, fent egy keresztrúddal — a dárda, amit a harcos a markában tart.',
        story: ['Ilona egy hosszú függőleges szárat rajzol, fent egy rövid keresztrúddal.',
          '„Dárda. A szár a nyél, a keresztrúd a markolat, ami megfogja a kezed, hogy ne csússzon. Egy jó dárda egyenes, mint ez a rovás.”'],
        fact: 'A hun dárdát hurokra kötött szíjjal is elhajíthatták, hogy becsapódás után visszarántsák. Ehhez számítás, egyensúly és olykor egy nagyon gyors ló kellett.' },

      'Dz': { word: 'Edzés', emoji: '💪', meaning: 'Edzés', clue: 'Egy létra fokai; a harcos addig ismétli a nehezet, míg természetessé válik.',
        story: ['„Ez a rovás egy létrából épül” — mondja Ilona, és két függőlegest rajzol ferde fokokkal, oldalt egy kinyúló karral.',
          '„Edzés. Mi más a harcos, mint aki addig ismétli a nehéz dolgot, míg az természetessé válik?”'],
        fact: 'A dz és a dzs Európa legritkább hangjai közé tartoznak. A beszélt magyarban ma is élnek — amit a nyelvészek egyszerre tartanak figyelemreméltónak és kissé rejtélyesnek.',
        emotional: { prompt: 'A lecke hosszúra nyúlik. Ilona hangja kezd berekedni. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Hozol egy korsó vizet a kútról, kérés nélkül', result: 'Két kézzel veszi át. „Meghallottad azt, amit nem mondtam ki.”' },
            { kind: 'neutral', label: 'Vársz — szól majd, ha kell neki', result: 'Panasz nélkül folytatja. Tanított ő már szomjasabban is.' }
          ] } },

      'Dzs': { word: 'Dzsungel', emoji: '🌴', meaning: 'Dzsungel', clue: 'Egy fatörzs, fent szétágazó lombbal, és egy inda keresztben — a sűrű őserdő.',
        story: ['„Ebben a rovásban egész erdő lakik” — mondja Ilona, és egy függőleges törzset rajzol, a tetején felfelé villázó ágakkal, a száron pedig egy keresztben futó indával.',
          '„Dzsungel. A törzs felnyúlik, az ágak szétterülnek, az inda átfonja — a legsűrűbb, legzöldebb hely. Annyi élet van benne, hogy alig fér el a rováson.”'],
        fact: 'A „dzs”-vel kezdődő magyar szavak szinte mind távoli tájakról vándoroltak be — dzsungel, dzsessz, dzsip. A rovó ősei még nem ismerték őket, de a jel készen állt, amikor megérkeztek.' },

      'E': { word: 'Erdő', emoji: '🌲', meaning: 'Erdő', clue: 'Nem betörsz bele — belépsz. Hívás, nem parancs.',
        story: ['A lecke végén Ilona egy keskeny homokórát rajzol — két háromszög, amely középen összeér. Mint két fa: az egyik az ég felé, a másik a gyökér felé nyúlik.',
          '„Erdő. Nem betörsz bele — belépsz. Az E-rovás két irányba nyílik: fel a lombhoz, le a gyökérhez. Hívás, nem parancs.”'],
        fact: 'Az erdő a hun világ pereme volt. A sztyeppei nép a nyílt füvet uralta — de az erdő rejtély, menedék és határ volt egyszerre.' },

      'É': { word: 'Égbolt', emoji: '☁️', meaning: 'Égbolt', clue: 'Egy kis kanyargó kacs — mint egy felhőfoszlány, amely az égbolton úszik.',
        story: ['Göncöl csak a tűz fényénél rajzol. Ma egy apró, kanyargó S-kacsot — mint egy felhő, amely lassan átúszik az égbolton.',
          '„Égbolt. A nagy kék tető a fejünk fölött, nappal és éjjel. Az É-rovás egyetlen felhőfoszlány rajta — kicsi jel a végtelen boltozaton.”'],
        fact: 'A hunok az égboltot olvasták térkép helyett: a Sarkcsillag, a nap járása, a hold állása mind irányt mutatott. Aki ismerte az eget, sosem tévedt el a sztyeppén.',
        emotional: { prompt: 'Teljesen besötétedett. A tűz halványul. Egy kisgyerek a közelben ijedtnek tűnik. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Csendben közelebb ülsz az ijedt gyerekhez', result: 'Abbahagyja a remegést. Nem szólsz semmit. A táltos észreveszi. „Ez a rovásokon túli bölcsesség.”' },
            { kind: 'neutral', label: 'A leckére figyelsz', result: 'A fegyelemnek megvan a maga értéke. A lecke folytatódik a pislákoló sötétben.' }
          ] } },

      'F': { word: 'Föld', emoji: '🌍', meaning: 'Föld', clue: 'Egy kör, benne kereszttel — a Föld gömbje, rajta a délkörök vonalaival.',
        story: ['„Ezt érezd” — mondja a táltos, és egy kört rajzol, benne egy X-szel.',
          '„Föld. A kerek világ, amin állunk. A kereszt a benne futó vonalak — ahogy a délkörök átszelik a gömböt. Az F-rovás az egész világot a tenyeredbe fogja.”'],
        fact: 'Az ősi magyar világkép a Földet a „világfa” köré rendezte, amely az eget és az alvilágot összeköti. A kör a rováson ezt a kerek, teljes világot idézi.' },

      'G': { word: 'Gúla', emoji: '🔺', meaning: 'Gúla', clue: 'Egy háromszög, benne egy belső éllel — kőből rakott gúla, ahogy térben látod.',
        story: ['A táltos egy fordított V-t rajzol, majd a csúcsából egy belső vonalat húz lefelé.',
          '„Gúla. A sátor puha teteje után itt a kőből rakott csúcs. A belső vonal az él, amelyen a fény megtörik — ettől látod térben, nem laposnak.”'],
        fact: 'A sztyeppén a nagy vezéreket hatalmas földhalmok, kurgánok alá temették — gúlába emelt föld és kő, hogy messziről lássák. Évezredekkel később is ott állnak a puszta fölött.' },

      'Gy': { word: 'Gyökér', emoji: '🌱', meaning: 'Gyökér', clue: 'Nem látod, mégis minden tőle függ, ami fölötte van.',
        story: ['A táltos egy függőlegest rajzol, két vízszintes rúddal — egy kettős keresztet.',
          '„Gyökér. Nem látod, mégis minden tőle függ, ami fölötte van. A gy-rovás az erő azon része, amely nem látszik.”'],
        fact: 'A középkori magyar krónikák — köztük Kézai Simon 1282-es műve — a magyarokat a hunok egyenes leszármazottainak tartják: a hunok szkítaként vonultak ki keletről, és Pannóniát visszafoglalva alapítottak királyságot. Zrínyi Miklós 1651-ben Attilát „az első magyar királynak" nevezte.',
        emotional: { prompt: 'Egy fiú elszalad melletted, elesik, és felhorzsolja a térdét. Igyekszik nem sírni. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Csendben odamész, és megnézed', result: 'Jól van, és örül, hogy senki nem csapott belőle ügyet. „A harcos, aki a kis sebeket észreveszi, megelőzi a nagyokat” — mondja a táltos.' },
            { kind: 'neutral', label: 'Tiszteled a méltóságát — nem szólt', result: 'Magától összeszedi magát. Van, aki a saját lábán talál vissza.' }
          ] } },

      'H': { word: 'Homokóra', emoji: '⏳', meaning: 'Homokóra', clue: 'Középen összeszűkül, mint a homokóra dereka, ahol átpereg a homok.',
        story: ['A táltos két görbe vonalat rajzol, amelyek középen majdnem összeérnek — fent szélesek, lent szélesek, középen elkeskenyednek.',
          '„Homokóra. A homok fentről lecsorog a szűk derekán át. Amikor az utolsó szem is lepereg, letelt az idő. A H-rovás magát a múló időt rajzolja.”'],
        fact: 'A sztyeppei nép az időt az éggel mérte — a nap árnyékával, a csillagok fordulásával. A homokóra később érkezett, de ugyanazt mondta: minden pillanat lepereg, ne pazarold.' },

      'I': { word: 'Iránytű', emoji: '🧭', meaning: 'Iránytű', clue: 'A függőleges az út; a fenti kis zászló a pillanat, amikor eldöntöd, merre indulsz.',
        story: ['„A tájékozódás egyetlen vonalon és egy apró jelen múlik” — mondja a táltos. Egy függőlegest rajzol, fent egy rövid, balra dőlő zászlóval.',
          '„Iránytű. A függőleges az út. A fenti kis zászló a pillanat, amikor eldöntöd, merre indulsz.”'],
        fact: 'A sztyeppén az igazi iránytű az ég volt: a Sarkcsillag, a nap járása, a szél iránya. A hun lovas térkép nélkül is tudta, merre van otthon.' },

      'Í': { word: 'Íj', emoji: '🏹', meaning: 'Íj', clue: 'A függőleges a kifeszített ideg; a zászló a visszafojtott lélegzet.',
        story: ['„Az íjnak két része van” — mondja a táltos. Egy függőleges vonalat rajzol, a tetején egy rövid zászlóval.',
          '„Íj. A függőleges a kifeszített ideg. A zászló a visszafojtott lélegzet, mielőtt elengeded.”'],
        fact: 'A hun összetett íj — fa, szaru és ín egyberétegelve — az ókori világ legfejlettebb fegyvere volt. Hónapokig készült, és túlélhette a készítőjét.',
        emotional: { prompt: 'A kezed hideg és ügyetlen. Nehezen vésed ezt a rovást a fába. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Rálehelsz a kezedre, és kéred, hogy közelebb ülhess a tűzhöz', result: '„Kéred, amire szükséged van. Ez nem gyengeség” — mondja, és helyet ad. A rovás tisztán sikerül.' },
            { kind: 'neutral', label: 'Átküzdöd magad rajta', result: 'Az elszántságnak megvan az értéke. A rovás durva, de felismerhető.' }
          ] } },

      'J': { word: 'Jég', emoji: '🧊', meaning: 'Jég', clue: 'Ami tegnap folyó volt, ma új nevet visel. A vonal ugyanaz.',
        story: ['A táltos egy függőlegest rajzol, a tetején egy hosszú, lendületes zászlóval — mint egy lobogó a póznán.',
          '„Jég. Ami tegnap folyó volt, ma új nevet visel. A vonal ugyanaz — de a természete megváltozott.”'],
        fact: 'A Rajna i. sz. 406-ban annyira befagyott, hogy vandál, alán és svéb törzsek keltek át rajta — a hunok nyomása elől menekülve. A túlpartról figyelő rómaiak nem hittek a szemüknek: a birodalom határa egyetlen télre összeomlott.' },

      'K': { word: 'Kő', emoji: '🪨', meaning: 'Kő', clue: 'Az első dolog, amibe véstek, az utolsó, ami megmarad.',
        story: ['„A legörökebb anyagnak a legtisztább a rovása” — mondja a táltos, és egy rombuszt rajzol. Négy egyenlő oldal, négy tiszta szög. Semmi több.',
          '„Kő. Az első dolog, amibe véstek, az utolsó, ami megmarad. A K-rovás nem akar több lenni önmagánál. Ezt tanítja a kő.”'],
        fact: 'A legrégebbi rovásfeliratokat kőbe vésték. Némelyik több mint ezer évet él túl — a kő túléli a népet, az írás túléli a birodalmat.' },

      'L': { word: 'Ló', emoji: '🐎', meaning: 'Ló', clue: 'Egy szár, jobbra szétnyíló legyezővel — mint a ló, amikor ágaskodva felcsap az első lábaival.',
        story: ['Levente, a kovács, ceremónia nélkül tanít. Egy ferde szárat rajzol, a jobb oldalán szétnyíló, legyezős vonalakkal.',
          '„Ló. Nézd, ahogy ágaskodik — a szár a teste, a legyező a két első lába meg a sörénye, ahogy a magasba csap. A rovás már vágtat.”'],
        fact: 'A hunok annyit lovagoltak, hogy a lábuk görbe maradt. A római írók megjegyezték: a földön esetlenül jártak, lóháton viszont teljesen átváltoztak.',
        emotional: { prompt: 'A kovács kalapácsa megcsúszik, és majdnem a kezére csap. Megrendül, de nem szól. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Csendben megkérdezed, kell-e egy pillanat', result: 'Kifújja a levegőt. „Néha elfelejtem, hogy nem vasból vagyok.” Elmondja az L-rovás történetét, amit egyetlen tekercs sem őriz.' },
            { kind: 'neutral', label: 'A leckén tartod a szemed', result: 'Gyorsan összeszedi magát. A lecke folytatódik.' }
          ] } },

      'Ly': { word: 'Lyuk', emoji: '🕳️', meaning: 'Lyuk', clue: 'Némely dolgot az határoz meg, ami nincs.',
        story: ['„Némely dolgot az határoz meg, ami nincs” — mondja a kovács, és egy sima mandulát rajzol, átlósan áthúzva.',
          '„Lyuk. Az övben a csatot tartja. A földben a magot rejti. Az égen —” megáll. „Ott jönnek át a csillagok.”'],
        fact: 'Az ly hang elnémult — a mai magyarok ugyanúgy ejtik, mint a j-t. De a rovása évszázadokig megtartotta a saját alakját: egy hang, amelyet az írás megőrzött, miután a beszédből eltűnt.' },

      'M': { word: 'Madár', emoji: '🦅', meaning: 'Madár', clue: 'A felső háromszög az ég felé, az alsó az árnyékot tartja.',
        story: ['A kovács egy függőlegest rajzol jobbra, balra két háromszöget illeszt hozzá — kettő, egymás fölött.',
          '„Madár. A felső háromszög az ég felé nyúl. Az alsó az árnyékot tartja. A vonal közöttük a felszállás pillanata.”'],
        fact: 'A turul — egy mitikus ragadozómadár — a magyar királyi vérvonal totemje volt, amely állítólag a keletről induló vándorlást vezette. Az M-rovás minden madarat tisztel, amely megmutatta az utat.' },

      'N': { word: 'Nap', emoji: '☀️', meaning: 'Nap', clue: 'A horizont egyik felén kel, és bejárja az egész eget.',
        story: ['A kovács egy mély, kerek C-ívet rajzol — majdnem zárt félholdat, balra nyitva.',
          '„Nap. A horizont egyik felén kel, és bejárja az egész eget. Az N-rovás ez az ív.”'],
        fact: 'Az ősi magyaroknak volt napistenük, akinek nevén a nyelvészek máig vitáznak. A nap férfias volt — az erő forrása, a harcos első igazodása minden reggel.',
        emotional: { prompt: 'Valaki a csoportban régóta némán küzd. Nem kér segítséget. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Lazán felajánlod — „engem is megzavart ez a rész”', result: 'Leesik a válla. „Azt hittem, csak velem van baj.” A kovács meghallja, és bólint.' },
            { kind: 'neutral', label: 'Hagyod, hogy kiküzdje', result: 'Végül odaér. Néhány leckéhez magány kell.' }
          ] } },

      'Ny': { word: 'Nyúl', emoji: '🐇', meaning: 'Nyúl', clue: 'Hirtelen irányokba ugrik; az egyenes oldal a nyugalom, az ív a szökellés.',
        story: ['„Az Ny-rovás egy D-alak” — mondja a kovács, és egy egyenes bal oldalt rajzol, jobbra egy ívvel.',
          '„Nyúl. Hirtelen irányokba ugrik. Az egyenes oldal a nyugalom, az ív a szökellés.”'],
        fact: 'A magyar népmesékben a nyúl a gyorsaságot és a cselt jelentette — lehetetlen terepen vezette lehetetlen hajszába a vadászokat, hogy aztán egészen váratlan helyen bukkanjon fel.' },

      'O': { word: 'Oroszlán', emoji: '🦁', meaning: 'Oroszlán', clue: 'Nem üldöz — vár. Olvassa az egész mezőt, mielőtt mozdul.',
        story: ['A kovács egy sekély ívet rajzol — egyszerű görbét, jobbra nyitva.',
          '„Oroszlán. Nem üldöz — vár. Olvassa az egész mezőt, mielőtt mozdul. Az O-rovás ez a türelmes ív.”'],
        fact: 'Ázsiai oroszlánok valaha messze nyugatra kóboroltak az ókori világban. A sztyeppei vadász ismerte a hangját — és tisztelte a türelmét.' },

      'Ó': { word: 'Óriás', emoji: '🗿', meaning: 'Óriás', clue: 'Még a legnagyobb erő is megpihen olykor, magába tér.',
        story: ['A kovács egy befelé csavarodó spirált rajzol — egy vonal, amely magába tér.',
          '„Óriás. A régi mesék hősei. A spirál a befelé fordulás — még a legnagyobb erő is megpihen olykor, magába tér. Az Ó-rovás ezt a befelé forduló nyugalmat tartja.”'],
        fact: 'A hun udvar költőket tartott, akiknek egyetlen feladata a győzelmek utáni dicsőítő ének volt. Az előadás órákig tarthatott. Attila állítólag sosem unatkozott.',
        emotional: { prompt: 'Egy idős asszony halad el, két nehéz vizeskorsót cipelve. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Megállsz, és elviszed az egyik korsót a céljáig', result: 'Annyira meglepődik, hogy szólni sem tud. A kovács feljegyez valamit, amit nem látsz, és később megtanít egy szót egy régi nyelvjárásból.' },
            { kind: 'neutral', label: 'Erős, egész életében ezt csinálta', result: 'Könnyedén elhalad. Visszatérsz a rováshoz.' }
          ] } },

      'Ö': { word: 'Ökör', emoji: '🐂', meaning: 'Ökör', clue: 'Lassú, kitartó, megbízható. Nem siet, mégis mindent elhúz.',
        story: ['„Egy szár, két karral” — mondja a kovács, és egy függőlegest rajzol, jobbra két kinyúló ággal.',
          '„Ökör. Lassú, kitartó, megbízható. Nem siet, mégis mindent elhúz. A szár a járom, a két ág a két erős szarv.”'],
        fact: 'Az ökör húzta a sztyeppei szekereket, amelyeken egész falvak utaztak. Lassú volt, de a hun vándorlás nélküle sosem mozdult volna.' },

      'Ő': { word: 'Ős', emoji: '👴', meaning: 'Ős', clue: 'Ők a spirál mélyén, te a másik végén; a jelölő vonal a kapocs az időn át.',
        story: ['A kovács ugyanazt a befelé forduló spirált rajzolja, de felül egy jelölő vonással.',
          '„Ős. Ők ott vannak a spirál mélyén. Te itt a másik végén. A jelölő vonal a kapocs közöttetek — a beszélgetés az időn át.”'],
        fact: 'A magyarok szóban őrizték a leszármazást — az ősöket sorban felmondva, néha tizenöt-húsz nemzedékre vissza. Minden ősnek megvolt a rögzített helye a láncban.' },

      'P': { word: 'Pajzs', emoji: '🛡️', meaning: 'Pajzs', clue: 'A vonal az, ami áll; az ágak fogják fel, ami jön.',
        story: ['Ildikó egy függőlegest rajzol, három rövid ferde ággal — mint egy fésű.',
          '„Pajzs. A vonal az, ami áll. Az ágak fogják fel, ami jön. Szilárdság és fogás együtt.”'],
        fact: 'A hun pajzs könnyű fakeretre feszített bőr volt, arra építve, hogy hajoljon a becsapódás alatt, ne ellenálljon — könnyebb a rómainál, és nehezebb eltörni.',
        emotional: { prompt: 'Egy fiatalabb tanuló feldönti a gondosan kifaragott rovástábláidat. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Segítesz összeszedni — „ilyesmi megesik”', result: 'A megkönnyebbülése teljes. Ildikó figyel. „A pajzs többet véd, mint magadat” — mondja később.' },
            { kind: 'neutral', label: 'Csendben magad szeded össze', result: 'Szó nélkül összeszeded. Nem esett baj.' }
          ] } },

      'R': { word: 'Rács', emoji: '🪟', meaning: 'Rács', clue: 'Két függőleges rúd, közöttük egy átlós merevítő — mint egy ablakrács vagy kapu vasalása.',
        story: ['Ildikó két függőleges rudat rajzol, és egy átlót húz közéjük, bal alulról jobb felülre.',
          '„Rács. Két rúd, közöttük a merevítő átló — ez tartja meg a kaput, az ablakrácsot, a kerítést. Ami zárva tart, mégis átlátni enged.”'],
        fact: 'A magyar R-t pörgetve ejtjük — a nyelv hegye többször megrezzen. A rovó kezének is több vonás kellett hozzá: két szár és egy átló, mint egy kis rács.' },

      'S': { word: 'Sátor', emoji: '⛺', meaning: 'Sátor', clue: 'A legegyszerűbb tető; megtart a vihar ellen.',
        story: ['„A legegyszerűbb tető” — mondja Ildikó — két vonal egy csúcsig, semmi több. Egy fordított V.',
          '„Sátor. Az S-rovás egy sátor teteje. Egyszerű, és megtart a vihar ellen.”'],
        fact: 'A hun sátor a gyorsaságra épült — egy ezres tábor egy órán belül felszedhető és úton volt. Egyetlen római erőd sem érte ezt utol.' },

      'Sz': { word: 'Szál', emoji: '🧵', meaning: 'Szál', clue: 'Egyetlen egyenes vonal — egy szál fonal, egy szál fűszál. A legegyszerűbb jel.',
        story: ['Ildikó a legegyszerűbb rovást rajzolja — egyetlen függőleges vonalat. Egyenesen le. Semmi hozzáadva.',
          '„Szál. Egy szál fonal, egy szál fűszál, egy szál vonal. A legrövidebb rovás a leggyakoribb hangé — hiszen az „sz”-t kellett a legtöbbször vésni.”'],
        fact: 'Az „sz” a leggyakoribb magyar hangok közé tartozik — ezért kapta a leggyorsabb rovást, egyetlen vonást. Egy szál vonal, amit a véső egy mozdulattal lehúz.',
        emotional: { prompt: 'Valaki gúnyolódik, hogy az Sz-rovás túl egyszerű — „hogy jelenthet egy vonal bármit is?” Mit teszel?',
          choices: [
            { kind: 'heart', label: '„Egy vonal jelenthet mindent — gondolj a horizontra”', result: 'Csend. Aztán: „Ó.” Ildikó elmosolyodik. „Most magyaráztad el a magyar költészetet.”' },
            { kind: 'neutral', label: 'Hagyod, hadd válaszoljon Ildikó', result: 'Ugyanazt mondja, amit te gondoltál. Ezt megjegyzed.' }
          ] } },

      'T': { word: 'Tűz', emoji: '🔥', meaning: 'Tűz', clue: 'A szár a láng, egyenesen felfelé; a villa a két irány, amerre a szikra szétpattan.',
        story: ['„A T-rovás egy Y” — mondja Ildikó — egy függőleges szár, a tetején V-villával.',
          '„Tűz. A szár a láng, egyenesen felfelé. A villa a két irány, amerre a szikra szétpattan.”'],
        fact: 'A hunok tűzjelekkel adtak hírt a sztyeppén át — meggyújtott jelzések láncolata, amely egyetlen éjszaka alatt több száz mérföldre vitte az egyszerű üzenetet.' },

      'Ty': { word: 'Tyúk', emoji: '🐔', meaning: 'Tyúk', clue: 'Három irányba kapar a földön — előre és két oldalra.',
        story: ['Ildikó egy fordított V-t rajzol, középen megkettőzött szárral.',
          '„Tyúk. Három irányba kapar a földön — előre és két oldalra. Egy földelő vonal, két kereső ág.”'],
        fact: 'A házi tyúk jóval azelőtt elérte a sztyeppét, hogy a hunok elérték volna Nyugat-Európát — magukkal hozták. A rómaiaknak, akikkel harcoltak, szintén volt tyúkjuk. Furcsán kiegyenlítő.' },

      'U': { word: 'Utca', emoji: '🏘️', meaning: 'Utca', clue: 'Két oldal, közöttük a járható sáv — mint az utca a két házsor között.',
        story: ['Ildikó két függőleges oldalt rajzol, fent és lent egy-egy befelé mutató csúccsal.',
          '„Utca. A két oldal a házsor, közöttük a sáv, amin végigmész. A befelé álló csúcsok a kapuk, amelyek az utcára nyílnak. Minden út valahol utcává szelídül.”'],
        fact: 'Attila udvarát egy tisza-parti fapalota alkotta — gerendákból faragott épületek, mellette fürdőházzal, amelyhez Pannóniából hozattak követ. A bizánci követ Priszkosz, aki 449-ben járt ott, leírta az aranyedényeket, az arany trónt és az arany ágyat. A hun főváros nem kőből volt, de valódi főváros volt.',
        emotional: { prompt: 'Egy előtted lévő tanuló elveszi az utolsó jó vésőpálcát. A tiéd repedt, rosszul vág. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Dolgozol azzal, amid van — és megkérdezed, van-e valakinek tartaléka', result: 'Ketten is felajánlják egyszerre. „Egy utcán sem jársz egyedül” — mondja Ildikó. „Nem cipelhetsz mindent magad.”' },
            { kind: 'neutral', label: 'Működésre bírod a repedt pálcát', result: 'A rovás durvább, de teljes. Néha a nehezebb szerszám jobban tanít.' }
          ] } },

      'Ú': { word: 'Útvesztő', emoji: '🧩', meaning: 'Útvesztő', clue: 'Egy zárt négyszög, benne keresztező utakkal — a labirintus, ahol könnyű eltévedni.',
        story: ['„Az Ú az U, de bekerítve” — mondja Ildikó, és egy négyszöget rajzol, benne egy X-szel, amely sarokból sarokba fut.',
          '„Útvesztő. A falak bezárnak, az utak keresztezik egymást — aki nem figyel, körbe-körbe jár. Az Ú-rovás a hosszú út, amelyen el is lehet tévedni.”'],
        fact: 'A nyílt sztyeppén nem voltak útjelzők — a tájékozódás maga volt az útvesztő. A jó lovas a szélből, a fűből, a csillagokból olvasta ki az irányt, ahol más reménytelenül eltévedt.' },

      'Ü': { word: 'Üst', emoji: '🫕', meaning: 'Üst', clue: 'A tűz cikázó ereje, amely életre kelti, ami fölé van akasztva.',
        story: ['Ildikó egy villámot rajzol — éles, cikcakkos vonalat, amely úgy csap le, mint a láng nyelve az üst alatt.',
          '„Üst. A villám a tűz ereje, amely felforralja a bográcsot. Ez a rovás a befogadásról szól — mennyit bír el egy edény, ha jól készült.”'],
        fact: 'A közös üst volt minden hun tábor szíve — hatalmas, mindig égő. A teli üst biztonságos éjszakát jelentett. Az üres azt, hogy ideje továbbállni.' },

      'Ű': { word: 'Űrhajó', emoji: '🛸', meaning: 'Űrhajó', clue: 'Egy zárt, ovális test, négy kis nyúlvánnyal — egy hajó, amely a csillagok közt úszik.',
        story: ['A királyi hírnök egy kerek, ovális testet rajzol, a négy sarka felé egy-egy kis nyúlvánnyal.',
          '„Űrhajó. A test maga a jármű, a nyúlványok a szárnyai. A nagy űrben utazik — ott, ahol a csillagok közt nincs se fent, se lent. Az Ű-rovás ezt a végtelen utat fogja be.”'],
        fact: 'Az ősi magyar világkép a világot három részre osztotta: felső ég, középső (élők tere) és alsó alvilág — a kettő közé helyezve mindent, ami látható. A sámán dolga volt a határokat átjárhatóvá tenni, felfelé és lefelé egyaránt.',
        emotional: { prompt: 'Az utolsó lecke már majdnem véget ér. Rájössz, hogy egyetlen tanítódnak sem köszönted meg. Mit teszel?',
          choices: [
            { kind: 'heart', label: 'Mindegyiküknek megköszönöd, név szerint, egy-egy konkrét dolgot', result: 'Mindegyikük megáll — meglepetten, meghatottan. Ildikó: „A rovásokon túl is figyeltél.”' },
            { kind: 'neutral', label: 'Tiszteled az idejüket — a hála akkor is valódi, ha kimondatlan', result: 'Igaz. Tudják. A lecke véget ér.' }
          ] } },

      'V': { word: 'Víz', emoji: '💧', meaning: 'Víz', clue: 'Nem nyughat egyetlen csúcson. Két völgyet keres egyszerre.',
        story: ['A királyi hírnök egy „M”-et rajzol — két oszlopot, közöttük mély V-csúccsal, mint a hullámok.',
          '„Víz. Nem nyughat egyetlen csúcson. Két völgyet keres egyszerre. A rovás azt mutatja, amit a víz tesz — megtalál minden mélypontot.”'],
        fact: 'A hun birodalom több nagy folyón kelt át, mint bármelyik előtte — Don, Duna, Rajna. Minden átkelés hőstett volt. A folyókat lassan mozgó utakként kezelték.' },

      'Z': { word: 'Zászló', emoji: '🏴', meaning: 'Zászló', clue: 'A fokok a szélben lobogó szövet redői — soha nem nyugszanak.',
        story: ['A hírnök egy létrát rajzol — két függőlegest, ferde fokokkal.',
          '„Zászló. Minden sereg ezzel hirdette magát. A fokok a szélben lobogó szövet redői — soha nem nyugszanak, mindig a szelet olvassák.”'],
        fact: 'A hun zászlók szélzsák-szövetből készültek, amelyek megteltek levegővel, és vízszintesen lobogtak, nagy távolságból láthatóan. Rémítésre építették őket. Sikerült.' },

      'Zs': { word: 'Zsákmány', emoji: '⚔️', meaning: 'Zsákmány', clue: 'A csatában elnyert díj; a név, amelyet kőbe vésve hagyunk magunk után.',
        story: ['A hírnök az utolsó rovást rajzolja: egy villás tetőt, a száron egyetlen vízszintes vonallal — mint a Dzs, de egyszerűbben.',
          '„Zsákmány. A csatában elnyert díj. Attila üzenete itt ér véget, ezzel a rovással. A zsákmány sosem a föld volt. Sosem az arany. Mindig ez: a név, amelyet kőbe vésve hagyunk magunk után.”'],
        fact: 'A történészek máig nem értenek egyet abban, mit akart valójában Attila. A korabeli források inkább az elismerésre, mint a területre mutatnak. Az utolsó rovás, a Zsákmány, ebben a fényben kap értelmet.' }
    },

    isten: {
      word: 'ISTEN',
      subtitle: 'az Égi Erő',
      sequence: [
        { letter: 'I', fromWord: 'Iránytű', emoji: '🧭', meaning: 'Iránytű' },
        { letter: 'S', fromWord: 'Sátor',   emoji: '⛺', meaning: 'Sátor' },
        { letter: 'T', fromWord: 'Tűz',     emoji: '🔥', meaning: 'Tűz' },
        { letter: 'E', fromWord: 'Erdő',    emoji: '🌲', meaning: 'Erdő' },
        { letter: 'N', fromWord: 'Nap',     emoji: '☀️', meaning: 'Nap' }
      ],
      text: [
        'Ez volt Attila üzenete. Nem harci parancs. Nem hódító rendelet.',
        'Csak ennyi: a legősibb szó, amelyet a hun nép a sztyeppén át hordozott — annak az erőnek a neve, amely az égben lakik, úgy mutat irányt, mint az iránytű, melegít, mint a tűz, és otthont ad, mint az erdő.',
        'Megtanultad mind a negyven betűt. Most már tiéd a szó. A rovásírás a tiéd.'
      ],
      // Rovás was written right-to-left — highlighted on the reveal screen and the ending screen.
      rtlNote: 'A rovást jobbról balra írták — ahogy ebben a játékban is látod. Az I a jobb oldalon áll, az N a balon: így rakta le a hun írnok is.'
    },

    intro: {
      title: 'ROVÁSÍRÁS',
      subtitle: 'Attila üzenete',
      lines: [
        'Egy gyermek vagy egy faluban a nagy sztyeppén, Attila, a hun király korában.',
        'Üzenet érkezett — ősi rovásokkal írva. De még nem tudod elolvasni.',
        'A falu négy tanítója megtanít a teljes rovásábécére. Amikor mind a 40 betűt ismered, megfejted, mit írt a király.'
      ]
    },

    scoring: {
      ranks: [
        { min: 5, title: 'A Sztyeppe Szíve' },
        { min: 3, title: 'A Nép Barátja' },
        { min: 0, title: 'A Rovások Szorgos Tanulója' }
      ]
    },

    // Offhand remarks for a wrong answer (verbatim from the concept document).
    feedback: {
      wrong: [
        'A rovás türelmes. Próbáld újra.',
        'A táltos úgy tesz, mintha nem látta volna.',
        'Ilona nagyon igyekszik nem nevetni.',
        'Még a lovak is felnéztek a fűből erre.',
        'A történelem ezt a kísérletet nem fogja feljegyezni.',
        'A tanulás fontos lépése: a rossz lépés.',
        'Majdnem. (Nem majdnem. De a szándék jó.)'
      ],
      right: [
        'Tiszta vonás! ⭐',
        'A rovás meghajol előtted.',
        'Ilona bólint. Ez az.',
        'A tűz egy kicsit fényesebben ég.',
        'Pontos. Mint a kőbe vésett jel.'
      ]
    },

    // ── Real rovás relics (admirable at the end of a lesson) ───
    // Friedrich Klára: „Útmutató a magyar rovásírás tanításához", chapter I/6.
    // type 'photo' → assets/relics/<img>.jpg ; type 'text' → an inscription
    // drawn with the game's glyphs (wordToRunes). Image sources: assets/relics/CREDITS.md.
    relics: {
      1:  { type: 'photo', img: 'szarvas',        name: 'Szarvasi tűtartó',         place: 'Szarvas · avar kor',          date: '7–8. század',  note: 'Csontból faragott női tűtartó — a legkorábbi rovásemlékek egyike.' },
      2:  { type: 'photo', img: 'marsigli',       name: 'Rovás botnaptár',          place: 'Gyergyószárhegy (Marsigli-másolat)', date: '12–13. század', note: 'Egész évet jelölő, fába rótt naptár — közel kétszáz szóból áll.' },
      3:  { type: 'photo', img: 'vargyas',        name: 'Vargyasi keresztelőmedence', place: 'Vargyas, Erdély',           date: '12. század',   note: 'Kőbe vésve; a „Mihály" szó biztosan kiolvasható rajta.' },
      4:  { type: 'text',  text: 'Atyaisten',     name: 'Bögözi templom',           place: 'Bögöz, Székelyföld',          date: '15–16. század', note: 'A falfestménybe vörös krétával írták. Megfejtése: „Atyaisten".' },
      5:  { type: 'photo', img: 'nikolsburg',     name: 'Nikolsburgi ábécé',        place: 'Mátyás király kora',          date: '1483',         note: 'Pergamenre írt teljes rovásábécé — az Országos Széchényi Könyvtár őrzi.' },
      6:  { type: 'text',  text: 'Pál',           name: 'Gelencei templom',         place: 'Gelence, Székelyföld',        date: '1497',         note: 'Pál pap karcolta a nevét a templom falfestményébe.' },
      7:  { type: 'photo', img: 'csikszentmarton', name: 'Csíkszentmártoni felirat', place: 'Csíkszentmárton',            date: '1501',         note: 'A templomfelirat a készítő mesterek nevét őrzi; csak másolatban maradt fenn.' },
      8:  { type: 'text',  text: 'Miklós',        name: 'Székelyderzs',             place: 'Székelyderzs, Erdély',        date: '15. század',   note: 'Téglába karcolt, rövidítéses felirat. Olvasata: „Miklós szentelő pap".' },
      9:  { type: 'photo', img: 'konstantinapoly', name: 'Konstantinápolyi felirat', place: 'Isztambul, követjárás',      date: '1515',         note: 'Kedeji Székely Tamás véste kőbe a hosszú szultáni várakozás alatt.' },
      10: { type: 'text',  text: 'Dálnok',        name: 'Dálnoki templom',          place: 'Dálnok, Székelyföld',         date: '1526',         note: 'Vakolatba karcolt, majd kifestett felirat — több olvasata is van.' },
      11: { type: 'text',  text: 'Homoród',       name: 'Homoródkarácsonyfalva',    place: 'Erdély',                      date: 'kb. 13. század', note: 'Templom kövébe rótt, sokat kutatott felirat.' },
      12: { type: 'text',  text: 'Attila',        name: 'Bél Mátyás műve',          place: 'Felvidék',                    date: '1718',         note: 'Bél Mátyás püspök ábécét és Attila hun király rovásfeliratos pénzét is bemutatta.' },
      13: { type: 'photo', img: 'enlaka',         name: 'Énlakai mennyezet',        place: 'Énlaka, unitárius templom',   date: '1668',         note: 'Musnai György kispap festette a kazettás mennyezetre: „Egy az Isten".' }
    },

    // ── Rovás numerals (chapter III/5 of the guide) ───────────
    numerals: {
      intro: 'A rovás számok — mint a rómaiaknál — egyenes vonalakból állnak, és jobbról balra olvasandók. Érdekesség: nincs bennük nulla!',
      signs: [
        { v: '1', desc: 'egy vonás' }, { v: '5', desc: 'ék (V)' }, { v: '10', desc: 'kereszt (X)' },
        { v: '50', desc: 'ék + szár' }, { v: '100', desc: 'csillagforma' }, { v: '1000', desc: 'teljes csillag' }
      ],
      examples: [
        { n: '7', signs: ['1', '1', '5'], say: 'öt meg kettő' },
        { n: '2026', signs: ['1', '5', '10', '10', '1000', '1000'], say: 'kettő-ezer-húsz-hat' }
      ],
      tip: 'A betűk és a számok szépen illenek egymáshoz — mindkettő könnyen róható egyenesekből épül.'
    },

    // ── Showcase of rovás alphabets (several variants) ─────────
    alphabets: {
      intro: 'A rovásírást több mint ezer éven át kézzel rótták fába, kőbe — pap, pásztor, diák egyaránt. Mivel nem volt nyomda, koronként és vidékenként kissé másképp formálták a jeleket. Íme néhány ábécé:',
      variants: [
        { title: 'A mi ábécénk — Forrai Sándor nyomán', kind: 'glyphs',
          note: 'Ezt tanítja a legtöbb rovásoktató, és ezt használja ez a játék. A magyar ábécé mind a 40 szabványos betűjét tartalmazza — a hiteles, faragott vonalvezetéssel.' },
        { title: 'Kiegyenesített változat', kind: 'balanced',
          note: 'Ugyanazok a betűvázak, mint a Forrai-félében, de egyenletes vastagságú vonalakkal — kezdőnek könnyebb erről rajzolni. A fenti kapcsolóval választhatod ki, melyik formával játssz; a felismerő mindkettőt elfogadja.' },
        { title: 'Egységes (szabványos) ábécé', kind: 'image', img: 'rovas.webp',
          note: 'A Rovás Alapítvány egységes ábécéje. Néhány betű (pl. O, F, Cs) alakja kicsit eltér a Forrai-félétől — ugyanaz a hang, más vonalvezetés.' },
        { title: 'Magyar Adorján ábécéje', kind: 'image', img: 'assets/relics/magyar-adorjan.jpg',
          note: 'Magyar Adorján (1887–1978) néprajzkutató díszes ábécéje. Ő tette általánossá a hosszú magánhangzók (Á, É, Í, Ó, Ő, Ú, Ű) külön jelét, amelyek a régi emlékekből gyakran hiányoztak.' },
        { title: 'Nikolsburgi ábécé (1483)', kind: 'image', img: 'assets/relics/nikolsburg.jpg',
          note: 'Mátyás király korából, pergamenre írva — egy igazi történelmi ábécé az Országos Széchényi Könyvtárból.' }
      ],
      why: [
        'Kor és vidék: a középkori emlékek és a mai jelek alakja eltér egymástól.',
        'Hosszú magánhangzók (á, é, í, ó, ő, ú, ű): külön jelüket főként Magyar Adorján tette általánossá a 20. században — a régi ábécékből gyakran hiányoztak.',
        'Iskolák: ma több hagyomány él egymás mellett — a Forrai Sándor-féle, az egységes (szabványos) és Magyar Adorján ábécéje.',
        'Kézírás: mindenkinek egyéni az írásképe, akárcsak a latin betűknél — ezért rajzolásnál a hiteles és a kiegyenesített formát is elfogadjuk.'
      ],
      source: 'A formák forrása: Friedrich Klára „Útmutató a magyar rovásírás tanításához".'
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  root.ROVAS_DATA = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
