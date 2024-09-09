# VSCode HTML to React.createElement Converter

This VSCode extension allows you to easily convert HTML snippets to React.createElement syntax. It adds a convenient button to your status bar for quick access to the conversion functionality.

## Features

- Convert selected HTML to React.createElement syntax with a single click
- Status bar button for easy access
- Works with inline styles and class attributes

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install your-publisher-name.html-to-react-converter` to find the extension
4. Click the Install button

## Usage

1. Select the HTML code you want to convert in your editor
2. Click the "Convert to React" button in the status bar (located at the bottom right of the VSCode window)
3. The selected HTML will be replaced with the equivalent React.createElement code

Alternatively, you can use the Command Palette:

1. Select the HTML code you want to convert
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type "Convert to React.createElement" and select the command

## Example

Input HTML:
```html
<div class="container">
  <h1 style="color: blue; font-size: 24px;">Hello, World!</h1>
  <p>This is a paragraph.</p>
</div>
```

Output React.createElement:
```javascript
React.createElement("div", {className: "container"}, 
  React.createElement("h1", {style: {"color":"blue","fontSize":"24px"}}, "Hello, World!"),
  React.createElement("p", {}, "This is a paragraph.")
)
```

## Requirements

This extension requires Visual Studio Code version 1.60.0 or higher.

## Known Issues

Please report any issues or feature requests on the [GitHub repository](https://github.com/your-username/vscode-html-to-react-converter/issues).

## Release Notes

### 1.0.0

Initial release of HTML to React.createElement Converter

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE.md).