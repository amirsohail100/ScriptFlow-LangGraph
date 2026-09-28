// Updated Clean JS Logic (Without static idle tags)
document.addEventListener('DOMContentLoaded', () => {
    const pipelineNodes = [
        {
            id: 'input_parser',
            name: '1. User Input & Intent Parser',
            icon: 'fa-user-gear',
            description: 'Receives prompt, parses user intent, and extracts structured metadata.',
            state: {
                user_prompt: "Initialize agent pipeline...",
                intent: "general_query",
                tokens_estimated: 120
            }
        },
        {
            id: 'retriever_agent',
            name: '2. Vector Context Retriever',
            icon: 'fa-database',
            description: 'Queries vector database (Chroma/FAISS) to fetch relevant grounding context.',
            state: {
                chunks_fetched: 3,
                relevance_score: 0.91,
                sources: ["vector_store_idx_1", "knowledge_base.pdf"]
            }
        },
        {
            id: 'reasoning_engine',
            name: '3. LangGraph Reasoning Engine',
            icon: 'fa-brain',
            description: 'Executes agent graph sequence, evaluates conditional edges, and plans answer.',
            state: {
                active_tool: "search_tool",
                plan_step: "Synthesizing retrieved context",
                confidence: 0.95
            }
        },
        {
            id: 'output_formatter',
            name: '4. Response Formatter & Guardrails',
            icon: 'fa-check-double',
            description: 'Applies safety guardrails, validates formatting, and outputs response.',
            state: {
                status: "READY",
                guardrail_check: "PASSED",
                response_time: "720ms"
            }
        }
    ];

    let selectedNodeIdx = 0;
    let isRunning = false;

    initCanvas();
    renderNodes();

    const promptInput = document.getElementById('user-prompt-input');
    const runBtn = document.getElementById('execute-agent-btn');
    const statusText = document.getElementById('pipeline-status-text');

    runBtn.addEventListener('click', async () => {
        if (isRunning) return;
        const promptText = promptInput.value.trim() || "Analyze agentic workflow execution and optimize response time.";

        isRunning = true;
        runBtn.disabled = true;
        runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Executing Agent...`;
        statusText.textContent = "Processing";

        pipelineNodes[0].state.user_prompt = promptText;
        pipelineNodes[0].state.tokens_estimated = Math.floor(promptText.length / 4) + 15;

        addLog('System', `Received user prompt: "${promptText.slice(0, 45)}..."`, 'proc');

        for (let i = 0; i < pipelineNodes.length; i++) {
            selectedNodeIdx = i;
            renderNodes(i); // highlight currently executing node
            addLog(pipelineNodes[i].name, `Executing step: ${pipelineNodes[i].id}`, 'proc');

            await new Promise(r => setTimeout(r, 1100));
            addLog(pipelineNodes[i].name, `State updated successfully. Payload ready.`, 'succ');
        }

        addLog('System', 'Workflow execution completed successfully!', 'succ');
        isRunning = false;
        runBtn.disabled = false;
        runBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Run Agent Pipeline`;
        statusText.textContent = "Completed";
        renderNodes();
    });

    function renderNodes(executingIdx = -1) {
        const container = document.getElementById('workflow-nodes-container');
        container.innerHTML = '';

        pipelineNodes.forEach((node, idx) => {
            const card = document.createElement('div');
            let classes = 'node-item';
            if (idx === selectedNodeIdx) classes += ' selected';
            if (idx === executingIdx) classes += ' executing';

            card.className = classes;
            card.innerHTML = `
                <div class="node-top">
                    <span class="node-name"><i class="fa-solid ${node.icon}"></i> ${node.name}</span>
                </div>
                <div class="node-desc">${node.description}</div>
            `;

            card.addEventListener('click', () => {
                selectedNodeIdx = idx;
                renderNodes(executingIdx);
            });

            container.appendChild(card);

            if (idx < pipelineNodes.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'node-arrow';
                arrow.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`;
                container.appendChild(arrow);
            }
        });

        updateJSONViewer();
    }

    function updateJSONViewer() {
        const viewer = document.getElementById('json-viewer');
        if (pipelineNodes[selectedNodeIdx]) {
            viewer.textContent = JSON.stringify(pipelineNodes[selectedNodeIdx].state, null, 2);
        }
    }

    function addLog(sender, text, type = 'sys') {
        const consoleEl = document.getElementById('logs-container');
        const time = new Date().toTimeString().split(' ')[0];
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerHTML = `<span class="ts">[${time}]</span> <strong>${sender}:</strong> ${text}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    document.getElementById('clear-logs').addEventListener('click', () => {
        document.getElementById('logs-container').innerHTML = '';
        addLog('System', 'Console logs cleared.', 'sys');
    });

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

        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7
        }));

        function draw() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 - dist / 120 * 0.15})`;
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
});
