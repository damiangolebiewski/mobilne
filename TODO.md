# TODO — portal INF.04 Mobile

[x] analiza PDF (61 stron)
[x] identyfikacja arkuszy (16, w tym 7 mobilnych)
[x] analiza części mobilnych
[x] ustalenie technologii (Android Studio + Java + XML)
[x] mapa kompetencji (ANALIZA_INF04_MOBILE.md)
[x] plan 15 bloków (PLAN_KURSU.md)
[x] architektura portalu (generator, CSS, JS)
[x] strona główna (dashboard)
[x] zasoby graficzne do zadań
[x] blok 01
[x] blok 02
[x] blok 03
[x] blok 04
[x] blok 05
[x] blok 06
[x] blok 07
[x] blok 08
[x] blok 09
[x] blok 10
[x] blok 11
[x] blok 12
[x] blok 13
[x] blok 14
[x] blok 15
[x] ściąga Android
[x] ściąga Java
[x] procedura egzaminacyjna
[x] lista zadań
[x] Moje wyniki + druk
[x] README
[x] test: kompilacja wszystkich rozwiązań (javac + stuby Android)
[x] test: ID w XML ↔ Java, zasoby drawable
[x] test: linki lokalne
[x] test: JavaScript (Chromium)
[x] test: duplikacja treści
[x] walidacja z arkuszami
[x] kontrola kompletności
[x] tryb online: serwer Google Apps Script (serwer/Code.gs) + Arkusz Google
[x] tryb online: logowanie ucznia, synchronizacja między urządzeniami, praca bez sieci (js/sync.js)
[x] panel nauczyciela (nauczyciel.html): tabela klasy, szczegóły, CSV, reset PIN
[x] czas pracy w blokach (Moje wyniki, panel, arkusz)
[x] instrukcja wdrożenia online (materialy/wdrozenie_online.html)
[x] test: serwer (Node + atrapa usług Google) i end-to-end (Chromium, 2 urządzenia + nauczyciel)

Wyniki kontroli (29.09.2026):
- kompilacja: 56/56 rozwiązań bez błędów (javac + stuby Android API), XML/ID/zasoby bez błędów
- linki lokalne: 1654 sprawdzone, 0 błędnych; brak zasobów zewnętrznych (offline)
- JavaScript (Chromium): 29/29 testów (postęp, cofanie, pasek, trwałość, mini-testy, podpowiedzi, kopiowanie, checklisty, reset, wyniki, lista zadań), 0 błędów konsoli na 80 stronach
- szerokość 400 px: brak poziomego przewijania na wszystkich stronach
- duplikacja: 45 unikalnych zadań; 3 zbyt podobne zadania rozgrzewkowe zastąpiono nowymi (bloki 2, 14, 15)
- walidacja z arkuszami: ANALIZA_INF04_MOBILE.md, pkt 12
