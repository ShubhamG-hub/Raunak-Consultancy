const bannedWords = [
    'guaranteed return',
    'guaranteed profit',
    'fixed profit',
    'no risk',
    'risk free',
    '100% safe',
    'doubling money',
];

const complianceFilter = (req, res, next) => {
    const bodyString = JSON.stringify(req.body).toLowerCase();

    const foundWords = bannedWords.filter(word => bodyString.includes(word));

    if (foundWords.length > 0) {
        return res.status(400).json({
            error: 'Compliance Violation: Content contains restricted terms.',
            violation: foundWords,
            message: 'Please remove promises of guaranteed returns or risk-free investments.'
        });
    }

    next();
};

module.exports = complianceFilter;
