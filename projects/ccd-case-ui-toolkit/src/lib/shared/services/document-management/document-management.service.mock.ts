import { AppMockConfig } from '../../../app-config.mock';

const appConfigMock = new AppMockConfig();

export const mockDocumentManagementService = {
   getMediaViewerInfo(documentFieldValue: any): string {
    const mediaViewerInfo = {
      document_binary_url: documentFieldValue.document_binary_url,
      document_filename: documentFieldValue.document_filename,
      content_type: documentFieldValue.content_type,
      annotation_api_url: appConfigMock.getAnnotationApiUrl(),
      case_id: documentFieldValue.id,
      case_jurisdiction: documentFieldValue.jurisdiction
    };

    return JSON.stringify(mediaViewerInfo);
  }
};
