const QUESTIONS_DB = [
    {
        id: 1,
        text: "Люби меня по-французски, раз это так неизбежно...",
        options: [
            "...как будто ты самый первый. Как будто мой самый нежный.",
            "... люби меня–швейцарски. Люби на всех языках мира.",
            "... будто друг друга не знаем. Как будто мы незнакомцы.",
            "... как будто ты самый лучший. Как будто мой неизбежный."
        ],
        correct: 0,
        category: "popular",
        year: 2008
    },
    {
        id: 2,
        text: "Бұл ән 2000-шы жылдардың басындағы қазақ поп-музыкасының хиті: «Айта берме, ...»",
        options: ["«Сені сүйемін»", "«Өткен күндер»", "«Жүрек сыры»", "«Арман қала»"],
        correct: 1,
        category: "popular",
        year: 2003
    },
    {
        id: 3,
        text: "Қай әнде «Жүрегімнің түбіне сені тығып қойдым» деген жолдар бар?",
        options: ["«Жүрек» - Жүзжүрек", "«Махаббатым» - Орда", "«Сағыныш» - Мейрамбек", "«Арман» - Рахат"],
        correct: 0,
        category: "popular",
        year: 2005
    },
    {
        id: 4,
        text: "2006 жылы шыққан «Қош бол, менің махаббатым» әні кімдікі?",
        options: ["Роза Рымбаева", "Жанар Дұғалова", "Айгүл Иманбаева", "Батырхан Шүкенов"],
        correct: 3,
        category: "popular",
        year: 2006
    },
    {
        id: 5,
        text: "«Аққулар» тобының 2009 жылғы хиті қалай аталады?",
        options: ["«Аққуым»", "«Көк аспан»", "«Ұмытпа»", "«Махаббатым»"],
        correct: 0,
        category: "popular",
        year: 2009
    },
    {
        id: 6,
        text: "Which Russian band sang 'Невеста' in 2008?",
        options: ["Серебро", "ВИА Гра", "Блестящие", "Фабрика"],
        correct: 1,
        category: "popular",
        year: 2008
    },
    {
        id: 7,
        text: "«Umbrella» әнін кім орындайды?",
        options: ["Beyoncé", "Rihanna", "Shakira", "Lady Gaga"],
        correct: 1,
        category: "popular",
        year: 2007
    },
    {
        id: 8,
        text: "«In da Club» әні қай жылы шықты?",
        options: ["2001", "2002", "2003", "2004"],
        correct: 2,
        category: "popular",
        year: 2003
    },
    {
        id: 9,
        text: "«Hey Ya!» тобының аты?",
        options: ["OutKast", "The Black Eyed Peas", "Gnarls Barkley", "Usher"],
        correct: 0,
        category: "popular",
        year: 2003
    },
    {
        id: 10,
        text: "«Crazy in Love» әніндегі дуэт?",
        options: ["Jay-Z & Beyoncé", "Nelly & Kelly Rowland", "Eminem & Rihanna", "Timbaland & Nelly Furtado"],
        correct: 0,
        category: "popular",
        year: 2003
    },
    {
        id: 11,
        text: "2002 жылы «Complicated» хитің кім шырқады?",
        options: ["Avril Lavigne", "Britney Spears", "Christina Aguilera", "Pink"],
        correct: 0,
        category: "popular",
        year: 2002
    },
    {
        id: 12,
        text: "«Hips Don't Lie» әні қай жылы шықты?",
        options: ["2004", "2005", "2006", "2007"],
        correct: 2,
        category: "popular",
        year: 2006
    },
    {
        id: 13,
        text: "Қазақ тобы «Уркер» 2008 жылы қандай әнмен танымал болды?",
        options: ["«Анашым»", "«Арман»", "«Көктем»", "«Сен үшін»"],
        correct: 3,
        category: "popular",
        year: 2008
    },
    {
        id: 14,
        text: "«Bye Bye Bye» тобы?",
        options: ["Backstreet Boys", "'N Sync", "Westlife", "Boyzone"],
        correct: 1,
        category: "popular",
        year: 2000
    },
    {
        id: 15,
        text: "«Maneater» әні кімнің?",
        options: ["Nelly Furtado", "Fergie", "Gwen Stefani", "Shakira"],
        correct: 0,
        category: "popular",
        year: 2006
    },
    {
        id: 16,
        text: "«Mr. Brightside» кімнің хиті?",
        options: ["The Killers", "Coldplay", "The Strokes", "Arctic Monkeys"],
        correct: 0,
        category: "popular",
        year: 2004
    },
    {
        id: 17,
        text: "2000 жылдардың басындағы қазақ R&B тобы?",
        options: ["101", "KesYou", "Juzim", "Orda"],
        correct: 2,
        category: "popular",
        year: 2005
    },
    {
        id: 18,
        text: "«Toxic» әні қай жылы шықты?",
        options: ["2002", "2003", "2004", "2005"],
        correct: 2,
        category: "popular",
        year: 2004
    },
    {
        id: 19,
        text: "«Hot in Herre» әнінің орындаушысы?",
        options: ["Nelly", "50 Cent", "Snoop Dogg", "Eminem"],
        correct: 0,
        category: "popular",
        year: 2002
    },
    {
        id: 20,
        text: "«Ғашықпын» әнің кім орындайды (2007)?",
        options: ["Қайрат Нұртас", "Мадина Садвакасова", "Ерке Есмахан", "Дос-Мукасан"],
        correct: 2,
        category: "popular",
        year: 2007
    }
];