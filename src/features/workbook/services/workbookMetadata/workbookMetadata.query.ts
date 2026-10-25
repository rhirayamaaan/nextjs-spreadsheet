import { createQuery } from "@/lib/query";
import {
  fetchWorkbookMetadata,
  type WorkbookMetadataResponse,
} from "./workbookMetadata.api";

const DEFAULT_METADATA: WorkbookMetadataResponse = {
  categories: [],
  templates: {},
  initialOpenSheetIds: [],
  favoriteSheetIds: [],
};

export const workbookMetadataQuery = createQuery(
  fetchWorkbookMetadata,
  DEFAULT_METADATA,
);
