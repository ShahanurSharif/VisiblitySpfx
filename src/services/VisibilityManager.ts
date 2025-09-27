import { ITargetSelector, TARGET_SELECTORS, IVisibilitySettings } from '../models/IVisibilitySettings';

/**
 * Service for managing element visibility
 */
export class VisibilityManager {
  private elementCache: Map<string, HTMLElement | null> = new Map();
  private originalStyles: Map<string, string> = new Map();
  private debounceTimer: number | null = null;
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    this.setupMutationObserver();
  }

  /**
   * Apply visibility settings to all target elements
   */
  public applySettings(settings: IVisibilitySettings): void {
    console.debug('[VT] Applying visibility settings:', settings);
    
    TARGET_SELECTORS.forEach(target => {
      const isVisible = settings.toggles[target.id] !== false;
      this.setElementVisibility(target, isVisible);
    });
  }

  /**
   * Set visibility for a specific target
   */
  public setElementVisibility(target: ITargetSelector, visible: boolean): void {
    const element = this.queryFirst(target.selectors);
    
    if (element) {
      this.elementCache.set(target.id, element);
      
      if (visible) {
        // Restore original style if it was hidden
        const originalStyle = this.originalStyles.get(target.id);
        if (originalStyle !== undefined) {
          element.style.display = originalStyle;
          this.originalStyles.delete(target.id);
        } else {
          element.style.display = '';
        }
      } else {
        // Store original style and hide
        if (!this.originalStyles.has(target.id)) {
          this.originalStyles.set(target.id, element.style.display || '');
        }
        element.style.display = 'none';
      }
      
      console.debug(`[VT] ${visible ? 'Shown' : 'Hidden'} ${target.label}`);
    } else {
      console.debug(`[VT] Element not found for ${target.label}, will retry on next observer tick`);
      // Clear cache entry if element not found
      this.elementCache.set(target.id, null);
    }
  }

  /**
   * Query for the first matching element from a list of selectors
   */
  private queryFirst(selectors: string[]): HTMLElement | null {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          return element;
        }
      } catch {
        console.debug('[VT] Invalid selector:', selector);
      }
    }
    return null;
  }

  /**
   * Setup mutation observer to handle DOM changes
   */
  private setupMutationObserver(): void {
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        this.debouncedReapply();
      });

      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-automationid']
      });

      console.debug('[VT] Mutation observer setup complete');
    }
  }

  /**
   * Debounced re-application of settings
   */
  private debouncedReapply(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.reapplyCachedSettings();
    }, 200);
  }

  /**
   * Re-apply settings using cached visibility state
   */
  private reapplyCachedSettings(): void {
    console.debug('[VT] Re-applying cached settings due to DOM changes');
    
    // Check if cached elements are still valid
    this.elementCache.forEach((element, targetId) => {
      if (element && !document.contains(element)) {
        // Element was removed from DOM, clear cache
        this.elementCache.set(targetId, null);
      }
    });

    // Find target settings and re-apply
    TARGET_SELECTORS.forEach(target => {
      const element = this.elementCache.get(target.id);
      
      // If we have a cached element and it's still in DOM, maintain its state
      if (element && document.contains(element)) {
        // Element is still valid, no action needed
        return;
      }

      // Try to find the element again
      const newElement = this.queryFirst(target.selectors);
      if (newElement) {
        this.elementCache.set(target.id, newElement);
        
        // Apply the current visibility state
        const isHidden = this.originalStyles.has(target.id);
        if (isHidden) {
          this.originalStyles.set(target.id, newElement.style.display || '');
          newElement.style.display = 'none';
        }
      }
    });
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.elementCache.clear();
    this.originalStyles.clear();
    
    console.debug('[VT] Visibility manager disposed');
  }

  /**
   * Get current visibility state of all targets
   */
  public getCurrentVisibilityState(): Record<string, boolean> {
    const state: Record<string, boolean> = {};
    
    TARGET_SELECTORS.forEach(target => {
      const element = this.elementCache.get(target.id) || this.queryFirst(target.selectors);
      state[target.id] = element ? element.style.display !== 'none' : true;
    });
    
    return state;
  }
}
