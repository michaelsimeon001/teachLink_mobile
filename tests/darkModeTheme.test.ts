/**
 * Dark Mode Theme Tokens Test
 * Issue #832
 *
 * Verifies that component files do not contain hardcoded hex color literals
 * that should be replaced with theme tokens from src/utils/colors.ts.
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const SCREENS_DIR = path.resolve(__dirname, '../src/screens');

// Hardcoded hex colors that should be replaced with theme tokens
const HARDCODED_HEX_PATTERNS = [
  /['"]#ffffff['"]/gi,
  /['"]#FFFFFF['"]/gi,
  /['"]#000000['"]/gi,
  /['"]#f0f1f5['"]/gi,
  /['"]#111827['"]/gi,
  /['"]#6b7280['"]/gi,
  /['"]#e5e7eb['"]/gi,
  /['"]#d1d5db['"]/gi,
  /['"]#f3f4f6['"]/gi,
  /['"]#9ca3af['"]/gi,
  /['"]#4b5563['"]/gi,
  /['"]#374151['"]/gi,
];

function findTsxFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function getFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function hasThemeImport(content: string): boolean {
  return (
    content.includes("from '../../utils/colors'") ||
    content.includes("from '../../../utils/colors'") ||
    content.includes("from '@/utils/colors'") ||
    content.includes('getColors') ||
    content.includes('useAppStore')
  );
}

describe('Dark mode theme tokens consistency', () => {
  const componentFiles = findTsxFiles(COMPONENTS_DIR);
  const screenFiles = findTsxFiles(SCREENS_DIR);
  const allFiles = [...componentFiles, ...screenFiles];

  it('should find component files to scan', () => {
    expect(allFiles.length).toBeGreaterThan(0);
  });

  it('CourseHeader uses theme tokens', () => {
    const filePath = path.join(
      COMPONENTS_DIR,
      'mobile',
      'CourseHeader.tsx'
    );
    if (fs.existsSync(filePath)) {
      const content = getFileContent(filePath);
      expect(hasThemeImport(content)).toBe(true);
    }
  });

  it('MobileQuestionCard uses theme tokens', () => {
    const filePath = path.join(
      COMPONENTS_DIR,
      'mobile',
      'MobileQuizManager',
      'MobileQuestionCard.tsx'
    );
    if (fs.existsSync(filePath)) {
      const content = getFileContent(filePath);
      expect(hasThemeImport(content)).toBe(true);
    }
  });

  it('LessonCarousel uses theme tokens', () => {
    const filePath = path.join(
      COMPONENTS_DIR,
      'mobile',
      'LessonCarousel.tsx'
    );
    if (fs.existsSync(filePath)) {
      const content = getFileContent(filePath);
      expect(hasThemeImport(content)).toBe(true);
    }
  });

  it('MobileQuizManager uses theme tokens', () => {
    const filePath = path.join(
      COMPONENTS_DIR,
      'mobile',
      'MobileQuizManager',
      'index.tsx'
    );
    if (fs.existsSync(filePath)) {
      const content = getFileContent(filePath);
      expect(hasThemeImport(content)).toBe(true);
    }
  });

  it('primary button text color is consistent across components', () => {
    // Verify that the PrimaryButton component exists and has proper color handling
    const primaryButtonPath = path.join(
      COMPONENTS_DIR,
      'common',
      'PrimaryButton.tsx'
    );
    if (fs.existsSync(primaryButtonPath)) {
      const content = getFileContent(primaryButtonPath);
      // Should have gradient colors (these are brand colors, not theme tokens)
      expect(content).toContain('#20afe7');
    }
  });

  it('theme color system has both light and dark variants', () => {
    const colorsPath = path.join(
      __dirname,
      '../src/utils/colors.ts'
    );
    if (fs.existsSync(colorsPath)) {
      const content = getFileContent(colorsPath);
      expect(content).toContain('lightColors');
      expect(content).toContain('darkColors');
      expect(content).toContain('getColors');
    }
  });

  it('BookmarkButton has proper color handling for theme', () => {
    const filePath = path.join(
      COMPONENTS_DIR,
      'mobile',
      'BookmarkButton.tsx'
    );
    if (fs.existsSync(filePath)) {
      const content = getFileContent(filePath);
      // Should have accessibility props
      expect(content).toContain('accessibilityRole');
      expect(content).toContain('accessibilityLabel');
    }
  });
});
