import * as React from 'react';
import { Fab } from './Fab';
import { VisibilityDialog } from './VisibilityDialog';
import { IVisibilitySettings, IFabPosition } from '../models/IVisibilitySettings';

export interface IVisibilityTogglerAppProps {
  settings: IVisibilitySettings;
  fabPosition?: IFabPosition;
  onSettingsChange: (settings: IVisibilitySettings) => void;
  onSettingsSave: (settings: IVisibilitySettings) => void;
  onFabPositionChange: (position: IFabPosition) => void;
}

export interface IVisibilityTogglerAppState {
  isDialogOpen: boolean;
}

export class VisibilityTogglerApp extends React.Component<IVisibilityTogglerAppProps, IVisibilityTogglerAppState> {
  constructor(props: IVisibilityTogglerAppProps) {
    super(props);

    this.state = {
      isDialogOpen: false
    };
  }

  private handleToggleDialog = (): void => {
    this.setState(prevState => ({
      isDialogOpen: !prevState.isDialogOpen
    }));
  };

  private handleDialogDismiss = (): void => {
    this.setState({ isDialogOpen: false });
  };

  private handleSettingsSave = (settings: IVisibilitySettings): void => {
    this.props.onSettingsSave(settings);
    this.setState({ isDialogOpen: false });
  };

  public render(): React.ReactElement<IVisibilityTogglerAppProps> {
    const { settings, fabPosition, onSettingsChange, onFabPositionChange } = this.props;
    const { isDialogOpen } = this.state;

    return (
      <div id="vt-root">
        <Fab
          onToggleDialog={this.handleToggleDialog}
          initialPosition={fabPosition}
          onPositionChange={onFabPositionChange}
        />
        
        <VisibilityDialog
          isOpen={isDialogOpen}
          onDismiss={this.handleDialogDismiss}
          settings={settings}
          onSettingsChange={onSettingsChange}
          onSave={this.handleSettingsSave}
        />
      </div>
    );
  }
}
