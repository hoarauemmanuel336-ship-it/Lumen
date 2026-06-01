/* Traductions anglaises : correspondances de slugs, thèmes, interface, articles. */

const SLUGS = {
  'le-bapteme':'baptism',
  'la-grace-sanctifiante':'sanctifying-grace',
  'la-paix-du-christ':'the-peace-of-christ',
  'les-vertus-theologales':'the-theological-virtues',
  'la-foi':'faith',
  'l-esperance':'hope',
  'la-charite':'charity',
  'la-grace-actuelle':'actual-grace',
  'l-eglise':'the-church',
  'la-trinite':'the-trinity',
  'le-pere':'the-father',
  'le-fils':'the-son',
  'l-esprit-saint':'the-holy-spirit',
  'le-verbe':'the-word',
  'l-immaculee-conception':'the-immaculate-conception',
  'marie':'mary',
  'la-nouvelle-arche':'the-new-ark',
  'reine-du-ciel':'queen-of-heaven',
  'la-grace':'grace',
  'l-age-de-raison':'the-age-of-reason',
  'le-bapteme-des-petits-enfants':'infant-baptism',
  'le-peche':'sin',
  'le-peche-originel':'original-sin',
  'la-justice-originelle':'original-justice',
  'le-nouvel-adam-et-la-nouvelle-eve':'the-new-adam-and-the-new-eve',
  'les-passions-et-la-concupiscence':'the-passions-and-concupiscence',
  'le-salut':'salvation',
  'la-virginite-perpetuelle-de-marie':'the-perpetual-virginity-of-mary',
  'les-freres-de-jesus':'the-brothers-of-jesus',
  'marie-mere-de-dieu':'mary-mother-of-god',
  'le-bapteme-de-desir':'baptism-of-desire',
  'l-infaillibilite-pontificale':'papal-infallibility',
  'la-communion-des-saints':'the-communion-of-saints',
  'l-intercession-des-saints':'intercession-of-the-saints',
  'les-reliques':'relics',
  'l-eucharistie':'the-eucharist',
  'la-croix-et-la-resurrection':'the-cross-and-the-resurrection',
  'l-incarnation':'the-incarnation',
  'les-fins-dernieres':'the-last-things',
  'le-purgatoire':'purgatory',
  'la-confession':'confession',
  'la-primaute-de-pierre':'the-primacy-of-peter',
  'la-satisfaction':'satisfaction',
  'le-secret-de-la-confession':'the-seal-of-confession',
  'l-absolution':'absolution',
  'le-paradis':'paradise',
  'l-enfer':'hell',
  'le-jugement-particulier':'the-particular-judgment',
  'la-resurrection-de-la-chair':'the-resurrection-of-the-body',
  'le-jugement-dernier':'the-last-judgment',
  'le-mariage':'marriage',
  'la-confirmation':'confirmation',
  'l-onction-des-malades':'the-anointing-of-the-sick',
  'l-ordre':'holy-orders',
  'les-sacrements':'the-sacraments'
};

const THEMES_EN = {
  doctrine:    { nom:'Doctrine and Dogma',    desc:'What the Church believes and teaches: God, Christ, salvation, the Church, the last things.', cats:{dieu:'God and the Trinity',peche:'Sin and the Fall',christ:'Christ and the Redemption',marie:'The Virgin Mary',grace:'Grace and Salvation',eglise:'The Church',fins:'The Last Things'} },
  ecriture:    { nom:'Scripture and Exegesis',desc:'The reading of the Scriptures in the faith of the Church, from the literal sense to the spiritual senses.' },
  sacrements:  { nom:'Liturgy and Sacraments',desc:'The efficacious signs of grace and the worship by which the Church gives glory to God.', cats:{initiation:'The Sacraments of Christian Initiation',guerison:'The Sacraments of Healing',service:'The Sacraments at the Service of Communion'} },
  saints:      { nom:'Figures and Saints',    desc:'Those who lived and thought the faith: Fathers, doctors, mystics, witnesses.' },
  histoire:    { nom:'History of the Church', desc:'The path of the Church through the centuries, its councils and its struggles.' },
  philosophie: { nom:'Philosophy and Reason', desc:'Reason in the service of faith: the natural path toward God and truth.' },
  apologetique: { nom:'Apologetics', desc:'The reasoned defence of the faith: answering objections and showing that belief accords with reason.' }
};

const UI_EN = {
  lang_html:'en',
  menu_home:'Home',
  menu_library:'Library',
  menu_about:'About',
  home_intro:'A place to enter into the understanding of the Catholic faith, from the very first steps to the deepest questions.',
  home_domains_label:'The domains',
  home_explore:'Explore by theme',
  entry_one:'entry',
  entry_many:'entries',
  filter_all:'All',
  search_placeholder:'Search Lumen\u2026', search_hint:'Type a word to browse the articles.', search_empty:'No results for',
  empty:'This domain has no entry yet. Content is added over time.',
  about_surtitle:'The project',
  about_title:'About Lumen',
  context_library:'The library',
  footer_verse:'\u201CThe light shines in the darkness\u201D (John 1:5)',
  notfound_title:'Page not found',
  notfound_text:'This page does not exist.',
  notfound_back:'Back to home',
  about_p:[
    "Lumen is a place of study and meditation on the Catholic faith. Its aim is simple: to make theology accessible, faithful and alive, for the beginner who is discovering it and for the believer who wishes to go deeper.",
    "Each entry rests on the Scriptures, the tradition of the Church and the constant teaching of the Magisterium. Its form seeks sobriety, so that the truths may speak for themselves, without noise or clutter. Everything tends toward a single end: <em>\u201CYou will know the truth, and the truth will set you free.\u201D</em> <span class=\"ref\">John 8:32</span>",
    "The site grows slowly, entry after entry. What it holds never exhausts its subject: it opens a door, and invites one to go further."
  ]
};

