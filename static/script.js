// Dynamic Toggle Logic + Execution Pipeline Script
document.addEventListener('DOMContentLoaded', () => {
    // Pipeline Steps Data Structure (Preserving intact)
    const pipelineSteps = [
        {
            id: 'editor',
            name: 'Editor',
            sub: 'Grammar, typos, flow',
            defaultStateText: 'Waiting for input',
            process: (input) => `Editor Processed: Cleaned grammar and structural flow for "${input.slice(0, 30)}..."`
        },
        {
            id: 'scriptwriter',
            name: 'Scriptwriter',
            sub: 'Punchy video-script hook',
            defaultStateText: 'Waiting for stage 01',
            process: (input) => `Scriptwriter Output: Created high-hook video script structure from edited text.`
        },
        {
            id: 'translator',
            name: 'Translator',
            sub: 'Natural flowing Hinglish',
            defaultStateText: 'Waiting for stage 02',
            process: (input) => `Hinglish Output: "Hey guys! Aaj baat karenge is raw idea ke baare mein..."`
        }
    ];

    let isExecuting = false;

    // Toggle Dev Options Switches
    const toggleInspector = document.getElementById('toggle-state-inspector');
    const toggleLogs = document.getElementById('toggle-logs');
    const devColumn = document.getElementById('dev-panels-column');
    const inspectorCard = document.getElementById('state-inspector-card');
    const logsCard = document.getElementById('logs-card');
    const layoutGrid = document.getElementById('main-layout-grid');
    const appContainer = document.querySelector('.app-container');

    function updateDevVisibility() {
        const showInspector = toggleInspector.checked;
        const showLogs = toggleLogs.checked;

        if (showInspector || showLogs) {
            devColumn.classList.remove('hidden');
            layoutGrid.classList.add('dev-active');
            appContainer.classList.add('dev-active');
        } else {
            devColumn.classList.add('hidden');
            layoutGrid.classList.remove('dev-active');
            appContainer.classList.remove('dev-active');
        }

        if (showInspector) {
            inspectorCard.classList.remove('hidden');
        } else {
            inspectorCard.classList.add('hidden');
        }

        if (showLogs) {
            logsCard.classList.remove('hidden');
        } else {
            logsCard.classList.add('hidden');
        }
    }

    toggleInspector.addEventListener('change', updateDevVisibility);
    toggleLogs.addEventListener('change', updateDevVisibility);

    // Run Pipeline Action
    const promptInput = document.getElementById('user-input-prompt');
    const runBtn = document.getElementById('run-pipeline-btn');

    runBtn.addEventListener('click', async () => {
        if (isExecuting) return;
        const rawIdea = promptInput.value.trim() || "Mera ek AI agent project hai jise mujhe launch karna hai.";

        isExecuting = true;
        runBtn.disabled = true;
        runBtn.innerHTML = `<span class="btn-dot"></span> Processing...`;

        addLog('System', `Running pipeline with raw idea: "${rawIdea.slice(0, 35)}..."`, 'proc');

        // Reset steps UI
        document.querySelectorAll('.step-card').forEach(card => {
            card.classList.remove('active', 'completed');
        });

        // Step 1 Execution
        await executeStep(1, rawIdea, 'Editor', 'out-step-1');
        // Step 2 Execution
        await executeStep(2, rawIdea, 'Scriptwriter', 'out-step-2');
        // Step 3 Execution
        await executeStep(3, rawIdea, 'Translator', 'out-step-3');

        addLog('System', 'Pipeline execution completed successfully!', 'succ');
        isExecuting = false;
        runBtn.disabled = false;
        runBtn.innerHTML = `<span class="btn-dot"></span> Run pipeline`;
    });

    async function executeStep(stepNum, input, name, targetElemId) {
        const card = document.getElementById(`step-0${stepNum}`);
        const box = document.getElementById(targetElemId);

        card.classList.add('active');
        box.textContent = "Processing stage...";
        updateJSONState(name, stepNum, input, "PROCESSING");

        await new Promise(r => setTimeout(r, 1200));

        const resultText = pipelineSteps[stepNum - 1].process(input);
        box.textContent = resultText;
        card.classList.remove('active');
        card.classList.add('completed');

        updateJSONState(name, stepNum, resultText, "SUCCESS");
        addLog(name, `Stage 0${stepNum} finished.`, 'succ');
    }

    function updateJSONState(stage, step, data, status) {
        const jsonViewer = document.getElementById('state-json-viewer');
        const stateObj = {
            current_stage: stage,
            step_number: step,
            status: status,
            payload: data,
            timestamp: new Date().toISOString()
        };
        jsonViewer.textContent = JSON.stringify(stateObj, null, 2);
    }

    function addLog(sender, text, type = 'sys') {
        const consoleEl = document.getElementById('logs-container');
        const time = new Date().toTimeString().split(' ')[0];
        const line = document.createElement('div');
        line.className = `log-entry ${type}`;
        line.innerHTML = `<span class="ts">[${time}]</span> <strong>${sender}:</strong> ${text}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    document.getElementById('clear-logs-btn').addEventListener('click', () => {
        document.getElementById('logs-container').innerHTML = '';
        addLog('System', 'Logs cleared.', 'sys');
    });

    // Ambient Canvas Animation
    initCanvas();
    function initCanvas() {
        const canvas = document.getElementById('bg-network-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        const particles = Array.from({ length: 25 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        }));

        function draw() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 107, 53, 0.4)';
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
});
