import * as React from 'react';
import { IContainerProps } from './IContainerProps';
import { IVisibilitySettings, DEFAULT_VISIBILITY_SETTINGS, TARGET_SELECTORS } from '../../../models/IVisibilitySettings';

export interface IContainerState {
    settings: IVisibilitySettings;
    loading: boolean;
    saving: boolean;
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
        constructor(props: IContainerProps) {
            super(props);
            this.state = {
                settings: DEFAULT_VISIBILITY_SETTINGS,
                loading: true,
                saving: false
            };
        }

    public async componentDidMount(): Promise<void> {
        try {
            console.debug('[VT] Container component mounted');
            await this.loadSettings();
        } catch (error) {
            console.error('[VT] Error in Container componentDidMount:', error);
        }
    }

        public componentWillUnmount(): void {
            // Services are managed by the Application Customizer
        }

        private async loadSettings(): Promise<void> {
            try {
                this.setState({ loading: true });
                const settings = await this.props.persistenceService.loadVisibilitySettings();
                this.setState({ settings });
                
                // Apply settings immediately
                this.props.visibilityManager.applySettings(settings);
                console.debug('[VT] Settings loaded and applied:', settings);
            } catch (error) {
                console.error('[VT] Error loading settings:', error);
            } finally {
                this.setState({ loading: false });
            }
        }

        private async saveSettings(settings: IVisibilitySettings): Promise<void> {
            try {
                this.setState({ saving: true });
                await this.props.persistenceService.saveVisibilitySettings(settings);
                this.setState({ settings });
                
                // Apply settings immediately after saving
                this.props.visibilityManager.applySettings(settings);
                
                // Notify parent component of settings change
                if (this.props.onSettingsChange) {
                    this.props.onSettingsChange(settings);
                }
                
                console.debug('[VT] Settings saved and applied:', settings);
            } catch (error) {
                console.error('[VT] Error saving settings:', error);
            } finally {
                this.setState({ saving: false });
            }
        }

    private handleToggleChange = async (toggleId: string, value: boolean): Promise<void> => {
        const newSettings: IVisibilitySettings = {
            ...this.state.settings,
            toggles: {
                ...this.state.settings.toggles,
                [toggleId]: value
            },
            updatedUtc: new Date().toISOString()
        };

        // Update state immediately for UI responsiveness
        this.setState({ settings: newSettings });
        
        // Apply settings immediately
        this.props.visibilityManager.applySettings(newSettings);
        
        // Notify parent component of settings change
        if (this.props.onSettingsChange) {
            this.props.onSettingsChange(newSettings);
        }
        
        // Save to Site Assets
        await this.saveSettings(newSettings);
    };

    public render(): React.ReactElement {
        const { settings, loading, saving } = this.state;

        if (loading) {
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
                        minWidth: '300px',
                        textAlign: 'center'
                    }
                },
                React.createElement('h3', { style: { margin: '0 0 15px 0' } }, 'Loading...')
            );
        }

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
                    minWidth: '350px',
                    maxWidth: '500px'
                }
            },
            // Header with close icon
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }
            },
                React.createElement('h3', { 
                    style: { 
                        margin: '0',
                        color: '#323130',
                        fontSize: '18px'
                    } 
                }, 'Visibility Toggler'),
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
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '16px',
                        color: '#605e5c',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px'
                    },
                    title: 'Close'
                }, '✕')
            ),
            
            // Toggle switches for each target
            ...TARGET_SELECTORS.map(target => {
                const isVisible = settings.toggles[target.id];
                return React.createElement(
                    'div',
                    {
                        key: target.id,
                        style: {
                            padding: '12px 0',
                            borderBottom: '1px solid #edebe9'
                        }
                    },
                    // Main toggle row
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                        }
                    },
                        // Label
                        React.createElement('label', {
                            style: {
                                fontSize: '14px',
                                color: '#323130',
                                cursor: 'pointer',
                                flex: 1
                            },
                            onClick: () => this.handleToggleChange(target.id, !isVisible)
                        }, target.label),
                        
                        // Toggle switch
                        React.createElement(
                            'div',
                            {
                                style: {
                                    position: 'relative',
                                    width: '44px',
                                    height: '24px',
                                    backgroundColor: isVisible ? '#0078d4' : '#c8c6c4',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    border: 'none'
                                },
                                onClick: () => this.handleToggleChange(target.id, !isVisible)
                            },
                            React.createElement('div', {
                                style: {
                                    position: 'absolute',
                                    top: '2px',
                                    left: isVisible ? '22px' : '2px',
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    transition: 'left 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }
                            })
                        )
                        )
                );
            }),

            // Status indicator
            saving && React.createElement('div', {
                style: {
                    marginTop: '15px',
                    padding: '8px',
                    backgroundColor: '#f3f2f1',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#605e5c',
                    textAlign: 'center'
                }
            }, 'Saving...'),

            // Footer with Monarch logo
            React.createElement('div', {
                style: {
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop: '1px solid #edebe9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }
            },
                React.createElement('span', {
                    style: {
                        fontSize: '12px',
                        color: '#605e5c'
                    }
                }, 'Powered By'),
                React.createElement('img', {
                    src: require('../../../components/Monarch_black.png'),
                    alt: 'Monarch',
                    style: {
                        height: '16px',
                        width: 'auto'
                    }
                })
            )
        );
    }
}