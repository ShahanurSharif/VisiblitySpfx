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

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Show alert to confirm extension is loading
    alert('Visibility Toggler Extension Loaded! 🎉');

    // Check for feature flag
    if (window.location.search.indexOf('VT_DISABLE') !== -1) {
      console.debug('[VT] Feature disabled via URL parameter');
      return Promise.resolve();
    }

    // Create a simple button that opens the dialog container
    const buttonElement: React.ReactElement = React.createElement(
      'button',
      {
        onClick: this.openDialogContainer,
        style: {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      },
      'Visibility Toggler'
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
        context: this.context
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

  public onDispose(): void {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
    
    // Clean up dialog container if it exists
    this.closeDialogContainer();
  }
}