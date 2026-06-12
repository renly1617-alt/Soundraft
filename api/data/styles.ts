export interface StyleEntry {
  title: string
  englishName: string
  content: string
  keywords: string[]
  albums: string[]
}

export const STYLES: StyleEntry[] = [
  {
    title: "梦幻流行",
    englishName: "Dream Pop",
    content: "梦幻流行诞生于80年代的英国，由Cocteau Twins和早期的4AD厂牌定义。它用层层叠叠的吉他混响和人声回声创造出一片朦胧而美丽的声音景观——歌词往往听不清楚，但情绪异常清晰。它不像摇滚那样对抗，也不像流行那样甜美，而是介于清醒与梦境之间的地带。代表乐队包括Cocteau Twins、Slowdive、Beach House和Alvvays。",
    keywords: ["空灵", "迷幻", "温暖", "朦胧"],
    albums: ["Heaven or Las Vegas - Cocteau Twins", "Souvlaki - Slowdive", "Depression Cherry - Beach House"]
  },
  {
    title: "爵士",
    englishName: "Jazz",
    content: "爵士乐起源于20世纪初的新奥尔良，融合了非洲节奏与欧洲和声传统，是美国对世界音乐最重要的贡献。从路易斯·阿姆斯特朗的热烈小号到迈尔斯·戴维斯的冷峻调式，再到约翰·柯川的精神即兴，爵士乐走过了一条不断自我革新的路。它的核心是即兴——每一次演奏都是一次独一无二的创造。推荐从Kind of Blue、A Love Supreme和Mingus Ah Um开始了解。",
    keywords: ["即兴", "摇摆", "深情", "自由"],
    albums: ["Kind of Blue - Miles Davis", "A Love Supreme - John Coltrane", "Mingus Ah Um - Charles Mingus"]
  },
  {
    title: "前卫摇滚",
    englishName: "Progressive Rock",
    content: "前卫摇滚在60年代末的英国兴起，一批受过古典音乐训练的年轻乐手决定打破流行歌曲三分钟的限制，把摇滚乐做成交响曲的长度。King Crimson、Yes、Genesis和Pink Floyd是四支风格各异的代表乐队。他们使用复杂的拍号、古典乐器和新奇的录音技术，歌词常围绕科幻、神话和哲学展开。虽然后来被视为'过度'而被朋克反叛，但留下的作品至今仍无人超越。",
    keywords: ["宏大", "技巧性", "叙事性", "实验"],
    albums: ["The Dark Side of the Moon - Pink Floyd", "In the Court of the Crimson King - King Crimson", "Close to the Edge - Yes"]
  },
  {
    title: "后朋克",
    englishName: "Post-Punk",
    content: "1977年朋克爆炸之后，一些乐队觉得三和弦太简单了——他们保留了朋克的躁动能量和DIY精神，但加入了更多实验元素。Joy Division用冰冷的低频和机械节拍描绘后工业城市的灰色图景，Talking Heads则将非洲复节奏融入纽约的神经质中。后朋克不是一种风格，而是一种态度——用音乐去探索不适合大众传播的情绪和声音。",
    keywords: ["冷峻", "实验", "极简", "不安"],
    albums: ["Unknown Pleasures - Joy Division", "Remain in Light - Talking Heads", "Disintegration - The Cure"]
  },
  {
    title: "Trip-Hop",
    englishName: "Trip Hop",
    content: "Trip-hop诞生于90年代初的布里斯托，Massive Attack、Portishead和Tricky是'布里斯托三巨头'。它将缓慢的hip-hop节拍、爵士采样、阴沉的气氛和电影般的弦乐融合，创造了一种适合深夜独自聆听的声音。它不是派对音乐，而是城市夜晚的配乐——烟雾缭绕、性感而忧郁。Dummy和Blue Lines是两张必听的起点。",
    keywords: ["暗黑", "迷离", "性感", "电影感"],
    albums: ["Dummy - Portishead", "Blue Lines - Massive Attack", "Maxinquaye - Tricky"]
  },
  {
    title: "低保真",
    englishName: "Lo-Fi",
    content: "低保真不是一种特定的音乐风格，而是一种录音和制作美学——故意保留杂音、失真和粗糙感，让音乐听起来更真实、更私密。从车库摇滚到卧室流行，低保真精神贯穿了半个世纪的独立音乐。Neutral Milk Hotel用电锯般的风琴和走音的吉他录出了独立民谣的圣杯，而Mac DeMarco则用旧合成器和松弛的吉他定义了2010年代的卧室声音。",
    keywords: ["粗糙", "真实", "私密", "怀旧"],
    albums: ["In the Aeroplane Over the Sea - Neutral Milk Hotel", "2 - Mac DeMarco", "American Football - American Football"]
  },
  {
    title: "Shoegaze",
    englishName: "Shoegaze",
    content: "Shoegaze的名字来源于乐队演出时盯着效果器踏板的样子——因为他们不需要舞台表演，所有的能量都给了脚下的效果器和墙一般厚重的吉他噪音。My Bloody Valentine的Loveless是这种风格的终极形态：吉他不再是旋律工具，而是一层又一层的声浪。虽然歌词完全淹没在噪音中，但情绪却被放大了无数倍。这是让你闭上眼睛、忘记歌词、只感受振动的音乐。",
    keywords: ["噪音墙", "沉浸", "迷幻", "浓烈"],
    albums: ["Loveless - My Bloody Valentine", "Souvlaki - Slowdive", "Nowhere - Ride"]
  },
  {
    title: "合成器流行",
    englishName: "Synth-Pop",
    content: "80年代初期，合成器从实验室走进卧室，一批年轻人用Korg和Roland创造了一种冰冷而甜美的流行音乐。Depeche Mode和New Order让电子节拍有了灵魂，而The Human League和Eurythmics则把它带上了排行榜。合成器流行不是对传统乐器的背叛，而是对流行音乐边界的拓展——用机器写情歌，冰冷的外壳下藏着人类的温度。",
    keywords: ["复古", "电子", "旋律", "浪漫"],
    albums: ["Violator - Depeche Mode", "Power Corruption & Lies - New Order", "Dare - The Human League"]
  },
  {
    title: "Funk",
    englishName: "Funk",
    content: "放克音乐诞生于60年代中期的美国，由James Brown发起，以强调第一拍的切分节奏和密集的铜管为标志。它不是让你听的——是让你动的。从Parliament-Funkadelic的宇宙科幻叙事到Prince的摇滚放克融合，再到D'Angelo的新灵魂放克，这种以律动为核心的风格不断被新一代音乐人重新诠释。听放克的时候最好站起来，因为坐着听完几乎不可能。",
    keywords: ["律动", "节奏", "能量", "跳舞"],
    albums: ["Purple Rain - Prince", "There's a Riot Goin' On - Sly Stone", "Maggot Brain - Funkadelic"]
  },
  {
    title: "新灵魂乐",
    englishName: "Neo-Soul",
    content: "90年代末，D'Angelo、Erykah Badu和Lauryn Hill们厌倦了被商业包装的R&B，想找回灵魂乐最初的真诚和粗粝。他们从Stevie Wonder、Marvin Gaye和Donny Hathaway那里继承了深情，又加入了hip-hop的节奏感。新灵魂乐的声音更有机、更温暖、更人性——不追求完美的高音，而追求真实的情感。Brown Sugar、Baduizm和The Miseducation是三张无法绕过的经典。",
    keywords: ["温暖", "真诚", "深情", "有机"],
    albums: ["Voodoo - D'Angelo", "Baduizm - Erykah Badu", "The Miseducation of Lauryn Hill - Lauryn Hill"]
  },
  {
    title: "英伦摇滚",
    englishName: "Britpop",
    content: "90年代中期，Oasis和Blur之间的排行榜大战把英国人的注意力重新拉回了吉他摇滚。Britpop继承了The Beatles和The Kinks的英国传统——旋律至上、歌词幽默而富有阶级意识，穿着Fred Perry上衣喝啤酒的蓝领青年成了主角。虽然音乐本身不算革命性，但它定义了一代英国青年的身份认同。Morning Glory和Parklife是那个时代最好的两张成绩单。",
    keywords: ["自信", "吉他", "英国", "青春"],
    albums: ["(What's the Story) Morning Glory? - Oasis", "Parklife - Blur", "Different Class - Pulp"]
  },
  {
    title: "电子氛围",
    englishName: "Ambient",
    content: "Brian Eno在1978年创造了Ambient这个词，他的定义是'像忽略家具一样可以忽略，但也像家具一样能改变房间气质的音乐'。氛围音乐不是给你集中注意力听的，而是创造空间的。从Eno的早期作品到90年代的Aphex Twin和The Orb，再到近年来被广泛用于工作、冥想和睡眠，氛围音乐已经从实验的边缘走到了日常生活的中心。",
    keywords: ["空间感", "宁静", "沉浸", "冥想"],
    albums: ["Selected Ambient Works 85-92 - Aphex Twin", "Ambient 1: Music for Airports - Brian Eno", "Music Has the Right to Children - Boards of Canada"]
  },
  {
    title: "朋克",
    englishName: "Punk",
    content: "1976年，一群英国年轻人受够了前卫摇滚的二十分钟吉他独奏和明星崇拜，决定用三个和弦和嘶吼来表达愤怒。Sex Pistols只发行了一张专辑就解散了，但他们点燃的火焰从未熄灭。朋克不只是一类音乐，它是一种态度——不需要精湛技术，不需要昂贵设备，只要你想说点什么，拿把吉他就可以开始。这种精神后来滋养了硬核、后朋克和整个独立音乐运动。",
    keywords: ["愤怒", "反叛", "简单", "直接"],
    albums: ["London Calling - The Clash", "Never Mind the Bollocks - Sex Pistols", "Rocket to Russia - Ramones"]
  },
  {
    title: "金属",
    englishName: "Heavy Metal",
    content: "1970年Black Sabbath的第一声三全音和弦响起时，世界听到了一种前所未有的重量。从那以后，金属乐不断分裂和进化——从Iron Maiden的史诗叙事到Metallica的鞭笞金属，再到Deafheaven将黑金属和自赏摇滚融合。金属的核心是power：吉他的力量、鼓的力量、情绪宣泄的力量。它远比外界想象的要复杂和多元。",
    keywords: ["力量", "技术", "厚重", "宣泄"],
    albums: ["Paranoid - Black Sabbath", "Master of Puppets - Metallica", "The Number of the Beast - Iron Maiden"]
  },
  {
    title: "R&B",
    englishName: "R&B",
    content: "当代R&B的根源可以追溯到Stevie Wonder和Marvin Gaye在70年代用合成器和概念专辑拓展的灵魂乐边界。到了90年代，Babyface和Janet Jackson把它带到了主流排行榜。2010年代之后，Frank Ocean和SZA用更私密、更实验的方式重新定义了R&B——不再需要标准的副歌结构，一句假声就能撑起一首歌。R&B是黑人音乐进化史上最具弹性的形态。",
    keywords: ["深情", "细腻", "氛围", "都市"],
    albums: ["Channel Orange - Frank Ocean", "Songs in the Key of Life - Stevie Wonder", "Ctrl - SZA"]
  },
  {
    title: "嘻哈",
    englishName: "Hip-Hop",
    content: "嘻哈诞生于1973年纽约布朗克斯的街区派对，由一个名叫Kool Herc的牙买加移民用两个唱盘机创造。五十年后，它已经成为全世界最主流的声音。从80年代Run-DMC的金链子到90年代Wu-Tang的少林功夫，再到Kendrick Lamar用Pulitzer奖改变人们对说唱的认知——嘻哈的核心一直没变：用自己的声音讲述自己街区的故事。",
    keywords: ["节奏", "文字", "街头", "真实"],
    albums: ["Illmatic - Nas", "To Pimp a Butterfly - Kendrick Lamar", "Enter the Wu-Tang - Wu-Tang Clan"]
  },
  {
    title: "独立民谣",
    englishName: "Indie Folk",
    content: "21世纪初，一批年轻音乐人厌倦了电子的喧嚣，回到木吉他和最简单的旋律。Bon Iver在威斯康辛的森林小屋里独自录出了For Emma，Iron & Wine用耳语般的嗓音唱睡前故事。独立民谣不是复古怀旧，而是用最简单的工具达到最深的情感。一把吉他、一段和弦、一个足够真实的嗓音——就够了。",
    keywords: ["自然", "安静", "真诚", "温暖"],
    albums: ["For Emma, Forever Ago - Bon Iver", "Our Endless Numbered Days - Iron & Wine", "Fleet Foxes - Fleet Foxes"]
  },
  {
    title: "巴洛克流行",
    englishName: "Baroque Pop",
    content: "60年代中期，随着录音技术的进步，一批流行音乐人开始在录音室里加入管弦乐、羽管键琴和四重奏，追求比常规摇滚更精致的编制。The Beatles的弦乐编曲、The Beach Boys的复杂和声、Scott Walker的阴暗叙事——巴洛克流行把古典音乐的美感带进了流行歌的三分钟框架。华丽而不浮夸，精致而不冰冷。",
    keywords: ["华丽", "精致", "古典", "优美"],
    albums: ["Pet Sounds - The Beach Boys", "Odessey and Oracle - The Zombies", "Scott 4 - Scott Walker"]
  },
  {
    title: "雷鬼",
    englishName: "Reggae",
    content: "雷鬼发源于60年代的牙买加，根植于ska和rocksteady，以强调反拍的节奏和深沉的低音为特色。Bob Marley让它走向世界，但雷鬼远不止他一人——Peter Tosh的愤怒、Lee 'Scratch' Perry的制作实验和Burning Spear的灵性都是这个风格不可或缺的部分。雷鬼的节奏看似简单，但一旦你跟着点头，就停不下来。",
    keywords: ["放松", "节奏", "阳光", "灵性"],
    albums: ["Exodus - Bob Marley & The Wailers", "Funky Kingston - Toots & The Maytals", "Marcus Garvey - Burning Spear"]
  },
  {
    title: "艺术流行",
    englishName: "Art Pop",
    content: "艺术流行是流行音乐中最不安分的一支——它保留了流行音乐的吸引力，但拒绝按套路出牌。Kate Bush把文学和舞蹈融入她的合成器世界，Björk用管弦乐碰撞工业电子，David Bowie不断换装从未重复自己。艺术流行的创作者不是在做产品，而是在做自己的博物馆展品。",
    keywords: ["创新", "前卫", "戏剧", "个性"],
    albums: ["Hounds of Love - Kate Bush", "Homogenic - Björk", "The Rise and Fall of Ziggy Stardust - David Bowie"]
  },
  {
    title: "Grunge",
    englishName: "Grunge",
    content: "80年代末，西雅图的雨水和被遗忘的工人阶级酝酿出了一种新的声音——把朋克的愤怒、金属的重量和独立摇滚的旋律混在一起，用最不讲究形象的方式表演。Nirvana的Nevermind在1991年意外地卖了两千多万张，把所有华丽金属赶出了排行榜。Grunge是最后一场真正由地下发起的摇滚革命，Cobain的离去也让它成为最短暂的辉煌。",
    keywords: ["粗粝", "愤怒", "脆弱", "真实"],
    albums: ["Nevermind - Nirvana", "Ten - Pearl Jam", "Dirt - Alice in Chains"]
  },
  {
    title: "独立摇滚",
    englishName: "Indie Rock",
    content: "独立摇滚最初指的是在不属于主流唱片公司旗下发行的摇滚乐——它首先是一种经济身份，然后才是一种声音。从The Smiths的英国吉他到Pavement的美式松弛，再到The Strokes将车库摇滚带回21世纪，独立摇滚的定义不断变化，但核心始终是：做自己的音乐，不需要妥协。",
    keywords: ["自由", "吉他", "DIY", "真实"],
    albums: ["The Queen Is Dead - The Smiths", "Is This It - The Strokes", "Funeral - Arcade Fire"]
  },
  {
    title: "爵士放克",
    englishName: "Jazz-Funk",
    content: "60年代末到70年代，Miles Davis、Herbie Hancock和Donald Byrd等爵士乐手开始使用电吉他和合成器，放克的律动注入了爵士的即兴灵魂。Head Hunters成为历史上最畅销的爵士专辑之一，而Steely Dan则在录音室里用最顶级的乐手织出了无可挑剔的爵士摇滚。爵士放克是智力与身体的完美和解——既能让你的大脑兴奋，也能让你的屁股离开椅子。",
    keywords: ["律动", "即兴", "精妙", "摇摆"],
    albums: ["Head Hunters - Herbie Hancock", "Aja - Steely Dan", "Bitches Brew - Miles Davis"]
  },
  {
    title: "嘻哈爵士",
    englishName: "Jazz Rap",
    content: "90年代初期，A Tribe Called Quest和Gang Starr等制作人开始大量采样爵士唱片——不是只用一两个小片段，而是把整段爵士钢琴和小号即兴作为beat的骨架。这种风格后来被称为Jazz Rap，它的节奏比硬核嘻哈更松弛，歌词也更偏生活哲学而非街头对抗。De La Soul的怪趣和Guru的冷静都证明了一点：嘻哈和爵士本就是一家人。",
    keywords: ["松弛", "采样", "爵士", "流畅"],
    albums: ["The Low End Theory - A Tribe Called Quest", "Moment of Truth - Gang Starr", "3 Feet High and Rising - De La Soul"]
  },
  {
    title: "车库摇滚",
    englishName: "Garage Rock",
    content: "车库摇滚最初是60年代美国郊区青少年在地下室和车库里的粗糙录音——简单、直接、充满原始能量。四十年后，The Strokes、The White Stripes和The Hives在2001年同时点燃了车库摇滚复兴，把那些被过度制作的流行音乐打得粉碎。车库摇滚的核心公式很简单：失真吉他、粗糙人声、不修边幅——但它提醒我们，摇滚有时只需要这一点就够了。",
    keywords: ["原始", "直接", "粗粝", "复古"],
    albums: ["Is This It - The Strokes", "White Blood Cells - The White Stripes", "Up the Bracket - The Libertines"]
  },
  {
    title: "世界音乐",
    englishName: "World Music",
    content: "世界音乐是一个不够精确但广泛使用的标签，统指来自非洲、拉丁美洲、亚洲和中东等地的传统与当代音乐。从Fela Kuti发明的Afrobeat到Buena Vista Social Club的古巴声景，再到Tinariwen的沙漠布鲁斯——世界音乐不是西方音乐的注脚，而是一个自成一体的宇宙。它的节奏和音阶常常挑战西方听众的耳朵，但一旦接受，就会发现一个全新的声音世界。",
    keywords: ["异域", "节奏", "传统", "融合"],
    albums: ["Zombie - Fela Kuti", "Buena Vista Social Club - Buena Vista Social Club", "Aman Iman - Tinariwen"]
  },
  {
    title: "电音放克",
    englishName: "Electro-Funk",
    content: "80年代初，Roger Troutman的talk box和Afrika Bambaataa的Planet Rock将放克律动送入电子未来。这是一种彻底的人工声音——鼓机和合成器代替了真实的乐团，机器人般的人声效果让放克听起来像来自外星球。Daft Punk的Discovery在二十年后完整继承了这一传统，将70年代的采样和80年代的电子美学完美融合。",
    keywords: ["复古", "舞曲", "机器人", "律动"],
    albums: ["Discovery - Daft Punk", "Planet Rock - Afrika Bambaataa", "Computer World - Kraftwerk"]
  },
  {
    title: "民谣",
    englishName: "Folk",
    content: "民谣是最古老的音乐形式之一，从田间地头的劳动号子到60年代的抗议歌曲，再到21世纪的独立民谣复兴——它的形态不断变化，但核心从未改变：一把木吉他、一个真实的嗓音、一段直击人心的故事。Bob Dylan让民谣变成了文学，Joni Mitchell用开放调弦写出了诗的韵律，而Nick Drake则在逝世后才被世界听见。",
    keywords: ["叙事", "温暖", "真诚", "简约"],
    albums: ["Blue - Joni Mitchell", "The Freewheelin' Bob Dylan - Bob Dylan", "Pink Moon - Nick Drake"]
  },
  {
    title: "古典跨界",
    englishName: "Modern Classical",
    content: "古典音乐在21世纪找到了新的表达方式——Max Richter用极简主义的弦乐创作了'睡前八小时'的专辑Sleep，Ólafur Arnalds在钢琴和弦乐之间编织冰岛的风景，Nils Frahm则把古典钢琴和电子合成器放在同一个空间。这些音乐不属于传统的演奏厅，而属于深夜的卧室、独自的工作室和任何需要深度专注的时刻。",
    keywords: ["宁静", "深情", "空间", "冥想"],
    albums: ["Sleep - Max Richter", "re:member - Ólafur Arnalds", "Spaces - Nils Frahm"]
  },
  {
    title: "后摇",
    englishName: "Post-Rock",
    content: "后摇滚在90年代兴起，一群吉他手决定放弃传统的主歌-副歌结构，转而把摇滚乐器当作交响乐团来使用——吉他不再是riff的载体，而是织成音墙的画笔。Explosions in the Sky用纯粹的器乐讲出了比很多有歌词的歌曲更动人的故事，Godspeed You! Black Emperor用长篇编曲描绘末日图景。这是属于耐心听众的音乐。",
    keywords: ["器乐", "渐进", "电影感", "沉浸"],
    albums: ["The Earth Is Not a Cold Dead Place - Explosions in the Sky", "Lift Your Skinny Fists - Godspeed You! Black Emperor", "Young Team - Mogwai"]
  },
  {
    title: "灵魂乐",
    englishName: "Soul",
    content: "灵魂乐诞生于50年代的美国黑人教堂，将福音的虔诚和R&B的世俗激情融合为一体。Aretha Franklin的嗓音是上帝给人类的礼物，Otis Redding用短短几年定义了一个时代，而Al Green则证明柔声细语也能有千钧之力。灵魂乐的核心是用最诚实的声音唱最真实的情感——当你听到它的时候，你不需要被说服，你已经被征服。",
    keywords: ["深情", "福音", "经典", "温暖"],
    albums: ["I Never Loved a Man - Aretha Franklin", "Otis Blue - Otis Redding", "Call Me - Al Green"]
  }
]
