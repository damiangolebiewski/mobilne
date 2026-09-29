# Plan kursu: INF.04 — Aplikacje mobilne (Android Studio · Java · XML)

**Wymiar:** 15 bloków × 4 godziny lekcyjne (4 × 45 min = 180 min) = **60 godzin dydaktycznych**.
**Forma:** samodzielna praca ucznia z portalem; nauczyciel wskazuje blok, nadzoruje, pomaga, sprawdza i ocenia.
**Podstawa:** analiza 7 zadań mobilnych z 16 arkuszy (`ANALIZA_INF04_MOBILE.md`). Oznaczenia wzorców W1–W6 pochodzą z analizy.

## Struktura każdego bloku (stała)

1. Cel · 2. Krótkie przypomnienie · 3. Przykład · 4. Mikroćwiczenia · 5. Zadanie prowadzone · 6. Zadanie samodzielne · 7. Zadanie w stylu INF.04 · 8. Checklista · 9. Mini-test · 10. Skończyłeś wcześniej?

Każde większe zadanie ma 5 poziomów pomocy (kierunek → wskazówka → pseudokod/struktura → fragment → pełne rozwiązanie), domyślnie zwiniętych.
W blokach 13–15 zadania samodzielne i INF.04 są pełnymi próbnymi zadaniami egzaminacyjnymi.

## Fazy

| Faza | Bloki | Charakter pracy | Ilość gotowego kodu |
|---|---|---|---|
| I — wyrównanie | 1–4 | krótkie ćwiczenia, dużo przykładów, jawne podpowiedzi | szkielety XML i Java podane |
| II — łączenie umiejętności | 5–10 | aplikacje łączące UI + zdarzenia + dane + logikę | coraz mniej; od bloku 7 tylko szkielet XML lub nic |
| III — tryb egzaminacyjny | 11–15 | treść + wygląd + zasoby; podpowiedzi ukryte | brak; w blokach 13–15 praca od pustego projektu |

## Program

| Blok | Temat | Kompetencje | Zadanie główne (INF.04) | Powiązanie z arkuszami | Czas |
|---|---|---|---|---|---|
| 1 | Start: projekt, emulator i ekran ze specyfikacji | Empty Views Activity (Java), struktura projektu, LinearLayout pionowy, TextView (tekst, rozmiar, kolor, tło, padding, gravity), uruchomienie, zrzut, archiwum; analiza polecenia (6 pytań) | **Schronisko „Łapa” — ekran informacyjny** z numerem zdającego | W3; wygląd wszystkich 7 zadań; procedura oddania (7/7) | 4 × 45 min |
| 2 | Przycisk → zmiana stanu → interfejs | findViewById, setOnClickListener, pole klasy jako stan, setText + konkatenacja, granice licznika, rząd przycisków z layout_weight | **Licznik szklanek wody** (+, −, reset, zakres 0..12) | W1; Arkusz_02 (licznik ≥ 0), Arkusz_12 (reset) | 4 × 45 min |
| 3 | Formularz: odczyt, konwersja, obliczenia | EditText (hint, inputType), getText().toString(), parseInt/parseDouble, try/catch, String.format, Toast; pierwsza awaria w Logcat | **Kalkulator spalania paliwa** | W2; Arkusz_01, 05, 10, 13 (pola edycyjne) | 4 × 45 min |
| 4 | Walidacja danych i komunikaty | if / else if z priorytetem, equals vs ==, contains, length, Character.isDigit, zakres, obszar komunikatów z numerem zdającego | **Aktywacja karty miejskiej** (numer, PIN, powtórz PIN) | W2; Arkusz_01 (priorytet komunikatów), Arkusz_13 (zakres), desktop Arkusz_06 (kod) | 4 × 45 min |
| 5 | Odtwarzanie wyglądu: rozkłady, marginesy, wagi | zagnieżdżanie pion/poziom, layout_weight, gravity vs layout_gravity, margin vs padding, linia, gravity end, kolory i wymiary; makieta → drzewo widoków | **Tablica wyników meczu** | W3; Arkusz_02, 05, 10, 12, 13 (rozkład poziomy) | 4 × 45 min |
| 6 | Obrazy i zasoby graficzne | res/drawable (zasady nazw), ImageView (scaleType, adjustViewBounds, wysokość), setImageResource, tablica R.drawable, cykl poprzedni/następny | **Przewodnik po szlakach** (galeria ← → z polubieniami) | W6; Arkusz_02, 12, 13; desktop Arkusz_11 | 4 × 45 min |
| 7 | Stan aplikacji: przełączniki, cykle, widoczność | boolean + zmiana tekstu przycisku, cykl modulo, setVisibility, setEnabled, Color.parseColor, zmiana tła | **Sterowanie oświetleniem sceny** | W1; Arkusz_13 (Włącz/Wyłącz), Arkusz_07 (cykl tekstów) | 4 × 45 min |
| 8 | Suwak SeekBar: wartości na żywo | OnSeekBarChangeListener, max, setMax, przesunięcie zakresu (min), setTextSize, Color.rgb, wspólny listener | **Kalkulator napiwku z suwakiem** | W4; Arkusz_07, 10; desktop Arkusz_15 | 4 × 45 min |
| 9 | Listy: ListView i ArrayAdapter | String[] vs ArrayList, ArrayAdapter (systemowy i własny układ elementu), add + notifyDataSetChanged, divider, OnItemClickListener, tablice równoległe | **Lista lektur** (dodawanie + wybór) | W5; Arkusz_05, 10 (pomoc Android Studio z arkuszy) | 4 × 45 min |
| 10 | Losowanie, tablice i algorytmy w aplikacji | Random, int[], zliczanie wystąpień, suma, metody logiki bez UI, wartość → obraz, reset stanu | **Jednoręki bandyta** (3 bębny, punkty, saldo) | W1 + W6; Arkusz_12 | 4 × 45 min |
| 11 | Formularz złożony: wiele kontrolek, zbiorczy wynik | lista → setMax suwaka, pole czasu (TimePicker), RadioGroup, CheckBox, AlertDialog, wynik po przecinku | **Rezerwacja stolika** | W2 + W4 + W5; Arkusz_10; desktop Arkusz_04, 06, 09 | 4 × 45 min |
| 12 | Debugowanie i procedura egzaminacyjna | Logcat, stos wywołań, 10 typowych awarii, naprawa gotowych projektów; zip, zrzuty, pliki do oddania, opis środowiska | **Ankieta satysfakcji** (pełne zadanie na czas, 60 min) | wszystkie zadania — procedura i typowe błędy | 4 × 45 min |
| 13 | Tryb egzaminacyjny I | workflow 10 kroków na czas, analiza specyfikacji, sprint XML | **Próbny egzamin A: Parking miejski**, **B: Quiz stolic** | W1, W2, W3, W6 + cykl i zliczanie | 4 × 45 min |
| 14 | Tryb egzaminacyjny II | jw. + lista, suwak z przesunięciem zakresu, obraz zależny od przedziału | **Próbny egzamin C: Lista wydatków**, **D: Termometr** | W3, W4, W5, W6 | 4 × 45 min |
| 15 | Tryb egzaminacyjny III — od pustego projektu | pełna samodzielność, samoocena wg kryteriów, podsumowanie kursu | **Próbny egzamin E: Zamówienie kawy**, **F: Seria rzutów monetą** | W1–W6 w nowych kombinacjach | 4 × 45 min |
| **Razem** | | | | | **60 godzin dydaktycznych** |

