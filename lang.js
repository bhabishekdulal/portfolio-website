
(function () {
  "use strict";

  const T = [
    // ----- Navigation -----
    ["#navLinks li:nth-child(1) a", "परिचय"],
    ["#navLinks li:nth-child(2) a", "शिक्षा"],
    ["#navLinks li:nth-child(3) a", "लक्ष्य"],
    ["#navLinks li:nth-child(4) a", "युट्युब"],
    ["#navLinks li:nth-child(5) a", "परिवार"],
    ["#navLinks li:nth-child(6) a", "सम्पर्क"],
    ["#navLinks li:nth-child(7) a", "प्रतिक्रिया"],

    // ----- Hero -----
    [".hero .eyebrow", "नमस्ते 🙏 म हुँ"],
    [".hero .lead", "विद्यार्थी, सिर्जनशील युट्युबर — नेपालको सेवा गर्ने सपना बोकेको।"],
    [".hero-cta .btn.primary", "मलाई चिनौं"],
    [".hero-cta .btn.ghost", "सम्पर्क गर्नुहोस्"],

    // ----- About -----
    ["#about h2", "मेरो <em>बारेमा</em>"],
    ["#about .section-intro", "मेरो नाम भविशेक दुलाल हो। मेरो स्थायी ठेगाना शैलुङ-०५, दोलखा हो र म चरिकोट, दोलखामा हुर्केको हुँ। हाल म अध्ययनका क्रममा काठमाडौं, नेपालमा बसोबास गर्छु। म प्रविधि, निरन्तर सिकाइ र देशको सेवा गर्ने लक्ष्यबाट प्रेरित छु। मेरो यात्राका केही क्षणहरू तल छन् — ठूलो हेर्न कुनै पनि फोटोमा ट्याप गर्नुहोस्।"],

    // ----- Academics -----
    ["#academics h2", "शैक्षिक <em>यात्रा</em>"],
    [".tl-item:nth-child(1) .tag", "२०८३ वि.सं. · २०२६ ई.सं."],
    [".tl-item:nth-child(1) h3", "कक्षा १२ — विज्ञान"],
    [".tl-item:nth-child(1) .muted", "सेन्ट लरेन्स माध्यमिक विद्यालय, चाबहिल, काठमाडौं"],
    [".tl-item:nth-child(1) p:not(.muted)", "<strong>३.९० GPA</strong> सहित उत्तीर्ण।"],
    [".tl-item:nth-child(2) .tag", "२०८० वि.सं."],
    [".tl-item:nth-child(2) h3", "कक्षा १० — SEE"],
    [".tl-item:nth-child(2) .muted", "द राइजिङ स्टार स्कुल, चरिकोट, दोलखा"],
    [".tl-item:nth-child(2) p:not(.muted)", "<strong>३.५९ GPA</strong> सहित उत्तीर्ण।"],
    ["#academics h3.sub", "आधारभूत सीपहरू"],

    // ----- Vision -----
    ["#vision h2", "रुचि तथा <em>लक्ष्य</em>"],
    [".grid-2 .card:nth-child(1) h3", "लोकसेवा आयोग"],
    [".grid-2 .card:nth-child(1) p", "नेपाल लोकसेवा आयोगको परीक्षा तयारीमा गहिरो रुचि, इमानदारी र लगनशीलताका साथ <strong>नेपाल सरकार</strong> को सेवा गर्ने लक्ष्य।"],
    [".grid-2 .card:nth-child(2) h3", "नेप्से तथा लगानी"],
    [".grid-2 .card:nth-child(2) p", "नेपाल स्टक एक्सचेन्ज (NEPSE) मा आधारभूत विश्लेषण र दीर्घकालीन शेयर लगानीमा जोश — केवल मूल्य होइन, व्यवसाय बुझ्ने प्रयास।"],
    [".motto footer", "मेरो मार्गदर्शक मन्त्र"],

    // ----- YouTube -----
    ["#youtube h2", "युट्युब <em>अनुभव</em>"],
    [".yt p", "मैले आफ्नो च्यानल धेरै क्रिएटरले जस्तै सुरुवाती चरणमा <strong>गेमिङ भिडियो</strong> बनाएर सुरु गरेको हुँ। समयसँगै सोचविचार गरेर <strong>शैक्षिक सामग्री</strong> तर्फ मोडिएँ — जसले दर्शक बढाउन र मेरो आफ्नै शैक्षिक जग बलियो बनाउन मद्दत गर्छ। आफूले सिकेको सिकाउँदा म तेज रहन्छु र दर्शकले साँच्चै उपयोगी कुरा पाउँछन्।"],
    [".yt .btn", "च्यानल हेर्नुहोस् ↗"],

    // ----- Family -----
    ["#family h2", "मेरो <em>परिवार</em>"],
    ["#family .section-intro", "म जे छु, त्यसको सुरुवात ती दुई व्यक्तिबाट भएको हो जसले मलाई अनुशासन, सेवा र मेहनत सिकाए।"],
    ["#family .person:nth-of-type(1) .tag", "आमा"],
    ["#family .person:nth-of-type(1) p:nth-of-type(1)", "लगभग २००६ ई.सं. (~२०६३ वि.सं.) तिर सुरु गर्नुभएकी <strong>२० वर्षको अनुभव</strong> भएकी दर्ताप्राप्त नर्स। उहाँ हाल <strong>धुलिखेल अस्पताल, दोलखा आउटरिच</strong> मा कार्यरत हुनुहुन्छ, र यसअघि <strong>काठमाडौं मोडेल अस्पताल, दोलखा आउटरिच</strong> तथा करियरको सुरुमा विभिन्न <strong>सरकारी स्वास्थ्य संस्थाहरू</strong> मा सेवा गर्नुभएको थियो।"],
    ["#family .person:nth-of-type(1) p:nth-of-type(2)", "उहाँले आफ्नो शैक्षिक यात्रा <strong>जिरी, दोलखा</strong> मा पूरा गर्नुभयो, र उहाँको समर्पण तथा कडा परिश्रम नै मेरो सबैभन्दा ठूलो प्रेरणा हो।"],
    ["#family .person:nth-of-type(2) .tag", "बुबा"],
    ["#family .person:nth-of-type(2) p:nth-of-type(1)", "<strong>२० वर्षभन्दा बढी शिक्षण अनुभव</strong> भएका समर्पित पेशागत शिक्षक। उहाँले निजी विद्यालय तथा अन्य संस्थाबाट सुरु गरी दुई दशक <strong>नेपालका विभिन्न जिल्ला र ग्रामीण क्षेत्रका सरकारी विद्यालयहरू</strong> मा पढाउनुभयो, जसमा <strong>रामेछाप र दोलखा</strong> पनि पर्छन्।"],
    ["#family .person:nth-of-type(2) p:nth-of-type(2)", "उहाँले शिक्षणमा उत्कृष्टताका लागि धेरै पुरस्कार प्राप्त गर्नुभएको छ र आज पनि पूर्ण समर्पणका साथ पढाइरहनुभएको छ।"],

    // ----- Connect -----
    ["#connect h2", "सामाजिक सञ्जाल तथा <em>सम्पर्क</em>"],
    ['.social .s-card[href^="mailto"] span', "प्रतिक्रिया तथा सहयोग"],

    // ----- Feedback -----
    ["#feedback h2", "प्रतिक्रिया <em>पठाउनुहोस्</em>"],
    ["#feedbackForm label:nth-of-type(1)", "नाम", "text"],
    ["#feedbackForm label:nth-of-type(2)", "इमेल / सम्पर्क", "text"],
    ["#feedbackForm label:nth-of-type(3)", "सन्देश", "text"],
    ["#fName", "तपाईंको नाम", "ph"],
    ["#fContact", "you@example.com वा फोन नम्बर", "ph"],
    ["#fMessage", "आफ्नो प्रतिक्रिया वा सन्देश लेख्नुहोस्…", "ph"],
    ["#feedbackForm .btn.primary", "इमेल एपबाट पठाउनुहोस्"],
    ["#copyEmail", "इमेल ठेगाना कपी गर्नुहोस्"],
    [".official", "आधिकारिक सहयोग तथा प्रतिक्रिया इमेल:", "text"],

    // ----- Footer -----
    ["#backTop", "↑ माथि"],
  ];

  const btn = document.getElementById("langToggle");
  const originals = new Map();

  const firstText = (el) =>
    Array.from(el.childNodes).find((n) => n.nodeType === 3 && n.nodeValue.trim());

  function read(el, mode) {
    if (mode === "ph") return el.placeholder;
    if (mode === "text") return firstText(el).nodeValue;
    return el.innerHTML;
  }

  function write(el, mode, val) {
    if (mode === "ph") el.placeholder = val;
    else if (mode === "text") {
      const node = firstText(el);
      if (node) node.nodeValue = val + "\n";
    } else el.innerHTML = val;
  }

  // Capture English originals before applying Nepali
  T.forEach(([sel, , mode = "html"]) => {
    const el = document.querySelector(sel);
    if (el && !originals.has(el)) {
      originals.set(el, read(el, mode));
    }
  });

  function apply(lang) {
    T.forEach(([sel, ne, mode = "html"]) => {
      const el = document.querySelector(sel);
      if (!el || !originals.has(el)) return;
      write(el, mode, lang === "ne" ? ne : originals.get(el));
    });
    document.documentElement.lang = lang;
    if (btn) {
      btn.textContent = lang === "ne" ? "English" : "नेपाली";
    }
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {}
  }

  let current = "ne";
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ne") current = saved;
  } catch (e) {}

  apply(current);

  if (btn) {
    btn.addEventListener("click", () => {
      current = current === "ne" ? "en" : "ne";
      apply(current);
    });
  }
})();