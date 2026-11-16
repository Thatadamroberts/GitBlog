export default {
  /** GitHub user whose public repos are shown. */
  username: 'thatadamroberts',
  /** Only public repos tagged with this topic appear on the site. */
  topic: 'gitblog',
  title: 'Projects',
  bio: 'Things I have built, and the stories behind them.',

  /**
   * GitHub topics that describe what a project *is*. They appear in the "Type"
   * filter. Every other topic, plus the repo's main languages, goes under "Built with".
   * Order here is the order of the filter chips.
   */
  types: ['game', 'productivity', 'health', 'm365', 'history', 'tool'],

  /** Display names for topics and languages (GitHub topics are always lowercase). */
  labels: {
    game: 'Game',
    productivity: 'Productivity',
    health: 'Health',
    m365: 'Microsoft 365',
    history: 'History',
    tool: 'Tool',
    pwa: 'PWA',
    android: 'Android',
    canvas: 'Canvas',
    'jetpack-compose': 'Jetpack Compose',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    kotlin: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    python: 'Python',
    powershell: 'PowerShell',
    'c-sharp': 'C#',
  } as Record<string, string>,

  /** Languages too minor to list (build scripts and the like). */
  ignoreLanguages: ['Shell', 'Batchfile', 'Dockerfile', 'Makefile', 'Procfile'],
  /** A language must make up at least this share of a repo's code to be listed. */
  minLanguageShare: 0.1,
};
