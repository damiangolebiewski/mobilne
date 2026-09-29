# INF.04 — Aplikacje mobilne (portal kursu)

Lokalny portal edukacyjny przygotowujący do części **„Aplikacja mobilna”** egzaminu zawodowego INF.04.
Kurs zaprojektowano odwrotnie od wymagań egzaminu: najpierw analiza 7 zadań mobilnych z 16 arkuszy (`ANALIZA_INF04_MOBILE.md`), potem program (`PLAN_KURSU.md`), ćwiczenia, zadania transferowe i próbne egzaminy.

- **Technologia kursu:** Android Studio · Java · układy XML (`LinearLayout`) — uzasadnienie w analizie (pkt 2).
- **Zakres:** 15 bloków × 4 godziny lekcyjne = 60 godzin dydaktycznych, praca samodzielna ucznia.

## Uruchomienie portalu

1. Skopiuj cały folder `INF04_MOBILE` na dysk (lub rozpakuj archiwum).
2. Otwórz plik **`index.html`** w przeglądarce (dwuklik). Zalecane: **Google Chrome** lub **Microsoft Edge**.
3. Nie potrzeba Internetu, serwera, Node.js, PHP ani bazy danych. Wszystkie style, skrypty i obrazy są lokalne.

> Firefox otwierający pliki z dysku może zapisywać postęp osobno dla każdej strony. Do śledzenia postępu używaj Chrome/Edge.

## Tryb online: praca w domu i podgląd postępu przez nauczyciela (opcjonalnie)

Portal można umieścić w internecie (Netlify albo GitHub Pages). Po włączeniu zapisu postępu przez Google Apps Script:

- uczeń loguje się imieniem i nazwiskiem, kodem klasy i własnym PIN-em;
- postęp jest wspólny dla szkoły, domu i telefonu;
- bez internetu uczeń pracuje dalej, a zmiany zapisują się, gdy połączenie wróci;
- nauczyciel widzi wszystkich uczniów w `nauczyciel.html` (panel z hasłem, eksport CSV, reset PIN) i w swoim Arkuszu Google (zakładka *Postep*).

Instrukcja krok po kroku (ok. 20 min): **`materialy/wdrozenie_online.html`**.
Kod serwera do wklejenia w Apps Script: `serwer/Code.gs`.
Włącznik trybu online: adres w `js/config.js` (pusty = tryb offline).

## Wymagane środowisko do zadań (aplikacje mobilne)

- **Android Studio** (dowolna aktualna wersja) z Android SDK i emulatorem (np. Pixel 5, API 30–34).
- Projekt: *New Project → **Empty Views Activity*** → Language: **Java**.
- Portal jest instrukcją i zbiorem materiałów; aplikacje uczeń tworzy w Android Studio (portal ich nie uruchamia).

## Struktura katalogów

```text
INF04_MOBILE/
├── index.html                  strona główna (15 bloków, postęp, statusy)
├── wyniki.html                 Moje wyniki (postęp, mini-testy, zadania kontrolne, czas pracy, druk, reset)
├── nauczyciel.html             panel nauczyciela (tryb online)
├── README.md                   ten plik
├── ANALIZA_INF04_MOBILE.md     analiza arkuszy, częstotliwość kompetencji, mapa pokrycia
├── PLAN_KURSU.md               program 15 bloków (60 h)
├── TODO.md                     lista etapów prac
├── bloki/blok01.html … blok15.html
├── sciaga/android.html         szybka ściąga — aplikacje mobilne INF.04
├── sciaga/java.html            ściąga z potrzebnej Javy
├── sciaga/procedura.html       procedura egzaminacyjna i lista kontrolna oddania
├── zadania/index.html          lista wszystkich zadań z linkami i statusem
├── rozwiazania/<zadanie>/      pliki rozwiązań: activity_main.xml, MainActivity.java (+ list_item.xml)
├── materialy/                  archiwa zasobów do zadań (zasoby_<zadanie>.zip), przewodnik nauczyciela, wdrożenie online
├── serwer/Code.gs              skrypt Google Apps Script (zapis postępu do Arkusza Google)
├── assets/zasoby/              obrazy i pliki do zadań (własne grafiki kursu)
├── css/style.css
└── js/config.js (adres serwera), data.js, progress.js, sync.js, quiz.js, app.js, teacher.js
```

## Jak korzystać z kursu

1. Na stronie głównej wybierz blok wskazany przez nauczyciela → **Rozpocznij / Kontynuuj**.
2. Każdy blok ma stałą strukturę: Cel → Przypomnienie → Przykład → Mikroćwiczenia → Zadanie prowadzone → Zadanie samodzielne → Zadanie w stylu INF.04 → Checklista → Mini-test → Skończyłeś wcześniej?
3. Silniejsi uczniowie mogą z menu bloku przejść od razu do **zadania samodzielnego**.
4. Podpowiedzi do zadań mają 5 poziomów (kierunek → wskazówka → pseudokod → fragment → pełne rozwiązanie) i są domyślnie zwinięte.
5. Po wykonaniu zadania kliknij **Oznacz zadanie jako wykonane**; na końcu bloku rozwiąż mini-test i kliknij **✓ Oznacz blok jako ukończony** (można cofnąć).
6. Zasoby do zadań (obrazy, pliki) pobierzesz przy zadaniu lub z folderu `materialy/`; obrazy kopiuj do `app/src/main/res/drawable`.

## Moje wyniki

Strona `wyniki.html` pokazuje: ukończone bloki (z datą), procent kursu, wyniki mini-testów (ostatni, najlepszy, liczba podejść) oraz zadania kontrolne (INF.04 i próbne egzaminy). Przycisk **Drukuj podsumowanie** tworzy wydruk dla nauczyciela.

## Resetowanie postępu

`wyniki.html` → sekcja **Reset postępu** → „Resetuj postęp” → potwierdź „Tak, usuń”.
W trybie offline postęp jest zapisany wyłącznie w przeglądarce (localStorage) na danym komputerze, więc wyczyszczenie danych przeglądarki również go usuwa. W trybie online zalogowany uczeń resetuje także swój postęp na serwerze.

## Dla nauczyciela

- `materialy/przewodnik_nauczyciela.html` — organizacja zajęć, propozycja oceniania, oddawanie prac.
- `materialy/wdrozenie_online.html` i `nauczyciel.html` — konta uczniów i podgląd postępu całej klasy.
- Checklisty zadań INF.04 mogą służyć jako kryteria punktowania.
- Kod wszystkich 56 rozwiązań (przykłady i zadania) skompilowano kompilatorem Javy względem odtworzonych sygnatur Android API (stuby) i sprawdzono walidatorem XML (atrybuty, identyfikatory, zasoby). Rozwiązania nie były uruchamiane w emulatorze — przed pierwszymi zajęciami warto uruchomić 2–3 z nich na stanowisku szkolnym.
