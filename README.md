<!--
  public/README.md — the README shipped to the PUBLIC mirror (github.com/sicambria/rovas-tanulas).
  Dev-only overlay: tools/build-public.js copies this over README.md in the curated
  Hungarian-only build. Keep it free of dev info (tests, tooling, internal docs).
-->
# Rovásírás — Attila üzenete 🔥

Magyar nyelvű oktatójáték, amely **Attila hun király korában** (5. századi sztyeppe)
tanítja meg a magyar ábécé **mind a 40 szabványos rovásjelét**. A négy falubeli
tanító (és a királyi hírnök) leckéről leckére vezet végig, amíg meg nem fejted a
király üzenetét: **ISTEN**.

> ▶️ **Játszd online:** <https://sicambria.github.io/rovas-tanulas/>
> *(telefonon a böngésző menüjéből „Hozzáadás a kezdőképernyőhöz" — így appként, internet nélkül is fut)*

- 🎯 **8 éves kortól** — biztonságos, bukás nélküli tanulás, mindig újrapróbálható
- 📱 **Mobil-első**, érintőbarát, telepíthető (PWA), és **internet nélkül is fut**
- 🧩 **13 lecke**, 3 minijáték-típus (felismerés, párosítás, történeti nyomok)
- ✍️ **Rajzold le a jeleket!** Minden új betűnél előbb átrajzolod a mintát, majd
  fejből is megpróbálod — a rajzot **$P pont-felhő felismerő** értékeli (nem
  neurális háló): toleráns a remegésre, de a rossz formát nem fogadja el
- 🔁 **Spaced repetition** (Leitner): a „Gyakorlás" a régen látott betűket hozza
  vissza a tartós memorizálásért
- 🎓 **Vizsga mód:** betű- és szófelismerés oda-vissza, betű- és szórajzolás
  (álló cellákba), végül **záróvizsga** ranggal
- 👤 **Több profil** — egy gépen az egész család játszhat; a jelszó nem kötelező
- 📖 **Rovás ábécék** ismertető: több ábécé (Forrai, egységes, Nikolsburg 1483)
  összevetése — miért különböznek?
- 🏺 **Valós rovásemlékek** minden lecke végén (Szarvas, Nikolsburg, Énlaka
  „Egy az Isten"…) — szabad licencű fotók, ill. hiteles felirat-kártyák
- 🔢 **Számrovás** referencia: a rovás számjelek és írásmódjuk
- ❤️ Érzelmi pillanatok: a kedves döntés szívet ad, és eldönti a záró rangot
- 🎵 Hangulatos **háttérzene** (lásd [`music/CREDITS.md`](music/CREDITS.md))

## Futtatás

Statikus oldal, build és telepítés nélkül — nyisd meg a **[játékot online](https://sicambria.github.io/rovas-tanulas/)**,
vagy töltsd le ezt a mappát, és szolgáld ki bármilyen statikus webszerverrel.

> Megjegyzés: a service worker (offline mód) `http(s)://`-en aktiválódik;
> `file://`-ből megnyitva a játék fut, csak az offline gyorsítótár marad ki.

## Rovás-helyesség

A jelek a **Forrai Sándor-ábécét** követik, ahogy Friedrich Klára
*„Útmutató a magyar rovásírás tanításához"* tanítja — a magyar rovásoktatás
standard hivatkozása. A rovást jobbról balra írták.

## Köszönet

- A **háttérzenét** és a **rovásemlék-fotókat** szabad licencek alatt használjuk —
  a teljes forrás- és szerzőlista: [`music/CREDITS.md`](music/CREDITS.md) és
  [`assets/relics/CREDITS.md`](assets/relics/CREDITS.md).

## Kapcsolódó

- **[osiorokseg.hu](https://osiorokseg.hu)** — Ősi Örökség: a magyar rovásírás élő öröksége
- **[rovasirasforrai.hu](https://www.rovasirasforrai.hu/Rovasiras/A-magyar-rovasiras-legfontosabb-szabalyai.htm)** — A magyar rovásírás legfontosabb szabályai (Forrai)

## Licenc

[GNU Affero General Public License v3.0 vagy újabb (AGPL-3.0-or-later)](LICENSE).

Szabadon használhatod, tanulmányozhatod, módosíthatod és terjesztheted. Ha a
játékot (vagy származékát) módosítva **hálózaton keresztül** teszed elérhetővé,
a módosított forráskódot is hozzáférhetővé kell tenned a felhasználók számára,
ugyanezen licenc alatt. A teljes szöveg a [`LICENSE`](LICENSE) fájlban.

`SPDX-License-Identifier: AGPL-3.0-or-later`
