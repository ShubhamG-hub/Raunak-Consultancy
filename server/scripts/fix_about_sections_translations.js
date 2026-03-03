require('dotenv').config();
const pool = require('../config/db');

// All about_sections rows with their Hindi and Marathi translations
// Matched by title_en (the English title field used as identifier)
const translations = [
    {
        title_en: 'MDRT Qualifier 2023 – A Mark of Financial Excellence',
        title_hi: 'एमडीआरटी क्वालीफायर 2023 – वित्तीय उत्कृष्टता का प्रतीक',
        title_mr: 'एमडीआरटी क्वालिफायर 2023 – आर्थिक उत्कृष्टतेचे प्रतीक',
        description_hi: '2023 में एमडीआरटी की योग्यता प्राप्त की, जो उत्कृष्टता का विश्व स्तर पर मान्यता प्राप्त मानक है।',
        description_mr: '2023 मध्ये एमडीआरटी पात्रता प्राप्त केली, जी उत्कृष्टतेचे जागतिक मान्यताप्राप्त मानक आहे।'
    },
    {
        title_en: 'Hero Main Title',
        title_hi: 'मुख्य शीर्षक',
        title_mr: 'मुख्य शीर्षक',
        description_hi: '2009 से 2026 तक: एक-एक परिवार का विश्वास जीतते हुए',
        description_mr: '2009 ते 2026: एक एक कुटुंबाचा विश्वास जिंकत'
    },
    {
        title_en: 'Philosophy',
        title_hi: 'दर्शन',
        title_mr: 'तत्त्वज्ञान',
        description_hi: 'ग्राहक हित सर्वप्रथम',
        description_mr: 'ग्राहक हित सर्वप्रथम'
    },
    {
        title_en: 'Bio Paragraph 1',
        title_hi: 'जीवनी अनुच्छेद 1',
        title_mr: 'चरित्र परिच्छेद 1',
        description_hi: 'वित्तीय सेवाओं में मेरी यात्रा दो दशक पहले एक सरल उद्देश्य के साथ शुरू हुई — आम आदमी को वित्तीय स्वतंत्रता दिलाना।',
        description_mr: 'आर्थिक सेवांमधील माझा प्रवास दोन दशकांपूर्वी एका साध्या उद्देशाने सुरू झाला — सामान्य माणसाला आर्थिक स्वातंत्र्य मिळवून देणे।'
    },
    {
        title_en: 'Advisor Name',
        title_hi: 'सलाहकार का नाम',
        title_mr: 'सल्लागाराचे नाव',
        description_hi: 'सुधीर मेवालाल गुप्ता',
        description_mr: 'सुधीर मेवालाल गुप्ता'
    },
    {
        title_en: 'Hero Highlight Text',
        title_hi: 'मुख्य हाइलाइट पाठ',
        title_mr: 'मुख्य हायलाइट मजकूर',
        description_hi: 'एक-एक परिवार का विश्वास जीतते हुए',
        description_mr: 'एक एक कुटुंबाचा विश्वास जिंकत'
    },
    {
        title_en: 'Bio Paragraph 2',
        title_hi: 'जीवनी अनुच्छेद 2',
        title_mr: 'चरित्र परिच्छेद 2',
        description_hi: '2008 में, मैंने इस अंतर को पाटने का निर्णय लिया। मैंने वित्त को सरल बनाने के मिशन के साथ काम शुरू किया — बीमा, निवेश और कर नियोजन को समझने योग्य तरीके से समझाते हुए।',
        description_mr: '2008 मध्ये, मी हा गॅप भरण्याचा निर्णय घेतला. विमा, गुंतवणूक आणि कर नियोजन सोप्या भाषेत समजावून सांगत वित्त सोपे करण्याच्या ध्येयाने काम सुरू केले।'
    },
    {
        title_en: 'Primary Focus',
        title_hi: 'मुख्य फोकस',
        title_mr: 'मुख्य केंद्रबिंदू',
        description_hi: 'धन सृजन',
        description_mr: 'संपत्ती निर्मिती'
    },
    {
        title_en: 'Bio Paragraph 3',
        title_hi: 'जीवनी अनुच्छेद 3',
        title_mr: 'चरित्र परिच्छेद 3',
        description_hi: 'वर्षों में, रौनक कंसल्टेंसी वित्तीय सुरक्षा और समृद्धि चाहने वाले परिवारों और व्यवसायों के लिए एक विश्वसनीय नाम बन गई है।',
        description_mr: 'वर्षांमध्ये, रौनक कन्सल्टन्सी आर्थिक सुरक्षा आणि समृद्धी इच्छिणाऱ्या कुटुंबे आणि व्यवसायांसाठी एक विश्वासू नाव बनले आहे।'
    },
    {
        title_en: 'Advisor Role',
        title_hi: 'सलाहकार की भूमिका',
        title_mr: 'सल्लागाराची भूमिका',
        description_hi: 'वित्तीय विकास और क्लेम विशेषज्ञ',
        description_mr: 'आर्थिक विकास आणि क्लेम तज्ञ'
    }
];

const fix = async () => {
    console.log('🚀 Fixing about_sections Hindi & Marathi translations...\n');
    let updated = 0;

    for (const t of translations) {
        try {
            const [rows] = await pool.query('SELECT id FROM about_sections WHERE title_en = ?', [t.title_en]);
            if (rows.length === 0) {
                console.log('⚠️  Not found by title_en:', t.title_en);
                continue;
            }
            const id = rows[0].id;
            await pool.query(
                `UPDATE about_sections SET 
                    title_hi = ?, title_mr = ?,
                    description_hi = ?, description_mr = ?
                WHERE id = ?`,
                [t.title_hi, t.title_mr, t.description_hi, t.description_mr, id]
            );
            console.log('✅ Updated:', t.title_en);
            updated++;
        } catch (err) {
            console.error('❌ Error for', t.title_en, ':', err.message);
        }
    }

    console.log(`\n✨ Done! Updated ${updated}/${translations.length} rows.`);
    process.exit(0);
};

fix();
