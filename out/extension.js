"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('chromeTab.start', () => {
        ChromeTabBrowser.createOrShow(context.extensionPath);
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(ChromeTabBrowser.viewType, {
            deserializeWebviewPanel(webviewPanel, state) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Got state: ${state}`);
                    ChromeTabBrowser.revive(webviewPanel, context.extensionPath);
                });
            }
        });
    }
}
exports.activate = activate;
class ChromeTabBrowser {
    constructor(panel, extensionPath) {
        this._disposables = [];
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
    static createOrShow(extensionPath) {
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
    static revive(panel, extensionPath) {
        ChromeTabBrowser.currentPanel = new ChromeTabBrowser(panel, extensionPath);
    }
    dispose() {
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
ChromeTabBrowser.viewType = 'chromeTab';
//# sourceMappingURL=extension.js.map