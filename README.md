# FinanceFlow

Offline-first personal finance tracker built with React Native + Expo.

## Features

- **100% Offline** - All data stored locally on your device
- **Multiple Accounts** - Track bank accounts and cash wallets
- **Transactions** - Income, expense, and transfer tracking
- **Budgets** - Monthly category budgets with alerts
- **Envelope Budgeting** - Digital envelope system for cash management
- **Analytics** - 6-month trends, spending breakdowns, portfolio view
- **Security** - PIN lock and hide balance mode
- **Data Freedom** - CSV export and JSON backup

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

### 3. Build for Production

#### Android APK (Free)
```bash
npx eas build --platform android --profile preview
```

#### Android AAB (Play Store)
```bash
npx eas build --platform android --profile production
```

#### iOS (Requires Apple Developer Account $99/yr)
```bash
npx eas build --platform ios --profile production
```

## Project Structure

```
FinanceFlow/
├── App.js                    # Entry point
├── package.json              # Dependencies
├── app.json                  # Expo config
├── eas.json                  # Build profiles
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── PINScreen.js
│   │   ├── NumberPad.js
│   │   ├── AddTransactionModal.js
│   │   ├── AddAccountModal.js
│   │   ├── SetBudgetModal.js
│   │   └── EditEnvelopeModal.js
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.js
│   │   ├── TransactionsScreen.js
│   │   ├── BudgetScreen.js
│   │   ├── EnvelopesScreen.js
│   │   ├── AnalyticsScreen.js
│   │   └── SettingsScreen.js
│   ├── context/              # React Context providers
│   │   ├── ThemeContext.js
│   │   ├── AppContext.js
│   │   ├── EnvelopeContext.js
│   │   └── IOUContext.js
│   ├── hooks/                # Custom hooks
│   │   └── useLocalQuery.js  # Replaces platform-hooks
│   ├── utils/                # Utilities
│   │   ├── constants.js      # Colors, categories, layout
│   │   ├── formatters.js     # Currency, date formatting
│   │   └── storage.js        # AsyncStorage wrapper
│   └── navigation/
│       └── AppNavigator.js   # Tab navigation
```

## Publishing Checklist

- [ ] Update `app.json` with your app name, slug, and bundle ID
- [ ] Replace `./assets/icon.png`, `splash.png`, `adaptive-icon.png` with your branding
- [ ] Create Expo account at https://expo.dev
- [ ] Run `npx eas build:configure` to set up EAS
- [ ] Build with `npx eas build --platform android --profile production`
- [ ] Download APK/AAB from Expo dashboard
- [ ] Upload AAB to Google Play Console ($25 one-time fee)

## Data Storage

All data is stored locally using AsyncStorage. No cloud, no accounts, no tracking.

To backup: Settings → Backup Data → Copy JSON
To restore: (Coming soon - import feature)

## License

Your data, your device. No external dependencies for core functionality.
