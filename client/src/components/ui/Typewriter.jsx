import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Typewriter = ({ words, className }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // typeWriter
    useEffect(() => {
        if (index >= words.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIndex(0);
            return;
        }

        if (subIndex === words[index].length + 1 && !reverse) {
            setReverse(true);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 75 : subIndex === words[index].length ? 2000 : 150, Math.random() * 200));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words]);

    // blinker
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    return (
        <span className={className}>
            {`${words[index].substring(0, subIndex)}`}
            <span className={`inline-block w-[2px] h-[0.8em] bg-primary-theme ml-1 align-middle transition-opacity duration-100 ${blink ? 'opacity-100' : 'opacity-0'}`} />
        </span>
    );
};

export default Typewriter;
