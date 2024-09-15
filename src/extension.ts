import * as vscode from 'vscode';
import { parse, HTMLElement, TextNode } from 'node-html-parser';

const SVG_TAGS = new Set([
    // Basic shapes
    'svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect',
    // Text
    'text', 'tspan', 'textPath',
    // Container elements
    'g', 'defs', 'symbol', 'clipPath', 'mask', 'pattern', 'marker',
    // Gradient elements
    'linearGradient', 'radialGradient', 'stop',
    // Animation elements
    'animate', 'animateMotion', 'animateTransform', 'set',
    // Filter elements
    'filter', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
    'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feFlood',
    'feGaussianBlur', 'feImage', 'feMerge', 'feMorphology', 'feOffset',
    'feSpecularLighting', 'feTile', 'feTurbulence',
    // Other graphical elements
    'image', 'use', 'switch', 'foreignObject',
    // Descriptive elements
    'desc', 'metadata', 'title',
    // Font elements
    'font', 'font-face', 'font-face-src', 'font-face-uri', 'hkern', 'vkern',
    // Linking elements
    'a',
    // Scripting elements
    'script'
]);
// Mapping of SVG attributes to their React equivalents
const SVG_ATTR_MAP: { [key: string]: string } = {
    'viewBox': 'viewBox',  // viewBox is kept as-is
    'xmlns:xlink': 'xmlnsXlink',  // xmlns:xlink is converted to xmlnsXlink
    'project-id': "project-id",  // project-id is converted to projectId
    'export-id': 'exportId',
    'xmlns': 'xmlns',
    'accent-height': 'accentHeight',
    'alignment-baseline': 'alignmentBaseline',
    'arabic-form': 'arabicForm',
    'baseline-shift': 'baselineShift',
    'cap-height': 'capHeight',
    'clip-path': 'clipPath',
    'clip-rule': 'clipRule',
    'color-interpolation': 'colorInterpolation',
    'color-interpolation-filters': 'colorInterpolationFilters',
    'color-profile': 'colorProfile',
    'color-rendering': 'colorRendering',
    'dominant-baseline': 'dominantBaseline',
    'enable-background': 'enableBackground',
    'fill-opacity': 'fillOpacity',
    'fill-rule': 'fillRule',
    'flood-color': 'floodColor',
    'flood-opacity': 'floodOpacity',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-size-adjust': 'fontSizeAdjust',
    'font-stretch': 'fontStretch',
    'font-style': 'fontStyle',
    'font-variant': 'fontVariant',
    'font-weight': 'fontWeight',
    'glyph-name': 'glyphName',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    'horiz-adv-x': 'horizAdvX',
    'horiz-origin-x': 'horizOriginX',
    'image-rendering': 'imageRendering',
    'letter-spacing': 'letterSpacing',
    'lighting-color': 'lightingColor',
    'marker-end': 'markerEnd',
    'marker-mid': 'markerMid',
    'marker-start': 'markerStart',
    'overline-position': 'overlinePosition',
    'overline-thickness': 'overlineThickness',
    'paint-order': 'paintOrder',
    'panose-1': 'panose1',
    'pointer-events': 'pointerEvents',
    'rendering-intent': 'renderingIntent',
    'shape-rendering': 'shapeRendering',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'strikethrough-position': 'strikethroughPosition',
    'strikethrough-thickness': 'strikethroughThickness',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity',
    'stroke-width': 'strokeWidth',
    'text-anchor': 'textAnchor',
    'text-decoration': 'textDecoration',
    'text-rendering': 'textRendering',
    'underline-position': 'underlinePosition',
    'underline-thickness': 'underlineThickness',
    'unicode-bidi': 'unicodeBidi',
    'unicode-range': 'unicodeRange',
    'units-per-em': 'unitsPerEm',
    'v-alphabetic': 'vAlphabetic',
    'v-hanging': 'vHanging',
    'v-ideographic': 'vIdeographic',
    'v-mathematical': 'vMathematical',
    'vector-effect': 'vectorEffect',
    'vert-adv-y': 'vertAdvY',
    'vert-origin-x': 'vertOriginX',
    'vert-origin-y': 'vertOriginY',
    'word-spacing': 'wordSpacing',
    'writing-mode': 'writingMode',
    'x-height': 'xHeight',
    'xlink:actuate': 'xlinkActuate',
    'xlink:arcrole': 'xlinkArcrole',
    'xlink:href': 'xlinkHref',
    'xlink:role': 'xlinkRole',
    'xlink:show': 'xlinkShow',
    'xlink:title': 'xlinkTitle',
    'xlink:type': 'xlinkType',
    'xml:base': 'xmlBase',
    'xml:lang': 'xmlLang',
    'xml:space': 'xmlSpace',
};

