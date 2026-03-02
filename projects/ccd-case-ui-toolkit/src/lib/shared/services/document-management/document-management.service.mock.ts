import { AppMockConfig } from '../../../app-config.mock';

const appConfigMock = new AppMockConfig();

export const mockDocumentManagementService = {
  getDocumentBinaryUrl(documentFieldValue: any): string {
    return documentFieldValue.document_binary_url;
  },
  isHtmlDocument(documentFieldValue: any): boolean {
    if (documentFieldValue?.content_type) {
      return documentFieldValue.content_type.split(';')[0].trim().toLowerCase() === 'text/html';
    }
    const fileName = documentFieldValue?.document_filename || '';
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex < 0 || dotIndex === fileName.length - 1) {
      return false;
    }
    return fileName.slice(dotIndex + 1).trim().toLowerCase() === 'html';
  },
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
