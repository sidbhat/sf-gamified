# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
_Nothing yet - see v0.1.0 for latest changes_

### Changed
_Nothing yet_

### Deprecated
_Nothing yet_

### Removed
_Nothing yet_

### Fixed
- **Shadow DOM Support for Joule Input Field** (2025-12-07)
  - Fixed textarea access in UI5 Web Components Shadow DOM
  - `typeText()` now directly accesses Shadow DOM textarea element
  - `clickSendButton()` now finds textarea in Shadow DOM
  - Added `waitForElementInShadowRoot()` helper method
  - Events use `composed: true` to cross Shadow DOM boundary
  - See [SHADOW-DOM-FIX-COMPLETE.md](../SHADOW-DOM-FIX-COMPLETE.md) for details

- **Cross-Origin Iframe Access** (2025-12-07)
  - Fixed "Blocked a frame with origin" security error
  - Removed direct DOM access to Joule iframe
  - Now uses postMessage API exclusively for iframe communication
  - See [CROSS-ORIGIN-FIX.md](../CROSS-ORIGIN-FIX.md) for details

### Security
- Improved security by eliminating cross-origin DOM access attempts
- All iframe communication now uses browser-approved postMessage API

---

## [0.1.0] - 2025-12-07

### Added
- **Chrome Extension Infrastructure**
  - Manifest V3 configuration (`manifest.json`)
  - Background service worker (`src/background.js`)
  - Content script with auto-injection (`src/content.js`)
  - Popup UI (HTML, CSS, JS in `src/ui/`)

- **Configuration System**
  - Quest definitions (`src/config/quests.json`)
  - User credentials (`src/config/users.json`)
  - Element selectors with fallbacks (`src/config/selectors.json`)

- **Core Classes**
  - `JouleHandler` - Joule AI assistant interaction
  - `QuestRunner` - Quest orchestration and execution
  - `StorageManager` - Chrome storage management
  - `ShadowDOMHelper` - Shadow DOM traversal utility
  - `Logger` - Comprehensive logging system

- **UI Components**
  - Mario-themed overlay notifications (`src/ui/overlay.js` + CSS)
  - Confetti celebration animation (`src/ui/confetti.js`)
  - Progress tracking with step indicators
  - Popup interface with stats and mode selector

- **Quest Features**
  - Single quest: "View Cost Center" (3 steps)
  - Demo mode - Automated execution
  - Real mode - User performs, extension verifies
  - Response detection with MutationObserver
  - Keyword matching for validation

- **Documentation**
  - AI development framework (`.clinerules`)
  - Product requirements (PRD.md)
  - Technical specifications (TECHNICAL-SPEC.md)
  - Architecture documentation (ARCHITECTURE.md)
  - Feature tracking (FEATURES.md)
  - Roadmap (ROADMAP.md)
  - Installation guide (INSTALL.md)
  - User README

### Technical Highlights
- Shadow DOM piercing with recursive traversal
- Multiple selector strategies (CSS, XPath, Shadow DOM)
- Event dispatching for Shadow DOM inputs
- Chrome storage for progress persistence
- Message passing between popup/background/content scripts

### Files Created
- 25 total files
- 6 documentation files
- 3 configuration files
- 12 source code files
- 4 UI files

---

## Version History

- **0.1.0** (2025-12-07): MVP Core Implementation - Chrome extension with 1 quest, demo/real modes, Mario UI theme
- **1.0.0** (TBD): Production release with multiple quests and enhanced features
