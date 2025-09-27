import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { VisibilityTogglerApp } from '../../components/VisibilityTogglerApp';
import { PersistenceService } from '../../services/PersistenceService';
import { VisibilityManager } from '../../services/VisibilityManager';
import { IVisibilitySettings, IFabPosition, DEFAULT_VISIBILITY_SETTINGS } from '../../models/IVisibilitySettings';

import * as strings from 'VisiblitySpfxApplicationCustomizerStrings';

const LOG_SOURCE: string = 'VisiblitySpfxApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IVisiblitySpfxApplicationCustomizerProperties {
  // No properties needed for this extension
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class VisiblitySpfxApplicationCustomizer
  extends BaseApplicationCustomizer<IVisiblitySpfxApplicationCustomizerProperties> {

  private persistenceService: PersistenceService;
  private visibilityManager: VisibilityManager;
  private rootElement: HTMLElement | null = null;
  private currentSettings: IVisibilitySettings = DEFAULT_VISIBILITY_SETTINGS;
  private currentFabPosition: IFabPosition | undefined = undefined;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Check for feature flag
    if (window.location.search.indexOf('VT_DISABLE') !== -1) {
      console.debug('[VT] Feature disabled via URL parameter');
      return;
    }

    try {
      console.debug('[VT] Starting initialization...');
      
      // Initialize services
      this.persistenceService = new PersistenceService(this.context);
      this.visibilityManager = new VisibilityManager();
      console.debug('[VT] Services initialized');

      // Load settings and position
      await this.loadInitialData();
      console.debug('[VT] Initial data loaded');

      // Setup navigation event listener
      this.context.application.navigatedEvent.add(this, this.onNavigated);
      console.debug('[VT] Navigation event listener added');

      // Mount React app
      this.mountReactApp();
      console.debug('[VT] React app mounted');

      console.debug('[VT] Visibility Toggler initialized successfully');
    } catch (error) {
      console.error('[VT] Error initializing Visibility Toggler:', error);
    }

    return Promise.resolve();
  }

  private async loadInitialData(): Promise<void> {
    // Load visibility settings
    this.currentSettings = await this.persistenceService.loadVisibilitySettings();
    
    // Load FAB position
    this.currentFabPosition = this.persistenceService.loadFabPosition();

    // Apply initial settings
    this.visibilityManager.applySettings(this.currentSettings);
  }

  private onNavigated = (): void => {
    console.debug('[VT] Navigation event - re-applying settings');
    this.visibilityManager.applySettings(this.currentSettings);
  };

  private mountReactApp(): void {
    console.debug('[VT] Mounting React app...');
    
    // Create root element
    this.rootElement = document.createElement('div');
    this.rootElement.id = 'vt-root';
    document.body.appendChild(this.rootElement);
    console.debug('[VT] Root element created and appended to body');

    // Mount React app
    const element: React.ReactElement<{}> = React.createElement(VisibilityTogglerApp, {
      settings: this.currentSettings,
      fabPosition: this.currentFabPosition,
      onSettingsChange: this.onSettingsChange,
      onSettingsSave: this.onSettingsSave,
      onFabPositionChange: this.onFabPositionChange
    });

    console.debug('[VT] React element created, about to render...');
    ReactDom.render(element, this.rootElement);
    console.debug('[VT] React app rendered successfully');
  }

  private onSettingsChange = (settings: IVisibilitySettings): void => {
    this.currentSettings = settings;
    this.visibilityManager.applySettings(settings);
  };

  private onSettingsSave = async (settings: IVisibilitySettings): Promise<void> => {
    const success = await this.persistenceService.saveVisibilitySettings(settings);
    
    if (success) {
      this.currentSettings = settings;
      console.debug('[VT] Settings saved successfully');
    } else {
      // Handle read-only user scenario
      console.warn('[VT] Failed to save settings - user may be read-only');
      // Show toast notification or handle gracefully
    }
  };

  private onFabPositionChange = (position: IFabPosition): void => {
    this.currentFabPosition = position;
    this.persistenceService.saveFabPosition(position);
  };

  public onDispose(): void {
    // Cleanup
    if (this.visibilityManager) {
      this.visibilityManager.dispose();
    }

    if (this.rootElement) {
      ReactDom.unmountComponentAtNode(this.rootElement);
      this.rootElement.remove();
    }

    this.context.application.navigatedEvent.remove(this, this.onNavigated);
    
    console.debug('[VT] Visibility Toggler disposed');
  }
}
