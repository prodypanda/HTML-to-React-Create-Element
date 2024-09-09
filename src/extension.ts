import * as vscode from 'vscode';
import { parse } from 'node-html-parser';

function convertToReactCreateElement(html: string): string {
    const root = parse(html);
    
    function convert(node: any): string {
        if (node.nodeType === 3) { // Text node
            return JSON.stringify(node.text);
        }
        
        const tagName = JSON.stringify(node.tagName.toLowerCase());
        const props: string[] = [];
        
        for (const attr of node.attributes) {
            let value = attr.value;
            if (attr.name === 'class') {
                props.push(`className: ${JSON.stringify(value)}`);
            } else if (attr.name === 'style') {
                const styles = value.split(';').reduce((acc: any, style: string) => {
                    const [key, value] = style.split(':').map(s => s.trim());
                    if (key && value) {
                        acc[key.replace(/-./g, x => x[1].toUpperCase())] = value;
                    }
                    return acc;
                }, {});
                props.push(`style: ${JSON.stringify(styles)}`);
            } else {
                props.push(`${attr.name}: ${JSON.stringify(value)}`);
            }
        }
        
        const children = node.childNodes.map((child: any) => convert(child)).filter((child: string) => child !== '""');
        
        if (props.length === 0 && children.length === 0) {
            return `React.createElement(${tagName})`;
        } else if (children.length === 0) {
            return `React.createElement(${tagName}, {${props.join(', ')}})`;
        } else {
            return `React.createElement(${tagName}, {${props.join(', ')}}, ${children.join(', ')})`;
        }
    }
    
    return convert(root);
}


let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel("React Converter");
    outputChannel.show();
    outputChannel.appendLine("Extension activated");

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(code) Convert to React";
    statusBarItem.tooltip = "Convert selected HTML to React.createElement";
    statusBarItem.command = 'extension.convertToReactCreateElement';
    statusBarItem.show();

    outputChannel.appendLine("Status bar item created");

    context.subscriptions.push(statusBarItem);

    let disposable = vscode.commands.registerCommand('extension.convertToReactCreateElement', () => {
        outputChannel.appendLine("Convert command triggered");
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);

            try {
                const convertedText = convertToReactCreateElement(text);
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, convertedText);
                });
                outputChannel.appendLine("Conversion successful");
            } catch (error) {
                outputChannel.appendLine(`Conversion failed: ${error}`);
                vscode.window.showErrorMessage('Failed to convert HTML to React.createElement');
            }
        } else {
            outputChannel.appendLine("No active text editor");
            vscode.window.showInformationMessage('Please select some HTML text to convert');
        }
    });

    context.subscriptions.push(disposable);

    // Manually activate the extension
    vscode.commands.executeCommand('extension.convertToReactCreateElement');
    outputChannel.appendLine("Manual activation attempted");
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}