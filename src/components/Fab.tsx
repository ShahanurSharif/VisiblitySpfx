import * as React from 'react';
import { IFabPosition } from '../models/IVisibilitySettings';
import { PrimaryButton } from 'office-ui-fabric-react';

export interface IFabProps {
  onToggleDialog: () => void;
  initialPosition?: IFabPosition;
  onPositionChange: (position: IFabPosition) => void;
}

export interface IFabState {
  position: IFabPosition;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  startPosition: { left: number; top: number };
}

export class Fab extends React.Component<IFabProps, IFabState> {
  private fabRef: React.RefObject<HTMLDivElement>;

  constructor(props: IFabProps) {
    super(props);

    this.fabRef = React.createRef();
    
    this.state = {
      position: props.initialPosition || { left: window.innerWidth - 80, top: 100 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      startPosition: { left: 0, top: 0 }
    };
  }

  public componentDidMount(): void {
    // Clamp initial position to viewport
    this.setState(prevState => ({
      position: this.clampToViewport(prevState.position)
    }));
  }

  public componentDidUpdate(prevProps: IFabProps): void {
    if (prevProps.initialPosition !== this.props.initialPosition && this.props.initialPosition) {
      this.setState({
        position: this.clampToViewport(this.props.initialPosition)
      });
    }
  }

  private handlePointerDown = (e: React.PointerEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0) return; // Only left mouse button

    const rect = this.fabRef.current!.getBoundingClientRect();
    this.setState({
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
      startPosition: { left: rect.left, top: rect.top }
    });

    // Set pointer capture
    this.fabRef.current!.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.state.isDragging) return;

    const deltaX = e.clientX - this.state.dragStart.x;
    const deltaY = e.clientY - this.state.dragStart.y;

    const newPosition = {
      left: this.state.startPosition.left + deltaX,
      top: this.state.startPosition.top + deltaY
    };

    this.setState({
      position: this.clampToViewport(newPosition)
    });
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this.state.isDragging) return;

    this.setState({ isDragging: false });
    this.fabRef.current!.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = '';

    // Save position
    this.props.onPositionChange(this.state.position);
  };

  private clampToViewport = (position: IFabPosition): IFabPosition => {
    const fabSize = 56; // FAB size
    const margin = 10;

    return {
      ...position,
      left: Math.max(margin, Math.min(window.innerWidth - fabSize - margin, position.left)),
      top: Math.max(margin, Math.min(window.innerHeight - fabSize - margin, position.top))
    };
  };

  public render(): React.ReactElement<IFabProps> {
    const { onToggleDialog } = this.props;
    const { position, isDragging } = this.state;

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
        
        return () => {
          document.removeEventListener('pointermove', this.handlePointerMove);
          document.removeEventListener('pointerup', this.handlePointerUp);
        };
      }
    }, [isDragging]);

    return (
      <div
        ref={this.fabRef}
        className="vt-fab"
        style={{
          position: 'fixed',
          left: position.left,
          top: position.top,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
        onPointerDown={this.handlePointerDown}
        role="button"
        tabIndex={0}
        aria-label="Toggle visibility settings"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleDialog();
          }
        }}
      >
        <PrimaryButton
          iconProps={{ iconName: 'Settings' }}
          styles={{
            root: {
              width: 56,
              height: 56,
              borderRadius: '50%',
              minWidth: 'auto',
              padding: 0,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              border: 'none',
              backgroundColor: '#0078d4'
            },
            rootHovered: {
              backgroundColor: '#106ebe',
              boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
            },
            rootPressed: {
              backgroundColor: '#005a9e'
            }
          }}
        />
      </div>
    );
  }
}
