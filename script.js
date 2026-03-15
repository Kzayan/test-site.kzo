// ============ ҮШ МУЗЫКА ҚАТАРЫНАН (Shiza - SHYM дұрыс нұсқасы) ============
let kairatPlayer = null;
let densPlayer = null;
let shizaPlayer = null;
let isKairatPlaying = false;
let isDensPlaying = false;
let isShizaPlaying = false;
let currentPlaylist = [
    'XYIYpFZ59wU',      // Shiza – SHYM (1950'S Jazz & Soul Version) - ЖҰМЫС ІСТЕЙДІ
    'uZy0-fQOBj8',      // Қайрат Нұртас – Ол сен емес
    '5KDZD86MWYU'       // 9 Грамм – ДЭНС
];
let currentTrackIndex = 0;
let playlistInterval = null;

// YouTube API жүктеу
function