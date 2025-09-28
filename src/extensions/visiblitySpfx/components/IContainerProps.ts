import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { PersistenceService } from "../../../services/PersistenceService";
import { VisibilityManager } from "../../../services/VisibilityManager";
import { IVisibilitySettings } from "../../../models/IVisibilitySettings";

export interface IContainerProps {
    context: ApplicationCustomizerContext;
    persistenceService: PersistenceService;
    visibilityManager: VisibilityManager;
    onSettingsChange?: (settings: IVisibilitySettings) => void;
}
