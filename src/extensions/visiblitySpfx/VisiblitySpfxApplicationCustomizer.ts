import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderName,
  PlaceholderContent
} from '@microsoft/sp-application-base';

import * as strings from 'VisiblitySpfxApplicationCustomizerStrings';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Container from './components/Container';
import { IFabPosition } from '../../models/IVisibilitySettings';
import { PersistenceService } from '../../services/PersistenceService';
import { VisibilityManager } from '../../services/VisibilityManager';

const LOG_SOURCE: string = 'VisiblitySpfxApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it. 
 */
export interface IVisiblitySpfxApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class VisiblitySpfxApplicationCustomizer
  extends BaseApplicationCustomizer<IVisiblitySpfxApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _containerElement: HTMLElement | undefined;
  private _fabPosition: IFabPosition | undefined;
  private _isDragging: boolean = false;
  private _dragStart: { x: number; y: number } | undefined;
  private _fabElement: HTMLElement | undefined;
  private _hasDragged: boolean = false;
  private _persistenceService: PersistenceService;
  private _visibilityManager: VisibilityManager;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Show alert to confirm extension is loading
    // alert('Visibility Toggler Extension Loaded! 🎉');

    // Check for feature flag
    if (window.location.search.indexOf('VT_DISABLE') !== -1) {
      console.debug('[VT] Feature disabled via URL parameter');
      return Promise.resolve();
    }

    // Initialize services
    this._persistenceService = new PersistenceService(this.context);
    this._visibilityManager = new VisibilityManager();

    // Load and apply settings on site load
    try {
      const settings = await this._persistenceService.loadVisibilitySettings();
      this._visibilityManager.applySettings(settings);
      console.debug('[VT] Settings loaded and applied on site load:', settings);
    } catch (error) {
      console.error('[VT] Error loading settings on site load:', error);
    }

    // Load Fabric icons CSS
    this.loadFabricIcons();

    // Load FAB position from localStorage
    this.loadFabPosition();

    // Create a draggable button that opens the dialog container
    const buttonElement: React.ReactElement = React.createElement(
      'button',
      {
        onClick: this.handleClick,
        onMouseDown: this.handleMouseDown,
        ref: (element: HTMLElement) => {
          if (element) {
            this._fabElement = element;
            this.applyFabPosition();
          }
        },
        style: {
          position: 'fixed',
          top: this._fabPosition?.top || 20,
          left: this._fabPosition?.left || 'auto',
          right: this._fabPosition?.left ? 'auto' : 20,
          zIndex: 1000,
          width: '25px',
          height: '25px',
          padding: '0',
          backgroundColor: 'rgb(95, 95, 95)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'move',
          fontSize: '12px',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: this._isDragging ? 'none' : 'box-shadow 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      },
      React.createElement('i', {
        className: 'ms-Icon ms-Icon--View',
        style: {
          fontSize: '12px',
          lineHeight: '1'
        }
      })
    );

    const topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top
    );
    
    if (topPlaceholder) {
      this._topPlaceholder = topPlaceholder;
      ReactDom.render(
        buttonElement,
        topPlaceholder.domElement
      );
    }

    return Promise.resolve();
  }

  private openDialogContainer = (): void => {
    console.debug('[VT] Button clicked - opening dialog container');
    
    // Create container element for the dialog
    this._containerElement = document.createElement('div');
    this._containerElement.setAttribute('data-vt-dialog', 'true');
    this._containerElement.style.position = 'fixed';
    this._containerElement.style.top = '0';
    this._containerElement.style.left = '0';
    this._containerElement.style.width = '100%';
    this._containerElement.style.height = '100%';
    this._containerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this._containerElement.style.zIndex = '2000';
    this._containerElement.style.display = 'flex';
    this._containerElement.style.alignItems = 'center';
    this._containerElement.style.justifyContent = 'center';

    // Add click handler to close dialog when clicking outside
    this._containerElement.addEventListener('click', (e) => {
      if (e.target === this._containerElement) {
        this.closeDialogContainer();
      }
    });

        // Create the Container component
        const containerElement: React.ReactElement = React.createElement(
          Container, 
          {
            context: this.context,
            persistenceService: this._persistenceService,
            visibilityManager: this._visibilityManager
          }
        );

    // Render the container in the dialog
    ReactDom.render(containerElement, this._containerElement);
    console.debug('[VT] Container component rendered in dialog');

    // Add to document body
    document.body.appendChild(this._containerElement);
    console.debug('[VT] Dialog container added to document body');
  };

  private closeDialogContainer = (): void => {
    if (this._containerElement) {
      ReactDom.unmountComponentAtNode(this._containerElement);
      document.body.removeChild(this._containerElement);
      this._containerElement = undefined;
    }
  };

  private loadFabricIcons(): void {
    // Check if Fabric icons CSS is already loaded
    if (document.querySelector('link[href*="fabric.css"]')) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://res.cdn.office.net/files/fabric-cdn-prod_20241209.001/assets/icons/fabric.css';
    document.head.appendChild(link);
    console.debug('[VT] Fabric icons CSS loaded');
  }

  private loadFabPosition(): void {
    try {
      const siteId = this.context.pageContext.site.id.toString();
      const key = `vt:pos:${siteId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this._fabPosition = JSON.parse(stored);
        console.debug('[VT] Loaded FAB position from localStorage:', this._fabPosition);
      }
    } catch (error) {
      console.error('[VT] Error loading FAB position:', error);
    }
  }

  private saveFabPosition(): void {
    if (!this._fabPosition) return;
    
    try {
      const siteId = this.context.pageContext.site.id.toString();
      const key = `vt:pos:${siteId}`;
      localStorage.setItem(key, JSON.stringify(this._fabPosition));
      console.debug('[VT] Saved FAB position to localStorage:', this._fabPosition);
    } catch (error) {
      console.error('[VT] Error saving FAB position:', error);
    }
  }

  private applyFabPosition(): void {
    if (!this._fabElement || !this._fabPosition) return;
    
    this._fabElement.style.top = `${this._fabPosition.top}px`;
    this._fabElement.style.left = `${this._fabPosition.left}px`;
    this._fabElement.style.right = 'auto';
  }

  private handleClick = (e: React.MouseEvent): void => {
    // Only open dialog if we haven't dragged
    if (!this._hasDragged) {
      this.openDialogContainer();
    }
    // Reset drag flag
    this._hasDragged = false;
  };

  private handleMouseDown = (e: React.MouseEvent): void => {
    // Only start dragging if it's a left mouse button
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this._isDragging = true;
    this._hasDragged = false;
    this._dragStart = {
      x: e.clientX - (this._fabPosition?.left || 0),
      y: e.clientY - (this._fabPosition?.top || 0)
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // Change cursor and add visual feedback
    if (this._fabElement) {
      this._fabElement.style.cursor = 'grabbing';
      this._fabElement.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this._isDragging || !this._dragStart) return;
    
    e.preventDefault();
    
    // Mark as dragged if mouse moved more than 5 pixels
    const deltaX = Math.abs(e.clientX - (this._dragStart.x + (this._fabPosition?.left || 0)));
    const deltaY = Math.abs(e.clientY - (this._dragStart.y + (this._fabPosition?.top || 0)));
    
    if (deltaX > 5 || deltaY > 5) {
      this._hasDragged = true;
    }
    
    const newLeft = e.clientX - this._dragStart.x;
    const newTop = e.clientY - this._dragStart.y;
    
    // Constrain to viewport bounds
    const maxLeft = window.innerWidth - (this._fabElement?.offsetWidth || 25);
    const maxTop = window.innerHeight - (this._fabElement?.offsetHeight || 25);
    
    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const constrainedTop = Math.max(0, Math.min(newTop, maxTop));
    
    // Update position
    this._fabPosition = {
      left: constrainedLeft,
      top: constrainedTop
    };
    
    // Apply position immediately
    this.applyFabPosition();
  };

  private handleMouseUp = (): void => {
    if (!this._isDragging) return;
    
    this._isDragging = false;
    this._dragStart = undefined;
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // Restore cursor and visual feedback
    if (this._fabElement) {
      this._fabElement.style.cursor = 'move';
      this._fabElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    }
    
    // Save position to localStorage
    this.saveFabPosition();
  };

      public onDispose(): void {
        // Clean up event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        if (this._topPlaceholder && this._topPlaceholder.domElement) {
          ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
        }
        
        // Clean up dialog container if it exists
        this.closeDialogContainer();

        // Clean up services
        if (this._visibilityManager) {
          this._visibilityManager.dispose();
        }
      }
}