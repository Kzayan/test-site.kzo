// DOM элементтері
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const audioContainer = document.getElementById('audioContainer');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const charCountSpan = document.getElementById('charCount');
const warningMsg = document.getElementById('warningMsg');

// Ағымдағы аудио URL
let currentAudioUrl = null;
let currentAudioBlob = null;

// API URL (бірнеше опция)
const API_OPTIONS = [
    'https://tts.sahip.kz/index.php',
    'https://api.voicerss.org/',
    'https://translate.google.com/translate_tts'
];

// Қолданылатын API (қазақша жұмыс істейтін)
const API_URL = 'https://tts.sahip.kz/index.php';

// Статус хабарламасын жаңарту
function setStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = 'status';
    if (type === 'success') {
        statusDiv.classList.add('success');
    } else if (type === 'error') {
        statusDiv.classList.add('error');
    } else if (type === 'loading') {
        statusDiv.classList.add('loading');
    }
}

// Символдар санау
function updateCharCount() {
    const count = textInput.value.length;
    charCountSpan.textContent = count;
    
    if (count > 500) {
        warningMsg.textContent = '⚠️ Мәтін ұзындығы 500 символдан асты!';
        if (count > 1000) {
            warningMsg.textContent = '❌ Мәтін тым ұзын! 1000 символдан аспауы керек.';
        }
    } else {
        warningMsg.textContent = '';
    }
}

// Мәтінді тазалау
function clearText() {
    textInput.value = '';
    updateCharCount();
    hideAudio();
    setStatus('✨ Өріс тазартылды. Жаңа мәтін жазыңыз.');
    textInput.focus();
}

// Аудио бөлімін жасыру
function hideAudio() {
    audioContainer.style.display = 'none';
    audioPlayer.src = '';
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }
    currentAudioBlob = null;
}

// Аудио көрсету
function showAudio() {
    audioContainer.style.display = 'block';
}

// Жүктеп алу
function setupDownload() {
    if (currentAudioBlob) {
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }
        currentAudioUrl = URL.createObjectURL(currentAudioBlob);
        
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = currentAudioUrl;
            link.download = `qazaq_tts_${Date.now()}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setStatus('✅ Аудио файл жүктелді!', 'success');
        };
    } else {
        downloadBtn.onclick = () => {
            setStatus('❌ Алдымен аудио жасаңыз!', 'error');
        };
    }
}

// Тікелей Google TTS (қазақша қолдайды)
async function generateWithGoogleTTS(text) {
    return new Promise((resolve, reject) => {
        // Google Translate TTS арқылы
        const audio = new Audio();
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=kk&client=tw-ob`;
        
        audio.src = url;
        
        audio.oncanplaythrough = () => {
            // Google TTS-тен blob алу үшін fetch қолдану
            fetch(url)
                .then(response => response.blob())
                .then(blob => resolve(blob))
                .catch(reject);
        };
        
        audio.onerror = () => {
            reject(new Error('Google TTS жұмыс істемеді'));
        };
        
        // Таймаут
        setTimeout(() => reject(new Error('Google TTS таймаут')), 10000);
    });
}

// Негізгі API арқылы
async function generateWithKazTTS(text) {
    const params = new URLSearchParams({
        text: text,
        lang: 'kk',
        speed: '1.0'
    });
    
    const response = await fetch(`${API_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'audio/mpeg, audio/*'
        }
    });
    
    if (!response.ok) {
        throw new Error(`API қатесі: ${response.status}`);
    }
    
    return await response.blob();
}

// Балама API (Voice RSS - қазақша қолдайды)
async function generateWithVoiceRSS(text) {
    const apiKey = 'YOUR_API_KEY'; // Тегін API кілт алу керек
    const url = `https://api.voicerss.org/?key=${apiKey}&hl=kk-kz&src=${encodeURIComponent(text)}&c=MP3&f=44khz_16bit_stereo`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('VoiceRSS API қатесі');
    }
    return await response.blob();
}

// Негізгі аудио жасау функциясы
async function generateSpeech() {
    const text = textInput.value.trim();
    
    // Валидация
    if (!text) {
        setStatus('⚠️ Мәтінді енгізіңіз!', 'error');
        textInput.focus();
        return;
    }
    
    if (text.length > 1000) {
        setStatus('❌ Мәтін тым ұзын! 1000 символдан аспауы керек.', 'error');
        return;
    }
    
    // Жүктеу режимі
    generateBtn.disabled = true;
    setStatus('🔄 Аудио жасалуда... Күте тұрыңыз...', 'loading');
    hideAudio();
    
    try {
        let audioBlob = null;
        let errorMessage = '';
        
        // Алдымен негізгі API-ны қолдану
        try {
            audioBlob = await generateWithKazTTS(text);
            if (audioBlob && audioBlob.size > 1000) {
                setStatus('✅ Аудио сәтті жасалды!', 'success');
            } else {
                throw new Error('Аудио өлшемі тым кішкентай');
            }
        } catch (error) {
            errorMessage = error.message;
            console.log('Негізгі API қатесі:', error);
            
            // Егер негізгі API жұмыс істемесе, Google TTS қолдану
            try {
                setStatus('🔄 Балама API қолданылуда...', 'loading');
                audioBlob = await generateWithGoogleTTS(text);
                if (audioBlob && audioBlob.size > 1000) {
                    setStatus('✅ Аудио балама API арқылы жасалды!', 'success');
                } else {
                    throw new Error('Google TTS аудио өлшемі тым кішкентай');
                }
            } catch (googleError) {
                console.log('Google TTS қатесі:', googleError);
                throw new Error(`Барлық API қатесі: ${errorMessage}, ${googleError.message}`);
            }
        }
        
        // Аудио сақтау
        if (audioBlob && audioBlob.size > 1000) {
            currentAudioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);
            currentAudioUrl = audioUrl;
            
            audioPlayer.src = audioUrl;
            showAudio();
            setupDownload();
            
            // Аудио ойнату
            audioPlayer.play().catch(e => console.log('Авто ойнату блокталды:', e));
            
        } else {
            throw new Error('Аудио жасау мүмкін болмады');
        }
        
    } catch (error) {
        console.error('Толық қате:', error);
        setStatus(`❌ Қате: ${error.message}. Интернет байланысын тексеріңіз немесе қысқа мәтінмен қайталаңыз.`, 'error');
        hideAudio();
    } finally {
        generateBtn.disabled = false;
    }
}

// Оқиғалар
generateBtn.addEventListener('click', generateSpeech);
clearBtn.addEventListener('click', clearText);
textInput.addEventListener('input', updateCharCount);

// Ctrl+Enter қолдау
textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateSpeech();
    }
});

// Бастапқы символ санау
updateCharCount();

// Кеңес көрсету
setStatus('✨ Қазақша мәтінді енгізіп, аудио жасаңыз. Ctrl+Enter тез жіберуге арналған.');