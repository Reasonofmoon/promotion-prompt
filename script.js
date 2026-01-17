document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const grid = document.getElementById('promptsGrid');
    const categoryNav = document.getElementById('categoryNav');
    const searchInput = document.getElementById('searchInput');
    const magicToggle = document.getElementById('magicToggle');
    const toast = document.getElementById('toast');

    // State
    let currentCategory = 'all';
    let isMagicMode = false;
    let searchTerm = '';

    // Initialize
    initCategories();
    renderPrompts();

    // Event Listeners
    magicToggle.addEventListener('change', (e) => {
        isMagicMode = e.target.checked;
        const mainContainer = document.querySelector('main');
        if (isMagicMode) {
            mainContainer.classList.add('magic-mode-active');
        } else {
            mainContainer.classList.remove('magic-mode-active');
        }
        renderPrompts();
    });

    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderPrompts();
    });

    // Functions
    function initCategories() {
        // Extract unique categories from promptData (loaded from prompts.js)
        const categories = [...new Set(promptData.map(p => p.category))];
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.textContent = cat.replace(/^\S+\s*챕터 \d+\.\s*/, ''); // Remove "## 챕터 1." prefix if present clean
            // Actually the parser kept "## " in some cases depending on logic, let's just use the raw category string
            // My python script output 'category' stripped of '## '. 
            // The file content had "## 🏗️ 챕터 1. [홍보/마케팅] ..."
            // I'll filter for a cleaner label in the button
            
            let label = cat;
            // Pattern to extract text inside [] or just the main text
            const match = cat.match(/\[(.*?)\]/);
            if (match) label = match[1];
            
            btn.dataset.cat = cat;
            btn.textContent = label;
            
            btn.addEventListener('click', () => {
                // Update Active State
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentCategory = cat;
                renderPrompts();
            });
            
            categoryNav.appendChild(btn);
        });
    }

    function renderPrompts() {
        grid.innerHTML = '';

        const filtered = promptData.filter(p => {
            const matchesCat = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                                  p.content.toLowerCase().includes(searchTerm);
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">검색 결과가 없습니다. 😢</div>';
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = `prompt-card ${isMagicMode ? 'magic-active' : ''}`;
            
            // Magic Content Transformation
            const displayContent = isMagicMode ? getMagicPrompt(p.content) : p.content;
            
            // Construct Card HTML (except button)
            card.innerHTML = `
                <div class="card-header">
                    <span class="badge">${p.subcategory || '일반'}</span>
                </div>
                <h3 class="card-title">${p.title}</h3>
                <div class="prompt-text-box">${escapeHtml(displayContent)}</div>
            `;
            
            // Create Button safely
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> ${isMagicMode ? '마법 프롬프트 복사' : '문구 복사'}`;
            copyBtn.onclick = function() {
                copyToClipboard(this, displayContent);
            };
            
            card.appendChild(copyBtn);
            grid.appendChild(card);
        });
    }

    function getMagicPrompt(original) {
        return `[✨역할]: 당신은 수원 '구매탄시장'의 힙하고 트렌디한 마케팅 전문가입니다.
[🎯목표]: 2030 MZ세대를 타켓으로 한 바이럴 마케팅 문구 작성.
[🎨톤앤매너]: 위트있는, 밈(Meme) 활용, 인스타그램 스타일.
[✅필수요소]: #구매탄시장 #수원맛집 #시장데이트 해시태그 포함.

[📝요청작업]:
"${original}"

위 내용을 바탕으로:
1. 인스타그램 피드용 글 (이모티콘 듬뿍)
2. 블로그 제목 3가지
3. 당근마켓 홍보 멘트
이렇게 3가지 버전을 작성해주세요.`;
    }

    // Utilities
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.copyToClipboard = function(btn, text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast();
            
            // Button Feedback
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> 복사됨!';
            btn.style.background = '#4ECDC4';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        });
    };
    
    // Helper for onclick inline
    function escapeJsString(str) {
        return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/"/g, '&quot;');
    }

    function showToast() {
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }
});
