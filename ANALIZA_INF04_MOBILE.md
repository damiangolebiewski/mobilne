# Analiza arkuszy INF.04 — część „Aplikacja mobilna”

Materiał źródłowy: jeden scalony plik PDF (61 stron A4, 16 arkuszy egzaminacyjnych bez stron tytułowych).
Analiza wykonana na podstawie tekstu i ilustracji (zrzutów ekranu emulatora) zawartych w PDF.

Oznaczenia faktów i założeń:

- **[F]** — fakt wynikający bezpośrednio z arkuszy,
- **[P]** — wiedza pomocnicza: nie występuje w arkuszach jako osobne wymaganie, ale jest potrzebna do wykonania zadań.

---

## 1. Lista rozpoznanych arkuszy i strony PDF

W PDF nie ma stron tytułowych, więc **symbole arkuszy (np. INF.04-XX-YY.ZZ) ani daty sesji nie są widoczne**. Zgodnie z zasadą „nie zgaduj” stosuję oznaczenia neutralne `Arkusz_01 … Arkusz_16` w kolejności występowania w PDF. Każdy arkusz zaczyna się nagłówkiem „Zadanie egzaminacyjne” (numeracja „Strona 2 z N” potwierdza brak strony tytułowej).

| Arkusz | Strony PDF | Część I (konsola) | Część II | Część mobilna — strony |
|---|---|---|---|---|
| Arkusz_01 | 1–3 | sortowanie przez wybieranie (malejąco) | **mobilna: „Rejestruj konto”** | 1–3 |
| Arkusz_02 | 4–6 | wyszukiwanie z wartownikiem | **mobilna: „Domek w górach” (licznik polubień)** | 4–6 |
| Arkusz_03 | 7–11 | klasa Osoba (konstruktory, pole statyczne) | web (Angular/React): zapisy na kurs | — |
| Arkusz_04 | 12–14 | NWD — algorytm Euklidesa | desktop: dodaj pracownika + generator hasła | — |
| Arkusz_05 | 15–18 | klasa notatka | **mobilna: notatki na liście (ListView)** | 15–18 (pomoc do list: 18) |
| Arkusz_06 | 19–21 | sito Eratostenesa | desktop: nadaj przesyłkę (radio → obraz, walidacja kodu) | — |
| Arkusz_07 | 22–24 | sortowanie bąbelkowe + test | **mobilna: właściwości czcionki (SeekBar)** | 22–24 |
| Arkusz_08 | 25–28 | klasa film (get/set) | web: formularz filmu | — |
| Arkusz_09 | 29–31 | walidacja PESEL | desktop: dane paszportowe (obraz wg nazwy pliku) | — |
| Arkusz_10 | 32–36 | klasa narzędzi tekstowych | **mobilna: wizyta u weterynarza** | 33–34 (pomoc: 36) |
| Arkusz_11 | 37–39 | odczyt albumów z pliku | desktop: MojeDźwięki (nawigacja poprz./nast.) | — |
| Arkusz_12 | 40–43 | gra w kości (konsola) | **mobilna: gra w kości (5 obrazów)** | 42–43 |
| Arkusz_13 | 44–47 | dziedziczenie: pralka, odkurzacz | **mobilna: urządzenia domowe** | 46–47 |
| Arkusz_14 | 48–53 | klasa operacji na tablicy | web: kategorie zdjęć | — |
| Arkusz_15 | 54–56 | loteria 6 z 49 | desktop: wzornik kolorów RGB (suwaki) | — |
| Arkusz_16 | 57–61 | szyfr Cezara + testy jednostkowe | desktop: szyfrowanie z zapisem do pliku | — |

**Podsumowanie:** 16 arkuszy → **7 zawiera aplikację mobilną** (01, 02, 05, 07, 10, 12, 13), 6 desktopową, 3 webową.
Dalsza analiza dotyczy 7 zadań mobilnych. Zadania desktopowe są wykorzystane wyłącznie pomocniczo (patrz pkt 8.3) — mają wiele wspólnych wzorców z zadaniami mobilnymi.

### Dwie „generacje” zadań mobilnych [F]

| Cecha | Arkusze 01, 02, 05, 07 | Arkusze 10, 12, 13 |
|---|---|---|
| Emulator na ilustracjach | Nexus 5X API 29 x86 / Android Oreo | Pixel 5 |
| Drugie środowisko na ilustracjach | Xamarin, MS Visual Studio | .NET MAUI |
| Złożoność | 1 mechanizm (formularz, licznik, lista, suwak) | 2–4 mechanizmy w jednej aplikacji |
| Specyfikacja wyglądu | kolory, rozmiary, rozkład | dodatkowo konkretne marginesy (5, 9, 10, 20), wysokości obrazów (60, 150) |

Wniosek: nowsze zadania **łączą kilka mechanizmów** i precyzyjniej opisują wygląd. Kurs musi prowadzić do zadań złożonych, a nie kończyć się na pojedynczym przycisku.

