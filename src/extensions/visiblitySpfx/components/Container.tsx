import * as React from 'react';
import { IContainerProps } from './IContainerProps';
import { VisibilityTogglerApp } from '../../../components/VisibilityTogglerApp';
import { IVisibilitySettings, IFabPosition, DEFAULT_VISIBILITY_SETTINGS } from '../../../models/IVisibilitySettings';
import { PersistenceService } from '../../../services/PersistenceService';
import { VisibilityManager } from '../../../services/VisibilityManager';

export interface IContainerState {
    settings: IVisibilitySettings;
    fabPosition?: IFabPosition;
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
    private persistenceService: PersistenceService;
    private visibilityManager: VisibilityManager;

    constructor(props: IContainerProps) {
        super(props);
        
        this.state = {
            settings: DEFAULT_VISIBILITY_SETTINGS,
            fabPosition: undefined
        };

        this.persistenceService = new PersistenceService(this.props.context);
        this.visibilityManager = new VisibilityManager();
    }

    public async componentDidMount(): Promise<void> {
        try {
            // Load settings and position
            await this.loadInitialData();
        } catch (error) {
            console.error('[VT] Error in Container componentDidMount:', error);
        }
    }

    public componentWillUnmount(): void {
        if (this.visibilityManager) {
            this.visibilityManager.dispose();
        }
    }

    private async loadInitialData(): Promise<void> {
        try {
            // Load settings
            const settings = await this.persistenceService.loadVisibilitySettings();
            this.setState({ settings });

            // Load FAB position
            const fabPosition = this.persistenceService.loadFabPosition();
            this.setState({ fabPosition });

            // Apply initial settings
            this.visibilityManager.applySettings(settings);
        } catch (error) {
            console.error('[VT] Error loading initial data:', error);
        }
    }


    private onSettingsChange = (newSettings: IVisibilitySettings): void => {
        this.setState({ settings: newSettings });
        this.visibilityManager.applySettings(newSettings);
    };

    private onSettingsSave = async (settings: IVisibilitySettings): Promise<void> => {
        try {
            await this.persistenceService.saveVisibilitySettings(settings);
            this.setState({ settings });
        } catch (error) {
            console.error('[VT] Error saving settings:', error);
        }
    };

    private onFabPositionChange = (position: IFabPosition): void => {
        this.persistenceService.saveFabPosition(position);
        this.setState({ fabPosition: position });
    };

    public render(): React.ReactElement<IContainerProps> {
        return (
            <VisibilityTogglerApp
                settings={this.state.settings}
                fabPosition={this.state.fabPosition}
                onSettingsChange={this.onSettingsChange}
                onSettingsSave={this.onSettingsSave}
                onFabPositionChange={this.onFabPositionChange}
            />
        );
    }
}
