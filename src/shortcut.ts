// Platform-aware label for the command palette shortcut.
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'