---

## 2. Technologie występujące w zadaniach mobilnych [F]

| Element | Co mówią arkusze |
|---|---|
| Środowisko | Polecenie: „za pomocą środowiska programistycznego dostępnego na stanowisku egzaminacyjnym”. Na **wszystkich 7** arkuszach ilustracje z **Android Studio** + równolegle Xamarin (01, 02, 05, 07) lub .NET MAUI (10, 12, 13). |
| Język interfejsu | Każdy arkusz: „Interfejs użytkownika zapisany za pomocą **języka znaczników** wspieranego w danym środowisku (np. XAML, XML)”. |
| Rozkład | Każdy arkusz: „rozkład liniowy (**Linear** / Stack lub inny o tej idei)”; 5/7 wymaga **zagnieżdżonego rozkładu horyzontalnego**. |
| Język logiki | Pomoc „dla środowiska AndroidStudio” (Arkusz_05 s.18, Arkusz_10 s.36) podana jest w **Javie**: `ArrayAdapter<String>`, `new AdapterView.OnItemClickListener() {…}`, `new OnSeekBarChangeListener() {…}`, `notifyDataSetChanged()`. Pomoc dla Xamarin/MAUI — w C#. |
| Oddawane pliki | „plik źródłowy interfejsu użytkownika (XAML lub XML) oraz plik źródłowy kodu skojarzonego z interfejsem” + `mobilna.zip` (całość projektu). |
| Kotlin | nie występuje w żadnym arkuszu. |
| Jetpack Compose | nie występuje; wymóg „język znaczników XML/XAML” wyklucza budowę UI wyłącznie w Compose. |

### Decyzja technologiczna kursu

**Android Studio + Java + układy XML (LinearLayout).**

Uzasadnienie:

