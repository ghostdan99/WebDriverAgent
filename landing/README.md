# Creator profile landing

Mobilny landing page w formie profilu twórczyni. Prowadzi odwiedzających do rejestracji na
zewnętrznej platformie przez **jeden** konfigurowalny link afiliacyjny. Zbudowany w React 19,
TypeScript i Vite. Nie ma backendu ani systemu kont: czat, obserwowanie i logowanie są jawnie
demonstracyjne i zawsze kończą się przejściem na platformę partnera.

## Uruchomienie

```bash
cd landing
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + Testing Library
npm run lint       # ESLint (w tym jsx-a11y)
npm run typecheck
npm run build      # statyczne pliki w dist/
npm run preview    # podgląd builda
```

Folder `dist/` można wrzucić na dowolny hosting statyczny (Netlify, Vercel, Cloudflare Pages,
S3 + CDN, nginx).

## Co trzeba uzupełnić przed publikacją

| Co | Gdzie |
| --- | --- |
| Link afiliacyjny | `src/config/affiliate.ts` (`AFFILIATE_URL`) albo zmienna `VITE_AFFILIATE_URL` |
| UTM / SubID / przekazywanie parametrów | `AFFILIATE_OPTIONS` w tym samym pliku. Domyślnie wszystko jest wyłączone. Włącz tylko to, co dopuszcza program partnerski |
| Nazwa platformy partnera, marka, linki prawne | `src/config/site.ts` |
| Dane profilu: imię, bio, statystyki, avatar, cover | `src/config/profile.ts` |
| Status dostępności | `PROFILE.availability`: `manual`, `schedule` (godziny w strefie czasowej) albo `hidden` |
| Badge weryfikacji | `PROFILE.verified`. Ustaw `true` tylko dla profilu faktycznie zweryfikowanego na platformie |
| Miniatury galerii | `src/config/media.ts` + pliki w `public/media/` |
| Polityka prywatności i regulamin | `public/privacy.html`, `public/terms.html` (to tylko szablony) |
| GA4 | zmienna `VITE_GA_MEASUREMENT_ID` (opcjonalnie) |
| Teksty „free” | `SITE.freeSignup` (rejestracja za darmo) i `SITE.freeUnlock` (odblokowanie profilu za darmo) w `src/config/site.ts`. Ustaw `false`, jeśli na platformie to nie jest prawda |
| Statystyki (zdjęcia, wideo, polubienia) | `PROFILE.stats`. Strona nie oznacza ich już jako przykładowych, więc wpisz prawdziwe liczby |

Zmienne środowiskowe ustawiasz w `.env.local` (wzór w `.env.example`) albo w panelu hostingu.
Trafiają do publicznego bundla JS, więc nie umieszczaj w nich sekretów. Strona i tak żadnych
nie potrzebuje.

### Link afiliacyjny

Każdy przycisk „Join free”, „Log in”, „Create free account”, „Register free to chat”,
„Unlock full profile for free”, „Join free to view” i „See all” jest renderowany przez `components/AffiliateLink.tsx`. Ten komponent
buduje adres przez `buildAffiliateUrl()` z `lib/affiliate.ts`, a ta funkcja czyta
`AFFILIATE_URL`. Test `src/test/single-source.test.ts` pilnuje, żeby link nie był zdefiniowany
nigdzie indziej.

- Parametry, które już są w linku, nie są zmieniane ani ponownie kodowane.
- UTM i SubID są dopisywane tylko wtedy, gdy są włączone i gdy link ich jeszcze nie zawiera.
- `forwardParams` przekazuje wybrane parametry z adresu landing page'a, np. `?subid=tiktok`,
  do linku afiliacyjnego.
- Linki mają `rel="sponsored"`. Widocznej informacji o afiliacji na stronie nie ma; sprawdź,
  czy wymaga jej regulamin programu partnerskiego i prawo kraju, w którym promujesz stronę.

### Status „Available now” / „Active 5 min ago”

Status pokazuje zielone „Available now”, gdy twórczyni jest dostępna, a poza tym szare
„Active 5 min ago”, „Active 2 h ago” itd. Do wyboru są trzy tryby:

```ts
// Godziny dostępności. Poza nimi czas liczy się od końca ostatniego okna.
availability: {
  mode: 'schedule',
  timeZone: 'Europe/Lisbon',
  windows: [
    {days: [0, 1, 2, 3, 4, 5, 6], from: '10:00', to: '13:00'},
    {days: [0, 1, 2, 3, 4, 5, 6], from: '18:00', to: '01:00'},
  ],
}
// Ręczny przełącznik. lastActiveAt (data ISO) daje „Active … ago”, gdy available = false.
availability: {mode: 'manual', available: false, lastActiveAt: '2026-10-18T20:15:00+01:00'}
// Bez statusu.
availability: {mode: 'hidden'}
```

Status odświeża się co minutę. Ustaw okna tak, żeby odpowiadały godzinom, w których twórczyni
faktycznie odpisuje. Napis pojawia się ok. 1,2 s po wyświetleniu profilu, czyli po zamknięciu
age gate'u.

### Zdjęcia i wideo

Przeglądarka pobiera każdy plik wskazany w `thumbnail`, więc **nie wskazuj tam oryginałów**.
Rozmycie CSS niczego nie zabezpiecza. Przygotuj małe, wstępnie rozmyte miniatury 4:5, np.
ImageMagickiem:

```bash
magick input.jpg -resize 40x50^ -gravity center -extent 40x50 -blur 0x2 -resize 400x500 -quality 60 public/media/photo-01.webp
```

Obecne pliki `public/media/*.svg` to abstrakcyjne placeholdery generowane skryptem
`npm run placeholders`. Używaj wyłącznie materiałów własnych, licencjonowanych albo
udostępnionych za zgodą właściciela.

### Analityka

`lib/analytics.ts` wysyła zdarzenia do `gtag` (GA4) albo do `dataLayer` (GTM). Bez
konfiguracji po cichu je pomija i nigdy nie rzuca wyjątku. Parametry zdarzeń są typowane, więc
nie da się przypadkiem wysłać treści wiadomości.

| Zdarzenie | Parametry |
| --- | --- |
| `profile_view` | `profile` |
| `bio_expand` | `profile` |
| `gallery_tab_change` | `tab` (`photos` / `videos`) |
| `locked_content_click` | `section`, `media_type`, `item_id` |
| `chat_attempt` | `source` (`inline` / `floating`), bez treści wiadomości |
| `registration_modal_view` | `reason` (`photo`, `set`, `video`, `chat`, `follow`) |
| `affiliate_cta_click` | `placement` (np. `header_join`, `modal_chat_login`), `intent` (`join` / `login`) |

Jeśli odwiedzający są z UE lub UK, GA4 ładuj dopiero po zgodzie z CMP (banera cookies).
`initAnalytics()` w `App.tsx` to jedno miejsce, które trzeba wtedy uzależnić od zgody.

## Struktura

```
src/
  config/      affiliate.ts, analytics.ts, site.ts, profile.ts, media.ts
  lib/         affiliate (budowanie linku), analytics, availability, share, storage, format
  hooks/       scroll lock, IntersectionObserver, wysokość klawiatury, dostępność
  components/  Header, ProfileHero, ProfileStats, ProfileBio, LatestPosts, ContentTabs,
               GalleryGrid, LockedContentModal, Modal, ChatWidget, ChatComposer,
               FloatingChatButton, AgeGate, AffiliateLink, Footer, Toast, Icons
```

Stan modali, zakładek, bio i pól wiadomości jest lokalny (React state). Modal rejestracji
otwiera się z dowolnego miejsca przez `useRegistration()`.

## Dostępność i UX

- Modale mają `role="dialog"`, pułapkę fokusu i obsługę Escape, a fokus wraca do elementu,
  który je otworzył. Zamykają się kliknięciem w tło, tło jest `inert`, a scroll strony
  zablokowany.
- Zakładki mają role `tablist`/`tab`/`tabpanel` i obsługują strzałki oraz Home/End.
- W czacie Enter wysyła, Shift+Enter dodaje nową linię, a w trakcie kompozycji IME Enter nic
  nie wysyła. Pole ma 16 px, więc iOS nie przybliża strony. Panel pływającego czatu przesuwa
  się nad klawiaturę dzięki `visualViewport`.
- Pływający przycisk chowa się, gdy sekcja czatu jest na ekranie, i respektuje
  `safe-area-inset`.
- Animacje używają tylko `transform` i `opacity` i wyłączają się przy
  `prefers-reduced-motion`. Obrazy mają wymiary (brak layout shift), a galerie ładują się
  leniwie.