/* clé = slug FR ; contenu rédigé avec slugs anglais dans les liens internes */
const ARTICLES_EN = {
'la-grace': {
  titre:'Grace',
  resume:'The free favour by which God gives man a share in his own life and makes him his child: the source from which sanctifying grace and actual grace flow.',
  contenu:`
      <p>Grace is the free favour by which God gives man a share in his own life and makes him his child. All that man receives in order to go to God, from the first call to eternal life, comes to him from this generosity. The word itself says its gratuity, for “grace” (from the Latin <em>gratia</em>, which renders the Greek <em>charis</em>) means a gift that nothing requires and nothing claims: <em>“From his fullness we have all received, grace upon grace.”</em> <span class="ref">John 1:16</span></p>
      <h2>A free gift</h2>
      <p>Grace is given without being owed. It precedes man and goes before him, answering to no merit: it is God who loves and gives first. Here lies its very nature, which nothing in man can earn: <em>“If it is by grace, it is no longer on the basis of works; otherwise grace would no longer be grace.”</em> <span class="ref">Romans 11:6</span></p>
      <h2>Necessary, and offered to all</h2>
      <p>Without grace, man can accomplish nothing that leads him to God: it is the beginning of all life with him and the support of the whole way, for no one draws near to God by his own strength: <em>“Without me you can do nothing.”</em> <span class="ref">John 15:5</span> And this grace God offers to every man, for he wills the <a href="#/article/salvation">salvation</a> of all: <em>“God wills that all men be saved and come to the knowledge of the truth.”</em> <span class="ref">1 Timothy 2:4</span></p>
      <h2>Given by Christ in the Spirit</h2>
      <p>Grace was fully manifested in Christ, who merited it for men by his <a href="#/article/the-cross-and-the-resurrection">death and resurrection</a>: <em>“The grace of God has appeared, bringing salvation to all men.”</em> <span class="ref">Titus 2:11</span> The <a href="#/article/the-holy-spirit">Holy Spirit</a> then pours it into hearts: <em>“The love of God has been poured into our hearts through the Holy Spirit who has been given to us.”</em> <span class="ref">Romans 5:5</span> One thus distinguishes uncreated grace, which is God himself giving himself in his Spirit, and created grace, the gift he places in the soul and that transforms it.</p>
      <h2>The forms of grace</h2>
      <p>This created grace appears under two principal modes. <a href="#/article/sanctifying-grace">Sanctifying grace</a> is the permanent gift that establishes man in the state of a child of God and abides in him. <a href="#/article/actual-grace">Actual grace</a> is the passing help that God grants to accomplish a good act, then renews according to need. To these two modes are added the graces proper to each sacrament, the charisms (gifts granted to one for the good of all) and the graces attached to a vocation. All are the same generosity of God, received in diverse ways.</p>
      <h2>From grace to glory</h2>
      <p>The grace received in time is the beginning of the life that God will give in eternity. What it inaugurates here below is fulfilled in the vision of God, where the gift attains its fullness: <em>“The Lord bestows grace and glory.”</em> <span class="ref">Psalm 84:12</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-bapteme': {
  titre:'Baptism',
  resume:'The first door of the Christian life: rebirth through water and the Spirit, which wipes away sin and brings one into the Body of Christ.',
  contenu:`
      <p>Baptism is the first of the <a href="#/article/the-sacraments">sacraments</a> and the door to all the others. Through it, man is born to a new life, becomes a child of God, a member of Christ and of the <a href="#/article/the-church">Church</a>. It is a new birth: by natural birth, man receives human life; by baptism, he receives divine life, a sharing in the very life of God, what is called <a href="#/article/sanctifying-grace">sanctifying grace</a>.</p>
      <p>Christ revealed its necessity to Nicodemus, who came to question him by night: <em>\u201CTruly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.\u201D</em> <span class="ref">John 3:5</span></p>
      <p>Before ascending to heaven, he made it the command addressed to the Church for all time: <em>\u201CGo, and make disciples of all nations, baptising them in the name of the Father and of the Son and of the Holy Spirit.\u201D</em> <span class="ref">Matthew 28:19</span></p>
      <h2>What baptism works</h2>
      <p>Baptism wipes away all sin. It remits <a href="#/article/original-sin">original sin</a>, handed on to all humanity since the fall, and, in one who receives it after the <a href="#/article/the-age-of-reason">age of reason</a>, the whole of his personal sins. The soul comes forth entirely purified, washed of every debt before God.</p>
      <p>It gives still more than a pardon: a new life. The baptised is reborn as a son in the Son, receives this sanctifying grace and becomes a temple of the Holy Spirit. Saint Paul describes this plunging as a <a href="#/article/the-cross-and-the-resurrection">death and a resurrection</a> with Christ: <em>\u201CBy baptism we were buried with him into death, so that, as Christ was raised from the dead, we too might walk in newness of life.\u201D</em> <span class="ref">Romans 6:4</span></p>
      <h2>The sign and its necessity</h2>
      <p>The sacrament is brought about by a simple gesture and precise words: water poured on the forehead or immersion, together with the formula \u201CI baptise you in the name of the Father and of the Son and of the Holy Spirit.\u201D Water carries the twofold sense of the sacrament: it washes and it gives life.</p>
      <p>Baptism imprints on the soul an indelible mark, a seal that configures one to Christ for ever (Ephesians 1:13). It is received only once. Incorporated into Christ, the baptised puts on his very life: <em>\u201CAs many of you as were baptised into Christ have put on Christ.\u201D</em> <span class="ref">Galatians 3:27</span></p>
      <p>The Church holds baptism to be necessary for <a href="#/article/salvation">salvation</a>, according to the word of the Lord. For those who die without having received it, the <a href="#/article/baptism-of-desire">baptism of desire or of blood</a> can supply for water. She <a href="#/article/infant-baptism">baptises little children</a> to open this <a href="#/article/grace">grace</a> to them at the very threshold of their life, confident that the gift of God always precedes the response of man.</p>
      <div class="fin-article">\u2726</div>
    `
},
'la-grace-sanctifiante': {
  titre:'Sanctifying Grace',
  resume:'The created gift by which God lets the soul share in his own life, makes it his child, and disposes it for heaven.',
  contenu:`
      <p>Sanctifying grace is a gift that God infuses into the soul and that remains there permanently. It transforms man in depth and establishes him in a new condition, that of a child of God: he becomes holy before him, pleasing in his eyes, able to live by the very life of God.</p>
      <p>Saint Peter gives its highest formula, that of a man raised above his natural condition: <em>\u201CHe has granted us to become partakers of the divine nature.\u201D</em> <span class="ref">2 Peter 1:4</span></p>
      <h2>A sharing in the life of God</h2>
      <p>Sanctifying grace differs from every natural gift. It raises man to a new order, that of divine life, and makes him a child of God in the proper sense, born of him by adoption: <em>\u201CTo all who received him, he gave power to become children of God.\u201D</em> <span class="ref">John 1:12</span></p>
      <p>The baptised receives the Spirit of the Son, who turns him toward the Father and makes him heir of <a href="#/article/the-last-things">eternal life</a>: to see God face to face and to share for ever in the glory of Christ.</p>
      <h2>What it produces in the soul</h2>
      <p>With sanctifying grace, God himself comes to dwell in the soul. The <a href="#/article/the-trinity">Trinity</a> makes its home there, and the love of God is poured out in it through the Holy Spirit: <em>\u201CIf anyone loves me, he will keep my word, and my Father will love him, and we will come to him and make our home with him.\u201D</em> <span class="ref">John 14:23</span></p>
      <p>With it are infused the <a href="#/article/the-theological-virtues">theological virtues</a>, faith, hope and charity, together with the gifts of the Holy Spirit. The soul receives the means to know, to hope in and to love God in a way that surpasses its own powers: <em>\u201CThe love of God has been poured into our hearts through the Holy Spirit who has been given to us.\u201D</em> <span class="ref">Romans 5:5</span></p>
      <h2>Received, increased, lost, restored</h2>
      <p>Sanctifying grace is received for the first time at <a href="#/article/baptism">baptism</a>. It then grows through the sacraments, prayer and works of charity, which cause it to increase in the soul. Mortal sin causes its loss, and the soul recovers it through the sacrament of penance, which fully restores it.</p>
      <p>It is distinguished from <a href="#/article/actual-grace">actual grace</a>, which is a passing help from God to accomplish a particular act, the awakening of a good thought, the strength of a right choice. Actual grace helps one to act; sanctifying grace transforms one's very being, and makes man a child of God.</p>
      <div class="fin-article">\u2726</div>
    `
},
'la-paix-du-christ': {
  titre:'The Peace of Christ',
  resume:'The peace Christ gives by reconciling man with God, born of the Cross, and which abides in the heart of trial.',
  contenu:`
      <p>The peace of Christ is the gift he makes to his own by reconciling them with God: the deep tranquillity of a soul restored to communion with its Creator. Christ leaves it to his disciples on the evening of his life, as an inheritance: <em>\u201CPeace I leave with you, my peace I give to you; not as the world gives do I give to you.\u201D</em> <span class="ref">John 14:27</span></p>
      <h2>A peace born of the Cross</h2>
      <p>This peace has a foundation: the reconciliation accomplished by <a href="#/article/the-cross-and-the-resurrection">Christ on the Cross</a>. By his death, he restored the accord between God and men that sin had broken: <em>\u201CThrough him he willed to reconcile all things, making peace by the blood of his cross.\u201D</em> <span class="ref">Colossians 1:20</span></p>
      <p>Christ is himself this peace, in his person which unites God and man: <em>\u201CHe himself is our peace.\u201D</em> <span class="ref">Ephesians 2:14</span> Whoever is united to him by faith enters into this recovered accord: <em>\u201CJustified by faith, we have peace with God through our Lord Jesus Christ.\u201D</em> <span class="ref">Romans 5:1</span></p>
      <h2>A peace that abides in trial</h2>
      <p>This peace dwells in the heart in the very midst of trials, for it rests on the presence of Christ and remains when all around is shaken: <em>\u201CIn the world you will have tribulations; but take courage, I have overcome the world.\u201D</em> <span class="ref">John 16:33</span></p>
      <p>Received in prayer, it guards the heart and surpasses what the mind can grasp: <em>\u201CThe peace of God, which surpasses all understanding, will keep your hearts and your minds in Christ Jesus.\u201D</em> <span class="ref">Philippians 4:7</span></p>
      <h2>The gift of the Risen One, the fruit of the Spirit</h2>
      <p>On Easter morning, the first word of the risen Christ to his disciples is a gift of peace: <em>\u201CPeace be with you.\u201D</em> <span class="ref">John 20:19</span> This peace then spreads in the soul as a fruit of the <a href="#/article/the-holy-spirit">Holy Spirit</a>: <em>\u201CThe fruit of the Spirit is love, joy, peace.\u201D</em> <span class="ref">Galatians 5:22</span></p>
      <p>Whoever receives it is sent to carry it to others, and this mission makes him resemble God: <em>\u201CBlessed are the peacemakers, for they shall be called sons of God.\u201D</em> <span class="ref">Matthew 5:9</span> It is this peace that the <a href="#/article/the-church">Church</a> passes on at every Mass, when the faithful exchange the sign of peace before communing in Christ.</p>
      <div class="fin-article">\u2726</div>
    `
},
'les-vertus-theologales': {
  titre:'The Theological Virtues',
  resume:'The three virtues infused by God, faith, hope and charity, which make man able to live in relationship with him.',
  contenu:`
      <p>The theological virtues are three dispositions that God infuses into the soul: faith, hope and charity. They are called “theological” because they have God for their origin, their motive and their object: it is he who gives them, it is for his sake that one exercises them, and it is he whom they attain. Received with <a href="#/article/sanctifying-grace">sanctifying grace</a>, they make man capable of living in relation with the <a href="#/article/the-trinity">Trinity</a>. Saint Paul names them together and points out the greatest: <em>“So now faith, hope and charity remain, these three; but the greatest of these is charity.”</em> <span class="ref">1 Corinthians 13:13</span></p>
      <h2>Virtues that God infuses</h2>
      <p>A virtue is a stable disposition to act well. Human virtues are acquired by exercise: by dint of just or courageous acts, man takes within himself the bent of the good, and so forms the so-called cardinal virtues (from cardo, the hinge), prudence, justice, fortitude and temperance, on which the moral life turns. The theological virtues are not acquired in this way: they attain God himself, who surpasses every created nature, and no exercise could produce them. It is God who places them in the soul, together with sanctifying grace: for this reason they are called infused. They belong to a supernatural order, that is, to the proper life of God, in which he makes man share: <em>“He has granted us to become partakers of the divine nature.”</em> <span class="ref">2 Peter 1:4</span></p>
      <h2>Three, for the three movements toward God</h2>
      <p>God is the end that man does not yet possess. To be united to such a good, one must first know it, then tend toward it in the expectation of attaining it, and finally be united to it by love. To these three movements the three virtues correspond: <a href="#/article/faith">faith</a> knows God, <a href="#/article/hope">hope</a> desires him, <a href="#/article/charity">charity</a> loves him and is united to him. Faith comes first, for one neither hopes for nor loves a good one does not know; hope rests upon it; charity crowns them and gives them their fulfillment, ordering them all to God. This is why it is the greatest. And while faith and hope will be fulfilled in heaven, the one in vision, the other in possession, charity will never pass away: it remains forever.</p>
      <h2>Faith</h2>
      <p>By faith, man believes in God and holds for true all that he has revealed, because God is truth itself. It clings to what it does not see, on the word of the one who cannot deceive: <em>“Faith is the assurance of things hoped for, the proof of realities not seen.”</em> <span class="ref">Hebrews 11:1</span></p>
      <h2>Hope</h2>
      <p>By hope, man desires the Kingdom of heaven and eternal life as his happiness, placing his confidence in the promises of Christ and relying on the help of the Holy Spirit. It keeps the soul turned toward the promised good and sustains it to the end: <em>“For in hope we were saved.”</em> <span class="ref">Romans 8:24</span></p>
      <h2>Charity</h2>
      <p>By charity, man loves God above all things, because he is the sovereign good, and his neighbor as himself for the love of God. Christ made it the great commandment: <em>“You shall love the Lord your God with all your heart, and your neighbor as yourself.”</em> <span class="ref">Matthew 22:37-39</span> It gives the other virtues their form and binds them all into a single life turned toward God: <em>“Above all, put on charity, which is the bond of perfection.”</em> <span class="ref">Colossians 3:14</span></p>
      <div class="fin-article">✦</div>
    `
},
'la-foi': {
  titre:'Faith',
  resume:'The first of the theological virtues: by it, man holds fast to God and holds true all that he has revealed, because God is truth itself.',
  contenu:`
      <p>Faith is the first of the <a href="#/article/the-theological-virtues">theological virtues</a>. By it, man holds fast to God and holds true all that he has revealed, because God is truth itself and can neither deceive nor be deceived. It rests on the authority of the one who reveals, and attains what it does not see, on the word of God who gives himself to be known: <em>\u201CFaith is the assurance of things hoped for, the conviction of things not seen.\u201D</em> <span class="ref">Hebrews 11:1</span></p>
      <h2>A gift received from God</h2>
      <p>Faith is a gift that God infuses into the soul together with <a href="#/article/sanctifying-grace">sanctifying grace</a>. It surpasses the powers of reason left to itself, for it attains truths that the human mind cannot discover on its own. It is God who draws the heart and opens it to his word: <em>\u201CNo one can come to me unless the Father who sent me draws him.\u201D</em> <span class="ref">John 6:44</span></p>
      <p>Received by pure goodness, it is offered to all and welcomed in freedom. Saint Paul traces its origin to grace: <em>\u201CBy grace you have been saved through faith; and this is not your own doing, it is the gift of God.\u201D</em> <span class="ref">Ephesians 2:8</span></p>
      <h2>To believe God and to believe in God</h2>
      <p>To believe is to hold true what God says because it is he who says it, and to entrust oneself wholly to him. The intellect recognises the revealed truth, and the will, moved by grace, freely consents to it. This adherence is born of hearing the word proclaimed: <em>\u201CFaith comes from what is heard, and what is heard comes from the word of Christ.\u201D</em> <span class="ref">Romans 10:17</span></p>
      <p>Abraham is its model. Called by God, he sets out toward a land he does not know and entrusts himself to the promise on the sole word of the one who makes it: <em>\u201CAbraham believed God, and it was counted to him as righteousness.\u201D</em> <span class="ref">Romans 4:3</span> He thus becomes the father of all believers.</p>
      <h2>A faith that works through charity</h2>
      <p>Faith receives its full life from <a href="#/article/charity">charity</a>, which puts it into action. United to the love of God, it is expressed in deeds and bears fruit. Saint James shows its measure: <em>\u201CFaith, if it has no works, is dead in itself.\u201D</em> <span class="ref">James 2:17</span></p>
      <p>Saint Paul names what gives it its worth before God: <em>\u201CWhat counts is faith working through charity.\u201D</em> <span class="ref">Galatians 5:6</span> Such a faith is also confessed with the lips and stands firm in trial, carrying outward the witness of what the heart holds true.</p>
      <h2>The necessity of faith</h2>
      <p>Faith is necessary for <a href="#/article/salvation">salvation</a>. It is the beginning of life with God and the foundation of all that follows, for one draws near to him by believing that he is and that he rewards those who seek him: <em>\u201CWithout faith it is impossible to please God.\u201D</em> <span class="ref">Hebrews 11:6</span></p>
      <p>Christ joined it to baptism as the way of salvation offered to all: <em>\u201CWhoever believes and is baptised will be saved.\u201D</em> <span class="ref">Mark 16:16</span> Kept and nourished by prayer, the hearing of the word and the sacraments, faith grows until the day it is fulfilled in vision, when man will see God as he is: <em>\u201CNow we see through a mirror, dimly, but then face to face.\u201D</em> <span class="ref">1 Corinthians 13:12</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'l-esperance': {
  titre:'Hope',
  resume:'The second of the theological virtues: by it, man desires eternal life as his happiness and awaits with confidence the goods God has promised.',
  contenu:`
      <p>Hope is the second of the <a href="#/article/the-theological-virtues">theological virtues</a>. By it, man desires the Kingdom of heaven and <a href="#/article/the-last-things">eternal life</a> as his happiness, and awaits from God, with firm confidence, that he will grant him to attain it. It keeps the soul turned toward the promised good and makes it advance toward him: <em>\u201CFor in this hope we were saved.\u201D</em> <span class="ref">Romans 8:24</span></p>
      <h2>An expectation founded on God's promise</h2>
      <p>Hope rests on the faithfulness of God, who always keeps his word. It relies on the promises of Christ and on his victory, by which heaven is now opened to man. Its foundation is sure, for the one who promised is worthy of faith: <em>\u201CLet us hold fast the confession of our hope, for he who promised is faithful.\u201D</em> <span class="ref">Hebrews 10:23</span></p>
      <p>It clings to goods still to come and unseen, and it is in this waiting that it unfolds its strength: <em>\u201CHope that is seen is no longer hope: for who hopes for what he sees?\u201D</em> <span class="ref">Romans 8:24</span></p>
      <h2>A reliance on grace, not on one's own strength</h2>
      <p>Man does not attain eternal life by his own strength alone. Hope places its confidence in the help of the <a href="#/article/the-holy-spirit">Holy Spirit</a>, who sustains the desire and grants one to advance toward the goal. It awaits everything from the goodness of God: pardon, perseverance, and the promised happiness: <em>\u201CMay the God of hope fill you with all joy and peace in believing, so that you may abound in hope by the power of the Holy Spirit.\u201D</em> <span class="ref">Romans 15:13</span></p>
      <h2>An anchor in trial</h2>
      <p>Hope holds the soul firm in the midst of trials, for it is fixed in God himself, whom nothing shakes. It is to the soul what the anchor is to the ship: <em>\u201CWe hold it as an anchor of the soul, sure and steadfast.\u201D</em> <span class="ref">Hebrews 6:19</span></p>
      <p>Far from weakening before suffering, it grows firm in it, because trial endured with God produces constancy, and constancy strengthens hope: <em>\u201CSuffering produces perseverance, perseverance a tested virtue, and this virtue hope; and hope does not disappoint.\u201D</em> <span class="ref">Romans 5:3-5</span></p>
      <h2>Its fulfilment</h2>
      <p>Hope is fulfilled in the possession of the awaited good. When man sees God face to face and holds him for ever, waiting will give way to joy, and hope to full possession: <em>\u201CNow to see what one hopes for is no longer to hope.\u201D</em> <span class="ref">Romans 8:24</span> Of these three virtues, <a href="#/article/faith">faith</a> and hope will thus pass away in heaven, while <a href="#/article/charity">charity</a> abides for ever.</p>
      <div class="fin-article">\u2726</div>
    `
},
'la-charite': {
  titre:'Charity',
  resume:'The greatest of the theological virtues: by it, man loves God above all things, because he is the supreme good, and his neighbour as himself for the love of God.',
  contenu:`
      <p>Charity is the greatest of the <a href="#/article/the-theological-virtues">theological virtues</a>. By it, man loves God above all things, because he is the supreme good, and his neighbour as himself for the love of God. It unites man to God in a single movement that also embraces all that God loves. Christ made it the first of all the commandments: <em>\u201CYou shall love the Lord your God with all your heart, and your neighbour as yourself.\u201D</em> <span class="ref">Matthew 22:37-39</span></p>
      <h2>A love poured into the heart</h2>
      <p>Charity is a gift that God infuses into the soul together with <a href="#/article/sanctifying-grace">sanctifying grace</a>. It comes from God, who loves first and places in the heart of man the power to love him in return: <em>\u201CThe love of God has been poured into our hearts through the <a href="#/article/the-holy-spirit">Holy Spirit</a> who has been given to us.\u201D</em> <span class="ref">Romans 5:5</span></p>
      <p>Man then loves with a love that surpasses him, sharing in the very love with which God loves us: <em>\u201CLet us love, because he first loved us.\u201D</em> <span class="ref">1 John 4:19</span></p>
      <h2>To love God, to love one's neighbour</h2>
      <p>The love of God and the love of neighbour form one single charity, for one loves one's neighbour for God and in God. The one is the measure and the proof of the other: <em>\u201CWhoever does not love his brother, whom he sees, cannot love God, whom he does not see.\u201D</em> <span class="ref">1 John 4:20</span></p>
      <p>Christ gave the measure of this love by handing over his very self, and made it the sign by which his own are known: <em>\u201CLove one another as I have loved you. By this all will know that you are my disciples.\u201D</em> <span class="ref">John 13:34-35</span></p>
      <h2>The form of all the virtues</h2>
      <p>Charity gives the other virtues their completion and animates them from within, ordering them all toward God. Without it, the greatest works remain empty before him: <em>\u201CIf I give away all my goods, but have not love, it profits me nothing.\u201D</em> <span class="ref">1 Corinthians 13:3</span></p>
      <p>It binds together the whole Christian life and brings it to its perfection: <em>\u201CAbove all, put on love, which is the bond of perfection.\u201D</em> <span class="ref">Colossians 3:14</span></p>
      <h2>The greatest, and that which abides</h2>
      <p>Charity surpasses <a href="#/article/faith">faith</a> and <a href="#/article/hope">hope</a>, because it attains God himself and abides when the other two reach their end. In heaven, faith will give way to vision and hope to possession; charity, however, will never pass away: <em>\u201CLove never ends.\u201D</em> <span class="ref">1 Corinthians 13:8</span></p>
      <p>Saint Paul names it the greatest of the three and the summit of all life with God: <em>\u201CSo now faith, hope and charity abide, these three; but the greatest of these is charity.\u201D</em> <span class="ref">1 Corinthians 13:13</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'la-grace-actuelle': {
  titre:'Actual Grace',
  resume:'The passing help God gives the soul to do good, enlightening the mind and strengthening the will toward salvation.',
  contenu:`
      <p>Actual grace is a help that God grants the soul to accomplish a good act: it enlightens the intellect and strengthens the will toward an action that leads to <a href="#/article/salvation">salvation</a>. Like all <a href="#/article/grace">grace</a>, it is given freely and offered to every man; what is proper to it is to act in the moment, the time of a choice or a movement of the heart, then to renew itself according to need. God is its source and acts first: <em>“It is God who works in you both to will and to act, according to his good purpose.”</em> <span class="ref">Philippians 2:13</span></p>
      <h2>A help to act</h2>
      <p>Actual grace makes possible the act that leads to God, and first of all the very first: the movement by which man turns toward Christ does not come from himself alone, but from the grace that goes before him: <em>“No one can say ‘Jesus is Lord’ except by the Holy Spirit.”</em> <span class="ref">1 Corinthians 12:3</span></p>
      <h2>Prevenient and cooperating</h2>
      <p>Actual grace precedes the act and accompanies it. Prevenient, it goes before man to awaken in him the desire for good; cooperating, it sustains him while he acts, so that he accomplishes with it what it has begun in him. Man then truly acts, carried by God, and his work is at once a gift of God and an act of man: <em>“By the grace of God I am what I am, and his grace toward me was not in vain.”</em> <span class="ref">1 Corinthians 15:10</span></p>
      <h2>Renewed until completion</h2>
      <p>God does not give this help once for all: he renews it at every step, sustaining man through time and carrying him to the end. The work begun in him, God himself brings to completion: <em>“He who began a good work in you will bring it to completion at the day of Christ Jesus.”</em> <span class="ref">Philippians 1:6</span></p>
      <h2>Asked for in prayer</h2>
      <p>Man calls for this help in prayer, when he asks for the strength to hold fast in trial and not to give way: <em>“Watch and pray, that you may not enter into temptation: the spirit is willing, but the flesh is weak.”</em> <span class="ref">Matthew 26:41</span></p>
      <h2>Received in freedom</h2>
      <p>This help respects the freedom it moves. God touches the soul without forcing it, and man can consent to grace or withdraw from it: <em>“Today, if you hear his voice, do not harden your hearts.”</em> <span class="ref">Hebrews 3:15</span> Received and followed, actual grace leads the sinner to conversion and disposes him to receive or to recover <a href="#/article/sanctifying-grace">sanctifying grace</a>, which makes him a child of God.</p>
      <div class="fin-article">✦</div>
    `
},
'l-eglise': {
  titre:'The Church',
  resume:'The assembly God gathers in Christ to form one People: the Body of Christ, animated by the Holy Spirit, and the means of salvation offered to all.',
  contenu:`
      <p>The Church is the assembly of those whom God calls and gathers in Christ to form one People. She unites believers in one same faith, one baptism and one life received from God, and joins them to Christ as to their head. Christ himself founded her and promised her to endure until the end: <em>\u201CYou are Peter, and on this rock I will build my Church, and the gates of hell shall not prevail against her.\u201D</em> <span class="ref">Matthew 16:18</span></p>
      <h2>Founded by Christ</h2>
      <p>The Church is born of Christ. He gathers her during his life, establishes her on <a href="#/article/the-primacy-of-peter">Peter</a> and the apostles, and makes her rest on himself as on her cornerstone: <em>\u201CYou are built upon the foundation of the apostles, Christ Jesus himself being the cornerstone.\u201D</em> <span class="ref">Ephesians 2:20</span></p>
      <p>On the day of Pentecost, the <a href="#/article/the-holy-spirit">Holy Spirit</a> descends upon the apostles and grants the Church to enter the world. From that day, she proclaims the Gospel and welcomes those who believe through <a href="#/article/baptism">baptism</a>: <em>\u201CThe Lord added to the Church each day those who were being saved.\u201D</em> <span class="ref">Acts 2:47</span></p>
      <h2>The Body of Christ</h2>
      <p>The Church is the Body of Christ. Christ is its head, and the baptised are its members: joined to him and to one another, they receive their life from him and together form one body animated by one Spirit: <em>\u201CYou are the body of Christ, and individually members of it.\u201D</em> <span class="ref">1 Corinthians 12:27</span></p>
      <p>It is from the head that the whole body holds its growth and its unity: <em>\u201CHe is the head of the body, the Church.\u201D</em> <span class="ref">Colossians 1:18</span> This People gathered by God is consecrated to his service and called to make him known: <em>\u201CYou are a chosen race, a royal priesthood, a holy nation, a people for his own possession.\u201D</em> <span class="ref">1 Peter 2:9</span></p>
      <h2>One, holy, catholic and apostolic</h2>
      <p>The Church bears four marks by which she is recognised, professed in the Creed. She is one: a single body, in one same faith, the same sacraments and communion under the successor of Peter, according to the prayer of Christ: <em>\u201CThat they may all be one, so that the world may believe that you sent me.\u201D</em> <span class="ref">John 17:21</span> She is holy because Christ loved her and gave himself for her; he sanctifies her and gives her the means to lead her members to holiness: <em>\u201CChrist loved the Church: he gave himself up for her, in order to sanctify her.\u201D</em> <span class="ref">Ephesians 5:25-26</span></p>
      <p>She is catholic, that is, universal: sent to all peoples and all times, she carries <a href="#/article/salvation">salvation</a> to the whole world: <em>\u201CGo, and make disciples of all nations.\u201D</em> <span class="ref">Matthew 28:19</span> She is apostolic: she keeps the faith received from the apostles, and the bishops, united to the Pope, succeed them in handing it on faithfully until the end of time.</p>
      <h2>Sacrament of salvation</h2>
      <p>The Church is the instrument by which Christ gives men the salvation he won. She is like a mother who gives birth to divine life through baptism and nourishes it through the sacraments and the word of God. In her, men receive what Christ entrusted to his Church for all.</p>
      <p>She is necessary for salvation, for Christ willed that one come to him through her, and all salvation flows from him through his body. Turned toward her fulfilment, she journeys toward the day when God will be all in all, when she will be fully united to Christ in glory: <em>\u201CI saw the holy city, the new Jerusalem, prepared as a bride adorned for her husband.\u201D</em> <span class="ref">Revelation 21:2</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'la-trinite': {
  titre:'The Trinity',
  resume:'The central mystery of the faith: one God in three Persons, the Father, the Son and the Holy Spirit, equal and eternal, in one divine life.',
  contenu:`
      <p>The Trinity is the central mystery of the Christian faith: there is one God in three Persons, the Father, the Son and the Holy Spirit. The three are one and the same God, equal and eternal, sharing one divine life. This mystery surpasses the powers of reason; it is known because God revealed it, making himself known as he is. Saint Paul names the three together in his blessing: <em>\u201CMay the grace of the Lord Jesus Christ, the love of God, and the communion of the Holy Spirit be with you all.\u201D</em> <span class="ref">2 Corinthians 13:13</span></p>
      <h2>One God</h2>
      <p>There is only one God, one divine nature, what God is. The faith received from Israel holds this unity as the first of all, and confesses it as the foundation of all the rest: <em>\u201CHear, O Israel: the Lord our God, the Lord is one.\u201D</em> <span class="ref">Deuteronomy 6:4</span></p>
      <p>The Father, the Son and the Holy Spirit are the one God. Each is wholly God, possessing the same and only divine nature, without dividing it or multiplying it.</p>
      <h2>Three Persons</h2>
      <p>In this one God, there are three Persons, that is, three distinct \u201Csomeones\u201D, each of whom is fully God. <a href="#/article/the-father">The Father</a> is the source without origin. <a href="#/article/the-son">The Son</a> is begotten of the Father from all eternity: he receives the divine life from him as a son receives it from his father, and he is the <a href="#/article/the-word">Word</a> by whom all things were made: <em>\u201CIn the beginning was the Word, and the Word was with God, and the Word was God.\u201D</em> <span class="ref">John 1:1</span></p>
      <p><a href="#/article/the-holy-spirit">The Holy Spirit</a> proceeds from the Father and the Son as the love that unites them. The three Persons are equal in dignity and coeternal. The Son speaks of his unity with the Father: <em>\u201CThe Father and I are one.\u201D</em> <span class="ref">John 10:30</span></p>
      <h2>Distinct by their relations</h2>
      <p>The three Persons are distinguished by their relations of origin, and by these alone. The Father begets, the Son is begotten, the Spirit proceeds: this is all that separates them, and it suffices to make them truly distinct, while remaining the one God. All that they are, they are together, except for what the relation distinguishes. Scripture shows the Spirit proceeding from the Father, and sent by the Son: <em>\u201CWhen the Defender comes, whom I will send to you from the Father, the Spirit of truth who proceeds from the Father.\u201D</em> <span class="ref">John 15:26</span> The Son has part in this origin, for the Spirit receives from him what belongs to the Father: <em>\u201CHe will take what is mine; all that the Father has is mine.\u201D</em> <span class="ref">John 16:14-15</span> This is why the Church confesses that the Spirit proceeds from the Father and the Son.</p>
      <h2>Revealed by Christ</h2>
      <p>Christ revealed this mystery hidden in God. In coming among men, the Son made the Father known and promised the Spirit. At the moment of his baptism in the Jordan, the three are manifested together: the Son in the water, the Spirit as a dove, the Father by his voice: <em>\u201CHe saw the Spirit of God descending like a dove and coming upon him, and a voice from heaven said: This is my beloved Son.\u201D</em> <span class="ref">Matthew 3:16-17</span></p>
      <h2>A communion of love</h2>
      <p>The inner life of God is an exchange of love among the three Persons, given and received without end. This love is what God is: <em>\u201CGod is love.\u201D</em> <span class="ref">1 John 4:8</span></p>
      <p>Through <a href="#/article/sanctifying-grace">sanctifying grace</a>, God brings man into this life: the Trinity comes to dwell in the soul of the baptised and associates him to its own communion. The end of man is to share for ever in this love: <em>\u201CIf anyone loves me, he will keep my word, and my Father will love him, and we will come to him and make our home with him.\u201D</em> <span class="ref">John 14:23</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'le-pere': {
  titre:'The Father',
  resume:'The first Person of the Trinity: the origin without origin, creator of all things, revealed by the Son, and the Father who adopts men as his children.',
  contenu:`
      <p>The Father is the first Person of the <a href="#/article/the-trinity">Trinity</a>. He is the origin without origin: himself without beginning, he is the source from whom the <a href="#/article/the-son">Son</a> and the Spirit come. Everything proceeds from him, in the life of God as in creation. Saint Paul confesses him as the principle of all things: <em>\u201CFor us there is one God, the Father, from whom are all things and for whom we exist.\u201D</em> <span class="ref">1 Corinthians 8:6</span></p>
      <h2>The Creator of all things</h2>
      <p>The one God creates heaven and earth, and the Creed refers this work to the Father first, because he is the origin of all. He calls the world into being by his word alone, and holds it in life at every moment: <em>\u201CIn the beginning, God created the heavens and the earth.\u201D</em> <span class="ref">Genesis 1:1</span></p>
      <p>The Father watches over what he has made with an attentive providence, down to the smallest detail. Christ teaches this confidence toward him: <em>\u201CNot one sparrow falls to the ground apart from your Father.\u201D</em> <span class="ref">Matthew 10:29</span></p>
      <h2>Source within the Trinity</h2>
      <p>In the very life of God, the Father is the source of the two other Persons. He begets the Son from all eternity, communicating to him the divine life he possesses, and the <a href="#/article/the-holy-spirit">Spirit</a> proceeds from him and from the Son. The Father grants the Son to have life in himself as he himself possesses it: <em>\u201CAs the Father has life in himself, so he has granted the Son to have life in himself.\u201D</em> <span class="ref">John 5:26</span></p>
      <h2>Revealed by the Son</h2>
      <p>The Father makes himself known through the Son, who alone knows him perfectly and reveals him to men: <em>\u201CNo one knows the Father except the Son, and anyone to whom the Son chooses to reveal him.\u201D</em> <span class="ref">Matthew 11:27</span></p>
      <p>In seeing the Son, one sees the Father, for the Son is his perfect image and acts in all things as he does: <em>\u201CWhoever has seen me has seen the Father.\u201D</em> <span class="ref">John 14:9</span></p>
      <h2>Our Father</h2>
      <p>The Father is Father of the only Son from all eternity, and he becomes the Father of men by adopting them. Through the grace received in <a href="#/article/baptism">baptism</a>, the Spirit of the Son is given to the believer, who can then address God as his Father: <em>\u201CYou have received a Spirit of filial adoption, by which we cry: Abba, Father!\u201D</em> <span class="ref">Romans 8:15</span> This is why Christ taught his own to pray saying \u201COur Father.\u201D</p>
      <p>This Father welcomes the sinner who returns and goes out to meet him, as the father of the parable runs toward his lost son: <em>\u201CWhile he was still far off, his father saw him and was filled with compassion; he ran and threw his arms around him and kissed him.\u201D</em> <span class="ref">Luke 15:20</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'le-fils': {
  titre:'The Son',
  resume:'The second Person of the Trinity: the eternal Word begotten of the Father, true God, made man in Jesus Christ for the salvation of mankind.',
  contenu:`
      <p>The Son is the second Person of the <a href="#/article/the-trinity">Trinity</a>. He is the <a href="#/article/the-word">Word</a> of God, begotten of the <a href="#/article/the-father">Father</a> from all eternity, of the same nature as he: true God born of true God. The Father communicates to him all that he is, except being Father, so that the Son possesses the fullness of the divine life: <em>\u201CIn the beginning was the Word, and the Word was with God, and the Word was God.\u201D</em> <span class="ref">John 1:1</span></p>
      <h2>The Word by whom all things were made</h2>
      <p>The Father creates all things through the Son, his Word. The Son is the perfect image of the Father and the one in whom the world receives existence: <em>\u201CHe is the image of the invisible God, the firstborn of all creation; in him all things were created.\u201D</em> <span class="ref">Colossians 1:15-16</span></p>
      <h2>The Son made man</h2>
      <p>To save men, the Son took our nature: <a href="#/article/the-incarnation">he became man while remaining God</a>. Conceived by the Holy Spirit and born of the Virgin <a href="#/article/mary">Mary</a>, he is one and the same Son, true God and true man: <em>\u201CAnd the Word became flesh, and dwelt among us, and we have seen his glory.\u201D</em> <span class="ref">John 1:14</span></p>
      <p>In becoming man, the Son lowered himself to the condition of a servant, out of love and for our <a href="#/article/salvation">salvation</a>: <em>\u201CThough he was in the form of God, he emptied himself, taking the form of a servant.\u201D</em> <span class="ref">Philippians 2:6-7</span></p>
      <h2>Died and risen for us</h2>
      <p>The Son made man gave his life on the <a href="#/article/the-cross-and-the-resurrection">Cross</a> to reconcile men with God, bearing the weight of sin in their place. On the third day, he rose, victor over death, and his resurrection is the foundation of Christian hope: <em>\u201CChrist died for our sins according to the Scriptures, he was buried, and he rose on the third day.\u201D</em> <span class="ref">1 Corinthians 15:3-4</span></p>
      <h2>Lord and judge</h2>
      <p>Risen, the Son is raised in glory and is seated at the right hand of the Father, receiving the name that surpasses every name: <em>\u201CGod highly exalted him and gave him the name that is above every name.\u201D</em> <span class="ref">Philippians 2:9</span></p>
      <p>He will return in glory at the end of time to judge the living and the dead, and his reign will have no end. All creation is called to acknowledge him as Lord: <em>\u201CAt the name of Jesus every knee shall bow, in heaven, on earth and under the earth.\u201D</em> <span class="ref">Philippians 2:10</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'l-esprit-saint': {
  titre:'The Holy Spirit',
  resume:'The third Person of the Trinity: true God, the love of the Father and the Son, the Lord who gives life, poured out at Pentecost and present in the souls of the faithful.',
  contenu:`
      <p>The Holy Spirit is the third Person of the <a href="#/article/the-trinity">Trinity</a>. He proceeds from the <a href="#/article/the-father">Father</a> and the <a href="#/article/the-son">Son</a> as the love that unites them, and he is fully God, equal and coeternal with the Father and the Son. He is the Lord acting in the heart of men: <em>“The Lord is the Spirit; and where the Spirit of the Lord is, there is freedom.”</em> <span class="ref">2 Corinthians 3:17</span></p>
      <h2>Lord who gives life</h2>
      <p>The Holy Spirit is the source of life. Present from the beginning over creation, he also bears in man the new life of God, the life that Christ communicates to his own: <em>“It is the Spirit who gives life.”</em> <span class="ref">John 6:63</span> The Creed confesses him as Lord on the same level as the Father and the Son, and giver of all life.</p>
      <h2>He has spoken through the prophets</h2>
      <p>The Holy Spirit inspired the authors of the Scriptures and made the prophets speak in the name of God. It is he who, through the centuries, prepared the people to receive Christ and who makes the words of God living: <em>“Borne by the Holy Spirit, men spoke on behalf of God.”</em> <span class="ref">2 Peter 1:21</span></p>
      <h2>The Defender promised, poured out at Pentecost</h2>
      <p>Before his Passion, Christ promised the Spirit to his disciples under the name of Defender, or Consoler, the one who assists and sustains: <em>“I will pray the Father, and he will give you another Defender, to remain with you for ever.”</em> <span class="ref">John 14:16</span> On the day of Pentecost, fifty days after Easter, the Spirit descends upon the disciples and gives birth to the <a href="#/article/the-church">Church</a> in the world: <em>“They were all filled with the Holy Spirit.”</em> <span class="ref">Acts 2:4</span> Since that day, he dwells in the Church and leads her into the truth: <em>“When he comes, the Spirit of truth, he will guide you into all the truth.”</em> <span class="ref">John 16:13</span></p>
      <h2>Present in the soul</h2>
      <p>The Holy Spirit dwells in the soul of the baptised through <a href="#/article/sanctifying-grace">sanctifying grace</a>. He pours into it the love of God and makes faith, hope and charity grow: <em>“The love of God has been poured into our hearts through the Holy Spirit who has been given to us.”</em> <span class="ref">Romans 5:5</span> He also sustains prayer, to the point of praying within man when he no longer knows what to say: <em>“The Spirit himself intercedes for us with sighs too deep for words.”</em> <span class="ref">Romans 8:26</span></p>
      <h2>His seven gifts</h2>
      <p>The Spirit fills the believer with his gifts, which make him docile to his action and strengthen him in the Christian life. The tradition of the Church numbers seven of them, according to the prophecy of Isaiah: wisdom, understanding, counsel, might, knowledge, piety and the fear of God: <em>“Upon him shall rest the Spirit of the Lord: a spirit of wisdom and understanding, a spirit of counsel and might, a spirit of knowledge and of the fear of the Lord.”</em> <span class="ref">Isaiah 11:2-3</span> Received at baptism, they are strengthened by <a href="#/article/confirmation">confirmation</a>, the sacrament that gives the Spirit in fullness.</p>
      <div class="fin-article">✦</div>
    `
},
'le-verbe': {
  titre:'The Word',
  resume:'The Son of God named as the eternal Word of the Father: his perfect expression, by whom all things were made, and who became flesh in Jesus Christ.',
  contenu:`
      <p>The Word is the name given to the <a href="#/article/the-son">Son</a> of God inasmuch as he is the eternal Word of the <a href="#/article/the-father">Father</a>. \u201CWord\u201D means \u201Cspeech\u201D: as a word wholly expresses the thought of the one who utters it, the Son wholly expresses what the Father is. This Word is a Person, and this Person is God: <em>\u201CIn the beginning was the Word, and the Word was with God, and the Word was God.\u201D</em> <span class="ref">John 1:1</span></p>
      <h2>Logos: word and reason</h2>
      <p>The prologue of the Gospel of John was written in Greek, and the word it uses is \u201CLogos\u201D (\u03BB\u03CC\u03B3\u03BF\u03C2). This word says at once speech and reason: it designates the word one utters, and also the intelligence and order expressed in it. To name the Son \u201CLogos\u201D is to confess him at once the Word that the Father utters and the Wisdom by which he thinks and orders the world.</p>
      <p>Greek thought already called \u201Clogos\u201D the reason that runs through and orders the universe. John takes up this word and reveals that this Logos is a Person, God himself, who became man.</p>
      <p>When the Bible was translated into Latin, \u201CLogos\u201D became \u201CVerbum\u201D, which means \u201Cword\u201D: <em>\u201CIn principio erat Verbum\u201D</em>, in the beginning was the Word. The English \u201CWord\u201D follows this Latin sense of speech; the richness of the Greek, which united speech and reason, remains in the faith of the Church: the Son is at once the Word and the Wisdom of the Father.</p>
      <h2>The eternal Word of the Father</h2>
      <p>The Father expresses himself in a single Word, perfect and unique, in whom he says all that he is. This Word abides in God from all eternity, living and personal. The Word is thus the perfect image of the Father, the one in whom the Father knows and gives himself: <em>\u201CHe is the radiance of his glory and the imprint of his being.\u201D</em> <span class="ref">Hebrews 1:3</span></p>
      <h2>By whom all things were made</h2>
      <p>God creates by speaking: he says, and it is. This creative word is the Word himself, by whom the Father calls all things into being and holds them in existence: <em>\u201CAll things were made through him, and nothing that exists was made without him.\u201D</em> <span class="ref">John 1:3</span></p>
      <h2>The Word became flesh</h2>
      <p>The eternal Word of God entered the world <a href="#/article/the-incarnation">by becoming man</a>. Invisible until then, it became visible, near and audible in Jesus Christ, true God and true man: <em>\u201CAnd the Word became flesh, and dwelt among us, and we have seen his glory.\u201D</em> <span class="ref">John 1:14</span> In him, the Word of God lets itself be seen, touched and heard.</p>
      <h2>The definitive Word of God</h2>
      <p>God spoke little by little, through the patriarchs and the prophets, until he said his last and greatest word in the Son. The Word made man is the definitive Word of God: in him, God has said all, and given all: <em>\u201CGod, who spoke long ago through the prophets, has spoken to us in these last days through the Son.\u201D</em> <span class="ref">Hebrews 1:1-2</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'l-immaculee-conception': {
  titre:'The Immaculate Conception',
  resume:'Mary preserved from original sin from the first instant of her conception, by a singular grace of God and in view of the merits of Christ: the first and most perfect of the redeemed.',
  contenu:`
      <p>The Immaculate Conception is the privilege by which <a href="#/article/mary">Mary</a> was preserved from <a href="#/article/original-sin">original sin</a> from the first instant of her existence. This privilege concerns the conception of Mary herself, in the womb of her mother: at the moment she began to exist, her soul was filled with grace and kept pure of every stain. The angel greets her by this name of grace before any other: <em>\u201CHail, full of grace, the Lord is with you.\u201D</em> <span class="ref">Luke 1:28</span> Where English says \u201Cfull of grace\u201D, the Greek carries a single word, kecharit\u014Dmen\u0113 (\u03BA\u03B5\u03C7\u03B1\u03C1\u03B9\u03C4\u03C9\u03BC\u03AD\u03BD\u03B7), which the angel uses in place of her name: it speaks of a grace already fully accomplished in Mary, and that abides.</p>
      <h2>Preserved from original sin</h2>
      <p>Since the fault of the origins, every man is born deprived of the <a href="#/article/sanctifying-grace">sanctifying grace</a> that God willed for humanity. This state of privation, handed on to all as an inheritance, is what is called original sin. Mary alone was preserved from it, kept unharmed from the first instant of her existence, filled with grace before she could even act. God had announced this total enmity between the woman and evil: <em>\u201CI will put enmity between you and the woman, between your offspring and her offspring.\u201D</em> <span class="ref">Genesis 3:15</span></p>
      <h2>Redeemed by Christ in a higher way</h2>
      <p>Mary too was saved by Christ. She was so in a way still more perfect than others: by preservation, in view of the merits of her Son applied in advance to the instant of her conception. She is thus the first and most perfect of the redeemed, and she herself acknowledges God as her Saviour: <em>\u201CMy spirit rejoices in God my Saviour.\u201D</em> <span class="ref">Luke 1:47</span></p>
      <h2>The new Eve</h2>
      <p>Full of grace and free of all sin, Mary gave God an entire consent on the day of the Annunciation. She is the <a href="#/article/the-new-adam-and-the-new-eve">new Eve</a>: by her yes, she opens to humanity the way of <a href="#/article/salvation">salvation</a> that the first fault had closed, and she welcomes within her the Saviour of the world: <em>\u201CI am the handmaid of the Lord; let it be done to me according to your word.\u201D</em> <span class="ref">Luke 1:38</span></p>
      <p>Preserved from sin at her origin, she remained so all her life: by the grace of God, she lived in a holiness without failing, wholly turned toward her Son.</p>
      <h2>Proclaimed by the Church</h2>
      <p>The Church believed from the earliest centuries in the unique holiness of Mary, and in 1854 she <a href="#/article/papal-infallibility">proclaimed</a> the Immaculate Conception as a dogma of faith, a revealed truth to be held firmly. Shortly after, during the apparitions of Lourdes, the Virgin named herself by these words: \u201CI am the Immaculate Conception.\u201D</p>
      <p>In her, the Church contemplates what the grace of God can accomplish and that to which all the redeemed are called. This is why all generations recognise her as blessed among all: <em>\u201CFrom now on all generations will call me blessed.\u201D</em> <span class="ref">Luke 1:48</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'marie': {
  titre:'Mary',
  resume:'The Virgin chosen by God to be the Mother of his Son: Mother of God, ever-Virgin, taken up into heaven, and given as mother to all believers.',
  contenu:`
      <p>Mary is the Virgin whom God chose to be the mother of his <a href="#/article/the-son">Son</a> made man. He prepared her for this mission by preserving her from sin from the first instant of her life, through the privilege of her <a href="#/article/the-immaculate-conception">Immaculate Conception</a>. On the day of the Annunciation, she gave God a free and entire consent, and it is through her that the Saviour entered the world: <em>\u201CWhen the fullness of time had come, God sent his Son, born of a woman.\u201D</em> <span class="ref">Galatians 4:4</span></p>
      <h2>Mother of God</h2>
      <p>Mary is truly Mother of God, for the one she conceived and bore is God, the eternal Son become man. A mother brings into the world someone, a person, not a nature; and the person she carried in her womb is God himself. This is why the Church confesses her \u201C<a href="#/article/mary-mother-of-god">Theotokos</a>\u201D, a Greek word that means \u201Cshe who gives birth to God.\u201D The child she brings into the world is God present among men: <em>\u201CHe will be called Emmanuel, which means: God with us.\u201D</em> <span class="ref">Matthew 1:23</span></p>
      <h2>Ever Virgin</h2>
      <p>Mary conceived her Son by the work of the <a href="#/article/the-holy-spirit">Holy Spirit</a>, without the concurrence of any man, and she remained a <a href="#/article/the-perpetual-virginity-of-mary">virgin before, during and after the birth</a>. Her virginity is the sign that this child comes wholly from God: <em>\u201CThe Holy Spirit will come upon you, and the power of the Most High will overshadow you.\u201D</em> <span class="ref">Luke 1:35</span></p>
      <h2>The new Ark</h2>
      <p>Mary is the <a href="#/article/the-new-ark">new Ark</a> of the covenant. The ark of old carried the signs of God's presence in the midst of his people; Mary carries in her womb this presence in person, the <a href="#/article/the-word">Word</a> made flesh. Elizabeth welcomes her as David had welcomed the ark, with the same cry of wonder: <em>\u201CHow is it granted me that the mother of my Lord should come to me?\u201D</em> <span class="ref">Luke 1:43</span></p>
      <h2>Taken up into heaven and Queen</h2>
      <p>At the end of her earthly life, Mary was taken up body and soul into the glory of heaven: this is what the Church calls the Assumption. Wholly united to her Son on earth, she already shares fully in his victory over death, and, associated to his reign, she is crowned <a href="#/article/queen-of-heaven">Queen of heaven</a>: <em>\u201CA great sign appeared in heaven: a woman clothed with the sun, a crown of twelve stars on her head.\u201D</em> <span class="ref">Revelation 12:1</span></p>
      <h2>Our mother</h2>
      <p>From the height of the Cross, Jesus entrusted his mother to the disciple he loved, and in him to all his disciples. Mary thus became the mother of all believers and the mother of the Church: <em>\u201CBehold your mother. And from that hour, the disciple took her into his home.\u201D</em> <span class="ref">John 19:26-27</span></p>
      <p>She watches over her children and intercedes for them with her Son, toward whom she always leads. At the wedding of Cana, she leaves the instruction that sums up all she teaches: <em>\u201CDo whatever he tells you.\u201D</em> <span class="ref">John 2:5</span></p>
      <div class="fin-article">\u2726</div>
    `
},
'la-nouvelle-arche': {
  titre:'The New Ark',
  resume:'Mary read as the Ark of the new covenant: she carries within her the presence of God, the Word made flesh, which the ark of old foreshadowed.',
  contenu:`
      <p>The ark of the covenant was the holiest object of Israel: a chest covered with gold where God made himself present in the midst of his people, and before which one stood with awe and joy. The faith of the Church recognises in <a href="#/article/mary">Mary</a> the new Ark: she carries within her the presence of God in person, the <a href="#/article/the-word">Word</a> made flesh. In him, God came to dwell among men: <em>\u201CThe Word became flesh, and dwelt among us.\u201D</em> <span class="ref">John 1:14</span></p>
      <h2>What the ark carried</h2>
      <p>The ark held three signs of the covenant: the tables of the Law, the word of God engraved in stone; a portion of manna, the bread come from heaven; and the staff of Aaron, the mark of the priesthood: <em>\u201CIn the ark were the golden urn holding the manna, the staff of Aaron, and the tables of the covenant.\u201D</em> <span class="ref">Hebrews 9:4</span></p>
      <p>Mary carries the reality that these three signs foreshadowed. She carries the Word, the living Word of God; she carries the true bread of life; she carries the eternal priest who will offer himself for the world. What the ark held in figure, Mary gives in person.</p>
      <h2>The shadow of the cloud</h2>
      <p>One same Greek word links the ancient Dwelling and Mary. When the Dwelling of Israel was completed, the cloud covered it and the glory of God filled it: <em>\u201CThe cloud covered the tent of meeting, and the glory of the Lord filled the Dwelling.\u201D</em> <span class="ref">Exodus 40:34-35</span> In the Greek version of the Old Testament (the Septuagint), the verb that names this cloud is \u201Cepiskiaz\u014D\u201D (\u1F10\u03C0\u03B9\u03C3\u03BA\u03B9\u03AC\u03B6\u03C9), \u201Cto overshadow.\u201D It is this verb that the angel takes up at the Annunciation: <em>\u201Cthe power of the Most High will overshadow you.\u201D</em> <span class="ref">Luke 1:35</span> What the cloud did for the tent, the <a href="#/article/the-holy-spirit">Spirit</a> does for Mary: she becomes the place where the glory of God comes to dwell.</p>
      <h2>The Visitation and the ark</h2>
      <p>Saint Luke recounts the Visitation on the model of the ark going up toward Jerusalem, in the second book of Samuel. Mary arises and sets out in haste toward the hill country of Judea, as the ark had gone up there. Before the ark, David had cried out: <em>\u201CHow shall the ark of the Lord come to me?\u201D</em> <span class="ref">2 Samuel 6:9</span> Elizabeth welcomes Mary with the same words: <em>\u201CHow is it granted me that the mother of my Lord should come to me?\u201D</em> <span class="ref">Luke 1:43</span></p>
      <p>David danced with joy before the ark; John the Baptist leaps for gladness in his mother's womb at the approach of Mary. And Mary remains about three months with Elizabeth, as the ark had stayed three months in the house of Obed-Edom. The parallels are too precise to be by chance: the evangelist shows Mary as the new ark.</p>
      <h2>The ark in heaven</h2>
      <p>At the close of Scripture, the ark reappears in the vision of John. The sanctuary of heaven opens and the ark of the covenant is seen there: <em>\u201CThe temple of God in heaven was opened, and the ark of his covenant appeared in his temple.\u201D</em> <span class="ref">Revelation 11:19</span> At once a woman arises, clothed with the sun, <a href="#/article/queen-of-heaven">crowned with twelve stars</a>. The ark and the woman are one and the same reality: Mary, who carries the Saviour.</p>
      <div class="fin-article">\u2726</div>
    `
},
'reine-du-ciel': {
  titre:'Queen of Heaven',
  resume:'Mary crowned Queen of heaven and earth, associated with the reign of her Son: mother of the King after the manner of the queen mothers of David, and interceding for her people.',
  contenu:`
      <p><a href="#/article/mary">Mary</a> is Queen of heaven and earth. Raised into glory beside her <a href="#/article/the-son">Son</a>, she shares his royalty and reigns with him. This dignity flows from her motherhood: she is the mother of the King whose reign does not end, as the angel had announced at the Annunciation: <em>“The Lord God will give him the throne of David his father; he will reign for ever, and his reign will have no end.”</em> <span class="ref">Luke 1:32-33</span></p>
      <p>Mary does not reign by a power that would be her own: she reigns by participation in the reign of Christ, whose Mother she is.</p>
      <h2>Queen because Mother of the King</h2>
      <p>In the monarchy of David, the queen was not the king's wife but his mother. She was called the great lady of the kingdom: she bore an official title, sat at the right hand of the king, and interceded with him for the people. When Bathsheba comes to her son Solomon, the king rises to honour her: <em>“The king rose to meet her and bowed before her, then a throne was set for the king's mother, and she sat at his right hand.”</em> <span class="ref">1 Kings 2:19</span></p>
      <p>Christ is the promised King, son of David, whose Kingdom abides for ever. Mother of this King, Mary is the queen of his Kingdom, the queen mother of the messianic kingdom announced by the prophets.</p>
      <h2>Crowned in glory</h2>
      <p>At the end of her earthly life, Mary was taken up body and soul into heaven: this is what is called the Assumption, which the Church <a href="#/article/papal-infallibility">proclaimed a dogma</a> in 1950. There, fully associated with the victory of her Son, she is crowned Queen. John contemplates her in this glory: <em>“A great sign appeared in heaven: a woman clothed with the sun, the moon under her feet, and a crown of twelve stars on her head.”</em> <span class="ref">Revelation 12:1</span></p>
      <p>The royal psalm had sung of her beforehand: <em>“At your right hand stands the queen, arrayed in gold of Ophir.”</em> <span class="ref">Psalm 45:10</span></p>
      <p>Raised to the right hand of her Son, Mary shares the glory of his reign.</p>
      <h2>A royalty of intercession</h2>
      <p>The royalty of Mary is wholly turned toward that of her Son, toward whom she leads. As the queen mother carried the people's requests to the king, Mary presents to Christ the needs of men and obtains his grace for them. At the wedding of Cana, she notices the want and simply carries it before him: <em>“The mother of Jesus said to him: They have no wine.”</em> <span class="ref">John 2:3</span></p>
      <p>Then she turns every gaze away from herself to direct it toward her Son: <em>“Do whatever he tells you.”</em> <span class="ref">John 2:5</span></p>
      <p>Such is her manner of reigning: not to hold men to herself, but to lead them to Christ. Queen in heaven, she remains mother of Christ and of the <a href="#/article/the-church">Church</a>, and her reign is exercised in this intercession that obtains for men the <a href="#/article/salvation">salvation</a> of her Son.</p>
      <div class="fin-article">✦</div>
    `
},
'l-age-de-raison': {
  titre:'The Age of Reason',
  resume:'The age at which a child gains the use of reason and becomes able to discern good from evil: the threshold, set around seven years, from which he answers for his acts and can commit personal sin.',
  contenu:`
      <p>The age of reason, also called the age of discretion, is the moment when the child acquires the use of reason: the capacity to discern good from evil and to act knowingly. As long as he has not reached it, he does not measure the import of his acts. Scripture knows this threshold: it speaks of the little ones <em>“who today know neither good nor evil,”</em> <span class="ref">Deuteronomy 1:39</span> and describes the child growing <em>“until he knows how to refuse the evil and choose the good.”</em> <span class="ref">Isaiah 7:15</span></p>
      <h2>The mark of seven years</h2>
      <p>The Church places this threshold around seven years. It is a flexible presumption: some children reach the use of reason a little earlier, others a little later. This mark serves as a common rule, from which the child is held responsible for his acts.</p>
      <h2>Knowledge and freedom make the act</h2>
      <p>An act engages its author only if it is posed in knowledge and willingly: one must know what one does and will it to answer for it. This is why the child who does not yet have the use of reason commits no <a href="#/article/sin">personal sin</a>, being able neither to measure nor truly to choose what he does. Responsibility is born with discernment, and it holds in both directions: having become able to recognize the good, man also answers for the evil he commits knowingly: <em>“Whoever knows the right thing to do and does not do it, to him it is sin.”</em> <span class="ref">James 4:17</span></p>
      <h2>A threshold in the Christian life</h2>
      <p>From the age of reason, the child enters a moral life responsible before God: now capable of fault, but also of merit, of freely good acts that make him grow in grace. He becomes able to receive forgiveness in <a href="#/article/confession">confession</a> and to be admitted to communion. This threshold also distinguishes the effects of <a href="#/article/baptism">baptism</a>: received in the little child, it erases <a href="#/article/original-sin">original sin</a> alone; received after the age of reason, it erases besides all personal sins.</p>
      <div class="fin-article">✦</div>
    `
},
'le-bapteme-des-petits-enfants': {
  titre:'Infant Baptism',
  resume:'Why the Church baptises newborns, who cannot yet believe: a practice from the origins, founded on the gratuity of grace, the promise made to children, and the faith of the Church that carries them.',
  contenu:`
      <p>It is sometimes objected that baptism presupposes faith, and that a child too small to believe should not receive it. Yet the <a href="#/article/the-church">Church</a> has baptised little children from the beginning, because <a href="#/article/baptism">baptism</a> is first a gift of God, not a work of man.</p>
      <h2>Grace is not earned</h2>
      <p>Baptism does not reward the faith of the one who receives it: it freely gives <a href="#/article/grace">grace</a>, the very life of God. To wait until the child is able to believe would make <a href="#/article/salvation">salvation</a> a human achievement, when it is pure gift. The infant, who can offer nothing, shows this gratuity better than anyone: he receives everything without having merited it. Christ himself opens his Kingdom to children: <em>“Let the children come to me, and do not hinder them, for the Kingdom of heaven belongs to those who are like them.”</em> <span class="ref">Matthew 19:14</span></p>
      <h2>The promise is for the children</h2>
      <p>From the Church's first day, the announcement of salvation includes children. At Pentecost, Peter calls to baptism and declares: <em>“For the promise is for you and for your children.”</em> <span class="ref">Acts 2:39</span> The Apostles indeed baptised whole households, where children and servants were found, like that of Lydia or that of the jailer of Philippi.</p>
      <h2>As circumcision once did</h2>
      <p>In the Old Covenant, the child entered the people of God through circumcision, received on the eighth day, long before any personal act of faith. Baptism fulfils this sign: it unites to Christ as circumcision united to the covenant. <em>“In him you were circumcised… buried with him in baptism.”</em> <span class="ref">Colossians 2:11-12</span> The Christian child thus receives what the child of Israel already received.</p>
      <h2>Baptised in the faith of the Church</h2>
      <p>There remains the objection: the child cannot believe. But he is baptised in the faith of the Church, that of his parents, his godparents, and the community that welcomes him and commits to helping him grow. Faith is received and handed on before it becomes a personal response. The child is carried by it until the day he makes it his own, as he is carried, from birth, by the love of his own. Thus the baptism of little children opens faith and calls it forth: the gift of God always precedes the response of man.</p>
      <div class="fin-article">✦</div>
    `
},
'le-peche': {
  titre:"Sin",
  resume:"The free refusal of God’s love, by which man turns away from him: what it is, its degrees from venial to mortal, and the forgiveness that lifts it.",
  contenu:`
      <p>Sin is a free refusal of the love of God. It consists in preferring one's own will to the divine will and in transgressing the law of God, which expresses that love: <em>“Sin is the transgression of the law.”</em> <span class="ref">1 John 3:4</span> By it, man turns away from God, who is his end and his good.</p>
      <h2>Original and personal</h2>
      <p>One same word covers two realities. <a href="#/article/original-sin">Original sin</a> is the state of privation in which every man is born, inherited from the fault of the origins. Personal sin is the act that each one commits by his own will, once the <a href="#/article/the-age-of-reason">age of reason</a> has come. All are exposed to it: <em>“All have sinned and fall short of the glory of God.”</em> <span class="ref">Romans 3:23</span></p>
      <h2>Mortal and venial</h2>
      <p>Personal sins do not all wound in the same way. Mortal sin breaks friendship with God and makes one lose <a href="#/article/sanctifying-grace">sanctifying grace</a>; venial sin wounds it without destroying it. Scripture itself distinguishes these two weights: <em>“There is a sin that leads to death, and there is a sin that does not lead to death.”</em> <span class="ref">1 John 5:16-17</span> Three conditions, joined together, make a mortal sin. There must first be grave matter, an act that gravely contradicts the law of God, such as the transgression of the great commandments. There must next be full awareness of this gravity, knowing that one is doing a serious evil. There must finally be full consent, willing it freely, without being constrained. Let one of these conditions be lacking, and the sin is no longer mortal: a light matter, a real ignorance, a freedom impaired by fear or passion lighten its weight. Venial sin is that whose matter is light, or whose awareness or consent remain partial: it weakens <a href="#/article/charity">charity</a> and disposes to evil, leaving intact friendship with God. The consequence of grave sin, however, is the death of the soul, which loses the divine life: <em>“The wages of sin is death.”</em> <span class="ref">Romans 6:23</span></p>
      <h2>Its root</h2>
      <p>Every fault springs from the same movement: to prefer oneself to God. Pride, which places the self at the center, is the root from which the other sins come. Sin impoverishes man, cutting him off from the very source of his life.</p>
      <h2>Its forgiveness</h2>
      <p>God never ceases to offer his pardon to whoever returns to him. Christ bore the sin of the world to deliver men from it, and he entrusted to his <a href="#/article/the-church">Church</a> the power to remit sins: <em>“Those whose sins you forgive, they are forgiven them.”</em> <span class="ref">John 20:23</span> Mortal sin is forgiven in <a href="#/article/confession">the sacrament of penance</a>, which gives back the lost grace; venial sin is also effaced by contrition, prayer and the <a href="#/article/the-eucharist">Eucharist</a>. To the one who acknowledges his fault, mercy is always promised: <em>“If we confess our sins, he is faithful and just to forgive us them.”</em> <span class="ref">1 John 1:9</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-peche-originel': {
  titre:"Original Sin",
  resume:"The state of privation of grace into which every man is born, the consequence of the fault of the origins transmitted to all humanity: not a fault committed, but an inheritance, which baptism erases.",
  contenu:`
      <p>Original sin is the state of privation of <a href="#/article/sanctifying-grace">sanctifying grace</a> into which every man comes into the world. The newborn receives it in heritage from his birth: it is the consequence, transmitted to all humanity, of the fault of the origins.</p>
      <h2>The fault of the origins</h2>
      <p>In the beginning, God had raised man above his own nature, filling him with sanctifying grace and the preternatural gifts: this is <a href="#/article/original-justice">original justice</a>, the state of holiness and harmony in which he was created. By turning away from God to follow his own will, Adam lost this gift for himself and for all his descendants. This first refusal is the fault of the origins, recounted in the book of Genesis.</p>
      <h2>Transmitted to all humanity</h2>
      <p>What one man lost, all lost with him, for all humanity holds its nature from him: <em>“By one man sin entered the world, and through sin death, and death passed upon all men.”</em> <span class="ref">Romans 5:12</span> This state reaches man from his conception: <em>“Behold, I was born in guilt, and in sin my mother conceived me.”</em> <span class="ref">Psalm 51:7</span></p>
      <h2>Its effects</h2>
      <p>The loss of original justice leaves man with a wounded nature. His <a href="#/article/the-passions-and-concupiscence">passions</a> escape the governance of reason: this is concupiscence, the inclination to evil. Suffering and death enter his condition. And above all, he is born deprived of sanctifying grace: this is the heart of original sin, from which all the rest follows. This concupiscence remains even after forgiveness, as a weakness to be fought, without being itself a sin.</p>
      <h2>Erased by Christ</h2>
      <p>Christ, the new Adam, came to restore what the first had lost: <em>“As by the disobedience of one many were made sinners, by the obedience of one many will be made righteous.”</em> <span class="ref">Romans 5:19</span> <a href="#/article/baptism">Baptism</a> erases original sin and restores sanctifying grace to the soul. The preternatural gifts, however, remain lost: concupiscence, suffering and death remain in the life of the baptised, now taken up in the grace of Christ. Two beings, however, never knew original sin: Christ, by his nature as the Son of God made man, and <a href="#/article/the-immaculate-conception">Mary, preserved by a unique privilege</a> in view of the merits of her Son. The <a href="#/article/the-new-adam-and-the-new-eve">new Adam and the new Eve</a> repair what the first couple had lost.</p>
      <div class="fin-article">✦</div>
    `
},
'la-justice-originelle': {
  titre:"Original Justice",
  resume:"The state of holiness and harmony in which God created man: the grace that united him to God and the preternatural gifts that ordered his nature, lost at the fall.",
  contenu:`
      <p>Original justice is the state in which God created the first man: the entire uprightness of being, perfectly adjusted to God, to himself and to the world. The word justice here means this harmony, this adjustment of man to his Creator: <em>“God made man upright, but they have sought out many devices.”</em> <span class="ref">Ecclesiastes 7:29</span> It rested on two gifts that human nature could not give itself.</p>
      <h2>The grace that united him to God</h2>
      <p>The first is <a href="#/article/sanctifying-grace">sanctifying grace</a>, which united man to God in his friendship. It is a supernatural gift: the word designates what surpasses every created nature and belongs to the proper life of God. Created in the image of God, man received through this grace to bear also his likeness, sharing in the very life of his Creator: <em>“Let us make man in our image, after our likeness.”</em> <span class="ref">Genesis 1:26</span></p>
      <h2>The preternatural gifts</h2>
      <p>The second is a set of gifts called preternatural. The word means beyond nature: these gifts raised human nature above its own powers, in the body and in the faculties. Tradition counts four. Integrity, the full submission of the <a href="#/article/the-passions-and-concupiscence">passions</a> to reason, of which Scripture gives the sign when it shows the man and the woman without trouble or shame: <em>“They were both naked, and were not ashamed.”</em> <span class="ref">Genesis 2:25</span> Immortality, exemption from death. Impassibility, exemption from suffering. And an infused knowledge, received without having to learn it. Scripture refers this state to the design of God and death to the fault: <em>“God created man for incorruptibility, and made him an image of his own nature; but through the envy of the devil death entered the world.”</em> <span class="ref">Wisdom 2:23-24</span></p>
      <h2>Lost by the fault of the origins</h2>
      <p>This state was an entirely gratuitous favor, which nature could not claim. By turning away from God, Adam lost it for himself and for all his descendants: <em>“By one man sin entered the world, and by sin death, and death passed upon all men.”</em> <span class="ref">Romans 5:12</span> This loss is <a href="#/article/original-sin">original sin</a>, in which every man now comes into the world.</p>
      <h2>Restored in Christ</h2>
      <p>Christ restores to man the essential: by <a href="#/article/baptism">baptism</a>, sanctifying grace is given back to the soul and God's friendship regained. The preternatural gifts do not return in this life; the full harmony will be restored only at the resurrection, when the body itself rises incorruptible: <em>“Sown corruptible, it rises incorruptible.”</em> <span class="ref">1 Corinthians 15:42</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-nouvel-adam-et-la-nouvelle-eve': {
  titre:'The New Adam and the New Eve',
  resume:"Christ and Mary repairing what Adam and Eve had lost: by one man and one woman sin entered the world; by one man and one woman salvation came.",
  contenu:`
      <p><a href="#/article/salvation">Salvation</a> follows the path by which sin had come, to undo it from within. Sin entered the world through a man and a woman, Adam and Eve; salvation comes through a man and a woman, <a href="#/article/the-son">Christ</a> and <a href="#/article/mary">Mary</a>. The Fathers of the Church named Christ the new Adam and Mary the new Eve, because they take up and set right what the first couple had spoiled: <em>“As all die in Adam, so all will be made alive in Christ.”</em> <span class="ref">1 Corinthians 15:22</span></p>
      <h2>The new Adam</h2>
      <p>Adam had received life and lost it by his disobedience. Christ, obeying unto the Cross, restores that life and gives it in overflowing measure: <em>“The first man, Adam, became a living being; the last Adam, a life-giving spirit.”</em> <span class="ref">1 Corinthians 15:45</span> Where Adam had taken the fruit of the forbidden tree, Christ gave himself on the <a href="#/article/the-cross-and-the-resurrection">wood of the Cross</a>: the tree of the fall is repaired by the tree of salvation.</p>
      <h2>The new Eve</h2>
      <p>Eve had believed the serpent and drawn Adam into her fault. Mary believed the angel and bore the Saviour into the world: her consent unties what Eve’s disobedience had knotted. <em>“I am the handmaid of the Lord; let it be done to me according to your word.”</em> <span class="ref">Luke 1:38</span> From the fall, God had announced this woman and her offspring: <em>“I will put enmity between you and the woman, between your offspring and hers.”</em> <span class="ref">Genesis 3:15</span></p>
      <h2>Free from sin</h2>
      <p>Christ and Mary share one purity before sin, but on different grounds. Christ is free from it by his very nature as the Son of God made man: he never knew sin, <em>“tempted in every way as we are, yet without sin.”</em> <span class="ref">Hebrews 4:15</span> Mary, a mere creature, is <a href="#/article/the-immaculate-conception">preserved from it by grace, from the first instant of her conception</a>. Both are also free from <a href="#/article/the-passions-and-concupiscence">concupiscence</a>, that inclination to evil which <a href="#/article/original-sin">original sin</a> leaves behind. Of the original state they thus keep <a href="#/article/original-justice">integrity</a> and grace.</p>
      <h2>But not from suffering or death</h2>
      <p>They did not, however, keep all the gifts of that state: neither immortality nor exemption from suffering. And this was out of love. Christ took a flesh able to suffer and to die, to redeem men by his Passion. Mary was joined to that suffering, her heart pierced at the foot of the Cross: <em>“And a sword will pierce through your own soul too.”</em> <span class="ref">Luke 2:35</span> The new Adam and the new Eve did not spare themselves what they came to heal.</p>
      <div class="fin-article">✦</div>
    `
},
'les-passions-et-la-concupiscence': {
  titre:'The Passions and Concupiscence',
  resume:"The spontaneous movements of the soul before good and evil, good when they serve reason; and concupiscence, their disorder born of original sin, which inclines to evil without being itself a fault.",
  contenu:`
      <p>The passions are the spontaneous movements of the soul before what it perceives as a good or an evil: desire, joy, hope, fear, anger, and the rest. They belong to human nature and accompany all sensible life. In themselves they are morally neutral: their value depends on the end towards which reason and will lead them.</p>
      <h2>Ordered by reason</h2>
      <p>A passion serves the good when reason governs it: anger before injustice, desire for the true good, fear that turns one from evil. It harms when it carries man outside reason, towards what draws him away from God. Moral maturity consists in ordering them and putting them at the service of the love of the good.</p>
      <h2>The original harmony</h2>
      <p>Before the fall, man possessed integrity: his passions followed reason without resistance, in perfect harmony. This gift belonged to <a href="#/article/original-justice">original justice</a>, the state of uprightness in which he was created. Sin lost it, and disorder entered human nature.</p>
      <h2>Concupiscence</h2>
      <p>Since <a href="#/article/original-sin">original sin</a>, the passions no longer obey reason spontaneously: they often pull towards evil before the will has even chosen. This inner disorder bears the name of concupiscence, the mark that the fault of the origins left in human nature and the inclination to sin that remains in every man: <em>“The flesh lusts against the spirit, and the spirit against the flesh.”</em> <span class="ref">Galatians 5:17</span></p>
      <h2>The ground of the struggle</h2>
      <p>Concupiscence inclines to evil without imposing it, and without being itself a sin. <a href="#/article/baptism">Baptism</a> erases original sin, but it remains, as a ground on which freedom is exercised and strengthened. Saint Paul describes the trial: <em>“I do not do the good I want, but the evil I do not want is what I do.”</em> <span class="ref">Romans 7:19</span> <a href="#/article/grace">Grace</a> gives the strength to wage this struggle, to which God himself calls man: <em>“Sin is crouching at your door, but you must master it.”</em> <span class="ref">Genesis 4:7</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-salut': {
  titre:'Salvation',
  resume:"The work by which God delivers man from sin and death and gives him a share in his own life: accomplished by Christ, offered to all, received in faith and brought to completion in eternal life.",
  contenu:`
      <p>Salvation is the work by which God delivers man from <a href="#/article/sin">sin</a> and death, and gives him a share in his own life. All sacred history tends towards it, from the promise made after the fall to its accomplishment in Christ, who came for this: <em>“The Son of Man came to seek and to save what was lost.”</em> <span class="ref">Luke 19:10</span></p>
      <h2>By Christ alone</h2>
      <p>There is only one Saviour, and it is <a href="#/article/the-son">Jesus</a>. His very name says it: Jesus means “God saves”. No one but him can restore to man what sin has taken away: <em>“There is no other name under heaven given among men by which we must be saved.”</em> <span class="ref">Acts 4:12</span></p>
      <h2>By the Cross and the Resurrection</h2>
      <p>Christ saves by taking upon himself the sin of the world. By his death on the <a href="#/article/the-cross-and-the-resurrection">Cross</a> he destroys sin; by his Resurrection he conquers death and opens life to man. Here the love of God is measured: <em>“God so loved the world that he gave his only Son, that whoever believes in him may have eternal life.”</em> <span class="ref">John 3:16</span></p>
      <h2>A gift of grace</h2>
      <p>Salvation is offered freely, before any merit. The initiative comes wholly from God: it is he who saves, by pure <a href="#/article/grace">grace</a>, and man receives from him what no human power could obtain: <em>“By grace you have been saved, through faith; and this is not your own doing, it is the gift of God.”</em> <span class="ref">Ephesians 2:8</span></p>
      <h2>Received in faith</h2>
      <p>This gift, however, waits to be welcomed. Man receives salvation through <a href="#/article/faith">faith</a>, which opens in conversion and enters the new life through <a href="#/article/baptism">baptism</a>: <em>“If you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.”</em> <span class="ref">Romans 10:9</span></p>
      <h2>Offered to all, completed in eternal life</h2>
      <p>God excludes no one from this offer: <em>“God wills all men to be saved and to come to the knowledge of the truth.”</em> <span class="ref">1 Timothy 2:4</span> Salvation is already won in Christ and received here and now in the <a href="#/article/the-church">Church</a> and her sacraments; it will be completed in <a href="#/article/the-last-things">eternal life</a>, when man sees God face to face.</p>
      <div class="fin-article">✦</div>
    `
},
'la-virginite-perpetuelle-de-marie': {
  titre:"The Perpetual Virginity of Mary",
  resume:"The dogma that Mary remained a virgin before, during and after the birth of Christ: her virginal conception by the Holy Spirit, her integrity kept in childbirth, and her virginity maintained all her life, the “brothers of Jesus” being her near kin.",
  contenu:`
      <p>Mary remained a virgin throughout her life: before, during and after the birth of Christ. The Church confesses this threefold privilege as a dogma and calls her “ever-virgin.” It expresses <a href="#/article/mary">Mary</a>'s entire consecration to God and the newness of what is accomplished in her.</p>
      <h2>Before the birth</h2>
      <p>Mary conceives Christ without the involvement of any man, by the sole power of the <a href="#/article/the-holy-spirit">Holy Spirit</a>. To the angel who announces a son to her, she answers with the wonder of the virgin: <em>“How shall this be, since I know not a man?”</em> <span class="ref">Luke 1:34</span> And the angel reveals to her the work of God: <em>“The Holy Spirit will come upon you, and the power of the Most High will overshadow you.”</em> <span class="ref">Luke 1:35</span> The prophet had foretold it: <em>“Behold, the virgin shall conceive and bear a son.”</em> <span class="ref">Isaiah 7:14</span></p>
      <h2>During the birth</h2>
      <p>Mary brings her Son into the world without losing anything of her virginal integrity. Like the conception, the birth escapes the ordinary regime issued from the fall: it takes place without corruption and without pain. The pain of childbirth had been announced to Eve as a consequence of sin: <em>“You shall bring forth your children in pain.”</em> <span class="ref">Genesis 3:16</span> Mary, <a href="#/article/the-immaculate-conception">preserved from all sin from her conception</a>, does not bear its penalty; and the one she brings forth is himself holy, conceived by the Spirit. The holiness of the mother and that of the Son meet in this birth, withdrawn entirely from the regime of the fall, and which becomes the sign of his origin: this child comes from God. The prophet Ezekiel had announced her under the figure of a gate of the Temple, through which the Lord alone passes and which remains forever shut: <em>“This gate shall remain shut, it shall not be opened; no one shall pass through it, for the Lord, the God of Israel, has entered by it.”</em> <span class="ref">Ezekiel 44:2</span> Mary is this gate: God alone entered by her, by becoming man, and she remained a virgin. The same mystery appears on the evening of Easter, when the Risen One stands in the midst of his disciples with all the doors locked: <em>“The doors being shut, Jesus came and stood in their midst.”</em> <span class="ref">John 20:19</span> His glorified body passes without breaking anything; so too was he born of Mary without touching her integrity.</p>
      <h2>After the birth</h2>
      <p>Mary remains a virgin all her life, without any other child. What the Gospel calls the “<a href="#/article/the-brothers-of-jesus">brothers of Jesus</a>” designates his close relatives, not other sons of the Virgin. Her virginity does not belong to the past alone: it is the definitive consecration of her who bore God, the sanctuary that none shares, reserved to him alone.</p>
      <h2>The meaning</h2>
      <p>Mary's virginity is a sign as much as a fact, and it says three things. It says first the origin of Christ: having no father according to the flesh, he comes from God alone, <a href="#/article/the-son">eternal Son</a> entered into the world without the concurrence of a human generation. It says next Mary's total gift: virgin before as after, she gave herself to God body and soul, withholding nothing. It announces lastly a new humanity, which is no longer born of the flesh but of God: <em>“They were born not of blood, nor of the will of the flesh, nor of the will of man, but of God.”</em> <span class="ref">John 1:13</span> In Mary begins this birth from on high, which all who are reborn in Christ will receive in their turn.</p>
      <div class="fin-article">✦</div>
    `
},
'les-freres-de-jesus': {
  titre:"The Brothers of Jesus",
  resume:"Why the “brothers of Jesus” named in the Gospels do not contradict Mary’s perpetual virginity: a Semitic word that designates wider kinship, and “brothers” who are in fact the sons of another Mary.",
  contenu:`
      <p>The Gospels speak several times of the “brothers of Jesus.” Some have seen in this an objection to the <a href="#/article/the-perpetual-virginity-of-mary">perpetual virginity of Mary</a>: if Jesus had brothers, his mother would have had other children. Scripture itself dispels the difficulty.</p>
      <h2>A word that means wide kinship</h2>
      <p>In the language of the Bible, the word “brother” extends beyond mere siblinghood. Hebrew, like the Aramaic that Jesus spoke, has no distinct term for cousin or nephew: a single word covers all close kinship. Thus Abraham calls Lot his brother, though Lot is his nephew: <em>“For we are brothers.”</em> <span class="ref">Genesis 13:8</span> The Gospels, written in Greek on this Semitic ground, keep this usage: they designate the “brothers” of Jesus by the word adelphos (ἀδελφός), which extends to cousins as to more distant relatives.</p>
      <h2>The sons of another Mary</h2>
      <p>Scripture confirms it by a cross-reference. It names among the “brothers” of Jesus James and Joseph: <em>“Are not his brothers called James, Joseph, Simon and Jude?”</em> <span class="ref">Matthew 13:55</span> Now these two have for mother another Mary, distinct from the mother of Jesus and present like her at the foot of the Cross: <em>“Among them Mary Magdalene, and Mary the mother of James and Joseph.”</em> <span class="ref">Matthew 27:56</span> James and Joseph are therefore not the sons of the Virgin, but of this other Mary.</p>
      <h2>Mary entrusted to the disciple</h2>
      <p>The Cross itself confirms it. At the hour of his death, Jesus entrusts his mother to the disciple whom he loved: <em>“Behold your mother. And from that hour the disciple took her into his home.”</em> <span class="ref">John 19:26-27</span> In the custom of Israel, the care of a mother left alone fell to her sons. Had Mary had others than Jesus, it is to them that he would have committed her, and not to a disciple who was not of her family. By entrusting her to John, Christ shows that she has no other son to take her in.</p>
      <h2>A kinship, not a siblinghood</h2>
      <p>The “brethren of the Lord” thus belong to his wider family, his close relatives, taking nothing away from the virginity of his mother. <a href="#/article/mary">Mary</a> had but one Son, Jesus, and she remained ever-virgin.</p>
      <div class="fin-article">✦</div>
    `
},
'marie-mere-de-dieu': {
  titre:'Mary, Mother of God',
  resume:"Why the Church confesses Mary “Mother of God” though God is eternal: motherhood regards the person, and the person Mary bore is the eternal Son made man. A title that first defends the unity of Christ.",
  contenu:`
      <p>It is objected that <a href="#/article/mary">Mary</a> cannot be called Mother of God. God is eternal, without beginning or mother; Mary, it is said, is the mother of the man Jesus, not of the divinity. The Church confesses her nonetheless as Mother of God, and this title states first a truth about Christ.</p>
      <h2>A mother begets a person</h2>
      <p>A mother brings into the world someone, a person, and not a nature. One never says of a woman that she is the mother of a humanity or of an intelligence: she is the mother of a particular being, of the one she has carried and borne. What she transmits is the nature; the one she begets is a person.</p>
      <h2>And this person is God</h2>
      <p>Now the person Mary conceived is the <a href="#/article/the-son">eternal Son of God</a>, the <a href="#/article/the-word">Word</a> who took flesh in her: <em>“The Word became flesh.”</em> <span class="ref">John 1:14</span> The one she carried in her womb is true God and true man, <a href="#/article/the-incarnation">one single person in two natures</a>. Elizabeth greets her already as the mother of her Lord: <em>“How is it granted me that the mother of my Lord should come to me?”</em> <span class="ref">Luke 1:43</span> And the Apostle refers this birth to God himself: <em>“God sent his Son, born of a woman.”</em> <span class="ref">Galatians 4:4</span></p>
      <h2>What is said of the person</h2>
      <p>From this unity follows a rule of language that the Church calls the communication of idioms. The idioms are the properties of each nature; and since Christ is one single person, what belongs to one or the other of his natures is attributed to that one person, under whatever name one designates him. One can therefore say in truth that the Son of God was born, suffered and died, although to be born and to die belong to his human nature alone: it is the same who acts and undergoes in both. The rule bears on the person, not on the nature taken apart: one says that God was born, because the one who was born is God, without thereby saying that the divinity was born, for it is without beginning. Scripture already speaks thus, attributing to God what was accomplished in the flesh: it says that men crucified <em>“the Lord of glory,”</em> <span class="ref">1 Corinthians 2:8</span> and that God acquired the Church <em>“with his own blood.”</em> <span class="ref">Acts 20:28</span> By this same rule, Mary, who conceived and bore this person according to his human nature, is truly Mother of God, and not the mother of the man Jesus alone.</p>
      <h2>Without being the source of the divinity</h2>
      <p>The title therefore encloses no confusion. Mary does not give her Son his divine being, but his human nature: it is in her and from her that God became man. She is Mother of God because the one she bears is God, not because she would be the source of his divinity.</p>
      <h2>A title that defends Christ</h2>
      <p>To refuse this name would amount to separating in Jesus two subjects: the man whom Mary would have borne, and the God who would remain foreign to him. This is what Nestorius taught, and what the Council of Ephesus rejected in 431 by proclaiming Mary Theotokos, a Greek word meaning the one who bears God. The title preserves the unity of Christ: the one Mary brought into the world is one single person, and that person is God.</p>
      <div class="fin-article">✦</div>
    `
},
'le-bapteme-de-desir': {
  titre:'The Baptism of Desire',
  resume:"How those who die without having received baptism by water, the catechumen, the martyr, the man who sought God without knowing the Gospel, can receive the grace of baptism by desire or by blood.",
  contenu:`
      <p><a href="#/article/baptism">Baptism by water</a> opens the door of <a href="#/article/salvation">salvation</a>, and the Church holds it to be necessary. Yet some die before receiving it: a catechumen taken the eve of his baptism, a martyr killed for Christ, a man who sought God without ever knowing the Gospel. God saves them by desire or by blood, where water was wanting.</p>
      <h2>The necessity of baptism</h2>
      <p>The Lord binds salvation to baptism: <em>“Truly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.”</em> <span class="ref">John 3:5</span> Baptism by water is the way Christ gave for receiving <a href="#/article/sanctifying-grace">the grace that saves</a>, and the Church knows no other assured means.</p>
      <h2>The baptism of desire</h2>
      <p>Whoever desires baptism and dies before receiving it obtains the grace by that very desire. The desire is explicit in the catechumen, who asks for baptism and prepares to receive it. It is implicit in the one who seeks God with a sincere heart and does his will according to what he knows of it: without naming Christ, he already desires him in desiring the good and the true. In both cases it is <a href="#/article/charity">charity</a> that gives the desire its worth, for the love of God contains in seed all that baptism confers.</p>
      <h2>The baptism of blood</h2>
      <p>Martyrdom likewise supplies for water. Whoever dies for Christ, or for a virtue that bears on him, is baptized in his own blood. He receives the grace by union with the Passion of Christ, which he reproduces in giving his life. The Church has always venerated as saints the martyrs who died before being baptized.</p>
      <h2>The thief on the cross</h2>
      <p>Scripture shows an example of this at Calvary. The thief crucified beside Jesus acknowledges his fault, confesses the innocence of Christ, and turns to him. Jesus answers him at once: <em>“Today you will be with me in paradise.”</em> <span class="ref">Luke 23:43</span> This man did not receive baptism by water; his faith and his desire, at the threshold of death, opened paradise to him.</p>
      <h2>God is not bound by his sacraments</h2>
      <p>Baptism remains necessary, and no one may neglect it while holding back to desire or blood. But God, who attached salvation to the sacrament, is not himself chained to his signs: he can give when he wills the grace they contain. This is why the Apostle can say that God <em>“desires all men to be saved and to come to the knowledge of the truth.”</em> <span class="ref">1 Timothy 2:4</span> The baptism of desire and the baptism of blood are the way this will reaches those whom water has not attained.</p>
      <div class="fin-article">✦</div>
    `
},
'l-infaillibilite-pontificale': {
  titre:'Papal Infallibility',
  resume:"The gift by which the pope, when he solemnly defines a doctrine of faith or morals to be held by the whole Church, is preserved from error by the Holy Spirit: its conditions, its foundation in the promise made to Peter, and its limits.",
  contenu:`
      <p>Papal infallibility is the gift by which the pope, when he solemnly defines a doctrine of faith or morals to be held by the whole Church, is preserved from error by the assistance of the <a href="#/article/the-holy-spirit">Holy Spirit</a>. This gift bears on his solemn teaching, and is exercised under precise conditions.</p>
      <h2>The promise made to Peter</h2>
      <p>Christ built his Church on <a href="#/article/the-primacy-of-peter">Peter</a> and entrusted to him the keeping of the <a href="#/article/faith">faith</a>. He says to him: <em>“You are Peter, and on this rock I will build my Church, and the gates of hell shall not prevail against it.”</em> <span class="ref">Matthew 16:18</span> And on the eve of his Passion: <em>“I have prayed for you, that your faith may not fail; and when you have turned again, strengthen your brothers.”</em> <span class="ref">Luke 22:32</span> The Lord himself prays that Peter's faith may hold, and gives him to strengthen the others. Infallibility prolongs this prayer of Christ over the successor of Peter.</p>
      <h2>The conditions of the infallible act</h2>
      <p>The pope engages this gift only when four conditions are met. He speaks as supreme pastor and teacher of all Christians; he uses his supreme apostolic authority; he defines a doctrine of faith or morals; he declares it to be held by the whole Church. Such an act is called a definition <em>ex cathedra</em>, “from the chair” of Peter. Outside these conditions, in his homilies, his interviews, his decisions of governance or his personal opinions, the pope teaches and deserves respect, without being covered by this gift.</p>
      <h2>The keeping of the deposit</h2>
      <p>The gift preserves from error by keeping the deposit received. The pope keeps the faith handed down from the Apostles and sets it forth faithfully; the Spirit prevents him from leading the Church astray at the moment he fixes what she must believe. Revelation was completed with the Apostles, and infallibility serves its faithful transmission, not the adding of a new word.</p>
      <h2>The infallibility of the Church</h2>
      <p>This gift of the pope flows from a promise made to the <a href="#/article/the-church">whole Church</a>. Christ assured her against error, <em>“the gates of hell shall not prevail against it”</em> <span class="ref">Matthew 16:18</span>, and he gave her his Spirit: <em>“the Spirit of truth will guide you into all the truth.”</em> <span class="ref">John 16:13</span> The Church therefore cannot fail in the faith. The pope exercises at given moments this infallibility that belongs to the whole body, to settle matters when the unity of the faith is at stake and to keep all the faithful in one same truth.</p>
      <h2>The pope remains a man</h2>
      <p>Infallibility bears on the defined teaching, and leaves the human condition of the pope intact. He can sin, err in his judgments, fail in his conduct; history has known popes both holy and unworthy. The gift makes him neither holy nor omniscient. It keeps his solemn word from error, so that the flock entrusted to Peter may never be taught what is false.</p>
      <h2>Its definition at the council</h2>
      <p>The Church lived this assurance from the beginning; she defined it in proper terms at the First Vatican Council, in 1870. Its solemn exercise remains rare. Two Marian proclamations illustrate it: the <a href="#/article/the-immaculate-conception">Immaculate Conception</a>, declared by Pius IX in 1854, and the Assumption, declared by Pius XII in 1950. In more than twenty centuries, the pope has spoken thus only to fix what touches the heart of the faith.</p>
      <div class="fin-article">✦</div>
    `
},
'la-communion-des-saints': {
  titre:'The Communion of Saints',
  resume:"The union of all the members of the Church in Christ, on earth, in purgatory and in heaven: the saints live in God, intercede for us, and their prayer is a grace offered to the whole Church.",
  contenu:`
      <p>The Creed confesses the communion of saints. It means the union of all the members of the Church in Christ: the faithful who still live on earth, the souls being purified before they see God, and the blessed who already contemplate him. This union is not broken by death, and it allows some to pray for others.</p>
      <h2>One body in Christ</h2>
      <p>The <a href="#/article/the-church">Church</a> is a body of which <a href="#/article/the-son">Christ</a> is the head, and all the baptized are its members. Saint Paul draws their solidarity from this: <em>“If one member suffers, all the members suffer with it; if one member is honoured, all rejoice with it.”</em> <span class="ref">1 Corinthians 12:26</span> This body reaches beyond the bounds of death. Three states compose it: those who still walk toward God on earth, those who complete their purification, and those who already see him. All hold to the same Christ, and all share in the same goods: grace, prayer, <a href="#/article/charity">charity</a>.</p>
      <h2>The saints live in God</h2>
      <p>The blessed of heaven live fully in God. Jesus affirms it, speaking of the patriarchs dead for centuries: <em>“God is not the God of the dead, but of the living.”</em> <span class="ref">Matthew 22:32</span> The saints contemplate him face to face, and from that vision they draw a life higher than ours. They remain united to us in Christ, attentive to those they have gone before.</p>
      <h2>They pray for us</h2>
      <p>This life of the saints is wholly turned toward God and toward love. Their charity does not die out at the threshold of heaven; it is brought to completion, and moves them to pray for those still on the way. The Apocalypse shows the elect presenting before God <em>“golden bowls full of incense, which are the prayers of the saints.”</em> <span class="ref">Revelation 5:8</span> The Old Testament already foreshadowed it: Jeremiah, long dead, appears there as <em>“the one who prays much for the people and for the holy city.”</em> <span class="ref">2 Maccabees 15:14</span> And heaven rejoices over what happens on earth: <em>“There is joy before the angels of God over one sinner who repents.”</em> <span class="ref">Luke 15:10</span> The saints take part in our journey: they intercede.</p>
      <h2>We pray for the dead</h2>
      <p>The communion also works in the other direction. Those who have left this world without being fully purified complete their purification before seeing God, in the state the Church calls <a href="#/article/purgatory">purgatory</a>; they can no longer merit for themselves, but the Church, united to them in Christ, relieves them by its prayers, its almsgiving, and above all by the sacrifice of the Mass. Scripture already shows this gesture, when a sacrifice is offered for the soldiers fallen in battle: <em>“It is a holy and wholesome thought to pray for the dead, that they may be loosed from their sins.”</em> <span class="ref">2 Maccabees 12:46</span> To pray for the dead is to extend beyond death the charity that unites the members of one same body.</p>
      <h2>A grace to receive</h2>
      <p>From this communion the prayer to the saints arises. To ask them to intercede is to do with them what Christians do among themselves on earth, entrusting one another in prayer: <em>“The fervent prayer of the just man has great power.”</em> <span class="ref">James 5:16</span> And no one is more just than the saints established in God. This trust in the intercession of the saints has at times been contested, and <a href="#/article/intercession-of-the-saints">it holds up under examination</a>. To pray to them is to enter into their friendship, to take as companions on the road those who have already reached the goal, and to taste even now the communion that unites the whole Church.</p>
      <div class="fin-article">✦</div>
    `
},
'l-intercession-des-saints': {
  titre:'The Intercession of the Saints',
  resume:"To pray to a saint is to ask him to intercede for us: a response to the three objections, the prohibition of consulting the dead, idolatry, and an offence against the one mediator.",
  contenu:`
      <p>The intercession of the saints rests on the <a href="#/article/the-communion-of-saints">communion of saints</a>, the union of all the members of the Church in Christ. This trust meets three objections: the prohibition of consulting the dead, idolatry, and an offence against the one mediator. Each dissolves once one sees what is asked of the saints, and what they are.</p>
      <h2>The living, and not the dead</h2>
      <p>The saints of heaven are alive. Jesus declares it, speaking of the patriarchs gone for centuries: <em>“God is not the God of the dead, but of the living.”</em> <span class="ref">Matthew 22:32</span> Established in God, they are more alive than we are, and seeing him face to face, they know in him what concerns them, down to the prayers addressed to them. This answers the reproach drawn from the prohibition of consulting the dead: <em>“Let no one be found among you who consults the dead.”</em> <span class="ref">Deuteronomy 18:11</span> This prohibition targets necromancy, which seeks to force the dead to wrest from them a hidden knowledge, by magic. The invocation of the saints is of a wholly different order: it addresses living ones established in God, and humbly asks them for a prayer. Scripture moreover shows a dead man interceding for the living: Jeremiah, long dead, appears as <em>“the one who prays much for the people and for the holy city.”</em> <span class="ref">2 Maccabees 15:14</span></p>
      <h2>Adoration for God, honour for the saints</h2>
      <p>Idolatry is also objected: to pray to a saint would be to adore a creature. Idolatry consists in rendering to a creature the worship of adoration due to God alone. Now that worship belongs to him alone: <em>“You shall worship the Lord your God, and him only shall you serve.”</em> <span class="ref">Matthew 4:10</span> To pray to a saint is another gesture: one asks him to pray to God for us, which acknowledges that God alone answers, and that the saint is only an intercessor. The Church thus distinguishes two honours that the objection confuses: adoration, or latria, reserved for God alone; veneration, or dulia, rendered to the saints as friends of God.</p>
      <h2>The one mediator of redemption</h2>
      <p>The last reproach invokes the one mediator: <em>“There is one God, and one mediator between God and men, the man Christ Jesus.”</em> <span class="ref">1 Timothy 2:5</span> To grasp this uniqueness, one must see how mediation is exercised. The mediator between God and men is the priest, established <em>“to offer gifts and sacrifices for sins.”</em> <span class="ref">Hebrews 5:1</span> Now <a href="#/article/the-son">Christ</a> is the one and eternal high priest of the new covenant: he offers not the blood of animals, but his own, entering once for all into the sanctuary <em>“by his own blood, having obtained an eternal redemption.”</em> <span class="ref">Hebrews 9:12</span> This is what no one shares: one priest, one sacrifice, one <a href="#/article/salvation">redemption</a>. Intercession is of another order, for it offers no sacrifice: it prays. The Apostle commands it, moreover, in the same chapter, a few lines before affirming the one mediator: <em>“I urge above all that prayers, supplications and intercessions be made for all men.”</em> <span class="ref">1 Timothy 2:1</span> If he does not contradict himself, it is because asking for a prayer touches the one mediation in no way. It is objected that the word on the one mediator forbids praying to the saints of heaven; but it distinguishes neither the dead nor the living. If it excluded the intercession of the saints, it would equally exclude that of the living whom Paul has just commanded. Christ the high priest intercedes himself, moreover, <em>“always living to intercede”</em> on our behalf <span class="ref">Hebrews 7:25</span> To ask the saints of heaven to pray for us therefore does not touch his one priesthood: they offer no sacrifice, they intercede, and their prayer passes wholly through him.</p>
      <div class="fin-article">✦</div>
    `
},
'les-reliques': {
  titre:'Relics',
  resume:"The remains of the saints and the objects bound to them, which the Church venerates: why the body of a saint is worthy of honour, how God acts through matter, and what this veneration truly honours.",
  contenu:`
      <p>A relic is what remains of a saint, his body or his bones, or an object that belonged to him. The Church venerates them in memory of the saint whose trace they keep, and of God who made him his dwelling.</p>
      <h2>What Scripture shows</h2>
      <p>Scripture shows God acting through the matter bound to his servants. At the touch of the bones of the prophet Elisha, a dead man returns to life: <em>“The man went and touched the bones of Elisha, and he revived and stood on his feet.”</em> <span class="ref">2 Kings 13:21</span> Likewise, through the hands of Paul, <em>“cloths that had touched his body were applied to the sick, and the diseases left them.”</em> <span class="ref">Acts 19:11-12</span> God thus makes use of what has been united to his saints to pour out his <a href="#/article/grace">grace</a>.</p>
      <h2>The body, temple of the Spirit</h2>
      <p>This veneration rests on what the body of a saint is. During his life, it was the temple of the <a href="#/article/the-holy-spirit">Spirit</a>: <em>“Your body is the temple of the Holy Spirit who is in you.”</em> <span class="ref">1 Corinthians 6:19</span> Sanctified by grace, united to Christ, this body is promised to the resurrection. The Church does not treat it as an ordinary corpse: it honours it as what carried a friend of God, and awaits its glory on the last day.</p>
      <h2>The three classes of relics</h2>
      <p>The Church distinguishes three classes of relics. First-class relics are the body of the saint or its fragments; when it is a notable part, such as the head or a limb, they are called <em>insignes</em>. Second-class relics are the objects the saint wore or used during his life, his garments or the instruments of his martyrdom. Third-class relics are objects, most often a cloth, brought into contact with a first-class relic; Christian antiquity called them <em>brandea</em>. All point to the same person, the saint they recall.</p>
      <h2>Honouring the saint, not the matter</h2>
      <p>To venerate a relic lends no magical power to the matter. The relic neither heals nor saves of itself: it is God who acts, freely, when he wills, through the memory and the <a href="#/article/intercession-of-the-saints">intercession</a> of the saint. The honour given to the relic rises to the saint, and from the saint to God, whose work he was. The Church honours in it the trace of a life given to God.</p>
      <div class="fin-article">✦</div>
    `
},
'l-eucharistie': {
  titre:'The Eucharist',
  resume:"The sacrament of the Body and Blood of Christ, instituted at the Last Supper: prefigured by the Old Testament, it makes Christ really present under the species, perpetuates the sacrifice of the Cross, receives adoration, and unites the faithful in communion.",
  contenu:`
      <p>The Eucharist is the sacrament of the Body and Blood of <a href="#/article/the-son">Christ</a>, instituted by Jesus at the Last Supper. Under the appearances of bread and wine, Christ makes himself really present in it, offers his sacrifice, and gives himself as food. It is the centre of the life of the <a href="#/article/the-church">Church</a>.</p>
      <h2>The prefigurations</h2>
      <p>The Eucharist was prefigured from afar. Melchizedek, king and priest, offers God bread and wine: <em>“Melchizedek, king of Salem, brought out bread and wine; he was priest of God Most High.”</em> <span class="ref">Genesis 14:18</span> In the desert, the manna fallen from heaven to feed Israel announces the true bread that Christ will give: <em>“I am the living bread come down from heaven.”</em> <span class="ref">John 6:51</span> And the paschal lamb, slain to spare the people, prefigures Christ: <em>“Christ, our Passover, has been sacrificed.”</em> <span class="ref">1 Corinthians 5:7</span> These figures awaited their fulfilment at the Last Supper.</p>
      <h2>The institution at the Last Supper</h2>
      <p>On the eve of his Passion, during the paschal meal, Jesus took bread, blessed it, broke it and gave it to his disciples: <em>“This is my body.”</em> Then he gave them the cup: <em>“This is my blood, the blood of the covenant, poured out for the multitude for the forgiveness of sins.”</em> <span class="ref">Matthew 26:26-28</span> And he commanded that this be renewed: <em>“Do this in memory of me.”</em> <span class="ref">Luke 22:19</span> Since then, the Church does what the Lord did, and the bread and wine become his Body and Blood.</p>
      <h2>The real presence</h2>
      <p>The words of Christ effect what they say: the bread becomes his Body, the wine becomes his Blood. He himself had announced it: <em>“My flesh is true food, and my blood is true drink.”</em> <span class="ref">John 6:55</span> This change bears on the substance itself: what was bread and wine is now the Body and Blood of Christ, while the appearances remain, the taste and the look, which are called the species. The Church calls this passage transubstantiation. Under these species, Christ is wholly present, living and glorious.</p>
      <h2>The sacrifice</h2>
      <p>The Eucharist is a sacrifice. It makes present the one <a href="#/article/salvation">sacrifice of Christ on the cross</a>. He offered himself once for all, and the Mass does not repeat it: it makes present what he accomplished on Calvary, his offering to the Father. The <a href="#/article/the-cross-and-the-resurrection">Cross</a> and the Mass are one and the same sacrifice, offered once in blood, offered now under the species of bread and wine. This is why the Church calls it the holy sacrifice.</p>
      <h2>The adoration of the Blessed Sacrament</h2>
      <p>Since Christ is really present under the species, the Eucharist receives the adoration due to God alone. It is Christ himself whom one adores, present wholly under the appearances of bread. The Church keeps the Eucharist in the tabernacle, the place where it is kept at the heart of the church, exposes it to the adoration of the faithful, and kneels before the Blessed Sacrament as before the Lord. Eucharistic adoration is the homage rendered to this presence.</p>
      <h2>Communion</h2>
      <p>To receive the Eucharist is to commune with the Body of Christ. The Lord promised it: <em>“Whoever eats my flesh and drinks my blood abides in me, and I in him.”</em> <span class="ref">John 6:56</span> Communion unites intimately to Christ, and through him <a href="#/article/the-communion-of-saints">unites the faithful among themselves</a>: <em>“Since there is one bread, we who are many form one body.”</em> <span class="ref">1 Corinthians 10:17</span> The Church is thus built up by the Eucharist, which makes of it the Body of Christ.</p>
      <div class="fin-article">✦</div>
    `
},
'la-croix-et-la-resurrection': {
  titre:"The Cross and the Resurrection",
  resume:"The paschal mystery, the heart of the faith: why God saves through the Cross, where his justice and mercy meet; how Christ redeems sin and conquers death; and how man is justified by it.",
  contenu:`
      <p>The Cross and the Resurrection form the heart of the Christian faith. By his death on the Cross, Christ redeems the sin of the world; by his Resurrection, he triumphs over death. These two inseparable moments are called the paschal mystery, and it is there that our <a href="#/article/salvation">salvation</a> is accomplished.</p>
      <h2>An Infinite Offense</h2>
      <p><a href="#/article/original-sin">Sin</a> had separated man from God, and this rupture surpassed any human reparation. The gravity of an offense is measured by the dignity of the one it strikes: a lack of regard toward an equal weighs less than the same affront offered to a sovereign. Now sin strikes God himself, infinitely great. It therefore carries a gravity beyond measure: an infinite offense.</p>
      <p>To repair such an offense required a satisfaction of equal value, therefore infinite. The word satisfaction here means the reparation offered to God for sin, the gift that answers the offense. Yet no man could offer it: a finite creature, already indebted to God for all that he is, man had nothing to give that was not already owed. His debt surpassed him infinitely.</p>
      <p>Justice nonetheless willed that it be man who repairs, since it was man who had sinned. There had to be a redeemer at once truly man, to offer in the name of all, and truly God, so that his offering might have the infinite value the fault demanded. This redeemer is <a href="#/article/the-son">Christ</a>, true God and true man. In him alone could humanity at last render to God a reparation equal to the offense.</p>
      <h2>The Sacrifice of the Cross</h2>
      <p>On the Cross, Christ takes upon himself the sin of the world. John the Baptist had pointed to him: <em>“Behold the Lamb of God, who takes away the sin of the world.”</em> <span class="ref">John 1:29</span> Innocent, he bears the punishment of the guilty: <em>“He was pierced for our sins; by his wounds we are healed.”</em> <span class="ref">Isaiah 53:5</span> His blood poured out is the total gift of himself to the Father, offered in love as reparation for all. There, the sacrifice foreshadowed by all the altars of Israel finds its fulfillment.</p>
      <h2>Justice and Mercy</h2>
      <p>The Cross reveals together the justice and the mercy of God. His justice, for sin is there fully repaired, by an offering equal to the offense.</p>
      <p>His mercy still more. To save man was pure gratuity: he had lost himself by his own fault, and nothing obliged God to raise him up. Mercy begins in this love offered to one who had not deserved it: <em>“God shows his love for us: while we were still sinners, Christ died for us.”</em> <span class="ref">Romans 5:8</span> It goes further still. Justice willed that the guilty one pay; the guilty one could not. So it is the offended one who pays for the offender: God, entitled to demand reparation, makes himself the one who repairs and takes upon himself the debt he could have claimed. For this he gives what is most dear to him, his own Son. The gift matches the measure of the offense: infinite as it is.</p>
      <p>God remained free, however. By his omnipotence, he could have remitted sin by a simple pardon. If he chose this way, it is because it was the most worthy of him, the one where his justice is honored, his mercy made manifest, and man associated with his own redemption. Thus is fulfilled the word of the psalm: <em>“Love and faithfulness meet together; justice and peace embrace.”</em> <span class="ref">Psalm 85:11</span> On the Cross, God forgives without lowering anything of his holiness.</p>
      <h2>The Victory of the Resurrection</h2>
      <p>On the third day, Christ rose, alive forever, victor over sin and death. His Resurrection seals the value of his sacrifice: <em>“He was handed over for our trespasses and raised for our justification.”</em> <span class="ref">Romans 4:25</span> And he is the first of a multitude: <em>“Christ has been raised from the dead, the firstfruits of those who have died.”</em> <span class="ref">1 Corinthians 15:20</span> In him, death ceases to be an end.</p>
      <h2>A Single Paschal Mystery</h2>
      <p>The Cross and the Resurrection make but one act of salvation, which the Church calls the paschal mystery. Death there redeems, the Resurrection there gives life; one calls for the other, and Christ passes from one to the other to draw us with him. It is this mystery that every Mass celebrates and that every Easter renews.</p>
      <h2>Justification</h2>
      <p>What Christ merited on the Cross, he applies to each one through justification. To justify is to make just: God blots out sin and infuses into the heart <a href="#/article/sanctifying-grace">sanctifying grace</a>, truly transforming the sinner into an adopted son. <em>“Justified freely by his grace, through the redemption that is in Christ Jesus.”</em> <span class="ref">Romans 3:24</span> This grace reaches us through the sacraments: <a href="#/article/baptism">baptism</a> plunges us into the death and Resurrection of Christ, <em>“so that, as Christ was raised from the dead, we too might walk in newness of life,”</em> <span class="ref">Romans 6:4</span> and the <a href="#/article/the-eucharist">Eucharist</a> feeds us with his sacrifice. United to him, justified by his blood, we await rising as he did, on the last day.</p>
      <div class="fin-article">✦</div>
    `
},
'l-incarnation': {
  titre:"The Incarnation",
  resume:"The mystery by which the Son of God took flesh and became man without ceasing to be God: true God and true man, one single person in two natures united without confusion, for the salvation of men.",
  contenu:`
      <p>The Incarnation is the mystery by which the Son of God took a human nature and became man, without ceasing to be God. The word comes from the Latin incarnatio, “taking of flesh”: in him, God became flesh and dwelt among us. <em>“The Word became flesh, and dwelt among us, and we have seen his glory.”</em> <span class="ref">John 1:14</span></p>
      <h2>True God and true man</h2>
      <p>The one who became man is the <a href="#/article/the-son">eternal Son</a>, true God born of true God. In taking our nature, he lost nothing of his divinity: the fullness of God dwells in him, now in a flesh. <em>“In him dwells bodily the whole fullness of the divinity.”</em> <span class="ref">Colossians 2:9</span> He is thus at once true God and true man, fully the one and fully the other.</p>
      <h2>One single person, two natures</h2>
      <p>In him two natures meet, the divine and the human. Nature is what a thing is; the person is the one who is, the subject who says “I” and who acts. In Christ, the two natures do not mingle and do not change one into the other: each keeps what is proper to it, the divinity its omnipotence, the humanity its weakness. But they are united in one single subject, the unique person of the Son, who bears them both. It is he, the <a href="#/article/the-word">Word</a>, who is God from all eternity and who, in time, also became man. This union of the two natures in the unique person of the Word, the Church calls the hypostatic union, from the Greek word hypostasis, which designates the person. The Council of Chalcedon confessed it in 451: one and the same Christ, in two natures, without confusion or division.</p>
      <h2>True man, save sin</h2>
      <p>The human nature the Son took is entire: a body and a soul, a human intelligence and will. He grew, knew hunger, weariness, sorrow and death. In all things he shared our condition, except sin: <em>“tried in all things, in our likeness, save sin.”</em> <span class="ref">Hebrews 4:15</span> He took this flesh from the <a href="#/article/mary-mother-of-god">Virgin Mary</a>, conceived by the <a href="#/article/the-holy-spirit">Holy Spirit</a> on the day of the Annunciation: it is there that the eternal Son began to be man.</p>
      <h2>Why God became man</h2>
      <p>The Son did not become man for himself, but for us and for our <a href="#/article/salvation">salvation</a>. Of divine condition, he lowered himself to ours, out of love: <em>“He, of divine condition, emptied himself, taking the condition of a servant.”</em> <span class="ref">Philippians 2:6-7</span> He became what we are to give us what he is: <em>“Though he was rich, he became poor for you, so that by his poverty you might become rich.”</em> <span class="ref">2 Corinthians 8:9</span> In taking our nature, he healed it from within and united it to God: God became man so that man might share in the life of God. This is the wondrous exchange, at the heart of our redemption, which will be accomplished on the <a href="#/article/the-cross-and-the-resurrection">Cross</a>.</p>
      <div class="fin-article">✦</div>
    `
},
'les-fins-dernieres': {
  titre:"The Last Things",
  resume:"The ultimate realities that await man: death, which seals his choice; the particular judgment, which fixes his lot at once; paradise, purgatory or hell; then, at the end of time, the resurrection of the flesh and the last judgment.",
  contenu:`
      <p>The last things are the ultimate realities that await man: what comes at the end of his life, and what will come at the end of history. Tradition counts four of them, which it names the novissima, the “last things”: death, judgment, paradise and hell. To consider them is to look at where life leads, so as to live it in view of its true end.</p>
      <h2>Death</h2>
      <p>Death is the separation of the soul and the body, the term of earthly life. With it ends the time of merit: it is during this life that man chooses God or turns away from him, and death seals this choice. <em>“It is appointed for men to die once, after which comes the judgment.”</em> <span class="ref">Hebrews 9:27</span> Beyond it, one no longer converts; one is gathered such as one has become.</p>
      <h2>The particular judgment</h2>
      <p>Immediately after death, each soul appears before God and receives its sentence: this is the <a href="#/article/the-particular-judgment">particular judgment</a>. It fixes its lot at once, without waiting for the end of time. To the good thief, Jesus promises it that very day: <em>“Today, you will be with me in paradise.”</em> <span class="ref">Luke 23:43</span> Three states are then possible: paradise, purgatory or hell.</p>
      <h2>Paradise</h2>
      <p><a href="#/article/paradise">Paradise</a> is perfect and unending happiness: to see God as he is, face to face, and to live of his very life. The Church names this contemplation the beatific vision, for it makes blessed those who receive it. <em>“We shall be like him, for we shall see him as he is.”</em> <span class="ref">1 John 3:2</span> This happiness is given from the particular judgment to the fully purified souls, even before their body rises.</p>
      <h2>Purgatory</h2>
      <p>Many die in the <a href="#/article/sanctifying-grace">friendship of God</a>, but imperfectly purified, still marked by the after-effects of their sins. Before entering the full light of heaven, they pass through a purification, <a href="#/article/purgatory">purgatory</a>. These souls are <a href="#/article/salvation">already saved</a>: they only finish purifying themselves before seeing God. <em>“He will be saved, but as through fire.”</em> <span class="ref">1 Corinthians 3:15</span> We can hasten their entry into heaven by <a href="#/article/the-communion-of-saints">our prayer</a>.</p>
      <h2>Hell</h2>
      <p><a href="#/article/hell">Hell</a> is the eternal separation from God, the lot of the one who dies refusing his love voluntarily by an unrepented <a href="#/article/sin">mortal sin</a>. God damns no one by force: hell ratifies a refusal that man has willed and maintained to the end. <em>“Depart from me, you cursed, into the eternal fire.”</em> <span class="ref">Matthew 25:41</span> Its first pain is the privation of God, for whom the soul was made.</p>
      <h2>The resurrection of the flesh and the last judgment</h2>
      <p>History does not end on souls separated from their body. At the end of time, Christ will return in glory, the dead will <a href="#/article/the-cross-and-the-resurrection">rise</a> in their own body, and each one's soul will recover the flesh it animated: this is the <a href="#/article/the-resurrection-of-the-body">resurrection of the flesh</a>. Then will take place the <a href="#/article/the-last-judgment">last judgment</a>, universal and public, where God's justice over all of history will be manifested before all. <em>“All who are in the tombs will hear his voice, and they will come out.”</em> <span class="ref">John 5:28-29</span> The bodies of the just, glorified, will share forever the happiness of their soul.</p>
      <div class="fin-article">✦</div>
    `
},
'le-purgatoire': {
  titre:"Purgatory",
  resume:"The state of purification that the saved who are not yet fully purified pass through after death. Forgiveness remits the fault and the eternal penalty; a temporal penalty often remains to be acquitted, which purgatory completes. Our prayer can hasten the deliverance of these souls.",
  contenu:`
      <p>Purgatory is the state of purification that those who die in the <a href="#/article/sanctifying-grace">friendship of God</a> without yet being fully purified pass through <a href="#/article/the-last-things">after death</a>. Their salvation is secured: they will enter heaven with certainty. Before seeing God face to face, it remains for them to finish purifying themselves of all that, in them, is not yet fully turned toward him.</p>
      <h2>The fault and the penalty</h2>
      <p>Where does this need for purification come from? Every <a href="#/article/sin">sin</a> wounds twice: it offends God, and it leaves in man a mark, a disordered attachment to created things. When sin is forgiven, the offense is remitted, and with it the eternal penalty, the separation from God. There often remains a temporal penalty: a debt to be acquitted, the time it takes for God's love to finish straightening in us what sin had bent. This debt is paid here below, by <a href="#/article/satisfaction">penance</a> and the works of charity; what has not been acquitted before death is acquitted in purgatory. <em>“You will not come out of there until you have paid the last penny.”</em> <span class="ref">Matthew 5:26</span></p>
      <h2>What Scripture attests</h2>
      <p>Scripture shows that one can pray for the dead and that this prayer profits them. In the time of the Maccabees, Judas has a sacrifice offered for the fallen soldiers: <em>“It is a holy and wholesome thought to pray for the dead, that they may be loosed from their sins.”</em> <span class="ref">2 Maccabees 12:46</span> Such a prayer would be vain for the blessed, who have no need of it, and for the damned, whom no one can succor: it supposes a third state, where the soul purifies itself. Saint Paul evokes it as a passage through fire: <em>“He will suffer loss, but he himself will be saved, but as through fire.”</em> <span class="ref">1 Corinthians 3:15</span> And Jesus suggests that certain faults can be remitted beyond death: <em>“It will not be forgiven him, neither in this age nor in the age to come.”</em> <span class="ref">Matthew 12:32</span></p>
      <h2>A suffering in hope</h2>
      <p>The purification of purgatory is real and painful: the soul suffers there from being still held far from the God it loves and desires with all its strength. This suffering is wholly inhabited by hope, for these souls know that they are <a href="#/article/salvation">saved</a> and that their waiting has a term. This fire purifies like gold in the crucible: it consumes what remains impure to make the soul worthy of the full light. The state is transitory; it will end, and all these souls will see God.</p>
      <h2>We can help them</h2>
      <p>The souls of purgatory can no longer merit for themselves, but we, the living, can relieve them and hasten their deliverance. This is the sense of suffrages: prayer, almsgiving, penance offered for their intention, and above all the sacrifice of the <a href="#/article/the-eucharist">Mass</a>, where the Cross of Christ is made present for them. In this we live the <a href="#/article/the-communion-of-saints">communion of saints</a>: the Church of earth comes to the aid of the Church that purifies itself, in the one charity that links all the members of Christ.</p>
      <div class="fin-article">✦</div>
    `
},
'la-confession': {
  titre:"Confession",
  resume:"The sacrament by which the baptized receives, through the ministry of the priest, the forgiveness of the sins committed since his baptism. Christ gave its power to his apostles; through the contrition, the avowal and the satisfaction of the penitent, the absolution remits the fault and restores grace, reconciling the sinner with God and with the Church.",
  contenu:`
      <p>Confession is one of the seven sacraments of the Church, those signs instituted by Christ to give grace. By it, the baptized receives from God, through the ministry of the <a href="#/article/holy-orders">priest</a>, the forgiveness of the sins committed since his baptism. It is also called penance, from the name of the regret that animates it, and reconciliation, because it restores the friendship with God that sin had broken.</p>
      <h2>A power given by Christ</h2>
      <p>On the evening of Easter, the Risen One entrusts to his apostles an unheard-of power: to remit sins in his name. <em>“Receive the Holy Spirit. Those whose sins you remit, they are remitted to them; those whose sins you retain, they are retained.”</em> <span class="ref">John 20:22-23</span> Forgiveness comes from God alone, but God willed to give it through men. The priest does not forgive in his own name: he acts in the name of Christ, the instrument through which mercy passes. This is what Paul calls the ministry of reconciliation: <em>“God has entrusted to us the ministry of reconciliation.”</em> <span class="ref">2 Corinthians 5:18</span> To confess to a priest is to receive forgiveness where Christ willed to place it.</p>
      <h2>The acts of the penitent and the absolution</h2>
      <p>The sacrament brings into play three acts of the penitent. Contrition first: the sincere regret of one's sins, with the resolution to sin no more; it is the most important act, for without regret there is no forgiveness. Confession next: the avowal of sins to the priest, which exposes the wound to the light so that it may be healed. <em>“If we confess our sins, he is faithful and just to forgive us them.”</em> <span class="ref">1 John 1:9</span> Satisfaction last: to accomplish the reparation the priest asks, a prayer or a good work, which is called <a href="#/article/satisfaction">the penance</a> and which redresses the disorder left by sin. To these three acts responds <a href="#/article/absolution">the absolution</a>: the words by which the priest, in the name of Christ, remits the sins.</p>
      <h2>What confession works</h2>
      <p>The absolution remits the fault and, with it, the eternal penalty: the soul that had lost <a href="#/article/sanctifying-grace">grace</a> by a <a href="#/article/sin">mortal sin</a> recovers it and becomes again a friend of God. There sometimes remains a temporal penalty to be acquitted, which satisfaction begins to repair and which <a href="#/article/purgatory">purgatory</a> completes if need be. The penitent is also reconciled with the <a href="#/article/the-church">Church</a>, which he had wounded by his sin, for no one sins alone.</p>
      <h2>The second plank</h2>
      <p>The sacrifice of the Cross has redeemed once for all the sins of all men; it is the one source of all forgiveness, and nothing is added to it. <em>“By a single offering, he has made perfect forever those whom he sanctifies.”</em> <span class="ref">Hebrews 10:14</span> But this forgiveness must reach each one and be received. <a href="#/article/baptism">Baptism</a> applies it a first time and brings to rebirth in the life of God. When the baptized then falls again into sin, he cuts himself off from the grace received; Christ willed that this same forgiveness of the Cross be given back to him through confession. It adds nothing to the sacrifice of Christ: it makes its grace pass to the sinner who had strayed from it. Tradition calls it the second plank after the shipwreck: to whoever has been shipwrecked, it offers to regain the shore. And all that is confided there remains protected by the <a href="#/article/the-seal-of-confession">absolute secret of confession</a>, which no reason can break.</p>
      <div class="fin-article">✦</div>
    `
},
'la-primaute-de-pierre': {
  titre:"The Primacy of Peter",
  resume:"The preeminence that Christ gave to Peter over the apostles and over the whole Church: named the rock on which the Church is built, he receives the keys of the Kingdom and the charge of feeding the flock. This primacy, which makes him the visible foundation of unity, is transmitted to the bishops of Rome, his successors.",
  contenu:`
      <p>The primacy of Peter is the place of chief that Christ gave to the apostle Peter among the other apostles and over the whole Church. Peter receives a true authority to govern her: he is her visible head, the one who holds her united and around whom all remain gathered. This charge does not die with him; it continues in the pope, who takes his place.</p>
      <h2>You are Peter</h2>
      <p>At Caesarea, Simon confesses that Jesus is the Christ, the <a href="#/article/the-son">Son of the living God</a>. In response, Jesus gives him a new name and a mission: <em>“You are Peter, and on this rock I will build my Church, and the gates of hell will not prevail against it.”</em> <span class="ref">Matthew 16:18</span> The name Peter, in Aramaic Kephas, means the rock: Simon becomes the stone on which the edifice will stand. Then Jesus hands him the keys: <em>“I will give you the keys of the kingdom of heaven.”</em> <span class="ref">Matthew 16:19</span> In the Bible, to hold the keys of a house is to have its government; the keys of the Kingdom confer on Peter the authority to open and to close, to bind and to loose in the name of Christ.</p>
      <h2>Feed my sheep</h2>
      <p>The promise becomes a charge after the <a href="#/article/the-cross-and-the-resurrection">Resurrection</a>. Three times, the Risen One asks Peter if he loves him, and three times entrusts his flock to him: <em>“Feed my sheep.”</em> <span class="ref">John 21:17</span> Peter thus receives the keeping of all the sheep of Christ, the other shepherds included. On the evening of the Supper, Jesus had already entrusted to him a singular mission: to sustain the faith of his brothers. <em>“I have prayed for you, that your faith may not fail; and you, strengthen your brothers.”</em> <span class="ref">Luke 22:32</span></p>
      <h2>The Rock and the rock</h2>
      <p>One single stone founds the Church in the last resort: Christ. <em>“No one can lay another foundation than the one already laid, Jesus Christ.”</em> <span class="ref">1 Corinthians 3:11</span> Peter holds his role from this unique foundation: he is the visible rock by which Christ, the invisible Rock, maintains his Church in time. In giving Simon his own name of Rock, the Lord makes him participate in what he himself is, remaining the one source from which Peter receives everything.</p>
      <h2>A charge that remains</h2>
      <p>The <a href="#/article/the-church">Church</a> is built to last until the end of time; her visible foundation thus had to last as long as she does. The charge of Peter did not die out at his death: it passes to his successors. Peter finished his course at Rome, where he shed his blood; the bishop of Rome is his heir, and this is why the pope today exercises the same primacy over the whole Church. It is on this charge that rests the <a href="#/article/papal-infallibility">charism by which he confirms his brothers</a> in the faith without leading them astray.</p>
      <div class="fin-article">✦</div>
    `
},
'la-satisfaction': {
  titre:"Satisfaction",
  resume:"The third act of the penitent in the sacrament of penance: to repair the disorder caused by sin. Forgiveness remits the fault and the eternal penalty; a temporal penalty often remains, which prayer, fasting and almsgiving repair, united to the one satisfaction of Christ, and which purgatory completes if need be.",
  contenu:`
      <p>Satisfaction is the third act of the penitent in <a href="#/article/confession">the sacrament of penance</a>: to repair the disorder that <a href="#/article/sin">sin</a> caused, by accomplishing the penalty the priest indicates, prayer, fasting or good work. It is what is commonly called the penance given at the confessional.</p>
      <h2>A penalty that remains after the pardon</h2>
      <p>When sin is forgiven, the fault is erased and the eternal penalty remitted. There yet often remains a <a href="#/article/purgatory">temporal penalty</a>, a debt to be acquitted. Scripture shows it in the history of David: his sin confessed, the prophet Nathan announces to him the pardon, then a penalty that subsists. <em>“The Lord has forgiven your sin; you will not die.”</em> <span class="ref">2 Samuel 12:13</span> And yet the child born of the fault will die: the pardon of the fault has not erased every consequence.</p>
      <h2>To repair is to heal</h2>
      <p>This reparation does not seek to sway a demanding God, for forgiveness is given freely. It heals the sinner of the attachment that sin has left in him, and redresses the wrong committed. When Zacchaeus converts, he does not stop at regret: he repairs. <em>“If I have wronged anyone, I restore to him fourfold.”</em> <span class="ref">Luke 19:8</span> Prayer, fasting and almsgiving are the traditional ways of this reparation; when a precise wrong has been done to the neighbor, satisfaction asks first to redress it.</p>
      <h2>Grafted onto the Cross</h2>
      <p>Our satisfactions have no value by themselves alone: they receive it from the one satisfaction of Christ, who repaired on the <a href="#/article/the-cross-and-the-resurrection">Cross</a> what no man could repair. United to his, our accepted penalties become fruitful. What has not been repaired before death will be in purgatory; and the Church, drawing on the treasury of the merits of Christ, can remit part of it by indulgences.</p>
      <div class="fin-article">✦</div>
    `
},
'le-secret-de-la-confession': {
  titre:"The Seal of Confession",
  resume:"The absolute obligation, for the priest, never to reveal what a penitent confides to him: the sacramental seal. Because the avowal is made to God through the ministry of the priest, no motive can break it; this inviolable silence protects the penitent and the trust without which no one would dare to open up.",
  contenu:`
      <p>The secret of confession is the obligation, for the priest, never to reveal what a penitent, the one who comes to confess his sins, has confided to him. This rule bears a name: the sacramental seal. Just as a seal closes a letter that no one will open, the priest keeps forever closed what he has heard.</p>
      <h2>A secret without any exception</h2>
      <p>The seal covers everything the penitent confides in order to receive forgiveness: his <a href="#/article/sin">sins</a>, their circumstances, all that could make him recognized. The confessor can neither repeat it, nor use it, nor even let it be guessed by a word or an attitude. No reason, however grave, lifts this obligation: neither the order of a judge, nor the danger to another, nor the need to clear himself. The secret is entire, without the slightest breach.</p>
      <h2>Received in the name of God</h2>
      <p>Where does this inviolability come from? In <a href="#/article/confession">confession</a>, the penitent does not speak to a man: he speaks to God, of whom the priest is only the instrument. What is avowed is confided to the divine mercy, which erases and forgets. <em>“It is I who erase your transgressions, and I will remember your sins no more.”</em> <span class="ref">Isaiah 43:25</span> The priest, mere minister of this pardon, is bound to the same forgetting: he has heard as the ear of God; what he has received thus belongs to God alone. This silence also guards the trust without which no one would dare to open his soul.</p>
      <h2>A fidelity kept to the end</h2>
      <p>To betray this secret is, for a priest, one of the gravest faults he can commit. The Church has always held it inviolable, and confessors have preferred prison or death rather than to deliver what had been confided to them. <em>“The slanderer reveals secrets, but the faithful of heart keeps the matter hidden.”</em> <span class="ref">Proverbs 11:13</span> The penitent can therefore say everything without fear: what he deposits in the confessional will never come out of it.</p>
      <div class="fin-article">✦</div>
    `
},
'l-absolution': {
  titre:"Absolution",
  resume:"The word by which the priest, in the name of Christ, remits his sins to the penitent: the central act of confession, where forgiveness is effectively given. The priest confers forgiveness in the place of Christ, and absolution bears its fruit in the heart that regret and avowal have disposed.",
  contenu:`
      <p>Absolution is the word by which the priest, in the name of Christ, remits his sins to the penitent, the one who has just confessed them. The word comes from the Latin absolvere, to loose: absolution looses the sinner from the bond that <a href="#/article/sin">sin</a> had tied in him. It is the central act of <a href="#/article/confession">confession</a>, the moment when forgiveness is effectively given.</p>
      <h2>A word that truly looses</h2>
      <p>By absolution, sins are really remitted: the word of the priest is the very act by which God forgives. Christ gave his apostles the power to remit sins, and this power acts for real. <em>“Those whose sins you remit, they are remitted to them.”</em> <span class="ref">John 20:23</span> What the priest looses on earth, God holds as loosed in heaven. <em>“Whatever you loose on earth will be loosed in heaven.”</em> <span class="ref">Matthew 18:18</span></p>
      <h2>It is Christ who forgives</h2>
      <p>The priest forgives in the place of Christ, as his ambassador, by a power he holds from the Lord. <em>“It is in the name of Christ that we serve as ambassadors.”</em> <span class="ref">2 Corinthians 5:20</span> This is why, lending his voice to the Lord, he declares: “I absolve you of your sins, in the name of the Father, and of the Son, and of the Holy Spirit.” The one who forgives, by this mouth, is Christ himself.</p>
      <h2>What man brings, what God gives</h2>
      <p>It is God who forgives, by absolution; the regret of man disposes the heart to receive this gift. God gives it in respect of our freedom: he attaches forgiveness to sincere regret and to the avowal of faults. Absolution then bears all its fruit in the heart that is truly repentant. The act of the priest and the opening of the heart meet: the one bears the power of Christ, the other lets it enter.</p>
      <div class="fin-article">✦</div>
    `
},
'le-paradis': {
  titre:"Paradise",
  resume:"The perfect and eternal happiness of the elect, also called heaven: to see God face to face, the beatific vision, and to live of his life. This supernatural gift fills every desire of man, made for God; it is a communion, that of the saints brought to its term, and will overflow onto the glorified body at the resurrection.",
  contenu:`
      <p>Paradise is the state of perfect and unending happiness where the elect, fully united to God, share his life and his joy forever. It is also called heaven, the dwelling of God and of the blessed. It is the end for which man was created, and his total accomplishment.</p>
      <h2>To see God face to face</h2>
      <p>The heart of heavenly happiness is to see God as he is. The Lord promised it to the pure of heart: <em>“Blessed are the pure of heart, for they shall see God.”</em> <span class="ref">Matthew 5:8</span> On earth, we know God through his works and in faith; in paradise, we will see him directly, face to face. The Church names this contemplation the beatific vision, for it makes blessed those who receive it. <em>“Now we see in a mirror, dimly; but then it will be face to face.”</em> <span class="ref">1 Corinthians 13:12</span> To see God thus surpasses the powers of every creature: it is God himself who raises the soul by his <a href="#/article/sanctifying-grace">grace</a> to make it able to contemplate him.</p>
      <h2>The happiness that fills all</h2>
      <p>Man is made for God, and God alone can fill his heart. In paradise, this desire finds at last its full satisfaction: God gives himself entirely, and the soul is filled without measure and without end. This happiness surpasses all that we can imagine here below. <em>“What the eye has not seen, what the ear has not heard, this is what God has prepared for those who love him.”</em> <span class="ref">1 Corinthians 2:9</span></p>
      <h2>The shared joy</h2>
      <p>The happiness of paradise is a communion. The blessed live in the joy of God and in the joy of one another: it is the <a href="#/article/the-communion-of-saints">communion of saints</a> brought to its term, the city where God dwells with his own. <em>“Behold the dwelling of God with men; he will dwell with them, and they will be his people.”</em> <span class="ref">Revelation 21:3</span> The souls of the just taste this happiness immediately after the <a href="#/article/the-last-things">judgment</a>; at the end of time, when the bodies <a href="#/article/the-cross-and-the-resurrection">rise</a>, their joy will overflow onto the glorified flesh, and the whole man, body and soul, will live of God.</p>
      <div class="fin-article">✦</div>
    `
},
'l-enfer': {
  titre:"Hell",
  resume:"The state of eternal separation from God, the lot of the one who dies refusing his love freely. Its first pain is the loss of God, for whom the soul was made; its eternity holds to the choice fixed at death. God wills the salvation of all: hell is the term of a free refusal, the reverse side of the greatness of our freedom.",
  contenu:`
      <p>Hell is the state of eternal separation from God, the lot of the one who dies in a state of <a href="#/article/sin">mortal sin</a>, refusing voluntarily the love of God.</p>
      <h2>The loss of God</h2>
      <p>The pain of hell is first the loss of God. The soul was created for God, as for its only happiness; to be separated from him forever is the deepest suffering, which tradition calls the pain of loss, the privation of God. <em>“They will suffer the penalty of eternal perdition, far from the face of the Lord.”</em> <span class="ref">2 Thessalonians 1:9</span> To this privation is added another pain, which tradition names the pain of sense and which Scripture figures by fire. <em>“Depart from me, you cursed, into the eternal fire.”</em> <span class="ref">Matthew 25:41</span></p>
      <h2>Forever</h2>
      <p>Hell is eternal. <em>“These will go into eternal punishment, and the just into eternal life.”</em> <span class="ref">Matthew 25:46</span> Its eternity holds to what is fixed at <a href="#/article/the-last-things">death</a>: the time of choice ends then, and the soul remains forever in the orientation it has taken. The one who has definitively turned away from God remains enclosed in this refusal.</p>
      <h2>The fruit of a free refusal</h2>
      <p>The cause of hell is in the free refusal of man. God wills the <a href="#/article/salvation">salvation</a> of all: <em>“God wills that all men be saved.”</em> <span class="ref">1 Timothy 2:4</span> Hell is the term of a refusal conscious and maintained to the end; God respects this choice and ratifies it. To love supposes being able to refuse, and the possibility of hell is the reverse side of the greatness of our freedom. This is why Christ warns of it with gravity, to turn each one away from this path and call him to conversion; and the Church, which declares no man damned, entrusts all the departed to the mercy of God.</p>
      <div class="fin-article">✦</div>
    `
},
'le-jugement-particulier': {
  titre:"The particular judgment",
  resume:"The encounter by which each soul, at the instant of its death, appears before God and receives at once its eternal lot: paradise, purgatory then paradise, or hell. It fixes for each what the last judgment will manifest before all at the end of the world.",
  contenu:`
      <p>The particular judgment is the encounter by which each soul, at the very instant of its death, appears before God and receives at once its eternal lot. It is called “particular” because it concerns each person separately, at the moment of leaving this life.</p>
      <h2>At the instant of death</h2>
      <p>The time of life is the time of choice. As long as man lives, he can turn toward God or away from him, lose himself or recover. Death seals this time: the soul presents itself before God in the state in which it left, and what it has chosen becomes definitive. <em>“It is appointed for men to die once, and after that comes judgment.”</em> <span class="ref">Hebrews 9:27</span></p>
      <h2>An immediate retribution</h2>
      <p>The particular judgment gives the soul its lot at once, without waiting for the end of the world. The one who dies in the friendship of God and fully purified enters <a href="#/article/paradise">paradise</a>; the one who dies in this friendship but must still be purified passes through <a href="#/article/purgatory">purgatory</a> before entering it; the one who dies refusing voluntarily the love of God goes to <a href="#/article/hell">hell</a>. To the good thief crucified beside him, Christ promises heaven for that very day. <em>“Today you will be with me in paradise.”</em> <span class="ref">Luke 23:43</span></p>
      <h2>The particular judgment and the last judgment</h2>
      <p>The particular judgment fixes the lot of each soul at its death. The <a href="#/article/the-last-judgment">last judgment</a>, at the end of the world, will manifest it before all: when Christ returns in his glory, all the <a href="#/article/the-resurrection-of-the-body">risen</a> will appear together, and what was already decided for each will be made public and confirmed before the whole universe. <em>“When the Son of man comes in his glory, he will separate men one from another, as the shepherd separates the sheep from the goats.”</em> <span class="ref">Matthew 25:31-32</span></p>
      <div class="fin-article">✦</div>
    `
},
'la-resurrection-de-la-chair': {
  titre:"The resurrection of the body",
  resume:"The reunion, at the last day, of each soul with its own body, made immortal. Salvation reaches the whole man; founded on the resurrection of Christ, the firstfruits of ours, it is universal. The saved receive a glorious body, like that of Christ; the body of the damned rises immortal and imperishable, but without glory.",
  contenu:`
      <p>The resurrection of the body is the reunion, at the last day, of each soul with its own body, now made immortal. Man is body and soul: death separates them, the resurrection reunites them forever.</p>
      <h2>Man whole and entire</h2>
      <p>Man is a being of flesh as much as of spirit: his soul and his body together form one single person. Death violently separates what was made to be united, the soul going toward God and the body returning to the earth. The <a href="#/article/salvation">salvation</a> God gives reaches the whole man: it will also restore the body to life.</p>
      <h2>The risen Christ, pledge of our resurrection</h2>
      <p>The foundation of this hope is the <a href="#/article/the-cross-and-the-resurrection">resurrection of Christ</a>. Coming out alive from the tomb, in his own body, he opened the way: his victory over death is the source and the model of ours. <em>“Christ has risen from the dead, the firstfruits of those who have fallen asleep.”</em> <span class="ref">1 Corinthians 15:20</span> The word “firstfruits” designates the first fruits of the harvest, those that announce and guarantee all the rest: the resurrection of Christ assures ours.</p>
      <h2>The glorious body of the saved</h2>
      <p>The body that rises is the same body, made glorious for those whom God saves. Subject here to weariness, sickness and death, it will rise endowed with new qualities: it will no longer be able to suffer or die, it will shine with light, it will obey the soul fully. <em>“What is sown a corruptible body rises incorruptible.”</em> <span class="ref">1 Corinthians 15:42</span> This body will be made like that of the risen Christ. <em>“He will transform our lowly body to make it like his glorious body.”</em> <span class="ref">Philippians 3:21</span></p>
      <h2>The resurrection of all, at the last day</h2>
      <p>All the dead rise, the just as well as the unjust; death once conquered, no body dies or decays anymore. Glory remains, however, the portion of the saved alone: the body of the damned rises immortal and imperishable, able to suffer, and it is in it that they bear their punishment forever. <em>“All those who are in the tombs will hear his voice and come out: those who have done good for a resurrection of life, those who have done evil for a resurrection of judgment.”</em> <span class="ref">John 5:28-29</span> This resurrection will take place at the end of the world, at the return of Christ. The lot of each, already fixed at death by the <a href="#/article/the-particular-judgment">particular judgment</a>, then reaches the whole man, body and soul, at the <a href="#/article/the-last-judgment">last judgment</a>. The hope of it already runs through all the Old Testament. <em>“I know that my Redeemer lives, and that at the last day I will rise from the earth; and from my flesh I will see God.”</em> <span class="ref">Job 19:25-26</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-jugement-dernier': {
  titre:"The last judgment",
  resume:"The appearing of all men before Christ, at the end of the world, after the resurrection of the dead. At the glorious return of the Lord, what the particular judgment had fixed for each soul is manifested and confirmed before the whole universe, for the whole man; God's justice over all of history breaks open, and creation is renewed.",
  contenu:`
      <p>The last judgment is the appearing of all men before Christ, at the end of the world, after the resurrection of the dead. What the <a href="#/article/the-particular-judgment">particular judgment</a> fixed for each soul at its death is there manifested before the whole universe: God's justice over all of history then breaks into the open.</p>
      <h2>The return of Christ in glory</h2>
      <p>At the end of the world, Christ will return in glory. Having ascended to heaven after his resurrection, he will come a second time, visible to all, to judge the living and the dead. This return is called the Parousia, a Greek word that means the coming, the presence of the Lord. <em>“This Jesus who was taken up to heaven will return in the same way you saw him go.”</em> <span class="ref">Acts 1:11</span></p>
      <h2>All appear together</h2>
      <p>The last judgment is universal: all men of all history, <a href="#/article/the-resurrection-of-the-body">risen</a> in their body, appear together before Christ the judge. No one escapes it. <em>“We must all appear before the tribunal of Christ.”</em> <span class="ref">2 Corinthians 5:10</span></p>
      <h2>The manifestation of all</h2>
      <p>This day reveals what was hidden. The thoughts, words and acts of each, the good as well as the evil, and their consequences throughout all history, are unveiled before all. <em>“He will bring to light what is hidden in darkness and manifest the designs of hearts.”</em> <span class="ref">1 Corinthians 4:5</span> The lot fixed at death by the particular judgment is then manifested and confirmed before the whole universe, for the whole man, body and soul reunited. Christ separates the just and the reprobate. <em>“When the Son of man comes in his glory, he will separate men one from another, as the shepherd separates the sheep from the goats.”</em> <span class="ref">Matthew 25:31-32</span> The first enter <a href="#/article/paradise">paradise</a> forever, the others <a href="#/article/hell">hell</a>.</p>
      <h2>New heavens and a new earth</h2>
      <p>The last judgment closes the <a href="#/article/the-last-things">last things</a> and completes history. The whole creation, freed from evil, is renewed and joined to the glory of the saved; God is then all in all. <em>“We await new heavens and a new earth where justice will dwell.”</em> <span class="ref">2 Peter 3:13</span></p>
      <div class="fin-article">✦</div>
    `
},
'le-mariage': {
  titre:"Marriage",
  resume:"The covenant by which a man and a woman give themselves to each other for their whole life, ordered to their mutual love and to the welcoming of children. Inscribed by God in creation and raised by Christ to the rank of a sacrament, a sign of his union with the Church, it is one and indissoluble; the spouses give it to each other by their consent and receive from it a proper grace.",
  contenu:`
      <p>Marriage is the covenant by which a man and a woman give themselves to each other for their whole life, forming a community ordered to their mutual love and to the welcoming of children. Between two baptized persons, Christ raised it to the dignity of a sacrament, a sacred sign that truly gives the grace of God.</p>
      <h2>Instituted by God from the origin</h2>
      <p>God inscribed marriage in the nature of man and woman from creation. Creating them one for the other, he unites them in a single life and blesses them for fruitfulness. <em>“A man will leave his father and his mother, he will cling to his wife, and they will become one flesh.”</em> <span class="ref">Genesis 2:24</span> This union of one man and one woman is open to life. <em>“Be fruitful and multiply.”</em> <span class="ref">Genesis 1:28</span></p>
      <h2>Raised by Christ to the rank of a sacrament</h2>
      <p>Christ raised marriage to the dignity of a sacrament by uniting it to his own covenant with the <a href="#/article/the-church">Church</a>. The love of the spouses reproduces the love of Christ for her: as Christ gives himself for the Church to the <a href="#/article/the-cross-and-the-resurrection">Cross</a>, remains united to her without ever separating from her, and makes her fruitful, the spouses give themselves to each other wholly, remain united for life, and open their love to life. The visible union of the two spouses thus gives to see the invisible union of Christ and the Church: it is in this that it is the sign of it. <em>“This mystery is great: I say it in reference to Christ and the Church.”</em> <span class="ref">Ephesians 5:32</span> This elevation supposes the <a href="#/article/baptism">baptism</a> of the two spouses, which makes them members of Christ: it is because they belong to him that their union can bear the sign of his union with the Church. The marriage of two baptized persons is therefore always a sacrament, whether they are Catholics or of different Christian confessions; and if one is not baptized, their union, a true marriage willed by God, is raised to the rank of a sacrament the day he receives baptism.</p>
      <h2>Unity and indissolubility</h2>
      <p>Marriage possesses two properties essential to it: unity and indissolubility. Unity: one man and one woman. Indissolubility: the bond lasts until death, for what God unites, no one can undo. Christ affirms it, returning to the design of the beginning. <em>“Let man not separate what God has joined.”</em> <span class="ref">Matthew 19:6</span></p>
      <h2>Consent and grace</h2>
      <p>It is the spouses themselves who give each other the sacrament, by exchanging their consent, the free yes by which each gives and receives the other. The priest or the deacon receives this consent in the name of the Church and blesses the covenant. By this sacrament, God grants the spouses a proper <a href="#/article/sanctifying-grace">grace</a>: it strengthens their love, helps them to sanctify each other and to welcome and raise their children in the faith.</p>
      <div class="fin-article">✦</div>
    `
},
'la-confirmation': {
  titre:"Confirmation",
  resume:"The sacrament that gives the baptized the fullness of the Holy Spirit, as the apostles received it at Pentecost. The third sacrament of initiation, after baptism and with the Eucharist, it perfects baptismal grace, increases the gifts of the Spirit, imprints a definitive seal and gives the force to bear witness to the faith.",
  contenu:`
      <p>Confirmation is the sacrament that gives the baptized the fullness of the <a href="#/article/the-holy-spirit">Holy Spirit</a>, as the apostles received it at Pentecost. At baptism, the Christian is reborn as a child of God; at confirmation, he receives the Spirit in fullness, which strengthens him in this new life and clothes him with the force to bear witness to his faith.</p>
      <h2>The completion of Christian initiation</h2>
      <p>Three sacraments bring one into the Christian life and carry it to its fullness: <a href="#/article/baptism">baptism</a>, confirmation and the <a href="#/article/the-eucharist">Eucharist</a>. Baptism gives rebirth to the life of God; confirmation strengthens in it and gives the Spirit in fullness; the Eucharist nourishes with the flesh of Christ. Confirmation thus perfects the grace received at baptism.</p>
      <h2>The gift of the Spirit in fullness</h2>
      <p>At baptism, the Holy Spirit already makes the Christian a child of God and dwells in him. Confirmation gives him this same Spirit in fullness, in the manner of Pentecost, where fearful disciples were transformed into intrepid witnesses. On that day, the Spirit descended on the apostles and filled them. <em>“They were all filled with the Holy Spirit.”</em> <span class="ref">Acts 2:4</span> The apostles then communicated this gift by the imposition of hands. In Samaria, men already baptized had not yet received the Spirit in this way: Peter and John came to lay their hands on them, and they received him. <em>“They laid their hands on them, and they received the Holy Spirit.”</em> <span class="ref">Acts 8:17</span> This gesture, distinct from baptism and performed by the apostles, is the origin of confirmation.</p>
      <h2>The gifts of the Spirit</h2>
      <p>The seven gifts of the Spirit, wisdom, understanding, counsel, fortitude, knowledge, piety and fear of God, accompany grace and are already received at baptism. By giving the Spirit in fullness, confirmation increases and strengthens them, making the Christian more docile to his action. <em>“Upon him will rest the Spirit of the Lord, a spirit of wisdom and understanding, a spirit of counsel and might, a spirit of knowledge and of fear of the Lord.”</em> <span class="ref">Isaiah 11:2</span></p>
      <h2>The rite and the seal</h2>
      <p>Confirmation is given by the anointing with holy chrism, a perfumed oil consecrated by the bishop, traced on the forehead of the confirmed with these words: “Be sealed with the Holy Spirit, the gift of God.” The bishop, successor of the apostles, is its minister, sign of the bond that unites the confirmed to the whole <a href="#/article/the-church">Church</a>. Like baptism, this sacrament imprints in the soul a spiritual and definitive seal: it is received only once. <em>“God has marked us with his seal.”</em> <span class="ref">2 Corinthians 1:22</span></p>
      <h2>The force to bear witness</h2>
      <p>Confirmation produces in the baptized what Pentecost produced in the apostles. Already disciples of Christ, they received that day the force to go out and proclaim the Gospel before all, without fear. In the same way, the confirmed is clothed with the force of the Spirit to confess his <a href="#/article/faith">faith</a>, to announce it and to defend it, and to become a witness of Christ before the world. Christ had promised it to his apostles before ascending to heaven. <em>“You will receive a force, that of the Holy Spirit who will come upon you, and you will be my witnesses.”</em> <span class="ref">Acts 1:8</span></p>
      <div class="fin-article">✦</div>
    `
},
'l-onction-des-malades': {
  titre:"The anointing of the sick",
  resume:"The sacrament by which Christ comes to sustain and save those whom grave illness or old age wears down. By the anointing with a blessed oil and the prayer of the Church, received from the apostles and described by Saint James, it unites the suffering of the sick to his Passion, gives them strength and peace, remits their sins and, for the dying, prepares the passage to the Father.",
  contenu:`
      <p>The anointing of the sick is the sacrament by which Christ comes to sustain and save those whom grave illness or old age wears down. By the anointing with a blessed oil and the prayer of the Church, he gives them his strength, consoles their heart, remits their sins and unites them to his Passion.</p>
      <h2>For the sick and the aged</h2>
      <p>This sacrament is for every faithful whose health is seriously impaired, by a grave illness, before an important operation, or by the weakening of old age. It can be received several times: each time the condition worsens, or a new serious illness arises. It accompanies the sick throughout the trial.</p>
      <h2>The gesture received from the Lord</h2>
      <p>Christ went through Galilee healing the sick, and he gave his apostles the same power. They <em>“anointed with oil many sick and healed them.”</em> <span class="ref">Mark 6:13</span> The Church received this gesture from them, which Saint James describes as a sacrament entrusted to the priests. <em>“Is anyone among you sick? Let him call the priests of the Church, and let them pray over him, anointing him with oil in the name of the Lord. The prayer of faith will save the sick man, and if he has committed sins, they will be forgiven him.”</em> <span class="ref">James 5:14-15</span></p>
      <h2>The grace of the sacrament</h2>
      <p>The grace of this sacrament comforts the sick person: it gives him the strength, the peace and the courage to bear his trial as a Christian, and raises him up interiorly, as Saint James promises. It also remits his sins, above all when he can no longer <a href="#/article/confession">confess</a> them, and can obtain the healing of the body if God judges it good for the salvation of the soul. More deeply, it unites the sick person to the <a href="#/article/the-cross-and-the-resurrection">Passion of Christ</a>: Scripture teaches that suffering offered with the Lord becomes fruitful and leads to glory. <em>“If we suffer with him, it is to be glorified with him.”</em> <span class="ref">Romans 8:17</span></p>
      <h2>The passage to the Father</h2>
      <p>For the one who approaches the end, the anointing becomes a preparation for the last passage: it strengthens him for the encounter with God and leads him toward <a href="#/article/the-last-things">eternal life</a>. The Church then also gives him the <a href="#/article/the-eucharist">Eucharist</a> as viaticum, the bread of the journey that nourishes the passage from this life to the Father.</p>
      <div class="fin-article">✦</div>
    `
},
'l-ordre': {
  titre:"Holy Orders",
  resume:"The sacrament by which the mission Christ entrusted to his apostles continues in the Church until the end of time. By the imposition of the bishop's hands, it establishes men to teach, sanctify and lead the people of God in the name of Christ. Received in three degrees, bishop, priest and deacon, it imprints a definitive seal and makes the ordained act in the person of Christ, at the service of the common priesthood of all the baptized.",
  contenu:`
      <p>Holy Orders is the sacrament by which the mission Christ entrusted to his apostles continues in the <a href="#/article/the-church">Church</a> until the end of time. By the imposition of the bishop's hands, it establishes men in the service of the people of God, to teach, to sanctify through the sacraments and to lead the community in the name of Christ.</p>
      <h2>The mission of the apostles continued</h2>
      <p>Christ chose the apostles, sent them as the Father had sent him, and gave them a share in his own mission. <em>“As the Father has sent me, I also send you.”</em> <span class="ref">John 20:21</span> At the Last Supper, he entrusts to them the renewal of his sacrifice. <em>“Do this in memory of me.”</em> <span class="ref">Luke 22:19</span> The apostles transmitted this ministry to others by the imposition of hands, and these in turn, in an unbroken chain down to our bishops: this is the apostolic succession. <em>“Rekindle the gift of God that you received through the imposition of my hands.”</em> <span class="ref">2 Timothy 1:6</span></p>
      <h2>The three degrees of Holy Orders</h2>
      <p>The sacrament of Holy Orders is received in three degrees. The bishop possesses the fullness of the priesthood: successor of the apostles, he teaches, sanctifies and governs his Church, and he alone can confer this sacrament on others. The priest is his collaborator: he celebrates the <a href="#/article/the-eucharist">Eucharist</a>, <a href="#/article/confession">forgives sins</a> and guides the faithful entrusted to him. The deacon is ordained for service: the service of charity toward the poor, that of the liturgy and the proclamation of the Word. This ministry of deacons was instituted from the earliest times of the Church. <em>“They presented them to the apostles, who prayed and laid their hands on them.”</em> <span class="ref">Acts 6:6</span></p>
      <h2>Acting in the person of Christ</h2>
      <p>Holy Orders configures forever the one who receives it to the priesthood of Christ, priest for eternity, and that is why it is received only once. <em>“You are a priest forever, according to the order of Melchizedek.”</em> <span class="ref">Hebrews 7:17</span> By this sacrament, the ordained acts in the person of Christ. The Lord identifies himself with those he sends, to the point that their word and their gesture are his. <em>“Whoever listens to you listens to me, and whoever rejects you rejects me.”</em> <span class="ref">Luke 10:16</span> Saint Paul uses the very expression when he forgives in the name of the Lord. <em>“What I have forgiven, I have done it for your sake, in the person of Christ.”</em> <span class="ref">2 Corinthians 2:10</span> Thus, when the priest celebrates the Eucharist or forgives sins, it is Christ himself who acts through his hands; the minister lends his voice and his gestures to the Lord, the true author of what is accomplished.</p>
      <h2>Common priesthood and ministerial priesthood</h2>
      <p>By <a href="#/article/baptism">baptism</a>, all the faithful share in the priesthood of Christ: they offer their life to God, pray and bear witness. This is the common priesthood. By Holy Orders, some receive the ministerial priesthood, to serve this common priesthood by making Christ present to his people. The minister is thus wholly at the service of the faithful. <em>“Every high priest, taken from among men, is appointed for men in their relations with God, to offer gifts and sacrifices for sins.”</em> <span class="ref">Hebrews 5:1</span></p>
      <div class="fin-article">✦</div>
    `
},
'les-sacrements': {
  titre:"The Sacraments",
  resume:"The seven signs instituted by Christ, by which he communicates his grace: efficacious signs that produce what they represent, they draw their power from his Passion. Three serve Christian initiation (baptism, confirmation, Eucharist), two healing (confession, anointing of the sick), two the service of communion (Holy Orders, marriage).",
  contenu:`
      <p>The sacraments are the seven signs instituted by Christ, by which he communicates his <a href="#/article/sanctifying-grace">grace</a> to those who receive them. Each one employs elements that can be seen, touched or heard, water, oil, bread, the imposition of hands, the words pronounced.</p>
      <h2>What a sacrament is</h2>
      <p>A sacrament is an efficacious sign of grace: a visible gesture that invisibly produces what it represents. The water of baptism washes the soul of sin; the bread of the Eucharist becomes the body of Christ. Christ himself instituted them and acts in each of them: it is he who baptizes, forgives and nourishes, by the hand of his ministers. All draw their power from his <a href="#/article/the-cross-and-the-resurrection">Passion</a>: from the open side of Christ on the cross flowed blood and water, figure of the sacraments that come from him. <em>“One of the soldiers pierced his side, and at once there flowed blood and water.”</em> <span class="ref">John 19:34</span></p>
      <h2>The sacraments of Christian initiation</h2>
      <p>Three sacraments give birth and growth to the Christian life. <a href="#/article/baptism">Baptism</a> gives rebirth as a child of God and erases sin. <a href="#/article/confirmation">Confirmation</a> gives the Holy Spirit in fullness to strengthen and send to bear witness. The <a href="#/article/the-eucharist">Eucharist</a> nourishes with the flesh and blood of Christ. <em>“Unless one is born of water and the Spirit, no one can enter the kingdom of God.”</em> <span class="ref">John 3:5</span></p>
      <h2>The sacraments of healing</h2>
      <p>Two sacraments raise up the Christian wounded by sin or illness. <a href="#/article/confession">Confession</a> remits the sins committed after baptism and reconciles with God. The <a href="#/article/the-anointing-of-the-sick">anointing of the sick</a> sustains and saves the one whom grave illness afflicts, and unites his suffering to that of Christ. <em>“Which is easier, to say: Your sins are forgiven, or to say: Rise and walk?”</em> <span class="ref">Matthew 9:5</span></p>
      <h2>The sacraments at the service of communion</h2>
      <p>Two sacraments order one to the service of others and to the mission. <a href="#/article/holy-orders">Holy Orders</a> establishes bishops, priests and deacons to lead and sanctify the people of God. <a href="#/article/marriage">Marriage</a> unites a man and a woman for life, and makes their love the sign of the union of Christ and the <a href="#/article/the-church">Church</a>. Received for the good of all, they build the community of believers.</p>
      <div class="fin-article">✦</div>
    `
}
};

module.exports = { SLUGS, THEMES_EN, UI_EN, ARTICLES_EN };
