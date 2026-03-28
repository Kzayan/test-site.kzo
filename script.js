// DOM элементтері
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const audioSection = document.getElementById('audioSection');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const statusMsg = document.getElementById('statusMsg');
const charCountSpan = document.getElementById('charCount');

// TTS API базасы (қазақша, тегін)
const TTS_API_URL = 'https://tts.sahip.kz/index.php';

// Ағымдағы аудио blob және URL
let currentAudioBlob = null;
let currentAudioUrl = null;

// Статус хабарламасын жаңарту
function setStatus(message, type = 'info') {
    statusMsg.innerHTML = message;
    statusMsg.classList.remove('error', 'success');
    if (type === 'error') {
        statusMsg.classList.add('error');
    } else if (type === 'success') {
        statusMsg.classList.add('success');
    }
}

// Символдар санауышы
function updateCharCount() {
    const len = textInput.value.length;
    charCountSpan.innerText = len;
    
    if (len > 500) {
        charCountSpan.style.color = '#d97706';
        if (len > 1000) {
            charCountSpan.style.color = '#dc2626';
            setStatus('⚠️ Мәтін тым ұзын (' + len + ' символ). 500-600 символдан аспағаны жөн.', 'error');
        } else if (!statusMsg.innerHTML.includes('Қате') && !statusMsg.innerHTML.includes('дайын')) {
            setStatus('⚠️ Мәтін ұзындығы ' + len + ' символ. API шектеуі болуы мүмкін.', 'error');
        }
    } else {
        charCountSpan.style.color = '#4a627a';
        if (statusMsg.innerHTML.includes('⚠️') && !statusMsg.innerHTML.includes('Қате') && !statusMsg.innerHTML.includes('дайын')) {
            setStatus('✨ Мәтінді енгізіп, «Аудио жасау» батырмасын басыңыз.', 'info');
        }
    }
}

// Ескі аудио ресурстарды тазалау
function revokeOldAudio() {
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }
    currentAudioBlob = null;
}

// Аудио жасау батырмасының күйін өзгерту
function setLoading(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner"></span> Өңделуде...';
    } else {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '🎧 Аудио жасау';
    }
}

// Жүктеп алу батырмасын дайындау
function setupDownload() {
    if (currentAudioBlob) {
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }
        currentAudioUrl = URL.createObjectURL(currentAudioBlob);
        
        downloadBtn.onclick = () => {
            try {
                const link = document.createElement('a');
                link.href = currentAudioUrl;
                const fileName = `qaz_tts_${Date.now()}.mp3`;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setStatus('✅ Аудио жүктелді! Файл: ' + fileName, 'success');
                
                setTimeout(() => {
                    if (statusMsg.innerHTML.includes('жүктелді') && !textInput.value) {
                        setStatus('✨ Жаңа мәтінді де сынап көріңіз.', 'info');
                    }
                }, 3000);
            } catch (error) {
                setStatus('❌ Жүктеу кезінде қате орын алды', 'error');
            }
        };
    } else {
        downloadBtn.onclick = () => {
            setStatus('❌ Алдымен «Аудио жасау» батырмасын басыңыз', 'error');
        };
    }
}

// Негізгі функция: мәтінді TTS API арқылы MP3 алу
async function generateSpeech() {
    const text = textInput.value.trim();
    
    // Валидация
    if (text === "") {
        setStatus('⚠️ Мәтінді енгізіңіз!', 'error');
        textInput.focus();
        return;
    }
    
    if (text.length > 1200) {
        setStatus('❌ Мәтін тым ұзын (' + text.length + ' символ). 600 символдан аспауы керек.', 'error');
        return;
    }
    
    // Жүктеу режимі
    setLoading(true);
    setStatus('🎙️ Жасанды интеллект мәтінді өңдеп жатыр, күте тұрыңыз...', 'info');
    
    // Ескі аудио тазалау
    revokeOldAudio();
    audioSection.style.display = 'none';
    audioPlayer.src = '';
    
    try {
        // API параметрлері
        const params = new URLSearchParams({
            text: text,
            lang: 'kk',
            speed: '1.0'
        });
        const fullUrl = `${TTS_API_URL}?${params.toString()}`;
        
        // API сұрау жіберу
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'audio/mpeg, audio/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API қатесі: ${response.status} ${response.statusText}`);
        }
        
        // Аудио blob алу
        const blob = await response.blob();
        
        // Blob өлшемін тексеру
        if (blob.size < 100) {
            throw new Error('Алынған аудио өте кішкентай. Мәтінді тексеріңіз немесе қайталаңыз.');
        }
        
        // Аудио сақтау
        currentAudioBlob = blob;
        const audioUrl = URL.createObjectURL(blob);
        currentAudioUrl = audioUrl;
        
        // Аудиоплеерге орнату
        audioPlayer.src = audioUrl;
        audioSection.style.display = 'block';
        
        // Аудио дайын болғанша күту
        audioPlayer.oncanplaythrough = () => {
            setStatus('✅ Аудио дайын! Тыңдап, жүктеп алыңыз.', 'success');
        };
        
        audioPlayer.onerror = () => {
            setStatus('⚠️ Аудио ойнату кезінде қате, бірақ файл жүктелуі мүмкін', 'error');
        };
        
        // Жүктеп алу батырмасын баптау
        setupDownload();
        
    } catch (error) {
        console.error('TTS қатесі:', error);
        setStatus(`❌ Қате орын алды: ${error.message}. Интернет байланысын тексеріңіз немесе қысқа мәтінмен қайталаңыз.`, 'error');
        audioSection.style.display = 'none';
        revokeOldAudio();
    } finally {
        setLoading(false);
    }
}

// Тазалау функциясы
function clearAll() {
    textInput.value = '';
    updateCharCount();
    revokeOldAudio();
    audioSection.style.display = 'none';
    audioPlayer.src = '';
    setStatus('🧹 Өріс тазартылды. Жаңа мәтін жазыңыз.', 'info');
    setLoading(false);
    textInput.focus();
}

// Оқиғаларды байланыстыру
generateBtn.addEventListener('click', generateSpeech);
clearBtn.addEventListener('click', clearAll);

// Enter батырмасымен жіберу (Ctrl+Enter)
textInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        generateSpeech();
    }
});

// Алғашқы жүктеу кезінде аудио бөлімін жасыру
audioSection.style.display = 'none';

// Бастапқы символ санау
updateCharCount();