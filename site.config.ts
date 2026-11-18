export default {
  /** GitHub user whose public repos are shown. */
  username: 'thatadamroberts',
  /** Only public repos tagged with this topic appear on the site. */
  topic: 'gitblog',
  title: 'Projects',
  bio: 'Things I have built, and the stories behind them.',

  /**
   * The "Type" filter: every project is a Game, Productivity or Other.
   * A project's type comes from `projectTypes` below if it's listed there, otherwise from a
   * matching GitHub topic (`game` or `productivity`). Anything else counts as Other.
   * Order here is the order of the filter chips; Other always comes last.
   */
  types: ['game', 'productivity'],
  otherType: { slug: 'other', label: 'Other' },

  /** Type for each repo, by repo name. Overrides topics, so you don't have to tag every repo. */
  projectTypes: {
    SkyReign: 'game',
    'Zombie-Nation': 'game',
    Snakey: 'game',
    DinoTrouble: 'game',
    ShrewsburyExplorer: 'game',
    ToDoRPG: 'productivity',
    M365Tracker: 'productivity',
    'SharePoint-Site-Health': 'productivity',
    ServedUp: 'other',
  } as Record<string, string>,

  /** Display names for topics and languages (GitHub topics are always lowercase). */
  labels: {
    game: 'Game',
    productivity: 'Productivity',
    m365: 'Microsoft 365',
    sharepoint: 'SharePoint',
    spfx: 'SPFx',
    expo: 'Expo',
    godot: 'Godot',
    gdscript: 'GDScript',
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