1. Android Studio pojawia się na ilustracjach **każdego** zadania mobilnego (7/7).
2. Jedyny kod pomocniczy dla Android Studio w arkuszach jest napisany w **Javie** — uczeń na egzaminie dostanie podpowiedzi w tym języku.
3. Wymóg interfejsu w języku znaczników jest spełniany wprost przez `activity_main.xml`.
4. Alternatywa (.NET MAUI + XAML + C#) jest równorzędna formalnie, ale kurs nie miesza technologii — uczeń uczy się jednej ścieżki do poziomu samodzielności. Tabela odpowiedników MAUI jest dołączona w ściądze jako informacja, nie jako materiał do nauki.

[P] Nowe wersje Android Studio domyślnie proponują Kotlin — uczeń musi przy tworzeniu projektu świadomie wybrać **Language: Java** i szablon **Empty Views Activity** (nie „Empty Activity”, który tworzy projekt Compose).

---

## 3. Szczegółowa analiza każdego zadania mobilnego

### Arkusz_01 — „Rejestruj konto” (s. 1–3)

| Aspekt | Wymagania |
|---|---|
| Interfejs | 4 napisy (TextView), 3 pola edycyjne (EditText), 1 przycisk, obszar komunikatów (TextView) |
| Układ | LinearLayout pionowy; pola edycyjne na całą szerokość; przycisk i komunikat wyśrodkowane |
| Dane wejściowe | e-mail (podpowiedź „email”), hasło ×2 (ukrywanie znaków) |
| Logika | czy e-mail zawiera „@”; czy hasło == powtórzone hasło; kolejność komunikatów |
| Zdarzenia | kliknięcie „ZATWIERDŹ” |
| Wynik | tekst w obszarze komunikatów: start „Autor <PESEL>”, „Nieprawidłowy adres e-mail”, „Hasła się różnią”, „Witaj <e-mail>” |
| Zasoby | brak |
| Wygląd | tło tytułu Teal #008080, kolory czcionki czarny/biały, tytuł wizualnie większy |
| Wiedza | `getText().toString()`, `contains("@")`, `equals()`, `if / else if`, `inputType="textPassword"`, `hint`, `setText()` |

### Arkusz_02 — „Domek w górach” (s. 4–6)

| Aspekt | Wymagania |
|---|---|
| Interfejs | tytuł, obraz z archiwum, 3 przyciski obok siebie, napis licznika, linia pozioma, „Opis” (pogrubiony), opis szary |
| Układ | pionowy LinearLayout + **zagnieżdżony poziomy** dla przycisków; padding górny 20dp; obraz na całą szerokość; licznik wyrównany do prawej |
| Dane wejściowe | brak pól — tylko przyciski |
| Logika | licznik: ++ przy „POLUB”, -- przy „USUŃ”, **nie mniej niż 0** |
| Zdarzenia | 2 przyciski (trzeci „ZAPISZ” bez akcji) |
| Wynik | „<x> polubień” |
| Zasoby | `obraz.jpg` → `res/drawable` |
| Wygląd | tło przycisków i ich rozkładu Teal #008080, czcionka przycisków biała, opis Gray #808080, tytuł największy, linia Gray (lub prostokąt wys. 1) |
| Wiedza | pole klasy jako stan, `setText(x + " polubień")`, `ImageView`, `layout_weight`, `gravity="end"`, `View` jako linia |

### Arkusz_05 — Notatki na liście (s. 15–18)

| Aspekt | Wymagania |
|---|---|
| Interfejs | EditText (podpowiedź „Nowy element”), przycisk „DODAJ”, ListView |
| Układ | pionowy + **poziomy** dla pola i przycisku |
| Dane wejściowe | treść notatki |
| Logika | dopisanie do kolekcji; 3 notatki startowe (z pliku `dane.txt`) |
| Zdarzenia | kliknięcie „DODAJ” |
| Wynik | nowy element jako **ostatni** na liście, automatyczne odświeżenie |
| Zasoby | `dane.txt` (treść 3 notatek) |
| Wygląd | przycisk Crimson #DC143C, biała czcionka; separator listy Crimson, widoczny (wysokość) |
| Wiedza | `ArrayList<String>`, `ArrayAdapter`, `setAdapter`, `add()`, `notifyDataSetChanged()`, `divider`, `dividerHeight`; w pomocy: `ArrayAdapter(this, R.layout.…, R.id.…, lista)`, `Arrays.asList` |

### Arkusz_07 — Właściwości czcionki (s. 22–24)

| Aspekt | Wymagania |
|---|---|
| Interfejs | tytuł, „Rozmiar: ”, SeekBar, napis cytatu, przycisk „>>” |
| Układ | pionowy; marginesy strony 20; wszystkie pola na szerokość strony; przycisk wyśrodkowany |
| Dane wejściowe | pozycja suwaka |
| Logika | rozmiar czcionki = wartość suwaka (liczba całkowita); cykliczna zmiana 3 tekstów z **tablicy 3-elementowej** („Dzień dobry” → „Good morning” → „Buenos dias” → „Dzień dobry” …) |
| Zdarzenia | zmiana suwaka, kliknięcie przycisku |
| Wynik | „Rozmiar: <wartość>”, zmieniony rozmiar i tekst cytatu |
| Zasoby | brak |
| Wygląd | tło #558B2F, czcionka czarna/biała; tytuł największy i pogrubiony; „Rozmiar:” średni; SeekBar max 40; tekst przycisku wyśrodkowany i pogrubiony |
| Wiedza | `OnSeekBarChangeListener.onProgressChanged`, `setTextSize()`, `String[]`, indeks modulo |

### Arkusz_10 — Wizyta u weterynarza (s. 33–34, pomoc s. 36)

| Aspekt | Wymagania |
|---|---|
| Interfejs | tytuł, EditText (właściciel), „Gatunek”, ListView (Pies, Kot, Świnka morska), „Ile ma lat?” + „0” + SeekBar, EditText „Cel wizyty”, **pole czasu** (16:00), przycisk „OK” |
| Układ | pionowy + **poziomy** dla wieku (napisy + suwak); wysokość listy dopasowana do liczby elementów |
| Dane wejściowe | tekst, wybór z listy, suwak, tekst, czas |
| Logika | wybór gatunku zmienia **maksimum suwaka** (18/20/9); wiek zawsze całkowity |
| Zdarzenia | kliknięcie elementu listy, zmiana suwaka, kliknięcie przycisku |
| Wynik | wartości połączone **przecinkami** — napis pod przyciskiem **albo** okno komunikatu |
| Zasoby | brak |
| Wygląd | główny rozkład LightGreen #90EE90; tytuł większy, tło SeaGreen #2E8B57, padding 10 |
| Wiedza | `setOnItemClickListener`, `getItemAtPosition`, `setMax()`, `onProgressChanged`, `TimePicker`/pole czasu, konkatenacja, `Toast`/`AlertDialog` lub TextView |

### Arkusz_12 — Gra w kości (s. 42–43)

| Aspekt | Wymagania |
|---|---|
| Interfejs | tytuł z numerem zdającego, „RZUĆ KOŚĆMI”, **5 obrazów** (start: question.jpg), „Wynik tego losowania: ”, „Wynik gry: ”, „RESETUJ WYNIK” |
| Układ | pionowy + **poziomy** dla 5 obrazów; obrazy widoczne w całości, nie stykają się, wypełniają szerokość (np. wys. 60, marginesy 9); marginesy górny/dolny 10 |
| Dane wejściowe | brak — losowanie |
| Logika | 5 liczb 1–6; punkty = suma oczek tych wartości, które wystąpiły **≥ 2 razy**; wynik gry kumulowany; reset |
| Zdarzenia | 2 przyciski |
| Wynik | obrazy kości, 2 napisy wyników |
| Zasoby | obrazy kości 1–6 + question.jpg (archiwum) |
| Wygląd | tło Beige #F5F5DC, tytuł Brown #A52A2A z białą czcionką (największy), przyciski Chocolate #D2691E, rozkład obrazów biały |
| Wiedza | `Random`, tablica `int[]`, tablica identyfikatorów `R.drawable.*`, `setImageResource`, zliczanie wystąpień, metoda zwracająca sumę, `layout_weight` |

### Arkusz_13 — Urządzenia domowe (s. 46–47)

| Aspekt | Wymagania |
|---|---|
| Interfejs | 2 napisy nagłówkowe (w tym „Autor: <numer>”), sekcja pralki (obraz, napis, pole liczbowe, przycisk, napis), sekcja odkurzacza (obraz, napis, przycisk, 2 napisy) |
| Układ | kilka rozkładów liniowych: w każdej sekcji obraz **obok** kolumny kontrolek |
| Dane wejściowe | numer prania (pole **tylko liczby**) |
| Logika | walidacja zakresu 1..12; **przełącznik** stanu (Włącz/Wyłącz) |
| Zdarzenia | 2 przyciski |
| Wynik | „Numer prania: <n>”; zmiana tekstu przycisku i napisu stanu |
| Zasoby | pralka.jpg, odkurzacz.jpg |
| Wygląd | tło LightBlue #ADD8E6, pole SkyBlue #87CEEB, przyciski RoyalBlue #4169E1, tekst i podpowiedź Navy #000080; marginesy 5 / 10 / 20 (górny 0); obrazy wys. 150; nagłówki wyśrodkowane, większa czcionka |
| Wiedza | `inputType="number"`, `Integer.parseInt`, zakres, `boolean`, `textColorHint`, `layout_margin*`, zagnieżdżanie poziom/pion |

---

## 4. Wymagane elementy UI (Android)

| Element | Arkusze | Liczba |
|---|---|---|
| `LinearLayout` (vertical) — rozkład główny | 01, 02, 05, 07, 10, 12, 13 | 7/7 |
| zagnieżdżony `LinearLayout` (horizontal) | 02, 05, 10, 12, 13 | 5/7 |
| `TextView` (tytuł, etykiety, wynik) | wszystkie | 7/7 |
| `Button` | wszystkie | 7/7 |
| `EditText` z `hint` | 01, 05, 10, 13 | 4/7 |
| `EditText` z `inputType` (password / number / time) | 01, 13, 10 | 3/7 |
| `ImageView` z zasobu | 02, 12, 13 | 3/7 |
| `SeekBar` | 07, 10 | 2/7 |
| `ListView` | 05, 10 | 2/7 |
| linia pozioma (`View` o wys. 1) | 02 | 1/7 |
| pole czasu (`TimePicker` lub EditText time) | 10 | 1/7 |
| okno komunikatu (opcjonalnie: `Toast` / `AlertDialog`) | 10 (jako wariant) | 1/7 |

Kontrolki **nieobecne** w zadaniach mobilnych, ale obecne w zadaniach desktopowych tej samej kwalifikacji: pola radio (Arkusz_06, 09), pola wyboru (Arkusz_04), lista rozwijalna (Arkusz_04), suwaki RGB (Arkusz_15), nawigacja poprzedni/następny (Arkusz_11). Traktuję je jako kompetencje **C/D** (patrz tabela częstotliwości).

---

## 5. Wymagane mechanizmy programistyczne

| Mechanizm | Arkusze mobilne |
|---|---|
| `findViewById` + identyfikatory z XML | 7/7 |
| obsługa kliknięcia (`setOnClickListener`) | 7/7 |
| zmiana tekstu (`setText`) + składanie napisu | 7/7 |
| pole klasy przechowujące stan (licznik, indeks, flaga, suma) | 02, 07, 12, 13 (+ lista w 05) |
| odczyt tekstu z pola (`getText().toString()`) | 01, 05, 10, 13 |
| instrukcje warunkowe (walidacja, zakres, wybór wariantu) | 01, 02, 10, 12, 13 |
| konwersja tekst → liczba (`Integer.parseInt`) | 13 (+ int z suwaka w 07, 10) |
| tablice (`String[]`, `int[]`) | 07, 12 (+ lista startowa w 05, 10) |
| operacja modulo / cykl | 07 |
| `Random` | 12 |
| algorytm zliczania wystąpień | 12 |
| `OnSeekBarChangeListener` | 07, 10 |
| `ArrayAdapter` + `ListView` | 05, 10 |
| `notifyDataSetChanged` | 05 |
| `OnItemClickListener` | 10 |
| `setMax` (dynamicznie) | 10 |
| `setTextSize` (dynamicznie) | 07 |
| `setImageResource` (dynamicznie) | 12 |
| przełączanie `boolean` + zmiana tekstu przycisku | 13 |

---

## 6. Wymagania dotyczące wyglądu

| Wymaganie | Arkusze | Uwagi |
|---|---|---|
| kolory tła podane nazwą i kodem HEX | 7/7 | Teal, Crimson, #558B2F, LightGreen, SeaGreen, Beige, Brown, Chocolate, LightBlue, SkyBlue, RoyalBlue |
| kolor czcionki | 01, 02, 07, 12, 13 | biały na ciemnym tle, Gray, Navy (również podpowiedź) |
| tytuł największą czcionką | 7/7 | „wizualnie większa” / „największy spośród użytych” |
| pogrubienie | 02, 07 | `textStyle="bold"` |
| wyśrodkowanie | 01, 07, 12, 13 | przycisk, komunikat, napisy — `layout_gravity` vs `gravity` |
| wyrównanie do prawej | 02 | `gravity="end"` |
| elementy na całą szerokość | 01, 02, 07, 12 | `match_parent` |
| marginesy / padding podane liczbowo | 02, 07, 10, 12, 13 | 20 / 20 / 10 / 9 i 10 / 5, 10, 20 |
| wysokość obrazu | 12, 13 | 60, 150 |
| elementy obok siebie wypełniające szerokość | 02, 12 | `layout_weight` |
| separator listy | 05 | `divider`, `dividerHeight` |
| wysokość listy wg liczby elementów | 10 | `wrap_content` |
| numer zdającego w interfejsie | 01, 12, 13 | w napisie / tytule |

---

## 7. Powtarzające się algorytmy

| Algorytm | Arkusze | Warianty |
|---|---|---|
| licznik z ograniczeniem | 02, 12 | ++/-- z dolną granicą 0; suma kumulowana z resetem |
| walidacja zakresu liczby | 13 (desktop: 06) | 1..12; długość 5 znaków |
| walidacja tekstu | 01 (desktop: 06, 09) | zawiera „@”, równość napisów, same cyfry, pole puste |
| cykl po tablicy | 07 (desktop: 11) | indeks = (indeks + 1) % długość; w desktop także wstecz |
| losowanie + zliczanie | 12 (konsola: 12, 15) | liczby 1..6, zliczanie wystąpień, suma dla powtórzeń |
| wybór wariantu wg zaznaczenia | 10 (desktop: 06) | gatunek → maksimum suwaka; radio → obraz + cena |
| złożenie wyniku z wielu pól | 01, 10 (desktop: 04, 09) | przecinki, „Witaj <e-mail>”, „<imię> <nazwisko> …” |

---

## 8. Powtarzające się schematy (wzorce)

### 8.1 Wzorce główne

**W1. Zdarzenie → stan → interfejs** (7/7: 01, 02, 05, 07, 10, 12, 13)
```
kliknięcie / zmiana kontrolki
  ↓
zmiana pola klasy (licznik, indeks, flaga, kolekcja)
  ↓
setText / setImageResource / setTextSize / notifyDataSetChanged
```
Warianty: licznik ++/-- (02), suma gry (12), indeks cykliczny (07), przełącznik boolean (13), lista (05).

**W2. Odczyt → konwersja / walidacja → komunikat** (4/7: 01, 10, 13, 05)
```
getText().toString()
  ↓
(parseInt) + if / else if
  ↓
setText(komunikat) lub dopisanie do listy
```
Warianty: kilka warunków z priorytetem (01), zakres (13), zbiorcze złożenie wartości (10), brak walidacji (05).

**W3. Odtworzenie interfejsu ze specyfikacji** (7/7)
```
opis + zrzut ekranu
  ↓
drzewo rozkładów: pion → poziom (zagnieżdżenie)
  ↓
atrybuty: kolory HEX, rozmiary, marginesy, wyrównanie, szerokość
```
Warianty: przyciski w rzędzie (02), pole + przycisk w rzędzie (05), napisy + suwak w rzędzie (10), 5 obrazów w rzędzie (12), obraz obok kolumny kontrolek (13).

**W4. Kontrolka ciągła aktualizuje widok na żywo** (2/7: 07, 10)
```
onProgressChanged(progress)
  ↓
setText(... + progress) + zmiana właściwości (rozmiar czcionki)
```

**W5. Kolekcja ↔ lista na ekranie** (2/7: 05, 10)
```
tablica / ArrayList → ArrayAdapter → ListView
  ↓
add() + notifyDataSetChanged()   lub   onItemClick → decyzja
```

**W6. Zasób graficzny zależny od danych** (2/7: 12, pośrednio 02, 13)
```
wartość (wynik losowania / stan)
  ↓
tablica int[] z R.drawable.*
  ↓
setImageResource(tablica[wartość])
```

### 8.2 Wzorzec proceduralny egzaminu (7/7)
Każde zadanie mobilne kończy się tymi samymi czynnościami: kompilacja i uruchomienie w emulatorze, zrzuty ekranu (całego ekranu z paskiem zadań, nazwy `mobile1…`/`mobilna.jpg`), archiwum `mobilna.zip`, skopiowanie pliku XML interfejsu i pliku kodu (`MainActivity.java`), informacja o środowisku/emulatorze (dokument `egzamin` lub `srodowisko.txt` — Arkusz_07).

### 8.3 Wzorce z zadań desktopowych przydatne w części mobilnej [F: desktop, P: dla mobilnej]
Nie wystąpiły w zadaniach mobilnych, ale należą do tej samej kwalifikacji i używają tych samych schematów W1–W6:

- grupa pól radio → obraz + cena (Arkusz_06),
- pola wyboru wpływające na wynik (Arkusz_04),
- nazwa zasobu budowana z danych (Arkusz_09),
- nawigacja poprzedni/następny z zawijaniem (Arkusz_11),
- suwaki R, G, B → kolor prostokąta (Arkusz_15),
- przekształcanie tekstu (szyfr Cezara) po kliknięciu (Arkusz_16).

W kursie wykorzystuję je **w ograniczonym zakresie** (kategoria C/D) — głównie w zadaniach samodzielnych i rozszerzających, aby sprawdzić transfer.

---

## 9. Typowe błędy (obserwowane ryzyka dla tych zadań)

Błędy wynikają z wymagań arkuszy i ze specyfiki Android Studio + Java:

| Błąd | Skutek | Związek z arkuszami |
|---|---|---|
| projekt utworzony w Kotlinie lub jako „Empty Activity” (Compose) | brak `activity_main.xml`, inny język | wszystkie (wymóg XML) |
| usunięcie `android:id="@+id/main"` z korzenia przy zamianie na LinearLayout, gdy w kodzie pozostał `findViewById(R.id.main)` (szablon EdgeToEdge) | aplikacja zamyka się przy starcie (NullPointerException) | wszystkie |
| literówka w ID / inny ID w XML i w Javie | błąd kompilacji `cannot find symbol` | wszystkie |
| porównanie napisów przez `==` | hasła „różne” mimo identycznej treści | 01 |
| `setText(liczba)` bez zamiany na tekst | `Resources$NotFoundException` — awaria | 02, 07, 10, 12 |
| `Integer.parseInt` na pustym polu | `NumberFormatException` — awaria | 13 |
| licznik spada poniżej 0 | niezgodność ze specyfikacją | 02 |
| zasób z wielką literą, myślnikiem lub cyfrą na początku (`Obraz.JPG`, `1.jpg`) | błąd budowania zasobów | 02, 12, 13 |
| dopisanie do listy bez `notifyDataSetChanged()` | lista nie odświeża się | 05 |
| indeks tablicy poza zakresem przy cyklu | `ArrayIndexOutOfBoundsException` | 07 |
| `setTextSize` z `progress = 0` / niezgodny typ | niewidoczny tekst / błędna wartość | 07 |
| mylenie `gravity` (zawartość) z `layout_gravity` (położenie w rodzicu) | element niewyśrodkowany | 01, 07, 12, 13 |
| brak `layout_weight` w rzędzie | przyciski/obrazy nie wypełniają szerokości | 02, 12 |
| zmiana maksimum suwaka bez korekty bieżącej wartości | wiek większy niż nowe maksimum | 10 |
| losowanie `nextInt(6)` bez `+1` | kość z wartością 0, błąd zasobu | 12 |
| brak `textColorHint` | podpowiedź w złym kolorze | 13 |
| brak zrzutów/archiwum/plików XML i Java w folderze | utrata punktów za rezultat mimo działającej aplikacji | wszystkie |

---

## 10. Częstotliwość kompetencji

Klasyfikacja: **A** — kluczowe (≥ 4/7 zadań mobilnych lub niezbędne w większości), **B** — regularne (2–3/7), **C** — sporadyczne (1/7 mobilnych lub tylko w desktopowych), **D** — pomocnicze (nie występują jako wymaganie, ale są potrzebne).

| Kompetencja | Częstotliwość | Arkusze | Warianty |
|---|---|---|---|
| Rozkład pionowy LinearLayout | A | 01, 02, 05, 07, 10, 12, 13 | cała strona / z paddingiem / z tłem |
| Zagnieżdżony rozkład poziomy | A | 02, 05, 10, 12, 13 | przyciski, pole+przycisk, napisy+suwak, obrazy, obraz+kolumna |
| TextView — tekst, rozmiar, kolor, tło, pogrubienie | A | 7/7 | tytuł, etykieta, wynik, komunikat |
| Button + obsługa kliknięcia | A | 7/7 | 1–3 przyciski; przycisk bez akcji (02) |
| Zmiana tekstu i składanie napisu z wartości | A | 7/7 | „<x> polubień”, „Rozmiar: 30”, „Witaj …”, wartości po przecinku |
| Pole klasy jako stan aplikacji | A | 02, 07, 12, 13 (+05) | licznik, indeks, suma, flaga, kolekcja |
| EditText — hint, odczyt tekstu | A | 01, 05, 10, 13 | tekst, hasło, liczba, czas |
| Instrukcje warunkowe / walidacja | A | 01, 02, 10, 12, 13 | priorytet komunikatów, zakres, granica 0, wybór wariantu |
| Kolory HEX, wymiary, marginesy, wyrównanie | A | 7/7 | patrz pkt 6 |
| Odtworzenie wyglądu ze zrzutu i opisu | A | 7/7 | — |
| Procedura oddania (zip, zrzuty, pliki XML/Java, opis środowiska) | A | 7/7 | `egzamin.docx`, `srodowisko.txt`, nazwy zrzutów |
| layout_weight (równy podział szerokości) | B | 02, 12 | 3 przyciski, 5 obrazów |
| inputType (textPassword, number, time) | B | 01, 10, 13 | — |
| Konwersja tekst ↔ liczba | B | 13 (+ int w 07, 10, 12) | parseInt, String.valueOf, konkatenacja |
| ImageView + zasoby drawable | B | 02, 12, 13 | statyczny obraz, obraz zmieniany z kodu |
| SeekBar + OnSeekBarChangeListener | B | 07, 10 | max 40, max 20→18/9, wartość w etykiecie |
| ListView + ArrayAdapter | B | 05, 10 | dodawanie elementów, wybór elementu |
| Tablice String[] / int[] | B | 07, 12 (+05, 10) | teksty cyklu, identyfikatory obrazów, wyniki losowania |
| Numer zdającego w interfejsie | B | 01, 12, 13 | w komunikacie startowym, tytule, napisie „Autor:” |
| setImageResource (obraz zależny od danych) | C | 12 | tablica identyfikatorów |
| Cykl modulo po tablicy | C | 07 (desktop 11) | do przodu; wstecz w desktop |
| Przełącznik boolean + zmiana tekstu przycisku | C | 13 | Włącz/Wyłącz |
| Random + zliczanie wystąpień | C | 12 | suma powtórzeń |
| setTextSize dynamicznie | C | 07 | — |
| setMax dynamicznie | C | 10 | zależnie od wybranego elementu |
| notifyDataSetChanged / dodawanie do listy | C | 05 | — |
| OnItemClickListener | C | 10 | — |
| Linia pozioma (View) | C | 02 | — |
| Pole czasu (TimePicker / EditText time) | C | 10 | 16:00 / 4:00 PM |
| Okno komunikatu (Toast / AlertDialog) | C | 10 (opcja) | alternatywa dla TextView |
| RadioGroup / RadioButton | C | tylko desktop 06, 09 | wybór → obraz/cena |
| CheckBox | C | tylko desktop 04 | opcje wpływające na wynik |
| Kolor z wartości (Color.rgb) | C | tylko desktop 15 | suwaki RGB |
| Tworzenie projektu Empty Views Activity w Javie | D | — | niezbędne od pierwszej minuty |
| Struktura projektu (res/layout, res/drawable, java) | D | — | — |
| Logcat — czytanie błędu | D | — | debugowanie awarii |
| try/catch NumberFormatException | D | — | bezpieczna konwersja |
| setVisibility / setEnabled | D | — | stan interfejsu w zadaniach rozszerzonych |

---

## 11. Mapa pokrycia kompetencji w kursie

Oznaczenia: **Wprowadzona** — blok, w którym kompetencja jest uczona; **Powtórzona** — bloki, w których jest ponownie wymagana; **Zadanie egzaminacyjne** — bloki z zadaniami w stylu INF.04 / próbnymi egzaminami, które jej wymagają.

| Kompetencja egzaminacyjna | Wprowadzona | Powtórzona | Zadanie egzaminacyjne |
|---|---|---|---|
| Projekt Empty Views Activity (Java), emulator, uruchomienie | 1 | 2–12 | 1, 12, 13, 14, 15 |
| Rozkład pionowy LinearLayout | 1 | 2–11 | 1–15 |
| TextView: tekst, rozmiar, kolor, tło, pogrubienie | 1 | 2–11 | 1–15 |
| Analiza polecenia (INTERFEJS/DANE/ZDARZENIA/LOGIKA/WYNIK/WYGLĄD) | 1 | 2–12 | 1–15 |
| Obsługa kliknięcia | 2 | 3–11 | 2–15 |
| Pole klasy jako stan (licznik, suma) | 2 | 5, 6, 7, 10 | 2, 5, 6, 7, 10, 12–15 |
| Składanie napisu z wartości | 2 | 3–11 | 2–15 |
| Zagnieżdżony rozkład poziomy + layout_weight | 2 | 5, 6, 9, 10, 11 | 2, 5, 6, 9, 10, 11, 13, 14, 15 |
| EditText: hint, inputType, odczyt | 3 | 4, 8, 9, 11 | 3, 4, 8, 9, 11, 12, 13, 14, 15 |
| Konwersja tekst ↔ liczba (+ try/catch) | 3 | 4, 8, 12, 13 | 3, 8, 14, 15 |
| Walidacja, if/else if, komunikaty | 4 | 8, 9, 11, 12 | 4, 8, 9, 11, 12, 13, 14, 15 |
| Numer zdającego w interfejsie | 1 | 4, 10, 12 | 1, 4, 10, 12–15 |
| Kolory HEX, marginesy, padding, wyrównanie (gravity / layout_gravity) | 1 (podstawy), 5 (pełne) | 6–11 | 5–15 |
| Linia pozioma, gravity="end" | 5 | 6, 14 | 5, 6, 14 |
| ImageView + zasoby drawable | 6 | 7, 8, 10 | 6, 7, 10, 12, 13, 14, 15 |
| setImageResource, tablica R.drawable | 6 | 7, 10 | 6, 7, 10, 13, 14, 15 |
| Cykl modulo po tablicy (przód/tył) | 6 | 7, 8 (rozszerzenie), 13 (sprint) | 6, 7 |
| Przełącznik boolean + zmiana tekstu przycisku | 7 | 13 (flaga końca quizu) | 7, 13 |
| setVisibility / setEnabled | 7 (zapowiedź w 4) | 10, 12, 13 | 7, 10, 12, 13 |
| SeekBar + listener, setTextSize | 8 (setTextSize już w 2) | 11, 12, 13, 14, 15 | 8, 11, 12, 13, 14, 15 |
| setMax dynamicznie, przesunięcie zakresu (min) | 8 | 11, 13, 14, 15 | 8, 11, 13, 14, 15 |
| ListView + ArrayAdapter | 9 | 11, 14, 15 | 9, 11, 14, 15 |
| Dodawanie do listy + notifyDataSetChanged | 9 | 12, 14, 15 | 9, 14, 15 |
| OnItemClickListener, getItemAtPosition | 9 | 11, 15 | 9, 11, 15 |
| Random, tablice int[], zliczanie wystąpień | 10 | 12 (tablica liczników), 15 | 10, 15 |
| Wydzielanie logiki do metod | 10 | 11–15 | 10–15 |
| Pole czasu (TimePicker), RadioGroup, CheckBox | 11 | 12, 13, 15 (w tym generator hasła — desktop Arkusz_04) | 11, 12, 13, 15 |
| Okno komunikatu (Toast / AlertDialog) | 3 (Toast), 11 (AlertDialog) | 4, 12, 15 | 11, 15 |
| Kolor z wartości (Color.rgb / parseColor) | 7 | 8 (samodzielne RGB), 14, 15 | 7, 14 |
| Debugowanie (Logcat, typowe awarie) | 3 | 4, 9, 12 | 12 |
| Procedura oddania pracy (zip, zrzuty, pliki) | 1 | 12 | 12, 13, 14, 15 |

---

## 12. Walidacja kursu względem arkuszy

Po przygotowaniu kursu każde zadanie mobilne z PDF sprawdzono pytaniem: *czy uczeń po kursie ma wszystkie kompetencje?*

| Zadanie | Wymagane kompetencje → bloki | Wynik |
|---|---|---|
| Arkusz_01 Rejestracja | EditText/password (3), contains/equals, priorytet komunikatów (4), wyśrodkowanie, tło tytułu (1, 5), numer zdającego (1, 4) | pełne pokrycie |
| Arkusz_02 Domek | ImageView (6), rząd przycisków z wagami (2, 5), licznik z dolną granicą (2), linia, gravity end, bold (5), padding górny (5) | pełne pokrycie |
| Arkusz_05 Notatki | rząd pole+przycisk (5, 9), ArrayList + adapter + notifyDataSetChanged, divider (9, 12) | pełne pokrycie |
| Arkusz_07 Czcionka | SeekBar max 40, setTextSize (8), tablica + modulo (6, 7), marginesy strony (5) | pełne pokrycie |
| Arkusz_10 Weterynarz | ListView + klik (9), setMax zależnie od wyboru (8, 11), rząd napisy+suwak (8), pole czasu, AlertDialog/TextView (11) | pełne pokrycie |
| Arkusz_12 Kości | Random, zliczanie, suma (10), 5 obrazów w rzędzie z wagami i marginesami (6, 10), setImageResource (6), reset (2, 10) | pełne pokrycie |
| Arkusz_13 Urządzenia | obraz obok kolumny (5, 14), inputType number, parseInt, zakres (3, 4), boolean toggle (7), kolor pola i podpowiedzi — `background`, `textColorHint` (5), marginesy obrazu (5, 6) | pełne pokrycie |

Test „nowego arkusza”: zadania próbne w blokach 13–15 **nie powtarzają** żadnej aplikacji z PDF. Każde łączy 3–5 wzorców W1–W6 w nowej kombinacji (np. lista + suwak z przesunięciem zakresu + obraz zależny od przedziału), więc wymagają transferu, a nie odtworzenia znanego rozwiązania.
