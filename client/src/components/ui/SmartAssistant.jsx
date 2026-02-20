import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronLeft, Send, Calculator, HelpCircle, Calendar, ShieldCheck, UserPlus, ArrowRight, Sparkles, User, Bot } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '@/context/useLanguage';

const SmartAssistant = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('chat'); // 'chat', 'goalFinder', 'faq'
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId'));

    // GoalFinder State
    const [goalStep, setGoalStep] = useState(1);
    const [goalData, setGoalData] = useState({ education: '', marriage: '', retirement: '', maintenance: '', savings: '', insurance: '' });

    const [activeFaq, setActiveFaq] = useState(null);
    const [calcState, setCalcState] = useState({ type: null, step: 0, data: {} });
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load initial greeting or history if needed
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial welcome message could go here
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => setShowGreeting(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const ensureSession = async () => {
        if (sessionId) {
            // Optional: verify session existence here
            // For now, let's just make sure we handle failures in persistMessage
            return sessionId;
        }
        try {
            const res = await api.post('/chat/sessions', { user_name: 'Visitor' });
            const newId = res.data.id;
            setSessionId(newId);
            localStorage.setItem('chatSessionId', newId);
            return newId;
        } catch (error) {
            console.error('Failed to create chat session:', error);
            return null;
        }
    };

    const persistMessage = async (sId, sender, content, metadata = null) => {
        if (!sId) return;
        try {
            await api.post('/chat/messages', {
                session_id: sId,
                sender,
                content: typeof content === 'string' ? content : JSON.stringify(content),
                metadata
            });
        } catch (error) {
            console.error('Failed to persist message:', error);
            // If it's a 404 or foreign key error, the session might be invalid
            if (error.response && (error.response.status === 404 || error.response.status === 400)) {
                localStorage.removeItem('chatSessionId');
                setSessionId(null);
            }
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');

        // 0. Ensure session exists
        const sId = await ensureSession();

        // 1. Add user message locally
        const userMsg = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        persistMessage(sId, 'user', text);

        // 2. Process Calculator Flow or AI logic
        setIsTyping(true);
        setTimeout(async () => {
            try {
                let aiText = '';
                let aiMsg = null;
                let metadata = null;

                if (calcState.type) {
                    // Handle ongoing calculator step
                    const nextState = handleCalcStep(text);
                    aiText = nextState.prompt;
                    if (nextState.result) {
                        metadata = nextState.result;
                        aiMsg = {
                            id: Date.now() + 1,
                            text: aiText,
                            sender: 'bot',
                            timestamp: new Date(),
                            result: nextState.result // Special result card
                        };
                    }
                } else {
                    // Check if user wants to start a calculator
                    const trigger = checkCalcTrigger(text);
                    if (trigger) {
                        setCalcState({ type: trigger.type, step: 1, data: {} });
                        aiText = trigger.prompt;
                    } else {
                        aiText = getAIResponse(text, language);
                    }
                }

                if (!aiMsg) {
                    aiMsg = {
                        id: Date.now() + 1,
                        text: aiText,
                        sender: 'bot',
                        timestamp: new Date()
                    };
                }

                setMessages(prev => [...prev, aiMsg]);
                persistMessage(sId, 'bot', aiText, metadata);
            } catch (error) {
                console.error('Chatbot error:', error);
                const errorMsg = {
                    id: Date.now() + 1,
                    text: "I'm sorry, I encountered an error. Please try again.",
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsTyping(false);
                scrollToBottom();
            }
        }, 800);
    };

    const getAIResponse = (query, lang) => {
        const q = query.toLowerCase();

        // 1. Goal-Based / GoalFinder
        if (q.includes('goalfinder') || q.includes('how it works') || q.includes('what is goalfinder') || q.includes('मदत') || q.includes('काम')) {
            if (lang === 'hi') return 'GoalFinder एक लक्ष्य-आधारित वित्तीय नियोजन मंच है जो आपको अपने लक्ष्यों को परिभाषित करने और उन्हें प्राप्त करने के लिए एक व्यक्तिगत रोडमैप बनाने में मदद करता है।';
            if (lang === 'mr') return 'GoalFinder हे ध्येय-आधारित आर्थिक नियोजन प्लॅटफॉर्म आहे जे तुम्हाला तुमची आर्थिक ध्येये निश्चित करण्यात मदत करते आणि ती साध्य करण्यासाठी एक वैयक्तिक रोडमॅप तयार करते.';
            return "GoalFinder is a goal-based financial planning platform that helps you define your financial goals and creates a personalized roadmap to achieve them.";
        }

        // 2. Investment Related
        if (q.includes('sip') || q.includes('systematic investment') || q.includes('एसआईपी')) {
            if (lang === 'hi') return 'SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) आपको म्यूचुअल फंड में नियमित रूप से एक निश्चित राशि निवेश करने की अनुमति देता है। यह अनुशासन बनाने और बाजार की अस्थिरता को कम करने में मदद करता है।';
            if (lang === 'mr') return 'SIP (सिस्टमॅटिक इन्व्हेस्टमेंट प्लॅन) तुम्हाला म्युच्युअल फंडमध्ये नियमितपणे ठराविक रक्कम गुंतवण्यास मदत करतो. हे शिस्तबद्ध गुंतवणूक आणि बाजारातील चढ-उतारांचा प्रभाव कमी करण्यास मदत करते.';
            return "A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds. It helps in disciplined investing and reduces the impact of market volatility.";
        }
        if (q.includes('where should i invest') || q.includes('invest my money') || q.includes('निवेश') || q.includes('गुंतवणूक')) {
            if (lang === 'hi') return "सही निवेश आपके वित्तीय लक्ष्यों, जोखिम क्षमता और समय अवधि पर निर्भर करता है। विकल्पों में म्यूचुअल फंड, स्टॉक, बॉन्ड, एफडी या रियल एस्टेट शामिल हो सकते हैं।";
            if (lang === 'mr') return "योग्य गुंतवणूक तुमच्या आर्थिक ध्येयांवर, जोखीम क्षमतेवर आणि कालावधीवर अवलंबून असते. यामध्ये म्युच्युअल फंड, शेअर्स, बाँड्स, एफडी किंवा रिअल इस्टेटचा समावेश असू शकतो.";
            return "The right investment depends on your financial goals, risk tolerance, and time horizon. Options may include mutual funds, stocks, bonds, FD, or real estate.";
        }
        if (q.includes('stock market') || q.includes('is it safe') || q.includes('शेयर बाजार') || q.includes('सुरक्षित')) {
            if (lang === 'hi') return "शेयर बाजार में जोखिम होता है, लेकिन उचित विविविधता और दीर्घकालिक रणनीति के साथ, यह महत्वपूर्ण रिटर्न उत्पन्न कर सकता है। जोखिम प्रबंधन आवश्यक है।";
            if (lang === 'mr') return "शेअर बाजारामध्ये जोखीम असते, परंतु योग्य वैविध्यीकरण आणि दीर्घकालीन धोरणासह, ते चांगले परतावा देऊ शकतात. जोखीम व्यवस्थापन आवश्यक आहे.";
            return "The stock market involves risk, but with proper diversification and long-term strategy, it can generate significant returns. Risk management is essential.";
        }

        // 3. Retirement
        if (q.includes('retirement') || q.includes('retire early') || q.includes('रिटायरमेंट') || q.includes('निवृत्ती')) {
            if (lang === 'hi') return "रिटायरमेंट प्लानिंग यह सुनिश्चित करती है कि आपके पास सेवानिवृत्ति के बाद एक स्थिर आय हो। यह आपके खर्चों, मुद्रास्फीति और जीवनशैली पर निर्भर करता है। हम आपके लिए इसकी गणना कर सकते हैं!";
            if (lang === 'mr') return "निवृत्ती नियोजन हे सुनिश्चित करते की निवृत्तीनंतर तुमच्याकडे स्थिर उत्पन्न असेल. हे तुमच्या खर्चावर, महागाईवर आणि जीवनशैलीवर अवलंबून असते. आम्ही तुमच्यासाठी याची गणना करू शकतो!";
            return "Retirement planning ensures you have a steady income after retirement. The corpus depends on your expenses, inflation, and lifestyle. We can calculate this for you!";
        }

        // 4. Tax Planning
        if (q.includes('save tax') || q.includes('tax planning') || q.includes('टैक्स') || q.includes('कर बचत')) {
            if (lang === 'hi') return "टैक्स की बचत धारा 80C निवेश, बीमा पॉलिसियों और NPS के माध्यम से की जा सकती है। टैक्स प्लानिंग का अर्थ है साल भर दक्षता का अनुकूलन करना।";
            if (lang === 'mr') return "कलम 80C गुंतवणूक, विमा पॉलिसी आणि NPS याद्वारे कर बचत केली जाऊ शकते. टॅक्स प्लॅनिंग म्हणजे वर्षभर कर कार्यक्षमता वाढवणे.";
            return "Tax saving can be done through Section 80C investments, insurance policies, and NPS. Tax planning is about optimizing efficiency throughout the year.";
        }

        // 5. Insurance
        if (q.includes('insurance') || q.includes('term insurance') || q.includes('बीमा') || q.includes('विमा')) {
            if (lang === 'hi') return "आदर्श रूप से, आपको लाइफ कवर के रूप में अपनी वार्षिक आय का 10-15 गुना चाहिए। टर्म इंश्योरेंस शुद्ध सुरक्षा है, जबकि स्वास्थ्य बीमा चिकित्सा आपात स्थितियों को कवर करता है।";
            if (lang === 'mr') return "आदर्शपणे, तुम्हाला विमा संरक्षण म्हणून तुमच्या वार्षिक उत्पन्नाच्या 10-15 पट रक्कम हवी. टर्म इन्शुरन्स हे शुद्ध संरक्षण आहे, तर आरोग्य विमा वैद्यकीय आणीबाणीसाठी असतो.";
            return "Ideally, you need 10-15 times your annual income as life cover. Term insurance is pure protection, while health insurance covers medical emergencies.";
        }

        // 6. Emergency Fund / Debt
        if (q.includes('emergency fund') || q.includes('कर्ज') || q.includes('लोन')) {
            if (lang === 'hi') return "आपातकालीन निधि (Emergency Fund) में अप्रत्याशित स्थितियों के लिए 6-12 महीने के आवश्यक खर्च शामिल होने चाहिए। उच्च ब्याज वाले ऋण को प्राथमिकता दी जानी चाहिए।";
            if (lang === 'mr') return "आणीबाणी निधीमध्ये (Emergency Fund) अनपेक्षित परिस्थितींसाठी 6-12 महिन्यांचा आवश्यक खर्च असावा. जास्त व्याजाच्या कर्जाला गुंतवणुकीपूर्वी प्राधान्य दिले पाहिजे.";
            return "An emergency fund should cover 6-12 months of essential expenses for unexpected situations. High-interest debt should usually be prioritized before investing.";
        }

        // 7. General / Welcome
        if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('नमस्ते') || q.includes('नमस्कार')) {
            if (lang === 'hi') return 'नमस्ते! मैं आपका वित्तीय सहायक हूँ। मैं निवेश, सेवानिवृत्ति, कर बचत या गोलफाइंडर के बारे में आपकी मदद कर सकता हूँ।';
            if (lang === 'mr') return 'नमस्कार! मी तुमचा आर्थिक सहाय्यक आहे. मी तुम्हाला गुंतवणूक नियोजन, निवृत्ती, कर बचत किंवा गोलफाइंडर वापरण्यात मदत करू शकतो.';
            return "Hello! I'm Raunak AI, your financial assistant. I can help you with investment planning, retirement, tax saving, or using our GoalFinder tool. What's on your mind?";
        }

        // 8. Calculators Triggers
        if (q.includes('net worth') || q.includes('नेट वर्थ') || q.includes('एकूण संपत्ती')) {
            if (lang === 'hi') return "आइए आपकी नेट वर्थ की गणना करें। कृपया मुझे पहले अपनी कुल बैंक शेष राशि (Bank Balance) बताएं।";
            if (lang === 'mr') return "चला तुमची नेट वर्थ मोजूया. कृपया मला तुमची एकूण बँक शिल्लक (Bank Balance) सांगा.";
            return "Let's calculate your Net Worth. Please tell me your total bank balance first.";
        }
        if (q.includes('sip calculator') || q.includes('एसआयपी') || q.includes('एसआईपी')) {
            if (lang === 'hi') return "मैं इसमें मदद कर सकता हूँ। आप मासिक कितनी राशि निवेश करना चाहेंगे?";
            if (lang === 'mr') return "मी यामध्ये मदत करू शकतो. तुम्हाला दरमहा किती गुंतवणूक करायला आवडेल?";
            return "I can help with that. How much would you like to invest monthly?";
        }

        // Fallback
        if (lang === 'hi') return 'मैं आपकी सहायता के लिए यहाँ हूँ। आप मुझसे निवेश, बीमा या हमारी सेवाओं के बारे में कुछ भी पूछ सकते हैं। "SIP", "Retirement" या "Net Worth" के बारे में पूछें।';
        if (lang === 'mr') return 'मी तुम्हाला मदत करण्यासाठी येथे आहे. तुम्ही मला गुंतवणूक, विमा किंवा आमच्या सेवांबद्दल काहीही विचारू शकता। "SIP", "Retirement" किंवा "Net Worth" बद्दल विचारा।';
        return "I'm here to assist you. You can ask me anything about investments, insurance, or our services. Try asking about 'SIP', 'Retirement', or 'Net Worth'.";
    };

    const checkCalcTrigger = (text) => {
        const q = text.toLowerCase();
        if (q.includes('net worth') || q.includes('नेट वर्थ') || q.includes('एकूण संपत्ती')) {
            const prompt = language === 'hi' ? "आइए आपकी नेट वर्थ की गणना करें। आपकी कुल बैंक शेष राशि (Bank Balance) क्या है?" :
                language === 'mr' ? "चला तुमची नेट वर्थ मोजूया. तुमची एकूण बँक शिल्लक (Bank Balance) काय आहे?" :
                    "Let's calculate your Net Worth. What is your total bank balance?";
            return { type: 'netWorth', prompt };
        }
        if (q.includes('sip calculator') || q.includes('how much sip') || q.includes('एसआईपी') || q.includes('एसआयपी')) {
            const prompt = language === 'hi' ? "मैं इसमें मदद कर सकता हूँ। आप मासिक कितनी राशि निवेश करना चाहेंगे?" :
                language === 'mr' ? "मी यामध्ये मदत करू शकतो. तुम्हाला दरमहा किती गुंतवणूक करायला आवडेल?" :
                    "I can help with that. How much would you like to invest monthly?";
            return { type: 'sip', prompt };
        }
        if (q.includes('retirement') || q.includes('रिटायरमेंट') || q.includes('निवृत्ती')) {
            const prompt = language === 'hi' ? "आइए आपकी सेवानिवृत्ति की योजना बनाएं। आपकी वर्तमान आयु क्या है?" :
                language === 'mr' ? "चला तुमच्या निवृत्तीचे नियोजन करूया. तुमचे सध्याचे वय काय आहे?" :
                    "Let's plan for your retirement. What is your current age?";
            return { type: 'retirement', prompt };
        }
        if (q.includes('inflation') || q.includes('महंगाई') || q.includes('महागाई')) {
            const prompt = language === 'hi' ? "आइए मुद्रास्फीति का प्रभाव देखें। आपके लक्ष्य की वर्तमान लागत क्या है?" :
                language === 'mr' ? "चला महागाईचा प्रभाव पाहूया. तुमच्या ध्येयाची सध्याची किंमत काय आहे?" :
                    "Let's see the impact of inflation. What is the current cost of your goal?";
            return { type: 'inflation', prompt };
        }
        if (q.includes('probability') || q.includes('score') || q.includes('संभावना') || q.includes('शक्यता')) {
            const prompt = language === 'hi' ? "आइए आपके लक्ष्य प्राप्ति की संभावना देखें। आपका वर्तमान कुल निवेश क्या है?" :
                language === 'mr' ? "चला तुमचे ध्येय साध्य करण्याची शक्यता पाहूया. तुमची सध्याची एकूण गुंतवणूक काय आहे?" :
                    "Let's calculate your Goal Probability Score. What is your current total investment?";
            return { type: 'goalProbability', prompt };
        }
        return null;
    };

    const handleCalcStep = (input) => {
        const val = parseFloat(input.replace(/[^0-9.]/g, '')) || 0;
        const { type, step, data } = calcState;

        const newData = { ...data };
        let prompt = '';
        let result = null;

        const l = language;

        if (type === 'netWorth') {
            if (step === 1) {
                newData.bank = val;
                prompt = l === 'hi' ? "आपके कुल निवेश का मूल्य क्या है? (म्यूचुअल फंड, स्टॉक, आदि)" : l === 'mr' ? "तुमच्या एकूण गुंतवणुकीचे मूल्य काय आहे? (म्युच्युअल फंड, शेअर्स, इ.)" : "What is your total investment value? (Mutual funds, stocks, etc.)";
            }
            else if (step === 2) {
                newData.investments = val;
                prompt = l === 'hi' ? "आपकी संपत्ति (Property) का वर्तमान मूल्य क्या है?" : l === 'mr' ? "तुमच्या मालमत्तेचे (Property) सध्याचे मूल्य काय आहे?" : "What is the current value of your property?";
            }
            else if (step === 3) {
                newData.property = val;
                prompt = l === 'hi' ? "आपकी अन्य संपत्तियों का कुल योग क्या है?" : l === 'mr' ? "तुमच्या इतर मालमत्तेची एकूण बेरीज काय आहे?" : "What is the total of your other assets?";
            }
            else if (step === 4) {
                newData.other = val;
                prompt = l === 'hi' ? "और अंत में, आपकी कुल बकाया ऋण (Loan) राशि क्या है?" : l === 'mr' ? "आणि शेवटी, तुमची एकूण थकीत कर्ज (Loan) रक्कम किती आहे?" : "And finally, what is your total outstanding loan amount?";
            }
            else if (step === 5) {
                newData.loans = val;
                const netWorth = (newData.bank + newData.investments + newData.property + newData.other) - newData.loans;
                prompt = l === 'hi' ? `आपकी अनुमानित नेट वर्थ ₹${netWorth.toLocaleString()} है।` : l === 'mr' ? `तुमची अंदाजित नेट वर्थ ₹${netWorth.toLocaleString()} आहे.` : `Your estimated Net Worth is ₹${netWorth.toLocaleString()}.`;
                result = { type: 'netWorth', value: netWorth, data: newData };
                setCalcState({ type: null, step: 0, data: {} });
            }
            if (step < 5) setCalcState({ ...calcState, step: step + 1, data: newData });
        } else if (type === 'sip') {
            if (step === 1) {
                newData.monthly = val;
                prompt = l === 'hi' ? "आप कितने वर्षों के लिए निवेश करना चाहते हैं?" : l === 'mr' ? "तुम्हाला किती वर्षांसाठी गुंतवणूक करायची आहे?" : "For how many years do you want to invest?";
            }
            else if (step === 2) {
                newData.years = val;
                prompt = l === 'hi' ? "अपेक्षित वार्षिक रिटर्न दर क्या है? (%)" : l === 'mr' ? "अपेक्षित वार्षिक परतावा दर काय आहे? (%)" : "What is the expected annual return rate? (%)";
            }
            else if (step === 3) {
                newData.rate = val;
                const P = newData.monthly;
                const n = newData.years * 12;
                const r = (newData.rate / 100) / 12;
                const fv = P * (((Math.pow(1 + r, n)) - 1) / r) * (1 + r);
                prompt = l === 'hi' ? `आपकी SIP ${newData.years} वर्षों में ₹${Math.round(fv).toLocaleString()} तक बढ़ सकती है।` : l === 'mr' ? `तुमची SIP ${newData.years} वर्षांत ₹${Math.round(fv).toLocaleString()} पर्यंत वाढू शकते.` : `Your SIP may grow to ₹${Math.round(fv).toLocaleString()} in ${newData.years} years.`;
                result = { type: 'sip', value: fv, data: newData };
                setCalcState({ type: null, step: 0, data: {} });
            }
            if (step < 3) setCalcState({ ...calcState, step: step + 1, data: newData });
        } else if (type === 'retirement') {
            if (step === 1) {
                newData.age = val;
                prompt = l === 'hi' ? "आप किस उम्र में सेवानिवृत्त होना चाहते हैं?" : l === 'mr' ? "तुम्ही कोणत्या वयात निवृत्त होऊ इच्छिता?" : "At what age do you want to retire?";
            }
            else if (step === 2) {
                newData.retireAge = val;
                prompt = l === 'hi' ? "आपके वर्तमान मासिक खर्च क्या हैं?" : l === 'mr' ? "तुमचा सध्याचा मासिक खर्च किती आहे?" : "What are your current monthly expenses?";
            }
            else if (step === 3) {
                newData.expenses = val;
                prompt = l === 'hi' ? "अपेक्षित मुद्रास्फीति दर? (डिफ़ॉल्ट 6%)" : l === 'mr' ? "अपेक्षित महागाई दर? (डिफ़ॉल्ट 6%)" : "Expected inflation rate? (Default 6%)";
            }
            else if (step === 4) {
                newData.inflation = val || 6;
                const yearsToRetire = newData.retireAge - newData.age;
                const futureMonthlyExpense = newData.expenses * Math.pow(1 + (newData.inflation / 100), yearsToRetire);
                const corpus = futureMonthlyExpense * 12 * 25; // 4% rule
                prompt = l === 'hi' ? `आपको सेवानिवृत्ति के लिए ₹${(Math.round(corpus / 100000) / 100).toFixed(2)} करोड़ के कॉर्पस की आवश्यकता हो सकती है।` : l === 'mr' ? `निवृत्तीसाठी तुम्हाला ₹${(Math.round(corpus / 100000) / 100).toFixed(2)} कोटी निधीची आवश्यकता असू शकते.` : `You may need a corpus of ₹${(Math.round(corpus / 100000) / 100).toFixed(2)} Cr for retirement.`;
                result = { type: 'retirement', value: corpus, data: newData, futureExpense: futureMonthlyExpense };
                setCalcState({ type: null, step: 0, data: {} });
            }
            if (step < 4) setCalcState({ ...calcState, step: step + 1, data: newData });
        } else if (type === 'inflation') {
            if (step === 1) {
                newData.cost = val;
                prompt = l === 'hi' ? "आप कितने वर्षों में इस लक्ष्य को प्राप्त करना चाहते हैं?" : l === 'mr' ? "तुम्हाला हे ध्येय किती वर्षांत साध्य करायचे आहे?" : "In how many years do you want to achieve this goal?";
            }
            else if (step === 2) {
                newData.years = val;
                prompt = l === 'hi' ? "अपेक्षित मुद्रास्फीति दर? (%)" : l === 'mr' ? "अपेक्षित महागाई दर? (%)" : "Expected inflation rate? (%)";
            }
            else if (step === 3) {
                newData.rate = val;
                const futureCost = newData.cost * Math.pow(1 + (newData.rate / 100), newData.years);
                prompt = l === 'hi' ? `आपके लक्ष्य की भविष्य की लागत ₹${Math.round(futureCost).toLocaleString()} तक बढ़ सकती है।` : l === 'mr' ? `तुमच्या ध्येयाची भविष्यातील किंमत ₹${Math.round(futureCost).toLocaleString()} पर्यंत वाढू शकते.` : `The future cost of your goal may rise to ₹${Math.round(futureCost).toLocaleString()}.`;
                result = { type: 'inflation', value: futureCost, data: newData };
                setCalcState({ type: null, step: 0, data: {} });
            }
            if (step < 3) setCalcState({ ...calcState, step: step + 1, data: newData });
        } else if (type === 'goalProbability') {
            if (step === 1) {
                newData.current = val;
                prompt = l === 'hi' ? "आप मासिक कितना और निवेश कर सकते हैं?" : l === 'mr' ? "तुम्ही दरमहा किती अतिरिक्त गुंतवणूक करू शकता?" : "How much more can you invest monthly?";
            }
            else if (step === 2) {
                newData.monthly = val;
                prompt = l === 'hi' ? "लक्ष्य की राशि क्या है?" : l === 'mr' ? "ध्येयाची रक्कम काय आहे?" : "What is the target goal amount?";
            }
            else if (step === 3) {
                newData.target = val;
                prompt = l === 'hi' ? "कितने वर्षों में?" : l === 'mr' ? "किती वर्षांत?" : "In how many years?";
            }
            else if (step === 4) {
                newData.years = val;
                // Simple heuristic: (Current + Monthly * 12 * Years * 1.1) / Target
                const totalEstimated = newData.current + (newData.monthly * 12 * newData.years * 1.1);
                const score = Math.min(100, Math.round((totalEstimated / newData.target) * 100));
                prompt = l === 'hi' ? `आपके लक्ष्य की सफलता का स्कोर ${score}% है।` : l === 'mr' ? `तुमच्या ध्येय यशाचा स्कोअर ${score}% आहे.` : `Your Goal Probability Score is ${score}%.`;
                result = { type: 'goalProbability', value: score, data: newData };
                setCalcState({ type: null, step: 0, data: {} });
            }
            if (step < 4) setCalcState({ ...calcState, step: step + 1, data: newData });
        }

        return { prompt, result };
    };

    const handleGoalInput = (field, value) => {
        setGoalData(prev => ({ ...prev, [field]: value }));
    };

    const calculateGap = () => {
        const needs = (Number(goalData.education) || 0) + (Number(goalData.marriage) || 0) + (Number(goalData.retirement) || 0) + (Number(goalData.maintenance) || 0);
        const provisions = (Number(goalData.savings) || 0) + (Number(goalData.insurance) || 0);
        return { needs, provisions, gap: Math.max(0, needs - provisions) };
    };

    const renderChat = () => (
        <div className="flex flex-col h-[400px]">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 && (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground px-4">{t.chatbot.welcome}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button onClick={() => setView('goalFinder')} className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full border border-border flex items-center gap-1">
                                <Calculator className="w-3 h-3" /> {t.chatbot.actions.goalFinder}
                            </button>
                            <button onClick={() => setView('faq')} className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full border border-border flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" /> FAQ
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                    >
                        {msg.sender === 'bot' && (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-3.5 h-3.5 text-primary" />
                            </div>
                        )}
                        <div className={`relative max-w-[85%] p-4 rounded-3xl text-sm ${msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20'
                            : 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-slate-900 dark:text-slate-100 rounded-tl-none border border-white/50 dark:border-white/10 shadow-sm'
                            }`}>
                            {msg.text}

                            {msg.result && (
                                <div className="mt-3 p-3 bg-background/50 rounded-xl border border-primary/20 space-y-2">
                                    <div className="text-[10px] uppercase font-bold text-primary tracking-wider">
                                        {msg.result.type === 'netWorth' ? (language === 'hi' ? 'नेट वर्थ विश्लेषण' : language === 'mr' ? 'एकूण संपत्ती विश्लेषण' : 'Net Worth Analysis') :
                                            msg.result.type === 'sip' ? (language === 'hi' ? 'SIP विश्लेषण' : language === 'mr' ? 'SIP विश्लेषण' : 'SIP Projection') :
                                                msg.result.type === 'retirement' ? (language === 'hi' ? 'सेवानिवृत्ति रोडमैप' : language === 'mr' ? 'निवृत्ती नियोजन' : 'Retirement Roadmap') :
                                                    msg.result.type === 'goalProbability' ? (language === 'hi' ? 'लक्ष्य सफलता स्कोर' : language === 'mr' ? 'ध्येय यश स्कोअर' : 'Goal Success Score') :
                                                        (language === 'hi' ? 'मुद्रास्फीति प्रभाव' : language === 'mr' ? 'महागाईचा प्रभाव' : 'Inflation Impact')}
                                    </div>
                                    <div className="text-lg font-black tracking-tight">
                                        {msg.result.type === 'goalProbability' ? `${msg.result.value}%` : `₹${msg.result.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    </div>
                                    {msg.result.type === 'retirement' && (
                                        <div className="text-[10px] text-muted-foreground italic">
                                            {language === 'hi' ? `₹${msg.result.data.expenses.toLocaleString()} के मुद्रास्फीति-समायोजित खर्च को बनाए रखने के लिए आवश्यक।` :
                                                language === 'mr' ? `₹${msg.result.data.expenses.toLocaleString()} महागाई-समायोजित खर्च राखण्यासाठी आवश्यक.` :
                                                    `Required to maintain ₹${msg.result.data.expenses.toLocaleString()} inflation-adjusted expense.`}
                                        </div>
                                    )}
                                    {msg.result.type === 'sip' && (
                                        <div className="text-[10px] text-muted-foreground italic">
                                            {language === 'hi' ? `कुल निवेश: ₹${(msg.result.data.monthly * msg.result.data.years * 12).toLocaleString()}` :
                                                language === 'mr' ? `एकूण गुंतवणूक: ₹${(msg.result.data.monthly * msg.result.data.years * 12).toLocaleString()}` :
                                                    `Total Investment: ₹${(msg.result.data.monthly * msg.result.data.years * 12).toLocaleString()}`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex justify-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-secondary p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex gap-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t.chatbot.ui.askPlaceholder}
                    className="flex-grow bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );

    const renderGoalFinder = () => {
        const { needs, provisions, gap } = calculateGap();
        return (
            <div className="p-4 space-y-4 h-[400px] overflow-y-auto scrollbar-thin">
                <button onClick={() => setView('chat')} className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                    <ChevronLeft className="w-3 h-3" /> {t.chatbot.back}
                </button>

                {goalStep === 1 ? (
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t.chatbot.goalFinder.title}</h3>
                        <p className="text-xs text-muted-foreground">{t.chatbot.goalFinder.intro}</p>
                        <button onClick={() => setGoalStep(2)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            {t.chatbot.ui.startAssessment}
                        </button>
                    </div>
                ) : goalStep === 2 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t.chatbot.goalFinder.tableA.title}</h3><span className="text-[10px] font-mono">1/2</span></div>
                        <div className="space-y-3">
                            {['education', 'marriage', 'retirement', 'maintenance'].map(field => (
                                <div key={field} className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">{t.chatbot.goalFinder.tableA[field]}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                        <input type="number" value={goalData[field]} onChange={(e) => handleGoalInput(field, e.target.value)} className="w-full pl-7 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm" placeholder="0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setGoalStep(3)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg">{t.chatbot.ui.nextProvisions}</button>
                    </div>
                ) : goalStep === 3 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t.chatbot.goalFinder.tableB.title}</h3><span className="text-[10px] font-mono">2/2</span></div>
                        <div className="space-y-3">
                            {['savings', 'insurance'].map(field => (
                                <div key={field} className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">{t.chatbot.goalFinder.tableB[field]}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                        <input type="number" value={goalData[field]} onChange={(e) => handleGoalInput(field, e.target.value)} className="w-full pl-7 pr-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm" placeholder="0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setGoalStep(4)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg">{t.chatbot.ui.seeResults}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-bold text-center text-lg">{t.chatbot.goalFinder.title}</h3>
                        <div className="p-4 bg-secondary/50 border border-border rounded-2xl space-y-3">
                            <div className="flex justify-between text-sm"><span>Needs:</span><span className="font-bold">₹{needs.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm border-b border-border pb-2"><span>Provisions:</span><span className="font-bold text-green-600">₹{provisions.toLocaleString()}</span></div>
                            <div className="flex justify-between items-center"><span className="text-sm font-bold">Financial Gap:</span><span className={`text-xl font-black ${gap > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{gap.toLocaleString()}</span></div>
                        </div>
                        <p className="text-[11px] text-center text-muted-foreground leading-relaxed italic">{gap > 0 ? t.chatbot.goalFinder.result.hasGap : t.chatbot.goalFinder.result.noGap}</p>
                        <a href="#contact" onClick={() => setIsOpen(false)} className="block w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center rounded-xl text-sm font-black shadow-xl uppercase tracking-wider">{t.chatbot.goalFinder.result.cta}</a>
                        <button onClick={() => { setGoalStep(1); setGoalData({ education: '', marriage: '', retirement: '', maintenance: '', savings: '', insurance: '' }) }} className="w-full text-[10px] font-bold text-muted-foreground hover:text-primary underline uppercase transition-colors">{t.chatbot.ui.restart}</button>
                    </div>
                )}
            </div>
        );
    };

    const renderFaq = () => {
        const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        return (
            <div className="p-4 h-[400px] flex flex-col">
                <button onClick={() => setView('chat')} className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline mb-4">
                    <ChevronLeft className="w-3 h-3" /> {t.chatbot.back}
                </button>
                <h3 className="font-semibold text-sm mb-4">{t.chatbot.faq.title}</h3>
                <div className="flex-grow overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                    {faqs.map(i => (
                        <div key={i} className="border-b border-border/50 pb-2">
                            <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full text-left text-xs font-semibold hover:text-primary transition-colors flex justify-between items-start gap-2 py-1">
                                <span>{t.chatbot.faq[`q${i}`]}</span>
                                <ArrowRight className={`w-3 h-3 mt-1 flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-90 text-primary' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {activeFaq === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <p className="text-[11px] text-muted-foreground mt-2 bg-secondary/50 p-2.5 rounded-lg leading-relaxed border-l-2 border-primary/50">
                                            {t.chatbot.faq[`a${i}`]}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="pointer-events-none relative">
            <div className="relative pointer-events-auto flex flex-col items-end gap-3">
                {/* Greeting Tooltip */}
                <AnimatePresence>
                    {showGreeting && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-primary dark:text-primary px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs border border-primary/10 dark:border-primary/20 whitespace-nowrap z-[70] hidden md:block"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                <span>{t.chatbot.ui.greetingTooltip}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Window */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed md:absolute bottom-24 md:bottom-16 right-4 md:right-0 w-[calc(100vw-32px)] md:w-[350px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden z-[100]"
                        >
                            {/* Header */}
                            <div className="p-5 bg-gradient-to-br from-primary/90 to-primary/70 backdrop-blur-md text-primary-foreground flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black tracking-tight uppercase">Raunak AI Chatbot</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ring-4 ring-green-400/20" />
                                            <span className="text-[10px] font-bold opacity-90 uppercase tracking-widest">{t.chatbot.ui.alwaysActive}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Dynamic Content */}
                            <div className="relative bg-gradient-to-b from-transparent to-zinc-500/5">
                                {view === 'chat' && renderChat()}
                                {view === 'goalFinder' && renderGoalFinder()}
                                {view === 'faq' && renderFaq()}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-border/50 bg-secondary/30 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Safe & Encrypted</span>
                                </div>
                                <span className="text-[10px] font-medium opacity-40 italic">Raunak AI Assistant v2.0</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Bubble */}
                <motion.button
                    layoutId="chat-bubble"
                    whileHover={{
                        scale: 1.1,
                        boxShadow: "0 0 15px 2px rgba(var(--primary-rgb), 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsOpen(!isOpen); setShowGreeting(false); }}
                    onMouseEnter={() => setShowGreeting(true)}
                    onMouseLeave={() => setShowGreeting(false)}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden z-[60] ${isOpen
                        ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-700'
                        : 'bg-gradient-to-br from-primary to-primary/80 text-white'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isOpen ? (
                        <X className="relative z-10 w-6 h-6" />
                    ) : (
                        <Bot className="relative z-10 w-7 h-7" />
                    )}
                    {!isOpen && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-ping" />}
                </motion.button>
            </div>
        </div>
    );
};

export default SmartAssistant;
