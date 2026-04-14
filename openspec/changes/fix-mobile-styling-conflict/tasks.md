## 1. Monorepo Cleanup (Root)

- [x] 1.1 Remove redundant `app/` directory from the monorepo root
- [x] 1.2 Remove root-level proxy files: `App.js`, `app.json`, `metro.config.js`, `babel.config.js`
- [x] 1.3 Update root `package.json` scripts to ensure `mobile:dev` and related commands use `--filter=@iter/mobile` correctly

## 2. Mobile Workspace Stabilization

- [x] 2.1 Verify `apps/mobile/babel.config.js` has `nativewind/babel` as a preset/plugin and `jsxImportSource: "nativewind"`
- [x] 2.2 Verify `apps/mobile/metro.config.js` uses `withNativeWind` and points correctly to `global.css`
- [x] 2.3 Ensure `apps/mobile/tailwind.config.js` includes all relevant paths in the `content` array

## 3. Styling Restoration & Verification

- [ ] 3.1 Clear Metro bundler cache (`npx expo start --clear` from `apps/mobile`)
- [ ] 3.2 Launch the application and verify the Login screen displays the debug red line (if present) and correct theme colors
- [ ] 3.3 Test both Light and Dark modes to ensure `nativewind` is responding to the system color scheme
