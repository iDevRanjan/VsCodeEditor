require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.51.0/min/vs' }});

require(['vs/editor/editor.main'], function () {
    var currentTheme = 'vs-dark';
    var htmlEditor, cssEditor, jsEditor;

    function createEditors() {
        var htmlBoilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your page title</title>
</head>
<body>
    <!-- Your content goes here -->

</body>
</html>`;

        var cssBoilerplate = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
}`;

        htmlEditor = monaco.editor.create(document.getElementById('htmlEditor'), {
            value: htmlBoilerplate,
            language: 'html',
            theme: currentTheme,
            minimap: { enabled: false },
            wordWrap: 'on'
        });
        cssEditor = monaco.editor.create(document.getElementById('cssEditor'), {
            value: cssBoilerplate,
            language: 'css',
            theme: currentTheme,
            minimap: { enabled: false },
            wordWrap: 'on'
        });
        jsEditor = monaco.editor.create(document.getElementById('jsEditor'), {
            value: '',
            language: 'javascript',
            theme: currentTheme,
            minimap: { enabled: false },
            wordWrap: 'on'
        });

        if (typeof emmetMonaco !== 'undefined') {
            emmetMonaco.emmetHTML(monaco);
            emmetMonaco.emmetCSS(monaco);
            emmetMonaco.emmetJSX(monaco);
        }

        htmlEditor.onDidChangeModelContent(updateOutput);
        cssEditor.onDidChangeModelContent(updateOutput);
        jsEditor.onDidChangeModelContent(updateOutput);
    }

    createEditors();

    function updateEditorLayouts() {
        htmlEditor.layout();
        cssEditor.layout();
        jsEditor.layout();
    }

    window.addEventListener('resize', updateEditorLayouts);

    function updateOutput() {
        var htmlContent = htmlEditor.getValue();
        var cssContent = cssEditor.getValue();
        var jsContent = jsEditor.getValue();
        var combinedContent = `
            <html>
                <head>
                    <style>${cssContent}</style>
                </head>
                <body>
                    ${htmlContent}
                    <script>${jsContent}<\/script>
                </body>
            </html>
        `;
        var iframe = document.getElementById('output');
        iframe.srcdoc = combinedContent;
        updateIframeDimensions();
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'vs-dark' ? 'vs' : 'vs-dark';
        monaco.editor.setTheme(currentTheme);
        var themeToggleBtn = document.getElementById('themeToggle');
        themeToggleBtn.innerHTML = currentTheme === 'vs-dark' ? '<i class="ri-moon-fill"></i>' : '<i class="ri-sun-fill"></i>';
    }

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    document.getElementById('fileUpload').addEventListener('change', function (event) {
        var files = event.target.files;
        Array.from(files).forEach(file => {
            var reader = new FileReader();
            reader.onload = function (e) {
                var content = e.target.result;
                var extension = file.name.split('.').pop().toLowerCase();
                if (extension === 'html') {
                    htmlEditor.setValue(content);
                } else if (extension === 'css') {
                    cssEditor.setValue(content);
                } else if (extension === 'js') {
                    jsEditor.setValue(content);
                }
            };
            reader.readAsText(file);
        });
    });

    document.getElementById('htmlButton').addEventListener('click', function () {
        showEditor('htmlEditor', this);
    });
    document.getElementById('cssButton').addEventListener('click', function () {
        showEditor('cssEditor', this);
    });
    document.getElementById('jsButton').addEventListener('click', function () {
        showEditor('jsEditor', this);
    });

    function showEditor(editorId, button) {
        document.querySelectorAll('.topLeft button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.getElementById('htmlEditor').style.display = 'none';
        document.getElementById('cssEditor').style.display = 'none';
        document.getElementById('jsEditor').style.display = 'none';
        document.getElementById(editorId).style.display = 'block';
        updateEditorLayouts();
    }

    document.getElementById('fullscreenButton').addEventListener('click', function () {
        var iframe = document.getElementById('output');
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
            iframe.mozRequestFullScreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    });

    const input = document.getElementById('editorSection');
    const dragbar = document.getElementById('separator');
    const output = document.getElementById('outputSection');
    const resizer = document.getElementById('ownResizer');

    let isDragging = false;

    window.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const percentage = (e.pageX / window.innerWidth) * 100;
            if (percentage > 0 && percentage < 100) {
                input.style.width = `${percentage}%`;
                output.style.width = `${100 - percentage}%`;
                updateEditorLayouts();
            }
        }
    });

    dragbar.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        resizer.style.display = 'block';
    });

    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            resizer.style.display = 'none';
        }
    });

    function updateIframeDimensions() {
        const iframe = document.getElementById('outputSection');
        const iframeDimensions = document.getElementById('iframeDimensions');
        iframeDimensions.textContent = `Dimensions : ${iframe.offsetWidth}px x ${iframe.offsetHeight}px`;
    }

    const resizeObserver = new ResizeObserver(updateIframeDimensions);
    resizeObserver.observe(document.getElementById('outputSection'));

    document.getElementById('reloadButton').addEventListener('click', () => {
        const iframe = document.getElementById('output');
        iframe.srcdoc = iframe.srcdoc;
    });
});