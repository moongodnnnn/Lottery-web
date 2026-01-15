# Lottery-web - AI Coding Assistant Instructions

## Project Overview
Vue 3 + Vite lottery betting platform for Chinese sports lottery (体彩助手). Mobile-first web app with extensive Vant UI components for lottery games (大乐透, 排列3/5, 七星彩), football/basketball betting, user management, and social features.

## Tech Stack & Key Dependencies
- **Frontend**: Vue 3 (Composition API with `<script setup>`), Vue Router 4, Vite 7
- **UI Framework**: Vant 4 (mobile component library) - extensively used throughout
- **HTTP Client**: Axios with centralized interceptors in `src/request/api.js`
- **Special Libraries**: `qrcode.vue` for invite codes, `@vant/area-data` for address selection

## Architecture & File Organization

### Router Structure (`src/router/index.js`)
- **Main tabs** (with BottomMenu): `/home`, `/expert`, `/game`, `/community`, `/my`
- **Auth flows**: `/login` (default), `/register`, `/forgetpassword`, `/forgotusername`
- **Game pages**: `/daletou`, `/pl3`, `/pl5`, `/qxc` (七星彩), `/Football_lottery`, `/Basketball_lottery`
- **Betting workflow**: Game selection → `Confirm_bet` / `Basketball_confirm_bet` → `/bet_success`
- **User features**: `/recharge`, `/withdraw`, `/authentication`, `/My_order`, `/card-center`, etc.

### View Directory Structure
```
view/
├── Login.vue, Register.vue          # Auth (tabs-based UI)
├── Home/                            # Main app tabs
│   ├── Home.vue                     # Landing with lottery results, rankings, skeleton screens
│   ├── Expert.vue, Game.vue, Community.vue, My.vue
│   ├── Lottery_results.vue          # Historical lottery draws
│   └── Gendan_detail.vue            # Order following details
└── Game/                            # Lottery betting flows
    ├── daletou.vue, Pl3.vue, Pl5.vue, Seven_stars.vue  # Number lottery games
    ├── Football_lottery.vue, Basketball_lottery.vue     # Sports betting
    ├── Confirm_bet.vue, Basketball_confirm_bet.vue      # Bet confirmation
    └── Publish_order.vue, Bet_success.vue              # Post-bet flows
```

## Critical Development Patterns

### 1. API Integration (`src/request/api.js`)
- **Base URL**: ` https://atc.lxwdlz.cn/api`
- **Auth**: Token stored in `localStorage.getItem("token")`, auto-injected via interceptors as `Authorization: Bearer <token>` and `TOKEN` header
- **Error Handling**: 401 responses auto-redirect to `/login` and clear token
- **Usage**: Import as `import { API } from '@/request/api'`, call like `API.login(payload)`
- **User Data**: Stored as `localStorage.getItem("user")` (JSON string) after login/register

### 2. Vant Component Registration (`src/main.js`)
All Vant components are manually imported and `.use()`-registered globally:
```javascript
import { Tab, Tabs, Toast, Checkbox, Field, Swipe, NavBar, ... } from "vant";
createApp(App).use(Tab).use(Tabs)...
```
**Important**: When adding new Vant components, register them in `main.js` first.

### 3. User Feedback Patterns
- **Toasts**: Import from Vant: `import { showToast } from "vant"`
  - Standard usage: `showToast("操作成功")` or `showToast({ message: "...", duration: 2000 })`
  - Loading states: `showLoadingToast("加载中...")` then `closeToast()`
- **Dialogs**: Import and use `showDialog` from Vant for confirmations

### 4. Navigation & Routing
- **Programmatic**: `router.push(path)` or `router.replace(path)` (imported from `vue-router`)
- **Declarative**: Use `@click="go('/path')"` pattern where `go` function calls `router.push`
- **Bottom Menu**: Controlled by `hideMenu` array in `App.vue` - only shows on main 5 tabs

### 5. LocalStorage Data Management
Key storage items:
- `token`: Auth token (string)
- `user`: User object (JSON string) - contains username, balance, avatar, etc.
- `config`: App config from `API.initConfig()` (JSON string)
- `recom`: Referral/recommendation code (string)

Always parse user data: `const user = JSON.parse(localStorage.getItem("user"))`

### 6. Styling Approach
- **Global Vars**: CSS custom properties in `App.vue` override Vant defaults (e.g., `--van-tab-active-text-color`)
- **Theme Colors**: Primary red `#e33212` / `#fc3c3c`, used in buttons/highlights
- **Mobile-First**: All designs assume viewport width ~375-430px
- **Global Reset**: `src/styles/global.css` resets body/html with `#f1f5f9` background

### 7. Lottery Game Number Selection Pattern
Games like `daletou.vue`, `Pl3.vue` use common patterns:
- **Ball Selection**: Click to toggle selected balls (red/blue zones)
- **Machine Selection**: Random ball generation via `randomSelect()` functions
- **Bet Confirmation**: Navigate to `Confirm_bet.vue` with `router.push()` passing bet data
- **History Display**: Collapsible sections showing past draw results

## Development Workflow

### Local Development
```powershell
npm run dev        # Start Vite dev server (default port 5173)
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

### Common Tasks
- **Add new route**: Update `src/router/index.js` imports and routes array
- **Add new API endpoint**: Add method to `API` object in `src/request/api.js`
- **New Vant component**: Import and register in `src/main.js`
- **Debug API calls**: Check Network tab - all requests go to `lottery.hongxiu88.com/api`

## Project-Specific Conventions

1. **File Naming**: 
   - Components: PascalCase (e.g., `BottomMenu.vue`)
   - Views: Mixed case matching route names (e.g., `Football_lottery.vue`)
   - Routes: kebab-case paths (e.g., `/add-bank-card`) with PascalCase names

2. **Vue Style**: 
   - Prefer `<script setup>` Composition API
   - Use `const router = useRouter()` for navigation
   - Reactive state with `ref()` / `reactive()` from Vue

3. **Error Messages**: Chinese language for all user-facing text

4. **Image Assets**:
   - Public images referenced with `/` prefix (e.g., `/tabicon/icon1.png`)
   - Organized by type: `/icons/`, `/tabicon/`, `/gameicon/`, `/img/`

5. **Authentication Flow**:
   - All protected routes check token existence
   - API interceptor handles 401 globally
   - User object updated in localStorage after profile changes

## Key Integration Points

- **Skeleton Screens**: `Home.vue` demonstrates loading patterns with Vant Skeleton components
- **QR Code Generation**: `Invite_friends.vue` / `Invite_store.vue` use `qrcode.vue` for sharing
- **Countdown Timers**: Lottery games show live countdowns to bet closing times
- **Betting Data Flow**: Game pages → Confirm pages (with data passed via navigation) → Success page
