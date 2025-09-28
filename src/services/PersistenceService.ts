import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { IVisibilitySettings, IFabPosition, DEFAULT_VISIBILITY_SETTINGS } from '../models/IVisibilitySettings';

/**
 * Service for persisting visibility settings and FAB position
 */
export class PersistenceService {
  private spHttpClient: SPHttpClient;
  private webUrl: string;
  private siteId: string;
  private context: ApplicationCustomizerContext;
  private readonly SETTINGS_FILE_NAME = 'visibilityToggler.json';

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
    this.spHttpClient = context.spHttpClient;
    this.webUrl = context.pageContext.web.absoluteUrl;
    this.siteId = context.pageContext.site.id.toString();
  }

  /**
   * Load visibility settings from Site Assets
   */
  public async loadVisibilitySettings(): Promise<IVisibilitySettings> {
    try {
      // Use proper server-relative URL like monarchNav reference
      const serverRelativeUrl = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      const fileUrl = `${serverRelativeUrl}/${this.SETTINGS_FILE_NAME}`;
      const url = `${this.webUrl}/_api/web/getfilebyserverrelativeurl('${fileUrl}')/$value`;
      
      const response: SPHttpClientResponse = await this.spHttpClient.get(url, SPHttpClient.configurations.v1);
      
      if (response.ok) {
        const content = await response.text();
        const settings: IVisibilitySettings = JSON.parse(content);
        console.debug('[VT] Loaded visibility settings:', settings);
        return settings;
      } else if (response.status === 404) {
        console.debug('[VT] Settings file not found, using defaults');
        return DEFAULT_VISIBILITY_SETTINGS;
      } else {
        console.warn('[VT] Failed to load settings:', response.status);
        return DEFAULT_VISIBILITY_SETTINGS;
      }
    } catch (error) {
      console.error('[VT] Error loading visibility settings:', error);
      return DEFAULT_VISIBILITY_SETTINGS;
    }
  }

  /**
   * Save visibility settings to Site Assets
   */
  public async saveVisibilitySettings(settings: IVisibilitySettings): Promise<boolean> {
    try {
      // Update timestamp
      const updatedSettings: IVisibilitySettings = {
        ...settings,
        updatedUtc: new Date().toISOString()
      };

      // Use proper server-relative URL like monarchNav reference
      const serverRelativeUrl = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      
      // Convert settings to JSON string with proper formatting
      const settingsJson = JSON.stringify(updatedSettings, null, 4);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      
      // Update the file (overwrite existing) - using monarchNav approach
      const uploadUrl = `${this.webUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files/add(overwrite=true,url='${this.SETTINGS_FILE_NAME}')`;
      
      const response: SPHttpClientResponse = await this.spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          body: blob
        }
      );

      if (response.ok) {
        console.debug('[VT] Settings saved successfully');
        return true;
      } else {
        let errorData: unknown = null;
        try {
          errorData = await response.clone().json();
        } catch {
          errorData = await response.text();
        }
        console.warn('[VT] Failed to save settings:', response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error('[VT] Error saving visibility settings:', error);
      return false;
    }
  }

  /**
   * Load FAB position from localStorage
   */
  public loadFabPosition(): IFabPosition | undefined {
    try {
      const key = `vt:pos:${this.siteId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const position: IFabPosition = JSON.parse(stored);
        console.debug('[VT] Loaded FAB position:', position);
        return position;
      }
    } catch (error) {
      console.error('[VT] Error loading FAB position:', error);
    }
    return undefined;
  }

  /**
   * Save FAB position to localStorage
   */
  public saveFabPosition(position: IFabPosition): void {
    try {
      const key = `vt:pos:${this.siteId}`;
      localStorage.setItem(key, JSON.stringify(position));
      console.debug('[VT] Saved FAB position:', position);
    } catch (error) {
      console.error('[VT] Error saving FAB position:', error);
    }
  }

}
