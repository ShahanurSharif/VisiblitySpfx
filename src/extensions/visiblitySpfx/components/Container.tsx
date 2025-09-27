import * as React from 'react';
import { IContainerProps } from './IContainerProps';

export interface IContainerState {
    // Simple state for now
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
    constructor(props: IContainerProps) {
        super(props);
        this.state = {};
    }

    public componentDidMount(): void {
        console.debug('[VT] Container component mounted');
    }

    public render(): React.ReactElement {
        return React.createElement(
            'div',
            {
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    zIndex: 2001,
                    minWidth: '300px'
                }
            },
            React.createElement('h3', { style: { margin: '0 0 15px 0' } }, 'Visibility Toggler'),
            React.createElement('p', { style: { margin: '0 0 15px 0' } }, 'Settings loaded successfully!'),
            React.createElement('button', {
                onClick: () => {
                    console.log('Close dialog');
                    // Close dialog by removing from DOM
                    const container = document.querySelector('[data-vt-dialog]');
                    if (container && container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                },
                style: {
                    padding: '8px 16px',
                    backgroundColor: '#0078d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }
            }, 'Close')
        );
    }
}