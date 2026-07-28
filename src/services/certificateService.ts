import { apiService } from './api';
import { logger } from '../utils/logger';

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  /** URL of the generated certificate (PDF or image). */
  url: string;
  issuedAt: string;
}

/**
 * #833: request a certificate of completion from the backend once a course is
 * completed. Best-effort — failures are logged and swallowed so certificate
 * generation never blocks the course-completion flow.
 */
export const certificateService = {
  async generateCertificate(
    courseId: string,
    courseTitle?: string
  ): Promise<Certificate | null> {
    try {
      const response: unknown = await apiService.post('/api/certificates/generate', {
        courseId,
        courseTitle,
      });
      // apiService.post returns the raw axios response; unwrap .data when present.
      const certificate = (
        response && typeof response === 'object' && 'data' in response
          ? (response as { data: unknown }).data
          : response
      ) as Certificate;
      logger.info('Certificate generated', { courseId });
      return certificate;
    } catch (error) {
      logger.warn('Certificate generation failed', { courseId, error: String(error) });
      return null;
    }
  },
};

export default certificateService;
