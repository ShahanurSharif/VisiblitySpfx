import * as React from 'react';
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Toggle,
  Stack,
  Text,
  FocusTrapZone
} from '@fluentui/react';
import { IVisibilitySettings, TARGET_SELECTORS } from '../models/IVisibilitySettings';

export interface IVisibilityDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  settings: IVisibilitySettings;
  onSettingsChange: (settings: IVisibilitySettings) => void;
  onSave: (settings: IVisibilitySettings) => void;
}

export interface IVisibilityDialogState {
  currentSettings: IVisibilitySettings;
  hasChanges: boolean;
}

export class VisibilityDialog extends React.Component<IVisibilityDialogProps, IVisibilityDialogState> {

  constructor(props: IVisibilityDialogProps) {
    super(props);

    this.state = {
      currentSettings: { ...props.settings },
      hasChanges: false
    };
  }

  public componentDidUpdate(prevProps: IVisibilityDialogProps): void {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      // Reset state when dialog opens
      this.setState({
        currentSettings: { ...this.props.settings },
        hasChanges: false
      });
    }
  }

  private handleToggleChange = (targetId: string, checked: boolean): void => {
    const newSettings = {
      ...this.state.currentSettings,
      toggles: {
        ...this.state.currentSettings.toggles,
        [targetId]: checked
      }
    };

    this.setState({
      currentSettings: newSettings,
      hasChanges: true
    });

    // Apply changes immediately
    this.props.onSettingsChange(newSettings);
  };

  private handleSave = (): void => {
    this.props.onSave(this.state.currentSettings);
    this.setState({ hasChanges: false });
  };

  private handleCancel = (): void => {
    if (this.state.hasChanges) {
      // Revert changes
      this.props.onSettingsChange(this.props.settings);
    }
    this.props.onDismiss();
  };


  public render(): React.ReactElement<IVisibilityDialogProps> {
    const { isOpen } = this.props;
    const { currentSettings, hasChanges } = this.state;

    const dialogContentProps = {
      type: DialogType.normal,
      title: 'Visibility Settings',
      subText: 'Toggle the visibility of SharePoint interface elements.'
    };

    const modalProps = {
      isBlocking: true,
      styles: {
        main: {
          maxWidth: '500px'
        }
      }
    };

    return (
      <Dialog
        hidden={!isOpen}
        onDismiss={this.handleCancel}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <FocusTrapZone>
          <Stack tokens={{ childrenGap: 16 }}>
            <Text variant="medium" styles={{ root: { marginBottom: 8 } }}>
              Choose which elements to show or hide:
            </Text>

            <Stack tokens={{ childrenGap: 12 }}>
              {TARGET_SELECTORS.map(target => (
                <Toggle
                  key={target.id}
                  label={target.label}
                  checked={currentSettings.toggles[target.id] !== false}
                  onChange={(ev, checked) => this.handleToggleChange(target.id, checked || false)}
                  onText="Visible"
                  offText="Hidden"
                  styles={{
                    root: {
                      marginBottom: 8
                    }
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <DialogFooter>
            <PrimaryButton
              onClick={this.handleSave}
              text="Save Settings"
              disabled={!hasChanges}
              styles={{
                root: {
                  marginRight: 8
                }
              }}
            />
            <DefaultButton
              onClick={this.handleCancel}
              text="Cancel"
            />
          </DialogFooter>
        </FocusTrapZone>
      </Dialog>
    );
  }
}
