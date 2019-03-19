import * as path from 'path';
import * as vscode from 'vscode';

const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('chromeTab.start', () => {
        ChromeTabBrowser.createOrShow(context.extensionPath);
    }));

    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(ChromeTabBrowser.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                ChromeTabBrowser.revive(webviewPanel, context.extensionPath);
            }
        });
    }
}

class ChromeTabBrowser {
    public static currentPanel: ChromeTabBrowser | undefined;

    public static readonly viewType = 'chromeTab';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (ChromeTabBrowser.currentPanel) {
            ChromeTabBrowser.currentPanel._panel.reveal(column);
            return;
        }
        
        const panel = vscode.window.createWebviewPanel(ChromeTabBrowser.viewType, "Cat Coding", column || vscode.ViewColumn.One, {
            enableScripts: true,

            localResourceRoots: [
                vscode.Uri.file(path.join(extensionPath, 'media'))
            ]
        });

        ChromeTabBrowser.currentPanel = new ChromeTabBrowser(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        ChromeTabBrowser.currentPanel = new ChromeTabBrowser(panel, extensionPath);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionPath: string
    ) {
        this._panel = panel;
        this._extensionPath = extensionPath;
        
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._panel.webview.html = "http://www.google.com.pe";
            }
        }, null, this._disposables);
        
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }

    public dispose() {
        ChromeTabBrowser.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