## Typowy podział czasu w bloku

| Bloki 1–12 | min | Bloki 13–15 | min |
|---|---|---|---|
| Przypomnienie | 15 | Przypomnienie (workflow) | 10 |
| Przykład | 10 | Przykład (analiza wzorcowa specyfikacji) | 10 |
| Mikroćwiczenia | 25 | Mikroćwiczenia (sprint) | 20 |
| Zadanie prowadzone | 40 | Zadanie prowadzone (plan + szkielet) | 20 |
| Zadanie samodzielne | 35 | Próbny egzamin — zadanie 1 | 50 |
| Zadanie INF.04 | 45 | Próbny egzamin — zadanie 2 | 60 |
| Checklista + mini-test | 10 | Samoocena + mini-test | 10 |
| **Razem** | **180** | **Razem** | **180** |

Dokładny podział jest podany na początku każdego bloku (w bloku 1 więcej czasu na konfigurację, w bloku 12 zadanie INF.04 trwa 60 min).

## Powtórki spiralne (przykłady)

- **Obsługa kliknięcia:** wprowadzona w bloku 2 → używana w każdym kolejnym bloku.
- **Walidacja:** wprowadzona w bloku 4 → wymagana bez przypominania w blokach 8, 9, 11, 12, 13–15.
- **Rozkład poziomy + wagi:** blok 2 (przyciski) → blok 5 (pełna teoria) → bloki 6, 9, 10, 11, 13–15.
- **Obrazy:** blok 6 → bloki 7, 10, 12, 13, 14, 15.
- **Suwak:** blok 8 → bloki 11, 14, 15.
- **Lista:** blok 9 → bloki 11, 14, 15.
- **Analiza polecenia (6 pytań):** blok 1 → każde zadanie INF.04 zaczyna się od wypełnienia tabeli analizy.

## Różnicowanie

- Uczeń silniejszy: z menu bloku przechodzi od razu do „Zadania samodzielnego”, potem INF.04 i zadań rozszerzających.
- Uczeń słabszy: przypomnienie → przykład → mikroćwiczenia → zadanie prowadzone z podpowiedziami poziomu 1–4.
- Wszyscy: checklista i mini-test na końcu bloku; wynik testu zapisuje się w „Moich wynikach”.
