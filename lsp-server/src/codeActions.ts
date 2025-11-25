/**
 * Code Actions Provider
 *
 * Provides code actions (quick fixes) for diagnostics.
 * Offers suggestions to fix issues found by agent analysis.
 */

import {
  CodeAction,
  CodeActionKind,
  TextEdit,
  Diagnostic,
} from 'vscode-languageserver';
import { logger } from './logger';

/**
 * TextDocument interface (compatible with vscode-languageserver)
 */
interface TextDocument {
  uri: string;
  getText(range?: any): string;
}

/**
 * Code action proposal
 */
export interface CodeActionProposal {
  title: string;
  kind: CodeActionKind;
  diagnostic?: Diagnostic;
  edits: TextEdit[];
  command?: string;
  isPreferred?: boolean;
}

/**
 * Code actions provider class
 */
export class CodeActionsProvider {
  private static instance: CodeActionsProvider;
  private actionsCache: Map<string, CodeActionProposal[]> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(): CodeActionsProvider {
    if (!CodeActionsProvider.instance) {
      CodeActionsProvider.instance = new CodeActionsProvider();
    }
    return CodeActionsProvider.instance;
  }

  /**
   * Get code actions for a range and diagnostics
   */
  public getCodeActions(
    document: TextDocument,
    diagnostics: Diagnostic[]
  ): CodeAction[] {
    try {
      const codeActions: CodeAction[] = [];

      logger.debug('Getting code actions', {
        uri: document.uri,
        diagnosticCount: diagnostics.length,
      });

      // Generate code actions for each diagnostic
      diagnostics.forEach((diagnostic) => {
        const actions = this.generateActionsForDiagnostic(document, diagnostic);
        codeActions.push(...actions);
      });

      logger.debug('Code actions generated', {
        uri: document.uri,
        count: codeActions.length,
      });

      return codeActions;
    } catch (error) {
      logger.error('Error getting code actions', error);
      return [];
    }
  }

  /**
   * Generate code actions for a specific diagnostic
   */
  private generateActionsForDiagnostic(
    document: TextDocument,
    diagnostic: Diagnostic
  ): CodeAction[] {
    try {
      const actions: CodeAction[] = [];

      // Extract agent and severity from code
      const code = diagnostic.code ? String(diagnostic.code) : 'unknown/unknown';
      const codeParts = code.split('/');
      const severity = codeParts[1] || 'unknown';

      // Generate actions based on diagnostic
      if (diagnostic.message.includes('unused')) {
        actions.push(this.createRemoveLineAction(document, diagnostic));
      }

      if (diagnostic.message.includes('missing') || diagnostic.message.includes('undefined')) {
        actions.push(this.createAddImportAction(document, diagnostic));
      }

      if (
        diagnostic.message.includes('variable') &&
        diagnostic.message.includes('declared')
      ) {
        actions.push(this.createRemoveVariableAction(document, diagnostic));
      }

      // Add generic quick fix action for all diagnostics
      if (severity !== 'hint') {
        actions.push(this.createQuickFixAction(document, diagnostic));
      }

      // Add source action for running all diagnostics
      actions.push(this.createSourceAction(document, codeParts[0] || 'analyzer'));

      return actions;
    } catch (error) {
      logger.error('Error generating actions for diagnostic', error);
      return [];
    }
  }

  /**
   * Create remove line action
   */
  private createRemoveLineAction(document: TextDocument, diagnostic: Diagnostic): CodeAction {
    const { range } = diagnostic;
    const uri = document.uri || '';

    return {
      title: 'Remove unused code',
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [uri]: [
            TextEdit.del(range),
          ],
        },
      },
      diagnostics: [diagnostic],
      isPreferred: true,
    };
  }

  /**
   * Create add import action
   */
  private createAddImportAction(document: TextDocument, diagnostic: Diagnostic): CodeAction {
    return {
      title: 'Add missing import',
      kind: CodeActionKind.QuickFix,
      command: {
        title: 'Add missing import',
        command: 'agent-analyzer.addImport',
        arguments: [document.uri, diagnostic.range],
      },
      diagnostics: [diagnostic],
    };
  }

  /**
   * Create remove variable action
   */
  private createRemoveVariableAction(document: TextDocument, diagnostic: Diagnostic): CodeAction {
    return {
      title: 'Remove unused variable',
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [document.uri]: [
            TextEdit.del(diagnostic.range),
          ],
        },
      },
      diagnostics: [diagnostic],
      isPreferred: true,
    };
  }

  /**
   * Create quick fix action
   */
  private createQuickFixAction(document: TextDocument, diagnostic: Diagnostic): CodeAction {
    return {
      title: 'View fix suggestion',
      kind: CodeActionKind.QuickFix,
      command: {
        title: 'View fix suggestion',
        command: 'agent-analyzer.viewSuggestion',
        arguments: [document.uri, diagnostic],
      },
      diagnostics: [diagnostic],
    };
  }

  /**
   * Create source action (refactor all)
   */
  private createSourceAction(document: TextDocument, agent: string): CodeAction {
    return {
      title: `Run ${agent || 'all agents'}`,
      kind: CodeActionKind.Source,
      command: {
        title: `Run ${agent || 'all agents'}`,
        command: 'agent-analyzer.runAnalysis',
        arguments: [document.uri, agent],
      },
    };
  }

  /**
   * Register code action and apply to document
   */
  public async registerCodeAction(
    uri: string,
    action: CodeActionProposal
  ): Promise<void> {
    try {
      const cached = this.actionsCache.get(uri) || [];
      cached.push(action);
      this.actionsCache.set(uri, cached);

      logger.debug('Code action registered', {
        uri,
        title: action.title,
      });
    } catch (error) {
      logger.error('Error registering code action', error);
    }
  }

  /**
   * Get cached code actions for a document
   */
  public getCachedActions(uri: string): CodeActionProposal[] {
    return this.actionsCache.get(uri) || [];
  }

  /**
   * Clear code actions for a document
   */
  public clearActions(uri: string): void {
    this.actionsCache.delete(uri);
    logger.debug('Code actions cleared', { uri });
  }

  /**
   * Clear all code actions
   */
  public clearAllActions(): void {
    this.actionsCache.clear();
    logger.debug('All code actions cleared');
  }
}

/**
 * Export singleton
 */
export const codeActionsProvider = CodeActionsProvider.getInstance();