function convertToReactCreateElement(input: string): string {
    const root = parse(input);
    
    function convert(node: HTMLElement | TextNode, indentLevel: number = 0): string {
        const indent = '  '.repeat(indentLevel);
        const childIndent = '  '.repeat(indentLevel + 1);
        
        if (node.nodeType === 3) { // Text node
            const trimmedText = node.text.trim();
            return trimmedText ? `${indent}${JSON.stringify(trimmedText)}` : '';
        }
        
        if (!(node instanceof HTMLElement)) {
            return ''; // Skip if not an HTMLElement
        }

        const tagName = node.tagName ? JSON.stringify(node.tagName.toLowerCase()) : '"div"';
        const props: string[] = [];
        const isSvgElement = node.tagName && SVG_TAGS.has(node.tagName.toLowerCase());
        
        for (const [name, value] of Object.entries(node.attributes)) {
            if (name === 'class' && !isSvgElement) {
                props.push(`${childIndent}className: ${JSON.stringify(value)}`);
            } else if (name === 'style') {
                const styles = value.split(';').reduce((acc: Record<string, string>, style: string) => {
                    const [key, val] = style.split(':').map(s => s.trim());
                    if (key && val) {
                        acc[key.replace(/-./g, x => x.charAt(1).toUpperCase())] = val;
                    }
                    return acc;
                }, {});
                props.push(`${childIndent}style: ${JSON.stringify(styles)}`);
            } else {
                // Handle custom attributes with hyphens
                let propName = name;
                if (isSvgElement || name.includes(':') || name.includes('-')) {
                    propName = SVG_ATTR_MAP[name] || name.replace(/[-:](.)/g, (_, char) => char.toUpperCase());
                }
                
                // Convert boolean strings to actual booleans
                let propValue: string | boolean = value;
                if (value === 'true' || value === 'false') {
                    propValue = value === 'true';
                }
                
                props.push(`${childIndent}${propName}: ${JSON.stringify(propValue)}`);
            }
        }
        
        const children = node.childNodes
            .map((child: any) => convert(child, indentLevel + 1))
            .filter(child => child !== '');
        
        if (props.length === 0 && children.length === 0) {
            return `${indent}React.createElement(${tagName})`;
        } else if (children.length === 0) {
            return `${indent}React.createElement(${tagName}, {\n${props.join(',\n')}\n${indent}})`;
        } else {
            return `${indent}React.createElement(${tagName}, {\n${props.join(',\n')}\n${indent}},\n${children.join(',\n')}\n${indent})`;
        }
    }    
    try {
        return convert(root).trim();
    } catch (error: unknown) {
        console.error('Error during conversion:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to convert HTML/SVG: ${error.message}`);
        } else {
            throw new Error('Failed to convert HTML/SVG: Unknown error occurred');
        }
    }
}
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("React Converter");
    outputChannel.show();
    outputChannel.appendLine("Extension activated");

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(code) Convert to React";
    statusBarItem.tooltip = "Convert selected HTML/SVG to React.createElement";
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
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                outputChannel.appendLine(`Conversion failed: ${errorMessage}`);
                vscode.window.showErrorMessage(`Failed to convert HTML/SVG to React.createElement: ${errorMessage}`);
            }
        } else {
            outputChannel.appendLine("No active text editor");
            vscode.window.showInformationMessage('Please select some HTML or SVG text to convert');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}