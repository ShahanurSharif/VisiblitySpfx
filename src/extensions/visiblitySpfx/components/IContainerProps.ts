import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { PersistenceService } from "../../../services/PersistenceService";
import { VisibilityManager } from "../../../services/VisibilityManager";

export interface IContainerProps {
    context: ApplicationCustomizerContext;
    persistenceService: PersistenceService;
    visibilityManager: VisibilityManager;
}
