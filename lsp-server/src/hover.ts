/**
 * Hover Provider
 *
 * Provides hover information when user hovers over code.
 * Returns agent analysis results and code insights.
 */

import { Hover, MarkupKind } from 'vscode-languageserver';
import { logger } from './logger';

/**
 * TextDocument interface (compatible with vscode-languageserver)
 */
interface TextDocument {
  uri: string;
  getText(range?: any): string;
}

/**
 * Position interface (compatible with vscode-languageserver)
 */
interface Position {
  line: number;
  character: number;
}

/**
 * Hover information structure
 */
export interface HoverInfo {
  word: string;
  agents: string[];
  insights: string[];
  recommendations: string[];
}

/**
 * Hover provider class
 */
export class HoverProvider {
  private static instance: HoverProvider;
  private hoverCache: Map<string, HoverInfo> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(): HoverProvider {
    if (!HoverProvider.instance) {
      HoverProvider.instance = new HoverProvider();
    }
    return HoverProvider.instance;
  }

  /**
   * Get word at position
   */
  public getWordAtPosition(document: TextDocument, position: Position): string {
    try {
      const text = document.getText();
      const offset = document.offsetAt(position);

      // Find word boundaries
      let start = offset;
      let end = offset;

      // Move start backwards to find word start
      while (start > 0 && this.isWordCharacter(text[start - 1])) {
        start--;
      }

      // Move end forwards to find word end
      while (end < text.length && this.isWordCharacter(text[end])) {
        end++;
      }

      return text.substring(start, end);
    } catch (error) {
      logger.error('Error getting word at position', error);
      return '';
    }
  }

  /**
   * Get line at position
   */
  public getLineAtPosition(document: TextDocument, position: Position): string {
    try {
      const text = document.getText();
      const offset = document.offsetAt(position);
      const lineStart = text.lastIndexOf('\n', offset) + 1;
      const lineEnd = text.indexOf('\n', offset);
      return text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
    } catch (error) {
      logger.error('Error getting line at position', error);
      return '';
    }
  }

  /**
   * Provide hover information
   */
  public async provideHover(
    document: TextDocument,
    position: Position,
    analysisData?: any
  ): Promise<Hover | null> {
    try {
      const word = this.getWordAtPosition(document, position);
      const line = this.getLineAtPosition(document, position);

      logger.debug('Providing hover information', {
        word,
        line: line.substring(0, 50),
      });

      // Build hover content
      const content = this.buildHoverContent(word, line, analysisData);

      if (!content) {
        return null;
      }

      const hover: Hover = {
        contents: {
          kind: MarkupKind.Markdown,
          value: content,
        },
      };

      return hover;
    } catch (error) {
      logger.error('Error providing hover', error);
      return null;
    }
  }

  /**
   * Build hover content from analysis data
   */
  private buildHoverContent(word: string, line: string, analysisData?: any): string {
    if (!analysisData) {
      return this.getDefaultHoverContent(word, line);
    }

    try {
      const sections: string[] = [];

      // Add word info
      if (word) {
        sections.push(`### \`${word}\``);
      }

      // Add agent insights if available
      if (analysisData.agents && analysisData.agents.length > 0) {
        sections.push('**Agent Analysis:**');
        analysisData.agents.forEach((agentResult: any) => {
          if (agentResult.insights) {
            sections.push(`- **${agentResult.agent}**: ${agentResult.insights}`);
          }
        });
      }

      // Add recommendations if available
      if (analysisData.recommendations && analysisData.recommendations.length > 0) {
        sections.push('**Recommendations:**');
        analysisData.recommendations.forEach((rec: string) => {
          sections.push(`- ${rec}`);
        });
      }

      // Add issues if available
      if (analysisData.issues && analysisData.issues.length > 0) {
        sections.push('**Issues Found:**');
        analysisData.issues.forEach((issue: any) => {
          sections.push(`- **${issue.severity}**: ${issue.message}`);
        });
      }

      return sections.join('\n\n');
    } catch (error) {
      logger.error('Error building hover content', error);
      return this.getDefaultHoverContent(word, line);
    }
  }

  /**
   * Get default hover content when no analysis data is available
   */
  private getDefaultHoverContent(word: string, _line?: string): string {
    const content: string[] = [];

    if (word) {
      content.push(`### \`${word}\``);
      content.push(`**Symbol**: ${word}`);
    }

    content.push('**Status**: Agent analysis in progress...');
    content.push('');
    content.push('*Hover information will appear once analysis is complete.*');

    return content.join('\n');
  }

  /**
   * Check if character is valid word character
   */
  private isWordCharacter(char: string): boolean {
    return /[a-zA-Z0-9_$]/.test(char);
  }

  /**
   * Cache hover information
   */
  public cacheHoverInfo(uri: string, hoverInfo: HoverInfo): void {
    this.hoverCache.set(uri, hoverInfo);
    logger.debug('Cached hover information', { uri, word: hoverInfo.word });
  }

  /**
   * Get cached hover information
   */
  public getCachedHoverInfo(uri: string): HoverInfo | undefined {
    return this.hoverCache.get(uri);
  }

  /**
   * Clear hover cache
   */
  public clearCache(): void {
    this.hoverCache.clear();
    logger.debug('Hover cache cleared');
  }

  /**
   * Clear hover cache for specific document
   */
  public clearCacheForDocument(uri: string): void {
    this.hoverCache.delete(uri);
    logger.debug('Hover cache cleared for document', { uri });
  }
}

/**
 * Export singleton
 */
export const hoverProvider = HoverProvider.getInstance();
