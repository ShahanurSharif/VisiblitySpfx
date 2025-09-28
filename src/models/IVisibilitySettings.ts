/**
 * Interface for visibility settings stored in Site Assets
 */
export interface IVisibilitySettings {
  version: number;
  updatedUtc: string;
  toggles: Record<string, boolean>;
}

/**
 * Interface for FAB position stored in localStorage
 */
export interface IFabPosition {
  left: number;
  top: number;
  edge?: 'left' | 'right';
}

/**
 * Interface for target selectors configuration
 */
export interface ITargetSelector {
  id: string;
  label: string;
  selectors: string[];
}

/**
 * Default visibility settings
 */
export const DEFAULT_VISIBILITY_SETTINGS: IVisibilitySettings = {
  version: 1,
  updatedUtc: new Date().toISOString(),
  toggles: {
    siteHeader: true,
    hubNav: true,
    suiteNav: true, // NEW
    commandBar: true,
    leftNav: true,
    breadcrumb: true,
    pageHeader: true,
    siteContent: true
  }
};

/**
 * Target selectors for SharePoint elements
 */
export const TARGET_SELECTORS: ITargetSelector[] = [
  {
    id: 'siteHeader',
    label: 'Site Header',
    selectors: [
      '[data-automationid="SiteHeader"]',
      '.spSiteHeader',
      '.o365cs-nav-header',
      '#spSiteHeader'
    ]
  },
  {
    id: 'hubNav',
    label: 'Hub Navigation',
    selectors: [
      '.ms-HubNav',
      '.ms-HubNav-enhancedMegaMenu'
    ]
  },
  {
    id: 'suiteNav',
    label: 'Suite Navigation',
    selectors: [
      '#SuiteNavWrapper',
      '.od-SuiteNav',
      '.od-SuiteNav-DefaultHeight'
    ]
  },
  {
    id: 'commandBar',
    label: 'Command Bar',
    selectors: [
      '[data-automationid="CommandBar"]',
      '.spCommandBar',
      '#spCommandBar',
      '.o365cs-nav-commandBar',
      '.od-TopBar-item',
      '.od-TopBar-commandBar',
      '.od-Files-topBar'
    ]
  },
  {
    id: 'leftNav',
    label: 'Left Navigation',
    selectors: [
      '[data-automationid="LeftNav"]',
      '#spLeftNav',
      '.o365cs-nav-leftNav',
      '.sp-leftNav',
      '.Files-leftNav',
      '.Files-has-leftNavToggleButton'
    ]
  },
  {
    id: 'breadcrumb',
    label: 'Breadcrumb',
    selectors: [
      '[data-automationid="Breadcrumb"]',
      '.sp-breadcrumb',
      '.o365cs-nav-breadcrumb'
    ]
  },
  {
    id: 'pageHeader',
    label: 'Page Header',
    selectors: [
      '[data-automationid="PageHeader"]',
      '.sp-pageHeader',
      '.o365cs-nav-pageHeader'
    ]
  },
  {
    id: 'siteContent',
    label: 'Site Content Pages',
    selectors: [
      '[data-automationid="SiteContent"]',
      '.sp-siteContent',
      '.o365cs-nav-siteContent',
      '.ms-SiteContent'
    ]
  }
];
